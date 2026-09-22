/**
 * 校验课程底座与诊断链路 mock（对照 docs/数据与内容支撑清单-2026-09-22.md §4/§8/§9）。
 * 用法：node scripts/check-curriculum-diagnosis-mock.js
 */
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "mock", "teacher", "data");
const J = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf-8"));
let fail = 0;
const ok = (c, m) => { console.log((c ? "PASS" : "FAIL") + "  " + m); if (!c) fail++; };

/* ---------- 载入与索引 ---------- */
const catalog = J("curriculum-catalog.json");
const links = J("curriculum-links.json");
const units = J("teaching-units.json");
const standards = J("curriculum-standards.json");
const frameworks = J("subject-frameworks.json");
const rubrics = J("assessment-rubrics.json");
const learners = J("learner-contexts.json");
const scenarios = J("learning-scenarios.json");
const templates = J("design-templates.json");
const workflows = J("design-workflows.json");
const tools = J("research-tools.json");
const da = J("diagnostic-attempts.json");
const cases = J("diagnostic-cases.json");
const ivs = J("diagnostic-interventions.json");
const fus = J("diagnostic-followups.json");

const sections = new Map(); const chapters = new Map(); const textbooks = new Set();
for (const tb of catalog.textbooks) {
  textbooks.add(tb.textbook_id);
  for (const ch of tb.chapters) {
    chapters.set(ch.chapter_id, tb.textbook_id);
    for (const sec of ch.sections) sections.set(sec.section_id, { chapter_id: ch.chapter_id, textbook_id: tb.textbook_id, title: sec.title });
  }
}
const students = new Map(); const classOf = new Map();
for (const c of ["cls-g8-01", "cls-g8-02", "cls-g8-03"]) for (const s of J(`class-students-${c}.json`)) { students.set(s.student_id, c); classOf.set(s.student_id, c); }
const questionIds = new Set(da.questions.map((q) => q.question_id));
const attemptIds = new Set(da.attempts.map((a) => a.attempt_id));
const attemptOf = new Map(da.attempts.map((a) => [a.attempt_id, a]));
const homeworkIds = new Set(J("homework-list.json").list.map((h) => h.homework_id));
const kpIds = new Set(J("knowledge-graph-filtered-cls-g8-03.json").nodes.map((n) => n.node_id));
const clusterNames = new Set();
for (const g of J("knowledge.json").grades) for (const ch of g.chapters) for (const c of ch.clusters) clusterNames.add(c.cluster);
const rubricIds = new Set(rubrics.rubrics.map((r) => r.rubric_id));
const indicatorIds = new Set(frameworks.frameworks.flatMap((f) => f.indicators.map((i) => i.indicator_id)));
const stdIds = new Set(standards.standards.map((s) => s.standard_id));
const scenarioIds = new Set(scenarios.scenarios.map((s) => s.scenario_id));
const causeIds = new Set(cases.cases.flatMap((c) => c.candidate_causes.map((x) => x.cause_id)).concat(cases.cases.flatMap((c) => c.confirmed_cause_ids)));
const unitIds = new Set(units.units.map((u) => u.unit_id));
const goalIds = new Set(units.units.flatMap((u) => u.unit_goals.map((g) => g.goal_id)));

