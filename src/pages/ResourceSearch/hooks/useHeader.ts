import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "umi";
import { getUserInfo } from '@/utils';
import { useLeft } from "./useLeft";
import publicFilterConditions from "../enums/publicFilterConditions.json";
import personalFilterConditions from "../enums/personalFilterConditions.json";
import { formatXkwQuestionTypeOptions } from "@/pages/SettingTopic/utils/xkwQuestionTypeHelpers";

const toFilterOptions = (list: string[] = []) =>
  list.map((item) => ({ value: item, label: item }));

export const getPersonalBaseFilterOptions = (questionTypes: any[] = []) => ({
  difficulties: toFilterOptions(Object.keys(personalFilterConditions.difficulty_score_map || {})),
  questionTypes,
  scenes: [],
  abilities: [],
  years: [],
  regions: [],
});

export const getFilterOptionsFromJson = (
  gradeName: string,
  subjectName: string,
  tabName = "public",
) => {
  if (tabName === "personal") {
    return getPersonalBaseFilterOptions();
  }
  const source: any = publicFilterConditions;
  const subjectData = source.conditions?.[gradeName]?.[subjectName] || {};
  return {
    difficulties: toFilterOptions(Object.keys(source.difficulty_score_map || {})),
    questionTypes: toFilterOptions(subjectData.question_type_list),
    scenes: toFilterOptions(source.scene_list),
    abilities: toFilterOptions(subjectData.abilities_list),
    years: [],
    regions: [],
  };
};

