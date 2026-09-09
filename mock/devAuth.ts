/**
 * 本地 mock 登录与教师上下文（开发辅助，非系统功能）。
 * 仅在 start:mock（不设 REACT_APP_ENV，cogUrl 回落 /api）模式下生效；
 * 任意账号密码均可登录，用于前端开发与演示。生产构建不包含本文件。
 */
const teacherUser = {
  _token: "mock-token-20260908",
  member_type: 1, // 1=教师（2=学生会被拦截）
  status: "正常",
  id: "u-mock-001",
  username: "teacher",
  user_name: "演示教师",
  nick_name: "演示教师",
  avatar: "",
  org_list: [
    { org_id: "org-mock-001", org_name: "智谱演示学校", school_id: "sch-mock-001", school_name: "智谱演示学校" },
  ],
};

const teacherContext = {
  course_id: "course-mock-001",
  course_name: "初中数学（演示）",
  class_id: "cls-g8-03",
  class_name: "八年级(3)班",
  subject: "数学",
  grade: "g8",
  stage: "初中",
  teacher_id: "u-mock-001",
  teacher_name: "演示教师",
};

export default {
  // 验证码（返回简单 SVG mock，任意输入可通过）
  "GET /api/web/eduAuth/captcha": (_req: any, res: any) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="36"><rect width="100" height="36" fill="#eef2f8" rx="4"/><text x="50" y="25" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="#4f7df0">1234</text></svg>`;
    const base64 = Buffer.from(svg).toString("base64");
    res.json({
      code: 200,
      data: { image: `data:image/svg+xml;base64,${base64}`, key: "mock-captcha-key" },
    });
  },

  "POST /api/zhuguan/login": (req: any, res: any) => {
    // mock 模式：不校验验证码，任意账号密码+任意验证码均可登录
    setTimeout(() => res.json({ code: 200, msg: "ok", data: teacherUser }), 300);
  },
  "POST /api/course/teacher_context": (req: any, res: any) => {
    // 回显教师切换的班级/课程，保持全局上下文与页面选择一致
    const body = req.body || {};
    res.json({
      code: 200,
      msg: "ok",
      data: {
        ...teacherContext,
        class_id: body.class_id || teacherContext.class_id,
        class_name: body.class_id ? "" : teacherContext.class_name,
        course_id: body.course_id || teacherContext.course_id,
      },
    });
  },
  "GET /api/course/teacher_context": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: teacherContext });
  },
};
