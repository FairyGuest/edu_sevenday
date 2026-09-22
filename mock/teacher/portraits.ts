import { readTeacherFixture } from "./fixtures";
import { livePortrait } from "./livePortrait";

const readOptional = (name: string) => {
  try {
    return readTeacherFixture(name);
  } catch {
    return null;
  }
};

const SOURCE_ZH: Record<string, string> = {
  homework: "作业记录",
  exam: "考试记录",
  practice: "自主练习",
  ai_tutor: "人机交互",
  classroom: "课堂互动",
};
const DIM_ZH: Record<string, string> = {
  knowledge: "知识点",
  ability: "能力",
  literacy: "素养",
  process: "学习过程",
};

/**
 * 正向链路聚合（L1 证据 → L2 观测 → L3 维度 → L4 画像）：
 * 从原子观测层（portrait-observations-*.json）真实汇总，口径与 metric-rules 一致：
 * 读数 = 100×Σearned/Σpossible；样本量 = 去重事件数（与题次/量表分母区分）。
 */
function pipeline(
  classId: string,
  studentId?: string,
  sourceType?: string,
): any {
  const obs = readOptional(`portrait-observations-${classId}.json`);
  if (!obs) return null;
  const rules = readOptional("portrait-metric-rules.json");
  const metricMeta = new Map<string, any>(
    (rules?.metrics || []).map((m: any) => [m.key, m]),
  );
  const events = (obs.events || []).filter(
    (e: any) =>
      e.valid !== false &&
      (!studentId || e.student_id === studentId) &&
      (!sourceType || e.source_type === sourceType),
  );

  // L1 证据层：按来源统计
  const bySource = new Map<
    string,
    { events: number; students: Set<string>; earned: number; possible: number }
  >();
  for (const e of events) {
    const s = bySource.get(e.source_type) || {
      events: 0,
      students: new Set<string>(),
      earned: 0,
      possible: 0,
    };
    s.events++;
    s.students.add(e.student_id);
    for (const m of e.measurements || []) {
      s.earned += m.earned || 0;
      s.possible += m.possible || 0;
    }
    bySource.set(e.source_type, s);
  }
  const l1 = {
    window: obs.coverage || {},
    total_events: events.length,
    total_students: new Set(events.map((e: any) => e.student_id)).size,
    sources: [...bySource.entries()]
      .map(([k, v]) => ({
        source: k,
        source_name: SOURCE_ZH[k] || k,
        events: v.events,
        students: v.students.size,
        share: events.length ? Math.round((v.events / events.length) * 100) : 0,
      }))
      .sort((a, b) => b.events - a.events),
    sample: Object.keys(SOURCE_ZH)
      .flatMap((source) =>
        events.filter((e: any) => e.source_type === source).slice(-2),
      )
      .reverse()
      .map((e: any) => ({
        date: String(e.occurred_at || "").slice(0, 10),
        source_type: e.source_type,
        source_name: SOURCE_ZH[e.source_type] || e.source_type,
        activity_name: e.source_name || "",
        stem: e.question_stem || "",
        answer: e.answer_summary || "",
      })),
  };

  // L2 观测层：指标级（measurement）+ 知识点级（knowledge_results）
  const metricAgg = new Map<
    string,
    { earned: number; possible: number; events: Set<string> }
  >();
  for (const e of events)
    for (const m of e.measurements || []) {
      const a = metricAgg.get(m.metric_key) || {
        earned: 0,
        possible: 0,
        events: new Set<string>(),
      };
      a.earned += m.earned || 0;
      a.possible += m.possible || 0;
      a.events.add(e.evidence_id);
      metricAgg.set(m.metric_key, a);
    }
  const nodeAgg = new Map<
    string,
    { earned: number; possible: number; events: Set<string> }
  >();
  for (const e of events)
    for (const k of e.knowledge_results || []) {
      const a = nodeAgg.get(k.node_id) || {
        earned: 0,
        possible: 0,
        events: new Set<string>(),
      };
      a.earned += k.earned || 0;
      a.possible += k.possible || 0;
      a.events.add(e.evidence_id);
      nodeAgg.set(k.node_id, a);
    }
  const graph = readOptional(`knowledge-graph-filtered-${classId}.json`);
  const nodeName = new Map<string, string>(
    (graph?.nodes || []).map((n: any) => [n.node_id, n.name]),
  );
  const l2 = {
    metrics: [...metricAgg.entries()]
      .map(([key, v]) => {
        const meta = metricMeta.get(key);
        return {
          key,
          name: meta?.name || key,
          dimension: meta?.dimension_key || "knowledge",
          value: v.possible ? Math.round((v.earned / v.possible) * 100) : null,
          earned: v.earned,
          possible: v.possible,
          n_events: v.events.size,
          formula: "100×Σ得分/Σ满分（量表分母）",
        };
      })
      .sort((a, b) => (a.value ?? 999) - (b.value ?? 999)),
    knowledge: [...nodeAgg.entries()]
      .map(([node, v]) => ({
        node,
        name: nodeName.get(node) || node,
        value: v.possible ? Math.round((v.earned / v.possible) * 100) : null,
        earned: v.earned,
        possible: v.possible,
        n_events: v.events.size,
      }))
      .sort((a, b) => (a.value ?? 999) - (b.value ?? 999))
      .slice(0, 8),
  };

  // L3 维度层：指标按 dimension_key 归并（同一公式上卷）
  const dimAgg = new Map<
    string,
    { earned: number; possible: number; metrics: number }
  >();
  for (const m of l2.metrics) {
    const d = dimAgg.get(m.dimension) || { earned: 0, possible: 0, metrics: 0 };
    d.earned += m.earned;
    d.possible += m.possible;
    d.metrics++;
    dimAgg.set(m.dimension, d);
  }
  const l3 = {
    formula: "维度值 = 100×Σ(该维度全部指标得分)/Σ(量表分母)",
    dimensions: [...dimAgg.entries()].map(([key, v]) => ({
      key,
      name: DIM_ZH[key] || key,
      n_metrics: v.metrics,
      value: v.possible ? Math.round((v.earned / v.possible) * 100) : null,
    })),
  };

  // L4 画像层：四维读数 + 与快照文件交叉核对
  const snapshot = readOptional(`profile-dimensions-class-${classId}.json`);
  const snapDims = new Map(
    (sourceType ? [] : snapshot?.dimensions || []).map((d: any) => [
      d.key,
      d.value,
    ]),
  );
  const l4 = {
    dimensions: l3.dimensions.map((d) => ({
      key: d.key,
      name: d.name,
      value: d.value,
      snapshot_value: snapDims.get(d.key) ?? null,
      gap:
        d.value != null && snapDims.get(d.key) != null
          ? d.value - snapDims.get(d.key)
          : null,
    })),
    note: "演示口径：观测层为抽样事件，快照为整段窗口统计；两者差值 = 抽样偏差，展示为「快照核对」。",
  };

  return {
    caliber:
      "正向链路：证据 → 观测 → 维度 → 画像；每层保留计算口径，同参数可复算（TR-2）",
    l1_evidence: l1,
    l2_observation: l2,
    l3_dimension: l3,
    l4_profile: l4,
    ...(!sourceType
      ? {
          source_breakdown: Object.fromEntries(
            Object.keys(SOURCE_ZH).map((source) => [
              SOURCE_ZH[source],
              pipeline(classId, studentId, source),
            ]),
          ),
        }
      : {}),
  };
}

