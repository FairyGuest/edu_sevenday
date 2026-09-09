import { useState, useEffect, memo } from "react";
import { Form, Modal, Button, Input, TreeSelect, message } from "antd";
import { connect, useDispatch } from "@umijs/max";
import { history, Outlet, useLocation } from "umi";
import { ExportOutlined, ShareAltOutlined } from "@ant-design/icons";
import {
  deepCopy,
  getSpaceInfo,
  windowOpen,
  getUserInfo,
  scrollTop,
} from "@/utils";
import { ZYIcon } from "@/components";
import "./index.less";

const App = (props: any) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const {
    title,
    doc_id,
    course_id,
    doc_name,
    resourceLibrary = false,
    refreshListFn,
    isChat = false,
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [queryDeptListOption, setQueryDeptListOption] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [treeData, setTreeData] = useState([]);

  // const dispatch = useDispatch();

  // 发布到教学资源库
  const showLibraryModal = () => {
    let str = "";
    if (doc_name) {
      str = doc_name?.split(".")?.[0];
    }
    getCourseCatalogList();
    setIsModalOpen(true);
    form.setFieldsValue({
      title: str ? str : "",
      content_id: undefined,
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 获取当前课程的目录列表
  const getCourseCatalogList = async () => {
    let payload: any = { space_id: course_id };
    payload = { ...payload };
    let { code, data } = await dispatch({
      type: "setQuestionsModel/getData",
      apiUrl: "getCourseCatalog",
      payload,
    });
    if (code === 200) {
      let arr = dealwith(data);
      console.log("arr", arr);
      selectFirst(arr?.[0]);
      setTreeData(arr);
    }
  };
  // 处理目录列表数据
  const dealwith = (list: any) => {
    return list.map((item: any) => {
      item.value = item.id;
      item.title = item.title;
      if (item?.children?.length > 0) {
        dealwith(item?.children);
      }
      return item;
    });
  };
  // 目录默认选择第一条
  const selectFirst = (row: any) => {
    if (row?.children?.length > 0) {
      selectFirst(row?.children?.[0]);
    } else if (row?.children?.length == 0) {
      form.setFieldsValue({
        content_id: row.id,
      });
    }
  };

  // 发布
  const onFinish = async (values: any) => {
    postTeachingPlanPublishFn(values);
  };

  const postTeachingPlanPublishFn = async (values: any) => {
    setLoading(true);
    let res: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "postTeachingPlanPublish",
      payload: {
        id: doc_id,
        name: values?.title,
        tag: "教学计划",
        is_overwrite: values?.is_overwrite ? values?.is_overwrite : 0,
        catalog_id: values?.content_id,
        course_id,
      },
    });
    if (res?.code === 200) {
      if (res?.status == "conflict") {
        modal.confirm({
          title: "文件名冲突",
          icon: (
            <ZYIcon
              type="tixing"
              style={{ fontSize: 24, marginRight: "8px" }}
            />
          ),
          content: "该文件名已存在,是否覆盖?",
          okText: "覆盖",
          okButtonProps: {
            style: {
              backgroundColor: "red",
              color: "white",
            },
          },
          onOk() {
            postTeachingPlanPublishFn({
              ...values,
              is_overwrite: 1,
            });
          },
        });
      } else {
        handleCancel();
        message.success("发布成功");
        props?.successFn?.(true);
      }
    } else {
      setLoading(false);
    }
    setLoading(false);
  };

  // 发布到教学资源库
  const distributionPublishToLibraryComponents = () => {
    return (
      <div>
        <Form
          name="classForm"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 20 }}
          initialValues={{}}
          form={form}
          onFinish={onFinish}
          autoComplete="off"
          style={{ marginTop: "24px" }}
        >
          <Form.Item
            label="文件名称"
            name="title"
            rules={[
              { required: true, message: "请输入文件名称", min: 1, max: 20 },
            ]}
          >
            <Input
              count={{
                show: true,
                max: 20,
              }}
              placeholder="请输入文件名称"
            />
          </Form.Item>
          <Form.Item
            label="选择存储目录"
            name="content_id"
            rules={[{ required: true, message: "请选择存储目录" }]}
          >
            <TreeSelect
              style={{ width: "100%" }}
              placeholder="请选择存储目录"
              allowClear
              treeDefaultExpandAll
              treeData={treeData}
            />
          </Form.Item>
        </Form>
      </div>
    );
  };

  return (
    <div className="push_class_modal_box">
      {!isChat && (
        <>
          <Button
            key={2}
            type="primary"
            icon={<ZYIcon type="daochu" />}
            className={"publish_css"}
            loading={loading}
            onClick={showLibraryModal}
          >
            发布到教学资源库
          </Button>
        </>
      )}
      {isChat && (
        <>
          <Button
            key={2}
            type="link"
            icon={<ZYIcon type="daochu" />}
            className={"publish_css_chat"}
            loading={loading}
            onClick={showLibraryModal}
          >
            发布到教学资源库
          </Button>
        </>
      )}
      <Modal
        title={"发布到教学资源库"}
        destroyOnHidden
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={() => {
          form.submit();
        }}
        onCancel={handleCancel}
        footer={[
          <Button key="back" className="back_btn_css" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="submit_btn_css"
            loading={loading}
            onClick={() => {
              form.submit();
            }}
          >
            发布
          </Button>,
        ]}
      >
        {distributionPublishToLibraryComponents()}
        {contextHolder}
      </Modal>
    </div>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
}))(memo(App));