/* ---------- A. 外键与结构 ---------- */
let fkBad = [];
// 目录：章父子/排序
ok(catalog.textbooks.length === 2 && chapters.size >= 5 && sections.size >= 12 && catalog.textbooks[0].chapters.every((ch) => ch.sections.length >= 2), `目录：2 套教材（含同名边界）、${chapters.size} 章 ${sections.size} 节，主教材每章 ≥2 节`);
for (const [sid, info] of sections) if (!chapters.has(info.chapter_id)) fkBad.push(`节 ${sid} 的章不存在`);
// 链接：cluster/kp/section 三向外键
for (const r of links.rows) {
  if (r.status === "mapped" || r.status === "mapped_cross_section") {
    const secs = r.section_ids || [r.section_id];
    for (const sec of secs) if (!sections.has(sec)) fkBad.push(`links ${r.cluster} 指向不存在节 ${sec}`);
    if (r.textbook_id && !textbooks.has(r.textbook_id)) fkBad.push(`links ${r.cluster} 教材不存在`);
    if (chapters.get(secs[0]) && r.textbook_id && chapters.get(secs[0]) !== r.textbook_id) fkBad.push(`links ${r.cluster} 节与教材不同源`);
  } else if (r.section_id !== null) fkBad.push(`links ${r.cluster} unmapped 却有 section_id`);
  for (const k of r.kp_ids || []) if (!kpIds.has(k)) fkBad.push(`links ${r.cluster} 指向不存在 kp ${k}`);
  if (r.cluster != null && !clusterNames.has(r.cluster)) fkBad.push(`links 未知 cluster ${r.cluster}`);
  if (r.cluster == null && !(r.kp_ids && r.kp_ids.length)) fkBad.push(`links 行既无 cluster 又无 kp`);
}
ok(fkBad.length === 0, "curriculum-links 外键（cluster/kp/节/教材）" + (fkBad.length ? "，问题：" + fkBad.slice(0, 3).join("；") : ""));
// 单元
let uBad = [];
for (const u of units.units) {
  for (const sid of u.scope.section_ids) if (!sections.has(sid)) uBad.push(`${u.unit_id} 节 ${sid} 不存在`);
  if (u.scope.type === "chapter" && new Set(u.scope.section_ids.map((s) => sections.get(s)?.chapter_id)).size !== 1) uBad.push(`${u.unit_id} 声称章型却跨章`);
  if (u.scope.type === "cross_chapter" && new Set(u.scope.section_ids.map((s) => sections.get(s)?.chapter_id)).size < 2) uBad.push(`${u.unit_id} 声称跨章型却同章`);
  for (const l of u.lesson_ids) if (!workflows.lessons.some((x) => x.lesson_id === l)) uBad.push(`${u.unit_id} 课时 ${l} 不在 workflows`);
  if (u.status === "confirmed" && !u.confirmed_at) uBad.push(`${u.unit_id} confirmed 无时间`);
}
for (const g of units.units.flatMap((u) => u.unit_goals)) if (g.standard_ids.length && g.standard_ids.some((x) => !stdIds.has(x))) uBad.push(`目标 ${g.goal_id} 课标外键错`);
ok(uBad.length === 0, "teaching-units 外键与范围类型（章型/跨章型一致）" + (uBad.length ? "：" + uBad.slice(0, 3).join("；") : ""));
// 框架/量规
let rBad = [];
for (const f of frameworks.frameworks) for (const ind of f.indicators) {
  for (const sid of ind.standard_ids || []) if (!stdIds.has(sid)) rBad.push(`指标 ${ind.indicator_id} 课标外键错`);
  for (const rid of ind.rubric_ids || []) if (!rubricIds.has(rid)) rBad.push(`指标 ${ind.indicator_id} 量规外键错`);
}
for (const r of rubrics.rubrics) {
  if (!indicatorIds.has(r.indicator_id)) rBad.push(`量规 ${r.rubric_id} 指标不存在`);
  if (!r.levels || r.levels.length < 3) rBad.push(`量规 ${r.rubric_id} 等级不足`);
  if (!r.anchors || !r.anchors.positive?.length || !r.anchors.negative?.length) rBad.push(`量规 ${r.rubric_id} 缺正/反锚例`);
  if (r.review_status === "in_review" && !r.review_records?.length) rBad.push(`量规 ${r.rubric_id} in_review 无审核记录`);
}
ok(rBad.length === 0, "frameworks/rubrics 外键、等级与锚例齐备" + (rBad.length ? "：" + rBad.slice(0, 3).join("；") : ""));
// 作答外键
let aBad = [];
const seenPairs = new Set();
for (const a of da.attempts) {
  if (!questionIds.has(a.question_id)) aBad.push(`${a.attempt_id} 题目不存在`);
  if (!students.has(a.student_id)) aBad.push(`${a.attempt_id} 学生不在名册`);
  else if (classOf.get(a.student_id) !== a.class_id && a.scope_valid !== false) aBad.push(`${a.attempt_id} 班级归属错且未标记`);
  if (!homeworkIds.has(a.homework_id) && !a.homework_id.startsWith("hw-demo-")) aBad.push(`${a.attempt_id} 作业 ${a.homework_id} 既不在 homework-list 也非演示命名空间`);
  const key = `${a.question_id}|${a.student_id}|${a.attempt_role}|${a.occurred_at}`;
  if (seenPairs.has(key)) aBad.push(`${a.attempt_id} 重复作答记录`);
  seenPairs.add(key);
  if (a.correctness !== null && a.answer_steps.length === 0 && a.recognized) { /* needs_steps 允许，但必须有 note */ if (!a.evidence_note?.includes("仅答案")) aBad.push(`${a.attempt_id} 无步骤且未标记`); }
  if (a.recognized === false && a.correctness !== null) aBad.push(`${a.attempt_id} 未识别却给了对错`);
}
const qBad = [];
for (const q of da.questions) {
  if (!q.answer || !q.analysis || !q.steps?.length) qBad.push(`${q.question_id} 缺答案/解析/步骤`);
  for (const sid of q.section_ids) if (!sections.has(sid)) qBad.push(`${q.question_id} 节外键错（${sid}）`);
  for (const k of q.kp_ids) if (!kpIds.has(k)) qBad.push(`${q.question_id} kp 外键错`);
  for (const c of q.knowledge_clusters) if (!clusterNames.has(c)) qBad.push(`${q.question_id} cluster 外键错`);
}
ok(aBad.length === 0 && qBad.length === 0, "questions/attempts 外键与去重（名册/作业/题目/节）" + ((aBad.length || qBad.length) ? "，问题：" + [...aBad, ...qBad].slice(0, 3).join("；") : ""));
// 案例/干预/跟踪
let cBad = [];
for (const c of cases.cases) {
  for (const id of [...c.attempt_ids, ...c.supporting_evidence_ids, ...c.counter_evidence_ids]) if (!attemptIds.has(id)) cBad.push(`${c.case_id} 作答 ${id} 不存在`);
  else if (attemptOf.get(id).student_id !== c.student_id) cBad.push(`${c.case_id} 引用了他人作答 ${id}（归属错误）`);
  if (!cases.status_vocab.includes(c.status)) cBad.push(`${c.case_id} 状态越界`);
  if (c.status === "confirmed" && !c.review) cBad.push(`${c.case_id} confirmed 无审核记录`);
  for (const k of c.prerequisite_knowledge_ids) if (!kpIds.has(k)) cBad.push(`${c.case_id} 前置 kp 外键错`);
}
const confirmedCauses = new Set(cases.cases.filter((c) => c.status === "confirmed").flatMap((c) => c.confirmed_cause_ids));
for (const iv of ivs.packs) {
  for (const cid of iv.cause_ids) if (!causeIds.has(cid)) cBad.push(`${iv.intervention_id} 错因 ${cid} 不存在`);
  if (iv.status === "no_matching_intervention") { if (iv.micro_activity || iv.discrimination_question_id || iv.transfer_question_id) cBad.push(`${iv.intervention_id} 无匹配干预却配了内容`); }
  else {
    for (const q of [iv.discrimination_question_id, iv.transfer_question_id].filter(Boolean)) if (!questionIds.has(q)) cBad.push(`${iv.intervention_id} 题目外键错`);
    const microCount = iv.micro_activity ? 1 : 0;
    if (microCount > 1) cBad.push("微活动超限");
  }
}
const coveredCauses = new Set(ivs.packs.filter((iv) => iv.status !== "no_matching_intervention").flatMap((iv) => iv.cause_ids));
const uncoveredConfirmed = [...confirmedCauses].filter((c) => !coveredCauses.has(c));
ok(uncoveredConfirmed.length === 0, `已确认错因均有关联干预包（${confirmedCauses.size} 个确认错因全部覆盖）`);
for (const fu of fus.followups) {
  if (!cases.cases.some((c) => c.case_id === fu.case_id)) cBad.push(`${fu.followup_id} 案例外键错`);
  if (!ivs.packs.some((iv) => iv.intervention_id === fu.intervention_id)) cBad.push(`${fu.followup_id} 干预外键错`);
  for (const id of fu.followup_attempt_ids) if (!attemptIds.has(id)) cBad.push(`${fu.followup_id} 复测作答 ${id} 不存在`);
  if (!["stop", "collect_evidence", "adjust_support"].includes(fu.next_action)) cBad.push(`${fu.followup_id} next_action 越界`);
}
ok(cBad.length === 0, "cases/interventions/followups 外键与状态机" + (cBad.length ? "，问题：" + cBad.slice(0, 3).join("；") : ""));
// 情境/学习者/模板/工作流/工具
let mBad = [];
for (const s of scenarios.scenarios) for (const sid of s.section_ids) if (!sections.has(sid)) mBad.push(`情境 ${s.scenario_id} 节外键错`);
for (const e of learners.students) { if (!students.has(e.student_id)) mBad.push(`学习者档案学生不存在`); if (!e.contexts.every((x) => ["self_report", "observation", "unknown"].includes(x.source))) mBad.push(`${e.student_id} 来源类型越界`); }
for (const t of templates.field_mappings) if (!templates.templates.some((x) => x.fields.some((f) => f.field_id === t.template_field_id))) mBad.push(`字段映射 ${t.template_field_id} 无对应模板字段`);
for (const l of workflows.lessons) {
  if (!unitIds.has(l.unit_id) && !units.unlinked_lessons.some((x) => x.lesson_id === l.lesson_id)) mBad.push(`课时 ${l.lesson_id} 无单元归属`);
  for (const st of l.steps) for (const q of (st.draft || []).filter((x) => typeof x === "string" && /^(diag|disc|tran)-/.test(x))) if (!questionIds.has(q)) mBad.push(`课时 ${l.lesson_id} 引用白名单外题目 ${q}`);
  const asmt = l.steps.filter((s2) => s2.step_key === "assessment").flatMap((s2) => (s2.draft_after_retry || s2.draft || []));
  for (const raw of asmt) {
    if (typeof raw !== "string") continue;
    for (const rid of raw.match(/demo-rubric-[a-z0-9-]+/g) || []) if (!rubricIds.has(rid)) mBad.push(`课时 ${l.lesson_id} 量规外键错 ${rid}`);
  }
}
for (const t of tools.tools) for (const ex of t.examples) {
  if (ex.unit_id && !unitIds.has(ex.unit_id)) mBad.push(`${ex.example_id} 单元外键错`);
  if (ex.rubric_id && !rubricIds.has(ex.rubric_id)) mBad.push(`${ex.example_id} 量规外键错`);
}
ok(mBad.length === 0, "scenarios/learners/templates/workflows/tools 外键" + (mBad.length ? "，问题：" + mBad.slice(0, 3).join("；") : ""));

