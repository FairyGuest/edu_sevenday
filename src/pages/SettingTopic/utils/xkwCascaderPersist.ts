const STORAGE_KEY = "setting_topic_xkw_cascader";

export type XkwCascaderPersistState = {
  xkwCascaderValue?: any[];
  xkwCourseId?: any;
  xkwSubjectId?: string | number;
  xkwTextbookId?: string | number;
  xkwTextbookName?: string;
  xkwStageId?: string | number;
  xkwStageName?: string;
  xkwSubjectName?: string;
  chooseTextbookVersion?: Record<string, any>;
};

const PERSIST_KEYS: (keyof XkwCascaderPersistState)[] = [
  "xkwCascaderValue",
  "xkwCourseId",
  "xkwSubjectId",
  "xkwTextbookId",
  "xkwTextbookName",
  "xkwStageId",
  "xkwStageName",
  "xkwSubjectName",
  "chooseTextbookVersion",
];

export const loadXkwCascaderPersist = (): XkwCascaderPersistState | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const pickPersistableXkwState = (
  payload: Record<string, any>,
): XkwCascaderPersistState => {
  const result: XkwCascaderPersistState = {};
  PERSIST_KEYS.forEach((key) => {
    if (payload[key] !== undefined) {
      (result as any)[key] = payload[key];
    }
  });
  return result;
};

export const saveXkwCascaderPersist = (patch: XkwCascaderPersistState) => {
  try {
    const prev = loadXkwCascaderPersist() || {};
    const next = { ...prev, ...patch };
    if (
      next.xkwCascaderValue?.length >= 3 ||
      next.xkwTextbookId ||
      next.xkwSubjectId
    ) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    // ignore storage errors
  }
};

/** 空字符串视为未设置，避免刷新后 Redux 默认值覆盖 sessionStorage */
const coalesceId = (...vals: any[]) => {
  for (const v of vals) {
    if (v != null && v !== "") return v;
  }
  return "";
};

export const getResolvedXkwCascaderState = (
  current: XkwCascaderPersistState = {},
): XkwCascaderPersistState => {
  const persisted = loadXkwCascaderPersist() || {};
  const xkwCascaderValue =
    current.xkwCascaderValue?.length >= 3
      ? current.xkwCascaderValue
      : persisted.xkwCascaderValue?.length >= 3
        ? persisted.xkwCascaderValue
        : current.xkwCascaderValue || persisted.xkwCascaderValue || [];

  return {
    ...persisted,
    ...current,
    xkwCascaderValue,
    xkwCourseId: coalesceId(
      current.xkwCourseId,
      persisted.xkwCourseId,
      xkwCascaderValue?.[0],
    ),
    xkwTextbookId: coalesceId(
      current.xkwTextbookId,
      persisted.xkwTextbookId,
      xkwCascaderValue?.[2],
    ),
    xkwSubjectId: coalesceId(current.xkwSubjectId, persisted.xkwSubjectId),
    xkwTextbookName:
      current.xkwTextbookName || persisted.xkwTextbookName || "",
    chooseTextbookVersion:
      current.chooseTextbookVersion ?? persisted.chooseTextbookVersion ?? {},
  };
};

export const restoreXkwCascaderState = (
  dispatch: any,
  current: XkwCascaderPersistState = {},
) => {
  const resolved = getResolvedXkwCascaderState(current);
  const needsRestore =
    !current.xkwCascaderValue?.length ||
    !current.xkwTextbookId ||
    !current.xkwCourseId ||
    !current.xkwSubjectId;

  if (
    needsRestore &&
    (resolved.xkwCascaderValue?.length ||
      resolved.xkwTextbookId ||
      resolved.xkwSubjectId)
  ) {
    dispatch({
      type: "settingTopicModel/setData",
      payload: resolved,
    });
  }

  return resolved;
};

const EXERCISE_TASK_KEY = "setting_topic_exercise_task";

export type ExerciseTaskPersist = {
  subjectId?: string | number;
  paperId?: string | number;
  paperName?: string;
};

export const loadExerciseTaskPersist = (
  taskId?: string | null,
): ExerciseTaskPersist | null => {
  if (!taskId) return null;
  try {
    const raw = sessionStorage.getItem(EXERCISE_TASK_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[String(taskId)] || null;
  } catch {
    return null;
  }
};

export const saveExerciseTaskPersist = (
  taskId: string | null | undefined,
  patch: ExerciseTaskPersist,
) => {
  if (!taskId) return;
  try {
    const raw = sessionStorage.getItem(EXERCISE_TASK_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[String(taskId)] = { ...(map[String(taskId)] || {}), ...patch };
    sessionStorage.setItem(EXERCISE_TASK_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
};
