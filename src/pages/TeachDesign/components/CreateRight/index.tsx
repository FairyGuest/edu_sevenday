import { useState, useEffect, useRef, useImperativeHandle } from "react";
import { connect, useDispatch, useRequest, history } from "umi";
import { MoreOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  Divider,
  Button,
  Dropdown,
  Empty,
  Form,
  Modal,
  Input,
  Select,
  Spin,
  Tag,
  TreeSelect,
  message,
  Tooltip,
} from "antd";
import type { MenuProps } from "antd";
import MarkdownRender from "@/components/MarkdownRender";
import MarkdownRenderToc from "@/components/MarkdownRender/showToc";
import { ZYIcon } from "@/components";
import {
  str2json,
  scrollTop,
  stopSSE,
  getOrgId,
  addNewTracking,
} from "@/utils";
import { useExercisePrint } from "./PrintPdf"; // 打印
// import Evaluate from "../Evaluate"; // 评价
import useQuestionActions from "@/pages/TeachDesign/hooks/EditTeach";

import "./index.less";

const CreateRight = (props: any) => {
  const {
    onRef,
    detailData,
    refreshContent,
    hiddenRight,
    setHiddenRight,
    teachDesginModel,
    createPlan,
    showMore = false,
    againEvaluation = false,
    planDetail,
    setStep,
    evaluateLoading,
    setEvaluateLoading,
    postTeachPlanEvaluateFn,
    onPreviewRightClick,
    onPreviewLeftClick,
  } = props;
  const { planParams, planSseLoading } = teachDesginModel;

  const dispatch = useDispatch();
  const { confirm } = Modal;
  const [form] = Form.useForm();

  const thinkRef = useRef<any>(null); // 右侧组件

  const [messageApi, contextHolder] = message.useMessage();
  const contentRef = useRef<HTMLDivElement>(null); // 创建内容
  const teachPlanRef = useRef<HTMLDivElement>(null); // 教案内容
  const [courseList, setCourseList] = useState<any>([]); // 课程列表
  const [catalogList, setCatalogList] = useState<any>([]); // 目录列表
  const [thinkLoading, setThinkLoading] = useState<boolean>(false); // 思考加载
  const [thinkCreating, setThinkCreating] = useState<boolean>(false); // 思考创建
  const [thinkExpand, setThinkExpand] = useState<boolean>(false); // 思考展开
  const [thinkContent, setThinkContent] = useState<string>(""); // 思考内容
  const [teachPlanContent, setTeachPlanContent] = useState<string>(""); // 教案内容
  const [teachPlanHtml, setTeachPlanHtml] = useState<string>(""); // 教案内容HTML
  const [sseStatus, setSseStatus] = useState<string>(""); // SSE状态
  const [visible, setVisible] = useState<boolean>(false); // 保存弹窗
  const [isEmpty, setIsEmpty] = useState<boolean>(true); // 是否为空
  const [sseNum, setSseNum] = useState<number>(0); // SSE内容标识（0：初始，1：思考，2：评估）
  const [isOpenEvaluate, setIsOpenEvaluate] = useState({
    open: false,
    sse: false,
  }); // 评价显示、请求
  const [dropdownOpen, setDropdownOpen] = useState(false); // 菜单按钮是否打开

  const { toggleQuestionFavorite } = useQuestionActions();

  // useEffect(() => {
  //   if (planParams?.doc_id) {
  //     getCourseList();
  //   }
  // }, [planParams.doc_id]);

  // 详情时，设置教案内容
  useEffect(() => {
    if (detailData?.id) {
      setIsEmpty(false);
      setThinkContent(detailData?.thinking_content || "");
      setTeachPlanContent(detailData?.plan_content || "");
      // setTeachPlanHtml(detailData?.html_content || "");
    }
  }, [detailData?.id]);

  useImperativeHandle(onRef, () => ({
    handleData: (params: any) => updChatSSE(params), // 获取数据
    handleReset: () => handleReset(), // 重新生成
  }));
  // 重新生成时，清空教案内容
  const handleReset = () => {
    setThinkContent(""); // 清空思考内容
    setTeachPlanContent(""); // 清空教案内容
    // setTeachPlanHtml(""); // 清空教案内容HTML
  };
  // 更新思考内容
  const updChatSSE = async (params: any) => {
    const content = str2json(params.data);
    const { __action, data, thinking, id } = content;
    scrollTopChat(contentRef); // 滚动
    if (__action == "start") {
      // addNewTracking({
      //   ct: "lesson_plan_ai_generate_start",
      //   extra: { lesson_id: id },
      // });
      setSseNum(0); // 重置SSE标识
      setIsEmpty(false);
      setSseStatus("start");
      dispatch({
        type: "teachDesginModel/setData",
        payload: { planSseLoading: true },
      });
      setThinkLoading(true);
      return;
    }

    if (__action == "end") {
      // addNewTracking({
      //   ct: "lesson_plan_ai_generate_complete",
      //   extra: { lesson_id: id },
      // });
      dispatch({
        type: "teachDesginModel/setData",
        payload: {
          planSseLoading: false,
          planParams: { ...planParams, id },
        },
      });
      // setShowToc(true)  // 是否展示目录
      planReplaceContent(); // 教案内容替换
      refreshContent(); // 刷新内容
      setSseStatus("end");
    }

    if (__action == "error") {
      messageApi.error(data);
      dispatch({
        type: "teachDesginModel/setData",
        payload: { planSseLoading: false },
      });
      setIsEmpty(false);
      setSseStatus("error");
    }

    if (__action == "stream") {
      if (thinking) {
        // SSE第一段返回内容---思考
        if (sseNum === 0) {
          setThinkCreating(true);
          setThinkExpand(true);
          setThinkLoading(false);
          dispatch({
            type: "teachDesginModel/setData",
            payload: {
              planParams: { ...planParams, id }, // 设置教案ID
            },
          });
          setSseStatus("stream_thinking");
          setSseNum(1); // 修改SSE标识
        }
        scrollTopChat(thinkRef); // 滚动
        setThinkContent((prev) => prev + data); // 拼接字符串
      } else {
        if (sseNum === 1) {
          // SSE第二段返回内容---教案
          setThinkCreating(false);
          setThinkExpand(false);
          setSseStatus("stream_content");
          setSseNum(2); // 修改SSE标识
        }
        setTeachPlanContent((prev) => prev + data); // 拼接字符串
      }
    }
  };
  // 滚动到底部
  const scrollTopChat = (_ref: any) => {
    setTimeout(() => {
      scrollTop(_ref);
    }, 100);
  };
  // 教案内容替换
  const planReplaceContent = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getPlanReplaceUrl",
      payload: { plan_id: planParams?.id },
    });
    if (code === 200) {
      setTeachPlanContent(data?.plan_content); // 设置教案内容
      // setTeachPlanHtml(data?.html_content); // 设置教案内容HTML
      messageApi.success("教案已生成");
    }
  };
  // 获取课程列表
  const getCourseList = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getCoursePlanInfo",
      payload: {
        doc_id: planParams?.doc_id,
        org_id: getOrgId(),
      },
    });
    if (code === 200) {
      setCourseList(data);
    }
  };
  // 保存按钮点击事件
  const onPublishClick = async () => {
    if (courseList.length === 0) {
      messageApi.warning("请先创建课程");
      return;
    } else {
      setVisible(true);
      form.setFieldsValue({
        name: `${planParams.type === 2 ? "单元" : "课时"}教学设计：${planParams.chapter_name}`,
      });
    }
  };
  // 确定保存
  const { run, loading } = useRequest(
    async (values: any) => {
      const { code }: any = await dispatch({
        type: "teachDesginModel/postData",
        apiUrl: "postPublishToLib",
        payload: {
          ...values,
          plan_id: planParams?.id,
          publish_type: "teach_plan",
        },
      });
      if (code === 200) {
        setVisible(false);
        messageApi.success("保存成功");
        // addNewTracking({
        //   bt: 'pv',
        //   ct: 'lesson_plan_save_modal_click_confirm',
        //   lesson_id: detailData?.id || planParams.id,
        // })
      }
    },
    { manual: true }, // 手动触发
  );
  // PDF下载
  const onDownloadPDF = useExercisePrint({
    contentRef: teachPlanRef, // 内容
    documentTitle: "教案",
    // customPageStyle: typeStyle, // 自定义样式
  });
  // 下载按钮点击事件
  const onDownloadClick = async (e: any) => {
    let type = e.key === "pdf" ? "pdf" : "word";
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postDownloadPaln",
      payload: {
        plan_id: detailData?.id || planParams.id,
        download_type: "teach_plan",
        download_suffix: e.key,
      },
    });
    if (code === 200) {
      window.open(data?.file_url);
      // addNewTracking({
      //   bt: "cl",
      //   ct: "lesson_plan_click_download",
      //   extra: {
      //     lesson_id: detailData?.id || planParams.id,
      //     download_format: type,
      //   },
      // });
    }
  };
  // 发起评估点击事件
  const onEvaluateClick = (type: string) => {
    const trackParams = {
      bt: "cl",
      ct: "lesson_plan_click_trigger_evaluate",
      extra: {
        lesson_id: detailData?.id,
        school_id: getOrgId("id"),
        school_name: getOrgId("title"),
        subject_name: planParams?.stage + planParams?.subject,
        evaluate_type: "first",
      },
    };
    confirm({
      // title: "是否要重新发起评估？",
      content: "人机交互设计教案是否完成，进入教案评估环节?",
      icon: (
        <span className="anticon anticon-exclamation-circle">
          {/* <ZYIcon type="tishi" /> */}
        </span>
      ),
      okText: "是，开始评估", // 确认按钮文字
      cancelText: "否",
      // onOk: () => setIsOpenEvaluate({ open: true, sse: true }),
      onOk: () => {
        setEvaluateLoading(evaluateLoading + 1);
        // setIsOpenEvaluate({ open: false, sse: true })
        postTeachPlanEvaluateFn();
        if (type === "refresh") {
          trackParams.extra.evaluate_type = "re_evaluate";
        }
        // addNewTracking(trackParams);
      },
    });
  };

  const createPlanFn = () => {
    console.log("生成学案");
    if (planDetail?.has_study_plan) {
      setStep(2);
    } else {
      confirm({
        title: "「课时教案」已人机交互完成优化，是否生成「学案」?",
        content: (
          <span className="create-content-plan">
            学案生成后，课时教案将无法再进行人机交互修改，请谨慎确认！
          </span>
        ),
        icon: (
          <span className="anticon anticon-exclamation-circle">
            <ZYIcon type="tishi" />
          </span>
        ),
        okText: "确认生成", // 确认按钮文字
        cancelText: "暂不生成",
        onOk: () => {
          createPlan?.();
          // addNewTracking({
          //   bt: "cl",
          //   ct: "study_plan_lesson_detail_click_generate",
          //   extra: { lesson_id: planParams.id },
          // });
        },
      });
    }
  };

  // 编辑按钮点击事件
  const onEditClick = () => {
    confirm({
      // title: "是否要重新发起评估？",
      content: "是否已完成“人机协作”设计阶段，当前进入人工教师编辑阶段?",
      icon: (
        <span className="anticon anticon-exclamation-circle">
          <ZYIcon type="tishi" />
        </span>
      ),
      okText: "是，进入人工编辑", // 确认按钮文字
      cancelText: "否",
      onOk: () => {
        toggleQuestionFavorite(detailData?.id || planParams.id, "teach_plan");
        // addNewTracking({
        //   bt: 'pv',
        //   ct: 'lesson_plan_edit_view',
        //   lesson_id: detailData?.id || planParams.id,
        // })
      },
    });
  };

  // 停止生成
  const onStopClick = () => {
    stopSSE();
    dispatch({
      type: "teachDesginModel/setData",
      payload: { planSseLoading: false },
    });
  };
  // 课程选择事件
  const onCourseChange = (value: any) => {
    const item = courseList.find((item: any) => item.id === value);
    setCatalogList(item?.catalogs || []);
    form.setFieldsValue({
      catalog_id: undefined,
    });
  };
  // 处理评估分数
  const handleEvaluateScore = (score: string) => {
    let scoreColor = "";
    let textColor = "";
    if (score == "A+" || score == "A" || score == "A-") {
      scoreColor = "#E1FAEB";
      textColor = "#1A805E";
    } else if (score == "B+" || score == "B" || score == "B-") {
      scoreColor = "#EAF1FC";
      textColor = "#2B75D9";
    } else if (score == "C+" || score == "C" || score == "C-") {
      scoreColor = "#FFF3E3";
      textColor = "#FFAD37";
    } else {
      scoreColor = "#FEF3F2";
      textColor = "#EF4444";
    }
    // if (score >= 90) {
    //   scoreColor = "blue";
    // } else if (score >= 75) {
    //   scoreColor = "green";
    // } else if (score >= 60) {
    //   scoreColor = "orange";
    // } else {
    //   scoreColor = "error";
    // }

    return (
      <Tag color={scoreColor} bordered={false}>
        <span style={{ color: textColor }}>{score}</span>
      </Tag>
    );
  };

  let items: any = [
    // {
    //   key: "1",
    //   label: (
    //     <Button
    //       type="link"
    //       className="more-btn-css"
    //       onClick={onPublishClick}
    //       disabled={planSseLoading}
    //       icon={<ZYIcon type="baocun" />}
    //     >
    //       保存
    //     </Button>
    //   ),
    // },
    {
      key: "2",
      expandIcon: null,
      label: (
        <Button
          type="link"
          className="more-btn-css"
          disabled={planSseLoading}
          icon={<ZYIcon type="download" />}
        >
          下载
          {/* <ZYIcon
              type="xia"
              size={12}
              style={{
                transform: `rotate(${dropdownOpen ? 180 : 0}deg)`,
                transition: "transform 0.3s ease-in-out",
              }}
            /> */}
        </Button>
      ),
      children: [
        // { key: "pdf", label: "下载为PDF", disabled: planSseLoading },
        { key: "docx", label: "下载为Word", disabled: planSseLoading },
      ],
    },
    {
      key: "3",
      label: (
        <Button
          type="link"
          className="more-btn-css"
          // disabled={planSseLoading}
          icon={<ZYIcon type={hiddenRight ? "icon_fold" : "icon_unfold"} />}
          // onClick={() => setHiddenRight(!hiddenRight)}
          onClick={() => {
            onPreviewRightClick?.();
            // addNewTracking({
            //   bt: "cl",
            //   ct: "lesson_plan_click_overview",
            //   extra: { lesson_id: detailData?.id || planParams.id },
            // });
          }}
        >
          {hiddenRight ? "收起" : "全览"}
        </Button>
      ),
    },

    {
      key: "4",
      label: (
        <Button
          type="link"
          className="more-btn-css"
          // disabled={planSseLoading}
          icon={<ZYIcon type={"shanchu3"} style={{ fontSize: "16px" }} />}
          // onClick={() => setHiddenRight(!hiddenRight)}
          onClick={() => {
            onPreviewLeftClick?.();
          }}
        >
          关闭
        </Button>
      ),
    },
  ];

  // evaluateLoading
  const evaluateLoadingComponent = () => {
    return (
      <div
        style={{
          minWidth: "200px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {/* <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /> */}
        <Spin
          indicator={
            <ZYIcon
              type="dengdai"
              style={{
                fontSize: 14,
                animation: "spin 1s linear infinite", // 关键：旋转动画
                color: "#333C55",
              }}
            />
          }
        />
        <span className="create-evaluate-loading">评估中...预计2分钟完成</span>
      </div>
    );
  };

  // // 重新生成
  // const refreshEvaluate = () => {
  //   setEvaluateLoading(evaluateLoading + 1)
  //   setIsOpenEvaluate({ open: false, sse: true })
  // }

  // 菜单点击事件
  const handleMenuClick: MenuProps["onClick"] = (e) => {
    console.log("点击了菜单：", e.key);
    // 可以在这里根据 key 处理不同逻辑
    switch (e.key) {
      case "pdf":
        // console.log('执行下载 PDF 逻辑');
        onDownloadClick?.(e);
        break;
      case "docx":
        // console.log('执行下载 Word 逻辑');
        onDownloadClick?.(e);
        break;
      // ...其他逻辑
    }
  };

  return (
    <div className="create-right">
      {!isEmpty && (
        <div className="create-container">
          <div className="create-header">
            {planParams?.type === 1 && (
              <div className="create-header-right">
                <Button
                  color="primary"
                  variant="outlined"
                  className="check-plan-css"
                  onClick={() => createPlanFn()}
                  disabled={planSseLoading}
                  icon={<ZYIcon type="xuean" />}
                >
                  {planDetail?.has_study_plan ? "查看学案" : "生成学案"}
                </Button>
                {detailData?.evaluate_score && (
                  <Button
                    color="primary"
                    type="text"
                    disabled={planSseLoading}
                    className="evaluate-btn-css"
                    onClick={() => {
                      const id = detailData?.id || planParams.id;
                      if (!id) return;
                      window.open(`/evaluateReport?id=${id}`);
                      //setIsOpenEvaluate({ open: true, sse: false })
                      // addNewTracking({
                      //   bt: "pv",
                      //   ct: "lesson_plan_evaluate_report_view",
                      //   extra: { lesson_id: id },
                      // });
                    }}
                    icon={<ZYIcon type="tiku" />}
                  >
                    评估结果{handleEvaluateScore(detailData.evaluate_score)}
                  </Button>
                )}
                {/* is_new_evaluate = Column(SmallInteger, default=0, comment="评估状态, 0重新生成，1生成中，2完成") */}
                <>
                  {!detailData?.is_new_evaluate && (
                    <>
                      {detailData?.evaluate_score ? (
                        <div style={{ minWidth: "144px" }}>
                          教案已变更，
                          <Button
                            type="link"
                            style={{ padding: "0px" }}
                            className="again-btn-css"
                            disabled={planSseLoading}
                            onClick={() => onEvaluateClick("refresh")}
                          >
                            重新评估
                          </Button>
                        </div>
                      ) : (
                        <Tooltip title="已完成教案优化，评估一下效果如何?">
                          <Button
                            color="primary"
                            variant="solid"
                            className="evaluation-one"
                            onClick={() => onEvaluateClick("") }
                            disabled={planSseLoading}
                            icon={<ZYIcon type="evaluate" />}
                          >
                            评估教案
                          </Button>
                        </Tooltip>
                      )}
                    </>
                  )}
                  {detailData?.is_new_evaluate === 1 && (
                    <>{evaluateLoadingComponent()}</>
                  )}
                </>

                {/* <Button
                  color="primary"
                  variant="solid"
                  onClick={onEditClick}
                  disabled={planSseLoading}
                  icon={<ZYIcon type="rename" />}
                >
                  文档编辑
                </Button> */}
              </div>
            )}
            {!showMore && (
              <div className="create-header-left">
                {/* <Button
                type="text"
                onClick={onEditClick}
                disabled={planSseLoading}
                icon={<ZYIcon type="rename" />}
              >
                编辑
              </Button> */}
                {/* <Button
                type="text"
                onClick={() => {
                  onPublishClick()
                  // addNewTracking({
                  //   bt: 'pv',
                  //   ct: 'lesson_plan_save_modal_view',
                  //   lesson_id: detailData?.id || planParams.id,
                  // })
                }}
                disabled={planSseLoading}
                icon={<ZYIcon type="baocun" />}
              >
                保存
              </Button> */}
                <Dropdown
                  disabled={planSseLoading}
                  onOpenChange={setDropdownOpen}
                  className="dropdown-create-right-plan"
                  menu={{
                    items: [
                      // {
                      //   key: "pdf",
                      //   label: "下载为PDF",
                      //   disabled: planSseLoading,
                      // },
                      {
                        key: "docx",
                        label: "下载为Word",
                        disabled: planSseLoading,
                      },
                    ],
                    onClick: onDownloadClick,
                  }}
                >
                  <Button type="text" icon={<ZYIcon type="download" />}>
                    下载
                    {/* <ZYIcon
                    type="xia"
                    size={12}
                    style={{
                      transform: `rotate(${dropdownOpen ? 180 : 0}deg)`,
                      transition: "transform 0.3s ease-in-out",
                    }}
                  /> */}
                  </Button>
                </Dropdown>

                <div className="divider"></div>

                {/* 关闭左侧 */}
                <Button
                  type="text"
                  // disabled={planSseLoading}
                  icon={
                    <ZYIcon type={hiddenRight ? "icon_fold" : "icon_unfold"} />
                  }
                  // onClick={() => setHiddenRight(!hiddenRight)}
                  onClick={() => {
                    onPreviewRightClick();
                    // addNewTracking({
                    //   bt: "cl",
                    //   ct: "lesson_plan_click_overview",
                    //   extra: { lesson_id: detailData?.id || planParams.id },
                    // });
                  }}
                >
                  {/* {hiddenRight ? "收起" : "全览"} */}
                </Button>
                {/* 关闭右侧 */}
                <Button
                  type="text"
                  // disabled={planSseLoading}
                  icon={
                    <ZYIcon type={"shanchu3"} style={{ fontSize: "16px" }} />
                  }
                  onClick={onPreviewLeftClick}
                ></Button>
              </div>
            )}
            {showMore && (
              <Dropdown
                menu={{
                  items,
                  onClick: handleMenuClick,
                }}
                // disabled={planSseLoading}
                overlayClassName="setting_topic_title_right_dropdown"
                placement={"bottomRight"}
                getPopupContainer={(node) => node.parentNode as HTMLElement}
              >
                <Button
                  type="link"
                  className="setting_topic_list_row_top_box_right_btn"
                  style={{ background: "#F8F8FF" }}
                  icon={<MoreOutlined />}
                ></Button>
              </Dropdown>
            )}
          </div>
          <div className="create-content" ref={contentRef}>
            <div className="create-content-header">
              <ZYIcon className="icon" type="jiaoan" />
              <div className="title">{detailData.title || "课时教案:" + planParams.title}</div>
              {detailData.version && <div className="version">{detailData.version}</div>}
            </div>
            <div className="create-content-wrapper">
              <div
                ref={thinkRef}
                className={`think  ${thinkCreating ? "think-css" : ""} `}
              >
                {thinkLoading ? (
                  <Spin style={{ paddingTop: 8 }} />
                ) : (
                  <>
                    <div className="think-title">
                      <div>{thinkCreating ? "深度思考中..." : "已完成思考"}</div>
                      <div
                        className="think-expand"
                        onClick={() => setThinkExpand(!thinkExpand)}
                      >
                        <ZYIcon type={thinkExpand ? "shrink1" : "open1"} />
                      </div>
                    </div>
                    {/* 思考内容 */}
                    <div
                      className={`think-content ${thinkExpand ? "show" : "unshow"}`}
                    >
                      <MarkdownRender>{thinkContent}</MarkdownRender>
                    </div>
                  </>
                )}
              </div>

              {/* 教案内容 */}
              {teachPlanContent && (
                <div className="teach-plan" ref={teachPlanRef}>
                  <MarkdownRenderToc showToc={hiddenRight}>
                    {teachPlanContent}
                  </MarkdownRenderToc>
                </div>
              )}

              {sseStatus === "error" && (
                <div className="create-content-error">
                  <ZYIcon type="jinggao" />
                  模型生成异常，输出内容失败，请退出重试
                </div>
              )}
            </div>
          </div>
          {/* {planSseLoading && (
            <Affix offsetBottom={28} className="affix-btn">
              <Button
                color="default"
                shape="round"
                size="large"
                variant="outlined"
                onClick={onStopClick}
                icon={<ZYIcon type="danxuan" />}
              >
                停止生成
              </Button>
            </Affix>
          )} */}
        </div>
      )}

      {isEmpty && (
        <div className="empty-content">
          <Empty
            description="内容预览"
            image={require("@/assets/empty-design.png")}
          />
        </div>
      )}
      {/* <Evaluate
        openStatus={isOpenEvaluate}
        setOpenStatus={setIsOpenEvaluate}
        detailData={detailData}
        evaluateLoading={evaluateLoading}
        refreshContent={() => {
          refreshContent?.()
          setEvaluateLoading(0)
        }}
      /> */}
      {contextHolder}
      <Modal
        title="保存到课程"
        open={visible}
        confirmLoading={loading}
        destroyOnHidden
        okText="保存"
        onCancel={() => setVisible(false)}
        onOk={async () => {
          const v = await form.getFieldsValue();
          await run(v);
        }}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: "请输入" }]}
          >
            <Input placeholder="请输入名称" showCount maxLength={30} />
          </Form.Item>
          <Form.Item
            label="选择课程"
            name="course_id"
            rules={[{ required: true, message: "请选择" }]}
          >
            <Select
              allowClear
              options={courseList}
              onChange={onCourseChange}
              placeholder="请选择"
              fieldNames={{ label: "title", value: "id" }}
            />
          </Form.Item>
          <Form.Item
            label="选择目录"
            name="catalog_id"
            rules={[{ required: true, message: "请选择" }]}
          >
            <TreeSelect
              allowClear
              treeDefaultExpandAll
              placeholder="请选择"
              treeData={catalogList}
              fieldNames={{ label: "title", value: "id" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default connect((state: any) => ({
  teachDesginModel: state.teachDesginModel,
}))(CreateRight);
