import { message } from "antd";
import * as services from "../services";

export default {
  namespace: "setQuestionsModel",
  state: {
    loading: false,
    fetchLoading: false, // loading
    kbsListObj: [], // 列表树
    kbsListLoading: false, // 列表树loading
    examsListObj: [], // 考试列表树
    examsListLoading: false, // 考试列表树loading
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
    // post数据
    *postData(
      params: any,
      { call, put, select }: any,
    ): Generator<any, any, any> {
      const { payload, mTitle, mLoading, isInfo, apiUrl, contentType } = params;
      const loading = mLoading || "loading";
      yield put({ type: "updateState", res: { [loading]: true } });
      const result: any = yield call(
        services.postDataService,
        payload,
        apiUrl,
        contentType,
      );
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

    // 获取数据
    *setData({ payload }, { call, put, select }) {
      yield put({ type: "updateState", res: { ...payload } });
    },
  },
};