// 资源外键：resources.json knowledge_ids 必须是真实 cluster
{
  const resBad = [];
  for (const it of J("resources.json").items) for (const k of it.knowledge_ids) if (!clusterNames.has(k)) resBad.push(`${it.id} cluster ${k}`);
  ok(resBad.length === 0, "resources.json knowledge_ids 外键（48 条资源全部指向真实 cluster）" + (resBad.length ? "：" + resBad.slice(0, 3).join("；") : ""));
}

// 课标原文与映射落地（v2：用户已提供层次化 md 课标）
{
  const real = standards.standards.filter((x) => x.review_status !== "deprecated");
  ok(real.length >= 8 && real.every((x) => /^L\d+/.test(x.source_anchor || "") && (x.source_text || "").length >= 15 && !(x.source_text || "").includes("演示转述") && x.source_file),
    `课标条目 ${standards.standards.length} 条均带 md 行号锚点与真实原文（含学业质量三维描述）`);
  ok(standards.standards.some((x) => x.review_status === "deprecated" && x.superseded_by), "保留 deprecated 旧版条目作版本边界");
  const mappedGoals = units.units.flatMap((u) => u.unit_goals).filter((g) => g.mapping_status === "mapped").length;
  const mappedInds = frameworks.frameworks[0].indicators.filter((i) => (i.standard_ids || []).length > 0 && i.mapping_status !== "awaiting_source").length;
  ok(mappedGoals >= 5 && mappedInds >= 3, `课标映射落地：${mappedGoals} 个单元目标、${mappedInds} 个框架指标接入真实条目`);
  ok(units.units.length >= 3 && units.units.some((u) => u.unit_id === "demo-unit-data"), `教学单元 ${units.units.length} 个（新增数据分析草稿单元）`);
}

