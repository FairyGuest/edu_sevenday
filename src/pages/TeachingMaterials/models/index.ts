import { message } from "antd";
import * as services from "../services";

export default {
  namespace: "teachingModel",
  state: {
    loading: false,
    fetchLoading: false, // loading
    chatList: [], // loading
    pptArr: [],
    outlineText: "", // 大纲
    htmlData: [], // html数据
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
        const tmp = { ...currentState[mTitle], ...payload };
        yield put({ type: "updateState", res: { [mTitle]: tmp } });
      } else {
        yield put({ type: "updateState", res: { ...payload } });
      }
    },

    *postData(
      params: any,
      { call, put, select }: any,
    ): Generator<any, any, any> {
      const { payload, mTitle, mLoading, isInfo, apiUrl } = params;
      const loading = mLoading || "loading";
      yield put({ type: "updateState", res: { [loading]: true } });
      const result: any = yield call(services.postDataService, payload, apiUrl);
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      yield put({ type: "updateState", res: { [loading]: false } });
      if (isInfo && result.code == 200) {
        // 成功提示
        message.success(result.msg);
      }

      return result;
    },

    // 获取数据
    *getData({ payload, mTitle, mLoading, apiUrl }, { call, put, select }) {
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
