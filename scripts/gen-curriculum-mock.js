#!/usr/bin/env node
/**
 * 课程底座与教学设计 mock 生成器（开发辅助，非系统功能）。
 * 依据 docs/数据与内容支撑清单-2026-09-22.md §5/§8 生成 11 个数据集：
 *   curriculum-catalog / curriculum-links / teaching-units / curriculum-standards /
 *   subject-frameworks / assessment-rubrics / learner-contexts / learning-scenarios /
 *   design-templates / design-workflows / research-tools
 * 关键纪律（对应清单 §1/§2/§6）：
 *   - 教材章节参考 graph4rec 教材图谱（人教版八下 TTL 页码锚点），但仅作演示候选，
 *     全部标 is_demo 且 review_status=draft/in_review，不冒充教师确认的权威目录。
 *   - 课标条目引用 graph4rec 内部 URN 仅作 candidate_reference，映射状态 awaiting_source。
 *   - 中文 cluster / kp-* / 课程 section 三套命名空间经 curriculum-links 显式映射，不做名称模糊匹配。
 *   - 量规阈值标 demo_only；不含浏览量/效果类字段。
 * 确定性输出；demo_reference_date=2026-09-20。
 * 用法：node scripts/gen-curriculum-mock.js
 */
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "mock", "teacher", "data");
const REF_DATE = process.env.DEMO_AS_OF || "2026-09-22"; // 显式演示参考日，可随演示日期重生成（清单 §9.2）
const w = (name, obj) => {
  fs.writeFileSync(path.join(DATA, name), JSON.stringify(obj, null, 1) + "\n", "utf-8");
  console.log("  +", name, `(${Math.round(fs.statSync(path.join(DATA, name)).size / 1024)} KB)`);
};

/* ---------- 名册核对（§6.2：<existing_student_id> 必须真实存在） ---------- */
const ROSTERS = ["cls-g8-01", "cls-g8-02", "cls-g8-03"].map((c) => ({
  class_id: c, students: JSON.parse(fs.readFileSync(path.join(DATA, `class-students-${c}.json`), "utf-8")),
}));
const findStudent = (sid) => ROSTERS.flatMap((r) => r.students.map((s) => ({ ...s, class_id: r.class_id }))).find((s) => s.student_id === sid);
const FOCUS = {
  xu_li: "947bb83daabc33cf", huang_mingjing: "aa18e927903a0918", cao_ting: "358f22c0c0bb9d3a", he_ning: "2bfbc5fb6c6f1c5a",
  long_hao: "6738633173303037", peng_yuan: "6738633173303030",
  tan_min: "6738633273303036", gong_qiaoying: "6738633273303032",
};
for (const [k, sid] of Object.entries(FOCUS)) if (!findStudent(sid)) throw new Error(`重点学生 ${k}=${sid} 不在名册`);
console.log("名册核对通过：8 名重点演示学生均存在");

/* ================= 1. curriculum-catalog.json ================= */
const TB = "demo-math-g8-vol2-v1";
const w2 = (name, obj) => w(name, obj);
const catalog = {
  schema_version: "curriculum-catalog-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  subject: { subject_id: "math", name: "初中数学", stage: "初中" },
  textbooks: [
    {
      textbook_id: TB, name: "人教版初中数学八年级下册（演示口径）", publisher: "人民教育出版社", edition_year: "2012课标版",
      grade: "g8", volume: "下册", review_status: "in_review",
      source_note: "章节顺序与页码锚点参考 graph4rec 教材图谱（人教版数学八年级下册_graph.ttl）；页码为图谱标注的近似锚点，待教师按实际教材核对后方可作权威目录。",
      chapters: [
        { chapter_id: "demo-ch-radical", no: "第16章", title: "二次根式", order: 1, source_pages: "pp.2-20",
          sections: [
            { section_id: "demo-sec-radical-01", no: "16.1", title: "二次根式的概念与性质", order: 1, source_pages: "pp.2-8" },
            { section_id: "demo-sec-radical-02", no: "16.2", title: "二次根式的乘除", order: 2, source_pages: "pp.9-15" },
            { section_id: "demo-sec-radical-03", no: "16.3", title: "二次根式的加减", order: 3, source_pages: "pp.16-20" },
          ] },
        { chapter_id: "demo-ch-pythagoras", no: "第17章", title: "勾股定理", order: 2, source_pages: "pp.22-44",
          sections: [
            { section_id: "demo-sec-pythagoras-01", no: "17.1", title: "探索勾股定理", order: 1, source_pages: "pp.22-33" },
            { section_id: "demo-sec-pythagoras-02", no: "17.2", title: "勾股定理的逆定理", order: 2, source_pages: "pp.34-44", coverage_note: "复习周补齐节级数据（09-16 复习课+09-18 复习单）；节空态演示已迁移至边界样例（见 portrait-data-coverage boundary_samples）" },
          ] },
        { chapter_id: "demo-ch-quad", no: "第18章", title: "平行四边形", order: 3, source_pages: "pp.46-70",
          sections: [
            { section_id: "demo-sec-quad-01", no: "18.1", title: "平行四边形", order: 1, source_pages: "pp.46-58" },
            { section_id: "demo-sec-quad-02", no: "18.2", title: "特殊的平行四边形", order: 2, source_pages: "pp.59-70" },
          ] },
        { chapter_id: "demo-ch-function", no: "第19章", title: "一次函数", order: 4, source_pages: "pp.73-112",
          sections: [
            { section_id: "demo-sec-function-01", no: "19.1", title: "函数", order: 1, source_pages: "pp.73-76" },
            { section_id: "demo-sec-function-02", no: "19.2", title: "一次函数的图像与性质", order: 2, source_pages: "pp.77-109" },
            { section_id: "demo-sec-function-03", no: "19.3", title: "课题学习·选择方案", order: 3, source_pages: "pp.110-112" },
          ] },
        { chapter_id: "demo-ch-data", no: "第20章", title: "数据的分析", order: 5, source_pages: "pp.113-134",
          sections: [
            { section_id: "demo-sec-data-01", no: "20.1", title: "数据的集中趋势", order: 1, source_pages: "pp.113-125", coverage_note: "09-19 前测（标注采集）+09-22 起始课+当晚作业；节级数据自 09-22 起补齐" },
            { section_id: "demo-sec-data-02", no: "20.2", title: "数据的波动程度", order: 2, source_pages: "pp.126-134", coverage_note: "09-20 波动直觉经验调查（标注采集，方差未教）+09-22 课堂经验讨论；正式新授自 09-24 起（滚动日程）" },
          ] },
      ],
    },
    {
      // 边界：同名节跨教材（“二次根式”在另一教材体系也是节名），校验不同教材节点不可混用
      textbook_id: "demo-math-g8-vol1-alt-v1", name: "北师大版初中数学八年级上册（演示对照）", publisher: "北京师范大学出版社", edition_year: "2012课标版",
      grade: "g8", volume: "上册", review_status: "draft",
      source_note: "仅用于「同名不同教材节点」边界演示，未作为主演示目录。",
      chapters: [
        { chapter_id: "demo-alt-ch-real", no: "第2章", title: "实数", order: 1, source_pages: "pp.35-50",
          sections: [{ section_id: "demo-alt-sec-real-07", no: "7", title: "二次根式", order: 7, source_pages: "pp.45-50",
            name_collision_note: "节名「二次根式」与主演示教材第16章同名但非同一节点，属于不同 textbook_id 命名空间" }] },
      ],
    },
  ],
  notes: [
    "教材目录为演示候选（is_demo），教师确认前不得宣称权威；页码锚点来自 graph4rec 教材图谱。",
    "demo-sec-pythagoras-02 / demo-sec-quad-02 / demo-sec-data-02 故意不配作答与观测数据，供空态与覆盖率演示。",
  ],
};

