/**
 * 学情画像 · 多维标签体系 mock（开发辅助，非系统功能）。
 * 对应改进需求 A1/A2/A5：
 *  - A2 知识点能力等级：课标行为动词映射 L1-L4（了解/理解/掌握/应用），
 *    不同知识点按复杂度 3-4 级（由 LEVELS 映射标定，模拟学科专家输出）
 *  - A1 素养维度：初中数学六大素养 + 二级维度（高永强输入的体系）
 *  - A5 时间维度：周/月窗口对掌握度/趋势的重算（周窗口样本更少、波动更大）
 */

// ===== A2 知识点能力等级（学科专家标定的模拟表）=====
export type Level = "L1" | "L2" | "L3" | "L4";
export const LEVEL_META: Record<Level, { label: string; verb: string; color: string }> = {
  L1: { label: "L1 了解", verb: "了解 / 知道 / 识别", color: "#52607a" },
  L2: { label: "L2 理解", verb: "理解 / 描述 / 说明", color: "#2563eb" },
  L3: { label: "L3 掌握", verb: "掌握 / 运用 / 计算", color: "#7c3aed" },
  L4: { label: "L4 综合", verb: "综合 / 迁移 / 建模", color: "#db2777" },
};

// 知识点 → 课标等级（模拟专家标定；未命中的按名称启发式归级）
const LEVEL_MAP: Record<string, Level> = {
  // —— 原有条目（班级画像表格在用，保持不变）——
  二次根式: "L2",
  二次根式的乘除: "L3",
  二次根式的加减: "L3",
  全等三角形: "L2",
  三角形全等的判定: "L4",
  用提公因式法分解因式: "L3",
  乘法公式: "L3",
  因式分解: "L4",
  整式的乘法: "L3",
  分式: "L3",
  分式及其基本性质: "L2",
  一次函数的图象和性质: "L4",
  一次函数: "L3",
  四边形: "L2",
  平行四边形: "L3",
  特殊的平行四边形: "L4",
  勾股定理: "L3",
  "课题学习 图案设计": "L1",
  相交线与平行线: "L2",
  一元二次方程: "L3",
  轴对称: "L1",
  // —— 全量目录补全（g7：概念了解/性质理解/运算掌握/综合应用）——
  相交线: "L1",
  "定义、命题、定理": "L1",
  平行线: "L2",
  实数及其简单运算: "L3",
  平面直角坐标系: "L2",
  用坐标描述平面内点的位置: "L3",
  不等式: "L2",
  一元一次不等式组: "L3",
  不等式与不等式组: "L4",
  二元一次方程组的概念: "L1",
  "消元——解二元一次方程组": "L3",
  统计调查: "L2",
  用统计图描述数据: "L3",
  正数和负数: "L1",
  有理数及其大小比较: "L2",
  有理数的加法与减法: "L3",
  有理数的乘法与除法: "L3",
  整式: "L1",
  列代数式表示数量关系: "L3",
  代数式的值: "L3",
  整式的加法与减法: "L3",
  实际问题与一元一次方程: "L4",
  方程: "L1",
  几何图形: "L1",
  几何图形初步: "L1",
  "直线、射线、线段": "L1",
  角: "L2",
  // —— 全量目录补全（g8）——
  二次根式及其性质: "L2",
  二次根式的加法与减法: "L3",
  勾股定理及其应用: "L4",
  勾股定理的逆定理及其应用: "L4",
  四边形及多边形: "L2",
  函数: "L1",
  函数的概念: "L2",
  实际问题与一次函数: "L4",
  "一次函数与方程 (组）不等式": "L4",
  数据的集中趋势: "L2",
  数据的离散程度: "L2",
  数据的四分位数: "L2",
  数据的分析: "L3",
  三角形: "L1",
  三角形的内角与外角: "L3",
  与三角形有关的线段: "L2",
  三角形的概念: "L1",
  全等三角形及其性质: "L2",
  图形的轴对称: "L2",
  幂的运算: "L3",
  分式的乘法与除法: "L3",
  分式的加法与减法: "L3",
};

export function clusterLevel(cluster: string): Level {
  if (LEVEL_MAP[cluster]) return LEVEL_MAP[cluster];
  // 启发式：含"判定/证明/综合/应用"→L4；"计算/化简/运算/解"→L3；"概念/初步"→L1；其余→L2
  if (/判定|证明|综合|应用|建模/.test(cluster)) return "L4";
  if (/计算|化简|运算|求解|解[^析]/.test(cluster)) return "L3";
  if (/概念|初步|认识/.test(cluster)) return "L1";
  return "L2";
}

