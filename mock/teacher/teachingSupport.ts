import { readTeacherFixture } from "./fixtures";
import { supportPortrait } from "./supportPortrait";
import {
  array,
  fail,
  sourceLabels,
  resolveScope,
  selectEvents,
  knowledgeSummary,
  indicatorSummary,
  naturalDate,
} from "./supportDomain";
import {
  subjectReferences,
  mathContentLinks,
  referenceVersion,
} from "./curriculumReference";

function read(name: string): any {
  try {
    return readTeacherFixture(`${name}.json`) || {};
  } catch {
    return {};
  }
}
function classes() {
  return array(read("classes").classes);
}
function students(classId: string) {
  if (!classes().some((c) => c.class_id === classId))
    fail("班级不存在或不可查看", 404);
  return array(read(`class-students-${classId}`)).map((s) => ({
    student_id: s.student_id,
    name: s.name,
    display_id: s.display_id,
  }));
}
function catalog(classId?: string) {
  const data = read("curriculum-catalog"),
    frameworks = read("subject-frameworks");
  return {
    ...data,
    textbooks: array(data.textbooks),
    classes: classes(),
    students: classId ? students(classId) : [],
    units: array(read("teaching-units").units),
    frameworks: array(frameworks.frameworks),
    standards: array(read("curriculum-standards").standards),
    rubrics: array(read("assessment-rubrics").rubrics),
    reference_version: referenceVersion,
    subject_references: subjectReferences,
    content_links: mathContentLinks,
    dataset_version: data.data_version || "unavailable",
    framework_version: frameworks.data_version || "unavailable",
  };
}
export function scoped(query: any) {
  const people = students(query.class_id),
    meta = catalog();
  const scope = resolveScope(query, meta, meta.units, meta.classes, people);
  const raw = read(`portrait-observations-${scope.class_id}`);
  const { events, excluded } = selectEvents(
    array(raw.events),
    scope,
    new Set(people.map((s) => s.student_id)),
  );
  return { people, meta, scope, events, excluded, raw };
}
export function profile(query: any) {
  const { people, meta, scope, events, excluded, raw } = scoped(query);
  const mappings = array(read("curriculum-links").rows).filter(
    (r) =>
      r.status === "mapped" &&
      r.textbook_id === scope.textbook_id &&
      r.subject_id === scope.subject_id &&
      (scope.curriculum_scope_type === "all" ||
        scope.section_ids.includes(r.section_id)),
  );
  const nodes = new Set<string>(mappings.flatMap((r) => array(r.kp_ids)));
  const graph = read(`knowledge-graph-filtered-${scope.class_id}`);
  const names = new Map<string, string>(
    array(graph.nodes).map((n) => [n.node_id, n.name]),
  );
  mappings.forEach((r) =>
    array(r.kp_ids).forEach((id) => {
      if (!names.has(id)) names.set(id, r.cluster);
    }),
  );
  const knowledge = knowledgeSummary(
    events,
    names,
    scope.curriculum_scope_type === "all" ? undefined : nodes,
  );
  const links = mathContentLinks.filter((l) =>
    l.kp_ids.some((id) => nodes.has(id)),
  );
  const framework = meta.frameworks.find(
    (f) =>
      f.subject_id === scope.subject_id &&
      array(f.grade_scope).includes(scope.grade_id),
  );
  const indicators = array(framework?.indicators).map((i) =>
    indicatorSummary(i, framework, events, meta.rubrics),
  );
  const contextData = read("learner-contexts");
  const contexts = array(contextData.students)
    .filter(
      (s) =>
        s.class_id === scope.class_id &&
        (!scope.student_id || s.student_id === scope.student_id),
    )
    .flatMap((s) =>
      array(s.contexts).map((c) => ({
        ...c,
        student_id: s.student_id,
        name: s.name,
        content: c.source === "unknown" ? "尚未采集" : c.content,
      })),
    );
  return {
    effective_scope: scope,
    dataset_version: meta.dataset_version,
    framework_version: meta.framework_version,
    reference_version: referenceVersion,
    data_state: !raw.events
      ? "not_collected"
      : !events.length
        ? "empty"
        : "available",
    is_demo: true,
    coverage: {
      students: new Set(events.map((e) => e.student_id)).size,
      total_students: scope.student_id ? 1 : people.length,
      events: events.length,
      unclassified: events.filter(
        (e) =>
          !e.textbook_id || (!array(e.section_ids).length && !e.chapter_id),
      ).length,
    },
    excluded_counts: excluded,
    sources: Object.entries(sourceLabels).map(([key, name]) => ({
      key,
      name,
      count: events.filter((e) => e.source_type === key).length,
    })),
    measurement_count: new Set(
      events.flatMap((e) =>
        array(e.measurements).map(
          (m) =>
            m.measurement_id ||
            `${e.evidence_id}:${m.metric_key}:${m.rubric_id}`,
        ),
      ),
    ).size,
    unmapped_measurement_count: events
      .flatMap((e) => array(e.measurements))
      .filter(
        (m) =>
          !array(framework?.indicators).some(
            (i) =>
              m.indicator_id === i.indicator_id ||
              array(i.rubric_ids).includes(m.rubric_id),
          ),
      ).length,
    knowledge,
    graph_edges: array(graph.edges).filter(
      (e) =>
        knowledge.some((n) => n.node_id === e.source) &&
        knowledge.some((n) => n.node_id === e.target),
    ),
    content_links: links,
    framework: framework || null,
    indicators,
    portrait: supportPortrait({
      scope,
      events,
      knowledge,
      graph,
      mappings,
      links,
      framework,
      indicators,
      references: meta.subject_references,
      metrics: read("portrait-metric-rules").metrics,
    }),
    learner_contexts: contexts,
    context_coverage: new Set(contexts.map((c) => c.student_id)).size,
    class_contexts: scope.student_id
      ? []
      : array(contextData.class_summaries)
          .filter((c) => c.class_id === scope.class_id)
          .flatMap((c) => array(c.aspects)),
    group_tasks: array(contextData.group_tasks).filter((g) =>
      array(g.actor_ids).some((id) =>
        scope.student_id
          ? id === scope.student_id
          : people.some((p) => p.student_id === id),
      ),
    ),
  };
}
function evidence(query: any) {
  const { events, scope, people } = scoped(query);
  const records = events
    .filter(
      (e) =>
        (!query.node_id ||
          array(e.knowledge_results).some(
            (k) => k.node_id === query.node_id,
          )) &&
        (!query.ids || String(query.ids).split(",").includes(e.evidence_id)),
    )
    .sort((a, b) => String(b.occurred_at).localeCompare(String(a.occurred_at)));
  const page = Math.max(1, Math.floor(Number(query.page) || 1)),
    size = 8;
  return {
    effective_scope: scope,
    total: records.length,
    page,
    page_size: size,
    items: records.slice((page - 1) * size, page * size).map((e) => ({
      ...e,
      student_name: people.find((s) => s.student_id === e.student_id)?.name,
    })),
  };
}

