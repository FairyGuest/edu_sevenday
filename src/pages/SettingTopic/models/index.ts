import { message } from "antd";
import * as services from "../services";

export default {
  namespace: "settingTopicModel",
  state: {
    keepFormData: null,
    // Exercise 习题录入
    courseId: null,
    taskId: null,
    rootTaskId: null,
    questions: [], // 题目列表
    progress: 0, // 解析进度
    progressMessage: "", // 进度信息
    taskStatus: "", // 任务状态 processing | success | failed
    activeIndex: 0, // 当前选中的题目索引
    topicKey: "1", // 当前选中的子题 tab
    textbookVersion: [], // 教材版本树
    chooseTextbookVersion: {}, // 选中的教材版本
    chapterKnowledgePoints: {}, // 章节/知识点树
    questionTypeList: [], // 题型列表
    subject: "", // 学科
    knowledgePointChapter: [], // 章节知识点数据
    questionType: "", // 当前题型
    saveLoading: false, // 保存 loading
    xkwCascaderValue: [],
    xkwCourseId: null,
    xkwSubjectId: "", // findXkwCourseListByStageId 返回的学科 ID
    xkwStageId: "",
    xkwStageName: "", // Cascader 第一级课程对应学段
    xkwSubjectName: "", // Cascader 第一级课程对应学科
    xkwTextbookId: "",
    xkwTextbookName: "",
    paperId: null, // 上传搜题关联试卷 ID
    paperName: "", // 上传搜题关联试卷名称
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
