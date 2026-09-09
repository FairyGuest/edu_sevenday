import React, { useMemo } from "react";
import ReactMarkdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

import MarkMap from "@/pages/AgentInteractions/components/MarkMap";

import "katex/dist/katex.min.css";
import "katex/contrib/mhchem"; // 支持化学方程式 \ce 语法
import "./index.less";
import { latexReplace } from "@/utils";

interface MarkdownRenderProps extends Options {
  children: string;
}




const MarkdownRender: React.FC<MarkdownRenderProps> = ({
  children,
  className = "",
  remarkPlugins = [remarkGfm, remarkMath],
  rehypePlugins = [rehypeKatex, rehypeRaw],
  ...rest
}) => {
  const classNames = [
    "markdown_container",
    "markdown_table_style",
    className,
  ].join(" ");

  // 判断是否为 ```markdown ... ``` 的思维导图格式，并提取中间内容
  const mindmapContent = useMemo(() => {
    if (typeof children !== "string") return null;
    const trimmed = children.trim();
    const match = trimmed.match(/^```markdown\s*([\s\S]*?)\s*```$/);
    return match ? match[1] : null;
  }, [children]);

  // 如果是思维导图格式，使用 MarkMap 渲染
  if (mindmapContent) {
    return (
      <div className={classNames}>
        <MarkMap markdown={mindmapContent} />
      </div>
    );
  }

  // 处理 Markdown 中非标准的 ![](URL)（即图片没有 alt 文本，括号内直接跟 URL）
  function fixNonStandardImages(mdText:any) {
    // 正则解析：
    // 1. `!\[\]` : 匹配空的 alt
    // 2. `\(`    : 左括号
    // 3. `(`     : 捕获组开始
    // 4. `[^\s)]+`: 匹配非空白且非右括号的字符（URL）
    // 5. `)`     : 捕获组结束
    // 6. `\)`    : 右括号
    const regex = /!\[\]\((([^\s)]+))\)/g;

    return mdText.replace(regex, (match, url) => {
      // 优雅处理：提取路径最后一段作为 alt（去掉后缀）
      const altText = url.split('/').pop().split('.')[0] || 'image';
      return `![${altText}](${url})`;
    });
  }


// 表格换行问题
const fixMdTable = md => md.replace(/([^\r\n])\r?\n(\|.+\|[\r\n]+\|[-| :]+\|)/g, '$1\n\n$2');

/**
 * 截断容错：数据被截断或流式输出未完成时，补齐未闭合的 $ 公式与 ``` 代码块，
 * 避免出现 "$a^{2}-2ab+" 这类原始文本。
 */
function balanceDelimiters(mdText: string) {
  let out = mdText || "";
  if (!out) return out;
  // 奇数个未转义 $ 时补一个闭合（先剔除 \$ 转义再计数）
  const unescaped = out.replace(/\\\$/g, "");
  const dollarCount = (unescaped.match(/\$/g) || []).length;
  if (dollarCount % 2 === 1) {
    out += "$";
  }
  // 未闭合的 ``` 代码块补上围栏
  const fenceCount = (out.match(/^```/gm) || []).length;
  if (fenceCount % 2 === 1) {
    out += "\n```";
  }
  return out;
}


// todo 表格图片渲染
function replaceMarkdownImagesDetailed(param:any) {
  let tmp = balanceDelimiters(param) // 截断容错：补齐未闭合公式/代码块
  tmp= latexReplace(tmp)   // 公式处理
  tmp= tmp?.replace?.(/`\n/g, "")
  tmp= tmp?.replace?.(/\n`/g, "")
  tmp= tmp?.replace?.(/\n图/g, "图")
  tmp=fixMdTable(tmp) // 表格修复
  tmp=fixNonStandardImages(tmp) // 表格修复

  return tmp || ""
}

  return (
    <ReactMarkdown
      className={classNames}
      {...rest}
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
    >
      {replaceMarkdownImagesDetailed(children)}
      {/* {children} */}
    </ReactMarkdown>
  );
};

export default MarkdownRender;
