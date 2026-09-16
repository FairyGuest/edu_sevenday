/**
 * 教师端 · 资源平台知识图谱 mock（开发辅助，非系统功能）。
 * 对应 v2.0 需求 K1：资源平台新增"知识图谱"Tab（全量图谱展示 + 节点解释）。
 * 接口：GET /api/teacher/resource/kgraph?grade=g7|g8|g9（缺省=全学段）
 *       GET /api/teacher/resource/kgraph/explain?node=一元二次方程
 * 说明：本轮为轻量底盘（展示 + 确定性解释），图谱编辑/掌握度着色/跨模块跳转
 * 等增强项待产品详细设计后排期；AI 化解释由助手链路（I）后续叠加。
 */
import { readTeacherFixture as read, memoizeMock } from "./fixtures";
import { clusterLevel, clusterLiteracy, LEVEL_META } from "./dimensions";

const graphCache = memoizeMock<ReturnType<typeof computeFullGraph>>(4);
const buildFullGraph = (grade?: string) => graphCache(grade || "all", () => computeFullGraph(grade));

const GRADE_NAME: Record<string, string> = { g7: "七年级", g8: "八年级", g9: "九年级" };
const LIT_NAMES: Record<string, string> = {
  abstraction: "数学抽象", reasoning: "逻辑推理", modeling: "数学建模",
  intuition: "直观想象", operation: "数学运算", data: "数据分析",
};
// 各能力层级的教学提示（解释接口用；确定性模板）
const LEVEL_TIPS: Record<string, string> = {
  L1: "教学侧重概念辨析与再认再现，可用贴近生活的实例导入",
  L2: "教学侧重解释与举例，建议让学生用自己的话描述规则并互相纠错",
  L3: "教学侧重熟悉情境下的运用与计算，配合变式练习巩固程序性步骤",
  L4: "教学侧重新情境的综合与迁移，可设计建模/探究任务并允许小组协作",
};

/** 全量知识图谱：节点=知识目录（带年级/章/层级/能力等级/素养），边=章内先修脉络 + 素养同源 */
function computeFullGraph(grade?: string) {
  const kn = read("knowledge.json");
  const gOrder = ["g7", "g8", "g9"];
  const chapOf = (raw: string) => (raw || "").replace(/G\d+[上下]?\s*/, "");

  const nodes: any[] = [];
  const chapters: { grade: string; grade_name: string; chapters: { name: string; n_clusters: number }[] }[] = [];
  for (const g of kn.grades) {
    if (grade && g.grade !== grade) continue;
    const chList: { name: string; n_clusters: number }[] = [];
    for (const ch of g.chapters) {
      const chap = chapOf(ch.chapter);
      ch.clusters.forEach((c: any, i: number) => {
        const [main, second] = clusterLiteracy(c.cluster);
        const level = clusterLevel(c.cluster);
        nodes.push({
          id: c.cluster,
          chapter: chap,
          grade: g.grade,
          grade_name: GRADE_NAME[g.grade] || g.grade,
          layer: i,
          level,
          level_label: LEVEL_META[level].label,
          level_verb: LEVEL_META[level].verb,
          literacy: LIT_NAMES[main] || "数学运算",
          literacy_second: LIT_NAMES[second] || "逻辑推理",
        });
      });
      chList.push({ name: chap, n_clusters: ch.clusters.length });
    }
    chapters.push({ grade: g.grade, grade_name: GRADE_NAME[g.grade] || g.grade, chapters: chList });
  }

  // 边：同章相邻 = 先修脉络（章内目录序）；跨章同主素养 = 素养同源（限量避免糊）
  const edges: { src: string; tgt: string; kind: string }[] = [];
  const byChap = new Map<string, any[]>();
  nodes.forEach((n) => {
    const key = `${n.grade}|${n.chapter}`;
    (byChap.get(key) || byChap.set(key, []).get(key)!).push(n);
  });
  for (const list of byChap.values()) {
    for (let i = 0; i + 1 < list.length; i++) {
      edges.push({ src: list[i].id, tgt: list[i + 1].id, kind: "chapter" });
    }
  }
  const litGroups = new Map<string, any[]>();
  nodes.forEach((n) => {
    (litGroups.get(n.literacy) || litGroups.set(n.literacy, []).get(n.literacy)!).push(n);
  });
  for (const g of litGroups.values()) {
    for (let i = 0; i + 1 < g.length && i < 5; i++) {
      edges.push({ src: g[i].id, tgt: g[i + 1].id, kind: "literacy" });
    }
  }

  return {
    nodes,
    edges,
    chapters,
    stats: { n_nodes: nodes.length, n_edges: edges.length, grades: chapters.map((c) => c.grade_name) },
  };
}

/** 节点解释（v2.0-I 小助手复用）：知识点定位（章/年级）、课标能力等级、素养、先修后继、教学提示 */
export function explainNode(nodeId: string) {
  const g = buildFullGraph();
  const node = g.nodes.find((n: any) => n.id === nodeId);
  if (!node) return null;
  const pre = g.edges.filter((e: any) => e.tgt === nodeId && e.kind === "chapter").map((e: any) => e.src);
  const succ = g.edges.filter((e: any) => e.src === nodeId && e.kind === "chapter").map((e: any) => e.tgt);
  const related = g.nodes
    .filter((n: any) => n.id !== nodeId && n.literacy === node.literacy)
    .slice(0, 5)
    .map((n: any) => n.id);
  const summary =
    `「${node.id}」属${node.grade_name}·${node.chapter}，课标能力要求为 ${node.level_label}（${node.level_verb}），` +
    `主要考查「${node.literacy}」素养` +
    (pre.length ? `；先修知识：${pre.join("、")}` : "；为本章起始知识点，暂无章内先修") +
    (succ.length ? `；后续衔接：${succ.join("、")}` : "") +
    "。";
  return {
    node,
    prerequisites: pre,
    successors: succ,
    related_same_literacy: related,
    summary,
    teaching_tip: LEVEL_TIPS[node.level] || LEVEL_TIPS.L2,
  };
}

/** 全量知识点名（供小助手做"解释XX知识点"的名字匹配） */
export function allNodeNames(): string[] {
  return buildFullGraph().nodes.map((n: any) => n.id);
}

export default {
  "GET /api/teacher/resource/kgraph": (req: any, res: any) => {
    const grade = req.query.grade && GRADE_NAME[req.query.grade] ? String(req.query.grade) : undefined;
    res.json({
      code: 200,
      msg: "ok",
      data: {
        ...buildFullGraph(grade),
        note: "v2.0-K1 轻量版：全量知识图谱（展示 + 节点解释）；详细交互待产品确认后增强",
      },
    });
  },

  /** 节点解释：知识点定位（章/年级）、课标能力等级、素养、先修后继、教学提示 */
  "GET /api/teacher/resource/kgraph/explain": (req: any, res: any) => {
    const data = explainNode(String(req.query.node || ""));
    if (!data) return res.json({ code: 404, msg: "知识点不存在", data: null });
    res.json({ code: 200, msg: "ok", data });
  },
};
