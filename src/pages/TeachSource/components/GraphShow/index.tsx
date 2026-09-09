import { useEffect, useState, useRef } from "react";
import { Spin } from "antd";
import { connect, useDispatch } from "umi";
import RelationGraph, { RGLine, RGLink, RGUserEvent } from "relation-graph-react";
import GraphDrawer from "../Drawer"
import { transformGraphDatas } from "./graphUtils";
import { formatGraphId2String } from "@/utils";

import "./index.less";

const GraphShow = (props: any) => {
  const { docData } = props;
  const dispatch = useDispatch();

  const graphRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [rowDrawer, setRowDrawer] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);

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
    useAnimationWhenRefresh: true,
    defaultJunctionPoint: "border",
    allowShowMiniToolBar: false, // 是否允许显示菜单栏
    reLayoutWhenExpandedOrCollapsed: true,
  };

  useEffect(() => {
    getGraphData();
  }, [docData]);
  // 获取图谱数据
  const getGraphData = async () => {
    setLoading(true);
    let { code, data }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "postGraphDataUrl",
      payload: { doc_ids: docData?.doc_list },
    });
    if (code == 200 && data?.nodes?.length > 0) {
      await initGraph(formatGraphId2String(data));
    }
    setLoading(false);
  };
  // 初始化图谱数据
  const initGraph = async (param: any) => {
    const { nodes = [], relations = [] } = param;
    const newNodes = nodes.map((item: any) => {
      const { id, label } = item;
      return {
        ...item,
        _id: id,
        name: label,
      };
    });
    const graphInstance = graphRef.current?.getInstance();
    const json = transformGraphDatas({
      nodes: newNodes,
      relationships: relations,
    });
    await graphInstance?.setJsonData(json);
  };
  // 图谱节点事件
  const onNodeClick = (node: any) => {
    setOpenDrawer(true);
    setRowDrawer(node);
  };

  // 图谱线事件
  const onLineClick = (
    line: RGLine,
    _link: RGLink,
    _e: MouseEvent | TouchEvent,
  ) => {
    return true;
  };

  return (
    <div className="graph-show">
      <div className="graph-content">
        <Spin size="large" tip="图谱加载中..." spinning={loading}>
          <RelationGraph
            ref={graphRef}
            options={graphOptions}
            onNodeClick={onNodeClick}
            onLineClick={onLineClick}
            nodeSlot={({ node }) => {
              return (
                <div className="h-full">
                  <div
                    className="rel_node"
                    style={{
                      backgroundImage: `url(${node.data?.icon})`,
                    }}
                  ></div>
                  <div className="node_name">{node.text}</div>
                </div>
              );
            }}
          />
        </Spin>
      </div>

      <GraphDrawer
        rowDrawer={rowDrawer}
        openDrawer={openDrawer}
        cancel={() => setOpenDrawer(false)}
      />
    </div>
  );
};

export default connect((state: any) => ({
  teachSourceModel: state.teachSourceModel,
}))(GraphShow);
