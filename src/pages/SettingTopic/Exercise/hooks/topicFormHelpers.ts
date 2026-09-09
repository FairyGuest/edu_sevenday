import { deepCopy } from "@/utils";
import { question_type_nume } from "@/global";
import { isSelectQuestionType } from "../../utils/xkwQuestionTypeHelpers";

const DEFAULT_SELECT_OPTIONS = ["", "", "", ""];

const CHINESE_DIFFICULTY_SET = new Set([
  "容易",
  "较易",
  "适中",
  "较难",
  "困难",
]);

/** 兼容旧数据中的英文 code */
const DIFFICULTY_CODE_TO_LABEL: Record<string, string> = {
  easy: "容易",
  easy_moderate: "较易",
  medium: "适中",
  moderate_hard: "较难",
  hard: "困难",
};

const mapDifficulty = (item: any) => {
  const level = item?.difficulty_level ?? item?.difficulty;
  if (!level) return "适中";
  if (CHINESE_DIFFICULTY_SET.has(level)) return level;
  return DIFFICULTY_CODE_TO_LABEL[level] || level || "适中";
};

const mapQuestionType = (quesType?: string) => {
  if (!quesType) return "short_answer";
  const byType = question_type_nume.find((item) => item.type === quesType);
  if (byType) return byType.code;
  const byCode = question_type_nume.find((item) => item.code === quesType);
  if (byCode) return byCode.code;
  if (typeof quesType === "string" && quesType.includes("_")) return quesType;
  return "short_answer";
};

const normalizeHtmlOptions = (item: any): string[] => {
  if (Array.isArray(item?.options_html)) {
    return item.options_html.map((option: any) => (option == null ? "" : String(option)));
  }

  const rawOptions = Array.isArray(item?.optionList)
    ? item.optionList
    : Array.isArray(item?.options)
      ? item.options
      : [];

  return rawOptions.map((option: any) =>
    typeof option === "string" ? option : option?.content ?? option?.text ?? "",
  );
};

const resolveCorrectAnswers = (item: any, options: string[]) => {
  const rawAnswers = Array.isArray(item?.answerList)
    ? item.answerList
    : Array.isArray(item?.correct_answers)
      ? item.correct_answers
      : Array.isArray(item?.answers)
        ? item.answers
        : item?.answer != null && item?.answer !== ""
          ? [item.answer]
          : [];

  return rawAnswers.map((ans: any) => {
    if (
      typeof ans === "string" &&
      /^[A-Za-z]$/.test(ans.trim()) &&
      options.length
    ) {
      const idx = ans.trim().toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < options.length) return options[idx];
    }
    return ans;
  });
};

const mapIdNameToKeyTitle = (list: any[] = []) =>
  list
    .map((item) => ({
      key: String(item?.id ?? item?.key ?? ""),
      title: item?.name ?? item?.title ?? "",
    }))
    .filter((item) => item.key || item.title);

const mapKeyPointTags = (item: any) => {
  const kgPointList = item?.kgPointList || item?.kgPoints || item?.knowledgePointList || [];
  if (kgPointList.length) {
    return mapIdNameToKeyTitle(kgPointList);
  }

  const keyPointNames = item?.key_point_names || item?.keyPointNames || [];
  return (Array.isArray(keyPointNames) ? keyPointNames : []).map(
    (name: string, index: number) => ({
      key: `name-${index}`,
      title: name,
    }),
  );
};

/** 接口 chapterList → 录入页 knowledge_chapter（仅教材单元，知识点走 ori_kpoints） */
const mapChapterKnowledgeChapter = (item: any) => {
  const chapterList = Array.isArray(item?.chapterList) ? item.chapterList : [];
  if (!chapterList.length) return undefined;

  return [
    {
      chapter: mapIdNameToKeyTitle(chapterList),
      knowledgePoint: [],
    },
  ];
};

const normalizeKnowledgePointChapterItem = (item: any) => {
  if (!item || typeof item !== "object") return item;
  return {
    ...item,
    chapter: mapIdNameToKeyTitle(item?.chapter),
    knowledgePoint: mapIdNameToKeyTitle(item?.knowledgePoint),
  };
};

