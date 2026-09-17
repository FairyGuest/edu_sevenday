import { readTeacherFixture as read, memoizeMock } from "./fixtures";
import { tagQuestion } from "./questionTags";

export interface QuestionFilter {
  cluster?: string; clusters?: string[]; literacy?: string; difficulty?: string;
  form?: string; exclude_forms?: string[]; exclude_qids?: string[]; source_type?: string;
  total?: number; exclude_done?: boolean;
}
const cache = memoizeMock<any[]>(1);
export const questionCatalog = () => cache("all", () => read("questions.json").items.map(tagQuestion));
export function selectQuestions(filter: QuestionFilter, done: string[] = []) {
  const excluded = new Set([...(filter.exclude_qids || []), ...(filter.exclude_done ? done : [])]);
  return questionCatalog().filter(q => {
    const clusters = filter.clusters?.length ? filter.clusters : filter.cluster ? [filter.cluster] : [];
    return !excluded.has(q.qid) && (!clusters.length || clusters.some(c => q.cluster.includes(c))) &&
      (!filter.literacy || (Array.isArray(q.literacy) ? q.literacy.includes(filter.literacy) : q.literacy === filter.literacy)) &&
      (!filter.difficulty || q.difficulty_zh === filter.difficulty) &&
      (!filter.form || q.form === filter.form) && !(filter.exclude_forms || []).includes(q.form) &&
      (!filter.source_type || q.source_type === filter.source_type);
  });
}
export function validateQuestionFilter(f: any): QuestionFilter {
  const total = f.total === undefined ? 6 : Number(f.total);
  if (!Number.isInteger(total) || total < 1 || total > 30) throw new Error("题数应为 1 至 30 的整数，请调整题数。");
  for (const k of ["clusters", "exclude_forms", "exclude_qids"]) {
    if (f[k] !== undefined && (!Array.isArray(f[k]) || f[k].some((x: any) => typeof x !== "string"))) throw new Error("题目筛选条件无效。");
  }
  return { ...f, total };
}
