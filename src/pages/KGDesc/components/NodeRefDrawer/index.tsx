import React, { useState, useEffect, useImperativeHandle } from "react";
import {
  Button,
  Form,
  Input,
  Drawer,
  Cascader,
  Select,
  Tabs,
  Pagination,
  Spin
} from "antd";
import { connect, useDispatch, useLocation } from "@umijs/max";
import Graphnode from "../Graphnode/index";
import TabTiku from "../TabTiku";
import TabActivate from "../TabActivate";
import TabSource from "../TabSource";
import QuestionsPdf from "@/pages/SetQuestions/components/QuestionsPdf";
import PDFViewer from "@/components/PDFViewer";
import "./index.less";

const typeObj = {
  add: "创建节点",
  desc: "知识图谱名称",
};

const App = (props: any) => {
  const { onRef, kgDescModel } = props;


  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({}); // 缓存编辑带过来的数据
  const [actType, setActType] = useState("add");
  const [activeKey, setActiveKey] = useState("tiku");
  const [nodeList, setNodeList] = useState({});
  const [relationList, setRelationList] = useState({});
  const [relationNodeList, setRelationNodeList] = useState({});
  const [loading, setLoading] = useState(false);
  const [option, setOption] = useState(true);

  const [competency, setCompetency] = useState(""); // 能力点


  // 关闭抽屉销毁组件Graphnode
  useEffect(() => {
    return () => {
      setNodeList({})
      setRelationList({})
      setRelationNodeList({})
    };
  }, [open])

  useEffect(() => {
    const type=curRow?.knowledgeType?.slice(0, 2) || ""
    setCompetency(type)
  },[curRow])  

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    showModal: (category = "add", param?: any) => {
      setOpen(true);
      setActType(category);
      setActiveKey("source");
      setCurRow(param || {});
      getAgentArr(param);
    },
  }));

  const onClose = () => {
    setOpen(false);
    setOption(true)
  };

  const onChange = (key: string) => {
    setActiveKey(key);
  };

  // 获取题库
  const items = [
    // {
    //   key: "tiku",
    //   label: "试题/题库",
    // },
    {
      key: "source",
      label: "相关材料",
    },

    // {
    //   key: "activate",
    //   label: "教学活动",
    // },
  ];
  const getAgentArr = async (parder = {}) => {
    setLoading(true)

    const { code, data } = await dispatch({
      type: "kgDescModel/postData",
      apiUrl: "getNodeDescUrl",
      payload: {
        node_id: parder?.id,
      },
    });


    if (code == 200) {
      const { node, rel_doc, relation_nodes } = data
      setNodeList(node)
      setRelationList(rel_doc)
      setRelationNodeList(relation_nodes)
      setLoading(false)
    }

  };

  const Drawertitle = {
    title: <div className="drawer-title"><span className="title-type">{competency}</span><span className="title-name">{curRow?.title}</span></div>
  }
  const titleBox = () => {
    return (
      <div className="drawer_title_box">
        <p>{curRow?.title}</p>
      </div>
    );
  };

  const callback = () => {
    setOption(false)
  }
  const onClosexq=()=>{
    setOption(true)
  }

  return (
    <>
      {
        option && (
          <Drawer
            title={Drawertitle.title}
            closable={{ "aria-label": "Close Button" }}
            onClose={onClose}
            open={open}
            width={580}
            footer={null}
            destroyOnHidden={true}
          >
            <Spin spinning={loading}>
              <div className="drawer-content">
                <Graphnode nodeList={nodeList} relationList={relationList} relationNodeList={relationNodeList} callback={callback}></Graphnode>
              </div>
              <div className="drawer-footer">
                <Tabs activeKey={activeKey} items={items} onChange={onChange} />
                   {/* 题库 */}
                {/* {activeKey == "tiku" && <TabTiku {...props} nodeData={curRow} />} */}

                {activeKey == "activate" && (
                  <TabActivate {...props} nodeData={curRow} />
                )}
                {activeKey == "source" && <TabSource {...props} nodeData={curRow} />}
              </div>

            </Spin>
          </Drawer>
        ) || (<Drawer
          closable={true}
          maskClosable={false}
          // destroyOnHidden={true}
          onClose={onClosexq}
          title={titleBox()}
          placement="right"
          open={open}
          loading={loading}
          width={1000}
        // footer={rowDrawer?.is_master_doc === 1 ? footerBtn : []}
          className="drawerxq"
        >
          {
            relationList?.extension=="pdf" ? <PDFViewer fileInfo={relationList} /> : <QuestionsPdf docId={nodeList?.doc_id} />
          }
        </Drawer>)
      }


    </>
  );
};

export default connect((state: any) => ({
  kgDescModel: state.kgDescModel,
}))(App);
