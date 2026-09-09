import { connect, useDispatch, history } from 'umi';
import { Button, Form, Input, message } from 'antd';
import { MobileOutlined, UserOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
// import loginBg from '@/assets/login-bg.png';
import './index.less';
import { useEffect, useState } from 'react';

const App = (props: any) => {

  const {registerModel}=props
  const {loading}=registerModel
  const dispatch = useDispatch();

  // 获取url中的code参数
  const urlParams = new URLSearchParams(window.location.search);
  const [code, setCode] = useState<string | null>(urlParams.get('code'));

  useEffect(() => {
    if (!code) {
      history.push("/login")
      }
  },[])

  const onFinish = async (values: any) => {

    let { code, data, message:msg } = await dispatch({
      type: 'registerModel/postData',
      apiUrl: "registerUrl",
      payload: { ...values }
    });

    if (code === 200) {
      // localStorage.setItem("accessToken", data.__token)
      // localStorage.setItem("userInfo", JSON.stringify(data))
      message.success('注册成功')
      history.push('/login')
    }
  };


  // const onFinish = async (values: any) => {
  //   setLoading(true)
  //   let { code, data, msg } = await dispatch({
  //     type: 'loginModel/postData',
  //     apiUrl: "loginUrl",
  //     payload: { ...values }
  //   });

  //   if (code === 200) {
  //     localStorage.setItem("accessToken", data.__token)
  //     localStorage.setItem("userInfo",JSON.stringify(data))
  //     message.success('登录成功')
  //     history.push('/')
  //   } else {
  //     message.error(msg || '登录失败, 请联系管理员')
  //   }
  //   setLoading(false)
  // };









  return (
    <div className='login-container'>
      <div className='login_nav_header'>
        {/* <img src={require("@/assets/login_logo.png")} alt="" /> */}
      </div>
      <div className="login-box">
        <div className="login-header">
          <h2>欢迎使用 FLOW</h2>
          <h1>注册您的账号</h1>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          className="login-form"
          initialValues={{ org_code: code || '' }} // 设置机构码的默认值
        >
           <Form.Item
            name="name"
            rules={[{ required: true, message: '请输入用户名，最少6位字符', min: 2, max: 6 }]}
          >
            <Input
              prefix={<UserOutlined />}
              size="large"
              placeholder="请输入用户名"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: new RegExp(/^1[3456789]\d{9}$/, "g"), message: '请输入正确的手机号' }
            ]}
          >
            <Input
              prefix={<MobileOutlined />}
              size="large"
              placeholder="请输入手机号"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码，最少6位字符', min: 6 }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              size="large"
              placeholder="请输入密码"
            />
          </Form.Item>



          <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: '请输入确认密码,最少6位字符',
                min: 6
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('您输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入确认密码" />
          </Form.Item>

          <Form.Item
            name="org_code"
            rules={[{ required: true, message: '请输入6位机构码', max: 6 }]}
          >
            <Input
              prefix={<BankOutlined />}
              size="large"
              disabled
              placeholder="请输入机构码"
            />
          </Form.Item>




          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              立即注册
            </Button>
          </Form.Item>
        </Form>
        <div className='signInNowBox'>
           <a href="/login">立即登陆</a>
        </div>
      </div>
    </div>
  );
};

export default connect((state: any) => ({
  registerModel: state.registerModel,
}))(App);
