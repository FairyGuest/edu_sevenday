import { message } from "antd";
import * as services from "../services";

export default {
  namespace: "teachDesginModel",
  state: {
    loading: false,
    planParams: {}, // 教案计划参数
    planSseLoading: false, // 教案SSE加载--整个请求过程
    childPlanLoading: false, // 子教案加载
    studyPlanLoading: false, // 学案加载
    leftChatLoading: false, // 左侧聊天加载
    evaluateLoading: false, // 评估加载
    collapse: true, // 历史是否收起
    type: 1, // 教育类型
    desginForm: {}, //首页表单
    stageList: [], // 学段学科选项
    subjectList: [], // 教材册别选项
    chapterList: [], // 章节目录选项
    classTypeList: [], // 课型设置选项
    classInfo: {}, // 班型信息
    gradeDocId: {}, // 年级、教材id
    chapterInfo: {}, // 章节目录信息
    expandedKeys: [], // 章节目录展开的key
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
