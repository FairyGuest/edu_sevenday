


import { appcenterUrl, knowledgeUrl } from "@/utils/host";
import { LoadingOutlined } from "@ant-design/icons";
import { getOrgId, getUserInfo } from "@/utils";
import { Spin } from "antd";
import { useState } from "react";

const MassApplication = () => {
  const iframe_src = "https://edu.aiworkflow.cn/mass-front/"+"?user_id=" +
    getUserInfo("phone") +
    "&user_name=" +
    getUserInfo("name") +
    "&org_id=" +
    getOrgId();
  // const iframe_src = appcenterUrl + 'intelligent/center';
  const [loading, setLoading] = useState(true);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <Spin
      size="small"
      indicator={<LoadingOutlined spin />}
      spinning={loading}
      style={{ width: "100%", height: "100vh", maxHeight: "100vh" }}
    >
      <iframe
        onLoad={handleIframeLoad} // 加载完成
        src={iframe_src}
        style={{ width: "100%", height: "100vh" }}
      ></iframe>
    </Spin>
  );
};

export default MassApplication;
