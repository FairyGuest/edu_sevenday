import { useEffect } from "react";
import { deepCopy } from "@/utils";
import {
  isSelectQuestionType,
  resolveQuestionTypeValue,
  resolveQuestionTypeName,
} from "./topicFormHelpers";
import { useTopicForm } from "./useTopicForm";

export const useTopicMeta = () => {
  const topicForm = useTopicForm();
  const {
    questions,
    activeIndex,
    topicKey,
    subQuestion,
    questionTypeList,
    xkwCourseId,
    getQuestionTypeData,
    initChapterKnowledgePoints,
    setQuestions,
    setTopicData,
  } = topicForm;

  const questionTypeChange = (changedValue: any) => {
    const newAllData = deepCopy(questions);
    const currentSub = newAllData?.[activeIndex]?.sub_questions?.[Number(topicKey) - 1];
    if (!currentSub) return;

    const currentIsSelect = isSelectQuestionType(
      currentSub?.question_type,
      questionTypeList,
    );
    const nextIsSelect = isSelectQuestionType(changedValue, questionTypeList);

    if (currentIsSelect && nextIsSelect) {
      currentSub.correct_answers = [];
    }
    if (!currentIsSelect && nextIsSelect) {
      if (!currentSub?.options?.length) {
        currentSub.options = new Array(4).fill("");
      }
      if (!currentSub?.correct_answers?.length) {
        currentSub.correct_answers = currentSub?.temporary_answer ?? [];
      }
    }
    if (currentIsSelect && !nextIsSelect) {
      currentSub.temporary_answer = deepCopy(currentSub?.correct_answers ?? []);
      currentSub.correct_answers = [];
    }

    currentSub.question_type = changedValue;
    // 同步预览组件依赖的中文题型名，避免仍按旧题型（如填空）渲染
    currentSub.quesType = resolveQuestionTypeName(
      changedValue,
      questionTypeList,
      currentSub?.quesType,
    );
    setQuestions(newAllData);
    setTopicData({ questionType: changedValue });
  };

  const initFormQuestionType = () => {
    const type = resolveQuestionTypeValue(subQuestion, questionTypeList);
    setTopicData({ questionType: type });
    return type;
  };

  useEffect(() => {
    getQuestionTypeData();
    initChapterKnowledgePoints();
  }, [xkwCourseId]);

  return {
    ...topicForm,
    questionTypeChange,
    initFormQuestionType,
  };
};
