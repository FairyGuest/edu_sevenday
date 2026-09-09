import React, { useEffect, useRef, useState } from "react";
import {
  Affix,
  Alert,
  Avatar,
  Badge,
  Button,
  Dropdown,
  Popover,
  Select,
  notification,
  Tabs,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  FormattedMessage,
  connect,
  getLocale,
  history,
  setLocale,
  useDispatch,
} from "umi";

import "./index.less";
// import { getFormatMessage, getShopInfo, getUserInfo } from '@/utils';

const Header = (props: any) => {
  const ref = useRef();
  const dispatch = useDispatch();
  const [activateTab, setActivateTab] = useState("1");
  const localUserInfo = localStorage.getItem("userInfo") || "{}";
  const [userInfo, setUserInfo] = useState(JSON.parse(localUserInfo));
  const langKey = getLocale();

  useEffect(() => {
    // getData()
    // getLastMessageData()
    // getCementData()
    // openNotification()
  }, []);

  const getCementData = async (values?: any) => {
    let { code, result } = await dispatch({
      type: "commonModel/getData",
      apiUrl: "getCementUrl",
      payload: { ...values },
    });
  };

  const getData = async (values?: any) => {
    let { code, data } = await dispatch({
      type: "commonModel/getData",
      apiUrl: "getMessageUrl",
      payload: { ...values },
    });
  };

  const getLastMessageData = async (values?: any) => {
    let { code, data } = await dispatch({
      type: "commonModel/getData",
      apiUrl: "getLastMessageUrl",
      payload: { ...values, userId: getUserInfo("id") },
    });
  };

  const onClickLogout = () => {
    localStorage.clear();
    history.push("/login");
  };

  const openNotification = () => {
    const args = {
      message: "最新动态",
      description: (
        <div>
          <div>您有新的订单啦：张三 已下单团购套餐</div>
          <Button
            style={{
              float: "right",
            }}
            size="small"
            danger
            onClick={() => onClickDesc()}
          >
            查看
          </Button>
        </div>
      ),
      duration: 0,
    };
    notification.open(args);
  };

  const onChangeTab = (value: any) => {
    // console.log("value",value)
    setActivateTab(value);
  };

  const onClickDesc = (param?: any) => {};

  const handleChange = (param: any) => {
    setLocale(param, true);
  };

  const onClickRelation = (value: any) => {
    history.push("/relation");
  };

  const onClickStar = (value: any) => {
    history.push("/bashbord");
  };

  const onClickChatStar = (value: any) => {
    // setCategory(value)
  };
  const onClickChat = (value: any) => {
    // setCategory(value)
  };

  const items = [
    // {
    //   key: '1',
    //   label: (
    //     <div>个人中心</div>
    //   ),
    // },
    {
      key: "2",
      label: <div onClick={onClickLogout}>退出</div>,
    },
  ];

  return (
    <>
      <Affix offsetTop={0}>
        <div className="header_cotainer">
          <div>
            <span style={{ marginLeft: "16px" }}>
              <Select
                size="small"
                defaultValue={langKey}
                style={{ width: 90 }}
                onChange={handleChange}
                options={[
                  {
                    value: "ja-JP",
                    label: "日本語",
                  },
                  {
                    value: "en-US",
                    label: "English",
                  },
                  {
                    value: "zh-CN",
                    label: "中文",
                  },
                ]}
              />
            </span>

            <span className="header_avatar_container">
              <Avatar src={""} size="small" icon={<UserOutlined />} />
              {/* <Avatar src={ getShopInfo("shopLogo")} size="small" icon={<UserOutlined />} /> */}
            </span>

            <Dropdown menu={{ items }} placement="bottom">
              <span className="header_name_container">
                {userInfo?.realname || "测试"}
              </span>
            </Dropdown>
          </div>
        </div>
      </Affix>
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(Header);