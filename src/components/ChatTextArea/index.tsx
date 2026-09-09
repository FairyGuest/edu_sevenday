import { message, Tooltip } from "antd";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { connect } from "umi";
import UploadChatFile from "./UploadChatFile";
import ShowChatFileList from "./ShowChatFileList";
import ZYIcon from "@/components/ZYIcon";

import "./index.less";

const InputTextArea = (props: any) => {
  const {
    line = 1,
    hiddenFileUpload,
    hiddenNewChat = false,
    isShowAgents,
    onChangeShowAgents,
    defaultValue = "",
    onRef,
  } = props;
  const { isShowAgentBtn, commonModel } = props;
  const { chatLoading } = commonModel || {};

  const sfRef = useRef<any>(null); // 显示文件
  const fileRef = useRef<any>(null); // 上传文件ref

  const contentEditableRef = useRef<any>(null); // 输入框ref

  useEffect(() => {
    setInputValue();
  }, []);

  const setInputValue = () => {
    contentEditableRef.current.innerHTML = defaultValue;
  };

  // 获取当前光标位置
  const insertBr = () => {
    const selection = window.getSelection();
    if (!selection) return;
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
    const fileList = fileRef?.current?.getFileArr();
    if (!value && hiddenFileUpload) {
      message.error({ content: "内容不能为空", key: "nullKey" });
      return;
    }
    if (!value && fileList?.length == 0) {
      message.error({ content: "内容不能为空", key: "nullKey" });
      return;
    }

    if (!hiddenFileUpload && fileRef?.current?.checkDone()) {
      message.error({ content: "内容上传中", key: "nullKey" });
      return;
    }
    props?.onSendQuery({ query: value, fileList });
    clearInput();
  };

  // 清输入框值
  const clearInput = () => {
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = "";
      sfRef.current?.onFileChange([]);
      fileRef.current?.clearFileArr();
    }
  };

  const isCompositionRef = useRef(false);
  const handleKeyDown = (event: any) => {
    if (isCompositionRef.current) {
      return;
    }
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

  const onCompositionStart = (e: any) => {
    isCompositionRef.current = true;
  };

  const onCompositionEnd = (e: any) => {
    isCompositionRef.current = false;
  };

  return (
    <>
      <div className="design_chat_textarea_contanier">
        {!hiddenNewChat && (
          <div
            className={
              chatLoading ? "new_create new_create_hidden" : "new_create"
            }
            onClick={props?.createNewTalk}
          >
            <ZYIcon
              type="aizhineng"
              style={{ color: "#444CE7", fontSize: 16, marginRight: 6 }}
            />
            <span>新建对话</span>
          </div>
        )}

        <div className={"home_query_container"}>
          <div className={`action_button_container`}>
            <ShowChatFileList
              onRef={sfRef}
              onClose={(...args: any) => {
                fileRef.current?.closeFile(...args);
              }}
            />
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
                onCompositionStart={onCompositionStart}
                onCompositionEnd={onCompositionEnd}
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

                  {hiddenFileUpload !== true && (
                    <div className="icon_box">
                      <UploadChatFile
                        onRef={fileRef}
                        onFileChange={(...args: any) => {
                          sfRef.current?.onFileChange(...args);
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="suffix_right">
                  <div
                    className="icon_box"
                    style={
                      getContent() || fileRef?.current?.checkDone()
                        ? { background: "#1C6CFF", color: "#ffffff" }
                        : { background: "#EDF4FF ", color: "#A8C8FF" }
                    }
                  >
                    {chatLoading ? (
                      <Tooltip title="停止生成">
                        <ZYIcon type="tingzhi" onClick={props?.onClickStop} />
                      </Tooltip>
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
      </div>
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(InputTextArea);
