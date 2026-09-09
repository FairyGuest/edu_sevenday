import { useEffect, useState } from "react";
import {
  selectOptionsData,
  single_choice_list_name,
  multiple_choice_list_name,
  fill_in_the_blank_list_name,
  short_answer_list_name,
  true_false_list_name,
} from "@/global";
import { prepareMathHtmlForRender } from "@/utils";
import { resolveQuestionTypeName } from "./topicFormHelpers";
import { useTopicForm } from "./useTopicForm";

export const useTopicDrawer = (visible: boolean, subQuestionData: any) => {
  const { questionTypeList = [] } = useTopicForm();
  const [selectOptions] = useState(selectOptionsData);
  const [questionList, setQuestionList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const resolvePreviewQuesType = (item: any) =>
    resolveQuestionTypeName(
      item?.question_type,
      questionTypeList,
      item?.quesType || item?.type,
    );

  const getAnswer = (item: any, quesType: string) => {
    if (single_choice_list_name.includes(quesType)) {
      return selectOptions?.[
        item?.options?.findIndex((val: any) => val === item?.correct_answers?.[0])
      ];
    }
    if (multiple_choice_list_name.includes(quesType)) {
      let flagString = "";
      item?.correct_answers?.forEach((val: any) => {
        const idx = item?.options?.findIndex((k: any) => k === val);
        if (idx !== -1) {
          flagString += selectOptions?.[idx];
        }
      });
      return flagString;
    }
    if (
      short_answer_list_name.includes(quesType) ||
      true_false_list_name.includes(quesType) ||
      fill_in_the_blank_list_name.includes(quesType)
    ) {
      return item?.correct_answers?.[0];
    }
    return item?.correct_answers?.[0];
  };

  const normalizePreviewFormulaHtml = (item: any) => ({
    ...item,
    question_text: prepareMathHtmlForRender(item?.question_text),
    explanation: prepareMathHtmlForRender(item?.explanation),
    options: item?.options?.map?.((option: any) =>
      prepareMathHtmlForRender(option),
    ),
  });

  const dealwithQuestionList = (list: any[]) =>
    list?.map((item: any) => {
      const previewItem = normalizePreviewFormulaHtml(item);
      const quesType = resolvePreviewQuesType(previewItem);
      const options = Array.isArray(previewItem?.options)
        ? previewItem.options
        : [];
      return {
        ...previewItem,
        quesType,
        type: quesType,
        info: "",
        question_rules: item?.question_rules,
        optionsList:
          options.length > 0
            ? options.map((val: any, key: number) => ({
                label: selectOptions[key],
                content: val,
              }))
            : false,
        answer: prepareMathHtmlForRender(getAnswer(previewItem, quesType)),
      };
    });

  const loadData = (data: any[]) => {
    setLoading(true);
    setQuestionList(dealwithQuestionList(data));
    setLoading(false);
  };

  useEffect(() => {
    if (!visible) return;
    loadData([
      {
        ...subQuestionData,
        question_knowledge_points: subQuestionData?.key_point_names || [],
      },
    ]);
  }, [visible, subQuestionData, questionTypeList]);

  const showDetailsFn = (e: any, item: any) => {
    e.stopPropagation();
    e.preventDefault();
    setQuestionList((prev) =>
      prev.map((prevItem) => ({
        ...prevItem,
        showDetails:
          prevItem?.id === item?.id ? !prevItem?.showDetails : prevItem?.showDetails,
      })),
    );
  };

  return {
    questionList,
    loading,
    showDetailsFn,
    container: document.getElementsByClassName("exercise")[0],
  };
};
