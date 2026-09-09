import { useEffect, useRef, useImperativeHandle } from "react";
import { Form, message } from "antd";
// import { addNewTracking } from "@/utils";
import { useTopic } from "./useTopic";
import { flushTopicRichEditors } from "./flushTopicRichEditors";
import { isSelectQuestionType } from "./topicFormHelpers";

export const useTopicHeader = (onRef?: any) => {
  const [form] = Form.useForm();
  const selectTopicRef = useRef<any>(null);
  const shortAnswerTopicRef = useRef<any>(null);
  const pendingQuestionTypeSaveRef = useRef(false);

  const {
    activeIndex,
    topicKey,
    subQuestion,
    isSubQuestionRecorded,
    formDisabled,
    saveButtonDisabled,
    questionTypeDisabled,
    questionTypeList,
    saveLoading,
    selectSave,
    shortAnswerSave,
    onCancelSelect,
    questionTypeChange,
    initFormQuestionType,
  } = useTopic();

  const isSelectType = isSelectQuestionType(
    subQuestion?.question_type,
    questionTypeList,
  );

  useEffect(() => {
    if (!questionTypeList?.length) return;
    const type = initFormQuestionType();
    console.log("type", type);
    form.setFieldsValue({ question_type: type });
  }, [activeIndex, topicKey, questionTypeList]);

  const handleQuestionTypeChange = (changedValue: any) => {
    questionTypeChange(changedValue);
    pendingQuestionTypeSaveRef.current = true;
  };

  useEffect(() => {
    if (!pendingQuestionTypeSaveRef.current) return;

    pendingQuestionTypeSaveRef.current = false;

    const timer = setTimeout(() => {
      const activeRef = isSelectQuestionType(subQuestion?.question_type, questionTypeList)
        ? selectTopicRef.current
        : shortAnswerTopicRef.current;
      activeRef?.triggerAutoSaveNow?.();
    }, 0);

    return () => clearTimeout(timer);
  }, [subQuestion?.question_type, questionTypeList]);

  useImperativeHandle(
    onRef,
    () => ({
      saveQuestionData: (type: string) => {
        if (isSelectQuestionType(subQuestion?.question_type, questionTypeList)) {
          selectTopicRef.current?.saveQuestionData(type);
          return;
        }
        shortAnswerTopicRef.current?.saveQuestionData(type);
      },
    }),
    [subQuestion?.question_type, questionTypeList],
  );

  const onClickSave = async () => {
    flushTopicRichEditors();
    await form.validateFields();
    if (isSelectQuestionType(subQuestion?.question_type, questionTypeList)) {
      if (!selectTopicRef?.current) return;
      const result = await selectTopicRef.current?.validateForm();
      if (result?.success) {
        selectSave(result.values, selectTopicRef);
      } else {
        message.warning("请完善必填项");
      }
    } else {
      if (!shortAnswerTopicRef?.current) return;
      const result = await shortAnswerTopicRef.current?.validateForm();
      if (result?.success) {
        shortAnswerSave(result.values, shortAnswerTopicRef);
      } else {
        message.warning("请完善必填项");
      }
    }
  };

  const onPreview = () => {
    // addNewTracking({
      // bt: "cl",
      // ct: "upload_search_q_exercise_input_preview_click",
    // });
    // addNewTracking({
      // bt: "pv",
      // ct: "upload_search_q_q_preview_show",
    // });
    if (isSelectQuestionType(subQuestion?.question_type, questionTypeList)) {
      selectTopicRef.current?.previewDrawerFn?.();
    } else {
      shortAnswerTopicRef.current?.previewDrawerFn?.();
    }
  };

  return {
    form,
    selectTopicRef,
    shortAnswerTopicRef,
    subQuestion,
    isSubQuestionRecorded,
    formDisabled,
    saveButtonDisabled,
    questionTypeDisabled,
    questionTypeList,
    saveLoading,
    isSelectType,
    questionTypeChange: handleQuestionTypeChange,
    onClickSave,
    onPreview,
    onCancelSelect: () => onCancelSelect(selectTopicRef, shortAnswerTopicRef),
  };
};
