import { connect, useDispatch } from '@umijs/max';
import {  history } from "umi";
import React, { useEffect, useImperativeHandle, useState } from 'react';
import { Modal } from 'antd';
import { Form, Input } from 'antd';
import { getUserInfo, uuid } from '@/utils';
import { getOrgId } from "@/utils";
import { LockOutlined } from '@ant-design/icons';

const App = (props: any) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsModalOpen(true)
  },[])

  // 初始化表单
  const initForm = (param: any) => {
    const { ...rest } = param;
    form.setFieldsValue(rest);
    // setCurRow(param)
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
    setIsModalOpen(false);
    props?.handleCancel()
  };


  const onFinish = (param: any) => {
    const payload = {
      ...param,
    }
    editFn(payload)
  };


  // 添加数据
  const editFn = async (values?: any) => {
    console.log('values', values)
    let payload = {
      old_password: values?.oldPassword,
      password: values?.newPassword,
      user_id:getUserInfo()
    }
    let { code, result } = await dispatch({
      type: 'commonModel/postData',
      apiUrl: "editPassUrl",
      isInfo: true, // api 请求成功提示
      payload
    });

    if (code == 200) {
      handleCancel()
      localStorage.clear();
      history.push("/login");
    }
  }




  const onFinishFailed = () => {
    // setIsModalOpen(false);
  };



  return (
    <>
       {/* orgRef.current?.showToolModal?.('addAdmin', param) */}
      {/* <a key="addAdimin" onClick={() =>{  setIsModalOpen(true)}}>添加管理员</a> */}
      <Modal
        forceRender={true} // 强制渲染 Modal
        destroyOnHidden={true} // 关闭时销毁 Modal 里的子元素
        width={500}
        title={`修改密码`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        maskClosable={false}
      >

        <Form
          name="userForm"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          initialValues={{ remember: true }}
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          style={{ marginTop: "24px" }}

        >
          <Form.Item
            label="原密码"
            name="oldPassword"
            rules={[{ required: true, message: '请输入原密码', min: 6 }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入原密码"
            />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[{ required: true, message: '请输入新密码，最少6位字符', min: 6 },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('oldPassword') !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('新密码与原密码不能相同'));
                },
              })
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码"
            />
          </Form.Item>
          <Form.Item
            label="确认密码"
            dependencies={['newPassword']}
            name="agentNewPassword"
            rules={[{ required: true, message: '请输入密码，最少6位字符', min: 6 },
              ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('您输入的密码不一致'));
                  },
                }),]}
              >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码"
            />
          </Form.Item>

        </Form>


      </Modal>
    </>
  );
};
export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(App);
