#!/usr/bin/env node
/**
 * 教师端画像与校本教研 mock 数据生成器（开发辅助，非系统功能）。
 * 依据 docs/教师端画像与校本教研Mock数据清单-2026-09-20.md 生成：
 *   profile-dimensions-class-<class_id>.json     班级四维画像（知识点/能力/素养/过程表现）
 *   profile-dimensions-student-<class_id>.json   学生四维画像集合（带班均对照、百分位）
 *   profile-explanations-<class_id>.json         解释性提示（维度/雷达项/图谱节点/推荐 + 证据摘要）
 *   knowledge-graph-filtered-<class_id>.json     带筛选字段的知识图谱（节点/边/筛选项枚举）
 *   research-topics.json                         校本教研议题列表
 *   research-topic-detail-<topic_id>.json        议题详情（回复 + 共识策略）
 * 数据特征：
 *   - 确定性伪随机：同一输入永远生成同一份 JSON，便于回归与演示。
 *   - 三班差异化叙事：1 班整体较好；2 班计算类薄弱；3 班一次函数图像解释薄弱簇。
 *   - 数值与解释一致：解释文本中的正确率/次数均由同一份生成数值推导。
 *   - 学生 ID/姓名/display_id 取自既有 class-students-*.json，与画像/作业 mock 打通。
 * 用法：node scripts/gen-portrait-research-mock.js
 */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "mock", "teacher", "data");
const SNAPSHOT_DATE = "2026-09-18";
const NOW = `${SNAPSHOT_DATE} 18:30`;
const TIME_WINDOW = { preset: "month", start_date: "2026-08-18", end_date: SNAPSHOT_DATE };
const N_STUDENTS_SAMPLED = 10; // 清单要求每班 8-12

