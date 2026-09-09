import { useEffect, useRef, useState } from 'react';
import { Spin } from "antd";


import { useDispatch,connect } from '@umijs/max';

import './index.less';


const Assessment = (props: any) => {
 
  const dispatch = useDispatch();
  const [tmpToken, setTmpToken] = useState(""); 
  const [loading, setLoading] = useState(true);
  const frameRef = useRef(null);

  useEffect(() => {
    getData();
  }, []);

  

    // 获取列表
    const getData = async (params?: any) => {
      let { code, data } = await dispatch({
        type: "assessmentModel/postData",
        apiUrl: "getIssueUrl",
        payload:{},
      });
      if(code==200){
        setTmpToken(data.accessToken)
      }
    };


  console.log(`https://classroom-assessment.aiworkflow.cn/#/tp-login?accessToken=${tmpToken}`)
  

  return (
    <div className="assessment_page">
      {/* Loading 组件：加载时显示 */}
      {loading && <Spin size="large" className="loading" />}


      {tmpToken && 
        <iframe
          className="assessment_iframe"
          onLoad={() => setLoading(false)}
          ref={frameRef}
          src={`https://classroom-assessment.aiworkflow.cn/#/tp-login?accessToken=${tmpToken}`}
        />
      }
      </div>
  );
};


export default connect((state: any) => ({
  assessmentModel: state.assessmentModel,
}))(Assessment);
