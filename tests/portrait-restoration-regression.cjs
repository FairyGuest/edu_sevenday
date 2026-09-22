require("./teaching-support-regression.cjs");
const assert = require("node:assert/strict");
const { profile } = require("../mock/teacher/teachingSupport.ts");
const { supportPortrait } = require("../mock/teacher/supportPortrait.ts");
const base = { class_id: "cls-g8-03" };
const dates = { start_date: "2026-09-10", end_date: "2026-09-16" };
const chapter = {
  curriculum_scope_type: "chapter",
  curriculum_scope_id: "demo-ch-radical",
};
const routes = require("../mock/teacher/teachingSupport.ts").default;
let catalog;
routes["GET /api/teacher/support/catalog"](
  { query: base },
  { json: (r) => (catalog = r.data) },
);
chapter.curriculum_scope_id = catalog.textbooks[0].chapters[0].chapter_id;
const all = profile(base),
  byDate = profile({ ...base, ...dates }),
  byChapter = profile({ ...base, ...chapter });
const intersection = profile({ ...base, ...chapter, ...dates });
assert.equal(byDate.effective_scope.curriculum_scope_type, "all");
assert.equal(byChapter.effective_scope.start_date, "");
assert.ok(
  byDate.coverage.events > 0 && byDate.coverage.events <= all.coverage.events,
);
assert.ok(
  intersection.coverage.events <= byDate.coverage.events &&
    intersection.coverage.events <= byChapter.coverage.events,
);
for (const p of [
  all,
  byDate,
  byChapter,
  intersection,
  profile({ ...base, sources: "none" }),
]) {
  assert.equal(p.portrait.dimensions.length, 4);
  assert.equal(
    p.portrait.dimensions.find((d) => d.key === "literacy").items.length,
    9,
  );
  assert.equal(
    p.portrait.dimensions.find((d) => d.key === "ability").items.length,
    p.indicators.filter((i) => i.portrait_views.includes("ability")).length,
  );
  for (const d of p.portrait.dimensions)
    for (const i of d.items) {
      assert.ok(i.evidence_ids.length <= p.coverage.events);
      if (d.key !== "knowledge")
        assert.equal(
          i.value,
          new Set(i.evidence_ids).size,
          "observation counts are not competence scores",
        );
    }
  for (const k of p.knowledge)
    assert.equal(
      Object.values(k.band_counts).reduce((n, v) => n + v, 0),
      k.students,
    );
  for (const n of p.portrait.graph.nodes) {
    assert.equal(
      n.mastery,
      p.knowledge.find((k) => k.node_id === n.node_id)?.value ?? null,
    );
    assert.ok(
      n.evidence.every(
        (e) =>
          (!p.effective_scope.start_date ||
            e.occurred_at.slice(0, 10) >= p.effective_scope.start_date) &&
          (!p.effective_scope.end_date ||
            e.occurred_at.slice(0, 10) <= p.effective_scope.end_date),
      ),
    );
  }
  for (const point of p.portrait.trend)
    assert.ok(
      (!p.effective_scope.start_date ||
        point.window >= p.effective_scope.start_date) &&
        (!p.effective_scope.end_date ||
          point.window <= p.effective_scope.end_date),
    );
}
const empty = profile({ ...base, sources: "none" });
assert.equal(empty.portrait.cluster_rows.length, 0);
assert.ok(empty.portrait.graph.nodes.every((n) => n.mastery === null));
const fixture = {
  scope: { subject_id: "physics", grade_id: "g8" },
  events: [],
  knowledge: [],
  graph: {},
  mappings: [],
  links: [],
  indicators: [],
  references: catalog.subject_references,
  metrics: [],
};
assert.equal(
  supportPortrait(fixture).dimensions.find((d) => d.key === "literacy").items
    .length,
  4,
);
assert.equal(
  supportPortrait({
    ...fixture,
    scope: { subject_id: "math", grade_id: "g10" },
  }).dimensions.find((d) => d.key === "literacy").items.length,
  6,
);
console.log(
  "PASS restored portraits: independent/intersecting date and curriculum filters, dynamic 4/6/9 axes, scoped distributions/graphs, no fabricated scores",
);
