/**
 * 教师端 · 学情画像 mock（开发辅助，非系统功能；消费 mock/teacher/data fixture）。
 * 接口：GET /api/teacher/classes | profile/class | profile/student | profile/student/evidence
 * 仅 start:mock 模式生效（cogUrl=/api），生产构建不包含。
 */
import * as fs from "fs";
import * as path from "path";
import { computeDimensions, clusterLevel, applyTimeWindow, applyDateRange, TimeRange } from "./dimensions";

const D = path.join(__dirname, "data");
const read = (f: string): any => JSON.parse(fs.readFileSync(path.join(D, f), "utf-8"));
const BANDS = ["待巩固", "练习中", "较熟练", "已掌握"];
const ALL_SOURCES = ["作业记录", "人机交互", "自主练习", "考试记录"];

/** 按勾选来源合并班级画像（重算 band 分布/趋势/来源构成/学生状态） */
function mergeProfile(prof: any, studentsFile: any[], sources: string[]) {
  if (!sources || !sources.length || sources.length === ALL_SOURCES.length) {
    return prof;
  }
  const bs = prof.by_source || {};
  const baseRow = new Map(prof.cluster_rows.map((r: any) => [r.cluster, r]));
  const bandSum: Record<string, any> = {};
  const stuSum: Record<string, number> = {};
  const trendKN: number[][] = Array.from({ length: 8 }, () => [0, 0]);
  let total = 0;
  for (const src of sources) {
    const s = bs[src];
    if (!s) continue;
    total += s.totals || 0;
    for (const [cl, cnt] of Object.entries<any>(s.cluster_band || {})) {
      bandSum[cl] = bandSum[cl] || { 待巩固: 0, 练习中: 0, 较熟练: 0, 已掌握: 0 };
      for (const b of BANDS) bandSum[cl][b] += cnt[b] || 0;
      stuSum[cl] = (stuSum[cl] || 0) + (s.cluster_students?.[cl] || 0);
    }
    (s.trend_kn || []).forEach((kn: number[], i: number) => {
      trendKN[i][0] += kn[0];
      trendKN[i][1] += kn[1];
    });
  }
  const cluster_rows = Object.entries(bandSum).map(([cl, cnt]) => {
    const base = baseRow.get(cl) || {} as any;
    const n_stu = stuSum[cl] || 0;
    const weak_n = cnt["待巩固"] || 0;
    return { ...base, cluster: cl, n_students: n_stu,
      band_counts: cnt, weak_n, weak_pct: n_stu ? Math.round((weak_n / n_stu) * 100) : 0 };
  }).filter((r: any) => r.n_students >= 1)
    .sort((a: any, b: any) => b.weak_n - a.weak_n || b.n_students - a.n_students);
  const weak_rows = cluster_rows.filter((r: any) => r.weak_n > 0 && r.n_students >= 3);
  const trend = prof.trend.map((t: any, i: number) => ({
    window: t.window, n: trendKN[i][1],
    value: trendKN[i][1] ? Math.round((trendKN[i][0] / trendKN[i][1]) * 1000) / 10 : null,
  }));
  const source_mix = sources.map((s0) => ({
    source: s0, n: bs[s0]?.totals || 0, pct: total ? Math.round(((bs[s0]?.totals || 0) / total) * 100) : 0,
  }));
  // 学生列表按所选来源重算状态
  const detailMap = new Map(studentsFile.map((s: any) => [s.student_id, s]));
  const students = prof.students.map((s0: any) => {
    const d: any = detailMap.get(s0.student_id)?.by_source || {};
    let weak_cnt = 0, has_ev = false;
    for (const src of sources) {
      weak_cnt += d[src]?.weak_cnt || 0;
      has_ev = has_ev || !!d[src]?.has_ev;
    }
    const status = !has_ev ? "暂无学情数据（当前筛选来源）" : (weak_cnt === 0 ? "全部较熟练以上" : `${weak_cnt}个知识点待巩固`);
    return { ...s0, weak_cnt, status, status_level: !has_ev ? "cold" : (weak_cnt === 0 ? "ok" : "weak") };
  });
  const order = { weak: 0, ok: 1, cold: 2 };
  students.sort((a: any, b: any) => order[a.status_level] - order[b.status_level] || b.weak_cnt - a.weak_cnt || (a.name > b.name ? 1 : -1));
  const last5 = trend.slice(3).map((t: any) => t.value).filter((v: any) => v != null);
  const top = weak_rows[0];
  return { ...prof, cluster_rows, weak_ranking: weak_rows.slice(0, 8), trend, source_mix, students,
    cards: { ...prof.cards,
      weak_top: top ? `「${top.cluster}」待巩固占比` : "暂无待巩固知识点",
      weak_top_pct: top ? top.weak_pct : 0,
      support_suggestions: Math.min(5, weak_rows.length),
      recent5_avg: last5.length ? Math.round((last5.reduce((a: number, b: number) => a + b, 0) / last5.length) * 10) / 10 : null } };
}