/* ================= 2. curriculum-links.json ================= */
// kp-* 取自画像图谱 20 节点；中文 cluster 取自 knowledge.json；映射为显式人工表
const LINK_ROWS = [
  { cluster: "二次根式", kp_ids: ["kp-radical"], section_id: "demo-sec-radical-01", textbook_id: TB, status: "mapped" },
  { cluster: "二次根式及其性质", kp_ids: [], section_id: "demo-sec-radical-01", textbook_id: TB, status: "mapped", note: "画像图谱未建该 kp 节点，仅资源侧使用中文 cluster" },
  { cluster: null, kp_ids: ["kp-radical-muldvd"], section_id: "demo-sec-radical-02", textbook_id: TB, status: "mapped", note: "题库 cluster 无「二次根式的乘除」条目（目录有节），仅 kp 侧映射" },
  { cluster: "二次根式的加法与减法", kp_ids: ["kp-radical-addsub"], section_id: "demo-sec-radical-03", textbook_id: TB, status: "mapped" },
  { cluster: "勾股定理", kp_ids: ["kp-pythagoras"], section_id: "demo-sec-pythagoras-01", textbook_id: TB, status: "mapped" },
  { cluster: "勾股定理的逆定理及其应用", kp_ids: [], section_id: "demo-sec-pythagoras-02", textbook_id: TB, status: "mapped" },
  { cluster: null, kp_ids: ["kp-parallelogram"], section_id: "demo-sec-quad-01", textbook_id: TB, status: "mapped", note: "题库该章簇为「四边形/四边形及多边形」，节名「平行四边形」仅 kp 侧映射" },
  { cluster: "特殊的平行四边形", kp_ids: ["kp-special-quad"], section_id: "demo-sec-quad-02", textbook_id: TB, status: "mapped" },
  { cluster: "函数", kp_ids: ["kp-function"], section_id: "demo-sec-function-01", textbook_id: TB, status: "mapped" },
  { cluster: "函数的概念", kp_ids: [], section_id: "demo-sec-function-01", textbook_id: TB, status: "mapped" },
  { cluster: "一次函数的图象和性质", kp_ids: ["kp-function-image", "kp-function-property"], section_id: "demo-sec-function-02", textbook_id: TB, status: "mapped", note: "图像识读与性质归纳同属 19.2，两 kp 节点共享一节" },
  { cluster: "实际问题与一次函数", kp_ids: ["kp-function-application"], section_id: "demo-sec-function-03", textbook_id: TB, status: "mapped" },
  { cluster: "数据的集中趋势", kp_ids: [], section_id: "demo-sec-data-01", textbook_id: TB, status: "mapped" },
  // 跨节资源：图像解释类内容同时服务 19.2 与 19.3（方案选择的图像决策）
  { cluster: "一次函数与方程 (组）不等式", kp_ids: [], section_ids: ["demo-sec-function-02", "demo-sec-function-03"], textbook_id: TB, status: "mapped_cross_section", note: "跨节节点：同章两节均涉及" },
  { cluster: "勾股定理的逆定理及其应用", kp_ids: ["kp-pythagoras-inverse"], section_id: "demo-sec-pythagoras-02", textbook_id: TB, status: "mapped" },
  { cluster: "数据的集中趋势", kp_ids: ["kp-data-central-tendency"], section_id: "demo-sec-data-01", textbook_id: TB, status: "mapped" },
  { cluster: "数据的离散程度", kp_ids: ["kp-data-dispersion"], section_id: "demo-sec-data-02", textbook_id: TB, status: "mapped" },
  // 未映射样本：七年级/八上前置与无关簇（不模糊匹配到八下目录）
  { cluster: "平面直角坐标系", kp_ids: ["kp-coordinate"], section_id: null, textbook_id: null, status: "unmapped", note: "七年级前置知识，不在本册目录；待补 g7 目录后映射" },
  { cluster: "三角形全等的判定", kp_ids: ["kp-congruent-judge"], section_id: null, textbook_id: null, status: "unmapped", note: "八上第12章内容，待补八上目录" },
  { cluster: "整式的乘法", kp_ids: ["kp-integral-multiply"], section_id: null, textbook_id: null, status: "unmapped", note: "八上第14章内容" },
  { cluster: "分式", kp_ids: ["kp-fraction", "kp-fraction-properties", "kp-fraction-calc"], section_id: null, textbook_id: null, status: "unmapped", note: "八上第15章内容" },
  { cluster: "轴对称", kp_ids: ["kp-axisymmetry"], section_id: null, textbook_id: null, status: "unmapped", note: "八上第13章内容" },
  { cluster: "一元二次方程", kp_ids: [], section_id: null, textbook_id: null, status: "unmapped", note: "九年级内容，演示范围外" },
];
const links = {
  schema_version: "curriculum-links-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  namespace_note: "中文 cluster（题库/资源图谱）、kp-*（画像图谱）、demo-sec-*（课程目录）是三套命名空间；本表为唯一显式映射，禁止按名称模糊匹配或跨命名空间直连。",
  mapping_rules: [
    "映射键包含 subject_id、textbook_id 与版本；同名节在不同教材下不可互换。",
    "status=mapped 的行方可用于课程筛选与统计；unmapped 记录保留原值不猜测归属。",
    "资源可用范围（knowledge_ids 含某节）不等于学生已学证据；已学证据以观测/作答的课程归属字段为准。",
  ],
  rows: LINK_ROWS.map((r) => ({ subject_id: "math", ...r })),
  unmapped_summary: "本演示包仅映射八下 5 章 12 节；八上/七年级/九年级簇显式 unmapped，待目录确认后补。",
};

/* ================= 3. teaching-units.json ================= */
const units = {
  schema_version: "teaching-units-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  units: [
    {
      unit_id: "demo-unit-radical", title: "二次根式单元（章型）", textbook_id: TB,
      scope: { type: "chapter", chapter_ids: ["demo-ch-radical"], section_ids: ["demo-sec-radical-01", "demo-sec-radical-02", "demo-sec-radical-03"] },
      unit_goals: [
        { goal_id: "demo-ug-radical-01", behavior: "能说明二次根式有意义的条件并举正反例", condition: "给定含根式的式子", output: "条件判断与例证", standard_ids: ["std-shushi-8"], mapping_status: "mapped" },
        { goal_id: "demo-ug-radical-02", behavior: "能按化简—判同类—合并完成二次根式加减并写明依据", condition: "3-4 个根式混合运算", output: "完整步骤与依据", standard_ids: ["std-shushi-8"], mapping_status: "mapped" },
      ],
      lesson_ids: ["demo-lesson-rad-01", "demo-lesson-rad-02", "demo-lesson-rad-03"],
      status: "confirmed", confirmed_at: "2026-09-10 10:00", confirmed_by: "demo-teacher-t001",
      link_note: "与教研共识「运算三步自查单」（research-topics.json research-002）对应。",
    },
    {
      unit_id: "demo-unit-linear-app", title: "一次函数方案选择单元（跨章型）", textbook_id: TB,
      scope: { type: "cross_chapter", chapter_ids: ["demo-ch-function", "demo-ch-radical", "demo-ch-data"], section_ids: ["demo-sec-function-02", "demo-sec-function-03", "demo-sec-radical-03", "demo-sec-data-01"] },
      unit_goals: [
        { goal_id: "demo-ug-lin-01", behavior: "能用一次函数图像比较两种方案并分区间作出决策", condition: "给定两方案费用规则", output: "建模、图像与区间结论", standard_ids: ["std-func-4", "std-func-req"], mapping_status: "mapped" },
        { goal_id: "demo-ug-lin-02", behavior: "能用平均数等集中趋势量支撑方案比较的论证", condition: "方案含多次试测数据", output: "含数据依据的决策说明", standard_ids: ["std-stat-avg"], mapping_status: "mapped" },
      ],
      lesson_ids: ["demo-lesson-lin-01", "demo-lesson-lin-02"],
      status: "draft",
      link_note: "跨章单元：以第19章选择方案为主，根式运算（16.3）为计算支撑、数据分析（20.1）为论证支撑。",
    },
    {
      unit_id: "demo-unit-data", title: "数据的分析起始单元（章型·草稿）", textbook_id: TB,
      scope: { type: "chapter", chapter_ids: ["demo-ch-data"], section_ids: ["demo-sec-data-01"] },
      unit_goals: [
        { goal_id: "demo-ug-data-01", behavior: "能计算平均数、中位数、众数与加权平均数并说明各自适用的情境", condition: "给定一组或多组数据", output: "统计量计算与选择理由", standard_ids: ["std-stat-avg"], mapping_status: "mapped" },
        { goal_id: "demo-ug-data-02", behavior: "能用集中趋势量支撑简单决策并说明局限", condition: "方案比较含异常值数据", output: "含数据依据的决策说明", standard_ids: ["std-stat-avg", "std-quality-3dim"], mapping_status: "mapped" },
      ],
      lesson_ids: ["demo-lesson-data-01"],
      status: "draft",
      link_note: "2026-09-22 起始课创建的草稿单元；对应课标「抽样与数据分析」内容要求（4）。",
    },
  ],
  // 边界：历史课时（旧学期创建）尚未关联任何单元
  unlinked_lessons: [{ lesson_id: "demo-lesson-hist-geo-01", title: "全等三角形判定复习课（历史课时）", created_at: "2026-06-11", note: "早于单元体系创建，尚未关联，供「历史课时未关联」演示" }],
};

