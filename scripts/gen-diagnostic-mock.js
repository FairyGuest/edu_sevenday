#!/usr/bin/env node
/**
 * 诊断链路 mock 生成器（开发辅助，非系统功能）。
 * 依据 docs/数据与内容支撑清单-2026-09-22.md §4/§7/§8 生成 4 个数据集：
 *   diagnostic-attempts.json     24 道白名单演示题（8 诊断/8 辨识/8 迁移，含完整答案解析步骤）+ 52 条学生作答过程
 *   diagnostic-cases.json        8 组错因案例（概念/前置/条件/表征/策略执行 + 待补证/冲突/教师否决）
 *   diagnostic-interventions.json 与已确认错因逐一关联的干预包（≤1 微活动+1 辨识+1 迁移；含无匹配干预）
 *   diagnostic-followups.json    复测与跟踪（改善/未改善/未完成/达标停止/答对无依据）
 * 纪律：
 *   - 学生 ID 全部来自名册（生成时校验）；同题异答同因不混判；未评分≠零分。
 *   - 不出现“90% 准确”类未校准置信度；证据充分程度用定义替代。
 *   - 覆盖 §8 边界：仅答案无步骤、无法识别作答、跨班学生 ID、无效课程 ID、同题异因、同因异题、
 *     教师否决 AI 候选、无匹配干预、复测各态。
 * 用法：node scripts/gen-diagnostic-mock.js
 */
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "mock", "teacher", "data");
const REF_DATE = process.env.DEMO_AS_OF || "2026-09-22";
const TB = "demo-math-g8-vol2-v1";
const w = (name, obj) => {
  fs.writeFileSync(path.join(DATA, name), JSON.stringify(obj, null, 1) + "\n", "utf-8");
  console.log("  +", name, `(${Math.round(fs.statSync(path.join(DATA, name)).size / 1024)} KB)`);
};

/* ---------- 名册 ---------- */
const ROSTERS = ["cls-g8-01", "cls-g8-02", "cls-g8-03"].map((c) => ({ class_id: c, students: JSON.parse(fs.readFileSync(path.join(DATA, `class-students-${c}.json`), "utf-8")) }));
const findStudent = (sid) => ROSTERS.flatMap((r) => r.students.map((s) => ({ ...s, class_id: r.class_id }))).find((s) => s.student_id === sid);
const F = {
  xu_li: "947bb83daabc33cf", huang_mingjing: "aa18e927903a0918", cao_ting: "358f22c0c0bb9d3a", he_ning: "2bfbc5fb6c6f1c5a",
  long_hao: "6738633173303037", peng_yuan: "6738633173303030", tan_min: "6738633273303036", gong_qiaoying: "6738633273303032",
};
for (const [k, sid] of Object.entries(F)) if (!findStudent(sid)) throw new Error(`重点学生 ${k} 不在名册`);

/* ---------- 白名单题目（24） ---------- */
const S = "demo-sec-";
const Q = [];
function q(id, category, stem, answer, analysis, steps, section_ids, clusters, kps, difficulty, form) {
  Q.push({ question_id: id, category, stem, answer, analysis, steps, grade: "g8", subject_id: "math", textbook_id: TB,
    section_ids, knowledge_clusters: clusters, kp_ids: kps, difficulty, form, is_demo: true, review_status: "approved",
    review_note: "主演示白名单题（demo 教师复核）；旧题库 420 题保留但不进入本演示链路（清单 §3）。" });
}
/* 诊断题 8：暴露错因 */
q("diag-r8-01", "diagnostic", "当 a=-3 时，求 √(a²) 的值。", "3",
  "考查 √(a²)=|a| 的条件意识。a=-3 时 a²=9，√9 是 9 的算术平方根，取非负值 3；写成 -3 说明把 √(a²) 无条件当作 a。",
  ["a=-3，则 a²=9", "√(a²)=√9=3（算术平方根取非负）", "或用一般结论 √(a²)=|a|=|-3|=3"],
  [S + "radical-01"], ["二次根式"], ["kp-radical"], "容易", "解答");
q("diag-r8-02", "diagnostic", "若二次根式 √(x-3) 有意义，则 x 的取值范围是（　　）", "x≥3",
  "考查被开方数非负条件。x-3≥0 即 x≥3；漏等号（答 x>3）或方向写反属条件遗漏。",
  ["被开方数非负：x-3≥0", "解得 x≥3"],
  [S + "radical-01"], ["二次根式"], ["kp-radical"], "容易", "选择");
q("diag-r8-03", "diagnostic", "计算：√18+√8。", "5√2",
  "考查先化简后合并。√18=3√2、√8=2√2，同类合并得 5√2；直接写 √26 属未化简合并（执行/策略错误）。",
  ["√18=3√2（最简）", "√8=2√2（最简）", "3√2+2√2=5√2（合并同类二次根式）"],
  [S + "radical-03"], ["二次根式的加法与减法"], ["kp-radical-addsub"], "容易", "解答");
q("diag-r8-04", "diagnostic", "直线 y=2x-1 与 y 轴的交点坐标是（　　）", "(0,-1)",
  "考查坐标轴交点识别。y 轴上 x=0，代入得 y=-1；答 (1/2,0) 是把 y 轴交点当成 x 轴交点（表征错位）。",
  ["y 轴上点的特征：x=0", "代入 y=2×0-1=-1", "交点 (0,-1)"],
  [S + "function-02"], ["一次函数的图象和性质"], ["kp-function-image"], "容易", "选择");
q("diag-r8-05", "diagnostic", "函数 y=-3x+6 中，y 随 x 的增大如何变化？请说明依据。", "y 随 x 增大而减小，因为 k=-3<0",
  "考查 k 符号与增减性的联系及依据表达。只说“减小”不写 k<0 属依据缺失；说反属概念错误。",
  ["一次函数 y=kx+b：k<0 时 y 随 x 增大而减小", "本题 k=-3<0，故减小"],
  [S + "function-02"], ["一次函数的图象和性质"], ["kp-function-property"], "容易", "解答");
q("diag-r8-06", "diagnostic", "出租车起步价 8 元（3 公里内），超出部分每公里 2.4 元。行驶 12 公里应付多少元？", "29.6 元",
  "考查分段条件。前 3 公里固定 8 元，后 9 公里按 2.4 计：8+9×2.4=29.6；全程按 2.4 计（28.8 元）属忽略分段条件。",
  ["分段：0<x≤3 时 y=8；x>3 时 y=8+2.4(x-3)", "x=12：y=8+2.4×9=29.6"],
  [S + "function-03"], ["实际问题与一次函数"], ["kp-function-application"], "适中", "解答");
q("diag-r8-07", "diagnostic", "三边长为 5、12、13 的三角形是直角三角形吗？请写出判断依据。", "是；5²+12²=13²，由勾股定理的逆定理",
  "考查定理与逆定理方向。结论正确但写“由勾股定理”属方向混淆。",
  ["最长边 13", "5²+12²=25+144=169=13²", "由勾股定理的逆定理，该三角形是直角三角形"],
  [S + "pythagoras-01"], ["勾股定理及其应用"], ["kp-pythagoras"], "适中", "解答");
q("diag-r8-08", "diagnostic", "计算：√12+√27-√48。", "√3",
  "考查化简到最简的口径稳定。√12=2√3、√27=3√3、√48=4√3，合并得 √3；化简不到位（如 √48 写 4√3 漏化或 √12 写 2√6）属前置口径不稳。",
  ["√12=2√3，√27=3√3，√48=4√3", "2√3+3√3-4√3=√3"],
  [S + "radical-03", S + "radical-01"], ["二次根式的加法与减法", "二次根式"], ["kp-radical-addsub"], "适中", "解答");
