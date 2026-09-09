import * as services from "../services";

export default {
  namespace: "personalizedPaperModel",
  state: {
    loading: false,
    generateLoading: false,
    detailLoading: false,
    reportLoading: false,
    classes: [],
    homeworkList: [],
    detail: null,
    paper: null,
    report: null,
  },

  reducers: {
    updateState(state: any, { res }: any) {
      return { ...state, ...res };
    },
  },

  effects: {
    *getData({ payload, mTitle, mLoading, apiUrl }: any, { call, put }: any): Generator<any, any, any> {
      const loading = mLoading || "loading";
      yield put({ type: "updateState", res: { [loading]: true } });
      const result: any = yield call(services.getDataService, payload || {}, apiUrl);
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      yield put({ type: "updateState", res: { [loading]: false } });
      return result;
    },

    *postData({ payload, mTitle, mLoading, apiUrl }: any, { call, put }: any): Generator<any, any, any> {
      const loading = mLoading || "loading";
      yield put({ type: "updateState", res: { [loading]: true } });
      const result: any = yield call(services.postDataService, payload || {}, apiUrl);
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      yield put({ type: "updateState", res: { [loading]: false } });
      return result;
    },
  },
};
