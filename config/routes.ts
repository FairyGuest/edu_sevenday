export default [
  // 主页
  {
    path: "/",
    title: "主页",
    component: "./Home",
  },
  {
    path: "/setTopic",
    title: "作业下发",
    routes: [
      {
        path: "",
        title: "作业下发",
        component: "./SettingTopic",
      },
      {
        path: "new",
        title: "智能出题",
        component: "./SettingTopic/ChapterQuestions",
      },
      {
        path: "questions",
        title: "题目列表",
        component: "./SettingTopic/Questions",
      },
      {
        path: "homework",
        title: "作业设置",
        component: "./SettingTopic/PublishExam",
      },
      {
        path: "exercise",
        title: "习题录入",
        component: "./SettingTopic/Exercise",
      },
    ],
  },
  {
    path: "/paperCompose",
    title: "作业组卷",
    routes: [
      {
        path: "",
        title: "作业组卷",
        component: "./SettingTopic/PaperCompose",
      },
      {
        path: "questions",
        title: "试卷详情",
        component: "./SettingTopic/Questions",
      },
    ],
  },
  {
    path: "/design",
    title: "教学设计",
    routes: [
      {
        path: "",
        title: "教学设计",
        component: "./TeachDesign",
      },
      {
        path: "unit",
        title: "教学设计单元",
        component: "./TeachDesign/Unit",
      },
      {
        path: "hour",
        title: "教学设计课时",
        component: "./TeachDesign/Hour",
      },
      {
        path: "detail",
        title: "教学设计详情",
        component: "./TeachDesign/Detail",
      },
    ],
  },
  // 课程教学
  {
    path: "/teach",
    title: "课程教学",
    routes: [
      {
        path: "course",
        title: "课程管理",
        routes: [
          {
            path: "",
            title: "课程管理",
            component: "./Course",
          },
          {
            path: "detail",
            title: "课程管理详情",
            component: "./TeachSource",
          },
        ],
      },
      {
        path: "correction",
        title: "作业批改",
        component: "./CheckTopic",
      },
    ],
  },
  // 师生互动
  {
    path: "/interact",
    title: "师生互动",
    routes: [
      {
        path: "analysis",
        title: "学情分析",
        component: "./LearningAnalysis",
      },
      {
        path: "record",
        title: "互动记录",
        component: "./AgentInteractions",
      },
    ],
  },
  // 资源平台
  {
    path: "/source",
    title: "资源平台",
    component: "./ResourceSearch"
  },
  // 智能体
  {
    path: "agent",
    title: "智能体",
    routes: [
      {
        path: "chat",
        title: "聊天",
        component: "./Agent",
      },
      {
        path: "square",
        title: "智能体广场",
        component: "./Agent/Center",
      },
      {
        path: "my",
        title: "我的智能体",
        component: "./Agent/Application",
      },
      {
        path: "knowledge",
        title: "知识库",
        component: "./Agent/Knowledge",
      },
      {
        path: "plugin",
        title: "插件中心",
        component: "./Agent/Plugin",
      },
    ],
  },
  {
    path: "/mass",
    title: "学科大模型",
    component: "./mass",
  },
  {
    path: "team",
    title: "团队与成员",
    component: "./Team",
  },
  {
    path: "team/member",
    title: "班级成员",
    component: "./Team/Member",
  },
  {
    path: "team/linkClass",
    title: "关联班级",
    component: "./Team/LinkClass",
  },
  {
    path: "profile",
    title: "个人中心",
    component: "./Profile",
  },
  {
    icon: "AppstoreOutlined",
    path: "/login",
    title: "登录",
    component: "./Login",
  },
  {
    icon: "AppstoreOutlined",
    path: "/register",
    title: "注册",
    component: "./Register",
  },
  {
    icon: "",
    path: "/third",
    title: "第三方入口",
    component: "./ThirdEntry",
  },
  {
    icon: "",
    path: "/third/hd",
    title: "第三方入口",
    component: "./ThirdEntry/haidian",
  },
  {
    path: "/analysisH5",
    title: "学情分析",
    component: "./LearningAnalysis/H5",
    layout: false,
  },
  {
    path: "/assessment",
    title: "课堂评估",
    component: "./ClassroomAssessment",
    // layout: false,
  },
  {
    path: "evaluateReport",
    title: "评估报告",
    component: "./TeachDesign/EvaluateReport",
    layout: false,
  },
  {
    path: "/design/player",
    title: "教学设计讲解视频",
    component: "./TeachDesign/Player",
    layout: false,
  },
  {
    path: "/notice",
    title: "消息通知",
    component: "./Notice",
  },
  { path: "/setting-topic", title: "作业布置", component: "./SettingTopic" },
  { path: "/check-topic", title: "作业批改", component: "./CheckTopic" },
  { path: "/teaching-enhance", title: "教学设计增强", component: "./TeachingEnhance" },
  { path: "/resource-platform", title: "资源平台", component: "./ResourcePlatform" },
  {
    path: "/learning-analysis",
    title: "学情分析",
    component: "./LearningAnalysis",
  },
  {
    path: "*",
    component: "./404",
  },
];
