import { useCallback, useEffect, useRef, useMemo, createElement, type RefObject, useState } from "react";
import { useDispatch, useSelector } from "umi";
import { Modal, message } from "antd";
import { history } from "@umijs/max";
import { ZYIcon } from "@/components";
// import { addNewTracking } from "@/utils";
import { EXERCISE_INITIAL_STATE } from "../constants";
import {
  getSelectedTopicKey,
  hasSelectedSubQuestion,
  updateQuestionViewingSubQuestionId,
  normalizeQuestionSearchList,
} from "./topicFormHelpers";
import {
  buildPaperFullDataPayload,
  resolveSelectedSubQuestion,
} from "./topicSavePayload";
import { resetLeaveSaveLock, tryAcquireLeaveSaveLock } from "./topicLeaveSaveGuard";
import {
  getResolvedXkwCascaderState,
  restoreXkwCascaderState,
  saveXkwCascaderPersist,
  loadExerciseTaskPersist,
  saveExerciseTaskPersist,
} from "../../utils/xkwCascaderPersist";

// let isStop = false;

export const useExercise = (
  courseId: string | null,
  taskId: string | null,
  rootTaskId: string | null,
  topicRef?: RefObject<{ saveQuestionData: (type: string) => void } | null>,
) => {
  const dispatch = useDispatch();
  const timerIdRef = useRef<any>(null);
  const pendingUploadSuccessNoticeRef = useRef(false);
  // const originImagesRequestIdRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const [originImages, setOriginImages] = useState<any[]>([]);
  const [uploadFileList, setUploadFileList] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const {
    questions,
    progress,
    progressMessage,
    taskStatus,
    activeIndex,
    topicKey,
    saveLoading,
    xkwSubjectId = "",
    paperId,
    paperName = "",
    xkwCascaderValue = [],
    xkwCourseId,
    xkwTextbookId,
    chooseTextbookVersion = {},
    questionTypeList = [],
  } = useSelector((state: any) => state.settingTopicModel);

  const selectData = useMemo(
    () => questions?.filter((item: any) => item?.status === "selected") ?? [],
    [questions],
  );

  const resolveExerciseSubjectId = (overrideSubjectId?: string | number) => {
    if (overrideSubjectId != null && overrideSubjectId !== "") {
      return String(overrideSubjectId);
    }
    const resolved = getResolvedXkwCascaderState({
      xkwSubjectId,
      xkwCascaderValue,
      xkwCourseId,
      xkwTextbookId,
    });
    if (resolved.xkwSubjectId != null && resolved.xkwSubjectId !== "") {
      return String(resolved.xkwSubjectId);
    }
    const taskPersist = loadExerciseTaskPersist(rootTaskId);
    if (taskPersist?.subjectId != null && taskPersist.subjectId !== "") {
      return String(taskPersist.subjectId);
    }
    return "";
  };

  const persistExerciseTaskContext = (patch: {
    subjectId?: string | number;
    paperId?: string | number;
    paperName?: string;
  }) => {
    if (patch.subjectId != null && patch.subjectId !== "") {
      saveXkwCascaderPersist({ xkwSubjectId: patch.subjectId });
    }
    saveExerciseTaskPersist(rootTaskId, patch);
  };

  const syncSubjectId = (subjectId?: string | number) => {
    if (subjectId == null || subjectId === "") return;
    const nextSubjectId = String(subjectId);
    persistExerciseTaskContext({ subjectId: nextSubjectId });
    setExerciseData({ xkwSubjectId: nextSubjectId });
  };

  const bootstrapSubjectIdFromQuestionList = async () => {
    if (!rootTaskId) return "";
    try {
      const { code, data }: any = await dispatch({
        type: "settingTopicModel/postData",
        apiUrl: "postPhotoQuestionFindQuestionSearchList",
        payload: { taskId: rootTaskId },
      });
      if (code === 200 || code === 0) {
        const paperInfo = data?.paper;
        if (paperInfo?.subjectId != null) {
          syncSubjectId(paperInfo.subjectId);
        }
        if (paperInfo?.id != null) {
          persistExerciseTaskContext({
            paperId: paperInfo.id,
            paperName: paperInfo.name ?? "",
          });
          setExerciseData({
            paperId: paperInfo.id,
            paperName: paperInfo.name ?? "",
          });
        }
        return paperInfo?.subjectId != null ? String(paperInfo.subjectId) : "";
      }
    } catch {
      // ignore bootstrap errors
    }
    return "";
  };

  const setExerciseData = (payload: Record<string, any>) => {
    dispatch({
      type: "settingTopicModel/setData",
      payload,
    });
  };

  const setQuestions = (newQuestions: any[]) => {
    setExerciseData({ questions: newQuestions });
  };

  const clearTaskStatusTimer = () => {
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  const finishInitialLoad = () => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      setPageLoading(false);
    }
  };

  // 获取题目搜索列表
  const postPhotoQuestionFindQuestionSearchListFn = async (
    paper?: {
      paperId?: string | number;
      paperName?: string;
    },
    overrideSubjectId?: string | number,
  ) => {
    let subjectId = resolveExerciseSubjectId(overrideSubjectId);
    if (!subjectId) {
      subjectId = await bootstrapSubjectIdFromQuestionList();
    }
    if (!subjectId) {
      message.warning("请先在试卷列表选择课程教材");
      return [];
    }

    const { code, data }: any = await dispatch({
      type: "settingTopicModel/postData",
      apiUrl: "postPhotoQuestionFindQuestionSearchList",
      payload: {
        taskId: rootTaskId,
        subjectId,
      },
    });
    if (code === 200 || code === 0) {
      const paperInfo = data?.paper;
      if (paperInfo?.subjectId != null) {
        syncSubjectId(paperInfo.subjectId);
      }
      if (paperInfo?.id != null) {
        persistExerciseTaskContext({
          paperId: paperInfo.id,
          paperName: paperInfo.name ?? paper?.paperName ?? "",
        });
        setExerciseData({
          paperId: paperInfo.id,
          paperName: paperInfo.name ?? paper?.paperName ?? "",
        });
      }
      const newQuestions = normalizeQuestionSearchList(data);
      const nextActiveIndex = Math.min(
        activeIndex,
        Math.max(0, newQuestions.length - 1),
      );
      setExerciseData({
        questions: newQuestions,
        activeIndex: nextActiveIndex,
        topicKey: getSelectedTopicKey(newQuestions?.[nextActiveIndex]),
      });
      return newQuestions;
    }
    return [];
  };

  // 获取任务状态
  const getTaskStatus = async (overrideSubjectId?: string | number) => {
    try {
      let subjectId = resolveExerciseSubjectId(overrideSubjectId);
      if (!subjectId) {
        subjectId = await bootstrapSubjectIdFromQuestionList();
      }
      if (!subjectId) {
        message.warning("请先在试卷列表选择课程教材");
        return;
      }

      const { code, data }: any = await dispatch({
        type: "settingTopicModel/postData",
        apiUrl: "postTaskStatusUrl",
        payload: {
          taskId: rootTaskId,
          subjectId,
        },
      });
      if (code === 200 && data) {
        const progressValue = Number(data?.progress) || 0;
        const questionList = data?.questions || [];
        const isEditingStatus =
          new URLSearchParams(window.location.search).get("status") === "editing";

        let nextTaskStatus = "processing";
        if (progressValue >= 100) {
          nextTaskStatus = questionList.length > 0 ? "success" : "failed";
        }

        setExerciseData({
          progress: progressValue,
          progressMessage: data?.progress_message || "",
          taskStatus: nextTaskStatus,
        });

        if (nextTaskStatus === "processing") {
          timerIdRef.current = setTimeout(() => {
            getTaskStatus();
          }, 5000);
          return;
        }

        if (nextTaskStatus === "failed") {
          const wasPendingUpload = pendingUploadSuccessNoticeRef.current;
          pendingUploadSuccessNoticeRef.current = false;
          message.error(
            wasPendingUpload && isEditingStatus
              ? "解析失败，请重新再试"
              : "题目生成失败，请重新生成",
          );
          return;
        }

        const prevQuestionCount = questions?.length ?? 0;
        const paper = data?.paper || {};
        if (paper?.subjectId != null) {
          syncSubjectId(paper.subjectId);
        }
        if (paper?.id != null) {
          persistExerciseTaskContext({
            paperId: paper.id,
            paperName: paper.name ?? "",
            subjectId: paper?.subjectId ?? subjectId,
          });
          setExerciseData({
            paperId: paper.id,
            paperName: paper.name ?? "",
          });
        }
        const newQuestions = await postPhotoQuestionFindQuestionSearchListFn(
          {
            paperId: paper.id,
            paperName: paper.name,
          },
          paper?.subjectId ?? subjectId,
        );
        const addedQuestionCount = newQuestions.length - prevQuestionCount;

        if (pendingUploadSuccessNoticeRef.current) {
          pendingUploadSuccessNoticeRef.current = false;
          if (addedQuestionCount > 0) {
            message.success(
              `新增习题已解析完毕，位于页面最后${addedQuestionCount}道题`,
            );
          }
        }
      }
    } finally {
      finishInitialLoad();
    }
  };

  const getOriginImages = useCallback(async (questionGroupId?: string) => {
    // 暂时去掉 photo_search_resource_urls
    setOriginImages([]);
    void questionGroupId;
    // if (!questionGroupId) {
    //   setOriginImages([]);
    //   return;
    // }
    // const requestId = ++originImagesRequestIdRef.current;
    // const { code, data }: any = await dispatch({
    //   type: "settingTopicModel/postData",
    //   apiUrl: "getOriginImagesUrl",
    //   payload: { question_group_id: questionGroupId },
    // });
    // if (requestId !== originImagesRequestIdRef.current) return;
    // if (code === 200 && data) {
    //   setOriginImages(data?.resource_urls || []);
    //   return;
    // }
    // setOriginImages([]);
  }, []);

  const activeQuestionGroupId = questions?.[activeIndex]?.question_group_id;

  // 保存二次弹框
  // const onSavePaper = () => {
  //   Modal.confirm({
  //     title: "录入题目已同步保存到个人题库",
  //     content: "",
  //     onOk: () => {
  //       onSavePaperFn();
  //     },
  //   });
  // }

  // 保存并出题 → /web/paper/insertPaperFullDataByPhoto
  const onSavePaper = async () => {
    if (!paperId) {
      message.warning("缺少试卷信息，请稍后重试");
      return;
    }
    const subjectId = resolveExerciseSubjectId();
    if (!subjectId) {
      message.warning("缺少学科信息，请返回试卷列表重新选择课程教材");
      return;
    }
    if (!selectData?.length) {
      message.warning("请先录入题目");
      return;
    }

    const questionItems = selectData.map((group: any) => {
      const sub = resolveSelectedSubQuestion(group);
      return {
        ...sub,
        parentId: sub?.parentId ?? group?.parentId ?? 0,
      };
    });

    const { code }: any = await dispatch({
      type: "settingTopicModel/postData",
      apiUrl: "postInsertPaperFullDataByPhoto",
      payload: buildPaperFullDataPayload({
        paper: {
          id: "",
          subjectId,
          name: paperName || "",
        },
        questionItems,
        draftFlag: false,
        questionTypeList,
        includePersonalQuestionList: true,
        normalizeImageSrc: true,
      }),
    });

    if (code === 200 || code === 0) {
      message.success("录入题目已同步保存到个人题库");
      history.push(`/paperCompose`);
    }
  };

  // 切换/离开前保存当前题目编辑数据
  const saveCurrentQuestion = useCallback(
    (ref?: RefObject<{ saveQuestionData: (type: string) => void } | null>) => {
      (ref ?? topicRef)?.current?.saveQuestionData("");
    },
    [topicRef],
  );

  const flushCurrentQuestionOnLeave = useCallback(() => {
    if (!tryAcquireLeaveSaveLock()) return;
    saveCurrentQuestion();
  }, [saveCurrentQuestion]);

  // 切换题号前，保存当前子题并通知后端选中该子题
  const selectSubQuestionOnLeave = async (subQuestionId?: string) => {
    // 暂时去掉 photo_search_select_sub_question
    void subQuestionId;
    // if (!subQuestionId) return;
    // await dispatch({
    //   type: "settingTopicModel/postData",
    //   apiUrl: "postPhotoSearchSelectSubQuestion",
    //   payload: { sub_question_id: subQuestionId },
    // });
  };

  // 题号切换：定位到上次查看的子题 tab
  const onActiveChange = (
    index: number,
    ref: RefObject<{ saveQuestionData: (type: string) => void } | null>,
  ) => {
    if (index !== activeIndex) {
      const leavingSubQuestion =
        questions?.[activeIndex]?.sub_questions?.[Number(topicKey) - 1];
      saveCurrentQuestion(ref);
      const leavingSubQuestionId = leavingSubQuestion?.sub_question_id;
      selectSubQuestionOnLeave(leavingSubQuestionId);
      const newQuestions = leavingSubQuestionId
        ? updateQuestionViewingSubQuestionId(questions, activeIndex, leavingSubQuestionId)
        : questions;
      setExerciseData({
        questions: newQuestions,
        activeIndex: index,
        topicKey: getSelectedTopicKey(newQuestions?.[index]),
      });
      return;
    }
    setExerciseData({
      activeIndex: index,
      topicKey: getSelectedTopicKey(questions?.[index]),
    });
  };

  // 删除当前题目
  const onDeleteQuestion = () => {
    const currentQuestion = questions?.[activeIndex];
    const questionGroupId = currentQuestion?.question_group_id;
    if (!questionGroupId) {
      message.warning("未找到当前题目");
      return;
    }
    if (hasSelectedSubQuestion(currentQuestion)) {
      message.warning("请先取消录入后再删除");
      return;
    }
    if (questions?.length === 1) {
      message.warning("已剩最后一题，无法删除");
      return;
    }

    Modal.confirm({
      title: "确认删除当前题目？删除后无法恢复！",
      icon: createElement(
        "span",
        { className: "anticon" },
        createElement(ZYIcon, { type: "shanchu1", style: { color: "#EF4444" } }),
      ),
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { style: { backgroundColor: "#EF4444" } },
      onOk: async () => {
        const { code }: any = await dispatch({
          type: "settingTopicModel/postData",
          apiUrl: "postPhotoSearchQuestionDelete",
          payload: {
            root_task_id: rootTaskId,
            question_group_id: questionGroupId,
          },
        });

        if (code === 200) {
          message.success("删除成功");
          const newQuestions = questions.filter(
            (item: any) => item?.question_group_id !== questionGroupId,
          );
          const nextActiveIndex = Math.min(
            activeIndex,
            newQuestions.length - 1,
          );
          setExerciseData({
            questions: newQuestions,
            activeIndex: nextActiveIndex,
            topicKey: getSelectedTopicKey(newQuestions?.[nextActiveIndex]),
          });
        }
      },
    });
  };

  // 题号拖拽排序
  const onQuestionsReorder = async (reorderedQuestions: any[]) => {
    const activeQuestionGroupId = questions?.[activeIndex]?.question_group_id;
    const nextActiveIndex = activeQuestionGroupId
      ? Math.max(
        0,
        reorderedQuestions.findIndex(
          (item: any) => item?.question_group_id === activeQuestionGroupId,
        ),
      )
      : activeIndex;

    setQuestions(reorderedQuestions);
    setExerciseData({
      activeIndex: nextActiveIndex,
      topicKey: getSelectedTopicKey(reorderedQuestions?.[nextActiveIndex]),
    });

    await dispatch({
      type: "settingTopicModel/postData",
      apiUrl: "postPhotoSearchQuestionOrder",
      payload: {
        root_task_id: rootTaskId,
        question_group_ids: reorderedQuestions.map((item: any) => item?.question_group_id),
      },
    });
  };

  const setUrlStatusEditing = () => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("status") === "editing") return;
    searchParams.set("status", "editing");
    history.replace({
      pathname: history.location.pathname,
      search: searchParams.toString(),
    });
  };

  const onUploadFinish = (list: any) => {
    if (list && list?.length > 0) {
      setUploadFileList([...list]);
    }
  };

  const onUploadSubmit = async (uploadRef: RefObject<{ onUploadClose: () => void } | null>) => {
    if (!uploadFileList?.length) {
      message.warning("请先上传文件");
      return;
    }

    const { code }: any = await dispatch({
      type: "settingTopicModel/postData",
      apiUrl: "postUploadTaskUrl",
      payload: {
        course_id: courseId,
        root_task_id: rootTaskId,
        file_list: uploadFileList.map((item: any) => item?.response?.data?.[0]),
      },
    });

    if (code === 200) {
      uploadRef?.current?.onUploadClose();
      setUploadFileList([]);
      setUrlStatusEditing();
      clearTaskStatusTimer();
      pendingUploadSuccessNoticeRef.current = true;
      setExerciseData({
        taskStatus: "processing",
        progress: 0,
        progressMessage: "",
      });
      getTaskStatus();
    }
  };

  // tab 切换
  const onTabsChange = (key: string, ref: RefObject<{ saveQuestionData: (type: string) => void } | null>) => {
    if (key !== topicKey) {
      saveCurrentQuestion(ref);
      const targetSubQuestion =
        questions?.[activeIndex]?.sub_questions?.[Number(key) - 1];
      const targetSubQuestionId = targetSubQuestion?.sub_question_id;
      if (targetSubQuestionId) {
        selectSubQuestionOnLeave(targetSubQuestionId);
        setExerciseData({
          questions: updateQuestionViewingSubQuestionId(
            questions,
            activeIndex,
            targetSubQuestionId,
          ),
          topicKey: key,
        });
        return;
      }
    }
    setExerciseData({ topicKey: key });
  };

  // 路由跳转拦截：离开页面前兜底保存当前题
  useEffect(() => {
    const blocker = history.block((tx) => {
      flushCurrentQuestionOnLeave();
      blocker();
      tx.retry();
      // if (isStop) {
      //   Modal.confirm({
      //     className: "stop-modal",
      //     title: "确定离开该页面？",
      //     content: "离开页面会清空当前题目，请谨慎操作",
      //     onOk: () => {
      //       isStop = false;
      //       blocker();
      //       tx.retry();
      //     },
      //   });
      // } else {
      //   blocker();
      //   tx.retry();
      // }
    });

    return () => blocker();
  }, []);

  // 初始化：写入路由参数、轮询任务状态
  useEffect(() => {
    resetLeaveSaveLock();
    const resolved = restoreXkwCascaderState(dispatch, {
      xkwCascaderValue,
      xkwCourseId,
      xkwTextbookId,
      xkwSubjectId,
      chooseTextbookVersion,
    });
    const taskPersist = loadExerciseTaskPersist(rootTaskId);
    const initSubjectId =
      resolved.xkwSubjectId || taskPersist?.subjectId || "";
    setExerciseData({
      courseId,
      taskId,
      rootTaskId,
      ...(resolved.chooseTextbookVersion?.textbook_id
        ? { chooseTextbookVersion: resolved.chooseTextbookVersion }
        : {}),
      ...(initSubjectId ? { xkwSubjectId: initSubjectId } : {}),
      ...(taskPersist?.paperId != null
        ? {
            paperId: taskPersist.paperId,
            paperName: taskPersist.paperName ?? "",
          }
        : {}),
    });
    getTaskStatus(initSubjectId);
    return () => {
      resetLeaveSaveLock();
      clearTaskStatusTimer();
      dispatch({
        type: "settingTopicModel/setData",
        payload: EXERCISE_INITIAL_STATE,
      });
    };
  }, []);

  // 埋点
  useEffect(() => {
    // addNewTracking({
    // bt: "pv",
    // ct: "upload_search_q_exercise_input_show",
    // });
  }, []);

  // 按当前题目获取原图，默认首题
  useEffect(() => {
    if (taskStatus !== "success" || !activeQuestionGroupId) {
      return;
    }
    getOriginImages(activeQuestionGroupId);
  }, [taskStatus, activeQuestionGroupId, getOriginImages]);

  return {
    questions,
    progress,
    progressMessage,
    taskStatus,
    pageLoading,
    saveLoading,
    activeIndex,
    topicKey,
    selectData,
    setQuestions,
    onSavePaper,
    onDeleteQuestion,
    onActiveChange,
    onQuestionsReorder,
    onTabsChange,
    flushCurrentQuestionOnLeave,
    originImages,
    onUploadFinish,
    onUploadSubmit,
  };
};