export const useHeader = () => {
  const dispatch = useDispatch();
  const { saveUserSelection } = useLeft();
  const { activeTab, gradeName, subjectName, userSelectionTextbook, filters } = useSelector((state: any) => state.resourceSearchModel);
  const { xkwCourseId } = useSelector((state: any) => state.settingTopicModel);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const loadPersonalFilterOptions = useCallback(async (courseId?: any) => {
    const id = courseId ?? xkwCourseId;
    if (!id) {
      dispatch({
        type: "resourceSearchModel/setData",
        payload: {
          filterOptions: getPersonalBaseFilterOptions(),
        },
      });
      return;
    }

    const { code, data = [] }: any = await dispatch({
      type: "resourceSearchModel/getData",
      apiUrl: "getFindXkwQuestionTypeList",
      payload: { courseId: id },
      mLoading: "personalFilterLoading",
    });
    if (code !== 200 && code !== 0) return;

    const list = Array.isArray(data)
      ? data
      : data?.list || data?.records || [];
    const questionTypes = formatXkwQuestionTypeOptions(list).map((item: any) => ({
      value: item.label,
      label: item.label,
    }));

    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        filterOptions: getPersonalBaseFilterOptions(questionTypes),
        filters: {
          ...filtersRef.current,
          questionTypes: ["all"],
        },
      },
    });
  }, [dispatch, xkwCourseId]);
  const getSubjectName = (subjectItem: any) =>
    typeof subjectItem === "string"
      ? subjectItem
      : subjectItem?.name || subjectItem?.subject_name || subjectItem?.subject || "";

  // 处理字典数据，提取题型数据和其他筛选选项 （废弃）
  const processDictData = (dictData: any) => {

    const gradeSemestersData: any = {};
    const scenesData: any = {};
    const questionTypesData: any = {};

    dictData?.stage_subject_list?.forEach((stage: any) => {
      // grade_list 现在是字符串数组
      gradeSemestersData[stage.stage_name] = stage.grade_list?.map((item: any) => ({
        value: item,
        label: item
      })) || [];
      // scene_list 现在是字符串数组（从每个学科的第一个获取）
      scenesData[stage.stage_name] = stage.subject_list?.[0]?.scene_list?.map((item: any) => ({
        value: item,
        label: item
      })) || [];
      stage.subject_list?.forEach((subject: any) => {
        const subjectName = getSubjectName(subject);
        const key = `${stage.stage_name}_${subjectName}`;
        // question_type_list 现在是字符串数组
        questionTypesData[key] = subject?.question_type_list?.map((item: any) => ({
          value: item,
          label: item
        })) || [];
      });
    });

    // 处理其他筛选选项
    const filterOptions = {
      scenes: [], // 场景 - 会根据学段【动态】设置
      questionTypes: [], // 题型 - 会根据学段学科【动态】设置
      difficulties: dictData.difficulty_list?.map((item: any) => ({
        value: item.id,
        label: item.name
      })) || [],
      categories: [ // 类型 - 临时假数据 @dev
        { value: "real_exam", label: "真题集" },
        { value: "good_questions", label: "好题集" },
        { value: "frequent_exam", label: "常考题" },
        { value: "final_questions", label: "压轴题" },
        { value: "error_prone", label: "易错题" },
        { value: "user_bank", label: "用户题库" },
        { value: "typical_set", label: "典型集" },
        { value: "textbook_original", label: "课本原题" }
      ],
      uses: dictData.use_type_list?.map((item: any) => ({
        value: item.id,
        label: item.name
      })) || [],
      abilities: [], // 能力 - 暂时为空，等待后端数据
      years: dictData.year_list?.map((item: any) => ({
        value: item.id,
        label: item.name
      })) || [],
      regions: dictData.province_list?.map((item: any) => ({
        value: item.id,
        label: item.name
      })) || [],
      gradeSemesters: [], // 年级学期 - 会根据学段【动态】设置
    };

    return {
      gradeSemestersData,
      questionTypesData,
      scenesData,
      filterOptions
    };
  };

  // 初始化：默认选中初中数学，不再请求用户上次选择
  const initData = async () => {
    const finalGradeLevel = "初中";
    const finalSubject = "数学";
    const activeder =
      new URLSearchParams(window.location.search).get("activeder") || "";
    // 从 localStorage 读取保存的 activeTab（用于切换教材后刷新页面时恢复）
    const savedActiveTab = localStorage.getItem('resourceSearchActiveTab');
    // 使用保存的值，如果没有则使用当前的 activeTab
    let finalActiveTab
    if (activeder) {
      finalActiveTab = activeder === "1" ? "public" : "personal";
    } else {
      finalActiveTab = savedActiveTab || activeTab;
    }
    if (finalActiveTab === "group") {
      finalActiveTab = "public";
    }
    // 清除保存的值，避免下次刷新时仍然使用
    localStorage.removeItem('resourceSearchActiveTab');

    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        gradeName: finalGradeLevel,
        subjectName: finalSubject,
        activeTab: finalActiveTab,
        textbookId: '',
        textbookVersion: '',
        userSelectionTextbook: {
          publicTextbookId: '',
          publicTextbookVersion: '',
          personalTextbookId: '',
          personalTextbookVersion: '',
        },
        filterOptions: finalActiveTab === "personal"
          ? getPersonalBaseFilterOptions()
          : getFilterOptionsFromJson(finalGradeLevel, finalSubject, finalActiveTab)
      }
    })
  };

  // 学科变化
  const onSubjectChange = async (value: string, gradeName: string) => {
    // 更新models状态并重置相关数据
    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        gradeName,
        subjectName: value,
        textbookId: null,
        textbookVersion: null,
        userSelectionTextbook: {
          publicTextbookId: null,
          publicTextbookVersion: null,
          personalTextbookId: null,
          personalTextbookVersion: null,
        },
        // semester: "", // 重置学期选择
        // 重置知识点相关状态
        checkedKnowledge: [],
        expandedKeys: [],
        autoExpandParent: true,
        knowledgeTree: [],
        // 重置章节相关状态
        chapterTree: [],
        checkedChapter: [],
        chapterExpandedKeys: [],
        chapterAutoExpandParent: true,
        // 重置教材数据
        textbooksList: [],
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
        filterOptions: getFilterOptionsFromJson(gradeName, value, activeTab)
      }
    });
    // 保存用户选择数据
    saveUserSelection('', '', gradeName, value); // 教材ID传空字符串
  };

  // 标签页变化
  const setActiveTab = async (value: string) => {
    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        activeTab: value,
        textbookId: value === 'public'
          ? userSelectionTextbook.publicTextbookId
          : userSelectionTextbook.personalTextbookId,
        textbookVersion: value === 'public'
          ? userSelectionTextbook.publicTextbookVersion
          : userSelectionTextbook.personalTextbookVersion,
      }
    });

    if (value === "personal") {
      dispatch({
        type: "resourceSearchModel/setData",
        payload: {
          filterOptions: getPersonalBaseFilterOptions(),
        },
      });
      return;
    }
    if (!gradeName || !subjectName) return;
    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        filterOptions: getFilterOptionsFromJson(gradeName, subjectName, value)
      }
    });
  };

  // 切换最新教材版本
  const switchTextbookFn = async () => {
    const { code, data }: any = await dispatch({
      type: "resourceSearchModel/postData",
      payload: {
        "edu_id": getUserInfo('edu_id'),
        "selection_type": "xkw"
      },
      apiUrl: "postSyncUserSelection"
    });

    if (code == 200) {
      console.log('操作成功')
      // 保存当前的 activeTab，刷新后恢复
      localStorage.setItem('resourceSearchActiveTab', activeTab);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  return {
    initData,
    onSubjectChange,
    setActiveTab,
    saveUserSelection,
    switchTextbookFn,
    loadPersonalFilterOptions,
  };
};
