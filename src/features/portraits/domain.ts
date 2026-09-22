export const DIMENSIONS = [
  { key: "knowledge", name: "知识点画像", color: "#2563eb" },
  { key: "ability", name: "能力画像", color: "#087f8c" },
  { key: "literacy", name: "素养画像", color: "#ad4773" },
  { key: "process", name: "学习过程表现画像", color: "#657536" },
] as const;
export const SOURCES = [
  "作业记录",
  "考试记录",
  "课堂互动",
  "人机交互",
  "自主练习",
];
export const SOURCE_NAMES: Record<string, string> = {
  homework: "作业记录",
  exam: "考试记录",
  classroom: "课堂互动",
  ai_tutor: "人机交互",
  practice: "自主练习",
};
export const STRENGTHS: Record<string, string> = {
  sufficient: "样本充足",
  low_sample: "样本偏少",
  stale: "久未更新",
  unknown: "未标注",
};
export interface Scope {
  start_date: string;
  end_date: string;
  sources: string[];
  textbook_id?: string;
  curriculum_scope_type?: string;
  curriculum_scope_id?: string;
}
export interface Evidence {
  evidence_id: string;
  source_type: string;
  source_name: string;
  occurred_at: string;
  answer_summary?: string;
  question_stem?: string;
  score?: number;
  full_score?: number;
  knowledge_ids?: string[];
}
export const list = (value: any): any[] =>
  Array.isArray(value) ? value.filter(Boolean) : [];
export const score = (value: any): number | null =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 100
    ? value
    : null;
export const band = (value: any, strength?: string) => {
  const v = score(value);
  return v === null || strength === "low_sample"
    ? "证据不足"
    : v < 50
      ? "待巩固"
      : v < 71
        ? "练习中"
        : v < 86
          ? "较熟练"
          : "已掌握";
};
export const scopeLabel = (scope: Scope) =>
  `${scope.start_date || "最早记录"} 至 ${scope.end_date || "最新记录"} · ${scope.sources.join("、")}`;
