import { message } from "antd";
import * as services from "../services";

export default {
  namespace: "teachSourceModel",
  state: {
    loading: false,
    activeTab: { category: "source", id: "source" }, // 当前Tab激活的标签
    activeKey: "", // 当前Tab激活的key
    selectedSubject: null, // 选中的课程
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
    // post请求
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

    // get请求
    *getData(
      { payload, mTitle, mLoading, apiUrl }: any,
      { call, put, select }: any,
    ): Generator<any, any, any> {
      const loading = mLoading || "loading";
      yield put({ type: "updateState", res: { [loading]: true } });
      const result = yield call(services.getDataService, payload, apiUrl);
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      yield put({ type: "updateState", res: { [loading]: false } });
      return result;
    },

    // 设置数据
    *setData({ payload }: any, { call, put, select }: any) {
      yield put({ type: "updateState", res: { ...payload } });
    },
  },
};
