import {
  Empty,
  Form,
  Input,
  Tag,
  message,
  Modal,
  Dropdown,
  Button,
  Skeleton,
} from "antd";
import { SyncOutlined, PlusOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import { connect, useDispatch, useRequest, useLocation } from "umi";
import { ZYIcon } from "@/components";
import { useTeacherContext } from '@/components/LayoutSider';
import { handleName } from "@/utils";
import UploadFile from "./UploadFile";
import Card from "./Card";
import Drawer from "./Drawer";

import "./index.less";

// 定义分类
const optionsList = [
  { label: "全部", value: "全部" },
  { label: "教材", value: "教材" },
  { label: "教学计划", value: "教学计划" },
  // { label: "教案讲义", value: "教案讲义" },
  { label: "文献", value: "文献" },
  { label: "题库", value: "题库" },
  { label: "参考书", value: "参考书" },
  // { label: "音视频", value: "音视频" },
  { label: "其他", value: "其他" },
];
const EduSource = (props: any) => {
  const {
    // showCheck = true,
    showType = "checkbox", //radio / checkbox
    multiple = true, //radio / checkbox
    showUploadFile = true,
    options = [
      { label: "全部", value: "全部" },
      { label: "教材", value: "教材" },
      { label: "教学计划", value: "教学计划" },
      // { label: "讲义", value: "教案讲义" },
      { label: "文献", value: "文献" },
      { label: "题库", value: "题库" },
      { label: "参考书", value: "参考书" },
      // { label: "音视频", value: "音视频" },
      // { label: "其他", value: "其他" },
    ],
    isdisabled = false, // 是否禁止点击
    upload, // 更新
    editPage = false, // 填写页码
    showDropdown = true,
    clickDrawer = false, //点击展开详情
    datalistindex = () => {}, //课程回调
    radioShowText = true,
    fetchListUrlKey = "docLabelListUrl", // 教程列表
    fetchFileUrl = "/kb_docs/upload_label_docs", // 文件上传 API
    defaultCheck = false, //是否默认全选
  } = props;

  const dispatch = useDispatch();
  // const { search } = useLocation();
  // const searchParams = new URLSearchParams(search);
  // const courseId = searchParams.get("courseId"); // 课程id
  const [context, contextLoading] = useTeacherContext()
  const courseId = context?.course_id
  const [labelList, setLabelList] = useState<
    { label: string; value: string }[]
  >([]);

  const uploadRef = useRef<any>(null);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const [activeLabel, setActiveLabel] = useState("全部");
  const [dataList, setDataList] = useState<any>([]); // 数据列表
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗是否显示
  const [editItem, setEditItem] = useState<any>({}); // 编辑的文件
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [rowDrawer, setRowDrawer] = useState({});
  const [loadingA, setLoadingA] = useState<any>(false);
  const [editPageA, setEditPageA] = useState<any>(editPage);

  useEffect(() => {
    getDataList();
  }, [activeLabel]);

  useEffect(() => {
    if (!upload) return;
    getDataList();
  }, [upload]);

  useEffect(() => {
    if (contextLoading || !courseId) return;
    setActiveLabel("全部");
    getTagList(); // 获取有数据的标签
    setDataList([]);
    // getDataList();
  }, [contextLoading, courseId]);

  useEffect(() => {
    if (labelList?.length > 0) {
      getDataList();
    }
  }, [labelList]);

  // 获取有数据的标签
  const getTagList = async () => {
    const { code, data = [] }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "docUnEmptyLabelUrl",
      payload: {
        space_id: courseId,
      },
    });
    if (code == 200) {
      if (!data.length) {
        setLabelList([]);
        return;
      }
      let labelArr: any = [];
      data.map((label: any) => {
        let flag_row = options?.find((val: any) => {
          return label == val?.label;
        });
        if (flag_row) {
          labelArr?.push(flag_row);
        }
      });
      setLabelList([{ label: "全部", value: "全部" }, ...labelArr]);
    }
  };

  // 处理全部
  const clickActiveLabel = () => {
    if (activeLabel === "全部" && labelList?.length == optionsList?.length) {
      return [];
    }
    if (activeLabel == "全部" && labelList?.length != optionsList?.length) {
      let arr = labelList?.map((item: any) => {
        return item?.label;
      });
      return arr;
    }
    return [activeLabel];
  };

  // 获取数据列表
  const getDataList = async (param?: any) => {
    setLoadingA(true);
    const payload = {
      space_id: courseId,
      labels: clickActiveLabel(),
      button_type: 2,
      page: 1,
      page_size: 130,
      // is_done: 1,
      ...param,
    };
    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: fetchListUrlKey || "docLabelListUrl",
      payload,
    });

    if (code == 200) {
      let arr = data?.list?.map((item: any) => {
        return {
          ...item,
          checked: false,
          disabled: false,
        };
      });
      setLoadingA(false);
      setDataList(arr || []);
      datalistindex(arr, activeLabel);
    }
    setLoadingA(false);
  };

  // icon菜单点击事件
  const menuClick = (e: any, item: any) => {
    e.domEvent.stopPropagation();
    if (e.key === "rename") {
      setIsModalVisible(true);
      setEditItem(item);
      form.setFieldsValue({
        doc_name: handleName(item?.doc_name).name,
      });
    } else if (e.key === "delete") {
      modal.confirm({
        title: (
          <div>
            <span>
              你确定删除文件
              <span style={{ marginLeft: "4px" }}>{item?.doc_name} 吗?</span>
            </span>
          </div>
        ),
        icon: (
          <span className="anticon">
            <ZYIcon type="shanchu1" style={{ color: "#EF4444" }} />
          </span>
        ),
        content: "",
        okButtonProps: {
          style: {
            backgroundColor: "red",
            color: "white",
          },
        },
        onOk() {
          delKbDocs({ doc_id: item?.id });
        },
      });
    }
  };

  // 弹窗取消
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  // 弹窗提交
  const { run, loading } = useRequest(
    async (values) => {
      const { code }: any = await dispatch({
        type: "setQuestionsModel/postData",
        apiUrl: "docLabelEditUrl",
        payload: {
          doc_id: editItem?.id,
          ...values,
        },
      });
      if (code == 200) {
        getDataList();
        setEditItem({});
        setIsModalVisible(false);
      }
    },
    { manual: true },
  );

  // 删除文档
  const delKbDocs = async (param: any) => {
    const { code }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "docLabelDelUrl",
      payload: param,
    });
    if (code == 200) {
      getDataList();
    }
  };
  // 查看文档
  const onClickView = (item: any) => {
    // if (item?.progress !== item?.total_progress) {
    //   message.warning("请等待文件解析完成");
    //   return;
    // }
    setEditPageA(false);
    setRowDrawer(item);
    if (clickDrawer) {
      setOpenDrawer(!openDrawer);
    }
  };
  // 检查进度
  const checkProgress = (record: any) => {
    const { progress, total_progress } = record;
    if (progress == -1) {
      return <Tag color="error">解析失败</Tag>;
    } else if (progress !== total_progress) {
      return (
        <Tag icon={<SyncOutlined spin />} color="processing">
          解析中
        </Tag>
      );
    }
  };
  // 上传标签展示
  const dropMenu = () => {
    return options.slice(1).map((item) => {
      return {
        label: item.label,
        key: item.value,
        icon: <PlusOutlined />,
      };
    });
  };
  // 标签点击
  const onDropClick = (e: any) => {
    uploadRef.current.onUploadOpen(e.key);
  };

  // Drawer 取消
  const cancelDrawer = () => {
    console.log("Drawer取消");
    setOpenDrawer(false);
    props?.cancelDrawer?.();
  };

  // 上传完成回调
  const onFinish = async () => {
    await getTagList();
    await getDataList({ labels: [activeLabel] }); // 获取当前tag下数据
  };

  // 切换 tab 标签
  const onClickTab = async (param: any) => {
    let labels = param.label;
    setActiveLabel(labels);
    await getDataList({ labels: [labels] });
  };

  // 生成骨架屏列表
  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <div className="card-content-item" key={`skeleton-${index}`}>
        <div className="card-content-item-body">
          <Skeleton.Node active />
        </div>
        <div className="card-content-item-footer" />
      </div>
    ));
  };

  return (
    <div className="edu_source">
      {isdisabled && <div className="edu_source_mask_layer"></div>}
      <div className="teach-list">
        <div>
          <div className="teach-list-filter-css">
            {labelList?.map?.((item) => {
              return (
                <div
                  className={`filter_item ${item.label === activeLabel ? "active" : ""}`}
                  key={item.label}
                  onClick={() => onClickTab(item)}
                >
                  {/* {item.value === "全部" && <ZYIcon type="quanbu" />} */}
                  {item.value === "全部"}
                  {item.value}
                </div>
              );
            })}
          </div>

          {showUploadFile && (
            <>
              {showDropdown && dataList.length > 0 && (
                <div className="teach-list-header">
                  <Dropdown
                    menu={{ items: dropMenu(), onClick: onDropClick }}
                    placement="bottomRight"
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      style={{ width: "100%" }}
                    >
                      上传教材
                    </Button>
                  </Dropdown>
                </div>
              )}
              {!showDropdown && dataList.length > 0 && (
                <div className="teach-list-header">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ width: "100%" }}
                    onClick={() => {
                      uploadRef.current?.onUploadOpen("教材");
                    }}
                  >
                    上传教材
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        <div className="teach-list-content">
          {dataList?.length > 0 && !loadingA && (
            <Card
              {...props}
              dataList={dataList}
              checkProgress={checkProgress}
              onClickView={onClickView}
              menuClick={menuClick}
              // onChangeCheck={onChangeCheck}
              showType={showType ? showType : ""}
              checkFn={(arr: any) => {
                props?.checkFn?.(arr);
              }}
              editPageA={editPageA}
              changeEditPageA={() => {
                setEditPageA(true);
              }}
              openDrawerFn={(item: any) => {
                setRowDrawer(item);
                setOpenDrawer(true);
              }}
            />
          )}
          {dataList.length == 0 && !loadingA && (
            <div className="empty-content">
              <Empty
                description={<p style={{ color: "#646E8B" }}>暂无资源</p>}
                image={require("@/assets/courseEmpty.png")}
                styles={{
                  image: { width: 80, height: "auto", margin: "0 auto 10px" },
                }}
              />
              {showDropdown && showUploadFile && (
                <div
                  className="teach-list-header"
                  style={{ marginTop: "12px" }}
                >
                  <Dropdown
                    menu={{ items: dropMenu(), onClick: onDropClick }}
                    placement="bottomRight"
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      style={{ width: "100%" }}
                    >
                      上传教材
                    </Button>
                  </Dropdown>
                </div>
              )}
              {!showDropdown && showUploadFile && (
                <div className="teach-list-header">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ width: "100%" }}
                    onClick={() => {
                      uploadRef.current?.onUploadOpen("教材");
                    }}
                  >
                    上传教材
                  </Button>
                </div>
              )}
            </div>
          )}
          {loadingA && <div className="card-content">{renderSkeletons()}</div>}
        </div>

        {contextHolder}
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
              <Input placeholder="请输入名称" showCount maxLength={20} />
            </Form.Item>
          </Form>
        </Modal>
        {openDrawer && (
          <Drawer
            {...props}
            rowDrawer={rowDrawer}
            openDrawer={openDrawer}
            editPage={editPageA}
            cancel={cancelDrawer}
          />
        )}
      </div>

      {/* 文件上传 */}
      <UploadFile
        {...props}
        onRef={uploadRef}
        courseId={courseId}
        onFinish={onFinish}
        onUploadSuccess={props?.onUploadSuccess}
        showType={showType}
        multiple={multiple}
      />
    </div>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
}))(EduSource);
