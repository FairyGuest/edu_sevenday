export const DESIGN_FIELDS: Record<string, string> = {
  knowledge: "知识与前置基础",
  experience: "学习与生活经验",
  habits: "学习习惯",
  strategies: "学习策略",
  collaboration: "协作及个体贡献",
  situation: "真实问题情境",
  task: "任务与预期产出",
  assessment: "评价证据与达成条件",
};
const array = (v: any): any[] => (Array.isArray(v) ? v : []);
export function createDesignDraft({
  learning,
  unit,
  lesson,
  chapterName,
}: any): Record<string, string> {
  const title = lesson?.title || unit?.title || chapterName || "本次教学内容";
  const background = array(learning?.learner_contexts).filter(
    (c) => c.source !== "unknown",
  );
  const collect = (pattern: RegExp, empty: string) => {
    const rows = background.filter((c) => pattern.test(c.aspect)).slice(0, 3);
    return rows.length
      ? rows
          .map(
            (c) =>
              `${c.name}：${c.content}（${c.recorded_at || "日期未记录"}，${c.source === "self_report" ? "自述" : "观察"}）`,
          )
          .join("\n") + "\n以上为部分学生的独立背景资料，不代表全班或本节结论。"
      : empty;
  };
  const step = (key: string) =>
    array(lesson?.steps)
      .filter((s) => s.step_key === key)
      .flatMap((s) => array(s.draft))
      .join("\n");
  const knowledge = array(learning?.knowledge)
    .slice()
    .sort((a, b) => a.value - b.value)
    .slice(0, 3);
  const evidence = learning?.coverage?.events
    ? `${learning.effective_scope?.label || "当前范围"}：${learning.coverage.events}条有效记录，覆盖${learning.coverage.students}/${learning.coverage.total_students}人。\n${knowledge.map((k) => `${k.name}：任务得分率${k.value}%，${k.events}条记录`).join("；")}${knowledge.length ? "。任务得分率不等同于素养等级。" : "当前没有可计算的知识任务得分。"}`
    : "当前范围尚无可用学情证据，暂不判断学生掌握水平。建议以导入任务核对前置基础。";
  const goals = array(unit?.unit_goals)
    .map((g) => g.behavior)
    .filter(Boolean);
  return {
    knowledge: evidence,
    experience: collect(
      /经验|情境/,
      "尚未采集相关生活经验；可在导入时核对学生对情境的熟悉程度。",
    ),
    habits: collect(/习惯|练习条件/, "尚未采集学习习惯，不由题目正误推断。"),
    strategies: collect(
      /策略|方法/,
      "建议先独立尝试，再比较方法，并保留学生说明依据的过程。",
    ),
    collaboration: collect(
      /协作|合作|贡献/,
      "尚无明确的个体贡献资料；小组任务中可保留分工与个人解释。",
    ),
    situation:
      step("situation") ||
      step("scenario") ||
      `围绕“${title}”设置可比较的实际问题，呈现必要数据与约束，让学生提出需要解决的数学问题。`,
    task:
      step("tasks") ||
      (goals.length
        ? goals.map((g, i) => `${i + 1}. ${g}；保留解题步骤与依据。`).join("\n")
        : `围绕“${title}”依次完成独立尝试、方法比较与变式应用，产出包含理由的解答。`),
    assessment:
      step("assessment") ||
      "结合任务产出核对概念、方法与解释；通过变式任务检查迁移。缺少过程证据时保留待确认，不只依据最终答案判断。",
  };
}
export function parseDesignDraft(answer: string): Record<string, string> {
  const raw = JSON.parse(
    answer
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, ""),
  );
  const fields = Object.fromEntries(
    Object.keys(DESIGN_FIELDS)
      .filter(
        (key) =>
          typeof raw?.[key] === "string" &&
          raw[key].trim() &&
          raw[key].length <= 3000,
      )
      .map((key) => [key, raw[key].trim()]),
  );
  if (!Object.keys(fields).length) throw new Error("摘要格式无效");
  return fields;
}
export function mergeDesignDraft(
  base: Record<string, string>,
  overrides: Record<string, string> = {},
) {
  return Object.fromEntries(
    Object.keys(DESIGN_FIELDS).map((key) => [
      key,
      Object.prototype.hasOwnProperty.call(overrides, key)
        ? overrides[key]
        : base[key] || "",
    ]),
  );
}
