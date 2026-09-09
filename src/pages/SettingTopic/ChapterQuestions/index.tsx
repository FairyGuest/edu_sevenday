import { useEffect, useRef, useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Dropdown,
  Select,
  DatePicker,
  Input,
  Tree,
  Tooltip,
  Tag,
  Radio,
  Row,
  Col,
  Popover,
  InputNumber,
  message,
} from "antd";
import { connect, useDispatch, useSelector } from "@umijs/max";
import { history, Outlet, useLocation } from "umi";
import { SearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { ZYIcon } from "@/components";
import jiaoxuebiaoshiImg from "@/assets/jiaoxuebiaoshi.png";
import Breadcrumb from "../components/Breadcrumb";
import PullupDrawer from "./component/PullupDrawer";
import bannerBg from "./assets/banner-bg.png";
import bannerIcon from "./assets/banner-icon.png";
import iconMastery from "./assets/icon-mastery.svg";
import iconWeak from "./assets/icon-weak.svg";
import iconPracticed from "./assets/icon-practiced.svg";
import {
  DEFAULT_TI_DIFFICULTY_MODERATION_VALUE,
  DEFAULT_TI_DIFFICULTY_VALUE,
  DEFAULT_YEARS,
  DEFAULT_YEARS_ROW,
  LIMITED_QUESTION_TYPES,
  TI_DIFFICULTY_MODERATION,
  TI_DIFFICULTY_SET,
  XIAOXUE_PAPER_TYPES_LIST,
  isApiSuccess,
} from "./constants";
import { DIFFICULTY_TIP } from "./hooks/chapterQuestionHelpers";
import "./index.less";
import { addTracking } from "@/utils";
// import { useTeacherContext } from '@/components/LayoutSider';
// import { addNewTracking } from "@/utils";
import { all_question_number } from "@/global";
import { getXkwLeafQuestionTypes } from "../utils/xkwQuestionTypeHelpers";
import { buildCatalogAndKpointIdsFromCheckItems } from "../utils/personalQuestionModalHelpers";
import { saveXkwCascaderPersist, restoreXkwCascaderState } from "../utils/xkwCascaderPersist";
import { clearChapterQuestionsPersist } from "./hooks/chapterQuestionsPersist";

const { Content, Sider } = Layout;
const { RangePicker } = DatePicker;

const questionTypesListData = LIMITED_QUESTION_TYPES;
const tiDifficultySet = TI_DIFFICULTY_SET;
const tiDifficultyModeration = TI_DIFFICULTY_MODERATION;

const App = (props: any) => {
  const { commonModel } = props;
  // const { search } = useLocation();
  // const searchParams = new URLSearchParams(search);
  // const courseId = searchParams.get("courseId");
  // const [context, contextLoading] = useTeacherContext()
  // const courseId = context?.course_id
  const dispatch = useDispatch();
  const {
    xkwCascaderValue: cascaderValue = [],
    xkwTextbookId = "",
    xkwTextbookName: textbookName = "",
    xkwCourseId,
    xkwSubjectId = "",
  } = useSelector((state: any) => state.settingTopicModel);

  const [loadingAction, setLoadingAction] = useState<"oneClick" | "submit" | null>(
    null,
  );
  const isActionLoading = loadingAction !== null;
  const [classOptions, setClassOptions] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<any>();
  const [jsonData, setJsonData] = useState<any>({}); // 初始化数据
  const [treeData, setTreeData] = useState([]); // 目录树数据
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]); // 选中节点
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]); //  回显选中节点
  const [checkItems, setCheckItems] = useState<any>([]); // 选中的节点item

  const [paperTypesList, setPaperTypesList] = useState([]); // 场景
  const [paperTypesValue, setPaperTypesValue] = useState(""); //选择的场景
  const [area, setArea] = useState([]); // 地区
  const [years, setYears] = useState(DEFAULT_YEARS);

  const [tiDifficultyValue, setTiDifficultyValue] = useState(DEFAULT_TI_DIFFICULTY_VALUE);
  const [tiDifficultyModerationValue, setTiDifficultyModerationValue] =
    useState(DEFAULT_TI_DIFFICULTY_MODERATION_VALUE);

  const [yearsRow, setYearsRow] = useState(DEFAULT_YEARS_ROW);
  const [areaValue, setAreaValue] = useState(""); // 选择的地区

  const [questionTypesList, setQuestionTypesList] = useState<any>([]); // 题型
  const [questionTypesListAll, setQuestionTypesListAll] = useState<any>([]); // 题型

  const treeLoadedForTextbookRef = useRef<string | null>(null);
  const questionTypesLoadedForCourseRef = useRef<string | null>(null);

  const xiaoxue_paperTypesList = XIAOXUE_PAPER_TYPES_LIST;

  useEffect(() => {
    // addNewTracking({
    // bt: 'pv',
    // ct: 'ai_gen_hw_exercise_setting_show'
    // })
  }, [])

  // 进入/刷新均清空表单；仅恢复教材级联以便加载左侧教材树
  useEffect(() => {
    const initPage = async () => {
      clearChapterQuestionsPersist();
      setCheckedKeys([]);
      setCheckItems([]);
      setSelectedKeys([]);
      setTiDifficultyValue(DEFAULT_TI_DIFFICULTY_VALUE);
      setTiDifficultyModerationValue(DEFAULT_TI_DIFFICULTY_MODERATION_VALUE);
      setYearsRow(DEFAULT_YEARS_ROW);
      setPaperTypesValue("");
      setAreaValue("");
      setSelectedClassId(undefined);

      const resolved = restoreXkwCascaderState(dispatch, {
        xkwCascaderValue: cascaderValue,
        xkwTextbookId,
        xkwTextbookName: textbookName,
        xkwCourseId,
        xkwSubjectId,
      });

      await getMindQuestionGetTeacherStageIdFn();
      await getFindXkwAreaListFn();
      await postFindClassListByTeacherFn();

      const courseId = resolved.xkwCourseId || resolved.xkwCascaderValue?.[0];
      const textbookId =
        resolved.xkwTextbookId || resolved.xkwCascaderValue?.[2];

      if (courseId) {
        await getFindXkwQuestionTypeListFn(courseId);
        questionTypesLoadedForCourseRef.current = String(courseId);
      }
      if (textbookId) {
        await getFindXkwTbKPTreeListFn(textbookId);
        treeLoadedForTextbookRef.current = String(textbookId);
      }
    };

    initPage();
  }, []);

  useEffect(() => {
    if (!xkwTextbookId) return;
    if (treeLoadedForTextbookRef.current === String(xkwTextbookId)) return;
    getFindXkwTbKPTreeListFn(xkwTextbookId);
    treeLoadedForTextbookRef.current = String(xkwTextbookId);
  }, [xkwTextbookId]);

  // 教师班级列表（一键组作业）
  const postFindClassListByTeacherFn = async () => {
    const { code, data }: any = await dispatch({
      type: "settingTopicModel/postData",
      apiUrl: "postFindClassListByTeacher",
      payload: {},
    });
    if (isApiSuccess(code)) {
      // 当前：data = [{ id, name, classList: [], ... }]；兼容 records/list
      const records = Array.isArray(data)
        ? data
        : Array.isArray(data?.records)
          ? data.records
          : data?.list || [];
      const options = records.flatMap((item: any) => {
        if (
          Array.isArray(item?.classList) &&
          item.classList.length > 0 &&
          (item.id == null || item.id === -1) &&
          !item.name
        ) {
          return item.classList.map((cls: any) => ({
            value: cls.nodeId ?? cls.classId ?? cls.id,
            label: cls.name ?? cls.className ?? cls.title ?? "",
          }));
        }
        return [
          {
            value: item.id ?? item.nodeId ?? item.classId,
            label: item.name ?? item.className ?? item.title ?? "",
          },
        ];
      });
      setClassOptions(options);
      if (options.length === 1) {
        setSelectedClassId(options[0].value);
      }
    }
  };

  useEffect(() => {
    if (!xkwCourseId) return;
    if (questionTypesLoadedForCourseRef.current === String(xkwCourseId)) return;
    getFindXkwQuestionTypeListFn(xkwCourseId);
    questionTypesLoadedForCourseRef.current = String(xkwCourseId);
  }, [xkwCourseId]);

  // 获取学段
  const getMindQuestionGetTeacherStageIdFn = async () => {
    const { code, data = [] }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getMindQuestionGetTeacherStageId",
      payload: {},
    });
    if (code == 200) {
      console.log("获取学段", data);

      // 2=小学, 3=初中, 4=高中
      getFindXkwPaperTypeListFn(data);
    }
  }

  // 根据教材ID查询教材JSON
  const getFindXkwTbKPTreeListFn = async (textbookId: any) => {
    const { code, data = [] }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getFindXkwTbKPTreeList",
      payload: { textbookId },
    });
    if (code == 200) {
      const treeJson = data?.[0]?.treeJson || {};
      const tree = treeJson?.tree || [];
      dispatch({
        type: "settingTopicModel/setData",
        payload: {
          xkwTextbookName: treeJson?.textbook_name || textbookName,
          xkwTextbookId: treeJson?.xkw_textbook_id || textbookId,
        },
      });
      saveXkwCascaderPersist({
        xkwTextbookName: treeJson?.textbook_name || textbookName,
        xkwTextbookId: treeJson?.xkw_textbook_id || textbookId,
        xkwCascaderValue: cascaderValue?.length === 3
          ? [
              cascaderValue[0],
              cascaderValue[1],
              treeJson?.xkw_textbook_id || textbookId,
            ]
          : cascaderValue,
      });
      setTreeData(tree);
      setExpandedKeys(getAllKeys(tree, 1));
      setCheckedKeys([]);
      setCheckItems([]);
      setSelectedKeys([]);
    }
  };

  // 根据学段ID查询试卷类型
  const getFindXkwPaperTypeListFn = async (stageId: any) => {
    const { code, data = [] }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getFindXkwPaperTypeList",
      payload: { stageId },
    });
    if (code == 200) {
      const list = data || [];
      setPaperTypesList(list);
      if (list.length > 0) {
        setPaperTypesValue(list[0].id);
      }
    }
  };

  // 根据课程ID查询题目类型
  const getFindXkwQuestionTypeListFn = async (courseId: any) => {
    const { code, data = [] }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getFindXkwQuestionTypeList",
      payload: { courseId },
    });
    if (code == 200) {
      const leafTypes = getXkwLeafQuestionTypes(data).map((item: any) => ({
        ...item,
        count: 0,
      }));
      setQuestionTypesList(leafTypes);
      setQuestionTypesListAll(leafTypes);
    }
  };

  // 返回行政区信息
  const getFindXkwAreaListFn = async () => {
    const { code, data = [] }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getFindXkwAreaList",
      payload: {
        level: 'PROVINCE'
      },
    });
    if (code == 200) {
      const options = (data || []).map((item: any) => ({
        value: item.id,
        label: item.shortName || item.name,
      }));
      setArea(options);
      if (options.length > 0) {
        setAreaValue(options[0].value);
      }
    }
  };

  // 监听选中状态变化，更新右侧展示
  useEffect(() => {
    calculateDisplayNodes();
  }, [checkedKeys]);

  const onTreeCheck = (checkedKeys: any, info: any) => {
    const checkedIdNumbers = (checkedKeys as string[]).map((key) => key);
    setCheckedKeys(checkedIdNumbers);
    // setCheckedKeys(checkedKeys);
    // setCheckKeys(checkedKeys);
    setCheckItems(info.checkedNodes);
  };


  // const getPostExternalQuestionBankAreaIds = async (courseId: any) => {
  //   const { code, data = [] }: any = await dispatch({
  //     type: "setQuestionsModel/postData",
  //     apiUrl: "postExternalQuestionBankAreaIds",
  //     payload: { course_id: courseId },
  //   });
  //   if (code === 200) {
  //     console.log('data', data)
  //     setJsonData(data)
  //     init(data)
  //   }
  // };

  // const init = (data: any) => {
  //   //练习场景
  //   setPaperTypesList(data?.paper_types);
  //   setPaperTypesValue(data?.paper_types[0]?.id);
  //   // 地区
  //   setArea(
  //     data?.area_ids?.map((item: any) => {
  //       return { value: item?.id, label: item?.short_name };
  //     }),
  //   );
  //   setAreaValue(data?.area_ids[0]?.id);
  //   // 年份
  //   setYears(data?.year_list);
  //   setYearsRow(data?.year_list[0]?.value);
  //   // 题型
  //   let arr = data?.question_types?.map((item: any) => {
  //     return {
  //       ...item,
  //       count: 0,
  //     };
  //   });

  //   console.log("题型", arr);
  //   setQuestionTypesList(arr);
  //   setTiDifficultyValue('2')
  //   setTiDifficultyModerationValue('0')
  //   setCheckItems([]);
  //   setCheckedKeys([]);
  // }

  // 获取目录树数据
  // const getTreeData = async () => {
  //   const { code, data = [] }: any = await dispatch({
  //     type: "setQuestionsModel/postData",
  //     apiUrl: "getCatalogKpointTree",
  //     payload: { course_id: '' },
  //   });
  //   if (code == 200) {
  //     console.log("获取树", data);
  //     setXkwTextbookId(data?.xkw_textbook_id);
  //     setTextbookName(data?.textbook_name)

  //     // if (treeData?.length > 0) {
  //     // }
  //     setTreeData(data?.tree);
  //     setExpandedKeys(getAllKeys(data?.tree, 1));
  //   }
  // };


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
  // 检查节点的所有子节点是否都被选中
  const isAllChildrenChecked = (node: any): boolean => {
    if (node.type !== "catalog" || node.children.length === 0) return false;
    const childIds = getAllChildIds(node);
    return childIds.every((id) => checkedKeys.includes(id));
  };

  // 递归查找节点（根据 ID）
  const findNodeById = (nodes: any[], targetId: number): any | null => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.children && node.children.length > 0) {
        const found = findNodeById(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // 计算右侧需要展示的聚合节点
  const calculateDisplayNodes = async () => {
    if (checkedKeys.length === 0) {
      setCheckItems([]);
      return;
    }

    const result: any[] = [];
    const processedIds = new Set<number>(); // 已处理的节点 ID（避免重复展示）

    // 步骤1：递归遍历所有目录节点，找出全选的目录节点
    const processFullSelectedCatalogs = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.type === "catalog") {
          // 若当前目录的所有子节点都被选中 → 展示该目录，跳过子节点
          if (isAllChildrenChecked(node)) {
            result.push(node);
            // 标记当前目录和所有子节点为“已处理”
            processedIds.add(node.id);
            getAllChildIds(node).forEach((id) => processedIds.add(id));
          } else {
            // 子节点未全选 → 递归处理子节点
            processFullSelectedCatalogs(node.children);
          }
        }
      }
    };
    console.log("treeData", treeData);
    await processFullSelectedCatalogs(treeData);

    // 步骤2：添加未被处理的选中节点（未全选的 kpoint 节点）
    checkedKeys.forEach((id) => {
      if (!processedIds.has(id)) {
        const node = findNodeById(treeData, id);
        if (node) {
          result.push(node);
          processedIds.add(id);
        }
      }
    });
    setCheckItems(result);
  };

  // 删除节点（联动左侧树）
  const onCloseTagFn = (node: any) => {
    if (node.type === "catalog") {
      // 删除目录 → 取消其所有子节点的选中
      const childIds = getAllChildIds(node);
      setCheckedKeys((prev) =>
        prev.filter((id) => !childIds.includes(id) && id !== node.id),
      );
      setCheckItems((prev: any) =>
        prev.filter(
          (item: any) => !childIds.includes(item?.id) && item?.id !== node.id,
        ),
      );
    } else {
      // 删除子节点 → 只取消自身选中
      let _arr = checkItems?.filter((val: any) => val?.id !== node?.id);
      setCheckItems(_arr);
      setCheckedKeys((prev) => prev.filter((id) => id !== node.id));
    }
  };

  //  获取节点的所有子节点ID（递归）
  const getAllChildIds = (node: any): number[] => {
    let ids: number[] = [];
    node.children.forEach((child: any) => {
      ids.push(child.id);
      if (child.children.length > 0) ids = [...ids, ...getAllChildIds(child)];
    });
    return ids;
  };

  const handleTypeScoreChange = (item: any, value: any) => {
    let arr = questionTypesList?.map((val: any) =>
      item?.en_name == val?.en_name
        ? { ...val, count: value || 0 }
        : { ...val },
    );

    setQuestionTypesList(arr);
  };

  const getTotalSum = () => {
    let _flag_num = 0;
    questionTypesList?.map((val: any, key: any) => {
      _flag_num += val?.count;
    });
    return _flag_num;
  };

  const resetQuestionTypeCounts = () => {
    setQuestionTypesList((prev: any[]) =>
      (prev || []).map((val: any) => ({
        ...val,
        count: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        easy_moderate: 0,
        moderate_hard: 0,
        total: 0,
      })),
    );
  };

  const clearBtn = () => {
    resetQuestionTypeCounts();
  };

  // 清空左侧章节勾选与「选择章节知识点」
  const reset = () => {
    setCheckedKeys([]);
    setCheckItems([]);
    setSelectedKeys([]);
  };

  // 一键组作业（班级学情）
  // subjectId：列表 Cascader 课程接口 findXkwCourseListByStageId 的 subjectId
  const oneClickHomeworkFn = async () => {
    const classId = selectedClassId;
    const subjectId = xkwSubjectId;
    if (!classId) {
      message.error("请选择班级");
      return;
    }
    if (!subjectId) {
      message.error("请先在作业记录选择课程教材");
      return;
    }

    setLoadingAction("oneClick");
    try {
      const { code, data }: any = await dispatch({
        type: "settingTopicModel/postData",
        apiUrl: "postFindQuestionListByClassStudy",
        payload: {
          classId: String(classId),
          subjectId: String(subjectId),
          windowDays: 7,
        },
      });
      if (isApiSuccess(code)) {
        message.success("组作业成功");
        history.push(`/paperCompose`);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  // 提交
  const submitFn = async () => {
    if (!cascaderValue?.[0]) {
      message.error("请选择课程教材");
      return;
    }
    if (checkItems?.length == 0) {
      message.error("请选择章节知识点");
      return;
    }

    const totalCount = getTotalSum();
    if (totalCount == 0) {
      message.error("请选择习题设置");
      return;
    }
    if (totalCount > all_question_number) {
      message.error(`题目总数不能大于${all_question_number}`);
      return;
    }

    const { catalogIdList, kpointIdList } =
      buildCatalogAndKpointIdsFromCheckItems(checkItems);

    const typeIdList = questionTypesList
      .filter((item: any) => Number(item?.count) > 0)
      .map((item: any) => String(item?.id));
      // .slice(0, 10);

    const difficultyLevelList =
      tiDifficultyValue !== "1" &&
        tiDifficultyModerationValue &&
        tiDifficultyModerationValue !== "0"
        ? [Number(tiDifficultyModerationValue)]
        : [];

    const payload = {
      courseId: Number(cascaderValue[0]),
      year: Number(yearsRow) || undefined,
      count: Math.min(Math.max(totalCount, 1), 10),
      formulaPicFormat: "svg",
      // kpointIdList: kpointIdList.slice(0, 10),
      kpointIdList,
      typeIdList,
      paperTypeIdList: paperTypesValue ? [Number(paperTypesValue)] : [],
      // catalogIdList: catalogIdList.slice(0, 10),
      catalogIdList,
      // difficultyLevelList: difficultyLevelList.slice(0, 5),
      difficultyLevelList,
      areaIdList: areaValue ? [String(areaValue)] : [],
      kpointMatchType: 0,
      filterExceedsScopeQues: 0,
      versionId: cascaderValue[1] ? Number(cascaderValue[1]) : undefined,
      textbookId: Number(xkwTextbookId || cascaderValue[2]) || undefined,
      subjectId: String(xkwSubjectId),
      newQuesFlag: false,
    };

    setLoadingAction("submit");
    try {
      const { code, data }: any = await dispatch({
        type: "settingTopicModel/postData",
        apiUrl: "postFindPersonalQuestionList",
        payload,
      });
      if (code === 200) {
        console.log("智能出题结果", data);
        message.success("出题成功");
        history.push(`/paperCompose`);
      }
    } finally {
      setLoadingAction(null);
    }
  };



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

  return (
    <div className="setting_topic_chapter_questions_box">
      <Breadcrumb
        items={[
          {
            onClick: () =>
              history.push(`/paperCompose`),
          },
          { title: "智能出题" },
        ]}
      />
      <div className="setting_topic_chapter_questions_banner_wrap">
        <div
          className="setting_topic_chapter_questions_banner"
          style={{ backgroundImage: `url(${bannerBg})` }}
        >
          <div className="setting_topic_chapter_questions_banner_top">
            <div className="setting_topic_chapter_questions_banner_title_area">
              <div className="setting_topic_chapter_questions_banner_icon">
                <img src={bannerIcon} alt="" />
              </div>
              <div className="setting_topic_chapter_questions_banner_texts">
                <div className="setting_topic_chapter_questions_banner_title">
                  逐题布置太麻烦？试试一键组作业
                </div>
                <div className="setting_topic_chapter_questions_banner_desc">
                  基于过往作业数据自动识别薄弱点
                </div>
              </div>
            </div>
            <div className="setting_topic_chapter_questions_banner_actions">
              <Select
                className="setting_topic_chapter_questions_banner_class_select"
                showSearch
                allowClear
                placeholder="请选择班级"
                value={selectedClassId}
                onChange={setSelectedClassId}
                options={classOptions}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
              <Button
                type="primary"
                className="setting_topic_chapter_questions_banner_btn"
                loading={loadingAction === "oneClick"}
                disabled={isActionLoading && loadingAction !== "oneClick"}
                onClick={oneClickHomeworkFn}
              >
                一键组作业
              </Button>
            </div>
          </div>
          <div className="setting_topic_chapter_questions_banner_stats">
            <div className="setting_topic_chapter_questions_banner_stat_card">
              <div className="setting_topic_chapter_questions_banner_stat_label">
                <img src={iconMastery} alt="" />
                <span>平均掌握率</span>
              </div>
              <div className="setting_topic_chapter_questions_banner_stat_value">
                <span className="num">--</span>
                <span className="unit">%</span>
              </div>
            </div>
            <div className="setting_topic_chapter_questions_banner_stat_card">
              <div className="setting_topic_chapter_questions_banner_stat_label">
                <img src={iconWeak} alt="" />
                <span>薄弱知识点</span>
              </div>
              <div className="setting_topic_chapter_questions_banner_stat_value">
                <span className="num">--</span>
                <span className="unit">个</span>
              </div>
            </div>
            <div className="setting_topic_chapter_questions_banner_stat_card">
              <div className="setting_topic_chapter_questions_banner_stat_label">
                <img src={iconPracticed} alt="" />
                <span>已练习题目</span>
              </div>
              <div className="setting_topic_chapter_questions_banner_stat_value">
                <span className="num">--</span>
                <span className="unit">题</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="setting_topic_chapter_questions_title_box">
        <div className="setting_topic_chapter_questions_title_text">
          习题设置
        </div>
        <div className="setting_topic_chapter_questions_title_actions">
          <Button
            type="primary"
            className="setting_topic_chapter_questions_generate_btn"
            loading={loadingAction === "submit"}
            disabled={isActionLoading && loadingAction !== "submit"}
            onClick={submitFn}
          >
            生成作业
          </Button>
        </div>
      </div>
      <div className="setting_topic_chapter_questions_content_box">
        <div className="setting_topic_chapter_questions_content_tree">
          <div className="setting_topic_chapter_questions_content_tree_title">
            <span>
              <img src={jiaoxuebiaoshiImg} alt="" />
            </span>
            <span className="setting_topic_chapter_questions_content_tree_title_text">
              <Tooltip title={textbookName} placement="topLeft">
                {textbookName || "请选择教材"}
              </Tooltip>
            </span>
          </div>
          <div className="setting_topic_chapter_questions_content_tree_box">
            {treeData?.length > 0 && (
              <Tree
                autoExpandParent={true}
                checkable={true}
                blockNode={true}
                defaultExpandAll
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
                onSelect={(selectedKeys: any, info: any) => {
                  // console.log("onSelect", selectedKeys, info);
                  // setSelectedKeys(selectedKeys);
                  // onLeafClick(info.node?.page - 1);
                }}
                checkedKeys={checkedKeys} // 选中节点回调
                checkStrictly={false} // 开启父子联动选择
                onCheck={onTreeCheck}
                titleRender={(nodeData: any) => (
                  <>
                    <Tooltip title={nodeData?.title} placement="topLeft">
                      <div className="tree_node_title">{nodeData?.title}</div>
                    </Tooltip>
                  </>
                )}
              />
            )}
          </div>
        </div>
        {/* 题型设置  */}
        <div className="setting_topic_chapter_questions_content_question_setting">
          <div className="setting_topic_chapter_questions_content_question_setting_title">
            题型设置
          </div>
          <div className="setting_topic_chapter_questions_conten_chapter_box">
            {/* 选中的章节 */}
            <div className="setting_topic_chapter_questions_conten_chapter_title">
              <span className="setting_topic_chapter_questions_conten_chapter_title_css">
                选择章节知识点{" "}
                <span className="setting_topic_chapter_questions_conten_chapter_title_css_text">
                  （从左侧勾选章节）
                </span>
              </span>
              <span
                className="setting_topic_chapter_questions_conten_chapter_del"
                onClick={() => {
                  reset()
                }}
              >
                <span>
                  <ZYIcon type="shanchu" />
                </span>
                清空
              </span>
            </div>
            <div className="setting_topic_chapter_questions_conten_chapter_content">
              {checkItems?.map((item: any, index: number) => {
                return (
                  <Tag
                    className="setting_topic_chapter_questions_conten_chapter_content_tag"
                    closable
                    key={item?.id}
                    // icon={<ZYIcon type="shanchu3" />}
                    onClose={() => {
                      // console.log("删除", item);
                      onCloseTagFn(item);
                    }}
                  >
                    {item?.title}
                  </Tag>
                );
              })}
            </div>
          </div>
          {/* 组卷设置 */}
          <div className="setting_topic_chapter_questions_content_composition_box">
            <div className="setting_topic_chapter_questions_content_composition_title">
              组卷设置
            </div>
            <div className="setting_topic_chapter_questions_content_composition_box_content">
              <p className="setting_topic_chapter_questions_content_composition_practice">
                练习场景
              </p>
              <div className="setting_topic_chapter_questions_content_composition_practice_radio">
                <Radio.Group
                  size={"small"}
                  value={paperTypesValue}
                  onChange={(e) => {
                    setPaperTypesValue(e.target.value);
                  }}
                >
                  {paperTypesList.map((val: any) => (
                    <Radio key={val?.id} value={val?.id} style={{ marginBottom: 8 }}>
                      {val?.name}
                    </Radio>
                  ))}
                </Radio.Group>
              </div>
              <div>
                <Row>
                  {/* 题目难度 */}
                  <Col span={12} style={{ marginRight: "0px" }}>
                    <div className="difficulty_title">
                      题目难度
                      {/* <Popover
                        placement="bottomLeft"
                        content={DIFFICULTY_TIP}
                        title="整卷综合难度比例"
                        arrow={false}
                        autoAdjustOverflow={false}
                        getPopupContainer={(node) => node.parentNode as HTMLElement}
                      >
                        <QuestionCircleOutlined
                          style={{ marginLeft: "8px", color: "#94A0B8" }}
                        />
                      </Popover> */}
                    </div>
                    <div>
                      <Select
                        style={{ width: "98%", marginTop: "8px" }}
                        value={tiDifficultyValue}
                        placeholder="请选择"
                        options={tiDifficultySet}
                        onChange={(value) => {
                          setTiDifficultyValue(value);
                        }}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="difficulty_title"></p>
                    <div>
                      <Select
                        style={{ width: "98%", marginTop: "8px" }}
                        placeholder="请选择"
                        disabled={tiDifficultyValue == "1"}
                        options={tiDifficultyModeration}
                        value={tiDifficultyModerationValue}
                        onChange={(val) => {
                          setTiDifficultyModerationValue(val);
                        }}
                      />
                    </div>
                  </Col>
                </Row>
                <Row style={{ marginTop: "24px" }}>
                  {/* 优先地区 */}
                  {jsonData?.stage !== '小学' && <Col span={12} style={{ marginRight: "0px" }}>
                    <p className="difficulty_title">优先地区</p>
                    <div>
                      <Select
                        style={{ width: "98%", marginTop: "8px" }}
                        placeholder="请选择"
                        options={area}
                        value={areaValue}
                        onChange={(val) => {
                          setAreaValue(val);
                        }}
                      />
                    </div>
                  </Col>}
                  {/* 优先年份 */}
                  <Col span={12}>
                    <p className="difficulty_title">优先年份</p>
                    <div>
                      <Radio.Group
                        size={"small"}
                        value={yearsRow}
                        className={"difficulty_title_radio_year"}
                        style={{ width: "98%", marginTop: "8px" }}
                        onChange={(e) => {
                          // console.log("e.target.value", e.target.value);
                          setYearsRow(e.target.value);
                        }}
                      >
                        {years.map((val: any, key: any) => (
                          <Radio.Button
                            key={val?.value}
                            value={val?.value}
                            className={
                              yearsRow == val?.value
                                ? "difficulty_title_radio_year_active"
                                : ""
                            }
                          >
                            {val?.type == "all"
                              ? "全部"
                              : val?.type == "near_5_years"
                                ? "近5年"
                                : "近3年"}
                          </Radio.Button>
                        ))}
                      </Radio.Group>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
          {/* 习题设置 */}
          <div>
            <div className="setting_topic_chapter_questions_content_composition_box_title">
              习题设置
            </div>
            {tiDifficultyValue == "1" && (
              <div>
                <PullupDrawer
                  questionTypesListData={questionTypesList}
                  changeQuestionListFn={(list: any) => {
                    setQuestionTypesList(list);
                  }}
                />
              </div>
            )}
            {tiDifficultyValue != "1" && (
              <div>
                <div className="question_set_new_box_top">
                  <div className="question_set_new_box_top_left">
                    题型
                    <span className="question_set_new_box_top_left_right">
                      共{getTotalSum()}题
                    </span>
                  </div>
                  <span
                    className={
                      getTotalSum() == 0
                        ? "question_set_new_box_top_right_less"
                        : "question_set_new_box_top_right"
                    }
                    onClick={() => {
                      clearBtn();
                    }}
                  >
                    清空
                  </span>
                </div>
                <div className={"ti_box_type_css"}>
                  {questionTypesList?.length > 0 &&
                    questionTypesList?.map((item: any, index: any) => {
                      return (
                        <InputNumber
                          key={item?.id || index}
                          className="question_set_new_box_bottom_css_input_num"
                          prefix={item?.name}
                          precision={0}
                          min={0}
                          max={
                            questionTypesListData?.includes(item?.en_name)
                              ? 10
                              : 20
                          }
                          // controls={false}
                          placeholder="0"
                          step={1}
                          value={item?.count === 0 ? undefined : item?.count}
                          onChange={(value) => {
                            handleTypeScoreChange(item, value as number);
                          }}
                        />
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect((state: any) => ({
  aiClassroomModel: state.aiClassroomModel,
  commonModel: state.commonModel,
  authModel: state.authModel,
}))(App);