/* 辨识题 8：区分候选错因 */
q("disc-r8-01", "discrimination", "分别取 a=3、a=0、a=-3，判断 √(a²) 与 a 是否相等，并说明理由。", "3 相等；0 相等；-3 不相等（3≠-3）",
  "辨识“无条件认为 √(a²)=a”与“代入抄写出错”：三类取值逐一检验后仍写相等属概念候选；个别取值笔误属执行候选。",
  ["a=3：√9=3=a", "a=0：√0=0=a", "a=-3：√9=3≠-3"],
  [S + "radical-01"], ["二次根式"], ["kp-radical"], "容易", "解答");
q("disc-r8-02", "discrimination", "下列二次根式中，属于最简二次根式的是（　　）A. √8　B. √(a²b)　C. √(1/2)　D. √6", "D",
  "辨识最简口径：√8 含能开尽方的因数 4；√(a²b) 含 a²；√(1/2) 含分母；仅 √6 最简。",
  ["条件一：被开方数不含分母", "条件二：不含能开得尽方的因数", "逐一检验，仅 D 同时满足"],
  [S + "radical-01"], ["二次根式"], ["kp-radical"], "容易", "选择");
q("disc-r8-03", "discrimination", "下列各组中哪些可以直接合并？说明理由。① 3√5 与 √5；② 2√6 与 2√7；③ √12 与 √3", "①与③可（③先化简 √12=2√3）；②不可",
  "辨识“同类判断”：③ 需先化简才能识别同类，直判“不可合并”属口径未内化。",
  ["① 同类，合并得 4√5", "② 根指数内数不同，不可", "③ √12=2√3，与 √3 同类"],
  [S + "radical-03"], ["二次根式的加法与减法"], ["kp-radical-addsub"], "容易", "解答");
q("disc-r8-04", "discrimination", "四条直线 l₁:y=2x、l₂:y=-2x、l₃:y=0.5x、l₄:y=-0.5x 中，y 随 x 增大而减小的有哪些？", "l₂ 与 l₄（k<0）",
  "辨识 k 符号与图像升降的对应：答含 l₁/l₃ 属符号—方向对应未建立；漏答属观察不全。",
  ["判断标准：k<0 时减小", "l₂、l₄ 的 k 均为负"],
  [S + "function-02"], ["一次函数的图象和性质"], ["kp-function-property"], "容易", "选择");
q("disc-r8-05", "discrimination", "将直线 y=2x 向上平移 3 个单位后的解析式是（　　）", "y=2x+3",
  "辨识平移方向与常数项关系：答 y=2x-3 属方向反；答 y=5x 属把平移当作倍增。",
  ["上加下减：向上平移 3，b 加 3", "得 y=2x+3"],
  [S + "function-02"], ["一次函数的图象和性质"], ["kp-function-image"], "容易", "选择");
q("disc-r8-06", "discrimination", "A、B 两方案费用函数分别为 y=3x 与 y=2x+30（x 为次数）。求两方案费用相同的次数，并说明 x 取何值时 A 更省。", "x=30；x<30 时 A 省",
  "辨识区间意识：只答 x=30 不答区间属决策表达不完整；方向答反属比较未完成。",
  ["令 3x=2x+30，得 x=30", "x<30 时 3x<2x+30，A 省；x>30 时 B 省"],
  [S + "function-03"], ["实际问题与一次函数"], ["kp-function-application"], "适中", "解答");
q("disc-r8-07", "discrimination", "判断三边为 ① 8、15、17；② 5、6、7；③ 7、24、25 的三角形是否为直角三角形。", "①③是；②否（25+36=61≠49）",
  "辨识逆定理使用程序：找最长边→算平方和→比较。②中误把 7 当最长边计算属程序错位。",
  ["① 8²+15²=64+225=289=17²，是", "② 5²+6²=61，7²=49，61≠49，不是", "③ 7²+24²=49+576=625=25²，是"],
  [S + "pythagoras-01"], ["勾股定理及其应用"], ["kp-pythagoras"], "适中", "解答");
q("disc-r8-08", "discrimination", "找错：某同学的解答 √18+√8=√26。错在哪一步？正确结果是什么？", "错在未化简直接把根号内相加；应为 5√2",
  "辨识执行与概念：指出“不能把根号内直接相加”但给不出最简形式属表达缺口的执行型；认为 √26 正确属概念型。",
  ["√18=3√2，√8=2√2", "√26≈5.1 与 5√2≈7.1 量级不符，估算即可证伪", "正确：5√2"],
  [S + "radical-03"], ["二次根式的加法与减法"], ["kp-radical-addsub"], "容易", "解答");
/* 迁移题 8 */
q("tran-r8-01", "transfer", "已知 a=√3+1，求代数式 a²-2a-2 的值。", "-2",
  "整体代入迁移：a²-2a=(a-1)²，a-1=√3，得 3-2=-2。直接展开硬算易错且耗时。",
  ["a²-2a-2=(a-1)²-3", "a-1=√3，(a-1)²=3", "3-3-2=-2"],
  [S + "radical-01", S + "radical-03"], ["二次根式", "二次根式的加法与减法"], ["kp-radical"], "适中", "解答");
q("tran-r8-02", "transfer", "已知 a>0，化简 √(2a²)·√(a/2)。", "a√a（a>0）",
  "乘除法则迁移：先并成一个根式 √(2a²·a/2)=√(a³)，再化到最简 a√a；条件 a>0 保证 a²=a·a 的开方方向。",
  ["√(2a²)·√(a/2)=√(2a²·a/2)=√(a³)", "√(a³)=√(a²·a)=a√a（a>0）"],
  [S + "radical-02"], ["二次根式"], ["kp-radical-muldvd"], "适中", "解答");
q("tran-r8-03", "transfer", "已知一次函数的图像经过点 (1,3) 和 (-1,-1)，求解析式，并说明 y 随 x 的变化情况。", "y=2x+1；y 随 x 增大而增大",
  "待定系数法+性质迁移：k=(3-(-1))/(1-(-1))=2，b=1；k>0 递增。",
  ["设 y=kx+b", "代入两点：k+b=3；-k+b=-1", "解得 k=2，b=1", "k=2>0，y 随 x 增大而增大"],
  [S + "function-02"], ["一次函数的图象和性质"], ["kp-function-image", "kp-function-property"], "适中", "解答");
q("tran-r8-04", "transfer", "A 卡月费 20 元每部影片 3 元，B 卡无月费每部 6 元。每月看多少部时两卡费用相同？x 取何值时选 A 更省？", "20 部；x>20 时 A 更省",
  "完整方案决策迁移：20+3x=6x 得 x=20；x>20 时 A 省（注意与 disc-r8-06 方向相反的设问）。",
  ["A：y=3x+20；B：y=6x", "3x+20=6x ⇒ x=20", "x>20 时 3x+20<6x，选 A"],
  [S + "function-03"], ["实际问题与一次函数"], ["kp-function-application"], "适中", "解答");
q("tran-r8-05", "transfer", "下列情境中，y 是否为 x 的函数？① 等腰三角形底边长 x 与面积 y（高给定）；② 全校各班的人数 y 与班级编号 x（编号并列使用，不随 x 变化而改变）。", "①是；②不是",
  "函数概念迁移：① 高一定时面积 S=(h/2)x 随底边唯一确定，两要素齐备；② 编号只是标签，人数不随编号变化而变化，缺少依赖关系。课堂讨论“唯一对应”与“依赖关系”两个要点。",
  ["两要素：两个变量 + 每一个 x 唯一对应 y", "① S=(h/2)·x（h 给定），是函数", "② 编号为标签非变量，无依赖关系，判否（讨论题）"],
  [S + "function-01"], ["函数", "函数的概念"], ["kp-function"], "适中", "解答");
