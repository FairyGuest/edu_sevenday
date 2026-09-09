// 第三方入口页面，用于第三方登录
import { useDispatch, history } from "@umijs/max";
import { message, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { setStorageToken } from "@/utils";
// import "./index.less";
const prefix = "third_entry-container";
interface ThirdEntryProps {
  data?: "";
}
const ThirdEntry: React.FC<ThirdEntryProps> = function (
  props: ThirdEntryProps,
) {
  const dispatch = useDispatch();
  // 从url中获取token
  const accessToken = new URLSearchParams(window.location.search).get("accessToken");

  const ticket = new URLSearchParams(window.location.search).get("ticket");
  const checkToken = async () => {
    if (!(accessToken || ticket)) {
      message.error("token不存在,请重新登陆");
      history.push("/login");
      return;
    }
    let { code, data }: any = await dispatch({
      type: "thirdEntry/postData",
      apiUrl: accessToken ? "checkHdToken" : "checkTicket",
      payload: accessToken ? { accessToken } : { ticket },
    });
    if (code === 200) {
      localStorage.setItem("userInfo", JSON.stringify(data));
      localStorage.setItem(
        "curSpace",
        JSON.stringify(data?.creative_space_list?.[0]),
      ); // 设置当前创作空间
      localStorage.setItem("curOrg", JSON.stringify(data?.org_list?.[0])); // 设置当前组织
      setStorageToken(data._token);
      message.success("登录成功");
      history.push("/");
    } else {
      message.error("token验证失败,请重新登陆");
      history.push("/login");
    }
  };
  useEffect(() => {
    checkToken();
  }, []);
  return (
    <div
      className={prefix}
      style={{
        textAlign: "center",
      }}
    >
      <Spin spinning>
        <div
          style={{
            paddingTop: "30vh",
            height: "100vh",
          }}
        >
          加载中，请稍后...
        </div>
      </Spin>
    </div>
  );
};
export default ThirdEntry;