/* ================= 4. curriculum-standards.json ================= */
const STD_DOC = "义务教育数学课程标准（2022年版 2025年修订）";
const STD_FILE = "层次化md课标/义教课标/03_数学.md"; // 原文由用户提供（工作区上级目录）
const S_ = (path, anchor, page, text, status, extra) => ({ document_title: STD_DOC, edition: "2022年版2025年修订", subject_id: "math", stage_id: "junior", applicable_grades: ["g7", "g8", "g9"],
  section_path: path, source_file: STD_FILE, source_anchor: anchor, source_page: page, source_url: null,
  source_hash: null, source_text: text, review_status: status, reviewer: null, reviewed_at: null, ...extra });
const standards = {
  schema_version: "curriculum-standards-v2", data_version: "demo-v2", is_demo: true, demo_reference_date: REF_DATE,
  provenance_note: "原文已由用户提供（层次化md课标/义教课标/03_数学.md，位于工作区上级目录）。source_anchor 为该 md 的行号锚点（L 行号），source_page 为纸版目录近似页码，待按纸质版核对后替换。审核状态统一 in_review：原文到位不等于学科专家已完成核对。",
  standards: [
    S_("四、课程内容·初中·数与代数·数与式·内容要求", "L929", "约p.56", "了解二次根式、最简二次根式的概念，了解二次根式（根号下仅限于数）加、减、乘、除运算法则，会用它们进行简单的四则运算。", "in_review", { standard_id: "std-shushi-8" }),
    S_("四、课程内容·初中·数与代数·函数·一次函数·内容要求", "L984-986", "约p.60", "结合具体情境体会一次函数的意义，能根据已知条件确定一次函数的表达式（例70）；会运用待定系数法确定一次函数的表达式。", "in_review", { standard_id: "std-func-1" }),
    S_("四、课程内容·初中·数与代数·函数·一次函数·内容要求", "L988", "约p.60", "能画一次函数的图象，根据图象和表达式 y = kx + b（k ≠ 0）探索并理解 k > 0 和 k < 0 时图象的变化情况；理解正比例函数。", "in_review", { standard_id: "std-func-2" }),
    S_("四、课程内容·初中·数与代数·函数·一次函数·内容要求", "L991", "约p.60", "能用一次函数解决简单实际问题。", "in_review", { standard_id: "std-func-4" }),
    S_("四、课程内容·初中·数与代数·函数·一次函数·学业要求", "L1046", "约p.66", "能根据简单实际问题中的已知条件确定一次函数的表达式；会在不同问题情境中运用待定系数法确定一次函数的表达式；会画出一次函数的图象；会根据一次函数的表达式求其图象与坐标轴的交点坐标；会根据一次函数的图象和表达式 y = kx + b (k ≠ 0)，探索并理解 k 值的变化对函数图象的影响。……能在实际问题中列出一次函数的表达式，并结合一次函数的图象与表达式的性质等解决简单的实际问题。（节选，全文见原文 L1046）", "in_review", { standard_id: "std-func-req", excerpt: true }),
    S_("四、课程内容·初中·图形与几何·图形的性质·内容要求", "L1146", "约p.68", "探索勾股定理及其逆定理，并能运用它们解决一些简单的实际问题。", "in_review", { standard_id: "std-geo-pythagoras" }),
    S_("四、课程内容·初中·图形与几何·图形的性质·内容要求", "L1160-1162", "约p.69", "理解平行四边形、矩形、菱形、正方形、梯形的概念，以及它们之间的关系；了解四边形的不稳定性。探索并证明平行四边形的性质定理：平行四边形的对边相等、对角相等、对角线互相平分。探索并证明平行四边形的判定定理：一组对边平行且相等的四边形是平行四边形；两组对边分别相等的四边形是平行四边形；对角线互相平分的四边形是平行四边形。（L1160-1162 连续节选）", "in_review", { standard_id: "std-geo-quad", excerpt: true }),
    S_("四、课程内容·初中·统计与概率·抽样与数据分析·内容要求", "L1337-1339", "约p.75", "理解平均数、中位数、众数的意义，能计算中位数、众数、加权平均数，知道它们是对数据集中趋势的描述（例84）。", "in_review", { standard_id: "std-stat-avg" }),
    S_("五、学业质量·（二）学业质量描述", "L1426-1432", "约p.80", "（1）以结构化数学知识主题为载体，在形成与发展“四基”的过程中所形成的抽象能力、推理能力、运算能力、几何直观和空间观念等。（2）从学生熟悉的生活与社会情境，以及符合学生认知发展规律的数学与科技情境中，在经历“用数学的眼光发现和提出问题，用数学的思维与数学的语言分析和解决问题”的过程中所形成的模型观念、数据观念、应用意识和创新意识等。（3）学生经历数学的学习运用、实践探索活动的经验积累，逐步产生对数学的好奇心、求知欲，以及对数学学习的兴趣和自信心，初步养成独立思考、探究质疑、合作交流等学习习惯，初步形成自我反思的意识。", "in_review", { standard_id: "std-quality-3dim", note: "学业质量三维描述：素养画像解释口径的上位依据（清单 §1 要求的学业质量描述）" }),
    S_("四、课程内容·初中·数与代数·函数·函数的概念·内容要求", "L976-980", "约p.59", "①探索简单实例中的数量关系和变化规律，了解常量、变量的意义；了解函数的概念和表示法，能举出函数的实例。②能结合图象对简单实际问题中的函数关系进行分析（例68）。③能确定简单实际问题中函数自变量的取值范围，会求函数值。④能用适当的函数表示法刻画简单实际问题中变量之间的关系，理解函数值的意义（例69）。⑤结合对函数关系的分析，能对变量的变化情况进行初步讨论。", "in_review", { standard_id: "std-func-concept" }),
    S_("四、课程内容·初中·图形与几何·图形的性质·内容要求", "L1166", "约p.69", "探索并证明矩形、菱形的性质定理：矩形的四个角都是直角，对角线相等；菱形的四条边相等，对角线互相垂直。探索并证明矩形、菱形的判定定理：三个角是直角的四边形是矩形，对角线相等的平行四边形是矩形；四边相等的四边形是菱形，对角线互相垂直的平行四边形是菱形。正方形既是矩形，又是菱形；理解矩形、菱形、正方形之间的包含关系。", "in_review", { standard_id: "std-geo-special-quad" }),
    S_("四、课程内容·初中·统计与概率·抽样与数据分析·内容要求", "L1341", "约p.75", "体会刻画数据离散程度的意义，会计算一组简单数据的离差平方和、方差。", "in_review", { standard_id: "std-stat-variance" }),
    S_("三、课程目标·（一）核心素养内涵", "L139", "约p.5", "初中阶段，核心素养主要表现为：抽象能力、运算能力、几何直观、空间观念、推理能力、数据观念、模型观念、应用意识、创新意识。", "in_review", { standard_id: "std-core-competencies", note: "九项核心素养名称的上位依据：仅作框架命名与解释口径引用，不自动赋予学生九维分数（清单 §6）。" }),
    { standard_id: "demo-std-000", document_title: "义务教育数学课程标准（2011年版）·数与代数（旧版候选）", edition: "2011", subject_id: "math", stage_id: "junior", applicable_grades: ["g8"],
      section_path: "课程内容·数与代数", source_text: "了解二次根式（根号下仅含数字）的概念及其运算。（旧版转述）",
      source_file: null, source_anchor: null, source_page: null, source_url: null, source_hash: null,
      review_status: "deprecated", reviewer: null, reviewed_at: null, superseded_by: "std-shushi-8",
      notes: "版本关系边界演示：旧版条目由 2022 版 2025 修订条目替代。" },
  ],
  mapping_policy: "standard_ids 为空 = awaiting_source（对应条目未提供或不适用）；课标映射完成不代表量规有效性已验证，两者审核状态分别管理。行号锚点指向用户提供的 md 原文，可直接回查。",
};

