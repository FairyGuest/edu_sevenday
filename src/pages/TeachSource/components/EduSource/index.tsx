import {
  Empty,
  Form,
  Input,
  Tag,
  Modal,
  Dropdown,
  Button,
  Skeleton,
  Tooltip,
  message,
} from "antd";
import { SyncOutlined, PlusOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import { connect, useDispatch, useRequest, useLocation } from "umi";
import { ZYIcon } from "@/components";
import { handleName } from "@/utils";
import UploadFile from "./UploadFile";
import AudioVideoUploadFile from "./AudioVideoUploadFile";
import CatalogTree from "./CatalogTree";
import Card from "./Card";

import "./index.less";

// 定义上传分类
const items = [
  { label: "教材", key: "教材" },
  { label: "教学计划", key: "教学计划" },
  { label: "教案讲义", key: "讲义" },
  { label: "文献", key: "文献" },
  { label: "题库", key: "题库" },
  { label: "参考书", key: "参考书" },
  { label: "音视频", key: "音视频" },
  { label: "其他", key: "其他" },
];

const EduSource = (props: any) => {
  const dispatch = useDispatch();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const courseId = searchParams.get("courseId"); // 课程id
  const isDigitalCourse = window.location.pathname.includes('/source/share/detail'); // 是否是数字课程

  const uploadRef = useRef<any>(null);
  const audioVideoRef = useRef<any>(null);
  const cataloagTreeRef = useRef<any>(null);
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const [dataLoading, setDataLoading] = useState(false); // 加载状态
  const [labelList, setLabelList] = useState<
    { label: string; value: string }[]
  >([]);
  const [dataList, setDataList] = useState([]); // 数据列表
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗是否显示
  const [editItem, setEditItem] = useState<any>({}); // 编辑的文件
  const [queryParams, setQueryParams] = useState<any>({
    page: 1,
    page_size: 130,
    labels: "all",
    catalog_id: "all",
    space_id: courseId,
  }); // 查询参数

  useEffect(() => {
    const query = { labels: "all", catalog_id: "all", space_id: courseId };
    getTagList("all");
    getDataList(query);
    setQueryParams((prev: any) => ({ ...prev, ...query }));
  }, [courseId]);

  // 获取有数据的标签
  const getTagList = async (query?: any) => {
    const catalogId = query || queryParams.catalog_id;
    const { code, data = [] }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "docUnEmptyLabelUrl",
      payload: {
        space_id: courseId,
        catalog_id: catalogId === "all" ? void 0 : catalogId,
      },
    });
    if (code == 200) {
      if (!data.length) {
        setLabelList([]);
        setDataList([]);
        return;
      }
      const labelArr = data.map((label: any) => {
        return {
          label,
          value: label === "讲义" ? "教案讲义" : label,
        };
      });
      labelArr.unshift({ label: "all", value: "全部" });
      setLabelList(labelArr);
    }
  };
  // 获取数据列表
  const getDataList = async (param?: any) => {
    setDataLoading(true);
    const payload = { ...queryParams, ...param };
    const { code, data }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "docLabelListUrl",
      payload: {
        ...payload,
        catalog_id:
          payload?.catalog_id === "all" ? void 0 : payload?.catalog_id,
        labels: payload?.labels === "all" ? [] : [payload?.labels],
      },
    });
    if (code == 200) {
      setDataList(data?.list || []);
    }
    setDataLoading(false);
  };
  // label点击事件
  const onLabelClick = (label: any) => {
    const query = {
      ...queryParams,
      labels: label,
    };

    setQueryParams(query);
    getDataList(query);
  };
  // icon菜单点击事件
  const menuClick = (e: any, item: any) => {
    e.domEvent.stopPropagation();
    if (e.key === "rename") {
      setIsModalVisible(true);
      setEditItem(item);
      form.setFieldsValue({
        doc_name: handleName(item.doc_name).name,
      });
    } else if (e.key === "delete") {
      modal.confirm({
        title: (
          <div>
            <span>
              你确定删除{item?.file_type === "graph" ? "图谱" : "文件"}「
              {item?.doc_name}」吗?
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
          delKbDocs(item);
        },
      });
    } else if (e.key === "publish") {
      publishGraph({ id: item?.id, is_publish: 1 });
    } else if (e.key === "down") {
      publishGraph({ id: item?.id, is_publish: 0 });
    } else if (e.key === "edit") {
      alert("编辑页面跳转,开发中。。。");
    }
  };

  // 弹窗取消
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  // 弹窗提交
  const { run, loading } = useRequest(
    async (values) => {
      const reqObj: { apiUrl?: string; payload?: any } = {};
      if (editItem?.file_type === "graph") {
        reqObj.apiUrl = "postGraphEditUrl";
        reqObj.payload = {
          id: editItem?.id,
          graph_name: values.doc_name,
        };
      } else {
        reqObj.apiUrl = "docLabelEditUrl";
        reqObj.payload = {
          doc_id: editItem?.id,
          doc_name: values.doc_name,
        };
      }

      const { code }: any = await dispatch({
        type: "teachSourceModel/postData",
        ...reqObj,
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
  const delKbDocs = async (params: any) => {
    const reqObj: { apiUrl?: string; payload?: any } = {};
    if (params?.file_type === "graph") {
      reqObj.apiUrl = "postGraphDeleteUrl";
      reqObj.payload = { id: params?.id };
    } else {
      reqObj.apiUrl = "docLabelDelUrl";
      reqObj.payload = { doc_id: params?.id };
    }

    const { code }: any = await dispatch({
      type: "teachSourceModel/postData",
      ...reqObj,
    });
    if (code == 200) {
      message.success(
        `${params?.file_type === "graph" ? "图谱" : "文件"}删除成功！`,
      );
      onFinish();
    }
  };
  // 发布、下架图谱
  const publishGraph = async (param: any) => {
    const { code, msg }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "postGraphPublishUrl",
      payload: param,
    });
    if (code == 200) {
      message.success(msg || "操作成功");
      onFinish();
    }
  };
  // 查看文档
  const onClickView = (item: any) => {
    // if (
    //   item?.progress !== item?.total_progress &&
    //   item?.file_type != "mp3" &&
    //   item?.file_type != "mp4"
    // ) {
    //   message.warning("请等待文件解析完成");
    //   return;
    // }
    props?.onCheckNode?.({ category: "file", ...item });
  };
  // 检查进度
  const checkProgress = (record: any) => {
    const { progress, total_progress, file_type } = record;
    if (file_type == "mp3" || file_type == "mp4") {
      return;
    }
    if (progress == -1) {
      return (
        <Tooltip
          classNames={{root: "progress-tip"}}
          title="文件上传成功，可查看，知识图谱解析失败"
        >
          <Tag color="error">解析失败</Tag>
        </Tooltip>
      );
    } else if (progress !== total_progress) {
      return (
        <Tooltip
          classNames={{root: "progress-tip"}}
          title="文件上传成功，可查看，知识图谱解析中"
        >
          <Tag icon={<SyncOutlined spin />} color="processing">
            解析中
          </Tag>
        </Tooltip>
      );
    }
  };
  // 上传标签点击
  const onDropClick = (e: any) => {
    if (e.key == "音视频") {
      audioVideoRef.current?.onUploadOpen(e.key);
    } else {
      uploadRef.current?.onUploadOpen(e.key);
    }
  };
  // 上传完成回调
  const onFinish = () => {
    getDataList();
    getTagList();
    cataloagTreeRef.current?.getCourseCatalog();
  };
  // 生成骨架屏列表
  const renderSkeletons = () => {
    return Array.from({ length: 10 }).map((_, index) => (
      <div className="card-content-item" key={`skeleton-${index}`}>
        <div className="card-content-item-body">
          <Skeleton.Node active />
        </div>
        <div className="card-content-item-footer" />
      </div>
    ));
  };

  return (
    <div className="edu-content">
      <CatalogTree
        onRef={cataloagTreeRef}
        courseId={courseId}
        queryParams={queryParams}
        setQueryParams={setQueryParams}
        getTagList={getTagList}
        getDataList={getDataList}
      />
      <div className="edu-source">
        <div className="edu-source-header">
          <div className="edu-source-filter">
            {labelList.map((item: any) => {
              return (
                <div
                  className={`filter_item ${item.label === queryParams?.labels ? "active" : ""}`}
                  key={item.label}
                  onClick={() => onLabelClick(item.label)}
                >
                  {item.value}
                </div>
              );
            })}
          </div>
          {!isDigitalCourse && (
            <Dropdown
              menu={{ items, onClick: onDropClick }}
              placement="bottomRight"
            >
              <Button type="primary" icon={<PlusOutlined />}>
                添加资料
              </Button>
            </Dropdown>
          )}

          {/* 音视频  */}
          <AudioVideoUploadFile
            onRef={audioVideoRef}
            courseId={courseId}
            catalogId={queryParams.catalog_id}
            onFinish={onFinish}
          />

          <UploadFile
            onRef={uploadRef}
            courseId={courseId}
            catalogId={queryParams.catalog_id}
            onFinish={onFinish}
          />
        </div>

        <div className="edu-source-content">
          {dataLoading && (
            <div className="card-content">{renderSkeletons()}</div>
          )}
          {!dataLoading && dataList.length > 0 ? (
            <Card
              dataList={dataList}
              checkProgress={checkProgress}
              onClickView={onClickView}
              menuClick={menuClick}
            />
          ) : (
            <div className="empty-content">
              <Empty
                description={
                  <>
                    <p>还没有课程相关资料</p>
                    <p>点击上传文档吧</p>
                  </>
                }
                image={require("@/assets/courseEmpty.png")}
                styles={{
                  image: { width: 80, height: "auto", margin: "0 auto 10px" },
                }}
              />
            </div>
          )}
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
      </div>
    </div>
  );
};

export default connect((state: any) => ({
  teachSourceModel: state.teachSourceModel,
}))(EduSource);
