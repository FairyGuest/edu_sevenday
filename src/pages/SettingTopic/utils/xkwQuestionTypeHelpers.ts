import { question_type_nume } from "@/global";
import { SELECT_TYPES } from "../Exercise/constants";

/** 与 ChapterQuestions getFindXkwQuestionTypeListFn 一致的叶子题型处理 */
export const getXkwLeafQuestionTypes = (list: any[] = []) => {
  const parentIds = new Set(
    list
      .map((item) => item.parentId)
      .filter((id) => id !== "0" && id !== 0 && id != null),
  );

  return list
    .filter((item) => !parentIds.has(item.id))
    .map((item) => ({
      ...item,
      en_name: item.id,
    }));
};

export const formatXkwQuestionTypeOptions = (list: any[] = []) =>
  getXkwLeafQuestionTypes(list).map((item) => ({
    ...item,
    label: item.name,
    value: item.id,
  }));

const findXkwQuestionTypeItem = (
  questionType: string | undefined,
  questionTypeList: any[] = [],
) => {
  if (!questionType) return undefined;
  return questionTypeList.find(
    (item) =>
      String(item.id) === String(questionType) ||
      String(item.value) === String(questionType) ||
      String(item.en_name) === String(questionType),
  );
};

export const isSelectQuestionType = (
  questionType: string | undefined,
  questionTypeList: any[] = [],
) => {
  if (!questionType) return false;
  if (SELECT_TYPES.includes(questionType)) return true;

  // 英文 code（如 single_choice）→ 中文题型名
  const byCode = question_type_nume.find((item) => item.code === questionType);
  if (byCode?.type && /单选|多选|选择|听力|语言文字运用/.test(byCode.type)) {
    return true;
  }

  const typeItem = findXkwQuestionTypeItem(questionType, questionTypeList);
  if (!typeItem?.name) return false;

  return /单选|多选|选择|听力|语言文字运用/.test(typeItem.name);
};

/** 是否多选题（支持英文 code / 中文名 / 学科网题型 id） */
export const isMultipleChoiceQuestionType = (
  questionType: string | undefined,
  questionTypeList: any[] = [],
) => {
  if (!questionType) return false;
  if (questionType === "multiple_choice" || questionType === "多选题") {
    return true;
  }

  const byCode = question_type_nume.find((item) => item.code === questionType);
  if (byCode?.type && /多选/.test(byCode.type)) return true;

  const typeItem = findXkwQuestionTypeItem(questionType, questionTypeList);
  return !!typeItem?.name && /多选/.test(typeItem.name);
};

export const resolveQuestionTypeValue = (
  subQuestion: any,
  questionTypeList: any[] = [],
) => {
  const rawType = subQuestion?.question_type;
  if (findXkwQuestionTypeItem(rawType, questionTypeList)) {
    return String(rawType);
  }

  const quesTypeName = subQuestion?.quesType;
  if (quesTypeName) {
    const matched = questionTypeList.find((item) => item.name === quesTypeName);
    if (matched) return String(matched.id);
  }

  if (rawType) {
    const typeLabel = question_type_nume.find((item) => item.code === rawType)?.type;
    if (typeLabel) {
      const matched = questionTypeList.find(
        (item) => item.name === typeLabel || item.name?.includes(typeLabel.replace("题", "")),
      );
      if (matched) return String(matched.id);
    }
  }

  return questionTypeList[0]?.value
    ? String(questionTypeList[0].value)
    : rawType || "single_choice";
};

/** 解析预览用中文题型名（QuestionType 组件依赖 quesType） */
export const resolveQuestionTypeName = (
  questionType: string | undefined,
  questionTypeList: any[] = [],
  fallbackQuesType?: string,
) => {
  if (!questionType && fallbackQuesType) return fallbackQuesType;

  const typeItem = findXkwQuestionTypeItem(questionType, questionTypeList);
  if (typeItem?.name) return typeItem.name;

  const byCode = question_type_nume.find((item) => item.code === questionType);
  if (byCode?.type) return byCode.type;

  const byChinese = question_type_nume.find((item) => item.type === questionType);
  if (byChinese?.type) return byChinese.type;

  if (fallbackQuesType) return fallbackQuesType;
  return questionType || "";
};
