import { Input, Button, message } from "antd";
import {
  UploadOutlined,
  PictureOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { connect, history, useDispatch } from "umi";
import UploadChatFile from "@/pages/Assistant/components/CustomChat/UploadChatFile";
import ShowChatFileList from "@/pages/Assistant/components/CustomChat/ShowChatFileList";
import { ZYIcon } from '@/components'
import "./index.less";
import { flushSync } from "react-dom";

const InputTextArea = (props: any) => {
  const { loading, line = 1, isShowAgents, onChangeShowAgents } = props;
  const sfRef = useRef<any>(null); // 显示文件
  const fileRef = useRef<any>(null); // 上传文件ref
  const { isShowAgentBtn, assistantModel } = props;
  const { recAgentListObj } = assistantModel;
  const dispatch = useDispatch();

  const contentEditableRef = useRef<any>(null); // 输入框ref

  useEffect(() => {}, []);

  const insertBr = () => {
    // 获取当前光标位置
    const selection = window.getSelection();
    const range =
      selection.rangeCount > 0
        ? selection.getRangeAt(0)
        : document.createRange();

    // 创建一个 br 元素来实现换行
    const br = document.createElement("br");
    range.insertNode(br);

    // 将光标移动到 br 元素之后
    range.setStartAfter(br);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  // 获取输入框值
  const getContent = () => {
    // const text = contentEditableRef?.current?.innerHTML || ""; // 带有 Html
    const text = contentEditableRef.current?.innerText;
    return text?.trim();
  };

  // 与大模型问答
  const onClickSend = async (value: any) => {
    if (!value) {
      message.error({ content: "内容不能为空", key: "nullKey" });
      return;
    }

    if (!fileRef?.current?.checkDone()) {
      message.error({ content: "内容上传中", key: "nullKey" });
      return;
    }
    history.push("/square/chat?id=0bf43032-2dac-457d-b36e-1e80c65389a6", {
      query: value,
    });
  };

  const handleKeyDown = (event: any) => {
    if (event.key == "Enter") {
      event.preventDefault(); // 阻止默认的换行行为
      if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
        insertBr();
        return; // shift + enter 换行
      }
      onClickSend(getContent());
    }
  };

  const [, forceUpdate] = useState([]);
  const onInput = (e: any) => {
    forceUpdate([]);
  };

  return (
    <div className={"home_query_container"}>
      <div className={`action_button_container`}>
        <ShowChatFileList onRef={sfRef} onClose={fileRef?.current?.closeFile} />
        <div className="input-chat-wrapper">
          <div
            contentEditable
            ref={contentEditableRef}
            spellCheck={false} // 禁止红色波浪线
            // placeholder="输入关键词提问，查找智能体，或者复制网址..."
            placeholder="发消息或输入你的问题（清除上下文后回答效果更好）"
            className="search_home_input_box"
            onKeyDown={handleKeyDown}
            onInput={onInput}
            style={{
              minHeight: 24 * line,
            }}
          />
          <div className="suffix">
            <div className="upload-icon-wrapper">
              {isShowAgentBtn && (
                <div
                  className={`icon_box ${isShowAgents ? "active" : ""}`}
                  onClick={() => {
                    onChangeShowAgents?.();
                  }}
                >
                  <ZYIcon type="zhinengti" size={20} />
                </div>
              )}
              <div className="icon_box">
                <UploadChatFile
                  onRef={fileRef}
                  onFileChange={sfRef?.current?.onFileChange}
                />
              </div>
            </div>
            <div className="suffix_right">
              <div
                className="icon_box"
                style={
                  !getContent() || !fileRef?.current?.checkDone()
                    ? { background: "#94A0B8 ", color: "#F2F5FA" }
                    : { background: "#444CE7", color: "#ffffff" }
                }
              >
                {loading ? (
                  <ZYIcon type="tingzhi" onClick={props?.onClickStop} />
                ) : (
                  <ZYIcon
                    type="send"
                    size={20}
                    onClick={() => onClickSend(getContent())}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect((state: any) => ({
  assistantModel: state.assistantModel,
}))(InputTextArea);
