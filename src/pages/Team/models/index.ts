import { message } from "antd";
import * as services from "../services";

export default {
  namespace: "teamModel",
  state: {
    loading: false,
    fetchLoading: false, // loading
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
      *postData(params: any, { call, put, select }: any): Generator<any, any, any> {
        const { payload, mTitle, mLoading, isInfo, apiUrl, contentType } = params
        const loading = mLoading || "loading"
        yield put({ type: "updateState", res: { [loading]: true, [mTitle]: null } });
        const result: any = yield call(services.postDataService, payload, apiUrl, contentType);
        if (result && mTitle) {
          yield put({ type: "updateState", res: { [mTitle]: result.data } });
        }
        yield put({ type: "updateState", res: { [loading]: false } });
        if (isInfo && result.code == 200) { // 成功提示
          message.success(result.msg);
        }
      
        return result;
      },
  
         // 获取数据
    *setData({ payload }, { call, put, select }) {
      yield put({ type: "updateState", res: { ...payload } });
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
  
  },
};
