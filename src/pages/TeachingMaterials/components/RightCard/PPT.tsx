import { Segmented } from "antd";
import { useEffect, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import MarkdownRender from "@/components/MarkdownRender";
import "./PPT.less";
import { latexReplace } from "@/utils";

const PPT = (props: any) => {
  // 1280 / 720
  const { data = {} } = props;
  const [alignValue, setAlignValue] = useState("预览");
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(400);

  useEffect(() => {
    if (alignValue === "预览") {
      const iframe_container = ref.current;
      if (!iframe_container) return;

      const updateHeight = () => {
        const width = iframe_container.clientWidth;
        const a = 720 / 1280;
        setHeight(width * a);
      };

      // 初始更新高度
      updateHeight();

      // 使用 ResizeObserver 监听宽度变化
      const resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });

      resizeObserver.observe(iframe_container);

      // 组件卸载时清除观察者
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [alignValue]);

  return (
    <div className="design_ppt_container">
      <div className="design_ppt_header">
        <Segmented
          value={alignValue}
          onChange={setAlignValue}
          // options={["预览", "代码", "思考中"]}
          options={["预览", "思考中"]}
        />
      </div>
      {alignValue == "预览" && (
        <div
          ref={ref}
          className="iframe_container"
          style={{ height: `${height}px` }}
        >
          <div
            className="html-content-viewer"
            style={{ transform: `scale(${height * 0.0013861548556430446})` }}
          >
            <iframe src={data?.url} frameBorder="0"></iframe>
          </div>
        </div>
      )}
      {alignValue == "代码" && (
        <div style={{ height: 400, overflow: "auto" }}>
          <SyntaxHighlighter
            PreTag="div"
            children={data.html}
            language="html"
            style={{ ...vscDarkPlus }}
            className="syntax-highlighter"
          />
        </div>
      )}
      {alignValue == "思考中" && (
        <div style={{ padding: 16, height: 400, overflow: "auto" }}>
          <MarkdownRender>{latexReplace(data.think)}</MarkdownRender>
        </div>
      )}
    </div>
  );
};
export default PPT;
