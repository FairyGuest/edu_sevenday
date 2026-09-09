/**
 * 教学设计（teach_plan）本地 mock（开发辅助，非系统功能）。
 * 覆盖：/design 页面表单链路 + 班级学情设置 + 教案列表 + SSE 教案生成（结构化：学案/习题/课件大纲）。
 * 仅 start:mock 模式生效（cogUrl=/api），生产构建不包含。
 */

import { pickPlanMd, pickStudyPlanMd } from "./teachPlanContent";

// 记录最近一次生成的小节（供学案生成复用章节语境）
let lastChapterName = "16.1 二次根式";

// 学段学科（Cascader：value/children）
const STAGE_SUBJECT = [
  {
    value: "初中",
    children: [
      { value: "数学" },
      { value: "语文" },
      { value: "英语" },
    ],
  },
  {
    value: "高中",
    children: [{ value: "数学" }],
  },
];

// 教材册别（第二级需带 doc_id/grade/volume 供章节加载）
const TEXTBOOKS = [
  {
    value: "人教版",
    children: [
      { value: "八年级下册", doc_id: "doc-pep-g8b", grade: "八年级", volume: "下册" },
      { value: "八年级上册", doc_id: "doc-pep-g8a", grade: "八年级", volume: "上册" },
    ],
  },
];

// 章节目录（TreeSelect：title/id/children），与学情画像的章节对齐
const CHAPTER_TREE = [
  {
    id: "ch16",
    title: "第16章 二次根式",
    children: [
      { id: "ch16-1", title: "16.1 二次根式" },
      { id: "ch16-2", title: "16.2 二次根式的乘除" },
      { id: "ch16-3", title: "16.3 二次根式的加减" },
    ],
  },
  {
    id: "ch12",
    title: "第12章 全等三角形",
    children: [
      { id: "ch12-1", title: "12.1 全等三角形" },
      { id: "ch12-2", title: "12.2 三角形全等的判定" },
    ],
  },
  {
    id: "ch14",
    title: "第14章 整式的乘法与因式分解",
    children: [
      { id: "ch14-2", title: "14.2 乘法公式" },
      { id: "ch14-3", title: "14.3 因式分解" },
    ],
  },
];

// 课型设置（classType + modules 提示）
const COURSE_TYPES = [
  { classType: "新授课", modules: [{ title: "适用", content: "新知识首次讲授" }] },
  { classType: "复习课", modules: [{ title: "适用", content: "章节复习与查漏补缺" }] },
  { classType: "习题课", modules: [{ title: "适用", content: "以练为主，讲练结合" }] },
];

// 班级学情四维选项（ClassStudyInfo 弹窗）
const LEARNING_INFO = [
  {
    key: "studies_degree", title: "学业程度",
    rates: [
      { title: "薄弱", tips: [{ title: "特征", content: "基础不牢，需放缓进度" }] },
      { title: "中等", tips: [{ title: "特征", content: "基础尚可，个别薄弱" }] },
      { title: "优秀", tips: [{ title: "特征", content: "基础扎实，可适当拓展" }] },
    ],
  },
  {
    key: "motivation_habit", title: "学习动机与习惯",
    rates: [
      { title: "被动", tips: [{ title: "特征", content: "依赖督促，需强引导" }] },
      { title: "一般", tips: [{ title: "特征", content: "能跟住节奏" }] },
      { title: "主动", tips: [{ title: "特征", content: "自主预习，探究意愿强" }] },
    ],
  },
  {
    key: "literacy_ability", title: "素养能力",
    rates: [
      { title: "待提升", tips: [{ title: "特征", content: "运算/表达待强化" }] },
      { title: "中等", tips: [{ title: "特征", content: "常规题型可独立完成" }] },
      { title: "较强", tips: [{ title: "特征", content: "迁移与建模能力好" }] },
    ],
  },
  {
    key: "class_learning_diff", title: "班级学习差异",
    rates: [
      { title: "分化明显", tips: [{ title: "特征", content: "两极差距大，宜分层设计" }] },
      { title: "分化一般", tips: [{ title: "特征", content: "整体差异可控" }] },
      { title: "较为均衡", tips: [{ title: "特征", content: "进度易于统一" }] },
    ],
  },
];

