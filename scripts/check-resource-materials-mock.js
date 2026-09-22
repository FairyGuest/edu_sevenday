/**
 * 校验资源平台 materials mock（对照 docs/resource-mock-guide.md §3/§4/§5）。
 * 用法：node scripts/check-resource-materials-mock.js
 */
const fs = require("fs");
const path = require("path");
const DATA = path.join(__dirname, "..", "mock", "teacher", "data");
let fail = 0;
const ok = (c, m) => { console.log((c ? "PASS" : "FAIL") + "  " + m); if (!c) fail++; };

const res = JSON.parse(fs.readFileSync(path.join(DATA, "resources.json"), "utf-8"));
const kn = JSON.parse(fs.readFileSync(path.join(DATA, "knowledge.json"), "utf-8"));
const clusterGrade = new Map();
for (const g of kn.grades) for (const ch of g.chapters) for (const c of ch.clusters) clusterGrade.set(c.cluster, g.grade);
const items = res.items;

/* §3 结构与字段 */
ok(res.schema_version === 1, "根对象 schema_version: 1");
const ids = new Set(items.map((i) => i.id));
ok(ids.size === items.length, `id 全局唯一（${items.length} 条）`);
const FORBIDDEN = /浏览|下载|观看|人气|效果|提升分|得分率/;
let bad = [];
for (const it of items) {
  const tl = [...it.title].length, sl = [...it.summary].length;
  if (tl < 12 || tl > 35) bad.push(`${it.id} 标题 ${tl} 字`);
  if (sl < 40 || sl > 90) bad.push(`${it.id} 摘要 ${sl} 字`);
  if (!["plans", "courseware"].includes(it.type)) bad.push(`${it.id} type 非法`);
  if (!it.knowledge_ids.length || new Set(it.knowledge_ids).size !== it.knowledge_ids.length) bad.push(`${it.id} knowledge_ids 为空或重复`);
  for (const k of it.knowledge_ids) {
    if (!clusterGrade.has(k)) bad.push(`${it.id} 未知知识点「${k}」`);
    else if (clusterGrade.get(k) !== it.grade) bad.push(`${it.id}「${k}」属 ${clusterGrade.get(k)} 与资源年级 ${it.grade} 不一致`);
  }
  if (!["g7", "g8", "g9"].includes(it.grade)) bad.push(`${it.id} grade 非法`);
  if (it.subject !== "数学") bad.push(`${it.id} subject 非数学`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(it.updated_at) || it.updated_at > "2026-09-22") bad.push(`${it.id} updated_at 非法`);
  if (it.is_demo !== true) bad.push(`${it.id} is_demo 应为 true`);
  if (it.file_url !== null) bad.push(`${it.id} file_url 应为 null`);
  if (!["教案内容", "课件内容示例"].includes(it.format)) bad.push(`${it.id} format 非常规`);
  if (!it.preview || it.preview.length < 2) bad.push(`${it.id} preview 不足 2 段`);
  for (const p of it.preview || []) {
    if (!p.title || !p.content || p.content.length < 8) bad.push(`${it.id} preview 段落内容过短`);
    if (/[<>\/]script|base64|href=/.test(p.content)) bad.push(`${it.id} preview 含非纯文本`);
  }
  const extra = Object.keys(it).filter((k) => !["id", "type", "title", "knowledge_ids", "grade", "subject", "chapter", "summary", "format", "author", "updated_at", "is_demo", "file_url", "preview"].includes(k));
  if (extra.length) bad.push(`${it.id} 多余字段 ${extra.join(",")}`);
  if (FORBIDDEN.test(JSON.stringify(it))) bad.push(`${it.id} 疑似含浏览量/效果类内容`);
}
ok(bad.length === 0, "字段规范（标题 12-35、摘要 40-90、年级/知识点一致、无禁造字段）" + (bad.length ? "，问题：" + bad.slice(0, 4).join("；") : ""));

/* §3 建议：新增教案 6 段 / 课件 5-8 页（既有 7 条样例为最小 2 段，豁免页数建议） */
const LEGACY = new Set(["res-radical-plan", "res-radical-slides", "res-radical-add", "res-pythagoras-plan", "res-pythagoras-slides", "res-parallel-plan", "res-probability-slides"]);
const newItems = items.filter((i) => !LEGACY.has(i.id));
const PLAN_SECTIONS = ["教学目标", "学情判断", "教学过程", "提问设计", "分层任务", "评价方式"];
ok(newItems.filter((i) => i.type === "plans").every((i) => PLAN_SECTIONS.every((s) => i.preview.some((p) => p.title === s))), `新增教案 ${newItems.filter((i) => i.type === "plans").length} 份均含六段（目标/学情/过程/提问/分层/评价）`);
ok(newItems.filter((i) => i.type === "courseware").every((i) => i.preview.length >= 5 && i.preview.length <= 8), `新增课件 ${newItems.filter((i) => i.type === "courseware").length} 份均为 5-8 页`);

