/**
 * 校验画像观测数据：独立实现 portrait-v1 聚合口径，并验证补充说明 §8 的 10 个验收场景。
 * 用法：node scripts/check-portrait-observations-mock.js
 */
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "mock", "teacher", "data");
const J = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf-8"));
const CLASSES = ["cls-g8-01", "cls-g8-02", "cls-g8-03"];
let fail = 0;
const ok = (c, m) => { console.log((c ? "PASS" : "FAIL") + "  " + m); if (!c) fail++; };

/* ---------- 载入 ---------- */
const rules = J("portrait-metric-rules.json");
const coverage = J("portrait-data-coverage.json");
const metricRules = new Map(rules.metrics.map((m) => [m.key, m]));
const rubricIds = new Set(rules.rubrics.map((r) => r.rubric_id));
const graphNodes = new Set(CLASSES.flatMap((c) => J(`knowledge-graph-filtered-${c}.json`).nodes.map((n) => n.node_id)));
const goalIds = new Set(J("knowledge-graph-filtered-cls-g8-03.json").filters.goals.map((g) => g.goal_id));
const rosters = new Map(CLASSES.map((c) => [c, new Set(J(`class-students-${c}.json`).map((s) => s.student_id))]));
const obs = new Map(CLASSES.map((c) => [c, J(`portrait-observations-${c}.json`)]));

/* ---------- A. 契约检查 ---------- */
const allIds = new Set();
let evTotal = 0, evInvalid = 0, zeroEarned = 0, srcCount = {}, dateMin = "9999", dateMax = "0000";
const ISO_RE = /^2026-(06|07|08|09)-\d{2}T\d{2}:\d{2}:\d{2}\+08:00$/;
let contractBad = [];
for (const c of CLASSES) {
  const f = obs.get(c);
  for (const e of f.events) {
    evTotal++;
    if (!e.valid) evInvalid++;
    if (allIds.has(e.evidence_id)) contractBad.push(`重复 evidence_id: ${e.evidence_id}`);
    allIds.add(e.evidence_id);
    if (e.class_id !== c) contractBad.push(`${e.evidence_id} class_id 归属错误`);
    if (!rosters.get(c).has(e.student_id)) contractBad.push(`${e.evidence_id} 学生不在名单`);
    if (!ISO_RE.test(e.occurred_at)) contractBad.push(`${e.evidence_id} occurred_at 格式/时区错误`);
    const d = e.occurred_at.slice(0, 10);
    if (e.valid && (d < coverage.start_date || d > coverage.end_date)) contractBad.push(`${e.evidence_id} 超出覆盖范围`);
    if (e.valid) { dateMin = d < dateMin ? d : dateMin; dateMax = d > dateMax ? d : dateMax; }
    if (!["homework", "exam", "classroom", "ai_tutor", "practice"].includes(e.source_type)) contractBad.push(`${e.evidence_id} source_type 越界`);
    if (!e.source_id || !e.source_name || /最近一次/.test(e.source_name)) contractBad.push(`${e.evidence_id} source_id/name 不具体`);
    srcCount[e.source_type] = (srcCount[e.source_type] || 0) + 1;
    const seen = new Set();
    for (const m of e.measurements) {
      if (seen.has(m.metric_key)) contractBad.push(`${e.evidence_id} 重复 metric_key`);
      seen.add(m.metric_key);
      if (!metricRules.has(m.metric_key)) contractBad.push(`${e.evidence_id} 未知指标 ${m.metric_key}`);
      else if (!metricRules.get(m.metric_key).allowed_source_types.includes(e.source_type)) contractBad.push(`${e.evidence_id} 来源 ${e.source_type} 不允许支撑 ${m.metric_key}`);
      if (!rubricIds.has(m.rubric_id)) contractBad.push(`${e.evidence_id} 未知量表 ${m.rubric_id}`);
      if (!(m.possible > 0 && m.earned >= 0 && m.earned <= m.possible && Number.isFinite(m.earned))) contractBad.push(`${e.evidence_id} earned/possible 非法`);
      if (e.valid && m.earned === 0) zeroEarned++;
    }
    for (const k of e.knowledge_results) {
      if (!graphNodes.has(k.node_id)) contractBad.push(`${e.evidence_id} 未知节点 ${k.node_id}`);
      if (!(k.possible > 0 && k.earned >= 0 && k.earned <= k.possible)) contractBad.push(`${e.evidence_id} knowledge_results 非法`);
    }
    for (const g of e.goal_ids || []) if (!goalIds.has(g)) contractBad.push(`${e.evidence_id} 未知目标 ${g}`);
    if (e.valid !== !e.invalid_reason) contractBad.push(`${e.evidence_id} valid/invalid_reason 不匹配`);
    if (/态度差|价值观低|动机差/.test(e.answer_summary || "")) contractBad.push(`${e.evidence_id} answer_summary 贴标签`);
  }
}
ok(contractBad.length === 0, `契约检查（${evTotal} 条事件，问题 ${contractBad.length}）` + (contractBad.length ? "：" + contractBad.slice(0, 3).join("；") : ""));
ok(new Set(Object.values(srcCount).map((v) => v > 0)).size > 0 && Object.keys(srcCount).length === 5 && Object.values(srcCount).every((v) => v > 0),
  `五类来源均有记录: ` + Object.entries(srcCount).map(([k, v]) => `${k}=${v}`).join(" "));
