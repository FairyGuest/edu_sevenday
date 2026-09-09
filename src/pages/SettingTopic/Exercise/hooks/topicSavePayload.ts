import { question_type_nume } from "@/global";
import { isSelectQuestionType } from "./topicFormHelpers";
import { normalizeTopicEditorFieldsForSave } from "@/utils/photoQuestionImageUpload";
import { DIFFICULTY_OPTIONS } from "../constants";

const FRONTEND_ONLY_KEYS = [
  "question_text",
  "correct_answers",
  "explanation",
  "options",
  "question_type",
  "ori_kpoints",
  "kpoints",
  "knowledge_chapter",
  "knowledgePointChapter",
  "textbook_tree",
  "source_from",
  "sub_question_id",
  "temporary_answer",
  "status",
  "chapter",
  "knowledgePoint",
];

export const collectChapterAndKpoints = (knowledgePointChapter: any[]) => {
  const chapterList: any[] = [];
  const knowledgePointList: any[] = [];

  knowledgePointChapter?.forEach((item: any) => {
    item?.chapter?.forEach((v: any) => chapterList.push(v));
    item?.knowledgePoint?.forEach((v: any) => knowledgePointList.push(v));
  });

  return { chapterList, knowledgePointList };
};

export const buildChapterKnowledgePayload = (
  knowledgePointChapter: any[] = [],
  oriKpoints: any[] = [],
  mergeOriKpointsIntoKpoints = false,
) => {
  const { chapterList, knowledgePointList } = collectChapterAndKpoints(knowledgePointChapter);
  const kpoints = mergeOriKpointsIntoKpoints
    ? [...knowledgePointList, ...(oriKpoints || [])]
    : knowledgePointList;

  return {
    chapters: chapterList,
    kpoints,
    ori_kpoints: oriKpoints,
    knowledge_chapter: knowledgePointChapter,
    textbook_tree: knowledgePointChapter,
  };
};

type BuildSavePayloadParams = {
  rootTaskId: any;
  topicData: any;
  activeIndex: number;
  subQuestion: any;
  left_data: Record<string, any>;
  right_data: Record<string, any>;
  knowledgePointChapter: any;
  oriKpoints?: any[];
  /** 实时保存时将 ori_kpoints 合并进 kpoints */
  mergeOriKpointsIntoKpoints?: boolean;
  correct_answers: any;
  questionTypeList?: any[];
};

/** 与录入本题 postSaveTopicUrl 保持一致的传参结构 */
export const buildPhotoSearchSavePayload = ({
  rootTaskId,
  topicData,
  activeIndex,
  subQuestion,
  left_data,
  right_data,
  knowledgePointChapter,
  oriKpoints = [],
  mergeOriKpointsIntoKpoints = false,
  correct_answers,
  questionTypeList = [],
}: BuildSavePayloadParams) => {
  const chapterKnowledgePayload = buildChapterKnowledgePayload(
    knowledgePointChapter,
    oriKpoints,
    mergeOriKpointsIntoKpoints,
  );

  const isSelectType = isSelectQuestionType(subQuestion?.question_type, questionTypeList);
  const { question_text, options } = left_data ?? {};
  const normalizedOptions = (options || []).map((item: any) => (item == null ? "" : item));

  const basePayload = {
    root_task_id: rootTaskId,
    question_group_id: topicData?.question_group_id,
    index: activeIndex + 1,
    ...subQuestion,
    question_text,
    ...right_data,
    ...chapterKnowledgePayload,
  };

  if (isSelectType) {
    return {
      ...basePayload,
      options: normalizedOptions,
      correct_answers,
    };
  }

  const normalizedCorrectAnswers = (
    Array.isArray(correct_answers) ? correct_answers : [correct_answers ?? ""]
  ).map((item) => (item == null ? "" : item));

  const { options: _options, ...nonSelectPayload } = basePayload;

  return {
    ...nonSelectPayload,
    correct_answers: normalizedCorrectAnswers,
  };
};

const omitFrontendOnlyFields = (subQuestion: any = {}) => {
  const payload = { ...subQuestion };
  FRONTEND_ONLY_KEYS.forEach((key) => {
    delete payload[key];
  });
  return payload;
};

const mapDifficultyToLabel = (difficulty?: string) =>
  DIFFICULTY_OPTIONS.find((item) => item.value === difficulty)?.label ||
  difficulty ||
  "";

const mapQuesTypeName = (
  questionType?: string,
  questionTypeList: any[] = [],
  fallback?: string,
) => {
  const matched = questionTypeList.find(
    (item) =>
      String(item.id) === String(questionType) ||
      String(item.value) === String(questionType),
  );
  if (matched?.name) return matched.name;
  return (
    question_type_nume.find((item) => item.code === questionType)?.type ||
    fallback ||
    ""
  );
};

