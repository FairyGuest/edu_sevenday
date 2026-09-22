const assert = require("node:assert/strict");
const fs = require("node:fs");
const { transformSync } = require("esbuild");
require.extensions[".ts"] = (mod, file) =>
  mod._compile(
    transformSync(fs.readFileSync(file, "utf8"), {
      loader: "ts",
      format: "cjs",
    }).code,
    file,
  );
const {
  createDesignDraft,
  parseDesignDraft,
  mergeDesignDraft,
} = require("../src/features/teachingSupport/designDraft.ts");
const empty = createDesignDraft({});
assert.equal(Object.keys(empty).length, 8);
assert.match(empty.knowledge, /尚无可用学情/);
assert.match(empty.collaboration, /尚无明确/);
const draft = createDesignDraft({
  unit: { title: "根式单元", unit_goals: [{ behavior: "能解释化简步骤" }] },
  learning: {
    effective_scope: { label: "16.3" },
    coverage: { events: 12, students: 4, total_students: 45 },
    knowledge: [{ name: "根式加减", value: 50, events: 3 }],
    learner_contexts: [
      {
        name: "学生甲",
        aspect: "生活情境经验",
        source: "unknown",
        content: "不得使用该资料",
      },
    ],
  },
});
assert.match(draft.knowledge, /4\/45/);
assert.match(draft.knowledge, /50%/);
assert.ok(!draft.experience.includes("不得使用"));
assert.match(draft.task, /解释化简/);
const edited = mergeDesignDraft(draft, { situation: "教师修改", habits: "" });
assert.equal(edited.situation, "教师修改");
assert.equal(edited.habits, "");
assert.equal(
  mergeDesignDraft({ ...draft, situation: "AI新稿" }, { situation: "教师修改" })
    .situation,
  "教师修改",
);
assert.deepEqual(
  parseDesignDraft('```json\n{"task":"  新任务  ","unexpected":"x"}\n```'),
  { task: "新任务" },
);
assert.throws(() => parseDesignDraft('{"task": ["bad"]}'));
assert.throws(() => parseDesignDraft("not JSON"));
console.log(
  "PASS draft evidence/missing states, scoped source excerpts, validated model JSON and preserved teacher edits including empty values",
);
