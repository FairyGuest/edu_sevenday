import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  MouseEvent,
  useImperativeHandle,
} from "react";
import RelationGraph, {
  RGJsonData,
  RGNode,
  RGLine,
  RGLink,
  RGUserEvent,
} from "relation-graph-react";
import { Input, Button, message, Modal, Form } from "antd";
import { useDispatch, connect } from "umi";
import { LoadingOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

import { transformGraphDatas } from "./graphUtils";
import { getSpaceId, validateText } from '@/utils'

import NoData from "@/components/NoData";
import "./index.less";

const Relation = (props: any) => {
  const { commonModel, onRef, fileId, isMode } = props;
  const { gLoading } = commonModel;
  const space_id=getSpaceId()
  const [form] = Form.useForm();
  const graphRef: any = useRef(null);
  const [currentObjectType, setCurrentObjectType] = useState(null);
  const [currentObject, setCurrentObject] = useState<any>("");
  const [isShowMenuPanel, setIsShowMenuPanel] = useState(false);
  const [isEditingObjName, setIsEditingObjName] = useState(false);
  const [editingObjText, setEditingObjText] = useState("");
  const myPage = useRef<HTMLDivElement>(null);
  const [menuPanelPosition, setMenuPanelPosition] = useState({
    x: 0,
    y: 0,
  });
  const [graphData, setGraphData] = useState<RGJsonData | null>(null);
  const dispatch = useDispatch();

  // 首次加载和模式切换时获取数据
  useEffect(() => {
    let payload: any = {};
    if (fileId) {
      payload["file_id"] = fileId;
    }
    fetchGraphData(payload);
  }, []);

  // 父调子函数
  useImperativeHandle(onRef, () => ({
    getData: (param: any) => {
      // 获取图谱数据
      fetchGraphData(param);
    },
  }));


  const curr_is_file = useMemo(() => {
    if (!currentObject) {
      return false;
    }
    return (
      currentObjectType === "node" && currentObject?.data?.category === "file"
    );
  }, [currentObject]);


    // 当数据更新时，更新图谱
    useEffect(() => {
      if (graphData) {
        // 等待 graphInstance 初始化
        const timer = setInterval(() => {
          const graphInstance = graphRef.current?.getInstance();
          if (graphInstance) {
            clearInterval(timer);
            graphInstance.setJsonData(graphData);
          }
        }, 100);
  
        // 清理定时器
        return () => clearInterval(timer);
      }
    }, [graphData]);



  const fetchGraphData = async (payload: any) => {
    let { code, data }: any = await dispatch({
      type: "commonModel/postData",
      apiUrl: "graphQueryUrl",
      mLoading: "gLoading",
      payload:{space_id,...payload},
    });
    if (code == 200) {
      if (!data) {
        setGraphData(null);
        return;
      }

      if (
        data.nodes &&
        data.nodes.length == 0 &&
        data.relationships &&
        data.relationships.length == 0
      ) {
        setGraphData(null);
        return;
      }

      const json = transformGraphDatas(data);
      setGraphData(json);
    }
  };



  const graphOptions: any = {
    debug: false,
    defaultNodeBorderWidth: 0,
    allowSwitchLineShape: true,
    allowSwitchJunctionPoint: true,
    allowShowRefreshButton: false,
    moveToCenterWhenRefresh: false,
    defaultExpandHolderPosition: "right",
    defaultNodeShape: 0,
    defaultLineShape: 1,
    defaultLineColor: "rgba(0, 186, 189, 1)",
    defaultNodeColor: "rgba(238, 178, 94, 1)",
    layouts: [
      {
        label: "Auto Layout",
        layoutName: "force",
        layoutClassName: "seeks-layout-force",
      },
    ],
    defaultJunctionPoint: "border",
  };

  const hideMenu = () => {
    setIsShowMenuPanel(false);
    setIsEditingObjName(false);
  };

  const showNodeMenu = (
    $event: MouseEvent | TouchEvent | MouseEvent<HTMLDivElement>,
    objectType: string,
    object: any
  ) => {
    if (isMode === "tree") {
      return;
    }
    setCurrentObjectType(objectType);
    setCurrentObject(object);
    if (objectType === "node") {
      const category = object?.data?.category;
      if (
        category &&
        (category === "root" || category === "kb" || category === "chunk")
      ) {
        return;
      }
    }
    const _base_position = myPage.current?.getBoundingClientRect();
    setIsShowMenuPanel(true);
    setMenuPanelPosition({
      x: $event.clientX - (_base_position?.x || 0) + 20,
      y: $event.clientY - (_base_position?.y || 0),
    });

    const hideContentMenu = (e: any) => {
      if (
        !(
          e.target instanceof HTMLElement &&
          e.target.closest(".c-node-menu-item")
        )
      ) {
        hideMenu();
        document.body.removeEventListener("click", hideContentMenu, true);
      }
    };

    document.body.addEventListener("click", hideContentMenu, true);
  };

  const onNodeCollapse = async (node: RGNode, $event: RGUserEvent) => {
    const graphInstance = graphRef.current?.getInstance();
    await graphInstance?.doLayout();
  };

  const onNodeExpand = async (node: RGNode, $event: RGUserEvent) => {
    const graphInstance = graphRef.current?.getInstance();
    if (node.data.childrenLoaded) {
      console.log("These child nodes have already been loaded");
      await graphInstance?.doLayout();
      return;
    }
    node.data.childrenLoaded = true;
  };

  const getGraphInstance = () => {
    const graphInstance = graphRef.current?.getInstance();
    return graphInstance ?? null;
  };

  const onNodeClick = (nodeObject: any, $event: RGUserEvent) => {
    console.log("onNodeClick-----");
  };

  const onLineClick = (
    line: RGLine,
    _link: RGLink,
    _e: MouseEvent | TouchEvent
  ) => {
    if (_link.fromNode === null || _link.toNode === null) {
      return true;
    }
    showNodeMenu(_e, "line", {
      ..._link,
      relation: line?.text,
    });
    return true;
  };

  const onCanvasClick = () => {
    const graphInstance = getGraphInstance();
    if (graphInstance) {
      graphInstance.clearChecked();
    }
  };

  const deepGetAllChildIds = (node: RGNode, ids: string[] = []): string[] => {
    if (ids.includes(node.id)) return ids;
    ids.push(node.id);
    for (const cNode of node.lot.childs) {
      deepGetAllChildIds(cNode, ids);
    }
    return ids;
  };

  const handleDelete = (e:any) => {
    e.stopPropagation();
    if (currentObjectType === "node") {
      handleDeleteNode();
    } else if (currentObjectType === "line") {
      handleDeleteLine();
    }
  };


  const handleDeleteNode = async () => {
    const node_text = curr_is_file ? "子节点" : "节点";
    const { data } = currentObject;
    const id = data?._id || data?.id || currentObject?.id;

    let { code }: any = await dispatch({
      type: "commonModel/postData",
      apiUrl: "graphDeleteNodeUrl",
      payload: {
        space_id,
        node_id:id,
      },
    });

    if (code !== 200) {
      message.error({ content: `删除${node_text}数据失败` });
      return;
    }

    message.success({ content: `删除${node_text}成功` });
    hideMenu();

    const graphInstance = getGraphInstance();
    if (graphInstance && currentObject) {
      if (curr_is_file) {
        const allChildIds = deepGetAllChildIds(currentObject);
        for (let i = 0; i < allChildIds.length; i++) {
          const id = allChildIds[i];
          graphInstance.removeNodeById(id);
        }
      } else {
        graphInstance.removeNodeById(currentObject.id);
      }
    }
  };



  const handleDeleteLine = async () => {
    const { fromNode, toNode, relation, seeks_id } = currentObject;

    let { code }: any = await dispatch({
      type: "commonModel/postData",
      apiUrl: "graphDeleteLineUrl",
      payload: {
        space_id,
        start: fromNode.id,
        end: toNode.id,
        relation,
      },
    });

    if (code !== 200) {
      message.error({ content: "删除关系失败" });
      return;
    }

    message.success({ content: "删除关系成功" });
    hideMenu();

    const graphInstance = getGraphInstance();
    if (graphInstance && seeks_id) {
      graphInstance.removeLinkById(seeks_id);
    }
  };

  const handleChangeObjName = (e: any) => {
    e.stopPropagation();
    if (currentObject) {
      setEditingObjText(
        currentObjectType === "node"
          ? currentObject.text!
          : currentObject.relation!
      );
      setIsEditingObjName(true);
    }
  };

  const updateNodeNameAndFresh = (name: string) => {
    const graphInstance = getGraphInstance();
    currentObject.text = name;
    graphInstance.dataUpdated();
  };



  const handleUpdateNodeName = async () => {
    const { data } = currentObject;
    const _id = data?._id || data?.id || currentObject?.id;

    let { code }: any = await dispatch({
      type: "commonModel/postData",
      apiUrl: "graphUpdateNodeUrl",
      payload: {
        name: editingObjText.trim(),
        _id,
      },
    });

    if (code !== 200) {
      message.error({ content: "更新节点名称失败" });
      return;
    }

    message.success({ content: "更新节点名称成功" });
    hideMenu();

    updateNodeNameAndFresh(editingObjText);
  };


  const updateLineNameAndFresh = (name: string) => {
    const graphInstance = getGraphInstance();
    const { fromNode, toNode, relations } = currentObject;
    const from_id = fromNode.id;
    const to_id = toNode.id;
    for (let i = 0; i < relations.length; i++) {
      const curr = relations[i];
      if (curr.from === from_id && curr.to === to_id) {
        curr.text = name;
      }
    }
    graphInstance.dataUpdated();
  };


  const handleUpdateLineName = async () => {
    const { fromNode, toNode, relation } = currentObject;

    let { code }: any = await dispatch({
      type: "commonModel/postData",
      apiUrl: "graphUpdateLineUrl",
      isInfo: true,
      payload: {
        start: fromNode.id,
        end: toNode.id,
        old_relation: relation,
        relation: editingObjText.trim(),
      },
    });

    if (code == 200) {
       hideMenu();
      updateLineNameAndFresh(editingObjText);
    }
    
  };

  const handleObjNameSubmit = async (e: any) => {
    e.stopPropagation();
    const name = currentObjectType === "node" ? "节点名称" : "关系名称"
    const trim_text = editingObjText.trim()
    if (trim_text.length === 0) {
      message.error({ content: `${name}不能为空` });
      return;
    }
    try {
      await validateText(trim_text, name);
      if (currentObjectType === "node") {
        handleUpdateNodeName();
      } else if (currentObjectType === "line") {
        handleUpdateLineName();
      }
    } catch (error: any) {
      message.error({ content: error });
      return;
    }
  };

  const doCreateLine = async (graphInstance: any, from: RGNode, to: RGNode) => {
    const values = await form.validateFields();
    let { code }: any = await dispatch({
      type: "commonModel/postData",
      apiUrl: "graphAddLineUrl",
      payload: {
        start: from.id,
        end: to.id,
        relation: values.relation,
      },
    });

    if (code !== 200) {
      message.error({ content: "添加关系失败" });
      return;
    }

    graphInstance.addLines([
      {
        from: from.id,
        to: to.id,
        lineWidth: 1,
        color: "rgb(210, 192, 165)",
        text: values.relation,
      },
    ]);
  };

  const handleAddLine = (graphInstance: any, from: RGNode, to: RGNode) => {
    Modal.confirm({
      title: "请填写关系名称",
      icon: <ExclamationCircleOutlined />,
      content: (
        <Form form={form} layout="horizontal">
          <Form.Item
            name="relation"
            label=""
            rules={[
              { required: true, message: "请填写关系名称" },
              { validator: (_, value) => validateText(value, '关系名') }
            ]}
          >
            <Input placeholder="请填写关系名称" maxLength={50} showCount />
          </Form.Item>
        </Form>
      ),
      onOk: async () => await doCreateLine(graphInstance, from, to),
      onCancel: () => {
        form.resetFields();
      },
      okText: "确定",
      cancelText: "取消",
    });
  };

  const createLineFromNode = (e: React.MouseEvent) => {
    hideMenu();
    const graphInstance = graphRef.current!.getInstance();
    graphInstance.startCreatingLinePlot(e, {
      template: {
        lineWidth: 1,
        color: "rgb(210, 192, 165)",
        text: "新链接",
      },
      fromNode: currentObject,
      onCreateLine: (from: RGNode, to: RGNode) => {
        if (to.id) {
          handleAddLine(graphInstance, from, to);
        }
      },
    });
  };

  const NodeSlot = ({ node }: { node: RGNode }) => {
    return (
      <div
        className="node-wrapper"
        onContextMenu={(event) => showNodeMenu(event, "node", node)}
      >
        <div className="node_name">{node.text}</div>
      </div>
    );
  };

  return (
    <div className="relation_container">
      <div className="graph-inner" ref={myPage}>
        {gLoading ? (
          <div className="loading">
            <LoadingOutlined style={{ fontSize: "30px", color: "#08c" }} />
            <div className="tips">数据加载中...</div>
          </div>
        ) : graphData ? (
          <RelationGraph
            ref={graphRef}
            options={graphOptions}
            onNodeClick={onNodeClick}
            onLineClick={onLineClick}
            onCanvasClick={onCanvasClick}
            nodeSlot={NodeSlot}
            onNodeExpand={onNodeExpand}
            onNodeCollapse={onNodeCollapse}
          />
        ) : (
          <NoData title="暂无数据" />
        )}
      </div>

      {/* 菜单面板 */}
      {isShowMenuPanel && (
        <div
          style={{
            left: menuPanelPosition.x + "px",
            top: menuPanelPosition.y + "px",
          }}
          className="menu-panel"
        >
          <div className="c-node-menu-item" onClick={handleDelete}>
            {currentObjectType === "line"
              ? "删除关系"
              : curr_is_file
              ? "删除子节点"
              : "删除节点"}
          </div>
          <div
            className="c-node-menu-item"
            onClick={(e) => handleChangeObjName(e)}
          >
            {currentObjectType === "line" ? "改关系名" : "改节点名"}
            {isEditingObjName && (
              <div
                className="node-name-editor"
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  value={editingObjText}
                  onChange={(e) => setEditingObjText(e.target.value)}
                  autoFocus
                  style={{ width: 120, marginLeft: 8 }}
                />
                <Button
                  type="primary"
                  size="small"
                  onClick={handleObjNameSubmit}
                  style={{ marginLeft: 8 }}
                >
                  确定
                </Button>
              </div>
            )}
          </div>
          {currentObjectType === "node" && (
            <div className="c-node-menu-item" onClick={createLineFromNode}>
              创建关系
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(Relation);
