import { useEffect, useState, useRef } from "react";
import {
  Layout,
  Button,
  Drawer,
  Space,
  message,
  Select,
  Skeleton,
  Tree,
  Tooltip,
} from "antd";
import { connect, useDispatch, useLocation, useSelector } from "umi";
import { ZYIcon } from "@/components";
import QuestionType from "@/components/QuestionType";
import {
  selectOptionsData,
  questionTypesListData,
  single_choice_list,
  multiple_choice_list,
  fill_in_the_blank_list,
  short_answer_list,
  true_false_list,
  filtering_list,
} from "@/global";

import "./index.less";
import { deepCopy } from "@/utils";
import { useTeacherContext } from '@/components/LayoutSider';
import {all_question_number} from "@/global";
import { formatXkwQuestionTypeOptions } from "../../../utils/xkwQuestionTypeHelpers";
import {
  buildQuestionRulesFromList,
  buildCatalogAndKpointIdsFromCheckItems,
  mapPersonalQuestionToRow,
  parsePersonalQuestionListResponse,
  paperYearOptions,
} from "../../../utils/personalQuestionModalHelpers";
import { resolvePaperId } from "../../constants";
import {
  getResolvedXkwCascaderState,
  restoreXkwCascaderState,
} from "../../../utils/xkwCascaderPersist";
const diffTypesList = [
  // { value: "0", label: "不限", name: "buxian" },
  { value: "17", label: "容易", name: "easy" },
  { value: "18", label: "较易", name: "easy_moderate" },
  { value: "19", label: "适中", name: "medium" },
  { value: "20", label: "较难", name: "moderate_hard" },
  { value: "21", label: "困难", name: "hard" },
];

