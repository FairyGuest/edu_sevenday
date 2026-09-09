import React, { useMemo, useEffect, useRef } from "react";
import ReactMarkdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm";  // 引入GFM插件，支持表格、任务列表等
import remarkMath from "remark-math";  // 引入数学公式插件
import rehypeKatex from "rehype-katex"; // 引入Katex插件，支持数学公式渲染
import rehypeRaw from "rehype-raw";  // 引入原始HTML插件，支持渲染原始HTML内容
import rehypeMathjax from "rehype-mathjax";  // 引入MathJax插件，支持数学公式渲染

import MarkMap from "@/pages/AgentInteractions/components/MarkMap";
import "./index.less";
import "katex/contrib/mhchem";  // 引入化学方程式插件
import { latexReplace } from "@/utils";
interface MarkdownRenderProps extends Options {
  children: string;
  className?: string;
}

const MarkdownRender: React.FC<MarkdownRenderProps> = ({
  children,
  className = "",
  remarkPlugins = [remarkGfm, remarkMath],
  rehypePlugins = [rehypeKatex, rehypeRaw, [rehypeMathjax]],
  ...rest
}) => {
  const classNames = [
    "markdown_container",
    "markdown_table_style",
    className,
  ].join(" ");

  // 思维导图检测
  const mindmapContent = useMemo(() => {
    if (typeof children !== "string") return null;
    const trimmed = children.trim();
    const match = trimmed.match(/^```markdown\s*([\s\S]*?)\s*```$/);
    return match ? match[1] : null;
  }, [children]);

  // 思维导图渲染
  if (mindmapContent) {
    return (
      <div className={classNames}>
        <MarkMap markdown={mindmapContent} />
      </div>
    );
  }
  function replaceMarkdownImagesDetailed(param: any) {
    let tmp = latexReplace(param)   // 公式处理
    tmp = tmp?.replace?.(/`\n/g, "")
    tmp = tmp?.replace?.(/\n`/g, "")
    tmp = tmp?.replace?.(/\n图/g, "图")
    return tmp || ""
  }
  return (
    <ReactMarkdown
      className={classNames}
      remarkPlugins={remarkPlugins}  // 引入GFM插件，支持表格、任务列表等
      // rehypePlugins={rehypePlugins}  // 引入原始HTML插件，支持渲染原始HTML内容
      rehypePlugins={
        [[
          rehypeMathjax, rehypeKatex, rehypeRaw,
          // {
          //   tex: {
          //     packages: { '[+]': ['enclose', 'amsmath'] },
          //     inlineMath: [['$', '$'], ['\\(', '\\)']],
          //     displayMath: [['$$', '$$'], ['\\[', '\\]']],
          //   },
          //   loader: {
          //     load: ['[tex]/enclose', '[tex]/amsmath'],
          //   },
          //   options: {
          //     skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
          //   },
          // },
        ]]
      }
      {...rest}
    // 引入数学公式插件，支持数学公式渲染
    // rehypePlugins={rehypePlugins}  // 引入原始HTML插件，支持渲染原始HTML内容
    >
      {replaceMarkdownImagesDetailed(children)}
    </ReactMarkdown>
  );
};

export default MarkdownRender;