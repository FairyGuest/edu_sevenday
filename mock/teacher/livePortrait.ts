import { readTeacherFixture as read, memoizeMock } from "./fixtures";
import { scoped } from "./teachingSupport";
import {
  array,
  knowledgeSummary,
  naturalDate,
  sourceLabels,
} from "./supportDomain";

export default {};
const cached = memoizeMock<any>();
const names: Record<string, string> = {
  knowledge: "知识点",
  ability: "能力",
  literacy: "素养",
  process: "学习过程",
};
// Candidate instructional links only; these do not approve a rubric or transfer a score to a new framework.
const nodeStandards: Record<string, string[]> = {
  "kp-radical": ["std-shushi-8"],
  "kp-radical-addsub": ["std-shushi-8"],
  "kp-radical-muldvd": ["std-shushi-8"],
  "kp-function": ["std-func-concept"],
  "kp-function-image": ["std-func-2"],
  "kp-function-property": ["std-func-2"],
  "kp-function-application": ["std-func-4", "std-func-req"],
  "kp-pythagoras": ["std-geo-pythagoras"],
  "kp-pythagoras-inverse": ["std-geo-pythagoras"],
  "kp-parallelogram": ["std-geo-quad"],
  "kp-special-quad": ["std-geo-quad", "std-geo-special-quad"],
  "kp-data-central-tendency": ["std-stat-avg"],
  "kp-data-dispersion": ["std-stat-variance"],
  "kp-data": ["std-stat-avg"],
  "kp-data-central": ["std-stat-avg"],
  "kp-statistics": ["std-stat-avg"],
};
const observationNames: Record<string, string> = {
  memorize_understand: "数学概念理解",
  representation_transfer: "图式表征转换",
  operation_reasoning: "数学运算与说理",
  problem_analysis: "数学结构分析",
  transfer_apply: "数学情境迁移",
  reflect_express: "数学反思与表达",
  learning_attitude: "提交与自查",
  learning_interest: "数学学习兴趣",
  learning_motivation: "自主学习行为",
  effort_level: "订正投入",
  self_efficacy: "学习信心（自评）",
};
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
const valid = (m: any) =>
  Number.isFinite(m.earned) &&
  Number.isFinite(m.possible) &&
  m.possible > 0 &&
  m.earned >= 0 &&
  m.earned <= m.possible;
const rate = (rows: any[]) => {
  const total = rows.reduce((n, r) => n + r.possible, 0);
  return total
    ? Math.round((100 * rows.reduce((n, r) => n + r.earned, 0)) / total)
    : null;
};
const lite = (e: any) => ({
  evidence_id: e.evidence_id,
  student_id: e.student_id,
  source_type: e.source_type,
  source_name: e.source_name,
  occurred_at: e.occurred_at,
  question_stem: e.question_stem,
  answer_summary: e.answer_summary,
});

export function livePortrait(query: any) {
  const key = JSON.stringify([
    query.class_id,
    query.subject_id || "math",
    query.student_id || "",
    query.start_date || "",
    query.end_date || "",
    query.sources ?? null,
    query.textbook_id || "",
    query.curriculum_scope_type || "all",
    query.curriculum_scope_id || "",
  ]);
  return cached(key, () => build(query));
}

