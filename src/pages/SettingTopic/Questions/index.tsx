import { useEffect, useState, useRef } from "react";
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Select,
  DatePicker,
  Input,
  Spin,
  Tooltip,
  message,
  Popover,
  Affix,
  Modal,
} from "antd";
import { connect, useDispatch, useSelector } from "@umijs/max";
import { history, Outlet } from "umi";
import { SearchOutlined, PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  selectOptionsData,
  questionTypesListData,
  single_choice_list,
  multiple_choice_list,
  fill_in_the_blank_list,
  short_answer_list,
  true_false_list,
  filtering_list,
  question_type_nume,
} from "@/global";

import { useExercisePrint } from "./component/PrintQusetion";
import Breadcrumb from "../components/Breadcrumb";
import { ZYIcon } from "@/components";
import { deepCopy, scrollTop } from "@/utils";
import PushToClassModal from "@/components/PushToClassModal";
import ExercisesUploadFile from "@/components/EduSource/UploadFile/ExercisesUploadFile";
import DraggableListNode from "./component/DraggableListNode";
import PushClassModal from "../components/PushClassModal";
import { all_question_number } from "@/global";
import { restoreXkwCascaderState, saveXkwCascaderPersist } from "../utils/xkwCascaderPersist";
import {
  parsePaperFullDataDraft,
  parsePersonalQuestionListResponse,
} from "../utils/personalQuestionModalHelpers";
import { DEFAULT_PRINT_TYPE } from "./constants";
import { usePaperComposeDraftSave, useQuestionsParams } from "./hooks";
import "./index.less";

const { Content, Sider } = Layout;