q("tran-r8-06", "transfer", "长 5 米的梯子底端距墙 3 米。① 顶端离地多少米？② 若顶端下滑 1 米，底端外移多少米？", "① 4 米；② 外移 √(5²-3²)=4 ⇒ 底端从 3 到 4，外移 1 米？核算：下滑后高度 3 米，斜边仍 5，底端=√(25-9)=4，外移 4-3=1 米",
  "勾股迁移到动态情境：两问都要重建直角三角形；常见错误是认为“顶端下滑 1 米则底端外移 1 米”恰好对——本例数值上成立，教学中追问“换成顶端下滑 0.5 米还成立吗”打破直觉。",
  ["① √(5²-3²)=√16=4", "② 高 3 米时底端 √(25-9)=4，外移 4-3=1 米", "追问验证：下滑 0.5 米时底端=√(25-12.25)≈3.57，外移 0.57≠0.5"],
  [S + "pythagoras-01"], ["勾股定理及其应用"], ["kp-pythagoras"], "适中", "解答");
q("tran-r8-07", "transfer", "化简 √((x-2)²)，并说明需要讨论的条件。", "x≥2 时为 x-2；x<2 时为 2-x",
  "绝对值化简迁移（清单 §7 示例）：√((x-2)²)=|x-2|，按零点分两类讨论并解释范围条件。",
  ["√((x-2)²)=|x-2|", "x≥2：|x-2|=x-2", "x<2：|x-2|=2-x"],
  [S + "radical-01"], ["二次根式"], ["kp-radical"], "适中", "解答");
q("tran-r8-08", "transfer", "弹簧原长 10cm，每挂 1kg 伸长 0.5cm。① 写出总长 L 关于质量 m 的函数式并求 m=8 时的长度；② m=50 时该式还适用吗？为什么？", "① L=0.5m+10，m=8 时 14cm；② 不适用：超出弹簧弹性限度，线性关系只在量程内成立",
  "建模迁移含适用边界：量程外线性外推失效，需以物理约束为条件。",
  ["L=0.5m+10（0≤m≤量程）", "m=8：L=14cm", "50kg 超量程，模型失效，不能外推"],
  [S + "function-03"], ["实际问题与一次函数"], ["kp-function-application"], "适中", "解答");

/* 复习周新增章节题目（四边形/数据分析，补齐 §3 知识映射缺口后的白名单） */
q("disc-r8-09", "discrimination", "下列条件中，能判定四边形是平行四边形的是（　　）A. 两组对角分别相等　B. 一组对边相等　C. 对角线互相垂直　D. 一组对边平行", "A",
  "辨识判定条件结构：两组对角分别相等是判定定理；仅一组对边相等或平行、对角线互相垂直都不充分。",
  ["选项 B/D 缺“平行且相等”或“两组”条件", "选项 C 是菱形的对角线特征，非平行四边形判定", "A 正确：两组对角分别相等 → 平行四边形"],
  [S + "quad-01"], ["四边形"], ["kp-parallelogram"], "容易", "选择");
q("tran-r8-09", "transfer", "平行四边形 ABCD 的对角线 AC、BD 交于点 O，且 AC=BD。求证：四边形 ABCD 是矩形，并说明矩形与平行四边形的包含关系。", "由对角线互相平分（平行四边形性质）与 AC=BD，得矩形；矩形是特殊的平行四边形（包含关系）",
  "判定迁移：平行四边形+对角线相等 ⇒ 矩形（判定定理）；包含关系为矩形 ⊂ 平行四边形。",
  ["ABCD 是平行四边形 ⇒ 对角线互相平分", "又 AC=BD，由“对角线相等的平行四边形是矩形”得证", "矩形具有平行四边形全部性质，故矩形 ⊂ 平行四边形"],
  [S + "quad-02"], ["特殊的平行四边形"], ["kp-special-quad"], "适中", "解答");
q("disc-r8-10", "discrimination", "某班30人身高（单位：cm）多数集中在165附近，个别同学190。刻画「一般水平」用哪个统计量更合适？（　　）A. 平均数　B. 中位数　C. 众数　D. 最大值", "B",
  "辨识统计量选择：异常值（190）拉高平均数，中位数不受极端值影响，更能代表一般水平。",
  ["平均数易受极端值影响", "中位数将数据排序后取中间位置，稳健", "选 B"],
  [S + "data-01"], ["数据的集中趋势"], ["kp-data-central-tendency"], "容易", "选择");
q("tran-r8-10", "transfer", "甲、乙两名射手5次射击平均成绩相同，成绩分别为 甲：8,8,8,8,8；乙：6,10,6,10,8。谁的成绩更稳定？用方差说明。", "甲方差为0，更稳定；乙方差为3.2",
  "方差迁移：同均值下比较离散程度。甲每次都是8，离差全为0，方差0；乙的离差为 -2,2,-2,2,0，方差 =(4+4+4+4+0)/5=3.2。",
  ["甲：离差均为0，方差=0", "乙：离差 -2,2,-2,2,0，方差=(4+4+4+4+0)/5=3.2", "方差小者更稳定 → 甲"],
  [S + "data-02"], ["数据的离散程度"], ["kp-data-dispersion"], "适中", "解答");

/* ---------- 作答（含复习周新章节证据） ---------- */
const HW = { radical: "hw-plan-cls-g8-03-001", sync: "hw-cls-g8-03-000", diag: "hw-cls-g8-03-001", g1: "hw-demo-diag-g801", g2: "hw-demo-diag-g802" };
const A = [];
let atSeq = 0;
function at(opt) {
  A.push({ attempt_id: `at-${String(++atSeq).padStart(3, "0")}`, ...opt });
}
const T = (d, h, m) => `2026-09-${d}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+08:00`;
// 徐丽：概念型错因主案例（首答-订正-复测三段完整）
at({ question_id: "diag-r8-01", student_id: F.xu_li, class_id: "cls-g8-03", homework_id: HW.radical, attempt_role: "first",
  answer_steps: ["a=-3", "√(a²)=a=-3"], final_answer: "-3", correctness: false, recognized: true, occurred_at: T(14, 19, 30),
  evidence_note: "步骤完整：直接把 √(a²) 写成 a，无条件使用该等式" });
at({ question_id: "diag-r8-01", student_id: F.xu_li, class_id: "cls-g8-03", homework_id: HW.radical, attempt_role: "correction",
  answer_steps: ["订正单：√(a²)=|a|", "|-3|=3"], final_answer: "3", correctness: true, recognized: true, occurred_at: T(16, 19, 40),
  evidence_note: "订正引用绝对值结论，但未附三类取值自检（见 case-01 复测要求）" });
at({ question_id: "tran-r8-07", student_id: F.xu_li, class_id: "cls-g8-03", homework_id: HW.diag, attempt_role: "retest",
  answer_steps: ["√((x-2)²)=|x-2|", "x≥2：x-2；x<2：2-x（因为距离非负）"], final_answer: "分类正确", correctness: true, recognized: true, occurred_at: T(20, 20, 10),
  evidence_note: "复测能说明范围条件与依据 → case-01 关闭（fu-01）" });
at({ question_id: "diag-r8-02", student_id: F.xu_li, class_id: "cls-g8-03", homework_id: HW.radical, attempt_role: "first",
  answer_steps: ["x-3>0"], final_answer: "x>3", correctness: false, recognized: true, occurred_at: T(14, 19, 32),
  evidence_note: "漏等号：条件边界遗漏（与 learner-contexts 运算习惯记录一致）" });
at({ question_id: "diag-r8-03", student_id: F.xu_li, class_id: "cls-g8-03", homework_id: HW.radical, attempt_role: "first",
  answer_steps: ["√18+√8=√26"], final_answer: "√26", correctness: false, recognized: true, occurred_at: T(14, 19, 35) });
// 曹婷：同题异因对照（diag-r8-01 也错，但错因候选不同：算术平方根多值理解）
at({ question_id: "diag-r8-01", student_id: F.cao_ting, class_id: "cls-g8-03", homework_id: HW.radical, attempt_role: "first",
  answer_steps: ["a²=9", "9 的平方根是 ±3", "取 -3"], final_answer: "-3", correctness: false, recognized: true, occurred_at: T(14, 19, 28),
  evidence_note: "与徐丽最终答案相同但候选错因不同：曹婷是“平方根多值”理解偏差，非无条件等式（case-05）" });
