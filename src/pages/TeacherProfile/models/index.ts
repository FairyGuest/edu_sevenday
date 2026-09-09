import * as services from "../services";

export default {
  namespace: "teacherProfileModel",
  state: {
    loading: false,
    detailLoading: false,
    importLoading: false,
    classes: [], // 班级列表
    profile: null, // 班级画像
    studentDetail: null, // 个人画像
    evidence: [], // 作答证据
    importBatches: [], // 导入批次记录
  },

  reducers: {
    updateState(state: any, { res }: any) {
      return { ...state, ...res };
    },
  },

  effects: {
    *getData(
      { payload, mTitle, mLoading, apiUrl }: any,
      { call, put }: any,
    ): Generator<any, any, any> {
      const loading = mLoading || "loading";
      yield put({ type: "updateState", res: { [loading]: true } });
      const result: any = yield call(services.getDataService, payload || {}, apiUrl);
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      yield put({ type: "updateState", res: { [loading]: false } });
      return result;
    },

    *postData(
      { payload, mTitle, mLoading, apiUrl }: any,
      { call, put }: any,
    ): Generator<any, any, any> {
      const loading = mLoading || "importLoading";
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
