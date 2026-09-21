import { useEffect, useRef, useState } from "react";
import { history, useLocation, useDispatch } from "@umijs/max";
import { Alert, Avatar, Button, Drawer, Empty, Form, Input, Modal, Pagination, Select, Skeleton, Tag, message } from "antd";
import { ArrowLeftOutlined, BookOutlined, CommentOutlined, FileSearchOutlined, PlusOutlined, ReloadOutlined, SendOutlined } from "@ant-design/icons";
import { replacePageQuery } from "@/utils/pageQuery";
import { EvidenceList } from "@/features/portraits/PortraitOverview";
import { list } from "@/features/portraits/domain";
import { researchRead, researchWrite } from "./services";
import "./index.less";

const STATUS: Record<string, { label: string; color: string }> = {
  discussing: { label: "讨论中", color: "blue" }, strategy_formed: { label: "已形成策略", color: "cyan" },
  used_in_plan: { label: "已引用到教案", color: "green" },
};
const gradeName = (grade: string) => ({ g7: "七年级", g8: "八年级", g9: "九年级" }[grade] || grade);
const time = (value: string) => value ? value.replace("T", " ").slice(0, 16) : "";
const statusTag = (status: string) => <Tag color={STATUS[status]?.color}>{STATUS[status]?.label || "讨论中"}</Tag>;

