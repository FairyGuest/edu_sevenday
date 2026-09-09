/**
 * 学情分析页配套 mock（开发辅助，非系统功能）。
 * 消费 mock/teacher/data fixture，与 teacher/profile.ts 的班级数据保持同一套 ID。
 * 仅 start:mock 模式生效（cogUrl=/api），生产构建不包含本文件。
 *
 * 契约来源：
 * - src/pages/LearningAnalysis/components/common/ClassStudentList
 *   POST /student_analysis/classes_by_user/v1 → { code:200, data:[{ class_id, class_name, class_last_submit_time, students[] }] }
 * - src/components/HeaderCourse
 *   GET  /course/list_by_user → { code:200, data:{ list:[{ id, title, ... }] } }
 * - src/pages/LearningAnalysis/hooks/useHomeworkAnalysis.ts + homework/*Chart 组件
 *   作业分析四类接口（class_/student_ 前缀）
 */
import * as fs from "fs";
import * as path from "path";

const D = path.join(__dirname, "teacher", "data");
const read = (f: string): any => JSON.parse(fs.readFileSync(path.join(D, f), "utf-8"));
const classes = read("classes.json").classes;

const classesByUser = classes.map((c: any) => {
  let students: any[] = [];
  try {
    students = read(`class-students-${c.class_id}.json`).map((s: any) => ({
      // 前端按 item.id 选中/传参；发送弹窗按 edu_id 选人
      id: s.student_id,
      student_id: s.student_id,
      edu_id: s.display_id,
      name: s.name,
      display_id: s.display_id,
    }));
  } catch {
    students = [];
  }
  return {
    class_id: c.class_id,
    class_name: c.class_name,
    grade: c.grade,
    subject: c.subject,
    class_last_submit_time: "2026-09-07 20:30:00",
    students,
  };
});

// 课程 ID 与 mock/devAuth.ts 的 teacherContext.course_id 对齐
const courseList = {
  list: [
    {
      id: "course-mock-001",
      title: "初中数学（演示）",
      name: "初中数学（演示）",
      subject: "数学",
      subject_name: "数学",
      stage: "初中",
      grade: "g8",
    },
  ],
  total: 1,
  page: 1,
  page_size: 500,
};

/** ===== 作业分析（学情分析页第二个 tab）===== */
const day = (offset: number) => {
  const base = new Date("2026-09-07T00:00:00");
  base.setDate(base.getDate() + offset);
  return base.toISOString().slice(0, 10);
};

// 各班学业水平因子（1班整体较好，3班偏弱），作业分析图表随班级区分
const classFactor = (classId?: string): number =>
  classId === "cls-g8-01" ? 10 : classId === "cls-g8-02" ? 4 : 0;

// 每日提交时间轨迹 + 正确率趋势
// HomeworkTimeChart：item.submissions 为 [{submit_time}] 数组（散点按小时分正常/拖延/异常）
// HomeworkRightChart：item.class_accuracy / item.student_accuracy 为数值
const timeline = (classId?: string) => {
  const f = classFactor(classId);
  return Array.from({ length: 7 }, (_, i) => {
    const n = 8 + (i % 3) * 3;
    const submissions = Array.from({ length: n }, (_, j) => {
      // 分布：多数 19-21 点（正常），少数 22-23 点（拖延），偶发 0-5 点（异常）
      let hour = 19 + (j % 3);
      if (j % 7 === 5) hour = 22 + (j % 2);
      if (j % 11 === 3) hour = 1 + (j % 4);
      const minute = (j * 13) % 60;
      const hh = String(hour).padStart(2, "0");
      const mm = String(minute).padStart(2, "0");
      return { submit_time: `${day(i)} ${hh}:${mm}:00` };
    });
    return {
      date: day(i),
      week: `周${"一二三四五六日"[i]}`,
      submissions,
      class_accuracy: 62 + i * 3 + f,
      student_accuracy: 58 + i * 4 + f,
    };
  });
};

// 知识点掌握环形图（KnowledgeGraspChart：classData/gradeData/personalData）
const masteryBands = (scale: number, shift = 0) => [
  { name: "已掌握", value: Math.round(18 * scale) + shift * 2 },
  { name: "较熟练", value: Math.round(14 * scale) + shift },
  { name: "练习中", value: Math.round(8 * scale) },
  { name: "待巩固", value: Math.max(1, Math.round(5 * scale) - shift * 2) },
];

// 知识点正确率柱状图（KnowledgeDifficultyChart）
const accuracyList = (shift = 0) =>
  [
    "二次根式", "全等三角形", "一次函数", "整式乘法", "分式",
    "一元二次方程", "平行四边形", "勾股定理",
  ].map((name, i) => {
    const rate = 55 + ((i * 7) % 30) + shift;
    return {
      knowledgeName: name,
      classRate: rate,
      easyNum: 10 + i,
      easyRightRate: 70 + ((i * 5) % 25) + shift,
      easyModerateNum: 8 + i,
      easyModerateRightRate: 60 + ((i * 6) % 30) + shift,
      mediumNum: 6 + i,
      mediumRightRate: 52 + ((i * 8) % 28) + shift,
      hardNum: 4 + i,
      hardRightRate: 40 + ((i * 9) % 30) + shift,
      correctness: rate / 100,
    };
  });

