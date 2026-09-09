import { connect, useDispatch, history } from "umi";
import { Button, Form, Input, message, Tag } from "antd";
import {
  MobileOutlined,
  UserOutlined,
  LockOutlined,
  BankOutlined,
} from "@ant-design/icons";
import "./index.less";
import { useEffect, useState } from "react";
import { getUserInfo } from "@/utils";
import AvatarUpload from "@/components/AvatarUpload";
import avatar from "@/assets/avatar.png";

const App = (props: any) => {
  const { profileModel } = props;
  const { loading } = profileModel;
  const dispatch = useDispatch();

  const [form] = Form.useForm();

  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    let {
      code,
      data,
      message: msg,
    } = await dispatch({
      type: "profileModel/postData",
      apiUrl: "getUrl",
      payload: { id: getUserInfo("id") },
    });

    if (code !== 200) return message.error(msg || "获取失败");
    if (code === 200) {
      setUserInfo(data);
      form.setFieldsValue({ ...data });
    }
  };

  const onFinish = async (values: any) => {
    let {
      code,
      data,
      message: msg,
    } = await dispatch({
      type: "profileModel/postData",
      apiUrl: "updUrl",
      payload: {
        id: getUserInfo("id"),
        ...values,
      },
    });

    if (code !== 200) return message.error(msg || "修改失败");
    if (code === 200) {
      // localStorage.setItem("accessToken", data.__token)
      // localStorage.setItem("userInfo", JSON.stringify(data))
      message.success("修改成功");

      // 更新localStorage
      let userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...userInfo, ...values }),
      );

      dispatch({
        type: "commonModel/updateState",
        res: {
          avatarChange: true,
        },
      });
    }
  };

  // list渲染tag
  const getList = (list: [], color: string) => {
    return list?.map((item: any) => {
      return item?.title ? <Tag color={color}>{item?.title}</Tag> : "";
    });
  };

  const onFinishFailed = () => {
    // setIsModalOpen(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-box">
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
          style={{ marginTop: "24px", marginBottom: "-16px" }}
        >
          <Form.Item label="头像" name="avatar" initialValue={userInfo?.avatar}>
            <AvatarUpload listType={"picture-card"} />
          </Form.Item>

          <Form.Item label="手机号" name="phone">
            {userInfo?.phone}
          </Form.Item>

          <Form.Item label="组织" name="org_list">
            {getList(userInfo?.org_list, "volcano")}
          </Form.Item>

          <Form.Item label="部门" name="department_list">
            {getList(userInfo?.department_list, "orange")}
          </Form.Item>

          <Form.Item label="群组" name="department_list">
            {getList(userInfo?.group_list, "gold")}
          </Form.Item>

          <Form.Item label="创作空间" name="creative_space_list">
            {getList(userInfo?.group_list, "lime")}
          </Form.Item>

          <Form.Item
            label="用户名"
            name="name"
            initialValue={userInfo?.name}
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="请输入用户名" maxLength={10} />
          </Form.Item>

          <Form.Item
            label="电子邮件"
            name="email"
            initialValue={userInfo?.email}
            rules={[
              { type: "email", message: "请输入有效的电子邮件地址" }, // 格式校验
            ]}
          >
            <Input placeholder="请输入电子邮件" maxLength={50} />
          </Form.Item>

          <Form.Item label="个人介绍" name="info" initialValue={userInfo?.info}>
            <Input.TextArea
              placeholder="请输入个人介绍"
              showCount
              maxLength={50}
            />
          </Form.Item>

          <Form.Item className="mt-50" wrapperCol={{ offset: 4, span: 18 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default connect((state: any) => ({
  profileModel: state.profileModel,
}))(App);