// ===== A1 素养体系（初中数学 · 六大素养 + 二级维度）=====
export const LITERACY_DIMS: { key: string; name: string; subs: string[]; color: string }[] = [
  { key: "abstraction", name: "数学抽象", subs: ["符号意识", "概念抽象", "关系抽象"], color: "var(--dim-knowledge)" },
  { key: "reasoning", name: "逻辑推理", subs: ["归纳推理", "类比推理", "演绎论证"], color: "var(--dim-task)" },
  { key: "modeling", name: "数学建模", subs: ["模型感知", "模型构建", "模型检验"], color: "var(--dim-cognitive)" },
  { key: "intuition", name: "直观想象", subs: ["空间观念", "几何直观", "数形表征"], color: "var(--dim-method)" },
  { key: "operation", name: "数学运算", subs: ["算理理解", "算法选择", "运算验证"], color: "var(--dim-context)" },
  { key: "data", name: "数据分析", subs: ["数据收集", "数据描述", "数据推断"], color: "var(--dim-structure)" },
];

// 知识点 → 素养权重（主素养 + 次素养，模拟专家关联表）
const LITERACY_MAP: Record<string, [string, string]> = {
  二次根式: ["abstraction", "operation"],
  二次根式的乘除: ["operation", "abstraction"],
  二次根式的加减: ["operation", "reasoning"],
  全等三角形: ["intuition", "reasoning"],
  三角形全等的判定: ["reasoning", "intuition"],
  用提公因式法分解因式: ["operation", "reasoning"],
  乘法公式: ["operation", "abstraction"],
  因式分解: ["operation", "reasoning"],
  整式的乘法: ["operation", "abstraction"],
  分式: ["abstraction", "operation"],
  分式及其基本性质: ["abstraction", "operation"],
  一次函数的图象和性质: ["modeling", "intuition"],
  一次函数: ["modeling", "operation"],
  四边形: ["intuition", "reasoning"],
  平行四边形: ["intuition", "reasoning"],
  特殊的平行四边形: ["reasoning", "intuition"],
  勾股定理: ["modeling", "operation"],
  "课题学习 图案设计": ["intuition", "abstraction"],
  相交线与平行线: ["intuition", "reasoning"],
  一元二次方程: ["modeling", "operation"],
  轴对称: ["intuition", "abstraction"],
  // 数据分析素养的知识点挂载（统计与概率域）
  用样本估计总体: ["data", "reasoning"],
  抽样调查: ["data", "abstraction"],
  数据的收集与整理: ["data", "operation"],
  统计图表: ["data", "intuition"],
  平均数与中位数: ["data", "operation"],
  方差与标准差: ["data", "operation"],
};

export function clusterLiteracy(cluster: string): [string, string] {
  return LITERACY_MAP[cluster] || ["operation", "reasoning"];
}

// ===== 计算画像多维块（班级/学生通用）=====
/** cells: [{cluster, p, band, n, k}]；返回能力分布 + 素养掌握度 */
export function computeDimensions(cells: any[]) {
  const valid = cells.filter((c) => c && c.n >= 3); // 3 题样本门槛（A4 口径）
  // 能力等级分布：各等级知识点数与平均掌握度
  const byLevel: Record<string, { n: number; pSum: number; clusters: string[] }> = {};
  for (const c of valid) {
    const lv = clusterLevel(c.cluster);
    byLevel[lv] ||= { n: 0, pSum: 0, clusters: [] };
    byLevel[lv].n++;
    byLevel[lv].pSum += c.p;
    byLevel[lv].clusters.push(c.cluster);
  }
  const ability_dist = (["L1", "L2", "L3", "L4"] as Level[]).map((lv) => ({
    level: lv,
    label: LEVEL_META[lv].label,
    verb: LEVEL_META[lv].verb,
    n: byLevel[lv]?.n || 0,
    avg: byLevel[lv] ? Math.round(byLevel[lv].pSum / byLevel[lv].n) : null,
    clusters: (byLevel[lv]?.clusters || []).slice(0, 4),
  }));

  // 素养掌握度：主素养权重 1.0 / 次素养 0.5，按掌握度加权
  const byLit: Record<string, { pSum: number; wSum: number; subs: Record<string, { p: number; n: number }> }> = {};
  for (const c of valid) {
    const [main, second] = clusterLiteracy(c.cluster);
    for (const [key, w] of [[main, 1], [second, 0.5]] as [string, number][]) {
      byLit[key] ||= { pSum: 0, wSum: 0, subs: {} };
      byLit[key].pSum += c.p * w;
      byLit[key].wSum += w;
      // 二级维度：确定性轮转归属（模拟子维度作答样本）
      const dim = LITERACY_DIMS.find((d) => d.key === key)!;
      const sub = dim.subs[c.cluster.length % dim.subs.length];
      byLit[key].subs[sub] ||= { p: 0, n: 0 };
      byLit[key].subs[sub].p += c.p;
      byLit[key].subs[sub].n += 1;
    }
  }
  const literacy = LITERACY_DIMS.map((d) => {
    const agg = byLit[d.key];
    const value = agg && agg.wSum > 0 ? Math.round(agg.pSum / agg.wSum) : null;
    const subs = d.subs.map((s) => {
      const sub = agg?.subs[s];
      return { name: s, value: sub && sub.n > 0 ? Math.round(sub.p / sub.n) : null };
    });
    return { key: d.key, name: d.name, color: d.color, value, subs, n_clusters: Math.round((agg?.wSum || 0)) };
  });

  return { ability_dist, literacy, sample_rule: "单知识点能力评估最低 3 题样本；证据不足不计入分布" };
}

