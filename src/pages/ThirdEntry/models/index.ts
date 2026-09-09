import { message } from "antd";
import * as services from "../services";

export default {
  namespace: "thirdEntry",
  state: {
    showCollection: false,
    doneChallenge: false,
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
    // post数据
    *postData(params: any, { call, put, select }) {
      const { payload, mTitle, mLoading, isInfo, apiUrl, contentType } = params;
      const loading = mLoading || "loading";
      yield put({
        type: "updateState",
        res: { [loading]: true, [mTitle]: null },
      });
      const result = yield call(
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

      // if (result.code == 500) { // 后端提示
      //   message.error(result.msg);
      // }

      return result;
    },
  },
};