// 结构化教案（SSE 流式下发；三段结构对齐 PRD：学案/习题/课件大纲）
const PLAN_MD = `## 一、基本信息
- 课题：16.1 二次根式（人教版八年级下册）
- 课型：新授课 · 1课时
- 班级学情：中等 · 主动 · 较为均衡

## 二、学习目标
1. 理解二次根式的概念，明确被开方数的三重非负性；
2. 会求二次根式中字母的取值范围；
3. 经历从实际问题抽象出 $\\sqrt{a}\\ (a \\geq 0)$ 的过程，发展符号意识。

## 三、学案（推送给学生）
**课前预习**
1. 什么叫做二次根式？请举出两个例子。
2. $\\sqrt{a}$ 有意义需要满足什么条件？
**课中任务**
1. 判断下列各式是否为二次根式：$\\sqrt{5}$、$\\sqrt{-3}$、$\\sqrt[3]{8}$；
2. 当 $x$ 取何值时，$\\sqrt{x-2}$ 有意义？
**课后巩固**
1. 完成课本习题 16.1 第 1、2 题；
2. 思考：$\\sqrt{a^2}$ 一定等于 $a$ 吗？

## 四、习题（可直接布置作业）
| # | 题目 | 知识点 | 难度 |
| --- | --- | --- | --- |
| 1 | 求使 $\\sqrt{3-x}$ 有意义的 $x$ 取值范围 | 概念 | 易 |
| 2 | 化简 $\\sqrt{12}+\\sqrt{3}$ | 运算 | 中 |
| 3 | 若 $\\sqrt{x-1}+\\sqrt{y+2}=0$，求 $x+y$ | 非负性 | 中 |
| 4 | 已知 $y=\\sqrt{2-x}+\\sqrt{x-2}+3$，求 $xy$ | 非负性综合 | 难 |

## 五、课件大纲
1. 情境引入：面积与根式（对应学案课前 1）
2. 概念生成：二次根式定义与三重非负性
3. 辨析练习：判断二次根式
4. 例题精讲：字母取值范围两例
5. 课堂小结与作业布置

> 本教案已注入班级学情：二次根式（待巩固 31%，高频错因：计算错误 55%）、全等三角形判定（概念混淆 45%）。`;

// SSE：按 chunk 下发 markdown
// 学案 markdown（SSE 流式下发，含分层任务与公式）
export const STUDY_PLAN_MD = `## 16.1 二次根式 · 学案（学生版）

**学习目标**
1. 理解二次根式的概念，会判断 $\\sqrt{a}$ 有意义的条件；
2. 能求二次根式中字母的取值范围；
3. 初步体会"非负性"在求值问题中的应用。

**课前预习**
1. 什么叫做二次根式？请举出两个例子；
2. $\\sqrt{a}$ 有意义需要满足什么条件？
3. 口答：$\\sqrt{5}$、$\\sqrt{0}$、$\\sqrt{-3}$ 中有意义的是哪些？

**课中任务**
1. 判断下列各式是否为二次根式：$\\sqrt{5}$、$\\sqrt{-3}$、$\\sqrt[3]{8}$；
2. 当 $x$ 取何值时，$\\sqrt{x-2}$ 有意义？
3. 例题：若 $\\sqrt{x-1}+\\sqrt{y+2}=0$，求 $x+y$ 的值。

**分层任务**
- 基础任务（必做）：课本习题 16.1 第 1、2 题；
- 提高任务（选做）：已知 $y=\\sqrt{2-x}+\\sqrt{x-2}+3$，求 $xy$ 的值；
- 挑战任务（选做）：思考 $\\sqrt{a^2}$ 一定等于 $a$ 吗？举例说明。

**课后巩固**
完成配套练习"二次根式概念 10 题"（系统已按你的薄弱点个性化推荐）。`;

function streamMarkdown(res: any, md: string, editMode = false) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  const send = (obj: any) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  send({ __action: "start" });
  const text = editMode ? `好的，已按要求调整：\n\n- 强化了**分层任务**的描述；\n- 习题部分保持 4 题结构不变。\n\n如需继续调整，请直接告诉我。` : md;
  const size = 220;
  for (let i = 0; i < text.length; i += size) {
    send({ __action: "stream", data: text.slice(i, i + size) });
  }
  send({ __action: "end" });
  res.end();
}

