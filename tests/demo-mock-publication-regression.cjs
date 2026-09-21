const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const destination = path.join(root, "src/demo-mock");
const original = {
  copy: fs.copyFileSync,
  write: fs.writeFileSync,
  rename: fs.renameSync,
};
const isPublishedTS = (name) => {
  const resolved = path.resolve(String(name));
  return (
    resolved.startsWith(destination + path.sep) && resolved.endsWith(".ts")
  );
};
const check = (name, bytes) => {
  if (isPublishedTS(name))
    assert.doesNotMatch(
      String(bytes),
      /\bfs\.readFileSync|from\s+["'](?:node:)?fs["']/,
      "browser watcher must never see raw fs code: " + name,
    );
};
fs.copyFileSync = function (source, target, ...args) {
  check(target, fs.readFileSync(source));
  return original.copy.call(fs, source, target, ...args);
};
fs.writeFileSync = function (target, bytes, ...args) {
  check(target, bytes);
  return original.write.call(fs, target, bytes, ...args);
};
fs.renameSync = function (source, target) {
  check(target, fs.readFileSync(source));
  return original.rename.call(fs, source, target);
};
try {
  require("../scripts/prepare-demo-mock.js");
  const fixture = path.join(destination, "teacher/fixtures.ts");
  const before = fs.statSync(fixture).mtimeMs;
  delete require.cache[require.resolve("../scripts/prepare-demo-mock.js")];
  require("../scripts/prepare-demo-mock.js");
  assert.equal(
    fs.statSync(fixture).mtimeMs,
    before,
    "unchanged modules must not trigger hot reload",
  );
  console.log(
    "PASS browser mock publication never exposes fs and preserves unchanged files",
  );
} finally {
  fs.copyFileSync = original.copy;
  fs.writeFileSync = original.write;
  fs.renameSync = original.rename;
}