// ===== A5 时间窗口重算 =====
export type TimeRange = "week" | "month";

/** 自定义起止日期窗口：按跨度在"近期周窗"与"全量月窗"之间插值，长跨度更接近月基线 */
export function applyDateRange(prof: any, start?: string, end?: string, classId = ""): any {
  if (!start || !end) return prof;
  const t0 = new Date(start).getTime();
  const t1 = new Date(end).getTime();
  if (isNaN(t0) || isNaN(t1) || t1 <= t0) return prof;
  const days = Math.min(365, Math.max(1, Math.round((t1 - t0) / 86400000)));
  const week = applyTimeWindow(prof, "week", classId);
  // 权重：1 天=纯周窗，≥45 天=纯月基线
  const w = Math.min(1, (days - 1) / 44);
  const mix = (a: any, b: any) => (a == null || b == null ? (b ?? a) : Math.round(a * (1 - w) + b * w));
  const cluster_rows = (week.cluster_rows || []).map((r: any, i: number) => {
    const m = (prof.cluster_rows || [])[i] || r;
    return { ...r, weak_pct: Math.round(r.weak_pct * (1 - w) + (m.weak_pct ?? r.weak_pct) * w) };
  });
  const cards = {
    ...week.cards,
    recent5_avg: mix(week.cards?.recent5_avg, prof.cards?.recent5_avg),
    weak_top_pct: cluster_rows[0]?.weak_pct ?? week.cards?.weak_top_pct,
  };
  const note = days <= 7 ? "近一周窗口：样本较少，数值以近期作答为主" :
    days <= 31 ? `近 ${days} 天窗口（${start} ~ ${end}）` : `自定义窗口 ${start} ~ ${end}（${days} 天）`;
  return { ...week, cluster_rows, cards, time_range: "custom", window_note: note };
}
const hash = (s: string) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 997; return h; };

/** 按时间窗重算画像：周窗样本少 → 数值向近期趋势收敛且有确定性扰动；月窗=基线 */
export function applyTimeWindow(prof: any, range: TimeRange, classId: string) {
  if (range === "month") return { ...prof, time_range: "month" };
  const seed = hash(classId + "week");
  const jitter = (v: number, i: number) => Math.max(35, Math.min(98, Math.round(v + ((seed + i * 37) % 11) - 5)));
  // 掌握度：取趋势末端（近一周）+扰动
  const lastTrend = (prof.trend || []).slice(-2);
  const base = lastTrend.length ? (lastTrend[lastTrend.length - 1].value ?? 60) : 60;
  const cellsJit = (p: number, i: number) => Math.max(30, Math.min(97, Math.round(p * 0.35 + base * 0.65 + (((seed + i * 29) % 9) - 4))));
  const cluster_rows = (prof.cluster_rows || []).map((r: any, i: number) => ({
    ...r,
    band_counts: r.band_counts,
    weak_pct: Math.max(0, Math.min(100, Math.round(r.weak_pct * 0.7 + (seed % 7)))),
    // 周窗下各簇掌握度扰动
    week_p: cellsJit(60 + (r.weak_pct ? 60 - r.weak_pct : 0), i),
  }));
  const trend = (prof.trend || []).slice(-3).map((t: any, i: number) => ({
    window: t.window,
    value: jitter(t.value ?? 60, i),
    n: Math.round((t.n || 40) * 0.3),
  }));
  const cards = {
    ...prof.cards,
    recent5_avg: base ? jitter(base, 3) : null,
    weak_top_pct: cluster_rows[0]?.weak_pct ?? prof.cards?.weak_top_pct,
  };
  return { ...prof, cluster_rows, trend, cards, time_range: "week", window_note: "本周窗口：样本较少，数值以近期作答为主，波动大于月度" };
}