at({ question_id: "diag-r8-03", student_id: F.cao_ting, class_id: "cls-g8-03", homework_id: HW.radical, attempt_role: "first",
  answer_steps: ["√18=3√2", "√8=2√2", "3√2+2√2=5√2"], final_answer: "5√2", correctness: true, recognized: true, occurred_at: T(14, 19, 26),
  evidence_note: "正确过程样例：三步齐全（作答质量对照）" });
// 边界：仅答案无步骤（曹婷，选择题）
at({ question_id: "disc-r8-02", student_id: F.cao_ting, class_id: "cls-g8-03", homework_id: HW.sync, attempt_role: "first",
  answer_steps: [], final_answer: "D", correctness: true, recognized: true, occurred_at: T(11, 10, 5),
  evidence_note: "仅答案无步骤（边界案例）：无法据此归因，rubric-operation 标 needs_steps" });
// 边界：无法识别的作答（何宁）
at({ question_id: "diag-r8-02", student_id: F.he_ning, class_id: "cls-g8-03", homework_id: HW.radical, attempt_role: "first",
  answer_steps: [], final_answer: null, correctness: null, recognized: false, occurred_at: T(14, 19, 41),
  evidence_note: "拍照上传模糊，无法识别（边界案例）：计入未识别，不计 0 分" });
// 何宁：AI 候选被教师否决的案例（case-07）
at({ question_id: "diag-r8-02", student_id: F.he_ning, class_id: "cls-g8-03", homework_id: HW.radical, attempt_role: "correction",
  answer_steps: ["（线下补做）x-3≥0", "x≥3"], final_answer: "x≥3", correctness: true, recognized: true, occurred_at: T(17, 15, 0),
  evidence_note: "线下核对后补做正确；教师据此否决 AI“概念不清”候选（实为媒介问题）" });
// 黄明静：表征型（x/y 轴交点读反）
at({ question_id: "diag-r8-04", student_id: F.huang_mingjing, class_id: "cls-g8-03", homework_id: HW.radical, attempt_role: "first",
  answer_steps: ["令 y=0", "x=1/2"], final_answer: "(1/2, 0)", correctness: false, recognized: true, occurred_at: T(14, 19, 33),
  evidence_note: "把 y 轴交点当作 x 轴交点（表征错位，与观测中「图像识读」偏低一致）" });
at({ question_id: "disc-r8-04", student_id: F.huang_mingjing, class_id: "cls-g8-03", homework_id: HW.sync, attempt_role: "first",
  answer_steps: ["看图：往下的选", "l₂、l₄"], final_answer: "l₂、l₄", correctness: true, recognized: true, occurred_at: T(11, 10, 8),
  evidence_note: "辨识正确：用图像升降直判，未引用 k 符号（表达缺口记录）" });
// 谭敏：策略/执行型（未化简先合并）+ 复测未改善
at({ question_id: "diag-r8-03", student_id: F.tan_min, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "first",
  answer_steps: ["√18+√8=√(18+8)=√26"], final_answer: "√26", correctness: false, recognized: true, occurred_at: T(12, 20, 15),
  evidence_note: "执行型：跳过化简程序直接合并（case-04）" });
at({ question_id: "tran-r8-01", student_id: F.tan_min, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "retest",
  answer_steps: ["a²-2a-2", "a=√3+1 代入：(√3+1)²-2(√3+1)-2", "=4+2√3-2√3-2-2", "=0"], final_answer: "0", correctness: false, recognized: true, occurred_at: T(19, 20, 30),
  evidence_note: "复测展开硬算：(√3+1)² 展开为 4+2√3 正确，-2(√3+1) 应为 -2√3-2，合并得 4-2-2=0？正解 (a-1)²-3=3-3-2=-2；谭敏漏减 -2 → 未改善（fu-02）" });
// 龚巧莺：条件型（不分段）+ 同因异题（case-02/08）
at({ question_id: "diag-r8-06", student_id: F.gong_qiaoying, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "first",
  answer_steps: ["12×2.4=28.8"], final_answer: "28.8 元", correctness: false, recognized: true, occurred_at: T(12, 20, 18),
  evidence_note: "忽略起步价分段条件（case-02）" });
at({ question_id: "tran-r8-04", student_id: F.gong_qiaoying, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "first",
  answer_steps: ["3x+20 与 6x", "没管月费，直接 3x=6x 不成立？", "答：B 卡永远便宜"], final_answer: "B 卡永远便宜", correctness: false, recognized: true, occurred_at: T(19, 20, 25),
  evidence_note: "再次忽略固定条件（月费），与 case-02 同因异题（case-08）" });
// 龙昊：冲突案例（答对但无依据；复测又错）
at({ question_id: "diag-r8-05", student_id: F.long_hao, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "first",
  answer_steps: ["减小"], final_answer: "y 随 x 增大而减小", correctness: true, recognized: true, occurred_at: T(13, 19, 50),
  evidence_note: "结论对但未写依据（k<0）——正确性存疑（case-06 证据一）" });
at({ question_id: "tran-r8-03", student_id: F.long_hao, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "retest",
  answer_steps: ["k=3-(-1)=4？", "y=4x+b，过 (1,3)：b=-1", "变化：增大"], final_answer: "y=4x-1；增大", correctness: false, recognized: true, occurred_at: T(19, 19, 45),
  evidence_note: "斜率计算错（k=(y₂-y₁)/(x₂-x₁) 未按同序相减）→ 与首测“答对”冲突（case-06 证据二）" });
// 彭媛：正确过程 + 一处跳步
at({ question_id: "diag-r8-08", student_id: F.peng_yuan, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "first",
  answer_steps: ["√12=2√3，√27=3√3，√48=4√3", "2+3-4=1", "√3"], final_answer: "√3", correctness: true, recognized: true, occurred_at: T(13, 19, 42),
  evidence_note: "正确；“2+3-4=1”一步省略了同类根式因数 √3 的书写（跳步记录，不构成案例）" });
at({ question_id: "disc-r8-06", student_id: F.peng_yuan, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "first",
  answer_steps: ["3x=2x+30 ⇒ x=30", "x<30 时 A 省（3x<2x+30）"], final_answer: "x=30；x<30 时 A 更省", correctness: true, recognized: true, occurred_at: T(13, 19, 46) });
// 补充常规作答（覆盖各题类与节；含 diag-r8-07/08、disc 各题、tran 各题的首答样本）
at({ question_id: "diag-r8-07", student_id: F.cao_ting, class_id: "cls-g8-03", homework_id: HW.sync, attempt_role: "first",
  answer_steps: ["5²+12²=169=13²", "由勾股定理，是直角三角形"], final_answer: "是（依据：勾股定理）", correctness: false, recognized: true, occurred_at: T(11, 10, 12),
  evidence_note: "结论对但依据写成“勾股定理”（应为逆定理）——判定方向混淆样本（不作单独案例，随堂讲评）" });
at({ question_id: "diag-r8-07", student_id: F.huang_mingjing, class_id: "cls-g8-03", homework_id: HW.sync, attempt_role: "first",
  answer_steps: ["最长边 13", "5²+12²=13²", "由勾股定理的逆定理，是"], final_answer: "是（逆定理）", correctness: true, recognized: true, occurred_at: T(11, 10, 10) });
at({ question_id: "diag-r8-08", student_id: F.xu_li, class_id: "cls-g8-03", homework_id: HW.diag, attempt_role: "first",
  answer_steps: ["√12=2√3", "√27=√27（不会）"], final_answer: "未完成", correctness: false, recognized: true, occurred_at: T(18, 20, 5),
  evidence_note: "前置缺口：√27 化简卡住（与 case-01 干预后复测的间隔题）" });
