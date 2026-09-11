/**
 * D1 启发式生成 · AI 引导服务（mock 侧代理）。
 * AI 凭证仅存在于 dev server（umi mock 在 node 侧执行），不会进入前端 bundle；
 * 支持环境变量覆盖：ZHIPU_API_KEY / ZHIPU_MODEL。
 * 协议：智谱开放平台 Anthropic 兼容端点。
 * 设计：两阶段——① AI 向教师提问（澄清教学意图）→ ② 教师回答后 AI 规划教案各模块内容方向。
 * 稳定性：AI 不可用/超时/解析失败时，回退确定性模板，保证流程始终可走通。
 */

const API_URL = "https://open.bigmodel.cn/api/anthropic/v1/messages";
const API_KEY = process.env.ZHIPU_API_KEY || "4139bc2c59ec42a5ad3cd13f14cca4bf.iWELzeqxnJX9MMjg";
const MODEL = process.env.ZHIPU_MODEL || "glm-4.6";

async function askAI(system: string, user: string, maxTokens = 1200): Promise<string | null> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        authorization: `Bearer ${API_KEY}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        // glm 默认开启 thinking，会吃掉 max_tokens 并拖慢响应；引导问答场景关闭
        thinking: { type: "disabled" },
        system,
        messages: [{ role: "user", content: user }],
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return null;
    const d: any = await res.json();
    const text = (d?.content || []).map((c: any) => c?.text).filter(Boolean).join("\n");
    return text || null;
  } catch {
    return null;
  }
}

function extractJSON<T>(text: string | null): T | null {
  if (!text) return null;
  try { return JSON.parse(text) as T; } catch {}
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) { try { return JSON.parse(m[1]) as T; } catch {} }
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s >= 0 && e > s) { try { return JSON.parse(text.slice(s, e + 1)) as T; } catch {} }
  return null;
}

// ===== 类型 =====
interface GuideQuestion { id: string; question: string; hint?: string; options: string[] }
interface GuideModule { key: string; title: string; direction: string; points: string[] }
const MODULE_KEYS = [
  { key: "learning_goals", title: "学习目标" },
  { key: "study_tasks", title: "学案任务" },
  { key: "exercises", title: "习题配置" },
  { key: "courseware", title: "课件大纲" },
];

// ===== 阶段①：AI 提问 =====
const Q_SYSTEM = `你是资深的初中数学教研专家，正在通过"启发式提问"帮助老师打磨教学设计。
你的任务：基于章节内容与班级学情，提出 3 个最关键的教学设计澄清问题，
聚焦三类意图：①目标侧重（概念辨析/运算熟练/综合应用）②学情应对（薄弱补强/分层设计）③习题策略（题量/难度梯度/情境化）。
每个问题必须给出 2-3 个具体可选方向（老师也可自由作答），问题要具体到本章知识，不要泛泛而谈。
严格只输出 JSON，格式：
{"questions":[{"id":"q1","question":"...","hint":"一句话说明为什么问这个","options":["方向A","方向B","方向C"]}]}
不要输出 JSON 以外的任何文字。`;

// ===== 阶段②：AI 规划模块 =====
const P_SYSTEM = `你是资深的初中数学教研专家。老师已通过引导问答确认了教学意图，
请据此为教案的四个模块分别规划"内容方向"：
learning_goals=学习目标、study_tasks=学案任务（含分层）、exercises=习题配置、courseware=课件大纲。
要求：direction 为一句话方向（30 字内），points 为 2-4 条具体要点（每条 20 字内，可执行）。
规划必须呼应老师的回答，不得输出与本章无关的泛化内容。
严格只输出 JSON，格式：
{"modules":[{"key":"learning_goals","title":"学习目标","direction":"...","points":["...","..."]}]}
不要输出 JSON 以外的任何文字。`;

// ===== 确定性回退（离线/超时保底）=====
function fallbackQuestions(chapter: string, weak: string): GuideQuestion[] {
  const topic = chapter || "本章";
  return [
    {
      id: "q1",
      question: `${topic}的教学目标更侧重哪个方向？`,
      hint: "决定学习目标与课件重心",
      options: ["概念辨析为主（定义/条件/易混点）", "运算熟练为主（化简/求解训练）", "综合应用为主（建模/证明/迁移）"],
    },
    {
      id: "q2",
      question: `班级薄弱点（如${weak}）如何在课堂中应对？`,
      hint: "决定学案任务的分层设计",
      options: ["课前补弱铺垫 + 课中基础巩固", "分层任务：必做/选做/挑战", "错题变式专项突破"],
    },
    {
      id: "q3",
      question: "习题配置偏好？",
      hint: "决定习题模块的量与梯度",
      options: ["少而精（4 题递进）", "标准配置（6 题含分层）", "情境化优先（贴近生活场景）"],
    },
  ];
}

function fallbackPlan(answers: Record<string, string>): GuideModule[] {
  const a1 = answers.q1 || "";
  const a2 = answers.q2 || "";
  const a3 = answers.q3 || "";
  return MODULE_KEYS.map(({ key, title }) => {
    if (key === "learning_goals") {
      const focus = a1.includes("概念") ? "概念辨析" : a1.includes("运算") ? "运算熟练" : "综合应用";
      return { key, title, direction: `以「${focus}」为核心目标`, points: [`掌握${focus}相关的核心知识`, "能独立完成对应层级任务", "形成规范的表达与书写"] };
    }
    if (key === "study_tasks") {
      const layered = a2.includes("分层") || a2.includes("挑战");
      return { key, title, direction: layered ? "三档分层任务，学生自主选做" : "补弱铺垫 + 课中巩固", points: ["课前预习任务（基础）", layered ? "提高/挑战任务（选做）" : "课中例题精练", "课后巩固（个性化推荐）"] };
    }
    if (key === "exercises") {
      const few = a3.includes("少而精");
      const situational = a3.includes("情境");
      return { key, title, direction: few ? "少而精的递进式 4 题" : situational ? "情境化题目优先" : "标准配置含分层", points: [few ? "基础 1 题 + 进阶 3 题" : "基础 2 + 提高 2 + 挑战 2", "难度梯度 易→难", "覆盖本章高频考点"] };
    }
    return { key, title, direction: "按课堂节奏组织课件", points: ["情境导入（对应学情）", "例题精讲与辨析", "小结与分层作业布置"] };
  });
}

export default {
  // 阶段①：生成引导问题（AI 优先，失败回退）
  "POST /api/ai/guide/questions": async (req: any, res: any) => {
    const b = req.body || {};
    const ctx = `章节：${b.chapter || "未指定"}\n课型：${b.class_type || "新授课"}\n班级学情：${[b.studies_degree, b.motivation_habit, b.class_learning_diff].filter(Boolean).join(" · ") || "未提供"}\n薄弱点：${b.weak_note || "未提供"}`;
    const text = await askAI(Q_SYSTEM, `背景信息：\n${ctx}\n\n请生成 3 个引导问题。`);
    const parsed = extractJSON<{ questions: GuideQuestion[] }>(text);
    const questions = parsed?.questions?.filter(q => q?.question && Array.isArray(q.options))?.slice(0, 4);
    res.json({
      code: 200, msg: "ok",
      data: { questions: questions?.length ? questions : fallbackQuestions(b.chapter, b.weak_note || "计算类"), source: questions ? "ai" : "fallback" },
    });
  },

  // 阶段②：根据回答规划模块（AI 优先，失败回退）
  "POST /api/ai/guide/plan": async (req: any, res: any) => {
    const b = req.body || {};
    const qa = Object.entries(b.answers || {}).map(([id, a]) => `Q${id}: ${a}`).join("\n");
    const text = await askAI(P_SYSTEM, `章节：${b.chapter || "未指定"}\n班级学情：${b.study_ctx || "未提供"}\n\n老师的回答：\n${qa}\n\n请规划四个模块。`);
    const parsed = extractJSON<{ modules: GuideModule[] }>(text);
    const valid = parsed?.modules?.filter(m => MODULE_KEYS.some(k => k.key === m.key) && m.direction);
    const modules = valid?.length === 4
      ? valid.map(m => ({ ...m, points: Array.isArray(m.points) ? m.points.slice(0, 4) : [] }))
      : fallbackPlan(b.answers || {});
    res.json({ code: 200, msg: "ok", data: { modules, source: valid?.length === 4 ? "ai" : "fallback" } });
  },
};
