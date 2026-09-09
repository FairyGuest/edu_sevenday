import { useEffect, useRef, useState } from "react";
import { getCurOrgValue, getStorageToken, getUserInfo } from "@/utils";
import "./index.less";
import { Spin } from "antd";
import { getQingliuUrl } from "@/utils/host";






const App = (props: any) => {
  const [loading, setLoading] = useState(true);
  const frameRef = useRef(null);

  const getDefaultSpace=()=>{

    const spaceList=getUserInfo("spaceList") || []
    const userId=getUserInfo("id") || []
    const curOrgId=getCurOrgValue("id")
    let defaultParam={"space-id":"", "tenant-id":"","user-id":""}
    for(const row of spaceList){
      const {schoolId,tenantId,spaceId}=row
      if(row["default"]=="Y" && schoolId==curOrgId){
        defaultParam= {"space-id":spaceId, "tenant-id":tenantId,"user-id":userId}
      }
   } 
   return defaultParam
  }

  
  const config = {
    origin: getQingliuUrl(),    // todo 区分环境
    userInfo: {
      jwt: `Bearer ${getStorageToken()}`,
      ...getDefaultSpace()
    },
  };

  useEffect(() => {

    console.log("config",config)
    const handleMessage = (event: any) => {
      
      console.log("发送消息 config",config)
      // debugger
      // 安全验证：检查消息来源
      // if (event.origin !== config.origin) return;
      // 收到子页面 'finish' 握手消息后，发送用户信息
      if (event.data === "finish" && frameRef.current?.contentWindow) {
        let childInfo = { info: config.userInfo };
        let childDomain = config.origin;
        frameRef?.current?.contentWindow?.postMessage(childInfo, childDomain);
        console.log("已发送用户信息:", config.userInfo);
      }
    };
    window.addEventListener("message", handleMessage);
    // 组件卸载时移除事件监听器
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <>
      <div className="qingliu_page">
        {/* Loading 组件：加载时显示 */}
        {loading && <Spin size="large" className="loading" />}

        <iframe
          className="qingliu_iframe"
          onLoad={() => setLoading(false)}
          ref={frameRef}
          src={`${getQingliuUrl()}${props.url}`}
        />
      </div>
    </>
  );
};

export default App;