at({ question_id: "disc-r8-01", student_id: F.xu_li, class_id: "cls-g8-03", homework_id: HW.diag, attempt_role: "retest",
  answer_steps: ["a=3：√9=3=a 相等", "a=0：0=0 相等", "a=-3：√9=3≠-3 不相等（负数不相等）"], final_answer: "见步骤", correctness: true, recognized: true, occurred_at: T(18, 20, 7),
  evidence_note: "iv-01 辨识题通过：三类取值逐一检验并说明（case-01 关闭证据链）" });
at({ question_id: "disc-r8-03", student_id: F.tan_min, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "correction",
  answer_steps: ["① 同类可合并", "② 不可", "③ √12=2√3，可与 √3 合并"], final_answer: "①③可合并", correctness: true, recognized: true, occurred_at: T(13, 12, 30),
  evidence_note: "订正辨识通过（case-04 一度改善的中间证据）" });
at({ question_id: "disc-r8-08", student_id: F.tan_min, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "retest",
  answer_steps: ["错在根号内直接相加", "应该先化简：3√2+2√2=5√2"], final_answer: "5√2", correctness: true, recognized: true, occurred_at: T(13, 12, 33),
  evidence_note: "iv-04 辨识题通过" });
at({ question_id: "disc-r8-05", student_id: F.huang_mingjing, class_id: "cls-g8-03", homework_id: HW.sync, attempt_role: "first",
  answer_steps: ["上加下减，向上 +3"], final_answer: "y=2x+3", correctness: true, recognized: true, occurred_at: T(11, 10, 15) });
at({ question_id: "disc-r8-07", student_id: F.long_hao, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "first",
  answer_steps: ["① 是；② 最长边 7：5²+6²=61≠49 否；③ 是"], final_answer: "①③是②否", correctness: true, recognized: true, occurred_at: T(13, 19, 55) });
at({ question_id: "tran-r8-02", student_id: F.peng_yuan, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "first",
  answer_steps: ["√(2a²)=a√2", "√(a/2)=√(2a)/2", "积=a√2·√(2a)/2=a√a"], final_answer: "a√a（a>0）", correctness: true, recognized: true, occurred_at: T(13, 19, 48) });
at({ question_id: "tran-r8-05", student_id: F.long_hao, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "first",
  answer_steps: ["① 面积随底边变，是函数", "② 编号和人数都是标签，不算"], final_answer: "①是②不是", correctness: true, recognized: true, occurred_at: T(19, 19, 50),
  evidence_note: "概念讨论题：表达直觉正确，未引用“唯一对应/依赖关系”术语（表达缺口记录）" });
at({ question_id: "tran-r8-06", student_id: F.cao_ting, class_id: "cls-g8-03", homework_id: HW.sync, attempt_role: "first",
  answer_steps: ["① √(25-9)=4", "② 下滑 1 米后高 3，底端 √(25-9)=4，外移 1"], final_answer: "①4 米 ②外移 1 米", correctness: true, recognized: true, occurred_at: T(11, 10, 18) });
at({ question_id: "tran-r8-08", student_id: F.gong_qiaoying, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "retest",
  answer_steps: ["L=0.5m+10", "m=8：14cm", "50kg：还能用，L=35cm"], final_answer: "14cm；35cm", correctness: false, recognized: true, occurred_at: T(19, 20, 40),
  evidence_note: "复测：建模正确但量程外仍外推（case-02 部分改善：分段意识在物理情境未迁移）" });
at({ question_id: "disc-r8-06", student_id: F.gong_qiaoying, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "retest",
  answer_steps: ["3x=2x+30，x=30", "x<30 时 A 省"], final_answer: "x=30；x<30 选 A", correctness: true, recognized: true, occurred_at: T(19, 20, 42),
  evidence_note: "iv-02 辨识通过（区间意识建立）；与 tran-r8-08 的未迁移形成对照" });
at({ question_id: "diag-r8-04", student_id: F.tan_min, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "first",
  answer_steps: ["x=0，y=-1"], final_answer: "(0,-1)", correctness: true, recognized: true, occurred_at: T(12, 20, 12) });
at({ question_id: "diag-r8-05", student_id: F.huang_mingjing, class_id: "cls-g8-03", homework_id: HW.sync, attempt_role: "first",
  answer_steps: ["k=-3<0", "y 随 x 增大而减小"], final_answer: "减小（k<0）", correctness: true, recognized: true, occurred_at: T(11, 10, 20),
  evidence_note: "依据完整（与龙昊对照样本）" });
at({ question_id: "diag-r8-06", student_id: F.tan_min, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "first",
  answer_steps: ["前 3 公里 8 元", "后 9 公里 9×2.4=21.6", "共 29.6"], final_answer: "29.6 元", correctness: true, recognized: true, occurred_at: T(12, 20, 20),
  evidence_note: "正确对照样本（learner-contexts 水费账单经验相关）" });
at({ question_id: "diag-r8-06", student_id: F.he_ning, class_id: "cls-g8-03", homework_id: HW.diag, attempt_role: "first",
  answer_steps: [], final_answer: "（图片无法识别）", correctness: null, recognized: false, occurred_at: T(18, 20, 12),
  evidence_note: "第二例未识别作答：两例未识别后触发线下补做流程" });
at({ question_id: "tran-r8-03", student_id: F.cao_ting, class_id: "cls-g8-03", homework_id: HW.diag, attempt_role: "first",
  answer_steps: ["k=(3+1)/(1+1)=2", "y=2x+1", "k>0 增大"], final_answer: "y=2x+1；增大", correctness: true, recognized: true, occurred_at: T(18, 20, 15),
  evidence_note: "正确过程（与龙昊同题复测错形成“相近分数不同过程”对照）" });
at({ question_id: "tran-r8-04", student_id: F.long_hao, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "first",
  answer_steps: ["A：3x+20，B：6x", "20+3x=6x ⇒ x=20", "x>20 时 A 省"], final_answer: "20 部；x>20 选 A", correctness: true, recognized: true, occurred_at: T(19, 19, 52) });
at({ question_id: "disc-r8-02", student_id: F.he_ning, class_id: "cls-g8-03", homework_id: HW.sync, attempt_role: "first",
  answer_steps: [], final_answer: "B", correctness: false, recognized: true, occurred_at: T(11, 10, 22),
  evidence_note: "仅答案（B）：答案可读但无步骤；不归因（needs_steps）" });
at({ question_id: "disc-r8-04", student_id: F.xu_li, class_id: "cls-g8-03", homework_id: HW.sync, attempt_role: "first",
  answer_steps: ["看图选往下的：l₂、l₄"], final_answer: "l₂、l₄", correctness: true, recognized: true, occurred_at: T(11, 10, 25) });
at({ question_id: "disc-r8-05", student_id: F.tan_min, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "first",
  answer_steps: ["向上平移 b+3"], final_answer: "y=2x+3", correctness: true, recognized: true, occurred_at: T(12, 20, 22) });
at({ question_id: "tran-r8-01", student_id: F.peng_yuan, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "first",
  answer_steps: ["(a-1)²-3", "a-1=√3 ⇒ 3-3-2"], final_answer: "-2", correctness: true, recognized: true, occurred_at: T(13, 19, 52) });
at({ question_id: "tran-r8-07", student_id: F.tan_min, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "correction",
  answer_steps: ["√((x-2)²)=|x-2|", "x≥2：x-2；x<2：2-x"], final_answer: "分类正确", correctness: true, recognized: true, occurred_at: T(13, 12, 40),
  evidence_note: "订正通过（case-04 的辨识-迁移中间证据）" });
