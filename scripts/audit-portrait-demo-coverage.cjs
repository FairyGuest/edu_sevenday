#!/usr/bin/env node
// Read-only business-data audit. Generated reports are written only to --out.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const dayjs = require("dayjs");
const { transformSync } = require("esbuild");
require.extensions[".ts"] = (mod, file) =>
  mod._compile(
    transformSync(fs.readFileSync(file, "utf8"), {
      loader: "ts",
      format: "cjs",
    }).code,
    file,
  );
const root = path.resolve(__dirname, "..");
const read = (name) =>
  JSON.parse(
    fs.readFileSync(
      path.join(root, "mock/teacher/data", name + ".json"),
      "utf8",
    ),
  );
const { scoped } = require("../mock/teacher/teachingSupport.ts");
const { livePortrait } = require("../mock/teacher/livePortrait.ts");
const {
  sourceLabels,
  naturalDate,
} = require("../mock/teacher/supportDomain.ts");
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  if (at < 0) return fallback;
  if (!args[at + 1] || args[at + 1].startsWith("--"))
    throw new Error("Missing value: " + name);
  return args[at + 1];
};
const coverage = read("portrait-data-coverage");
const asOf = option("--as-of", coverage.demo_as_of);
assert.equal(naturalDate(asOf), asOf, "--as-of must be a valid natural date");
const out = path.resolve(root, option("--out", ".temp/portrait-demo-audit"));
const fixtureDirectory = path.join(root, "mock/teacher/data");
const relative = path.relative(fixtureDirectory, out);
if (!relative || (!relative.startsWith("..") && !path.isAbsolute(relative)))
  throw new Error("Reports cannot be written into business fixtures");
const classes = read("classes").classes;
const catalog = read("curriculum-catalog");
const textbook = catalog.textbooks[0];
const units = read("teaching-units").units.filter(
  (u) => u.textbook_id === textbook.textbook_id,
);
const links = read("curriculum-links").rows;
const rules = read("portrait-metric-rules").metrics;
const ruleMap = new Map(rules.map((r) => [r.key, r]));
const keys = ["knowledge", "ability", "literacy", "process"];
const sourceKeys = Object.keys(sourceLabels);
const windows = [
  {
    key: "7d",
    start_date: dayjs(asOf).subtract(6, "day").format("YYYY-MM-DD"),
    end_date: asOf,
  },
  {
    key: "1m",
    start_date: dayjs(asOf).subtract(1, "month").format("YYYY-MM-DD"),
    end_date: asOf,
  },
  {
    key: "3m",
    start_date: dayjs(asOf).subtract(3, "month").format("YYYY-MM-DD"),
    end_date: asOf,
  },
  { key: "all", start_date: "", end_date: "" },
];
const scopes = [
  { type: "all", id: "", label: "全部章节" },
  ...textbook.chapters.flatMap((c) => [
    { type: "chapter", id: c.chapter_id, label: `${c.no} ${c.title}` },
    ...c.sections.map((s) => ({
      type: "section",
      id: s.section_id,
      label: `${s.no} ${s.title}`,
    })),
  ]),
  ...units.map((u) => ({ type: "unit", id: u.unit_id, label: u.title })),
];
const valid = (m) =>
  Number.isFinite(m.earned) &&
  Number.isFinite(m.possible) &&
  m.possible > 0 &&
  m.earned >= 0 &&
  m.earned <= m.possible;
