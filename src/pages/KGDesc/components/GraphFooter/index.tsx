import React, { useState, useEffect, useRef } from 'react'
import { Button, Layout, message } from 'antd';
import { connect, useDispatch } from '@umijs/max';
import "./index.less"

const { Footer} = Layout;

const App = (props: any) => {

  const dispatch = useDispatch();

  useEffect(() => {

  }, [])


  const onClickSave = (key: any) => {
    message.success("保存成功")
  };


  const onClickCancel = (key: any) => {
   
    message.success("取消成功")
  };


  return (
    <Footer className='bg-white subject_footer_container' style={{ paddingTop: '0px' }}>
      <div className='k12_desc_footer'>
        <Button onClick={onClickCancel} className='mr-8'>取消</Button>
        <Button type='primary' className='ml-8' onClick={onClickSave}>保存</Button>
      </div>
    </Footer>

  )
}





export default connect((state: any) => ({
  kgDescModel: state.kgDescModel,
}))(App);
