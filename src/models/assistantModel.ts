/**
 * v2.0-I 全局 AI 小助手 · dva 模型。
 * pageContext 由各页面挂载时注册（I5 上下文注入），小助手发起对话时注入 system 上下文；
 * open 控制右下角入口展开。建议数据不落 model（打开时按 pageContext 现取）。
 */
export default {
  namespace: "assistantModel",
  state: {
    open: false,
    pageContext: null as null | {
      route: string;
      title: string;
      summary?: string;
      data?: Record<string, any>; // class_id / student_id 等动作参数来源
    },
  },
  reducers: {
    updateState(state: any, { res }: any) {
      return { ...state, ...res };
    },
  },
  effects: {
    *setData({ payload }: any, { put }: any) {
      yield put({ type: "updateState", res: { ...payload } });
    },
    *open({ payload }: any, { put }: any) {
      yield put({ type: "updateState", res: { open: true, ...(payload || {}) } });
    },
    *close(_: any, { put }: any) {
      yield put({ type: "updateState", res: { open: false } });
    },
    /** 页面挂载注册上下文；unregister 传 null */
    *setPageContext({ payload }: any, { put }: any) {
      yield put({ type: "updateState", res: { pageContext: payload } });
    },
  },
};
