import React, { useState, useEffect, useImperativeHandle } from 'react'
import { Button, Form, Input, Drawer, Cascader, Select, Tabs, Pagination } from 'antd';
import { connect, useDispatch, useLocation } from '@umijs/max';

import "./index.less"
import DataEmpty from '../DataEmpty';


const App = (props: any) => {

  const {nodeData}=props
  const {curSubject}=props.kgDescModel
  const dispatch = useDispatch();
  const [tikuData, setTikuData] = useState<any>([]);

  useEffect(() => {
    getTikuData();
  }, [nodeData]);


  // 获取题库
  const getTikuData = async () => {
    setTikuData([])
    const {title}=props?.nodeData || {}
    let { code, data }: any = await dispatch({
      type: "kgDescModel/postData",
      apiUrl: "tikuUrl",
      mTitle: "tikuData",
      payload: {
        // "subject": keyArr[1],
        // "typeDetailName": "单选题",
        // "grade": keyArr[0],
        // "pointList": pointList,
        // "is_page": true,
        // "pageSize": param["pageSize"] || 10,
        // "page": param["page"] || 1
        "subject":  curSubject?.categories?.[0] || "语文",
        "typeDetailName": "单选题",
        // "grade": keyArr[0],
        "pointList": [title || ""],
        "is_page": true,
        // "pageSize": param["pageSize"] || 10,
        // "page": param["page"] || 1
      }
    });

    if (code === 200) {
      setTikuData(data);
    }

  }




  const markdownRenderFn = (str: any) => {
    return (
      <div dangerouslySetInnerHTML={{ __html: str }} />
    );
  };


  return (
    <>
      <div className="k12_tu_container">

        {/* 题库，只考虑单选 */}

        {/* <div className="k12_page">
          <Pagination showQuickJumper total={tikuData.total || 0} onChange={onChange} />
        </div> */}

        {tikuData?.list?.map?.((item: any, index: any) => {
          return <div key={index} className="question_row">
            <div className="option">
              <div>{index + 1}.</div>
              {markdownRenderFn(item.content)}
            </div>
            <div className="option">
              <div>A.</div>
              {markdownRenderFn(item.optionA)}
            </div>
            <div className="option">
              <div>B.</div>
              {markdownRenderFn(item.optionB)}</div>
            <div className="option">
              <div >C.</div>
              {markdownRenderFn(item.optionC)}
            </div>
            <div className="option">
              <div >D.</div>
              {markdownRenderFn(item.optionD)}
            </div>
            <div className="option">
              <div>答案：</div>
              {markdownRenderFn(item.answer)}
            </div>
            <div className="option">
              <div >解析：</div>
              {markdownRenderFn(item.answerExplanation)}</div>

          </div>
        })}
      </div>
      
      {tikuData?.list?.length==0 && <DataEmpty />}
    </>

  )
}



export default connect((state: any) => ({
  kgDescModel: state.kgDescModel,
}))(App);
