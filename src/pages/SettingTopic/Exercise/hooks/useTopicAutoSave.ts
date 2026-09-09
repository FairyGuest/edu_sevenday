import { useCallback, useEffect, useRef } from "react";
import type { FormInstance } from "antd";
import { isSelectQuestionType } from "./topicFormHelpers";
import { useTopicForm } from "./useTopicForm";
import { buildPhotoSearchSavePayload } from "./topicSavePayload";
import { resolveTextCorrectAnswer } from "./topicImageUtils";
import { flushTopicRichEditors } from "./flushTopicRichEditors";

export type AutoSaveSaveMeta = {
  rootTaskId: any;
  activeIndex: number;
  subQuestionIndex: number;
  topicKey: string;
  topicData: any;
  subQuestion: any;
  knowledgePointChapter: any;
};

export type AutoSaveFormData = {
  left_data: Record<string, any>;
  right_data: Record<string, any>;
  correct_answers?: any;
};

export type AutoSaveSnapshot = {
  knowledgePointChapter?: any[];
  oriKpoints?: any[];
  saveMeta?: AutoSaveSaveMeta;
  formData?: AutoSaveFormData;
};

type SaveContext = {
  activeIndex: number;
  subQuestionIndex: number;
  topicKey: string;
};

type SaveMode = "flush" | "auto";

type AutoSaveParams = {
  formLeft: FormInstance;
  formRight: FormInstance;
  saveQuestionData: (status: string, snapshot?: AutoSaveSnapshot) => void;
  oriKpoints?: any[];
  getAnswer?: () => any[];
};

