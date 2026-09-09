import React, { useState } from 'react';
import { Input, message, Badge, Affix, Dropdown } from 'antd';

import {
  ShoppingCartOutlined,
  UserOutlined,
  HeartOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import logoSrc  from "@/assets/index/logo.png"


import { connect, history } from "umi";

import './index.less';
import { checkLogin, isLogin, windowOpen } from '@/utils';
const { Search } = Input;

const CommonHeader: React.FC = (props: any) => {
  const [inpVal, setInpVal] = useState(null);

  const onChange = (e) => {
    setInpVal(e.target.value.replace(/\s/g, ""))
  }
  const onPressEnter = (e) => {
    setInpVal(e.target.value.replace(/\s/g, ""))
    if (!inpVal) {
      message.error({
        content: '请输入搜索内容',
        key: 1
      });
    }
  }

  const search = () => {
    if (!inpVal) {
      message.error({
        content: '请输入搜索内容',
        key: 1
      });
    }
  }


  const onLogout = () => {
    localStorage.clear()
    history.push("/")
    location.reload()
  }


  const { countObj } = props.indexModel;

  const items = [
    {
      key: '1',
      label: (
        <a target="_blank" rel="noopener noreferrer" onClick={() => onLogout()}>
          退出登录
        </a>
      ),
    },
    {
      key: '2',
      label: (
        <a target="_blank" rel="noopener noreferrer" onClick={() => history.push('/userCenter')}>
          管理中心
        </a>
      ),
    },
  ];


  const goRouter=(url:any)=>{

   if(checkLogin()){
    history.push(url)
   }

  }



  return (
    <>
      <Affix offsetTop={0}>
        <div className={'common_header'}>
          <div className={'header_content'}>
            <img className={'header_logo'} onClick={() => windowOpen("/")} src={logoSrc} alt="" />
          </div>
        </div>
      </Affix>
    </>
  );
};

export default connect((state: any) => ({
  indexModel: state.indexModel,
}))(CommonHeader);
