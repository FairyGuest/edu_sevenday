const assert = require("node:assert/strict"), fs = require("node:fs");
require.extensions[".ts"] = (m, f) => m._compile(require("esbuild").transformSync(fs.readFileSync(f, "utf8"), { loader: "ts", format: "cjs" }).code, f);
const { getPageGreeting: greeting } = require("../src/components/GlobalAssistant/greetings.ts");
const { assistantConversation: chat } = require("../mock/teacher/assistantEngine.ts");
const { getAssistantHomework } = require("../mock/teacher/recommend.ts");
const analysis = { selectedClass: { value: "cls-g8-01", label: "八年级1班" } };
const student = { route: "/learning-analysis", title: "学情分析 · 彭媛 的个人学情", summary: "彭媛旧摘要", data: { class_id: "cls-g8-01", student_id: "6738633173303030", start_date: "2026-08-01", end_date: "2026-08-31" } };
let count = 0;
const test = (name, fn) => { fn(); count++; console.log("PASS " + name); };
test("所有班级在画像缺失、加载中和知识图谱场景仍优先提供当前班级注入入口", () => {
  for (const route of ["/learning-analysis", "/interact/analysis"]) {
    for (const classId of ["cls-g8-01", "cls-g8-02", "cls-g8-03"]) {
      for (const tab of ["profile", "kgraph"]) {
        for (const context of [null, student]) {
          const g = greeting(route, `?class_id=${classId}&tab=${tab}`, context, { ...analysis, classSelectionLoading: true });
          assert.equal(g.quick[0].label, "注入班级学情到教学设计");
          assert.equal(g.quick[0].action.key, "inject_teaching_design");
          assert.equal(g.quick[0].action.params.class_id, classId);
        }
      }
    }
  }
});
test("日期来源筛选不产生新场景，发送上下文使用最新筛选", () => {
  const a = greeting("/learning-analysis", "?tab=personal&student_id=6738633173303030", student, analysis);
  const b = greeting("/learning-analysis", "?tab=personal&student_id=6738633173303030&start_date=2026-09-01&sources=考试记录", student, analysis);
  assert.equal(a.key, b.key); assert.equal(b.page.data.start_date, "2026-09-01"); assert.equal(b.page.data.sources, "考试记录");
});
test("切换学生丢弃旧姓名摘要", () => {
  const g = greeting("/learning-analysis", "?tab=personal&student_id=6738633173303031", student, analysis);
  assert.ok(!g.text.includes("彭媛")); assert.equal(g.page.summary, ""); assert.equal(g.page.data.student_id, "6738633173303031");
});
test("个人转班级不会保留个人上下文", () => {
  const g = greeting("/learning-analysis", "", student, analysis);
  assert.equal(g.title, "班级学情"); assert.equal(g.page.data.student_id, undefined); assert.equal(g.page.summary, "");
});
test("跨页不泄漏旧页面上下文", () => {
  const g = greeting("/source", "", student, analysis);
  assert.equal(g.page.summary, ""); assert.equal(g.page.data.student_id, undefined);
  assert.ok(g.quick.some(q => q.label === "解释标签体系"));
});
test("班级切换以URL为准，不能使用旧班级摘要", () => {
  const g = greeting("/learning-analysis", "?class_id=cls-g8-03", student, analysis);
  assert.equal(g.page.data.class_id, "cls-g8-03"); assert.equal(g.page.summary, ""); assert.ok(!g.text.includes("八年级1班"));
});
test("资源页签各自提供问候，过滤条件不改变场景", () => {
  const a = greeting("/source", "", null, analysis, "kgraph"), b = greeting("/source", "?search=函数", null, analysis, "public");
  assert.notEqual(a.key, b.key); assert.match(a.text, /学科知识图谱/);
  assert.equal(b.key, greeting("/source", "", null, analysis, "public").key);
  for (const tab of ["lesson-plans", "courseware", "personal"]) assert.ok(greeting("/source", "", null, analysis, tab).quick.length);
});
test("备课组卷批改等页面均有常用入口", () => {
  for (const route of ["/design", "/design/detail", "/paperCompose", "/setTopic", "/teach/course", "/teach/correction"]) assert.ok(greeting(route, "", null, analysis).quick.length >= 2);
});
test("页面快捷查询覆盖上次学生和日期，普通对话仍延续任务", () => {
  const a = chat({ message: "查看侯秀2099年8月学情" });
  const b = chat({ session_id: a.session_id, page_command: true, page: student, message: "查看当前页学生6738633173303030的学情" });
  assert.deepEqual(b.task.students, ["彭媛"]); assert.match(b.reply, /36 条/);
  const c = chat({ session_id: a.session_id, page: { data: { class_id: "cls-g8-03" } }, message: "只看上月" });
  assert.deepEqual(c.task.students, ["彭媛"]);
});
test("个人建议缺少名单时只生成该生练习，不扩大到全班", () => {
  const a = chat({ message: "查看侯秀学情" });
  const b = chat({ session_id: a.session_id, message: "生成补弱练习", page_command: true, page: student, suggestion_action: { key: "personalized_paper", params: { strategy: "weak", total: 3 } } });
  assert.deepEqual(getAssistantHomework(b.task.draft_id).roster_snapshot, [student.data.student_id]);
});
test("班级建议仍按班级生成，显式子名单保持不变", () => {
  const page = { data: { class_id: "cls-g8-01" } };
  const a = chat({ message: "生成补弱练习", page_command: true, page, suggestion_action: { key: "personalized_paper", params: { total: 1 } } });
  assert.ok(getAssistantHomework(a.task.draft_id).roster_snapshot.length > 1);
  const b = chat({ message: "生成建议练习", page_command: true, page, suggestion_action: { key: "personalized_paper", params: { student_ids: [student.data.student_id], total: 1 } } });
  assert.deepEqual(getAssistantHomework(b.task.draft_id).roster_snapshot, [student.data.student_id]);
});
test("无效班级或学生快捷操作拒绝猜测", () => {
  for (const data of [{ class_id: "missing" }, { class_id: "cls-g8-03", student_id: student.data.student_id }]) {
    const r = chat({ message: "生成练习", page_command: true, page: { data }, suggestion_action: { key: "personalized_paper" } });
    assert.equal(r.source, "clarification"); assert.ok(!r.cards.some(c => c.kind === "draft"));
  }
});
console.log("Assistant presentation regression: " + count + " passed");
