import React, { useRef, useEffect, useState } from 'react';
import RelationGraph, { RGLine, RGLink, RGUserEvent, } from 'relation-graph-react';

import { transformGraphDatas } from "../RelationGraph/graphUtils";
import './index.less';


const rootId="be90fb0320234a71479b26ed68f4fe78"

const Relation = (props:any) => {
    const {nodes,relationships}=props;
    
    const graphRef:any = useRef(null);


    const setGraphData = async () => {
        console.log("====>>>",{
            rootId,
            nodes,
            lines:relationships
        })
        const graphInstance = graphRef.current?.getInstance();
        const json = transformGraphDatas(props.data);
        await graphInstance?.setJsonData(json);
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

    useEffect(() => {
        setGraphData();
    }, [nodes]);

    
    const onNodeClick = (nodeObject: any, $event: RGUserEvent) => {
        console.log("nodeObject",nodeObject)       
    };


    const onLineClick = (line: RGLine, _link: RGLink, _e: MouseEvent | TouchEvent) => {
        return true;
    };


    return (
        <div className='relation_com_container'>
            {/* <div style={{ marginTop: 0, width: '100%', height: '100vh' }}> */}
            <div style={{ marginTop: 0, width: '100%', height: '280px' }}>
                <RelationGraph
                    ref={graphRef}
                    options={graphOptions}
                    onNodeClick={onNodeClick}
                    onLineClick={onLineClick}
                    nodeSlot={({ node }) => {
                        console.log("node",node)
                        return <div className="h-full">
                        <div className="rel_node" style={{ backgroundImage: `url(${node.data?.icon})` }}></div>
                        <div className="node_name">{node.text}</div>
                    </div>
                    }
                    }
                >
                </RelationGraph>
            </div>
        </div>
    );
};

export default Relation;