export default {
  "GET /api/teacher/portraits": (req: any, res: any) => {
    if (req.query.statistics === "observations") {
      try { return res.json({ code: 200, data: livePortrait(req.query) }); }
      catch (e: any) { return res.json({ code: e.code || 500, msg: e.code ? e.message : "画像统计暂不可用", data: null }); }
    }
    const classId = String(req.query.class_id || "");
    const studentId = String(req.query.student_id || "");
    const classes = readOptional("classes.json")?.classes || [];
    if (!classes.some((c: any) => c.class_id === classId)) {
      return res.json({ code: 404, msg: "班级不存在", data: null });
    }
    const classSnapshot = readOptional(
      `profile-dimensions-class-${classId}.json`,
    );
    const collection = readOptional(
      `profile-dimensions-student-${classId}.json`,
    );
    const student = collection?.students?.find(
      (s: any) => s.student_id === studentId,
    );
    const snapshot = studentId
      ? student
        ? {
            ...student,
            time_window: collection.time_window,
            sources: collection.sources,
            snapshot_id: collection.snapshot_id,
            latest_snapshot_at: classSnapshot?.latest_snapshot_at,
          }
        : null
      : classSnapshot;
    res.json({
      code: 200,
      data: {
        scope: studentId ? "student" : "class",
        available_student_ids: (collection?.students || []).map(
          (s: any) => s.student_id,
        ),
        snapshot,
        classSnapshot,
        graph: readOptional(`knowledge-graph-filtered-${classId}.json`),
        explanations: (
          readOptional(`profile-explanations-${classId}.json`)?.explanations ||
          []
        ).filter((e: any) =>
          studentId
            ? e.scope === "student" && e.student_id === studentId
            : e.scope === "class",
        ),
        coverage_note: studentId && !student ? "该学生尚无四维画像数据" : "",
        pipeline: pipeline(classId, studentId || undefined),
      },
    });
  },
};