const mapSourceFrom = (item: any) => {
  const id = String(item?.oldId ?? item?.id ?? item?.question_id ?? item?.questionId ?? "");
  if (id.startsWith("ai-gen") || item?.source === "ai_gen") {
    return "ai_gen";
  }
  return "photo_search";
};

const mapSearchQuestionItem = (item: any) => {
  const itemId = item?.id ?? item?.questionId ?? item?.question_id;
  const options = normalizeHtmlOptions(item);
  const correct_answers = resolveCorrectAnswers(item, options);
  const kpointTags = mapKeyPointTags(item);
  const knowledge_chapter = mapChapterKnowledgeChapter(item);

  return {
    ...item,
    id: itemId,
    sub_question_id: itemId,
    question_text:
      item?.stem_html || item?.stem || item?.question_text || item?.content || "",
    correct_answers,
    explanation:
      item?.explanation_html ||
      item?.quesAnalysis ||
      item?.analysis ||
      item?.explanation ||
      "",
    options,
    question_type: mapQuestionType(item?.quesType ?? item?.question_type ?? item?.type),
    difficulty: mapDifficulty(item),
    score:
      item?.score != null && item?.score !== ""
        ? Number(item.score)
        : undefined,
    ori_kpoints: kpointTags,
    kpoints: kpointTags,
    ...(knowledge_chapter ? { knowledge_chapter, textbook_tree: knowledge_chapter } : {}),
    source_from: mapSourceFrom(item),
  };
};

const mapLegacyQuestionGroup = (group: any) => ({
  question_group_id: group?.id ?? group?.question_group_id,
  status: group?.status,
  sub_questions: (group?.personalQuestionList || group?.sub_questions || []).map(
    mapSearchQuestionItem,
  ),
});

const mapTaskQuestionsObject = (taskQuestions: Record<string, any>) =>
  Object.entries(taskQuestions || {}).map(([groupId, questions]) => ({
    question_group_id: groupId,
    status: Array.isArray(questions) ? questions?.[0]?.status : undefined,
    sub_questions: (Array.isArray(questions) ? questions : []).map(mapSearchQuestionItem),
  }));

/** 将 findQuestionSearchList 返回结构转为页面使用的题目结构 */
export const normalizeQuestionSearchList = (data: any) => {
  if (Array.isArray(data)) {
    return normalizePhotoSearchQuestions(data.map(mapLegacyQuestionGroup));
  }

  if (data && typeof data === "object") {
    const questionSearchGetVOList =
      data.questionSearchGetVOList ?? data.question_search_get_vo_list;
    if (Array.isArray(questionSearchGetVOList)) {
      return normalizePhotoSearchQuestions(
        questionSearchGetVOList.map(mapLegacyQuestionGroup),
      );
    }

    const taskQuestions = data.task_questions ?? data.taskQuestions;
    if (taskQuestions && typeof taskQuestions === "object") {
      const groups = Array.isArray(taskQuestions)
        ? taskQuestions.map(mapLegacyQuestionGroup)
        : mapTaskQuestionsObject(taskQuestions);
      return normalizePhotoSearchQuestions(groups);
    }

    if (Array.isArray(data.list)) {
      return normalizePhotoSearchQuestions(data.list.map(mapLegacyQuestionGroup));
    }
  }

  return normalizePhotoSearchQuestions([]);
};

/** 选择题 options 为空时补全 4 个空选项 */
export const ensureSelectQuestionOptions = (subQuestion: any) => {
  if (
    !isSelectQuestionType(subQuestion?.question_type) ||
    subQuestion?.options?.length > 0
  ) {
    return subQuestion;
  }
  return { ...subQuestion, options: [...DEFAULT_SELECT_OPTIONS] };
};

export const normalizePhotoSearchQuestions = (questions: any[] = []) =>
  questions.map((question) => ({
    ...question,
    sub_questions: (question?.sub_questions ?? []).map(ensureSelectQuestionOptions),
  }));

