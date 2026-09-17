/** Shared evidence scope for the assistant and personal profile. Never extrapolate missing events. */
export const SOURCES = ["作业记录", "人机交互", "自主练习", "考试记录"];
export interface Scope { start_date: string; end_date: string; sources: string[]; cluster?: string }
export function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + "T12:00:00");
  return Number.isFinite(d.getTime()) && dateKey(d) === value;
}
export function normalizeScope(input: any = {}, defaultMonth = true): Scope {
  const today = dateKey();
  const start_date = String(input.start_date ?? (defaultMonth ? today.slice(0, 8) + "01" : ""));
  const end_date = String(input.end_date ?? (defaultMonth ? today : ""));
  if ((start_date && !validDate(start_date)) || (end_date && !validDate(end_date)) || (start_date && end_date && start_date > end_date)) throw new Error("日期范围无效，请给出有效的起止日期，开始日期不能晚于结束日期。");
  const raw = input.sources === undefined || input.sources === "" ? SOURCES : Array.isArray(input.sources) ? input.sources : String(input.sources).split(",");
  const sources = [...new Set<string>(raw)];
  if (!sources.length || sources.some(s => !SOURCES.includes(s))) throw new Error("请至少保留一个有效数据来源。");
  return { start_date, end_date, sources, cluster: String(input.cluster || "") };
}
export function scopedStudent(student: any, scope: Scope) {
  const evidence = (student.evidence || []).filter((e: any) => typeof e.correct === "boolean" && validDate(e.date) &&
    (!scope.start_date || e.date >= scope.start_date) && (!scope.end_date || e.date <= scope.end_date) &&
    scope.sources.includes(e.source) && (!scope.cluster || e.cluster.includes(scope.cluster)));
  const groups = new Map<string, any[]>();
  evidence.forEach((e: any) => groups.set(e.cluster, [...(groups.get(e.cluster) || []), e]));
  const cells = [...groups].map(([cluster, events]) => {
    const k = events.filter(e => e.correct).length, n = events.length, p = Math.round(k / n * 100);
    return { cluster, n, k, p, p_eff: p, band: n < 3 ? "证据不足" : p < 60 ? "待巩固" : p < 75 ? "练习中" : p < 90 ? "较熟练" : "已掌握", due: false,
      last_observed: events.map(e => e.date).sort().at(-1), wrong_qids: events.filter(e => !e.correct).map(e => e.qid) };
  }).sort((a, b) => a.p - b.p || b.n - a.n);
  const k = evidence.filter((e: any) => e.correct).length;
  return { ...student, evidence, cells, n_events: evidence.length, accuracy: evidence.length ? Math.round(k / evidence.length * 100) : null,
    weak_cnt: cells.filter(c => c.n >= 3 && c.p < 60).length, due_cnt: 0, cold_start: evidence.length < 3 ? "当前范围证据不足" : null,
    by_source: Object.fromEntries(scope.sources.map(s => [s, { n: evidence.filter((e: any) => e.source === s).length, has_ev: evidence.some((e: any) => e.source === s) }])),
    scope };
}
export const scopeLabel = (scope: Scope) => `${scope.start_date || "最早记录"} 至 ${scope.end_date || "最新记录"} · ${scope.sources.join("、")}${scope.cluster ? ` · ${scope.cluster}` : ""}`;
