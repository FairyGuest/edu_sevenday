const assert = require("node:assert/strict");
const fs = require("node:fs");
require.extensions[".ts"] = (m, f) =>
  m._compile(
    require("esbuild").transformSync(fs.readFileSync(f, "utf8"), {
      loader: "ts",
      format: "cjs",
    }).code,
    f,
  );
const {
  presentRecord,
  presentationText,
} = require("../src/utils/presentation.ts");
const original = {
  title: "初中数学（演示）",
  school_name: "智谱演示学校",
  unit_id: "demo-unit-pythagoras",
  is_demo: true,
  review_status: "in_review",
  source_file: "mock/teacher/data/curriculum-standards.json",
  source_text: "原文：课堂演示与探究",
  children: [
    { explanation: "合成数据演示观察，不是已审核能力等级。", score: null },
  ],
  rows: [{ title: "数学任务 · 演示观察", score: 70 }],
};
const saved = JSON.stringify(original);
const out = presentRecord(original);
assert.equal(JSON.stringify(original), saved, "no fixture mutation");
assert.equal(out.title, "初中数学");
assert.equal(out.school_name, "智谱学校");
for (const k of [
  "unit_id",
  "is_demo",
  "review_status",
  "source_file",
  "source_text",
])
  assert.equal(out[k], original[k]);
assert.equal(out.children[0].score, null);
assert.match(out.children[0].explanation, /不是已审核能力等级/);
assert.equal(out.rows[0].score, 70);
assert.equal(presentRecord({ reply: "发布回执（演示环境）" }).reply, "发布回执");
assert.equal(presentRecord({ anchor_source: "合成演示样例" }).anchor_source, "参考资料");
assert.equal(
  presentationText("模拟考试：合成函数的性质"),
  "模拟考试：合成函数的性质",
);
assert.equal(presentationText("第17章 勾股定理"), "第17章 勾股定理");
assert.equal(presentRecord({ score: 70 }).score, 70);
const unchanged = { id: "demo-1", name: "勾股定理" };
assert.equal(
  presentRecord(unchanged),
  unchanged,
  "unchanged objects retain identity",
);
console.log(
  "PASS presentation labels, immutable fixtures, IDs/provenance, missing values and review boundaries",
);
