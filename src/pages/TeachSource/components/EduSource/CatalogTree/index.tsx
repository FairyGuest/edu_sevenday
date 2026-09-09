import { useState, useEffect, useImperativeHandle } from "react";
import { connect, useDispatch, useRequest } from "umi";
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  Modal,
  Input,
  Radio,
  Skeleton,
  Tree,
  message,
  Tooltip,
} from "antd";
import { ZYIcon } from "@/components";
import { handleName } from "@/utils";

import "./index.less";

const menuItems = [
  { key: "rename", label: "重命名" },
  { key: "delete", label: <span style={{ color: "#EF4444" }}>删除</span> },
];

const CatalogTree = (props: any) => {
  const {
    courseId,
    onRef,
    queryParams,
    setQueryParams,
    getTagList,
    getDataList,
  } = props;
  const isDigitalCourse = window.location.pathname.includes('/source/share/detail');
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();

  const [isOpenTree, setIsOpenTree] = useState(true); // 目录树是否展开
  const [treeLoading, setTreeLoading] = useState(false); // 目录树加载状态
  const [catalogInfo, setCatalogInfo] = useState<any>({}); // 目录信息
  const [isModalVisible, setIsModalVisible] = useState(false); // 弹窗是否显示
  const [editCatalog, setEditCatalog] = useState<any>(null); // 编辑目录信息
  const [delOpen, setDelOpen] = useState(false); // 删除弹窗是否显示
  const [delData, setDelData] = useState<any>({}); // 删除弹窗数据
  const [isMoveDoc, setIsMoveDoc] = useState(true); // 目录内资料是否移动--0:否 1:是
  const [isDelSub, setIsDelSub] = useState<any>(null); // 删除子目录信息--0:否 1:是

  useEffect(() => {
    getCourseCatalog();
  }, [courseId]);

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    getCourseCatalog: () => getCourseCatalog(),
  }));

  // 获取目录信息
  const getCourseCatalog = async () => {
    setTreeLoading(true);
    const { code, data }: any = await dispatch({
      type: "teachSourceModel/getData",
      apiUrl: "getCourseCatalogUrl",
      payload: { space_id: courseId },
    });
    if (code == 200) {
      setCatalogInfo(data);
    }
    setTreeLoading(false);
  };
  // 添加按钮点击事件
  const onAddClick = (e: any, item: any) => {
    e.stopPropagation();
    item.type = "add";
    setIsModalVisible(true);
    setEditCatalog(item);
  };
  // 树菜单点击事件
  const onDropClick = (e: any, item: any) => {
    e.domEvent.stopPropagation();
    if (e.key === "rename") {
      item.type = "rename";
      setIsModalVisible(true);
      setEditCatalog(item);
      form.setFieldsValue({
        title: item?.title,
      });
    } else if (e.key === "delete") {
      delModel(item);
    }
  };
  // 删除弹窗逻辑
  const delModel = (item: any) => {
    if (item?.children?.length) {
      setDelOpen(true);
      setDelData(item);
    } else if (item?.children?.length === 0) {
      if (item?.doc_num) {
        setDelOpen(true);
        setDelData(item);
      } else {
        modal.confirm({
          title: "确定删除目录吗?",
          icon: (
            <span className="anticon">
              <ZYIcon type="shanchu1" style={{ color: "#EF4444" }} />
            </span>
          ),
          content: "删除后该目录将不可恢复",
          okButtonProps: {
            style: {
              backgroundColor: "#EF4444",
            },
          },
          okText: "删除",
          onOk() {
            delCourseCatalog(item);
          },
        });
      }
    }
  };
  // 复选框改变事件
  const onCheckboxChange = (e: any) => {
    setIsMoveDoc(e.target.checked);
  };
  // 子目录删除复选框改变事件
  const onRadioChange = (e: any) => {
    setIsDelSub(e.target.value);
  };
  // 取消删除目录
  const onCancelDel = () => {
    setDelOpen(false);
    setIsMoveDoc(true);
    setIsDelSub(null);
  };
  // 删除目录
  const delCourseCatalog = async (item: any) => {
    if (isDelSub === null && item?.children?.length > 0) {
      message.error("请选择是否删除子目录");
      return;
    }
    const { code, msg }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "deleteCourseCatalogUrl",
      payload: {
        id: item?.id,
        is_move_doc: item?.doc_num ? Number(isMoveDoc) : void 0,
        is_delete_subcatalog: item?.children?.length ? isDelSub : void 0,
      },
    });
    if (code == 200) {
      message.success(msg || "删除成功");
      getCourseCatalog();
      onCancelDel();
      if (!isMoveDoc || isDelSub) {
        getTagList();
        getDataList();
      }
    }
  };
  // 弹窗提交
  const { run, loading } = useRequest(
    async (values: { title: string }) => {
      // 编辑目录
      const queryObj: any = {
        apiUrl: "editCourseCatalogUrl",
        payload: {
          id: editCatalog?.id,
          title: values.title,
        },
      };
      // 添加目录
      if (editCatalog?.type === "add") {
        queryObj.apiUrl = "addCourseCatalogUrl";
        queryObj.payload = {
          space_id: courseId,
          title: values.title,
          parent_id: editCatalog?.id,
        };
      }

      const { code, data, msg }: any = await dispatch({
        type: "teachSourceModel/postData",
        ...queryObj,
      });
      if (code == 200) {
        message.success(msg || "操作成功");
        if (data?.id) {
          setQueryParams({ ...queryParams, catalog_id: data?.id });
        }
        form.resetFields();
        getCourseCatalog();
        setIsModalVisible(false);
      }
    },
    { manual: true },
  );
  // 弹窗取消
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // 生成目录树骨架屏
  const renderTreeSkeletons = () => {
    return Array.from({ length: 10 }).map((_, index) => (
      <Skeleton active key={`skeleton-${index}`} />
    ));
  };

  // 树节点选择
  const onTreeSelect = (selectedKeys: any) => {
    if (selectedKeys[0] && queryParams?.catalog_id !== selectedKeys[0]) {
      const query = { ...queryParams, catalog_id: selectedKeys[0] };
      setQueryParams(query);
      getTagList(selectedKeys[0]);
      getDataList(query);
    }
  };

  return (
    <>
      {!isOpenTree ? (
        <div className="catalog-close">
          <ZYIcon type="unfold" onClick={() => setIsOpenTree(true)} />
        </div>
      ) : (
        <div className="catalog">
          {treeLoading ? (
            renderTreeSkeletons()
          ) : (
            <>
              <div className="catalog-header">
                <div className="catalog-header-title">
                  <ZYIcon type="fold" onClick={() => setIsOpenTree(false)} />
                  {catalogInfo?.title}
                </div>
                {Boolean(catalogInfo?.is_master) && (
                  <div className="catalog-header-content">
                    <img src={catalogInfo?.thumb_url} alt="主教材图" />
                    <div className="content-right">
                      <div className="title">
                        {handleName(catalogInfo?.name).name}
                      </div>
                      <span>主教材</span>
                    </div>
                  </div>
                )}
                <div
                  className={`catalog-header-desc ${queryParams.catalog_id == "all" ? "active" : ""}`}
                  onClick={() => onTreeSelect(["all"])}
                >
                  <div className="desc-left">
                    <ZYIcon type="all-file" />
                    全部资料
                  </div>
                  <div className="desc-right">
                    {catalogInfo?.total} 个资料
                    <ZYIcon type="arrow-go" />
                  </div>
                </div>
              </div>
              <div className="catalog-content">
                <div className="catalog-content-title">
                  教学大纲
                  {/* 如果是数字课程则不展示+按钮 */}
                  {!catalogInfo?.is_master && !isDigitalCourse && (
                    <Button
                      type="text"
                      size="small"
                      icon={<ZYIcon type="jia" />}
                      onClick={(e) => onAddClick(e, {})}
                    />
                  )}
                </div>
                <div className="catalog-content-tree">
                  <Tree
                    blockNode
                    defaultExpandAll
                    style={{
                      height: `calc(100vh - 246px - ${catalogInfo?.is_master ? 83 : 0}px)`,
                    }}
                    treeData={catalogInfo?.catalog || []}
                    fieldNames={{ key: "id" }}
                    onSelect={onTreeSelect}
                    selectedKeys={[queryParams.catalog_id || ""]}
                    defaultSelectedKeys={[queryParams.catalog_id || ""]}
                    switcherIcon={
                      <span>
                        <ZYIcon type="xia" style={{ fontSize: 12 }} />
                      </span>
                    }
                    titleRender={(nodeData: any) => (
                      <>
                        <div className="tree_node_card">
                          <Tooltip title={nodeData.title}>
                            <div className="tree-node-title">
                              {nodeData?.title}
                            </div>
                          </Tooltip>
                          {nodeData?.doc_num > 0 && (
                            <div className="doc-num">
                              {nodeData?.doc_num} 个资料
                            </div>
                          )}
                        </div>

                        {/* 如果是数字课程则不展示+和更多按钮 */}
                        {!catalogInfo?.is_master && !isDigitalCourse && (
                          <div className="doc-menu">
                            <Button
                              type="text"
                              size="small"
                              icon={<ZYIcon type="jia" />}
                              onClick={(e) => onAddClick(e, nodeData)}
                            />
                            {nodeData?.catalog_type === 1 && (
                              <Dropdown
                                menu={{
                                  items: menuItems,
                                  onClick: (e) => onDropClick(e, nodeData),
                                }}
                                placement="bottomLeft"
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<ZYIcon type="more" />}
                                />
                              </Dropdown>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {contextHolder}

      {/* 删除 Modal */}
      <Modal
        className="del-modal"
        title={
          <>
            <ZYIcon type="shanchu1" className="del-modal-icon" />
            请确认删除范围和资料处理方式
          </>
        }
        width={480}
        closeIcon={null}
        open={delOpen}
        destroyOnHidden={true}
        footer={
          <div className="modal-footer">
            <Checkbox checked={isMoveDoc} onChange={onCheckboxChange}>
              将目录内资料保存至第1条目录
            </Checkbox>
            <div className="modal-footer-btn">
              <Button onClick={onCancelDel}>取消</Button>
              <Button
                type="primary"
                disabled={delData?.children?.length > 0 && isDelSub == null}
                onClick={() => delCourseCatalog(delData)}
                style={{ backgroundColor: "#EF4444" }}
              >
                删除
              </Button>
            </div>
          </div>
        }
      >
        <div className="model-content">
          <div className="model-content-desc">
            请谨慎操作，删除内容将不可恢复
          </div>
          {delData?.children?.length > 0 && (
            <Radio.Group value={isDelSub} onChange={onRadioChange}>
              <Radio value={0}>仅删除此目录</Radio>
              <Radio value={1}>删除此目录和它包含的所有子目录</Radio>
            </Radio.Group>
          )}
        </div>
      </Modal>
      {/* 重命名 Modal */}
      <Modal
        title={editCatalog?.type === "add" ? "新增目录" : "重命名目录"}
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
            name="title"
            label="目录名称"
            rules={[{ required: true, message: "请输入目录名称" }]}
          >
            <Input placeholder="请输入目录名称" showCount maxLength={50} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default connect((state: any) => ({
  teachSourceModel: state.teachSourceModel,
}))(CatalogTree);
