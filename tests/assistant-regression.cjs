const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
require.extensions[".ts"] = (m, f) => m._compile(require("esbuild").transformSync(fs.readFileSync(f, "utf8"), { loader: "ts", format: "cjs" }).code, f);
const { assistantConversation: chat } = require("../mock/teacher/assistantEngine.ts");
const recommend = require("../mock/teacher/recommend.ts");
const { normalizeScope, scopedStudent } = require("../mock/teacher/assistantScope.ts");
const fixture = require("../mock/teacher/fixtures.ts");
const students = fixture.readTeacherFixture("class-students-cls-g8-01.json");
const cid = "cls-g8-01", a = students[0], b = students[1];
let session, checks = 0;
const test = (name, fn) => { fn(); checks++; console.log("PASS " + name); };
const ask = (message, extra = {}) => {
  const r = chat({ message, session_id: session, ...extra }); session = r.session_id; return r;
};
const fresh = () => { session = undefined; };
const card = (r, kind) => r.cards.find(c => c.kind === kind);
test("按姓名查询并显示真实明细统计", () => {
  const r = ask("查看彭媛2026年8月学情");
  assert.equal(r.task.students[0], a.name);
  assert.ok(r.reply.includes(a.evidence.length + " 条"));
  assert.equal(card(r, "student").rows[0].action.params.student_id, a.student_id);
});
test("日期缩小并保持学生目标", () => {
  const r = ask("只看2026-08-25至2026-08-27的作业记录");
  const events = a.evidence.filter(e => e.date >= "2026-08-25" && e.date <= "2026-08-27" && e.source === "作业记录");
  assert.ok(r.reply.includes(events.length + " 条")); assert.deepEqual(r.task.students, ["彭媛"]);
});
test("指定新姓名覆盖旧对象", () => { assert.deepEqual(ask("换侯秀").task.students, ["侯秀"]); });
test("同口径比较", () => { const r = ask("比较彭媛和侯秀2026年8月全部来源学情"); assert.equal(card(r, "comparison").rows.length, 2); });
test("代词比较保留先前对象", () => { fresh(); ask("查看彭媛上月学情"); const r = ask("比较她和侯秀"); assert.equal(card(r, "comparison").rows.length, 2); });
test("未知姓名不选第一位", () => { const r = ask("查看张不存在的学情"); assert.match(r.reply, /未找到/); assert.equal(r.task.students.length, 0); });
test("不存在学生后代词不偷偷回到旧学生", () => { const r = ask("给他生成5道练习"); assert.ok(!card(r, "draft")); });
test("不匹配班级不得跨班猜测", () => { fresh(); const r = ask("查看2班彭媛的学情"); assert.match(r.reply, /未找到/); });
test("学号精确查询", () => { fresh(); assert.deepEqual(ask("查看学号edu01002的学情").task.students, ["侯秀"]); });
test("学号有多余后缀不能命中短学号", () => { fresh(); const r = ask("查看学号edu010010的学情"); assert.ok(!card(r, "student")); });
test("姓名前缀不能静默当作完整姓名", () => { fresh(); const r = ask("查看彭媛媛的学情"); assert.ok(card(r, "choice")); assert.equal(r.task.students.length, 0); });
test("错别字只给候选", () => { fresh(); const r = ask("查看彭圆的学情"); assert.ok(card(r, "choice")); assert.equal(r.task.students.length, 0); });
test("候选选择恢复原日期及目标", () => { const r = ask("选择彭媛", { candidate_id: a.student_id, candidate_class: cid }); assert.deepEqual(r.task.students, ["彭媛"]); });
test("错别字姓名与日期知识点分开识别", () => {
  fresh(); const r = ask("查看彭圆上月学情"); assert.ok(card(r, "choice"));
  const chosen = ask("选择彭媛", { candidate_id: a.student_id, candidate_class: cid });
  assert.equal(card(chosen, "student").rows[0].action.params.cluster, "");
});
test("拼音必须候选确认", () => { fresh(); const r = ask("查看peng yuan的学情"); assert.ok(card(r, "choice")); assert.ok(card(r, "choice").candidates.some(c => c.student_id === a.student_id)); });
test("重名不静默猜测", () => {
  const other = fixture.readTeacherFixture("class-students-cls-g8-02.json")[0], old = other.name; other.name = a.name;
  try { fresh(); const r = ask("查看彭媛上月学情"); assert.equal(card(r, "choice").candidates.length, 2); }
  finally { other.name = old; }
});
test("无数据区别于无此人", () => { fresh(); const r = ask("查看彭媛2099年8月学情"); assert.match(r.reply, /当前范围无/); assert.deepEqual(r.task.students, ["彭媛"]); });
test("日期倒置拒绝", () => { assert.match(ask("只看2026-09-30至2026-09-01").reply, /日期范围无效/); });
test("非法日期拒绝", () => { assert.match(ask("只看2026-02-30").reply, /日期范围无效/); });
test("课堂操作问法不执行", () => { fresh(); assert.ok(!card(ask("怎么给彭媛布置作业"), "draft")); });
test("明确不生成时不执行", () => { assert.ok(!card(ask("不要给彭媛生成作业"), "draft")); });
test("定向组卷锁定两位学生且保留题数", () => {
  fresh(); const r = ask("给彭媛和侯秀生成5道二次根式练习，先别发");
  const hw = recommend.getAssistantHomework(r.task.draft_id);
  assert.ok(hw, r.reply); assert.deepEqual(hw.roster_snapshot.sort(), [a.student_id, b.student_id].sort());
  assert.equal(hw.status, "generated"); Object.values(hw.papers).forEach(p => { assert.equal(p.items.length, 5); assert.ok(p.items.every(q => q.cluster.includes("二次根式"))); });
});
test("题号换题保留配置并更新版本", () => {
  const before = recommend.getAssistantHomework(ask("查看作业提交情况").task.draft_id), old = before.papers[a.student_id].items[1].qid;
  const r = ask("第2题换掉"), after = recommend.getAssistantHomework(r.task.draft_id);
  assert.notEqual(after.papers[a.student_id].items[1].qid, old); assert.equal(after.revision, 2); assert.equal(after.papers[a.student_id].items.length, 5);
});
test("越界换题保持草稿", () => { assert.match(ask("第99题换掉").reply, /超出/); });
test("发布需要未来截止日期", () => { const r = ask("发布这份草稿"); assert.ok(!card(r, "confirmation")); assert.match(r.reply, /截止时间/); });
test("旧发布确认在否定后失效", () => {
  const r = ask("发布这份草稿，截止2099-09-20 20:00"), c = card(r, "confirmation"); assert.ok(c, r.reply);
  ask("先别发"); const cancelled = ask("确认发布", { confirmation: c.token }); assert.match(cancelled.reply, /失效/);
});
test("发布回执与幂等", () => {
  const r = ask("发布这份草稿，截止2099-09-20 20:00"), c = card(r, "confirmation");
  const first = ask("确认发布", { confirmation: c.token }), second = ask("确认发布", { confirmation: c.token });
  assert.ok(card(first, "receipt")); assert.ok(card(second, "receipt"));
  assert.equal(recommend.getAssistantHomework(r.task.draft_id).status, "published");
});
test("已发布作业不能换题", () => { assert.match(ask("第2题换掉").reply, /尚未发布/); });
test("没有提交数据时不虚构未交名单", () => {
  assert.match(JSON.stringify(ask("谁没交作业，帮我写催交文案")), /未提供真实提交记录/);
  assert.match(JSON.stringify(ask("查看作业提交情况")), /未提供真实提交记录/);
});
test("完整例题走教学问答而不是组卷", () => { fresh(); const r = ask("给出一道完整例题及讲解"); assert.equal(r.needs_model, true); assert.ok(!card(r, "draft")); });
test("通用数学问答不污染后续学生查询范围", () => {
  fresh(); ask("解方程2x+3=7，解释移项为什么变号");
  const r = ask("查看彭媛2026年8月学情"); assert.match(r.reply, /36 条/); assert.equal(card(r, "student").rows[0].action.params.cluster, "");
});
test("空条件名单不得扩成全班", () => {
  fresh(); ask("1班2099年8月正确率低于60%的学生"); const r = ask("给这些学生生成5道练习"); assert.ok(!card(r, "draft")); assert.match(r.reply, /为空/);
});
test("按明细真实筛选低于阈值的学生", () => {
  fresh(); const r = ask("1班2026年8月正确率低于60%的学生");
  const expected = students.map(s => scopedStudent(s, normalizeScope({ start_date: "2026-08-01", end_date: "2026-08-31" }))).filter(s => s.n_events >= 3 && s.accuracy < 60);
  assert.equal(card(r, "cohort").rows.length, expected.length);
});
test("相同条件名单生成草稿", () => { const r = ask("给这些学生生成3道练习"); assert.ok(card(r, "draft"), r.reply); });
test("题库多条件筛选", () => { fresh(); const r = ask("找5道二次根式的题，不要选择题"); assert.ok(card(r, "questions"), r.reply); assert.ok(card(r, "questions").rows.every(x => !x.title.includes("选择"))); });
test("零题数被拒绝", () => { assert.match(ask("给彭媛生成0道练习").reply, /1 至 30/); });
test("未知收件人不能被部分忽略", () => { fresh(); const r = ask("给彭媛和张无名生成5道练习"); assert.ok(!card(r, "draft"), r.reply); });
test("教学设计是可编辑文稿", () => { fresh(); const r = ask("为彭媛写2026年8月二次根式教学片段"); assert.ok(card(r, "document")); assert.equal(r.needs_model, true); });
test("家长沟通稿引用个体数据", () => { const r = ask("改写成家长沟通稿"); assert.match(card(r, "document").text, /彭媛/); });
test("具体教学问题走模型并附证据", () => { const r = ask("依据这些证据怎么辅导她？"); assert.equal(r.needs_model, true); assert.equal(r.model_context.facts[0].student_id, a.student_id); });
test("模型语义补全不能发起写操作", () => { const r = ask("帮我了解情况", { semantic_read: "给彭媛生成5道练习" }); assert.ok(!card(r, "draft")); });
test("模型不能编造查询学生", () => { fresh(); const r = ask("了解一下情况", { semantic_read: "查看彭媛学情" }); assert.equal(r.source, "clarification"); });
test("重复请求只生成一份草稿", () => {
  fresh(); ask("查看彭媛学情"); const x = { request_id: "same-id" };
  const r = ask("给彭媛生成3道练习", x), again = ask("给彭媛生成3道练习", x); assert.equal(r.task.draft_id, again.task.draft_id);
});
test("非法名单底层拒绝", () => { assert.throws(() => recommend.generateTargetedHomework(cid, { student_ids: [], total: 5 })); assert.throws(() => recommend.generateTargetedHomework(cid, { student_ids: ["invalid"], total: 5 })); });
test("查询、组卷、教学片段连续执行", () => {
  fresh(); const r = ask("先看彭媛2026年8月学情，再给她生成3道二次根式练习，并写教学片段");
  assert.ok(card(r, "student")); assert.ok(card(r, "draft")); assert.ok(card(r, "document"));
});
test("建议卡保留指定学生与条件并进入对话任务", () => {
  fresh(); const r = ask("生成建议练习", { suggestion_action: { key: "personalized_paper", params: { class_id: cid, student_ids: [a.student_id], clusters: ["二次根式"], total: 3 } } });
  const hw = recommend.getAssistantHomework(r.task.draft_id); assert.deepEqual(hw.roster_snapshot, [a.student_id]); assert.equal(hw.papers[a.student_id].items.length, 3);
});
test("过期会话不沿用当前页面学生执行旧任务", () => {
  const r = ask("给这些学生生成练习", { session_id: "expired-session", page: { data: { class_id: cid, student_id: a.student_id } } }); assert.equal(r.source, "clarification"); assert.ok(!card(r, "draft"));
});
test("发布截止时间整点正确解析", () => {
  fresh(); ask("给彭媛生成3道二次根式练习");
  const r = ask("发布这份草稿，截止明晚8点"); assert.match(card(r, "confirmation").subtitle, /T20:00:00/);
});
test("个人画像和证据使用同一日期统计", () => {
  const profile = require("../mock/teacher/profile.ts").default, query = { class_id: cid, student_id: a.student_id, start_date: "2026-08-25", end_date: "2026-08-27", sources: "作业记录" };
  let detail, evidence;
  profile["GET /api/teacher/profile/student"]({ query }, { json: d => { detail = d.data; } });
  profile["GET /api/teacher/profile/student/evidence"]({ query }, { json: d => { evidence = d.data; } });
  assert.equal(detail.n_events, evidence.length); assert.ok(evidence.every(e => e.source === "作业记录" && e.date >= query.start_date && e.date <= query.end_date));
});
console.log("Assistant regression: " + checks + " passed");
