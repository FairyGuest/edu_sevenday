const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (name) =>
  JSON.parse(
    fs.readFileSync(path.join(root, "mock/teacher/data", name), "utf8"),
  );
const catalog = read("knowledge.json");
const nodes = new Map();
for (const grade of catalog.grades)
  for (const chapter of grade.chapters)
    for (const item of chapter.clusters) {
      const grades = nodes.get(item.cluster) || new Set();
      grades.add(grade.grade);
      nodes.set(item.cluster, grades);
    }
const { schema_version, items } = read("resources.json");
assert.equal(schema_version, 1);
assert.ok(Array.isArray(items) && items.length > 0);
const ids = new Set();
for (const item of items) {
  assert.ok(
    item.id && !ids.has(item.id),
    "resource id must be unique: " + item.id,
  );
  ids.add(item.id);
  assert.ok(["plans", "courseware"].includes(item.type));
  assert.ok(["g7", "g8", "g9"].includes(item.grade));
  assert.ok(item.knowledge_ids.length > 0);
  assert.equal(new Set(item.knowledge_ids).size, item.knowledge_ids.length);
  for (const id of item.knowledge_ids)
    assert.ok(
      nodes.get(id)?.has(item.grade),
      item.id + " has unknown knowledge/grade: " + id,
    );
  for (const field of [
    "title",
    "subject",
    "chapter",
    "summary",
    "format",
    "author",
  ])
    assert.ok(
      typeof item[field] === "string" && item[field].trim(),
      item.id + " missing " + field,
    );
  assert.match(item.updated_at, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(typeof item.is_demo, "boolean");
  assert.ok(item.file_url === null || typeof item.file_url === "string");
  if (item.file_url) {
    const url = new URL(item.file_url, "http://localhost");
    assert.ok(["http:", "https:"].includes(url.protocol));
    if (item.file_url.startsWith("/") && !item.file_url.startsWith("//"))
      assert.ok(
        fs.existsSync(path.join(root, "public", item.file_url)),
        "missing local resource file: " + item.file_url,
      );
  }
  assert.ok(
    Array.isArray(item.preview) && item.preview.length >= 2,
    item.id + " needs preview content",
  );
  for (const part of item.preview)
    assert.ok(part.title?.trim() && part.content?.trim());
}
console.log(
  "PASS " +
    items.length +
    " resources: valid schema, unique IDs, exact knowledge/grade associations, preview content and local file paths",
);