// 边界：跨班学生 ID（g8-01 学生记录挂到 g8-03 作业）
at({ question_id: "disc-r8-06", student_id: F.long_hao, class_id: "cls-g8-03", homework_id: HW.diag, attempt_role: "first",
  answer_steps: ["3x=2x+30"], final_answer: "x=30", correctness: true, recognized: true, occurred_at: T(18, 20, 20),
  scope_valid: false, evidence_note: "跨班记录（边界案例）：g8-01 学生的作答误挂到 g8-03 作业，统计前须剔除（不删数据）" });
// 边界：无效课程 ID（题目挂到不存在的节）
at({ question_id: "disc-r8-07", student_id: F.peng_yuan, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "first",
  answer_steps: ["①③是"], final_answer: "①③是②否", correctness: true, recognized: true, occurred_at: T(13, 19, 58),
  course_override: { section_ids: ["demo-sec-not-exist-99"], textbook_id: "demo-math-g8-vol9-v99" },
  scope_valid: false, evidence_note: "无效课程 ID（边界案例）：题目-作答挂到不存在教材/节，课程维度筛选不生效、原数据保留" });

at({ question_id: "disc-r8-08", student_id: F.long_hao, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "first",
  answer_steps: ["错在根号里直接加"], final_answer: "不知道最简形式", correctness: false, recognized: true, occurred_at: T(19, 19, 56),
  evidence_note: "能指出错误但不能给出最简形式（执行/表达缺口，随堂讲评，不立案例）" });
at({ question_id: "diag-r8-05", student_id: F.peng_yuan, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "first",
  answer_steps: ["k=-3<0", "k<0 时 y 随 x 增大而减小"], final_answer: "减小（k=-3<0）", correctness: true, recognized: true, occurred_at: T(13, 19, 44),
  evidence_note: "依据完整的正确样本（量规 level 4 参照）" });
at({ question_id: "disc-r8-07", student_id: F.cao_ting, class_id: "cls-g8-03", homework_id: HW.sync, attempt_role: "first",
  answer_steps: ["① 8²+15²=289=17² 是", "② 5²+6²=61≠7²=49 否", "③ 7²+24²=625=25² 是"], final_answer: "①③是②否", correctness: true, recognized: true, occurred_at: T(11, 10, 28) });
at({ question_id: "tran-r8-06", student_id: F.huang_mingjing, class_id: "cls-g8-03", homework_id: HW.diag, attempt_role: "first",
  answer_steps: ["① 底端 3、梯子 5：√(25-9)=4", "② 高变 3：底端 √(25-9)=4，外移 1"], final_answer: "①4 米 ②1 米", correctness: true, recognized: true, occurred_at: T(18, 20, 18),
  evidence_note: "正确（该生表征问题集中在坐标轴交点，勾股情境未受影响——用于说明错因的情境特异性）" });

at({ question_id: "disc-r8-04", student_id: F.long_hao, class_id: "cls-g8-01", homework_id: HW.g1, attempt_role: "retest",
  answer_steps: ["k<0 减小：l₂（-2）、l₄（-0.5）", "l₃ 的 0.5 是正的……也减小？"], final_answer: "l₂、l₃、l₄", correctness: false, recognized: true, occurred_at: T(21, 19, 40),
  evidence_note: "fu-04 证据收集执行（纯解析式、无图线索）：k 符号与方向对应仍不稳——收集完成待教师复核" });
at({ question_id: "disc-r8-02", student_id: F.he_ning, class_id: "cls-g8-03", homework_id: HW.radical, attempt_role: "correction",
  answer_steps: ["√8 含能开得尽方的因数 4", "√(a²b) 含 a²", "√(1/2) 含分母", "√6 最简"], final_answer: "D", correctness: true, recognized: true, occurred_at: T(22, 15, 10),
  evidence_note: "线下补做（媒介问题闭环：两次未识别后转线下纸质，步骤完整）" });
at({ question_id: "disc-r8-03", student_id: F.xu_li, class_id: "cls-g8-03", homework_id: HW.diag, attempt_role: "retest",
  answer_steps: ["① 同类：3√5+√5=4√5", "② 根号内不同，不可", "③ √12=2√3 后可与 √3 合并"], final_answer: "①③可合并", correctness: true, recognized: true, occurred_at: T(22, 20, 5),
  evidence_note: "保持性证据：case-01 关闭一周后同类判断仍稳" });
at({ question_id: "tran-r8-08", student_id: F.gong_qiaoying, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "retest",
  answer_steps: ["L=0.5m+10（0≤m≤量程）", "m=8：L=14cm", "m=50：超出弹性限度，式子不能用"], final_answer: "14cm；不适用", correctness: true, recognized: true, occurred_at: T(22, 20, 15),
  evidence_note: "量程边界意识建立（fu-05 调整支持后的改善证据）" });

at({ question_id: "disc-r8-09", student_id: F.tan_min, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "first",
  answer_steps: ["B 缺少另一组条件", "C 是菱形特征", "A：两组对角分别相等"], final_answer: "A", correctness: true, recognized: true, occurred_at: T(19, 20, 50),
  evidence_note: "复习周：判定条件结构辨识正确" });
at({ question_id: "disc-r8-10", student_id: F.cao_ting, class_id: "cls-g8-03", homework_id: HW.diag, attempt_role: "first",
  answer_steps: ["190 是极端值", "平均数被拉高", "选中位数"], final_answer: "B", correctness: true, recognized: true, occurred_at: T(22, 20, 30),
  evidence_note: "数据前测复盘：统计量选择理由完整" });
at({ question_id: "tran-r8-10", student_id: F.gong_qiaoying, class_id: "cls-g8-02", homework_id: HW.g2, attempt_role: "first",
  answer_steps: ["两人平均分一样，一样稳定"], final_answer: "一样稳定", correctness: false, recognized: true, occurred_at: T(20, 15, 30),
  evidence_note: "波动直觉前测：以平均数相同代替稳定性判断（case-09 候选证据，未确认）" });

const attempts = {
  schema_version: "diagnostic-attempts-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  questions: Q, attempts: A,
  attempt_policy: [
    "同一题多次作答使用不同 attempt_id；重传保留同一 attempt_id（不重复统计）。",
    "recognized=false 的作答计入未识别，不计 0 分；未评分不等于零分。",
    "scope_valid=false 的作答保留但默认剔除出统计（跨班/无效课程归属）。",
    "仅答案无步骤（answer_steps 为空且 final_answer 可读）标记 needs_steps，不用于归因。",
  ],
  homework_refs: { source: "homework-list.json 或演示命名空间", used_ids: [HW.radical, HW.sync, HW.diag, HW.g1, HW.g2], note: "g8-03 作答挂既有作业清单；g8-01/g8-02 无既有作业记录，使用 hw-demo-* 演示作业（显式命名空间，不伪造清单条目）" },
};

