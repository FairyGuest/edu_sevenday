import { useDispatch, useSelector } from "umi";
import { useRef } from "react";

export const useRight = () => {
  const dispatch = useDispatch();
  // 防止 loadQuestionList 并发旧请求先返回会覆盖新请求
  const questionRequestIdRef = useRef(0);
  const {
    gradeName,
    subjectName,
    activeTab,
    checkedKnowledge,
    checkedChapter,
    searchText,
    filters,
    filterOptions,
    pagination,
    treeAllKeyIdList
  } = useSelector((state: any) => state.resourceSearchModel);
  const { xkwStageName = "", xkwSubjectName = "" } = useSelector(
    (state: any) => state.settingTopicModel,
  );

  // 处理筛选条件的通用函数
  const processFilters = () => {
    return Object.keys(filters).reduce((acc, key) => {
      const value = filters[key];
      if (Array.isArray(value) && value.includes("all")) {
        // gradeSemesters 字段如果是"all"，传空字符串给接口
        if (key === 'gradeSemesters') {
          acc[key] = '';
        } else {
          acc[key] = []; // 其他字段如果包含"all"，传空数组给接口
        }
      } else if (Array.isArray(value)) {
        // 根据字段类型决定提取 id 还是 name
        if (key === 'uses') {
          // uses 字段传 id
          acc[key] = value;
        } else if (key === 'gradeSemesters') {
          // gradeSemesters 字段传单个字符串值
          const options = filterOptions[key] || [];
          const firstValue = value[0];
          const option = options.find((opt: any) => opt.value === firstValue);
          acc[key] = option ? option.label : firstValue;
        } else {
          // 其他字段传 name，需要从 filterOptions 中查找对应的 label
          const options = filterOptions[key] || [];
          acc[key] = value.map((val: any) => {
            const option = options.find((opt: any) => opt.value === val);
            return option ? option.label : val;
          });
        }
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
  };

  // 加载试题列表
  const loadQuestionList = async (knowledgeKeys: any[], chapterKeys: any[], pageNum: number, pageSize?: number) => {
    const requestId = ++questionRequestIdRef.current;
    dispatch({
      type: "resourceSearchModel/setData",
      payload: { questionLoading: true }
    });

    // 知识点筛选：优先使用传入的参数，否则从状态中获取
    const knowledgeFilter = knowledgeKeys !== undefined
      ? (knowledgeKeys.length > 0 ? knowledgeKeys : undefined)
      : (checkedKnowledge.length > 0 ? checkedKnowledge : undefined);
    // 章节筛选：优先使用传入的参数，否则从状态中获取
    const chapterFilter = chapterKeys !== undefined
      ? (chapterKeys.length > 0 ? chapterKeys : undefined)
      : (checkedChapter.length > 0 ? checkedChapter : undefined);

    const processedFilters = processFilters();

    // // 根据activeTab选择不同的API
    const apiUrl = activeTab === "personal" ? "getQuestionPersonalPage" : "postGlobalQuestions";

    let requestPayload: any = activeTab === "personal" ? {
      current: pageNum || pagination.current,
      size: pageSize || pagination.pageSize,
      difficulty: processedFilters.difficulties,
      question_type: processedFilters.questionTypes,
      ability: processedFilters.abilities,
      literacy: processedFilters.literacies,
      subject_name: xkwSubjectName,
      stage_name: xkwStageName,
      // catalogue_list: checkedChapter?.length > 0 ? checkedChapter : chapterKeys,
      catalogue_list: chapterKeys?.length > 0 ? chapterKeys : treeAllKeyIdList,
      kg_list: [] // 知识点
    } : {
      current: pageNum || pagination.current,
      size: pageSize || pagination.pageSize,
      stage_name: gradeName,
      subject_name: subjectName,
      // 知识点/章节
      // catalogue_list: chapterFilter,
      kg_list: knowledgeFilter,
      // 筛选
      question_type: processedFilters.questionTypes,
      use_type: processedFilters.uses,
      difficulties: processedFilters.difficulties,
      year: processedFilters.years,
      grade_name: processedFilters.gradeSemesters,
      scene: processedFilters.scenes,
      province: processedFilters.regions,
      ability: processedFilters.abilities,
      literacy: processedFilters.literacies,
      keyword: searchText,
      bank_source: 1
    };

    const result: any = await dispatch({
      type: "resourceSearchModel/postData",
      apiUrl: apiUrl,
      payload: requestPayload,
    });

    if (result?.code === 200) {
      // 滚动到顶部
      const listPanel = document.querySelector('.list-panel');
      if (listPanel) {
        listPanel.scrollTo({ top: 0 }); //behavior: 'smooth'
      }
      const questionListData = result.data?.records || [];

      // if(activeTab != "personal" && questionListData?.length == 0) {
      //   addNewTracking({
      //     bt: 'pv',
      //     ct: 'pub_qb_empty_state_page_impression',
      //   })
      // }

      const paginationData = {
        ...pagination,
        current: result.data?.current ?? result.data?.page_num ?? pageNum ?? pagination.current,
        pageSize: result.data?.size ?? result.data?.page_size ?? pageSize ?? pagination.pageSize,
        total: result.data?.total ?? 0
      };

      // 只允许最新请求写入 state，避免旧请求覆盖新请求
      if (questionRequestIdRef.current === requestId) {
        dispatch({
          type: "resourceSearchModel/setData",
          payload: {
            questionList: questionListData,
            pagination: paginationData
          }
        });
      }
    }

    // 只有最新请求结束后才关闭 loading
    if (questionRequestIdRef.current === requestId) {
      dispatch({
        type: "resourceSearchModel/setData",
        payload: { questionLoading: false }
      });
    }
  };

  // 搜索
  const onSearch = (value: string) => {
    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        searchText: value,
        pagination: { ...pagination, current: 1 }
      }
    });
    // 直接触发搜索
    loadQuestionList(checkedKnowledge, checkedChapter, 1);
  };

  // 筛选变化
  const onFilterChange = (key: string, value: any) => {
    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        filters: { ...filters, [key]: value },
        pagination: { ...pagination, current: 1 }
      }
    });
  };

  // 清空所有筛选条件
  const onClearAllFilters = () => {
    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        filters: {
          scenes: ["all"],
          questionTypes: ["all"],
          difficulties: ["all"],
          categories: ["all"],
          uses: ["all"],
          abilities: ["all"],
          years: ["all"],
          regions: ["all"],
          gradeSemesters: ["all"], // 学期改为单选，但仍保持数组格式以兼容现有逻辑
          searchText: ""
        },
        searchText: "",
        pagination: { ...pagination, current: 1 }
      }
    });
  };

  // 分页变化
  const onPageChange = (page: number, pageSize: number) => {
    if (page == pagination.current && pageSize !== pagination.pageSize) {
      page = 1;
    }
    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        pagination: { ...pagination, current: page, pageSize }
      }
    });

    // // 滚动到顶部
    // const listPanel = document.querySelector('.list-panel');
    // if (listPanel) {
    //   listPanel.scrollTo({ top: 0 }); //behavior: 'smooth'
    // }
    loadQuestionList(checkedKnowledge, checkedChapter, page, pageSize)
  };

  return {
    loadQuestionList,
    onSearch,
    onFilterChange,
    onClearAllFilters,
    onPageChange
  };
};