export default function SchoolResearch() {
  const location = useLocation();
  const dispatch = useDispatch();
  const query = new URLSearchParams(location.search);
  const topicId = query.get("topic") || "";
  const knowledgeId = query.get("knowledge") || "";
  const classId = query.get("class_id") || "";
  const [data, setData] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [version, setVersion] = useState(0);
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"topic" | "strategy" | null>(null);
  const [form] = Form.useForm();
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const replyRequest = useRef("");
  const [evidence, setEvidence] = useState<any[] | null>(null);
  const [evidenceError, setEvidenceError] = useState("");
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const evidenceSeq = useRef(0);

  useEffect(() => {
    let live = true;
    setLoading(true); setError("");
    researchRead("topics").then(d => { if (live) setData(d); })
      .catch(e => { if (live) setError(e.message); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [version]);
  useEffect(() => {
    let live = true;
    setDetail(null); setDetailError("");
    if (!topicId) { setDetailLoading(false); return; }
    setDetailLoading(true);
    researchRead("detail", { topic_id: topicId }).then(d => { if (live) setDetail(d); })
      .catch(e => { if (live) setDetailError(e.message); }).finally(() => { if (live) setDetailLoading(false); });
    return () => { live = false; };
  }, [topicId, version]);
  useEffect(() => { setReply(""); replyRequest.current = ""; }, [topicId]);
  useEffect(() => {
    dispatch({ type: "assistantModel/setPageContext", payload: {
      route: "/school-research", title: "校本教研",
      summary: detail?.topic ? detail.topic.title + "；依据：" + detail.topic.evidence_summary : "当前为备课组教研议题列表。",
      data: { class_id: classId, topic_id: topicId },
    } });
    return () => { dispatch({ type: "assistantModel/setPageContext", payload: null }); };
  }, [detail?.topic, classId, topicId]);
  useEffect(() => { setPage(1); }, [text, subject, grade, status, knowledgeId, classId]);
  const topics = list(data?.topics);
  const filtered = topics.filter(t =>
    (!text || (t.title + t.content + t.author_name).includes(text.trim())) &&
    (!subject || t.subject === subject) && (!grade || t.grade === grade) &&
    (!status || t.status === status) &&
    (!knowledgeId || list(t.related_knowledge_ids).includes(knowledgeId)) &&
    (!classId || list(t.class_scope).includes(classId)),
  ).sort((a, b) => String(b.last_reply_at || "").localeCompare(String(a.last_reply_at || "")));
  const active = detail?.topic;
  const reset = () => {
    setText(""); setSubject(""); setGrade(""); setStatus("");
    replacePageQuery({ knowledge: null, class_id: null });
  };
  const openForm = (kind: "topic" | "strategy") => {
    form.resetFields();
    form.setFieldsValue({ subject: "数学", grade: "g8", class_scope: classId ? [classId] : [],
      related_knowledge_ids: knowledgeId ? [knowledgeId] : [] });
    setModal(kind);
  };
  const saveForm = async () => {
    if (lock.current) return;
    let values;
    try { values = await form.validateFields(); } catch { return; }
    if (lock.current) return;
    lock.current = true; setSaving(true);
    try {
      const result = await researchWrite(modal === "topic" ? "topics" : "strategy", { ...values, topic_id: topicId });
      setModal(null); setVersion(v => v + 1);
      if (modal === "topic") replacePageQuery({ topic: result.topic_id });
      message.success(modal === "topic" ? "议题已发布" : "策略已保存");
    } catch (e: any) { message.error(e.message); }
    finally { lock.current = false; setSaving(false); }
  };
  const sendReply = async () => {
    if (lock.current || !reply.trim()) return;
    lock.current = true; setSaving(true);
    replyRequest.current ||= "reply-" + Date.now();
    try {
      await researchWrite("reply", { topic_id: topicId, content: reply.trim(), request_id: replyRequest.current });
      setReply(""); replyRequest.current = ""; setVersion(v => v + 1); message.success("回复已发布");
    } catch (e: any) { message.error(e.message); }
    finally { lock.current = false; setSaving(false); }
  };
  const showEvidence = async (ids: string[]) => {
    const seq = ++evidenceSeq.current;
    setEvidence([]); setEvidenceLoading(true); setEvidenceError("");
    try { const records = await researchRead("evidence", { ids: ids.join(",") }); if (seq === evidenceSeq.current) setEvidence(list(records)); }
    catch (e: any) { if (seq === evidenceSeq.current) setEvidenceError(e.message); }
    finally { if (seq === evidenceSeq.current) setEvidenceLoading(false); }
  };
  return <main className="school-research">
    <header className="research-header">
      <div><h1>校本教研</h1><span>备课组 · 教学问题与实践交流</span></div>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm("topic")}>发起议题</Button>
    </header>
    {error && <Alert type="error" showIcon message={error} action={<Button onClick={() => setVersion(v => v + 1)}>重试</Button>} />}
    {!topicId ? <>
      <div className="research-summary">
        <span><b>{topics.length}</b> 个议题</span>
        <span><b>{topics.filter(t => t.status === "discussing").length}</b> 讨论中</span>
        <span><b>{topics.filter(t => t.status !== "discussing").length}</b> 已沉淀策略</span>
      </div>
      <div className="research-filters">
        <Input.Search aria-label="搜索教研议题" placeholder="搜索问题、教师" value={text} allowClear onChange={e => setText(e.target.value)} />
        <Select aria-label="教研学科" value={subject || undefined} placeholder="全部学科" allowClear onChange={v => setSubject(v || "")}
          options={[...new Set(topics.map(t => t.subject))].map(v => ({ value: v, label: v }))} />
        <Select aria-label="教研年级" value={grade || undefined} placeholder="全部年级" allowClear onChange={v => setGrade(v || "")}
          options={["g7", "g8", "g9"].map(v => ({ value: v, label: gradeName(v) }))} />
        <Select aria-label="教研知识点" value={knowledgeId || undefined} placeholder="全部知识点" allowClear
          onChange={v => replacePageQuery({ knowledge: v || null })} options={data?.knowledge || []} />
        <Select aria-label="教研状态" value={status || undefined} placeholder="全部状态" allowClear onChange={v => setStatus(v || "")}
          options={Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))} />
        <Button aria-label="重置教研筛选" title="重置筛选" icon={<ReloadOutlined />} onClick={reset} />
      </div>
      {classId && <p className="research-context">班级范围：{list(data?.classes).find(c => c.class_id === classId)?.class_name || classId}
        <Button type="link" size="small" onClick={() => replacePageQuery({ class_id: null })}>查看全部班级</Button></p>}
      {loading ? <Skeleton active paragraph={{ rows: 8 }} /> : filtered.length ? <div className="research-list" aria-label="教研议题列表">
        {filtered.slice((page - 1) * 8, page * 8).map(t => <article className="research-topic" key={t.topic_id}>
          <Avatar className="research-avatar">{t.author_name?.slice(0, 1)}</Avatar>
          <div className="research-topic-main">
            <div className="research-meta">{t.author_name}<span>{gradeName(t.grade)} · {t.subject}</span><time>{time(t.last_reply_at)}</time></div>
            <button className="research-topic-title" onClick={() => replacePageQuery({ topic: t.topic_id })}>{t.title}</button>
            <p className="research-topic-evidence"><FileSearchOutlined />{t.evidence_summary || "暂无证据摘要"}</p>
            <div className="research-topic-footer">{statusTag(t.status)}{list(t.tags).map(tag => <span key={tag}>{tag}</span>)}
              <span className="research-reply-count"><CommentOutlined /> {t.reply_count || 0} 条回复</span></div>
          </div>
        </article>)}
        <Pagination current={page} pageSize={8} total={filtered.length} onChange={setPage} showSizeChanger={false} />
      </div> : <Empty description="暂无匹配的教研议题" />}
    </> : <>
      <Button type="text" className="research-back" icon={<ArrowLeftOutlined />} onClick={() => replacePageQuery({ topic: null })}>返回议题列表</Button>
      {detailError && <Alert type="error" message={detailError} action={<Button onClick={() => setVersion(v => v + 1)}>重试</Button>} />}
      {detailLoading ? <Skeleton active paragraph={{ rows: 10 }} /> : active && <div className="research-detail">
        <section className="research-discussion">
          <header>{statusTag(active.status)}<h2>{active.title}</h2>
            <p className="research-meta">{active.author_name} · {gradeName(active.grade)} · {active.subject} · {time(active.created_at)}</p>
          </header>
          <p className="research-prose">{active.content}</p>
          <blockquote><FileSearchOutlined /> {active.evidence_summary || "暂无证据摘要"}</blockquote>
          <div className="research-related">{list(active.class_scope).map(c =>
            <Button key={c} type="link" size="small" onClick={() => history.push({
              pathname: "/learning-analysis", search: "?" + new URLSearchParams({ class_id: c, tab: "kgraph" }).toString(),
            })}>{list(data?.classes).find(cl => cl.class_id === c)?.class_name || c}学情</Button>)}</div>
          <h3>教师交流 <span>{list(detail.replies).length}</span></h3>
          {list(detail.replies).length ? list(detail.replies).map(r => <article key={r.reply_id} className="research-reply">
            <Avatar size={30}>{r.author_name?.slice(0, 1)}</Avatar>
            <div><div className="research-meta"><strong>{r.author_name}</strong><time>{time(r.created_at)}</time></div>
              <p className="research-prose">{r.content}</p>
              {list(r.evidence_refs).length > 0 && <Button type="link" size="small" icon={<FileSearchOutlined />}
                onClick={() => showEvidence(r.evidence_refs)}>查看引用证据</Button>}
            </div>
          </article>) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无回复" />}
          <div className="research-reply-form">
            <Input.TextArea aria-label="交流回复" placeholder="补充教学实践或追问" value={reply} maxLength={4000} showCount
              autoSize={{ minRows: 4, maxRows: 10 }} onChange={e => { setReply(e.target.value); replyRequest.current = ""; }} />
            <Button type="primary" icon={<SendOutlined />} loading={saving} disabled={!reply.trim()} onClick={sendReply}>发布回复</Button>
          </div>
        </section>
        <aside className="research-strategies">
          <header><h3><BookOutlined /> 共识策略</h3><Button type="text" icon={<PlusOutlined />} aria-label="新增共识策略" title="新增共识策略" onClick={() => openForm("strategy")} /></header>
          {list(detail.strategies).length ? list(detail.strategies).map(s => <article key={s.strategy_id} className="research-strategy">
            <h4>{s.title}</h4><p className="research-prose">{s.content}</p>
            {s.applicable_scene && <p><strong>适用场景</strong><br />{s.applicable_scene}</p>}
            <p className="research-strategy-evidence">{s.evidence_summary}</p>
            <Button icon={<BookOutlined />} disabled={!s.can_apply_to_plan} onClick={() => history.push({
              pathname: "/design", search: "?" + new URLSearchParams({ research_topic: active.topic_id,
                research_strategy: s.strategy_id, from: "research", class_id: active.class_scope?.[0] || "" }).toString(),
            })}>引用到教案</Button>
          </article>) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂未形成共识策略" />}
        </aside>
      </div>}
    </>}
    <Modal title={modal === "topic" ? "发起教研议题" : "沉淀共识策略"} open={!!modal} onCancel={() => !saving && setModal(null)}
      onOk={saveForm} confirmLoading={saving} okText="保存" cancelText="取消" width={640}>
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item label={modal === "topic" ? "议题标题" : "策略名称"} name="title" rules={[{ required: true, whitespace: true, min: modal === "topic" ? 6 : 2, message: "请填写完整名称" }]}>
          <Input maxLength={120} /></Form.Item>
        {modal === "topic" && <div className="research-form-grid">
          <Form.Item name="subject" label="学科" rules={[{ required: true }]}><Select options={["数学", "语文", "英语"].map(value => ({ value, label: value }))} /></Form.Item>
          <Form.Item name="grade" label="年级" rules={[{ required: true }]}><Select options={["g7", "g8", "g9"].map(value => ({ value, label: gradeName(value) }))} /></Form.Item>
          <Form.Item name="class_scope" label="涉及班级" rules={[{ required: true, type: "array", min: 1, message: "请选择班级" }]}><Select mode="multiple"
            options={list(data?.classes).map(c => ({ value: c.class_id, label: c.class_name }))} /></Form.Item>
          <Form.Item name="related_knowledge_ids" label="关联知识点"><Select mode="multiple" options={data?.knowledge || []} /></Form.Item>
        </div>}
        <Form.Item label={modal === "topic" ? "问题描述" : "策略内容"} name="content" rules={[{ required: true, whitespace: true, min: 10, message: "请填写至少10字的描述" }]}>
          <Input.TextArea rows={4} maxLength={4000} /></Form.Item>
        {modal === "strategy" && <Form.Item label="适用场景" name="applicable_scene"><Input maxLength={300} /></Form.Item>}
        <Form.Item label="证据摘要" name="evidence_summary" rules={[{ required: true, whitespace: true, message: "请补充依据" }]}>
          <Input.TextArea rows={2} maxLength={1000} /></Form.Item>
      </Form>
    </Modal>
    <Drawer title="引用证据" open={evidence !== null} onClose={() => { evidenceSeq.current++; setEvidence(null); }} width={520}>
      {evidenceError && <Alert type="error" message={evidenceError} />}
      {evidenceLoading ? <Skeleton active /> : evidence?.length ? evidence.map(e => <section key={e.explanation_id}>
        <h4>{e.conclusion}</h4><p>{e.reason}</p><p>{e.evidence_summary}</p><EvidenceList evidence={list(e.evidence)} />
      </section>) : <Empty description="暂无可解析的引用证据" />}
    </Drawer>
  </main>;
}
