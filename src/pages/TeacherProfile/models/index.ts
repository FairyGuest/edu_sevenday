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
    studentSuggestions: null, // 个人建议（v2.0-H2，个人学情 Tab 消费）
    suggestionsLoading: false,
    importBatches: [], // 导入批次记录
  },

  reducers: {
    updateState(state: any, { res }: any) {
      return { ...state, ...res };
    },
  },

  effects: {
    *getData(
      { payload, mTitle, mLoading, apiUrl, seq }: any,
      { call, put, select }: any,
    ): Generator<any, any, any> {
      // v2.0 稳定性：last-wins 竞态守卫——快速连点学生/切班级时，
      // 仅当本次请求仍是该 mTitle 的最新一次才写回，防止慢响应覆盖新数据
      if (seq !== undefined) {
        const cur = yield select((s: any) => s.teacherProfileModel);
        if ((cur as any)[`__seq_${mTitle}`] !== seq) return { skipped: true };
      }
      const loading = mLoading || "loading";
      yield put({ type: "updateState", res: { [loading]: true } });
      const result: any = yield call(services.getDataService, payload || {}, apiUrl);
      if (seq !== undefined) {
        const cur2 = yield select((s: any) => s.teacherProfileModel);
        if ((cur2 as any)[`__seq_${mTitle}`] !== seq) {
          yield put({ type: "updateState", res: { [loading]: false } });
          return { skipped: true };
        }
      }
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      yield put({ type: "updateState", res: { [loading]: false } });
      return result;
    },

    /** 带竞态守卫的读数据入口（last-wins）：组件读画像/证据/建议一律走这个，
     *  内部按 mTitle 自动编序，过期响应直接丢弃。
     *  提交次数压缩到 2 次（序号+loading 合一、数据+loading-off 合一），
     *  避免一次请求引发订阅组件多轮全量重渲染（切班卡顿根源） */
    *getLatest(
      { payload, mTitle, mLoading, apiUrl }: any,
      { call, put, select }: any,
    ): Generator<any, any, any> {
      const key = `__seq_${mTitle}`;
      const cur = yield select((s: any) => s.teacherProfileModel);
      const seq = ((cur as any)[key] ?? 0) + 1;

      const loading = mLoading || "loading";
      yield put({ type: "updateState", res: { [key]: seq, [loading]: true, [`${mTitle}Error`]: null } });
      let result: any;
      try {
        result = yield call(services.getDataService, payload || {}, apiUrl);
      } catch (err) {
        result = { err };
      }
      const after = yield select((s: any) => s.teacherProfileModel);
      if ((after as any)[key] !== seq) {
        // 过期响应直接丢弃：loading 由更新的在途请求负责收尾
        return { skipped: true };
      }
      if (result?.code === 200 && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data, [loading]: false } });
      } else {
        yield put({ type: "updateState", res: { [loading]: false, [`${mTitle}Error`]: result?.msg || "数据加载失败，请重试" } });
      }
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
