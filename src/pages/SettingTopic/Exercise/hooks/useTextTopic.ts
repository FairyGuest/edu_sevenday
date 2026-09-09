import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Form } from "antd";
import { useTopicForm } from "./useTopicForm";
import { useTopicAutoSave, type AutoSaveSnapshot } from "./useTopicAutoSave";
import { persistSubQuestion, getSubQuestionKnowledgeChapter, resolveQuestionTypeValue, resolveQuestionTypeName } from "./topicFormHelpers";
import { flushTopicRichEditors } from "./flushTopicRichEditors";

export const useTextTopic = (onRef: any) => {
  const topicForm = useTopicForm();
  const {
    questions,
    activeIndex,
    subQuestionIndex,
    topicKey,
    rootTaskId,
    topicData,
    subQuestion,
    knowledgePointChapter,
    setQuestions,
    setKnowledgePointChapter,
    questionTypeList,
  } = topicForm;

  const [formLeft] = Form.useForm();
  const [formRight] = Form.useForm();
  const transferModalRef = useRef<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [oriKpoints, setOriKpoints] = useState<any[]>([]);

  const getTextCorrectAnswers = (snapshot?: AutoSaveSnapshot) => {
    const raw =
      snapshot?.formData?.correct_answers ?? formRight.getFieldValue("correct_answers");
    const answerText = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
    return answerText ? [answerText] : [];
  };

  const saveQuestionData = (status: string, snapshot?: AutoSaveSnapshot) => {
    const meta = snapshot?.saveMeta;
    const left_data = snapshot?.formData?.left_data ?? formLeft.getFieldsValue();
    const right_data = snapshot?.formData?.right_data ?? formRight.getFieldsValue();
    const correct_answers = getTextCorrectAnswers(snapshot);
    const newAllData = persistSubQuestion(
      questions,
      meta?.activeIndex ?? activeIndex,
      meta?.subQuestionIndex ?? subQuestionIndex,
      meta?.subQuestion ?? subQuestion,
      left_data,
      right_data,
      {
        correct_answers,
        knowledgePointChapter:
          snapshot?.knowledgePointChapter ?? meta?.knowledgePointChapter ?? knowledgePointChapter,
        ori_kpoints: snapshot?.oriKpoints ?? oriKpoints,
      },
      status || undefined,
    );
    setQuestions(newAllData);
  };

  const initForm = () => {
    setOriKpoints(subQuestion?.ori_kpoints ?? []);
    formLeft.setFieldsValue({
      question_text: subQuestion?.question_text ?? "",
    });
    setKnowledgePointChapter(getSubQuestionKnowledgeChapter(subQuestion));
    formRight.setFieldsValue({
      question_type: resolveQuestionTypeValue(subQuestion, questionTypeList),
      correct_answers: subQuestion?.correct_answers?.join("<br />") || "",
      explanation: subQuestion?.explanation || "",
      difficulty: subQuestion?.difficulty || "容易",
      score:
        subQuestion?.score != null && subQuestion?.score !== ""
          ? Number(subQuestion.score)
          : undefined,
    });
  };

  const { handleEditorBlur, triggerAutoSave, saveKnowledgeData, cancelPendingAutoSave, triggerAutoSaveNow } =
    useTopicAutoSave({
      formLeft,
      formRight,
      saveQuestionData,
      oriKpoints,
    });

  useEffect(() => {
    cancelPendingAutoSave();
    initForm();
  }, [topicKey, activeIndex, topicData?.question_group_id, subQuestion?.sub_question_id]);

  useEffect(() => {
    initForm();
  }, [subQuestion?.question_type]);

  useEffect(() => {
    const hasIncomingValue = subQuestion?.question_text || subQuestion?.correct_answers?.length || subQuestion?.explanation;
    const hasFormValue = formLeft.getFieldValue("question_text") || formRight.getFieldValue("correct_answers") || formRight.getFieldValue("explanation");

    if (hasIncomingValue && !hasFormValue) {
      initForm();
    }
  }, [subQuestion?.question_text, subQuestion?.correct_answers, subQuestion?.explanation]);

  const buildLeavingSaveSnapshot = (): AutoSaveSnapshot => ({
    saveMeta: {
      rootTaskId,
      activeIndex,
      subQuestionIndex,
      topicKey,
      topicData,
      subQuestion,
      knowledgePointChapter,
    },
    oriKpoints,
    knowledgePointChapter,
    formData: {
      left_data: formLeft.getFieldsValue(),
      right_data: formRight.getFieldsValue(),
      correct_answers: [formRight.getFieldValue("correct_answers")],
    },
  });

  const persistCurrentQuestion = (type: string) => {
    cancelPendingAutoSave();
    flushTopicRichEditors();
    triggerAutoSaveNow(buildLeavingSaveSnapshot(), type);
  };

  useImperativeHandle(
    onRef,
    () => ({
      saveQuestionData: (type: string) => {
        if (type === "selected" || type === "done") {
          saveQuestionData(type);
          return;
        }
        persistCurrentQuestion(type);
      },
      validateForm: async () => {
        try {
          const right_data = await formRight.validateFields();
          const left_data = await formLeft.validateFields();
          return {
            success: true,
            values: {
              right_data,
              left_data,
              knowledgePointChapter,
              ori_kpoints: oriKpoints,
            },
          };
        } catch {
          return { success: false, values: null };
        }
      },
      previewDrawerFn: () => setDrawerVisible(true),
      getRightData: async () => formRight.validateFields(),
      triggerAutoSaveNow: () => persistCurrentQuestion(""),
    }),
    [questions, activeIndex, subQuestionIndex, subQuestion, knowledgePointChapter, oriKpoints],
  );

  const tagsDelete = (type: string, dele?: any) => {
    let nextOriKpoints = oriKpoints;
    if (type === "1") {
      nextOriKpoints = oriKpoints.filter((item: any) => item?.key !== dele?.key);
      setOriKpoints(nextOriKpoints);
    }
    if (type === "2") {
      nextOriKpoints = [];
      setOriKpoints([]);
    }
    saveKnowledgeData(knowledgePointChapter, nextOriKpoints);
  };

  const handleKnowledgePointChapterChange = (data: any[]) => {
    setKnowledgePointChapter(data);
    saveKnowledgeData(data);
  };

  const handleKnowledgeAfterChange = (snapshot?: AutoSaveSnapshot) => {
    const nextOriKpoints = snapshot?.oriKpoints ?? oriKpoints;
    if (snapshot?.oriKpoints !== undefined) {
      setOriKpoints(snapshot.oriKpoints);
    }
    saveKnowledgeData(snapshot?.knowledgePointChapter ?? knowledgePointChapter, nextOriKpoints);
  };

  const previewSubQuestionData = () => ({
    ...subQuestion,
    ...formLeft.getFieldsValue(),
    ...formRight.getFieldsValue(),
    correct_answers: [formRight.getFieldValue("correct_answers")],
    quesType: resolveQuestionTypeName(
      subQuestion?.question_type,
      questionTypeList,
      subQuestion?.quesType,
    ),
  });

  return {
    ...topicForm,
    formLeft,
    formRight,
    transferModalRef,
    drawerVisible,
    setDrawerVisible,
    oriKpoints,
    tagsDelete,
    previewSubQuestionData,
    saveQuestionData,
    handleEditorBlur,
    triggerAutoSave,
    handleKnowledgePointChapterChange,
    handleKnowledgeAfterChange,
    saveKnowledgeData,
  };
};