export default {
  // ===== 表单链路 =====
  "GET /api/teach_plan/xueduan_xueke": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: STAGE_SUBJECT });
  },

  "GET /api/teach_plan/banben_ceci": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: TEXTBOOKS });
  },

  "GET /api/docs_content/docs_node_tree": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: CHAPTER_TREE });
  },

  "GET /api/teach_plan/course_type": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: COURSE_TYPES });
  },

  "GET /api/teach_plan/user_context": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: {} });
  },

  "POST /api/teach_plan/learning_info": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: LEARNING_INFO });
  },

  "POST /api/teach_plan/class_type": (req: any, res: any) => {
    const degree = req.body?.studies_degree || "中等";
    const map: Record<string, string> = { 薄弱: "基础巩固班型", 中等: "均衡发展班型", 优秀: "拓展提升班型" };
    res.json({
      code: 200, msg: "ok",
      data: { classType: map[degree] || "均衡发展班型", content: `基于所选学情（${degree}）推荐的班型策略` },
    });
  },

  // ===== 教案列表 =====
  "GET /api/teach_plan/teach_plan_history/list": (_req: any, res: any) => {
    res.json({
      code: 200, msg: "ok",
      data: {
        list: [
          { id: "tp-001", title: "16.1 二次根式", created_at: "2026-09-08 10:20", type: "课时教案" },
          { id: "tp-002", title: "16.2 二次根式的乘除", created_at: "2026-09-08 11:05", type: "课时教案" },
          { id: "tp-003", title: "16.3 二次根式的加减", created_at: "2026-09-07 16:30", type: "课时教案" },
          { id: "tp-004", title: "12.1 全等三角形", created_at: "2026-09-07 09:15", type: "课时教案" },
          { id: "tp-005", title: "12.2 三角形全等的判定", created_at: "2026-09-06 15:41", type: "课时教案" },
          { id: "tp-006", title: "14.2 乘法公式", created_at: "2026-09-05 14:20", type: "课时教案" },
          { id: "tp-007", title: "14.3 因式分解", created_at: "2026-09-05 15:10", type: "课时教案" },
        ],
        total: 7,
      },
    });
  },

  // ===== 教案提示词模板（自然语言修改的快捷指令）=====
  "POST /api/teach_plan/get_teach_prompt_template": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: [
      { categoryName: "课堂互动", templates: [
        { title: "增加课堂提问", promptText: "在关键知识点讲解处增加2-3个课堂提问，并给出参考答案与追问引导" },
      ] },
      { categoryName: "分层设计", templates: [
        { title: "增加分层任务", promptText: "为基础薄弱和学有余力的学生分别设计分层任务与拓展任务" },
      ] },
      { categoryName: "评价环节", templates: [
        { title: "完善评价环节", promptText: "补充课堂评价量表与课后作业评价标准，体现教学评一致性" },
      ] },
      { categoryName: "习题调整", templates: [
        { title: "更换习题", promptText: "把习题部分更换为更贴近生活情境的题目，并保持原有难度梯度" },
      ] },
    ] });
  },

  // ===== 教案对话列表（生成后回显；携带 chat_history 的问答时间线）=====
  "POST /api/teach_plan/get_temp_teach_plan_chat": (req: any, res: any) => {
    const b = req.body || {};
    const chapterName = b.chapter_name || b.title || lastChapterName;
    const planMd = pickPlanMd(chapterName, { classType: b.class_type });
    res.json({ code: 200, msg: "ok", data: [
      {
        id: "chat-init",
        role: "assistant",
        content_type: "md",
        content: { end: { status: "success", chat_content: planMd } },
      },
    ] });
  },

  "POST /api/teach_plan/temp_child_teach_plan_chat": (req: any, res: any) => {
    const b = req.body || {};
    const planMd = pickPlanMd(b.chapter_name || lastChapterName, {});
    res.json({ code: 200, msg: "ok", data: [
      { id: "chat-child", role: "assistant", content_type: "md",
        content: { end: { status: "success", chat_content: planMd } } },
    ] });
  },

  // ===== SSE 教案生成（结构化：学案/习题/课件大纲）=====
  "POST /api/teach_plan/teach_maker": (req: any, res: any) => {
    // 携带 chat 内容视为打磨修改，否则首次生成
    const isChat = !!(req.body?.chat || req.body?.content || req.body?.message);
    const b = req.body || {};
    const ctx = [b.studies_degree, b.motivation_habit, b.class_learning_diff].filter(Boolean).join(" · ");
    // 按所选章节/小节挑选结构化模板（每节有专属内容）
    const chapterName = b.chapter_name || b.title || lastChapterName;
    if (!isChat) lastChapterName = chapterName;
    const md = pickPlanMd(chapterName, { classType: b.class_type, studyCtx: ctx || undefined });
    streamMarkdown(res, md, isChat);
  },

  "POST /api/teach_plan/single_teach_maker": (req: any, res: any) => {
    const md = pickPlanMd(req.body?.chapter_name || lastChapterName, {});
    streamMarkdown(res, md, !!(req.body?.chat || req.body?.content));
  },

  // ===== SSE 学案生成 =====
  "POST /api/teach_plan/single_study_plan_maker": (req: any, res: any) => {
    const isChat = !!(req.body?.chat || req.body?.content);
    streamMarkdown(res, pickStudyPlanMd(lastChapterName), isChat);
  },

  // 学案历史详情（保存后查看）
  "GET /api/teach_plan/study_plan_history/:id": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: {
      id: _req.params.id, status: 1,
      chat_history: [
        { role: "assistant", content: STUDY_PLAN_MD },
      ],
    } });
  },
};