/* ================= 5. subject-frameworks.json ================= */
const frameworks = {
  schema_version: "subject-frameworks-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  frameworks: [
    {
      framework_id: "demo-math-framework-v1", version: "v1", subject_id: "math", stage_id: "junior", grade_scope: ["g7", "g8", "g9"],
      standard_version: null, effective_at: "2026-09-01", status: "draft",
      revision_note: "演示草案框架；指标定义与阈值为合成演示，未经专家审核。",
      indicators: [
        { indicator_id: "demo-ind-operation", name: "代数运算的准确与规范", definition: "在给定运算法则下完成化简与计算，并逐步写明依据。",
          applicable_tasks: ["根式化简", "根式加减", "分式运算"], standard_ids: ["std-shushi-8"], allowed_evidence_types: ["homework", "exam", "practice"],
          rubric_ids: ["demo-rubric-operation-v1"], interpretation_limits: "不推断细心程度等个性特征；仅评价本次任务表现。", status: "in_review",
          portrait_views: ["knowledge", "ability"] },
        { indicator_id: "demo-ind-graph-expression", name: "函数图像的读取与表达", definition: "从图像读取关键信息，并用点—线—趋势结构解释变化与实际意义。",
          applicable_tasks: ["图像解释口头表达", "读图题", "表格-图像互译"], standard_ids: ["std-func-2"], allowed_evidence_types: ["classroom", "exam", "homework"],
          rubric_ids: ["demo-rubric-expression-v1"], interpretation_limits: "口头表达评分仅在支架句式撤除后使用；不据单次发言定级。", status: "in_review",
          portrait_views: ["knowledge", "ability", "process"] },
        { indicator_id: "demo-ind-modeling", name: "实际情境的建模与决策", definition: "从情境中识别变量关系、建立一次函数模型并分区间作出决策。",
          applicable_tasks: ["方案选择", "分段计费", "弹簧测量"], standard_ids: ["std-func-4", "std-func-req"], allowed_evidence_types: ["exam", "practice", "classroom"],
          rubric_ids: ["demo-rubric-modeling-v1"], interpretation_limits: "情境经验差异影响表现，评读时结合 learner-contexts 的经验记录。", status: "draft",
          portrait_views: ["knowledge", "ability"] },
        { indicator_id: "demo-ind-reasoning-expression", name: "推理过程的表达与依据", definition: "书写或口述推理时引用正确的定理/法则作为依据。",
          applicable_tasks: ["几何说理", "订正说明"], standard_ids: [], allowed_evidence_types: ["exam", "homework"],
          rubric_ids: ["demo-rubric-correction-v1"], interpretation_limits: "无证据时不给等级；未评分不等于零分。", status: "draft", mapping_status: "awaiting_source",
          portrait_views: ["ability", "process"] },
        // 边界：指标不适用（协作证据来源未接入）
        { indicator_id: "demo-ind-collaboration", name: "小组协作贡献", definition: "小组任务中的分工完成与协作贡献。",
          applicable_tasks: [], standard_ids: [], allowed_evidence_types: [], rubric_ids: [], status: "suspended",
          interpretation_limits: "个体贡献证据来源未接入，暂不评价个人协作；小组产出不平均摊派给成员。", suspension_reason: "无可用证据来源（清单 §1 建议 B 未提供）",
          portrait_views: [] },
      ],
    },
  ],
};

/* ================= 6. assessment-rubrics.json ================= */
const rubrics = {
  schema_version: "assessment-rubrics-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  threshold_note: "本文件所有等级与阈值均为 demo_only 演示口径，未经评分者间一致性检验，不得作为正式评价标准。",
  rubrics: [
    {
      rubric_id: "demo-rubric-expression-v1", version: "v1", indicator_id: "demo-ind-graph-expression", subject_id: "math", grades: ["g8"],
      task_conditions: "一次函数图像解释任务（口头或书面），支架句式已撤除", forbidden_extrapolation: "不得据表达质量推断学习态度或动机",
      levels: [
        { level: 0, description: "未能描述图像", observable: "未开口或只重复题目语言" },
        { level: 1, description: "读出孤立数据点", observable: "只报交点/端点坐标" },
        { level: 2, description: "点与趋势部分到位", observable: "能读关键点并说出变化方向，实际意义缺失或错误" },
        { level: 3, description: "结构完整", observable: "点—线—趋势齐全，实际意义基本准确" },
        { level: 4, description: "完整且联系情境", observable: "三步齐全并主动联系情境解释斜率/截距含义" },
      ],
      anchors: { positive: [{ desc: "“因为 k<0，所以 y 随 x 增大而减小；在注水情境里表示放水速度为 3 升/分。”", level: 4 }],
        negative: [{ desc: "“图像是往下的。”（未指明 y 随 x、未联系情境）", level: 1 }],
        boundary: [{ desc: "三步齐全但“实际意义”照抄题干未作解释", level: 3, note: "边界样例：介于 2 与 3 之间取 3，需二评" }] },
      evidence_required: ["课堂口头记录或书面作答"], missing_evidence_rule: "无记录则该次任务不计等级", conflict_rule: "口头与书面矛盾时取书面并记录分歧",
      review_status: "in_review", author: "demo-teacher-t001",
      review_records: [{ reviewer_id: "demo-teacher-t002", reviewed_at: "2026-09-15", result: "建议补充 level 2 与 3 的区分锚例", agreed_level: null },
        { reviewer_id: "demo-teacher-t001", reviewed_at: "2026-09-16", result: "已补边界锚例，待第二轮试评", agreed_level: null }],
      trial_scoring: { task: "demo 图像解释口头任务", raters: 2, items: 8, agreement_note: "两评分者 6/8 一致；分歧集中于 level 2-3 边界（见 boundary 锚例）。演示记录，非心理测量结论。" },
      anchor_source: "合成演示样例", is_demo: true,
    },
    {
      rubric_id: "demo-rubric-operation-v1", version: "v1", indicator_id: "demo-ind-operation", subject_id: "math", grades: ["g8"],
      task_conditions: "二次根式化简与加减（3-4 项混合）", forbidden_extrapolation: "不得据运算错误推断智力或能力上限",
      levels: [
        { level: 0, description: "未作答或全错", observable: "空白或法则性错误（如根号直接相加）" },
        { level: 1, description: "化简部分正确", observable: "能化简个别根式，未完成合并" },
        { level: 2, description: "化简正确、合并出错", observable: "最简形式正确但合并时符号或系数错" },
        { level: 3, description: "结果正确依据不全", observable: "答案正确但未写关键步骤依据" },
        { level: 4, description: "结果与依据完整", observable: "化简—判同类—合并三步齐全且每步有依据" },
      ],
      anchors: { positive: [{ desc: "√18+√8 = 3√2+2√2 = 5√2（合并同类项）", level: 4 }],
        negative: [{ desc: "√18+√8 = √26", level: 0 }],
        boundary: [{ desc: "结果 5√2 正确但直接写“合并”未说明 3√2 与 2√2 是同类二次根式", level: 3 }] },
      evidence_required: ["含步骤的作答"], missing_evidence_rule: "仅答案无步骤时按 level 3 上限评并标记 needs_steps", conflict_rule: "订正后正确不回改首测等级",
      review_status: "draft", review_records: [], author: "demo-teacher-t001",
      review_note: "未审核（演示「量规未审核」边界）：启用前需至少两名评分者试评。",
      anchor_source: "合成演示样例", is_demo: true,
    },
    {
      rubric_id: "demo-rubric-modeling-v1", version: "v1", indicator_id: "demo-ind-modeling", subject_id: "math", grades: ["g8"],
      task_conditions: "含两种方案的实际情境建模", forbidden_extrapolation: "不得据单次建模失败推断迁移能力缺陷",
      levels: [
        { level: 0, description: "未建立关系直接猜数", observable: "无函数式、无图像" },
        { level: 1, description: "建立单一关系", observable: "只列一个方案的表达式" },
        { level: 2, description: "两方案模型正确", observable: "两个解析式正确但未比较" },
        { level: 3, description: "比较但区间不完整", observable: "只答一个区间或忽略交点" },
        { level: 4, description: "完整区间决策", observable: "交点分界+三段区间+回答原问题" },
      ],
      anchors: { positive: [{ desc: "x<50 选 B，x=50 相同，x>50 选 A（配图像交点）", level: 4 }],
        negative: [{ desc: "答“B 更便宜”（无区间无依据）", level: 1 }],
        boundary: [{ desc: "区间正确但未回答原问题所问的量", level: 3 }] },
      evidence_required: ["建模过程与结论"], missing_evidence_rule: "仅结论无过程按 level 1 计并标记", conflict_rule: "情境经验差异参考 learner-contexts 后再定级",
      review_status: "draft", review_records: [], author: "demo-teacher-t001", anchor_source: "合成演示样例", is_demo: true,
    },
    {
      rubric_id: "demo-rubric-correction-v1", version: "v1", indicator_id: "demo-ind-reasoning-expression", subject_id: "math", grades: ["g7", "g8", "g9"],
      task_conditions: "订正说明或几何说理书写", forbidden_extrapolation: "不得据书写规范推断学习习惯总体水平",
      levels: [
        { level: 0, description: "未订正", observable: "空白" },
        { level: 1, description: "仅抄答案", observable: "无错因无过程" },
        { level: 2, description: "重做无依据", observable: "过程对但引用依据缺失或错误" },
        { level: 3, description: "依据基本正确", observable: "关键步骤引用正确定理/法则" },
        { level: 4, description: "依据完整并自检", observable: "全依据+主动复测或反例检验" },
      ],
      anchors: { positive: [{ desc: "“……∴△ABC≌△DEF（SAS）”，并在订正单写明此前误用 ASA 的原因", level: 4 }],
        negative: [{ desc: "订正只写“粗心”", level: 1 }],
        boundary: [{ desc: "依据写了但定理名与条件顺序不符（SAS 写成 SSA）", level: 2 }] },
      evidence_required: ["订正单或说理书面"], missing_evidence_rule: "口头订正未记录时不计等级", conflict_rule: "与首测依据矛盾时记录冲突进诊断案例",
      review_status: "draft", review_records: [], author: "demo-teacher-t001", anchor_source: "合成演示样例", is_demo: true,
    },
  ],
};