export function matchesEvidence(e: Evidence, scope: Scope) {
  const date = String(e.occurred_at || "").slice(0, 10);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    (!scope.start_date || date >= scope.start_date) &&
    (!scope.end_date || date <= scope.end_date) &&
    scope.sources.includes(SOURCE_NAMES[e.source_type])
  );
}
export function fullSnapshot(snapshot: any, scope: Scope) {
  if (snapshot?.statistic_mode === "observations") return snapshot.curriculum_scope_type === (scope.curriculum_scope_type || "all") && snapshot.curriculum_scope_id === (scope.curriculum_scope_id || "") && snapshot.request_start === scope.start_date && snapshot.request_end === scope.end_date && [...snapshot.sources].sort().join() === [...scope.sources].sort().join();
  const window = snapshot?.time_window;
  return (
    !!window?.start_date &&
    !!window?.end_date &&
    list(snapshot?.sources).length > 0 &&
    (!scope.start_date || scope.start_date <= window.start_date) &&
    (!scope.end_date || scope.end_date >= window.end_date) &&
    list(snapshot.sources).every((s) => scope.sources.includes(s))
  );
}
export function explanationsFor(
  data: any,
  target: string,
  ids: string[],
  scope: Scope,
) {
  return list(data?.explanations)
    .filter((e) => e.target_type === target && ids.includes(e.target_id))
    .map((e) => ({
      ...e,
      evidence: list(e.evidence).filter((ev) => matchesEvidence(ev, scope)),
    }));
}
export function dimensionView(data: any, key: string, scope: Scope) {
  const dimension = list(data?.snapshot?.dimensions).find(
    (d) => d.dimension_key === key,
  );
  const complete = fullSnapshot(data?.snapshot, scope);
  const items = list(dimension?.radar_items);
  const explanations = [
    ...explanationsFor(data, "dimension", [key], scope),
    ...explanationsFor(
      data,
      "radar_item",
      items.map((i) => i.key),
      scope,
    ),
  ];
  const evidence = [
    ...new Map(
      explanations.flatMap((e) => e.evidence).map((e) => [e.evidence_id, e]),
    ).values(),
  ];
  return { dimension, items, explanations, evidence, complete };
}
export interface GraphFilter {
  dimension: string;
  mastery: string;
  strength: string;
  goal: string;
}
export const DEFAULT_GRAPH_FILTER: GraphFilter = {
  dimension: "knowledge",
  mastery: "",
  strength: "",
  goal: "",
};
export function graphView(data: any, scope: Scope, filter: GraphFilter) {
  const personal =
    data?.scope === "student" || data?.snapshot?.scope === "student";
  const complete = fullSnapshot(data?.snapshot, scope);
  const items = list(data?.snapshot?.dimensions).flatMap((d) =>
    list(d.radar_items),
  );
  const nodes = list(data?.graph?.nodes)
    .map((node) => {
      const linked = items.filter((i) =>
        list(i.related_knowledge_ids).includes(node.node_id),
      );
      const explanations = personal
        ? explanationsFor(
            data,
            "radar_item",
            linked.map((i) => i.key),
            scope,
          )
        : explanationsFor(data, "knowledge_node", [node.node_id], scope);
      const evidence: Evidence[] = [
        ...new Map(
          explanations
            .flatMap((e) => e.evidence)
            .map((e) => [e.evidence_id, e]),
        ).values(),
      ] as Evidence[];
      // Student graph values must never inherit the class graph's mastery score.
      const knowledgeItems = list(
        list(data?.snapshot?.dimensions).find(
          (d) => d.dimension_key === "knowledge",
        )?.radar_items,
      ).filter(
        (i) =>
          list(i.related_knowledge_ids).includes(node.node_id) &&
          score(i.value) !== null,
      );
      const mastery =
        !data?.snapshot || !complete
          ? null
          : personal
            ? knowledgeItems.length
              ? Math.round(
                  knowledgeItems.reduce((n, i) => n + i.value, 0) /
                    knowledgeItems.length,
                )
              : null
            : score(node.mastery);
      const strength =
        !complete || mastery === null
          ? "low_sample"
          : personal
            ? knowledgeItems.some((i) => i.evidence_strength === "low_sample")
              ? "low_sample"
              : knowledgeItems.some((i) => i.evidence_strength === "stale")
                ? "stale"
                : "sufficient"
            : node.evidence_strength || "unknown";
      return {
        ...node,
        mastery,
        evidence_strength: strength,
        mastery_band: band(mastery, strength),
        evidence,
        explanations,
        complete,
        explanation: data?.snapshot?.statistic_mode === "observations" ? node.explanation : complete
          ? personal
            ? "个人读数取关联知识点雷达指标均值；班级数据不参与个人评分。"
            : node.explanation || "当前快照未提供详细解释。"
          : `当前条件匹配 ${evidence.length} 条证据摘要，缺少完整统计数据，暂不重算掌握度。`,
      };
    })
    .filter((node) => {
      const relation =
        filter.dimension === "knowledge" ||
        list(
          node[
            {
              ability: "ability_keys",
              literacy: "literacy_keys",
              process: "process_keys",
            }[filter.dimension] || ""
          ],
        ).length > 0;
      return (
        relation &&
        (complete || node.evidence.length > 0) &&
        (!filter.mastery || node.mastery_band === filter.mastery) &&
        (!filter.strength || node.evidence_strength === filter.strength) &&
        (!filter.goal || list(node.goal_ids).includes(filter.goal))
      );
    });
  const ids = new Set(nodes.map((n) => n.node_id));
  const edges = list(data?.graph?.edges).filter(
    (e) => ids.has(e.source) && ids.has(e.target),
  );
  return { nodes, edges, complete };
}
