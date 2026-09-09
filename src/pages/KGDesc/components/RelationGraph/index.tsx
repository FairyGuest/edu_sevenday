import React, { useRef, useEffect, useState, useImperativeHandle } from "react";
import { Menu, Modal, Layout, Spin, Tooltip } from "antd";
import RelationGraph, { RGNode, RGNodeSlotProps } from "relation-graph-react";
import { connect, useDispatch, useLocation } from "@umijs/max";
import NodeDrawer from "../NodeDrawer";
import NodeTitleModal from "../NodeTitleModal";
import NodeRefDrawer from "../NodeRefDrawer";
import MyEditableNodeSlot from "../RGFlowEditor/MyEditableNodeSlot";
import { ZYIcon } from "@/components";
import { transformGraphDatas } from "./graphUtils";
import GraphLine from "./GraphLine";
import Graph3D from "../Graph3D/index";
import Table from "../Table/index";
import "./index.less";
import {
  DeleteOutlined,
  CodeSandboxOutlined,
  ApartmentOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
const { Content } = Layout;

let gDefaultRelationText = "isRelatedTo";

type RelationType = keyof typeof rel_obj;
let rel_obj = {
  isRelatedTo: "相关于",
  hasChild: "具有子知识点",
  isPrerequisiteFor: "先修于",
  includes: "包含",
  isEquivalentTo: "等价于",
};

// HAS_CHILD = "hasChild"   # 具有子知识点
// IS_PREREQUISITE_FOR = "isPrerequisiteFor"  # 先修于
// INCLUDES = "includes"  # 包含
// IS_EQUIVALENT_TO = "isEquivalentTo"   # 等价于
// IS_RELATED_TO = "isRelatedTo"  # 相关于

// node_type:
// RootPoint  #根节点
// DocPoint  #一级节点
// LearningPoint #知识节点
// PowerPoint #能力节点


const App = (props: any) => {
  const { onRef, action, kgDescModel, curNode = true, doc_ids, isShow = true, typeNode = '3D' } = props;
  const { curSubject } = kgDescModel;

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const space_id = searchParams.get("courseId"); // 课程id

  const dispatch = useDispatch();
  const ndRef = useRef(null);
  const reRef = useRef(null);
  const graphRef = useRef(null);
  const nodeReRef = useRef(null);
  const threeDref = useRef(null); // 3D 
  const tableRef = useRef(null); // 表格
  const [modal, contextHolder] = Modal.useModal();
  const [isShowNodeTipsPanel, setIsShowNodeTipsPanel] = useState(false);
  const [nodeMenuPanelPosition, setNodeMenuPanelPosition] = useState({
    x: 0,
    y: 0,
  });
  const [currentObjectType, setCurrentObjectType] = useState<string | null>(
    null,
  );
  const [currentObject, setCurrentObject] = useState<any>({});
  const [currentLineObject, setCurrentLineObject] = useState<any>({});
  const [currentLinkObject, setCurrentLinkObject] = useState<any>({});
  const [laoding, setLoading] = useState(false); // 水平数据
  const enableEditingMode = useRef(true);
  const [type, setType] = useState(typeNode); // 当前图谱状态
  const [relations, setRelations] = useState([]);
  const [graphData, setGraphData] = useState<any>([]);

  useEffect(() => {
    if (type == "gx") { // 关系
      showGraph();
    }
  }, [doc_ids]);

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    getGraph: async (param: any) => {
      setLoading(false);


      // if (type == "gx") { // 关系
      //   await showGraph(param);
      // }

      // if (type == "3D") { // 3D 关系
      //   threeDref?.current?.getGraph?.(param)
      // }

      // if(type=="bg"){ // 表格关系
      //   await tableRef?.current?.getGraphData(param);
      // }

    },
  }));




  const onLoadData = () => {
  };

  const onLineClick = (lineObject: any, linkObject: any, $event: any) => {
    setCurrentLineObject(lineObject);
    setCurrentLinkObject(linkObject);
  };

  //   节点点击事件
  const onNodeClick = (nodeObject: any) => {
    nodeReRef?.current?.showModal?.("desc", nodeObject.data);
  };

  const showGraph = async (payload = {}) => {
    setLoading(true);

    let res: any = { code: 200, data: {} };


    res = await dispatch({
      type: "kgDescModel/postData",
      apiUrl: "getGraphUrl",
      payload: {
        doc_ids: doc_ids || [],
        space_id: space_id,
        is_table: 0,
        ...payload,
      },
    });


    let { code, data } = res;
    setLoading(false);
    const { nodes = [], relations = [] } = data || {};
    if (code == 200) {
      setGraphData(nodes);
      setRelations(relations);

      const newRelations = relations?.map?.((item: any) => {
        const { source_id, target_id, label } = item;
        return {
          ...item,
          start: source_id,
          end: target_id,
          relation: label || "includes",
        };
      });

      let newNodes = nodes?.map((item: any) => {
        const { title } = item;
        return { ...item, label: title || "节点名称" };
      });

      const newData = { nodes: newNodes, relations: newRelations };

      let graph_json_data = {
        rootId: null,
        nodes: [],
        lines: [],
      };

      if (newNodes.length > 0) {
        // 节点数量必须大于1
        graph_json_data = transformGraphDatas(newData);
      }

      const graphInstance = graphRef.current?.getInstance?.();
      if (graphInstance) {
        await graphInstance.setJsonData(graph_json_data);
        await graphInstance.moveToCenter();
        await graphInstance.zoomToFit();
        await graphInstance.refresh();
      }
    }
  };

  // 显示菜单
  const onContextmenu = ($event: any, objectType: string, object: any) => {
    if (props.action == "edit") {
      const graphInstance = graphRef.current?.getInstance?.();
      setCurrentObjectType(objectType);
      setCurrentObject(object);
      const _base_position = graphInstance.getBoundingClientRect();
      // console.log('showNodeMenus:', $event, _base_position);
      setIsShowNodeTipsPanel(true);
      setNodeMenuPanelPosition({
        x: $event.clientX - _base_position.x + 10,
        y: $event.clientY - _base_position.y + 10,
      });
      const hideContentMenu = () => {
        setIsShowNodeTipsPanel(false);
        document.body.removeEventListener("click", hideContentMenu);
      };
      document.body.addEventListener("click", hideContentMenu);
    }
  };

  // 删除关系
  const deleteLink = ($event: React.MouseEvent) => {
    const rel = currentObject.relations?.[0];

    modal.confirm({
      title: (
        <div>
          <span>
            <span>你确定删除关系</span>
            <span style={{ marginLeft: "4px" }}>{rel.text} 吗?</span>
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
        delLineFetch({ id: rel.id });
      },
    });
  };

  //  后端删除
  const delLineFetch = async (payload = {}) => {
    const { code, data = [] }: any = await dispatch({
      type: "kgDescModel/postData",
      apiUrl: "delRelNodeUrl",
      isInfo: true, // api 请求成功提示
      payload,
    });
    if (code == 200) {
      // 前端删除
      const graphInstance = graphRef.current?.getInstance?.();
      graphInstance.removeLinkById(currentObject.seeks_id);
    }
  };

  // 修改关系
  const onClickUpdLink = async (label: RelationType) => {
    const graphInstance = graphRef.current?.getInstance();
    const { fromNode, toNode } = currentObject;
    let { code, data } = await dispatch({
      type: "kgDescModel/postData",
      apiUrl: "uprellabelUrl",
      isInfo: true, // api 请求成功提示
      payload: {
        id: currentLineObject?.data?.id,
        space_id,
        source_id: fromNode?.id,
        target_id: toNode?.id,
        source_label: fromNode?.text,
        target_label: toNode?.text,
        label,
        doc_id: doc_ids?.[0] || "",
      },
    });

    if (code == 200 && graphInstance) {
      const graphInstance = graphRef.current!.getInstance();
      const lineObject = { ...currentLineObject };
      if (lineObject["data"]) {
        lineObject["data"]["label"] = rel_obj?.[label] || label;
        const linkObject = { ...currentLinkObject };
        linkObject["relations"][0]["text"] = rel_obj?.[label] || label;
        linkObject["relations"][0]["data"]["label"] = rel_obj?.[label] || label;
        graphInstance.setEditingLine(lineObject, linkObject);
        graphInstance.dataUpdated();
      }
    }
  };

  const onClickLinkMenu = (param: any) => {
    const { key, domEvent } = param;

    domEvent?.stopPropagation?.(); // 阻止事件冒泡
    if (key == "delete") {
      deleteLink(domEvent);
      return;
    }
    onClickUpdLink(key);
    setIsShowNodeTipsPanel(false);
  };

  const dropdownItems = [
    {
      key: "sub1",
      label: "编辑关系",
      children: [
        {
          key: "hasChild",
          label: <span>具有子知识</span>,
        },
        {
          key: "isPrerequisiteFor",
          label: <span>优修于</span>,
        },
        {
          key: "includes",
          label: <span>包含</span>,
        },
        {
          key: "isEquivalentTo",
          label: <span>等价于</span>,
        },
        {
          key: "isRelatedTo",
          label: <span>相关于</span>,
        },
      ],
    },
    {
      key: "delete",
      label: <span className="text-red-500">删除关系</span>,
    },
  ];

  // 更新节点弹框
  const onClickUpdNode = (param: any) => {
    ndRef?.current?.showModal?.("edit", currentObject.data);
  };
  //  添加节点
  const onAddNodeSuccess = (param: any) => {
    const graphInstance = graphRef.current?.getInstance();
    const _base_position = graphInstance.getBoundingClientRect();
    const canvasCoordinate =
      graphInstance.getCanvasCoordinateByClientCoordinate({
        x: nodeMenuPanelPosition.x - 10 + _base_position.x,
        y: nodeMenuPanelPosition.y - 10 + _base_position.y,
      });
    const { title, id } = param;
    graphInstance.addNodes([
      {
        id: id || uuid(),
        text: title,
        color: "#1C6CFF",
        x: canvasCoordinate.x,
        y: canvasCoordinate.y,
        data: {
          id: id || uuid(),
          text: title,
          label: title,
          ...param,
        },
        ...param,
      },
    ]);
  };

  //  重命名成功回调
  const onRenameSuccess = (name: string) => {


    const graphInstance = graphRef?.current?.getInstance?.();
    const n_id = currentObject.id;
    if (graphInstance) {
      const node = graphInstance.getNodeById(n_id); // 替换为你的节点ID

      if (node) {
        node.text = name?.label || node.text;
        node.data.title = name?.label || node.data.title;
        node.data.label = name?.label || node.data.label;
        node.data.applicableLevel = name?.applicableLevel || node.data.applicableLevel;
        node.data.competency = name?.competency || node.data.competency;
        node.data.description = name?.description || node.data.description;
        node.data.knowledgeType = name?.knowledgeType || node.data.knowledgeType;
        node.data.source = name?.source || node.data.source;
      }
      graphInstance.dataUpdated();
    }
  };

  //  重命名
  const onClickRename = (param: any) => {
    console.log("ccccccc", currentObject);
    reRef?.current?.showModal?.("edit", currentObject.data);
  };

  // 关系更新后端
  const createLineFromNodeBe = async (param: any) => {
    const graphInstance = graphRef.current?.getInstance?.();
    const { from, to } = param;
    if (to.id) {
      let { code, data } = await dispatch({
        type: "kgDescModel/postData",
        apiUrl: "addRelNodeUrl",
        isInfo: true, // api 请求成功提示
        payload: {
          space_id,
          source_id: from.id,
          source_label: from.data.title,
          target_id: to.id,
          target_label: to.data.title,
          label: gDefaultRelationText,
          doc_id: doc_ids?.[0] || "",
        },
      });

      if (code == 200) {
        const payload = {
          from: from.id,
          to: to.id,
          lineWidth: 1,
          text: rel_obj[gDefaultRelationText],
        };
        graphInstance?.addLines?.([payload]); // 添加线
      }
    }
  };

  //  创建关系
  const createLineFromNode = (e: React.MouseEvent) => {
    const graphInstance = graphRef.current?.getInstance?.();
    graphInstance.startCreatingLinePlot(e, {
      template: {
        lineWidth: 3,
        color: "#1C6CFF",
        text: rel_obj[gDefaultRelationText],
      },
      fromNode: currentObject,
      onCreateLine: async (from: any, to: any) => {
        await createLineFromNodeBe({ from, to }); // 更新后端
      },
    });
  };

  // 删除节点
  const deleteNode = ($event: any) => {
    modal.confirm({
      title: (
        <div>
          <span>
            <span>你确定删除节点</span>
            <span style={{ marginLeft: "4px" }}>{currentObject?.text} 吗?</span>
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
        delNodeFetch({
          node_id: currentObject.id,
          doc_id: currentObject?.data?.doc_id || "",
        });
        const graphInstance = graphRef.current?.getInstance?.();
        graphInstance.removeNodeById(currentObject.id);
        graphInstance.dataUpdated();
      },
    });
  };

  //  后端删除
  const delNodeFetch = async (payload = {}) => {
    const { code, data = [] }: any = await dispatch({
      type: "kgDescModel/postData",
      apiUrl: "delNodeUrl",
      isInfo: true, // api 请求成功提示
      payload,
    });
    // console.log("delNodeFetch ", code, data);

    if (code == 200) {
      // 前端删除
      const graphInstance = graphRef.current?.getInstance();
      graphInstance.removeNodeById(currentObject.id);
    }
  };

  //  节点菜单
  const onClickNodeMenu = (param: any) => {
    const { key, domEvent } = param;
    domEvent?.stopPropagation?.(); // 阻止事件冒泡
    if (key == "rename") onClickRename(domEvent);
    if (key == "create") createLineFromNode(domEvent);
    if (key == "edit") onClickUpdNode(domEvent);
    if (key == "delete") deleteNode(domEvent);
    setIsShowNodeTipsPanel(false);
  };

  const items = [
    {
      label: <span>重命名</span>,
      key: "rename",
    },
    {
      label: <span>创建关系</span>,
      key: "create",
    },
    {
      label: <span>编辑节点</span>,
      key: "edit",
    },
    {
      label: <span className="text-red-500">删除节点</span>,
      key: "delete",
    },
  ];
  const addjiedianitems = [
    {
      label: <span>创建节点</span>,
      key: "add",
    },
  ];

  const onNodeTextChange = (node: RGNode, newNodeText: string) => {
    node.text = newNodeText;
  };

  const MyNodeSlot: React.FC<RGNodeSlotProps> = ({ node, relationGraph }) => {
    return (
      <MyEditableNodeSlot
        node={node}
        graphInstance={relationGraph}
        enableEditingMode={enableEditingMode.current}
        onNodeTextChange={onNodeTextChange}
      />
    );
  };

  const onaddNodeSucc = () => {
    ndRef?.current?.showModal?.("add");
  };



  const onaddNode3D = () => {
    setType("3D");
    threeDref?.current?.getGraph?.() // 3D 图谱
  };
  const onaddNodegx = () => {
    setType("gx");
    if (doc_ids?.length > 0) {
      showGraph({ doc_ids: props.doc_ids });
    }
  };


  const onaddNodebg = () => {
    setType("bg");
    tableRef?.current?.getGraphData({ doc_ids: props.doc_ids, is_table: 1 });
  };
  return (
    <>
      <Content>
        <Spin
          className="graph_loading_container"
          tip="图谱更新中..."
          size="large"
          spinning={laoding}
        >
          {(curNode && (
            <div className="relation_subject_container">
              {action == "edit" && (
                <NodeDrawer
                  {...props}
                  onRef={ndRef}
                  onAddSuccess={onAddNodeSuccess}
                  onLoadData={onLoadData}
                  onEditSuccess={onRenameSuccess}
                />
              )}


              {type == "3D" && <Graph3D {...props} docids={doc_ids} onRef={threeDref} />}

              {type == "gx" && doc_ids?.length > 0 && (
                <RelationGraph
                  ref={graphRef}
                  options={{
                    allowSwitchLineShape: true,
                    allowSwitchJunctionPoint: true,
                    allowShowDownloadButton: true,
                    defaultJunctionPoint: "border",
                    checkedLineColor: "#1C6CFF",
                  }}
                  onContextmenu={onContextmenu}
                  onLineClick={onLineClick}
                  onNodeClick={(param: any) => onNodeClick(param)}
                  lineSlot={(param: any) => <GraphLine {...param} />}
                  nodeSlot={({ node }) => {
                    return (
                      <div className="h-full">
                        <div
                          className="rel_node"
                          style={{ backgroundImage: `url(${node.data?.icon})` }}
                        ></div>
                        <div className="node_name">
                          <div className="node_text">{node.text}</div>
                        </div>
                      </div>
                    );
                  }}
                />
              ) || (
                  <div>
                      
                  </div>
                )}
              {type == "bg" && (
                <Table
                  {...props}
                  onRef={tableRef}

                // relations={relations}
                // graphData={graphData}
                // currentObject={currentObject}
                />
              )}
              {isShow && doc_ids?.length > 0 && <div className="relation_container">
                <Tooltip title="3D">
                  <div
                    className={
                      type == "3D"
                        ? "relation_container_leftact"
                        : "relation_container_left"
                    }
                  >
                    <button onClick={onaddNode3D}>
                      <ZYIcon type="a-3d" />
                    </button>
                  </div>
                </Tooltip>
                <Tooltip title="关系">
                  <div
                    className={
                      type == "gx"
                        ? "relation_container_leftact"
                        : "relation_container_left"
                    }
                  >
                    <button onClick={onaddNodegx}>
                      <ZYIcon type="guanxi" />
                    </button>
                  </div>
                </Tooltip>
                <Tooltip title="表格">
                  <div
                    className={
                      type == "bg"
                        ? "relation_container_leftact"
                        : "relation_container_left"
                    }
                  >
                    <button onClick={onaddNodebg}>
                      <ZYIcon type="biaoge" />
                    </button>
                  </div>
                </Tooltip>
              </div>}
              {isShowNodeTipsPanel && (
                <div
                  // style={{ left: nodeMenuPanelPosition.x + 200 + 'px', top: nodeMenuPanelPosition.y + 'px' }}
                  style={{
                    left: nodeMenuPanelPosition.x + "px",
                    top: nodeMenuPanelPosition.y + "px",
                  }}
                  className="c-right-menu-panel"
                >
                  {currentObjectType === "node" && (
                    <Menu
                      disabled={currentObject?.data?.is_master_doc}
                      mode="vertical"
                      items={items}
                      onClick={onClickNodeMenu}
                      getPopupContainer={(node) =>
                        node.parentNode as HTMLElement
                      }
                    />
                  )}

                  {currentObjectType === "link" && (
                    <Menu
                      disabled={currentLineObject?.data?.is_master_doc}
                      mode="vertical"
                      items={dropdownItems}
                      onClick={onClickLinkMenu}
                      getPopupContainer={(node) =>
                        node.parentNode as HTMLElement
                      }
                    />
                  )}
                  {currentObjectType === "canvas" && (
                    <Menu
                      disabled={currentLineObject?.data?.is_master_doc}
                      mode="vertical"
                      items={addjiedianitems}
                      onClick={onaddNodeSucc}
                      getPopupContainer={(node) =>
                        node.parentNode as HTMLElement
                      }
                    />
                  )}
                </div>
              )}
            </div>
          )) || <div className="relation_subject_container"></div>}
        </Spin>
      </Content>

      <NodeTitleModal onRef={reRef} onLoadData={onRenameSuccess} />
      <NodeRefDrawer {...props} onRef={nodeReRef} />

      {contextHolder}
    </>
  );
};

export default connect((state: any) => ({
  kgDescModel: state.kgDescModel,
}))(App);
