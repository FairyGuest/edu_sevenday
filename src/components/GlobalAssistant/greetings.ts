import type { AssistantAction } from "./actions";

export interface AssistantPage { route: string; title: string; summary: string; data: Record<string, any> }
export interface QuickEntry { label: string; query?: string; action?: AssistantAction }
export interface PageGreeting {
  key: string; title: string; text: string; quick: QuickEntry[]; page: AssistantPage;
  ready: boolean; suggestions?: { class_id: string; student_id?: string };
}
const query = (label: string, text: string = label): QuickEntry => ({ label, query: text });
const action = (label: string, key: string, params: Record<string, any> = {}): QuickEntry => ({ label, action: { label, key, params } });

/** Identity follows the page/target, never filters, summaries or request completion. */
export function getPageGreeting(pathname: string, search: string, context: any, analysis: any, resourceTab = "public"): PageGreeting {
  const params = new URLSearchParams(search);
  const isAnalysis = ["/learning-analysis", "/interact/analysis"].includes(pathname);
  const tabParam = params.get("tab") || "profile";
  const tab = ["profile", "personal", "kgraph", "homework"].includes(tabParam) ? tabParam : "profile";
  const classId = params.get("class_id") || analysis?.selectedClass?.value || "";
  const studentId = tab === "personal" ? params.get("student_id") || "" : "";
  let validContext = context?.route === pathname || (isAnalysis && context?.route === "/learning-analysis");
  if (isAnalysis) validContext = validContext && context?.data?.class_id === classId &&
    (tab === "personal" ? !!studentId && context?.data?.student_id === studentId :
      !context?.data?.student_id && (tab === "kgraph" ? context?.data?.graphKind === "mastery" : tab === "profile" && !context?.data?.graphKind));
  if (pathname === "/source") validContext = validContext && resourceTab === "kgraph" && context?.data?.graphKind === "catalog";
  const data = { ...(validContext ? context.data : {}), ...(classId ? { class_id: classId } : {}), ...(studentId ? { student_id: studentId } : {}) };
  if (isAnalysis) for (const field of ["start_date", "end_date", "sources", "cluster"]) {
    if (params.has(field)) data[field] = params.get(field);
  }
  const page: AssistantPage = { route: pathname, title: "教师工作台", summary: validContext ? context.summary || "" : "", data };
  const g: PageGreeting = { key: pathname, title: "教师工作台", text: "你好，我是小七。可以告诉我你正在准备的教学任务，我们一起完成。", quick: [query("小七可以帮我做什么？")], page, ready: true };
  const graphQuick = [query("图谱怎么看？", "这个图谱怎么看"), query("解释「二次根式」", "解释一下二次根式"), action("找数学抽象的题", "filter_question_bank", { literacy: "数学抽象" })];
  if (isAnalysis) {
    g.key += ":" + tab + ":" + classId + ":" + studentId;
    g.ready = !!classId && !analysis?.classSelectionLoading && (tab !== "personal" || !!validContext);
    const className = classId === analysis?.selectedClass?.value ? analysis?.selectedClass?.label : "";
    if (tab === "personal") {
      g.title = validContext ? context.title.replace(/^学情分析 · /, "") : "个人学情";
      g.text = "这里是" + g.title + "。可以先查看学情建议、解释薄弱知识点，或把学情带入备课。";
      g.quick = [query("查看该生学情", "查看当前页学生" + (studentId || "") + "的学情"), action("带入教学设计", "inject_teaching_design", { class_id: classId }), query("解释「二次根式」", "解释一下二次根式")];
      if (classId && studentId) g.suggestions = { class_id: classId, student_id: studentId };
      if (!studentId) { g.text = "这里是个人学情。先在左侧选择学生，就能查看该生的画像与建议。也可以直接告诉我学生姓名。"; g.quick = [query("如何看个人学情？")]; }
    } else if (tab === "kgraph") {
      g.title = "学情知识图谱"; g.text = "这里可以查看知识点的掌握分布。可以先把班级学情注入教学设计，再围绕薄弱知识点找题或备课。";
      g.quick = [action("注入班级学情到教学设计", "inject_teaching_design", { class_id: classId }), ...graphQuick];
    } else if (tab === "homework") {
      g.title = "作业分析"; g.text = "这里是作业分析。可以查看作业情况，或讨论错因与讲评安排。";
      g.quick = [query("查看作业情况", "查看当前班级的作业情况"), query("如何安排作业讲评？")];
    } else {
      g.title = "班级学情"; g.text = "你好，我是小七。这里是" + (className ? className + "的" : "") + "班级学情。可以先将班级学情注入教学设计，针对共性薄弱点备课，也可以继续查看学情或生成补弱练习。";
      g.quick = [action("注入班级学情到教学设计", "inject_teaching_design", { class_id: classId }), query("查看班级学情", "查看当前页班级学情"), action("生成补弱练习", "personalized_paper", { class_id: classId, strategy: "weak" })];
      if (classId) g.suggestions = { class_id: classId };
    }
  } else if (pathname === "/source") {
    g.key += ":" + resourceTab;
    if (resourceTab === "kgraph") {
      g.title = "资源知识图谱"; g.text = "这里是学科知识图谱。可以查看知识点的前后联系，也可以让我解释概念、查找相关题目。"; g.quick = graphQuick;
    } else if (["lesson-plans", "courseware"].includes(resourceTab)) {
      g.title = resourceTab === "lesson-plans" ? "教案资源" : "课件资源";
      g.text = "这里是" + g.title + "。可以浏览适用内容，再让我协助梳理教学目标、设计提问或调整教学活动。";
      g.quick = [query("如何挑选适合的教学资源？"), query("设计二次根式的课堂导入", "为二次根式设计一段课堂导入，给出例子和提问")];
    } else {
      g.title = resourceTab === "personal" ? "个人题库" : "资源平台";
      g.text = "来到" + g.title + "了。可以先按素养、知识点和来源找题，也可以让我解释筛选标签。";
      g.quick = [action("找「数学抽象」题", "filter_question_bank", { literacy: "数学抽象" }), action("找「逻辑推理」题", "filter_question_bank", { literacy: "逻辑推理" }), action("看真题", "filter_question_bank", { source_type: "真题" }), action("看同步练习", "filter_question_bank", { source_type: "同步练习" }), query("解释标签体系", "解释一下资源平台题库的筛选标签体系")];
    }
  } else if (pathname.startsWith("/design")) {
    g.title = "教学设计"; g.text = "开始备课吧。可以先带入班级学情，再确定教学目标、重难点和课堂活动；已有草稿也可以继续讨论修改。";
    g.quick = [action("带入班级学情", "inject_teaching_design", { class_id: classId }), query("教学设计怎么开始？", "如何用教学设计页面准备一节课？"), query("怎样设计分层提问？")];
  } else if (pathname.startsWith("/paperCompose")) {
    g.key += ":" + (params.get("tab") || "normal") + ":" + (params.get("homework_id") || "");
    g.title = "作业组卷"; g.text = "这里可以统一组卷，也可以按学生学情生成每人一单。先生成和预览草稿，再调整题目与下发安排。";
    g.quick = [action("生成薄弱补弱作业", "personalized_paper", { class_id: classId, strategy: "weak" }), action("生成遗忘复习作业", "personalized_paper", { class_id: classId, strategy: "review" }), query("如何选择组卷策略？")];
  } else if (pathname.startsWith("/setTopic")) {
    g.title = "作业下发"; g.text = "这里是作业下发。先核对作业内容、接收学生和截止时间，再完成发布。";
    g.quick = [query("查看作业情况", "查看作业情况"), query("如何发布作业？")];
  } else if (pathname.startsWith("/teach/correction")) {
    g.title = "作业批改"; g.text = "这里是作业批改。可以查看作答与批改结果，也可以和我讨论评分依据、错因和反馈措辞。";
    g.quick = [query("如何写有帮助的批改反馈？"), query("如何区分计算错误与概念错误？")];
  } else if (pathname.startsWith("/teach/course")) {
    g.title = "课程资源"; g.text = "这里可以管理课程和教学材料。可以让我协助安排课堂环节，或设计配套的讨论问题。";
    g.quick = [query("如何组织一节课的教学材料？"), query("如何设计课堂检查问题？")];
  }
  if (!isAnalysis && !pathname.startsWith("/paperCompose")) g.key += ":" + (params.get("id") || params.get("course_id") || "");
  page.title = g.title;
  return g;
}