/* ================= 7. learner-contexts.json ================= */
const stu = (sid) => { const s = findStudent(sid); return { student_id: s.student_id, name: s.name, class_id: s.class_id }; };
const learnerContexts = {
  schema_version: "learner-contexts-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  source_policy: "自述（self_report）、教师观察（observation）、未知（unknown）分开记录；unknown 不虚构；不将 8 名重点学生样本冒充全班调查。",
  students: [
    { ...stu(FOCUS.xu_li), contexts: [
      { aspect: "运算习惯", content: "订正时倾向直接抄正确答案，错因归类需教师督促", source: "observation", recorded_at: "2026-09-14", observer: "demo-teacher-t001" },
      { aspect: "生活情境经验", content: "自述“坐过出租车但没自己付过钱”，对起步价无概念", source: "self_report", recorded_at: "2026-09-17" },
      { aspect: "课后练习条件", content: "家中无固定练习时段", source: "unknown", recorded_at: null }] },
    { ...stu(FOCUS.huang_mingjing), contexts: [
      { aspect: "课堂参与方式", content: "小组内能倾听并执行分工，回避全班发言", source: "observation", recorded_at: "2026-09-16" },
      { aspect: "图像工具经验", content: "自述“小学用过温度计折线图”，对坐标顺序仍不稳", source: "self_report", recorded_at: "2026-09-16" },
      { aspect: "课后练习条件", content: "未知", source: "unknown", recorded_at: null }] },
    { ...stu(FOCUS.cao_ting), contexts: [
      { aspect: "运算习惯", content: "步骤完整规范，偶发抄写笔误；选择题常只写答案", source: "observation", recorded_at: "2026-09-15" },
      { aspect: "生活情境经验", content: "家里经营小卖部，对进价/售价/套餐情境熟悉", source: "self_report", recorded_at: "2026-09-17" }] },
    { ...stu(FOCUS.he_ning), contexts: [
      { aspect: "作答媒介", content: "拍照上传作业常模糊或残缺，需教师线下核对", source: "observation", recorded_at: "2026-09-12" },
      { aspect: "生活情境经验", content: "未知", source: "unknown", recorded_at: null }] },
    { ...stu(FOCUS.long_hao), contexts: [
      { aspect: "表达方式", content: "能算对但说不清依据，口头表达简略", source: "observation", recorded_at: "2026-09-18" },
      { aspect: "生活情境经验", content: "自述常玩策略类游戏，对“方案选择”情境上手快", source: "self_report", recorded_at: "2026-09-17" }] },
    { ...stu(FOCUS.peng_yuan), contexts: [
      { aspect: "运算习惯", content: "自查习惯稳定，答题卡步骤偶有跳步", source: "observation", recorded_at: "2026-09-15" }] },
    { ...stu(FOCUS.tan_min), contexts: [
      { aspect: "努力特征", content: "订正主动、频次高，但同类错误复现", source: "observation", recorded_at: "2026-09-14" },
      { aspect: "生活情境经验", content: "自述“帮家里看过水费单”，对阶梯水价有概念", source: "self_report", recorded_at: "2026-09-17" }] },
    { ...stu(FOCUS.gong_qiaoying), contexts: [
      { aspect: "运算习惯", content: "化简口径不稳定，同一题两次结果不同", source: "observation", recorded_at: "2026-09-13" },
      { aspect: "生活情境经验", content: "未知", source: "unknown", recorded_at: null }] },
  ],
  class_summaries: [
    { class_id: "cls-g8-01", aspects: [{ aspect: "整体经验", content: "多数学生有过共享单车/打车付费经验（口头调查，未全员）", source: "observation", coverage: "非全员调查，覆盖率未知" }] },
    { class_id: "cls-g8-02", aspects: [{ aspect: "整体经验", content: "约三分之二学生见过的水费/电费账单（教师观察+零星自述）", source: "mixed", coverage: "抽样印象" }] },
    { class_id: "cls-g8-03", aspects: [{ aspect: "整体经验", content: "方案选择类情境经验分化明显，建模课建议先过情境（见教学设计）", source: "observation", coverage: "重点学生访谈+课堂观察" }] },
  ],
  // §8 边界：小组任务个体贡献——一明一未知
  group_tasks: [
    { group_id: "demo-group-0301", task: "图像解释课小组互评（lesson demo-lesson-lin-01）", actor_ids: [FOCUS.cao_ting, FOCUS.huang_mingjing, "另2名成员（演示）"],
      contribution_evidence_ids: (JSON.parse(fs.readFileSync(path.join(DATA, "portrait-observations-cls-g8-03.json"), "utf-8")).events.find((e) => e.source_id === "lesson-g803-0916" && e.student_id === FOCUS.cao_ting) || {}).evidence_id ? [(JSON.parse(fs.readFileSync(path.join(DATA, "portrait-observations-cls-g8-03.json"), "utf-8")).events.find((e) => e.source_id === "lesson-g803-0916" && e.student_id === FOCUS.cao_ting)).evidence_id] : [], attribution: "clear", note: "曹婷的口头表达有独立事件记录，贡献可归属（ID 动态取自观测文件）" },
    { group_id: "demo-group-0302", task: "弹簧测量小组任务", actor_ids: [FOCUS.xu_li, "另3名成员（演示）"],
      contribution_evidence_ids: [], attribution: "unknown", student_id: null, note: "仅有小组产出（数据表一张），个人贡献未知，不摊派个人等级（§6.2）" },
  ],
};

