const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { transformSync } = require("esbuild");
require.extensions[".ts"] = (mod, file) =>
  mod._compile(
    transformSync(fs.readFileSync(file, "utf8"), {
      loader: "ts",
      format: "cjs",
    }).code,
    file,
  );
const routes = require("../mock/teacher/teachingSupport.ts").default;
const domain = require("../mock/teacher/supportDomain.ts");
let checks = 0;
function call(route, params = {}, code = 200, method = "GET") {
  let result;
  routes[`${method} /api/teacher/support/${route}`](
    { query: params, body: params },
    {
      json: (value) => {
        result = value;
      },
    },
  );
  assert.equal(result.code, code, `${route}: ${result.msg || ""}`);
  checks++;
  return result.data;
}
const meta = call("catalog", { class_id: "cls-g8-03" });
assert.equal(meta.students.length, 45);
assert.equal(
  meta.subject_references.find((s) => s.subject_id === "math").junior.length,
  9,
);
assert.equal(
  meta.subject_references.find((s) => s.subject_id === "math").senior.length,
  6,
);
const base = { class_id: "cls-g8-03", textbook_id: "demo-math-g8-vol2-v1" };
const all = call("profile", base);
assert.equal(
  all.coverage.events,
  all.sources.reduce((n, s) => n + s.count, 0),
);
assert.ok(all.coverage.events > 0);
assert.ok(
  all.indicators.every((i) => i.distribution === null),
  "unreviewed demo rubrics never produce competency levels",
);
for (const chapter of meta.textbooks[0].chapters) {
  const p = call("profile", {
    ...base,
    curriculum_scope_type: "chapter",
    curriculum_scope_id: chapter.chapter_id,
  });
  assert.ok(p.coverage.events <= all.coverage.events);
  for (const section of chapter.sections) {
    const s = call("profile", {
      ...base,
      curriculum_scope_type: "section",
      curriculum_scope_id: section.section_id,
    });
    assert.ok(s.coverage.events <= p.coverage.events);
    assert.equal(s.effective_scope.curriculum_scope_id, section.section_id);
    assert.equal(
      s.coverage.events,
      s.sources.reduce((n, r) => n + r.count, 0),
    );
  }
}
const sectionScope = {
  ...base,
  curriculum_scope_type: "section",
  curriculum_scope_id: "demo-sec-radical-01",
};
for (const unit of meta.units) {
  const p = call("profile", {
    ...base,
    curriculum_scope_type: "unit",
    curriculum_scope_id: unit.unit_id,
  });
  assert.deepEqual(
    p.effective_scope.section_ids.slice().sort(),
    [...new Set(unit.scope.section_ids)].sort(),
  );
  assert.ok(p.coverage.events <= all.coverage.events);
}
const secondBook = meta.textbooks[1];
const otherSection = secondBook.chapters[0].sections[0];
assert.equal(
  call("profile", {
    ...base,
    textbook_id: secondBook.textbook_id,
    curriculum_scope_type: "section",
    curriculum_scope_id: otherSection.section_id,
  }).coverage.events,
  0,
);
const studentScope = {
  ...sectionScope,
  student_id: meta.students[0].student_id,
};
const one = call("profile", studentScope);
assert.equal(one.coverage.total_students, 1);
assert.ok(one.coverage.students <= 1);
const ev = call("evidence", studentScope);
assert.equal(one.coverage.events, ev.total);
assert.ok(
  ev.items.every(
    (e) =>
      e.student_id === studentScope.student_id &&
      e.section_ids.includes(sectionScope.curriculum_scope_id),
  ),
);
assert.ok(ev.items.length <= 8);
call("profile", { ...base, student_id: "outside-class" }, 403);
call("profile", { ...base, subject_id: "english" }, 400);
call("profile", { ...base, textbook_id: "missing" }, 400);
call(
  "profile",
  { ...base, curriculum_scope_type: "section", curriculum_scope_id: "missing" },
  400,
);
call(
  "profile",
  { ...base, curriculum_scope_type: "all", curriculum_scope_id: "bad" },
  400,
);
call(
  "profile",
  { ...base, start_date: "2026-09-22", end_date: "2026-09-01" },
  400,
);
call("profile", { ...base, start_date: "2026-02-31" }, 400);
call("profile", { ...base, sources: "unknown" }, 400);
assert.equal(call("profile", { ...base, sources: "" }).coverage.events, 0);
assert.equal(call("profile", { ...base, sources: "none" }).coverage.events, 0);
assert.deepEqual(
  call("profile", { ...base, sources: "homework" }).coverage,
  call("profile", { ...base, sources: "作业记录" }).coverage,
);
assert.equal(
  call("profile", { ...base, start_date: "2035-01-01", end_date: "2035-02-01" })
    .data_state,
  "empty",
);
assert.equal(domain.naturalDate("2026-09-20T18:00:00Z"), "2026-09-21");
const syntheticScope = {
  ...base,
  subject_id: "math",
  student_id: null,
  sources: ["homework"],
  curriculum_scope_type: "chapter",
  section_ids: ["s1", "s2"],
  chapter_ids: ["ch1"],
};
const record = {
  evidence_id: "e1",
  student_id: "p1",
  class_id: base.class_id,
  subject_id: "math",
  textbook_id: base.textbook_id,
  source_type: "homework",
  occurred_at: "2026-09-20",
  chapter_id: "ch1",
  section_ids: ["s1"],
};
const raw = [
  record,
  { ...record },
  { ...record, evidence_id: "e2", section_ids: [] },
  {
    ...record,
    evidence_id: "e3",
    section_ids: [],
    textbook_id: null,
    chapter_id: null,
  },
];
assert.equal(
  domain.selectEvents(raw, syntheticScope, new Set(["p1"])).events.length,
  2,
);
assert.equal(
  domain.selectEvents(
    raw,
    {
      ...syntheticScope,
      curriculum_scope_type: "section",
      section_ids: ["s1"],
      chapter_ids: [],
    },
    new Set(["p1"]),
  ).events.length,
  1,
);
assert.equal(
  domain.selectEvents(
    raw,
    { ...syntheticScope, curriculum_scope_type: "all" },
    new Set(["p1"]),
  ).events.length,
  3,
);
const k = domain.knowledgeSummary(
  [
    {
      ...record,
      knowledge_results: [
        { node_id: "k1", earned: 1, possible: 2 },
        { node_id: "k1", earned: 1, possible: 2 },
      ],
    },
  ],
  new Map(),
);
assert.equal(k[0].events, 1);
assert.equal(k[0].possible, 2);
const indicator = {
  indicator_id: "i",
  rubric_ids: ["r"],
  allowed_evidence_types: ["homework"],
  status: "approved",
};
const rubric = {
  rubric_id: "r",
  version: "v1",
  levels: [{ level: 1 }],
  review_status: "approved",
};
const ie = [
  {
    ...record,
    measurements: [
      {
        indicator_id: "i",
        measurement_id: "m1",
        rubric_id: "r",
        rubric_version: "v1",
        level: 1,
        review_status: "approved",
        task_conditions_met: true,
      },
    ],
  },
];
assert.equal(
  domain.indicatorSummary(indicator, { status: "approved" }, ie, [rubric])
    .state,
  "observed",
);
assert.equal(
  domain.indicatorSummary(
    indicator,
    { status: "approved" },
    [
      {
        ...ie[0],
        measurements: [{ ...ie[0].measurements[0], conflict: true }],
      },
    ],
    [rubric],
  ).state,
  "conflict",
);
assert.equal(
  domain.indicatorSummary(indicator, { status: "approved" }, ie, [
    { ...rubric, is_demo: true },
  ]).distribution,
  null,
);
const list = call("diagnostics", base);
assert.ok(list.total > 0);
const detail = call("diagnostic", { case_id: "case-01" });
assert.equal(detail.next_action, "stop");
assert.ok(detail.interventions.length > 0);
call("diagnostic", { case_id: "case-01", class_id: "cls-g8-01" }, 403);
call("diagnostic", { case_id: "missing" }, 404);
const rev = detail.review?.revision || 0;
call(
  "review",
  {
    case_id: detail.case_id,
    status: "confirmed",
    confirmed_cause_ids: ["outside-cause"],
    reason: "test",
    expected_revision: rev,
  },
  400,
  "POST",
);
call(
  "review",
  {
    case_id: detail.case_id,
    status: "rejected",
    reason: "counter-evidence requires reconsideration",
    expected_revision: rev,
  },
  200,
  "POST",
);
const rejected = call("diagnostic", { case_id: detail.case_id });
assert.equal(rejected.status, "rejected");
assert.equal(rejected.next_action, "collect_evidence");
assert.equal(rejected.interventions.length, 0);
assert.ok(rejected.historical_interventions.length > 0);
call(
  "review",
  {
    case_id: detail.case_id,
    status: "rejected",
    reason: "stale",
    expected_revision: rev,
  },
  409,
  "POST",
);
call(
  "followup",
  {
    case_id: detail.case_id,
    next_action: "stop",
    observed_change: "x",
    expected_revision: rev + 1,
  },
  400,
  "POST",
);
call(
  "review",
  {
    case_id: detail.case_id,
    status: "confirmed",
    confirmed_cause_ids: detail.confirmed_cause_ids,
    reason: "review again",
    expected_revision: rev + 1,
  },
  200,
  "POST",
);
call(
  "followup",
  {
    case_id: detail.case_id,
    next_action: "stop",
    observed_change: "x",
    evidence_ids: [],
    expected_revision: rev + 2,
  },
  400,
  "POST",
);
const follow = {
  case_id: detail.case_id,
  next_action: "adjust_support",
  observed_change: "needs additional explanation",
  evidence_ids: [detail.attempts[0].attempt_id],
  expected_revision: rev + 2,
  request_id: "test-followup",
};
call("followup", follow, 200, "POST");
call("followup", follow, 200, "POST");
assert.equal(
  call("diagnostic", { case_id: detail.case_id }).teacher_followups.length,
  1,
);
assert.equal(call("diagnostics", { ...base, homework_id: "missing" }).total, 0);
call("design");
call("research-tools");
const { assistantConversation } = require("../mock/teacher/assistantEngine.ts");
const page = {
  route: "/learning-analysis",
  data: { ...sectionScope, evaluation_status: "evidence_based_pending_review" },
};
const scopedReply = assistantConversation({
  message: "查看当前范围学情",
  page,
  page_command: true,
});
assert.match(scopedReply.reply, /16.1/);
assert.match(scopedReply.reply, /不是素养等级/);
assert.equal(
  assistantConversation({
    message: "不要把当前学情注入教学设计",
    page,
    page_command: true,
  }).auto_action,
  undefined,
);
const {
  getPageGreeting,
} = require("../src/components/GlobalAssistant/greetings.ts");
assert.equal(
  getPageGreeting(
    "/learning-analysis",
    "?class_id=cls-g8-03",
    null,
    {},
    "public",
  ).suggestions,
  undefined,
);
for (const file of fs.readdirSync(
  path.join(__dirname, "../src/features/teachingSupport"),
)) {
  if (/\.tsx?$/.test(file))
    transformSync(
      fs.readFileSync(
        path.join(__dirname, "../src/features/teachingSupport", file),
        "utf8",
      ),
      { loader: file.endsWith("tsx") ? "tsx" : "ts" },
    );
}
console.log(
  `PASS: ${checks} API checks; chapter/section/unit, scope isolation, rubric gating, diagnosis review/followup and TSX syntax`,
);
