import { message } from "antd";
import { useDispatch, useSelector } from "umi";

export const useQuestionActions = () => {
  const dispatch = useDispatch();
  const { activeTab, questionList } = useSelector((state: any) => state.resourceSearchModel);

  // 试题收藏/取消收藏
  const toggleQuestionFavorite = async (questionId: string, questionData: any, onRefreshList?: () => void) => {
    const result: any = await dispatch({
      type: "resourceSearchModel/postData",
      apiUrl: "postFavorite",
      payload: {
        question_id: questionId,
        question_data: questionData
      },
      isInfo: true, // 显示成功提示
    });

    if (result?.code === 200) {
      // 如果是在个人列表页面且取消收藏成功，刷新列表
      if (activeTab === "personal" && !result.data?.is_favorite && onRefreshList) {
        onRefreshList();
      }

      // 返回接口返回的 is_favorite 状态
      return result.data?.is_favorite;
    }
  };

  // 删除试题
  const toggleQuestionDelete = async (questionId: string, onRefreshList?: () => void, loadQuestionBasket?: () => void) => {
    const result: any = await dispatch({
      type: "resourceSearchModel/getData",
      apiUrl: "postPersonalDelete",
      payload: {
        id: questionId,
      },
      isInfo: true, // 显示成功提示
    });

    if (result?.code === 200) {
      // 刷新列表
      if (activeTab === "personal" && onRefreshList) {
        onRefreshList();
        // loadQuestionBasket?.();
      }
    }
  };

  return {
    toggleQuestionFavorite,
    toggleQuestionDelete
  };
};
