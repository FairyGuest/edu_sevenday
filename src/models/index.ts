import * as services from "@/services/";
import { message } from "antd";

export default {
  namespace: "commonModel",
  state: {
    countObj: {},
    relationStarData: [], 
    chatLoading:false, // 系统对话loading
    graphLoading:false, // 系统对话loading
    random: "",
    teacherContext: null, // 教师上下文，页面加载时获取，全局共享
    teacherContextLoading: true, // 教师上下文加载状态
  },

  reducers: {
    updateState(state: any, { res }: any) {
      // 更新state
      return {
        ...state,
        ...res,
      };
    },
  },

  effects: {
   

  // 更新 modal 数据
  *setData({ mTitle, payload }, { call, put, select }) {
    if (mTitle) {
      const currentState = yield select((state: any) => state.designModel);
      const tmp = { ...currentState[mTitle], ...payload }
      yield put({ type: "updateState", res: { [mTitle]: tmp } });
    } else {
      yield put({ type: "updateState", res: { ...payload } });
    }

  },

    // post数据
    *postData(params: any, { call, put, select }) {
      const { payload, mTitle, mLoading, isInfo, apiUrl, contentType } = params
      const loading = mLoading || "loading"
      yield put({ type: "updateState", res: { [loading]: true, [mTitle]: null } });
      const result = yield call(services.postDataService, payload, apiUrl, contentType);
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      yield put({ type: "updateState", res: { [loading]: false } });
      if (isInfo && result.code == 200) { // 成功提示
        message.success(result.msg);
      }
      return result;
    },

    // 设置教师上下文
    *setTeacherContext({ payload }, { call, put }) {
      const result = yield call(services.postDataService, payload, "setTeacherContextUrl");
      if (result?.code === 200 && result?.data) {
        yield put({ type: "updateState", res: { teacherContext: result.data } });
      }
      return result;
    },

    // get请求
    *getData({ payload, mTitle, mLoading, apiUrl }: any, { call, put, select }: any): Generator<any, any, any> {
      const loading = mLoading || "loading";
      yield put({ type: "updateState", res: { [loading]: true } });
      const result = yield call(services.getDataService, payload, apiUrl);
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      yield put({ type: "updateState", res: { [loading]: false } });
      return result;
    },
  },
};