/* ---------- B. §4 最小规模 ---------- */
const catCount = (cat) => da.questions.filter((q) => q.category === cat).length;
ok(catCount("diagnostic") === 8 && catCount("discrimination") >= 8 && catCount("transfer") >= 8, `演示题 8 诊断 + ≥8 辨识 + ≥8 迁移（实为 ${catCount("diagnostic")}+${catCount("discrimination")}+${catCount("transfer")}，含复习周新章节题）`);
ok(da.attempts.length >= 48, `作答 ${da.attempts.length} 条 ≥ 48`);
ok(new Set(da.attempts.filter((a) => a.scope_valid !== false).map((a) => a.student_id)).size >= 8, "≥8 名重点演示学生有作答");
const roles = new Set(da.attempts.map((a) => a.attempt_role));
ok(roles.has("first") && roles.has("correction") && roles.has("retest"), "首答/订正/复测齐备");
ok(cases.cases.length >= 8, `错因案例 ${cases.cases.length} 组 ≥ 8`);
const types = new Set(cases.cases.flatMap((c) => c.candidate_causes.map((x) => x.type)));
ok(["概念", "前置", "条件", "表征", "策略/执行"].every((t) => types.has(t)), `五类错因齐备（实有：${[...types].join("/")}）`);
const stDist = {}; cases.cases.forEach((c) => (stDist[c.status] = (stDist[c.status] || 0) + 1));
ok((stDist.needs_evidence || 0) + (stDist.rejected || 0) >= 2, `待补证/否决案例 ≥2（分布：${JSON.stringify(stDist)}）`);
ok(rubrics.rubrics.length >= 4 && frameworks.frameworks[0].indicators.length >= 4, `框架指标 ${frameworks.frameworks[0].indicators.length} 个、量规 ${rubrics.rubrics.length} 个（≥4）`);
ok(learners.students.length >= 8 && learners.class_summaries.length === 3, `学习者档案 ${learners.students.length} 人 + 3 班摘要`);
ok(scenarios.scenarios.length >= 6 && new Set(scenarios.scenarios.map((s) => s.category)).size >= 3, `情境库 ${scenarios.scenarios.length} 个、${new Set(scenarios.scenarios.map((s) => s.category)).size} 类`);
ok(units.units.length >= 2 && workflows.lessons.filter((l) => !units.unlinked_lessons.some((u) => u.lesson_id === l.lesson_id)).length >= 4, `2 单元 ≥4 课时`);
ok(tools.tools.length === 3 && tools.tools.every((t) => t.examples.length >= 2) && tools.empty_states.length >= 1, "教研三 Tab 各 2 例 + 空状态");

