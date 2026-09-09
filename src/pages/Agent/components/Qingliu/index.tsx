import { getCurOrgValue, getStorageToken, getUserInfo } from "@/utils";
import { getQingliuUrl } from "@/utils/host";
import { useEffect, useRef } from "react";
import "./index.less";

const TestIframe = (props: any) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const spaceList = getUserInfo("spaceList") || [];
    const qingliuId = getUserInfo("pk") || "";
    const curOrgId = getCurOrgValue("id");

    let defaultParam = { "space-id": "", "tenant-id": "", "user-id": "" };

    for (const row of spaceList) {
      const { schoolId, tenantId, spaceId } = row;
      if (row["default"] == "Y" && schoolId == curOrgId) {
        defaultParam = {
          "space-id": spaceId,
          "tenant-id": tenantId,
          "user-id": qingliuId,
        };
      }
    }

    const userInfo = {
      jwt: getStorageToken(),
      ...defaultParam,
    };

    // 监听子应用的 finish 信号，收到后再发认证信息
    function handleChildMessage(event: MessageEvent) {
      if (event.data === "finish") {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          const message = { info: userInfo };
          iframe.contentWindow.postMessage(message, "*");
          console.log("子应用已准备好，发送认证信息:", message);
        }
        window.removeEventListener("message", handleChildMessage);
      }
    }

    window.addEventListener("message", handleChildMessage);

    return () => {
      window.removeEventListener("message", handleChildMessage);
    };
  }, []);

  return (
    <>
      <div className="qingliu_page">
        <iframe
          className="qingliu_iframe"
          ref={iframeRef}
          src={`${getQingliuUrl()}${props.url}`}
        />
      </div>
    </>
  );
};
export default TestIframe;
