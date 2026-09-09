import { connect, useDispatch } from "@umijs/max";
import {
  Button,
  Dropdown,
  Modal,
  Form,
  Empty,
  Image,
  Input,
  message,
} from "antd";
import {
  FilePdfOutlined,
  FileWordOutlined,
  FileTextOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { history, Outlet, useLocation, useRequest } from "umi";
import "./index.less";
import { latexReplace, formatStaticUrl } from "@/utils";
import { ZYIcon } from "@/components";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

// import mock from "./mock.json";
import { useEffect, useState } from "react";
import { log } from "console";

// 定义icon菜单选项
const menuItemsNoPublish = [
  {
    key: "rename",
    label: (
      <div>
        <ZYIcon type="edit" />
        <span style={{ margin: "0 20px 0 8px" }}>重命名</span>
      </div>
    ),
  },
  {
    key: "delete",
    label: (
      <div>
        <ZYIcon type="shanchu" style={{ color: "#EF4444" }} />
        <span style={{ margin: "0 8px" }}>删除</span>
      </div>
    ),
  },
];

const menuItemsPublish = [
  {
    key: "rename",
    label: (
      <div>
        <EditOutlined />
        <span style={{ margin: "0 20px 0 8px" }}>重命名</span>
      </div>
    ),
  },
];

const App = (props: any) => {
  const { onRef, roleModel, dataListData, setExamvader } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const [dataList, setDataList] = useState([]);

  const [active, setActive] = useState("");
  const [editItem, setEditItem] = useState<any>({}); // 编辑的文件

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const examId = searchParams.get("examId");
  console.log(examId, "1235");

  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗是否显示
  // const [loading, setLoading] = useState<any>(false);

  useEffect(() => {
    setDataList(dataListData);
    if (examId == null) {
      props?.rowFn?.(dataListData?.[0]);
      setActive(dataListData?.[0]?.id);
      setExamvader(true);
    } else {
      const examdata = dataListData?.find((item: any) => {
        return item?.exam_id == examId
      })
      console.log(examdata, "examdata");
      if (examdata) {
        props?.rowFn?.(examdata);
        setActive(examdata?.id);
        setExamvader(true);
      }else{
        setExamvader(false);
      }

    }
  }, [dataListData, examId]);

  const getRowFn = (item: any) => {
    setExamvader(true);
    setActive(item?.id);
    props?.rowFn?.(item);
  };

  // 处理名称
  const handleName = (fileName: string) => {
    let name = "",
      ext = "";
    const parts = fileName.split(".");
    if (parts.length < 2) {
      name = fileName;
    } else {
      name = parts.slice(0, -1).join(".");
      ext = parts[parts.length - 1];
    }
    switch (ext) {
      case "pdf":
        return (
          <>
            <ZYIcon type={"pdf-color"} style={{ fontSize: 16 }} />
            <span style={{ marginLeft: "4px" }}>{name}</span>
          </>
        );
      case "doc":
      case "docx":
        return (
          <>
            <ZYIcon type={"pdf-color"} style={{ fontSize: 16 }} />
            <span style={{ marginLeft: "4px" }}>{name}</span>
          </>
        );
      default:
        return (
          <>
            <ZYIcon type={"pdf-color"} style={{ fontSize: 16 }} />
            <span style={{ marginLeft: "4px" }}>{name}</span>
          </>
        );
    }
  };

  // icon菜单点击事件
  const menuClick = (e: any, item: any) => {
    e.domEvent.stopPropagation();
    if (e.key === "rename") {
      setIsModalVisible(true);
      setEditItem(item);
      form.setFieldsValue({
        doc_name: item?.title?.replace(/\.[^/.]+$/, ""),
      });
    } else if (e.key === "delete") {
      modal.confirm({
        title: (
          <div>
            <span>
              你确定删除文件
              <span style={{ marginLeft: "4px" }}>{item?.title} 吗?</span>
            </span>
          </div>
        ),
        icon: <DeleteOutlined style={{ color: "red" }} />,
        content: "",
        okButtonProps: {
          style: {
            backgroundColor: "red",
            color: "white",
          },
        },
        onOk() {
          delKbDocs({ item_id: item?.id });
        },
      });
    }
  };

  // 删除文档
  const delKbDocs = async (param: any) => {
    const { code }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "postDistributionDelete",
      payload: param,
    });
    if (code == 200) {
      // getDataList();
      message.success("删除成功");
      props?.getDataList?.();
    }
  };

  // 弹窗提交
  const { run, loading } = useRequest(
    async (values) => {
      console.log("values", values, editItem);
      const { code }: any = await dispatch({
        type: "setQuestionsModel/postData",
        apiUrl: "postDistributionRename",
        payload: {
          item_id: editItem?.id,
          new_title: values?.doc_name,
          item_type: editItem?.published_to_class ? "class" : "library",
        },
      });
      if (code == 200) {
        // getDataList();
        props?.getDataList?.();
        message.success("操作成功");
        setEditItem({});
        setIsModalVisible(false);
      }
    },
    { manual: true },
  );

  // 弹窗取消
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const statusComponents = (item: any) => {
    if (item?.published_to_class) {
      return <div className="status_components_css_publish">已发布</div>;
    }
    return <div className="status_components_css_no_publish">未发布</div>;
  };

  return (
    <div className="check_topic_left_css_right_content_content">
      {dataList?.length > 0 &&
        dataList?.map((item: any) => (
          <div
            key={item.id}
            className={
              active == item?.id
                ? "card-content-item-active"
                : "card-content-item"
            }
            onClick={() => {
              getRowFn(item);
            }}
          >
            {/* {statusComponents(item)} */}
            <div
              className="card-content-item-body"
            // onClick={() => props?.onClickView(item)}
            >
              <Image
                preview={false}
                src={formatStaticUrl(item?.thumbnail_url)}
                fallback={require("@/assets/customizehomework.png")}
              // fallback="data:image/png;base64,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"
              />
            </div>
            <div className="card-content-item-footer">
              {/* <ZYIcon type={"pdf-color"} style={{ fontSize: 24 }} /> */}
              <div className="title" title={item.name}>
                {handleName(item.name)}
              </div>
              <div className="desc">
                <div>
                  <span>{item?.className} · </span>
                  {
                    item?.startTime && (
                      <span> {dayjs(item?.startTime).format("HH:mm")}发布</span>
                    )
                  }

                </div>
                {/* <Dropdown
                  placement="bottom"
                  overlayClassName="menu-icon"
                  menu={{
                    items: item?.published_to_class
                      ? menuItemsPublish
                      : menuItemsNoPublish,
                    onClick: (e: any) => menuClick(e, item),
                  }}
                >
                  <Button type="text" size="small" icon={<MoreOutlined />} />
                </Dropdown> */}
              </div>
            </div>
          </div>
        ))}
      {/* 重命名 Modal */}
      <Modal
        title={"文件重命名"}
        open={isModalVisible}
        destroyOnHidden={true}
        confirmLoading={loading}
        onOk={async () => {
          const v = await form.validateFields();
          await run(v);
        }}
        onCancel={() => handleCancel()}
      >
        <Form form={form} layout="vertical" initialValues={{}}>
          <Form.Item
            name="doc_name"
            label="名称"
            rules={[{ required: true, message: "请输入名称" }]}
          >
            <Input placeholder="请输入名称" showCount maxLength={50} />
          </Form.Item>
        </Form>
      </Modal>
      {contextHolder}
      {dataList?.length == 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
    </div>
  );
};
export default connect((state: any) => ({
  authModel: state.authModel,
  commonModel: state.commonModel,
}))(App);
