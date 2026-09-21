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
    activeTab: "kgraph", // 默认以知识图谱作为资源平台入口；仍可切换公共/个人题库
    graphGrade: "all",
    graphNode: null,
    graphResourceType: "all",

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

    textbooksListTree: [], //版本教材数据
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
      searchText: "", // 关键字
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
    catalogueTree: [], // 章节目录树
    treeAllKeyIdList: [],
  },

  reducers: {
    invalidateQuestions(state: any) {
      return {
        ...state,
        questionRequestSeq: (state.questionRequestSeq || 0) + 1,
        questionLoading: false,
      };
    },
    updateState(state: any, { res }: any) {
      // 更新state
      return {
        ...state,
        ...res,
      };
    },
  },

  effects: {
    // All list entry points (filters, tree and pagination) share one request generation.
    *getLatestQuestions(
      { payload, apiUrl, pagination }: any,
      { call, put, select }: any,
    ): Generator<any, any, any> {
      const state = yield select((s: any) => s.resourceSearchModel);
      const seq = (state.questionRequestSeq || 0) + 1;
      yield put({
        type: "updateState",
        res: {
          questionRequestSeq: seq,
          questionLoading: true,
          questionError: null,
        },
      });
      let result: any;
      try {
        result = yield call(services.postDataService, payload, apiUrl);
      } catch (err) {
        result = { err };
      }
      const current = yield select((s: any) => s.resourceSearchModel);
      if (current.questionRequestSeq !== seq) return { skipped: true };
      yield put({
        type: "updateState",
        res:
          result?.code === 200
            ? {
                questionLoading: false,
                questionList: Array.isArray(result.data?.records)
                  ? result.data.records
                  : [],
                pagination: {
                  ...pagination,
                  current:
                    result.data?.current ??
                    result.data?.page_num ??
                    payload.current,
                  pageSize:
                    result.data?.size ?? result.data?.page_size ?? payload.size,
                  total: result.data?.total ?? 0,
                },
              }
            : {
                questionLoading: false,
                questionList: [],
                questionError: result?.msg || "题目加载失败，请重试",
              },
      });
      return result;
    },
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

    // v2.0 稳定性：AI 助手筛题动作的筛选合并入口——助手不订阅题库状态，
    // 由模型内部读当前 filters 合并写入（避免题库列表每次翻页都重渲染助手整树）
    *applyAssistantFilter({ payload }: any, { put, select }: any) {
      const { resourceSearchModel } = yield select((s: any) => s);
      const cur = resourceSearchModel?.filters || {};
      yield put({
        type: "updateState",
        res: {
          filters: { ...cur, ...(payload.filters || {}) },
          ...(payload.searchText !== undefined
            ? { searchText: payload.searchText }
            : {}),
          pagination: {
            ...(resourceSearchModel?.pagination || {}),
            current: 1,
          },
        },
      });
    },
  },
};