function rejection(m, event) {
  const rule = ruleMap.get(m.metric_key);
  if (!rule) return "unknown_metric";
  if (!valid(m)) return "invalid_score";
  if (m.conflict || m.review_status === "conflict") return "conflict";
  if (!rule.allowed_source_types.includes(event.source_type))
    return "source_not_allowed";
  if (!rule.rubric_ids.includes(m.rubric_id)) return "rubric_not_allowed";
  return "";
}
function summarize(events, allowed) {
  const buckets = Object.fromEntries(keys.map((k) => [k, new Map()]));
  const students = Object.fromEntries(keys.map((k) => [k, new Set()]));
  const seen = new Set();
  const add = (dimension, key, event) => {
    if (!buckets[dimension].has(key)) buckets[dimension].set(key, new Set());
    buckets[dimension].get(key).add(event.evidence_id);
    students[dimension].add(event.student_id);
  };
  for (const event of events) {
    const nodes = new Set();
    for (const k of event.knowledge_results || []) {
      if (
        !k.node_id ||
        nodes.has(k.node_id) ||
        (allowed && !allowed.has(k.node_id))
      )
        continue;
      nodes.add(k.node_id);
      if (valid(k)) add("knowledge", k.node_id, event);
    }
    for (const m of event.measurements || []) {
      const id =
        m.measurement_id ||
        `${event.evidence_id}:${m.metric_key}:${m.rubric_id}`;
      if (seen.has(id) || rejection(m, event)) continue;
      seen.add(id);
      const dimension = ruleMap.get(m.metric_key).dimension_key;
      if (dimension !== "knowledge") add(dimension, m.metric_key, event);
    }
  }
  const dimensions = Object.fromEntries(
    keys.map((k) => [
      k,
      {
        axes: buckets[k].size,
        populated: buckets[k].size > 0,
        radar: buckets[k].size >= 3,
        students: students[k].size,
        low_sample_axes: [...buckets[k].values()].filter((ids) => ids.size < 3)
          .length,
        axis_ids: [...buckets[k].keys()],
      },
    ]),
  );
  return {
    events: events.length,
    students: new Set(events.map((e) => e.student_id)).size,
    dimensions,
    all_four_scores: keys.every((k) => dimensions[k].populated),
    all_four_radars: keys.every((k) => dimensions[k].radar),
    knowledge_dates: new Set(
      events
        .filter((e) =>
          (e.knowledge_results || []).some(
            (k) => valid(k) && (!allowed || allowed.has(k.node_id)),
          ),
        )
        .map((e) => naturalDate(e.occurred_at)),
    ).size,
  };
}
const flatten = (s) => ({
  events: s.events,
  students: s.students,
  all_four_scores: s.all_four_scores,
  all_four_radars: s.all_four_radars,
  knowledge_dates: s.knowledge_dates,
  ...Object.fromEntries(
    keys.flatMap((k) => [
      [k + "_axes", s.dimensions[k].axes],
      [k + "_students", s.dimensions[k].students],
      [k + "_low_sample_axes", s.dimensions[k].low_sample_axes],
    ]),
  ),
});
const matrix = [],
  personal = [],
  baselines = [],
  rejected = [],
  facts = [];
let apiChecks = 0,
  personalApiChecks = 0;
