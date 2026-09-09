import { useEffect, useRef, useState } from "react";
import { useDispatch } from "@umijs/max";
import {
  Button,
  message,
  Modal,
  Form,
  Row,
  Col,
  Input,
  Checkbox,
  TreeSelect,
} from "antd";
import { ZYIcon } from "@/components";
import PublishToLibraryBtn from "@/components/PublishToLibraryBtn";
import "./PublishToResourseLibary.less";

const PublishToResourseLibary = (props: any) => {
  const [publishLoading, setPublishLoading] = useState(false);
  const [checkedList, setCheckedList] = useState([]);
  const [modal, contextHolder] = Modal.useModal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [treeData, setTreeData] = useState([]);

  const { selectedItem, course_id } = props;

  const onClickPublishToResurseLibary = () => {
    let str = "";
    if (selectedItem.fileName) {
      str = selectedItem.fileName?.split(".")?.[0];
    }
    setIsModalOpen(true);
    getCourseCatalogList();
    form.setFieldsValue({
      name: str ? str : "",
      tag: str ? str : "",
    });
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
        catalog_id: row.id,
      });
    }
  };

  const cancelPublish = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    console.log("values----", values);

    setPublishLoading(true);

    let json_data = {
      id: selectedItem.request_id,
      is_overwrite: values?.is_overwrite ? values?.is_overwrite : 0,
      catalog_id: values?.catalog_id,
      name: values?.name,
      tag: values?.tag,
    };

    let res: any = await dispatch({
      type: "teachingModel/postData",
      // apiUrl: "getDistribute",
      apiUrl: "pptPublishToLibrary",
      payload: { ...json_data },
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
            onFinish({
              ...values,
              is_overwrite: 1,
            });
          },
        });
      } else {
        message.success("发布成功");
        props?.successFn?.(true);
        cancelPublish();
        // props?.refreshListFn?.();
      }
      console.log("code, data", res);
    }
    setPublishLoading(false);
  };

  const onChange = (checkedValues) => {
    setCheckedList(checkedValues);
  };

  return (
    <div>
      {/* <div className="publishBtn flex items-center cursor-pointer" onClick={onClickPublishToResurseLibary}>
                <ZYIcon type="daochu" style={{ fill: "#1C6CFF" }} />
                <span>发布到教学资源库</span>
            </div> */}
      <PublishToLibraryBtn
        className={props.className}
        onClickFunc={onClickPublishToResurseLibary}
      />

      <div className="tt_publish_libary">
        <Modal
          title={"发布到教学资源库"}
          closable={{ "aria-label": "Custom Close Button" }}
          open={isModalOpen}
          onOk={() => {
            form.submit();
          }}
          onCancel={cancelPublish}
          footer={[
            <Button key="back" className="back_btn_css" onClick={cancelPublish}>
              取消
            </Button>,
            <Button
              key="submit"
              type="primary"
              className="submit_btn_css"
              loading={publishLoading}
              onClick={() => {
                form.submit();
              }}
            >
              发布
            </Button>,
          ]}
        >
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
              className="publish_form"
            >
              {selectedItem.type == "ppt" ? (
                <Form.Item
                  label="讲义名称"
                  name="name"
                  rules={[
                    { required: true, message: "讲义名称", min: 1, max: 20 },
                  ]}
                >
                  <Input
                    count={{ show: true, max: 20 }}
                    placeholder="请输入讲义名称"
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  label="教案名称"
                  name="tag"
                  rules={[
                    { required: true, message: "教案名称", min: 1, max: 20 },
                  ]}
                >
                  <Input
                    count={{ show: true, max: 20 }}
                    placeholder="教案名称"
                  />
                </Form.Item>
              )}

              <Form.Item
                label="选择存储目录"
                name="catalog_id"
                rules={[{ required: true, message: "请选择存储目录" }]}
              >
                <TreeSelect
                  placeholder="请选择存储目录"
                  allowClear
                  treeData={treeData}
                />
              </Form.Item>
            </Form>
          </div>
          {contextHolder}
        </Modal>
      </div>
    </div>
  );
};
export default PublishToResourseLibary;