const App = (props: any) => {
  const {
    openDrawer,
    cancel,
    changeRow,
    attributeObject,
    items,
    uploadType,
    commonModel,
    addSearchRow,
    shouTree = false,
  } = props;

  const dispatch = useDispatch();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const timerIdRef = useRef<any>(null);
  const isPaperMode = props?.setType === "paper";
  const {
    xkwCascaderValue = [],
    xkwTextbookId = "",
    xkwSubjectId = "",
    xkwCourseId,
  } = useSelector((state: any) => state.settingTopicModel);
  // const courseId = searchParams.get("courseId");
  const [context] = useTeacherContext()
  const courseId = context?.course_id

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  // const [questionTypesList, setQuestionTypesList] = useState(questionTypesListData)
  const [selectOptions, setSelectOptions] = useState(selectOptionsData);

  const [area, setArea] = useState([]); // 地区
  const [years, setYears] = useState([]); // 年份
  const [questionTypesList, setQuestionTypesList] = useState<any>([]); // 题型
  const [paperTypesList, setPaperTypesList] = useState([]); // 场景

  const [paperTypesValue, setPaperTypesValue] = useState(""); //选择的场景
  const [yearsRow, setYearsRow] = useState(""); // 选择的年份
  const [areaValue, setAreaValue] = useState(""); // 选择的地区
  const [diffTypesValue, setDiffTypesValue] = useState("17"); // 选择的难度
  const [questionTypesValue, setQuestionTypesValue] = useState(""); // 选择的题型
  // const [xkwTextbookId, setXkwTextbookId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState<any>(null); // 要替换的题目
  const [questionList, setQuestionList] = useState<any>([]);
  const [textbook_id, setTextbook_id] = useState<any>([]);
  const [question_rules, setQuestion_rules] = useState<any>([]);

  const [flagFirst, setFlagFirst] = useState(true); // 是否第一次进来

  const [treeData, setTreeData] = useState([]); // 章节目录树数据
  // const [knowledgePoints, setKnowledgePoints] = useState([]); // 知识点数据
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]); // 选中节点
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [checkItems, setCheckItems] = useState<any>([]); // 选中的节点item

  useEffect(() => {
    if (openDrawer) {
      console.log("attributeObject", attributeObject);
      setFlagFirst(true);
      setOpen(openDrawer);
      init();
    }
  }, [openDrawer]);

  const init = async () => {
    if (isPaperMode) {
      setQuestionList([]);
      setCheckItems([]);
      setCheckedKeys([]);
      // 刷新后 Redux 可能丢失 subjectId，从 session / 试卷侧持久化回填
      restoreXkwCascaderState(dispatch, {
        xkwCascaderValue,
        xkwTextbookId,
        xkwSubjectId,
        xkwCourseId,
      });
      await initPaperFilters();
      await loadPaperTreeAllSelected();
      return;
    }
    await getTreeData();
    await initAttributeObject();
    await backfill();
    setCheckItems([]);
    setCheckedKeys([]);
  };

  const initPaperFilters = async () => {
    const resolved = getResolvedXkwCascaderState({
      xkwCascaderValue,
      xkwTextbookId,
      xkwSubjectId,
      xkwCourseId,
    });
    const courseIdForFilter = resolved.xkwCourseId || resolved.xkwCascaderValue?.[0];

    setYears(paperYearOptions as any);
    setYearsRow("2017");
    setDiffTypesValue("17");

    const areaRes: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getFindXkwAreaList",
      payload: { level: "PROVINCE" },
    });
    if (areaRes?.code === 200) {
      const options = (areaRes.data || []).map((item: any) => ({
        value: item.id,
        label: item.shortName || item.name,
      }));
      setArea(options);
      if (options.length > 0) setAreaValue(options[0].value);
    }

    const stageRes: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getMindQuestionGetTeacherStageId",
      payload: {},
    });
    if (stageRes?.code === 200) {
      const paperRes: any = await dispatch({
        type: "settingTopicModel/getData",
        apiUrl: "getFindXkwPaperTypeList",
        payload: { stageId: stageRes.data },
      });
      if (paperRes?.code === 200) {
        const list = paperRes.data || [];
        setPaperTypesList(
          list.map((item: any) => ({ label: item.name, value: item.id })),
        );
        if (list.length > 0) setPaperTypesValue(list[0].id);
      }
    }

    if (courseIdForFilter) {
      const typeRes: any = await dispatch({
        type: "settingTopicModel/getData",
        apiUrl: "getFindXkwQuestionTypeList",
        payload: { courseId: courseIdForFilter },
      });
      if (typeRes?.code === 200) {
        const options = formatXkwQuestionTypeOptions(typeRes.data || []);
        setQuestionTypesList(options);
        if (options.length > 0) setQuestionTypesValue(options[0].value);
      }
    }
  };

  const loadPaperTreeAllSelected = async () => {
    const resolved = getResolvedXkwCascaderState({
      xkwCascaderValue,
      xkwTextbookId,
      xkwSubjectId,
      xkwCourseId,
    });
    const textbookId =
      resolved.xkwTextbookId || resolved.xkwCascaderValue?.[2];
    if (!textbookId) {
      message.warning("请先在课程教材中选择教材");
      return;
    }
    const { code, data = [] }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getFindXkwTbKPTreeList",
      payload: { textbookId },
    });
    if (code === 200) {
      const tree = data?.[0]?.treeJson?.tree || [];
      setTreeData(tree);
      setCheckItems(tree);
    }
  };

  const fetchPersonalQuestionList = async () => {
    const resolved = getResolvedXkwCascaderState({
      xkwCascaderValue,
      xkwTextbookId,
      xkwSubjectId,
      xkwCourseId,
    });
    const courseIdValue =
      resolved.xkwCourseId || resolved.xkwCascaderValue?.[0];
    if (!courseIdValue) {
      message.warning("请先在课程教材中选择课程");
      return;
    }
    const subjectIdValue = String(resolved.xkwSubjectId || "");
    if (!subjectIdValue) {
      message.warning("学科信息缺失，请返回列表重新选择课程教材");
      return;
    }
    const { catalogIdList, kpointIdList } =
      buildCatalogAndKpointIdsFromCheckItems(checkItems);
    if (!catalogIdList.length && !kpointIdList.length) {
      message.warning("教材章节数据加载中，请稍后重试");
      return;
    }

    setLoading(true);
    try {
      const difficultyLevelList =
        diffTypesValue && diffTypesValue !== "0"
          ? [Number(diffTypesValue)]
          : [];
      const payload: Record<string, any> = {
        courseId: Number(courseIdValue),
        year: Number(yearsRow) || undefined,
        count: 10,
        formulaPicFormat: "svg",
        kpointIdList,
        typeIdList: questionTypesValue ? [String(questionTypesValue)] : [],
        paperTypeIdList:
          paperTypesValue !== "" && paperTypesValue != null
            ? [Number(paperTypesValue)]
            : [],
        catalogIdList,
        difficultyLevelList,
        areaIdList: areaValue ? [String(areaValue)] : [],
        kpointMatchType: 0,
        filterExceedsScopeQues: 0,
        versionId: resolved.xkwCascaderValue?.[1]
          ? Number(resolved.xkwCascaderValue[1])
          : undefined,
        textbookId:
          Number(resolved.xkwTextbookId || resolved.xkwCascaderValue?.[2]) ||
          undefined,
        subjectId: subjectIdValue,
      };

      if (uploadType === "add") {
        const paperId = resolvePaperId(searchParams);
        if (!paperId) {
          message.warning("缺少试卷信息，无法新增习题");
          return;
        }
        payload.newQuesFlag = true;
        payload.paperId = paperId;
      } else {
        payload.newQuesFlag = false;
      }

      const { code, data }: any = await dispatch({
        type: "settingTopicModel/postData",
        apiUrl: "postFindPersonalQuestionList",
        payload,
      });

      if (code === 200) {
        const rawList = parsePersonalQuestionListResponse(data);
        const examList = rawList.map((item: any) =>
          mapPersonalQuestionToRow(item),
        );
        const questionRules = buildQuestionRulesFromList(examList);
        setQuestionList(dealwithQuestionList(examList, {}, questionRules));
      } else {
        setQuestionList([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // 地区、场景、年份、题型筛选项
  const initAttributeObject = async () => {
    console.log("地区、场景、年份、题型筛选项", attributeObject);
    if (attributeObject) {
      setArea(
        attributeObject?.area_ids?.map((item: any) => ({
          value: item?.id,
          label: item?.short_name,
        })),
      );
      setYears(
        attributeObject?.year_list?.map((item: any) => {
          return {
            value: item?.value,
            label:
              item?.type == "all"
                ? "全部"
                : item?.type == "near_5_years"
                  ? "近5年"
                  : "近3年",
          };
        }),
      );
      setQuestionTypesList(
        attributeObject?.question_types?.map((item: any) => ({
          label: item?.name,
          value: item?.en_name,
        })),
      );
      setPaperTypesList(
        attributeObject?.paper_types?.map((item: any) => ({
          label: item?.name,
          value: item?.id,
        })),
      );
    }
  };

  // 回填已选择的查询条件
  const backfill = () => {
    if (changeRow && uploadType == "change") {
      // setCurrentQuestion(changeRow);
      setYearsRow(changeRow?.year.ids);

      setDiffTypesValue(
        diffTypesList.find((item: any) => item?.name === changeRow?.difficulty)
          ?.value || "17",
      );
      setPaperTypesValue(changeRow?.paper_type_ids.ids[0]);
      setQuestionTypesValue(changeRow?.question_type);
      setAreaValue(changeRow?.area_ids.ids[0]);
    }
    if (uploadType == "add") {
      setYearsRow(addSearchRow?.year || attributeObject?.year_list?.[0]?.value);

      setAreaValue(addSearchRow?.area_id || attributeObject?.area_ids?.[0]?.id);

      setPaperTypesValue(
        addSearchRow?.paper_type_id || attributeObject?.paper_types?.[0]?.id,
      );

      setQuestionTypesValue(attributeObject?.question_types?.[0]?.en_name);
    }
  };

  useEffect(() => {
    if (isPaperMode) {
      if (!flagFirst) return;
      if (
        questionTypesValue &&
        yearsRow &&
        checkItems.length > 0
      ) {
        fetchPersonalQuestionList();
        setFlagFirst(false);
      }
      return;
    }
    if (!flagFirst) {
      return;
    }
    if (yearsRow && questionTypesValue) {
      getTaskId();
      setFlagFirst(false);
    }
  }, [
    isPaperMode,
    paperTypesValue,
    areaValue,
    yearsRow,
    questionTypesValue,
    checkItems,
  ]);

  // 获取任务id
  const getTaskId = async () => {
    if (isPaperMode) {
      await fetchPersonalQuestionList();
      return;
    }

    // 有无知识点的学科
    let _flag_subject = filtering_list.includes(attributeObject?.subject)

    if(attributeObject?.stage == '小学' && attributeObject?.subject == '道德与法治') {
      _flag_subject = filtering_list.includes(attributeObject?.stage + attributeObject?.subject)
    }
    
    setLoading(true);
    let payload = {};
    let kpoint_ids = [];

    if (uploadType == "change") {
      if (shouTree) {
        kpoint_ids = await dealWithKpointIds(checkItems);
        // kpoint_ids = checkedKeys;
      } else {
        kpoint_ids = changeRow?.kpoint_ids;
      }

      if(kpoint_ids?.length == 0 && props?.setType == 'chapterTopic') {
        kpoint_ids = changeRow?.catalog_ids
      }

      if (kpoint_ids?.length == 0 && !_flag_subject) {
        setLoading(false);
        return;
      }

      if(kpoint_ids?.length == 0 && (props?.setType == 'uploadTopic' || props?.setType == 'paper')) {
        setLoading(false);
        return;
      }

      payload = {
        creation_type: "overall_comprehensive_difficulty",
        difficulty: Number(
          diffTypesList.find(
            (item: any) => item?.name === changeRow?.difficulty,
          )?.value || "17",
        ),
        question_rules:
          changeRow?.question_rules_list?.length > 0
            ? changeRow.question_rules_list.map((item: any) => ({
              type: item.type,
              count: item.type === changeRow?.question_type ? 10 : 0,
              ids: item.ids,
            }))
            : [],
        textbook_id: changeRow?.textbook_id,
        kpoint_ids: kpoint_ids,
        catalog_ids: changeRow?.catalog_ids,
        area_ids: changeRow?.area_ids.ids,
        paper_type_ids: changeRow?.paper_type_ids.ids,
        year: changeRow?.year.ids,
        space_id: courseId,
        generation_scene: 'append_question' //normal(正常出题)/append_question(新增题)/replace_question(换题)
      };
    }

    if (uploadType == "add") {
      console.log("新增");
      if (shouTree) {
        kpoint_ids = await dealWithKpointIds(checkItems);
        // kpoint_ids = checkedKeys;
      } else {
        kpoint_ids = addSearchRow?.kpoint_ids;
      }

      if(kpoint_ids?.length == 0 && props?.setType == 'chapterTopic') {
        kpoint_ids = addSearchRow?.catalog_ids
      }

      if (kpoint_ids?.length == 0 && !_flag_subject) {
        setLoading(false);
        return;
      }

      if(kpoint_ids?.length == 0 && (props?.setType == 'uploadTopic' || props?.setType == 'paper')) {
        setLoading(false);
        return;
      }

      payload = {
        space_id: courseId,
        creation_type: "overall_comprehensive_difficulty",
        year: yearsRow,
        paper_type_ids: [paperTypesValue],
        area_ids: [areaValue],
        catalog_ids: changeRow?.catalog_ids,
        kpoint_ids: kpoint_ids,
        textbook_id: attributeObject?.textbook_id,
        difficulty: diffTypesValue ? Number(diffTypesValue) : 0,
        question_rules: attributeObject?.question_types?.map((item: any) => ({
          type: item.en_name,
          count: item.en_name === questionTypesValue ? 10 : 0,
          ids: item.ids,
        })),
        generation_scene: 'append_question' //normal(正常出题)/append_question(新增题)/replace_question(换题)
      };
    }

    let { code, data = {} }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "postExternalGenerateOverallDifficulty",
      payload,
    });
    if (code === 200) {
      if (data?.id) {
        getQuestionList(data?.id);
      }
    } else {
      message.error("获取任务失败");
    }
  };

  // 获取题目列表
  const getQuestionList = async (id: any) => {
    let { code, data = {} }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "getExamsQuestionsList",
      payload: {
        id,
      },
    });
    if (code === 200) {
      let questions_list = [];
      // if (data?.status == "cancelled") {
      //   return;
      // }
      if (data?.status !== "succeeded") {
        timerIdRef.current = setTimeout(() => {
          getQuestionList(id);
        }, 2000);
      }
      if (data?.status == "succeeded") {
        setLoading(false);
        if (data?.questions?.length > 0) {
          questions_list = dealwithQuestionList(
            data?.questions,
            data?.info,
            data?.question_rules,
          );
          setQuestionList(questions_list);
          // setQuestionList([]);
        }
        if (data?.questions?.length == 0) {
          setQuestionList([]);
        }
      }
    } else {
      setLoading(false);
      message.error("获取题目列表失败");
    }
  };

  const dealwithQuestionList = (list: any, info: any, questionRules: any) => {
    return list?.map((item: any) => {
      return {
        ...item,
        info,
        question_rules: questionRules,
        question_rules_list: questionRules,
        optionsList:
          item?.options?.length > 0 &&
          item?.options?.map((val: any, key: any) => {
            return {
              label: selectOptions[key],
              content: val,
            };
          }),
        answer: getAnswer(item),
        type: questionTypesList?.find((k: any) => {
          return k?.code === item?.question_type;
        })?.type,
        showDetails: true,
      };
    });
  };

  //处理答案数据
  const getAnswer = (item: any) => {
    // 单选
    if (single_choice_list.includes(item?.question_type)) {
      return selectOptions[
        item?.options?.findIndex((val: any) => {
          return val === item?.correct_answers[0];
        })
      ];
    }
    // 多选
    if (multiple_choice_list.includes(item?.question_type)) {
      let flag_string = "";
      item?.correct_answers?.map((val: any) => {
        let flag_string_index = item?.options?.findIndex((k: any) => {
          return k === val;
        });
        if (flag_string_index !== -1) {
          flag_string += selectOptions[flag_string_index];
        }
      });

      return flag_string;
    }
    // 简单题
    if (short_answer_list.includes(item?.question_type)) {
      return item?.correct_answers?.[0];
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

  const showDetailsFn = (e: any, item: any) => {
    // 阻止事件冒泡
    e.stopPropagation();
    e.preventDefault();
    setQuestionList((prev: any) =>
      prev.map((prevItem: any) => ({
        ...prevItem,
        showDetails:
          prevItem.id === item.id
            ? !prevItem.showDetails
            : prevItem.showDetails,
      })),
    );
  };

  // 替换题
  const replaceQuestion = (val: any) => {
    let _flagIndex = items?.findIndex((item: any) => {
      return item?.id == changeRow?.id;
    });

    // 替换
    // let _arr = items.splice(_flagIndex, 1, { ...val });

    items[_flagIndex] = { ...val };

    props?.questionsUpdateChange?.(deepCopy(items));
    cancel?.();
  };

  // 新增题
  const addQuestionFn = (val: any) => {
    // uploadTopic 上传搜题  chapterTopic 章节题目出题  paper 题库出题
    console.log('setType', props?.setType)
    if (props?.setType == 'chapterTopic') {
      if (items?.length > all_question_number) {
        message.warning(`题目总数不能大于${all_question_number}`);
        return;
      }
      let _flagIndex = items?.findIndex((item: any) => {
        return item?.question_type == val?.question_type;
      });
      if (_flagIndex != -1) {
        items.splice(_flagIndex, 0, { ...val });
        props?.questionsUpdateChange?.(deepCopy(items));
      }
      if (_flagIndex == -1) {
        let _all_question_list = [...items, { ...val }];

        let _flag_question_rules = _all_question_list?.[0]?.question_rules;

        let _arr: any = [];
        _flag_question_rules?.map((item: any, index: any) => {
          let _flag_question_list = _all_question_list?.filter(
            (v: any, k: any) => {
              return v?.question_type == item?.type;
            },
          );
          _arr = [..._arr, ..._flag_question_list];
        });

        props?.questionsUpdateChange?.(deepCopy(_arr));
      }
    }

    if (props?.setType == 'uploadTopic' || props?.setType == 'paper') {
      if (items?.length > all_question_number) {
        message.warning(`题目总数不能大于${all_question_number}`);
        return;
      }
      let _all_question_list = [...items, { ...val }];
      props?.questionsUpdateChange?.(deepCopy(_all_question_list));
    }
  };

  // 取消加入题
  const cancelQuestionFn = (val: any) => {
    let _arr = items?.filter((item: any) => {
      return item?.id !== val?.id;
    });

    props?.questionsUpdateChange?.(deepCopy(_arr));
  };

  const onTreeCheck = (checkedKeys: any, info: any) => {
    const checkedIdNumbers = (checkedKeys as string[]).map((key) => key);
    console.log("checkedKeys", info.checkedNodes, checkedIdNumbers);
    setCheckedKeys(checkedIdNumbers);
    setCheckItems(info.checkedNodes);
  };

  // 获取目录树数据
  const getTreeData = async () => {
    const { code, data = [] }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "getCatalogKpointTree",
      payload: { course_id: courseId },
    });
    if (code == 200) {
      console.log("获取树", data);
      // setXkwTextbookId(data?.xkw_textbook_id);

      setTreeData(data?.tree);
      setExpandedKeys(getAllKeys(data?.tree, 1));
    }
  };

  // 默认展开所有节点
  const getAllKeys = (nodes: any[], nodeLevel: any): string[] => {
    const keys: string[] = [];
    const traverse = (nodeList: any[]) => {
      nodeList.forEach((node) => {
        keys.push(node?.id as string);
        if (node?.children && nodeLevel < 1) {
          traverse(node?.children);
        }
      });
    };
    traverse(nodes);
    return keys;
  };

  // 处理树节点
  const dealWithKpointIds = async (list: any) => {
    const result: any = [];
    (function dfs(arr) {
      arr.forEach((node: any) => {
        if (node?.type == "kpoint") {
          result.push(node.kpoint_id); // 收集当前节点
        } else {
          result.push(node.id); // 收集当前节点
        }

        if (node.children?.length)
          // 有子节点就继续递归
          dfs(node.children);
      });
    })(list);
    return result;
  };

  const getEmptyText = () => {
    let _text = '暂无可替换题目'


    if (props?.setType == 'uploadTopic' || props?.setType == 'paper') {
      if (isPaperMode) {
        _text = '暂无可选题目';
      } else {
        _text = '请选择章节目录知识点后查询题目';
      }
    }

    // if(shouTree && checkedKeys?.length > 0 ){
    //   _text = '暂无可替换题目'
    // }

    return _text
  }

  // 底部按钮
  const footerBtn = [
    <Button
      key="back"
      onClick={() => cancel?.()}
      style={{ margin: "0 12px 0 8px" }}
    >
      取消
    </Button>,
    <Button key="submit" type="primary" loading={loading} onClick={getTaskId}>
      换一批
    </Button>,
  ];

  return (
    <>
      {open && (
        <Drawer
          closable={true}
          maskClosable={false}
          // destroyOnHidden={true}
          title={uploadType == "add" ? "新增习题" : "习题替换"}
          placement="right"
          open={open}
          // loading={loading}
          width={1080}
          onClose={() => {
            cancel?.();
          }}
          // footer={rowDrawer?.is_master_doc === 1 ? footerBtn : []}
          footer={footerBtn}
          className="setting-topic-knowledge-modal"
        >
          <div className="setting-topic-knowledge-content">
            {shouTree && (
              <div className="setting-topic-knowledge-content-tree">
                <Tree
                  autoExpandParent={true}
                  checkable={true}
                  blockNode={true}
                  // defaultExpandAll
                  expandedKeys={expandedKeys}
                  onExpand={(keys: any) => setExpandedKeys(keys)}
                  fieldNames={{ key: "id" }}
                  treeData={treeData}
                  selectedKeys={selectedKeys} // 选中节点回调
                  switcherIcon={
                    <span>
                      <ZYIcon type="xia" style={{ fontSize: 12 }} />
                    </span>
                  }
                  onSelect={(selectedKeys: any, info: any) => { }}
                  checkedKeys={checkedKeys} // 选中节点回调
                  checkStrictly={false} // 开启父子联动选择
                  onCheck={onTreeCheck}
                  titleRender={(nodeData: any) => (
                    <>
                      <Tooltip title={nodeData?.title} placement="topLeft">
                        <div className="tree-node-title ">
                          {nodeData?.title}
                        </div>
                      </Tooltip>
                    </>
                  )}
                />
              </div>
            )}
            <div
              className={`modal-content  ${shouTree ? " modal-content-line" : ""}`}
            >
              <Space className="modal-content-filter">
                <Select
                  value={questionTypesValue}
                  options={questionTypesList}
                  onChange={(value) => setQuestionTypesValue(value)}
                  disabled={uploadType == "change"}
                />
                <Select
                  value={diffTypesValue}
                  options={diffTypesList}
                  onChange={(value) => setDiffTypesValue(value)}
                  disabled={uploadType == "change"}
                />
                <Select
                  value={areaValue}
                  options={area}
                  onChange={(value) => setAreaValue(value)}
                  disabled={uploadType == "change"}
                />
                <Select
                  value={yearsRow}
                  options={years}
                  onChange={(value) => setYearsRow(value)}
                  disabled={uploadType == "change"}
                />
                <Select
                  value={paperTypesValue}
                  options={paperTypesList}
                  onChange={(value) => setPaperTypesValue(value)}
                  disabled={uploadType == "change"}
                  placeholder="练习场景"
                />
                {uploadType == "add" && (
                  <Button type="primary" onClick={getTaskId} loading={loading}>
                    查询
                  </Button>
                )}
              </Space>
              {uploadType == "change" && (
                <p className="modal-content-title">
                  准备替换——第{changeRow?.rowKey + 1}题
                </p>
              )}
              {!loading && questionList?.length > 0 && (
                <div className="modal-content-css">
                  <div className="modal-content-list">
                    {questionList?.map((item: any, index: number) => (
                      <div
                        className="question-item-box"
                        key={index + item?.id}
                        onClick={(e) => showDetailsFn(e, item)}
                      >
                        <div></div>
                        {/* <div className="question_drag_box_title_box">
                          {item?.source_summary && (
                            <div className="question_drag_box_title_box_left">
                              {item?.source_summary}
                            </div>
                          )}
                          <div></div>
                          <div></div>
                        </div> */}
                        <QuestionType
                          key={item.id}
                          uploadType={uploadType}
                          row={item}
                          items={items}
                          rowKey={index}
                          replaceQuestionFn={replaceQuestion}
                          addQuestionFn={addQuestionFn}
                          cancelQuestionFn={cancelQuestionFn}
                          showAnswer={item?.showDetails}
                          showSource={true}
                          setType={props?.setType}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* 空状态 */}
              {!loading && questionList?.length == 0 && (
                <div className="modal-empty">
                  <ZYIcon type="kongshuju7" />
                  <p className="text">{getEmptyText()}</p>
                </div>
              )}
              {/* 骨架屏 */}
              {loading && (
                <div className="modal-skeleton">
                  <Space
                    direction="vertical"
                    size={24}
                    style={{ width: "100%" }}
                  >
                    {/* <Space size={25} style={{ width: "100%" }}>
                    {Array.from({ length: 4 }).map((item, index) => (
                      <Skeleton.Input key={index} active />
                    ))}
                  </Space> */}
                    {Array.from({ length: 3 }).map((item, index) => (
                      <Space
                        key={index}
                        direction="vertical"
                        size={20}
                        style={{ width: "100%" }}
                      >
                        <Skeleton key={index} active />
                        <Skeleton.Node active style={{ width: 745 }} />
                      </Space>
                    ))}
                  </Space>
                  {Array.from({ length: 3 }).map((item, index) => (
                    <Space
                      key={index}
                      direction="vertical"
                      size={20}
                      style={{ width: "100%" }}
                    >
                      <Skeleton key={index} active />
                      <Skeleton.Node active style={{ width: 745 }} />
                    </Space>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(App);