/* ---------- C. §8 边界清单 ---------- */
const hasAttempt = (fn) => da.attempts.some(fn);
const B = [
  ["有章级无节级标签", workflows.lessons.length > 0 && J("portrait-observations-cls-g8-03.json").events.some((e) => e.mapping_status === "chapter_only")],
  ["跨节事件", da.questions.some((q) => q.section_ids.length > 1) && J("portrait-observations-cls-g8-03.json").events.some((e) => e.section_ids && e.section_ids.length > 1)],
  ["跨章单元", units.units.some((u) => u.scope.type === "cross_chapter")],
  ["同名不同教材节点", catalog.textbooks[0].chapters.some((ch) => ch.title === "二次根式") && [...sections.values()].some((s) => s.title === "二次根式" && s.textbook_id !== "demo-math-g8-vol2-v1")],
  ["合法范围无数据（对照教材节空态）", !da.questions.some((q) => (q.section_ids || []).some((x) => x.startsWith("demo-alt-"))) && !J("portrait-observations-cls-g8-03.json").events.some((e) => (e.section_ids || []).some((x) => x.startsWith("demo-alt-")))],
  ["边界样例登记齐全", (J("portrait-data-coverage.json").boundary_samples || []).length >= 8 && ["缺勤", "未来事件", "对照教材", "零点/末秒提交", "来源不适用"].every((t) => J("portrait-data-coverage.json").boundary_samples.some((b) => b.type.startsWith(t) || (b.reason || "").includes(t)))],
  ["无效课程 ID", hasAttempt((a) => a.course_override?.section_ids?.includes("demo-sec-not-exist-99"))],
  ["跨班学生 ID", hasAttempt((a) => a.scope_valid === false && classOf.get(a.student_id) !== a.class_id)],
  ["来源仅作业缺协作证据", learners.group_tasks.some((g) => g.attribution === "unknown")],
  ["小组有产出个人贡献未知", learners.group_tasks.some((g) => g.attribution === "unknown" && g.student_id === null)],
  ["课标缺失（awaiting_source）", frameworks.frameworks[0].indicators.some((i) => i.mapping_status === "awaiting_source")],
  ["量规未审核", rubrics.rubrics.some((r) => r.review_status === "draft" && !r.review_records?.length)],
  ["指标不适用", frameworks.frameworks[0].indicators.some((i) => i.status === "suspended")],
  ["相互矛盾证据", cases.cases.some((c) => c.counter_evidence_ids.length > 0 && c.status === "needs_evidence")],
  ["同题异因", cases.cases.filter((c) => c.question_id === "diag-r8-01").length === 2],
  ["同因异题", new Set(ivs.packs.find((p) => p.intervention_id === "iv-02")?.cause_ids || []).size === 1 && cases.cases.filter((c) => c.confirmed_cause_ids.includes("cause-02a")).length === 2],
  ["教师否决 AI 候选", cases.cases.some((c) => c.status === "rejected")],
  ["仅答案无步骤", hasAttempt((a) => a.recognized && a.answer_steps.length === 0 && a.final_answer && a.evidence_note?.includes("仅答案"))],
  ["无法识别的作答", hasAttempt((a) => a.recognized === false)],
  ["无匹配干预", ivs.packs.some((p) => p.status === "no_matching_intervention")],
  ["复测改善", fus.followups.some((f) => f.observed_change.startsWith("已达成"))],
  ["复测未改善", fus.followups.some((f) => f.next_action === "adjust_support" && f.observed_change.startsWith("未改善"))],
  ["复测未完成", fus.followups.some((f) => f.observed_change.includes("未完成"))],
  ["已达标停止", fus.followups.some((f) => f.stop_reason === "reached_standard")],
  ["单元未确认", units.units.some((u) => u.status === "draft")],
  ["历史课时未关联", units.unlinked_lessons.length === 1],
  ["上游编辑需复核", workflows.lessons.some((l) => l.status === "needs_review" && l.upstream_change)],
  ["生成失败后重试", workflows.lessons.some((l) => l.steps.some((s) => s.generation_note?.attempts === 2))],
  ["教研工具空状态", tools.empty_states.length >= 1],
  ["旧论坛链接保留", tools.forum_link.topic_count === 10 && J("research-topics.json").topics.length === 10],
];
const missing = B.filter(([, v]) => !v).map(([k]) => k);
ok(missing.length === 0, `§8 边界状态 ${B.length} 项全覆盖` + (missing.length ? `，缺：${missing.join("、")}` : ""));

