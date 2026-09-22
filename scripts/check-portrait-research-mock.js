/**
 * 校验教师端画像与校本教研 mock 数据（对照清单第 10 节最小规模 + 引用一致性）。
 * 用法：node scripts/check-portrait-research-mock.js
 */
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "mock", "teacher", "data");
const J = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf-8"));
const CLS = ["cls-g8-01", "cls-g8-02", "cls-g8-03"];
let fail = 0;
const ok = (c, m) => { console.log((c ? "PASS" : "FAIL") + "  " + m); if (!c) fail++; };

ok(CLS.length === 3, "3 个班级");
for (const c of CLS) {
  const cls = J(`profile-dimensions-class-${c}.json`);
  const stu = J(`profile-dimensions-student-${c}.json`);
  const exp = J(`profile-explanations-${c}.json`);
  const g = J(`knowledge-graph-filtered-${c}.json`);

  ok(cls.dimensions.length === 4, `${c} 班级画像四维`);
  ok(cls.dimensions.every((d) => d.radar_items.length >= 5 && d.radar_items.length <= 6), `${c} 每维 5-6 雷达项`);
  ok(cls.dimensions.every((d) => d.score != null && d.radar_items.every((i) => i.value != null && i.class_avg === null)), `${c} 班级数值有效且 class_avg 为空`);
  ok(stu.students.length >= 8 && stu.students.length <= 12, `${c} 学生数 ${stu.students.length} 在 8-12`);
  ok(stu.students.every((s) => s.dimensions.length === 4 && s.dimensions.every((d) => d.radar_items.length === 6)), `${c} 每生四维×6项`);
  ok(stu.students.every((s) => s.dimensions.every((d) => d.class_avg != null && d.rank_pct != null)), `${c} 学生维度带班均+百分位`);
  ok(g.nodes.length >= 12 && g.nodes.length <= 25, `${c} 图谱节点 ${g.nodes.length} 在 12-25（复习周新增逆定理/数据节点）`);
  ok(g.edges.length > 0 && g.edges.every((e) => e.relation_type && e.explanation), `${c} 图谱边 ${g.edges.length} 条且类型/解释齐`);
  ok(["time_windows", "sources", "dimension_types", "mastery_bands", "evidence_strengths", "goals"].every((k) => g.filters[k] && g.filters[k].length), `${c} 筛选项枚举齐备`);
  ok(!JSON.stringify([cls, stu, exp, g]).includes("NaN"), `${c} 无 NaN 文本`);

  const lowItems = [];
  cls.dimensions.forEach((d) => d.radar_items.filter((i) => i.value < 73).forEach((i) => lowItems.push(i.key)));
  const hasExp = new Set(exp.explanations.filter((e) => e.target_type === "radar_item" && e.scope === "class").map((e) => e.target_id));
  ok(lowItems.every((k) => hasExp.has(k)), `${c} 班级低分项 ${lowItems.length} 个全有解释`);

  const clsVal = {}; const dimVal = {};
  cls.dimensions.forEach((d) => { dimVal[d.dimension_key] = d.score; d.radar_items.forEach((i) => (clsVal[`${d.dimension_key}:${i.key}`] = i.value)); });
  ok(stu.students.every((s) => s.dimensions.every((d) => d.class_avg === dimVal[d.dimension_key] && d.radar_items.every((i) => i.class_avg === clsVal[`${d.dimension_key}:${i.key}`]))), `${c} 学生班均 = 班级画像实际值（口径一致）`);

  const weak = g.nodes.filter((n) => n.mastery_band === "待巩固" || n.mastery_band === "证据不足" || n.mastery < 65);
  const nodeExp = new Set(exp.explanations.filter((e) => e.target_type === "knowledge_node").map((e) => e.target_id));
  ok(weak.every((n) => nodeExp.has(n.node_id)), `${c} 薄弱节点 ${weak.length} 个全有解释`);

  ok(exp.explanations.every((e) => e.evidence.length >= 1 && e.evidence.length <= 3), `${c} 每条解释带 1-3 条证据（共 ${exp.explanations.length} 条解释）`);
  const types = new Set(exp.explanations.map((e) => e.target_type));
  ok(["dimension", "radar_item", "knowledge_node", "recommendation"].every((t) => types.has(t)), `${c} 解释覆盖 4 类对象`);
}

const rt = J("research-topics.json");
ok(rt.topics.length >= 8 && rt.topics.length <= 10, `教研议题 ${rt.topics.length} 条（8-10）`);
ok(rt.topics.every((t) => t.reply_count >= 3 && t.reply_count <= 5), "每条议题 3-5 回复");
const statuses = {}; rt.topics.forEach((t) => (statuses[t.status] = (statuses[t.status] || 0) + 1));
console.log("      议题状态分布:", JSON.stringify(statuses));

const expIds = new Set();
CLS.forEach((c) => J(`profile-explanations-${c}.json`).explanations.forEach((e) => expIds.add(e.explanation_id)));
const refBad = []; let strategies = 0; let applyable = 0;
for (const t of rt.topics) {
  const d = J(`research-topic-detail-${t.topic_id}.json`);
  strategies += d.strategies.length;
  applyable += d.strategies.filter((s) => s.can_apply_to_plan).length;
  ok(d.replies.length === t.reply_count && d.replies.every((r) => r.reply_id && r.author_name && r.created_at && r.liked_count != null), `${t.topic_id} 详情回复 ${d.replies.length} 条字段齐`);
  d.replies.forEach((rp) => rp.evidence_refs.forEach((r) => { if (!expIds.has(r)) refBad.push(`${t.topic_id}:${r}`); }));
}
ok(refBad.length === 0, "回复证据引用全部可解析" + (refBad.length ? `，悬空: ${refBad.join(" | ")}` : ""));
ok(strategies >= 3, `共识策略 ${strategies} 条（≥3），可引用到教案 ${applyable} 条`);

const mf = J("manifest.json");
const onDisk = fs.readdirSync(DATA).filter((f) => f.endsWith(".json") && f !== "manifest.json");
ok(mf.files.length === onDisk.length && onDisk.every((f) => mf.files.includes(f)), `manifest 登记齐全（${onDisk.length} 个）`);
const cj = J("classes.json");
ok(cj.classes.every((c) => c.teacher_id && c.teacher_name && c.latest_snapshot_at && c.class_name && c.grade && c.subject && c.n_students), "classes.json §2.1 字段齐备且保留既有字段");

console.log(fail === 0 ? "\n全部通过" : `\n${fail} 项失败`);
process.exit(fail ? 1 : 0);
