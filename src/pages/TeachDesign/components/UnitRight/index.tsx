import { useState, useEffect, useRef, useImperativeHandle } from "react";
import { connect, useDispatch, useRequest, history, useSelector } from "umi";
import {
  Affix,
  Button,
  Dropdown,
  Empty,
  Form,
  Modal,
  Input,
  Select,
  Spin,
  Tag,
  Tooltip,
  TreeSelect,
  message,
} from "antd";
import MarkdownRender from "@/components/MarkdownRender";
import MarkdownRenderToc, { MarkdownTocGroup } from "@/components/MarkdownRender/showToc";
import { ZYIcon } from "@/components";
import { str2json, scrollTop, stopSSE, addNewTracking, getOrgId } from "@/utils";
import UnitTable from "../UnitTable";
import useQuestionActions from "@/pages/TeachDesign/hooks/EditTeach";

import "./index.less";

const UnitRight = (props: any) => {
  const {
    onRef,
    rightWidth,
    courseList = [],
    detailData = {},
    teachPlanList = [],
    setStep,
    setCurrClass,
    refreshContent,
    fullScreen,
    setFullScreen,
  } = props;
  const { planParams, planSseLoading, leftChatLoading } = useSelector(
    (state: any) => state.teachDesginModel,
  );

  const dispatch = useDispatch();
  const { confirm } = Modal;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const thinkRef = useRef<HTMLDivElement>(null); // 思考内容
  const contentRef = useRef<HTMLDivElement>(null); // 创建内容
  const teachPlanRef = useRef<HTMLDivElement>(null); // 教案内容
  const [catalogList, setCatalogList] = useState<any>([]); // 目录列表
  const [thinkLoading, setThinkLoading] = useState<boolean>(false); // 思考加载
  const [thinkCreating, setThinkCreating] = useState<boolean>(false); // 思考创建
  const [thinkExpand, setThinkExpand] = useState<boolean>(false); // 思考展开
  const [thinkContent, setThinkContent] = useState<string>(""); // 思考内容
  const [teachPlanContent, setTeachPlanContent] = useState<string>(""); // 教案内容
  const [sseStatus, setSseStatus] = useState<string>(""); // SSE状态
  const [visible, setVisible] = useState<boolean>(false); // 保存弹窗
  const [isEmpty, setIsEmpty] = useState<boolean>(true); // 是否为空
  const [sseNum, setSseNum] = useState<number>(0); // SSE内容标识（0：初始，1：思考，2：评估）
  const [isFold, setIsFold] = useState<boolean>(false); // 是否折叠按钮
  const { toggleQuestionFavorite } = useQuestionActions();

  // 详情时，设置教案内容
  useEffect(() => {
    if (detailData?.id) {
      setIsEmpty(false);
      setThinkContent(detailData?.thinking_content || "");
      setTeachPlanContent(detailData?.plan_content || "");
    }
  }, [detailData?.id]);

  // TODO: 监听右侧宽度变化，判断是否折叠按钮显示
  useEffect(() => {
    // if (rightWidth >= 660) {
    //   setIsFold(false);
    // } else {
    //   if () { }
    // }
  }, [rightWidth]);

  useImperativeHandle(onRef, () => ({
    handleData: (params: any) => updChatSSE(params), // 获取数据
    handleReset: () => handleReset(), // 重新生成
  }));
  // 重新生成时，清空教案内容
  const handleReset = () => {
    setThinkContent(""); // 清空思考内容
    setTeachPlanContent(""); // 清空教案内容
  };
  // 更新思考内容
  const updChatSSE = async (params: any) => {
    const content = str2json(params.data);
    const { __action, data, thinking, id } = content;
    scrollTopChat(contentRef); // 滚动
    if (__action == "start") {
      // addNewTracking({
      //   ct: "unit_plan_ai_generate_start",
      //   extra: { unit_id: id },
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
      //   ct: "unit_plan_ai_generate_complete",
      //   extra: { unit_id: id },
      // });
      setSseStatus("end");
      dispatch({
        type: "teachDesginModel/setData",
        payload: {
          planSseLoading: false,
          planParams: { ...planParams, id }, // 设置教案ID
        },
      });
    }

    if (__action == "error") {
      messageApi.error(data);
      setIsEmpty(false);
      setSseStatus("error");
      dispatch({
        type: "teachDesginModel/setData",
        payload: { planSseLoading: false },
      });
    }

    if (__action == "stream") {
      if (thinking) {
        // SSE第一段返回内容---思考
        if (sseNum === 0) {
          setThinkCreating(true);
          setThinkExpand(true);
          setThinkLoading(false);
          setSseNum(1); // 修改SSE标识
          setSseStatus("stream_thinking");
        }
        scrollTopChat(thinkRef); // 滚动到底部
        setThinkContent((prev) => prev + data); // 拼接字符串
      } else {
        if (sseNum === 1) {
          // SSE第二段返回内容---教案
          setThinkCreating(false);
          setThinkExpand(false);
          setSseNum(2); // 修改SSE标识
          setSseStatus("stream_content");
        }
        setTeachPlanContent((prev) => prev + data); // 拼接字符串
      }
    }
  };
  // 滚动到底部
  const scrollTopChat = (ref: any) => {
    setTimeout(() => {
      scrollTop(ref);
    }, 100);
  };
  // 保存按钮点击事件
  const onPublishClick = async () => {
    if (courseList.length === 0) {
      messageApi.warning("请先创建课程");
      return;
    } else {
      setVisible(true);
      form.setFieldsValue({
        name: `单元整体教学：${planParams.title}`,
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
        //   bt: 'cl',
        //   ct: 'unit_plan_save_modal_click_confirm',
        //   unit_id: detailData?.id,
        // })
      }
    },
    { manual: true }, // 手动触发
  );
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
      //   ct: "unit_plan_click_download",
      //   extra: {
      //     unit_id: detailData?.id,
      //     download_format: type,
      //   },
      // });
    }
  };
  // 发起评估点击事件
  const onEvaluateClick = (type: string) => {
    const trackParams = {
      bt: "cl",
      ct: "unit_plan_click_trigger_evaluate",
      extra: {
        unit_id: detailData?.id,
        school_id: getOrgId("id"),
        school_name: getOrgId("title"),
        subject_name: planParams?.stage + planParams?.subject,
        evaluate_type: "first",
      },
    };
    if (type === "refresh") {
      trackParams.extra.evaluate_type = "re_evaluate";
      evaluateRequest();
      // addNewTracking(trackParams);
    } else {
      confirm({
        content: "人机交互设计教案是否完成，进入教案评估环节?",
        icon: <span className="anticon"></span>,
        okText: "是，开始评估",
        cancelText: "否",
        onOk: () => {
          evaluateRequest();
          // addNewTracking(trackParams);
        },
      });
    }
  };
  // 评估请求
  const evaluateRequest = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postTeachPlanEvaluate",
      payload: { id: detailData?.id },
    });
    if (code === 200) {
      message.success("开始评估");
      if (data?.message === "开始评估") {
        // messageApi.info(data?.message);
        refreshContent(); // 刷新内容
      }
    }
  };
  // 右侧全览、收起
  const onRightPreview = () => {
    const collapseBtn = document.querySelector(
      ".ant-splitter-bar-collapse-bar",
    ) as HTMLElement;
    collapseBtn?.click();
    setFullScreen(!fullScreen);
  };
  // 左侧全览、收起
  const onLeftPreview = () => {
    const collapseBtn = document.querySelector(
      ".ant-splitter-bar-collapse-bar-end",
    ) as HTMLElement;
    collapseBtn?.click();
    if (fullScreen) {
      setFullScreen(false);
      setTimeout(() => {
        collapseBtn?.click();
      }, 100);
    }
  }
  // 编辑按钮点击事件
  const onEditClick = () => {
    confirm({
      // title: "是否要重新发起评估？",
      content: "是否已完成“人机协作”设计阶段，当前进入教师人工编辑阶段?",
      icon: (
        <span className="anticon anticon-exclamation-circle">
          <ZYIcon type="tishi" />
        </span>
      ),
      okText: "是，进入人工编辑", // 确认按钮文字
      cancelText: '否',
      onOk: () => {
        toggleQuestionFavorite(detailData?.id, "teach_plan");
        // addNewTracking({
        //   bt: 'pv',
        //   ct: 'unit_plan_edit_view',
        //   unit_id: detailData?.id || planParams.id,
        // })
      },
    });
  };

  // 停止生成
  const onStopClick = () => {
    stopSSE();
    setThinkLoading(false);
    setThinkCreating(false);
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

  // 生成课时教案
  const handlePlan = (item: any) => {
    // 查找课时教案（保持数据统一）
    const findPlan = teachPlanList.filter((i: any) => i.id === item.id);

    if (!detailData.row_contents.some((i: any) => i.has_plan)) {
      confirm({
        title: "「单元教案」已人机交互完成优化，是否生成「课时教案」?",
        content: (
          <div className="warning-text">
            课时教案生成后，单元教案将无法再进行人机交互修改，请谨慎确认！
          </div>
        ),
        icon: (
          <span className="anticon">
            <ZYIcon type="xinxi" color="#1c6cff" />
          </span>
        ),
        okText: "确认生成", // 确认按钮文字
        cancelText: "暂不生成",
        onOk: () => {
          setStep(2);
          setCurrClass(findPlan[0] || {});
        },
      });
    } else {
      setStep(2);
      setCurrClass(findPlan[0] || {});
    }
  };
  // 处理评估分数
  const handleEvaluateScore = (score: string) => {
    let scoreColor = "";
    let textColor = "";

    if (score.includes("A")) {
      scoreColor = "#E1FAEB";
      textColor = "#1A805E";
    } else if (score.includes("B")) {
      scoreColor = "#EAF1FC";
      textColor = "#2269CA";
    } else if (score.includes("C")) {
      scoreColor = "#FFF3E3";
      textColor = "#FFAD37";
    } else {
      scoreColor = "#FEF3F2";
      textColor = "#EF4444";
    }

    return (
      <Tag color={scoreColor} bordered={false}>
        <span style={{ color: textColor }}>{score}</span>
      </Tag>
    );
  };

  return (
    <div className="unit-right">
      {!isEmpty && (
        <div className="create-container">
          <div className="create-header">
            <div className="create-header-left">
              {detailData?.evaluate_score && (
                <Button
                  color="primary"
                  type="text"
                  disabled={planSseLoading}
                  className="report-btn"
                  icon={<ZYIcon type="tiku" />}
                  onClick={() => {
                    if (!detailData?.id) return;
                    window.open(`/evaluateReport?id=${detailData?.id}`);
                    // addNewTracking({
                    //   bt: "pv",
                    //   ct: "unit_plan_evaluate_report_view",
                    //   extra: { unit_id: detailData?.id },
                    // });
                  }}
                >
                  评估结果{handleEvaluateScore(detailData.evaluate_score)}
                </Button>
              )}
              {/* is_new_evaluate评估状态, 0重新生成，1生成中，2完成 */}
              {!detailData?.is_new_evaluate && (
                <>
                  {detailData?.evaluate_score ? (
                    <div className="refresh-btn">
                      教案已变更，
                      <Button
                        color="primary"
                        variant="link"
                        disabled={planSseLoading || leftChatLoading}
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
                        onClick={() => onEvaluateClick("") }
                        disabled={planSseLoading || leftChatLoading}
                        className="evaluate-btn"
                        icon={<ZYIcon type="evaluate" />}
                      >
                        评估教案
                      </Button>
                    </Tooltip>
                  )}
                </>
              )}
              {detailData?.is_new_evaluate === 1 && (
                <div className="waiting-text">
                  <ZYIcon
                    type="dengdai"
                    style={{
                      fontSize: 16,
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  评估中...预计2分钟完成
                </div>
              )}
            </div>
            <div className="create-header-right">
              {/* <Button
                type="text"
                onClick={onEditClick}
                disabled={planSseLoading || leftChatLoading}
                icon={<ZYIcon type="rename" />}
              >
                编辑
              </Button>
              <Button
                type="text"
                onClick={() => {
                  onPublishClick()
                  // addNewTracking({
                  //   bt: 'pv',
                  //   ct: 'unit_plan_save_modal_view',
                  //   unit_id: detailData?.id,
                  // })
                }}
                disabled={planSseLoading || leftChatLoading}
                icon={<ZYIcon type="baocun" />}
              >
                保存
              </Button> */}
              <Dropdown
                disabled={planSseLoading || leftChatLoading}
                menu={{
                  items: [
                    // { key: "pdf", label: "下载为PDF" },
                    { key: "docx", label: "下载为Word" },
                  ],
                  onClick: onDownloadClick,
                }}
              >
                <Button type="text" icon={<ZYIcon type="download" />}>
                  下载
                </Button>
              </Dropdown>
              <div className="divider"></div>
              <Button
                type="text"
                // disabled={planSseLoading}
                className="icon-btn"
                icon={
                  <ZYIcon type={fullScreen ? "icon_fold" : "icon_unfold"} />
                }
                onClick={() => {
                  onRightPreview();
                  // addNewTracking({
                  //   bt: "cl",
                  //   ct: "unit_plan_click_overview",
                  //   extra: { unit_id: detailData?.id },
                  // });
                }}
              />
              <Button
                type="text"
                className="icon-btn"
                icon={<ZYIcon type="close" />}
                onClick={onLeftPreview}
              />
            </div>
          </div>
          <div className="create-content" ref={contentRef}>
            <div className="create-content-header">
              <ZYIcon className="icon" type="jiaoan" />
              <div className="title">{detailData?.title || `单元整体教学：${planParams.title}`}</div>
              {detailData?.version && <div className="version">{detailData?.version}</div>}
            </div>
            <div className="create-content-wrapper">
              <div
                className="think"
                ref={thinkRef}
                style={{ maxHeight: thinkCreating ? 124 : "unset" }}
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
                  {detailData?.type === 2 && detailData?.pre_content ? (
                    <div className="unit-content">
                      <MarkdownTocGroup>
                        <MarkdownRenderToc
                          showToc={fullScreen}
                          tocSectionKey="unit-pre"
                        >
                          {detailData?.pre_content || ""}
                        </MarkdownRenderToc>
                        <UnitTable
                          unitContent={detailData}
                          handlePlan={handlePlan}
                        />
                        <MarkdownRenderToc
                          showToc={fullScreen}
                          tocSectionKey="unit-after"
                        >
                          {detailData?.after_content || ""}
                        </MarkdownRenderToc>
                      </MarkdownTocGroup>
                    </div>
                  ) : (
                    <MarkdownRenderToc showToc={fullScreen}>
                      {teachPlanContent}
                    </MarkdownRenderToc>
                  )}
                </div>
              )}
              {sseStatus === "error" && (
                <div className="error">
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

export default UnitRight;
