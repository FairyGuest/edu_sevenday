export const array = (value: any): any[] =>
  Array.isArray(value) ? value.filter((v) => v != null) : [];
export default {};
export const sourceLabels: Record<string, string> = {
  homework: "作业记录",
  exam: "考试记录",
  classroom: "课堂互动",
  ai_tutor: "人机交互",
  practice: "自主练习",
};
export function fail(message: string, code = 400): never {
  throw Object.assign(new Error(message), { code });
}
export function naturalDate(value: any): string {
  if (!value) return "";
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s))
    return Number.isFinite(Date.parse(s)) &&
      new Date(s).toISOString().slice(0, 10) === s
      ? s
      : "";
  const date = Date.parse(
    /[zZ]|[+-]\d{2}:?\d{2}$/.test(s) ? s : s.replace(" ", "T") + "+08:00",
  );
  return Number.isFinite(date)
    ? new Date(date + 8 * 3600000).toISOString().slice(0, 10)
    : "";
}
export function resolveScope(
  query: any,
  catalog: any,
  units: any[],
  classes: any[],
  students: any[],
) {
  const cls = classes.find((c) => c.class_id === query.class_id);
  if (!cls) fail("班级不存在或不可查看", 404);
  if (
    query.student_id &&
    !students.some((s) => s.student_id === query.student_id)
  )
    fail("学生不属于当前班级", 403);
  const subject = query.subject_id || "math";
  if (subject !== "math" && cls.subject === "数学")
    fail("当前班级没有该学科数据");
  const books = array(catalog.textbooks);
  const book = books.find(
    (t) => t.textbook_id === (query.textbook_id || books[0]?.textbook_id),
  );
  if (
    !book ||
    book.grade !== cls.grade ||
    (book.subject_id && book.subject_id !== subject)
  )
    fail("教材与当前学科或年级不匹配");
  const type = query.curriculum_scope_type || "all",
    id = query.curriculum_scope_id || "";
  if (
    !["all", "unit", "chapter", "section"].includes(type) ||
    (type === "all" ? !!id : !id)
  )
    fail("课程范围参数无效");
  const chapters = array(book.chapters);
  let sections: string[] = [],
    chapterIds: string[] = [],
    label = "全部章 / 节";
  if (type === "chapter") {
    const chapter = chapters.find((c) => c.chapter_id === id);
    if (!chapter) fail("该章不属于当前教材");
    sections = array(chapter.sections).map((s) => s.section_id);
    chapterIds = [id];
    label = chapter.no + " " + chapter.title;
  } else if (type === "section") {
    const section = chapters
      .flatMap((c) => array(c.sections))
      .find((s) => s.section_id === id);
    if (!section) fail("该节不属于当前教材");
    sections = [id];
    label = section.no + " " + section.title;
  } else if (type === "unit") {
    const unit = units.find(
      (u) => u.unit_id === id && u.textbook_id === book.textbook_id,
    );
    if (!unit) fail("该单元不属于当前教材");
    sections = [...new Set<string>(array(unit.scope?.section_ids))];
    label = unit.title;
    // Chapter-only evidence belongs to a unit only if it covers the whole chapter.
    chapterIds = chapters
      .filter(
        (c) =>
          array(c.sections).length &&
          array(c.sections).every((s) => sections.includes(s.section_id)),
      )
      .map((c) => c.chapter_id);
  }
  const sources =
    query.sources === undefined
      ? Object.keys(sourceLabels)
      : query.sources === "none"
        ? []
        : String(query.sources)
            .split(",")
            .filter(Boolean)
            .map(
              (s) =>
                Object.keys(sourceLabels).find((k) => sourceLabels[k] === s) ||
                s,
            );
  if (sources.some((s) => !sourceLabels[s])) fail("数据来源参数无效");
  const start = naturalDate(query.start_date),
    end = naturalDate(query.end_date);
  if (
    (query.start_date && !start) ||
    (query.end_date && !end) ||
    (start && end && start > end)
  )
    fail("时间范围无效");
  return {
    class_id: cls.class_id,
    student_id: query.student_id || null,
    subject_id: subject,
    grade_id: cls.grade,
    textbook_id: book.textbook_id,
    curriculum_scope_type: type,
    curriculum_scope_id: id,
    section_ids: sections,
    chapter_ids: chapterIds,
    label,
    start_date: start,
    end_date: end,
    sources: [...new Set(sources)].sort(),
  };
}
export function selectEvents(raw: any[], scope: any, studentIds: Set<string>) {
  const excluded: Record<string, number> = {
    duplicate: 0,
    invalid: 0,
    unclassified: 0,
    outside_scope: 0,
    chapter_only: 0,
  };
  const seen = new Set<string>();
  const events = raw.filter((e) => {
    if (
      e.class_id !== scope.class_id ||
      (scope.student_id && e.student_id !== scope.student_id)
    )
      return false;
    const date = naturalDate(e.occurred_at);
    if (
      !date ||
      (scope.start_date && date < scope.start_date) ||
      (scope.end_date && date > scope.end_date) ||
      !scope.sources.includes(e.source_type)
    )
      return false;
    if (e.valid === false || !e.evidence_id || !studentIds.has(e.student_id)) {
      excluded.invalid++;
      return false;
    }
    if (seen.has(e.evidence_id)) {
      excluded.duplicate++;
      return false;
    }
    seen.add(e.evidence_id);
    if (
      (e.subject_id && e.subject_id !== scope.subject_id) ||
      (e.textbook_id && e.textbook_id !== scope.textbook_id)
    ) {
      excluded.outside_scope++;
      return false;
    }
    const sections = array(e.section_ids);
    const classified = !!e.textbook_id && (!!sections.length || !!e.chapter_id);
    if (!classified) excluded.unclassified++;
    if (!sections.length && e.chapter_id) excluded.chapter_only++;
    if (
      scope.curriculum_scope_type !== "all" &&
      !(
        classified &&
        (sections.some((id) => scope.section_ids.includes(id)) ||
          (!sections.length && scope.chapter_ids.includes(e.chapter_id)))
      )
    ) {
      excluded.outside_scope++;
      return false;
    }
    return true;
  });
  return { events, excluded };
}
export function knowledgeSummary(
  events: any[],
  names: Map<string, string>,
  allowedNodes?: Set<string>,
) {
  const rows = new Map<string, any>();
  for (const e of events) {
    const seen = new Set<string>();
    for (const k of array(e.knowledge_results)) {
      if (
        !k.node_id ||
        seen.has(k.node_id) ||
        (allowedNodes && !allowedNodes.has(k.node_id))
      )
        continue;
      seen.add(k.node_id);
      if (
        !Number.isFinite(k.earned) ||
        !Number.isFinite(k.possible) ||
        k.possible <= 0 ||
        k.earned < 0 ||
        k.earned > k.possible
      )
        continue;
      const row = rows.get(k.node_id) || {
        node_id: k.node_id,
        name: names.get(k.node_id) || k.node_id,
        earned: 0,
        possible: 0,
        events: new Set(),
        students: new Set(),
        student_scores: new Map<string, { earned: number; possible: number }>(),
      };
      row.earned += k.earned;
      row.possible += k.possible;
      row.events.add(e.evidence_id);
      row.students.add(e.student_id);
      const student = row.student_scores.get(e.student_id) || {
        earned: 0,
        possible: 0,
      };
      student.earned += k.earned;
      student.possible += k.possible;
      row.student_scores.set(e.student_id, student);
      rows.set(k.node_id, row);
    }
  }
  return [...rows.values()].map(({ student_scores, ...r }) => {
    const band_counts = { 待巩固: 0, 练习中: 0, 较熟练: 0, 已掌握: 0 };
    for (const s of student_scores.values()) {
      const value = (100 * s.earned) / s.possible;
      band_counts[
        value < 50
          ? "待巩固"
          : value < 71
            ? "练习中"
            : value < 86
              ? "较熟练"
              : "已掌握"
      ]++;
    }
    return {
      ...r,
      evidence_ids: [...r.events],
      events: r.events.size,
      students: r.students.size,
      band_counts,
      value: Math.round((100 * r.earned) / r.possible),
    };
  });
}
export function indicatorSummary(
  indicator: any,
  framework: any,
  events: any[],
  rubrics: any[],
) {
  const measurements: any[] = [],
    seen = new Set<string>();
  for (const e of events)
    for (const m of array(e.measurements)) {
      if (
        m.indicator_id !== indicator.indicator_id &&
        !array(indicator.rubric_ids).includes(m.rubric_id)
      )
        continue;
      if (!array(indicator.allowed_evidence_types).includes(e.source_type))
        continue;
      const key =
        m.measurement_id ||
        `${e.evidence_id}:${indicator.indicator_id}:${m.rubric_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      measurements.push({
        ...m,
        evidence_id: e.evidence_id,
        student_id: e.student_id,
        occurred_at: e.occurred_at,
      });
    }
  const rules = rubrics.filter((r) =>
    array(indicator.rubric_ids).includes(r.rubric_id),
  );
  const approved =
    framework.status === "approved" &&
    indicator.status === "approved" &&
    rules.length > 0 &&
    rules.every((r) => r.review_status === "approved" && !r.is_demo);
  const conflict = measurements.some(
    (m) => m.conflict || m.review_status === "conflict",
  );
  // Only explicit, reviewed rubric levels are usable. Never turn legacy earned/possible into a competency score.
  const reviewed = measurements.filter(
    (m) =>
      m.review_status === "approved" &&
      m.task_conditions_met === true &&
      rules.some(
        (r) =>
          r.rubric_id === m.rubric_id &&
          r.version === m.rubric_version &&
          array(r.levels).some((l) => l.level === m.level),
      ),
  );
  const latest = new Map<string, any>();
  reviewed
    .sort((a, b) => String(a.occurred_at).localeCompare(String(b.occurred_at)))
    .forEach((m) => latest.set(m.student_id, m));
  return {
    ...indicator,
    evidence_count: new Set(measurements.map((m) => m.evidence_id)).size,
    evidence_ids: [...new Set(measurements.map((m) => m.evidence_id))],
    rubrics: rules,
    state:
      indicator.status === "suspended"
        ? "suspended"
        : conflict
          ? "conflict"
          : !approved
            ? "pending_review"
            : !latest.size
              ? "insufficient"
              : "observed",
    distribution:
      approved && !conflict
        ? [...latest.values()].reduce(
            (r, m) => ({ ...r, [m.level]: (r[m.level] || 0) + 1 }),
            {} as Record<string, number>,
          )
        : null,
  };
}
