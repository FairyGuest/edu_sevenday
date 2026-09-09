/**
 * 本地 mock 登录（对齐远程 /web/eduAuth 真实契约）。
 * 任意账号/密码/验证码均可登录，用于前端开发与演示。
 * 仅 start:mock 模式生效（cogUrl=/api），生产构建不包含本文件。
 *
 * 契约来源：src/pages/Login/index.tsx
 * - POST /web/eduAuth/login  → { code:200, data:{ authVO:{accessToken}, loginUserVO:{ orgList[] } } }
 * - GET  /web/eduAuth/getUser → { code:200, data: loginUserVO }
 */
const mockAccessToken = "mock-access-token-local";

const mockLoginUserVO = {
  id: "u-mock-001",
  edu_id: "u-mock-001",
  username: "teacher",
  user_name: "演示教师",
  nick_name: "演示教师",
  avatar: "",
  member_type: 1, // 1=教师
  status: "正常",
  phone: "",
  orgId: "org-mock-001",
  orgName: "智谱演示学校",
  // Login 页取 orgList[0] 存 curOrg；需同时带 id/title 才能被 getOrgId() 读到
  orgList: [
    {
      id: "org-mock-001",
      orgId: "org-mock-001",
      title: "智谱演示学校",
      orgName: "智谱演示学校",
      school_id: "sch-mock-001",
      schoolName: "智谱演示学校",
    },
  ],
};

export default {
  "POST /api/web/eduAuth/login": (_req: any, res: any) => {
    // dev 演示模式：不校验账号/密码/验证码（真实校验在远程后端）
    setTimeout(() => {
      res.json({
        code: 200,
        msg: "ok",
        success: true,
        data: {
          authVO: { accessToken: mockAccessToken },
          loginUserVO: mockLoginUserVO,
        },
      });
    }, 300);
  },

  "GET /api/web/eduAuth/getUser": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", success: true, data: mockLoginUserVO });
  },
};
