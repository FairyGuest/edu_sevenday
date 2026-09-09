import { useState, useEffect, useRef, useImperativeHandle } from "react";
import { useDispatch, useRequest, useSelector } from "umi";
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
  TreeSelect,
  message,
} from "antd";
import MarkdownRender from "@/components/MarkdownRender";
import MarkdownRenderToc from "@/components/MarkdownRender/showToc";
import { ZYIcon } from "@/components";
import { str2json, scrollTop, stopSSE, addNewTracking, getOrgId } from "@/utils";
import useQuestionActions from "@/pages/TeachDesign/hooks/EditTeach";

import "./StudyRight.less";

let planId = ""; // 学案ID
let sseNum = 0; // SSE内容标识（0：初始，1：思考，2：评估）

const StudyRight = (props: any) => {
  const {
    onRef,
    courseList,
    detailData,
    itemData,
    setCurrStudy,
    fullScreen,
    setFullScreen,
  } = props;
  const { planParams, studyPlanLoading } = useSelector((state: any) => state.teachDesginModel); // 单元学案参数

  const dispatch = useDispatch();
  const { confirm } = Modal;
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const thinkRef = useRef<HTMLDivElement>(null); // 思考内容
  const contentRef = useRef<HTMLDivElement>(null); // 创建内容
  const teachPlanRef = useRef<HTMLDivElement>(null); // 学案内容
  const [catalogList, setCatalogList] = useState<any>([]); // 目录列表
  const [thinkLoading, setThinkLoading] = useState<boolean>(false); // 思考加载
  const [thinkCreating, setThinkCreating] = useState<boolean>(false); // 思考创建
  const [thinkExpand, setThinkExpand] = useState<boolean>(false); // 思考展开
  const [thinkContent, setThinkContent] = useState<string>(""); // 思考内容
  const [teachPlanContent, setTeachPlanContent] = useState<string>(""); // 学案内容
  const [sseStatus, setSseStatus] = useState<string>(""); // SSE状态
  const [visible, setVisible] = useState<boolean>(false); // 保存弹窗
  const [isEmpty, setIsEmpty] = useState<boolean>(true); // 是否为空
  const { toggleQuestionFavorite } = useQuestionActions();

  useEffect(() => {
    if (detailData?.id) {
      planId = detailData?.id;
      setIsEmpty(false);
      setThinkContent(detailData?.studay_plan_thinking || "");
      setTeachPlanContent(detailData?.studay_plan_content || "");
    }
  }, [detailData?.id]);

  useImperativeHandle(onRef, () => ({
    handleData: (params: any) => updChatSSE(params), // 获取数据
    handleReset: () => handleReset(), // 重新生成
  }));

  // 重新生成时，清空学案内容
  const handleReset = () => {
    setThinkContent(""); // 清空思考内容
    setTeachPlanContent(""); // 清空学案内容
  };
  // 更新思考内容
  const updChatSSE = async (params: any) => {
    const content = str2json(params.data);
    const { __action, data, thinking, id } = content;
    scrollTopChat(contentRef); // 滚动
    if (__action == "start") {
      // addNewTracking({
      //   ct: "study_plan_ai_generate_start",
      //   extra: {
      //     lesson_id: itemData.plan_id,
      //     study_plan_id: id,
      //     school_id: getOrgId("id"),
      //     school_name: getOrgId("title"),
      //     subject_name: planParams?.stage + planParams?.subject,
      //   },
      // });
      sseNum = 0; // 重置SSE标识
      setIsEmpty(false);
      setSseStatus("start");
      dispatch({
        type: "teachDesginModel/setData",
        payload: { studyPlanLoading: true },
      });
      setThinkLoading(true);
      return;
    }

    if (__action == "end") {
      // addNewTracking({
      //   ct: "study_plan_ai_generate_complete",
      //   extra: {
      //     lesson_id: itemData.plan_id,
      //     study_plan_id: id,
      //   },
      // });
      setCurrStudy({
        ...itemData,
        study_plan_id: id,
        has_study_plan: true,
      });
      setSseStatus("end");
      dispatch({ // 刷新单元教案
        type: "teachDesginModel/setData",
        payload: {
          studyPlanLoading: false, // 学案加载
          planParams: { ...planParams, refresh: true }, // 刷新单元教案
        },
      });
    }

    if (__action == "error") {
      messageApi.error(data);
      setSseStatus("error");
      dispatch({
        type: "teachDesginModel/setData",
        payload: { studyPlanLoading: false },
      });
    }

    if (__action == "stream") {
      if (thinking) {
        // SSE第一段返回内容---思考
        if (sseNum === 0) {
          setThinkCreating(true);
          setThinkExpand(true);
          setThinkLoading(false);
          setSseStatus("stream_thinking");
          planId = id; // 设置学案ID
          sseNum = 1; // 修改SSE标识
        }
        scrollTopChat(thinkRef); // 滚动
        setThinkContent((prev) => prev + data); // 拼接字符串
      } else {
        if (sseNum === 1) {
          // SSE第二段返回内容---学案
          setThinkCreating(false);
          setThinkExpand(false);
          setSseStatus("stream_content");
          sseNum = 2; // 修改SSE标识
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
        name: itemData?.title || "",
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
          plan_id: planId, // 学案ID
          publish_type: "study_plan",
        },
      });
      if (code === 200) {
        setVisible(false);
        messageApi.success("保存成功");
        // addNewTracking({
        //   bt: 'cl',
        //   ct: 'study_plan_save_modal_click_confirm',
        //   lesson_id:planParams.id,
        //   study_plan_id: detailData?.id,
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
        plan_id: planId,
        download_type: "study_plan",
        download_suffix: e.key,
      },
    });
    if (code === 200) {
      window.open(data?.file_url);
      // addNewTracking({
      //   bt: "cl",
      //   ct: "study_plan_click_download",
      //   extra: {
      //     lesson_id: itemData.plan_id,
      //     study_plan_id: detailData?.id,
      //     download_format: type,
      //   },
      // });
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
  };

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
      cancelText: "否",
      onOk: () => {
        toggleQuestionFavorite(planId, "study_plan");
        // addNewTracking({
        //   bt: 'pv',
        //   ct: 'study_plan_edit_view',
        //   lesson_id: planParams.id,
        //   study_plan_id: detailData?.id,
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
      payload: { studyPlanLoading: false },
    });
  };
  // 课程选择事件
  const onCourseChange = (value: any) => {
    const item = courseList.find((item: any) => item.id === value);
    setCatalogList(item?.catalogs || []);
    form.setFieldsValue({ catalog_id: undefined });
  };

  return (
    <div className="study-right">
      {!isEmpty && (
        <div className="create-container">
          <div className="create-header">
            <div className="create-header-left"></div>
            <div className="create-header-right">
              {/* <Button
                type="text"
                onClick={onEditClick}
                disabled={studyPlanLoading}
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
                  //   ct: 'study_plan_save_modal_view',
                  //   lesson_id: planParams.id,
                  //   study_plan_id: detailData?.id,
                  // })
                }}
                disabled={studyPlanLoading}
                icon={<ZYIcon type="baocun" />}
              >
                保存
              </Button> */}
              <Dropdown
                disabled={studyPlanLoading}
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
                  onRightPreview()
                  // addNewTracking({
                  //   bt: "cl",
                  //   ct: "study_plan_click_overview",
                  //   extra: {
                  //     lesson_id: itemData.plan_id,
                  //     study_plan_id: detailData?.id,
                  //   },
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
              <div className="title">{detailData?.title || itemData?.title || ""}</div>
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

              {/* 学案内容 */}
              {teachPlanContent && (
                <div className="teach-plan" ref={teachPlanRef}>
                  <MarkdownRenderToc showToc={fullScreen}>{teachPlanContent}</MarkdownRenderToc>
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
          {/* {studyPlanLoading && (
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

export default StudyRight;
