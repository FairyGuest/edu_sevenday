import { Component, useEffect, useRef, useState } from "react";
import { connect, useDispatch, useLocation, history } from "@umijs/max";
import { Button, FloatButton, Input, message, Modal, Spin, Tooltip } from "antd";
import { RobotOutlined, SendOutlined, ReloadOutlined, CheckCircleFilled, CloseCircleFilled, CloseOutlined } from "@ant-design/icons";

import MarkdownRender from "@/components/MarkdownRender";
import SuggestionCards, { type Suggestion, type SuggestionAction } from "@/components/SuggestionCards";
import { ACTION_META, runAction, type AssistantAction } from "./actions";
import { getDataService } from "@/pages/TeacherProfile/services";
import "./index.less";

/** 无页面注册时的路由兜底标题 */
const ROUTE_TITLES: [string, string][] = [
  ["/learning-analysis", "学情分析"],
  ["/design", "教学设计"],
  ["/paperCompose", "作业组卷"],
  ["/setTopic", "作业下发"],
  ["/source", "资源平台"],
  ["/teach/course", "课程管理"],
];

/** v2.0-I 路由级助手能力配置：各页面给"本页该给的内容"（建议仅学情分析模块输出） */
interface QuickItem {
  label: string;
  action?: { key: string; params?: Record<string, any> };
  query?: string;
}
const ROUTE_CONFIG: Record<string, { title: string; desc: string; quick?: QuickItem[] }> = {
  "/learning-analysis": {
    title: "学情分析",
    desc: "班级/个人学情画像、知识图谱与作业分析。我可以按画像数据给出可执行建议，也能解释图表与指标口径。",
  },
  "/source": {
    title: "资源平台",
    desc: "公共/个人题库与教案、课件资源。题目支持能力等级（L1–L4）、核心素养、题型、来源类别（真题/模拟/月考/期中/期末/同步练习…）、年份与省市地域多维筛选。",
    quick: [
      { label: "找「数学抽象」题", action: { key: "filter_question_bank", params: { literacy: "数学抽象" } } },
      { label: "找「逻辑推理」题", action: { key: "filter_question_bank", params: { literacy: "逻辑推理" } } },
      { label: "看真题", action: { key: "filter_question_bank", params: { source_type: "真题" } } },
      { label: "看同步练习", action: { key: "filter_question_bank", params: { source_type: "同步练习" } } },
      { label: "解释标签体系", query: "解释一下资源平台题库的筛选标签体系" },
    ],
  },
  "/design": {
    title: "教学设计",
    desc: "教案/学案的启发式生成与编辑。建议先在「学情分析」页点击「注入教学设计」带入本班学情，生成内容会更贴合班级薄弱点。",
  },
  "/paperCompose": {
    title: "作业组卷",
    desc: "支持普通组卷与「个性化组卷」（薄弱/变式/复习/挑战四方针，每人一单），生成后可抽样预览再统一下发。",
    quick: [
      { label: "生成薄弱补弱作业", action: { key: "personalized_paper", params: { strategy: "weak" } } },
      { label: "生成遗忘复习作业", action: { key: "personalized_paper", params: { strategy: "review" } } },
    ],
  },
  "/setTopic": {
    title: "作业下发",
    desc: "作业的下发与个性化布置。个性化作业建议先在「作业组卷」生成每人一单，再回到本页统一下发。",
  },
  "/teach/correction": {
    title: "作业批改",
    desc: "查看学生作答与批改结果。批改数据会回流学情画像，可在「学情分析」查看最新掌握度变化。",
  },
  "/teach/course": {
    title: "课程管理",
    desc: "课程空间内的教材、讲义、题库等资源管理与 AI 助学。",
  },
};

const matchRouteConfig = (pathname: string) =>
  ROUTE_CONFIG[Object.keys(ROUTE_CONFIG).find((p) => pathname.startsWith(p)) || ""];

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text: string;
  suggestions?: Suggestion[];
  quick?: QuickItem[];
  action?: AssistantAction & { label?: string };
  actionDone?: { ok: boolean; detail: string };
}

let msgSeq = 0;
const mid = () => `m-${Date.now()}-${msgSeq++}`;