/* ================= 8. learning-scenarios.json ================= */
const scenarios = {
  schema_version: "learning-scenarios-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  scenarios: [
    { scenario_id: "demo-scn-taxi", category: "交通出行", title: "出租车分段计费", problem: "起步价 8 元（3 公里内）+ 超出每公里 2.4 元，12 公里车费多少？",
      grade: "g8", section_ids: ["demo-sec-function-03"], knowledge_refs: { clusters: ["实际问题与一次函数"], kp_ids: ["kp-function-application"] },
      familiarity: "高（多数学生有乘车经验；徐丽等需先补起步价概念，见 learner-contexts）",
      materials: "计价规则卡片（无额外成本）", duration_minutes: 10, scaffold: "圈变量三问：不变量/变化量/起始值", output: "分段函数式与车费",
      boundary_note: null },
    { scenario_id: "demo-scn-plan", category: "通信消费", title: "两种视频会员方案选择", problem: "A 卡月费 20 元每部 3 元，B 卡无月费每部 6 元，每月看多少部时 A 更省？",
      grade: "g8", section_ids: ["demo-sec-function-03", "demo-sec-function-02"], knowledge_refs: { clusters: ["实际问题与一次函数"], kp_ids: ["kp-function-application"] },
      familiarity: "中（依赖家庭订阅经验）", materials: "无", duration_minutes: 15, scaffold: "半支架：先建两式再引导画同系图像", output: "交点与三段区间决策",
      boundary_note: null },
    { scenario_id: "demo-scn-water", category: "生活缴费", title: "阶梯水价计算", problem: "第一阶梯 3.5 元/吨（0-12 吨），第二阶梯 5 元/吨，某月用 15 吨水费多少？",
      grade: "g8", section_ids: ["demo-sec-function-03"], knowledge_refs: { clusters: ["实际问题与一次函数"], kp_ids: ["kp-function-application"] },
      familiarity: "中（谭敏等见过账单，部分学生从未见过）", materials: "水费账单样张（需准备）", duration_minutes: 12, scaffold: "先分段画图再计算",
      output: "分段模型与账单核验", boundary_note: null },
    { scenario_id: "demo-scn-spring", category: "校园实践", title: "弹簧挂重测长", problem: "弹簧原长 10cm，每挂 1kg 伸长 0.5cm，挂 8kg 时多长？50kg 还适用吗？",
      grade: "g8", section_ids: ["demo-sec-function-03"], knowledge_refs: { clusters: ["实际问题与一次函数"], kp_ids: ["kp-function-application"] },
      familiarity: "高（物理直觉强）", materials: "弹簧秤与砝码（实验室借，需预约）", duration_minutes: 20, scaffold: "数据表→描点→连线三步",
      output: "模型、预测与适用范围讨论", boundary_note: "材料不足风险：砝码需提前一周预约，缺材料时改用演示视频（记录于教学设计）" },
    { scenario_id: "demo-scn-member", category: "消费购物", title: "奶茶店会员卡决策", problem: "卡 15 元，会员每杯省 2 元，每月买几杯回本？",
      grade: "g8", section_ids: ["demo-sec-function-03"], knowledge_refs: { clusters: ["实际问题与一次函数"], kp_ids: ["kp-function-application"] },
      familiarity: "高", materials: "无", duration_minutes: 10, scaffold: "需支架：回本=两方案相等（学生常无“相等临界”经验）", output: "临界点解释",
      boundary_note: "需支架情境：直接放手正确率低（见 demo-rubric-modeling-v1 试评）" },
    { scenario_id: "demo-scn-flagpole", category: "校园实践", title: "旗杆高度测量", problem: "用影长与相似（或自制测角仪）估计旗杆高度",
      grade: "g8", section_ids: ["demo-sec-pythagoras-01", "demo-sec-function-02"], knowledge_refs: { clusters: ["勾股定理及其应用"], kp_ids: ["kp-pythagoras"] },
      familiarity: "中", materials: "卷尺、标杆（体育组借）；测角仪需自制", duration_minutes: 30, scaffold: "画图把实物抽象成直角三角形",
      output: "测量方案、数据与误差分析", boundary_note: "材料不足与天气依赖：备用方案为窗影/楼影数据（教学设计已列）" },
  ],
  category_summary: "覆盖交通出行/通信消费/生活缴费/校园实践/消费购物 5 类，≥3 类达标；2 个含材料不足或需支架边界说明。",
};

/* ================= 9. design-templates.json ================= */
const templates = {
  schema_version: "design-templates-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  disclaimer: "以下为演示模板结构，字段名参考海淀单元/课时模板的公开样式改编，未经合作学校认可，不称为海淀官方模板（清单 §2.3）。",
  templates: [
    { template_id: "demo-unit-tpl-v1", version: "v1", adopted_by: ["演示备课组"], source: "内部演示改编", type: "unit",
      fields: [
        { field_id: "unit.title", label: "单元名称", required: true, order: 1, input: "text" },
        { field_id: "unit.scope", label: "课程范围（章/节）", required: true, order: 2, input: "catalog_picker" },
        { field_id: "unit.goals", label: "单元目标（可观察行为）", required: true, order: 3, input: "goal_editor" },
        { field_id: "unit.learner_analysis", label: "学情分析（引用画像/观测）", required: true, order: 4, input: "portrait_ref" },
        { field_id: "unit.scenarios", label: "情境任务", required: false, order: 5, input: "scenario_ref" },
        { field_id: "unit.assessment", label: "评价方式与量规", required: true, order: 6, input: "rubric_ref" },
      ],
      sample: "teaching-units.json 的 demo-unit-radical 即按本模板填写（status=confirmed 的认可样例候选）。",
      acceptance_note: "认可样例需教研组复核后标记；当前仅演示。" },
    { template_id: "demo-lesson-tpl-v1", version: "v1", adopted_by: ["演示备课组"], source: "内部演示改编", type: "lesson",
      fields: [
        { field_id: "lesson.title", label: "课时名称", required: true, order: 1, input: "text" },
        { field_id: "lesson.unit_ref", label: "所属单元", required: true, order: 2, input: "unit_ref" },
        { field_id: "lesson.goals", label: "课时目标", required: true, order: 3, input: "goal_editor" },
        { field_id: "lesson.tasks", label: "任务链（含支架）", required: true, order: 4, input: "task_editor" },
        { field_id: "lesson.questions", label: "例题/作业题（白名单）", required: true, order: 5, input: "question_ref" },
        { field_id: "lesson.reflection", label: "课后反思", required: false, order: 6, input: "textarea" },
      ],
      sample: "design-workflows.json 各课时草稿按本模板分步生成。" },
  ],
  field_mappings: [
    { template_field_id: "unit.scope", step_key: "scope", data_path: "teaching-units.units[].scope", missing_handling: "必填，缺失则工作流不可确认" },
    { template_field_id: "unit.goals", step_key: "goals", data_path: "teaching-units.units[].unit_goals", missing_handling: "至少 1 条可观察行为" },
    { template_field_id: "unit.learner_analysis", step_key: "analysis", data_path: "design-workflows.lessons[].steps.analysis.draft", missing_handling: "可引用画像读数，未引用时提示但不阻断" },
    { template_field_id: "unit.assessment", step_key: "assessment", data_path: "design-workflows.lessons[].steps.assessment.draft", missing_handling: "须引用 assessment-rubrics 的 rubric_id" },
    { template_field_id: "lesson.questions", step_key: "questions", data_path: "design-workflows.lessons[].steps.questions.draft", missing_handling: "仅可引用白名单题目（diagnostic-attempts.questions）" },
  ],
};