export const useTopicAutoSave = ({
  formLeft,
  formRight,
  saveQuestionData,
  oriKpoints = [],
  getAnswer,
}: AutoSaveParams) => {
  const topicForm = useTopicForm();
  const { formDisabled } = topicForm;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const savingRef = useRef(false);
  const saveQuestionDataRef = useRef(saveQuestionData);
  const getAnswerRef = useRef(getAnswer);
  const oriKpointsRef = useRef(oriKpoints);
  const topicFormRef = useRef(topicForm);
  const pendingSaveContextRef = useRef<SaveContext | null>(null);

  saveQuestionDataRef.current = saveQuestionData;
  getAnswerRef.current = getAnswer;
  oriKpointsRef.current = oriKpoints;
  topicFormRef.current = topicForm;

  const getSaveContext = (): SaveContext => ({
    activeIndex: topicFormRef.current.activeIndex,
    subQuestionIndex: topicFormRef.current.subQuestionIndex,
    topicKey: topicFormRef.current.topicKey,
  });

  const isSameSaveContext = (left: SaveContext | null, right: SaveContext) =>
    !!left &&
    left.activeIndex === right.activeIndex &&
    left.subQuestionIndex === right.subQuestionIndex &&
    left.topicKey === right.topicKey;

  const cancelPendingAutoSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    pendingSaveContextRef.current = null;
  }, []);

  const buildAutoSavePayload = async (snapshot?: AutoSaveSnapshot | null) => {
    const meta = snapshot?.saveMeta ?? topicFormRef.current;
    const {
      rootTaskId: currentRootTaskId,
      activeIndex: currentActiveIndex,
      topicData: currentTopicData,
      subQuestion: currentSubQuestion,
      knowledgePointChapter: currentKnowledgePointChapter,
    } = meta;

    const knowledgePointChapterData =
      snapshot?.knowledgePointChapter ?? currentKnowledgePointChapter;
    const oriKpointsData = snapshot?.oriKpoints ?? oriKpointsRef.current ?? [];

    const left_data = snapshot?.formData?.left_data ?? formLeft.getFieldsValue();
    const right_data = snapshot?.formData?.right_data ?? formRight.getFieldsValue();
    const isSelectType = isSelectQuestionType(
      currentSubQuestion?.question_type,
      topicFormRef.current.questionTypeList,
    );

    const question_text = left_data?.question_text ?? "";
    const explanation = right_data?.explanation ?? "";

    let correct_answers: any;
    let options = left_data?.options;

    if (isSelectType) {
      options = (left_data?.options || []).map((item: any) =>
        item == null ? "" : item,
      );
      correct_answers =
        snapshot?.formData?.correct_answers ??
        (getAnswerRef.current ? getAnswerRef.current() : []);
    } else {
      correct_answers = resolveTextCorrectAnswer(
        snapshot?.formData?.correct_answers ?? right_data?.correct_answers,
      );
    }

    return buildPhotoSearchSavePayload({
      rootTaskId: currentRootTaskId,
      topicData: currentTopicData,
      activeIndex: currentActiveIndex,
      subQuestion: currentSubQuestion,
      left_data: { ...left_data, question_text, options },
      right_data: { ...right_data, explanation },
      knowledgePointChapter: knowledgePointChapterData,
      oriKpoints: oriKpointsData,
      mergeOriKpointsIntoKpoints: true,
      correct_answers,
      questionTypeList: topicFormRef.current.questionTypeList,
    });
  };

  const runAutoSave = async (
    snapshot?: AutoSaveSnapshot,
    status = "",
    saveMode: SaveMode = "auto",
  ) => {
    if (formDisabled || savingRef.current) return;

    savingRef.current = true;
    try {
      flushTopicRichEditors();
      saveQuestionDataRef.current(status, snapshot);

      const payload = await buildAutoSavePayload(snapshot);

      // console.log('实时保存', {
      //   ...payload,
      //   save_mode: saveMode,
      // })

      // 暂时去掉 photo_search_question_update
      // await dispatch({
      //   type: "settingTopicModel/postData",
      //   apiUrl: "postPhotoSearchQuestionUpdate",
      //   payload: {
      //     ...payload,
      //     save_mode: saveMode,
      //   },
      // });
    } finally {
      savingRef.current = false;
    }
  };

  const saveKnowledgeData = useCallback(
    (knowledgePointChapterData: any[], nextOriKpoints?: any[]) => {
      const form = topicFormRef.current;
      const snapshot: AutoSaveSnapshot = {
        saveMeta: {
          rootTaskId: form.rootTaskId,
          activeIndex: form.activeIndex,
          subQuestionIndex: form.subQuestionIndex,
          topicKey: form.topicKey,
          topicData: form.topicData,
          subQuestion: form.subQuestion,
          knowledgePointChapter: knowledgePointChapterData,
        },
        knowledgePointChapter: knowledgePointChapterData,
        ...(nextOriKpoints !== undefined ? { oriKpoints: nextOriKpoints } : {}),
      };
      runAutoSave(snapshot, "", "auto");
    },
    [formDisabled, formLeft, formRight],
  );

  const flushAutoSave = useCallback(
    (snapshot?: AutoSaveSnapshot, status = "", saveMode: SaveMode = "auto") => {
      runAutoSave(snapshot, status, saveMode);
    },
    [formDisabled, formLeft, formRight],
  );

  const triggerAutoSaveNow = useCallback(
    (snapshot?: AutoSaveSnapshot, status = "") => {
      if (formDisabled) return;
      cancelPendingAutoSave();
      flushAutoSave(snapshot, status, "flush");
    },
    [cancelPendingAutoSave, flushAutoSave, formDisabled],
  );

  const triggerAutoSave = useCallback(
    (snapshot?: AutoSaveSnapshot) => {
      if (formDisabled) return;
      const saveContext = getSaveContext();
      pendingSaveContextRef.current = saveContext;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        const pendingContext = pendingSaveContextRef.current;
        pendingSaveContextRef.current = null;
        timerRef.current = undefined;
        if (!isSameSaveContext(pendingContext, getSaveContext())) {
          return;
        }
        flushAutoSave(snapshot, "", "auto");
      }, 300);
    },
    [flushAutoSave, formDisabled],
  );

  const handleEditorBlur = triggerAutoSave;

  useEffect(
    () => () => {
      cancelPendingAutoSave();
    },
    [cancelPendingAutoSave],
  );

  return {
    handleEditorBlur,
    triggerAutoSave,
    triggerAutoSaveNow,
    saveKnowledgeData,
    cancelPendingAutoSave,
  };
};
