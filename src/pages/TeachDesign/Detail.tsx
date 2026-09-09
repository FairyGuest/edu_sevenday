import { useState, useEffect, useRef } from "react";
import { connect, history, useDispatch, useLocation, useRequest } from "@umijs/max";
import { Button, Dropdown, Modal, Tag, Form, Input, Select, TreeSelect, message } from "antd";
import ZYIcon from "@/components/ZYIcon";
import Editor from "./components/Editor";
// import Evaluate from "./components/Evaluate";
import { useExercisePrint } from "./components/CreateRight/PrintPdf"; // 打印
import { getOrgId } from "@/utils";

import "./Detail.less";

const menuItems = [
  // { key: "pdf", label: "下载为PDF" },
  { key: "word", label: "下载为Word" },
];

const Detail = (props: any) => {
  const { teachDesginModel } = props;
  const { planParams } = teachDesginModel;
  const dispatch = useDispatch();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const planId = searchParams.get("id");
  const [form] = Form.useForm();
  const { confirm } = Modal;
  const [messageApi, contextHolder] = message.useMessage();
  const editRef = useRef<any>(null); // 编辑器实例
  const [tipsVisible, setTipsVisible] = useState<boolean>(false); // 提示文字
  const [detailData, setDetailData] = useState<any>({}); // 详情数据
  const [visible, setVisible] = useState<boolean>(false); // 发布弹窗
  const [courseList, setCourseList] = useState<any>([]); // 课程列表
  const [catalogList, setCatalogList] = useState<any>([]); // 目录列表
  const [evaluateStatus, setEvaluateStatus] = useState({
    open: false,
    sse: false,
  }); // 是否显示评价

  useEffect(() => {
    getDetailData();
  }, []);
  // 详情数据请求
  const getDetailData = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getPlanDetailUrl",
      payload: { id: planId },
    });
    if (code === 200) {
      setDetailData(data);
      // getCourseList(data);
    }
  };
  // 获取课程列表
  const getCourseList = async (params: any) => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getCoursePlanInfo",
      payload: {
        doc_id: params?.doc_id,
        org_id: getOrgId(),
      },
    });
    if (code === 200) {
      setCourseList(data);
    }
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
  const handleEvaluateScore = (score: number) => {
    let scoreColor = "";
    if (score >= 90) {
      scoreColor = "blue";
    } else if (score >= 75) {
      scoreColor = "green";
    } else if (score >= 60) {
      scoreColor = "orange";
    } else {
      scoreColor = "error";
    }

    return (
      <Tag color={scoreColor} bordered={false}>
        {score}
      </Tag>
    );
  };
  // 返回首页
  const goHome = () => {
    confirm({
      title: "确定要离开页面吗？离开后内容将不会被保存",
      content: "您可以发布教案到教学资源库，或下载教案到本地",
      icon: (
        <span className="anticon anticon-exclamation-circle">
          <ZYIcon type="tishi" />
        </span>
      ),
      okText: "确定", // 确认按钮文字
      onOk: () => history.push("/"),
    });
  }
  // 发起评估点击事件
  const onEvaluateClick = () => {
    if (detailData?.evaluate_score) {
      confirm({
        title: "是否要重新发起评估？",
        content: "新评估报告将覆盖已有的评估报告",
        icon: (
          <span className="anticon anticon-exclamation-circle">
            <ZYIcon type="tishi" />
          </span>
        ),
        okText: "开始评估", // 确认按钮文字
        onOk: () => setEvaluateStatus({ open: true, sse: true }),
      });
    } else {
      setEvaluateStatus({ open: true, sse: true });
    }
  };
  // 发布按钮点击事件
  const onPublishClick = async () => {
    if (courseList.length === 0) {
      messageApi.warning("请先创建课程");
      return;
    } else {
      setVisible(true);
      form.setFieldsValue({
        name: `课时教学：${detailData?.chapter_name}`,
      });
    }
  };
  // 确定发布
  const { run, loading } = useRequest(
    async (values: any) => {
      console.log(values);
      const { code }: any = await dispatch({
        type: "teachDesginModel/postData",
        apiUrl: "postPublishToLib",
        payload: {
          ...values,
          plan_id: detailData?.id,
          html_content: editRef?.current?.getEditData(),
        },
      });
      if (code === 200) {
        setVisible(false);
        messageApi.success("发布成功");
      }
    },
    { manual: true }, // 手动触发
  );
  // PDF下载
  const onDownloadPDF = useExercisePrint({
    contentRef: editRef?.current?.getEditRef(), // 内容
    documentTitle: "教案",
    customPageStyle: `
      @media print {
        .w-e-scroll {
          overflow: visible !important;
          height: fit-content !important;
        }
      }
    `, // 自定义样式（解决溢出内容被截断）
  });
  // 下载按钮点击事件
  const onDownloadClick = async (e: any) => {
    if (e.key === "pdf") {
      // console.log(editRef?.current?.getEditRef()?.current);
      onDownloadPDF();
    } else if (e.key === "word") {
      const { code, data }: any = await dispatch({
        type: "teachDesginModel/postData",
        apiUrl: "postDownloadPaln",
        payload: {
          plan_id: planId,
          html_content: editRef?.current?.getEditData(),
        },
      });
      if (code === 200) {
        window.open(data?.file_url);
      }
    }
  };

  return (
    <div className="design-detail">
      <div className="design-detail-container">
        <div className="design-detail-header">
          <div className="header-left">
            <img
              className="logo"
              src={require("@/assets/logoLight.png")}
              alt="logo"
            />
            <Button
              type="text"
              className="back-btn"
              onClick={goHome}
              icon={<ZYIcon type="fanhui" />}
            >
              返回首页
            </Button>
          </div>
          <div className="header-right">
            {detailData?.evaluate_score && (
              <Button
                color="default"
                variant="outlined"
                onClick={() => setEvaluateStatus({ open: true, sse: false })}
                icon={<ZYIcon type="tiku" />}
              >
                评估结果{handleEvaluateScore(detailData?.evaluate_score)}
              </Button>
            )}
            <Button
              type="text"
              onClick={onEvaluateClick}
              icon={<ZYIcon type="evaluate" />}
            >
              发起评估
            </Button>
            <Button
              type="text"
              onClick={onPublishClick}
              icon={<ZYIcon type="share" />}
            >
              发布
            </Button>
            <Dropdown
              menu={{
                items: menuItems,
                onClick: onDownloadClick,
              }}
            >
              <Button type="text" icon={<ZYIcon type="download" />}>
                下载
                <ZYIcon type="xia" />
              </Button>
            </Dropdown>
          </div>
        </div>
        {tipsVisible && (
          <div className="design-detail-tips">
            <div className="content-tips-item">
              <div className="content-tips-text">
                <ZYIcon type="tishi" style={{ fontSize: 20 }} />
                二次编辑的内容不会同步到原教案，请自行下载保存或发布到教学资源库
              </div>
              <ZYIcon
                type="shanchu3"
                className="tips-close"
                onClick={() => setTipsVisible(false)}
              />
            </div>
          </div>
        )}
        <div className="design-detail-content">
          <Editor onRef={editRef} data={detailData} />
        </div>
        {/* <Evaluate
          openStatus={evaluateStatus}
          setOpenStatus={setEvaluateStatus}
          detailData={detailData}
        /> */}
      </div>
      {contextHolder}
      <Modal
        title="发布到课程"
        open={visible}
        confirmLoading={loading}
        destroyOnHidden
        okText="发布"
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
}))(Detail);
