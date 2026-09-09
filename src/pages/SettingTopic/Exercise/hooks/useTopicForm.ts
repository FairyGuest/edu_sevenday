import { useDispatch, useSelector } from "umi";
import {
  isSubQuestionSelected,
  isSaveButtonDisabled,
  hasSelectedSubQuestion,
} from "./topicFormHelpers";
import { formatXkwQuestionTypeOptions } from "../../utils/xkwQuestionTypeHelpers";
import { mapXkwCascaderToTextbookVersion } from "../../hooks/useXkwTextbookCascader";
import { parseXkwTbKPTreeResponse } from "../../utils/xkwTextbookTreeHelpers";
import { getResolvedXkwCascaderState } from "../../utils/xkwCascaderPersist";

export const useTopicForm = () => {
  const dispatch = useDispatch();

  const {
    courseId,
    taskId,
    rootTaskId,
    questions,
    activeIndex,
    topicKey,
    chooseTextbookVersion,
    chapterKnowledgePoints,
    knowledgePointChapter,
    questionType,
    questionTypeList,
    subject,
    saveLoading,
    xkwTextbookId,
    xkwCourseId,
    xkwCascaderValue = [],
  } = useSelector((state: any) => state.settingTopicModel);

  const topicData = questions?.[activeIndex];
  const subQuestion = topicData?.sub_questions?.[Number(topicKey) - 1] || {};
  const isSubQuestionRecorded = isSubQuestionSelected(topicData, subQuestion);
  const formDisabled = hasSelectedSubQuestion(topicData);
  const saveButtonDisabled = isSaveButtonDisabled(topicData, subQuestion);
  const questionTypeDisabled = hasSelectedSubQuestion(topicData);
  const subQuestionIndex = Number(topicKey) - 1;

  const setTopicData = (payload: Record<string, any>) => {
    dispatch({
      type: "settingTopicModel/setData",
      payload,
    });
  };

  const setQuestions = (newQuestions: any[]) => {
    setTopicData({ questions: newQuestions });
  };

  const setKnowledgePointChapter = (data: any) => {
    setTopicData({ knowledgePointChapter: data });
  };

  const getChapterKnowledgePoints = async (textbookId?: any) => {
    if (!textbookId) {
      setTopicData({ chapterKnowledgePoints: { catalog_tree: [], kpoints: [] } });
      return;
    }

    const { code, data = [] }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getFindXkwTbKPTreeList",
      payload: { textbookId },
    });
    if (code === 200) {
      setTopicData({ chapterKnowledgePoints: parseXkwTbKPTreeResponse(data) });
    }
  };

  const getQuestionTypeData = async () => {
    const resolved = getResolvedXkwCascaderState({
      xkwCourseId,
      xkwCascaderValue,
      xkwTextbookId,
    });
    let courseIdForTypes =
      resolved.xkwCourseId || resolved.xkwCascaderValue?.[0];

    if (!courseIdForTypes) {
      const stageRes: any = await dispatch({
        type: "settingTopicModel/getData",
        apiUrl: "getMindQuestionGetTeacherStageId",
        payload: {},
      });
      if (stageRes?.code === 200) {
        const courseRes: any = await dispatch({
          type: "settingTopicModel/getData",
          apiUrl: "getFindXkwCourseList",
          payload: { stageId: stageRes.data },
        });
        if (courseRes?.code === 200 && courseRes.data?.length > 0) {
          courseIdForTypes = courseRes.data[0].id;
        }
      }
    }

    if (!courseIdForTypes) return;

    const { code, data = [] }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getFindXkwQuestionTypeList",
      payload: { courseId: courseIdForTypes },
    });
    if (code === 200) {
      setTopicData({
        questionTypeList: formatXkwQuestionTypeOptions(data),
      });
    }
  };

  const onChangeCascader = (selectedOptions: any[]) => {
    const payload = mapXkwCascaderToTextbookVersion(selectedOptions);
    if (!payload?.textbook_id) return;
    setTopicData({ chooseTextbookVersion: payload });
    getChapterKnowledgePoints(payload.textbook_id);
  };

  const initChapterKnowledgePoints = async () => {
    if (xkwTextbookId) {
      await getChapterKnowledgePoints(xkwTextbookId);
    }
  };

  return {
    courseId,
    taskId,
    rootTaskId,
    questions,
    activeIndex,
    topicKey,
    subQuestionIndex,
    topicData,
    subQuestion,
    isSubQuestionRecorded,
    formDisabled,
    saveButtonDisabled,
    questionTypeDisabled,
    chooseTextbookVersion,
    chapterKnowledgePoints,
    knowledgePointChapter,
    questionType,
    questionTypeList,
    subject,
    saveLoading,
    xkwCourseId,
    setTopicData,
    setQuestions,
    setKnowledgePointChapter,
    getChapterKnowledgePoints,
    getQuestionTypeData,
    initChapterKnowledgePoints,
    onChangeCascader,
  };
};
