import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Form } from "antd";
import { useTopicForm } from "./useTopicForm";
import { useTopicAutoSave, type AutoSaveSnapshot } from "./useTopicAutoSave";
import {
  persistSubQuestion,
  getSubQuestionKnowledgeChapter,
  ensureSelectQuestionOptions,
  isMultipleChoiceQuestionType,
  resolveQuestionTypeName,
} from "./topicFormHelpers";
import { flushTopicRichEditors } from "./flushTopicRichEditors";

const initAnswerIndexes = (param: any) => {
  const optionsArr = param?.options || [];
  const answerArr = param?.correct_answers || [];
  const answerIndexes: number[] = [];

  for (const [index, value] of optionsArr.entries()) {
    for (const answer of answerArr) {
      if (value == answer) {
        answerIndexes.push(index);
        break;
      }
    }
  }
  return answerIndexes;
};

export const useSelectTopic = (onRef: any) => {
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
    questionType,
    questionTypeList,
    setQuestions,
    setKnowledgePointChapter,
  } = topicForm;

  const [formLeft] = Form.useForm();
  const [formRight] = Form.useForm();
  const transferModalRef = useRef<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [oriKpoints, setOriKpoints] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);

  const getAnswer = () => {
    const optionsArr = formLeft.getFieldValue("options") || [];
    const answerArr = formRight.getFieldValue("correct_answers") || [];
    const answerList: any[] = [];

    for (const [index, value] of optionsArr.entries()) {
      for (const answer of answerArr) {
        if (answer == index) {
          answerList.push(value);
          break;
        }
      }
    }
    return answerList;
  };

  const saveQuestionData = (status: string, snapshot?: AutoSaveSnapshot) => {
    const meta = snapshot?.saveMeta;
    const left_data = snapshot?.formData?.left_data ?? formLeft.getFieldsValue();
    const right_data = snapshot?.formData?.right_data ?? formRight.getFieldsValue();
    const newAllData = persistSubQuestion(
      questions,
      meta?.activeIndex ?? activeIndex,
      meta?.subQuestionIndex ?? subQuestionIndex,
      meta?.subQuestion ?? subQuestion,
      left_data,
      right_data,
      {
        correct_answers: snapshot?.formData?.correct_answers ?? getAnswer(),
        knowledgePointChapter:
          snapshot?.knowledgePointChapter ?? meta?.knowledgePointChapter ?? knowledgePointChapter,
        ori_kpoints: snapshot?.oriKpoints ?? oriKpoints,
      },
      status || undefined,
    );
    setQuestions(newAllData);
  };

  const initForm = () => {
    const normalizedSubQuestion = ensureSelectQuestionOptions(subQuestion);
    const optionsTmp = normalizedSubQuestion.options;

    setOptions(optionsTmp);
    setOriKpoints(subQuestion?.ori_kpoints ?? []);
    formLeft.setFieldsValue({
      question_text: subQuestion?.question_text ?? "",
      options: optionsTmp,
    });
    setKnowledgePointChapter(getSubQuestionKnowledgeChapter(subQuestion));
    formRight.setFieldsValue({
      correct_answers: initAnswerIndexes(subQuestion),
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
      getAnswer,
    });

  useEffect(() => {
    cancelPendingAutoSave();
    initForm();
  }, [topicKey, activeIndex, topicData?.question_group_id, subQuestion?.sub_question_id]);

  useEffect(() => {
    initForm();
  }, [subQuestion?.question_type]);

  useEffect(() => {
    const incomingOptions = subQuestion?.options || [];
    const formOptions = formLeft.getFieldValue("options") || [];
    const hasIncomingValue = subQuestion?.question_text || subQuestion?.explanation || incomingOptions.some((option: any) => option);
    const hasFormValue = formLeft.getFieldValue("question_text") || formRight.getFieldValue("explanation") || formOptions.some((option: any) => option);

    if (hasIncomingValue && !hasFormValue) {
      initForm();
    }
  }, [subQuestion?.question_text, subQuestion?.explanation, subQuestion?.options]);

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
      correct_answers: getAnswer(),
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
      getAnswer: () => getAnswer(),
      previewDrawerFn: () => setDrawerVisible(true),
      triggerAutoSaveNow: () => persistCurrentQuestion(""),
    }),
    [questions, activeIndex, subQuestionIndex, subQuestion, knowledgePointChapter, oriKpoints],
  );

  const onFieldsChangeLeft = (changedFields: any) => {
    const changedPath = changedFields?.[0]?.name;
    if (Array.isArray(changedPath) && changedPath[0] === "options") {
      setOptions(formLeft.getFieldValue("options") ?? []);
    }
  };

  const onFieldsChangeRight = (changedFields: any) => {
    const fieldName = changedFields?.[0]?.name?.[0];
    if (fieldName === "correct_answers") {
      triggerAutoSave();
    }
  };

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
    correct_answers: getAnswer(),
    quesType: resolveQuestionTypeName(
      subQuestion?.question_type ?? questionType,
      questionTypeList,
      subQuestion?.quesType,
    ),
  });

  const isMultipleChoice = isMultipleChoiceQuestionType(
    subQuestion?.question_type ?? questionType,
    questionTypeList,
  );

  return {
    ...topicForm,
    formLeft,
    formRight,
    transferModalRef,
    drawerVisible,
    setDrawerVisible,
    options,
    oriKpoints,
    isMultipleChoice,
    tagsDelete,
    onFieldsChangeLeft,
    onFieldsChangeRight,
    previewSubQuestionData,
    saveQuestionData,
    handleEditorBlur,
    triggerAutoSave,
    handleKnowledgePointChapterChange,
    handleKnowledgeAfterChange,
    saveKnowledgeData,
  };
};