/* ---------- 错因案例（8） ---------- */
const cases = {
  schema_version: "diagnostic-cases-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  status_vocab: ["suggested", "needs_evidence", "confirmed", "rejected"],
  cases: [
    { case_id: "case-01", student_id: F.xu_li, attempt_ids: ["at-001", "at-002", "at-003", "at-024"], question_id: "diag-r8-01",
      candidate_causes: [
        { cause_id: "cause-01a", type: "概念", claim: "把 √(a²)=a 当作无条件成立，忽略结果非负约定" },
        { cause_id: "cause-01b", type: "执行", claim: "本知绝对值关系，代入/记录时出错" },
      ],
      supporting_evidence_ids: ["at-001"], counter_evidence_ids: ["at-002"], alternative_explanations: ["算术平方根多值理解偏差（见 case-05 曹婷）"],
      missing_evidence: [], confirmed_cause_ids: ["cause-01a"], status: "confirmed",
      diagnostic_dialogue: ["为什么 √9 不能取 -3？", "请用 a=3、0、-3 三个值检验你写的式子。"],
      prerequisite_knowledge_ids: ["kp-radical"], review: { reviewer_id: "demo-teacher-t001", review_reason: "at-001 步骤直接写 √(a²)=a=-3，排除记录错误；at-003 迁移复测能主动分类并说明依据。", reviewed_at: "2026-09-20 09:00", revision: 1 },
      note: "清单 §7 示范案例的教学化落地。" },
    { case_id: "case-02", student_id: F.gong_qiaoying, attempt_ids: ["at-015", "at-016"], question_id: "diag-r8-06",
      candidate_causes: [{ cause_id: "cause-02a", type: "条件", claim: "忽略题给的固定/分段条件（起步价、月费），只处理变化量" }],
      supporting_evidence_ids: ["at-015", "at-016"], counter_evidence_ids: [], alternative_explanations: ["情境经验缺失（未打过车/未见过月费账单）"],
      missing_evidence: ["情境经验访谈记录（learner-contexts 该生为 unknown）"], confirmed_cause_ids: ["cause-02a"], status: "confirmed",
      diagnostic_dialogue: ["起步价 8 元在你算的 28.8 元里出现了吗？", "如果把“月费 20 元”遮住，两题变得一样吗？"],
      prerequisite_knowledge_ids: ["kp-function-application"], review: { reviewer_id: "demo-teacher-t001", review_reason: "两题（diag-r8-06 / tran-r8-04）同型条件遗漏，模式稳定。", reviewed_at: "2026-09-20 09:10", revision: 1 } },
    { case_id: "case-03", student_id: F.huang_mingjing, attempt_ids: ["at-011"], question_id: "diag-r8-04",
      candidate_causes: [{ cause_id: "cause-03a", type: "表征", claim: "坐标轴交点的图形—符号表征错位：求 y 轴交点却执行 x=0↔y=0 反了" }],
      supporting_evidence_ids: ["at-011"], counter_evidence_ids: [], alternative_explanations: ["审题跳读（“y 轴”看漏）"],
      missing_evidence: ["口头追问记录（该生课堂沉默，需低风险提问场合）"], confirmed_cause_ids: [], status: "needs_evidence",
      diagnostic_dialogue: ["（计划）小组内两两互说：x 轴交点怎么求？y 轴呢？"],
      prerequisite_knowledge_ids: ["kp-function-image"], review: { reviewer_id: "demo-teacher-t001", review_reason: "单次作答不足以区分表征错位与审题跳读；等待小组互说记录。", reviewed_at: "2026-09-20 09:15", revision: 1 } },
    { case_id: "case-04", student_id: F.tan_min, attempt_ids: ["at-013", "at-014", "at-025", "at-026"], question_id: "diag-r8-03",
      candidate_causes: [{ cause_id: "cause-04a", type: "策略/执行", claim: "跳过“先化简”程序直接合并（√18+√8=√26 型）" },
        { cause_id: "cause-04b", type: "前置", claim: "最简二次根式口径不稳（diag-r8-08 中 √27 化简卡壳的同源表现，见 at-023 徐丽侧对照）" }],
      supporting_evidence_ids: ["at-013"], counter_evidence_ids: ["at-025", "at-026"], alternative_explanations: ["cause-04b：若辨识题再失败则改判前置型"],
      missing_evidence: [], confirmed_cause_ids: ["cause-04a"], status: "confirmed",
      diagnostic_dialogue: ["√26 大约是多少？两个加数分别大约多少？估算支持你的结果吗？"],
      prerequisite_knowledge_ids: ["kp-radical", "kp-radical-addsub"], review: { reviewer_id: "demo-teacher-t001", review_reason: "订正与辨识（at-025/at-026）通过但 tran-r8-01 复测（at-014）展开计算又错——程序已建立、执行稳定性不足，维持执行型归因并调支持强度。", reviewed_at: "2026-09-20 09:20", revision: 2 } },
    { case_id: "case-05", student_id: F.cao_ting, attempt_ids: ["at-006"], question_id: "diag-r8-01",
      candidate_causes: [
        { cause_id: "cause-05a", type: "概念", claim: "认为算术平方根可取负（平方根多值与算术平方根混淆）" },
        { cause_id: "cause-05b", type: "执行", claim: "抄写/选择笔误" },
      ],
      supporting_evidence_ids: ["at-006"], counter_evidence_ids: [], alternative_explanations: ["与 case-01 同题同终答但不同候选——同题异因对照"],
      missing_evidence: ["三类取值口头检验（与 case-01 的 at-029 同款辨识）"], confirmed_cause_ids: [], status: "needs_evidence",
      diagnostic_dialogue: ["你写“9 的平方根是 ±3”，那 √9 的符号本身要求取哪一个？"],
      prerequisite_knowledge_ids: ["kp-radical"], review: { reviewer_id: "demo-teacher-t001", review_reason: "at-006 步骤显示多值理解（非常规等式误用），与徐丽不同因；但仅一次作答，需辨识题补证。相同最终答案不能直接断定同因。", reviewed_at: "2026-09-20 09:25", revision: 1 } },
    { case_id: "case-06", student_id: F.long_hao, attempt_ids: ["at-017", "at-018"], question_id: "diag-r8-05",
      candidate_causes: [{ cause_id: "cause-06a", type: "概念", claim: "k 符号—增减性对应未内化（斜率同序相减计算也不稳）" }],
      supporting_evidence_ids: ["at-018"], counter_evidence_ids: ["at-017"], alternative_explanations: ["首测可能靠图像直觉或猜答"],
      missing_evidence: ["撤除图像直觉的纯解析式判断题"], confirmed_cause_ids: [], status: "needs_evidence",
      diagnostic_dialogue: ["不给图，只看 y=-3x+6 的式子，你怎么知道它下降？"],
      prerequisite_knowledge_ids: ["kp-function-property"], review: { reviewer_id: "demo-teacher-t001", review_reason: "证据冲突：首测答对无依据（at-017）、复测同款计算又错（at-018）。答对但无依据且原证据冲突 → 维持待补证。", reviewed_at: "2026-09-20 09:30", revision: 1 },
      note: "§8 边界：相互矛盾证据。" },
    { case_id: "case-07", student_id: F.he_ning, attempt_ids: ["at-009", "at-010"], question_id: "diag-r8-02",
      candidate_causes: [{ cause_id: "cause-07a", type: "概念", claim: "（AI 候选）自变量取值范围概念不清" }],
      supporting_evidence_ids: ["at-009"], counter_evidence_ids: ["at-010"], alternative_explanations: ["作答媒介问题：拍照模糊导致无法识别，非概念错误"],
      missing_evidence: [], confirmed_cause_ids: [], status: "rejected",
      diagnostic_dialogue: [], prerequisite_knowledge_ids: [],
      review: { reviewer_id: "demo-teacher-t001", review_reason: "教师否决 AI 候选：at-009 本就无法识别（recognized=false），不能作为概念错误证据；at-010 线下补做一次通过，更支持媒介问题。", reviewed_at: "2026-09-20 09:35", revision: 1 },
      note: "§8 边界：教师否决 AI 候选。" },
    { case_id: "case-08", student_id: F.gong_qiaoying, attempt_ids: ["at-016", "at-032"], question_id: "tran-r8-04",
      candidate_causes: [], supporting_evidence_ids: ["at-015", "at-016", "at-032"], counter_evidence_ids: ["at-033"],
      alternative_explanations: [], missing_evidence: [], confirmed_cause_ids: ["cause-02a"], status: "confirmed",
      diagnostic_dialogue: [], prerequisite_knowledge_ids: ["kp-function-application"],
      review: { reviewer_id: "demo-teacher-t001", review_reason: "同因异题证据：case-02 确认的“忽略固定条件”在 tran-r8-04 复现（at-016）；at-033 显示辨识已建立但物理情境（tran-r8-08，at-032）未完全迁移——归因仍为条件型，迁移范围记入 follow-up。", reviewed_at: "2026-09-20 09:40", revision: 1 },
      note: "§8 边界：同因异题。与 case-02 共享 cause-02a。" },
    { case_id: "case-09", student_id: F.gong_qiaoying, attempt_ids: ["at-057"], question_id: "tran-r8-10",
      candidate_causes: [{ cause_id: "cause-09a", type: "前置", claim: "数据观念前置缺口：以平均数相同代替稳定性判断（未学方差）" }],
      supporting_evidence_ids: ["at-057"], counter_evidence_ids: [], alternative_explanations: ["前测阶段正常表现，不一定是缺陷"],
      missing_evidence: ["20.2 单元教学完成后的同型复测"], confirmed_cause_ids: [], status: "suggested",
      diagnostic_dialogue: ["如果甲每次都是 8 分，乙忽高忽低，你会选谁上场？为什么？"],
      prerequisite_knowledge_ids: ["kp-data-dispersion"], review: null,
      note: "前测发现（09-20 经验调查）：仅 suggested，待单元教学后复测确认；不推题、不干预。" },
  ],
};

