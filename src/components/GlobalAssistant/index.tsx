import { Component, useEffect, useRef, useState } from "react";
import { connect, useDispatch, useLocation, history } from "@umijs/max";
import { Button, Input, message, Spin, Tooltip } from "antd";
import { RobotOutlined, SendOutlined, ReloadOutlined, LayoutOutlined, ShrinkOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import MarkdownRender from "@/components/MarkdownRender";
import SuggestionCards from "@/components/SuggestionCards";
import { runAction, type AssistantAction } from "./actions";
import { getDataService } from "@/pages/TeacherProfile/services";
import { getPageGreeting, type AssistantPage, type QuickEntry } from "./greetings";
import { useAssistantLayout } from "./layout";
import "./index.less";

interface ChatMsg { id: string; role: "user" | "assistant"; text: string; cards?: any[]; suggestions?: any[]; source?: string; kind?: "greeting"; quick?: QuickEntry[]; page?: AssistantPage; sceneKey?: string }
let seq = 0;
const mid = () => "m-" + Date.now() + "-" + seq++;
function ResultRow({ row, initialOpen, execute }: any) {
  const [expanded, setExpanded] = useState(initialOpen);
  return <details className="ga_result_row" open={expanded} onToggle={e => setExpanded(e.currentTarget.open)}>
    <summary>{row.title}</summary>
    {expanded && <><MarkdownRender>{row.text || ""}</MarkdownRender>{row.action && <Button size="small" onClick={() => execute(row.action)}>{row.action.label}</Button>}</>}
  </details>;
}
function DocumentCard({ card, onAction, onEdit }: any) {
  const [editing, setEditing] = useState(false);
  return <>
    {editing ? <Input.TextArea aria-label="编辑内容草稿" value={card.text} autoSize={{ minRows: 5, maxRows: 16 }} onChange={e => onEdit(e.target.value)} /> : <MarkdownRender>{card.text}</MarkdownRender>}
    <div className="ga_quick">
      <Button size="small" onClick={() => setEditing(!editing)}>{editing ? "完成编辑" : "编辑草稿"}</Button>
      <Button size="small" onClick={async () => { try { await navigator.clipboard.writeText(card.text); message.success("已复制"); } catch { message.error("复制失败，请选中文本复制"); } }}>复制内容</Button>
      <Button size="small" onClick={() => {
        const url = URL.createObjectURL(new Blob([card.text], { type: "text/markdown;charset=utf-8" }));
        const a = document.createElement("a"); a.href = url; a.download = card.title + ".md"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}>下载草稿</Button>
      {(card.actions || []).map((a: any) => <Button size="small" key={a.key} onClick={() => onAction({ ...a, params: { ...a.params, assistant_draft: card.text } })}>{a.label}</Button>)}
    </div>
  </>;
}
const GlobalAssistant = ({ assistantModel, analysisModel, resourceTab }: any) => {
  const dispatch = useDispatch(), location = useLocation();
  const scene = getPageGreeting(location.pathname, location.search, assistantModel?.pageContext, analysisModel, resourceTab);
  const { page, title } = scene;
  const sceneRef = useRef(scene); sceneRef.current = scene;
  const { placement, setPlacement } = useAssistantLayout();
  const placementRef = useRef(placement); placementRef.current = placement;
  const [faded, setFaded] = useState(false), [resetVersion, setResetVersion] = useState(0);
  const [peek, setPeek] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState(""), [thinking, setThinking] = useState(false), [phase, setPhase] = useState(""), [task, setTask] = useState<any>(null);
  const panelRef = useRef<HTMLElement>(null), listRef = useRef<HTMLDivElement>(null), controllerRef = useRef<AbortController | null>(null);
  const sessionRef = useRef(""), initSeq = useRef(0), actionBusy = useRef(false), mounted = useRef(true);
  const scrollTarget = useRef(""), fadeTimer = useRef<ReturnType<typeof setTimeout>>();
  const auth = localStorage.getItem("accessToken") || "", authRef = useRef(auth);
  const push = (m: Omit<ChatMsg, "id">) => { const id = mid(); scrollTarget.current = m.kind === "greeting" ? id : "bottom"; setMessages(prev => [...prev.slice(-59), { ...m, id }]); return id; };
  const patch = (id: string, data: Partial<ChatMsg>) => setMessages(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  const stop = () => { controllerRef.current?.abort(); controllerRef.current = null; setThinking(false); };
  const restore = () => { clearTimeout(fadeTimer.current); setFaded(false); };
  const reset = () => { ++initSeq.current; stop(); restore(); setPeek(false); sessionRef.current = ""; setTask(null); setMessages([]); setResetVersion(v => v + 1); };
  useEffect(() => {
    if (authRef.current !== auth || location.pathname === "/login") { authRef.current = auth; reset(); }
  }, [auth, location.pathname]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; ++initSeq.current; controllerRef.current?.abort(); }; }, []);
  useEffect(() => {
    const version = ++initSeq.current;
    if (location.pathname === "/login") return;
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    const greet = () => {
      const current = sceneRef.current;
      if (!current.ready && Date.now() - started < 1500) { timer = setTimeout(greet, 100); return; }
      const id = push({ role: "assistant", kind: "greeting", text: current.text, quick: current.quick, page: current.page, sceneKey: current.key });
      if (current.suggestions) getDataService(current.suggestions, "profileSuggestionsUrl")
        .then(j => { if (mounted.current && version === initSeq.current && current.key === sceneRef.current.key && j?.code === 200) patch(id, { suggestions: Array.isArray(j.data?.suggestions) ? j.data.suggestions : [] }); }).catch(() => {});
    };
    timer = setTimeout(greet, 250);
    return () => { clearTimeout(timer); ++initSeq.current; };
  }, [scene.key, resetVersion, auth]);
  // Existing page entry buttons now focus the always-visible chat.
  useEffect(() => {
    if (!assistantModel?.open) return;
    restore(); setPeek(false); panelRef.current?.querySelector<HTMLTextAreaElement>(".ga_input textarea")?.focus({ preventScroll: true });
    dispatch({ type: "assistantModel/close" });
  }, [assistantModel?.open]);
  useEffect(() => {
    const onScroll = (e: Event) => {
      // Docked chat has its own column; page reflow/scroll must not flash it transparent.
      if (placementRef.current === "sidebar") return;
      if (e.target instanceof Node && panelRef.current?.contains(e.target)) return;
      // Keep typing/composition readable, but allow the page to fade an idle panel.
      const focused = document.activeElement;
      if (focused?.matches("textarea, input, [contenteditable=true]") && panelRef.current?.contains(focused)) return;
      clearTimeout(fadeTimer.current); setFaded(true);
      fadeTimer.current = setTimeout(() => setFaded(false), 450);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && panelRef.current?.contains(e.target as Node)) { restore(); setPlacement("floating"); } };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(fadeTimer.current); window.removeEventListener("scroll", onScroll, true); window.removeEventListener("keydown", onKey); };
  }, []);
  useEffect(() => {
    const list = listRef.current, target = scrollTarget.current;
    if (!list || !target) return;
    if (target === "bottom") list.scrollTop = list.scrollHeight;
    else { const node = list.querySelector<HTMLElement>('[data-message-id="' + target + '"]'); if (node) list.scrollTop += node.getBoundingClientRect().top - list.getBoundingClientRect().top - 14; }
    scrollTarget.current = "";
  }, [messages]);
  const execute = async (action: AssistantAction, origin?: AssistantPage) => {
    if (origin?.data.class_id) action = { ...action, params: { ...action.params, class_id: action.params?.class_id || origin.data.class_id } };
    if (["personalized_paper", "assign_homework"].includes(action.key)) {
      await send(action.label || "生成个性化练习草稿", { suggestion_action: action, ...(origin ? { page: origin, page_command: true } : {}) });
      return;
    }
    if (actionBusy.current) return; actionBusy.current = true;
    try {
      const r = await runAction(action, { dispatch });
      if (!mounted.current || authRef.current !== auth) return;
      if (!r.ok) message.error(r.detail);
      else if (r.navigateTo) history.push({ pathname: r.navigateTo.pathname, search: r.navigateTo.search || "" });
    } catch { message.error("操作失败，请重试"); }
    finally { actionBusy.current = false; }
  };
  const send = async (override?: string, extra: any = {}) => {
    const text = (typeof override === "string" ? override : input).trim();
    if (!text || controllerRef.current) return;
    const controller = new AbortController(); controllerRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 65000);
    const active = () => mounted.current && controllerRef.current === controller && !controller.signal.aborted && authRef.current === auth;
    setInput(""); push({ role: "user", text }); setThinking(true); setPhase("正在查询数据…");
    // Snapshot context stays with the task when the user navigates elsewhere.
    const past = messages.filter(m => m.kind !== "greeting").slice(-10).map(m => ({ role: m.role, text: m.text }));
    const requestPage = extra.page || page;
    const documentText = [...messages].reverse().flatMap(m => m.cards || []).find(c => c.kind === "document")?.text;
    const call = async (url: string, body: any) => {
      const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json", Authorization: auth }, signal: controller.signal, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok || data.code !== 200) throw new Error(data.msg || "请求失败");
      return data.data;
    };
    try {
      const body = { message: text, page, history: past, session_id: sessionRef.current, request_id: mid(), document_text: documentText, ...extra };
      let d = await call("/api/assistant/chat", body);
      if (!active()) return;
      sessionRef.current = d.session_id || sessionRef.current; setTask(d.task);
      const responseId = push({ role: "assistant", text: d.reply, cards: d.cards || [], source: d.source, page: requestPage });
      if (d.auto_action) await execute(d.auto_action);
      if (d.needs_model) {
        setPhase("正在结合证据整理教学回答…");
        try {
          let ai = await call("/api/assistant/model", { message: text, page: requestPage, history: past, context: d.model_context, allow_interpret: d.allow_interpret });
          if (!active()) return;
          if (ai.available && ai.lookup && d.allow_interpret) {
            const retrieved = await call("/api/assistant/chat", { ...body, request_id: mid(), session_id: sessionRef.current, semantic_read: ai.lookup });
            if (!active()) return;
            if (retrieved.source !== "fallback") {
              d = retrieved; setTask(d.task); patch(responseId, { text: d.reply, cards: d.cards || [], source: d.source });
              if (!d.needs_model) return;
              ai = await call("/api/assistant/model", { message: text, page: requestPage, history: past, context: d.model_context });
              if (!active()) return;
            }
          }
          if (ai.available) {
            const cards = (d.cards || []).map((c: any) => c.kind === "document" ? { ...c, text: ai.answer } : c);
            patch(responseId, { text: cards.some((c: any) => c.kind === "document") ? d.reply : ai.answer, cards, source: "ai" });
          } else patch(responseId, { text: d.reply + "\n\n模型服务暂不可用，以上保留了可核对的数据和基础建议。", source: "offline" });
        } catch { if (active()) patch(responseId, { text: d.reply + "\n\n模型连接失败，已保留查询结果，可以继续操作或稍后重试。", source: "offline" }); }
      }
    } catch { if (mounted.current && controllerRef.current === controller) push({ role: "assistant", text: controller.signal.aborted ? "本次请求已停止，已完成的结果仍保留。" : "请求失败，请稍后重试；未报告任何执行成功。", source: "error" }); }
    finally { clearTimeout(timeout); if (controllerRef.current === controller) { controllerRef.current = null; setThinking(false); } }
  };
  const greetingPage = (m: ChatMsg) => m.sceneKey === scene.key ? page : m.page;
  const runQuick = (q: QuickEntry, m: ChatMsg) => {
    const origin = greetingPage(m);
    if (q.action) return execute(q.action, origin);
    return send(q.query, { page: origin, page_command: !!origin?.data.class_id && ["/learning-analysis", "/interact/analysis"].includes(origin.route) });
  };
  const renderCard = (card: any, index: number, m: ChatMsg) => <div className={"ga_result_card ga_result--" + card.kind} key={index} data-kind={card.kind}>
    <strong>{card.title}</strong>{card.subtitle && <div className="ga_card_scope">{card.subtitle}</div>}
    {card.kind === "document" ? <DocumentCard card={card} onAction={execute} onEdit={(text: string) => patch(m.id, { cards: m.cards?.map((c, i) => i === index ? { ...c, text } : c) })} /> : <>
      {(card.rows || []).map((row: any, i: number) => <ResultRow key={i} row={row} initialOpen={i < 3 && card.kind !== "draft"} execute={execute} />)}
      {(card.actions || []).map((a: any) => <Button size="small" key={a.key} onClick={() => execute(a)}>{a.label}</Button>)}
    </>}
    {card.candidates?.map((c: any) => <Button block key={c.class_id + c.student_id} disabled={thinking} onClick={() => send("选择" + c.name, { candidate_id: c.student_id, candidate_class: c.class_id })}>{c.name} · {c.class_name} · {c.display_id}</Button>)}
    {card.kind === "confirmation" && <div className="ga_quick"><Button type="primary" disabled={thinking || messages.filter(item => item.kind !== "greeting").at(-1)?.id !== m.id} onClick={() => send("确认发布", { confirmation: card.token })}>确认发布</Button><Button disabled={thinking} onClick={() => send("取消")}>取消</Button></div>}
    {card.notes?.map((n: string) => <div key={n} className="ga_card_scope">{n}</div>)}
    {!!card.prompts?.length && <div className="ga_quick">{card.prompts.map((p: string) => <Button size="small" key={p} disabled={thinking} onClick={() => send(p)}>{p}</Button>)}</div>}
  </div>;
  if (location.pathname === "/login") return null;
  const switchLabel = placement === "floating" ? "切换到右侧栏" : "切换到右下角";
  return <aside ref={panelRef} className={"ga_panel ga_panel--" + placement + (faded || peek ? " ga_panel--faded" : "")} aria-label="AI助教对话" onPointerEnter={restore} onFocusCapture={e => { restore(); if ((e.target as HTMLElement).matches("textarea, input, [contenteditable=true]")) setPeek(false); }}>
        <div className="ga_header"><RobotOutlined className="ga_header_icon" /><div className="ga_heading"><span className="ga_header_name">AI 助教 · 小七</span><span className="ga_header_page" title={title}>{title}</span></div>
          <Tooltip title="开始新对话"><Button aria-label="开始新对话" type="text" className="ga_header_refresh" icon={<ReloadOutlined />} onClick={reset} /></Tooltip>
          <Tooltip title={peek ? "恢复聊天显示" : "让出页面：虚化聊天，可点击下方内容"}><Button aria-label={peek ? "恢复聊天显示" : "让出页面"} aria-pressed={peek} type="text" icon={peek ? <EyeOutlined /> : <EyeInvisibleOutlined />} onClick={() => { restore(); setPeek(v => !v); }} /></Tooltip>
          <Tooltip title={switchLabel}><Button aria-label={switchLabel} type="text" icon={placement === "floating" ? <LayoutOutlined /> : <ShrinkOutlined />} onClick={() => { restore(); setPeek(false); setPlacement(placement === "floating" ? "sidebar" : "floating"); }} /></Tooltip></div>
        {task && <div className="ga_task"><b>当前任务：</b>{task.students?.join("、") || task.class_name || "教学问答"}<div>{task.scope}</div>{task.draft_id && <div>草稿 {task.draft_id}</div>}</div>}
        <div className="ga_list" ref={listRef} aria-live="polite">
          {messages.map(m => <div key={m.id} data-message-id={m.id} className={"ga_bubble ga_bubble--" + m.role + (m.kind === "greeting" ? " ga_greeting" : "")}>
            {m.role === "assistant" && <div className="ga_avatar">七</div>}
            <div className="ga_bubble_body">{m.kind === "greeting" && <div className="ga_greeting_title">{m.page?.title} · 常用功能</div>}
              {m.kind !== "greeting" && m.page && m.page.title !== title && <div className="ga_card_scope">回复于 {m.page.title}</div>}
              <div className="ga_text"><MarkdownRender>{m.text}</MarkdownRender></div>
              {m.source && <div className="ga_source">{({ ai: "模型回答 · 请结合下方证据核对", data: "业务数据 · 当前为演示环境", offline: "模型离线 · 数据查询可用", clarification: "需要补充信息" } as any)[m.source] || ""}</div>}
              {!!m.quick?.length && <div className="ga_quick">{m.quick.map(q => <Button className="ga_quick_btn" size="small" key={q.label} disabled={thinking} onClick={() => runQuick(q, m)}>{q.label}</Button>)}</div>}
              {m.suggestions?.length ? <div className="ga_suggestions"><div className="ga_card_scope">根据画像整理的 {m.suggestions.length} 条建议（画像口径）</div><SuggestionCards suggestions={m.suggestions.slice(0, 1)} onAction={a => execute(a, greetingPage(m))} />{m.suggestions.length > 1 && <details><summary>查看其余 {m.suggestions.length - 1} 条建议</summary><SuggestionCards suggestions={m.suggestions.slice(1)} onAction={a => execute(a, greetingPage(m))} /></details>}</div> : null}
              {m.cards?.map((c, i) => renderCard(c, i, m))}
            </div>
          </div>)}
          {thinking && <div className="ga_thinking"><Spin size="small" />{phase}<Button size="small" onClick={stop}>停止</Button></div>}
        </div>
        <div className="ga_input"><Input.TextArea value={input} autoSize={{ minRows: 1, maxRows: 4 }} placeholder="输入学生姓名、教学问题或任务…" onChange={e => setInput(e.target.value)}
          onPressEnter={e => { if (!e.shiftKey && !(e.nativeEvent as any).isComposing) { e.preventDefault(); send(); } }} />
          <Button aria-label="发送消息" type="primary" icon={<SendOutlined />} loading={thinking} onClick={() => send()} /></div>
      </aside>;
};
const ConnectedAssistant = connect((state: any) => ({ assistantModel: state.assistantModel, analysisModel: state.analysisModel, resourceTab: state.resourceSearchModel?.activeTab }))(GlobalAssistant);
export default ConnectedAssistant;
class AssistantErrorBoundary extends Component<{ children: any }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: any) { (window as any).__assistantError = String(error); }
  render() { return this.state.failed ? <Button style={{ position: "fixed", right: 24, bottom: 32 }} onClick={() => this.setState({ failed: false })}>重新打开助手</Button> : this.props.children; }
}
export { AssistantErrorBoundary };
export const GlobalAssistantSafe = () => <AssistantErrorBoundary><ConnectedAssistant /></AssistantErrorBoundary>;