let memory: Record<string, any> = {};
function storageKey() {
  const fixture = read("diagnostic-cases"),
    serialized = JSON.stringify(fixture.cases || []);
  let hash = 2166136261;
  for (let i = 0; i < serialized.length; i++)
    hash = Math.imul(hash ^ serialized.charCodeAt(i), 16777619);
  return `teaching-support:demo:${fixture.data_version || "v1"}:${hash >>> 0}:t-001`;
}
function state(): Record<string, any> {
  if (typeof localStorage === "undefined") return memory;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey()) || "{}");
    return saved && !Array.isArray(saved) && typeof saved === "object"
      ? saved
      : {};
  } catch {
    return {};
  }
}
function save(store: any) {
  if (typeof localStorage !== "undefined")
    localStorage.setItem(storageKey(), JSON.stringify(store));
  memory = store;
}
function cases() {
  const store = state(),
    attempts = array(read("diagnostic-attempts").attempts);
  return array(read("diagnostic-cases").cases).map((c) => {
    const a = attempts.find(
      (a) =>
        array(c.attempt_ids).includes(a.attempt_id) &&
        a.student_id === c.student_id,
    );
    const saved = store[c.case_id];
    return {
      ...c,
      status: c.status === "needs_evidence" ? "insufficient" : c.status,
      class_id: a?.class_id || c.class_id,
      homework_id: a?.homework_id || c.homework_id,
      ...(saved?.review
        ? {
            status: saved.review.status,
            confirmed_cause_ids: saved.review.confirmed_cause_ids,
            review: saved.review,
          }
        : {}),
      review_history: array(saved?.review_history),
      teacher_followups: array(saved?.followups).filter(
        (f) =>
          f.review_revision ===
          (saved?.review?.revision || c.review?.revision || 0),
      ),
      historical_teacher_followups: array(saved?.followups).filter(
        (f) =>
          f.review_revision !==
          (saved?.review?.revision || c.review?.revision || 0),
      ),
    };
  });
}
function diagnosticList(query: any) {
  const people = query.class_id
    ? students(query.class_id)
    : classes().flatMap((c) => students(c.class_id));
  if (
    query.student_id &&
    !people.some((p) => p.student_id === query.student_id)
  )
    fail("学生不属于当前班级", 403);
  const questions = array(read("diagnostic-attempts").questions);
  const rows = cases()
    .filter(
      (c) =>
        (!query.class_id || c.class_id === query.class_id) &&
        (!query.student_id || c.student_id === query.student_id) &&
        (!query.homework_id || c.homework_id === query.homework_id) &&
        (!query.status || c.status === query.status),
    )
    .map((c) => ({
      case_id: c.case_id,
      class_id: c.class_id,
      homework_id: c.homework_id,
      student_id: c.student_id,
      student_name:
        people.find((p) => p.student_id === c.student_id)?.name || c.student_id,
      status: c.status,
      question_id: c.question_id,
      stem:
        questions.find((q) => q.question_id === c.question_id)?.stem ||
        "题目待补充",
      cause_count: array(c.candidate_causes).length,
    }));
  return {
    items: rows,
    total: rows.length,
    is_demo: true,
    dataset_version: read("diagnostic-cases").data_version || "unavailable",
    students: people,
    classes: classes(),
  };
}
function diagnosticDetail(query: any) {
  const c = cases().find((c) => c.case_id === query.case_id);
  if (!c) fail("错因案例不存在", 404);
  if (query.class_id && query.class_id !== c.class_id)
    fail("案例不属于当前班级", 403);
  const people = students(c.class_id);
  if (!people.some((p) => p.student_id === c.student_id))
    fail("案例学生不存在", 404);
  const data = read("diagnostic-attempts");
  const attempts = array(data.attempts).filter(
    (a) => a.student_id === c.student_id && a.class_id === c.class_id,
  );
  const packs = array(read("diagnostic-interventions").packs).filter(
    (p) =>
      array(p.linked_case_ids).includes(c.case_id) &&
      p.student_id === c.student_id,
  );
  const confirmed = c.status === "confirmed";
  const matched = packs.filter(
    (p) =>
      confirmed &&
      array(p.cause_ids).some((id) =>
        array(c.confirmed_cause_ids).includes(id),
      ),
  );
  const followups = array(read("diagnostic-followups").followups).filter(
    (f) => f.case_id === c.case_id,
  );
  const currentFollowups = followups.filter((f) =>
    matched.some((p) => p.intervention_id === f.intervention_id),
  );
  const ids = new Set([
    c.question_id,
    ...packs.flatMap((p) => [
      p.discrimination_question_id,
      p.transfer_question_id,
    ]),
  ]);
  return {
    ...c,
    student_name: people.find((p) => p.student_id === c.student_id)?.name,
    is_demo: true,
    attempts: attempts.filter(
      (a) =>
        array(c.attempt_ids).includes(a.attempt_id) ||
        followups.some((f) =>
          array(f.followup_attempt_ids).includes(a.attempt_id),
        ),
    ),
    questions: array(data.questions).filter(
      (q) =>
        ids.has(q.question_id) ||
        attempts.some(
          (a) =>
            a.question_id === q.question_id &&
            array(c.attempt_ids).includes(a.attempt_id),
        ),
    ),
    interventions: matched,
    historical_interventions: packs.filter((p) => !matched.includes(p)),
    followups: currentFollowups,
    historical_followups: followups.filter(
      (f) => !currentFollowups.includes(f),
    ),
    next_action: !confirmed
      ? "collect_evidence"
      : array(c.teacher_followups).at(-1)?.next_action ||
        currentFollowups.at(-1)?.next_action ||
        "collect_evidence",
  };
}
function review(body: any) {
  const c = diagnosticDetail(body),
    store = state();
  if (
    !Number.isInteger(body.expected_revision) ||
    body.expected_revision !== (c.review?.revision || 0)
  )
    fail("记录已更新，请刷新案例后重试", 409);
  if (
    !["confirmed", "rejected", "insufficient"].includes(body.status) ||
    !String(body.reason || "").trim()
  )
    fail("请填写复核结论与依据");
  const ids = [...new Set<string>(array(body.confirmed_cause_ids))];
  if (
    body.status === "confirmed" &&
    (!ids.length ||
      ids.some(
        (id) => !array(c.candidate_causes).some((h) => h.cause_id === id),
      ))
  )
    fail("请选择本案例的有效候选错因");
  const record = {
    status: body.status,
    confirmed_cause_ids: body.status === "confirmed" ? ids : [],
    review_reason: String(body.reason).trim().slice(0, 2000),
    reviewer_id: "t-001",
    reviewed_at: new Date().toISOString(),
    revision: (c.review?.revision || 0) + 1,
  };
  const prev = store[c.case_id] || {};
  store[c.case_id] = {
    ...prev,
    review: record,
    review_history: [
      ...array(prev.review_history),
      ...(prev.review ? [] : c.review ? [c.review] : []),
      record,
    ],
  };
  save(store);
  return record;
}
function followup(body: any) {
  const c = diagnosticDetail(body),
    store = state();
  if (c.status !== "confirmed") fail("请先确认错因，证据不足时不记录改善结论");
  if (body.expected_revision !== (c.review?.revision || 0))
    fail("复核结论已变化，请刷新后重试", 409);
  if (
    !["stop", "collect_evidence", "adjust_support"].includes(
      body.next_action,
    ) ||
    !String(body.observed_change || "").trim()
  )
    fail("请补充复测观察及后续行动");
  const ids = [...new Set<string>(array(body.evidence_ids))];
  if (ids.some((id) => !c.attempts.some((a: any) => a.attempt_id === id)))
    fail("复测证据不属于当前学生或案例");
  if (
    body.next_action === "stop" &&
    (!ids.length || !String(body.stop_reason || "").trim())
  )
    fail("停止干预需要证据与达标依据");
  const prev = store[c.case_id] || {};
  const record = {
    evidence_ids: ids,
    observed_change: String(body.observed_change).trim().slice(0, 2000),
    next_action: body.next_action,
    stop_reason: String(body.stop_reason || "").slice(0, 1000),
    recorded_at: new Date().toISOString(),
    request_id: body.request_id,
    review_revision: c.review?.revision || 0,
  };
  const existing = array(prev.followups).find(
    (f) => f.request_id && f.request_id === body.request_id,
  );
  if (existing) return existing;
  store[c.case_id] = { ...prev, followups: [...array(prev.followups), record] };
  save(store);
  return record;
}
function respond(res: any, fn: () => any) {
  try {
    res.json({ code: 200, data: fn() });
  } catch (e: any) {
    res.json({
      code: e.code || 500,
      msg: e.code ? e.message : "数据处理或保存失败，请重试",
    });
  }
}
export default {
  "GET /api/teacher/support/catalog": (req: any, res: any) =>
    respond(res, () => catalog(req.query.class_id)),
  "GET /api/teacher/support/profile": (req: any, res: any) =>
    respond(res, () => profile(req.query)),
  "GET /api/teacher/support/evidence": (req: any, res: any) =>
    respond(res, () => evidence(req.query)),
  "GET /api/teacher/support/diagnostics": (req: any, res: any) =>
    respond(res, () => diagnosticList(req.query)),
  "GET /api/teacher/support/diagnostic": (req: any, res: any) =>
    respond(res, () => diagnosticDetail(req.query)),
  "POST /api/teacher/support/review": (req: any, res: any) =>
    respond(res, () => review(req.body || {})),
  "POST /api/teacher/support/followup": (req: any, res: any) =>
    respond(res, () => followup(req.body || {})),
  "GET /api/teacher/support/design": (_req: any, res: any) =>
    respond(res, () => ({
      ...catalog(),
      lessons: array(read("design-workflows").lessons),
      unlinked_lessons: array(read("teaching-units").unlinked_lessons),
    })),
  "GET /api/teacher/support/research-tools": (_req: any, res: any) =>
    respond(res, () => ({
      ...read("research-tools"),
      rubrics: array(read("assessment-rubrics").rubrics),
    })),
};