const mapKgPointList = (knowledgePointList: any[] = [], oriKpoints: any[] = []) => {
  const seen = new Set<string>();
  return [...knowledgePointList, ...(oriKpoints || [])]
    .map((item) => ({
      id: String(item?.id ?? item?.key ?? ""),
      name: item?.name ?? item?.title ?? "",
    }))
    .filter((item) => {
      if (!item.id && !item.name) return false;
      const key = `${item.id}-${item.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const normalizeAnswerList = (correct_answers: any) =>
  (Array.isArray(correct_answers) ? correct_answers : [correct_answers ?? ""]).map(
    (item) => (item == null ? "" : item),
  );

const mapIdNameList = (list: any[] = []) => {
  const seen = new Set<string>();
  return (list || [])
    .map((item) => ({
      id: String(item?.id ?? item?.key ?? ""),
      name: item?.name ?? item?.title ?? "",
    }))
    .filter((item) => {
      if (!item.id && !item.name) return false;
      const key = `${item.id}-${item.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const normalizePersonalQuestionSource = (item: any) => {
  const rawSource = item?.source ?? item?.source_from ?? item?.source_summary ?? "";
  if (typeof rawSource === "string") return rawSource;
  if (Array.isArray(rawSource)) return rawSource.filter(Boolean).join(",") || "";
  if (rawSource == null || rawSource === "") return "";
  return String(rawSource);
};

/** 题组中当前选中的子题 */
export const resolveSelectedSubQuestion = (group: any) =>
  group?.sub_questions?.find(
    (item: any) =>
      String(item?.sub_question_id ?? item?.id) ===
      String(group?.selected_sub_question_id),
  ) ||
  group?.sub_questions?.[0] ||
  {};

/** 映射为 updatePaperFullData 的 personalQuestionList 项 */
export const buildPersonalQuestionApiItem = (
  item: any,
  questionTypeList: any[] = [],
  options: { normalizeImageSrc?: boolean } = {},
) => {
  const { normalizeImageSrc = false } = options;
  const knowledgePointChapter =
    item?.knowledge_chapter ??
    item?.textbook_tree ??
    item?.knowledgePointChapter ??
    [];
  const { chapterList, knowledgePointList } = collectChapterAndKpoints(
    Array.isArray(knowledgePointChapter) ? knowledgePointChapter : [],
  );
  const oriKpoints = item?.ori_kpoints ?? item?.oriKpoints ?? [];

  const isSelectType = isSelectQuestionType(item?.question_type, questionTypeList);
  const rawOptions = item?.options ?? item?.optionList ?? [];
  const normalizedOptions = (Array.isArray(rawOptions) ? rawOptions : []).map(
    (opt: any) =>
      opt == null
        ? ""
        : typeof opt === "string"
          ? opt
          : opt?.content ?? opt?.text ?? "",
  );

  const maybeNormalize = <T,>(value: T): T =>
    (normalizeImageSrc
      ? normalizeTopicEditorFieldsForSave(value)
      : value) as T;

  const stem = maybeNormalize(
    item?.question_text ?? item?.stem ?? item?.content ?? "",
  );
  const quesAnalysis = maybeNormalize(
    item?.explanation ?? item?.quesAnalysis ?? item?.analysis ?? "",
  );
  const optionList = maybeNormalize(
    isSelectType ? normalizedOptions : item?.optionList ?? normalizedOptions,
  );
  const answerList = maybeNormalize(
    normalizeAnswerList(item?.correct_answers ?? item?.answerList),
  );

  const kgPointList =
    knowledgePointList.length || oriKpoints.length
      ? mapKgPointList(knowledgePointList, oriKpoints)
      : mapKgPointList(
          (item?.kpoint_ids ?? item?.kgPointList ?? item?.kgPoints ?? []).map(
            (kp: any) => ({
              id: kp?.id ?? kp?.key,
              name: kp?.name ?? kp?.title,
            }),
          ),
          [],
        );

  const chapterListApi = chapterList.length
    ? mapIdNameList(chapterList)
    : mapIdNameList(item?.chapterList ?? []);

  const apiItem: Record<string, any> = {
    id: String(item?.id ?? item?.sub_question_id ?? ""),
    oldId: String(item?.oldId ?? item?.id ?? item?.sub_question_id ?? ""),
    stem,
    quesAnalysis,
    optionList,
    answerList,
    quesType: mapQuesTypeName(
      item?.question_type ?? item?.quesType,
      questionTypeList,
      item?.quesType,
    ),
    difficulty: mapDifficultyToLabel(item?.difficulty),
    chapterList: chapterListApi,
    kgPointList,
    source: normalizePersonalQuestionSource(item) || "photo_search",
  };

  const optionalKeys = [
    "quesAudio",
    "quesVideo",
    "analysisVideo",
    "stageName",
    "subjectName",
    "gradeName",
    "term",
    "quesFormat",
    "quesClass",
    "quesTime",
    "subjectAbilities",
    "year",
    "scene",
    "area",
    "paperId",
    "paperName",
    "attrs",
    "hasChild",
    "personalQuestionList",
    "childrenCount",
    "hasPicture",
    "deleteFlag",
    "createUser",
    "createTime",
    "updateUser",
    "updateTime",
    "oldQuesType",
    "timestampMs",
  ];
  optionalKeys.forEach((key) => {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      apiItem[key] = item[key];
    }
  });

  return apiItem;
};

/** 组卷保存 paper 元信息（含题目数、总分） */
export const buildPaperMetaForFullData = (
  basePaper: Record<string, any>,
  questionItems: any[] = [],
) => {
  const totalScore = questionItems.reduce(
    (sum, item) => sum + (Number(item?.score) || 0),
    0,
  );

  return {
    id: basePaper.id == null || basePaper.id === "" ? basePaper.id : String(basePaper.id),
    subjectId: basePaper.subjectId ?? basePaper.subject_id,
    totalScore,
    questionCount: basePaper.questionCount ?? questionItems.length,
    name: basePaper.name ?? basePaper.title ?? "",
    description: basePaper.description ?? "",
    difficulty: basePaper.difficulty ?? 0,
    grade: basePaper.grade ?? 0,
    forkFrom: basePaper.forkFrom ?? basePaper.fork_from ?? 0,
    createUser: basePaper.createUser ?? basePaper.create_user ?? 0,
    createTime: basePaper.createTime ?? basePaper.create_time ?? null,
    updateUser: basePaper.updateUser ?? basePaper.update_user ?? 0,
    updateTime: basePaper.updateTime ?? basePaper.update_time ?? null,
    deleteFlag: basePaper.deleteFlag ?? basePaper.delete_flag ?? false,
  };
};

export const buildPaperQuestionListItem = (
  item: any,
  paperId: number | string,
  index: number,
) => {
  const relationId = item?.paperQuestionId ?? item?.paper_question_id ?? null;
  return {
    // 雪花 id 必须用字符串，避免超过 MAX_SAFE_INTEGER 丢精度
    id: relationId == null || relationId === "" ? null : String(relationId),
    parentId: item?.parentId ?? item?.parent_id ?? 0,
    paperId: paperId == null || paperId === "" ? paperId : String(paperId),
    questionId: String(item?.id ?? item?.sub_question_id ?? ""),
    source: Number.isFinite(Number(item?.source)) ? Number(item.source) : 0,
    sort: Number(item?.sort) || index + 1,
    score: Number(item?.score) || 0,
  };
};

/** 组卷全量保存 → updatePaperFullData / updatePaperFullDataByMyQuestions */
export const buildPaperFullDataPayload = ({
  paper,
  questionItems,
  draftFlag = false,
  questionTypeList = [],
  includePersonalQuestionList = true,
  normalizeImageSrc = false,
}: {
  paper: Record<string, any>;
  questionItems: any[];
  draftFlag?: boolean;
  questionTypeList?: any[];
  /** 搜题组卷暂不传 personalQuestionList */
  includePersonalQuestionList?: boolean;
  /** 仅「保存并出题」时把 personal-questions 图片 src 归一为相对路径 */
  normalizeImageSrc?: boolean;
}) => {
  const payload: Record<string, any> = {
    paper,
    paperQuestionList: questionItems.map((item, index) =>
      buildPaperQuestionListItem(item, paper.id, index),
    ),
    draftFlag,
  };
  if (includePersonalQuestionList) {
    payload.personalQuestionList = questionItems.map((item) =>
      buildPersonalQuestionApiItem(item, questionTypeList, { normalizeImageSrc }),
    );
  }
  return payload;
};

/** 录入本题：映射为 PersonalQuestion 实体字段 */
export const buildPersonalQuestionInsertPayload = ({
  subQuestion,
  left_data,
  right_data,
  knowledgePointChapter,
  oriKpoints = [],
  correct_answers,
  questionTypeList = [],
}: BuildSavePayloadParams) => {
  const mergedItem = {
    ...subQuestion,
    question_text: left_data?.question_text ?? subQuestion?.question_text,
    options: left_data?.options ?? subQuestion?.options,
    correct_answers,
    explanation: right_data?.explanation ?? subQuestion?.explanation,
    question_type: right_data?.question_type ?? subQuestion?.question_type,
    difficulty: right_data?.difficulty ?? subQuestion?.difficulty,
    score: right_data?.score ?? subQuestion?.score,
    knowledge_chapter: knowledgePointChapter,
    ori_kpoints: oriKpoints,
  };

  return buildPersonalQuestionApiItem(mergedItem, questionTypeList);
};
