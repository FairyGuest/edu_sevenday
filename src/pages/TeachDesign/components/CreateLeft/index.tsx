import { useState, useEffect, useRef } from "react";
import { Button, message } from "antd";
import { DotLottieReact, setWasmUrl } from "@lottiefiles/dotlottie-react";
import MarkdownRender from "@/components/MarkdownRender";
import { ZYIcon } from "@/components";

import "./index.less";

// 加载本地wasm文件
// setWasmUrl("/dotlottie-player.wasm");

const CreateLeft = (props: any) => {
  const { content, detailData, onSend, disabledSend } = props;
  const { chat_content, status, is_final_version } = content;

  const [messageApi, contextHolder] = message.useMessage();
  const contentRef = useRef<HTMLDivElement>(null); // 创建内容
  const [chatContent, setChatContent] = useState<string>(""); // 内容
  const [showExpand, setShowExpand] = useState(false); // 是否有展开收起
  const [isClose, setIsClose] = useState(true); // 默认收起

  useEffect(() => {
    setChatContent(chat_content || "");
    const dom = contentRef.current;
    if (!dom || status == "loading") return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0].contentRect.height >= 440) {
        setShowExpand(true);
      }
    });
    observer.observe(dom);

    return () => observer.disconnect();
  }, [chat_content, status]);

  useEffect(() => {
    if (status == "loading") {
      setIsClose(false);
    }
  }, [status]);

  // 发送拦截
  const sendStop = (msg: string) => {
    if (detailData?.is_new_evaluate === 1) {
      messageApi.warning("教案评估中，请稍后");
      return;
    }
    onSend(msg);
  };

  return (
    <div className="create-left">
      <div className="create-content">
        {status == "thinking" && (
          <div className="create-content-loading">
            <DotLottieReact
              className="loading-lottie"
              loop
              autoplay
              src={require("@/assets/roobot.lottie")}
            />
            人机协作中...
          </div>
        )}
        <div
          ref={contentRef}
          className="create-content-chat"
          style={{ maxHeight: isClose ? 440 : "100%" }}
        >
          <MarkdownRender>{chatContent}</MarkdownRender>
        </div>

        {showExpand && isClose && (
          <div className="create-content-mask">
            <div className="create-content-overlay"></div>
          </div>
        )}

        {showExpand && (
          <div className="create-content-expand">
            <Button
              color="primary"
              variant="link"
              onClick={() => setIsClose(!isClose)}
            >
              {isClose ? "展开" : "收起"}
              <ZYIcon type={isClose ? "xia" : "shang"} />
            </Button>
          </div>
        )}

        {status == "error" && (
          <div className="create-content-error">
            <ZYIcon type="jinggao" />
            模型生成异常，输出内容失败，请重试
          </div>
        )}

        {is_final_version && !disabledSend && (
          <div
            className="create-content-final"
            onClick={() => sendStop("生成定稿")}
          >
            <ZYIcon type="dinggao" style={{ color: "#1c6cff4a" }} />
            整合多轮对话中全部建议与修改内容，生成最新教学设计文档
            <ZYIcon type="jiantou2" />
          </div>
        )}
      </div>
      {contextHolder}
    </div>
  );
};

export default CreateLeft;
