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
const { livePortrait } = require("../mock/teacher/livePortrait.ts");
const { mathCompetencies } = require("../mock/teacher/curriculumReference.ts");
const read = (file) =>
  JSON.parse(
    fs.readFileSync(path.join(__dirname, "../mock/teacher/data", file), "utf8"),
  );
const standards = read("curriculum-standards.json").standards;
const active = standards.filter((s) => s.review_status !== "deprecated");
// Only normalize typography, list markers and Markdown math, never the quoted wording.
const normalize = (s) =>
  s
    .replace(/\\neq/g, "≠")
    .replace(/[$\s①-⑳]/g, "")
    .replace(/（/g, "(")
    .replace(/）/g, ")");
for (const standard of active) {
  const lines = fs
    .readFileSync(
      path.resolve(__dirname, "../..", standard.source_file),
      "utf8",
    )
    .split(/\r?\n/);
  const anchor = /^L(\d+)(?:-(\d+))?$/.exec(standard.source_anchor);
  assert.ok(anchor, standard.standard_id);
  const source = normalize(
    lines
      .slice(Number(anchor[1]) - 1, Number(anchor[2] || anchor[1]))
      .join("\n"),
  );
  let excerpt = standard.source_text;
  if (standard.excerpt)
    excerpt = excerpt.replace(
      /（(?:节选，全文见原文 L1046|L1160-1162 连续节选)）$/,
      "",
    );
  let offset = 0;
  for (const part of normalize(excerpt).split("……")) {
    const at = source.indexOf(part, offset);
    assert.ok(
      at >= offset,
      `${standard.standard_id}: excerpt must occur in its actual Markdown anchor`,
    );
    offset = at + part.length;
  }
  assert.equal(standard.review_status, "in_review");
  console.log(`VERIFIED ${standard.standard_id} ${standard.source_anchor}`);
}
const core = active.find((s) => s.standard_id === "std-core-competencies");
assert.equal(
  core.source_text,
  `初中阶段，核心素养主要表现为：${mathCompetencies.join("、")}。`,
);
assert.equal(mathCompetencies.length, 9);
const all = livePortrait({
  class_id: "cls-g8-03",
  start_date: "2026-06-22",
  end_date: "2026-09-22",
});
const items = all.snapshot.dimensions.flatMap((d) => d.radar_items);
for (const [node, standard] of [
  ["kp-function", "std-func-concept"],
  ["kp-pythagoras-inverse", "std-geo-pythagoras"],
  ["kp-special-quad", "std-geo-special-quad"],
  ["kp-data-central-tendency", "std-stat-avg"],
  ["kp-data-dispersion", "std-stat-variance"],
])
  assert.ok(
    items
      .find((i) => i.key === node)
      ?.standards.some((s) => s.standard_id === standard),
    node,
  );
assert.equal(all.curriculum_alignment.subject_reference.junior.length, 9);
assert.ok(
  all.curriculum_alignment.standards.some(
    (s) => s.standard_id === core.standard_id,
  ),
);
assert.ok(
  !all.curriculum_alignment.standards.some(
    (s) => s.review_status === "deprecated",
  ),
);
const framework = all.curriculum_alignment.framework;
assert.equal(
  framework.indicators.find(
    (i) => i.indicator_id === "demo-ind-reasoning-expression",
  ).mapping_status,
  "awaiting_source",
);
assert.equal(
  framework.indicators.find((i) => i.indicator_id === "demo-ind-collaboration")
    .status,
  "suspended",
);
const rules = read("portrait-metric-rules.json").metrics;
for (const dimension of all.snapshot.dimensions.filter(
  (d) => d.dimension_key !== "knowledge",
)) {
  for (const item of dimension.radar_items) {
    const rule = rules.find((r) => r.key === item.key);
    assert.equal(item.observation_basis.definition, rule.definition);
    assert.deepEqual(item.observation_basis.rubric_ids, rule.rubric_ids);
    assert.ok(
      !mathCompetencies.includes(item.name),
      "observation scores must not be relabeled as core competency levels",
    );
  }
}
for (const [id, std] of [
  ["demo-sec-data-02", "std-stat-variance"],
  ["demo-sec-function-01", "std-func-concept"],
  ["demo-sec-pythagoras-02", "std-geo-pythagoras"],
]) {
  const scoped = livePortrait({
    class_id: "cls-g8-03",
    curriculum_scope_type: "section",
    curriculum_scope_id: id,
  });
  assert.ok(
    scoped.curriculum_alignment.standards.some((s) => s.standard_id === std),
  );
  assert.ok(scoped.curriculum_alignment.content_links.length);
}
console.log(
  `PASS ${active.length} source anchors, nine extracted competencies, current scope mappings, observation-rule provenance and review boundaries`,
);
