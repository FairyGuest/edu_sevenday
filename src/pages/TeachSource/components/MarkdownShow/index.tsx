import { useEffect, useState, useRef } from "react";
import { connect, useDispatch, useLocation } from "umi";

import MarkdownRender from "@/components/MarkdownRender";

import "./index.less";


const App = (props: any) => {

  const { docData } = props;
  const dispatch = useDispatch();

  const [mdData, setMdData] = useState("");

 
  useEffect(() => {
    if (docData) getMdData();
  }, [docData]);


  // 获取 MD预览地址
  const getMdData = async () => {
    let { code, data }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "postDocAnalyzeInfo",
      payload: { id: docData.id,is_doc_content:1},
    });

    if (code === 200) {
     setMdData(data)
    }
  };

  return (
    <div className="carousel-css-box-md">
      <MarkdownRender>{mdData}</MarkdownRender>
    </div>
  );
};

export default connect((state: any) => ({
  teachSourceModel: state.teachSourceModel,
}))(App);
