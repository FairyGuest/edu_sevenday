/**
 * v2.0-I3 ActionRegistry · 小助手动作白名单（页面建议卡与对话确认卡共用）。
 * 只读动作返回导航目标，由常驻助手统一切页，保留当前对话。
 * 助手内的组卷建议进入对话任务，发布需核对具体草稿后确认。
 * 直接调用组卷动作的兼容路径仍调用 mock 推荐引擎，仅生成待发布草稿。
 */
import { history } from "@umijs/max";

export interface AssistantAction {
  key: string;
  label?: string;
  params?: Record<string, any>;
}
export interface NavTarget { pathname: string; search?: string }

/** 动作元信息（供 mock /api/assistant/chat 的 system 提示与前端确认卡展示） */
export const ACTION_META: { key: string; label: string; desc: string; write: boolean }[] = [
  { key: "open_homework", label: "查看作业", desc: "打开指定作业预览", write: false },
  { key: "inject_teaching_design", label: "注入教学设计", desc: "把当前班级学情画像带入教学设计页", write: false },
  { key: "filter_question_bank", label: "筛选题目", desc: "按素养/知识点预置筛选条件并跳转题库", write: false },
  { key: "personalized_paper", label: "生成个性化作业", desc: "按四方针为全班生成每人一单（需确认）", write: true },
  { key: "assign_homework", label: "布置作业", desc: "生成个性化作业并跳转作业组卷下发（需确认）", write: true },
  { key: "view_student_profile", label: "查看个人学情", desc: "切到个人学情页查看某学生画像", write: false },
];

const STRATEGY_RANGES: Record<string, Record<string, [number, number]>> = {
  weak: { weak: [2, 3], variant: [1, 2], review: [1, 2] },
  variant: { variant: [2, 3], weak: [1, 2], review: [1, 2] },
  review: { review: [3, 4], weak: [1, 2] },
  challenge: { challenge: [1, 1], weak: [2, 3], variant: [1, 2] },
};

/** 执行动作。ctx: { dispatch } 由组件传入；返回执行结果描述与跳转目标。 */
export async function runAction(
  action: AssistantAction,
  ctx: { dispatch: (a: any) => void },
): Promise<{ ok: boolean; detail: string; navigateTo?: NavTarget }> {
  const { key, params = {} } = action;
  const meta = ACTION_META.find((m) => m.key === key);

  if (key === "inject_teaching_design") {
    const cid = params.class_id || "";
    if (params.assistant_draft) ctx.dispatch({ type: "assistantModel/updateState", res: { teachingDraft: String(params.assistant_draft) } });
    return {
      ok: true, detail: "已跳转教学设计页，班级学情已带入预览卡",
      navigateTo: { pathname: "/design", search: `?${new URLSearchParams({ class_id: String(cid), from: "analysis" })}` },
    };
  }

  if (key === "filter_question_bank") {
    // 经模型内合并（applyAssistantFilter）：助手不订阅题库状态，避免列表翻页重渲染助手
    const patch: Record<string, any> = {};
    if (params.literacy) patch.filters = { literacies: [params.literacy] };
    if (params.source_type) patch.filters = { ...(patch.filters || {}), scenes: [params.source_type] };
    if (params.cluster) patch.searchText = params.cluster;
    ctx.dispatch({ type: "resourceSearchModel/applyAssistantFilter", payload: patch });
    // 已在 /source 时（如从知识图谱 Tab 触发）需切回公共题库 Tab 才能看到筛选结果
    if (history.location.pathname === "/source") {
      ctx.dispatch({ type: "resourceSearchModel/setData", payload: { activeTab: "public" } });
    }
    return {
      ok: true,
      detail: params.literacy
        ? `已打开题库并预置「${params.literacy}」素养筛选`
        : params.source_type
          ? `已打开题库并筛选来源类别「${params.source_type}」`
          : params.cluster
            ? `已打开题库并按「${params.cluster}」检索`
            : "已打开题库筛选",
      navigateTo: { pathname: "/source" },
    };
  }

  if (key === "personalized_paper" || key === "assign_homework") {
    const strategy: "weak" | "variant" | "review" | "challenge" = STRATEGY_RANGES[params.strategy] ? params.strategy : "weak";
    const classId = params.class_id;
    try {
      const r = await fetch("/api/teacher/recommend/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...params, class_id: classId, ranges: STRATEGY_RANGES[strategy], total: params.total ?? 6 }),
      });
      const j = await r.json();
      const hw = j?.data;
      if (j?.code !== 200 || !hw?.homework_id) throw new Error(j?.msg || "生成失败");
      return {
        ok: true,
        navigateTo: { pathname: "/paperCompose" },
        detail: `已生成个性化作业 **${hw.homework_id}**（${hw.summary?.n_students} 名学生 · 每人 ${hw.summary?.q_count?.max || 6} 题，方针：${{ weak: "薄弱补弱", variant: "错题变式", review: "遗忘复习", challenge: "选做挑战" }[strategy]}），已打开作业组卷页，可在其中预览与发布`,
      };
    } catch (e: any) {
      return { ok: false, detail: `生成失败：${e?.message || "接口异常"}` };
    }
  }

  if (key === "open_homework") return { ok: true, detail: "已打开指定作业", navigateTo: { pathname: "/paperCompose", search: "?tab=personalized&homework_id=" + encodeURIComponent(params.homework_id || "") } };
  if (key === "view_student_profile") {
    const sid = params.student_id || "";
    const query = new URLSearchParams({ tab: "personal" });
    if (sid) query.set("student_id", String(sid));
    if (params.class_id) query.set("class_id", String(params.class_id));
    for (const field of ["start_date", "end_date", "sources", "cluster"]) {
      if (params[field] !== undefined) query.set(field, String(params[field]));
    }
    if ((history.location.pathname || "") !== "/learning-analysis" || params.class_id) {
      return {
        ok: true, detail: "已切换到个人学情页",
        navigateTo: { pathname: "/learning-analysis", search: `?${query}` },
      };
    }
    ctx.dispatch({
      type: "analysisModel/updateState",
      res: { currentAnalysisTab: "personal", personalStudentId: sid || null },
    });
    return { ok: true, detail: "已切换到个人学情页" };
  }

  return { ok: false, detail: `未知动作：${key}${meta ? "" : "（不在白名单）"}` };
}
