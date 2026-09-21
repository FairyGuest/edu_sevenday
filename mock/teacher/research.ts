import { readTeacherFixture } from "./fixtures";

const read = (name: string) => { try { return readTeacherFixture(name); } catch { return null; } };
const STORAGE_KEY = "teacher-research-demo-v1";
let memory: any = { topics: [], replies: {}, strategies: {}, used: [] };
function state() {
  if (typeof localStorage === "undefined") return memory;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved && Array.isArray(saved.topics) && Array.isArray(saved.used) &&
      saved.replies && typeof saved.replies === "object" && saved.strategies && typeof saved.strategies === "object"
      ? saved : { topics: [], replies: {}, strategies: {}, used: [] };
  } catch { return { topics: [], replies: {}, strategies: {}, used: [] }; }
}
function save(next: any) {
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  memory = next;
}
const array = (v: any) => Array.isArray(v) ? v.filter(Boolean) : [];
const now = () => new Date().toISOString();
const text = (v: any, limit = 4000) => typeof v === "string" ? v.trim().slice(0, limit) : "";
const id = (prefix: string) => prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
function topics(store: any) {
  return [...array(store.topics), ...array(read("research-topics.json")?.topics)].filter(t => t?.topic_id).map(t => {
    const replies = array(store.replies[t.topic_id]);
    return { ...t, reply_count: (t.reply_count || 0) + replies.length,
      last_reply_at: replies.at(-1)?.created_at || t.last_reply_at || t.created_at,
      status: store.used.includes(t.topic_id) ? "used_in_plan" : array(store.strategies[t.topic_id]).length ? "strategy_formed" : t.status,
    };
  });
}
function detail(topicId: string, store: any) {
  const topic = topics(store).find(t => t.topic_id === topicId);
  if (!topic) return null;
  const seed = read(`research-topic-detail-${topicId}.json`);
  return { topic, replies: [...array(seed?.replies), ...array(store.replies[topicId])],
    strategies: [...array(seed?.strategies), ...array(store.strategies[topicId])],
  };
}
function mutate(req: any, res: any, fn: (store: any) => any) {
  try {
    const store = state();
    const result = fn(store);
    if (result?.error) return res.json({ code: 400, msg: result.error });
    save(store);
    res.json({ code: 200, data: result });
  } catch { res.json({ code: 500, msg: "保存失败，请检查浏览器存储空间后重试" }); }
}
export default {
  "GET /api/teacher/research/topics": (_req: any, res: any) => {
    const store = state();
    const classes = array(read("classes.json")?.classes);
    const knowledge = new Map<string, any>();
    classes.forEach(c => array(read(`knowledge-graph-filtered-${c.class_id}.json`)?.nodes)
      .forEach(n => knowledge.set(n.node_id, { value: n.node_id, label: n.name })));
    res.json({ code: 200, data: { topics: topics(store), classes, knowledge: [...knowledge.values()] } });
  },
  "GET /api/teacher/research/detail": (req: any, res: any) => {
    const data = detail(text(req.query.topic_id, 100), state());
    res.json(data ? { code: 200, data } : { code: 404, msg: "议题不存在或已移除" });
  },
  "GET /api/teacher/research/evidence": (req: any, res: any) => {
    const ids = text(req.query.ids).split(",");
    const classes = array(read("classes.json")?.classes);
    const explanations = classes.flatMap(c => array(read(`profile-explanations-${c.class_id}.json`)?.explanations));
    res.json({ code: 200, data: explanations.filter(e => ids.includes(e.explanation_id)) });
  },
  "POST /api/teacher/research/topics": (req: any, res: any) => mutate(req, res, store => {
    const b = req.body || {};
    if (text(b.title).length < 6 || text(b.content).length < 10 || !text(b.evidence_summary)) return { error: "请填写完整标题、问题描述和证据摘要" };
    const classIds = array(read("classes.json")?.classes).map(c => c.class_id);
    const scope = array(b.class_scope).filter(c => classIds.includes(c));
    if (!scope.length) return { error: "请至少选择一个班级" };
    const topic = { topic_id: id("research"), title: text(b.title, 120), content: text(b.content),
      evidence_summary: text(b.evidence_summary, 1000), author_id: "t-001", author_name: "演示教师",
      subject: text(b.subject, 20) || "数学", grade: text(b.grade, 10) || "g8", class_scope: scope,
      related_knowledge_ids: array(b.related_knowledge_ids), related_dimension_keys: [], tags: [],
      status: "discussing", reply_count: 0, created_at: now(), last_reply_at: now() };
    store.topics.unshift(topic);
    return topic;
  }),
  "POST /api/teacher/research/reply": (req: any, res: any) => mutate(req, res, store => {
    const b = req.body || {};
    if (!detail(text(b.topic_id), store)) return { error: "议题不存在" };
    if (!text(b.content)) return { error: "回复不能为空" };
    const replies = array(store.replies[b.topic_id]);
    const existing = replies.find(r => r.request_id && r.request_id === b.request_id);
    if (existing) return existing;
    const reply = { reply_id: id("reply"), topic_id: b.topic_id, author_id: "t-001", author_name: "演示教师",
      content: text(b.content), evidence_refs: [], liked_count: 0, created_at: now(), request_id: text(b.request_id, 100) };
    store.replies[b.topic_id] = [...replies, reply];
    return reply;
  }),
  "POST /api/teacher/research/strategy": (req: any, res: any) => mutate(req, res, store => {
    const b = req.body || {};
    if (!detail(text(b.topic_id), store)) return { error: "议题不存在" };
    if (!text(b.title) || !text(b.content) || !text(b.evidence_summary)) return { error: "请填写策略名称、内容和证据" };
    const strategy = { strategy_id: id("strategy"), topic_id: b.topic_id, title: text(b.title, 120),
      content: text(b.content), applicable_scene: text(b.applicable_scene, 300),
      evidence_summary: text(b.evidence_summary, 1000), can_apply_to_plan: true };
    store.strategies[b.topic_id] = [...array(store.strategies[b.topic_id]), strategy];
    return strategy;
  }),
  "POST /api/teacher/research/reference": (req: any, res: any) => mutate(req, res, store => {
    const b = req.body || {};
    const d = detail(text(b.topic_id), store);
    if (!d?.strategies.some(s => s.strategy_id === b.strategy_id && s.can_apply_to_plan)) return { error: "策略不可引用" };
    store.used = [...new Set([...store.used, b.topic_id])];
    return { topic_id: b.topic_id, status: "used_in_plan" };
  }),
};