/* ================= 10. design-workflows.json ================= */
const step = (key, draft, status, dialog) => ({ step_key: key, draft, status, ...(dialog ? { dialog } : {}) });
const workflows = {
  schema_version: "design-workflows-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  lessons: [
    { lesson_id: "demo-lesson-rad-01", title: "二次根式的概念与性质", unit_id: "demo-unit-radical", template_id: "demo-lesson-tpl-v1",
      status: "confirmed", version: 3, confirmed_at: "2026-09-11 09:00",
      steps: [
        step("goals", ["能说明 √a 有意义条件（a≥0）并举正反例", "能用三个数值检验 √(a²) 与 |a| 的关系"], "confirmed",
          [{ role: "ai", text: "建议补充“举反例”行为，使目标可观察。" }, { role: "teacher", text: "采纳，加入反例例证。", confirmed: true }]),
        step("analysis", ["画像：3 班根式概念读数偏低；观测显示概念条件遗漏类错误居多（见 portrait-observations）"], "confirmed"),
        step("tasks", ["辨析 √4/√0/√(-4)", "三值代入检验 √(a²)"], "confirmed"),
        step("questions", ["diag-r8-01", "diag-r8-02", "disc-r8-01"], "confirmed"),
        step("assessment", ["demo-rubric-operation-v1（口算环节）"], "confirmed"),
      ] },
    { lesson_id: "demo-lesson-rad-02", title: "二次根式的加减（三步自查单）", unit_id: "demo-unit-radical", template_id: "demo-lesson-tpl-v1",
      status: "confirmed", version: 2, confirmed_at: "2026-09-12 16:30",
      steps: [
        step("goals", ["能按化简—判同类—合并完成加减并写明依据"], "confirmed"),
        step("tasks", ["√18+√8 错例估算检验", "三步自查单上墙"], "confirmed"),
        step("questions", ["diag-r8-03", "diag-r8-08", "disc-r8-03", "disc-r8-08", "tran-r8-01"], "confirmed"),
        step("assessment", ["demo-rubric-operation-v1"], "confirmed"),
      ] },
    { lesson_id: "demo-lesson-rad-03", title: "二次根式的乘除", unit_id: "demo-unit-radical", template_id: "demo-lesson-tpl-v1",
      status: "draft", version: 1,
      steps: [
        step("goals", ["能用乘除法则化简二次根式"], "drafted"),
        step("questions", ["tran-r8-02"], "drafted"),
      ] },
    { lesson_id: "demo-lesson-lin-01", title: "选择方案：建模与图像决策（第 1 课时）", unit_id: "demo-unit-linear-app", template_id: "demo-lesson-tpl-v1",
      status: "draft", version: 2,
      steps: [
        step("goals", ["能建立两方案费用模型", "能用图像交点分区间比较"], "drafted"),
        step("analysis", ["learner-contexts：方案情境经验分化明显，先过情境再建模"], "drafted"),
        step("scenarios", ["demo-scn-plan", "demo-scn-member"], "drafted"),
        step("questions", ["diag-r8-06", "disc-r8-06", "tran-r8-04"], "drafted"),
        // 边界：生成失败后重试
        { step_key: "assessment", draft: null, status: "drafted",
          generation_note: { attempts: 2, first_failure_reason: "引用的量规 rubric_id 不存在（demo-rubric-decision-v1 拼写错误）", retry_result: "改引 demo-rubric-modeling-v1 后成功", fixed_at: "2026-09-18 14:20" },
          draft_after_retry: ["demo-rubric-modeling-v1"] },
      ] },
    { lesson_id: "demo-lesson-data-01", title: "数据的集中趋势·起始课", unit_id: "demo-unit-data", template_id: "demo-lesson-tpl-v1",
      status: "draft", version: 1,
      steps: [
        step("goals", ["能计算平均数、中位数、众数并说明适用情境（对应 std-stat-avg）"], "drafted"),
        step("analysis", ["learner-contexts：多数学生见过水费/电费账单（g8-02 约三分之二），异常值经验缺失"], "drafted"),
        step("scenarios", ["demo-scn-water"], "drafted"),
        step("questions", [], "drafted", [{ role: "ai", text: "建议从题库选取平均数计算题。" }, { role: "teacher", text: "暂缓：白名单尚未收录统计题，先以课堂活动为主（保留空数组演示待补状态）。", confirmed: true }]),
      ] },
    { lesson_id: "demo-lesson-lin-02", title: "选择方案：数据支撑与综合决策（第 2 课时）", unit_id: "demo-unit-linear-app", template_id: "demo-lesson-tpl-v1",
      status: "needs_review", version: 2, needs_review_reason: "上游变更：单元目标 demo-ug-lin-02 于 2026-09-19 修改（增加集中趋势论证），本课时草稿需复核后重新确认。",
      upstream_change: { entity: "teaching-units.demo-unit-linear-app.unit_goals[1]", changed_at: "2026-09-19", effect: "analysis/tasks 两步需重查" },
      steps: [
        step("goals", ["（待复核）原目标未含集中趋势论证"], "stale"),
        step("tasks", ["（待复核）"], "stale"),
        step("questions", ["tran-r8-04", "tran-r8-08"], "stale"),
      ] },
  ],
  dialog_policy: "分步对话保留输入快照与教师回复；上游修改可追溯下游影响（见 demo-lesson-lin-02.upstream_change）。",
};

/* ================= 11. research-tools.json ================= */
const researchTools = {
  schema_version: "research-tools-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  note: "教研工具 Tab 样例（共备/课例研讨/量规评议）；原论坛 10 议题保留在 research-topics.json，forum_link 指向。",
  forum_link: { file: "research-topics.json", topic_count: 10, note: "论坛数据不复制、不丢弃" },
  tools: [
    { tool_id: "tool-co-prep", name: "单元共备", examples: [
      { example_id: "cp-01", title: "16.3 二次根式加减 · 共备记录", unit_id: "demo-unit-radical", lesson_id: "demo-lesson-rad-02",
        agenda: ["错例定位（√18+√8=√26）", "三步自查单文本定稿", "分层作业分工"], participants: ["t-001", "t-003", "t-005"],
        decisions: ["自查单贴作业本首页", "基础/标准/挑战三层题量 3:2:1"], created_at: "2026-09-12 16:30", preview: { lines: ["主持人：李老师", "争议点：挑战层是否引入双重根式 → 表决保留为选做"] } },
      { example_id: "cp-02", title: "19.3 选择方案 · 共备议程", unit_id: "demo-unit-linear-app", lesson_id: "demo-lesson-lin-01",
        agenda: ["情境过桥（会员卡先讲）", "图像决策四步板书", "弹簧任务材料预约确认"], participants: ["t-001", "t-002", "t-004"],
        decisions: ["砝码缺材料时启用演示视频（demo-scn-spring 边界）"], created_at: "2026-09-17 10:00", preview: { lines: ["待办：体育组借标杆；预约实验室"] } },
    ] },
    { tool_id: "tool-lesson-study", name: "课例研讨", examples: [
      { example_id: "ls-01", title: "图像解释支架课 · 课后研讨", lesson_id: "demo-lesson-lin-01", topic_id: "research-001",
        records: ["口头三步表达完整率 9/14（支架句式撤除后）", "黄明静小组内完成两轮表达（见观测 chapter_only 记录）"],
        follow_ups: ["下轮保留半支架两题"], created_at: "2026-09-16 17:00", preview: { lines: ["观察员：周老师", "改进点：实际意义环节给反例"] } },
      { example_id: "ls-02", title: "根式运算讲评课 · 课例记录", lesson_id: "demo-lesson-rad-02",
        records: ["自查单使用率 12/14", "谭敏同类错误复现（见 diagnostic-cases case-04）"], follow_ups: ["错因归类四选一模板上线"], created_at: "2026-09-13 15:00", preview: { lines: ["记录人：吴老师"] } },
    ] },
    { tool_id: "tool-rubric-review", name: "量规评议", examples: [
      { example_id: "rr-01", title: "demo-rubric-expression-v1 试评评议", rubric_id: "demo-rubric-expression-v1",
        records: ["两评分者 6/8 一致，分歧集中 level 2-3", "决议：补边界锚例后二轮试评"], participants: ["t-001", "t-002"],
        created_at: "2026-09-16 11:00", preview: { lines: ["样例：“三步齐全但实际意义照抄题干” 定级 3（二评）"] } },
      { example_id: "rr-02", title: "demo-rubric-operation-v1 待审说明", rubric_id: "demo-rubric-operation-v1",
        records: ["该量规尚未试评（review_status=draft）", "启用前需两名评分者独立试评 8 份"], participants: [],
        created_at: "2026-09-18 09:00", preview: { lines: ["状态：未审核（边界演示）"] } },
    ] },
  ],
  empty_states: [
    { tool_id: "tool-co-prep", scope: "demo-lesson-hist-geo-01", reason: "历史课时未关联单元，共备记录待迁移（演示空态）" },
  ],
};

