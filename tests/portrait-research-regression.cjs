const assert = require('node:assert/strict');
const fs = require('node:fs');
require.extensions['.ts'] = (m, f) => m._compile(require('esbuild').transformSync(
  fs.readFileSync(f, 'utf8'), { loader: 'ts', format: 'cjs' }).code, f);
const domain = require('../src/features/portraits/domain.ts');
const portraits = require('../mock/teacher/portraits.ts').default;
const research = require('../mock/teacher/research.ts').default;
const call = (routes, route, req = {}) => {
  let result;
  routes[route]({ query: {}, body: {}, ...req }, { json: r => { result = r; } });
  return result;
};
const scope = { start_date: '2026-06-20', end_date: '2026-09-20', sources: domain.SOURCES };
const cls = call(portraits, 'GET /api/teacher/portraits', { query: { class_id: 'cls-g8-03' } }).data;
assert.equal(cls.snapshot.dimensions.length, 4);
for (const meta of domain.DIMENSIONS) {
  const view = domain.dimensionView(cls, meta.key, scope);
  assert.ok(view.complete);
  assert.equal(view.items.length, 6);
}
assert.equal(domain.band(50), '练习中');
assert.equal(domain.band(71), '较熟练');
assert.equal(domain.band(86), '已掌握');
assert.equal(domain.band(null), '证据不足');
assert.equal(domain.band(0), '待巩固');
assert.equal(domain.score(NaN), null);
assert.equal(domain.score('70'), null);
console.log('PASS 四维画像同构、分档边界、缺失值与合法0分');
const all = domain.graphView(cls, scope, domain.DEFAULT_GRAPH_FILTER);
assert.equal(all.nodes.length, 20);
for (const [dimension, field] of [['ability', 'ability_keys'], ['literacy', 'literacy_keys'], ['process', 'process_keys']]) {
  const filtered = domain.graphView(cls, scope, { ...domain.DEFAULT_GRAPH_FILTER, dimension });
  assert.ok(filtered.nodes.length && filtered.nodes.every(n => n[field].length));
}
const goal = cls.graph.filters.goals[0].goal_id;
assert.ok(domain.graphView(cls, scope, { ...domain.DEFAULT_GRAPH_FILTER, goal }).nodes.every(n => n.goal_ids.includes(goal)));
assert.equal(domain.graphView(cls, scope, { ...domain.DEFAULT_GRAPH_FILTER, goal: 'missing-goal' }).nodes.length, 0);
for (const key of Object.keys(domain.STRENGTHS)) {
  const filtered = domain.graphView(cls, scope, { ...domain.DEFAULT_GRAPH_FILTER, strength: key });
  assert.ok(filtered.nodes.every(n => n.evidence_strength === key));
  assert.ok(filtered.edges.every(e => filtered.nodes.some(n => n.node_id === e.source) && filtered.nodes.some(n => n.node_id === e.target)));
}
const shortScope = { ...scope, start_date: '2026-09-12', sources: ['考试记录'] };
const short = domain.graphView(cls, shortScope, domain.DEFAULT_GRAPH_FILTER);
assert.ok(short.nodes.length < all.nodes.length);
assert.ok(short.nodes.every(n => n.mastery === null && n.evidence.length > 0));
assert.ok(short.nodes.flatMap(n => n.evidence).every(e => e.source_type === 'exam' && e.occurred_at >= '2026-09-12'));
assert.equal(domain.graphView(cls, { ...scope, start_date: '2030-01-01', end_date: '2030-02-01' }, domain.DEFAULT_GRAPH_FILTER).nodes.length, 0);
assert.equal(domain.graphView(null, scope, domain.DEFAULT_GRAPH_FILTER).nodes.length, 0);
assert.equal(domain.dimensionView({}, 'literacy', scope).dimension, undefined);
console.log('PASS 来源时间交叉筛选、图谱无悬空边、摘要不冒充全量重算、空态兼容');
const sid = require('../mock/teacher/data/profile-dimensions-student-cls-g8-03.json').students[0].student_id;
const personal = call(portraits, 'GET /api/teacher/portraits', { query: { class_id: 'cls-g8-03', student_id: sid } }).data;
assert.ok(personal.explanations.every(e => e.student_id === sid));
personal.snapshot.dimensions.forEach(d => assert.equal(d.class_avg, cls.snapshot.dimensions.find(c => c.dimension_key === d.dimension_key).score));
const noStudent = call(portraits, 'GET /api/teacher/portraits', { query: { class_id: 'cls-g8-03', student_id: 'uncovered' } }).data;
assert.equal(noStudent.snapshot, null);
assert.ok(domain.graphView(noStudent, scope, domain.DEFAULT_GRAPH_FILTER).nodes.every(n => n.mastery === null));
assert.equal(call(portraits, 'GET /api/teacher/portraits', { query: { class_id: '../missing' } }).code, 404);
console.log('PASS 个人班均一致、未覆盖学生不借用班级分数、无效班级兜底');
const store = new Map();
global.localStorage = { getItem: k => store.get(k), setItem: (k, v) => store.set(k, v) };
const initial = call(research, 'GET /api/teacher/research/topics').data;
assert.equal(initial.topics.length, 10);
assert.equal(call(research, 'POST /api/teacher/research/topics', { body: {} }).code, 400);
const created = call(research, 'POST /api/teacher/research/topics', { body: {
  title: '如何提高图像解释的表达质量', content: '近期学生在图像语言转化时出现错误，希望交流教学实践。',
  evidence_summary: '单元测图像解释题正确率52%', class_scope: ['cls-g8-03'],
} }).data;
const reply = { topic_id: created.topic_id, content: '建议先进行口头表达，再完成书面解释。', request_id: 'one-click' };
call(research, 'POST /api/teacher/research/reply', { body: reply });
call(research, 'POST /api/teacher/research/reply', { body: reply });
const d = () => call(research, 'GET /api/teacher/research/detail', { query: { topic_id: created.topic_id } }).data;
assert.equal(d().replies.length, 1);
assert.equal(d().topic.reply_count, 1);
const strategy = call(research, 'POST /api/teacher/research/strategy', { body: {
  topic_id: created.topic_id, title: '先说后写', content: '使用点、线、趋势表达模板进行同伴练习。',
  evidence_summary: '课堂抽查10人，8人可以解释变化方向。',
} }).data;
assert.equal(d().topic.status, 'strategy_formed');
assert.equal(call(research, 'POST /api/teacher/research/reference', { body: { topic_id: created.topic_id, strategy_id: 'invalid' } }).code, 400);
assert.equal(call(research, 'POST /api/teacher/research/reference', { body: { topic_id: created.topic_id, strategy_id: strategy.strategy_id } }).code, 200);
assert.equal(d().topic.status, 'used_in_plan');
assert.ok(store.size);
delete require.cache[require.resolve('../mock/teacher/research.ts')];
assert.equal(call(require('../mock/teacher/research.ts').default, 'GET /api/teacher/research/detail', { query: { topic_id: created.topic_id } }).data.replies.length, 1);
store.set('teacher-research-demo-v1', '{broken');
assert.equal(call(research, 'GET /api/teacher/research/topics').data.topics.length, 10);
global.localStorage.setItem = () => { throw new Error('quota'); };
assert.equal(call(research, 'POST /api/teacher/research/reply', { body: { topic_id: 'research-001', content: '测试存储失败' } }).code, 500);
console.log('PASS 发帖回复策略引用闭环、重复提交幂等、刷新持久化、损坏缓存与存储失败');
const plans = require('../mock/teachPlan.ts').default;
let stream = '';
plans['POST /api/teach_plan/teach_maker']({ body: { title: '16.1 二次根式', type: 1, class_id: 'cls-g8-03',
  research_reference: { ...strategy, topic_title: created.title },
} }, { writeHead() {}, write(s) { stream += s; }, end() {} });
const generatedId = stream.split('\n\n').filter(Boolean).map(line => JSON.parse(line.slice(6)))
  .find(item => item.__action === 'end').id;
const generated = call(plans, 'GET /api/teach_plan/teach_plan_history/:id', { params: { id: generatedId } }).data;
assert.ok(generated.plan_content.includes(strategy.content));
assert.ok(generated.plan_content.includes(strategy.evidence_summary));
assert.ok(generated.plan_content.includes(created.title));
console.log('PASS 教研策略内容、证据与来源实际写入生成教案及历史详情');