/* ---------- D. 语义抽查（答案一致性：作答复算） ---------- */
{
  const q = da.questions.find((x) => x.question_id === "diag-r8-01");
  const wrong = da.attempts.filter((a) => a.question_id === "diag-r8-01" && a.correctness === false);
  ok(q.answer === "3" && wrong.every((a) => a.final_answer === "-3" || a.final_answer === null), "diag-r8-01：标准答案 3，错误作答均为 -3（题答一致）");
  const iv01 = ivs.packs.find((p) => p.intervention_id === "iv-01");
  const dq = da.questions.find((x) => x.question_id === iv01.discrimination_question_id);
  const tq = da.questions.find((x) => x.question_id === iv01.transfer_question_id);
  ok(dq.category === "discrimination" && tq.category === "transfer", "iv-01 的辨识/迁移题分类正确（干预不推诊断题当练习）");
}

/* ---------- E. 覆盖矩阵 ---------- */
console.log("\n—— 覆盖矩阵（章节 × 数据集）——");
const secQ = {}; for (const q of da.questions) for (const s of q.section_ids) secQ[s] = (secQ[s] || 0) + 1;
const obs = ["cls-g8-01", "cls-g8-02", "cls-g8-03"].map((c) => J(`portrait-observations-${c}.json`).events);
const secEv = {}; for (const es of obs) for (const e of es) for (const s of e.section_ids || []) secEv[s] = (secEv[s] || 0) + 1;
for (const [sid, info] of sections) {
  if (info.textbook_id !== "demo-math-g8-vol2-v1") continue;
  console.log(`  ${sid.padEnd(24)} ${info.title.padEnd(12)} 题:${String(secQ[sid] || 0).padStart(2)}  观测:${String(secEv[sid] || 0).padStart(4)}${(secQ[sid] || secEv[sid]) ? "" : "  ← 空态"}`);
}
ok(Object.values(secQ).reduce((a, b) => a + b, 0) >= 24, `题目节归属共 ${Object.values(secQ).reduce((a, b) => a + b, 0)} 条（跨节题计多节）`);
ok(Object.values(secEv).reduce((a, b) => a + b, 0) > 2000, `观测节归属 ${Object.values(secEv).reduce((a, b) => a + b, 0)} 条（auto_mapped）`);