/* ================= 输出 ================= */
console.log("生成课程底座与教学设计数据集 →");
w("curriculum-catalog.json", catalog);
w("curriculum-links.json", links);
w("teaching-units.json", units);
w("curriculum-standards.json", standards);
w("subject-frameworks.json", frameworks);
w("assessment-rubrics.json", rubrics);
w("learner-contexts.json", learnerContexts);
w("learning-scenarios.json", scenarios);
w("design-templates.json", templates);
w("design-workflows.json", workflows);
w("research-tools.json", researchTools);

/* ================= 12. portrait-demo-scenarios.json（演示路线与边界，交付验收配置） ================= */
const obsIds = (cid, sid, sec, win) => JSON.parse(fs.readFileSync(path.join(DATA, `portrait-observations-${cid}.json`), "utf-8"))
  .events.filter((e) => e.valid && (!sid || e.student_id === sid) && (!sec || (e.section_ids || []).includes(sec)))
  .slice(0, 3).map((e) => e.evidence_id);
const SEC_TITLE_SCEN = { "demo-sec-radical-01": 1, "demo-sec-radical-02": 1, "demo-sec-radical-03": 1, "demo-sec-pythagoras-01": 1, "demo-sec-pythagoras-02": 1,
  "demo-sec-quad-01": 1, "demo-sec-quad-02": 1, "demo-sec-function-01": 1, "demo-sec-function-02": 1, "demo-sec-function-03": 1, "demo-sec-data-01": 1, "demo-sec-data-02": 1 };
const demoScenarios = {
  schema_version: "portrait-demo-scenarios-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  note: "正常与边界演示路线配置（验收用，不要求新 UI）；evidence_ids 为当前数据中的真实样例（重生成后仍可按条件检索）。",
  normal_routes: [
    { id: "route-home", title: "首页进入学情", url_condition: { date: "默认近1月", scope: "全部章节", source: "全部" }, expect: "三班均有画像、分布、趋势、来源和证据" },
    { id: "route-chapter-switch", title: "依次切换 5 章", url_condition: { chapter: ["demo-ch-radical", "demo-ch-pythagoras", "demo-ch-quad", "demo-ch-function", "demo-ch-data"] }, expect: "读数与知识节点对应本章，不回填其他章分数" },
    { id: "route-section-switch", title: "依次切换 12 节", url_condition: { section: Object.keys(SEC_TITLE_SCEN) }, expect: "节级有效任务与四维观察；1～2 知识轴不得误报「无数据」", sample_evidence: obsIds("cls-g8-03", null, "demo-sec-data-02") },
    { id: "route-date-switch", title: "近7天/1月/3月", url_condition: { date: ["7d", "1m", "3m"] }, expect: "样本数、实际日期与变化叙事对得上（09-16~22 为复习周）" },
    { id: "route-cross-filter", title: "章/节+日期+来源交叉", url_condition: { source_combos: ["全部", "作业+考试", "课堂+人机交互", "单一来源×5"] }, expect: "条件全部生效、去重正确；单一来源缺某维度为合理空态" },
    { id: "route-clear-refresh", title: "清除与刷新", url_condition: {}, expect: "清日期保留章节；不限日期不自动回默认3个月" },
    { id: "route-person-normal", title: "班级→个人（正常）", students: [FOCUS.peng_yuan, FOCUS.cao_ting], expect: "个人证据与同范围班均一致，不借用班级分数" },
    { id: "route-person-improving", title: "班级→个人（改善）", students: [FOCUS.xu_li], expect: "case-01 关闭轨迹可讲（fu-01）" },
    { id: "route-person-support", title: "班级→个人（待支持）", students: [FOCUS.long_hao, FOCUS.he_ning], expect: "待补证/媒介边界不伪装成已解决" },
    { id: "route-random-student", title: "普通学生随机抽查", expect: "非主讲学生至少有当前范围知识任务（每班每节知识覆盖≥40人）" },
    { id: "route-source-process", title: "五来源过程查看", expect: "来源切换时活动名/日期/指标/分子分母随之切换，未选来源不混入" },
    { id: "route-design-inject", title: "教学设计注入", expect: "保留 class/student/date/chapter/source 上下文" },
  ],
  boundary_routes: [
    { id: "bnd-sick", title: "缺勤学生", class_id: "cls-g8-02", student_ref: "名册第31人", expect_empty_reason: "九月病假：合法空态不补零" },
    { id: "bnd-transfer", title: "转入学生早期", class_id: "cls-g8-01", student_ref: "名册末位", expect_empty_reason: "09-07 前无本校数据" },
    { id: "bnd-unit-absent", title: "单元测缺考", class_id: "cls-g8-03", expect: "该考试事件 valid=false，不进统计" },
    { id: "bnd-future", title: "未来日期事件", class_id: "cls-g8-03", expect: "occurred_at 晚于基准日：invalid 保留原因" },
    { id: "bnd-generic-reflection", title: "笼统反思", class_id: "cls-g8-03", expect: "unmapped：归属无法确认，不猜节" },
    { id: "bnd-midnight", title: "零点/末秒提交", expect: "00:05 与 23:55 各一条，正常统计" },
    { id: "bnd-weekend", title: "周末窗口课堂来源", expect_empty_reason: "无课日课堂/考试为空：按来源呈现合理空态" },
    { id: "bnd-alt-textbook", title: "对照教材节", scope: "demo-math-g8-vol1-alt-v1", expect_empty_reason: "北师大演示册无观测：跨教材空态" },
    { id: "bnd-source-na", title: "来源不适用", metric: "value_formation", expect_empty_reason: "无允许来源：null 区别于 0 分" },
    { id: "bnd-cross-class", title: "跨班学生 ID", ref: "diagnostic-attempts at-045", expect: "scope_valid=false 剔除不删" },
    { id: "bnd-invalid-section", title: "非法节 ID", ref: "diagnostic-attempts at-046", expect: "课程维度筛选不生效，原数据保留" },
    { id: "bnd-low-sample", title: "低样本/未审/冲突", expect: "有样本不下强结论；审核状态不因原文到位改 approved" },
  ],
};
w("portrait-demo-scenarios.json", demoScenarios);
// manifest 登记新文件（files 从磁盘重建，保持与各生成器一致）
const manifestPath = path.join(DATA, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
manifest.files = fs.readdirSync(DATA).filter((f) => f.endsWith(".json") && f !== "manifest.json").sort();
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + "\n", "utf-8");
console.log("完成：确定性输出（manifest 已登记 " + (manifest.files.length - 39) + " 个新数据集）。");
