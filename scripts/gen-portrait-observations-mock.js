#!/usr/bin/env node
/**
 * 教师端画像 · 时间/来源可筛选观测记录生成器（开发辅助，非系统功能）。
 * 依据 docs/画像时间筛选补充Mock说明-2026-09-20.md 交付 5 份新文件（不改动任何既有文件）：
 *   portrait-observations-cls-g8-01/02/03.json  三班全体 45 人的原子观测记录（带日期/来源/量表/知识点）
 *   portrait-metric-rules.json                  24 指标定义 + 计分量表 + 来源适用性 + 演示阈值
 *   portrait-data-coverage.json                 覆盖说明（日期范围/缺测/来源覆盖/统计口径版本）
 * 设计要点：
 *   - 班级/个人/图谱读数将来都从同一批观测按 portrait-v1 口径聚合，不再维护多套分数。
 *   - 三班叙事时间线：3 班函数簇 09-11 周练二触底、09-12 起支架见效回升；2 班计算簇 09-10 起自查单回升；
 *     1 班整体较好、建模偏弱。涨/稳/跌学生在每班均存在（trend 因子）。
 *   - 暑假(07-04~08-31)无课堂/考试；周末无课。覆盖说明区分"当天无活动"与"未采集"。
 *   - 刻意保留验收案例：value_formation 全员缺测、self_efficacy 仅反思单采集、合法 0 分、
 *     无效记录（缺考/重复录入/会话中断）、转学生(仅 09-07 后)、病假生(九月缺勤)。
 *   - 确定性伪随机：同一输入字节级复现。
 * 用法：node scripts/gen-portrait-observations-mock.js
 * 演示日期推进时：改 AS_OF 并补充最新记录，不得整体平移旧证据日期。
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "mock", "teacher", "data");
const AS_OF = process.env.DEMO_AS_OF || "2026-09-22"; // 演示基准日（含）；演示日期推进时用 DEMO_AS_OF 重生成，避免窗口落空
const START = "2026-06-20";            // 覆盖起点（含）
const TZ = "+08:00";
const CLASSES = [
  { id: "cls-g8-01", token: "g801", base: 0.79, story: "整体较好，实际问题建模偏弱" },
  { id: "cls-g8-02", token: "g802", base: 0.74, story: "计算类薄弱，09-10 起运算三步自查单回升" },
  { id: "cls-g8-03", token: "g803", base: 0.70, story: "函数图像解释薄弱簇，09-12 起支架见效回升" },
];
const GRAPH_GOALS = JSON.parse(fs.readFileSync(path.join(DATA, "knowledge-graph-filtered-cls-g8-03.json"), "utf-8"))
  .filters.goals.map((g) => g.goal_id); // goal-1..6（三班一致）

/* ---------- 确定性工具 ---------- */
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seedKey) {
  let a = hash(String(seedKey));
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const jit = (r, span) => (r() * 2 - 1) * span;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pad = (n) => String(n).padStart(2, "0");
const iso = (d, hh, mm) => `${d}T${pad(hh)}:${pad(mm)}:00${TZ}`;

/* ---------- 指标体系（key 与画像/图谱沿用，不新造同义词） ---------- */
const DIMS = {
  knowledge: ["func_concept", "coordinate_reading", "function_image_reading", "image_interpretation", "trend_judgment", "real_world_modeling"],
  ability: ["memorize_understand", "representation_transfer", "operation_reasoning", "problem_analysis", "transfer_apply", "reflect_express"],
  literacy: ["learning_attitude", "learning_interest", "learning_motivation", "effort_level", "self_efficacy", "value_formation"],
  process: ["class_participation", "listening_speaking", "cooperation", "thinking_perspective", "homework_process", "homework_correction"],
};
const METRIC_DIM = Object.fromEntries(Object.entries(DIMS).flatMap(([d, ks]) => ks.map((k) => [k, d])));
const METRIC_NAME = {
  func_concept: "函数概念理解", coordinate_reading: "坐标系读图", function_image_reading: "图像识读", image_interpretation: "图像解释",
  trend_judgment: "变化趋势判断", real_world_modeling: "实际问题建模",
  memorize_understand: "识记理解", representation_transfer: "表征转换", operation_reasoning: "运算推理", problem_analysis: "问题分析",
  transfer_apply: "迁移应用", reflect_express: "反思表达",
  learning_attitude: "学习态度", learning_interest: "学习兴趣", learning_motivation: "学习动机", effort_level: "努力程度",
  self_efficacy: "自我效能", value_formation: "价值观养成",
  class_participation: "课堂参与", listening_speaking: "倾听与发言", cooperation: "合作表现", thinking_perspective: "思维角度",
  homework_process: "作业完成过程", homework_correction: "订正过程",
};
const NODE_OF = {
  func_concept: ["kp-function"], coordinate_reading: ["kp-coordinate"], function_image_reading: ["kp-function-image"],
  image_interpretation: ["kp-function-image"], trend_judgment: ["kp-function-property"], real_world_modeling: ["kp-function-application"],
  memorize_understand: ["kp-fraction-properties"], representation_transfer: ["kp-function-image"], operation_reasoning: ["kp-radical-addsub", "kp-fraction-calc"],
  problem_analysis: ["kp-congruent-judge", "kp-special-quad"], transfer_apply: ["kp-function-application"],
};
const GOAL_OF = {
  func_concept: ["goal-1"], coordinate_reading: ["goal-2"], function_image_reading: ["goal-2"], image_interpretation: ["goal-2"],
  trend_judgment: ["goal-2"], real_world_modeling: ["goal-5"], memorize_understand: ["goal-3"], representation_transfer: ["goal-2"],
  operation_reasoning: ["goal-3"], problem_analysis: ["goal-4"], transfer_apply: ["goal-5"], reflect_express: ["goal-6"],
  learning_attitude: ["goal-6"], effort_level: ["goal-6"], homework_process: ["goal-6"], homework_correction: ["goal-6"],
};

/* ---------- 量表（portrait-metric-rules.json 同源） ---------- */
const QA = "qa-4pt-v1";
const RUBRICS = {
  [QA]: { name: "作答计分量表（每题 0-4 分）", possible: 4, levels: [
    [0, "未作答或完全错误"], [1, "有相关思路但结论错误"], [2, "部分正确，关键步骤缺失"], [3, "基本正确，仅少量过程分丢失"], [4, "完全正确且过程完整"],
  ] },
  "oral-expression-v1": { name: "口头表达量表", possible: 4, levels: [[0, "未能开口描述"], [1, "只读出孤立数据点"], [2, "能读关键点，未说清趋势"], [3, "点与趋势说清，实际意义不完整"], [4, "点—线—趋势完整并联系实际意义"]] },
  "participation-v1": { name: "课堂参与量表", possible: 4, levels: [[0, "全程未参与"], [1, "被点名后被动应答"], [2, "主动应答一次"], [3, "主动发言并能复述他人观点"], [4, "多轮深度参与并推动讨论"]] },
  "listening-v1": { name: "倾听与发言量表", possible: 4, levels: [[0, "未倾听也未发言"], [1, "能倾听，发言需提示"], [2, "倾听完整，偶尔主动发言"], [3, "主动发言且表达完整"], [4, "主动发言并回应、补充他人"]] },
  "group-task-v1": { name: "小组任务量表", possible: 4, levels: [[0, "未参与分工"], [1, "挂名分工无产出"], [2, "完成自己分工"], [3, "完成分工并主动协调"], [4, "贡献关键思路并帮助同伴"]] },
  "thinking-v1": { name: "思维角度量表", possible: 4, levels: [[0, "未尝试"], [1, "单一解法照搬"], [2, "在提示下给出第二种思路"], [3, "自主给出两种思路并比较"], [4, "多思路比较并说明适用条件"]] },
  "submission-v1": { name: "作业提交量表", possible: 4, levels: [[0, "未提交"], [1, "迟交且不完整"], [2, "按时提交但不完整"], [3, "按时完整提交"], [4, "按时完整并附自查标记"]] },
  "attitude-v1": { name: "学习态度量表（提交行为观察）", possible: 4, levels: [[0, "多次缺交"], [1, "经常迟交"], [2, "偶有迟交"], [3, "按时提交卷面完整"], [4, "按时提交且主动补做拓展"]] },
  "correction-v1": { name: "订正质量量表", possible: 4, levels: [[0, "未订正"], [1, "仅抄写正确答案"], [2, "重做但未写错因"], [3, "重做并写明错因"], [4, "重做+错因+复测通过"]] },
  "effort-v1": { name: "努力程度量表（订正投入）", possible: 4, levels: [[0, "无订正记录"], [1, "提醒后补订正"], [2, "自行订正一次"], [3, "自行订正并复核"], [4, "订正后主动加练同类题"]] },
  "self-directed-v1": { name: "自主学习量表（练习启动行为）", possible: 4, levels: [[0, "未启动"], [1, "被提醒后启动且未完成"], [2, "自主启动未完成"], [3, "自主启动并完成"], [4, "自主启动、完成并复盘错题"]] },
  "challenge-v1": { name: "挑战参与量表（选做行为）", possible: 4, levels: [[0, "未选做"], [1, "选做未提交"], [2, "完成基础挑战题"], [3, "完成并主动求讲解"], [4, "持续选做并尝试拓展题"]] },
  "reflection-v1": { name: "学习反思量表", possible: 4, levels: [[0, "未提交反思"], [1, "只写结论无分析"], [2, "指出错误但无归因"], [3, "错误归因并列改进措施"], [4, "归因、措施并跟踪落实"]] },
  "self-efficacy-v1": { name: "自我效能自评量表（反思单）", possible: 4, levels: [[0, "自评完全学不会"], [1, "自评多数听不懂"], [2, "自评能懂但不会做"], [3, "自评能做但不敢确定"], [4, "自评能独立完成并愿意讲解"]] },
};
/** 指标 → 量表的领域默认（事件可按场景换用，如口头场景用 oral-expression-v1） */
const DEFAULT_RUBRIC = {
  class_participation: "participation-v1", listening_speaking: "listening-v1", cooperation: "group-task-v1", thinking_perspective: "thinking-v1",
  homework_process: "submission-v1", learning_attitude: "attitude-v1", homework_correction: "correction-v1", effort_level: "effort-v1",
  learning_motivation: "self-directed-v1", learning_interest: "challenge-v1", reflect_express: "reflection-v1", self_efficacy: "self-efficacy-v1",
};

/* ---------- 学生能力模型 ---------- */
/** 三班叙事偏置：按指标与日期阶段返回偏置（负值=偏弱） */
function classBias(clsId, metric, date) {
  const fn = ["coordinate_reading", "function_image_reading", "image_interpretation", "trend_judgment", "representation_transfer", "real_world_modeling", "transfer_apply"];
  if (clsId === "cls-g8-03" && fn.includes(metric)) {
    if (date < "2026-07-04") return -0.16;          // 期末阶段已偏弱
    if (date < "2026-09-01") return -0.10;          // 暑期专项练习部分保持
    if (date <= "2026-09-11") return -0.17;         // 周练二触底（教研 09-12 发起）
    if (date <= "2026-09-15") return -0.12;         // 支架试行
    return -0.06;                                    // 09-16 起支架见效
  }
  const calc = ["operation_reasoning", "memorize_understand"];
  if (clsId === "cls-g8-02" && calc.includes(metric)) {
    if (date < "2026-09-10") return -0.15;
    return -0.07;                                    // 09-10 起运算三步自查单
  }
  if (clsId === "cls-g8-01" && (metric === "real_world_modeling" || metric === "transfer_apply")) {
    return date < "2026-09-01" ? -0.08 : -0.04;
  }
  return 0;
}
function buildModel(clsId, stu, idx) {
  const r = rng(`model-${clsId}-${stu.student_id}`);
  const theta = clamp(0.5 + (r() * 2 - 1) * 0.22 + (clsId === "cls-g8-01" ? 0.29 : clsId === "cls-g8-02" ? 0.24 : 0.2), 0.42, 0.95); // 学业基准
  const psi = clamp(0.74 + (r() * 2 - 1) * 0.13, 0.55, 0.93);   // 行为/素养基准
  const tp = r();
  const trend = tp < 0.28 ? "rising" : tp < 0.75 ? "stable" : "falling";
  const quiet = r() < 0.15;                                     // 课堂沉默型（过程维度低但学业正常）
  const ret = { theta, psi, trend, quiet, rate(metric, date) {
    const behavioral = METRIC_DIM[metric] === "literacy" || METRIC_DIM[metric] === "process";
    let v = behavioral ? psi : theta;
    v += classBias(clsId, metric, date);
    if (date < "2026-07-04") v *= trend === "rising" ? 0.93 : trend === "falling" ? 1.05 : 1.0;   // 期末：涨型当时更低
    else if (date >= "2026-09-01") v *= trend === "rising" ? 1.08 : trend === "falling" ? 0.9 : 1.0; // 九月：分化
    if (quiet && (metric === "class_participation" || metric === "listening_speaking")) v -= 0.2;
    const r2 = rng(`rate-${clsId}-${stu.student_id}-${metric}-${date}`);
    return clamp(v + jit(r2, 0.05), 0.03, 0.97);
  } };
  return ret;
}

/* ---------- 课程归属（增量映射，与 curriculum-links.json 同源） ---------- */
const SEC_OF_NODE = {
  "kp-radical": "demo-sec-radical-01", "kp-radical-muldvd": "demo-sec-radical-02", "kp-radical-addsub": "demo-sec-radical-03",
  "kp-function": "demo-sec-function-01", "kp-function-image": "demo-sec-function-02", "kp-function-property": "demo-sec-function-02",
  "kp-function-application": "demo-sec-function-03",
  "kp-pythagoras": "demo-sec-pythagoras-01", "kp-pythagoras-inverse": "demo-sec-pythagoras-02",
  "kp-parallelogram": "demo-sec-quad-01", "kp-special-quad": "demo-sec-quad-02",
  "kp-data-central-tendency": "demo-sec-data-01", "kp-data-dispersion": "demo-sec-data-02",
};
const CH_OF_SEC = {
  "demo-sec-radical-01": ["demo-ch-radical", "demo-unit-radical"], "demo-sec-radical-02": ["demo-ch-radical", "demo-unit-radical"],
  "demo-sec-radical-03": ["demo-ch-radical", "demo-unit-radical", "demo-unit-linear-app"],
  "demo-sec-function-01": ["demo-ch-function", "demo-unit-linear-app"], "demo-sec-function-02": ["demo-ch-function", "demo-unit-linear-app"],
  "demo-sec-function-03": ["demo-ch-function", "demo-unit-linear-app"],
  "demo-sec-pythagoras-01": ["demo-ch-pythagoras"], "demo-sec-pythagoras-02": ["demo-ch-pythagoras"],
  "demo-sec-quad-01": ["demo-ch-quad"], "demo-sec-quad-02": ["demo-ch-quad"],
  "demo-sec-data-01": ["demo-ch-data", "demo-unit-data"], "demo-sec-data-02": ["demo-ch-data", "demo-unit-data"],
};
/** 九月课次 → 章（课堂行为事件仅有章级归属，节级待课表接入） */
const LESSON_CH = {
  "2026-09-01": "demo-ch-function", "2026-09-03": "demo-ch-function", "2026-09-08": "demo-ch-function",
  "2026-09-10": "demo-ch-function", "2026-09-12": "demo-ch-function", "2026-09-16": "demo-ch-function",
  "2026-09-17": "demo-ch-function", "2026-09-18": "demo-ch-function", "2026-09-21": "demo-ch-function",
    "2026-09-22": "demo-ch-data", "2026-06-24": "demo-ch-function",
};
function minusDaysIso(iso, n) { const d = new Date(iso + "T00:00:00Z"); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
function minusMonthsIso(iso, n) { const d = new Date(iso + "T00:00:00Z"); d.setMonth(d.getMonth() - n); return d.toISOString().slice(0, 10); }
function courseOf(nodes, sourceType, date) {
  const secs = [...new Set((nodes || []).map((n) => SEC_OF_NODE[n.node]).filter(Boolean))];
  if (secs.length) {
    const chs = [...new Set(secs.flatMap((sec) => CH_OF_SEC[sec]))];
    const units = [...new Set(secs.flatMap((sec) => CH_OF_SEC[sec].slice(1)))];
    const chapter = chs[0];
    return { subject_id: "math", textbook_id: "demo-math-g8-vol2-v1",
      chapter_id: secs.flatMap((s2) => CH_OF_SEC[s2]).filter((c) => c.startsWith("demo-ch-")).length > 1 ? null : chapter,
      section_ids: secs, unit_ids: units, task_id: null, mapping_status: "auto_mapped" };
  }
  // 无节点线索：课堂事件按课次归章（有章无节边界）；其余 unmapped
  if (sourceType === "classroom" && LESSON_CH[date]) {
    return { subject_id: "math", textbook_id: "demo-math-g8-vol2-v1",
      chapter_id: LESSON_CH[date], section_ids: [], unit_ids: [], task_id: null, mapping_status: "chapter_only" };
  }
  return { subject_id: "math", textbook_id: null, chapter_id: null, section_ids: [], unit_ids: [], task_id: null, mapping_status: "unmapped" };
}

/* ---------- 稳定 ID（清单 §5.2：按业务来源+学生+任务+时间生成，不随插入变化） ---------- */
function stableEvId(token, sourceId, studentId, sectionKey, metricKeys, hhmm) {
  const d = new Date(); void d;
  return `pev-${token}-${hhmm.replace(":", "")}-${((hash(`${sourceId}|${studentId}|${sectionKey}|${metricKeys}`) & 0xffffff).toString(16).padStart(6, "0"))}`;
}
function stableMid(token, evHashSeed, metricKey) {
  return `pm-${token}-${((hash(`${evHashSeed}|${metricKey}`) & 0xfffffff).toString(16).padStart(7, "0"))}`;
}

/* ---------- 事件构造 ---------- */
/* 摘要按指标族分化（修复：根式事件不再使用图像类文案） */
const FAM_OF = {
  function_image_reading: "image", image_interpretation: "image", trend_judgment: "image",
  representation_transfer: "image", real_world_modeling: "image", transfer_apply: "image",
  operation_reasoning: "calc", memorize_understand: "calc",
  func_concept: "concept", coordinate_reading: "concept", problem_analysis: "geometry", reflect_express: "reflect",
};
const QA_BANKS = {
  image: { hi: "读点与趋势判断准确，解释完整落到实际意义", mid: "能读出关键点，但将截距误判为斜率，趋势解释未落到实际意义", lo: "将“y 随 x 增大而增大”说反，未借助图像验证结论" },
  calc: { hi: "化简到最简后再合并，步骤与依据完整", mid: "能化简个别根式，但存在未化到最简就合并的情况", lo: "未化简直接合并同类项外的根式（如 √18+√8 写成 √26）" },
  concept: { hi: "能说出概念的关键条件并举例检验", mid: "概念条件复述基本正确，代入检验不完整", lo: "遗漏概念的非负/取值范围等关键条件" },
  geometry: { hi: "选择定理恰当，说理链条完整", mid: "定理选择正确但书写依据不全", lo: "误用条件结构相近的判定定理" },
  reflect: { hi: "归因到具体错误类型并给出可执行的改进措施", mid: "能指出错误但归因停留在“不熟练”", lo: "只写“粗心”，未指明具体错误类型" },
};
const SUMMARY_HI = {
  qa: "思路完整，读点与趋势判断准确，解释落到实际意义",
  oral: "三步表达完整：点—线—趋势，并联系情境解释实际意义",
  group: "认领分工并贡献关键思路，能复述组内两种解法的差异",
  correction: "重做并写明错因，同类型复测通过",
  attitude: "按时提交，卷面完整，附自查标记",
  motivation: "无需提醒自主启动练习，完成后主动复盘错题",
  interest: "持续选做挑战题，本次尝试拓展变式",
  reflection: "错误归因到“图像与语言转换”，列出两条改进措施并跟踪",
  efficacy: "自评“能独立完成图像解释题，愿意给同学讲解”",
  ai: "在提示下完成图像到文字的转换，第二次无需提示",
};
const SUMMARY_MID = {
  qa: "能读出关键点，但将截距误判为斜率，解释未落到实际意义",
  oral: "能指出两个关键点并解释变化方向，实际意义表述不完整",
  group: "完成自己的记录员分工，能复述组内结论",
  correction: "重做完成，错因写为“粗心”，未再复测",
  attitude: "按时提交，个别题空缺",
  motivation: "自主启动练习，未完成全部题目",
  interest: "选做基础挑战题并完成",
  reflection: "指出“图像题常错”，归因停留在“不熟练”",
  efficacy: "自评“能看懂图，但说不出来”",
  ai: "完成一半提示流程后中断一次，重启后完成",
};
const SUMMARY_LO = {
  qa: "将“y 随 x 增大而增大”说反，未借助图像验证结论",
  oral: "只读出交点坐标，未描述变化趋势",
  group: "挂名计时分工，未参与讨论",
  correction: "仅抄写正确答案，无错因说明",
  attitude: "迟交且两题空缺",
  motivation: "被提醒后启动，完成三分之一",
  interest: "浏览挑战题后未作答",
  reflection: "只写“考得不好”，无具体分析",
  efficacy: "自评“函数图像部分多数听不懂”",
  ai: "会话中未跟随提示作答，反复跳步",
};
const summaryOf = (kind, earned, possible, family) => {
  const ratio = earned / possible;
  if (family && QA_BANKS[family]) {
    const b = QA_BANKS[family];
    return ratio >= 0.75 ? b.hi : ratio >= 0.45 ? b.mid : b.lo;
  }
  const bank = ratio >= 0.75 ? SUMMARY_HI : ratio >= 0.45 ? SUMMARY_MID : SUMMARY_LO;
  return bank[kind] || bank.qa;
};

/** 通用观测事件。content: [{metric, possible, rubric?}]；riders: 行为指标 [{metric, possible}] */
function makeEvent(ctx, stu, model, opt) {
  const r = rng(`ev-${ctx.classId}-${stu.student_id}-${opt.sourceId}-${opt.date}-${opt.slot || 0}`);
  const measurements = [];
  for (const c of opt.content || []) {
    const rate = model.rate(c.metric, opt.date);
    const earned = Math.round(c.possible * rate);
    measurements.push({ metric_key: c.metric, earned, possible: c.possible, rubric_id: c.rubric || QA });
  }
  for (const rd of opt.riders || []) {
    const rate = model.rate(rd.metric, opt.date);
    measurements.push({ metric_key: rd.metric, earned: Math.round(rd.possible * rate), possible: rd.possible, rubric_id: DEFAULT_RUBRIC[rd.metric] });
  }
  const knowledge_results = (opt.nodes || []).map((n) => {
    const m = (opt.content || []).find((c) => (NODE_OF[c.metric] || []).includes(n));
    const rate = m ? model.rate(m.metric, opt.date) : model.rate("memorize_understand", opt.date);
    const possible = n.possible || 4;
    return { node_id: n.node, earned: Math.round(possible * rate), possible };
  });
  const main = measurements[0] || { earned: 0, possible: 4 };
  const hh = opt.hh || (opt.sourceType === "classroom" ? 10 : opt.sourceType === "exam" ? 14 : 19);
  const mm = opt.mm != null ? opt.mm : Math.floor(r() * 6) * 10;
  const course = opt.sections
    ? { subject_id: "math", textbook_id: "demo-math-g8-vol2-v1", chapter_id: opt.sections.chapter, section_ids: opt.sections.ids, unit_ids: opt.sections.units || [], task_id: null, mapping_status: "auto_mapped" }
    : courseOf(opt.nodes, opt.sourceType, opt.date);
  const ev = {
    evidence_id: null, // 排序后统一编号
    class_id: ctx.classId, student_id: stu.student_id,
    ...course,
    occurred_at: iso(opt.date, hh, mm),
    source_type: opt.sourceType, source_id: opt.sourceId, source_name: opt.sourceName,
    event_type: opt.eventType || "question_answer",
    answer_summary: opt.answerSummary || summaryOf(opt.kind || "qa", main.earned, main.possible, FAM_OF[(opt.content && opt.content[0] && opt.content[0].metric)] || null),
    measurements, knowledge_results,
    goal_ids: opt.goalIds || [...new Set((opt.content || []).flatMap((c) => GOAL_OF[c.metric] || []))],
    valid: opt.valid !== false, invalid_reason: opt.invalidReason || null,
  };
  if (opt.family && REF_SUMMARY[opt.family]) {
    const ratio = main.earned / main.possible;
    ev.answer_summary = REF_SUMMARY[opt.family][ratio >= 0.75 ? 0 : ratio >= 0.45 ? 1 : 2];
  }
  if (opt.note) ev.observation_note = opt.note;
  if (opt.durationSeconds != null) ev.duration_seconds = opt.durationSeconds;
  if (opt.attemptCount != null) ev.attempt_count = opt.attemptCount;
  if (opt.submittedAt) ev.submitted_at = opt.submittedAt;
  if (opt.correctedAt) ev.corrected_at = opt.correctedAt;
  if (opt.questionId) { ev.question_id = opt.questionId; ev.question_stem = opt.questionStem; }
  return ev;
}

/* ---------- 教学日历（固定锚点，叙事时间线） ---------- */
/* ---------- 白名单题干（诊断题集同步；观测引用真实题目 ID 与完整题意，清单 §5.2） ---------- */
const WL_STEM = {
  "diag-r8-01": "当 a=-3 时，求 √(a²) 的值。",
  "diag-r8-02": "若二次根式 √(x-3) 有意义，则 x 的取值范围是（　　）A. x>3　B. x≥3　C. x≤3　D. x≠3",
  "diag-r8-03": "计算：√18+√8。",
  "diag-r8-04": "直线 y=2x-1 与 y 轴的交点坐标是（　　）",
  "diag-r8-05": "函数 y=-3x+6 中，y 随 x 的增大如何变化？请说明依据。",
  "diag-r8-06": "出租车起步价 8 元（3 公里内），超出部分每公里 2.4 元。行驶 12 公里应付多少元？",
  "diag-r8-07": "三边长为 5、12、13 的三角形是直角三角形吗？请写出判断依据。",
  "diag-r8-08": "计算：√12+√27-√48。",
  "disc-r8-01": "分别取 a=3、a=0、a=-3，判断 √(a²) 与 a 是否相等，并说明理由。",
  "disc-r8-02": "下列二次根式中，属于最简二次根式的是（　　）A. √8　B. √(a²b)　C. √(1/2)　D. √6",
  "disc-r8-03": "下列各组中哪些可以直接合并？说明理由。① 3√5 与 √5；② 2√6 与 2√7；③ √12 与 √3",
  "disc-r8-04": "四条直线 l₁:y=2x、l₂:y=-2x、l₃:y=0.5x、l₄:y=-0.5x 中，y 随 x 增大而减小的有哪些？",
  "disc-r8-05": "将直线 y=2x 向上平移 3 个单位后的解析式是（　　）",
  "disc-r8-06": "A、B 两方案费用函数分别为 y=3x 与 y=2x+30（x 为次数）。求两方案费用相同的次数，并说明 x 取何值时 A 更省。",
  "disc-r8-07": "判断三边为 ① 8、15、17；② 5、6、7；③ 7、24、25 的三角形是否为直角三角形。",
  "disc-r8-08": "找错：某同学的解答 √18+√8=√26。错在哪一步？正确结果是什么？",
  "disc-r8-09": "下列条件中，能判定四边形是平行四边形的是（　　）A. 两组对角分别相等　B. 一组对边相等　C. 对角线互相垂直　D. 一组对边平行",
  "disc-r8-10": "某班30人身高（单位：cm）中，多数人集中在165附近，个别同学190。刻画「一般水平」用哪个统计量更合适？（　　）A. 平均数　B. 中位数　C. 众数　D. 最大值",
  "tran-r8-01": "已知 a=√3+1，先化简代数式 a²-2a-2，再求它的值。",
  "tran-r8-02": "已知 a>0，化简 √(2a²)·√(a/2)。",
  "tran-r8-03": "已知一次函数的图像经过点 (1,3) 和 (-1,-1)，求解析式，并说明 y 随 x 的变化情况。",
  "tran-r8-04": "A 卡月费 20 元每部影片 3 元，B 卡无月费每部 6 元。每月看多少部时两卡费用相同？x 取何值时选 A 更省？",
  "tran-r8-05": "下列情境中，y 是否为 x 的函数？① 等腰三角形底边长 x 与面积 y（高给定）；② 全校各班的人数 y 与班级编号 x。",
  "tran-r8-06": "长 5 米的梯子底端距墙 3 米。① 顶端离地多少米？② 若顶端下滑 1 米，底端外移多少米？",
  "tran-r8-07": "化简 √((x-2)²)，并说明需要讨论的条件。",
  "tran-r8-08": "弹簧原长 10cm，每挂 1kg 伸长 0.5cm。① 写出总长 L 关于质量 m 的函数式并求 m=8 时的长度；② m=50 时该式还适用吗？",
  "tran-r8-09": "平行四边形 ABCD 的对角线 AC、BD 交于点 O，且 AC=BD。求证：四边形 ABCD 是矩形，并说明矩形与平行四边形的包含关系。",
  "tran-r8-10": "甲、乙两名射手5次射击平均成绩相同，成绩分别为 甲：8,8,8,8,8；乙：6,10,6,10,8。谁的成绩更稳定？用方差说明。",
};
const REF_SUMMARY = { // 节级反思摘要（按节域分化，不用图像文案）
  radical: ["指认「未化简先合并」为本期主要错因，写下三步自查的改进步骤", "反思最简二次根式两个条件经常漏检，计划每天2题化简练习", "订正后能说清同类根式判断依据，自评能做但不敢确定"],
  function: ["指出把截距当斜率的错误，写出先标两点再解释变化趋势的改进步骤；自评能做但不敢确定", "图像解释三步表达已能完成，反思实际意义环节仍需提示", "归纳 k 符号与升降的对应口诀，自评能独立完成"],
  pythagoras: ["反思最长边辨认不仔细导致用错逆定理，计划先标最长边再计算", "能区分定理与逆定理方向，自评能讲解给同伴", "网格求距离时漏平方直接比较，写下先算平方和的步骤"],
  quad: ["反思判定定理条件记不全（对角线条件），制作条件卡片", "能用性质定理推判定，自评基本能独立完成", "矩形菱形包含关系已理清，反思证明书写依据不全"],
  data: ["反思「平均数一定代表一般水平」的直觉错误，接受中位数适用场景", "能计算三个统计量，选择理由表述仍不完整；自评能懂但不会做", "波动直觉前测答错，标记「方差」为待学概念"],
};

const CAL = {
  juneHomework: [["2026-06-22", "operation_reasoning", "kp-radical-addsub", "期末复习卷一（根式与分式运算）"],
    ["2026-06-23", "memorize_understand", "kp-radical", "期末复习卷二（二次根式概念辨析）"],
    ["2026-06-24", "problem_analysis", "kp-pythagoras", "期末复习卷三（勾股定理及其应用）"],
    ["2026-06-25", "problem_analysis", "kp-special-quad", "期末复习卷四（平行四边形与特殊四边形）"],
    ["2026-06-26", "trend_judgment", "kp-function-property", "期末复习卷五（一次函数性质）"]],
  juneLesson: { date: "2026-06-24", id: "lesson-g8-0624", name: "期末复习课（一次函数专项·口头梳理）" },
  finalExam: { date: "2026-06-29", id: "exam-2026-final", name: "春季学期期末考试（数学）",
    content: [["func_concept", 12], ["trend_judgment", 12], ["operation_reasoning", 12], ["problem_analysis", 8]],
    nodes: [["kp-function", 8], ["kp-function-property", 8], ["kp-radical-addsub", 8], ["kp-pythagoras", 8], ["kp-special-quad", 8]] },
  summerHomework: [["2026-07-15", "operation_reasoning", "kp-radical-muldvd", "暑期作业一（二次根式）"],
    ["2026-07-30", "operation_reasoning", "kp-fraction-calc", "暑期作业二（分式运算）"],
    ["2026-08-15", "func_concept", "kp-function", "暑期作业三（函数概念回顾）"]],
  septHomework: [["2026-09-02", "func_concept", "kp-function", "第19章课后作业一（函数的概念）"],
    ["2026-09-07", "function_image_reading", "kp-function-image", "课后作业二（一次函数图像识读）"],
    ["2026-09-09", "image_interpretation", "kp-function-image", "课后作业三（图像解释表达）"],
    ["2026-09-14", "trend_judgment", "kp-function-property", "课后作业四（变化趋势判断）"],
    ["2026-09-16", "image_interpretation", "kp-function-image", "课后作业五（点—线—趋势表达练习）"],
    ["2026-09-21", "image_interpretation", "kp-function-image", "课后作业六（一次函数单元综合练习）"]],
  quizzes: [
    { date: "2026-09-04", id: "quiz-2026-w1", name: "周练一（坐标系与运算）", content: [["coordinate_reading", 8], ["operation_reasoning", 8]], nodes: [["kp-coordinate", 8], ["kp-fraction-calc", 8]] },
    { date: "2026-09-11", id: "quiz-2026-w2", name: "周练二（一次函数图像）", content: [["function_image_reading", 8], ["image_interpretation", 8], ["operation_reasoning", 8]], nodes: [["kp-function-image", 12], ["kp-radical-addsub", 4]] },
    { date: "2026-09-18", id: "quiz-2026-w3", name: "周练三（图像解释与综合）", content: [["image_interpretation", 12], ["trend_judgment", 8], ["transfer_apply", 8]], nodes: [["kp-function-image", 12], ["kp-function-application", 8]] },
  ],
  unitExam: { date: "2026-09-15", id: "exam-2026-sep-unit", name: "九月单元测（一次函数）",
    content: [["func_concept", 8], ["function_image_reading", 8], ["image_interpretation", 12], ["trend_judgment", 8], ["real_world_modeling", 8], ["memorize_understand", 8], ["operation_reasoning", 8]],
    nodes: [["kp-function", 8], ["kp-function-image", 12], ["kp-function-application", 8]] },
  septLessons: [
    { date: "2026-09-01", id: "lesson-0901", name: "函数的概念（情境导入）", type: "oral_explanation" },
    { date: "2026-09-03", id: "lesson-0903", name: "变量与函数（小组讨论）", type: "group_task" },
    { date: "2026-09-08", id: "lesson-0908", name: "一次函数图像·读图训练", type: "oral_explanation" },
    { date: "2026-09-10", id: "lesson-0910", name: "图像解释·问题诊断课", type: "oral_explanation" },
    { date: "2026-09-12", id: "lesson-0912", name: "支架试行：点—线—趋势三步表达", type: "oral_explanation" },
    { date: "2026-09-16", id: "lesson-0916", name: "图像解释课（支架后首次完整应用）", type: "oral_explanation", n: 14 },
    { date: "2026-09-16", id: "lesson-0916b", name: "复习课·根式与勾股定理串联", type: "oral_explanation", n: 14,
      spec: { mets: [["operation_reasoning", "qa-4pt-v1"], ["problem_analysis", "qa-4pt-v1"], ["memorize_understand", "qa-4pt-v1"]], nodes: [["kp-radical", 4], ["kp-radical-muldvd", 4], ["kp-radical-addsub", 4], ["kp-pythagoras", 4], ["kp-pythagoras-inverse", 4]], kind: "qa" } },
    { date: "2026-09-17", id: "lesson-0917", name: "一次函数性质综合（小组任务）", type: "group_task" },
    { date: "2026-09-17", id: "lesson-0917b", name: "复习课·四边形判定辨析（小组）", type: "group_task", n: 13,
      spec: { mets: [["problem_analysis", "qa-4pt-v1"], ["memorize_understand", "qa-4pt-v1"]], nodes: [["kp-parallelogram", 4], ["kp-special-quad", 4]], kind: "qa" } },
    { date: "2026-09-18", id: "lesson-0918", name: "周练三讲评与反思", type: "oral_explanation" },
    { date: "2026-09-21", id: "lesson-0921", name: "一次函数单元复习课（图像与建模串联）", type: "oral_explanation",
      spec: { mets: [["image_interpretation", "oral-expression-v1"], ["representation_transfer", "oral-expression-v1"]], nodes: [["kp-function", 4], ["kp-function-image", 4], ["kp-function-application", 4]], kind: "oral" } },
    { date: "2026-09-22", id: "lesson-0922", name: "数据的集中趋势·起始课", type: "group_task",
      spec: { mets: [["problem_analysis", "qa-4pt-v1"]], nodes: [["kp-data-central-tendency", 4]], kind: "qa" } },
    { date: "2026-09-22", id: "lesson-0922b", name: "数据的波动·经验讨论（前测活动）", type: "oral_explanation", n: 12,
      spec: { mets: [["problem_analysis", "qa-4pt-v1"]], nodes: [["kp-data-dispersion", 4]], kind: "qa", note: "前置经验调查（方差未教，讨论波动直觉）" } },
  ],
  reviewHomework: [
    { d: "2026-09-16", slug: "rev-radical-01", name: "复习单·二次根式的概念与性质", nodes: [["kp-radical", 8]], mets: [["memorize_understand", 8], ["transfer_apply", 6]], q: "diag-r8-01" },
    { d: "2026-09-17", slug: "rev-radical-02", name: "复习单·二次根式的乘除与化简", nodes: [["kp-radical-muldvd", 8]], mets: [["operation_reasoning", 8], ["transfer_apply", 6]], q: "tran-r8-02" },
    { d: "2026-09-17", slug: "rev-radical-03", name: "微练习·根式加减三步自查", nodes: [["kp-radical-addsub", 8]], mets: [["operation_reasoning", 8], ["problem_analysis", 6]], q: "diag-r8-03" },
    { d: "2026-09-18", slug: "rev-pythagoras", name: "复习单·勾股定理及其逆定理", nodes: [["kp-pythagoras", 6], ["kp-pythagoras-inverse", 6]], mets: [["problem_analysis", 10]], q: "disc-r8-07" },
    { d: "2026-09-19", slug: "rev-quad", name: "复习单·平行四边形与特殊四边形", nodes: [["kp-parallelogram", 6], ["kp-special-quad", 6]], mets: [["problem_analysis", 10]], q: "disc-r8-09" },
    { d: "2026-09-19", slug: "rev-function-01", name: "复习单·函数的概念与表示", nodes: [["kp-function", 8]], mets: [["memorize_understand", 8]], q: "tran-r8-05" },
    { d: "2026-09-21", slug: "rev-function-03", name: "复习单·选择方案（建模与区间决策）", nodes: [["kp-function-application", 8]], mets: [["transfer_apply", 8], ["problem_analysis", 6]], q: "tran-r8-04" },
    { d: "2026-09-22", slug: "hw-data-01", name: "课后作业·数据的集中趋势", nodes: [["kp-data-central-tendency", 8]], mets: [["memorize_understand", 8]], q: "disc-r8-10" },
  ],
  preTests: [ // 数据章前置采集（09-22 起始课前，明确标注；不含已完成单元的课堂学习）
    { d: "2026-09-19", slug: "pre-data-01", name: "数据前测·集中趋势计算与选择", nodes: [["kp-data-central-tendency", 8]], mets: [["memorize_understand", 8], ["problem_analysis", 8]], riders: ["learning_motivation"], q: "disc-r8-10", note: "前置前测（20章未开始，标注采集，不作已学证据口径外的解读）" },
    { d: "2026-09-20", slug: "pre-data-02", name: "经验调查·数据波动直觉（两位射手谁更稳定）", nodes: [["kp-data-dispersion", 8]], mets: [["problem_analysis", 8], ["transfer_apply", 8]], riders: ["learning_interest", "learning_motivation"], q: "tran-r8-10", note: "前置经验调查（方差未教，仅采集直觉判断）" },
  ],
  stageDiag: { date: "2026-09-22", id: "exam-2026-stage", name: "阶段诊断（复习周测评）", subtasks: [
    { slug: "radical-03", name: "根式加减", nodes: [["kp-radical-addsub", 8]], mets: [["operation_reasoning", 8]], hh: 8, mm: 35, q: "disc-r8-08" },
    { slug: "pythagoras-01", name: "勾股定理", nodes: [["kp-pythagoras", 8]], mets: [["problem_analysis", 8]], hh: 8, mm: 50, q: "diag-r8-07" },
    { slug: "quad-01", name: "平行四边形", nodes: [["kp-parallelogram", 8]], mets: [["problem_analysis", 8]], hh: 9, mm: 5, q: "disc-r8-09" },
    { slug: "function-02", name: "一次函数图像", nodes: [["kp-function-image", 8]], mets: [["image_interpretation", 8]], hh: 9, mm: 20, q: "diag-r8-04" },
  ] },
  practiceTopics: [
    { metric: "function_image_reading", name: "自主练习（函数图像识读）", summer: true },
    { metric: "image_interpretation", name: "自主练习（图像解释专项）", summer: true },
    { metric: "operation_reasoning", name: "自主练习（根式与分式运算）", summer: true },
    { metric: "image_interpretation", name: "错题重练（周练二图像题）", summer: false },
    { metric: "trend_judgment", name: "函数专题自主练习", summer: false },
  ],
};

/* ---------- 每班事件生成 ---------- */
const SEC_POOL = ["demo-sec-radical-01", "demo-sec-radical-02", "demo-sec-radical-03", "demo-sec-pythagoras-01", "demo-sec-pythagoras-02",
  "demo-sec-quad-01", "demo-sec-quad-02", "demo-sec-function-01", "demo-sec-function-02", "demo-sec-function-03", "demo-sec-data-01", "demo-sec-data-02"];
const SEC_FAMILY = { "demo-sec-radical-01": "radical", "demo-sec-radical-02": "radical", "demo-sec-radical-03": "radical",
  "demo-sec-pythagoras-01": "pythagoras", "demo-sec-pythagoras-02": "pythagoras", "demo-sec-quad-01": "quad", "demo-sec-quad-02": "quad",
  "demo-sec-function-01": "function", "demo-sec-function-02": "function", "demo-sec-function-03": "function",
  "demo-sec-data-01": "data", "demo-sec-data-02": "data" };
const SEC_TITLE = { "demo-sec-radical-01": "二次根式的概念与性质", "demo-sec-radical-02": "二次根式的乘除", "demo-sec-radical-03": "二次根式的加减",
  "demo-sec-pythagoras-01": "探索勾股定理", "demo-sec-pythagoras-02": "勾股定理的逆定理", "demo-sec-quad-01": "平行四边形", "demo-sec-quad-02": "特殊的平行四边形",
  "demo-sec-function-01": "函数", "demo-sec-function-02": "一次函数的图像与性质", "demo-sec-function-03": "课题学习·选择方案",
  "demo-sec-data-01": "数据的集中趋势", "demo-sec-data-02": "数据的离散程度" };

function genClassEvents(cls) {
  const roster = JSON.parse(fs.readFileSync(path.join(DATA, `class-students-${cls.id}.json`), "utf-8"));
  const events = [];
  const ctx = { classId: cls.id };
  const clsOrder = ["cls-g8-01", "cls-g8-02", "cls-g8-03"].indexOf(cls.id);
  let reflCount = 0; // 节级反思轮转计数（前 12 份覆盖 12 节）
  const SPECIAL = {
    "cls-g8-01": { transferStudent: roster[44] },                     // 09-07 转入
    "cls-g8-02": { sickStudent: roster[30] },                         // 九月病假
    "cls-g8-03": { unitAbsent: roster[20] },                          // 单元测缺考
  }[cls.id];
  const skipSpecial = (stu, date, kind) => {
    if (SPECIAL.transferStudent && stu.student_id === SPECIAL.transferStudent.student_id && date < "2026-09-07") return "transfer";
    if (SPECIAL.sickStudent && stu.student_id === SPECIAL.sickStudent.student_id && date >= "2026-09-01") return "sick";
    if (SPECIAL.unitAbsent && stu.student_id === SPECIAL.unitAbsent.student_id && kind === "unit") return "unit-absent";
    return null;
  };

  roster.forEach((stu, idx) => {
    const model = buildModel(cls.id, stu, idx);
    const r = rng(`plan-${cls.id}-${stu.student_id}`);

    // —— 六月：期末复习 + 期末考 + 复习课 ——
    for (const [d, metric, node, name] of CAL.juneHomework) {
      if (skipSpecial(stu, d)) continue;
      events.push(makeEvent(ctx, stu, model, { date: d, sourceType: "homework", sourceId: `hw-${d.replace(/-/g, "")}`, sourceName: name,
        content: [{ metric, possible: 8 }], riders: [{ metric: "homework_process", possible: 4 }, { metric: "learning_attitude", possible: 4 }],
        nodes: [{ node, possible: 8 }], questionId: `q-${cls.token}-j${Math.floor(r() * 900 + 100)}`, questionStem: `${METRIC_NAME[metric]}相关题 3 道（含 1 道变式）` }));
    }
    { // 期末考
      const skip = skipSpecial(stu, CAL.finalExam.date);
      if (!skip) events.push(makeEvent(ctx, stu, model, { date: CAL.finalExam.date, sourceType: "exam", sourceId: CAL.finalExam.id, sourceName: CAL.finalExam.name,
        content: CAL.finalExam.content.map(([m, p]) => ({ metric: m, possible: p })),
        nodes: CAL.finalExam.nodes.map(([n, p]) => ({ node: n, possible: p })), hh: 9, mm: 30, slot: 1 }));
    }
    { // 六月数据前测（20 章前置经验调查，标注采集；仅集中趋势直觉，不含已学口径）
      if (!skipSpecial(stu, "2026-06-28") && r() < 0.85) {
        events.push(makeEvent(ctx, stu, model, { date: "2026-06-28", sourceType: "practice", sourceId: "pre-data-june", sourceName: "统计基础前测（小学回顾·经验调查）",
          content: [{ metric: "memorize_understand", possible: 8 }], riders: [{ metric: "learning_motivation", possible: 4 }],
          nodes: [{ node: "kp-data-central-tendency", possible: 8 }], kind: "concept",
          durationSeconds: 300 + Math.floor(r() * 600), note: "前置经验调查（20 章未开始，标注采集）", hh: 10 }));
      }
    }

    // —— 暑假：暑期作业 + 自主练习 + AI 学伴（无课堂/考试） ——
    for (const [d, metric, node, name] of CAL.summerHomework) {
      if (skipSpecial(stu, d)) continue;
      if (SPECIAL.sickStudent && stu.student_id === SPECIAL.sickStudent.student_id && r() < 0.3) continue; // 病假生暑期少量缺交
      events.push(makeEvent(ctx, stu, model, { date: d, sourceType: "homework", sourceId: `hw-${d.replace(/-/g, "")}`, sourceName: name,
        content: [{ metric, possible: 8 }], riders: [{ metric: "homework_process", possible: 4 }, { metric: "learning_attitude", possible: 4 }],
        nodes: [{ node, possible: 8 }], submittedAt: iso(d, 20, 30) }));
    }
    for (let s = 0; s < 3; s++) { // 暑期自主练习：日期分散在 07-06~08-28
      if (skipSpecial(stu, "2026-08-01")) continue;
      if (r() < 0.12) continue; // 少数学生暑期未坚持
      const topic = CAL.practiceTopics[Math.floor(r() * 3)];
      const day = 6 + Math.floor(r() * 53); const d = new Date(2026, 6, 6 + day);
      const ds = `2026-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const riders = r() < 0.55 ? [{ metric: "learning_motivation", possible: 4 }] : [];
      events.push(makeEvent(ctx, stu, model, { date: ds, sourceType: "practice", sourceId: `practice-${cls.token}-su${s + 1}-${stu.display_id}`, sourceName: topic.name,
        content: [{ metric: topic.metric, possible: 8 }], riders, nodes: [{ node: NODE_OF[topic.metric][0], possible: 8 }],
        durationSeconds: 600 + Math.floor(r() * 1800), attemptCount: 1 + Math.floor(r() * 2) }));
    }
    if (r() < 0.75) { // 暑期 AI 学伴诊断（1 次）
      const day = 15 + Math.floor(r() * 35); const d = new Date(2026, 6, day);
      const ds = `2026-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      events.push(makeEvent(ctx, stu, model, { date: ds, sourceType: "ai_tutor", sourceId: `ai-${cls.token}-summer-${stu.display_id}`, sourceName: "AI 学伴·暑期图像解释诊断",
        content: [{ metric: "representation_transfer", possible: 8 }], nodes: [{ node: "kp-function-image", possible: 8 }],
        kind: "ai", durationSeconds: 900 + Math.floor(r() * 1500), note: "会话记录：图像→文字转换练习 4 题" }));
    }

    // —— 九月：课后作业 ——
    for (const [d, metric, node, name] of CAL.septHomework) {
      if (skipSpecial(stu, d)) continue;
      const zeroCase = cls.id === "cls-g8-03" && stu.student_id === roster[37].student_id && d === "2026-09-09"; // 合法 0 分案例
      events.push(makeEvent(ctx, stu, model, { date: d, sourceType: "homework", sourceId: `hw-${d.replace(/-/g, "")}`, sourceName: name,
        content: [{ metric, possible: 8 }], riders: [{ metric: "homework_process", possible: 4 }, { metric: "learning_attitude", possible: 4 }],
        nodes: [{ node, possible: 8 }], submittedAt: iso(d, 20, 40),
        ...(zeroCase ? { content: [{ metric, possible: 8 }], answerSummary: "整页未作答直接提交", note: "合法 0 分：提交行为有效但无作答", zero: true } : {}) }));
      if (zeroCase) { const ev = events[events.length - 1]; ev.measurements.filter((m) => m.metric_key === metric || m.metric_key === "learning_attitude").forEach((m) => (m.earned = 0)); ev.knowledge_results.forEach((k) => (k.earned = 0)); }
    }
    // —— 复习周（09-16~09-22 综合复习周）：全班级别复习任务，覆盖全部 12 节 ——
    for (const t of CAL.reviewHomework) {
      if (skipSpecial(stu, t.d)) continue;
      events.push(makeEvent(ctx, stu, model, { date: t.d, sourceType: "homework", sourceId: `hw-${t.slug}`, sourceName: t.name,
        content: t.mets.map(([m, pp]) => ({ metric: m, possible: pp })),
        riders: [{ metric: "homework_process", possible: 4 }, { metric: "learning_attitude", possible: 4 }, { metric: "learning_interest", possible: 4 }],
        nodes: t.nodes.map(([n, pp]) => ({ node: n, possible: pp })),
        questionId: t.q, questionStem: WL_STEM[t.q], submittedAt: `${t.d}T20:30:00+08:00`, slot: 6 }));
    }
    for (const t of CAL.preTests) {
      if (skipSpecial(stu, t.d)) continue;
      const midnight = cls.id === "cls-g8-02" && idx === 2 && t.slug === "pre-data-02"; // 边界样例：单日零点后提交
      events.push(makeEvent(ctx, stu, model, { date: t.d, sourceType: "practice", sourceId: `practice-${t.slug}`, sourceName: t.name,
        content: t.mets.map(([m, pp]) => ({ metric: m, possible: pp })),
        riders: t.riders.map((k) => ({ metric: k, possible: 4 })),
        nodes: t.nodes.map(([n, pp]) => ({ node: n, possible: pp })),
        questionId: t.q, questionStem: WL_STEM[t.q], note: t.note + (midnight ? "｜边界样例：当日 00:05 提交" : ""),
        durationSeconds: 420 + Math.floor(r() * 900), hh: midnight ? 0 : 15, mm: midnight ? 5 : 30, slot: 7 }));
    }
    { // 阶段诊断（同卷按节拆子任务事件，清单 §5.2）
      if (!skipSpecial(stu, CAL.stageDiag.date)) {
        for (const sub of CAL.stageDiag.subtasks) {
          events.push(makeEvent(ctx, stu, model, { date: CAL.stageDiag.date, sourceType: "exam", sourceId: `${CAL.stageDiag.id}-${sub.slug}`, sourceName: `${CAL.stageDiag.name}·${sub.name}`,
            content: sub.mets.map(([m, pp]) => ({ metric: m, possible: pp })),
            nodes: sub.nodes.map(([n, pp]) => ({ node: n, possible: pp })),
            questionId: sub.q, questionStem: WL_STEM[sub.q], hh: sub.hh, mm: sub.mm, slot: 8 }));
        }
      }
    }
    // —— 九月：测验与单元测 ——
    for (const q of CAL.quizzes) {
      if (skipSpecial(stu, q.date)) continue;
      events.push(makeEvent(ctx, stu, model, { date: q.date, sourceType: "exam", sourceId: q.id, sourceName: q.name,
        content: q.content.map(([m, p]) => ({ metric: m, possible: p })), nodes: q.nodes.map(([n, p]) => ({ node: n, possible: p })), hh: 8, mm: 40, slot: 2 }));
    }
    { // 单元测（g8-03 一人缺考 → 无效记录）
      if (!skipSpecial(stu, CAL.unitExam.date, "unit")) {
        events.push(makeEvent(ctx, stu, model, { date: CAL.unitExam.date, sourceType: "exam", sourceId: CAL.unitExam.id, sourceName: CAL.unitExam.name,
          content: CAL.unitExam.content.map(([m, p]) => ({ metric: m, possible: p })),
          nodes: CAL.unitExam.nodes.map(([n, p]) => ({ node: n, possible: p })), hh: 14, mm: 20, slot: 3 }));
      } else if (SPECIAL.unitAbsent && stu.student_id === SPECIAL.unitAbsent.student_id) {
        events.push(makeEvent(ctx, stu, model, { date: CAL.unitExam.date, sourceType: "exam", sourceId: CAL.unitExam.id, sourceName: CAL.unitExam.name,
          content: [], nodes: [], valid: false, invalidReason: "缺考：当日病假，成绩无效", answerSummary: "缺考", hh: 14, mm: 20, slot: 3 }));
      }
    }
    // —— 九月：订正（周练二后 + 单元测后各 1 次） ——
    for (const [d, node, after] of [["2026-09-12", cls.id === "cls-g8-02" ? "kp-radical-addsub" : "kp-function-image", "周练二"],
      ["2026-09-16", cls.id === "cls-g8-01" ? "kp-function-application" : "kp-function-image", "九月单元测"],
      ["2026-09-22", "kp-function-image", "周练三"]]) {
      if (skipSpecial(stu, d)) continue;
      if (r() < 0.1) continue; // 个别未订正
      const dur = 420 + Math.floor(r() * 1800);
      events.push(makeEvent(ctx, stu, model, { date: d, sourceType: "homework", sourceId: `corr-${cls.token}-${d.replace(/-/g, "")}-${stu.display_id}`, sourceName: `${after}错题订正单`,
        eventType: "correction", kind: "correction",
        content: [], riders: [{ metric: "homework_correction", possible: 4 }, { metric: "effort_level", possible: 4 }],
        nodes: [{ node, possible: 4 }], durationSeconds: dur, attemptCount: 1 + Math.floor(r() * 3),
        submittedAt: iso(d, 19, 10), correctedAt: iso(d, 19, 10 + Math.min(55, Math.round(dur / 60))) }));
    }
    // —— 九月：自主练习 2 次（周末 09-19 少量） + 挑战选做 ——
    for (let s = 0; s < 2; s++) {
      if (skipSpecial(stu, "2026-09-10")) continue;
      const topic = CAL.practiceTopics[3 + (s % 2)];
      const day = s === 0 ? 2 + Math.floor(r() * 9) : (r() < 0.35 ? 18 + Math.floor(r() * 4) : 10 + Math.floor(r() * 8));
      const d = new Date(2026, 8, day); const ds = `2026-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const challenge = r() < 0.3;
      const riders = [];
      if (r() < 0.5) riders.push({ metric: "learning_motivation", possible: 4 });
      if (challenge) riders.push({ metric: "learning_interest", possible: 4 });
      events.push(makeEvent(ctx, stu, model, { date: ds, sourceType: "practice", sourceId: `practice-${cls.token}-sep${s + 1}-${stu.display_id}`, sourceName: topic.name + (challenge ? "（含挑战题）" : ""),
        content: [{ metric: topic.metric, possible: 8 }], riders, nodes: [{ node: NODE_OF[topic.metric][0], possible: 8 }],
        durationSeconds: 480 + Math.floor(r() * 1500), attemptCount: 1 + Math.floor(r() * 2) }));
    }
    // —— 九月：AI 学伴（周练二错因讲解） ——
    if (r() < (cls.id === "cls-g8-03" ? 0.7 : 0.4) && !skipSpecial(stu, "2026-09-13")) {
      const day = 13 + Math.floor(r() * 6); const d = new Date(2026, 8, day);
      const ds = `2026-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      events.push(makeEvent(ctx, stu, model, { date: ds, sourceType: "ai_tutor", sourceId: `ai-${cls.token}-sep-${stu.display_id}`, sourceName: "AI 学伴·周练二错因讲解",
        content: [{ metric: cls.id === "cls-g8-02" ? "operation_reasoning" : "image_interpretation", possible: 8 }],
        nodes: [{ node: cls.id === "cls-g8-02" ? "kp-radical-addsub" : "kp-function-image", possible: 8 }],
        kind: "ai", durationSeconds: 720 + Math.floor(r() * 1200) }));
    }
    // —— 复习周节级反思（清单 §5.2：归属到节；每班 12 节各≥1 份，少量 unmapped 边界保留） ——
    if (((idx * 3 + clsOrder) % 10) < 3 && !skipSpecial(stu, "2026-09-19")) {
      const generic = cls.id === "cls-g8-03" && idx === 6; // 边界样例：笼统反思，归属无法确认
      const lastSecond = cls.id === "cls-g8-01" && reflCount === 1; // 边界样例：当日 23:55 提交
      const d = ["2026-09-19", "2026-09-20", "2026-09-21", "2026-09-22"][Math.floor(r() * 4)];
      const sec = generic ? null : SEC_POOL[reflCount % 12];
      const fam = generic ? "function" : SEC_FAMILY[sec];
      events.push(makeEvent(ctx, stu, model, { date: d, sourceType: "practice",
        sourceId: generic ? `demo-reflection-generic-${d.replace(/-/g, "")}` : `demo-reflection-${sec.replace("demo-sec-", "")}-${d.replace(/-/g, "")}`,
        sourceName: generic ? "学习反思单（笼统·归属待确认）" : `节级反思单·${SEC_TITLE[sec]}`,
        sections: generic ? null : { chapter: CH_OF_SEC[sec][0], ids: [sec], units: CH_OF_SEC[sec].slice(1) },
        eventType: "learning_reflection", kind: "reflection", family: fam,
        content: [], riders: [{ metric: "reflect_express", possible: 4 }, { metric: "self_efficacy", possible: 4 }],
        nodes: [], hh: lastSecond ? 23 : 20, mm: lastSecond ? 55 : 0,
        note: generic ? "边界样例：未指明章节的笼统反思，保留 unmapped，不猜测归属" : (lastSecond ? "边界样例：当日 23:55 提交" : null) }));
      if (!generic) reflCount++; // 笼统反思不占用 12 节轮转名额
    }
  });

  // —— 课堂观察（轮转抽样，保证每生九月 ≥2 次；六月复习课 1 次） ——
  const rosterIdx = new Map(roster.map((s, i) => [s.student_id, i]));
  const models = roster.map((s, i) => buildModel(cls.id, s, i));
  const observe = (date, id, name, type, offset, n) => {
    for (let k = 0; k < n; k++) {
      const idx = (offset + k * 3) % roster.length; // 步长 3 打散，45 人与 12 人抽样互质覆盖
      const stu = roster[idx]; const model = models[idx];
      if (skipSpecial(stu, date)) continue;
      const isGroup = type === "group_task";
      const riders = [];
      const content = [];
      const spec = SPEC_LESSON[id] || null;
      if (spec) {
        // 规格课次：指标与节点由课次定义（复习课/数据课），覆盖默认图像口径
        spec.mets.forEach(([m, rub], j) => content.push({ metric: m, possible: 4, rubric: rub || QA }));
        if (isGroup) content.push({ metric: "cooperation", possible: 4, rubric: "group-task-v1" }, { metric: "thinking_perspective", possible: 4, rubric: "thinking-v1" });
        else {
          content.push({ metric: k % 3 === 0 ? "class_participation" : "listening_speaking", possible: 4, rubric: k % 3 === 0 ? "participation-v1" : "listening-v1" });
          if (k % 4 === 1) content.push({ metric: "thinking_perspective", possible: 4, rubric: "thinking-v1" });
        }
        events.push(makeEvent(ctx, stu, model, { date, sourceType: "classroom", sourceId: id, sourceName: name,
          eventType: isGroup ? "group_task" : "oral_explanation", kind: spec.kind || "qa",
          content, riders, nodes: spec.nodes.map(([n, pp]) => ({ node: n, possible: pp })),
          hh: 10 + (k % 2), slot: k, note: spec.note || null }));
        continue;
      }
      if (isGroup) {
        content.push({ metric: "cooperation", possible: 4, rubric: "group-task-v1" }, { metric: "thinking_perspective", possible: 4, rubric: "thinking-v1" });
        if (k % 2 === 0) content.push({ metric: "class_participation", possible: 4, rubric: "participation-v1" });
      } else {
        content.push({ metric: k % 3 === 0 ? "class_participation" : "listening_speaking", possible: 4, rubric: k % 3 === 0 ? "participation-v1" : "listening-v1" });
        if (date >= "2026-09-08") content.push({ metric: "image_interpretation", possible: 4, rubric: "oral-expression-v1" });
        if (date >= "2026-09-12") content.push({ metric: "representation_transfer", possible: 4, rubric: "oral-expression-v1" });
        if (k % 4 === 1) content.push({ metric: "thinking_perspective", possible: 4, rubric: "thinking-v1" });
      }
      events.push(makeEvent(ctx, stu, model, { date, sourceType: "classroom", sourceId: id, sourceName: name,
        eventType: isGroup ? "group_task" : "oral_explanation", kind: isGroup ? "group" : "oral",
        content, riders, nodes: date >= "2026-09-08" && !isGroup ? [{ node: "kp-function-image", possible: 4 }] : [],
        hh: 10 + (k % 2), slot: k }));
    }
  };
  const lessonId = (raw) => `lesson-${cls.token}-${raw.slice(-4)}`;
  const SPEC_LESSON = {};
  for (const L of CAL.septLessons) if (L.spec) SPEC_LESSON[lessonId(L.id)] = L.spec;
  observe(CAL.juneLesson.date, lessonId(CAL.juneLesson.id), CAL.juneLesson.name, "oral_explanation", 3, 15);
  CAL.septLessons.forEach((L, i) => observe(L.date, lessonId(L.id), `${L.name}`, L.type, i * 7, L.n || 12));

  // —— 滚动日程（09-23 起，随 DEMO_AS_OF 推进；历史 ID/日期稳定，清单 §2.2「D+7 重新生成」） ——
  // 设计：任何连续 7 天（含 5 个工作日）内，12 节全部被滚动复习单+打卡+晨间口述覆盖
  const NODE1 = { "demo-sec-radical-01": "kp-radical", "demo-sec-radical-02": "kp-radical-muldvd", "demo-sec-radical-03": "kp-radical-addsub",
    "demo-sec-pythagoras-01": "kp-pythagoras", "demo-sec-pythagoras-02": "kp-pythagoras-inverse", "demo-sec-quad-01": "kp-parallelogram", "demo-sec-quad-02": "kp-special-quad",
    "demo-sec-function-01": "kp-function", "demo-sec-function-02": "kp-function-image", "demo-sec-function-03": "kp-function-application",
    "demo-sec-data-01": "kp-data-central-tendency", "demo-sec-data-02": "kp-data-dispersion" };
  const ROLL_LESSON = {
    1: { name: "数据的集中趋势·练习课", type: "oral_explanation", spec: { mets: [["memorize_understand", "qa-4pt-v1"], ["problem_analysis", "qa-4pt-v1"]], nodes: [["kp-data-central-tendency", 4]], kind: "concept" } },
    2: { name: "数据的离散程度·新授（方差）", type: "oral_explanation", spec: { mets: [["problem_analysis", "qa-4pt-v1"]], nodes: [["kp-data-dispersion", 4]], kind: "qa" } },
    3: { name: "滚动复习·讲评课", type: "oral_explanation", spec: { mets: [["operation_reasoning", "qa-4pt-v1"], ["problem_analysis", "qa-4pt-v1"]], nodes: [["kp-radical-addsub", 4], ["kp-pythagoras", 4], ["kp-function-image", 4]], kind: "qa" } },
    4: { name: "综合练习课（函数与根式）", type: "oral_explanation", spec: { mets: [["operation_reasoning", "qa-4pt-v1"], ["image_interpretation", "oral-expression-v1"]], nodes: [["kp-radical-addsub", 4], ["kp-function-image", 4]], kind: "qa" } },
    5: { name: "数据练习与小组互评", type: "group_task", spec: { mets: [["problem_analysis", "qa-4pt-v1"]], nodes: [["kp-data-central-tendency", 4], ["kp-data-dispersion", 4]], kind: "qa" } },
  };
  const ROLL_METS = ["memorize_understand", "operation_reasoning", "problem_analysis", "transfer_apply"];
  let dayIdx = 0;
  let reflRoll = 0; // 滚动周一反思轮转计数（前 12 份覆盖 12 节）
  for (let t = new Date("2026-09-23T00:00:00Z"); ;) {
    const ds = t.toISOString().slice(0, 10);
    if (ds > AS_OF) break;
    const wd = t.getUTCDay();
    if (wd === 0 || wd === 6) {
      roster.forEach((stu, ri) => {
        if ((hash(`${cls.id}|${stu.student_id}|${ds}`) % 10) !== 0) return;
        if (skipSpecial(stu, ds)) return;
        const sec = SEC_POOL[hash(ds + cls.id) % 12];
        events.push(makeEvent(ctx, stu, models[ri], { date: ds, sourceType: "practice", sourceId: `practice-roll-we-${ds.replace(/-/g, "")}`, sourceName: "周末自主复习（轮转节错题）",
          content: [{ metric: ROLL_METS[dayIdx % 4], possible: 8 }], riders: [{ metric: "learning_motivation", possible: 4 }, { metric: "learning_interest", possible: 4 }],
          nodes: [{ node: NODE1[sec], possible: 8 }], kind: "qa", durationSeconds: 600 + (hash(ds + ri) % 900), hh: 10, slot: 9 }));
      });
    } else {
      // ① 当日课程（数据章教学 + 滚动讲评）
      const tpl = ROLL_LESSON[wd];
      const rid = `lesson-roll-${ds.replace(/-/g, "")}`;
      const off = hash(cls.id + ds) % roster.length;
      for (let k = 0; k < 12; k++) {
        const idx2 = (off + k * 3) % roster.length;
        const stu = roster[idx2];
        if (skipSpecial(stu, ds)) continue;
        const isG = tpl.type === "group_task";
        const content = tpl.spec.mets.map(([m, rub]) => ({ metric: m, possible: 4, rubric: rub || QA }));
        if (isG) content.push({ metric: "cooperation", possible: 4, rubric: "group-task-v1" }, { metric: "thinking_perspective", possible: 4, rubric: "thinking-v1" });
        else {
          content.push({ metric: k % 3 === 0 ? "class_participation" : "listening_speaking", possible: 4, rubric: k % 3 === 0 ? "participation-v1" : "listening-v1" });
          if (k % 4 === 1) content.push({ metric: "thinking_perspective", possible: 4, rubric: "thinking-v1" });
        }
        events.push(makeEvent(ctx, stu, models[idx2], { date: ds, sourceType: "classroom", sourceId: rid, sourceName: tpl.name,
          eventType: isG ? "group_task" : "oral_explanation", kind: tpl.spec.kind || "qa",
          content, riders: [], nodes: tpl.spec.nodes.map(([n, pp]) => ({ node: n, possible: pp })), hh: 10 + (k % 2), slot: k }));
      }
      // ② 滚动复习单：每日 3 节轮转（12 节 / 4 个工作日一轮，任意 7 天窗内全覆盖）
      const base = (dayIdx * 3) % 12;
      const secs = [SEC_POOL[base], SEC_POOL[(base + 1) % 12], SEC_POOL[(base + 2) % 12]];
      const met = ROLL_METS[dayIdx % 4];
      roster.forEach((stu, ri) => {
        if (skipSpecial(stu, ds)) return;
        events.push(makeEvent(ctx, stu, models[ri], { date: ds, sourceType: "homework", sourceId: `hw-roll-${ds.replace(/-/g, "")}`, sourceName: `滚动复习单（${secs.map((x) => SEC_TITLE[x]).join("·")}）`,
          content: [{ metric: met, possible: 8 }],
          riders: [{ metric: "homework_process", possible: 4 }, { metric: "learning_attitude", possible: 4 }, { metric: "learning_interest", possible: 4 }],
          nodes: secs.map((x) => ({ node: NODE1[x], possible: 4 })), submittedAt: `${ds}T20:30:00+08:00`, hh: 20, slot: 10 }));
        if ((hash(`${stu.student_id}|${ds}`) % 10) < 3) { // 自主复习打卡（约30%，素养观察）
          events.push(makeEvent(ctx, stu, models[ri], { date: ds, sourceType: "practice", sourceId: `practice-roll-check-${ds.replace(/-/g, "")}`, sourceName: "自主复习打卡（当日复习单配套）",
            content: [{ metric: ROLL_METS[(dayIdx + 2) % 4], possible: 6 }], riders: [{ metric: "learning_motivation", possible: 4 }, { metric: "learning_interest", possible: 4 }],
            nodes: secs.map((x) => ({ node: NODE1[x], possible: 2 })), kind: "qa", durationSeconds: 300 + (hash(ds + ri) % 600), hh: 21, slot: 11 }));
        }
        if (wd === 3 && (hash(`${stu.student_id}|corr|${ds}`) % 10) < 6) { // 周三订正单
          events.push(makeEvent(ctx, stu, models[ri], { date: ds, sourceType: "homework", sourceId: `corr-roll-${ds.replace(/-/g, "")}-${stu.display_id}`, sourceName: "滚动复习订正单",
            eventType: "correction", kind: "correction", content: [],
            riders: [{ metric: "homework_correction", possible: 4 }, { metric: "effort_level", possible: 4 }],
            nodes: secs.map((x) => ({ node: NODE1[x], possible: 4 })), durationSeconds: 420 + (hash(ds + ri) % 1200), hh: 19, slot: 12 }));
        }
      });
      // ③ 晨间口述轮转（12 人，过程观察，节随复习单轮转）
      for (let k = 0; k < 12; k++) {
        const idx2 = (off + 4 + k * 3) % roster.length;
        const stu = roster[idx2];
        if (skipSpecial(stu, ds)) continue;
        events.push(makeEvent(ctx, stu, models[idx2], { date: ds, sourceType: "classroom", sourceId: `lesson-roll-am-${ds.replace(/-/g, "")}`, sourceName: "晨间三分钟口述（复习单轮转节）",
          eventType: "oral_explanation", kind: "qa",
          content: [{ metric: k % 3 === 0 ? "class_participation" : "listening_speaking", possible: 4, rubric: k % 3 === 0 ? "participation-v1" : "listening-v1" },
            ...(k % 4 === 1 ? [{ metric: "thinking_perspective", possible: 4, rubric: "thinking-v1" }] : [])],
          riders: [], nodes: secs.map((x) => ({ node: NODE1[x], possible: 4 })), hh: 8, mm: 20, slot: 13 }));
      }
      // ④ 周一节级反思（12 节轮转）
      if (wd === 1) roster.forEach((stu, ri) => {
        if (((ri * 3 + clsOrder) % 10) >= 3 || skipSpecial(stu, ds)) return;
        const sec = SEC_POOL[(reflRoll++) % 12];
        events.push(makeEvent(ctx, stu, models[ri], { date: ds, sourceType: "practice", sourceId: `demo-reflection-${sec.replace("demo-sec-", "")}-${ds.replace(/-/g, "")}`,
          sourceName: `节级反思单·${SEC_TITLE[sec]}`, sections: { chapter: CH_OF_SEC[sec][0], ids: [sec], units: CH_OF_SEC[sec].slice(1) },
          eventType: "learning_reflection", kind: "reflection", family: SEC_FAMILY[sec],
          content: [], riders: [{ metric: "reflect_express", possible: 4 }, { metric: "self_efficacy", possible: 4 }], nodes: [], hh: 20, slot: 14 }));
      });
    }
    if (wd !== 0 && wd !== 6) dayIdx++; // 轮转只按工作日推进（周末不占轮转位）
    t.setUTCDate(t.getUTCDate() + 1);
  }

  // —— 边界样例：未来日期事件（不进统计，保留原因） ——
  if (cls.id === "cls-g8-03") {
    const fut = new Date(AS_OF + "T00:00:00Z"); fut.setDate(fut.getDate() + 1);
    const fs = fut.toISOString().slice(0, 10);
    events.push({ ...makeEvent(ctx, roster[12], models[12], { date: "2026-09-22", sourceType: "practice", sourceId: "future-entry-x", sourceName: "录入冲正样例", content: [], nodes: [], hh: 21 }),
      occurred_at: `${fs}T09:00:00+08:00`, valid: false, invalid_reason: "录入时间晚于演示基准日（边界样例：未来事件不进统计）" });
  }

  // —— 特殊无效记录（验收用） ——
  { // g8-01：课堂重复录入
    if (cls.id === "cls-g8-01") {
      const stu = roster[9]; const model = models[9];
      events.push(makeEvent(ctx, stu, model, { date: "2026-09-08", sourceType: "classroom", sourceId: `lesson-${cls.token}-0908`, sourceName: "一次函数图像·读图训练",
        eventType: "oral_explanation", kind: "oral", content: [{ metric: "class_participation", possible: 4, rubric: "participation-v1" }], nodes: [],
        valid: false, invalidReason: "重复录入：同课次同学生已有观察记录", slot: 99 }));
    }
    if (cls.id === "cls-g8-02") { // g8-02：AI 会话中断
      const stu = roster[17]; const model = models[17];
      events.push(makeEvent(ctx, stu, model, { date: "2026-09-14", sourceType: "ai_tutor", sourceId: `ai-${cls.token}-sep-${stu.display_id}-x`, sourceName: "AI 学伴·周练二错因讲解",
        content: [{ metric: "operation_reasoning", possible: 8 }], nodes: [], valid: false, invalidReason: "会话中断：仅完成 2/5 题，未形成有效观测",
        kind: "ai", durationSeconds: 260, slot: 99 }));
    }
  }

  // —— 排序 + 稳定编号（业务键哈希：source_id+student+节+指标+时刻，插入不漂移） ——
  events.sort((a, b) => (a.occurred_at < b.occurred_at ? -1 : a.occurred_at > b.occurred_at ? 1 : 0));
  const dupGuard = new Set();
  for (const ev of events) {
    const ymd = ev.occurred_at.slice(0, 10).replace(/-/g, "");
    const hhmm = ev.occurred_at.slice(11, 16);
    const sectionKey = (ev.section_ids || []).join("+") || "gen";
    const metricKeys = ev.measurements.map((m) => m.metric_key).join(",");
    const seed = `${ev.source_id}|${ev.student_id}|${sectionKey}|${metricKeys}`;
    let id = stableEvId(cls.token, ev.source_id, ev.student_id, sectionKey, metricKeys, hhmm);
    while (dupGuard.has(id)) id = stableEvId(cls.token, seed + "|x", ev.student_id, sectionKey, metricKeys, hhmm);
    dupGuard.add(id);
    ev.evidence_id = id;
    ev.measurements.forEach((m) => (m.measurement_id = stableMid(cls.token, seed + hhmm, m.metric_key)));
    ev.task_id = ev.task_id || ev.source_id;
    void ymd;
  }
  return { roster, events };
}

/* ---------- portrait-metric-rules.json ---------- */
function genRules() {
  const SRC = { hw: ["homework", "exam", "practice", "ai_tutor", "classroom"], oral: ["exam", "homework", "practice", "ai_tutor", "classroom"] }; // §4：课堂有实际数学产出时支持知识/能力指标
  const defOf = {
    func_concept: ["能判断具体情境中的函数关系并说出变量依赖", "func_concept"],
    coordinate_reading: ["能在平面直角坐标系中读点、判断位置与对称关系", "coordinate_reading"],
    function_image_reading: ["能从一次函数图像读出交点、截距等基本信息", "function_image_reading"],
    image_interpretation: ["能用“点—线—趋势”解释图像并落到实际意义（口头或书面）", "image_interpretation"],
    trend_judgment: ["能依据 k 的符号判断 y 随 x 的变化趋势并借助图像验证", "trend_judgment"],
    real_world_modeling: ["能从实际情境建立一次函数模型并求解、检验", "real_world_modeling"],
    memorize_understand: ["能再认再现概念、法则等基础事实", "memorize_understand"],
    representation_transfer: ["能在文字、表格、图像、解析式之间互译", "representation_transfer"],
    operation_reasoning: ["能按程序完成根式/分式等运算并说明算理", "operation_reasoning"],
    problem_analysis: ["能辨析结构、选择恰当定理或方法切入问题", "problem_analysis"],
    transfer_apply: ["能将已学模型迁移到新情境并完成求解", "transfer_apply"],
    reflect_express: ["能对错误归因并以书面/口头表达改进措施", "reflect_express"],
  };
  const metrics = [];
  for (const [dim, keys] of Object.entries(DIMS)) {
    for (const key of keys) {
      const isK = dim === "knowledge" || dim === "ability";
      const common = { key, name: METRIC_NAME[key], dimension_key: dim };
      if (isK) {
        const oralOk = key === "image_interpretation" || key === "representation_transfer";
        metrics.push({ ...common,
          definition: `${defOf[key][0]}。口径：个人读数 = 100×SUM(earned)/SUM(possible)，分母为量表分（题次数×每题分），样本量为去重事件数，二者不可混称。`,
          allowed_source_types: oralOk ? SRC.oral : SRC.hw,
          rubric_ids: oralOk ? [QA, "oral-expression-v1"] : [QA],
          related_knowledge_ids: NODE_OF[key] || [], related_goal_ids: GOAL_OF[key] || [],
          min_sample_count: 3, stale_after_days: 30,
        });
      } else if (dim === "literacy") {
        const allow = { learning_attitude: ["homework"], learning_interest: ["practice", "homework"], learning_motivation: ["practice"],
          effort_level: ["homework"], self_efficacy: ["practice"], value_formation: [] }[key];
        const def = {
          learning_attitude: "以提交行为观察学习态度：按时率、完整度、自查习惯；不从答题正误推断。",
          learning_interest: "以挑战题选做、拓展参与等自选行为观察兴趣；缺选做机会时缺测。",
          learning_motivation: "以自主练习启动、完成与复盘等自我导向行为观察动机；不从正确率推断。",
          effort_level: "以订正投入（是否订正、错因说明、复测）观察努力程度。",
          self_efficacy: "仅在学习反思单中以自评量表采集；无反思单则缺测。",
          value_formation: "拟通过小组互评（诚信/助人）采集，当前无已接入来源，全员缺测（见覆盖说明）。",
        }[key];
        metrics.push({ ...common, definition: def + " 口径：读数=100×SUM(earned)/SUM(possible)；样本量为去重事件数。",
          allowed_source_types: allow, rubric_ids: DEFAULT_RUBRIC[key] ? [DEFAULT_RUBRIC[key]] : [],
          related_knowledge_ids: [], related_goal_ids: GOAL_OF[key] || [],
          min_sample_count: 2, stale_after_days: 45,
          ...(key === "value_formation" ? { note: "无 allowed 来源：所有窗口均返回 null，不自动推断。" } : {}) });
      } else {
        const allow = { class_participation: ["classroom"], listening_speaking: ["classroom"], cooperation: ["classroom"], thinking_perspective: ["classroom"],
          homework_process: ["homework"], homework_correction: ["homework"] }[key];
        const def = {
          class_participation: "以课堂互动（抢答、投票、演示、讨论）观察参与度。",
          listening_speaking: "以倾听完整度与主动发言质量观察。",
          cooperation: "以小组任务中的分工完成与协作贡献观察。",
          thinking_perspective: "以一题多解、解法比较等行为观察思维广度。",
          homework_process: "以提交及时性与完整性观察作业完成过程。",
          homework_correction: "以订正质量（重做、错因、复测）观察订正过程；原始时长与次数保留在事件可选字段。",
        }[key];
        metrics.push({ ...common, definition: def + " 口径：读数=100×SUM(earned)/SUM(possible)；样本量为去重事件数。",
          allowed_source_types: allow, rubric_ids: [DEFAULT_RUBRIC[key]],
          related_knowledge_ids: [], related_goal_ids: GOAL_OF[key] || [],
          min_sample_count: 2, stale_after_days: 21 });
      }
    }
  }
  // 规则修正（清单 §1.1）：reflect_express 由反思单量表计分，不与答题量表混用；修复历史 45 条被拒测量
  const RULE_FIX = {
    reflect_express: {
      allowed_source_types: ["practice", "homework", "exam", "ai_tutor"],
      rubric_ids: ["reflection-v1", "qa-4pt-v1"],
      definition_append: "本指标由学习反思单（书面/口头）采集，使用反思量表计分；不得用答题对错替代。",
    },
  };
  const fixedMetrics = metrics.map((m) => (RULE_FIX[m.key]
    ? { ...m, allowed_source_types: RULE_FIX[m.key].allowed_source_types, rubric_ids: RULE_FIX[m.key].rubric_ids,
        definition: `${m.definition} ${RULE_FIX[m.key].definition_append}` }
    : m));
  return {
    schema_version: "portrait-metric-rules-v2", timezone: "Asia/Shanghai", generated_as_of: AS_OF,
    sample_caliber_note: "事件数（去重 evidence_id 计 1）、题次数（题目数量）、量表分母（SUM(possible)）是三个不同口径；指标 sample_count 一律指事件数。",
    threshold_note: "min_sample_count / stale_after_days 为演示质量门槛（如各节各窗口≥3条证据用于成图演示），不是科学评价阈值，待业务与教研确认；不构成已验证的教育评价标准。",
    metrics: fixedMetrics, rubrics: Object.entries(RUBRICS).map(([rubric_id, v]) => ({ rubric_id, name: v.name, possible: v.possible,
      levels: v.levels.map(([earned, desc]) => ({ earned, description: desc })) })),
  };
}

/* ---------- portrait-data-coverage.json ---------- */
function genCoverage(perClass) {
  const source_coverage = [];
  const missing_intervals = [];
  const missing_metrics = [];
  for (const { cls, events, roster } of perClass) {
    for (const src of ["homework", "exam", "classroom", "ai_tutor", "practice"]) {
      const evs = events.filter((e) => e.source_type === src);
      const valid = evs.filter((e) => e.valid);
      const dates = valid.map((e) => e.occurred_at.slice(0, 10)).sort();
      source_coverage.push({ class_id: cls.id, source_type: src,
        n_events: evs.length, n_valid: valid.length,
        earliest_date: dates[0] || null, latest_date: dates[dates.length - 1] || null,
        n_students: new Set(valid.map((e) => e.student_id)).size });
    }
    missing_intervals.push({ class_id: cls.id, source_type: "classroom", start_date: "2026-07-01", end_date: "2026-08-31", reason: "暑假：学校日历无课堂教学，属无活动而非未采集" });
    missing_intervals.push({ class_id: cls.id, source_type: "exam", start_date: "2026-07-01", end_date: "2026-09-03", reason: "暑假及开学首周无正式测验" });
    missing_intervals.push({ class_id: cls.id, source_type: "ai_tutor", start_date: "2026-09-01", end_date: "2026-09-12", reason: "开学前两周未布置 AI 学伴任务（部分学生 09-13 起有记录）" });
    // 结构性缺测指标
    missing_metrics.push({ class_id: cls.id, student_id: null, metric_key: "value_formation", reason: "无已接入证据来源（小组互评待设计），所有窗口均为 null" });
    const hasEff = new Set(events.filter((e) => e.valid && e.measurements.some((m) => m.metric_key === "self_efficacy")).map((e) => e.student_id));
    roster.filter((s) => !hasEff.has(s.student_id)).forEach((s) =>
      missing_metrics.push({ class_id: cls.id, student_id: s.student_id, metric_key: "self_efficacy", reason: "未提交学习反思单，自我效能缺测（不从正确率推断）" }));
  }
  // 特殊学生缺测
  missing_intervals.push({ class_id: "cls-g8-01", source_type: "all", start_date: "2026-06-20", end_date: "2026-09-06", reason: "转学生：09-07 转入本班，转入前无本校数据" });
  missing_intervals.push({ class_id: "cls-g8-02", source_type: "all", start_date: "2026-09-01", end_date: "2026-09-20", reason: "病假：九月全月缺勤，仅存六月期末与暑期少量记录" });
  const allStudents = perClass.flatMap(({ events }) => [...new Set(events.map((e) => e.student_id))]);
  // §2/§7：节×预设窗口×班×来源覆盖矩阵（知识覆盖人数 + 各维指标数 + 各来源事件数）
  const WINDOWS = [["7d", minusDaysIso(AS_OF, 6)], ["1m", minusMonthsIso(AS_OF, 1)], ["3m", minusMonthsIso(AS_OF, 3)]];
  const ALL_SECS = Object.keys(SEC_TITLE);
  const section_coverage = [];
  for (const { cls, events } of perClass) {
    for (const sec of ALL_SECS) {
      for (const [wk, wStart] of WINDOWS) {
        const inWin = events.filter((e) => e.valid && e.occurred_at.slice(0, 10) >= wStart && e.occurred_at.slice(0, 10) <= AS_OF && (e.section_ids || []).includes(sec));
        const bySource = {}; inWin.forEach((e) => (bySource[e.source_type] = (bySource[e.source_type] || 0) + 1));
        const knowledge_students = new Set(inWin.filter((e) => (e.knowledge_results || []).length).map((e) => e.student_id)).size;
        const dimMetrics = { ability: new Set(), literacy: new Set(), process: new Set() };
        inWin.forEach((e) => e.measurements.forEach((m) => { const d = METRIC_DIM[m.metric_key]; if (dimMetrics[d]) dimMetrics[d].add(m.metric_key); }));
        section_coverage.push({ class_id: cls.id, section_id: sec, window: wk,
          n_events: inWin.length, knowledge_students, n_students: new Set(inWin.map((e) => e.student_id)).size,
          metrics: { ability: dimMetrics.ability.size, literacy: dimMetrics.literacy.size, process: dimMetrics.process.size },
          by_source: bySource });
      }
    }
  }
  const real_max_event_date = {};
  perClass.forEach(({ cls, events }) => {
    real_max_event_date[cls.id] = events.filter((e) => e.valid).reduce((m, e) => (e.occurred_at.slice(0, 10) > m ? e.occurred_at.slice(0, 10) : m), "0000-00-00");
  });
  const demo_students = {
    "cls-g8-01": ["6738633173303030", "6738633173303037", "6738633173303035"],
    "cls-g8-02": ["6738633273303036", "6738633273303032", "6738633273303038"],
    "cls-g8-03": ["947bb83daabc33cf", "358f22c0c0bb9d3a", "aa18e927903a0918"],
  };
  return {
    schema_version: "portrait-coverage-v2", demo_as_of: AS_OF, timezone: "Asia/Shanghai",
    aggregation_version: "portrait-v2",
    real_max_event_date, demo_students,
    demo_students_note: "每班 3 名正常完整演示学生（覆盖各节与三个预设窗口）；个人页默认学生不得取边界样例。",
    boundary_samples: [
      { type: "缺勤", class_id: "cls-g8-02", student_id: "（见 class-students-cls-g8-02.json 第31人）", reason: "九月病假全月缺勤：所有节/窗口无数据，合法空态" },
      { type: "转入", class_id: "cls-g8-01", student_id: "（名册末位）", reason: "09-07 转入：此前无本校数据" },
      { type: "单测缺考", class_id: "cls-g8-03", reason: "09-15 单元测缺考：该 exam 事件 valid=false" },
      { type: "未来事件", class_id: "cls-g8-03", reason: "1 条 occurred_at 晚于基准日的冲正样例：valid=false 不进统计" },
      { type: "笼统反思", class_id: "cls-g8-03", reason: "1 条未指明章节的反思单：保留 unmapped，不猜归属" },
      { type: "零点/末秒提交", reason: "g8-02 前测 00:05、g8-01 反思 23:55 各 1 条边界时间样例" },
      { type: "周末无课堂", reason: "周六日仅自主练习；课堂/考试来源在周末窗口为合理空态" },
      { type: "对照教材无数据", reason: "demo-math-g8-vol1-alt-v1（北师大演示册）全部节无观测：跨教材空态" },
      { type: "来源不适用", reason: "value_formation 无允许来源：所有窗口 null（区别于 0 分）" },
    ],
    section_coverage,
    section_coverage_note: "节×(近7天/1月/3月)×班矩阵：knowledge_students 为该节该窗知识观测覆盖人数；metrics 为各维有效指标数；by_source 为各来源事件数。覆盖门槛见补齐清单 §2.1。",
    class_ids: CLASSES.map((c) => c.id), start_date: START, end_date: AS_OF,
    expected_students: 135, covered_students: allStudents.length,
    missing_students: [],
    missing_intervals, missing_metrics, source_coverage,
    aggregation_rules: [
      "【口径 portrait-v2，与当前画像页一致】筛选班级、日期、来源、valid=true 后按 evidence_id 去重，同 ID 冲突内容应报错",
      "个人指标读数 = 100×有效 earned 总和 / 有效 possible 总和（量表分母汇总，不是事件数），显示时才四舍五入",
      "个人维度读数 = 该维度有效记录的 earned/possible 汇总（能力/素养/过程取 measurements；知识维度只取 knowledge_results）",
      "班级读数 = 有证据学生的未舍入个人读数均值，最后再舍入；缺测学生不进分母（不是全班 earned/possible 混算）",
      "雷达成图门槛：≥3 个有效轴才画图；1～2 轴仍返回得分/分布/证据，不得当零分或无数据",
      "知识节点/分布/子图读数使用 knowledge_results；仅 measurements 中的知识类指标不形成节点得分",
      "sample_count 按 evidence_id 去重；跨节聚合、来源合并、重传不重复计数",
      "class_avg 必须取相同日期/来源/规则下班级值；同口径解释/颜色/建议一致且可追溯 ≥1 条有效证据",
      "合法 0 分、未知/未采集、量规未审、证据冲突分别保留，不相互替代；部分日期未采集 ≠ 当天零活动",
    ],
    notes: [
      "暑假（07-04~08-31）与周末无课堂/考试活动，属学校日历无活动，非数据缺失。",
      "课堂观察为轮转抽样（每次课约 12-14 人），不是每生每课都有记录；个人过程指标在窗口内可能低样本。",
      "三班教学叙事：3 班图像解释 09-11 周练二触底、09-12 起三步表达支架试行、09-16 起回升；2 班运算 09-10 起三步自查单回升；对应事件日期可查。",
      "演示日期推进时应补充新记录并更新本文件，不得整体平移旧证据日期或沿用旧考试名称。",
    ],
  };
}

/* ---------- main ---------- */
function main() {
  console.log("生成画像观测记录 →", DATA);
  const perClass = [];
  for (const cls of CLASSES) {
    const { roster, events } = genClassEvents(cls);
    const nInvalid = events.filter((e) => !e.valid).length;
    writeJson(`portrait-observations-${cls.id}.json`, {
      schema_version: "portrait-observations-v1", class_id: cls.id, timezone: "Asia/Shanghai",
      coverage: { start_date: START, end_date: AS_OF, complete: true }, events,
    });
    perClass.push({ cls, events, roster });
    console.log(`  ${cls.id}: ${events.length} 条观测（无效 ${nInvalid}），学生 ${new Set(events.map((e) => e.student_id)).size}/45，${cls.story}`);
  }
  writeJson("portrait-metric-rules.json", genRules());
  writeJson("portrait-data-coverage.json", genCoverage(perClass));
  console.log("完成：确定性输出，重跑结果一致；未改动任何既有文件。");
}
const writeJson = (name, obj) => {
  fs.writeFileSync(path.join(DATA, name), JSON.stringify(obj, null, 1) + "\n", "utf-8");
  console.log("  +", name, `(${Math.round(fs.statSync(path.join(DATA, name)).size / 1024)} KB)`);
};
main();