const { RangePicker } = DatePicker;
const App = (props: any) => {
  const { commonModel } = props;

  const {
    courseId,
    contextLoading,
    paperId,
    setType,
    homeworkType,
    status,
    isPaperCompose,
    pathname,
    search,
    searchParams,
  } = useQuestionsParams();

  const timerIdRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const uploadRef = useRef<any>(null);

  const [fileList, setFileList] = useState<any>([]);

  const printRef = useRef<HTMLDivElement>(null); // 打印内容的根引用

  const scrollableDivRef = useRef<any>(null);

  const [selectOptions, setSelectOptions] = useState(selectOptionsData);

  const [questionTypesList, setQuestionTypesList] = useState<any[]>([]);

  const [questionsList, setQuestionsList] = useState<any>([]);

  const [questionsStorage, setQuestionsStorage] = useState<any>([]); // 存储一下题 取消后方便恢复

  const [loading, setLoading] = useState(true);

  const [addQuestion, setAddQuestion] = useState(false);

  const [flagStatusTi, setFlagStatusTi] = useState(""); // 题的状态

  const [flagType, setFlagType] = useState("add");

  const [attributeObject, setAttributeObject] = useState<any>({});

  const [examsRow, setExamsRow] = useState<any>({});

  const [typeStyle, setTypeStyle] = useState(""); //打印样式

  const [selectPrintType, setSelectPrintType] = useState(DEFAULT_PRINT_TYPE);

  const [isPushClassClick, setIsPushClassClick] = useState(false); // 发送到班级按钮是否可以点击

  const [isAtTop, setIsAtTop] = useState(true);

  const [isAtBottom, setIsAtBottom] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [questionsNumberInfo, setQuestionsNumberInfo] = useState('')

  const [questionsTitle, setQuestionsTitle] = useState('')

  const [download, setDownload] = useState(false);

  const questionsListRef = useRef<any[]>([]);

  const dispatch = useDispatch();
  const {
    xkwCascaderValue = [],
    xkwTextbookId = "",
    xkwSubjectId = "",
    xkwCourseId,
  } = useSelector((state: any) => state.settingTopicModel);

  const {
    savePaperFullData,
    schedulePaperDraftSave,
    markSkipDraftSave,
    markReadyDraftSave,
  } = usePaperComposeDraftSave({
    enabled: isPaperCompose && flagStatusTi === "edit",
    dispatch,
    examsRow,
    paperId,
    questionsTitle,
  });

  useEffect(() => {
    questionsListRef.current = questionsList;
  }, [questionsList]);

  const calcTotalScore = (list: any[] = []) =>
    (list || []).reduce((sum, item) => sum + (Number(item?.score) || 0), 0);

  const formatQuestionsNumberInfo = (list: any[] = []) => {
    const count = list?.length ?? 0;
    if (isPaperCompose) {
      return `共${count}题，总分${calcTotalScore(list)}分`;
    }
    return `共${count}题`;
  };

  const listeningTestItems = questionsList.filter((item) => {
    return item?.question_type === "listening_test";
  });

  const [messageApi, contextHolder] = message.useMessage();

  // 下载 音频  只能点一次下载  下载完成后  才能点击下载
  const [downloaded, setDownloaded] = useState(false);   // 下载音频状态

  // 下载PDF word  只能点一次下载  下载完成后  才能点击下载
  const [downloadedPdf, setDownloadedPdf] = useState(false);   // 下载PDF word 状态

  // useEffect(() => {
  //   if (setType == 'chapterTopic') {
  //     addNewTracking({
  //       bt: 'pv',
  //       ct: 'ai_gen_hw_exercise_preview_show'
  //     })
  //   }
  // }, [setType])

  // 打印类型切换时，更新标题
  // useEffect(() => {
  //   handleTitle(selectPrintType);
  // }, [selectPrintType]);

  // 滚动监听
  useEffect(() => {
    const scrollElement = scrollableDivRef.current;
    if (scrollElement) {
      checkScrollPosition();

      scrollElement.addEventListener("scroll", checkScrollPosition);

      return () => {
        scrollElement.removeEventListener("scroll", checkScrollPosition);
      };
    }
  }, [questionsList]);

  // useEffect(() => {
  //   if (contextLoading || !courseId) return;
  //   init();
  //   return () => {
  //     clearTimeout(timerIdRef?.current);
  //     clearInterval(timerIdRef?.current);
  //   };
  // }, [contextLoading, courseId]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    if (isPaperCompose) {
      restoreXkwCascaderState(dispatch, {
        xkwCascaderValue,
        xkwTextbookId,
        xkwSubjectId,
        xkwCourseId,
      });
    }

    let _type = homeworkType || "add"

    if (_type == 'edit') {
      setFlagStatusTi('edit')
    }

    console.log('status', status)

    // 查看要展示可编辑按钮
    // if(status == 'editable') {
    //   _type = 'edit'
    // }

    setFlagType(_type);

    await setQuestionsStorage([]);
    await setQuestionsList([]);

    setLoading(true);
    // getPostExternalQuestionBankAreaIds(courseId);
    if (isPaperCompose) {
      getPaperDetail(paperId);
    } else {
      // getExamsList(examId);
    }
    // courseCheckStageSubjectFn();
  };

  // const getPostExternalQuestionBankAreaIds = async (courseId: any) => {
  //   const { code, data = [] }: any = await dispatch({
  //     type: "setQuestionsModel/postData",
  //     apiUrl: "postExternalQuestionBankAreaIds",
  //     payload: { course_id: courseId },
  //   });
  //   if (code === 200) {
  //     console.log("获取选项数据", data);
  //     setAttributeObject(data);
  //   }
  // };

  /**
   * 作业组卷详情：
   * - 查看：paperQuestionList → findPersonalQuestionList
   * - 编辑：paperFullDataDraft 长度 > 10 时弹窗；是 → 用草稿(JSON=题目列表)；否 → 同查看逻辑
   */
  const getDraftRawString = (fullData: any) => {
    // 接口字段：paperFulldataDraft（兼容 paperFullDataDraft）
    const raw =
      fullData?.paperFulldataDraft ??
      fullData?.paperFullDataDraft ??
      "";
    if (raw == null) return "";
    return typeof raw === "string" ? raw : JSON.stringify(raw);
  };

  const fetchPersonalQuestionListByIds = async (questionIds: string[]) => {
    if (!questionIds.length) return [];
    try {
      const questionRes: any = await dispatch({
        type: "settingTopicModel/postData",
        apiUrl: "postPersonalQuestionFindPersonalQuestionList",
        payload: questionIds,
      });
      if (questionRes?.code === 200 || questionRes?.code === 0) {
        return parsePersonalQuestionListResponse(questionRes?.data);
      }
    } catch (e) {
      console.warn("findPersonalQuestionList 失败", e);
    }
    return [];
  };

  const applyPaperQuestions = (
    paper: any,
    fullData: any,
    personalList: any[],
    paperQuestionList: any[],
    difficultyLabel: string,
  ) => {
    const list = Array.isArray(personalList) ? personalList : [];
    const pqList = Array.isArray(paperQuestionList)
      ? [...paperQuestionList].sort(
          (a: any, b: any) => Number(a?.sort ?? 0) - Number(b?.sort ?? 0),
        )
      : [];

    const personalMap = new Map<string, any>();
    list.forEach((item: any) => {
      if (item?.id != null) personalMap.set(String(item.id), item);
      if (item?.oldId != null) personalMap.set(String(item.oldId), item);
      if (item?.questionId != null) personalMap.set(String(item.questionId), item);
      if (item?.sub_question_id != null)
        personalMap.set(String(item.sub_question_id), item);
    });

    let mappedQuestions: any[] = [];
    try {
      const usedIds = new Set<string>();
      if (pqList.length) {
        pqList.forEach((pq: any, index: number) => {
          const qid = pq?.questionId ?? pq?.question_id;
          const detail =
            (qid != null ? personalMap.get(String(qid)) : null) ||
            list[index] ||
            null;
          if (!detail) return;
          if (detail?.id != null) usedIds.add(String(detail.id));
          mappedQuestions.push(mapPersonalQuestionToExamQuestion(detail, pq));
        });
        list.forEach((item: any) => {
          if (item?.id != null && usedIds.has(String(item.id))) return;
          if (item?.id == null && mappedQuestions.length) return;
          mappedQuestions.push(mapPersonalQuestionToExamQuestion(item, {}));
        });
      } else {
        // 草稿直出题目列表（无 paperQuestionList 关联时）
        mappedQuestions = list.map((item: any) =>
          mapPersonalQuestionToExamQuestion(item, {}),
        );
      }
    } catch (e) {
      console.warn("题目映射失败", e);
      mappedQuestions = [];
    }

    const questionRules = buildQuestionRules(mappedQuestions);
    const questions_list = dealwithQuestionList(
      mappedQuestions,
      {
        total_score: paper.totalScore,
        question_count: paper.questionCount,
      },
      questionRules,
    );

    setExamsRow({
      ...paper,
      ...(fullData?.paper || {}),
      id: paper.id,
      title: paper.name,
      creation_type: "external_question_bank",
      question_rules: questionRules,
    });
    setQuestionTypesList(questionRules);
    setAttributeObject((prev: any) => ({
      ...prev,
      question_types: questionRules.map((rule: any) => ({
        ...rule,
        en_name: rule.en_name || rule.type,
        name: rule.name,
      })),
    }));
    setQuestionsTitle(paper.name || "");
    setQuestionsNumberInfo(formatQuestionsNumberInfo(questions_list));
    markSkipDraftSave();
    setQuestionsList(questions_list);
    setQuestionsStorage(questions_list);
    window.setTimeout(() => markReadyDraftSave(), 0);
  };

  /** 查看详情 / 编辑选「否」：paperQuestionList → 拉个人题详情 */
  const loadByPaperQuestionList = async (
    paper: any,
    fullData: any,
    difficultyLabel: string,
  ) => {
    const paperQuestionList = Array.isArray(fullData?.paperQuestionList)
      ? [...fullData.paperQuestionList]
      : [];
    paperQuestionList.sort(
      (a: any, b: any) => Number(a?.sort ?? 0) - Number(b?.sort ?? 0),
    );
    const questionIds = paperQuestionList
      .map((item: any) => item?.questionId)
      .filter(Boolean)
      .map(String);

    const personalList = await fetchPersonalQuestionListByIds(questionIds);
    applyPaperQuestions(
      paper,
      fullData,
      personalList,
      paperQuestionList,
      difficultyLabel,
    );
  };

  /** 编辑选「是」：用 paperFulldataDraft（updatePaperFullData 草稿） */
  const loadByDraft = async (
    paper: any,
    fullData: any,
    draftRaw: string,
    difficultyLabel: string,
  ) => {
    const draftPayload = parsePaperFullDataDraft(draftRaw);
    const draftPaper = { ...paper, ...(draftPayload.paper || {}) };
    const paperQuestionList = [...(draftPayload.paperQuestionList || [])].sort(
      (a: any, b: any) => Number(a?.sort ?? 0) - Number(b?.sort ?? 0),
    );

    let personalList = draftPayload.personalQuestionList || [];
    if (!personalList.length && paperQuestionList.length) {
      const questionIds = paperQuestionList
        .map((item: any) => item?.questionId)
        .filter(Boolean)
        .map(String);
      personalList = await fetchPersonalQuestionListByIds(questionIds);
    }

    applyPaperQuestions(
      draftPaper,
      fullData,
      personalList,
      paperQuestionList,
      difficultyLabel,
    );
  };

  const getPaperDetail = async (id: any) => {
    if (!id) {
      setLoading(false);
      return;
    }

    markSkipDraftSave();

    try {
      // 1. 试卷信息
      const paperRes: any = await dispatch({
        type: "settingTopicModel/getData",
        apiUrl: "getPaperGetPaper",
        payload: { paperId: id, id },
      });
      if (!(paperRes?.code === 200 || paperRes?.code === 0)) {
        setLoading(false);
        return;
      }
      const paper = paperRes?.data || {};
      const paperSubjectId = paper?.subjectId ?? paper?.subject_id;
      if (paperSubjectId != null && paperSubjectId !== "") {
        saveXkwCascaderPersist({ xkwSubjectId: paperSubjectId });
        dispatch({
          type: "settingTopicModel/setData",
          payload: { xkwSubjectId: paperSubjectId },
        });
      }
      const difficultyMap: Record<number, string> = {
        1: "容易",
        2: "较易",
        3: "适中",
        4: "较难",
        5: "困难",
      };
      const difficultyLabel =
        difficultyMap[Number(paper.difficulty)] ?? paper.difficulty ?? "适中";

      setExamsRow({
        ...paper,
        id: paper.id,
        title: paper.name,
        creation_type: "external_question_bank",
      });
      setQuestionsTitle(paper.name || "");
      setQuestionsNumberInfo(
        `共${paper.questionCount ?? 0}题`,
      );

      // 2. 试卷全量
      const fullRes: any = await dispatch({
        type: "settingTopicModel/getData",
        apiUrl: "getPaperGetPaperFullData",
        payload: { paperId: id, id },
      });
      const fullData = fullRes?.data || {};
      const draftRaw = getDraftRawString(fullData);
      const isEdit = homeworkType === "edit";

      // 编辑且草稿有内容：弹窗选择
      if (isEdit && draftRaw.length > 10) {
        setLoading(false);
        Modal.confirm({
          title: "提示",
          content: "检测到草稿数据，是否进入草稿？",
          okText: "是",
          cancelText: "否",
          centered: true,
          onOk: async () => {
            setLoading(true);
            try {
              await loadByDraft(paper, fullData, draftRaw, difficultyLabel);
            } finally {
              setLoading(false);
            }
          },
          onCancel: () => {
            return loadByPaperQuestionList(paper, fullData, difficultyLabel);
          },
        });
        return;
      }

      // 查看详情，或编辑但无草稿：走 paperQuestionList
      await loadByPaperQuestionList(paper, fullData, difficultyLabel);
    } finally {
      setLoading(false);
    }
  };

  const mapPersonalQuestionToExamQuestion = (item: any, paperQ: any = {}) => {
    const rawOptions = Array.isArray(item?.optionList)
      ? item.optionList
      : Array.isArray(item?.options)
        ? item.options
        : [];
    const options = rawOptions.map((option: any) =>
      typeof option === "string" ? option : option?.content ?? option?.text ?? "",
    );

    const quesTypeName = item?.quesType || item?.question_type || item?.type;
    const questionType =
      question_type_nume.find((q) => q.type === quesTypeName)?.code ||
      question_type_nume.find((q) => q.code === quesTypeName)?.code ||
      (typeof quesTypeName === "string" && quesTypeName.includes("_")
        ? quesTypeName
        : "short_answer");

    const rawAnswers = Array.isArray(item?.answerList)
      ? item.answerList
      : Array.isArray(item?.correct_answers)
        ? item.correct_answers
        : [];
    // answerList 可能是 ["B"] 这种选项字母，转成选项正文供 getAnswer 匹配
    const answers = rawAnswers.map((ans: any) => {
      if (
        typeof ans === "string" &&
        /^[A-Za-z]$/.test(ans.trim()) &&
        options.length
      ) {
        const idx = ans.trim().toUpperCase().charCodeAt(0) - 65;
        if (idx >= 0 && idx < options.length) return options[idx];
      }
      return ans;
    });

    const kgPointList = Array.isArray(item?.kgPointList)
      ? item.kgPointList
      : Array.isArray(item?.kgPoints)
        ? item.kgPoints
        : Array.isArray(item?.knowledgePointList)
          ? item.knowledgePointList
          : [];

    return {
      ...item,
      id: item?.id ?? paperQ?.questionId,
      question_text: item?.stem || item?.question_text || item?.content || "",
      question_type: questionType,
      options,
      correct_answers: answers,
      explanation:
        item?.quesAnalysis ||
        item?.quesAnalysis ||
        item?.analysis ||
        item?.explanation ||
        "",
      score: paperQ?.score ?? item?.score,
      sort: paperQ?.sort,
      paper_question_id:
        paperQ?.id == null || paperQ?.id === "" ? undefined : String(paperQ.id),
      parent_id: paperQ?.parentId ?? paperQ?.parent_id ?? 0,
      source: paperQ?.source ?? 0,
      paper_id:
        paperQ?.paperId == null && paperQ?.paper_id == null
          ? undefined
          : String(paperQ?.paperId ?? paperQ?.paper_id),
      createUser: paperQ?.createUser ?? paperQ?.create_user ?? item?.createUser,
      createTime: paperQ?.createTime ?? paperQ?.create_time ?? item?.createTime,
      // 知识点（预览/筛选用）
      kpoint_ids: kgPointList.map((kp: any) => ({
        id: kp?.id,
        name: kp?.name,
      })),
      ori_kpoints: kgPointList.map((kp: any) => ({
        key: String(kp?.id ?? ""),
        title: kp?.name ?? "",
      })),
      kpoints: kgPointList.map((kp: any) => ({
        key: String(kp?.id ?? ""),
        title: kp?.name ?? "",
      })),
    };
  };

  const buildQuestionRules = (list: any[] = []) => {
    const seen = new Set<string>();
    const rules: any[] = [];
    list.forEach((item) => {
      const code = item?.question_type;
      if (!code || seen.has(code)) return;
      seen.add(code);
      const matched = question_type_nume.find((q) => q.code === code);
      rules.push({
        type: code,
        en_name: code,
        name: matched?.type || code,
      });
    });
    return rules;
  };

  // const getExamsList = async (id: any) => {
  //   let { code, data } = await dispatch({
  //     type: "setQuestionsModel/postData",
  //     apiUrl: "getExamsQuestionsList",
  //     payload: {
  //       id,
  //     },
  //   });
  //   if (code === 200) {
  //     await setQuestionTypesList(data?.question_rules);
  //     let questions_list = dealwithQuestionList(
  //       data?.questions,
  //       data?.info,
  //       data?.question_rules,
  //     );
  //     let _arr = [...questionsStorage, ...questions_list];
  //     setExamsRow(data);
  //     setQuestionsNumberInfo(data?.info)
  //     setQuestionsTitle(data?.title)
  //     setQuestionsList(_arr);
  //     scrollTopChat();
  //     if (data?.status !== "succeeded") {
  //       timerIdRef.current = setTimeout(() => {
  //         getExamsList(id);
  //       }, 2000);
  //     }
  //     if (data?.status == "succeeded") {
  //       if (setType == 'chapterTopic') {
  //         // addNewTracking({
  //           // bt: 'pv',
  //           // ct: 'ai_gen_hw_exercise_preview_show',
  //           // ctid: data?.id,
  //           // ctvl: data?.title
  //         // })
  //       }

  //       if (setType == 'uploadTopic') {
  //         // addNewTracking({
  //           // bt: 'pv',
  //           // ct: 'upload_search_q_exercise_preview_show',
  //           // ctid: data?.id,
  //           // ctvl: data?.title
  //         // })
  //       }

  //       setLoading(false);
  //       setQuestionsStorage(_arr);
  //     }
  //   }
  // };


  // const getExamsInfo = async (id: any) => {
  //   let { code, data } = await dispatch({
  //     type: "setQuestionsModel/postData",
  //     apiUrl: "getExamsQuestionsList",
  //     payload: {
  //       id,
  //     },
  //   });
  //   if (code === 200) {
  //     setQuestionsNumberInfo(data?.info)
  //     setQuestionsTitle(data?.title)
  //     // if (data?.status !== "succeeded") {
  //     //   timerIdRef.current = setTimeout(() => {
  //     //     getExamsList(id);
  //     //   }, 2000);
  //     // }
  //     // if (data?.status == "succeeded") {

  //     // }
  //   }
  // };

  // 处理返回返回试题fn
  const dealwithQuestionList = (list: any, info: any, question_rules: any) => {
    return list?.map((item: any) => {
      return {
        ...item,
        info,
        question_rules,
        optionsList:
          item?.options?.length > 0 &&
          item?.options?.map((val: any, key: any) => {
            return {
              label: selectOptions[key],
              content: val,
            };
          }),
        answer: getAnswer(item),
        type: question_rules?.find((k: any) => {
          return k?.type === item?.question_type;
        })?.type,
      };
    });
  };

  //处理答案数据
  const resolveOptionIndex = (answer: any, options: any[] = []) => {
    if (answer == null) return -1;
    const byContent = options.findIndex((val: any) => val === answer);
    if (byContent !== -1) return byContent;
    // 兼容 answerList 返回 "A"/"B"
    if (typeof answer === "string" && /^[A-Za-z]$/.test(answer.trim())) {
      const idx = answer.trim().toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < options.length) return idx;
    }
    return -1;
  };

  const getAnswer = (item: any) => {
    // 单选
    if (single_choice_list.includes(item?.question_type)) {
      return selectOptions[
        resolveOptionIndex(item?.correct_answers?.[0], item?.options || [])
      ];
    }
    // 多选
    if (multiple_choice_list.includes(item?.question_type)) {
      let flag_string = "";
      item?.correct_answers?.map((val: any) => {
        let flag_string_index = resolveOptionIndex(val, item?.options || []);
        if (flag_string_index !== -1) {
          flag_string += selectOptions[flag_string_index];
        }
      });

      return flag_string;
    }
    // 简单题
    if (short_answer_list.includes(item?.question_type)) {
      if (item?.correct_answers?.length > 1) {
        return item?.correct_answers?.map((arr: any, index: any) => {
          return `（${index + 1}）${arr}`;
        }).join('') || '';
      } else {
        return item?.correct_answers?.[0] || '';
      }
    }
    // 判断题
    if (true_false_list.includes(item?.question_type)) {
      return item?.correct_answers?.[0];
    }
    // 填空题
    if (fill_in_the_blank_list.includes(item?.question_type)) {
      return item?.correct_answers?.[0];
    }
  };

  // const courseCheckStageSubjectFn = async () => {
  //   let { code, data } = await dispatch({
  //     type: "setQuestionsModel/getData",
  //     // apiUrl: "getDistribute",
  //     apiUrl: "courseCheckStageSubject",
  //     payload: { course_id: courseId },
  //   });
  //   if (code === 200) {
  //     if (data?.allowed) {
  //       setIsPushClassClick(data?.allowed);
  //     }
  //   }
  // };

  // const questPrintFn = async () => {
  //   console.log("打印", printRef?.current?.innerHTML);
  //   let { code, data } = await dispatch({
  //     type: "setQuestionsModel/postData",
  //     apiUrl: "postPrintExam",
  //     payload: {
  //       // 传入字符串形式的html内容
  //       html_content: printRef?.current?.innerHTML,
  //       exam_id: examsRow?.id,
  //       // html_content: props?.PrintHTML,
  //       file_name: examsRow?.title,
  //     },
  //   });
  //   if (code === 200) {
  //     console.log(data);
  //   }
  // };

  // 打印类型切换样式改变
  // const handleTitle = (value: string) => {
  //   if (value === "student") {
  //     setTypeStyle(`.question-answer {
  //       display: none !important;
  //     }`);
  //   } else if (value === "teacher") {
  //     setTypeStyle(`.question-answer {
  //       display: block !important;
  //       margin-left: 16px !important;
  //       .similar_questions_box {
  //         display: none !important;
  //       }
  //     }`);
  //   } else if (value === "normal") {
  //     setTypeStyle(`.unshow-answer {
  //       display: unset !important;
  //     }
  //     .question-answer {
  //       display: none !important;
  //     }`);
  //   }
  // };

  // 渲染html元素
  const renderHtml = (str: any) => {
    return <div dangerouslySetInnerHTML={{ __html: str }} />;
  };

  // 初始化打印函数：绑定PrintRef，配置边距和回调
  const handlePrint = useExercisePrint({
    contentRef: printRef, // 绑定打印内容
    documentTitle: questionsTitle, // 自定义打印标题
    // margins: { top: "1cm", bottom: "1cm" }, // 自定义边距
    // onAfterPrint: () => {
    //   message.success("打印完成！"); // 打印后回调
    // },
    customPageStyle: typeStyle, // 如需修改特定样式
  });

  const editTiFn = async (type: string) => {
    console.log("editTiFn", type);
    if (type == "cancel") {
      markSkipDraftSave();
      setQuestionsList(questionsStorage);
      window.setTimeout(() => markReadyDraftSave(), 0);
    }
    if (type == "save") {
      if (questionsList?.length > all_question_number) {
        message.warning(`题目总数不能大于${all_question_number}`);
        return;
      }
      if (questionsTitle?.length > 50) {
        message.warning("作业名称最多50个字符");
        return;
      }
      if (isPaperCompose) {
        markSkipDraftSave();
        const ok = await savePaperFullData(questionsList, {
          draftFlag: false,
          silent: false,
        });
        if (!ok) {
          markReadyDraftSave();
          return;
        }
        setQuestionsStorage(questionsList);
        setExamsRow((prev: any) => ({
          ...prev,
          name: questionsTitle,
          title: questionsTitle,
          totalScore: calcTotalScore(questionsList),
        }));
        markReadyDraftSave();
      } else {
        questionsUpdate(questionsList);
        examsTitleUpdate();
        setQuestionsStorage(questionsList);
      }
    }
    setFlagStatusTi(type);
  };

  const questionsUpdate = async (arr: any) => {
    let question_ids = arr?.map((item: any) => {
      return {
        question_id: item?.id,
        spacing: item?.spacing ?? 0,
      };
    });

    let { code, data } = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "postQuestionsUpdate",
      payload: {
        exam_id: examsRow?.id,
        question_ids,
      },
    });
    if (code === 200) {
      message.success("操作成功");
      // getExamsInfo(examId)
    }
  };

  // 更新试卷名称
  const examsTitleUpdate = async () => {
    let { code, data } = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "examsTitleUpdate",
      payload: {
        exam_id: examsRow?.id,
        new_title: questionsTitle
      },
    });
    if (code === 200) {
      // message.success("操作成功");
      // getExamsInfo(examId)
    }
  };
  const PurpleLoadingIcon = () => (
    <LoadingOutlined style={{ color: '#1C6CFF' }} spin />
  );
  // const onhandleadd = async () => {
  //   const key = 'updatable';
  //   messageApi.open({
  //     key,
  //     type: 'loading',
  //     content: '正在下载文档',
  //     duration: 0,
  //     icon: <PurpleLoadingIcon />,
  //   });
  //   setDownloaded(true);
  //   try {
  //     let res = await dispatch({
  //       type: "setQuestionsModel/postData",
  //       apiUrl: "postdownloadExam",
  //       payload: {
  //         exam_id: examsRow?.id,
  //         download_type: "zip",
  //       },
  //     });
  //     if (!res) {
  //       message.error("下载数据为空");
  //       return;
  //     }
  //     const blob = new Blob([res], { type: "application/zip" });
  //     const url = URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = "听力合集.zip";
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     URL.revokeObjectURL(url);
  //     messageApi.open({
  //       key,
  //       type: 'success',
  //       content: '下载成功',
  //       duration: 2,
  //     });
  //     setDownloaded(false);
  //   } catch (err) {
  //     setDownloaded(false);
  //     messageApi.open({
  //       key,
  //       type: 'error',
  //       content: '下载失败',
  //       duration: 2,
  //     });
  //     console.error(err);
  //   }
  // };

  // const onhandlePrint = () => {
  //   setDownload(true);
  //   if (setType == 'chapterTopic') {
  //     // addNewTracking({
  //     // bt: 'cl',
  //     // ct: 'ai_gen_hw_exercise_preview_print_click',
  //     // ctid: examsRow?.id,
  //     // ctvl: questionsTitle
  //     // })
  //     // addNewTracking({
  //     // bt: 'pv',
  //     // ct: 'ai_gen_hw_print_modal_show',
  //     // ctid: examsRow?.id,
  //     // ctvl: questionsTitle
  //     // })
  //   }
  //   if (setType == 'uploadTopic') {
  //     // addNewTracking({
  //     // bt: 'cl',
  //     // ct: 'upload_search_q_exercise_preview_print_click',
  //     // ctid: examsRow?.id,
  //     // ctvl: questionsTitle
  //     // })
  //     // addNewTracking({
  //     // bt: 'pv',
  //     // ct: 'upload_search_q_print_modal_show',
  //     // ctid: examsRow?.id,
  //     // ctvl: questionsTitle
  //     // })
  //   }
  //   onPrintModal.current?.showModal(questionsTitle);
  // };

  const items: any = [
    {
      key: "1",
      label: (
        <>
          {questionsList?.length > 0 && props?.statusLoading !== "loading" && (
            <div className="design_outline_header_container_btn">
              <div className="header_box">
                <Button
                  key={1}
                  type="link"
                  className={"publish_class_box_css"}
                  onClick={() => {



                    if (setType == 'chapterTopic') {

                      // addNewTracking({
                      // bt: 'cl',
                      // ct: 'ai_gen_hw_publish_class_click',
                      // ctid: examsRow?.id,
                      // ctvl: questionsTitle
                      // })

                      // addNewTracking({
                      // bt: 'pv',
                      // ct: 'ai_gen_hw_publish_class_modal_show',
                      // ctid: examsRow?.id,
                      // ctvl: questionsTitle
                      // })
                    }
                    if (setType == 'uploadTopic') {

                      // addNewTracking({
                      // bt: 'cl',
                      // ct: 'upload_search_q_publish_class_click',
                      // ctid: examsRow?.id,
                      // ctvl: questionsTitle
                      // })

                      // addNewTracking({
                      // bt: 'pv',
                      // ct: 'upload_search_q_publish_class_modal_show',
                      // ctid: examsRow?.id,
                      // ctvl: questionsTitle
                      // })
                    }
                    setIsModalOpen(true);
                  }}
                >
                  发布到班级
                </Button>
                {/* <PushToClassModal
                  {...props}
                  course_id={courseId}
                  printref={printRef} // 打印内容的根引用
                  exam_id={examsRow?.id}
                  exam_name={examsRow?.title}
                  resourceLibrary={false}
                  isPushClass={true}
                  formItemTitle={"习题名称"}
                  isPushClassClick={isPushClassClick}
                /> */}
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      key: "2",
      label: (
        <>
          {questionsList?.length > 0 && props?.statusLoading !== "loading" && (
            <div className="design_outline_header_container_btn">
              <div className="header_box">
                <PushToClassModal
                  {...props}
                  course_id={courseId}
                  printref={printRef} // 打印内容的根引用
                  exam_id={examsRow?.id}
                  exam_name={examsRow?.title}
                  resourceLibrary={true}
                  isPushClass={false}
                />
              </div>
            </div>
          )}
        </>
      ),
    },
  ];

  const chapterTopicItems: any = [
    {
      key: "1",
      label: (
        <span
          onClick={() => {
            setAddQuestion(true);
          }}
        >
          系统习题
        </span>
      ),
    },
    // {
    //   key: "2",
    //   label: (
    //     <span
    //       onClick={() => {
    //         uploadRef.current.onUploadOpen();
    //       }}
    //     >
    //       上传搜题
    //     </span>
    //   ),
    // },
  ];

  const chapterMoreComponent = () => {
    return (
      <div className="chapter_more_tooltip_title">
        {examsRow?.chapter_name?.map((i: any, k: any) => {
          return (
            <p className="chapter_more_tooltip_title_p" key={k}>
              {i}
            </p>
          );
        })}
      </div>
    );
  };

  const iconComponent = () => {
    return (
      <div className="spin_box">
        <div className="spin">
          <p className="span_spin">
            <Spin />
          </p>
          <p className="span_text">加载中...</p>
        </div>
      </div>
    );
  };

  const emptyComponent = () => {
    return (
      <div className="spin_box">
        <div className="spin">
          <p className="span_spin">
            <ZYIcon
              type="kongshuju7"
              style={{ width: "80px", height: "48px" }}
            />
          </p>
          <p className="span_text">暂无数据</p>
        </div>
      </div>
    );
  };

  const scrollTopChat = () => {
    setTimeout(() => {
      scrollTop(scrollableDivRef);
    }, 100);
  };

  const checkScrollPosition = () => {
    if (scrollableDivRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollableDivRef.current;
      const atTop = scrollTop <= 200;
      const atBottom =
        scrollHeight <= clientHeight ||
        Math.abs(scrollHeight - clientHeight - scrollTop) < 200;

      setIsAtTop(atTop);
      setIsAtBottom(atBottom);
    }
  };

  // 上传完成回调
  // const onFinish = async (list: any) => {
  //   console.log("list", list);
  //   if (list && list?.length > 0) {
  //     setFileList([...list]);
  //   }
  // };

  // const submit = async () => {
  //   setLoading(true);
  //   let json_data = {
  //     course_id: courseId,
  //     img_list: fileList?.map((item: any) => {
  //       return item?.response?.data?.[0];
  //     }),
  //   };
  //   let { code, data } = await dispatch({
  //     type: "setQuestionsModel/postData",
  //     apiUrl: "postTakePhotoSearchQuestions", // 搜题
  //     payload: { ...json_data },
  //   });
  //   if (code === 200) {
  //     console.log("搜题", data);
  //     if (data) {
  //       // getExamsList(data);
  //       uploadRef.current.onUploadClose();
  //     }
  //   }
  // };

  return (
    <div className="setting_questions_box">
      <Breadcrumb
        items={[
          {
            onClick: () =>
              history.push(
                isPaperCompose
                  ? `/paperCompose?courseId=${courseId || ""}`
                  : `/setTopic?courseId=${courseId}`,
              ),
          },
          {
            title: isPaperCompose
              ? homeworkType === "edit"
                ? "编辑试卷"
                : "试卷详情"
              : setType === "uploadTopic"
                ? "上传搜题"
                : setType === "chapterTopic"
                  ? "智能出题"
                  : setType === "paper"
                    ? "题库出题"
                    : "出题",
          },
        ]}
      />
      {loading && questionsList?.length == 0 && <>{iconComponent()}</>}
      {!loading && questionsList?.length == 0 && (
        <>
          <div className="setting_questions_title_box">
            <div className="setting_questions_title_text">习题预览</div>
            <div className="setting_questions_title_content">
              {isPaperCompose &&
                flagStatusTi != "edit" &&
                status === "editable" && (
                  <Button
                    type="primary"
                    onClick={() => setFlagStatusTi("edit")}
                  >
                    编辑
                  </Button>
                )}
            </div>
          </div>
          {isPaperCompose && (questionsTitle || questionsNumberInfo) && (
            <div className="question_hint">
              <ZYIcon
                type="xinxi"
                className="question_hint_icon"
                style={{ fontSize: 16, color: "#1C6CFF" }}
              />
              <span className="question_hint_content">
                {questionsNumberInfo}
                {examsRow?.description ? `，${examsRow.description}` : ""}
              </span>
            </div>
          )}
          {isPaperCompose && questionsTitle ? (
            <h1
              className="setting_questions_list_title"
              style={{
                textAlign: "center",
                fontSize: "24px",
                fontWeight: "600",
                margin: "16px 0",
              }}
            >
              {questionsTitle}
            </h1>
          ) : null}
          {emptyComponent()}
        </>
      )}

      {questionsList?.length > 0 && (
        <div className="setting_questions_title_box">
          <div className="setting_questions_title_text">习题预览</div>
          <div className="setting_questions_title_content">
            <>
              {flagStatusTi != "edit" && (
                <>
                  <div
                    className={`${loading ? "design_right_btn_box_loading" : ""}`}
                  >
                    <div className="design_right_card_container_box_title_btn">
                      {/* <Tooltip placement="bottom" title="练习分析">
                        <Button
                          icon={
                            <ZYIcon
                              type={"baogaozhouqi"}
                              style={{ fontSize: "16px", color: "#646E8B" }}
                            />
                          }
                          type="link"
                          color="default"
                          variant="text"
                          onClick={() => {
                            if (setType == 'chapterTopic') {
                              // addNewTracking({
                              // bt: 'cl',
                              // ct: 'ai_gen_hw_exercise_preview_analysis_click',
                              // ctid: examsRow?.id,
                              // ctvl: questionsTitle
                              // })
                            }
                            if (setType == 'uploadTopic') {
                              // addNewTracking({
                              // bt: 'cl',
                              // ct: 'upload_search_q_exercise_preview_analysis_click',
                              // ctid: examsRow?.id,
                              // ctvl: questionsTitle
                              // })
                            }
                            analysisModalRef?.current?.openModal()
                          }}
                        />
                      </Tooltip> */}
                      {/* {listeningTestItems?.length > 0 && (
                        <Tooltip placement="bottom" title="下载音频">
                          <Button
                            icon={
                              <ZYIcon
                                type={"yinpinxiazai"}
                                style={{ fontSize: "16px", color: "#646E8B" }}
                              />
                            }
                            type="link"
                            color="default"
                            variant="text"
                            onClick={onhandleadd}
                            disabled={downloaded}
                          />
                        </Tooltip>
                      )} */}
                      {/* <Tooltip placement="bottom" title="下载">
                        <Button
                          icon={
                            <ZYIcon
                              type={"xiazai1"}
                              style={{ fontSize: "18px", color: "#646E8B" }}
                            />
                          }
                          type="link"
                          color="default"
                          variant="text"
                          onClick={onhandlePrint}
                          disabled={downloadedPdf}
                        />
                      </Tooltip> */}
                      {status != 'noEditable' && (
                        <Tooltip placement="bottom" title="编辑">
                          <Button
                            icon={
                              <ZYIcon
                                type={"edit"}
                                style={{ fontSize: "16px", color: "#646E8B" }}
                              />
                            }
                            type="link"
                            color="default"
                            variant="text"
                            onClick={() => {
                              if (setType == 'chapterTopic') {
                                // addNewTracking({
                                // bt: 'cl',
                                // ct: 'ai_gen_hw_exercise_preview_edit_click',
                                // ctid: examsRow?.id,
                                // ctvl: questionsTitle
                                // })
                              }
                              if (setType == 'uploadTopic') {
                                // addNewTracking({
                                // bt: 'cl',
                                // ct: 'upload_search_q_exercise_preview_edit_click',
                                // ctid: examsRow?.id,
                                // ctvl: questionsTitle
                                // })
                              }
                              editTiFn("edit")
                            }}
                          />
                        </Tooltip>
                      )}
                    </div>
                  </div>

                  <div className="setting_questions_title_line"></div>

                  <div
                    className={`${loading ? "design_right_btn_box_loading" : ""}`}
                  >
                    {isPaperCompose ? (
                      <Button
                        type="primary"
                        icon={
                          <ZYIcon
                            type={"share"}
                            style={{
                              fontSize: "16px",
                              cursor: "pointer",
                              boxShadow: "none",
                            }}
                          />
                        }
                        onClick={() => {
                          const id = examsRow?.id ?? paperId;
                          if (!id) {
                            message.warning("缺少试卷信息");
                            return;
                          }
                          const name = encodeURIComponent(
                            questionsTitle ||
                              examsRow?.name ||
                              examsRow?.title ||
                              "",
                          );
                          history.push(
                            `/setTopic/homework?courseId=${courseId || ""}&homeworkType=publish&paperId=${id}&paperName=${name}`,
                          );
                        }}
                      >
                        发布
                      </Button>
                    ) : (
                      <Dropdown
                        getPopupContainer={(node) =>
                          node.parentNode as HTMLElement
                        }
                        placement="bottomRight"
                        autoAdjustOverflow={true}
                        menu={{ items }}
                      >
                        <Button
                          type="primary"
                          icon={
                            <ZYIcon
                              type={"share"}
                              style={{
                                fontSize: "16px",
                                cursor: "pointer",
                                boxShadow: "none",
                              }}
                            />
                          }
                        >
                          发布
                        </Button>
                      </Dropdown>
                    )}
                  </div>
                </>
              )}
              {flagStatusTi == "edit" && (
                <div className="question_save_cancel_btn_box">
                  <Button
                    type="primary"
                    className="question_cancel_btn"
                    onClick={() => {
                      editTiFn("cancel");
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      editTiFn("save");
                    }}
                  >
                    保存
                  </Button>
                </div>
              )}
            </>
          </div>
        </div>
      )}

      <div className="setting_questions_list_box">
        <>
          {questionsList?.length > 0 && (
            <div className="question_hint">
              <span className="question_hint_icon">
                <ZYIcon style={{ fontSize: "16px" }} type={"tishi"} />
              </span>
              <span className="question_hint_content">
                {isPaperCompose ? (
                  <>
                    {questionsNumberInfo}
                    {examsRow?.description ? `，${examsRow.description}` : ""}
                  </>
                ) : (
                  <>
                    该套习题基于
                    {setType == "chapterTopic" && (
                      <>
                        {examsRow?.chapter_name?.length > 0 && (
                          <span ref={containerRef}>
                            <Popover
                              placement="bottomLeft"
                              content={chapterMoreComponent()}
                              getPopupContainer={() =>
                                containerRef.current || document.body
                              }
                              title=""
                            >
                              <span className="question_hint_content_title">
                                &nbsp;已选章节&nbsp;
                                <ZYIcon type="xia" style={{ fontSize: 12 }} />
                                &nbsp;
                              </span>
                            </Popover>
                          </span>
                        )}
                      </>
                    )}
                    {(examsRow?.chapter_name?.length == 0 ||
                      !examsRow?.chapter_name) && <>题型</>}
                    {questionsNumberInfo}
                  </>
                )}
              </span>
            </div>
          )}
        </>
        <div
          style={{
            height: '100%'
          }}
          ref={printRef}
        >

          {questionsList?.length > 0 && flagStatusTi != "edit" && (
            <h1
              className="setting_questions_list_title"
              style={{
                textAlign: "center",
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              {questionsTitle}
            </h1>
          )}
          {/* {
            download && <div className="setting_questions_box_download">
              <br />
            </div>
          } */}
          {questionsList?.length > 0 && flagStatusTi == "edit" && <Input
            showCount maxLength={50}
            placeholder="请输入作业名称"
            value={questionsTitle}
            onChange={(e) => {
              const val = e.target.value;
              setQuestionsTitle(val);
              if (isPaperCompose) {
                schedulePaperDraftSave(questionsListRef.current, val, 800);
              }
            }}
          />}
          <>
            {questionsList?.length > 0 && flagStatusTi == "edit" && (
              <div className="question_new_btn_box">
                {setType == "chapterTopic" && (
                  <>
                    <Button
                      type="primary"
                      className="question_new_btn"
                      icon={<PlusOutlined />}
                      disabled={loading}
                      onClick={() => {
                        setAddQuestion(true);
                      }}
                    >
                      新增习题
                    </Button>
                  </>
                )}

                {(setType == "uploadTopic" || setType == 'paper') && (
                  <>
                    <Button
                      type="primary"
                      className="question_new_btn"
                      icon={<PlusOutlined />}
                      disabled={loading}
                      onClick={() => {
                        setAddQuestion(true);
                      }}
                    >
                      新增习题
                    </Button>
                    {/* 题目预览中隐藏掉上传搜题功能 */}
                    {/* <Dropdown
                  menu={{ items: chapterTopicItems }}
                  // overlayClassName="setting_topic_title_right_dropdown"
                  >
                    <Button
                      type="primary"
                      className="question_new_btn"
                      icon={<PlusOutlined />}
                      disabled={loading}
                      onClick={() => {
                        setAddQuestion(true);
                      }}
                    >
                      新增习题
                    </Button>
                  </Dropdown> */}
                  </>
                )}
              </div>
            )}
          </>
          <div className="setting_questions_list_content" ref={scrollableDivRef}>
            <Affix
              offsetBottom={20}
              style={{
                position: "absolute",
                right: 20,
                bottom: 20,
                zIndex: 1,
              }}
            >
              <div className="affix_box">
                <Tooltip placement="left" title={"回到顶部"}>
                  <div
                    className={`relation_container_css_left up_icon_box ${isAtTop ? " disabled" : ""}`}
                    onClick={() => {
                      if (isAtTop) return;
                      scrollableDivRef.current.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                  >
                    <ZYIcon type="huidaodingbu" style={{ fontSize: "16px" }} />
                  </div>
                </Tooltip>
                <Tooltip placement="left" title={"去到底部"}>
                  <div
                    className={`relation_container_css_left down_icon_box ${isAtBottom ? " disabled" : ""}`}
                    onClick={() => {
                      if (isAtBottom) return;
                      scrollableDivRef.current.scrollTo({
                        top: scrollableDivRef.current.scrollHeight,
                        behavior: "smooth",
                      });
                    }}
                  >
                    <ZYIcon type="qudaodibu" style={{ fontSize: "16px" }} />
                  </div>
                </Tooltip>
              </div>
            </Affix>

            {questionsList?.length > 0 && (
              <div>
                <DraggableListNode
                  {...props}
                  flagStatusTi={flagStatusTi}
                  addQuestion={addQuestion}
                  questions={questionsList}
                  showScore={isPaperCompose}
                  creation_type={examsRow?.creation_type}
                  isDragVerification={(setType == "uploadTopic" || setType == 'paper') ? false : true}
                  shouTree={(setType == "uploadTopic")}
                  setType={setType}
                  searchRow={{
                    kpoint_ids: filtering_list.includes(attributeObject?.subject) ? questionsList?.[0]?.catalog_ids : questionsList?.[0]?.kpoint_ids, // 有无知识点
                    catalog_ids: questionsList?.[0]?.catalog_ids,
                    paper_type_id: questionsList?.[0]?.paper_type_ids?.ids?.[0],
                    area_id: questionsList?.[0]?.area_ids?.ids?.[0],
                    year: questionsList?.[0]?.year?.ids,
                  }}
                  attributeObject={attributeObject}
                  closeDrawer={() => {
                    setAddQuestion(false);
                  }}
                  topicUpdate={(arr: any) => {
                    setQuestionsList(arr);
                    setQuestionsNumberInfo(formatQuestionsNumberInfo(arr));
                    if (isPaperCompose) {
                      schedulePaperDraftSave(arr, questionsTitle);
                    }
                  }}
                  selectPrintType={selectPrintType}
                  download={download}
                />
              </div>
            )}
            {/* <>{iconComponent()}</> */}
          </div>
          {questionsList?.length > 0 && selectPrintType == 'normal' && (
            <div className="answer-list unshow-answer">
              <br />
              <h1
                className="answer-list-title"
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  textAlign: "center"
                }}
              >
                {questionsTitle} (答案)
              </h1>
              {/* <br /> */}
              {questionsList.map((item: any, index: number) => (
                <div className="answer-item" key={index}>
                  <h5 className="answer-item-title">第{index + 1}题</h5>
                  <div className="answer-item-label">
                    {renderHtml(`【答案】${item?.answer ?? ""}`)}
                  </div>
                  <div className="answer-item-analysis">
                    {renderHtml(item?.explanation)}
                  </div>
                  <br />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 上传搜题 */}
      {/* <ExercisesUploadFile
        {...props}
        onRef={uploadRef}
        courseId={courseId}
        onFinish={onFinish}
        // fileListData={fileList}
        submit={submit}
        showType={"checkbox"}
        multiple={true}
      /> */}

      {contextHolder}
    </div>
  );
};

export default connect((state: any) => ({
  aiClassroomModel: state.aiClassroomModel,
  commonModel: state.commonModel,
  authModel: state.authModel,
}))(App);
