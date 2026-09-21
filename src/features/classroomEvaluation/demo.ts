export type EvaluationLesson = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  className: string;
  teacher: string;
  date: string;
  dimensions: number[];
  participation: number;
  questions: number;
  openQuestions: number;
  studentTalk: number;
  focus: string;
  question: string;
  answer: string;
  followup: string;
  observation: string;
  suggestion: string;
};

export const dimensionNames = [
  "教学目标",
  "教学组织",
  "课堂提问",
  "学生参与",
  "评价反馈",
];

// All records in this module are authored demonstration data, not model analysis.
export const evaluationLessons: EvaluationLesson[] = [
  {
    id: "ce-001",
    title: "勾股定理：从面积到证明",
    subject: "数学",
    grade: "八年级",
    className: "八年级（3）班",
    teacher: "陈老师",
    date: "2026-09-21",
    dimensions: [92, 90, 86, 88, 84],
    participation: 85,
    questions: 24,
    openQuestions: 9,
    studentTalk: 38,
    focus: "利用面积关系探究勾股定理，并说明适用条件。",
    question: "这三个正方形的面积之间有什么关系？能用拼图来解释吗？",
    answer: "两个小正方形的面积加起来，正好等于大正方形的面积。",
    followup: "如果不是直角三角形，这个关系还成立吗？请举例说明。",
    observation:
      "15:00 的拼图探究中，学生先提出面积猜想，再用重组图形说明理由；教师通过追问引导学生补充直角条件。",
    suggestion:
      "拼图后增加一组非直角三角形反例，让学生先独立判断，再用一句话完整表达定理及适用条件。",
  },
  {
    id: "ce-002",
    title: "一次函数的图象与性质",
    subject: "数学",
    grade: "八年级",
    className: "八年级（1）班",
    teacher: "林老师",
    date: "2026-09-20",
    dimensions: [90, 88, 82, 86, 84],
    participation: 80,
    questions: 20,
    openQuestions: 6,
    studentTalk: 32,
    focus: "从图象变化理解一次函数中系数与增减性的关系。",
    question: "两条直线都经过原点，为什么倾斜程度不同？",
    answer: "系数不同，横坐标增加相同的量时，纵坐标增加的量不同。",
    followup: "把系数换成负数，图象和增减性会怎样变化？",
    observation:
      "15:00 的图象比较中，学生能描述直线倾斜变化，但对系数为负时的增减性解释仍不充分。",
    suggestion:
      "加入正、负系数的对照任务，先让学生预测图象，再描点验证，最后用变量变化解释结论。",
  },
  {
    id: "ce-003",
    title: "力的作用效果",
    subject: "物理",
    grade: "八年级",
    className: "八年级（2）班",
    teacher: "周老师",
    date: "2026-09-19",
    dimensions: [91, 92, 88, 94, 85],
    participation: 95,
    questions: 22,
    openQuestions: 10,
    studentTalk: 45,
    focus: "通过实验区分力改变物体形状和改变运动状态的两类效果。",
    question: "小车受到推力后，哪些变化可以作为力产生作用的证据？",
    answer: "小车由静止开始运动，说明运动状态改变了。",
    followup: "小车速度大小不变、只改变方向，算不算运动状态改变？",
    observation:
      "15:00 的分组实验中，多数学生主动记录现象，部分学生把运动状态变化仅理解为速度大小变化。",
    suggestion:
      "增加小车转弯的对照实验，用速度大小与运动方向两个角度组织证据记录。",
  },
  {
    id: "ce-004",
    title: "春：品读景物描写",
    subject: "语文",
    grade: "七年级",
    className: "七年级（1）班",
    teacher: "王老师",
    date: "2026-09-18",
    dimensions: [90, 87, 91, 88, 89],
    participation: 90,
    questions: 18,
    openQuestions: 12,
    studentTalk: 48,
    focus: "结合具体词句，体会景物描写的感官视角与表达效果。",
    question: "“小草偷偷地从土里钻出来”，哪个词最让你感受到春意？为什么？",
    answer: "“钻”让我想到小草使劲生长的样子，很有生命力。",
    followup: "把“钻”换成“长”，朗读时的感受有什么不同？",
    observation:
      "15:00 的词句品读中，学生能结合文本表达个人感受，教师的替换朗读进一步推动了对表达效果的比较。",
    suggestion:
      "让小组各选一句景物描写，用“词语、画面、情感”三个层次组织解释，并安排同伴补充证据。",
  },
  {
    id: "ce-005",
    title: "二次根式的化简",
    subject: "数学",
    grade: "八年级",
    className: "八年级（3）班",
    teacher: "陈老师",
    date: "2026-09-17",
    dimensions: [88, 86, 80, 82, 84],
    participation: 75,
    questions: 26,
    openQuestions: 5,
    studentTalk: 28,
    focus: "理解二次根式化简规则，关注字母取值范围。",
    question: "根号下 a 的平方，化简后一定等于 a 吗？",
    answer: "不一定，a 是负数的时候，结果应该是 a 的相反数。",
    followup: "能不能用一个式子表示 a 取不同值时的结果？",
    observation:
      "15:00 的辨析活动中，部分学生能举出负数反例，但全班独立解释的机会较少，回答集中在少数学生。",
    suggestion:
      "设置正数、零、负数三组取值，先全员书写判断，再抽取不同思路进行比较，补足独立思考时间。",
  },
  {
    id: "ce-006",
    title: "三角形全等的判定",
    subject: "数学",
    grade: "七年级",
    className: "七年级（2）班",
    teacher: "赵老师",
    date: "2026-09-16",
    dimensions: [92, 89, 87, 90, 87],
    participation: 90,
    questions: 21,
    openQuestions: 8,
    studentTalk: 40,
    focus: "在操作与推理中辨析三角形全等的判定条件。",
    question: "已知两边和一个角，能唯一确定一个三角形吗？",
    answer: "要看这个角是不是两条已知边的夹角。",
    followup: "当已知角不是夹角时，你能画出两个不同的三角形吗？",
    observation:
      "15:00 的作图探究中，学生用不同构图展示不唯一的情况，并在讨论中逐步明确夹角条件。",
    suggestion:
      "将学生的不同构图并排展示，让同伴指出关键条件，最终形成判定条件与反例的对照记录。",
  },
];

