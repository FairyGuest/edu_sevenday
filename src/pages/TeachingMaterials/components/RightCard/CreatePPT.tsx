import { connect, useLocation } from "@umijs/max";
import { Button, Modal, Segmented, Skeleton, Spin } from "antd";
import { AppstoreOutlined, BarsOutlined, ConsoleSqlOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import MarkdownRender from "@/components/MarkdownRender";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./index.less";
import "./CreatePPT.less";
import { CodeBlock, scrollTop } from "@/utils";
import Collapse from "./Collapse";

const App = (props: any) => {
  const { scaleNum, data, modelData } = props;
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('think')

  const handleIframeLoad = () => {
    setLoading(false);
  };

  // let status = data?.status;
  let start = "\`\`\`html";
  let end = "\`\`\`";

  const codeRef = useRef(null);

  const sty = {
    width: `${Math.floor(1080 * scaleNum)}px`,
    height: `${Math.floor(720 * scaleNum)}px`,
    position: "relative",
  };

  useEffect(() => {
    scrollTopChat();
  }, [props]);

  const scrollTopChat = () => {
    setTimeout(() => {
      scrollTop(codeRef);
    }, 100);
  };

  const onChangeSegmented = (data, value: any) => {
    // status = value;
    console.log("onchange----", data, value)
    setStatus(value)
  }

  return (
    <div className="ppt_container">
      <div className="ppt_page_item">
        <div>
          <Segmented
            value={status}
            onChange={(param: any) =>
              onChangeSegmented?.(data, param)
            }
            options={[
              { label: "预览", value: "preview", icon: <BarsOutlined /> },
              { label: "代码", value: "code", icon: <AppstoreOutlined /> },
              { label: "思考", value: "think", icon: <AppstoreOutlined /> },
            ]}
          />
        </div>

        <div>
          {data?.index || 1} / {modelData[0].glmBlock.slide_num || 1}
        </div>
      </div>

      {modelData.map((record: { details: string; thinkStatus: boolean; content: string, glmBlock: {} }, index: Key | null | undefined) => {
        if (status == 'code' || status == 'preview') {
          if (!record.glmBlock?.html) return;
        }
        return <div key={index} className="markdown-prose">
          {/* 思考*/}
          {status == "think" && (<div className="my-3">
            <Collapse data={record.details}
              thinkStatus={record.thinkStatus}
              className={index === 0 ? "rounded-xl" : "rounded-xl"} />
            {/* <p>{record.content}</p> */}
            <MarkdownRender
              className="markdown-prose text-xs my-3"
              components={{
                blockquote: ({ node, ...props }) => {
                  return (
                    <blockquote className="text-xs" {...props} />
                  );
                },
                ol: ({ node, ...props }) => {
                  return (
                    <ol className="ml-3" style={{ marginLeft: '2em' }} start={1} {...props} />
                  );
                }
              }
              }
            >{record.content}</MarkdownRender>
          </div>)}

          {status == 'code' && <div className="h-full w-full flex overflow-auto">
            <SyntaxHighlighter
              lineNumberContainerStyle={{
                padding: '0 10px',
                color: '#000',
                backgroundColor: '#fff',
                borderRight: '1px solid red',
              }}
              showLineNumbers
              PreTag="div"
              children={record.glmBlock.html}
              language="html"
              style={oneLight}
              className="syntax-highlighter"
            />
          </div>}

          {status == 'preview' && <div className="w-full overflow-hidden relative mt-3" style={{
            height: `${modelData[0].glmBlock.height / 2}px`
          }}>
            <iframe title="PPT" srcDoc={record.glmBlock.html} frameBorder="0" allowFullScreen={false}
              className="absolute top-0 left-0 w-auto h-auto rounded-b-xl "
              style={{ border: "none", width: modelData[0].glmBlock.width, height: modelData[0].glmBlock.height, transform: "scale(0.47)", transformOrigin: "left top" }}
            >

            </iframe>
          </div>
          }

        </div>
      })}

      {/* 思考*/}

    </div >
  );
};
export default connect((state: any) => ({
  designModel: state.designModel,
  commonModel: state.commonModel,
}))(App);
