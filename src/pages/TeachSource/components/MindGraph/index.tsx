import React, { useState, useEffect, useRef } from "react";
import { Button, Segmented, Tooltip } from "antd";
import {
  CloseOutlined,
  NodeIndexOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import MindMap from "../MindMap";
import Outline from "./Outline";
import RelationGraph from "@/pages/KGDesc/components/RelationGraph";

import "./index.less";

const MiddlePart = (props: any) => {
  const [curNode, setCurNode] = useState<any>(true);
  const relationRef = useRef<any>(null); // 图谱
  const [docids, setDocIds] = useState<any>([props?.docId]);
  // const [segValue, setSegValue] = useState("mindMap");

  return (
    <div className="mind_graph">
      <>
        {props?.outlineType === "mindMap" && (
          <MindMap {...props} docId={props?.docId} />
        )}
        {props?.outlineType === "outline" && (
          <Outline {...props} docId={props?.docId} />
        )}
        {props?.outlineType === "graph" && (
          <div className="mind_graph_box">
            <RelationGraph
              // subjectData={() => curSubject}
              // action={action}
              onRef={relationRef}
              // onEdit={editNode}
              curNode={curNode}
              doc_ids={docids}
              isShow={false}
              typeNode={"gx"}
              // selectBookList={selectBookList}
            />
          </div>
        )}
      </>
    </div>
  );
};

export default MiddlePart;