// 时效性：数据覆盖至演示参考日（切换时间窗不落空）
{
  const asof = standards.demo_reference_date;
  const obsEnd = J("portrait-data-coverage.json").end_date;
  const lastAttempt = da.attempts.reduce((m, a) => (a.occurred_at.slice(0, 10) > m ? a.occurred_at.slice(0, 10) : m), "0000");
  ok(obsEnd === asof, `观测覆盖至演示参考日（${obsEnd} = ${asof}）`);
  ok(lastAttempt >= minusD(asof, 2), `最新诊断作答 ${lastAttempt}（参考日前 2 天内）`);
  ok(da.attempts.length >= 52, `作答 ${da.attempts.length} 条（≥52，含 09-21/22 新证据）`);
}
function minusD(iso, n) { const d = new Date(iso + "T00:00:00Z"); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
// 演示路线配置（清单 §7）与节覆盖门槛（§2.1）
{
  const sc = JSON.parse(fs.readFileSync(path.join(DATA, "portrait-demo-scenarios.json"), "utf-8"));
  ok(sc.normal_routes.length >= 10 && sc.boundary_routes.length >= 10, `演示路线配置：正常 ${sc.normal_routes.length} 条 + 边界 ${sc.boundary_routes.length} 条`);
  const cov = J("portrait-data-coverage.json");
  ok(cov.schema_version === "portrait-coverage-v2" && cov.section_coverage.length === 108 && cov.real_max_event_date && Object.values(cov.real_max_event_date).every((d) => d === cov.demo_as_of),
    `覆盖 v2：108 节窗组合、真实最新事件日=基准日（${JSON.stringify(cov.real_max_event_date)}）`);
  const bad = cov.section_coverage.filter((r) => r.knowledge_students < 40 || r.metrics.ability < 3 || r.metrics.literacy < 3 || r.metrics.process < 3);
  ok(bad.length === 0, `每班每节每窗：知识覆盖≥40人 且 能力/素养/过程各≥3指标（108 组合未达标 ${bad.length}）`);
}
console.log(fail === 0 ? "\n全部通过" : `\n${fail} 项失败`);
process.exit(fail ? 1 : 0);