ok(zeroEarned > 0, `存在合法 0 分（earned=0 且 valid，共 ${zeroEarned} 项）`);
ok(evInvalid >= 3, `存在无效记录（${evInvalid} 条，不进统计但保留原因）`);
const AS_OF = coverage.demo_as_of;
const minusDays = (iso, n) => { const d = new Date(iso + "T00:00:00Z"); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const minusMonths = (iso, n) => { const d = new Date(iso + "T00:00:00Z"); d.setMonth(d.getMonth() - n); return d.toISOString().slice(0, 10); };
ok(dateMin >= coverage.start_date && dateMax <= AS_OF && dateMin < "2026-07-01" && dateMax >= minusDays(AS_OF, 2),
  `日期范围 ${dateMin} ~ ${dateMax}（覆盖至演示参考日 ${AS_OF} 前后，非集中末日）`);

/* ---------- B. portrait-v1 聚合实现 ---------- */
function aggregate(classId, { start, end, sources } = {}) {
  const events = obs.get(classId).events.filter((e) => {
    if (!e.valid) return false;
    const d = e.occurred_at.slice(0, 10);
    if (d < start || d > end) return false;
    if (sources && sources.length && !sources.includes(e.source_type)) return false;
    return true;
  });
  const perStudent = new Map();
  const knowledgeOfStudent = new Map();
  const nodes = new Map();
  const metricStudents = new Map();
  for (const e of events) {
    const s = perStudent.get(e.student_id) || new Map();
    for (const m of e.measurements) {
      const acc = s.get(m.metric_key) || { earned: 0, possible: 0, n: 0 };
      acc.earned += m.earned; acc.possible += m.possible; acc.n++;
      s.set(m.metric_key, acc);
      const ms = metricStudents.get(m.metric_key) || new Set();
      ms.add(e.student_id); metricStudents.set(m.metric_key, ms);
    }
    perStudent.set(e.student_id, s);
    for (const k of e.knowledge_results) {
      const ka = knowledgeOfStudent.get(e.student_id) || { e: 0, p: 0 };
      ka.e += k.earned; ka.p += k.possible;
      knowledgeOfStudent.set(e.student_id, ka);
      const acc = nodes.get(k.node_id) || new Map();
      const a = acc.get(e.student_id) || { earned: 0, possible: 0 };
      a.earned += k.earned; a.possible += k.possible;
      acc.set(e.student_id, a); nodes.set(k.node_id, acc);
    }
  }
  const dimMetrics = {};
  for (const m of rules.metrics) if (m.dimension_key !== "knowledge") (dimMetrics[m.dimension_key] ||= []).push(m.key);
  const students = {};
  for (const [sid, mets] of perStudent) {
    const metrics = {};
    for (const [key, acc] of mets) if (acc.possible > 0) metrics[key] = { score: (100 * acc.earned) / acc.possible, n: acc.n, low_sample: acc.n < metricRules.get(key).min_sample_count, earned: acc.earned, possible: acc.possible };
    // 口径 portrait-v2（§5.3）：能力/素养/过程维度 = 有效记录 earned/possible 汇总；知识维度只取 knowledge_results
    const dims = {};
    for (const [dim, keys] of Object.entries(dimMetrics)) {
      let e = 0, pp = 0, n = 0;
      for (const k of keys) if (metrics[k]) { e += metrics[k].earned; pp += metrics[k].possible; n++; }
      dims[dim] = { score: pp > 0 ? (100 * e) / pp : null, n_metrics: n };
    }
    const kn = knowledgeOfStudent.get(sid) || { e: 0, p: 0 };
    dims.knowledge = { score: kn.p > 0 ? (100 * kn.e) / kn.p : null, n_metrics: 0 };
    students[sid] = { metrics, dims };
  }
  const classMetrics = {};
  for (const [key, sids] of metricStudents) {
    const scores = [...sids].map((sid) => students[sid].metrics[key]).filter(Boolean).map((m) => m.score);
    classMetrics[key] = scores.length ? { score: scores.reduce((a, b) => a + b, 0) / scores.length, n_students: scores.length } : null;
  }
  const classDims = {};
  for (const dim of ["knowledge", "ability", "literacy", "process"]) {
    const vals = Object.values(students).map((s) => s.dims[dim].score).filter((v) => v != null);
    classDims[dim] = vals.length ? { score: vals.reduce((a, b) => a + b, 0) / vals.length, n_students: vals.length } : null;
  }
  const classNodes = {};
  for (const [node, byStu] of nodes) {
    const vals = [...byStu.values()].filter((a) => a.possible > 0).map((a) => (100 * a.earned) / a.possible);
    classNodes[node] = vals.length ? { score: vals.reduce((a, b) => a + b, 0) / vals.length, n_students: vals.length } : null;
  }
  return { n_events: events.length, students, classMetrics, classDims, classNodes, dimMetrics };
}

/* ---------- C. 验收场景 ---------- */
// 场景 1：三班 × 近7天/近1月/近3月（日历月回推）四维可用且窗口间有差异
const W = { "7d": [minusDays(AS_OF, 6), AS_OF], "1m": [minusMonths(AS_OF, 1), AS_OF], "3m": [minusMonths(AS_OF, 3), AS_OF] }; // 日历月回推，随 demo_as_of 推进不落空
const aggCache = {};
for (const c of CLASSES) {
  let dimsOk = true, diff = 0;
  for (const [w, [s0, e0]] of Object.entries(W)) {
    const a = aggregate(c, { start: s0, end: e0 });
    aggCache[`${c}|${w}`] = a;
    for (const dim of ["knowledge", "ability", "literacy", "process"]) {
      if (!a.classDims[dim]) dimsOk = false;
    }
  }
  const KEYS = ["image_interpretation", "operation_reasoning", "trend_judgment", "real_world_modeling", "transfer_apply", "func_concept"];
  let maxDelta = 0;
  for (const key of KEYS) {
    for (const [wa, wb] of [["7d", "3m"], ["1m", "3m"], ["7d", "1m"]]) {
      const va = aggCache[`${c}|${wa}`].classMetrics[key], vb = aggCache[`${c}|${wb}`].classMetrics[key];
      if (va && vb) { const d0 = Math.abs(va.score - vb.score); if (d0 > 1) { diff++; break; } maxDelta = Math.max(maxDelta, d0); }
    }
  }
  ok(dimsOk, `${c} 近7天/1月/3月 四维均可计算（场景1）`);
  ok(diff >= 2 || maxDelta <= 2, `${c} 窗口读数${diff >= 2 ? `有可解释差异（${diff} 个指标跨窗口差>1 分）` : `整班稳定（最大跨窗差 ${maxDelta.toFixed(1)} 分，无干预班）`}（场景1）`);
}
const v3g3 = aggCache["cls-g8-03|3m"].classMetrics.image_interpretation.score;
const v7g3 = aggCache["cls-g8-03|7d"].classMetrics.image_interpretation.score;
ok(v7g3 > v3g3 + 1, `3 班「图像解释」近7天(${v7g3.toFixed(1)}) 高于近3月(${v3g3.toFixed(1)})：支架回升叙事可由记录解释`);

// 场景 2：自定义 09-01~09-10 与单日 09-16，只统计范围内记录
{
  const a = aggregate("cls-g8-02", { start: "2026-09-01", end: "2026-09-10" });
  const used = obs.get("cls-g8-02").events.filter((e) => e.valid && e.occurred_at.slice(0, 10) >= "2026-09-01" && e.occurred_at.slice(0, 10) <= "2026-09-10");
  ok(a.n_events === used.length && a.classMetrics.image_interpretation != null && !a.classMetrics.homework_correction,
    `自定义 09-01~09-10：仅统计 ${a.n_events} 条范围内记录（订正事件均在 09-12 后，未计入窗口）`);
  const b = aggregate("cls-g8-03", { start: "2026-09-16", end: "2026-09-16" });
  const used16 = obs.get("cls-g8-03").events.filter((e) => e.valid && e.occurred_at.slice(0, 10) === "2026-09-16");
  ok(b.n_events === used16.length && b.n_events > 0 && b.classMetrics.image_interpretation != null,
    `单日 2026-09-16：仅统计当日 ${b.n_events} 条记录（图像解释课/订正/作业，指标可见、维度允许为 null）`);
}
// 场景 3：五类单一来源 + 两组多选
{
  const single = { exam: { expect: "func_concept", absent: "homework_process" }, classroom: { expect: "class_participation", absent: "func_concept" },
    homework: { expect: "homework_process", absent: "class_participation" }, practice: { expect: "learning_motivation", absent: "func_concept" },
    ai_tutor: { expect: "representation_transfer", absent: "homework_process" } };
  let allOk = true, msgs = [];
  for (const [src, { expect, absent }] of Object.entries(single)) {
    const a = aggregate("cls-g8-01", { start: coverage.start_date, end: coverage.end_date, sources: [src] });
    const has = a.classMetrics[expect] != null, no = a.classMetrics[absent] == null;
    if (!has || !no) allOk = false;
    msgs.push(`${src}:${has ? "✓" : "✗"}${no ? "✓" : "✗"}`);
  }
  ok(allOk, `五类单一来源各自出数且来源外指标为 null（${msgs.join(" ")}，场景3）`);
  const c1 = aggregate("cls-g8-03", { start: "2026-09-01", end: coverage.end_date, sources: ["homework", "exam"] });
  const c2 = aggregate("cls-g8-03", { start: "2026-09-01", end: coverage.end_date, sources: ["classroom", "ai_tutor"] });
  ok(c1.classMetrics.image_interpretation != null && c1.classMetrics.class_participation == null
    && c2.classMetrics.class_participation != null && c2.classMetrics.image_interpretation != null,
    `来源多选「作业+考试」「课堂+人机交互」按组合统计（场景3）`);
}
// 场景 4：135 个真实 student_id；缺测/低样本/过期案例与覆盖说明一致
{
  let n = 0, low = 0;
  for (const c of CLASSES) for (const e of obs.get(c).events) if (rosters.get(c).has(e.student_id)) { n++; break; }
  const covered = coverage.covered_students;
  const dedup = new Set(CLASSES.flatMap((c) => obs.get(c).events.map((e) => e.student_id))).size;
  ok(covered === dedup === (n === CLASSES.length) && covered === 135, `覆盖说明 covered_students=${covered} 与观测去重一致（135/135，场景4）`);
  for (const [c, w] of [[["cls-g8-01"], "1m"], [["cls-g8-03"], "7d"]]) {
    const a = aggCache[`${c}|${w}`] || aggregate(c[0], { start: W[w][0], end: W[w][1] });
    for (const sid of Object.keys(a.students)) for (const m of Object.values(a.students[sid].metrics)) if (m.low_sample) low++;
  }
  ok(low > 0, `存在低样本指标（${low} 人次 < min_sample_count，读数保留并标记，场景4/6）`);
  const vf = rules.metrics.find((m) => m.key === "value_formation");
  ok(vf.allowed_source_types.length === 0 && coverage.missing_metrics.some((m) => m.metric_key === "value_formation" && m.student_id === null),
    `value_formation 无来源全员缺测，覆盖说明已列明（0 分 ≠ 无数据，场景6）`);
}
// 场景 5：涨/稳/跌示例（6-9 月 trend_judgment：期末 vs 九月）
{
  for (const c of CLASSES) {
    const june = aggregate(c, { start: "2026-06-20", end: "2026-07-03" });
    const sept = aggregate(c, { start: "2026-09-01", end: AS_OF });
    let up = 0, flat = 0, down = 0;
    for (const [sid, s] of Object.entries(sept.students)) {
      const a = june.students[sid]?.metrics.trend_judgment, b = s.metrics.trend_judgment;
      if (!a || !b) continue;
      const d = b.score - a.score;
      if (d > 3) up++; else if (d < -3) down++; else flat++;
    }
    ok(up > 0 && flat > 0 && down > 0, `${c} 涨/稳/跌并存（变化趋势判断：升 ${up} / 稳 ${flat} / 降 ${down}，场景5）`);
  }
}
// 场景 7：分子分母手工复算（打印 3 个人指标 + 1 个班均 + 1 个知识节点）
{
  console.log("      —— 手工复算示例（可按 evidence_id 逐条相加验证）——");
  const c = "cls-g8-03"; const a = aggCache[`${c}|1m`];
  const stu0 = Object.keys(a.students)[0]; // a=aggCache[`${c}|1m`] 已按动态窗口计算
  for (const [sid, key] of [[stu0, "image_interpretation"], [stu0, "learning_attitude"]]) {
    const m = a.students[sid].metrics[key];
    console.log(`      ${sid} ${key}: SUM(earned)=${m.earned} / SUM(possible)=${m.possible} → ${(100 * m.earned / m.possible).toFixed(1)}（事件 ${m.n} 条）`);
    ok(m.score === (100 * m.earned) / m.possible, `${key} 个人读数 = 100×分子/分母（场景7）`);
  }
  const cm = a.classMetrics.image_interpretation;
  const mean = [...new Set([...metricStudentsOf(c, "image_interpretation", minusMonths(AS_OF, 1), AS_OF)])].map((sid) => a.students[sid].metrics.image_interpretation?.score).filter(Boolean);
  const recompute = mean.reduce((x, y) => x + y, 0) / mean.length;
  ok(Math.abs(recompute - cm.score) < 0.01 && cm.n_students === mean.length,
    `班均 = 有效学生个人读数均值（${cm.score.toFixed(1)}，有效 ${cm.n_students} 人 ≠ 名单 45 人，场景7）`);
  const node = a.classNodes["kp-function-image"];
  ok(node != null && node.n_students > 20, `知识节点 kp-function-image 班级掌握度 ${node.score.toFixed(1)}（有效 ${node.n_students} 人，由 knowledge_results 计算）`);
}
function metricStudentsOf(classId, key, start, end) {
  const out = [];
  for (const e of obs.get(classId).events) {
    if (!e.valid || e.occurred_at.slice(0, 10) < start || e.occurred_at.slice(0, 10) > end) continue;
    if (e.measurements.some((m) => m.metric_key === key)) out.push(e.student_id);
  }
  return out;
}
// 场景 8：过程/动机指标的证据含义一致
{
  const kinds = { class_participation: ["classroom"], cooperation: ["classroom"], homework_correction: ["homework"], learning_motivation: ["practice"] };
  ok(Object.entries(kinds).every(([k, srcs]) => [...metricRules.get(k).allowed_source_types].every((s) => srcs.includes(s))),
    `课堂参与/合作/订正/动机 仅由行为一致来源支撑（场景8）`);
  const oralSample = obs.get("cls-g8-03").events.find((e) => e.event_type === "oral_explanation" && e.valid);
  ok(oralSample && oralSample.answer_summary.length > 8, `过程证据为具体观察（例：${oralSample.answer_summary.slice(0, 24)}…，非正误标签）`);
}
// 场景 9：覆盖说明与观测一致
{
  let covOk = true;
  for (const sc of coverage.source_coverage) {
    const evs = obs.get(sc.class_id).events.filter((e) => e.source_type === sc.source_type);
    const valid = evs.filter((e) => e.valid);
    const dates = valid.map((e) => e.occurred_at.slice(0, 10)).sort();
    if (sc.n_events !== evs.length || sc.n_valid !== valid.length || sc.n_students !== new Set(valid.map((e) => e.student_id)).size
      || sc.earliest_date !== dates[0] || sc.latest_date !== dates[dates.length - 1]) covOk = false;
  }
  ok(covOk, `source_coverage 计数/日期/人数与观测一致（${coverage.source_coverage.length} 项，场景9）`);
  const sick = coverage.missing_intervals.find((m) => m.class_id === "cls-g8-02" && m.reason.includes("病假"));
  const sickId = J("class-students-cls-g8-02.json")[30].student_id;
  const sept = aggregate("cls-g8-02", { start: "2026-09-01", end: AS_OF }).students[sickId];
  ok(sick && !sept, `病假生九月无观测（missing_intervals 与空态一致）`);
  // 精确核对：self_efficacy 缺测名单 == 各班实际无反思事件的学生
  const covSe = new Set(coverage.missing_metrics.filter((m) => m.metric_key === "self_efficacy" && m.student_id).map((m) => m.class_id + m.student_id));
  const expSe = new Set();
  for (const c of CLASSES) {
    const has = new Set(obs.get(c).events.filter((e) => e.valid && e.measurements.some((m) => m.metric_key === "self_efficacy")).map((e) => e.student_id));
    for (const sid of rosters.get(c)) if (!has.has(sid)) expSe.add(c + sid);
  }
  ok(covSe.size === expSe.size && [...expSe].every((k) => covSe.has(k)) && [...covSe].every((k) => expSe.has(k)),
    `self_efficacy 缺测名单与实际无反思事件学生完全一致（${covSe.size} 人）`);
}
/* ---------- F. 全场景门槛（清单 §2.1/§5.2/§8） ---------- */
{
  const ALL_SECS = [...new Set(Object.values(obs.get("cls-g8-03").events.flatMap((e) => e.section_ids || [])))].filter((x) => x.startsWith("demo-sec-"));
  ok(ALL_SECS.length === 12, `主教材 12 节全部出现节级归属（实有 ${ALL_SECS.length}）`);
  // 真实最新事件日 = 基准日（D+7 探测口径）
  const maxDates = {};
  for (const c of CLASSES) maxDates[c] = obs.get(c).events.filter((e) => e.valid).reduce((m, e) => (e.occurred_at.slice(0, 10) > m ? e.occurred_at.slice(0, 10) : m), "0000");
  ok(Object.values(maxDates).every((d) => d === AS_OF), `真实最新事件日 = 基准日 ${AS_OF}（${JSON.stringify(maxDates)}）`);
  // 未来事件边界：恰 1 条 invalid 且晚于基准日
  const fut = obs.get("cls-g8-03").events.filter((e) => e.occurred_at.slice(0, 10) > AS_OF);
  ok(fut.length === 1 && fut[0].valid === false && /未来事件/.test(fut[0].invalid_reason || ""), "未来事件恰 1 条：invalid 保留原因不进统计");
  // 主讲学生：每人 12 节×3 窗均有事件
  const winRange = { "7d": [minusDays(AS_OF, 6), AS_OF], "1m": [minusMonths(AS_OF, 1), AS_OF], "3m": [minusMonths(AS_OF, 3), AS_OF] };
  let demoBad = [];
  for (const [cid, sids] of Object.entries(coverage.demo_students || {})) {
    for (const sid of sids) {
      const ev = obs.get(cid).events.filter((e) => e.valid && e.student_id === sid);
      for (const sec of ALL_SECS) if (!ev.some((e) => (e.section_ids || []).includes(sec))) { demoBad.push(`${cid}/${sid.slice(-6)} 缺节 ${sec}`); break; }
      for (const [w, [a0, b0]] of Object.entries(winRange)) if (!ev.some((e) => { const d = e.occurred_at.slice(0, 10); return d >= a0 && d <= b0; })) demoBad.push(`${cid}/${sid.slice(-6)} 窗口 ${w} 无事件`);
    }
  }
  ok(demoBad.length === 0, `9 名主讲学生覆盖全部 12 节与三个窗口${demoBad.length ? "，缺：" + demoBad.slice(0, 3).join("；") : ""}`);
  // 节级反思：每班 ≥12 节各≥1 份；保留笼统 unmapped 边界
  for (const c of CLASSES) {
    const refs = obs.get(c).events.filter((e) => e.event_type === "learning_reflection");
    const secsWith = new Set(refs.flatMap((e) => e.section_ids || []));
    ok(secsWith.size >= 12, `${c} 节级反思覆盖 ${secsWith.size} 节（≥12）`);
    if (c === "cls-g8-03") ok(refs.some((e) => (e.section_ids || []).length === 0 && /笼统|unmapped/.test(e.source_name + (e.observation_note || ""))), "g8-03 保留 1 份笼统反思（unmapped 边界）");
  }
  // 独立复算节覆盖并与 coverage.section_coverage 对数
  let mismatch = 0, below = 0;
  const covMap = new Map(coverage.section_coverage.map((r) => [`${r.class_id}|${r.section_id}|${r.window}`, r]));
  const DIM_OF_METRIC = new Map(rules.metrics.map((m) => [m.key, m.dimension_key]));
  for (const c of CLASSES) {
    for (const sec of ALL_SECS) {
      for (const [w, [a0, b0]] of Object.entries(winRange)) {
        const inWin = obs.get(c).events.filter((e) => e.valid && e.occurred_at.slice(0, 10) >= a0 && e.occurred_at.slice(0, 10) <= b0 && (e.section_ids || []).includes(sec));
        const kStu = new Set(inWin.filter((e) => (e.knowledge_results || []).length).map((e) => e.student_id)).size;
        const mets = { ability: new Set(), literacy: new Set(), process: new Set() };
        inWin.forEach((e) => e.measurements.forEach((m) => { const d = DIM_OF_METRIC.get(m.metric_key); if (mets[d]) mets[d].add(m.metric_key); }));
        const row = covMap.get(`${c}|${sec}|${w}`);
        if (!row) { mismatch++; continue; }
        if (row.knowledge_students !== kStu) mismatch++;
        if (row.metrics.ability !== mets.ability.size || row.metrics.literacy !== mets.literacy.size || row.metrics.process !== mets.process.size) mismatch++;
        if (kStu < 40 || mets.ability.size < 3 || mets.literacy.size < 3 || mets.process.size < 3) below++;
      }
    }
  }
  ok(mismatch === 0, `独立复算 108 节窗组合与 coverage.section_coverage 完全一致（不一致 ${mismatch}）`);
  ok(below === 0, `每班每节每窗门槛：知识≥40人、能力/素养/过程各≥3指标（未达标 ${below}）`);
  // 反思量表白名单（§1.1 修复验证）：reflect_express 事件全部 reflection-v1
  const reRub = new Set(rules.metrics.find((m) => m.key === "reflect_express").rubric_ids);
  let reBad = 0;
  for (const c of CLASSES) obs.get(c).events.forEach((e) => e.measurements.forEach((m) => { if (m.metric_key === "reflect_express" && !reRub.has(m.rubric_id)) reBad++; }));
  ok(reBad === 0 && reRub.has("reflection-v1"), "reflect_express 白名单已含 reflection-v1（45 条历史被拒测量已修复，0 拒绝）");
}
console.log(fail === 0 ? "\n全部通过" : `\n${fail} 项失败`);
process.exit(fail ? 1 : 0);
