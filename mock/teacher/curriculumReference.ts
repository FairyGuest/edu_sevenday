// Curated from the supplied Markdown; these are teaching links, not scoring rules.
export const referenceVersion = "local-md-2026-09-22-v1";
export default {};
const mathFile = "层次化md课标/义教课标/03_数学.md";
export const mathCompetencies = [
  "抽象能力",
  "运算能力",
  "几何直观",
  "空间观念",
  "推理能力",
  "数据观念",
  "模型观念",
  "应用意识",
  "创新意识",
];
export const subjectReferences = [
  {
    subject_id: "math",
    name: "数学",
    junior: mathCompetencies,
    senior: [
      "数学抽象",
      "逻辑推理",
      "数学建模",
      "直观想象",
      "数学运算",
      "数据分析",
    ],
  },
  {
    subject_id: "chinese",
    name: "语文",
    junior: ["文化自信", "语言运用", "思维能力", "审美创造"],
    senior: [
      "语言建构与运用",
      "思维发展与提升",
      "审美鉴赏与创造",
      "文化传承与理解",
    ],
  },
  {
    subject_id: "english",
    name: "英语",
    junior: ["语言能力", "文化意识", "思维品质", "学习能力"],
    senior: ["语言能力", "文化意识", "思维品质", "学习能力"],
  },
  {
    subject_id: "physics",
    name: "物理",
    junior: ["物理观念", "科学思维", "科学探究", "科学态度与责任"],
    senior: ["物理观念", "科学思维", "科学探究", "科学态度与责任"],
  },
  {
    subject_id: "chemistry",
    name: "化学",
    junior: ["化学观念", "科学思维", "科学探究与实践", "科学态度与责任"],
    senior: [
      "宏观辨识与微观探析",
      "变化观念与平衡思想",
      "证据推理与模型认知",
      "科学探究与创新意识",
      "科学态度与社会责任",
    ],
  },
  {
    subject_id: "biology",
    name: "生物学",
    junior: ["生命观念", "科学思维", "探究实践", "态度责任"],
    senior: ["生命观念", "科学思维", "科学探究", "社会责任"],
  },
  {
    subject_id: "history",
    name: "历史",
    junior: ["唯物史观", "时空观念", "史料实证", "历史解释", "家国情怀"],
    senior: ["唯物史观", "时空观念", "史料实证", "历史解释", "家国情怀"],
  },
  {
    subject_id: "geography",
    name: "地理",
    junior: ["人地协调观", "综合思维", "区域认知", "地理实践力"],
    senior: ["人地协调观", "综合思维", "区域认知", "地理实践力"],
  },
  {
    subject_id: "politics",
    name: "道德与法治 / 思想政治",
    junior: ["政治认同", "道德修养", "法治观念", "健全人格", "责任意识"],
    senior: ["政治认同", "科学精神", "法治观念", "公共参与"],
  },
];

export const mathContentLinks = [
  {
    key: "radical",
    title: "数与式 · 二次根式",
    kp_ids: ["kp-radical", "kp-radical-muldvd", "kp-radical-addsub"],
    competencies: ["运算能力", "抽象能力", "推理能力"],
    source: mathFile,
    line: 929,
    basis: "pedagogical_inference",
    review_status: "in_review",
    excerpt:
      "了解二次根式、最简二次根式的概念，了解二次根式（根号下仅限于数）加、减、乘、除运算法则，会用它们进行简单的四则运算。",
    task: "计算并写明化简依据；用数值正反例检验法则的适用条件。",
    evidence: "完整步骤、算理解释、订正记录；最终答案不能独自证明推理水平。",
  },
  {
    key: "function",
    title: "函数 · 表达与实际意义",
    kp_ids: [
      "kp-function",
      "kp-function-image",
      "kp-function-property",
      "kp-function-application",
    ],
    competencies: ["抽象能力", "模型观念", "几何直观", "应用意识"],
    source: mathFile,
    line: 1036,
    basis: "mixed",
    review_status: "in_review",
    excerpt:
      "能识别简单实际问题中的常量、变量及其意义，并能找出变量之间的数量关系及变化规律，形成初步的抽象能力；了解函数的概念和表示法，能举出函数的实例，初步形成模型观念。",
    task: "比较校园用水的两种方案，建立关系式、绘图并解释参数和适用范围。",
    evidence:
      "变量选择、图式互译、模型假设与现实检验；几何直观、应用意识对应为教学推导。",
  },
  {
    key: "geometry",
    title: "图形的性质与推理",
    kp_ids: [
      "kp-pythagoras",
      "kp-pythagoras-inverse",
      "kp-parallelogram",
      "kp-special-quad",
    ],
    competencies: ["几何直观", "推理能力", "应用意识"],
    source: mathFile,
    line: 1290,
    basis: "pedagogical_inference",
    review_status: "in_review",
    summary:
      "图形性质学业要求涉及识别图形关系、运用性质及推理论证。具体勾股任务对应需教研审核。",
    task: "判断测量场景能否使用勾股定理，并说明前提与推理依据。",
    evidence: "图形关系、适用条件和依据；仅算出边长不足以形成完整推理结论。",
  },
  {
    key: "data",
    title: "统计与概率 · 数据解释",
    kp_ids: [
      "kp-data",
      "kp-data-central",
      "kp-statistics",
      "kp-data-central-tendency",
      "kp-data-dispersion",
    ],
    competencies: ["数据观念", "模型观念", "推理能力"],
    source: mathFile,
    line: 1320,
    basis: "pedagogical_inference",
    review_status: "in_review",
    summary:
      "统计与概率领域强调数据收集、整理与分析，理解统计量并解释结果。此处为概括，非原文引句。",
    task: "比较两组校园测量数据，说明统计量选择与样本的局限。",
    evidence: "抽样方案、统计解释和反例；提交次数不是数据观念的评分依据。",
  },
];
