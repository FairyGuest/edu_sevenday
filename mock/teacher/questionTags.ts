/**
 * 题库多维标签 mock（开发辅助，非系统功能）。
 * 对应 v2.0 需求 L1–L4（题库标签体系对齐学科网/组卷网）：
 *  - L1 难度不再外显：difficulty_zh 仅保留在题目记录内（推荐引擎"难度递进"内部参数），
 *    facets 不再返回 difficulties；
 *  - L2 竞品式标签：来源类别（真题/模拟题/月考卷/期中卷/期末卷/同步练习…）、年份、教材版本；
 *  - L3 地域细化到省市二级（province + city；全国通用不细分）；
 *  - L4 口径统一：掌握程度四档只在画像侧；能力 L1–L4 + 素养双维（内部图谱独有）保持。
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

// ===== L3 地域：省 → 市 二级（覆盖 fixture 出现过的全部省级地域；全国通用不细分）=====
export const REGION_TREE: { province: string; cities: string[] }[] = [
  { province: "全国通用", cities: [] },
  { province: "北京市", cities: ["东城区", "西城区", "朝阳区", "海淀区"] },
  { province: "上海市", cities: ["黄浦区", "徐汇区", "静安区", "浦东新区"] },
  { province: "浙江省", cities: ["杭州市", "宁波市", "温州市", "绍兴市", "嘉兴市"] },
  { province: "江苏省", cities: ["南京市", "苏州市", "无锡市", "徐州市", "扬州市"] },
  { province: "广东省", cities: ["广州市", "深圳市", "佛山市", "东莞市"] },
  { province: "安徽省", cities: ["合肥市", "蚌埠市", "芜湖市", "马鞍山市", "安庆市"] },
  { province: "山东省", cities: ["济南市", "青岛市", "烟台市", "潍坊市"] },
  { province: "湖北省", cities: ["武汉市", "黄石市", "襄阳市", "黄冈市"] },
  { province: "河南省", cities: ["郑州市", "洛阳市", "开封市"] },
  { province: "湖南省", cities: ["长沙市", "株洲市", "衡阳市"] },
  { province: "福建省", cities: ["福州市", "厦门市", "泉州市"] },
  { province: "河北省", cities: ["石家庄市", "唐山市", "保定市"] },
  { province: "山西省", cities: ["太原市", "大同市", "临汾市"] },
  { province: "陕西省", cities: ["西安市", "宝鸡市", "咸阳市"] },
  { province: "吉林省", cities: ["长春市", "吉林市"] },
  { province: "黑龙江省", cities: ["哈尔滨市", "齐齐哈尔市"] },
  { province: "贵州省", cities: ["贵阳市", "遵义市"] },
  { province: "广西壮族自治区", cities: ["南宁市", "桂林市", "柳州市"] },
  { province: "重庆市", cities: ["渝中区", "江北区", "南岸区"] },
  { province: "新疆维吾尔自治区", cities: ["乌鲁木齐市", "克拉玛依市"] },
];
// 无地域信息题目的确定性归属池（保证筛选计数有区分度）
const HOT_PROVINCES = ["浙江省", "江苏省", "广东省", "安徽省", "北京市", "全国通用"];

// ===== L2 来源类别（学科网/组卷网式，由原"场景"扩充对齐）=====
export const SOURCE_TYPES = [
  "真题", "模拟题", "月考卷", "期中卷", "期末卷",
  "单元测试", "同步练习", "专项练习", "竞赛拓展",
];
const SOURCE_MAP: Record<string, string> = {
  "中考真题": "真题", "高考真题": "真题", "真题": "真题",
  "模拟考试": "模拟题", "模拟": "模拟题",
  "期中考试": "期中卷", "期末考试": "期末卷",
  "单元测试": "单元测试", "单元测验": "单元测试",
  "课堂练习": "同步练习", "课后作业": "同步练习", "同步练习": "同步练习",
  "专项练习": "专项练习", "综合复习": "专项练习",
  "竞赛训练": "竞赛拓展", "竞赛拓展": "竞赛拓展",
};

// ===== L2 教材版本 =====
export const TEXTBOOK_VERSIONS = ["人教版", "北师大版", "苏科版", "浙教版", "沪科版", "华师大版"];

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

function assignRegion(q: any, h: number) {
  const area = String(q.area || q.province || "").trim();
  const hit = REGION_TREE.find((r) => r.province === area);
  const province = hit ? hit.province : HOT_PROVINCES[h % HOT_PROVINCES.length];
  const cities = REGION_TREE.find((r) => r.province === province)?.cities || [];
  const city = cities.length ? cities[(h >> 2) % cities.length] : "";
  return { province, city, region: province }; // region 兼容旧省级筛选字段
}

function assignSource(q: any, h: number) {
  const raw = String(q.scene || q.source_type || "");
  if (SOURCE_MAP[raw]) return SOURCE_MAP[raw];
  if (SOURCE_TYPES.includes(raw)) return raw;
  if (raw === "期中期末") return h & 1 ? "期中卷" : "期末卷";
  return SOURCE_TYPES[(h >> 3) % SOURCE_TYPES.length];
}

// 年份兜底池：2019-2026 全覆盖，近年（2024-2026）权重略高，贴近真实题库分布
const YEAR_POOL = [2019, 2020, 2020, 2021, 2021, 2022, 2022, 2023, 2023, 2024, 2024, 2024, 2025, 2025, 2025, 2026, 2026];

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
  const reg = assignRegion(q, h);
  const sourceType = assignSource(q, h);
  return {
    ...q,
    qid: q.qid || q.id || key,
    cluster,
    difficulty_zh: normDiff(diffZh), // L1：仅推荐引擎内部使用，不在筛选/题卡外显
    form: normForm(q.form || q.quesType),
    ability: ABILITIES[["L1", "L2", "L3", "L4"].indexOf(level)] || "L2 理解",
    literacy: questionLiteracy(cluster),
    province: reg.province,
    city: reg.city,
    region: reg.region,
    source_type: sourceType,
    scene: sourceType, // 兼容旧筛选链路（值域已切换为来源类别）
    year: q.year ? String(q.year).replace("年", "") : String(YEAR_POOL[h % YEAR_POOL.length]),
    textbook_version: q.textbook_version || TEXTBOOK_VERSIONS[(h >> 4) % TEXTBOOK_VERSIONS.length],
  };
}

/** 筛选面板的选项（带计数）。v2.0-L：难度已下线，新增来源类别/年份/教材版本/省市二级树。 */
export function tagFacets(items: any[]) {
  const count = (key: string): { value: string; n: number }[] => {
    const m = new Map<string, number>();
    for (const it of items) m.set(it[key], (m.get(it[key]) || 0) + 1);
    return [...m.entries()].map(([value, n]) => ({ value, n })).sort((a, b) => b.n - a.n);
  };
  const sourceTypes = count("source_type");
  const regions = count("province");
  // 省市二级树（市级计数挂在省下；全国通用无市级）
  const cityCnt = new Map<string, Map<string, number>>();
  for (const it of items) {
    if (!it.city) continue;
    const m = cityCnt.get(it.province) || new Map<string, number>();
    m.set(it.city, (m.get(it.city) || 0) + 1);
    cityCnt.set(it.province, m);
  }
  const region_tree = regions.map((r) => ({
    province: r.value,
    n: r.n,
    cities: [...(cityCnt.get(r.value) || new Map<string, number>())]
      .map(([value, n]) => ({ value, n }))
      .sort((a, b) => b.n - a.n),
  }));
  return {
    abilities: count("ability"),
    literacies: count("literacy"),
    source_types: sourceTypes,
    scenes: sourceTypes, // 兼容旧 UI 键名（值域=来源类别）
    forms: count("form"),
    years: count("year").sort((a, b) => Number(a.value) - Number(b.value)), // 年份按时间正序（2019→2026），不按数量
    textbook_versions: count("textbook_version"),
    regions, // 省级扁平（兼容旧 UI）
    region_tree, // 省市二级（新 UI）
    // difficulties 已按 L1 下线，不再返回
  };
}

/** 多维组合筛选（全部为 AND，单维内多选 OR） */
export function filterQuestions(items: any[], f: Record<string, string[]>) {
  return items.filter((it) =>
    Object.entries(f).every(([key, vals]) => !vals?.length || vals.includes(it[key])),
  );
}