for (const cls of classes) {
  const raw = read("portrait-observations-" + cls.class_id);
  const baseCtx = scoped({ class_id: cls.class_id });
  const rejectCounts = new Map();
  for (const event of baseCtx.events)
    for (const m of event.measurements || []) {
      const reason = rejection(m, event);
      if (!reason) continue;
      const id = [m.metric_key, m.rubric_id, event.source_type, reason].join(
        "|",
      );
      const hit = rejectCounts.get(id) || {
        class_id: cls.class_id,
        metric_key: m.metric_key,
        rubric_id: m.rubric_id,
        source_type: event.source_type,
        reason,
        count: 0,
        example: event.evidence_id,
      };
      hit.count++;
      rejectCounts.set(id, hit);
    }
  rejected.push(...rejectCounts.values());
  facts.push({
    class_id: cls.class_id,
    raw_events: raw.events.length,
    valid_events: baseCtx.events.length,
    unclassified_events: baseCtx.events.filter(
      (e) => !e.textbook_id || (!(e.section_ids || []).length && !e.chapter_id),
    ).length,
    chapter_only_events: baseCtx.events.filter(
      (e) => e.chapter_id && !(e.section_ids || []).length,
    ).length,
    reflection_events: baseCtx.events.filter(
      (e) => e.event_type === "learning_reflection",
    ).length,
    reflection_without_sections: baseCtx.events.filter(
      (e) =>
        e.event_type === "learning_reflection" && !(e.section_ids || []).length,
    ).length,
    latest_event: raw.events
      .map((e) => naturalDate(e.occurred_at))
      .sort()
      .at(-1),
    declared_end: raw.coverage?.end_date,
  });
  for (const scope of scopes)
    for (const window of windows) {
      const query = {
        class_id: cls.class_id,
        textbook_id: textbook.textbook_id,
        curriculum_scope_type: scope.type,
        curriculum_scope_id: scope.id,
        start_date: window.start_date,
        end_date: window.end_date,
      };
      const ctx = scoped(query);
      const allowed =
        scope.type === "all"
          ? undefined
          : new Set(
              links
                .filter(
                  (r) =>
                    r.status === "mapped" &&
                    r.textbook_id === textbook.textbook_id &&
                    ctx.scope.section_ids.includes(r.section_id),
                )
                .flatMap((r) => r.kp_ids || []),
            );
      const header = {
        class_id: cls.class_id,
        scope_type: scope.type,
        scope_id: scope.id,
        scope_label: scope.label,
        window: window.key,
        start_date: window.start_date,
        end_date: window.end_date,
      };
      const summary = summarize(ctx.events, allowed);
      const live = livePortrait(query);
      assert.equal(live.evidence.length, summary.events);
      for (const k of keys) {
        const d = live.snapshot.dimensions.find((d) => d.dimension_key === k);
        assert.equal(
          d.radar_items.filter((i) => Number.isFinite(i.value)).length,
          summary.dimensions[k].axes,
          JSON.stringify(header) + " " + k,
        );
        assert.equal(d.score !== null, summary.dimensions[k].populated);
      }
      apiChecks++;
      baselines.push({
        ...header,
        mapped_nodes: allowed?.size ?? null,
        ...flatten(summary),
        axis_ids: Object.fromEntries(
          keys.map((k) => [k, summary.dimensions[k].axis_ids]),
        ),
      });
      for (let mask = 0; mask < 32; mask++) {
        const sources = sourceKeys.filter((_, i) => mask & (1 << i));
        const selected = scoped({
          ...query,
          sources: sources.join(",") || "none",
        });
        const s = mask === 31 ? summary : summarize(selected.events, allowed);
        matrix.push({
          ...header,
          sources: sources.join("+") || "none",
          ...flatten(s),
        });
      }
      const perStudent = new Map(ctx.people.map((s) => [s.student_id, []]));
      ctx.events.forEach((e) => perStudent.get(e.student_id).push(e));
      ctx.people.forEach((student, index) => {
        const s = summarize(perStudent.get(student.student_id), allowed);
        personal.push({
          ...header,
          student_id: student.student_id,
          student_name: student.name,
          ...flatten(s),
        });
        if (window.key === "7d" && index === 0) {
          const p = livePortrait({ ...query, student_id: student.student_id });
          assert.equal(p.evidence.length, s.events);
          keys.forEach((k) =>
            assert.equal(
              p.snapshot.dimensions
                .find((d) => d.dimension_key === k)
                .radar_items.filter((i) => Number.isFinite(i.value)).length,
              s.dimensions[k].axes,
            ),
          );
          personalApiChecks++;
        }
      });
    }
}
const byWindow = windows.map((w) => {
  const rows = baselines.filter(
    (r) => r.scope_type === "section" && r.window === w.key,
  );
  return {
    window: w.key,
    section_class_pairs: rows.length,
    no_events: rows.filter((r) => !r.events).length,
    no_knowledge: rows.filter((r) => !r.knowledge_axes).length,
    all_four_scores: rows.filter((r) => r.all_four_scores).length,
    all_four_radars: rows.filter((r) => r.all_four_radars).length,
  };
});
// Run the existing generator in memory: intercept writes instead of changing fixtures.
function probeGenerator(date) {
  const generated = new Map();
  const filename = path.join(__dirname, "gen-portrait-observations-mock.js");
  const virtualFs = {
    ...fs,
    writeFileSync: (file, data) =>
      generated.set(path.resolve(file), String(data)),
    statSync: (file) =>
      generated.has(path.resolve(file))
        ? { size: Buffer.byteLength(generated.get(path.resolve(file))) }
        : fs.statSync(file),
  };
  vm.runInNewContext(
    fs.readFileSync(filename, "utf8"),
    {
      require: (id) =>
        id === "fs" || id === "node:fs" ? virtualFs : require(id),
      __dirname,
      __filename: filename,
      process: { env: { ...process.env, DEMO_AS_OF: date } },
      console: { log() {} },
    },
    { filename, timeout: 30000 },
  );
  return classes.map((cls) => {
    const raw = JSON.parse(
      generated.get(
        path.join(
          fixtureDirectory,
          `portrait-observations-${cls.class_id}.json`,
        ),
      ),
    );
    const start = dayjs(date).subtract(6, "day").format("YYYY-MM-DD");
    return {
      class_id: cls.class_id,
      requested_as_of: date,
      declared_end: raw.coverage.end_date,
      latest_event: raw.events
        .map((e) => naturalDate(e.occurred_at))
        .sort()
        .at(-1),
      near7_events: raw.events.filter(
        (e) =>
          e.valid !== false &&
          naturalDate(e.occurred_at) >= start &&
          naturalDate(e.occurred_at) <= date,
      ).length,
    };
  });
}
const generatorAdvance = probeGenerator(
  dayjs(asOf).add(7, "day").format("YYYY-MM-DD"),
);
const acceptanceGaps = baselines.filter(
  (r) =>
    r.scope_type === "section" &&
    r.window !== "all" &&
    (!r.all_four_scores ||
      r.knowledge_students <
        Math.min(40, read("class-students-" + r.class_id).length) ||
      ["ability", "literacy", "process"].some((k) => r[k + "_axes"] < 3)),
);
const report = {
  demo_as_of: asOf,
  primary_textbook: textbook.textbook_id,
  generated_by: "scripts/audit-portrait-demo-coverage.cjs",
  scope:
    "Primary textbook all/chapter/section/unit; four date windows; all 32 source subsets at class level; all roster students with all sources. Not exhaustive arbitrary dates or all personal/source intersections.",
  counts: {
    classes: classes.length,
    scopes: scopes.length,
    windows: windows.length,
    source_subsets: 32,
    class_combinations: matrix.length,
    personal_all_source_combinations: personal.length,
    class_api_checks: apiChecks,
    personal_api_checks: personalApiChecks,
  },
  by_window: byWindow,
  facts,
  rejected_measurements: rejected,
  generator_advance_probe: generatorAdvance,
  acceptance_gap_count: acceptanceGaps.length,
  baselines,
};
fs.mkdirSync(out, { recursive: true });
const csv = (name, rows) => {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]);
  const quote = (v) => '"' + String(v ?? "").replaceAll('"', '""') + '"';
  fs.writeFileSync(
    path.join(out, name),
    "\ufeff" +
      [
        columns.map(quote).join(","),
        ...rows.map((r) => columns.map((k) => quote(r[k])).join(",")),
      ].join("\r\n") +
      "\r\n",
  );
};
csv("class-scope-source-matrix.csv", matrix);
csv("student-scope-matrix.csv", personal);
csv("rejected-measurements.csv", rejected);
csv(
  "acceptance-gaps.csv",
  acceptanceGaps.map(({ axis_ids, ...r }) => r),
);
fs.writeFileSync(
  path.join(out, "report.json"),
  JSON.stringify(report, null, 2) + "\n",
);
const lines = [
  "# 学情画像演示覆盖实测",
  "",
  `基准日：${asOf}。业务数据只读，结果由实际筛选域与画像 API 交叉核验。`,
  "",
  `班级组合 ${matrix.length}；全名册个人组合 ${personal.length}；班级 API 核对 ${apiChecks}；个人 API 抽核 ${personalApiChecks}。`,
  "包含主教材全部/章/节/单元、近7天/1月/3月/不限日期、班级五来源的32种组合（含全不选）。个人统计使用全部来源，未声称穷尽任意日期及个人来源交叉。",
  "",
  "有读数不等于能画雷达：当前雷达至少3个有效轴。以下轴数顺序为知识/能力/素养/过程。",
  "",
  "| 窗口 | 班级×节 | 无事件 | 无知识得分 | 四维有读数 | 四张雷达均可画 |",
  "|---|---:|---:|---:|---:|---:|",
  ...byWindow.map(
    (w) =>
      `| ${w.window} | ${w.section_class_pairs} | ${w.no_events} | ${w.no_knowledge} | ${w.all_four_scores} | ${w.all_four_radars} |`,
  ),
  "",
  "## 三班各章节（全部来源）",
  "",
  "| 范围 | 班级 | 近7天事件 / 轴数 | 近1月事件 / 轴数 | 近3月事件 / 轴数 |",
  "|---|---|---|---|---|",
];
for (const s of scopes.filter((s) => s.type !== "all"))
  for (const cls of classes) {
    const cells = windows.slice(0, 3).map((w) => {
      const row = baselines.find(
        (r) =>
          r.scope_id === s.id &&
          r.class_id === cls.class_id &&
          r.window === w.key,
      );
      return `${row.events} / ${keys.map((k) => row[k + "_axes"]).join("/")}`;
    });
    lines.push(`| ${s.label} | ${cls.class_id} | ${cells.join(" | ")} |`);
  }
