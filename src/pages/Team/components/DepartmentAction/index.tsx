import { useImperativeHandle, useState } from "react";
import { connect, useDispatch } from '@umijs/max';
import { Input, Modal, Form, message, } from 'antd';
import AvatarUpload from "@/components/AvatarUpload";

import { getOrgId } from "@/utils";

import "./index.less"


const App = (props: any) => {

  const { teamModel, onRef } = props;
  let {  deptLoading } = teamModel
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [curRow, setCurRow] = useState(null);


  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    showModal: (param = null) => {
      setIsModalOpen(true)
      setCurRow(param)
      form.setFieldsValue(param || {})
      if(!param){
      form.resetFields()
      }
    },
  }));



  //  表单提交
  const handleOk = () => {
    form.submit()
  };

  // 取消弹框
  const handleCancel = () => {
    setIsModalOpen(false);
    props?.reload?.()
  };



  // 添加或者更新数据
  const onFinish = async (values?: any) => {
    if (values?.title && values?.title?.length > 15) {
      message.warning('名称最多15个字符')
      return
    }
    let payload = { ...values, org_id: getOrgId() }
    if (curRow) {
      payload["id"] = curRow.id
    }

    let { code } = await dispatch({
      type: 'teamModel/postData',
      apiUrl: curRow ? "updDepartmentUrl" : "addDepartmentUrl",
      isInfo: true, // api 请求成功提示
      mLoading: 'deptLoading',
      payload
    });

    if (code == 200) {
      handleCancel()
    }
  }


  const onFinishFailed = () => {
    // setIsModalOpen(false);
  };


  return <>

    <Modal
      forceRender={true} // 强制渲染 Modal
      destroyOnHidden={true} // 关闭时销毁 Modal 里的子元素
      width={480}
      title={`添加部门`}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={deptLoading}

    >
      <Form
        name="userForm"
        // layout="vertical"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        initialValues={{}}
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        style={{ marginTop: "24px", marginBottom: '-16px' }}

      >

        <Form.Item
          label="名称"
          name="title"
          rules={[{ required: true, message: '部门名称' }]}
        >
          <Input maxLength={15} showCount  />
        </Form.Item>

        <Form.Item
          label="描述"
          name="info"
        >
          <Input.TextArea showCount maxLength={50} />
        </Form.Item>

        <Form.Item
          label="icon"
          name="icon"
        >
          <AvatarUpload  listType={"picture-card"} />
        </Form.Item>
      </Form>

    </Modal>

  </>
};


export default connect((state: any) => ({
  teamModel: state.teamModel,
}))(App);
