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
import { useState, useEffect, useRef, useImperativeHandle } from "react";
import { connect, useDispatch, useRequest, useLocation } from "umi";
import { ZYIcon } from "@/components";
import { deepCopy, handleName } from "@/utils";
import UploadFile from "./UploadFile";
import Card from "./Card";
import Drawer from "./Drawer";
import RefModal from "@/pages/KGDesc/components/RefModal";
import { useTeacherContext } from '@/components/LayoutSider';

import "./index.less";

const GraphCard = (props: any) => {
  const {
    // showCheck = true,
    onRef,
    showType = "checkbox", //radio / checkbox
    multiple = true, //radio / checkbox
    showUploadFile = true,
    options = [
      { label: "全部", value: "全部" },
      { label: "教材", value: "教材" },
      { label: "文献", value: "文献" },
      { label: "参考书", value: "参考书" },
    ],
    isdisabled = false, // 是否禁止点击
    editPage = false, // 填写页码
    showDropdown = true,
    clickDrawer = false, //点击展开详情
    fetchListUrlKey = "docLabelListUrl", // 教程列表
    fetchFileUrl = "/kb_docs/upload_label_docs", // 上传文件接口
    defaultCheck = false, //是否默认全选
    curSubject,
    showEdit = true, // 是否显示编辑按钮
  } = props;

  const dispatch = useDispatch();
  // const { search } = useLocation();
  // const searchParams = new URLSearchParams(search);
  // const courseId = searchParams.get("courseId"); // 课程id
  const [context, contextLoading] = useTeacherContext()
  const courseId = context?.course_id
  const uploadRef = useRef<any>(null);
  const sfRef = useRef<any>(null);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const [activeLabel, setActiveLabel] = useState("全部"); //当前 tag
  const [tagList, setTagList] = useState([]); // 所有tag
  const [dataList, setDataList] = useState<any>([]); // 数据列表
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗是否显示
  const [editItem, setEditItem] = useState<any>({}); // 编辑的文件
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [rowDrawer, setRowDrawer] = useState({});
  const [loadingA, setLoadingA] = useState<any>(false);
  const [editPageA, setEditPageA] = useState<any>(editPage);

  useEffect(() => {
    if (contextLoading || !courseId) return;
    initData();
  }, [contextLoading, courseId]);

  //   useEffect(() => {
  //   getDataList();
  // }, [activeLabel]);

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    getDoc: async (param = {}) => {
      await getTagList();
      await getDataList(param);
    },
  }));

  const initData = async () => {
    setActiveLabel("全部");
    await getTagList();
    await getDataList();
  };

  const getTagList = async () => {
    const { code, data = [] }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "docUnEmptyLabelUrl",
      payload: {
        space_id: courseId,
      },
    });
    let tmpTag = ["全部"];
    if (code == 200 && data.length > 0) {

      tmpTag.push(...data);
    }
    console.log(tmpTag);

    setTagList(tmpTag);
  };

  // 处理全部
  const getAllTag = () => {

    if (activeLabel == "全部") {
      return props?.options?.map?.((item: any) => item.value).concat(["其他"]);
    }
    return [activeLabel];
  };



  // 文件选中回调
  const onChangeCheck = (item: any, index: any) => {
    const { __checked } = item;
    dataList[index]["__checked"] = !__checked;
    const newData = deepCopy(dataList);
    setDataList(newData);
    let selectData = newData?.filter((item: any) => item.__checked);
    setTimeout(() => {
      props?.onChangeCheck?.(dataList[index], selectData, newData); // 文件选择中回调
    }, 100);
  };

  // 获取数据列表
  const getDataList = async (param?: any) => {
    setLoadingA(true);
    setDataList([]);
    const payload = {
      space_id: courseId,
      labels: getAllTag(),
      button_type: 2,
      page: 1,
      page_size: 130,
      ...param,
    };

    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: fetchListUrlKey || "docLabelListUrl",
      payload,
    });
    if (code == 200) {
      let arr = data?.list?.map((item: any) => {
        const { progress, total_progress } = item;
        return {
          ...item,
          __checked: false, //默认是否选中
          __disabled: progress !== total_progress, // 是否可以选择
        };
      });
      let checkRow = [];
      if (arr.length > 0) {
        arr[0]["__checked"] = defaultCheck; // //默认是否选中
        checkRow.push(arr[0]);
      }
      setDataList(arr || []);
      props?.onLoadDoc?.(checkRow, activeLabel);
    }

    setLoadingA(false);
  };

  // icon菜单点击事件
  const menuClick = (e: any, item: any) => {
    e.domEvent.stopPropagation();
    if (e.key === "rename") {
      // 把item 中的 item?.doc_name 变成 item?.doc_name 去掉后缀名
      if (showEdit) {
        setIsModalVisible(true);
        setEditItem(item);
        form.setFieldsValue({
          doc_name: handleName(item?.doc_name).name,
        });

      } else {
        const { name } = handleName(item?.doc_name);
        sfRef?.current?.showModal?.("edit", { ...item, name });
      }


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
      getTagList(); // 删除后重新获取标签
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
    await getDataList(); // 获取当前tag下数据
    await getTagList();
  };

  // 切换 tab 标签
  const onClickTab = async (param: any) => {
    let { label, value } = param;
    setActiveLabel(label);
    let payload = { labels: [value] };
    if (label == "全部") {
      //  全部特殊处理 在后面加上 "其他" 标签
      payload["labels"] = props?.options?.map((item: any) =>item.value).concat(["其他"])
    }
    await getDataList(payload);
  };

  // 过滤当前tag
  const filterTag = () => {
    const { options } = props;
    // 查找taglist 中是否存在其他标签

    const userTagArrd = tagList?.filter((item: any) => {
      return tagList?.includes("其他");
    });
    const userTagArr = options?.filter((item: any) =>
      tagList.includes(item["value"]),
    );
    // 添加到末尾
    if (userTagArrd.length > 0) {
      userTagArr.push({ label: "其他", value: "其他" });
    }
    return userTagArr;
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
          {tagList?.length > 1 && (
            <div className="teach-list-filter">
              {filterTag()?.map((item: any) => {
                return (
                  <div
                    className={`filter_item ${item.label === activeLabel ? "active" : ""}`}
                    key={item.label}
                    onClick={() => onClickTab(item)}
                  >
                    {/* {item.value === "全部" && <ZYIcon type="quanbu" />} */}
                    {item.value === "全部"}
                    {item.label}
                  </div>
                );
              })}
            </div>
          )}

          {showUploadFile && (
            <>
              {dataList.length > 0 && (
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
                      添加资料
                    </Button>
                  </Dropdown>
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
              onChangeCheck={onChangeCheck}
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
                description={
                  <>
                    <p style={{ color: "#646E8B" }}>暂无资源</p>
                  </>
                }
                image={require("@/assets/courseEmpty.png")}
                imageStyle={{ width: 80, height: 48, margin: "0 auto 10px" }}
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
                      添加资料
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
                    添加资料
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

      <RefModal onRef={sfRef} onLoadTable={onFinish} />
    </div>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
  teachSourceModel: state.teachSourceModel,
}))(GraphCard);