/** 后端 sub_question 上的教材单元/知识点字段为 knowledge_chapter */
export const getSubQuestionKnowledgeChapter = (subQuestion: any): any[] => {
  const raw =
    subQuestion?.knowledge_chapter ??
    subQuestion?.knowledgePointChapter ??
    subQuestion?.textbook_tree ??
    [];
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeKnowledgePointChapterItem);
};

export const isSubQuestionSelected = (topicData: any, subQuestion: any) =>
  topicData?.status === "selected" &&
  !!topicData?.selected_sub_question_id &&
  topicData?.selected_sub_question_id === subQuestion?.sub_question_id;

export const hasSelectedSubQuestion = (topicData: any) =>
  topicData?.status === "selected" && !!topicData?.selected_sub_question_id;

/** 获取当前应展示的子题 tab key：已录入子题 > 上次查看子题 > 默认第一个 */
export const getSelectedTopicKey = (topicData: any): string => {
  const subQuestionId = hasSelectedSubQuestion(topicData)
    ? topicData?.selected_sub_question_id
    : topicData?.viewing_sub_question_id;
  if (!subQuestionId) return "1";

  const subQuestions = topicData?.sub_questions ?? [];
  const index = subQuestions.findIndex(
    (item: any) => String(item?.sub_question_id) === String(subQuestionId),
  );
  return index >= 0 ? String(index + 1) : "1";
};

export const updateQuestionViewingSubQuestionId = (
  questions: any[],
  questionIndex: number,
  subQuestionId: string,
) => {
  const newQuestions = deepCopy(questions);
  if (newQuestions[questionIndex]) {
    newQuestions[questionIndex].viewing_sub_question_id = subQuestionId;
  }
  return newQuestions;
};

/** 已有其他子题录入时，当前子题的录入按钮不可点击 */
export const isSaveButtonDisabled = (topicData: any, subQuestion: any) =>
  hasSelectedSubQuestion(topicData) && !isSubQuestionSelected(topicData, subQuestion);

export const persistSubQuestion = (
  questions: any[],
  activeIndex: number,
  subQuestionIndex: number,
  subQuestion: any,
  formLeftValues: Record<string, any>,
  formRightValues: Record<string, any>,
  extras: {
    correct_answers: any;
    knowledgePointChapter: any;
    ori_kpoints: any;
  },
  status?: string,
) => {
  const newSubQuestionData = {
    ...subQuestion,
    ...formLeftValues,
    ...formRightValues,
    correct_answers: extras.correct_answers,
    ori_kpoints: extras.ori_kpoints,
    knowledge_chapter: extras.knowledgePointChapter ?? [],
    textbook_tree: extras.knowledgePointChapter ?? [],
  };
  const newAllData = deepCopy(questions);
  if (status === "selected") {
    newAllData[activeIndex].status = status;
    newAllData[activeIndex].selected_sub_question_id = subQuestion?.sub_question_id;
  } else if (status === "done") {
    newAllData[activeIndex].status = status;
    newAllData[activeIndex].selected_sub_question_id = undefined;
  } else if (status) {
    newSubQuestionData.status = status;
    newAllData[activeIndex].status = status;
  }
  newAllData?.[activeIndex]?.sub_questions &&
    (newAllData[activeIndex].sub_questions[subQuestionIndex] = newSubQuestionData);
  return newAllData;
};

export {
  isSelectQuestionType,
  isMultipleChoiceQuestionType,
  resolveQuestionTypeValue,
  resolveQuestionTypeName,
  formatXkwQuestionTypeOptions,
  getXkwLeafQuestionTypes,
} from "../../utils/xkwQuestionTypeHelpers";

export const createTagsDelete =
  (oriKpoints: any[], setOriKpoints: (tags: any[]) => void) =>
  (type: string, dele?: any) => {
    if (type === "1") {
      setOriKpoints(oriKpoints.filter((item: any) => item?.key !== dele?.key));
    }
    if (type === "2") {
      setOriKpoints([]);
    }
  };
