import { message } from "antd";
import * as services from "../services";

export default {
  namespace: "resourceSearchModel",
  state: {
    loading: false,

    // 字典数据
    dictData: null, // 存储选项数据字典
    questionTypesData: {}, // 存储题型数据，格式：{ "学段_学科": [题型列表] }
    gradeSemestersData: {}, //存储年级学期数据，格式：{ "学段": [年级学期列表] }
    scenesData: {}, //存储场景数据，格式：{ "学段": [场景列表] }

    // Header 相关状态
    gradeName: "",
    subjectName: "",
    activeTab: "public",   // { key: "public", label: "公共题库" },{ key: "district", label: "海淀区题库" },{ key: "personal", label: "个人题库" },

    // Left 相关状态 - 知识点
    checkedKnowledge: [],
    expandedKeys: [],
    autoExpandParent: true,
    knowledgeTree: [],

    // Left 相关状态 - 章节
    chapterTree: [],
    textbookVersion: "", // 当前组件用于展示的教材版本
    textbookId: "", // 当前组件用于展示的教材ID
    userSelectionTextbook: {
      publicTextbookId: null, // 公共题库教材ID
      publicTextbookVersion: null, // 公共题库教材版本
      personalTextbookId: null, // 个人题库教材ID
      personalTextbookVersion: null, // 个人题库教材版本
    },
    checkedChapter: [],
    chapterExpandedKeys: [],
    chapterAutoExpandParent: true,
    catalogType: "knowledge", // knowledge/chapter
    isCatalogOpen: true,

    // 教材数据
    textbooksList: [], // 从接口获取的教材列表

    textbooksListTree:[], //版本教材数据
    // Right 相关状态
    questionList: [],
    questionLoading: false,
    paperList: [], // 试卷列表
    paperLoading: false, // 试卷加载状态
    filters: {
      scenes: ["all"], // 使用场景
      questionTypes: ["all"], // 题型
      difficulties: ["all"], // 难度
      categories: ["all"], // 类型
      uses: ["all"], // 用途
      abilities: ["all"], // 能力
      years: ["all"], // 年份
      regions: ["all"], // 地区
      gradeSemesters: ["all"], // 年级学期
      searchText: "" // 关键字
    },
    filterOptions: {
      scenes: [], // 使用场景
      questionTypes: [], // 题型
      difficulties: [], // 难度
      categories: [], // 类型
      uses: [], // 用途
      abilities: [], // 能力
      years: [], // 年份
      regions: [], // 地区
      gradeSemesters: [], // 年级学期
    },
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    questionBasket: null, // 试题篮信息
    questionBasketLoading: false, // 试题篮加载状态
    textbookOptions: [], // 个人题库教材option
    catalogueTree:[], // 章节目录树
    treeAllKeyIdList:[]
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
