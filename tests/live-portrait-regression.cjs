require("./teaching-support-regression.cjs");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { livePortrait } = require("../mock/teacher/livePortrait.ts");
const { fullSnapshot } = require("../src/features/portraits/domain.ts");
const base = {
  class_id: "cls-g8-03",
  start_date: "2026-06-22",
  end_date: "2026-09-22",
};
const all = livePortrait(base);
assert.throws(
  () => livePortrait({ ...base, subject_id: "physics" }),
  "cached math results cannot bypass subject validation",
);
const observationFile = JSON.parse(
  fs.readFileSync(
    "mock/teacher/data/portrait-observations-cls-g8-03.json",
    "utf8",
  ),
);
const accepted = new Set(all.evidence.map((e) => e.evidence_id));
const records = (observationFile.events || observationFile.observations).filter(
  (e) => accepted.has(e.evidence_id),
);
function expectedKnowledgeMean(nodeId) {
  const students = new Map();
  const seenEvents = new Set();
  for (const event of records) {
    if (seenEvents.has(event.evidence_id)) continue;
    seenEvents.add(event.evidence_id);
    const seenNodes = new Set();
    for (const k of event.knowledge_results || []) {
      if (!k.node_id || seenNodes.has(k.node_id)) continue;
      seenNodes.add(k.node_id);
      if (
        (nodeId && nodeId !== k.node_id) ||
        !Number.isFinite(k.earned) ||
        !Number.isFinite(k.possible) ||
        k.possible <= 0 ||
        k.earned < 0 ||
        k.earned > k.possible
      )
        continue;
      const sum = students.get(event.student_id) || [0, 0];
      sum[0] += k.earned;
      sum[1] += k.possible;
      students.set(event.student_id, sum);
    }
  }
  const ratios = [...students.values()].map(
    ([earned, possible]) => earned / possible,
  );
  return ratios.length
    ? Math.round((100 * ratios.reduce((a, b) => a + b, 0)) / ratios.length)
    : null;
}
const knowledgeDimension = all.snapshot.dimensions.find(
  (d) => d.dimension_key === "knowledge",
);
assert.equal(knowledgeDimension.score, expectedKnowledgeMean());
knowledgeDimension.radar_items.forEach((i) => {
  assert.equal(
    i.value,
    expectedKnowledgeMean(i.key),
    "class means weight valid students equally",
  );
  assert.equal(
    all.overview.cluster_rows.find((r) => r.node_id === i.key).value,
    i.value,
  );
  assert.equal(
    all.graph.nodes.find((n) => n.node_id === i.key).mastery,
    i.value,
  );
});
const radical = livePortrait({
  ...base,
  curriculum_scope_type: "chapter",
  curriculum_scope_id: "demo-ch-radical",
});
const section = livePortrait({
  ...base,
  curriculum_scope_type: "section",
  curriculum_scope_id: "demo-sec-radical-03",
});
const week = livePortrait({ ...base, start_date: "2026-09-16" });
const latest = livePortrait({ ...base, start_date: "2026-09-21" });
assert.ok(latest.evidence.length > 0);
assert.ok(
  week.snapshot.dimensions.every((d) => d.score !== null),
  "near 7 days computes all four observation views",
);
assert.ok(
  radical.evidence.length <= all.evidence.length &&
    section.evidence.length <= radical.evidence.length,
);
assert.ok(
  radical.overview.cluster_rows.every((r) => /二次根式/.test(r.cluster)),
);
assert.notDeepEqual(
  radical.snapshot.dimensions.map((d) => d.score),
  all.snapshot.dimensions.map((d) => d.score),
);
assert.equal(
  all.snapshot.dimensions.find((d) => d.dimension_key === "literacy")
    .radar_items.length,
  5,
);
assert.ok(
  !all.snapshot.dimensions.some((d) =>
    d.radar_items.some((i) => i.key === "value_formation"),
  ),
);
for (const p of [all, radical, section, week, latest]) {
  const scope = {
    ...p.effective_scope,
    sources: p.snapshot.sources,
    start_date: p.snapshot.request_start,
    end_date: p.snapshot.request_end,
  };
  assert.ok(fullSnapshot(p.snapshot, scope));
  assert.equal(
    fullSnapshot(p.snapshot, { ...scope, curriculum_scope_id: "other" }),
    false,
  );
  assert.equal(p.evidence.length, p.pipeline.l1_evidence.total_events);
  assert.equal(
    p.evidence.length,
    p.overview.source_mix.reduce((n, s) => n + s.n, 0),
  );
  assert.equal(
    p.evidence.length,
    new Set(p.evidence.map((e) => e.evidence_id)).size,
  );
  assert.ok(
    p.evidence.every(
      (e) => e.date >= base.start_date && e.date <= base.end_date,
    ),
  );
  p.snapshot.dimensions.forEach((d) => {
    assert.equal(
      d.score,
      p.pipeline.l3_dimension.dimensions.find((x) => x.key === d.dimension_key)
        .value,
    );
    d.radar_items.forEach((i) =>
      assert.ok(i.value === null || (i.value >= 0 && i.value <= 100)),
    );
  });
  p.overview.cluster_rows.forEach((r) =>
    assert.equal(
      Object.values(r.band_counts).reduce((n, v) => n + v, 0),
      r.n_students,
    ),
  );
  assert.ok(
    p.curriculum_alignment.standards.every(
      (s) =>
        s.review_status !== "deprecated" && s.source_anchor && s.source_file,
    ),
  );
}
const studentId = all.available_student_ids[0];
const person = livePortrait({ ...base, student_id: studentId });
assert.ok(person.evidence.every((e) => e.student_id === studentId));
person.snapshot.dimensions.forEach((d) =>
  d.radar_items.forEach((i) =>
    assert.equal(
      i.class_avg,
      all.snapshot.dimensions
        .find((c) => c.dimension_key === d.dimension_key)
        .radar_items.find((c) => c.key === i.key)?.value ?? null,
    ),
  ),
);
const homework = livePortrait({ ...base, sources: "homework" });
assert.ok(homework.evidence.every((e) => e.source_type === "homework"));
assert.deepEqual(
  homework.snapshot.dimensions.map((d) => d.score),
  all.pipeline.source_breakdown["作业记录"].l3_dimension.dimensions.map(
    (d) => d.value,
  ),
);
const empty = livePortrait({ ...base, sources: "none" });
assert.equal(empty.evidence.length, 0);
assert.ok(empty.snapshot.dimensions.every((d) => d.score === null));
assert.equal(empty.overview.cluster_rows.length, 0);
const data = livePortrait({
  ...base,
  curriculum_scope_type: "chapter",
  curriculum_scope_id: "demo-ch-data",
});
assert.equal(
  data.overview.cluster_rows.length,
  2,
  "statistics tasks now have supplied knowledge results",
);
for (const row of data.overview.cluster_rows) {
  assert.equal(
    row.value,
    expectedKnowledgeMean(row.node_id),
    "statistics scores must be backed by recorded tasks",
  );
}
assert.ok(
  data.curriculum_alignment.standards.some(
    (s) => s.standard_id === "std-stat-avg",
  ),
);
assert.equal(
  data.curriculum_alignment.framework.indicators.find(
    (i) => i.indicator_id === "demo-ind-reasoning-expression",
  ).mapping_status,
  "awaiting_source",
);
for (const [sectionId, standardId] of [
  ["demo-sec-pythagoras-02", "std-geo-pythagoras"],
  ["demo-sec-quad-02", "std-geo-quad"],
  ["demo-sec-data-01", "std-stat-avg"],
]) {
  const p = livePortrait({
    ...base,
    curriculum_scope_type: "section",
    curriculum_scope_id: sectionId,
  });
  assert.ok(
    p.curriculum_alignment.standards.some((s) => s.standard_id === standardId),
    "available curriculum references do not depend on observation coverage",
  );
}
const volatility = livePortrait({
  ...base,
  curriculum_scope_type: "section",
  curriculum_scope_id: "demo-sec-data-02",
});
assert.ok(
  !volatility.curriculum_alignment.standards.some(
    (s) => s.standard_id === "std-stat-avg",
  ),
  "concentration standards must not be applied to volatility",
);
const raw = JSON.parse(
  fs.readFileSync("mock/teacher/data/curriculum-standards.json", "utf8"),
);
const md = fs
  .readFileSync("../层次化md课标/义教课标/03_数学.md", "utf8")
  .split(/\r?\n/);
raw.standards
  .filter((s) => s.review_status !== "deprecated")
  .forEach((s) => {
    const [, first, last] = /^L(\d+)(?:-(\d+))?$/.exec(s.source_anchor);
    assert.ok(
      md
        .slice(Number(first) - 1, Number(last || first))
        .join("")
        .trim().length > 10,
    );
    assert.equal(s.review_status, "in_review");
  });
assert.throws(() =>
  livePortrait({
    ...base,
    curriculum_scope_type: "section",
    curriculum_scope_id: "bad",
  }),
);
console.log(
  "PASS live legacy-layout portrait: dates, chapter/section intersections, dynamic axes, recomputed graph/distribution/pipeline, personal comparison, missing states and v2 anchors",
);