const classReport = (c: any) => {
  const f = classFactor(c?.class_id);
  return ({
  class_name: c?.class_name || "八年级(3)班",
  subject_name: "数学",
  teacher_name: "演示教师",
  start_time: day(0),
  end_time: day(6),
  report_generated_date: day(6),
  ai_analysis: [
    "### 本周学情点评",
    "**整体**：班级掌握度均值 57.9，近 5 次评估持续向好，「全等三角形」正确率连续两周上升，可进入综合证明训练。",
    "",
    "**重点关注**：",
    "1. 「二次根式」待巩固占比 **31%**，55% 的错因集中在*计算错误*，建议布置 10 分钟计算专项；",
    "2. 「用提公因式法分解因式」概念混淆占比偏高，适合安排错题变式练习；",
    "3. 周三、周五夜间提交占比升高，可提醒学生合理规划作业时间。",
    "",
    "| 知识点 | 待巩固 | 主要错因 |",
    "| --- | --- | --- |",
    "| 二次根式 | 14人 (31%) | 计算错误 55% |",
    "| 三角形全等的判定 | 14人 (31%) | 概念混淆 45% |",
    "| 整式乘法 | 14人 (31%) | 概念混淆 42% |",
    "",
    "> 以上建议基于近一周作业与自主练习数据生成，可在「上传历史学情」中补充往期记录以提升分析质量。",
  ].join("\n"),
  // 班级模式统计（TaskStatistics.buildClassDataList 为嵌套结构）
  assigned_count: { class_assigned_count: 12, avg_grade_assigned_count: 11 },
  submit_rate: { class_submit_rate: 87 + f, avg_grade_submit_rate: 84 },
  completed_count: { avg_class_person_completed_count: 46 + f, avg_grade_person_completed_count: 43 },
  correct_rate: { class_avg_correct_rate: 68 + f, grade_avg_correct_rate: 65 },
  task_stats: { submitted_count: 10, assigned_count: 12, class_avg_submitted_count: 9 },
  question_stats: {
    student_completed_questions: 88,
    teacher_assigned_questions: 96,
    class_avg_completed_questions: 80,
  },
  accuracy_stats: { student_avg_accuracy: 72 + f, class_avg_accuracy: 68 + f },
  kp_excellence_stats: { student_rate: 45 + f, class_rate: 38 },
  });
};

export default {
  "POST /api/student_analysis/classes_by_user/v1": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: classesByUser });
  },

  "GET /api/student_analysis/classes_by_user/v1": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: classesByUser });
  },

  "GET /api/course/list_by_user": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: courseList });
  },

  // ===== 作业分析 · 班级报告 =====
  "POST /api/student_analysis/class_report/v1": (req: any, res: any) => {
    const c = classesByUser.find((x: any) => x.class_id === req.body?.class_id);
    res.json({ code: 200, msg: "ok", data: classReport(c) });
  },

  "POST /api/student_analysis/class_daily_timeline/v1": (req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: timeline(req.body?.class_id) });
  },

  "POST /api/student_analysis/class_knowledge_point_overview/v1": (req: any, res: any) => {
    const f = classFactor(req.body?.class_id) / 3.5;
    res.json({
      code: 200,
      msg: "ok",
      data: { classData: masteryBands(1, f), gradeData: masteryBands(1.2), personalData: masteryBands(0.4, f) },
    });
  },

  "POST /api/student_analysis/class_knowledge_point_accuracy_list/v1": (req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: accuracyList(classFactor(req.body?.class_id)) });
  },

  // ===== 作业分析 · 个人报告（左侧选中学生后） =====
  "POST /api/student_analysis/student_report/v1": (req: any, res: any) => {
    const c = classesByUser.find((x: any) => x.class_id === req.body?.class_id);
    res.json({ code: 200, msg: "ok", data: { ...classReport(c), student_name: "曹楠" } });
  },

  "POST /api/student_analysis/student_daily_timeline/v1": (req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: timeline(req.body?.class_id) });
  },

  "POST /api/student_analysis/student_knowledge_point_overview/v1": (req: any, res: any) => {
    const f = classFactor(req.body?.class_id) / 3.5;
    res.json({
      code: 200,
      msg: "ok",
      data: { classData: masteryBands(1, f), gradeData: masteryBands(1.2), personalData: masteryBands(0.4, f) },
    });
  },

  "POST /api/student_analysis/student_knowledge_point_accuracy_list/v1": (req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: accuracyList(classFactor(req.body?.class_id)) });
  },

  // 个人模式实际调用的是不带 student_ 前缀的这两个路径（services/index.ts 注释处可见演变）
  "POST /api/student_analysis/knowledge_point_overview/v1": (req: any, res: any) => {
    const f = classFactor(req.body?.class_id) / 3.5;
    res.json({
      code: 200,
      msg: "ok",
      data: { classData: masteryBands(1, f), gradeData: masteryBands(1.2), personalData: masteryBands(0.4, f) },
    });
  },

  "POST /api/student_analysis/knowledge_point_accuracy_list/v1": (req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: accuracyList(classFactor(req.body?.class_id)) });
  },

  // ===== 报告推送到助学端 =====
  "POST /api/student_analysis/push_study_report/v1": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: { pushed: 45 } });
  },
};