function build(query: any) {
  const ctx = scoped(query),
    { scope, meta, people, excluded, raw } = ctx;
  const events = ctx.events;
  const classEvents = scope.student_id
    ? scoped({ ...query, student_id: "" }).events
    : events;
  const rules = array(read("portrait-metric-rules.json").metrics);
  const standards = array(meta.standards).filter(
    (s) =>
      s.review_status !== "deprecated" &&
      s.subject_id === scope.subject_id &&
      array(s.applicable_grades).includes(scope.grade_id),
  );
  const refs = (ids: string[]) =>
    standards.filter((s) => ids.includes(s.standard_id));
  const chapterStandards: Record<string, string[]> = {
    "demo-ch-radical": ["std-shushi-8"],
    "demo-ch-function": [
      "std-func-concept",
      "std-func-1",
      "std-func-2",
      "std-func-4",
      "std-func-req",
    ],
    "demo-ch-pythagoras": ["std-geo-pythagoras"],
    "demo-ch-quad": ["std-geo-quad", "std-geo-special-quad"],
    "demo-ch-data": ["std-stat-avg", "std-stat-variance"],
  };
  const sectionStandards: Record<string, string[]> = {
    "demo-sec-radical-01": ["std-shushi-8"],
    "demo-sec-radical-02": ["std-shushi-8"],
    "demo-sec-radical-03": ["std-shushi-8"],
    "demo-sec-pythagoras-01": ["std-geo-pythagoras"],
    "demo-sec-pythagoras-02": ["std-geo-pythagoras"],
    "demo-sec-quad-01": ["std-geo-quad"],
    "demo-sec-quad-02": ["std-geo-quad", "std-geo-special-quad"],
    "demo-sec-function-01": ["std-func-concept"],
    "demo-sec-function-02": ["std-func-1", "std-func-2", "std-func-req"],
    "demo-sec-function-03": ["std-func-4", "std-func-req"],
    "demo-sec-data-01": ["std-stat-avg"],
    "demo-sec-data-02": ["std-stat-variance"],
  };
  const book = meta.textbooks.find(
    (b: any) => b.textbook_id === scope.textbook_id,
  );
  const courseIds = array(book?.chapters).flatMap((c) =>
    scope.curriculum_scope_type === "all" ||
    scope.chapter_ids.includes(c.chapter_id)
      ? chapterStandards[c.chapter_id] || []
      : array(c.sections)
          .filter((s) => scope.section_ids.includes(s.section_id))
          .flatMap((s) => sectionStandards[s.section_id] || []),
  );
  const unitIds = array(meta.units)
    .filter(
      (u) =>
        u.textbook_id === scope.textbook_id &&
        (scope.curriculum_scope_type === "all" ||
          (array(u.scope?.section_ids).length > 0 &&
            array(u.scope.section_ids).every((id) =>
              scope.section_ids.includes(id),
            ))),
    )
    .flatMap((u) => array(u.unit_goals).flatMap((g) => array(g.standard_ids)));
  const graphMeta = read(`knowledge-graph-filtered-${scope.class_id}.json`);
  const metadata = new Map<string, any>(
    array(graphMeta.nodes).map((n) => [n.node_id, n]),
  );
  const mappings = array(read("curriculum-links.json").rows).filter(
    (r) =>
      r.status === "mapped" &&
      r.textbook_id === scope.textbook_id &&
      (scope.curriculum_scope_type === "all" ||
        scope.section_ids.includes(r.section_id)),
  );
  const allowed = new Set<string>(mappings.flatMap((r) => array(r.kp_ids)));
  const nodeNames = new Map<string, string>(
    array(graphMeta.nodes).map((n) => [n.node_id, n.name]),
  );
  mappings.forEach((r) =>
    array(r.kp_ids).forEach((id) => {
      if (!nodeNames.has(id)) nodeNames.set(id, r.cluster);
    }),
  );
  const allowedNodes =
    scope.curriculum_scope_type === "all" ? undefined : allowed;
  const observationRate = (rows: any[], personal = !!scope.student_id) => {
    if (personal) return rate(rows);
    const students = new Map<string, { earned: number; possible: number }>();
    for (const r of rows) {
      const s = students.get(r.student_id) || { earned: 0, possible: 0 };
      s.earned += r.earned;
      s.possible += r.possible;
      students.set(r.student_id, s);
    }
    const values = [...students.values()]
      .filter((s) => s.possible > 0)
      .map((s) => (100 * s.earned) / s.possible);
    return values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : null;
  };
  const knowledgeRows = (records: any[]) =>
    records.flatMap((e) => {
      const seen = new Set<string>();
      return array(e.knowledge_results)
        .filter((k) => {
          if (
            !k.node_id ||
            seen.has(k.node_id) ||
            (allowedNodes && !allowedNodes.has(k.node_id))
          )
            return false;
          seen.add(k.node_id);
          return valid(k);
        })
        .map((k) => ({
          ...k,
          student_id: e.student_id,
          evidence_id: e.evidence_id,
        }));
    });
  const knowledgeObservations = knowledgeRows(events),
    classKnowledgeObservations = knowledgeRows(classEvents);
  const knowledge = knowledgeSummary(events, nodeNames, allowedNodes);
  const classKnowledge = scope.student_id
    ? knowledgeSummary(classEvents, nodeNames, allowedNodes)
    : knowledge;
  classKnowledge.forEach((k) => {
    k.value = observationRate(
      classKnowledgeObservations.filter((r) => r.node_id === k.node_id),
      false,
    )!;
  });
  const eventMap = new Map<string, any>(events.map((e) => [e.evidence_id, e]));
  const sumMetrics = (records: any[]) => {
    const result = new Map<string, any[]>(),
      seen = new Set<string>();
    for (const e of records)
      for (const m of array(e.measurements)) {
        const r = rules.find((r) => r.key === m.metric_key);
        const id =
          m.measurement_id || `${e.evidence_id}:${m.metric_key}:${m.rubric_id}`;
        if (
          !r ||
          seen.has(id) ||
          !valid(m) ||
          m.conflict ||
          m.review_status === "conflict" ||
          !array(r.allowed_source_types).includes(e.source_type) ||
          !array(r.rubric_ids).includes(m.rubric_id)
        )
          continue;
        seen.add(id);
        result.set(r.key, [
          ...(result.get(r.key) || []),
          { ...m, evidence_id: e.evidence_id, student_id: e.student_id },
        ]);
      }
    return result;
  };
  const metricRows = sumMetrics(events),
    classRows = scope.student_id ? sumMetrics(classEvents) : metricRows;
  const window = {
    start_date: scope.start_date || raw.coverage?.start_date,
    end_date: scope.end_date || raw.coverage?.end_date,
  };
  const toItem = (
    key: string,
    name: string,
    rows: any[],
    comparison: any[],
    related: string[],
    standardIds: string[],
  ) => {
    const ids = [...new Set<string>(rows.map((r) => r.evidence_id))];
    return {
      key,
      name,
      value: observationRate(rows),
      class_avg: observationRate(comparison, false),
      sample_count: ids.length,
      evidence_strength: ids.length < 3 ? "low_sample" : "sufficient",
      evidence_ids: ids,
      related_knowledge_ids: related,
      standards: refs(standardIds),
      mapping_status: refs(standardIds).length
        ? "in_review"
        : "awaiting_source",
      explanation: `${ids.length} 条有效记录；个人按量表得分/满分汇总，班级取有证据学生个人读数均值。合成数据演示观察，不是已审核能力等级。`,
    };
  };
  const measureItems = (
    dimension: string,
    rowsMap = metricRows,
    compareMap = classRows,
  ) =>
    rules
      .filter(
        (r) =>
          r.dimension_key === dimension &&
          array(r.allowed_source_types).length &&
          (scope.curriculum_scope_type === "all" ||
            rowsMap.has(r.key) ||
            array(r.related_knowledge_ids).some((id) => allowed.has(id))),
      )
      .map((r) => {
        const ids =
          dimension === "literacy" || dimension === "process"
            ? ["std-quality-3dim"]
            : array(r.related_knowledge_ids)
                .filter((id) => !allowedNodes || allowedNodes.has(id))
                .flatMap((id) => nodeStandards[id] || []);
        return {
          ...toItem(
            r.key,
            observationNames[r.key] || r.name,
            rowsMap.get(r.key) || [],
            compareMap.get(r.key) || [],
            array(r.related_knowledge_ids),
            ids,
          ),
          observation_basis: {
            definition: r.definition,
            sources: array(r.allowed_source_types).map((s) => sourceLabels[s]),
            rubric_ids: array(r.rubric_ids),
          },
        };
      });
  const knowledgeItems = knowledge.map((k) => ({
    key: k.node_id,
    name: k.name,
    value: k.value,
    class_avg:
      classKnowledge.find((c) => c.node_id === k.node_id)?.value ?? null,
    sample_count: k.events,
    evidence_strength: k.events < 3 ? "low_sample" : "sufficient",
    evidence_ids: k.evidence_ids,
    related_knowledge_ids: [k.node_id],
    standards: refs(nodeStandards[k.node_id] || []),
    explanation: `${k.events} 条知识任务记录；${scope.student_id ? `100×${k.earned}/${k.possible}` : "有证据学生个人任务得分率的均值"}，不含未作答学生。`,
  }));
  const buildDimensions = (ki: any[], mr: Map<string, any[]>, kr: any[]) =>
    Object.keys(names).map((key) => {
      const items = key === "knowledge" ? ki : measureItems(key, mr);
      const rows =
        key === "knowledge"
          ? knowledgeObservations
          : rules
              .filter((r) => r.dimension_key === key)
              .flatMap((r) => mr.get(r.key) || []);
      const ids = [...new Set(items.flatMap((i) => i.evidence_ids))];
      return {
        dimension_key: key,
        score: observationRate(rows),
        class_avg:
          key === "knowledge"
            ? observationRate(classKnowledgeObservations, false)
            : observationRate(
                rules
                  .filter((r) => r.dimension_key === key)
                  .flatMap((r) => classRows.get(r.key) || []),
                false,
              ),
        radar_items: items,
        sample_count: ids.length,
        evidence_strength: ids.length < 3 ? "low_sample" : "sufficient",
        reading_label:
          key === "literacy"
            ? "学业质量 · 学习经验观察"
            : "数学任务 · 演示观察",
        explanation:
          key === "literacy"
            ? "对齐学业质量第三方面的学习经验、兴趣与反思观察；不能替代九项核心素养的任务评价，量规仍待专家审核。"
            : "当前日期、章节和来源内的有效任务观察读数；课标对应与量规审核分开，缺失不计零分。",
        standards: [
          ...new Map(
            items.flatMap((i) => i.standards).map((s) => [s.standard_id, s]),
          ).values(),
        ],
      };
    });
  const dimensions = buildDimensions(knowledgeItems, metricRows, knowledge);
  const explanations = dimensions.flatMap((d) =>
    d.radar_items.map((i: any) => ({
      explanation_id: `${scope.student_id || "class"}:${i.key}`,
      target_type: "radar_item",
      target_id: i.key,
      conclusion: i.name,
      reason: i.explanation,
      evidence_summary: `共 ${i.sample_count} 条记录，以下为最近 4 条摘要。`,
      evidence: i.evidence_ids
        .map((id: string) => eventMap.get(id))
        .filter(Boolean)
        .sort((a: any, b: any) => b.occurred_at.localeCompare(a.occurred_at))
        .slice(0, 4)
        .map(lite),
    })),
  );
  const graphNodes = [
    ...new Set([...allowed, ...knowledge.map((k) => k.node_id)]),
  ].map((id) => {
    const n = metadata.get(id) || {},
      k = knowledge.find((k) => k.node_id === id);
    const strength = k && k.events >= 3 ? "sufficient" : "low_sample";
    return {
      ...n,
      node_id: id,
      name: nodeNames.get(id) || id,
      chapter: n.chapter || scope.label,
      mastery: k?.value ?? null,
      mastery_band: band(k?.value ?? null),
      evidence_strength: strength,
      sample_count: k?.events || 0,
      explanation: k
        ? `${k.events} 条有效知识任务记录，覆盖 ${k.students} 人。分档为演示口径。`
        : "当前范围未采集知识任务得分，不以其他章节或旧快照回填。",
    };
  });
  const nodeIds = new Set(graphNodes.map((n) => n.node_id));
  const graph = {
    ...graphMeta,
    nodes: graphNodes,
    edges: array(graphMeta.edges).filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
    ),
  };
  graphNodes.forEach((n) => {
    const i = knowledgeItems.find((i) => i.key === n.node_id);
    const original = explanations.find((e) => e.target_id === i?.key);
    if (original)
      explanations.push({
        ...original,
        explanation_id: `node:${n.node_id}`,
        target_type: "knowledge_node",
        target_id: n.node_id,
      });
  });
  const clusterRows = knowledge.map((k) => ({
    ...k,
    cluster: k.name,
    n_students: k.students,
    n_sample: k.events,
    weak_n: k.band_counts.待巩固,
    weak_pct: Math.round((100 * k.band_counts.待巩固) / k.students),
    p: k.value,
    chapter: metadata.get(k.node_id)?.chapter || scope.label,
    level: metadata.get(k.node_id)?.level,
  }));
  const dates = [
    ...new Set(events.map((e) => naturalDate(e.occurred_at))),
  ].sort();
  const trend = dates.map((date) => ({
    window: date,
    value: observationRate(
      knowledgeObservations.filter(
        (r) => naturalDate(eventMap.get(r.evidence_id)?.occurred_at) === date,
      ),
    ),
  }));
  const sources = Object.entries(sourceLabels).map(([key, source]) => ({
    source,
    source_type: key,
    n: events.filter((e) => e.source_type === key).length,
  }));
  const studentRows = people.map((p) => {
    const records = classEvents.filter((e) => e.student_id === p.student_id),
      k = knowledgeSummary(records, nodeNames, allowedNodes);
    const weak_cnt = k.filter((n) => n.value < 50).length;
    return {
      ...p,
      weak_cnt,
      n_events: records.length,
      due_cnt: null,
      status_level: !records.length ? "cold" : weak_cnt ? "weak" : "ok",
      status: !records.length
        ? "当前范围暂无记录"
        : `${weak_cnt} 个知识点待巩固`,
    };
  });
  const evidence = events
    .slice()
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    .map((e) => ({
      ...lite(e),
      date: naturalDate(e.occurred_at),
      qid: e.evidence_id,
      source: sourceLabels[e.source_type],
      stem: e.question_stem || e.source_name,
      correct: null,
    }));
  const pipelineFor = (records: any[]) => {
    const mm = sumMetrics(records),
      kk = knowledgeSummary(records, nodeNames, allowedNodes);
    const kr = knowledgeRows(records);
    kk.forEach((k) => {
      k.value = observationRate(kr.filter((r) => r.node_id === k.node_id))!;
    });
    const metric = rules
      .filter((r) => mm.has(r.key))
      .map((r) => ({
        key: r.key,
        name: observationNames[r.key] || r.name,
        dimension: r.dimension_key,
        value: observationRate(mm.get(r.key)!),
        earned: mm.get(r.key)!.reduce((n, m) => n + m.earned, 0),
        possible: mm.get(r.key)!.reduce((n, m) => n + m.possible, 0),
        n_events: new Set(mm.get(r.key)!.map((m) => m.evidence_id)).size,
        formula: scope.student_id
          ? "100×有效量表得分/满分（演示观察）"
          : "有证据学生个人读数的均值（演示观察）",
      }));
    const dims = Object.keys(names).map((key) => ({
      key,
      name: names[key],
      value: observationRate(
        key === "knowledge"
          ? knowledgeRows(records)
          : rules
              .filter((r) => r.dimension_key === key)
              .flatMap((r) => mm.get(r.key) || []),
      ),
      n_metrics:
        key === "knowledge"
          ? kk.length
          : metric.filter((m) => m.dimension === key).length,
    }));
    return {
      l1_evidence: {
        window,
        total_events: records.length,
        total_students: new Set(records.map((e) => e.student_id)).size,
        sources: Object.entries(sourceLabels).map(([key, name]) => {
          const es = records.filter((e) => e.source_type === key);
          return {
            source: key,
            source_name: name,
            events: es.length,
            students: new Set(es.map((e) => e.student_id)).size,
            share: records.length
              ? Math.round((100 * es.length) / records.length)
              : 0,
          };
        }),
        sample: Object.keys(sourceLabels)
          .flatMap((key) =>
            records.filter((e) => e.source_type === key).slice(-2),
          )
          .map((e) => ({
            date: naturalDate(e.occurred_at),
            source_type: e.source_type,
            source_name: sourceLabels[e.source_type],
            activity_name: e.source_name,
            stem: e.question_stem || "",
            answer: e.answer_summary || "",
          })),
      },
      l2_observation: {
        metrics: metric,
        knowledge: kk.map((k) => ({
          ...k,
          node: k.node_id,
          n_events: k.events,
        })),
      },
      l3_dimension: {
        dimensions: dims,
        formula:
          "个人按有效量表汇总，班级取有证据学生个人读数均值；知识读数只采用知识任务得分",
      },
      l4_profile: {
        dimensions: dims.map((d) => ({
          ...d,
          snapshot_value: null,
          gap: null,
        })),
        note: "已按当前日期、章节、来源重算；不使用旧快照或将观察读数解释为正式素养等级。",
      },
    };
  };
  const pipeline = {
    ...pipelineFor(events),
    statistic_mode: "observations",
    caliber:
      "演示观察：按范围筛选、去重、核验来源与量表后计算，不构成经过专家验证的能力测量。",
    source_breakdown: Object.fromEntries(
      Object.entries(sourceLabels).map(([key, name]) => [
        name,
        pipelineFor(events.filter((e) => e.source_type === key)),
      ]),
    ),
    source_descriptions: Object.fromEntries(
      Object.values(sourceLabels).map((name) => [
        name,
        {
          raw: "活动名称、发生日期、任务作答与量表观测",
          transform:
            "筛选当前章/节与日期，去重记录并核验观测来源、量表和有效分母",
          metrics: "有效记录数、知识任务得分率及已有量表观察读数",
          dimensions: ["按实际关联指标汇总 · 待审核"],
        },
      ]),
    ),
  };
  const snapshot = {
    scope: scope.student_id ? "student" : "class",
    class_id: scope.class_id,
    student_id: scope.student_id,
    statistic_mode: "observations",
    curriculum_scope_type: scope.curriculum_scope_type,
    curriculum_scope_id: scope.curriculum_scope_id,
    request_start: scope.start_date,
    request_end: scope.end_date,
    snapshot_id: JSON.stringify(scope),
    time_window: window,
    sources: scope.sources.map((s) => sourceLabels[s]),
    dimensions,
  };
  const top = [...clusterRows].sort((a, b) => b.weak_pct - a.weak_pct)[0];
  const overview = {
    class_id: scope.class_id,
    class_name: meta.classes.find((c: any) => c.class_id === scope.class_id)
      ?.class_name,
    grade: scope.grade_id,
    n_students: people.length,
    students: studentRows,
    trend,
    source_mix: sources,
    weak_ranking: clusterRows
      .filter((r) => r.weak_n > 0)
      .sort((a, b) => b.weak_n - a.weak_n),
    cluster_rows: clusterRows,
    updated_at: raw.coverage?.end_date,
    window_note: `${scope.label} · ${window.start_date} 至 ${window.end_date} · ${events.length} 条有效记录（合成演示）`,
    cards: {
      recent5_avg: observationRate(knowledgeObservations),
      avg_label: "当前范围任务得分率",
      weak_top: top ? `「${top.cluster}」待巩固占比` : "暂无知识任务记录",
      weak_top_pct: top?.weak_pct ?? null,
      support_label: "待巩固知识点",
      support_suggestions: clusterRows.filter((r) => r.weak_n > 0).length,
      mastered_all_count: knowledge.filter(
        (k) =>
          k.students === (scope.student_id ? 1 : people.length) &&
          k.band_counts.已掌握 === k.students,
      ).length,
    },
    kgraph: {
      nodes: graphNodes.map((n) => ({
        id: n.name,
        chapter: n.chapter,
        level: n.level,
        p: n.mastery,
        n: n.sample_count,
        nodata: n.mastery === null,
        weak: n.mastery !== null && n.mastery < 50,
        fill:
          n.mastery === null
            ? "#9da4ae"
            : n.mastery < 50
              ? "#d95762"
              : "#6294c8",
      })),
      edges: graph.edges.map((e: any) => ({
        src: nodeNames.get(e.source),
        tgt: nodeNames.get(e.target),
        kind: e.relation_type,
      })),
    },
    dimensions: { literacy: [] },
  };
  const student = people.find((p) => p.student_id === scope.student_id);
  return {
    scope: snapshot.scope,
    effective_scope: scope,
    snapshot,
    graph,
    explanations,
    pipeline,
    overview,
    excluded_counts: excluded,
    available_student_ids: [...new Set(classEvents.map((e) => e.student_id))],
    evidence,
    curriculum_alignment: {
      standards: refs([
        ...new Set([
          ...courseIds,
          ...unitIds,
          ...[...allowed].flatMap((id) => nodeStandards[id] || []),
        ]),
        "std-quality-3dim",
        "std-core-competencies",
      ]),
      subject_reference: meta.subject_references.find(
        (s: any) => s.subject_id === scope.subject_id,
      ),
      content_links: meta.content_links.filter((link: any) =>
        array(link.kp_ids).some((id) => allowed.has(id)),
      ),
      framework: meta.frameworks.find(
        (f: any) =>
          f.subject_id === scope.subject_id &&
          array(f.grade_scope).includes(scope.grade_id),
      ),
    },
    student_detail: student
      ? {
          ...student,
          n_events: events.length,
          weak_cnt: knowledge.filter((k) => k.value < 50).length,
          due_cnt: null,
          cells: knowledge.map((k) => ({
            cluster: k.name,
            p: k.value,
            n: k.events,
            band: band(k.value),
          })),
          levels: [],
          dimensions: { literacy: [] },
          evidence,
        }
      : null,
    coverage_note: !events.length
      ? "当前筛选范围暂无有效观测，不沿用其他范围的分数。"
      : "",
  };
}
