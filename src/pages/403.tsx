import { Button, Result } from "antd";
import React from "react";
import { history } from "umi";
import { getDvaApp } from "@@/plugin-dva/exports";

const NoFoundPage: React.FC = () => {
  getDvaApp()._store.dispatch({ type: "commonModel/showAdModal" });

  return (
    <Result
      status="403"
      title="403"
      subTitle="对不起，你没有权限访问该页面"
      extra={
        <Button type="primary" onClick={() => history.goBack()}>
          返回
        </Button>
      }
    />
  );
};

export default NoFoundPage;
