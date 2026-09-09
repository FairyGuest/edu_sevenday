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
import { connect, useDispatch, useLocation } from "umi";
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
} from "@/global";

import "./index.less";
import { deepCopy } from "@/utils";

const App = (props: any) => {
  const { openDrawer, cancel, items, course_id = undefined } = props;

  const dispatch = useDispatch();
  const { search } = useLocation();
  // const searchParams = new URLSearchParams(search);
  // const timerIdRef = useRef<any>(null);
  // const courseId = searchParams.get("courseId");

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectOptions, setSelectOptions] = useState(selectOptionsData);

  const [area, setArea] = useState([]); // 地区
  const [years, setYears] = useState([]); // 年份
  const [questionTypesList, setQuestionTypesList] = useState<any>([]); // 题型
  const [paperTypesList, setPaperTypesList] = useState([]); // 场景

  const [paperTypesValue, setPaperTypesValue] = useState(""); //选择的场景
  const [yearsRow, setYearsRow] = useState(""); // 选择的年份
  const [areaValue, setAreaValue] = useState(""); // 选择的地区

  const [diffTypesList, setDiffTypesList] = useState([]); // 难度数据
  const [diffTypesValue, setDiffTypesValue] = useState(""); // 选择的难度
  const [questionTypesValue, setQuestionTypesValue] = useState(""); // 选择的题型

  // const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionList, setQuestionList] = useState<any>([]);
  // const [textbook_id, setTextbook_id] = useState<any>([]);
  // const [question_rules, setQuestion_rules] = useState<any>([]);

  const [treeData, setTreeData] = useState([]); // 章节目录树数据
  const [knowledgePoints, setKnowledgePoints] = useState([]); // 知识点数据
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]); // 选中节点
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  const [active, setActive] = useState("1");

  useEffect(() => {
    setOpen(openDrawer);
    init();
    // if (openDrawer) {
    //   getTeachPlanBankKpointTreeFn();
    // }
    getTeachPlanBankKpointTreeFn();
  }, [openDrawer]);

  const init = () => {
    setExpandedKeys([]);
    setCheckedKeys([]);
    setSelectedKeys([]);
    setActive("1");
  };

  // 获取树 年份  题型 地区
  const getTeachPlanBankKpointTreeFn = async () => {
    let { code, data = {} }: any = await dispatch({
      type: "setQuestionsModel/getData",
      apiUrl: "getTeachPlanBankKpointTree",
      payload: {
        doc_id: "5ca0d122-7ffa-11f0-8245-7c214a6d4174",
      },
    });
    if (code === 200) {
      // console.log("树数据", data);
      // 章节
      setKnowledgePoints(data?.kp_tree);
      // 知识点
      setTreeData(data?.catalog);
      await getTeachPlanBankTypesFn();
    }
  };

  const getTeachPlanBankTypesFn = async () => {
    let { code, data = {} }: any = await dispatch({
      type: "setQuestionsModel/getData",
      apiUrl: "getTeachPlanBankTypes",
      payload: {
        doc_id: "5ca0d122-7ffa-11f0-8245-7c214a6d4174",
      },
    });
    if (code === 200) {
      // console.log("搜索项", data);
      // 地区
      setArea(
        data?.area_ids?.map((item: any) => ({
          ...item,
          value: item?.id,
          label: item?.short_name,
        })),
      );
      setAreaValue(data?.area_ids[0]?.id);

      // 题型
      setQuestionTypesList(
        data?.question_types?.map((item: any) => ({
          ...item,
          label: item?.name,
          value: item?.en_name,
        })),
      );
      setQuestionTypesValue(data?.question_types[0]?.en_name);

      // 难易程度
      setDiffTypesList(
        data?.question_diff?.map((item: any) => ({
          ...item,
          value: item?.id,
          label: item?.name,
        })),
      );
      setDiffTypesValue(data?.question_diff[0]?.id);

      // 场景
      setPaperTypesList(
        data?.paper_types?.map((item: any) => ({
          ...item,
          value: item?.id,
          label: item?.name,
        })),
      );
      setPaperTypesValue(data?.paper_types[0]?.id);

      // 年份
      setYears(
        data?.year_list?.map((item: any) => ({
          ...item,
          value: item?.value,
          label:
            item?.type == "all"
              ? "全部"
              : item?.type == "near_5_years"
                ? "近5年"
                : "近3年",
        })),
      );
      setYearsRow(data?.year_list[0]?.value);
    }
    await changeBatchFn();
  };

  // 换一批
  const changeBatchFn = async () => {
    console.log("changeBatchFn", questionTypesValue);

    setLoading(true);

    let payload = {
      // class SearchQuestionReq(BaseModel):
      // course_id: int = Field(None, description="课程ID")
      // year: int = Field(None, description="年份（查询此年份及以后的试题）")
      // kpoint_ids: List[int] = Field(None, description="试题知识点ID集合，最多传10个，超过的部分会被截取掉；如果传知识点父节点，也会搜索出其子节点中的试题")
      // type_ids: List[str] = Field(None, description="试题类型ID集合，最多传10个，超过的部分会被截取掉；如果传试题类型父节点，也会搜索出其子节点中的试题")
      // count: int = Field(default=1, description="返回数据条数（最小1，最大10）")
      // paper_type_ids: List[int] = Field(None, description="试卷类型ID集合，最多传10个（试卷类型包含期中、期末、一模、二模、三模、真题等20多种类型，详见基础数据API—获取试卷类型列表接口），超过的部分会被截取掉")
      // session_id: str = Field(None, description="用户会话标识，用于同一个会话连续推题的去重；SessionId由接口生成，在返回结果中可获取该值；过期时间为24小时")
      // version_id: int = Field(None, description="教材版本ID：非必填，此参数用于过滤超纲试题；高中课程，教材ID必填，按照具体教材过滤超纲试题；小初课程，入参教材版本ID或教材ID，按教材版本过滤超纲试题，否则按主流教材版本过滤。")
      // filter_exceeds_scope_ques: int = Field(None, description="是否过滤超纲试题：0 不过滤、1 过滤，默认为不过滤；语文、英语学科课程此策略不生效")
      // kpoint_match_type: int = Field(None, description="知识点匹配类型（0 至少包含一个知识点 1 包含全部的知识点），默认为0")
      // catalog_ids: List[int] = Field(None, description="章节ID集合，最多传10个，超过的部分会被截取掉；如果传章节父节点，也会搜索出子节点中的试题")
      // difficulty_levels: List[int] = Field(None, description="试题难度等级ID集合（17 容易 18 较易 19 一般 20 较难 21 困难），最多传5个")
      // area_ids: List[str] = Field(None, description="行政区ID列表，最多传10个，超过的部分会被截取掉")
      // formula_pic_format: str = Field(default="png", description="公式图片格式，支持两种：png或svg，默认是svg")
      // textbook_id: int =  Field(None, description="教材ID：非必填，此参数用于过滤超纲试题；高中课程，教材ID必填，按照具体教材过滤超纲试题；小初课程，入参教材版本ID或教材ID，按教材版本过滤超纲试题，否则按主流教材版本过滤。")
      // en_word_ids: List[int] = Field(None, description="单词ID集合，最多传10个，超过的部分会被截取掉")

      course_id: course_id,
      year: yearsRow,
      kpoint_ids:
        active == "2"
          ? checkedKeys?.length > 0
            ? checkedKeys
            : undefined
          : undefined,
      type_ids: questionTypesList?.find((item: any) => {
        return item.en_name === questionTypesValue;
      })?.ids,
      count: 10,
      paper_type_ids: [paperTypesValue],
      catalog_ids:
        active == "1"
          ? checkedKeys?.length > 0
            ? checkedKeys
            : undefined
          : undefined,
      difficulty_levels: diffTypesValue ? [Number(diffTypesValue)] : undefined,
      area_ids: [areaValue],
    };

    console.log("payload", payload);

    let { code, data = {} }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "postTeachPlanSearchQuestions",
      payload,
    });
    if (code === 200) {
      console.log("题目列表", data);
      let questions_list = dealwithQuestionList(data?.questions, "", []);

      setQuestionList(questions_list);
    } else {
      // message.error("题目获取失败");
    }
    setLoading(false);
  };

  // 获取题目列表
  // const getQuestionList = async (id: any) => {
  //   let { code, data = {} }: any = await dispatch({
  //     type: "setQuestionsModel/postData",
  //     apiUrl: "getExamsQuestionsList",
  //     payload: {
  //       id,
  //     },
  //   });
  //   if (code === 200) {
  //     let questions_list = [];
  //     // if (data?.status == "cancelled") {
  //     //   return;
  //     // }
  //     if (data?.status !== "succeeded") {
  //       timerIdRef.current = setTimeout(() => {
  //         getQuestionList(id);
  //       }, 2000);
  //     }
  //     if (data?.status == "succeeded") {
  //       setLoading(false);
  //       if (data?.questions?.length > 0) {
  // questions_list = dealwithQuestionList(
  //   data?.questions,
  //   data?.info,
  //   data?.question_rules,
  // );
  //         setQuestionList(questions_list);
  //         // setQuestionList([]);
  //       }
  //       if (data?.questions?.length == 0) {
  //         setQuestionList([]);
  //       }
  //     }
  //   } else {
  //     setLoading(false);
  //     message.error("获取题目列表失败");
  //   }
  // };

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

  // 新增题
  const addQuestionFn = (val: any) => {
    console.log("val", val);
    // if (items?.length > 30) {
    //   message.error("题目总数不能大于30");
    //   return;
    // }
    // let _flagIndex = items?.findIndex((item: any) => {
    //   return item?.question_type == val?.question_type;
    // });
    // if (_flagIndex != -1) {
    //   items.splice(_flagIndex, 0, { ...val });
    //   props?.questionsUpdateChange?.(deepCopy(items));
    // }
    // if (_flagIndex == -1) {
    //   let _all_question_list = [...items, { ...val }];
    //   let _flag_question_rules = _all_question_list?.[0]?.question_rules;
    //   let _arr: any = [];
    //   _flag_question_rules?.map((item: any, index: any) => {
    //     let _flag_question_list = _all_question_list?.filter(
    //       (v: any, k: any) => {
    //         return v?.question_type == item?.type;
    //       },
    //     );
    //     _arr = [..._arr, ..._flag_question_list];
    //   });
    //   props?.questionsUpdateChange?.(deepCopy(_arr));
    // }
  };

  // 取消加入题
  const cancelQuestionFn = (val: any) => {
    let _arr = items?.filter((item: any) => {
      return item?.id !== val?.id;
    });
    props?.questionsUpdateChange?.(deepCopy(_arr));
  };

  const changeTitleBatFn = async (type: any) => {
    setActive(type);
    init();
  };

  const onTreeCheck = (checkedKeys: any, info: any) => {
    const checkedIdNumbers = (checkedKeys as string[]).map((key) => key);
    console.log("checkedKeys", checkedIdNumbers);
    setCheckedKeys(checkedIdNumbers);
    // setCheckItems(info.checkedNodes);
  };

  // 底部按钮
  const footerBtn = [
    <Button
      key="back"
      onClick={() => cancel?.()}
      style={{ margin: "0 12px 0 8px" }}
    >
      关闭
    </Button>,
    <Button
      key="submit"
      type="primary"
      loading={loading}
      onClick={changeBatchFn}
    >
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
          title={"插入习题"}
          placement="right"
          open={open}
          // loading={loading}
          width={1150}
          onClose={() => {
            cancel?.();
          }}
          footer={footerBtn}
          className="knowledge-modal-box-css"
        >
          <div className="knowledge-modal-box">
            <div className="knowledge-modal-tree">
              <div className="knowledge-modal-tree-title">
                <span
                  className={`knowledge-modal-tree-title-zj ${active == "1" ? "knowledge-modal-tree-title-active" : ""}`}
                  onClick={() => {
                    changeTitleBatFn("1");
                  }}
                >
                  章节
                </span>
                <span className="knowledge-modal-tree-title-line"></span>
                <span
                  className={`knowledge-modal-tree-title-zsd ${active == "2" ? "knowledge-modal-tree-title-active" : ""}`}
                  onClick={() => {
                    changeTitleBatFn("2");
                  }}
                >
                  知识点
                </span>
              </div>
              <div className="knowledge-modal-tree-box">
                {active == "1" && treeData?.length > 0 && (
                  <div>
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
                      onSelect={(selectedKeys: any, info: any) => {}}
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
                {active == "2" && knowledgePoints?.length > 0 && (
                  <div>
                    <Tree
                      autoExpandParent={true}
                      checkable={true}
                      blockNode={true}
                      // defaultExpandAll
                      expandedKeys={expandedKeys}
                      onExpand={(keys: any) => setExpandedKeys(keys)}
                      fieldNames={{ key: "id" }}
                      treeData={knowledgePoints}
                      selectedKeys={selectedKeys} // 选中节点回调
                      switcherIcon={
                        <span>
                          <ZYIcon type="xia" style={{ fontSize: 12 }} />
                        </span>
                      }
                      onSelect={(selectedKeys: any, info: any) => {}}
                      checkedKeys={checkedKeys} // 选中节点回调
                      checkStrictly={false} // 开启父子联动选择
                      onCheck={onTreeCheck}
                      titleRender={(nodeData: any) => (
                        <>
                          <Tooltip title={nodeData?.name} placement="topLeft">
                            <div className="tree-node-title ">
                              {nodeData?.name}
                            </div>
                          </Tooltip>
                        </>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="knowledge-modal-box-line"></div>
            <div className="modal-content">
              <Space className="modal-content-filter">
                {questionTypesList?.length > 0 && (
                  <Select
                    value={questionTypesValue}
                    options={questionTypesList}
                    onChange={(value) => setQuestionTypesValue(value)}
                  />
                )}
                {diffTypesList?.length > 0 && (
                  <Select
                    value={diffTypesValue}
                    options={diffTypesList}
                    onChange={(value) => setDiffTypesValue(value)}
                  />
                )}
                {area?.length > 0 && (
                  <Select
                    value={areaValue}
                    options={area}
                    onChange={(value) => setAreaValue(value)}
                  />
                )}
                {years?.length > 0 && (
                  <Select
                    value={yearsRow}
                    options={years}
                    onChange={(value) => setYearsRow(value)}
                  />
                )}
                {paperTypesList?.length > 0 && (
                  <Select
                    value={paperTypesValue}
                    options={paperTypesList}
                    onChange={(value) => setPaperTypesValue(value)}
                  />
                )}

                <Button
                  type="primary"
                  onClick={changeBatchFn}
                  loading={loading}
                >
                  查询
                </Button>
              </Space>
              {/* {uploadType == "change" && (
                <p className="modal-content-title">
                  准备替换——第{currentQuestion?.rowKey + 1}题
                </p>
              )} */}
              {!loading && questionList?.length > 0 && (
                <div className="modal-content-list">
                  {questionList?.map((item: any, index: number) => (
                    <div
                      className="question-item-box"
                      key={index + item?.id}
                      onClick={(e) => showDetailsFn(e, item)}
                    >
                      <div className="question_drag_box_title_box">
                        {item?.source_summary && (
                          <div className="question_drag_box_title_box_left">
                            {item?.source_summary}
                          </div>
                        )}
                        <div></div>
                        <div></div>
                      </div>
                      <QuestionType
                        key={item.id}
                        row={item}
                        items={[]}
                        rowKey={index}
                        uploadType={"add"}
                        addQuestionFn={addQuestionFn}
                        cancelQuestionFn={cancelQuestionFn}
                        showAnswer={item?.showDetails}
                        showSource={true}
                      />
                    </div>
                  ))}
                </div>
              )}
              {/* 空状态 */}
              {!loading && questionList?.length == 0 && (
                <div className="modal-empty">
                  <ZYIcon type="kongshuju7" />
                  <p className="text">暂无题目</p>
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
