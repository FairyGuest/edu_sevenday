import { array, naturalDate, knowledgeSummary } from "./supportDomain";

export default {};

// Presentation data is rebuilt from the already-filtered events, never from old snapshot scores.
export function supportPortrait({
  scope,
  events,
  knowledge,
  graph,
  mappings,
  links,
  framework,
  indicators,
  references,
  metrics,
}: any) {
  const subject = array(references).find(
    (s) => s.subject_id === scope.subject_id,
  );
  const stage =
    framework?.stage_id ||
    (/^g(10|11|12)$/.test(scope.grade_id) ? "senior" : "junior");
  const competencies = array(subject?.[stage]);
  const rules = array(metrics);
  const eventMap = new Map(events.map((e: any) => [e.evidence_id, e]));
  const graphNodes = new Map(array(graph.nodes).map((n) => [n.node_id, n]));
  const band = (v: number | null) =>
    v === null
      ? "证据不足"
      : v < 50
        ? "待巩固"
        : v < 71
          ? "练习中"
          : v < 86
            ? "较熟练"
            : "已掌握";
  const countItem = (key: string, name: string, ids: string[], extra = {}) => ({
    key,
    name,
    value: new Set(ids).size,
    evidence_ids: [...new Set(ids)],
    ...extra,
  });
  const processItems = rules
    .filter((r) => r.dimension_key === "process")
    .map((r) =>
      countItem(
        r.key,
        r.name,
        events
          .filter(
            (e: any) =>
              array(r.allowed_source_types).includes(e.source_type) &&
              array(e.measurements).some(
                (m) =>
                  m.metric_key === r.key &&
                  array(r.rubric_ids).includes(m.rubric_id),
              ),
          )
          .map((e: any) => e.evidence_id),
      ),
    );
  const abilityItems = array(indicators)
    .filter((i) => array(i.portrait_views).includes("ability"))
    .map((i) =>
      countItem(i.indicator_id, i.name, i.evidence_ids, {
        indicator_id: i.indicator_id,
        state: i.state,
      }),
    );
  const literacyItems = competencies.map((name) => {
    const matched = array(links).filter((l) =>
      array(l.competencies).includes(name),
    );
    const ids = new Set(matched.flatMap((l) => array(l.kp_ids)));
    return countItem(
      name,
      name,
      knowledge
        .filter((k: any) => ids.has(k.node_id))
        .flatMap((k: any) => k.evidence_ids),
      { mapping_count: matched.length },
    );
  });
  const dimensions = [
    {
      key: "knowledge",
      unit: "%",
      measure: "任务得分率",
      note: "依据当前范围内有效知识任务得分计算，未作答学生不计为零分。",
      items: knowledge.map((n: any) => ({
        key: n.node_id,
        name: n.name,
        value: n.value,
        evidence_ids: n.evidence_ids,
        node_id: n.node_id,
      })),
    },
    {
      key: "ability",
      unit: "条",
      measure: "指标关联证据",
      note: "按学科框架展示显式关联证据数量，量规未审时不产生能力等级。",
      items: abilityItems,
    },
    {
      key: "literacy",
      unit: "条",
      measure: "课程关联证据",
      note: "课标主要表现与当前课程任务的对应记录，教学关系待审，不代表学生素养得分。",
      items: literacyItems,
    },
    {
      key: "process",
      unit: "条",
      measure: "过程观察记录",
      note: "只统计有对应观察规则的记录，不根据次数判断习惯、动机或协作能力。",
      items: processItems,
    },
  ].map((d) => ({
    ...d,
    evidence_count: new Set(d.items.flatMap((i: any) => i.evidence_ids)).size,
  }));
  const allowed = new Set(array(mappings).flatMap((m) => array(m.kp_ids)));
  const nodeIds = new Set([
    ...allowed,
    ...knowledge.map((k: any) => k.node_id),
  ]);
  const currentNodes = [...nodeIds].map((id) => {
    const node: any = graphNodes.get(id) || {};
    const k = knowledge.find((n: any) => n.node_id === id);
    const related = rules.filter((r) =>
      array(r.related_knowledge_ids).includes(id),
    );
    return {
      node_id: id,
      name:
        k?.name ||
        node.name ||
        array(mappings).find((m) => array(m.kp_ids).includes(id))?.cluster ||
        id,
      chapter: node.chapter || scope.label,
      level: node.level,
      mastery: k?.value ?? null,
      mastery_band: band(k?.value ?? null),
      sample_count: k?.events || 0,
      students: k?.students || 0,
      evidence_strength: k ? "unknown" : "low_sample",
      ability_keys: array(indicators)
        .filter((i) =>
          array(i.evidence_ids).some((e) => array(k?.evidence_ids).includes(e)),
        )
        .map((i) => i.indicator_id),
      literacy_keys: array(links)
        .filter((l) => array(l.kp_ids).includes(id))
        .flatMap((l) => array(l.competencies)),
      process_keys: related
        .filter((r) => r.dimension_key === "process")
        .map((r) => r.key),
      goal_ids: array(node.goal_ids),
      complete: true,
      explanations: [],
      explanation: k
        ? `当前范围 ${k.events} 条有效记录，覆盖 ${k.students} 名学生。读数为任务得分率，不是素养等级。`
        : "当前筛选范围没有有效任务记录，暂不判断掌握状态。",
      evidence: array(k?.evidence_ids)
        .slice(0, 3)
        .map((eid) => eventMap.get(eid))
        .filter(Boolean),
    };
  });
  const trendGroups = new Map<string, any[]>();
  for (const e of events) {
    const day = naturalDate(e.occurred_at);
    trendGroups.set(day, [...(trendGroups.get(day) || []), e]);
  }
  const names = new Map<string, string>(
    knowledge.map((k: any) => [k.node_id, k.name]),
  );
  const trend = [...trendGroups]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, records]) => {
      const rows = knowledgeSummary(records, names, new Set(names.keys()));
      const possible = rows.reduce((sum, r) => sum + r.possible, 0);
      return {
        window: date,
        value: possible
          ? Math.round(
              (100 * rows.reduce((sum, r) => sum + r.earned, 0)) / possible,
            )
          : null,
      };
    });
  return {
    subject_name: subject?.name || scope.subject_id,
    stage,
    dimensions,
    trend,
    graph: {
      nodes: currentNodes,
      edges: array(graph.edges).filter(
        (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
      ),
      filters: graph.filters,
    },
    cluster_rows: knowledge.map((k: any) => ({
      node_id: k.node_id,
      cluster: k.name,
      chapter: graphNodes.get(k.node_id)?.chapter || scope.label,
      n_students: k.students,
      band_counts: k.band_counts,
      p: k.value,
      weak_n: k.band_counts.待巩固,
      weak_pct: Math.round((100 * k.band_counts.待巩固) / k.students),
    })),
  };
}
