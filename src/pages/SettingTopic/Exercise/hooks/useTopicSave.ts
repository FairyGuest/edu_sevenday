import { message } from "antd";
import { useTopicForm } from "./useTopicForm";
import {
  buildPhotoSearchSavePayload,
  collectChapterAndKpoints,
} from "./topicSavePayload";

export const useTopicSave = () => {
  const {
    rootTaskId,
    activeIndex,
    topicData,
    subQuestion,
    knowledgePointChapter,
    questionTypeList,
    setTopicData,
  } = useTopicForm();

  const flushRealtimeSave = async (payload: Record<string, any>) => {
    // 暂时去掉 photo_search_question_update
    void payload;
    // await dispatch({
    //   type: "settingTopicModel/postData",
    //   apiUrl: "postPhotoSearchQuestionUpdate",
    //   payload: {
    //     ...payload,
    //     save_mode: "flush",
    //   },
    // });
  };

  const validateChapterAndKpoints = (val: any) => {
    const { chapterList, knowledgePointList } = collectChapterAndKpoints(knowledgePointChapter);
    const oriKpoints = val?.ori_kpoints ?? [];
    if (chapterList.length === 0) {
      message.warning("请选择教材单元目录");
      return null;
    }
    if (knowledgePointList.length === 0 && oriKpoints.length === 0) {
      message.warning("请选择知识点");
      return null;
    }
    return { chapterList, knowledgePointList, oriKpoints };
  };

  const selectSave = async (val: any, selectTopicRef: any) => {
    const { left_data, right_data } = val;
    const validated = validateChapterAndKpoints(val);
    if (!validated) return;

    const { question_text, options } = left_data ?? {};
    const v2 = await right_data;

    const optionTexts = (options ?? []).map((item: any) => (item || "").trim());
    const duplicateOptions = optionTexts.filter(
      (text: string, index: number) =>
        optionTexts.indexOf(text) !== index && text !== "",
    );
    if (duplicateOptions.length > 0) {
      message.warning("存在相同的选项，请修改后再录入");
      return;
    }

    setTopicData({ saveLoading: true });

    const correct_answers = await selectTopicRef.current?.getAnswer?.();

    const payload = buildPhotoSearchSavePayload({
      rootTaskId,
      topicData,
      activeIndex,
      subQuestion,
      left_data: { question_text, options },
      right_data: { ...v2 },
      knowledgePointChapter,
      oriKpoints: val?.ori_kpoints,
      mergeOriKpointsIntoKpoints: true,
      correct_answers,
      questionTypeList,
    });

    await flushRealtimeSave(payload);

    message.success("录入成功");
    selectTopicRef.current?.saveQuestionData("selected");
    setTopicData({ saveLoading: false });
  };

  const shortAnswerSave = async (val: any, shortAnswerTopicRef: any) => {
    const { left_data, right_data } = val;
    const validated = validateChapterAndKpoints(val);
    if (!validated) return;

    const { question_text } = left_data ?? {};
    const v2 = await right_data;

    setTopicData({ saveLoading: true });

    const payload = buildPhotoSearchSavePayload({
      rootTaskId,
      topicData,
      activeIndex,
      subQuestion,
      left_data: { question_text },
      right_data: { ...v2 },
      knowledgePointChapter,
      oriKpoints: val?.ori_kpoints,
      mergeOriKpointsIntoKpoints: true,
      correct_answers: v2?.correct_answers,
      questionTypeList,
    });

    await flushRealtimeSave(payload);

    message.success("录入成功");
    shortAnswerTopicRef.current?.saveQuestionData("selected");
    setTopicData({ saveLoading: false });
  };

  const onCancelSelect = (selectTopicRef: any, shortAnswerTopicRef: any) => {
    message.success("取消录入成功");
    selectTopicRef.current?.saveQuestionData("done");
    shortAnswerTopicRef.current?.saveQuestionData("done");
  };

  return {
    selectSave,
    shortAnswerSave,
    onCancelSelect,
  };
};