/* ---------- 干预包 ---------- */
const interventions = {
  schema_version: "diagnostic-interventions-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  design_rule: "每个干预包最多 1 个微活动 + 1 道辨识题 + 1 道迁移题；next_action 支持 stop/collect_evidence/adjust_support，不默认无限加题。",
  packs: [
    { intervention_id: "iv-01", cause_ids: ["cause-01a"], student_id: F.xu_li, status: "completed",
      micro_activity: { title: "平方与算术平方根辨析（微活动）", content: "比较 3² 与 √9 的读法；用 a=3、0、-3 代入 √(a²) 与 a 各一次，口头说明何时相等。", duration_minutes: 8, format: "师生一对一/课后" },
      discrimination_question_id: "disc-r8-01", transfer_question_id: "tran-r8-07",
      rationale: "针对无条件等式误用：先正反例固化“非负约定”，再用取值分类迁移。",
      stop_rule: "迁移题答对且能口头说明范围条件即停止（fu-01 已触发）。", linked_case_ids: ["case-01"] },
    { intervention_id: "iv-02", cause_ids: ["cause-02a"], student_id: F.gong_qiaoying, status: "in_progress",
      micro_activity: { title: "圈条件三问（微活动）", content: "读题后先圈“固定费用/分段点/量程”，口头回答：什么不变？什么变？从哪里开始变？", duration_minutes: 6, format: "课堂随堂" },
      discrimination_question_id: "disc-r8-06", transfer_question_id: "tran-r8-04",
      rationale: "条件遗漏型：建立“先圈条件再动笔”程序，辨识题已通过（at-031），迁移在物理情境待复测。",
      stop_rule: "两个不同情境的迁移题都正确处理固定条件后停止。", linked_case_ids: ["case-02", "case-08"] },
    { intervention_id: "iv-03", cause_ids: ["cause-03a"], student_id: F.huang_mingjing, status: "pending_evidence",
      micro_activity: null, discrimination_question_id: "disc-r8-05", transfer_question_id: "tran-r8-03",
      rationale: "表征型（待补证）：case-03 确认前先安排低风险小组互说，不启动完整干预。",
      stop_rule: "案例确认后再评估是否需要微活动。", linked_case_ids: ["case-03"],
      note: "微活动留空的边界样例：辨识/迁移题可先备，活动待证据。" },
    { intervention_id: "iv-04", cause_ids: ["cause-04a"], student_id: F.tan_min, status: "adjusting",
      micro_activity: { title: "运算三步自查单（浓缩版）", content: "抄式核对→逐步写依据→回代估算；每题三步缺一退回。", duration_minutes: 10, format: "作业本首页自查单" },
      discrimination_question_id: "disc-r8-08", transfer_question_id: "tran-r8-01",
      rationale: "执行型：程序已建立（辨识通过）但执行不稳，复测未改善→调支持强度（fu-02：改错因归类四选一模板+隔日两题）。",
      stop_rule: "连续两次独立作业运算题零程序性错误后停止。", linked_case_ids: ["case-04"] },
    // 边界：无匹配干预（待补证案例暂不配干预包）
    { intervention_id: "iv-05", cause_ids: ["cause-05a", "cause-06a"], status: "no_matching_intervention",
      micro_activity: null, discrimination_question_id: null, transfer_question_id: null,
      rationale: null, stop_rule: null, linked_case_ids: ["case-05", "case-06"],
      note: "§8 边界：候选错因尚未确认（needs_evidence），系统返回“暂无匹配干预”，先补证（fu-04）而非推题。" },
  ],
};

/* ---------- 复测与跟踪 ---------- */
const followups = {
  schema_version: "diagnostic-followups-v1", data_version: "demo-v1", is_demo: true, demo_reference_date: REF_DATE,
  followups: [
    { followup_id: "fu-01", case_id: "case-01", intervention_id: "iv-01", followup_attempt_ids: ["at-003", "at-024"],
      target_outcomes: ["迁移题分类正确", "能口头说明范围条件依据"], observed_change: "已达成：tran-r8-07 分类正确并说明“距离非负”（at-003）；三类取值辨识通过（at-024）。",
      next_action: "stop", stop_reason: "reached_standard", recorded_at: "2026-09-20 10:00" },
    { followup_id: "fu-02", case_id: "case-04", intervention_id: "iv-04", followup_attempt_ids: ["at-014"],
      target_outcomes: ["独立作业运算题零程序性错误"], observed_change: "未改善：tran-r8-01 复测展开计算漏项（at-014）；辨识题（at-025/at-026）此前已通过。",
      next_action: "adjust_support", adjust_detail: "加错因归类四选一模板 + 隔日两题短练，一周后同型复测。", recorded_at: "2026-09-20 10:05" },
    { followup_id: "fu-03", case_id: "case-02", intervention_id: "iv-02", followup_attempt_ids: [],
      target_outcomes: ["两情境迁移题正确处理固定条件"], observed_change: "未完成：学生请假，复测未做。",
      next_action: "collect_evidence", collect_detail: "返校后补做 tran-r8-04 变式一道（已留卷）。", recorded_at: "2026-09-20 10:10" },
    { followup_id: "fu-04", case_id: "case-06", intervention_id: "iv-05", followup_attempt_ids: ["at-018", "at-051"],
      target_outcomes: ["无图像条件下判断增减性并写依据"], observed_change: "证据收集完成：09-21 纯解析式复测（at-051）仍错且 k 符号与方向对应混乱，与首测答对（at-017）的冲突仍存在；已提交教师复核，维持待补证。",
      next_action: "collect_evidence", collect_detail: "已完成纯解析式判断（at-051）；下一步由教师复核证据链后决定是否立案例。", recorded_at: "2026-09-22 10:15",
      note: "§8 边界：答对但无依据 + 证据冲突。" },
    { followup_id: "fu-05", case_id: "case-08", intervention_id: "iv-02", followup_attempt_ids: ["at-033", "at-032", "at-054"],
      target_outcomes: ["条件意识跨情境迁移"], observed_change: "改善推进：纯费用情境辨识通过（at-033）；调整支持后 09-22 复测（at-054）量程边界意识已建立。",
      next_action: "adjust_support", adjust_detail: "iv-02 再观察一轮（量程已稳，巩固固定条件类情境），连续两周稳定后停止。", recorded_at: "2026-09-22 10:20" },
  ],
};

/* ---------- 输出 ---------- */
console.log("生成诊断链路数据集 →");
console.log(`  题目 ${Q.length}（诊断 ${Q.filter((x) => x.category === "diagnostic").length} / 辨识 ${Q.filter((x) => x.category === "discrimination").length} / 迁移 ${Q.filter((x) => x.category === "transfer").length}），作答 ${A.length} 条`);
w("diagnostic-attempts.json", attempts);
w("diagnostic-cases.json", cases);
w("diagnostic-interventions.json", interventions);
w("diagnostic-followups.json", followups);
console.log("完成：确定性输出。");