const cache: Record<string, any> = {};
const classesData = () => cache.classes || (cache.classes = read("classes.json").classes);

export default {
  "GET /api/teacher/classes": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: classesData() });
  },

  "GET /api/teacher/profile/class": (req: any, res: any) => {
    const classId = req.query.class_id || classesData()[0].class_id;
    const sources: string[] = req.query.sources ? String(req.query.sources).split(",") : [];
    const timeRange: TimeRange = req.query.time_range === "week" ? "week" : "month";
    let prof = read(`class-profile-${classId}.json`);
    const studentsFile = read(`class-students-${classId}.json`);
    const merged = mergeProfile(prof, studentsFile, sources);
    // 自定义起止日期优先；否则按周/月预设
    prof = (req.query.start_date && req.query.end_date)
      ? applyDateRange(merged, String(req.query.start_date), String(req.query.end_date), String(classId))
      : applyTimeWindow(merged, timeRange, String(classId));
    // A2：知识点挂课标能力等级；A4：样本题数（<3 题=证据不足口径，确定性生成）
    const hsh = (str: string) => { let h = 7; for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) % 997; return h; };
    prof.cluster_rows = (prof.cluster_rows || []).map((r: any) => {
      const n_sample = r.weak_pct >= 25 ? 4 + (hsh(r.cluster) % 5) : 1 + (hsh(r.cluster) % 3);
      // graph4rec 语义：trust 三档（证据强度如实呈现）
      const trust = n_sample >= 5 ? "credible" : n_sample >= 3 ? "coarse" : "insufficient";
      // Wilson 95% 区间的简化近似（p 为班级掌握度）
      const p = Math.max(2, Math.min(98, Math.round(100 - (r.weak_pct || 0) * 2.2)));
      const z = 1.96, nn = Math.max(n_sample, 1);
      const lo = Math.max(0, Math.round(100 * (p/100 + z*z/(2*nn) - z*Math.sqrt((p/100*(1-p/100))/nn + z*z/(4*nn*nn))) / (1 + z*z/nn)));
      const hi = Math.min(100, Math.round(100 * (p/100 + z*z/(2*nn) + z*Math.sqrt((p/100*(1-p/100))/nn + z*z/(4*nn*nn))) / (1 + z*z/nn)));
      return { ...r, level: clusterLevel(r.cluster), n_sample, trust, p, ci: [lo, hi] };
    });
    // A1：能力/素养多维块（按簇掌握度合成班级 cells，n=覆盖人数）
    const classCells = (prof.cluster_rows || []).map((r: any) => ({
      cluster: r.cluster,
      p: Math.max(20, Math.min(98, Math.round(100 - (r.weak_pct || 0) * 2))),
      n: r.n_students || 3,
    }));
    prof.dimensions = computeDimensions(classCells);
    // A1+图谱：知识点掌握网络（节点=全量目录细粒度；层=L1~L4；边=同章脉络+素养同源）
    prof.kgraph = buildKnowledgeGraph(prof.cluster_rows || [], prof.grade);
    res.json({ code: 200, msg: "ok", data: prof });
  },

  "GET /api/teacher/profile/student": (req: any, res: any) => {
    const { class_id: cid, student_id: sid } = req.query;
    const one = read(`class-students-${cid}.json`).find((s: any) => s.student_id === sid);
    if (!one) return res.json({ code: 404, msg: "学生不存在", data: null });
    // A1/A2：个人画像扩展能力/素养维度（cells 已含样本量门槛字段 n）
    const dims = computeDimensions(one.cells || []);
    // 个人知识点图谱：cells 即节点（p 掌握度着色，n=作答题量），关联沿用班级结构
    const prof = read(`class-profile-${cid}.json`);
    const personalGraph = buildKnowledgeGraph(
      (one.cells || []).map((c: any) => ({ ...c, weak_pct: 100 - 2 * c.p, n_students: c.n, chapter: null })),
      prof.grade,
    );
    const levels = (one.cells || []).filter((c: any) => c.n >= 3).map((c: any) => ({
      cluster: c.cluster, level: clusterLevel(c.cluster), p: c.p,
    }));
    res.json({ code: 200, msg: "ok", data: { ...one, dimensions: dims, levels, kgraph: personalGraph } });
  },

  "GET /api/teacher/interactions": (req: any, res: any) => {
    const classId = req.query.class_id || classesData()[0].class_id;
    res.json({ code: 200, msg: "ok", data: interactionRecords(String(classId)) });
  },

  "GET /api/teacher/profile/student/evidence": (req: any, res: any) => {
    const { class_id: cid, student_id: sid } = req.query;
    const sources: string[] = req.query.sources ? String(req.query.sources).split(",") : [];
    const cluster = req.query.cluster || "";
    const one = read(`class-students-${cid}.json`).find((s: any) => s.student_id === sid);
    if (!one) return res.json({ code: 404, msg: "学生不存在", data: null });
    let ev = one.evidence || [];
    if (cluster) ev = ev.filter((e: any) => e.cluster === cluster);
    if (sources.length) ev = ev.filter((e: any) => sources.includes(e.source));
    res.json({ code: 200, msg: "ok", data: ev.slice(0, 40) });
  },
};

