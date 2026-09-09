import { connect, useDispatch, history } from "umi";
import { Button, Form, Input, message, Segmented, Modal, Radio } from "antd";
import "./index.less";
import { useEffect, useRef, useState } from "react";
import EditPassword from "@/components/EditPassword";
import { encrypt } from "./utils/index";
import { setStorageToken } from "@/utils";

const Login = (props: any) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [editPasswordModal, setEditPasswordModal] = useState(false);
  const [captchaImage, setCaptchaImage] = useState("");
  const captchaKeyRef = useRef("");

  const [alignValue, setAlignValue] = useState<any>('edu');

  // 机构选择弹窗相关状态
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [orgList, setOrgList] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | number>();
  const [orgLoginLoading, setOrgLoginLoading] = useState(false);
  const tempTokenRef = useRef<string>('');

  const refreshCaptcha = async () => {
    const { code, data } = await dispatch({
      type: "loginModel/getData",
      apiUrl: "getCaptchaUrl",
      payload: {},
    });
    if (code === 200 && data) {
      setCaptchaImage(data.image || "");
      captchaKeyRef.current = data.key || "";
    }
  };

  const onUserInfoUrl = async () => {
    const { code, data }: any = await dispatch({
      type: "loginModel/getData",
      apiUrl: "getUserInfoUrl",
      payload: {},
      msg: false, // 不显示错误信息
    });
    if (code === 200 && data) {
      localStorage.setItem("userInfotow", JSON.stringify(data));
    }
  }

  const onorgLoginUrl = async (orglist: any, tempToken: string) => {
    const { code, data }: any = await dispatch({
      type: "loginModel/postData",
      apiUrl: "postorgLoginUrl",
      payload: {
        ...orglist,
        tempToken: tempToken,
      },
    });
    if (code === 200) {
      console.log(data, "选择机构登录接口");
      const accessToken = "Bearer " + data?.authVO?.accessToken || "";
      const loginUserVO = data?.loginUserVO || {};
      const curOrg = loginUserVO.orgList?.[0] || {
        id: loginUserVO.orgId,
        title: loginUserVO.orgName,
      };
      setStorageToken(accessToken);
      localStorage.setItem("loginUserVO", JSON.stringify(loginUserVO));
      localStorage.setItem("userInfo", JSON.stringify(loginUserVO));
      if (curOrg?.id) {
        localStorage.setItem("curOrg", JSON.stringify(curOrg));
      }
      message.success("登录成功");
      setOrgModalOpen(false);
      history.push("/setTopic");
    }
  }

  // 弹窗确认按钮回调
  const handleOrgConfirm = async () => {
    if (!selectedOrgId) return;
    setOrgLoginLoading(true);
    const targetOrg = orgList.find(item => item.orgId === selectedOrgId) || {};
    await onorgLoginUrl(targetOrg, tempTokenRef.current);
    setOrgLoginLoading(false);
    onUserInfoUrl();
  }

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const onFinish = async (values: any) => {
    const { captcha, password, ...loginValues } = values;
    const encryptedPassword = encrypt(password);
    if (!encryptedPassword) {
      message.error("密码加密失败，请重试");
      return;
    }

    setLoading(true);
    let { code, data } = await dispatch({
      type: "loginModel/postData",
      apiUrl: "loginUrl",
      payload: {
        ...loginValues,
        password: encryptedPassword,
        captcha,
        accountType: alignValue === 'edu' ? 2 : 1,
        tenantCode: "z.ai",
      },
      headers: {
        "Captcha-Key": captchaKeyRef.current,
      },  // 添加Captcha-Key头部信息
      destroyOnClose: false, // 关闭弹窗时销毁子元素
      msg: false, // 不显示错误信息
    });

    setLoading(false);
    if (code !== 200) {
      refreshCaptcha();
    }
    if (code === 200) {
      const accessToken = "Bearer " + data?.authVO?.accessToken || "";
      const loginUserVO = data?.loginUserVO || {};
      const curOrg = loginUserVO.orgList?.[0] || {
        id: loginUserVO.orgId,
        title: loginUserVO.orgName,
      };
      setStorageToken(accessToken);
      localStorage.setItem("loginUserVO", JSON.stringify(loginUserVO));
      localStorage.setItem("userInfo", JSON.stringify(loginUserVO));
      if (curOrg?.id) {
        localStorage.setItem("curOrg", JSON.stringify(curOrg));
      }
      // onUserInfoUrl();
      message.success("登录成功");
      history.push("/source");
    }
    if (code === 3001) {

      // 打开机构选择弹窗，不再直接取第0项登录
      setOrgList(data?.orgList || []);
      tempTokenRef.current = data?.tempToken || '';
      setSelectedOrgId(undefined);
      setOrgModalOpen(true);
    }
  };

  return (
    <div className="login-container">
      <div className="login_nav_header">
        {/* <img src={require("@/assets/login_logo.png")} alt="" /> */}
      </div>
      <div className="login-box">
        <div className="login-header">
          {/* <h2>欢迎使用 FLOW</h2> */}
          <h1>登录您的账号</h1>
          <div className="login-header-segment">
            <Segmented
              value={alignValue}
              style={{ marginBottom: 8 }}
              onChange={setAlignValue}
              options={
                [{
                  label: 'edu登录',
                  value: 'edu',
                },
                {
                  label: '手机号登录',
                  value: 'mobile',
                }]
              }
            />
          </div>
        </div>
        <Form
          name="login"
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          autoComplete="off"
          className="login-form"
        >
          <Form.Item
            label="EID"
            name="account"
            rules={[{ required: true, message: "请输入EID账号" }]}
          >
            <Input size="large" placeholder="请输入EID账号" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input
              type="password"
              size="large"
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item label="验证码" className="captcha-form-item">
            <div className="captcha-row">
              <Form.Item
                name="captcha"
                rules={[{ required: true, message: "请输入验证码" }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input size="large" placeholder="请输入验证码" />
              </Form.Item>
              {captchaImage ? (
                <img
                  src={captchaImage}
                  alt="验证码"
                  className="captcha-img"
                  onClick={refreshCaptcha}
                  title="点击刷新验证码"
                />
              ) : (
                <div
                  className="captcha-img captcha-img-placeholder"
                  onClick={refreshCaptcha}
                  title="点击刷新验证码"
                />
              )}
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              立即登录
            </Button>
          </Form.Item>
          {/* <div className='signInNowBox'>
            <a href="/register">立即注册</a>
          </div> */}
        </Form>
      </div>
      {editPasswordModal && (
        <EditPassword
          editPasswordModal={editPasswordModal}
          handleCancel={() => {
            setEditPasswordModal(false);
          }}
        />
      )}

      {/* 机构选择弹窗 antd Modal + Radio */}
      <Modal
        title="请选择机构"
        open={orgModalOpen}
        onCancel={() => {
          if (!orgLoginLoading) {
            setOrgModalOpen(false);
          }
        }}
        footer={[
          <Button key="confirm" type="primary" loading={orgLoginLoading} disabled={!selectedOrgId} onClick={handleOrgConfirm}>
            确认登录
          </Button>
        ]}
        destroyOnClose
      >
        <Radio.Group
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
          style={{ width: '100%', maxHeight: '50vh', overflowY: 'auto' }}
        >
          {orgList.map(org => (
            <Radio key={org.orgId} value={org.orgId} style={{ display: 'block', marginBottom: 12 }}>
              {org.orgName}
            </Radio>
          ))}
        </Radio.Group>
      </Modal>

    </div>
  );
};

export default connect((state: any) => ({
  loginModel: state.loginModel,
}))(Login);