lines.push(
  "",
  "## 无法进入统计的测量",
  "",
  "| 班级 | 指标 | 量表 | 排除原因 | 数量 |",
  "|---|---|---|---|---:|",
  ...rejected.map(
    (r) =>
      `| ${r.class_id} | ${r.metric_key} | ${r.rubric_id} | ${r.reason} | ${r.count} |`,
  ),
  "",
  "## 基准日推进探测（生成器写入已拦截，未修改业务数据）",
  "",
  ...generatorAdvance.map(
    (r) =>
      `- ${r.class_id}：DEMO_AS_OF=${r.requested_as_of}，声明结束 ${r.declared_end}，最新事件 ${r.latest_event}，近7天有效事件 ${r.near7_events}。`,
  ),
  "",
  `严格补数门槛：三个预设窗口中每班每节四维有读数，知识覆盖至少40人（名册不足40时按名册），能力/素养/过程各有至少3个有效轴。目前 ${acceptanceGaps.length} 个组合未达标。知识雷达不强行凑3轴。此门槛仅用于合成演示验收。`,
  "",
  "判定说明：无事件、无合法测量、缺少节点映射、低样本和来源不适用必须分别处理；不能用零分或其他章节分数补空。详表见同目录 CSV/JSON。",
  "",
);
fs.writeFileSync(path.join(out, "summary.md"), lines.join("\n"));
console.log(
  JSON.stringify(
    {
      ...report.counts,
      demo_as_of: asOf,
      by_window: byWindow,
      facts,
      rejected,
      generator_advance_probe: generatorAdvance,
      acceptance_gap_count: acceptanceGaps.length,
      output: out,
    },
    null,
    2,
  ),
);
if (args.includes("--require-section-coverage") && acceptanceGaps.length)
  process.exitCode = 2;