/* ---------- 确定性工具 ---------- */
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seedKey) {
  let a = hash(String(seedKey));
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const jit = (r, span) => Math.round((r() * 2 - 1) * span);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const mean = (xs) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
/** 正态百分位近似（logistic 近似 Φ），用于班内百分位 */
const pctOf = (score, mu, sd) => Math.round(clamp(100 * (1 - 1 / (1 + Math.exp(1.702 * (score - mu) / sd))), 1, 99));
const pad = (n) => String(n).padStart(2, "0");
/** 窗口内某天的时刻字符串：dayMin~dayMax 为距 2026-08-18 的天数 */
function dayIn(r, dayMin = 2, dayMax = 30) {
  const t = new Date(2026, 7, 18);
  t.setDate(t.getDate() + dayMin + Math.round(r() * (dayMax - dayMin)));
  const hh = pad(8 + Math.floor(r() * 11));
  const mm = pad(Math.floor(r() * 6) * 10);
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${hh}:${mm}`;
}
const writeJson = (name, obj) => {
  fs.writeFileSync(path.join(DATA, name), JSON.stringify(obj, null, 1) + "\n", "utf-8");
  console.log("  +", name);
};

/* ---------- 班级与画像口径 ---------- */
const TEACHER = { teacher_id: "t-001", teacher_name: "演示教师" };
const CLASSES = [
  { class_id: "cls-g8-01", class_name: "八年级(1)班", feature: "整体较好：待巩固占比较低",
    sources: ["作业记录", "考试记录", "课堂互动", "人机交互", "自主练习"] },
  { class_id: "cls-g8-02", class_name: "八年级(2)班", feature: "中等水平：薄弱簇集中在计算类知识点",
    sources: ["作业记录", "考试记录", "课堂互动", "自主练习"] },
  { class_id: "cls-g8-03", class_name: "八年级(3)班", feature: "中等偏弱：存在明显薄弱簇（补弱主路径演示）",
    sources: ["作业记录", "考试记录", "课堂互动", "自主练习"] },
];

/** 四维画像雷达项定义（key 与清单 §4 对齐） */
const RADAR_DEFS = {
  knowledge: { dimension_name: "知识点画像", items: [
    { key: "func_concept", name: "函数概念理解", kps: ["kp-function"], goals: ["goal-1"] },
    { key: "coordinate_reading", name: "坐标系读图", kps: ["kp-coordinate"], goals: ["goal-2"] },
    { key: "function_image_reading", name: "图像识读", kps: ["kp-function-image"], goals: ["goal-2"] },
    { key: "image_interpretation", name: "图像解释", kps: ["kp-function-image", "kp-function-property"], goals: ["goal-2"] },
    { key: "trend_judgment", name: "变化趋势判断", kps: ["kp-function-property"], goals: ["goal-2"] },
    { key: "real_world_modeling", name: "实际问题建模", kps: ["kp-function-application"], goals: ["goal-5"] },
  ] },
  ability: { dimension_name: "能力画像", items: [
    { key: "memorize_understand", name: "识记理解", kps: ["kp-function", "kp-fraction-properties"], goals: ["goal-1"] },
    { key: "representation_transfer", name: "表征转换", kps: ["kp-function-image", "kp-coordinate"], goals: ["goal-2"] },
    { key: "operation_reasoning", name: "运算推理", kps: ["kp-radical-addsub", "kp-fraction-calc"], goals: ["goal-3"] },
    { key: "problem_analysis", name: "问题分析", kps: ["kp-congruent-judge", "kp-special-quad"], goals: ["goal-4"] },
    { key: "transfer_apply", name: "迁移应用", kps: ["kp-function-application"], goals: ["goal-5"] },
    { key: "reflect_express", name: "反思表达", kps: [], goals: ["goal-6"] },
  ] },
  literacy: { dimension_name: "素养画像", items: [
    { key: "learning_attitude", name: "学习态度", kps: [], goals: ["goal-6"] },
    { key: "learning_interest", name: "学习兴趣", kps: [], goals: [] },
    { key: "learning_motivation", name: "学习动机", kps: [], goals: [] },
    { key: "effort_level", name: "努力程度", kps: [], goals: ["goal-6"] },
    { key: "self_efficacy", name: "自我效能", kps: [], goals: [] },
    { key: "value_formation", name: "价值观养成", kps: [], goals: [] },
  ] },
  process: { dimension_name: "学习过程表现画像", items: [
    { key: "class_participation", name: "课堂参与", kps: [], goals: [] },
    { key: "listening_speaking", name: "倾听与发言", kps: [], goals: [] },
    { key: "cooperation", name: "合作表现", kps: [], goals: [] },
    { key: "thinking_perspective", name: "思维角度", kps: [], goals: ["goal-4"] },
    { key: "homework_process", name: "作业完成过程", kps: [], goals: ["goal-6"] },
    { key: "homework_correction", name: "订正过程", kps: [], goals: ["goal-6"] },
  ] },
};
const DIM_KEYS = Object.keys(RADAR_DEFS);

/** 三班 24 项锚定值（班级口径的"班均"）——差异化叙事的核心表 */
const ANCHORS = {
  "cls-g8-01": {
    knowledge: { func_concept: 84, coordinate_reading: 83, function_image_reading: 82, image_interpretation: 80, trend_judgment: 82, real_world_modeling: 72 },
    ability: { memorize_understand: 83, representation_transfer: 80, operation_reasoning: 82, problem_analysis: 79, transfer_apply: 74, reflect_express: 78 },
    literacy: { learning_attitude: 84, learning_interest: 85, learning_motivation: 82, effort_level: 83, self_efficacy: 80, value_formation: 86 },
    process: { class_participation: 82, listening_speaking: 81, cooperation: 80, thinking_perspective: 78, homework_process: 84, homework_correction: 79 },
  },
  "cls-g8-02": {
    knowledge: { func_concept: 78, coordinate_reading: 76, function_image_reading: 75, image_interpretation: 74, trend_judgment: 75, real_world_modeling: 68 },
    ability: { memorize_understand: 78, representation_transfer: 74, operation_reasoning: 60, problem_analysis: 72, transfer_apply: 68, reflect_express: 71 },
    literacy: { learning_attitude: 78, learning_interest: 76, learning_motivation: 74, effort_level: 77, self_efficacy: 72, value_formation: 79 },
    process: { class_participation: 75, listening_speaking: 73, cooperation: 74, thinking_perspective: 71, homework_process: 76, homework_correction: 68 },
  },
  "cls-g8-03": {
    knowledge: { func_concept: 76, coordinate_reading: 64, function_image_reading: 62, image_interpretation: 56, trend_judgment: 66, real_world_modeling: 63 },
    ability: { memorize_understand: 74, representation_transfer: 59, operation_reasoning: 71, problem_analysis: 68, transfer_apply: 64, reflect_express: 66 },
    literacy: { learning_attitude: 75, learning_interest: 73, learning_motivation: 70, effort_level: 74, self_efficacy: 68, value_formation: 76 },
    process: { class_participation: 70, listening_speaking: 68, cooperation: 71, thinking_perspective: 66, homework_process: 69, homework_correction: 62 },
  },
};

/** 演示用学生人设：在确定性扰动之上叠加定向偏移，保证每个班有可讲的故事 */
const PERSONAS = {
  "6738633173303030": { label: "均衡偏优", dims: { knowledge: 7, ability: 6, literacy: 6, process: 7 } },          // 彭媛 g8-01
  "6738633173303037": { label: "会但不稳", dims: { knowledge: 4, ability: 3, literacy: -6, process: -13 } },       // 龙昊 g8-01：知识能力高、过程表现低
  "6738633273303032": { label: "运算薄弱", dims: { ability: -9 }, items: { operation_reasoning: -14 } },            // 龚巧莺 g8-02
  "6738633273303036": { label: "努力型", dims: { literacy: 9, process: 9 }, items: { operation_reasoning: -6 } },   // 谭敏 g8-02
  "947bb83daabc33cf": { label: "整体偏弱", dims: { knowledge: -9, ability: -8, literacy: -5, process: -8 }, items: { homework_correction: -8 } }, // 徐丽 g8-03
  "aa18e927903a0918": { label: "课堂沉默", dims: { process: -13 }, items: { class_participation: -8, listening_speaking: -9 } }, // 黄明静 g8-03：知识尚可、过程低
};

const GOALS = [
  { goal_id: "goal-1", name: "理解函数概念，能判断具体情境中的函数关系" },
  { goal_id: "goal-2", name: "能借助图像解释一次函数的变化趋势与实际意义" },
  { goal_id: "goal-3", name: "能准确完成整式、根式、分式的基础运算" },
  { goal_id: "goal-4", name: "能选择恰当的判定定理完成简单推理" },
  { goal_id: "goal-5", name: "能从实际情境中建立一次函数模型并求解" },
  { goal_id: "goal-6", name: "养成审题—作答—订正的完整学习习惯" },
];

/* ---------- 知识图谱节点/边定义（人教八年级目录） ---------- */
const NODE_DEFS = [
  { id: "kp-coordinate", name: "平面直角坐标系", chapter: "第6章 平面直角坐标系（七年级前置）", level: "L2", cluster: "function" },
  { id: "kp-congruent-judge", name: "三角形全等的判定", chapter: "第12章 全等三角形", level: "L4", cluster: "geo" },
  { id: "kp-axisymmetry", name: "轴对称", chapter: "第13章 轴对称", level: "L1", cluster: "geo", stale: true },
  { id: "kp-integral-multiply", name: "整式的乘法", chapter: "第14章 整式的乘法与因式分解", level: "L3", cluster: "calc" },
  { id: "kp-multiply-formulas", name: "乘法公式", chapter: "第14章 整式的乘法与因式分解", level: "L3", cluster: "calc" },
  { id: "kp-common-factor", name: "用提公因式法分解因式", chapter: "第14章 整式的乘法与因式分解", level: "L3", cluster: "calc" },
  { id: "kp-factorization", name: "因式分解", chapter: "第14章 整式的乘法与因式分解", level: "L4", cluster: "calc" },
  { id: "kp-fraction", name: "分式", chapter: "第15章 分式", level: "L3", cluster: "calc" },
  { id: "kp-fraction-properties", name: "分式及其基本性质", chapter: "第15章 分式", level: "L2", cluster: "calc" },
  { id: "kp-fraction-calc", name: "分式的加法与减法", chapter: "第15章 分式", level: "L3", cluster: "calc" },
  { id: "kp-radical", name: "二次根式", chapter: "第16章 二次根式", level: "L2", cluster: "calc" },
  { id: "kp-radical-muldvd", name: "二次根式的乘除", chapter: "第16章 二次根式", level: "L3", cluster: "calc" },
  { id: "kp-radical-addsub", name: "二次根式的加减", chapter: "第16章 二次根式", level: "L3", cluster: "calc" },
  { id: "kp-pythagoras", name: "勾股定理及其应用", chapter: "第17章 勾股定理", level: "L4", cluster: "geo" },
  { id: "kp-parallelogram", name: "平行四边形", chapter: "第18章 平行四边形", level: "L3", cluster: "geo" },
  { id: "kp-special-quad", name: "特殊的平行四边形", chapter: "第18章 平行四边形", level: "L4", cluster: "geo" },
  { id: "kp-function", name: "函数的概念", chapter: "第19章 一次函数", level: "L2", cluster: "function" },
  { id: "kp-function-image", name: "一次函数图像", chapter: "第19章 一次函数", level: "L2", cluster: "function" },
  { id: "kp-function-property", name: "一次函数的图象和性质", chapter: "第19章 一次函数", level: "L4", cluster: "function" },
  { id: "kp-function-application", name: "实际问题与一次函数", chapter: "第19章 一次函数", level: "L4", cluster: "function" },
];
const CLUSTER_PROFILE = {
  "cls-g8-01": { base: 80, delta: { function: -3, calc: 2, geo: 4 }, lowSample: ["kp-pythagoras"] },
  "cls-g8-02": { base: 73, delta: { function: -4, calc: -19, geo: 1 }, lowSample: ["kp-fraction"] },
  "cls-g8-03": { base: 71, delta: { function: -21, calc: -8, geo: -2 }, lowSample: ["kp-parallelogram"] },
};
const ABILITY_OF = { calc: ["operation_reasoning", "memorize_understand"], geo: ["problem_analysis", "representation_transfer"], function: ["representation_transfer", "transfer_apply"] };
const LITERACY_OF = { calc: ["effort_level"], geo: ["learning_interest"], function: ["learning_motivation"] };
const PROCESS_OF = { calc: ["homework_process", "homework_correction"], geo: ["class_participation"], function: ["thinking_perspective"] };
const GOAL_OF = { calc: ["goal-3"], geo: ["goal-4"], function: ["goal-2", "goal-5"] };

const EDGE_DEFS = [
  { s: "kp-coordinate", t: "kp-function", type: "prerequisite", exp: "坐标系读图是理解函数图像的前置知识。" },
  { s: "kp-function", t: "kp-function-image", type: "prerequisite", exp: "函数概念是认识一次函数图像的基础。" },
  { s: "kp-function-image", t: "kp-function-property", type: "prerequisite", exp: "先会读图，才能归纳一次函数的图象和性质。" },
  { s: "kp-function-property", t: "kp-function-application", type: "prerequisite", exp: "掌握图象和性质后，才能将其用于实际问题的分析与求解。" },
  { s: "kp-integral-multiply", t: "kp-multiply-formulas", type: "prerequisite", exp: "整式乘法是一般法则，乘法公式是其特殊情形。" },
  { s: "kp-multiply-formulas", t: "kp-common-factor", type: "prerequisite", exp: "乘法公式与提公因式法互为逆用方向，先乘后分。" },
  { s: "kp-common-factor", t: "kp-factorization", type: "prerequisite", exp: "提公因式法是因式分解的第一步，常与公式法连用。" },
  { s: "kp-fraction", t: "kp-fraction-properties", type: "prerequisite", exp: "分式的基本性质是分式变形与运算的依据。" },
  { s: "kp-fraction-properties", t: "kp-fraction-calc", type: "prerequisite", exp: "通分须以分式基本性质为依据，再进行加减运算。" },
  { s: "kp-radical", t: "kp-radical-muldvd", type: "prerequisite", exp: "二次根式的概念与性质是乘除运算的基础。" },
  { s: "kp-radical-muldvd", t: "kp-radical-addsub", type: "prerequisite", exp: "先化简（乘除）再合并（加减）是根式运算的常规路径。" },
  { s: "kp-congruent-judge", t: "kp-parallelogram", type: "prerequisite", exp: "全等三角形判定是证明平行四边形性质的主要工具。" },
  { s: "kp-parallelogram", t: "kp-special-quad", type: "prerequisite", exp: "矩形、菱形、正方形均以平行四边形为基类扩展。" },
  { s: "kp-multiply-formulas", t: "kp-factorization", type: "same_chapter", exp: "同属第14章：乘法公式正向展开、逆向分解，宜对照训练。" },
  { s: "kp-radical-muldvd", t: "kp-radical-addsub", type: "same_chapter", exp: "同属第16章：乘除与加减共用最简二次根式口径。" },
  { s: "kp-function-image", t: "kp-function-application", type: "same_chapter", exp: "同属第19章：建模结果最终要回到图像上解释。" },
  { s: "kp-radical-addsub", t: "kp-fraction-calc", type: "ability_related", exp: "两节点共同指向「运算推理」能力：化简—通分—合并的程序性步骤同构。" },
  { s: "kp-function-image", t: "kp-axisymmetry", type: "ability_related", exp: "两节点共同指向「表征转换」能力：图像的对称性与变换均需图形—符号互译。" },
  { s: "kp-function-application", t: "kp-pythagoras", type: "ability_related", exp: "两节点共同指向「迁移应用」能力：在真实情境中选模、建模并检验。" },
  { s: "kp-factorization", t: "kp-congruent-judge", type: "ability_related", exp: "两节点共同指向「问题分析」能力：都需要先辨结构、再选定理/方法。" },
];

/* ---------- 文本库：题干 / 作答摘要 / 指标口径 ---------- */
const STEMS = {
  func_concept: ["下列各情境中，y 是否为 x 的函数？请说明理由。", "判断：一台笔记本单价 4500 元，购买 x 台需付款 y 元，y 是 x 的函数吗？"],
  coordinate_reading: ["写出点 A(-2, 3) 所在的象限及它关于 x 轴对称的点的坐标。", "在给定的平面直角坐标系中描出点 B(0, -4)，并说明它在哪个坐标轴上。"],
  function_image_reading: ["读出图中两条直线的交点坐标，并判断直线 l₁ 与 x 轴交点的位置。", "根据图像写出该一次函数与坐标轴的交点坐标。"],
  image_interpretation: ["已知一次函数 y=2x-1 的图像，说明 y 随 x 增大如何变化，并解释其在行程情境中的含义。", "结合图像解释：为什么水箱注水问题中直线的斜率表示注水速度？"],
  trend_judgment: ["函数 y=-3x+6 中，y 随 x 的增大如何变化？请借助图像说明。", "比较 y=0.5x 与 y=-0.5x 图像的变化趋势有何不同。"],
  real_world_modeling: ["某出租车收费：起步价 8 元（3km 内），超出部分 2.4 元/km。写出车费 y 与里程 x 的函数关系式。", "根据手机套餐月费与流量的信息建立一次函数模型，并求 30GB 流量时的月费。"],
  memorize_understand: ["分式有意义时 x 的取值范围是？", "说出最简二次根式需满足的两个条件。"],
  representation_transfer: ["将直线 y=2x 向上平移 3 个单位后的解析式是？", "把表格中的对应值转换成图像，并写出函数解析式。"],
  operation_reasoning: ["计算：√18 + √8 - √50（先化简，再合并）。", "计算：a²b/(3c) × 6c²/(ab²) ÷ (a/b)。"],
  problem_analysis: ["要证 AC=DF，已知 AB=DE、∠B=∠E，还需添加什么条件？请说明选择的判定定理。", "在平行四边形 ABCD 中，对角线 AC、BD 交于 O，给出能判定其为矩形的条件并证明。"],
  transfer_apply: ["将行程问题中的相遇模型迁移到工程问题，列出函数关系式。", "用一次函数刻画弹簧长度随重物质量的变化，并预测量程外是否适用。"],
  reflect_express: ["请用 3 句话总结本次纠错中最主要的一类错误及应对办法。", "写出本次周练中你放弃的题目，并说明卡在哪一步。"],
  learning_attitude: ["（行为记录）近 30 天作业按时提交情况", "（行为记录）课堂学案带齐与笔记完成情况"],
  learning_interest: ["（行为记录）挑战题选做与课后提问情况", "（行为记录）拓展微课观看与收藏情况"],
  learning_motivation: ["（行为记录）自主练习启动次数与目标卡完成率", "（行为记录）连续学习天数与学习任务完成间隔"],
  effort_level: ["（行为记录）订正完成率与订正所用时长", "（行为记录）自主加练题量分布"],
  self_efficacy: ["（问卷+行为）单元反思中“我能学会”的自评与独立完成率", "（行为记录）难题停留时长与放弃率"],
  value_formation: ["（行为记录）小组互评中的诚信与助人表现", "（行为记录）反思中提及“用处/意义”的表达频次"],
  class_participation: ["（行为记录）课堂互动次数：抢答、投票、上台演示", "（行为记录）课堂学案当堂完成率"],
  listening_speaking: ["（行为记录）主动发言次数与复述他人观点次数", "（行为记录）小组讨论中的发言轮次"],
  cooperation: ["（行为记录）小组任务贡献记录：分工认领与成果占比", "（行为记录）组内互评等级"],
  thinking_perspective: ["（行为记录）一题多解提交次数与解法差异度", "（行为记录）课堂追问“还有别的方法吗”的频次"],
  homework_process: ["（行为记录）作业提交时间距布置时间的间隔", "（行为记录）作业中途退出重做次数（人机交互）"],
  homework_correction: ["（行为记录）作业订正次数与订正完成时长", "（行为记录）错因归类填写完整率"],
};
const WRONG_ANSWERS = {
  func_concept: "把“一对一”误当成函数的必要条件，认为多值对应也算函数",
  coordinate_reading: "关于 x 轴、y 轴对称的坐标变换规则记反",
  function_image_reading: "把直线与 y 轴交点当成与 x 轴交点读出",
  image_interpretation: "将截距误判为斜率，解释趋势时只说“变大”未指明 y 随 x",
  trend_judgment: "忽略 k 的符号与图像升降的对应关系",
  real_world_modeling: "未分段计费，把起步价也按 2.4 元/km 计算",
  memorize_understand: "遗漏“分母不为 0”这一前提",
  representation_transfer: "平移方向记反，向上平移误减 3",
  operation_reasoning: "化简后未化成最简二次根式就合并",
  problem_analysis: "混淆 SSA 与 SAS，误用 SSA 判定全等",
  transfer_apply: "直接套用相遇模型，未换算两队的工作效率",
  reflect_express: "只写“粗心”，未指明具体错误类型",
  class_participation: "整节课无主动互动记录",
  listening_speaking: "小组讨论中多为倾听，未形成有效发言",
  cooperation: "小组任务仅认领抄写类分工",
  thinking_perspective: "满足于单一解法，未尝试第二种思路",
  homework_process: "提交前未检查，空题直接提交",
  homework_correction: "订正只抄正确答案，未写错因",
};
/** 素养/过程项的量化口径：由读数 v 推出一组“可信”行为数字 */
const METRIC_OF = {
  learning_attitude: (v) => `近 30 天作业按时提交率 ${clamp(v + 6, 40, 99)}%，学案带齐率 ${clamp(v + 3, 40, 99)}%`,
  learning_interest: (v, r) => `挑战题参与率 ${clamp(v - 18, 10, 95)}%，课后主动提问 ${Math.max(0, Math.round((v - 55) / 6) + jit(r, 1))} 次`,
  learning_motivation: (v, r) => `自主练习启动 ${Math.max(1, Math.round(v / 8) + jit(r, 2))} 次，目标卡完成率 ${clamp(v - 5, 30, 96)}%`,
  effort_level: (v, r) => `订正完成率 ${clamp(v - 4, 30, 96)}%，平均订正时长 ${Math.max(0.4, (120 - v) / 60).toFixed(1)} 天`,
  self_efficacy: (v) => `单元反思自评均分 ${(v / 10).toFixed(1)}/10，难题独立完成率 ${clamp(v - 14, 15, 92)}%`,
  value_formation: (v, r) => `小组互评“诚信/助人”好评率 ${clamp(v - 6, 30, 96)}%，反思中主动谈及意义 ${Math.round(v / 25) + jit(r, 1)} 次`,
  class_participation: (v, r) => `近 30 天课堂互动 ${Math.max(0, Math.round((v - 50) / 3) + jit(r, 3))} 次（抢答/投票/演示）`,
  listening_speaking: (v, r) => `主动发言 ${Math.max(0, Math.round((v - 48) / 5) + jit(r, 2))} 次，复述他人观点 ${Math.max(0, Math.round((v - 50) / 8))} 次`,
  cooperation: (v) => `小组任务贡献占比 ${clamp(v - 10, 15, 95)}%，组内互评 ${v >= 75 ? "A 档" : v >= 60 ? "B 档" : "C 档"}`,
  thinking_perspective: (v, r) => `一题多解提交 ${Math.max(0, Math.round((v - 55) / 8) + jit(r, 1))} 次`,
  homework_process: (v, r) => `平均提交间隔 ${Math.max(0.2, (110 - v) / 40).toFixed(1)} 天，中途退出重做 ${Math.max(0, jit(r, 2))} 次`,
  homework_correction: (v) => `订正完成率 ${clamp(v + 4, 30, 97)}%，平均订正时长 ${Math.max(0.3, (125 - v) / 55).toFixed(1)} 天，错因归类完整率 ${clamp(v - 8, 25, 95)}%`,
};

/* ---------- 通用生成器 ---------- */
const bandOf = (m) => (m < 50 ? "待巩固" : m < 70 ? "练习中" : m < 85 ? "较熟练" : "已掌握");
const strengthOf = (n, stale) => (stale ? "stale" : n >= 15 ? "sufficient" : "low_sample");
const bandLabel = { sufficient: "样本充足", low_sample: "样本偏少", stale: "久未更新" };
const warnOf = (es) => (es === "low_sample" ? "low_sample" : es === "stale" ? "stale" : "none");

/** 雷达项（班级或学生通用）。clsAvg 为班均锚定值，学生时传入做对照 */
function radarItem(clsId, dim, def, value, clsAvg, sampleCount, strength, r, { isStudent } = { isStudent: false }) {
  const accRate = Math.round(value * (0.9 + r() * 0.12));
  let explanation;
  if (dim === "knowledge" || dim === "ability") {
    const stemQ = Math.max(2, Math.round(sampleCount / 4));
    const nWrong = Math.max(1, Math.round(stemQ * (100 - accRate) / 100));
    explanation = value < 65
      ? `近 30 天关联作答 ${stemQ} 条，正确率 ${clamp(accRate, 20, 70)}%，明显低于预期水平。`
      : value < 75
        ? `近 30 天关联作答 ${stemQ} 条，正确率 ${accRate}%，处于中等水平，其中 ${nWrong} 条失分。`
        : `近 30 天关联作答 ${stemQ} 条，正确率 ${clamp(accRate, 75, 98)}%，掌握较稳固。`;
    if (strength !== "sufficient") explanation += bandLabel[strength] === "样本偏少" ? "（当前样本偏少，读数仅供参考）" : "（该指标久未更新，请以近期测验为准）";
  } else {
    explanation = `${METRIC_OF[def.key] ? METRIC_OF[def.key](value, r) : ""}。`;
  }
  if (isStudent && clsAvg != null) {
    const gap = value - clsAvg;
    explanation += gap <= -8 ? ` 低于班均 ${Math.abs(gap)} 分，是本维度重点补弱项。` : gap >= 8 ? ` 高于班均 ${gap} 分，可作为优势项保持。` : ` 与班均（${clsAvg}）基本持平。`;
  }
  return {
    key: def.key, name: def.name, value, class_avg: isStudent ? clsAvg : null,
    max: 100, sample_count: sampleCount, evidence_strength: strength, explanation,
    related_knowledge_ids: def.kps, related_goal_ids: def.goals,
  };
}

/** 生成一个对象的四维 dimensions 数组（班级/学生共用）。clsAvgOf 返回班均（班级口径=锚定值，学生口径=班级画像实际值） */
function buildDimensions(clsId, scope, clsAvgOf, dimOffset, itemOffset, sampleScale, r) {
  return DIM_KEYS.map((dim) => {
    const def = RADAR_DEFS[dim];
    const items = def.items.map((it) => {
      const clsAvg = clsAvgOf(dim, it.key);
      const value = clamp(Math.round(clsAvg + (dimOffset[dim] || 0) * 0.7 + (itemOffset[it.key] || 0) * 0.9 + jit(r, 5)), 30, 98);
      const scBase = dim === "knowledge" || dim === "ability" ? 60 + jit(r, 30) : dim === "process" ? 34 + jit(r, 16) : 22 + jit(r, 12);
      const sampleCount = Math.max(3, Math.round(scBase * sampleScale));
      const strength = strengthOf(sampleCount, false);
      return radarItem(clsId, dim, it, value, clsAvg, sampleCount, strength, r, { isStudent: scope === "student" });
    });
    const score = mean(items.map((i) => i.value));
    const dimSamples = items.reduce((a, b) => a + b.sample_count, 0);
    return {
      dimension_key: dim, dimension_name: def.dimension_name, score,
      class_avg: null, // 学生口径由外层用班级画像实际分回填，保证与班级文件一致
      rank_pct: null, // 由外层填充（学生）
      sample_count: dimSamples,
      evidence_strength: strengthOf(dimSamples, false),
      explanation: "", suggestion: "", // 由外层按分数填充
      radar_items: items,
    };
  });
}

/* ---------- 1. 班级四维画像 ---------- */
function genClassProfile(cls) {
  const r = rng(`cls-profile-${cls.class_id}`);
  const dimensions = buildDimensions(cls.class_id, "class", (d, k) => ANCHORS[cls.class_id][d][k], {}, {}, 15, r).map((d) => {
    const low = d.radar_items.filter((i) => i.value < 70).sort((a, b) => a.value - b.value);
    d.explanation = d.score >= 78
      ? `${d.dimension_name}总体良好（${d.score} 分），各指标均处于较熟练区间，可维持现有教学节奏。`
      : low.length
        ? `${d.dimension_name}为 ${d.score} 分，其中「${low.map((i) => i.name).join("」「")}」低于 70，是本维度主要短板。`
        : `${d.dimension_name}为 ${d.score} 分，整体中等，无明显短板，个别指标接近临界。`;
    d.suggestion = d.dimension_key === "knowledge" && low.length
      ? `针对「${low[0].name}」，建议在下周作业中加入 2-3 道关联题，并配合图像—语言表达支架。`
      : d.dimension_key === "ability" && low.length
        ? `针对「${low[0].name}」，建议安排 10 分钟专项微练习，并要求写出关键步骤。`
        : d.dimension_key === "literacy"
          ? "在单元小结课增加 5 分钟自我反思环节，补充非智力因素的证据采集。"
          : "对订正环节实行“错因归类—重做—3 日后复测”的闭环跟踪。";
    return d;
  });
  return {
    scope: "class", ...TEACHER,
    class_id: cls.class_id, class_name: cls.class_name, grade: "g8", subject: "数学",
    snapshot_id: `snap-${SNAPSHOT_DATE.replace(/-/g, "")}-${cls.class_id}`,
    latest_snapshot_at: NOW, time_window: TIME_WINDOW, sources: cls.sources,
    dimensions,
    note: `班级四维画像（聚合口径）：${cls.feature}`,
  };
}

/* ---------- 2. 学生四维画像 ---------- */
function genStudentProfiles(cls, classProfile) {
  const all = JSON.parse(fs.readFileSync(path.join(DATA, `class-students-${cls.class_id}.json`), "utf-8"));
  const sampled = all.slice(0, N_STUDENTS_SAMPLED);
  // 班均对照直接取班级画像实际值，保证学生/班级两个文件口径一致
  const clsVals = new Map(classProfile.dimensions.flatMap((d) => d.radar_items.map((i) => [`${d.dimension_key}:${i.key}`, i.value])));
  const clsAvgOf = (dim, key) => clsVals.get(`${dim}:${key}`);
  const dimAvgOf = new Map(classProfile.dimensions.map((d) => [d.dimension_key, d.score]));
  const students = sampled.map((s) => {
    const r = rng(`stu-${s.student_id}`);
    const persona = PERSONAS[s.student_id] || null;
    const dimOffset = {}; const itemOffset = {};
    DIM_KEYS.forEach((d) => {
      dimOffset[d] = jit(r, 10) + (persona?.dims?.[d] || 0);
    });
    Object.entries(persona?.items || {}).forEach(([k, v]) => (itemOffset[k] = v));
    const dimensions = buildDimensions(cls.class_id, "student", clsAvgOf, dimOffset, itemOffset, 0.28, r);
    dimensions.forEach((d) => {
      d.class_avg = dimAvgOf.get(d.dimension_key);
      d.rank_pct = pctOf(d.score, d.class_avg, 12);
      const lowest = [...d.radar_items].sort((a, b) => a.value - b.value)[0];
      d.explanation = d.score >= d.class_avg + 5
        ? `${d.dimension_name}（${d.score}）高于班均（${d.class_avg}），班级百分位 ${d.rank_pct}%。`
        : d.score <= d.class_avg - 5
          ? `${d.dimension_name}（${d.score}）低于班均（${d.class_avg}），班级百分位 ${d.rank_pct}%，短板集中在「${lowest.name}」。`
          : `${d.dimension_name}（${d.score}）与班均（${d.class_avg}）持平，班级百分位 ${d.rank_pct}%。`;
      d.suggestion = d.score <= d.class_avg - 5
        ? `优先补「${lowest.name}」：本周完成 ${2 + (r() > 0.5 ? 1 : 0)} 道关联基础题 + 1 道变式题，三天后复测。`
        : `保持当前节奏，可尝试「${[...d.radar_items].sort((a, b) => b.value - a.value)[0].name}」方向的挑战题。`;
      // 学生个体素养证据易偏少
      if ((d.dimension_key === "literacy" || d.dimension_key === "process") && r() < 0.25) {
        d.evidence_strength = "low_sample";
        d.radar_items.forEach((i) => { if (r() < 0.3) { i.evidence_strength = "low_sample"; i.explanation += "（样本偏少）"; } });
      }
    });
    return {
      scope: "student", student_id: s.student_id, name: s.name, display_id: s.display_id,
      class_id: cls.class_id, persona_label: persona?.label || null,
      latest_event_at: dayIn(r, 22, 31), evidence_count: Math.max(18, Math.round(s.n_events * 0.45 + jit(r, 8))),
      dimensions,
    };
  });
  return {
    class_id: cls.class_id, class_name: cls.class_name, snapshot_id: `snap-${SNAPSHOT_DATE.replace(/-/g, "")}-${cls.class_id}`,
    time_window: TIME_WINDOW, sources: cls.sources, sampled_note: `演示抽样：每班取前 ${N_STUDENTS_SAMPLED} 名学生（全班 45 人）`,
    students,
  };
}

/* ---------- 证据摘要 ---------- */
function makeEvidence(eid, itemKey, kps, clsId, stuId, correct, r, realQids) {
  const src = correct
    ? { source_type: "homework", source_name: "课后作业（九月第 3 周）" }
    : r() < 0.55 ? { source_type: "exam", source_name: "9月单元测" } : { source_type: r() < 0.5 ? "homework" : "practice", source_name: r() < 0.5 ? "周练二" : "自主练习（函数专题）" };
  const qid = (!correct && realQids && realQids.length) ? realQids[Math.floor(r() * realQids.length)] : `q-${String(1000 + Math.floor(r() * 9000))}`;
  const LITERACY_KEYS = ["learning_attitude", "learning_interest", "learning_motivation", "effort_level", "self_efficacy", "value_formation"];
  const isBehavior = LITERACY_KEYS.includes(itemKey)
    || ["class_participation", "listening_speaking", "cooperation", "thinking_perspective", "homework_process", "homework_correction"].includes(itemKey);
  return {
    evidence_id: eid, ...src, occurred_at: dayIn(r, 2, 30),
    student_id: stuId || null, class_id: clsId,
    question_id: isBehavior ? null : qid,
    question_stem: (STEMS[itemKey] || ["（行为记录）相关学习行为片段"])[Math.floor(r() * (STEMS[itemKey] || [1]).length)],
    answer_summary: correct ? "作答正确，步骤完整" : (WRONG_ANSWERS[itemKey] || "作答不完整"),
    correct, score: correct ? 5 : Math.round(r() * 2), full_score: 5,
    knowledge_ids: isBehavior ? [] : kps,
    ability_keys: [], literacy_keys: isBehavior && LITERACY_KEYS.includes(itemKey) ? [itemKey] : [],
    process_keys: isBehavior && !LITERACY_KEYS.includes(itemKey) ? [itemKey] : [],
  };
}

/* ---------- 3. 解释性提示 ---------- */
function genExplanations(cls, classProfile, studentProfiles, graph) {
  const explanations = [];
  let seq = 0;
  const realQids = JSON.parse(fs.readFileSync(path.join(DATA, `class-students-${cls.class_id}.json`), "utf-8")).slice(0, 10).flatMap((s) => (s.cells || []).flatMap((c) => c.wrong_qids || [])).filter(Boolean);
  const push = (e) => explanations.push(e);

  // 3.1 班级维度级
  classProfile.dimensions.forEach((d) => {
    seq++;
    const r = rng(`exp-dim-${cls.class_id}-${d.dimension_key}`);
    const lowest = [...d.radar_items].sort((a, b) => a.value - b.value)[0];
    push({
      explanation_id: `exp-cls-${cls.class_id}-dimension-${d.dimension_key}`,
      scope: "class", student_id: null, target_type: "dimension", target_id: d.dimension_key,
      conclusion: d.score >= 78 ? `${d.dimension_name}总体良好` : `${d.dimension_name}存在短板`,
      reason: d.score >= 78
        ? `${d.dimension_name}均分 ${d.score}，六项指标最低为「${lowest.name}」${lowest.value} 分，仍处正常区间。`
        : `${d.dimension_name}均分 ${d.score}，「${lowest.name}」仅 ${lowest.value} 分，拖累整体读数。`,
      evidence_summary: `${d.sample_count} 条有效证据；关键指标「${lowest.name}」${lowest.sample_count} 条。`,
      compare_text: cls.class_id === "cls-g8-01" ? "高于年级均值约 4 分。" : cls.class_id === "cls-g8-03" ? "低于年级均值约 6 分，为本教师三个班中最低。" : "与年级均值基本持平。",
      sample_count: d.sample_count, source_names: cls.sources.slice(0, 3), time_range_text: "近 30 天",
      warning_type: warnOf(d.evidence_strength), suggestion: d.suggestion,
      evidence: [0, 1].map((i) => makeEvidence(`ev-${cls.class_id}-${seq}-${i}`, lowest.key, lowest.related_knowledge_ids, cls.class_id, null, i === 1 && r() < 0.7, r, realQids)),
    });
    // 3.2 班级低分雷达项（<73：覆盖“接近临界”的可解释项）
    d.radar_items.filter((i) => i.value < 73).forEach((it) => {
      seq++;
      const r2 = rng(`exp-item-${cls.class_id}-${it.key}`);
      const gapVsTarget = 75 - it.value;
      push({
        explanation_id: `exp-cls-${cls.class_id}-radar_item-${it.key}`,
        scope: "class", student_id: null, target_type: "radar_item", target_id: it.key,
        conclusion: `班级「${it.name}」读数偏低（${it.value}）`,
        reason: it.explanation.split("。")[0] + "。",
        evidence_summary: `共 ${it.sample_count} 条证据；9月单元测关联题正确率 ${clamp(Math.round(it.value * 0.9), 25, 70)}%。`,
        compare_text: `低于学期目标（75）${gapVsTarget} 分${cls.class_id === "cls-g8-03" ? `，低于 1 班同类读数约 ${Math.max(8, ANCHORS["cls-g8-01"][d.dimension_key][it.key] - it.value)} 分` : ""}。`,
        sample_count: it.sample_count, source_names: ["9月单元测", "周练二", "课堂学案"], time_range_text: "近 30 天",
        warning_type: warnOf(it.evidence_strength),
        suggestion: `建议：围绕「${it.name}」设计 1 课时专项 + 课后 3 题变式（由易到难），一周后用 2 道题快检。`,
        evidence: [0, 1, 2].slice(0, 1 + Math.floor(r2() * 3)).map((i) => makeEvidence(`ev-${cls.class_id}-${seq}-${i}`, it.key, it.related_knowledge_ids, cls.class_id, null, false, r2, realQids)),
      });
    });
  });

  // 3.3 图谱薄弱节点（待巩固 / 证据不足 / 显著低于目标）
  graph.nodes.filter((n) => n.mastery_band === "待巩固" || n.mastery_band === "证据不足" || n.mastery < 65).forEach((n) => {
    seq++;
    const r = rng(`exp-node-${cls.class_id}-${n.node_id}`);
    const acc = clamp(Math.round(n.mastery * 0.85 + jit(r, 6)), 20, 80);
    push({
      explanation_id: `exp-${n.node_id}`,
      scope: "class", student_id: null, target_type: "knowledge_node", target_id: n.node_id,
      conclusion: `「${n.name}」掌握度${n.mastery_band === "证据不足" ? "证据不足" : "偏低"}`,
      reason: n.mastery_band === "证据不足"
        ? `该知识点近 30 天仅 ${n.sample_count} 条作答样本，低于 15 条的可信门槛，暂不给出掌握度结论。`
        : `最近一次单元测关联题正确率 ${acc}%，低于班级近三次均值 ${clamp(acc + 18, 40, 88)}%。`,
      evidence_summary: n.mastery_band === "证据不足" ? `${n.sources.join("、")}中关联记录过少。` : `单元测第 ${6 + Math.floor(r() * 4)}、${9 + Math.floor(r() * 4)} 题；周练二第 ${3 + Math.floor(r() * 5)}、${7 + Math.floor(r() * 3)} 题。`,
      compare_text: n.mastery_band === "证据不足" ? "无有效对比。" : `低于同章基础题均值 ${clamp(15 + jit(r, 6), 8, 28)} 分。`,
      sample_count: n.sample_count, source_names: n.sources, time_range_text: "近 30 天",
      warning_type: warnOf(n.evidence_strength),
      suggestion: n.mastery_band === "证据不足"
        ? "建议先布置一次 5 题小测补足样本，再评估掌握度。"
        : `建议下一课增加「${n.name}」的表达支架与 2 道变式题，并减少重复计算题。`,
      evidence: [0, 1].slice(0, n.mastery_band === "证据不足" ? 1 : 2).map((i) => makeEvidence(`ev-${cls.class_id}-${seq}-${i}`, n.cluster === "calc" ? "operation_reasoning" : n.cluster === "function" ? "image_interpretation" : "problem_analysis", [n.node_id], cls.class_id, null, false, r, realQids)),
    });
  });

  // 3.4 学生重点项：每生每维最低项中挑 2 个全局最低的维度
  studentProfiles.students.forEach((stu) => {
    // 全局差距最大的 2 项；人设定向补弱项（偏移 ≤ -6）保证必有解释（教研引用不悬空）
    const allItems = stu.dimensions.flatMap((d) => d.radar_items.map((it) => ({ d, it, gap: it.value - (it.class_avg ?? d.class_avg) })));
    const personaKeys = Object.entries(PERSONAS[stu.student_id]?.items || {}).filter(([, v]) => v <= -6).map(([k]) => k);
    const picked = allItems.slice().sort((a, b) => a.gap - b.gap).slice(0, 2);
    for (const key of personaKeys) {
      if (picked.length >= 3) break;
      if (!picked.some((p) => p.it.key === key)) {
        const c = allItems.find((x) => x.it.key === key);
        if (c) picked.push(c);
      }
    }
    picked.forEach(({ d, it }) => {
      seq++;
      const r = rng(`exp-stu-${stu.student_id}-${it.key}`);
      const gap = it.value - (it.class_avg ?? d.class_avg);
      push({
        explanation_id: `exp-stu-${stu.student_id}-${it.key}`,
        scope: "student", student_id: stu.student_id, target_type: "radar_item", target_id: it.key,
        conclusion: `${stu.name}的「${it.name}」${gap <= -8 ? "显著偏弱" : gap <= -3 ? "偏弱" : "相对偏弱"}`,
        reason: it.explanation.split("。")[0] + "。",
        evidence_summary: `${stu.name}近 30 天该项 ${it.sample_count} 条证据，关联题正确率 ${clamp(Math.round(it.value * 0.9), 20, 90)}%。`,
        compare_text: `低于班均 ${Math.abs(Math.min(gap, -1))} 分，班级百分位 ${d.rank_pct}%。`,
        sample_count: it.sample_count, source_names: ["9月单元测", "周练二", "自主练习"], time_range_text: "近 30 天",
        warning_type: warnOf(it.evidence_strength),
        suggestion: `建议为 ${stu.name} 安排「${it.name}」补弱微练习（3 题），并在下次作业批注中回访错因。`,
        evidence: [0, 1].map((i) => makeEvidence(`ev-${cls.class_id}-${seq}-${i}`, it.key, it.related_knowledge_ids, cls.class_id, stu.student_id, i === 1 && r() < 0.6, r, realQids)),
      });
    });
  });

  // 3.5 作业分析解释性建议（recommendation）
  const weakestNode = graph.nodes.filter((n) => n.mastery_band !== "证据不足").sort((a, b) => a.mastery - b.mastery)[0];
  seq++;
  push({
    explanation_id: `exp-rec-homework-${cls.class_id}`,
    scope: "class", student_id: null, target_type: "recommendation", target_id: `rec-homework-${cls.class_id}`,
    conclusion: "下次作业建议：减重复、补短板",
    reason: `「${weakestNode.name}」掌握度 ${weakestNode.mastery}（${weakestNode.mastery_band}），而已掌握章节的重复题占比仍约 ${25 + jit(rng(`rec-${cls.class_id}`), 8)}%。`,
    evidence_summary: `近 2 周作业共 24 题中，与「${weakestNode.name}」关联的仅 ${2 + Math.floor(rng(`rec2-${cls.class_id}`)() * 3)} 题。`,
    compare_text: "同类班级（1 班）同知识点作业关联题为 6 题。",
    sample_count: weakestNode.sample_count, source_names: ["课后作业", "9月单元测"], time_range_text: "近 14 天",
    warning_type: "none",
    suggestion: `下次作业：删去 2 道已掌握的重复计算题，加入 3 道「${weakestNode.name}」变式题（1 基础 + 1 图像/情境 + 1 综合）。`,
    evidence: [makeEvidence(`ev-${cls.class_id}-${seq}-0`, weakestNode.cluster === "calc" ? "operation_reasoning" : "image_interpretation", [weakestNode.node_id], cls.class_id, null, false, rng(`rec3-${cls.class_id}`), realQids)],
  });
  seq++;
  push({
    explanation_id: `exp-rec-group-${cls.class_id}`,
    scope: "class", student_id: null, target_type: "recommendation", target_id: `rec-group-${cls.class_id}`,
    conclusion: "分层建议：过程表现偏弱学生优先跟进订正闭环",
    reason: `过程画像中「订正过程」班级均分 ${classProfile.dimensions.find((d) => d.dimension_key === "process").radar_items.find((i) => i.key === "homework_correction").value}，为过程维度最低项。`,
    evidence_summary: "近 30 天约 1/3 学生的订正记录存在“只抄答案、无错因”现象。",
    compare_text: "与 1 班相比低约 17 分。",
    sample_count: 210, source_names: ["课后作业", "人机交互"], time_range_text: "近 30 天",
    warning_type: "none",
    suggestion: "对订正薄弱学生启用“错因归类—重做—3 日复测”闭环单，先在画像偏弱的 10 人小组试行两周。",
    evidence: [makeEvidence(`ev-${cls.class_id}-${seq}-0`, "homework_correction", [], cls.class_id, null, false, rng(`rec4-${cls.class_id}`), realQids)],
  });

  return { class_id: cls.class_id, generated_at: NOW, time_range_text: "近 30 天", explanations };
}

/* ---------- 4. 知识图谱（带筛选字段） ---------- */
function genGraph(cls) {
  const prof = CLUSTER_PROFILE[cls.class_id];
  const nodes = NODE_DEFS.map((nd) => {
    const r = rng(`node-${cls.class_id}-${nd.id}`);
    const mastery = clamp(prof.base + prof.delta[nd.cluster] + jit(r, 5), 35, 96);
    const isLow = prof.lowSample.includes(nd.id);
    const sampleCount = nd.stale ? 26 + jit(r, 6) : isLow ? 4 + Math.floor(r() * 6) : 18 + Math.floor(r() * 60);
    const strength = nd.stale ? "stale" : strengthOf(sampleCount, false);
    const band = strength === "low_sample" ? "证据不足" : bandOf(mastery);
    const sources = nd.cluster === "calc" ? ["作业记录", "考试记录"] : nd.cluster === "geo" ? ["作业记录", "考试记录", "课堂互动"] : ["作业记录", "考试记录", "人机交互"];
    const acc = clamp(Math.round(mastery * 0.88 + jit(r, 4)), 20, 92);
    const explanation = strength === "stale"
      ? `最近一次关联记录停留在 2026-05-${pad(20 + Math.floor(r() * 8))}，久未更新，建议在近期小测中补充证据。`
      : strength === "low_sample"
        ? `近 30 天仅 ${sampleCount} 条作答样本，暂按「证据不足」处理，不建议直接据此分层。`
        : band === "待巩固"
          ? `最近一次单元测关联题正确率 ${acc}%，低于近三次均值 ${clamp(acc + 16, 40, 90)}%，为本班薄弱簇节点。`
          : band === "练习中"
            ? mastery < 60
              ? `关联题正确率 ${acc}%，虽处练习巩固阶段但掌握度不足 60，建议增加针对性变式练习。`
              : `关联题正确率 ${acc}%，处于练习巩固阶段，保持当前练习量即可。`
            : `关联题正确率 ${acc}%，掌握较稳固，可作为后续综合题的支撑知识点。`;
    return {
      node_id: nd.id, name: nd.name, chapter: nd.chapter, level: nd.level,
      cluster: nd.cluster, // 函数/计算/几何簇（筛选分组与解释取题用）
      mastery, mastery_band: band, sample_count: sampleCount,
      evidence_strength: strength, evidence_strength_label: bandLabel[strength],
      sources, goal_ids: GOAL_OF[nd.cluster],
      ability_keys: ABILITY_OF[nd.cluster], literacy_keys: LITERACY_OF[nd.cluster], process_keys: PROCESS_OF[nd.cluster],
      explanation,
    };
  });
  const nodeIds = new Set(nodes.map((n) => n.node_id));
  const edges = EDGE_DEFS.filter((e) => nodeIds.has(e.s) && nodeIds.has(e.t)).map((e, i) => ({
    source: e.s, target: e.t, relation_type: e.type, explanation: e.exp, edge_id: `edge-${cls.class_id}-${i + 1}`,
  }));
  const byBand = {};
  nodes.forEach((n) => (byBand[n.mastery_band] = (byBand[n.mastery_band] || 0) + 1));
  return {
    class_id: cls.class_id, class_name: cls.class_name, snapshot_id: `snap-${SNAPSHOT_DATE.replace(/-/g, "")}-${cls.class_id}`,
    time_window: TIME_WINDOW,
    filters: {
      time_windows: [
        { key: "7d", label: "近 7 天" }, { key: "1m", label: "近 1 个月" },
        { key: "3m", label: "近 3 个月" }, { key: "custom", label: "自定义" },
      ],
      sources: ["作业记录", "考试记录", "课堂互动", "人机交互", "自主练习"],
      dimension_types: ["知识点", "能力", "素养", "学习过程表现"],
      mastery_bands: ["待巩固", "练习中", "较熟练", "已掌握", "证据不足"],
      evidence_strengths: ["样本充足", "样本偏少", "久未更新"],
      goals: GOALS,
    },
    nodes, edges,
    stats: {
      n_nodes: nodes.length, n_edges: edges.length,
      by_band: byBand,
      weak_clusters: nodes.filter((n) => n.mastery_band === "待巩固").map((n) => n.name),
    },
    note: `班级知识图谱（${cls.feature}）：掌握度着色 + 证据强度标记 + 筛选字段齐备`,
  };
}

/* ---------- 5. 校本教研 ---------- */
const FACULTY = [
  { id: "t-002", name: "李老师" }, { id: "t-003", name: "周老师" }, { id: "t-004", name: "吴老师" },
  { id: "t-005", name: "郑老师" }, { id: "t-006", name: "王老师" }, { id: "t-007", name: "冯老师" },
  { id: "t-008", name: "陈老师" }, { id: "t-009", name: "许老师" },
];
const ALL_CLS = ["cls-g8-01", "cls-g8-02", "cls-g8-03"];
/** 议题正文、回复与共识策略（手写内容，保证论坛质感） */
const RESEARCH = [
  {
    topic_id: "research-001",
    title: "八年级多个班在「一次函数图像解释」上达成偏低，如何补支架？",
    author: 0, class_scope: ALL_CLS, kps: ["kp-function-image", "kp-function-property"], dims: ["knowledge", "ability"],
    content: "9 月单元测和近两周作业显示，3 班在“图像解释”类题目上正确率不足五成、2 班约六成，均明显低于同章计算题。学生不是不会算，而是说不清“y 随 x 怎么变、在实际情境里意味着什么”。想请大家聊聊：表达类的短板，用什么支架最见效？",
    evidence_summary: "3 班图像解释读数不足 55，显著低于学期目标 75；失分集中在“解释趋势的实际含义”小问。",
    status: "strategy_formed", tags: ["图像解释", "表达支架"],
    created_at: "2026-09-12 10:05",
    replies: [
      { author: 1, content: "我们班先用了“点—线—趋势”三步表达模板：先读关键点，再说变化方向，最后解释实际意义。两周下来，同类题正确率从 54% 提到 67%。关键是让学生口头说一遍再落笔。", evidence_refs: ["exp-kp-function-image"], likes: 9 },
      { author: 3, content: "赞同先说后写。我补充一点：解释类题目要给句式半支架（“因为 k>0，所以 y 随 x 增大而____，这意味着____”），比空喊“说完整”有效。", evidence_refs: [], likes: 6 },
      { author: 4, content: "画像里 3 班的「表征转换」也偏低，和这个问题应该是一体的。建议图像解释课里加一次表格→图像→文字的三表征互换练习。", evidence_refs: ["exp-cls-cls-g8-03-radar_item-representation_transfer"], likes: 5 },
      { author: 0, content: "综合大家的意见，我把“点—线—趋势三步表达支架”整理成共识策略了，适用场景和效果证据都放在策略卡里，各位可以引用到教案试试。", evidence_refs: [], likes: 7 },
      { author: 5, content: "下周一我在 2 班先试，周五教研时把对比数据带回来。", evidence_refs: [], likes: 3 },
    ],
    strategies: [{
      title: "点—线—趋势三步表达支架",
      content: "第一步找关键点（交点、端点）；第二步描述变化方向（k 的符号 → 升/降）；第三步解释实际意义（速率、增量、限值等）。先口头说，再用半支架句式落笔，最后同伴互评。",
      applicable_scene: "一次函数图像解释课（亦可用于其他函数图像教学）",
      evidence_summary: "应用后两个班同类题正确率提升 13 分（54%→67%）。",
      can_apply_to_plan: true,
    }],
  },
  {
    topic_id: "research-002",
    title: "「二次根式加减」错误率高：计算类薄弱簇怎么专项训练？",
    author: 1, class_scope: ["cls-g8-02", "cls-g8-03"], kps: ["kp-radical-addsub", "kp-radical-muldvd"], dims: ["knowledge", "ability"],
    content: "2 班运算推理读数只有 60，图谱上二次根式加减是待巩固节点。典型错误是“没化成最简二次根式就直接合并”，比如 √18+√8 算成 √26。计算类短板靠刷题好像边际效应递减，大家有什么结构性办法？",
    evidence_summary: "2 班「二次根式的加减」掌握度不足 60（练习中偏下，部分学生待巩固）；单元测计算题失分中“未化简先合并”占 55%。",
    status: "strategy_formed", tags: ["运算薄弱", "专项训练"],
    created_at: "2026-09-10 16:40",
    replies: [
      { author: 2, content: "我们改成“运算三步自查单”：抄式→逐步化简→回代估算检验。每题必须走完三步才交。两周后周练计算均分提了 9.5 分。", evidence_refs: [], likes: 8 },
      { author: 6, content: "估算检验这步很关键：√26≈5.1 和 5√2≈7.1 差得很远，学生自己就能发现不对。建议把估算意识前移到七年级。", evidence_refs: [], likes: 4 },
      { author: 4, content: "画像看 2 班的订正过程也偏弱（68），计算错题订正时如果只抄正确答案，同样的错误下周还会犯。建议自查单和订正单联动。", evidence_refs: ["exp-cls-cls-g8-02-radar_item-homework_correction"], likes: 5 },
      { author: 1, content: "已把“运算三步自查单”沉淀为共识策略，下周起 2、3 班同步使用，第 4 周周练后回看数据。", evidence_refs: [], likes: 6 },
    ],
    strategies: [{
      title: "运算三步自查单（抄式—算步—回代验算）",
      content: "每道计算题完成后：① 核对抄式与原式一致；② 每一步注明依据（化简/合并/通分）；③ 回代或估算检验数量级。作业本左侧固定贴自查单，缺一步视为未完成。",
      applicable_scene: "整式、根式、分式运算作业与测验",
      evidence_summary: "试行两周后周练计算题均分 +9.5，“未化简先合并”类错误占比 55%→31%。",
      can_apply_to_plan: true,
    }],
  },
  {
    topic_id: "research-003",
    title: "全等三角形判定：SSA 误用怎么破？",
    author: 2, class_scope: ["cls-g8-01", "cls-g8-03"], kps: ["kp-congruent-judge"], dims: ["knowledge", "ability"],
    content: "单元测里“补充条件使三角形全等”的题，1、3 班都有近三成学生选了 SSA。画图演示过两边及其中一边的对角不一定全等，但过两周又错。这种概念性误解如何长期压住？",
    evidence_summary: "3 班「三角形全等的判定」掌握度不足 72（练习中）；SSA 误用占判定类失分的 46%。",
    status: "discussing", tags: ["概念混淆", "几何推理"],
    created_at: "2026-09-14 09:30",
    replies: [
      { author: 0, content: "我用过“反例记忆法”：让学生自己用几何画板拖出一个 SSA 不全等的反例，截图贴在错题本上。自己造过的反例忘得慢。", evidence_refs: [], likes: 7 },
      { author: 5, content: "还可以做“判定定理选牌”小游戏：给条件组合，学生举牌 SSS/SAS/ASA/AAS/不能判定，每天 3 分钟，两周见效。", evidence_refs: [], likes: 5 },
      { author: 3, content: "提醒一下，图谱上这个节点关联的是「问题分析」能力，不只是知识点记忆。建议变式题里加“给结论选条件”的逆向题。", evidence_refs: [], likes: 4 },
    ],
    strategies: [],
  },
  {
    topic_id: "research-004",
    title: "分式方程总忘验根：如何把“检验”变成习惯？",
    author: 3, class_scope: ["cls-g8-02"], kps: ["kp-fraction-calc"], dims: ["knowledge", "process"],
    content: "2 班分式方程题解得都对，但验根环节漏做率超过六成，直接丢步骤分。讲过很多遍“去分母可能产生增根”，还是记不住做。求把检验变成肌肉记忆的办法。",
    evidence_summary: "2 班分式方程题步骤分丢失中，“未验根”占 61%；关联节点「分式的加法与减法」掌握度不足 60。",
    status: "used_in_plan", tags: ["习惯养成", "作业设计"],
    created_at: "2026-09-08 14:15",
    replies: [
      { author: 6, content: "把验根设计成“必答空”：作业里分式方程最后一行印好“检验：把 x=____ 代入最简公分母，得____≠0，是原方程的解”。不填就退回。", evidence_refs: [], likes: 8 },
      { author: 1, content: "我们组内统一了口径：分式方程不写检验一律扣 2 分且不给订正通过。扣分不是目的，但确实两周就把习惯立起来了。", evidence_refs: [], likes: 6 },
      { author: 3, content: "验根必查清单已沉淀为共识策略，我上周已经引用到第 15 章复习课教案里，作业模板也换掉了。下次单元测看效果。", evidence_refs: [], likes: 5 },
      { author: 4, content: "补充：AI 辅导记录里能看到，学生自主练习分式方程时其实系统提示了验根，但 42% 的学生直接跳过提示。线上线下要一致要求。", evidence_refs: [], likes: 4 },
    ],
    strategies: [{
      title: "分式方程验根必查清单",
      content: "作业与试卷中分式方程题固定印制三空：① 解得 x=____；② 代入最简公分母得____；③ 判定是否为增根。三空缺一视为未完成，订正通过前置条件。",
      applicable_scene: "分式方程作业、测验与自主练习",
      evidence_summary: "试行两周后验根漏做率 61%→18%；步骤分平均找回 2.4 分/人。",
      can_apply_to_plan: true,
    }],
  },
  {
    topic_id: "research-005",
    title: "课堂沉默的学生，如何用过程画像早发现、早干预？",
    author: 4, class_scope: ALL_CLS, kps: [], dims: ["process", "literacy"],
    content: "有些学生作业都对，但课堂几乎零互动，问题往往拖到期中才暴露。过程画像里的「课堂参与」「倾听与发言」指标能不能作为预警源？大家怎么用？",
    evidence_summary: "抽样学生中，各班均有 1-3 人课堂参与读数低于班均 15 分以上，其中多数知识画像正常。",
    status: "discussing", tags: ["课堂参与", "过程画像"],
    created_at: "2026-09-15 11:20",
    replies: [
      { author: 0, content: "画像确实能提前看到。我 3 班有个学生知识维度都在班均附近，但「倾听与发言」比班均低 20+，访谈后发现是听不懂又不敢问。", evidence_refs: ["exp-stu-aa18e927903a0918-class_participation"], likes: 8 },
      { author: 2, content: "建议别直接拿读数找学生谈话，先当“线索”用：读数低 → 回看课堂互动记录 → 再决定是学业问题还是性格问题。证据链要完整。", evidence_refs: [], likes: 9 },
      { author: 6, content: "我们试过“低风险发言位”：投票、组内两两互说、白板板演，先让沉默学生在小范围开口，一个月后主动发言次数肉眼可见变多。", evidence_refs: [], likes: 6 },
      { author: 5, content: "同意。另外「思维角度」这项可以和一题多解活动绑定采集，不然老师手记根本覆盖不了全班。", evidence_refs: [], likes: 3 },
    ],
    strategies: [],
  },
  {
    topic_id: "research-006",
    title: "作业订正流于形式：订正闭环记录单的落地效果",
    author: 5, class_scope: ["cls-g8-03"], kps: [], dims: ["process"],
    content: "3 班订正过程读数不足 65，是过程维度最低项。抽查发现相当比例学生订正就是抄一遍正确答案。上月试行了“错因归类—重做—3 日复测”闭环单，汇报一下效果，也请大家提问题。",
    evidence_summary: "闭环单试行 3 周：订正含错因归类的比例从 35% 提升到 78%，同类错误复现率下降约一半。",
    status: "used_in_plan", tags: ["订正", "过程画像"],
    created_at: "2026-09-05 15:00",
    replies: [
      { author: 4, content: "数据挺有说服力。问一个操作问题：3 日复测的题从哪来？老师自己出卷负担会不会太大？", evidence_refs: [], likes: 4 },
      { author: 5, content: "复测题直接从画像的“关联错题”里选，2 道就够，学生互批。前两周我盯着做，之后课代表就能维持。", evidence_refs: [], likes: 6 },
      { author: 1, content: "错因归类的类目建议统一成四类：概念不清/看错题意/算错/表达不全，不然学生自己编类目又变成抄写。", evidence_refs: [], likes: 7 },
      { author: 0, content: "这个闭环单已经引用到我的作业讲评课教案，配合“运算三步自查单”使用，暂时没发现冲突。", evidence_refs: [], likes: 5 },
    ],
    strategies: [{
      title: "订正闭环记录单（错因归类—重做—3 日复测）",
      content: "每道错题填写：① 错因四选一（概念/审题/计算/表达）；② 不看答案重做；③ 3 天后完成 2 道关联复测题（从画像关联错题自动推荐）。连续两次复测全对即销号。",
      applicable_scene: "数学日常作业与测验讲评",
      evidence_summary: "含错因订正占比 35%→78%，同类错误三周复现率 52%→27%。",
      can_apply_to_plan: true,
    }],
  },
  {
    topic_id: "research-007",
    title: "一次函数实际应用（建模）得分低：情境素材从哪里找？",
    author: 6, class_scope: ALL_CLS, kps: ["kp-function-application"], dims: ["knowledge", "ability"],
    content: "三个班的「实际问题建模」普遍只有 60-75，均未达到学期目标。学生见到“套餐、出租车、弹簧”之外的情境就懵。大家平时从哪里收集真实情境素材？",
    evidence_summary: "建模题失分中 47% 是“未能建立函数关系”，31% 是“未回答实际问题问的量”。",
    status: "discussing", tags: ["建模", "情境素材"],
    created_at: "2026-09-16 08:50",
    replies: [
      { author: 2, content: "共享单车计费、奶茶会员卡、视频网站会员价，这三个学生自带经验，建立关系的成功率高。我整理了一个 12 情境的小库，放教研共享盘了。", evidence_refs: [], likes: 7 },
      { author: 0, content: "关键是审题环节让学生自己圈“不变量/变化量/起始量”，圈对了关系式就出来一半。", evidence_refs: [], likes: 5 },
      { author: 4, content: "提醒注意和第 19 章目标（goal-5）对齐：建模题库建好后，最好在图谱上反哺「实际问题与一次函数」节点的样本量，现在 3 班这个节点证据还偏少。", evidence_refs: [], likes: 4 },
    ],
    strategies: [],
  },
  {
    topic_id: "research-008",
    title: "已掌握学生重复练习过多：画像驱动的分层作业怎么排？",
    author: 7, class_scope: ["cls-g8-01"], kps: [], dims: ["knowledge", "process"],
    content: "1 班整体较好，图谱上已掌握节点不少，但作业还是一刀切，头部学生浪费时间做熟题。有没有用画像直接驱动分层作业的成熟做法？",
    evidence_summary: "1 班较熟练/已掌握节点约占六成，但近两周作业中对应重复题占比仍约 30%。",
    status: "discussing", tags: ["分层作业", "减负"],
    created_at: "2026-09-17 10:30",
    replies: [
      { author: 1, content: "我们的做法：作业分 A（必做）/B（选做巩固）/C（挑战），系统按图谱掌握度把学生跳过 A 中已掌握题、直推 C。两周试下来头部学生日均省 12 分钟。", evidence_refs: [], likes: 8 },
      { author: 3, content: "注意别把“已掌握”当成永久标签，证据强度要看着：久未更新的节点（比如轴对称）到期要回炉，不然期末会反噬。", evidence_refs: [], likes: 6 },
      { author: 7, content: "受启发，我准备先在 1 班把“已掌握且样本充足”的节点白名单化，其余照旧，小步试行。", evidence_refs: [], likes: 3 },
    ],
    strategies: [],
  },
  {
    topic_id: "research-009",
    title: "单元测命题如何与画像薄弱簇对齐？",
    author: 2, class_scope: ALL_CLS, kps: ["kp-radical-addsub", "kp-function-image"], dims: ["knowledge"],
    content: "常出现“考完才发现命题和班级真实薄弱点对不上”。打算做一张“命题双向细目表 × 画像薄弱簇”的对齐模板，命题时先看图谱再定题。请大家对模板提意见。",
    evidence_summary: "对照 9 月单元测：图谱待巩固/证据不足节点中仅约半数在卷面覆盖 ≥2 题。",
    status: "strategy_formed", tags: ["命题", "教-学-评一致"],
    created_at: "2026-09-13 13:45",
    replies: [
      { author: 0, content: "模板思路好。建议加一列“证据强度”：样本偏少的薄弱点不配大分值，先小题补样本。", evidence_refs: [], likes: 6 },
      { author: 5, content: "再补一列“考后回填”：考完后把各节点正确率回写图谱，下次命题就能看到“测过但没测好”的节点。", evidence_refs: [], likes: 7 },
      { author: 6, content: "我们的细目表已经按这个改了：薄弱簇节点覆盖分值不低于 35%，新增节点（新课）不超过 20%，其余巩固。下次月考后给大家看回写效果。", evidence_refs: [], likes: 5 },
      { author: 2, content: "对齐模板已沉淀为共识策略（含分值配比建议），欢迎各班月考命题时引用。", evidence_refs: [], likes: 4 },
    ],
    strategies: [{
      title: "命题双向细目表 × 画像薄弱簇对齐模板",
      content: "命题前导出班级图谱：待巩固/练习中节点覆盖分值 ≥35%（其中样本充足者可配解答题）；证据不足节点仅配小题补样本；已掌握节点 ≤20% 且以综合题形式出现；考后 3 日内将各节点正确率回写图谱。",
      applicable_scene: "单元测/月考命题与考后分析",
      evidence_summary: "试用于 9 月月考：薄弱簇覆盖分值 28%→41%，考后图谱回写率 100%。",
      can_apply_to_plan: true,
    }],
  },
  {
    topic_id: "research-010",
    title: "素养画像「学习动机」该采哪些证据才可信？",
    author: 4, class_scope: ALL_CLS, kps: [], dims: ["literacy"],
    content: "素养维度里「学习动机」最容易被打成主观分。目前我们用自主练习启动次数、目标卡完成率、连续学习天数三个口径，还是觉得偏行为化。大家觉得哪些证据组合最站得住？",
    evidence_summary: "三班学习动机读数 70-80，行为证据人均 22 条，问卷证据仅 1 次/学期。",
    status: "discussing", tags: ["素养证据", "口径讨论"],
    created_at: "2026-09-17 16:10",
    replies: [
      { author: 7, content: "建议“行为证据 + 每月一次 3 题微问卷”双轨：行为看强度，问卷看方向。单靠任何一边都会被质疑。", evidence_refs: [], likes: 7 },
      { author: 1, content: "学习任务完成间隔也是个好口径：同样完成率，间隔稳定的比突击型的动机读数应该更高。", evidence_refs: [], likes: 5 },
      { author: 3, content: "同意楼上。另外读数页一定要带“证据构成”说明，家长会上被问到“凭什么说我孩子动机不足”时，能点开看证据清单很重要。", evidence_refs: [], likes: 6 },
      { author: 4, content: "先把三条行为口径 + 微问卷写进下学期素养画像口径说明，期末拿一个班的完整数据链再复盘。", evidence_refs: [], likes: 4 },
    ],
    strategies: [],
  },
];

function genResearch() {
  const topics = RESEARCH.map((t) => {
    const replies = t.replies.map((rp, i) => ({
      reply_id: `reply-${t.topic_id.slice(-3)}-${String(i + 1).padStart(2, "0")}`,
      topic_id: t.topic_id,
      author_id: FACULTY[rp.author].id, author_name: FACULTY[rp.author].name,
      content: rp.content, evidence_refs: rp.evidence_refs,
      created_at: replyTime(t.created_at, i), liked_count: rp.likes,
    }));
    return {
      topic_id: t.topic_id, title: t.title, content: t.content,
      author_id: FACULTY[t.author].id, author_name: FACULTY[t.author].name,
      subject: "数学", grade: "g8", class_scope: t.class_scope,
      related_knowledge_ids: t.kps, related_dimension_keys: t.dims,
      evidence_summary: t.evidence_summary,
      reply_count: replies.length,
      last_reply_at: replies[replies.length - 1].created_at,
      status: t.status, tags: t.tags, created_at: t.created_at,
    };
  });
  return { generated_at: NOW, scope_note: "八年级数学备课组（同一教师 + 备课组同事）", topics };
}
/** 议题创建时间之后的第 i 楼时间（确定性顺延） */
function replyTime(created, i) {
  const m = created.match(/2026-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
  const d = new Date(2026, +m[1] - 1, +m[2], +m[3], +m[4]);
  d.setMinutes(d.getMinutes() + 47 * (i + 1) + ((hash(created + i) % 5) * 11));
  if (d > new Date(2026, 8, 18, 21, 0)) d.setTime(new Date(2026, 8, 18, 21, 0).getTime() - (4 - i) * 3600000);
  return `2026-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function genResearchDetail(t) {
  const replies = t.replies.map((rp, i) => ({
    reply_id: `reply-${t.topic_id.slice(-3)}-${String(i + 1).padStart(2, "0")}`,
    topic_id: t.topic_id,
    author_id: FACULTY[rp.author].id, author_name: FACULTY[rp.author].name,
    content: rp.content, evidence_refs: rp.evidence_refs,
    created_at: replyTime(t.created_at, i), liked_count: rp.likes,
  }));
  const strategies = t.strategies.map((s, i) => ({
    strategy_id: `strategy-${String(RESEARCH.indexOf(t) + 1).padStart(3, "0")}${i ? `-${i + 1}` : ""}`,
    topic_id: t.topic_id, ...s,
  }));
  return {
    topic: {
      topic_id: t.topic_id, title: t.title, content: t.content,
      author_id: FACULTY[t.author].id, author_name: FACULTY[t.author].name,
      subject: "数学", grade: "g8", class_scope: t.class_scope,
      related_knowledge_ids: t.kps, related_dimension_keys: t.dims,
      evidence_summary: t.evidence_summary, status: t.status, tags: t.tags,
      created_at: t.created_at,
    },
    replies, strategies,
  };
}

/* ---------- main ---------- */
function main() {
  console.log("生成教师端画像与校本教研 mock 数据 →", DATA);
  const classProfiles = {};
  const studentProfiles = {};
  const graphs = {};
  for (const cls of CLASSES) {
    console.log(`[${cls.class_id}] ${cls.class_name}`);
    classProfiles[cls.class_id] = genClassProfile(cls);
    writeJson(`profile-dimensions-class-${cls.class_id}.json`, classProfiles[cls.class_id]);
    studentProfiles[cls.class_id] = genStudentProfiles(cls, classProfiles[cls.class_id]);
    writeJson(`profile-dimensions-student-${cls.class_id}.json`, studentProfiles[cls.class_id]);
    graphs[cls.class_id] = genGraph(cls);
    writeJson(`knowledge-graph-filtered-${cls.class_id}.json`, graphs[cls.class_id]);
    writeJson(`profile-explanations-${cls.class_id}.json`, genExplanations(cls, classProfiles[cls.class_id], studentProfiles[cls.class_id], graphs[cls.class_id]));
  }
  console.log("[校本教研]");
  writeJson("research-topics.json", genResearch());
  for (const t of RESEARCH) writeJson(`research-topic-detail-${t.topic_id}.json`, genResearchDetail(t));

  // classes.json：按清单 §2.1 补充 teacher_id / teacher_name / latest_snapshot_at（增量，不破坏既有消费方）
  const classesPath = path.join(DATA, "classes.json");
  const classes = JSON.parse(fs.readFileSync(classesPath, "utf-8"));
  classes.classes.forEach((c) => {
    c.teacher_id = TEACHER.teacher_id;
    c.teacher_name = TEACHER.teacher_name;
    c.latest_snapshot_at = NOW;
  });
  fs.writeFileSync(classesPath, JSON.stringify(classes, null, 1) + "\n", "utf-8");
  console.log("  ~", "classes.json（增量补 teacher/snapshot 字段）");

  // manifest.json：登记新文件
  const manifestPath = path.join(DATA, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const generated = fs.readdirSync(DATA).filter((f) => f.endsWith(".json") && f !== "manifest.json").sort();
  manifest.files = generated;
  manifest.generated_at = "2026-09-20";
  manifest.note = "教师端 mock fixture：3 班差异化画像 + 真实题库题干 + 逐生个性化卷 + 教案/个人题库 + 四维画像/解释性提示/知识图谱筛选/校本教研（2026-09-20 清单）";
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + "\n", "utf-8");
  console.log("  ~", "manifest.json（登记新文件）");
  console.log("完成：确定性输出，重复运行结果一致。");
}
main();