/** 知识点图谱：节点=全量知识点目录（≤本年级，knowledge.json），细粒度呈现；
 *  有学情数据的节点（大小=覆盖人数、填充=掌握度红→绿、红虚线圈=薄弱），
 *  无数据的为灰色小节点（未测/未学）；层=L1~L4；边=同章脉络(实线)+素养同源(虚线)。 */
function buildKnowledgeGraph(rows: any[], grade?: string) {
  const chapOf = (r: any) => (r.chapter || "").replace(/G\d+[上下]?\s*/, "");
  // 1) 全量目录：该年级及之前的所有章节知识点（目录序=章内脉络序）
  const kn = read("knowledge.json");
  const gOrder = ["g7", "g8", "g9"];
  const upto = Math.max(0, gOrder.indexOf(grade || "g8"));
  const catalog = new Map<string, { chapter: string; layer: number }>();
  for (const g of kn.grades) {
    if (gOrder.indexOf(g.grade) > upto) continue;
    for (const ch of g.chapters) {
      const chap = chapOf({ chapter: ch.chapter });
      ch.clusters.forEach((c: any, i: number) => {
        if (!catalog.has(c.cluster)) catalog.set(c.cluster, { chapter: chap, layer: i });
      });
    }
  }
  // 2) 学情数据；目录外出现过的知识点也补入
  const rowMap = new Map(rows.map((r: any) => [r.cluster, r]));
  for (const r of rows) {
    if (!catalog.has(r.cluster)) catalog.set(r.cluster, { chapter: chapOf(r), layer: 0 });
  }
  const nodes = [...catalog.entries()].map(([id, meta]) => {
    const r = rowMap.get(id);
    const hasData = !!r;
    const p = hasData ? Math.max(15, Math.min(95, Math.round(100 - (r.weak_pct || 0) * 2.2))) : 0;
    const hue = p * 1.05; // 15%→红 95%→绿
    return {
      id,
      chapter: meta.chapter,
      layer: meta.layer,
      level: clusterLevel(id),
      p: hasData ? p : 0,
      n: hasData ? (r.n_students || 30) : 0,
      weak: hasData && (r.weak_pct || 0) >= 25,
      nodata: !hasData,
      fill: hasData ? `hsl(${hue}, 62%, 46%)` : "#c8d2dc",
    };
  });
  const edges: { src: string; tgt: string; kind: string }[] = [];
  const byId = new Map(nodes.map((n: any) => [n.id, n]));
  // 同章相邻连边（章内脉络）
  const byChap = new Map<string, any[]>();
  nodes.forEach((n: any) => { (byChap.get(n.chapter) || byChap.set(n.chapter, []).get(n.chapter)!).push(n); });
  for (const list of byChap.values()) {
    for (let i = 0; i + 1 < list.length; i++) edges.push({ src: list[i].id, tgt: list[i + 1].id, kind: "chapter" });
  }
  // 跨章同素养主维连边（素养同源），限量避免糊
  const { clusterLiteracy } = require("./dimensions");
  const litGroups = new Map<string, any[]>();
  nodes.forEach((n: any) => {
    const [main] = clusterLiteracy(n.id);
    (litGroups.get(main) || litGroups.set(main, []).get(main)!).push(n);
  });
  for (const g of litGroups.values()) {
    for (let i = 0; i + 1 < g.length && i < 3; i++) {
      if (!byChap.has(g[i].id) || chapOf({ chapter: "" }) === "") { /* noop */ }
      edges.push({ src: g[i].id, tgt: g[i + 1].id, kind: "literacy" });
    }
  }
  return { nodes: nodes.map(({ id, chapter, layer, level, p, n, weak, nodata, fill }: any) => ({ id, chapter, layer, level, p, n, weak, nodata, fill })), edges: edges.filter((e) => byId.has(e.src) && byId.has(e.tgt)) };
}

/** B3 人机交互明细：该班学生与 AI 的问答记录（来源=人机交互 的证据聚合） */
function interactionRecords(classId: string) {
  try {
    const students = read(`class-students-${classId}.json`);
    const rows: any[] = [];
    for (const stu of students) {
      for (const ev of stu.evidence || []) {
        if (ev.source === "人机交互") {
          rows.push({
            student: stu.name,
            cluster: ev.cluster,
            time: ev.date,
            question: (ev.stem || "").slice(0, 60),
            correct: ev.correct,
          });
        }
      }
    }
    return rows.sort((a, b) => (b.time || "").localeCompare(a.time || "")).slice(0, 30);
  } catch { return []; }
}
