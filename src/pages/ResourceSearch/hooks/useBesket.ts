import { useDispatch, useSelector } from "umi";
import { message } from "antd";

export const useBesket = () => {
  const dispatch = useDispatch();
  const {
    gradeName,
    subjectName,
    questionBasket,
    activeTab
  } = useSelector((state: any) => state.resourceSearchModel);

  const getQuestionGroups = (basketData: any = questionBasket) => {
    const questionGroups = basketData?.ques_type_stat;
    if (!questionGroups || typeof questionGroups !== "object" || Array.isArray(questionGroups)) {
      return {};
    }
    return questionGroups;
  };

  const getQuestionBasketList = (basketData: any = questionBasket) => {
    const groups = getQuestionGroups(basketData);
    return Object.values(groups).flatMap((group: any) =>
      Array.isArray(group?.list) ? group.list : [],
    );
  };

  const getQuestionBasketCount = (basketData: any = questionBasket) => {
    const groups = getQuestionGroups(basketData);
    return Object.values(groups).reduce((total: number, group: any) => {
      const count = Number(group?.count);
      if (Number.isFinite(count)) {
        return total + count;
      }
      return total + (Array.isArray(group?.list) ? group.list.length : 0);
    }, 0);
  };

  // 获取试题篮
  const loadQuestionBasket = async () => {
    dispatch({
      type: "resourceSearchModel/setData",
      payload: { questionBasketLoading: true }
    });

    const result: any = await dispatch({
      type: "resourceSearchModel/postData",
      apiUrl: "getQuestionBasket",
      payload: {
        stage_name: gradeName,
        subject_name: subjectName,
        bank_source: activeTab === 'public' ? 1 : 2
      },
    });
    if (result?.code === 200) {
      dispatch({
        type: "resourceSearchModel/setData",
        payload: {
          questionBasket: result.data
        }
      });
    } else {
      dispatch({
        type: "resourceSearchModel/setData",
        payload: {
          questionBasket: null
        }
      });
    }
    dispatch({
      type: "resourceSearchModel/setData",
      payload: { questionBasketLoading: false }
    });
  };

  // 操作试题篮
  const handleQuestionToBasket = async (actionType: 'add' | 'remove', questionData: any) => {
    const payload = actionType === 'add'
      ? {
        ...questionData, 
        bankSource: activeTab === 'public' ? 1 : 2
      }
      : {
        id: questionData.id,
        stage_name: gradeName,
        subject_name: subjectName,
        bank_source: activeTab === 'public' ? 1 : 2
      }
    const result: any = await dispatch({
      type: "resourceSearchModel/postData",
      apiUrl: actionType === 'add' ? "addQuestionToBasket" : "removeQuestionFromBasket",
      payload
    });
    if (result?.code === 200) {
      dispatch({
        type: 'resourceSearchModel/updateState',
        res: {
          questionBasket: result.data
        }
      })
    } else {
      message.error(result?.msg || "操作失败");
      return null;
    }
  }

  // 清空试题篮
  const clearQuestionBasket = async() => {
    const result: any = await dispatch({
      type: "resourceSearchModel/postData",
      apiUrl: "clearQuestionBasket",
      payload: {
        stage_name: gradeName,
        subject_name: subjectName,
        bank_source: activeTab === 'public' ? 1 : 2
      },
    });
    if (result?.code === 200) {
      dispatch({
        type: 'resourceSearchModel/updateState',
        res: {
          questionBasket: null
        }
      })
    } else {
      message.error(result?.msg || "操作失败");
    }
  };
  // 批量移除试题篮
  const postQuestionbulkremove = async (questionIds: string[]) => {
    const result: any = await dispatch({
      type: "resourceSearchModel/postData",
      apiUrl: "postQuestionbulkremove",
      payload: {
        ids: questionIds,
        stage_name: gradeName,
        subject_name: subjectName,
        bank_source: activeTab === 'public' ? 1 : 2
      },
    });
    if (result?.code === 200) {
      dispatch({
        type: "resourceSearchModel/updateState",
        res: {
          questionBasket: null,
        },
      });
    }
  };

  return {
    loadQuestionBasket,
    handleQuestionToBasket,
    clearQuestionBasket,
    getQuestionBasketList,
    getQuestionBasketCount,
    postQuestionbulkremove,
  };
};
