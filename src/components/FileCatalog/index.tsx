import { useEffect, useState, useMemo, createContext } from "react";
import { connect, useDispatch, useRequest } from "umi";
import {
  Button,
  Dropdown,
  Form,
  Tree,
  Empty,
  Input,
  InputNumber,
  Skeleton,
  Tooltip,
  Modal,
  message,
} from "antd";
import { ZYIcon } from "@/components";

import "./index.less";

const menuItems = [
  { key: "rename", label: "编辑" },
  // { key: "up", label: "目录升一层级" },
  // { key: "down", label: "目录降一层级" },
];

const FileCatalog = (props: any) => {
  const {
    fileInfo,
    docUrl,
    page,
    bookInfo,
    checkType,
    setType,
    onLeafClick,
    onTreeCheck,
    checkItems,
  } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [formEdit] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();

  const [dataType, setDataType] = useState(1); // 树数据类型--1:保存数据 0:解析数据
  const [loading, setLoading] = useState(false); // 目录树加载状态
  const [parsing, setParsing] = useState(false); // 目录解析状态
  const [editing, setEditing] = useState(false); // 目录编辑状态
  const [adding, setAdding] = useState(false); // 目录新增状态
  const [treeData, setTreeData] = useState([]); // 目录树数据
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]); // 选中节点
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]); //  回显选中节点
  const [editModal, setEditModal] = useState(false); // 编辑目录弹窗状态
  const [editTreeNode, setEditTreeNode] = useState({} as any); // 编辑目录树节点

  // 拍平后所有树节点
  const allTreeNodes = useMemo(() => {
    const flattenTree = (tree: any) => {
      const result: any[] = []; // 目录树拍平
      const dfs = (nodes: any) => {
        for (const node of nodes) {
          const { children, ...rest } = node;
          result.push(rest); // 只保留非 children 的属性
          if (children && children.length > 0) {
            dfs(children);
          }
        }
      };
      dfs(tree);
      return result;
    };
    return flattenTree(treeData);
  }, [treeData]);

  useEffect(() => {
    getTreeData();
    if (location.pathname.includes("/course/detail") && !fileInfo?.is_master_doc) {
      getParsing();
    }
  }, [fileInfo]);

  // 回显选中节点(教案出题)
  useEffect(() => {
    let arr = checkItems?.map((item: any) => item?.id);
    setCheckedKeys(arr);
  }, [checkItems]);

  // pdf滚动时，回显选中节点
  useEffect(() => {
    const treeKey =
      allTreeNodes.find((item: any) => item?.page === page + 1)?.id || "";
    if (treeKey) {
      setSelectedKeys([treeKey]);
    }
  }, [page]);

  // 获取目录树数据
  const getTreeData = async () => {
    setLoading(true);
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getDocCatalogUrl",
      payload: { doc_id: fileInfo?.id },
    });
    if (code == 200) {
      setTreeData(data);
      setDataType(1);
    }

    setLoading(false);
  };
  // 目录解析状态
  const getParsing = async () => {
    setParsing(true);
    const { code, data }: any = await dispatch({
      type: "teachSourceModel/getData",
      apiUrl: "getDocCatalogRes",
      payload: { doc_id: fileInfo?.id },
    });
    if (code == 200) {
      const { catalog, status_code } = data || {};
      // 解析中才展示刷新提示
      // if (status_code !== 100) {
      //   message.destroy("refreshParsing");
      // }
      switch (status_code) {
        case 100:
          setParsing(true);
          message.loading({
            key: "refreshParsing",
            content: "正在解析中，请稍后...",
            className: "refresh-parsing",
          });
          break;
        case 200:
          message.success({
            key: "successParsing",
            content: "目录已生成，请核对编辑后保存目录",
          });
          setTimeout(() => {
            setTreeData(() => catalog);
            setDataType(0);
            setParsing(false);
            setAdding(false);
            setEditing(true);
          }, 10);
          break;
        case 250:
          modal.error({
            width: 480,
            title: "目录解析失败",
            content: "所选的目录未识别到页码，无法完成解析。",
            okText: "好的",
            onOk: () => {
              setParsing(false);
              setAdding(false);
              deleteCatalog();
            },
          });
          break;
        case 300:
          modal.error({
            width: 480,
            title: "目录解析失败",
            content: "所选页码范围内未识别到目录，请重新填写正确的页码范围。",
            footer: (
              <div className="ant-modal-confirm-btns">
                <Button
                  onClick={() => {
                    setEditing(false);
                    setAdding(false);
                    setParsing(false);
                    deleteCatalog();
                    Modal.destroyAll();
                  }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    setAdding(true);
                    setParsing(false);
                    deleteCatalog();
                    Modal.destroyAll();
                  }}
                >
                  重新填写
                </Button>
              </div>
            ),
          });
          break;
        case 500:
          message.error({
            key: "errorParsing",
            content: "目录解析失败，请稍后重试",
          });
          setEditing(true);
          setParsing(false);
          deleteCatalog();
          break;
        default:
          setParsing(false);
          break;
      }
    } else if (code == 500) {
      setParsing(false);
    }
  };
  // 提交目录解析
  const onFinish = () => {
    form.validateFields().then(async (values) => {
      setParsing(true);
      const { code, status }: any = await dispatch({
        type: "teachSourceModel/postData",
        apiUrl: "addDocToCatalogUrl",
        payload: {
          doc_id: fileInfo?.id,
          doc_url: docUrl,
          ...values,
        },
      });

      if (code === 200 && status === "success") {
        getParsing();
      }
      setParsing(false);
    });
  };
  // 取消目录解析
  const cancelCatalogParsing = () => {
    setAdding(false);
    form.resetFields();
  };
  // 树菜单点击事件
  const onDropClick = (e: any, item: any) => {
    e.domEvent.stopPropagation();
    if (e.key === "rename") {
      setEditModal(true);
      setEditTreeNode(item);
      formEdit.setFieldsValue(item);
    } else {
      alert("开发中...");
    }
  };

  // form 提交目录编辑
  const { run, loading: formLoading } = useRequest(async (values: any) => {
    setTreeData(updateTreeNode(treeData, { ...editTreeNode, ...values }));
    setEditModal(false);
  });
  // 树节点根据id替换
  const updateTreeNode = (treeData: any, newNode: any) => {
    return treeData.map((node: any) => {
      if (node.id === newNode.id) {
        return { ...newNode }; // 找到目标，整体换掉
      }
      if (node.children?.length) {
        return {
          ...node,
          children: updateTreeNode(node.children, newNode),
        };
      }
      return node;
    });
  };
  // 删除目录
  const onDeleCatalog = (values: any) => {
    modal.confirm({
      title: "是否清空目录？",
      content: "清空目录后将无法恢复，需要重新生成目录。",
      icon: (
        <span className="anticon">
          <ZYIcon type="shanchu1" style={{ color: "#EF4444" }} />
        </span>
      ),
      okText: "清空",
      okButtonProps: {
        style: {
          backgroundColor: "#EF4444",
        },
      },
      onOk() {
        deleteCatalog();
      },
    });
  };
  // 确认删除目录
  const deleteCatalog = async () => {
    setLoading(true);
    const { code, msg }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "clearDocCatalogUrl",
      payload: { doc_id: fileInfo?.id },
    });
    if (code === 200) {
      message.success(msg || "删除成功");
      setTreeData([]);
    }
    setLoading(false);
  };
  // 保存目录
  const saveCatalog = async () => {
    setEditing(false);
    setLoading(true);
    const { code, msg }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "editDocCatalogUrl",
      payload: {
        doc_id: fileInfo?.id,
        catalog: treeData,
      },
    });
    if (code === 200) {
      message.success(msg || "保存成功");
      getTreeData();
    }
    setLoading(false);
  };
  // 取消保存
  const cancelSave = () => {
    setEditing(false);
    // 取消保存时如果是解析数据状态，需要删除目录
    if (dataType === 0) {
      deleteCatalog();
    }
  };
  // 目录树骨架屏、加载动画
  const renderTreeSkeletons = () => {
    if (loading) {
      return (
        <div className="skeleton-box">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton active key={`skeleton-${index}`} />
          ))}
        </div>
      );
    }
    if (parsing) {
      return (
        <div className="empty-tree">
          <div className="parsing-box">
            <span className="anticon-spin">
              <ZYIcon type="load-color" />
            </span>
            <p>目录解析中</p>
            <Button onClick={getParsing}>刷新看看</Button>
          </div>
        </div>
      );
    }
  };
  // 目录顶部渲染
  const renderTreeTop = () => {
    if (editing) {
      return (
        <>
          目录
          <div className="file-catalog-header-menu">
            {treeData.length > 0 && (
              <Tooltip title="删除" placement="top">
                <div className="menu-btn" onClick={onDeleCatalog}>
                  <ZYIcon type="shanchu" />
                </div>
              </Tooltip>
            )}
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="file-catalog-header-menu">
            <div className="menu-btn active">
              <ZYIcon type="list" />
            </div>
            <div className="menu-btn" onClick={() => setType("abbr")}>
              <ZYIcon type="outlined" />
            </div>
          </div>

          {treeData.length > 0 && !fileInfo?.is_master_doc && editing && (
            <Tooltip title="删除" placement="top">
              <div className="menu-btn" onClick={onDeleCatalog}>
                <ZYIcon type="shanchu" />
              </div>
            </Tooltip>
          )}
          {treeData.length > 0 &&
            !parsing &&
            !fileInfo?.is_master_doc &&
            location.pathname.includes("/course/detail") && (
              <Button
                className="btn-edit"
                size="small"
                autoInsertSpace={false}
                onClick={() => setEditing(true)}
              >
                编辑
              </Button>
            )}
        </>
      );
    }
  };

  // 目录树渲染
  const renderTree = () => {
    if (!loading && !parsing) {
      if (treeData.length > 0) {
        //  编辑树
        if (editing) {
          return (
            <>
              <Tree
                blockNode
                defaultExpandAll
                fieldNames={{ key: "id" }}
                treeData={treeData}
                style={{ height: `calc(100% - 40px)` }}
                switcherIcon={
                  <span>
                    <ZYIcon type="xia" style={{ fontSize: 12 }} />
                  </span>
                }
                onSelect={(selectedKeys: any, info: any) => {
                  setSelectedKeys(selectedKeys);
                  onLeafClick(info.node?.page - 1);
                }}
                titleRender={(nodeData: any) => (
                  <div className="tree-node-edit">
                    <Tooltip title={nodeData?.title}>
                      <div className="tree-node-title">{nodeData?.title}</div>
                    </Tooltip>
                    <span className="menu_page" style={{ color: "#94A0B8" }}>
                      {nodeData?.page}
                    </span>
                    <div className="tree-node-btns">
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
                    </div>
                  </div>
                )}
              />
              <div className="tree-edit-btns">
                <Button onClick={cancelSave}>取消</Button>
                <Button
                  type="primary"
                  style={{ marginLeft: 8 }}
                  onClick={saveCatalog}
                >
                  保存
                </Button>
              </div>
            </>
          );
        }

        // 预览
        return (
          <Tree
            checkable={checkType}
            blockNode={true}
            defaultExpandAll
            fieldNames={{ key: "id" }}
            treeData={treeData}
            selectedKeys={selectedKeys} // 选中节点回调
            switcherIcon={
              <span>
                <ZYIcon type="xia" style={{ fontSize: 12 }} />
              </span>
            }
            onSelect={(selectedKeys: any, info: any) => {
              if (selectedKeys.length > 0) {
                setSelectedKeys(selectedKeys);
              }
              onLeafClick(info.node?.page - 1);
            }}
            checkedKeys={checkedKeys} // 选中节点回调
            onCheck={onTreeCheck}
            titleRender={(nodeData: any) => (
              <>
                <Tooltip title={nodeData?.title}>
                  <div className="tree-node-title">{nodeData?.title}</div>
                </Tooltip>
                <span className="menu_page" style={{ color: "#94A0B8" }}>
                  {nodeData?.page}
                </span>
              </>
            )}
          />
        );
      } else {
        if (!adding) {
          return (
            <div className="empty-tree">
              <Empty
                description={<p>材料暂无目录</p>}
                image={
                  <ZYIcon
                    type="kongshuju7"
                    style={{ width: "80px", height: "48px" }}
                  />
                }
                styles={{
                  image: { width: 80, height: "auto", margin: "0 auto 10px" },
                }}
              >
                <Button
                  color="primary"
                  variant="filled"
                  style={{ width: 120 }}
                  onClick={() => setAdding(true)}
                >
                  生成目录
                </Button>
              </Empty>
            </div>
          );
        } else {
          return (
            <div className="empty-tree">
              <Form form={form} layout="vertical" className="catalog-form">
                <h2>目录起止页定位</h2>
                <Form.Item
                  label={
                    <div className="label-flex">
                      目录开始页
                      <div className="label-tip">目录开始页为文档的第几页</div>
                    </div>
                  }
                  name="start_page"
                  rules={[{ required: true, message: "请输入开始页" }]}
                >
                  <InputNumber
                    min={1}
                    max={bookInfo?._pdfInfo?.numPages}
                    placeholder="请输入开始页"
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <div className="label-flex">
                      目录结束页
                      <div className="label-tip">目录结束页为文档的第几页</div>
                    </div>
                  }
                  name="end_page"
                  dependencies={["start_page"]}
                  rules={[
                    { required: true, message: "请输入结束页" },
                    {
                      validator: (_, value) => {
                        if (value === null || value === undefined)
                          return Promise.reject();
                        const startPage = form.getFieldValue("start_page");
                        if (startPage === null || startPage === undefined)
                          return;
                        if (value - startPage < 0) {
                          return Promise.reject(
                            "结束页码数字不能小于开始页码数字",
                          );
                        }
                        if (value - startPage > 10) {
                          return Promise.reject(
                            "结束页码与开始页码跨度不能大于10页",
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={bookInfo?._pdfInfo?.numPages}
                    placeholder="请输入结束页"
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <div className="label-flex">
                      书籍页码起始页
                      <div className="label-tip">
                        书籍页码第1页是文档的第几页
                      </div>
                    </div>
                  }
                  name="base_page"
                  dependencies={["start_page", "end_page"]}
                  rules={[{ required: true, message: "请输入页码" }]}
                >
                  <InputNumber
                    min={1}
                    max={bookInfo?._pdfInfo?.numPages}
                    placeholder="请输入页码"
                  />
                </Form.Item>
                <div className="form-btns">
                  <Button onClick={cancelCatalogParsing}>取消</Button>
                  <Button type="primary" htmlType="submit" onClick={onFinish}>
                    开始解析
                  </Button>
                </div>
              </Form>
            </div>
          );
        }
      }
    }
  };

  return (
    <div className="file-catalog">
      {!checkType && (
        <div className="file-catalog-header">{renderTreeTop()}</div>
      )}
      <div
        className="file-catalog-tree"
        style={{ height: `${checkType ? "100%" : "calc(100% - 40px)"}` }}
      >
        {renderTree()}
        {renderTreeSkeletons()}
      </div>
      {contextHolder}
      {/* 编辑目录内容弹窗 */}
      <Modal
        title="编辑目录内容"
        className="edit-modal"
        open={editModal}
        destroyOnHidden={true}
        confirmLoading={formLoading}
        onOk={async () => {
          const v = await formEdit.validateFields();
          await run(v);
        }}
        onCancel={() => setEditModal(false)}
      >
        <Form form={formEdit} layout="vertical" className="catalog-form">
          <Form.Item
            label="目录名称"
            name="title"
            rules={[{ required: true, message: "请输入目录名称" }]}
          >
            <Input placeholder="请输入目录名称" showCount maxLength={50} />
          </Form.Item>
          <Form.Item
            label="页码"
            name="page"
            rules={[
              { required: true, message: "请输入页码" },
              {
                validator: (_, value) => {
                  if (value === null || value === undefined)
                    return Promise.reject();

                  const index = allTreeNodes.findIndex(
                    (item) => item.id === editTreeNode?.id,
                  );
                  const prevNode =
                    index > 0 ? allTreeNodes[index - 1]?.page : 1;
                  const nextNode =
                    index < allTreeNodes.length - 1
                      ? allTreeNodes[index + 1]?.page
                      : bookInfo?._pdfInfo?.numPages;
                  if (prevNode <= value && value <= nextNode) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject("中间标题页码需在相邻标题页码区间内");
                  }
                },
              },
            ]}
          >
            <InputNumber
              placeholder="输入范围[前标题页 - 后标题页]"
              min={1}
              max={bookInfo?._pdfInfo?.numPages}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default connect(({ teachSourceModel }: any) => ({
  teachSourceModel,
}))(FileCatalog);
