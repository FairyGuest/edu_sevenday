import { connect, useDispatch } from "@umijs/max";
import { history } from "umi";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { Button, Modal } from "antd";
import { Form, Input, Popconfirm, InputNumber } from "antd";
import { getUserInfo, uuid } from "@/utils";
import { getOrgId } from "@/utils";
import { LockOutlined } from "@ant-design/icons";
import "./index.less";

const App = (props: any) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const USERNAME_REG = /^[\w!@#$%^&*()\-_=+\[\]{};:'"\\|,.<>~()/?]{6,20}$/;

  useEffect(() => {
    // setIsModalOpen(false);
    if (isModalOpen) {
      initForm();
    }
  }, [isModalOpen]);

  // 初始化表单
  const initForm = () => {
    form.setFieldsValue({
      password: "",
    });
    // setCurRow(param)
  };

  // 清空表单
  const clearForm = () => {
    form.resetFields();
  };

  //  表单提交
  const handleOk = () => {
    form.submit();
  };

  // 取消弹框
  const handleCancel = () => {
    setIsModalOpen(false);
    // props?.handleCancel();
  };

  const onFinish = (param: any) => {
    const payload = {
      ...param,
    };
    editFn(payload);
  };

  const editFn = async (values?: any) => {
    console.log("values", values);
    setLoading(true);
    let payload = {
      userName: props?.param?.edu_id,
      password: values?.password,
      // phone: props?.param?.phone,
    };
    let { code, result } = await dispatch({
      type: "commonModel/postData",
      apiUrl: "resetPasswordUrl",
      isInfo: true, // api 请求成功提示
      payload,
    });

    if (code == 200) {
      handleCancel();
    }
    setLoading(false);
  };

  const onFinishFailed = () => {
    // setIsModalOpen(false);
  };

  return (
    <>
      <Popconfirm
        placement="top"
        title={"确定重置密码吗？"}
        okText="确定"
        cancelText="取消"
        disabled={!props?.param?.edu_id}
        onConfirm={() => {
          setIsModalOpen(true);
        }}
      >
        <Button
          className="reset_password_btn"
          disabled={!props?.param?.edu_id}
          type="link"
          key="resetPassword"
        >
          重置密码
        </Button>
      </Popconfirm>

      <Modal
        forceRender={true} // 强制渲染 Modal
        destroyOnHidden={true} // 关闭时销毁 Modal 里的子元素
        width={500}
        title={`重置密码`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        maskClosable={false}
      >
        <Form
          name="userForm"
          // labelCol={{ span: 4 }}
          // wrapperCol={{ span: 20 }}
          initialValues={{ remember: true }}
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          style={{ marginTop: "24px" }}
          layout={"vertical"}
          className="reset_password_form_box_css"
        >
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 24 }}
            label={
              <div className="form_password_label_box">
                <div className="form_password_label">密码</div>
                <div className="form_password_label_tip">
                  可自行修改密码，6-20位
                </div>
              </div>
            }
            name="password"
            rules={[
              {
                required: true,
                message: "密码长度 6-20 位，支持大小写字母、数字及特殊符号",
              },
              {
                pattern: USERNAME_REG,
                message: "密码长度 6-20 位，支持大小写字母、数字及特殊符号",
              },
            ]}
          >
            <Input placeholder="请输入密码" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(App);
