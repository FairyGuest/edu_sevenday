import { connect, useDispatch, useLocation } from "@umijs/max";
import { useEffect, useState } from "react";

import "./index.less";
import { Spin } from "antd";

const gStyObj = {
  "1": {
    fontSize: "20px",
    marginTop: "4px",
    fontWeight: "800",
    marginBottom: "4px",
  },
  "2": {
    paddingLeft: "16px",
    fontSize: "18px",
    marginBottom: "4px",
    fontWeight: "600",
    marginTop: "4px",
  },
  "3": {
    paddingLeft: "32px",
    fontSize: "16px",
    marginBottom: "4px",
    fontWeight: "500",
    marginTop: "4px",
  },
  "4": {
    paddingLeft: "40px",
    fontSize: "14px",
    // lineHeight: '20px',
    marginBottom: "4px",
    marginTop: "4px",
  },
};

const App = (props: any) => {
  const { docId, setQuestionsModel } = props;
  const dispatch = useDispatch();
  const [outlineData, setOutlineData] = useState([]); // 问答是否关闭
  const { outlineLoading } = setQuestionsModel;

  useEffect(() => {
    getData();
    console.log("docId", docId);
  }, [docId]);

  // getMindMap
  const getData = async () => {
    let { code, data } = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "getMindMapUrl",
      mLoading: "outlineLoading",
      payload: { doc_id: docId },
    });

    if (code == 200) {
      const newData = list2Tree(data.mind_dic); // 数据转换
      setOutlineData(data.mind_dic);
    }
  };

  // 数组转树结构
  const list2Tree = (arr: any, parentId = null) => {
    const tree = [];
    for (const item of arr) {
      if (item.parent_id === parentId) {
        const children = list2Tree(arr, item.id); // 递归查找子节点
        if (children.length > 0) {
          item.children = children; // 如果有子节点，添加到 children 属性
        }
        tree.push(item); // 将当前节点添加到树中
      }
    }
    return tree;
  };

  // 暴露方法给父组件
  return (
    <div>
      {/* <KegHeader {...props} title="智能大纲" defaultValue={"outline"} /> */}
      <Spin spinning={outlineLoading}>
        <div className="mind_graph_outline_body_container">
          {outlineData?.map?.((item: any, index: any) => {
            const { level } = item;
            return (
              <div
                key={index}
                style={gStyObj[level] || gStyObj[4]}
                className="title"
              >
                {level != 1 && (
                  <>
                    <span className="title_level">•</span>
                    {item.title || "无"}
                  </>
                )}
                {level == 1 && <>{item.title || "无"}</>}
              </div>
            );
          })}
        </div>
      </Spin>
    </div>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
}))(App);
