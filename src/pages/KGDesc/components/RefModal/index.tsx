import React, { useState, useEffect, useImperativeHandle } from 'react'
import { Button, Form, Input, Drawer, Cascader, Select, Modal, InputNumber } from 'antd';
import { connect, useDispatch } from '@umijs/max';

import "./index.less"


const typeObj = {
  "add": "编辑学科材料",
  "edit": "编辑学科材料",
}

const App = (props: any) => {
  const { onRef } = props;
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [curRow, setCurRow] = useState({}); // 缓存编辑带过来的数据
  const [actType, setActType] = useState('add');
  const [subjectList, setSubjectList] = useState([]); // 学科数据
  const [levelList, setLevelList] = useState([]); // 水平数据
  const [laoding, setLoading] = useState(false); // 水平数据

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    showModal: (category = "add", param?: any) => {
      setOpen(true);
      setActType(category);
      setCurRow(param || {})
      if (category == "add") clearForm() // 添加初始化，清空之前表单信息
      if (category == "edit") initForm(param) // 修改初始化，
    },
  }));



  useEffect(() => {
    getLevel()
    getSubjectList()
  }, [])




  const onClose = () => {
    setOpen(false);
  };


  // 初始化表单
  const initForm = (param: any) => {
    const { ...rest } = param;
     console.log(rest,"param");
    form.setFieldsValue(rest);
    setCurRow(param)
  }

  // 清空表单
  const clearForm = () => {
    form.resetFields();
  }

  //  表单提交
  const handleOk = () => {
    form.submit()
  };

  // 取消弹框
  const handleCancel = () => {
    setOpen(false);
    setLoading(false);
    props?.onLoadTable?.() // 加载表格
  };


  const onFinish = async (param: any) => {
    setLoading(true)
    const payload = {
      ...param,
    }
    // if (actType == "add") {
    //   return await addData(payload)
    // }
    await updData(payload)
    setLoading(false)
  };




  // 修改数据
  const updData = async (values?: any) => {
  
    let { code, data } = await dispatch({
      type: 'kgDescModel/postData',
      apiUrl: "updDocUrl",
      isInfo: true, // api 请求成功提示
      payload: { ...values, doc_id: curRow["id"] }
    });
    if (code == 200) {
      handleCancel()
    }
  }




  // 获取表格数据    
  const getLevel = async (payload = {}) => {
    const { code, data = [] }: any = await dispatch({
      type: "k12Model/getData",
      apiUrl: "levelUrl",
      payload
    });
    setLevelList(data)
  }


  // 获取学科   
  const getSubjectList = async (payload = {}) => {
    const { code, data = [] }: any = await dispatch({
      type: "k12Model/getData",
      apiUrl: "subjectUrl",
      payload
    });

    //  数据格式处理
    const newData = data?.map((item: any) => {
      const { id, name } = item
      return { value: name, label: name }
    })

    setSubjectList(newData)
  }


  const onFinishFailed = () => {
    // setIsModalOpen(false);
  };




  return (
    <Modal
      title={`${typeObj[actType]}`}
      closable={{ 'aria-label': 'Close Button' }}
      onCancel={onClose}
      open={open}
      width={480}
      footer={
        <div className='text-right'>
          <Button onClick={onClose} className='mr-8'>取消</Button>
          <Button onClick={handleOk} loading={laoding} type="primary">确定</Button>
        </div>
      }
    >
      <Form
        name="userForm"
        labelCol={{ span: 20 }}
        form={form}
        onFinish={onFinish} // 表单提交回调函数
        onFinishFailed={onFinishFailed}  // 表单验证失败回调
        layout="vertical"

      >
        <Form.Item
          label="材料名称"
          name="name"

          rules={[{ required: true, message: '请输入材料名称', max: 20 }]}
        >
          <Input placeholder="请输入材料名称" showCount maxLength={20} />
        </Form.Item>

        <Form.Item
          label="描述"
          name="description"

          // rules={[{ required: true, message: '请输入描述', max: 30 }]}
        >
          <Input placeholder="请输入描述" showCount maxLength={30} />
        </Form.Item>


        <Form.Item
          label="学科"
          name="category"
          rules={[{ required: true, message: '请选择学科' }]}
        >
          <Select
            showSearch
            placeholder="请选择学科"
            options={subjectList}
          />
        </Form.Item>

        <Form.Item
          label="适用水平"
          name="edu_stage"
          rules={[{ required: true, message: '请选择适用水平' }]}
        >
          <Cascader
            fieldNames={{ label: "name", value: "id", children: "children" }}
            options={levelList}
            placeholder="请选择适用水平" />
        </Form.Item>

        {curRow?.label == "教材" &&
          <>
            <Form.Item
              label="版本"
              name="doc_version"
              rules={[{ required: true, message: '请选择版本', max: 20 }]}
            >
               <Input placeholder="请输入版本" showCount maxLength={20} />
            </Form.Item>

            <Form.Item
              label="出版社"
              name="publish"
              rules={[{ required: true, message: '请输入出版社', max: 20 }]}
            >
              <Input placeholder="请输入出版社" showCount maxLength={20} />
            </Form.Item>
          </>
        }


        <Form.Item
          label="页数总数"
          name="page_num"
          rules={[{ required: true, message: '请输入页数总数'}]}
        >
          <InputNumber placeholder="请输入页数总数" style={{ width: "100%" }} min={0} max={2000} />
        </Form.Item>


      </Form>

    </Modal>
  )
}



export default connect((state: any) => ({
  kgDescModel: state.kgDescModel,
  k12Model: state.k12Model,
}))(App);