/**
 * v2.0-I 全局 AI 小助手：右下角常态化入口 + 对话面板。
 * 能力：①打开时按当前页面自动给出初始建议（建议区融入助手）②基于页面上下文问答/解释
 * ③代替执行系统功能（意图识别 → 确认卡 → ActionRegistry 白名单执行）。
 */
const GlobalAssistant = (props: any) => {
  const { assistantModel, analysisModel } = props;
  const dispatch = useDispatch();
  const open = !!assistantModel?.open;
  const pageContext = assistantModel?.pageContext;
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const loadedSigRef = useRef<string>("");
  const loadSeqRef = useRef(0);
  const chatRef = useRef<AbortController | null>(null);

  // 响应式路由：页面切换驱动重渲染（window.location 非响应式，切换页不会触发更新）
  const location = useLocation();
  const routeCfg = matchRouteConfig(location.pathname);
  const route = pageContext?.route || location.pathname;
  const pageTitle = pageContext?.title
    || routeCfg?.title
    || ROUTE_TITLES.find(([p]) => route.startsWith(p))?.[1]
    || "智谱七天";
  const isAnalysisRoute = location.pathname.startsWith("/learning-analysis");
  // 学情建议仅由学情分析模块供给（页面注册上下文），不跨模块兜底到其他页面
  const classId = isAnalysisRoute
    ? (pageContext?.data?.class_id || analysisModel?.selectedClass?.value)
    : pageContext?.data?.class_id;
  // 上下文签名：页面/班级/学生任一变化即视为"换页"
  const ctxSig = [
    route,
    pageTitle,
    String(classId || ""),
    String(pageContext?.data?.student_id || ""),
  ].join("|");

  // A reply from another page/class must never be appended to the new conversation.
  useEffect(() => {
    ++loadSeqRef.current;
    chatRef.current?.abort();
    chatRef.current = null;
    setThinking(false);
    return () => {
      ++loadSeqRef.current;
      chatRef.current?.abort();
      chatRef.current = null;
    };
  }, [ctxSig]);

  /** 按当前页面上下文重置会话：学情分析=建议；其他页=本页能力介绍+快捷指令 */
  const loadInitial = async () => {
    const seq = ++loadSeqRef.current;
    loadedSigRef.current = ctxSig;
    setLoadingSuggestions(false);
    if (isAnalysisRoute && classId) {
      setLoadingSuggestions(true);
      try {
        const sid = pageContext?.data?.student_id;
        const j = await getDataService({ class_id: String(classId), ...(sid ? { student_id: String(sid) } : {}) }, "profileSuggestionsUrl");
        if (seq !== loadSeqRef.current) return;
        if (j?.code !== 200) throw new Error("Suggestions unavailable");
        const sugs: Suggestion[] = j?.data?.suggestions || [];
        const head = sid
          ? `根据该生学情，我整理了 ${sugs.length} 条建议：`
          : `根据本班学情，我整理了 ${sugs.length} 条建议：`;
        // 页面自注册快捷指令（如知识图谱页的"图谱怎么看/解释知识点"）附加在建议后
        const pageQuick: QuickItem[] = Array.isArray(pageContext?.data?.quick) ? pageContext.data.quick : [];
        setMessages([{
          id: mid(), role: "assistant",
          text: `你好，我是 AI 助教**小七** 🤖\n\n当前页面：《**${pageTitle}**》。\n\n${head}`,
          suggestions: sugs,
          quick: pageQuick,
        }]);
      } catch {
        if (seq !== loadSeqRef.current) return;
        setMessages([{
          id: mid(), role: "assistant",
          text: `你好，我是 AI 助教**小七** 🤖\n\n当前页面：《**${pageTitle}**》。\n\n建议获取失败（接口异常），你可以直接向我提问，或说“帮我注入教学设计”。`,
        }]);
      } finally {
        if (seq === loadSeqRef.current) setLoadingSuggestions(false);
      }
      return;
    }
    // 非学情分析页（或学情页无班级数据）：本页能力介绍 + 快捷指令（页面自注册优先），不输出学情建议
    const pageQuick: QuickItem[] = Array.isArray(pageContext?.data?.quick) ? pageContext.data.quick : [];
    const quick = pageQuick.length ? pageQuick : (routeCfg?.quick || []);
    setMessages([{
      id: mid(), role: "assistant",
      text: `你好，我是 AI 助教**小七** 🤖\n\n当前页面：《**${pageTitle}**》。\n\n${routeCfg?.desc || "你可以问我本页的功能，也可以让我帮你执行系统操作（如：帮我生成个性化作业）。"}${quick.length ? "\n\n以下快捷指令可直接点击：" : ""}`,
      quick,
    }]);
  };

  // 打开时 / 打开状态下切换页面 → 上下文签名变化即重置会话并重取本页建议；同页重开保留会话
  useEffect(() => {
    if (!open) return;
    if (loadedSigRef.current === ctxSig && messages.length) return;
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ctxSig]);

  // 抽屉挂载控制已由自绘面板替代；ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dispatch({ type: "assistantModel/close" }); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // 新消息滚动到底
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, thinking, loadingSuggestions]);

  const pushMsg = (m: Omit<ChatMsg, "id">) => setMessages((prev) => [...prev, { ...m, id: mid() }]);
  const patchMsg = (id: string, patch: Partial<ChatMsg>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  /** 执行动作（页面建议卡与对话确认卡共用）；写操作二次确认（I6）。
   *  页面流转（v2.0 优化）：先同步收起面板（遮罩不再压住新页挂载），
   *  再于下一帧提交路由跳转——把"卸载面板"与"挂载新页"拆到两帧，避免同帧重活造成的顿挫。 */
  const executeAction = (action: AssistantAction, onDone?: (r: { ok: boolean; detail: string; navigateTo?: any }) => void) => {
    const meta = ACTION_META.find((m) => m.key === action.key);
    const doRun = async () => {
      const r = await runAction(action, { dispatch });
      onDone?.(r);
      if (r.navigateTo) {
        message.success({ content: r.detail.replace(/\*\*/g, ""), duration: 5 });
        dispatch({ type: "assistantModel/close" });
        const dest = r.navigateTo;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          history.push({ pathname: dest.pathname, search: dest.search || "" });
        }));
      }
    };
    if (meta?.write) {
      Modal.confirm({
        title: `确认执行：${meta.label}`,
        content: `${meta.desc}。执行后可在对应页面查看与撤回前的确认信息。`,
        okText: "确认执行",
        cancelText: "再想想",
        onOk: doRun,
      });
    } else {
      doRun();
    }
  };

  const send = async (overrideText?: string) => {
    const text = (typeof overrideText === "string" ? overrideText : input).trim();
    if (!text || chatRef.current) return;
    const controller = new AbortController();
    chatRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30000);
    setInput("");
    pushMsg({ role: "user", text });
    setThinking(true);
    try {
      const history = messages.slice(-8).map((m) => ({ role: m.role, text: m.text }));
      const r = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          page: {
            route,
            title: pageTitle,
            summary: pageContext?.summary || routeCfg?.desc || "",
            data: pageContext?.data || {},
          },
          actions: ACTION_META.map(({ key, label, desc }) => ({ key, label, desc })),
          history,
        }),
      });
      const j = await r.json();
      if (chatRef.current !== controller) return;
      if (!r.ok || j?.code !== 200) throw new Error(j?.msg || "请求失败");
      const d = j?.data || {};
      pushMsg({
        role: "assistant",
        text: d.reply || "（空回复）",
        action: d.type === "action" ? d.action : undefined,
      });
    } catch {
      if (chatRef.current === controller) pushMsg({ role: "assistant", text: "请求失败或超时，请稍后重试～" });
    } finally {
      clearTimeout(timeout);
      if (chatRef.current === controller) {
        chatRef.current = null;
        setThinking(false);
      }
    }
  };

  const renderMsg = (m: ChatMsg) => (
    <div key={m.id} className={`ga_bubble ga_bubble--${m.role}`}>
      {m.role === "assistant" ? <div className="ga_avatar">七</div> : null}
      <div className="ga_bubble_body">
        {m.text ? (
          <div className="ga_text">
            <MarkdownRender>{m.text}</MarkdownRender>
          </div>
        ) : null}
        {m.suggestions?.length ? (
          <div className="ga_suggestions">
            <SuggestionCards
              suggestions={m.suggestions}
              onAction={(a: SuggestionAction) => executeAction({ key: a.key, label: a.label, params: a.params })}
            />
          </div>
        ) : null}
        {m.quick?.length ? (
          <div className="ga_quick">
            {m.quick.map((q) => (
              <Button
                key={q.label}
                size="small"
                className="ga_quick_btn"
                onClick={() => {
                  if (q.action) executeAction({ key: q.action.key, label: q.label, params: q.action.params });
                  else if (q.query) { setInput(q.query); setTimeout(() => send(q.query), 0); }
                }}
              >
                {q.label}
              </Button>
            ))}
          </div>
        ) : null}
        {m.action ? (
          <div className="ga_action_card">
            <div className="ga_action_label">⚡ {m.action.label || m.action.key}</div>
            {m.actionDone ? (
              <div className={`ga_action_result ${m.actionDone.ok ? "ok" : "fail"}`}>
                {m.actionDone.ok ? <CheckCircleFilled /> : <CloseCircleFilled />}
                <MarkdownRender>{m.actionDone.detail}</MarkdownRender>
              </div>
            ) : (
              <div className="ga_action_btns">
                <Button size="small" type="primary" onClick={() =>
                  executeAction(m.action!, (r) => patchMsg(m.id, { actionDone: { ok: r.ok, detail: r.detail } }))
                }>
                  确认执行
                </Button>
                <Button size="small" onClick={() => patchMsg(m.id, { actionDone: { ok: true, detail: "已取消，可继续对话" } })}>
                  取消
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      {!open ? (
        <Tooltip title="AI 助教 · 小七" placement="left">
          <FloatButton
            icon={<RobotOutlined />}
            type="primary"
            style={{ insetInlineEnd: 28, bottom: 36, width: 46, height: 46, zIndex: 999 }}
            onClick={() => dispatch({ type: "assistantModel/open" })}
          />
        </Tooltip>
      ) : (
        // 自绘固定面板：打开即挂载、关闭即卸载，无过渡动画（规避 rc-motion 在
        // 节流环境下卡在中途态导致遮罩吞点击/面板停屏外的问题）
        <>
          <div className="ga_mask" onClick={() => dispatch({ type: "assistantModel/close" })} />
          <div className="ga_panel">
            <div className="ga_header">
              <span className="ga_header_name">🤖 AI 助教 · 小七</span>
              <span className="ga_header_page">{pageTitle}</span>
              <Tooltip title="按当前页面重新获取建议">
                <Button
                  type="text"
                  size="small"
                  className="ga_header_refresh"
                  icon={<ReloadOutlined />}
                  onClick={loadInitial}
                />
              </Tooltip>
              <Button
                type="text"
                size="small"
                className="ga_header_close"
                icon={<CloseOutlined />}
                onClick={() => dispatch({ type: "assistantModel/close" })}
              />
            </div>
            <div className="ga_list" ref={listRef}>
              {loadingSuggestions ? (
                <div className="ga_thinking"><Spin size="small" /> 正在根据本页学情整理建议…</div>
              ) : null}
              {messages.map(renderMsg)}
              {thinking ? <div className="ga_thinking"><Spin size="small" /> 小七正在思考…</div> : null}
            </div>
            <div className="ga_input">
              <Input.TextArea
                value={input}
                autoSize={{ minRows: 1, maxRows: 4 }}
                placeholder="问我本页数据，或让我帮你做事（如：帮我生成个性化作业）"
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); send(); } }}
              />
              <Button aria-label="发送消息" type="primary" icon={<SendOutlined />} loading={thinking} onClick={() => send()} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default connect((state: any) => ({
  assistantModel: state.assistantModel,
  analysisModel: state.analysisModel,
}))(GlobalAssistant);

/** 助手专属错误边界：助手自身异常时静默退场，绝不拖垮业务页面（调试期记录错误到 window） */
class AssistantErrorBoundary extends Component<{ children: any }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(err: any) {
    try { (window as any).__ASSISTANT_ERR__ = { message: err?.message, stack: err?.stack }; } catch {}
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function GlobalAssistantSafe() {
  return (
    <AssistantErrorBoundary>
      <ConnectedGlobalAssistant />
    </AssistantErrorBoundary>
  );
}

const ConnectedGlobalAssistant = connect((state: any) => ({
  assistantModel: state.assistantModel,
  analysisModel: state.analysisModel,
}))(GlobalAssistant);
