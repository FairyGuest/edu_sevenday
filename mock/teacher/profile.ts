/**
 * 教师端 · 学情画像 mock（开发辅助，非系统功能；消费 mock/teacher/data fixture）。
 * 接口：GET /api/teacher/classes | profile/class | profile/student | profile/student/evidence
 * 仅 start:mock 模式生效（cogUrl=/api），生产构建不包含。
 */
import * as fs from "fs";
import * as path from "path";

const D = path.join(__dirname, "data");
const read = (f: string): any => JSON.parse(fs.readFileSync(path.join(D, f), "utf-8"));
const BANDS = ["待巩固", "练习中", "较熟练", "已掌握"];
const ALL_SOURCES = ["作业", "会话", "自主练习", "导入"];

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
    const prof = read(`class-profile-${classId}.json`);
    const studentsFile = read(`class-students-${classId}.json`);
    res.json({ code: 200, msg: "ok", data: mergeProfile(prof, studentsFile, sources) });
  },

  "GET /api/teacher/profile/student": (req: any, res: any) => {
    const { class_id: cid, student_id: sid } = req.query;
    const one = read(`class-students-${cid}.json`).find((s: any) => s.student_id === sid);
    if (!one) return res.json({ code: 404, msg: "学生不存在", data: null });
    res.json({ code: 200, msg: "ok", data: one });
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
