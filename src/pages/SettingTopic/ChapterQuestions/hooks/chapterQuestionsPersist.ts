const STORAGE_KEY = "setting_topic_chapter_questions_form";

export type ChapterQuestionsFormPersist = {
  textbookId?: string | number;
  checkedKeys?: string[];
  paperTypesValue?: any;
  tiDifficultyValue?: string;
  tiDifficultyModerationValue?: string;
  areaValue?: any;
  yearsRow?: any;
  questionTypesList?: any[];
  selectedClassId?: any;
};

export const loadChapterQuestionsPersist = (): ChapterQuestionsFormPersist | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveChapterQuestionsPersist = (patch: ChapterQuestionsFormPersist) => {
  try {
    const prev = loadChapterQuestionsPersist() || {};
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...patch }));
  } catch {
    // ignore storage errors
  }
};

export const clearChapterQuestionsPersist = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
};

/** 将持久化的题型数量合并到接口返回的题型列表 */
export const mergePersistedQuestionTypes = (
  leafTypes: any[],
  persistedList?: any[],
) => {
  if (!persistedList?.length) {
    return leafTypes.map((item) => ({
      ...item,
      count: item?.count ?? 0,
      easy: item?.easy ?? 0,
      medium: item?.medium ?? 0,
      hard: item?.hard ?? 0,
      easy_moderate: item?.easy_moderate ?? 0,
      moderate_hard: item?.moderate_hard ?? 0,
      total: item?.total ?? 0,
    }));
  }

  return leafTypes.map((item) => {
    const persisted = persistedList.find(
      (p) =>
        String(p?.id ?? p?.en_name) === String(item?.id ?? item?.en_name) ||
        p?.en_name === item?.en_name,
    );
    if (!persisted) {
      return {
        ...item,
        count: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        easy_moderate: 0,
        moderate_hard: 0,
        total: 0,
      };
    }
    return {
      ...item,
      count: persisted.count ?? 0,
      easy: persisted.easy ?? 0,
      medium: persisted.medium ?? 0,
      hard: persisted.hard ?? 0,
      easy_moderate: persisted.easy_moderate ?? 0,
      moderate_hard: persisted.moderate_hard ?? 0,
      total: persisted.total ?? 0,
    };
  });
};
