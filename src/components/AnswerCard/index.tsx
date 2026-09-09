import { connect } from "umi";

import React, { memo, useRef, useState } from "react";
import MarkdownRender from "@/components/MarkdownRender";
import { formatStaticUrl, latexReplace } from "@/utils";
import {
  ArrowRightOutlined,
  FileMarkdownOutlined,
  FilePptOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import ZYIcon from "@/components/ZYIcon";
import { message, Radio, Tooltip } from "antd";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import "./index.less";

const AnswerCard = (props: any) => {
  const markdownRef = useRef(null);

  const { row, isEndNode, category, defaultName, designModel } = props;
  const { loading } = row || {};

  const avatarCls = `${loading ? "assistant_avatar_activate" : "assistant_avatar"}`; // 头像样式
  const curAssistant = {};

  const onChangeAciton = async (param: any) => {
    if (param == "markdown") {
      navigator?.clipboard.writeText(row.text);
      message.success("复制成功");
      return;
    }

    if (param == "text") {
      navigator?.clipboard?.writeText(markdownRef.current.innerText);
      message.success("复制成功");
      return;
    }
    props?.setMockPPT?.(row.text);
  };

  return (
    <>
      <div className="answer_card_container">
        <div className="assistant_basic">
          <div className={`${avatarCls}`}>
            <ZYIcon type={"logo"} style={{ fontSize: 18 }} />

            {/* <img
              className={`${avatarCls}`}
              src={
                formatStaticUrl(curAssistant?.icon) ||
                require("@/assets/avatar.png")
              }
              alt="头像"
            /> */}
          </div>

          <div className="assistant_name">
            智谱AI
            {/* {`${curAssistant?.title || defaultName || "教案助手"}`} */}
          </div>
        </div>

        {row?.text && (
          <>
            <div className="design_answer_content" ref={markdownRef}>
              <MarkdownRender
                components={{
                  pre: ({ children }: any) => {
                    const modifiedChildren = React.Children.map(
                      children,
                      (child) => {
                        if (React.isValidElement(child)) {
                          // @ts-ignore
                          return React.cloneElement(child, {
                            codeBlock: true,
                          });
                        }
                        return child;
                      },
                    );

                    return <pre>{modifiedChildren}</pre>;
                  },
                  code(props) {
                    const { children, codeBlock, className, node, ...rest } =
                      props;

                    const match = /language-(\w+)/.exec(className || "");
                    const codeText = String(children).replace(/\n$/, "");
                    const [copied, setCopied] = useState(false);
                    if (!codeBlock) {
                      return <code className={className}>{children}</code>;
                    }

                    // 复制代码函数
                    const handleCopy = () => {
                      // copyText(codeText);
                      setCopied(true);

                      // 2秒后重置复制状态
                      setTimeout(() => {
                        setCopied(false);
                      }, 2000);
                    };

                    return (
                      <div className="code-block-wrapper">
                        <div className="code-block-header">
                          <span>{match?.[1]}</span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            {/* {match?.[1]?.toLocaleUpperCase() ===
                              "HTML" &&
                              codeText
                                ?.trim?.()
                                ?.startsWith("<!DOCTYPE html>") && (
                                <span
                                  className="copy-button cursor-pointer"
                                  onClick={() => {
                                    // setPreviewHtml(codeText);
                                    // setShowPreview(true);
                                  }}
                                >
                                  预览
                                </span>
                              )} */}
                            <Tooltip
                              title={
                                copied
                                  ? "已复制"
                                  : match?.[1]
                                    ? "复制代码"
                                    : "复制"
                              }
                            >
                              <span
                                onClick={handleCopy}
                                className={`copy-button ${copied ? "copied" : ""} cursor-pointer `}
                              >
                                {/* {copied ? <CheckOutlined /> : <CopyOutlined />} */}
                                <span className="text-12!">
                                  {copied ? "已复制" : "复制"}
                                </span>
                              </span>
                            </Tooltip>
                          </div>
                        </div>
                        <SyntaxHighlighter
                          {...rest}
                          PreTag="div"
                          children={codeText}
                          language={match?.[1]}
                          style={vscDarkPlus}
                          className="syntax-highlighter"
                        />
                      </div>
                    );
                  },
                }}
              >
                {latexReplace(row.text || row)}
              </MarkdownRender>
            </div>

            {row?.loading == false && isEndNode && (
              <>
                {category == "ppt" && (
                  <div className="design_action_container">
                    <Radio.Group
                      size={"small"}
                      value={"end"}
                      onChange={(e) => onChangeAciton(e.target.value)}
                    >
                      <Tooltip title={"复制 markdown "}>
                        <Radio.Button value="markdown">
                          <FileMarkdownOutlined />
                        </Radio.Button>
                      </Tooltip>
                      <Tooltip title={"复制文本"}>
                        <Radio.Button value="text">
                          <FileTextOutlined />
                        </Radio.Button>
                      </Tooltip>
                      <Tooltip title={"生成PPT"}>
                        <Radio.Button value="ppt">
                          <FilePptOutlined />
                        </Radio.Button>
                      </Tooltip>
                    </Radio.Group>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
  designModel: state.designModel,
}))(memo(AnswerCard));