/* §4 覆盖结构 */
const byNode = new Map();
for (const it of items) for (const k of it.knowledge_ids) {
  const e = byNode.get(k) || { plans: 0, courseware: 0 };
  e[it.type]++; byNode.set(k, e);
}
const PRIORITY = ["二次根式", "二次根式及其性质", "二次根式的加法与减法", "勾股定理", "勾股定理及其应用", "勾股定理的逆定理及其应用", "一次函数的图象和性质", "函数", "实际问题与一次函数", "平行线", "相交线与平行线", "用列举法求概率", "随机事件与概率", "用频率估计概率"];
ok(PRIORITY.every((n) => { const e = byNode.get(n); return e && e.plans >= 1 && e.courseware >= 2; }),
  "优先节点（根式/勾股/一次函数/平行线/概率）均为 1 教案 + 2 课件以上：" + PRIORITY.map((n) => `${n}(${byNode.get(n)?.plans || 0}+${byNode.get(n)?.courseware || 0})`).join(" "));
const multi = items.filter((i) => i.knowledge_ids.length > 1);
ok(multi.length >= 8, `多节点资源 ${multi.length} 条（检验知识点关联）`);
const multiGrade = items.filter((i) => new Set(i.knowledge_ids.map((k) => clusterGrade.get(k))).size > 1);
ok(multiGrade.length === 0, "无跨年级节点挂载");
const grades = new Set(items.map((i) => i.grade));
ok(grades.size === 3, `覆盖三个年级（${[...grades].join("/")}）`);
const longTitle = items.filter((i) => [...i.title].length >= 25);
ok(longTitle.length >= 5, `长标题 ${longTitle.length} 条（检验排版）`);
const uncovered = [...clusterGrade.keys()].filter((k) => !byNode.has(k));
ok(uncovered.length >= 10, `未覆盖节点 ${uncovered.length} 个保留空状态（如 ${uncovered.slice(0, 5).join("、")}…）`);

/* §5 接口语义模拟（与 mock/teacher/materials.ts 同逻辑） */
function query({ node, type = "all", grade = "all", q = "" }) {
  const matches = items.filter((i) => (!node || i.knowledge_ids.includes(node)) && (grade === "all" || i.grade === grade) && (!q || `${i.title} ${i.summary}`.includes(q.trim())));
  const out = matches.filter((i) => type === "all" || i.type === type);
  return { items: out, total: out.length, counts: { plans: matches.filter((i) => i.type === "plans").length, courseware: matches.filter((i) => i.type === "courseware").length }, match: { node: node || null, strategy: "knowledge_id_exact" } };
}
{
  const r1 = query({ node: "二次根式", grade: "g8", type: "courseware" });
  const expect = items.filter((i) => i.knowledge_ids.includes("二次根式") && i.grade === "g8" && i.type === "courseware").length;
  ok(r1.total === expect && r1.total >= 2, `按节点+年级+类型查询：二次根式 g8 课件 ${r1.total} 条（counts=${JSON.stringify(r1.counts)}）`);
  const r2 = query({ node: "二次根式" });
  ok(r2.items.every((i) => i.knowledge_ids.includes("二次根式")) && r2.total === r2.counts.plans + r2.counts.courseware, "node=二次根时 结果只含该节点资源，total=两类之和");
  const r3 = query({ node: "旋转" });
  ok(r3.total === 0 && r3.match.strategy === "knowledge_id_exact", "未覆盖节点返回空数组与精确匹配策略（不回退其他章节）");
  const r4 = query({ q: "图像" });
  ok(r4.total >= 3 && r4.items.every((i) => `${i.title} ${i.summary}`.includes("图像")), `关键词 q=图像 命中 ${r4.total} 条`);
  const r5 = query({ node: "二次根式", grade: "g7" });
  ok(r5.total === 0, "节点与年级矛盾时返回空（年级过滤生效）");
}

console.log(fail === 0 ? "\n全部通过" : `\n${fail} 项失败`);
process.exit(fail ? 1 : 0);
