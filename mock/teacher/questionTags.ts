/**
 * 题库多维标签 mock（开发辅助，非系统功能）。
 * 对应改进需求 C1/C2：与学科网竞品差异化——在知识点+难度+题型之上，
 * 叠加**能力等级（课标动词）**与**素养（六大素养）**双维（内部图谱独有），
 * 并补充**区域**（贴近本地考情）。
 * 打标口径：确定性哈希（同一题每次打标一致，模拟"专家规则→AI 批量打标"结果）。
 */
import { clusterLevel, clusterLiteracy } from "./dimensions";

const ABILITIES = ["L1 了解", "L2 理解", "L3 掌握", "L4 综合"];
// 值域归一：不同来源 fixture 的叫法 → 统一筛选域
const FORM_MAP: Record<string, string> = {
  "单选题": "选择", "多选题": "选择", "选择题": "选择",
  "填空题": "填空", "判断题": "判断猜想",
  "简答题": "解答计算", "解答题": "解答计算", "应用题": "解答计算", "计算题": "解答计算",
  "证明题": "证明", "作图题": "作图",
};
const DIFF_MAP: Record<string, string> = { "中等": "适中", "中档": "适中", "一般": "适中" };
const normForm = (v?: string) => (v ? FORM_MAP[v] || v : "选择");
const normDiff = (v?: string) => (v ? DIFF_MAP[v] || v : "适中");
const REGIONS = ["北京", "上海", "浙江", "江苏", "广东", "全国通用"];
const SCENES = ["课堂练习", "课后作业", "单元测验", "期中期末", "中考真题", "竞赛拓展"];

const hash = (s: string) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 100003; return h; };

/** 按知识点主素养映射素养名 */
export function questionLiteracy(cluster: string): string {
  const LIT_NAMES: Record<string, string> = {
    abstraction: "数学抽象", reasoning: "逻辑推理", modeling: "数学建模",
    intuition: "直观想象", operation: "数学运算", data: "数据分析",
  };
  const [main] = clusterLiteracy(cluster);
  return LIT_NAMES[main] || "数学运算";
}

/** 单题打标：在原字段上叠加多维标签。
 * 兼容两种题库 fixture：teacher/data（qid/cluster/form/difficulty_zh）
 * 与 mock/data（id/kgPoints/quesType/数值 difficulty/area）。 */
export function tagQuestion(q: any) {
  const key = String(q.qid ?? q.id ?? q.stem ?? "");
  const h = hash(key);
  const cluster = q.cluster
    || (Array.isArray(q.kgPoints) ? q.kgPoints[0] : q.kgPoints)
    || "未分类";
  const level = clusterLevel(cluster); // 知识点的能力等级（专家标定表）
  const diffZh = q.difficulty_zh
    || (typeof q.difficulty === "number"
      ? (q.difficulty < 0.35 ? "容易" : q.difficulty < 0.65 ? "适中" : "较难")
      : (q.difficulty || "适中"));
  return {
    ...q,
    qid: q.qid || q.id || key,
    cluster,
    difficulty_zh: normDiff(diffZh),
    form: normForm(q.form || q.quesType),
    ability: ABILITIES[["L1", "L2", "L3", "L4"].indexOf(level)] || "L2 理解",
    literacy: questionLiteracy(cluster),
    region: q.region || q.area || REGIONS[h % REGIONS.length],
    scene: q.scene || SCENES[(h >> 3) % SCENES.length],
  };
}

/** 筛选面板的选项（带计数） */
export function tagFacets(items: any[]) {
  const count = (key: string): { value: string; n: number }[] => {
    const m = new Map<string, number>();
    for (const it of items) m.set(it[key], (m.get(it[key]) || 0) + 1);
    return [...m.entries()].map(([value, n]) => ({ value, n })).sort((a, b) => b.n - a.n);
  };
  return {
    abilities: count("ability"),
    literacies: count("literacy"),
    regions: count("region"),
    scenes: count("scene"),
  };
}

/** 多维组合筛选（全部为 AND，单维内多选 OR） */
export function filterQuestions(items: any[], f: Record<string, string[]>) {
  return items.filter((it) =>
    Object.entries(f).every(([key, vals]) => !vals?.length || vals.includes(it[key])),
  );
}