export const lessonScore = (lesson: EvaluationLesson) =>
  Math.round(
    lesson.dimensions.reduce((sum, value) => sum + value, 0) /
      dimensionNames.length,
  );

export const lessonStages = (lesson: EvaluationLesson) => [
  {
    time: "00:00",
    end: "05:00",
    name: "情境导入",
    minutes: 5,
    color: "#1c6cff",
    evidence: `教师展示生活情境，明确学习任务：${lesson.focus}`,
    advice: "在公布学习目标前收集学生的初始判断，保留课堂前后对照的依据。",
  },
  {
    time: "05:00",
    end: "15:00",
    name: "概念建构",
    minutes: 10,
    color: "#20a39e",
    evidence: `围绕“${lesson.question}”组织观察，学生先独立思考，再交流初步解释。`,
    advice: "呈现至少两种学生解释，通过比较提炼关键概念。",
  },
  {
    time: "15:00",
    end: "28:00",
    name: "合作探究",
    minutes: 13,
    color: "#7a73cf",
    evidence: lesson.observation,
    advice: lesson.suggestion,
  },
  {
    time: "28:00",
    end: "36:00",
    name: "应用巩固",
    minutes: 8,
    color: "#da9b32",
    evidence: `教师提出迁移问题：“${lesson.followup}”学生结合本节课结论再次判断并解释。`,
    advice: "将练习分为基础判断与解释迁移两层，分别收集完成情况。",
  },
  {
    time: "36:00",
    end: "40:00",
    name: "总结反馈",
    minutes: 4,
    color: "#718096",
    evidence: "学生回顾本节课的核心结论，教师归纳典型误区并布置课后巩固任务。",
    advice: "增加一张离堂反馈单，分别记录本节课的收获与尚未解决的问题。",
  },
];
