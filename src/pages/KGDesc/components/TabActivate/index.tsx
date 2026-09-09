import React, { useState, useEffect, useImperativeHandle } from 'react'
import { Button, Form, Input, Drawer, Cascader, Select, Tabs, Pagination } from 'antd';
import { connect, useDispatch, useLocation } from '@umijs/max';

import "./index.less"
import DataEmpty from '../DataEmpty';


const App = (props: any) => {

  const { nodeData } = props
  const dispatch = useDispatch();
  const [curData, setCurData] = useState<any>([]);

  useEffect(() => {

    // getSourceData()

  }, []);

  // 获取相关材料
  const getSourceData = async () => {

    const { title } = props?.nodeData || {}
    let { code, data }: any = await dispatch({
      type: "kgDescModel/postData",
      apiUrl: "getNodeDescUrl",
      mTitle: "tikuData",
      payload: {
        "chunk_ids": ["47006321110685044",],
        "doc_id": ""
      }
    });

    if (code === 200) {
      // setCurData(data);
    }

  }




  return (
    <>
      <DataEmpty />
    </>

  )
}



export default connect((state: any) => ({
  kgDescModel: state.kgDescModel,
}))(App);
