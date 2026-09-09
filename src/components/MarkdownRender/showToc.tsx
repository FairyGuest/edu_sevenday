import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
  useId,
} from "react";
import ReactMarkdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { Button } from "antd";

import MarkMap from "@/pages/AgentInteractions/components/MarkMap";
import { ZYIcon } from "@/components";

import "katex/dist/katex.min.css";
import "katex/contrib/mhchem"; // 支持化学方程式 \ce 语法
import "./index.less";
import { latexReplace } from "@/utils";

// 纯函数：预处理、扫标题、算滚动高亮

export type TocItem = {
  level: number;
  text: string;
  id: string;
};

//  表格渲染纠错
const fixMdTable = (md:any) => md.replace(/([^\r\n])\r?\n(\|.+\|[\r\n]+\|[-| :]+\|)/g, '$1\n\n$2');
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


function replaceMarkdownImagesDetailed(param: any) {
  let tmp = latexReplace(param);
  tmp = tmp?.replace?.(/`\n/g, "");
  tmp = tmp?.replace?.(/\n`/g, "");
  tmp = tmp?.replace?.(/\n图/g, "图");
  tmp = fixMdTable(tmp);
  tmp = fixNonStandardImages(tmp);
  return tmp || "";
}

function slugifyHeadingText(text: string) {
  return text.replace(/\s+/g, "-").toLowerCase();
}

function unescapeMarkdownHeadingText(text: string): string {
  return text.replace(
    /\\([!"#$%&'()*+,\-./:;<=>?@\[\]^_`{|}~])/g,
    "$1",
  );
}

//第 1 次用 slug，第 2 次起加 -2、-3，和正文里 h1~h3 的 id 规则一致
function headingAnchorId(idPrefix: string, slug: string, occurrence: number) {
  return `${idPrefix}${slug}${occurrence === 1 ? "" : `-${occurrence}`}`;
}

function buildTocFromMarkdown(md: string, idPrefix: string): TocItem[] {
  const slugCount = new Map<string, number>();
  return Array.from(md.matchAll(/^(#{1,3})\s+(.+)$/gm)).map((match) => {
    const raw = match[2].trim().replace(/[\*_~`]/g, "");
    const text = unescapeMarkdownHeadingText(raw);
    const slug = slugifyHeadingText(text);
    const n = (slugCount.get(slug) ?? 0) + 1;
    slugCount.set(slug, n);
    return {
      level: match[1].length,
      text,
      id: headingAnchorId(idPrefix, slug, n),
    };
  });
}

function getNodeText(node: any): string {
  if (node?.value) return node.value;
  if (node?.children) return node.children.map(getNodeText).join("");
  return "";
}

// 判断目录点击时高亮
function pickActiveHeadingId(items: TocItem[], scrollY: number): string {
  const nodes = items
    .map((item) => document.getElementById(item.id))
    .filter((el) => Boolean(el));
  const current = [...nodes].reverse().find((el) => el.offsetTop <= scrollY);
  return current?.id ?? "";
}

// 左侧目录列表

function TocSidebarList(props: {
  items: TocItem[];
  activeId: string;
  onPick: (id: string) => void;
  keyPrefix?: string;
}) {
  const { items, activeId, onPick, keyPrefix = "" } = props;
  return (
    <div className="markdown_toc_sidebar">
      {items.map((item, index) => {
        const isRootToc = index === 0;
        return (
          <div
            key={`${keyPrefix}${item.id}-${index}`}
            onClick={() => onPick(item.id)}
            className={
              isRootToc
                ? "markdown_toc_sidebar_item markdown_toc_sidebar_item--root"
                : "markdown_toc_sidebar_item"
            }
            style={{
              paddingLeft: `${(item.level - 1) * 12}px`,
              color: activeId === item.id ? "#1c6cff" : "#636e8b",
              fontWeight: isRootToc ? 600 : 500,
            }}
            title={item.text}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
}

// MarkdownTocGroup：收集多段的目录，拼成左边一条总目录

type TocGroupContextValue = {
  register: (key: string, items: TocItem[]) => void;
  unregister: (key: string) => void;
};

const MarkdownTocGroupContext = createContext<TocGroupContextValue | null>(null);

export const MarkdownTocGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sections, setSections] = useState<{ key: string; items: TocItem[] }[]>([]);
  const [tocCollapsed, setTocCollapsed] = useState(false);

  const register = useCallback((key: string, items: TocItem[]) => {
    setSections((prev) => {
      const i = prev.findIndex((s) => s.key === key);
      if (i === -1) return [...prev, { key, items }];
      const next = [...prev];
      next[i] = { key, items };
      return next;
    });
  }, []);

  const unregister = useCallback((key: string) => {
    setSections((prev) => prev.filter((s) => s.key !== key));
  }, []);

  const mergedToc = useMemo(
    () => sections.flatMap((s) => s.items),
    [sections],
  );

  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (mergedToc.length === 0) return;
    const onScroll = () => {
      const id = pickActiveHeadingId(mergedToc, window.scrollY);
      if (id) setActiveId(id);
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [mergedToc]);

  function scrollToAnchor(id: string) {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  const ctx = useMemo(
    () => ({ register, unregister }),
    [register, unregister],
  );

  return (
    <MarkdownTocGroupContext.Provider value={ctx}>
      {mergedToc.length > 0 ? (
        <div
          className={`markdown_toc${tocCollapsed ? " markdown_toc_collapsed" : ""}`}
        >
          <div className="markdown_toc_tree">
            <Button
              type="text"
              icon={
                <ZYIcon
                  type="arrow-go"
                  style={{ transform: `rotate(${tocCollapsed ? 0 : 180}deg)`, fontSize: 24 }}
                />
              }
              onClick={() => setTocCollapsed((v) => !v)}
            />
            {!tocCollapsed && (
              <TocSidebarList
                items={mergedToc}
                activeId={activeId}
                onPick={scrollToAnchor}
              />
            )}
          </div>
          <div className="markdown_toc_main">{children}</div>
        </div>
      ) : (
        children
      )}
    </MarkdownTocGroupContext.Provider>
  );
};

// MarkdownRender：正文 + 可选目录

interface MarkdownRenderProps extends Options {
  children: string;
  showToc?: boolean;
  tocSectionKey?: string;  //配合 MarkdownTocGroup：每段给个不同 key，避免不同段的标题 id 重复
}

const MarkdownRender: React.FC<MarkdownRenderProps> = ({
  children,
  className = "",
  remarkPlugins = [remarkGfm, remarkMath],
  rehypePlugins = [rehypeKatex, rehypeRaw],
  showToc = false,
  tocSectionKey,
  ...rest
}) => {
  const groupApi = useContext(MarkdownTocGroupContext);
  const fallbackSectionId = useId().replace(/:/g, "");
  const sectionKey = tocSectionKey ?? fallbackSectionId;

  //渲染 h1~h3 时用来数「同名标题第几次出现」，要和 buildTocFromMarkdown 同步清零
  const headingSlugCountRef = useRef<Map<string, number>>(new Map());

  const [activeId, setActiveId] = useState("");
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const classNames = [
    "markdown_container",
    "markdown_table_style",
    className,
  ].join(" ");

  //  思维导图整段：不走下面的 Markdown 目录逻辑
  const mindmapContent = useMemo(() => {
    if (typeof children !== "string") return null;
    const trimmed = children.trim();
    const match = trimmed.match(/^```markdown\s*([\s\S]*?)\s*```$/);
    return match ? match[1] : null;
  }, [children]);

  // 给 ReactMarkdown 的字符串（公式等预处理）
  const processedMarkdown = useMemo(() => {
    if (typeof children !== "string") return "";
    return replaceMarkdownImagesDetailed(children);
  }, [children]);

  //  要不要「把目录交给外层 Group」；以及标题 id 的前缀
  const insideTocGroup = Boolean(groupApi && showToc);
  const idPrefix = insideTocGroup
    ? `heading-${sectionKey}-`
    : `heading-`;

  // 整段是思维导图时，不要扫里面的 # 当标题（否则目录、register 会乱）
  const markdownForToc = mindmapContent ? "" : processedMarkdown;

  const toc = useMemo(() => {
    if (!showToc || !markdownForToc) return [];
    return buildTocFromMarkdown(markdownForToc, idPrefix);
  }, [markdownForToc, showToc, idPrefix]);

  // 每一轮要渲染带目录的正文前，把「同名出现次数」清零
  if (showToc && !mindmapContent) {
    headingSlugCountRef.current = new Map();
  }

  //带 id 的标题组件：出现顺序、命名规则必须与 buildTocFromMarkdown 一致， 这样左侧点的 id 和 DOM 里 h 标签的 id 一一对应

  const customComponents = useMemo(() => {
    if (!showToc || mindmapContent) {
      return rest.components;
    }

    function nextHeadingId(title: string) {
      const slug = slugifyHeadingText(title);
      const map = headingSlugCountRef.current;
      const n = (map.get(slug) ?? 0) + 1;
      map.set(slug, n);
      return headingAnchorId(idPrefix, slug, n);
    }

    function HeadingRenderer({ level, node, ...props }: any) {
      const text = getNodeText(node);
      const id = nextHeadingId(text);
      const Tag = `h${level}`;
      return <Tag id={id} {...props} />;
    }

    return {
      ...rest.components,
      h1: (props: any) => <HeadingRenderer level={1} {...props} />,
      h2: (props: any) => <HeadingRenderer level={2} {...props} />,
      h3: (props: any) => <HeadingRenderer level={3} {...props} />,
    };
  }, [rest.components, showToc, mindmapContent, idPrefix, markdownForToc]);

  //在 Group 里时上报目录；单独 showToc 时自己监听滚动
  useEffect(() => {
    if (!insideTocGroup || !groupApi) return;
    groupApi.register(sectionKey, toc);
    return () => groupApi.unregister(sectionKey);
  }, [insideTocGroup, groupApi, sectionKey, toc]);

  useEffect(() => {
    if (insideTocGroup || !showToc || toc.length === 0) return;
    const onScroll = () => {
      const id = pickActiveHeadingId(toc, window.scrollY);
      if (id) setActiveId(id);
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [toc, showToc, insideTocGroup]);

  function scrollToAnchor(id: string) {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  //渲染顺序：思维导图 → 在 Group 里只出正文 → 自己带侧栏 → 普通正文
  if (mindmapContent) {
    return (
      <div className={classNames}>
        <MarkMap markdown={mindmapContent} />
      </div>
    );
  }

  const markdownBody = (
    <ReactMarkdown
      className={classNames}
      {...rest}
      components={showToc ? customComponents : rest.components}
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
    >
      {processedMarkdown}
    </ReactMarkdown>
  );

  if (insideTocGroup) {
    return markdownBody;
  }

  if (showToc && toc.length > 0) {
    return (
      <div className={`markdown_toc${tocCollapsed ? " markdown_toc_collapsed" : ""}`}>
        <div className="markdown_toc_tree">
          <Button
            type="text"
            icon={
              <ZYIcon
                type="arrow-go"
                style={{ transform: `rotate(${tocCollapsed ? 0 : 180}deg)`, fontSize: 24 }}
              />
            }
            onClick={() => setTocCollapsed((v) => !v)}
          />
          {!tocCollapsed && (
            <TocSidebarList
              items={toc}
              activeId={activeId}
              onPick={scrollToAnchor}
            />
          )}
        </div>
        <div className="markdown_toc_main">{markdownBody}</div>
      </div>
    );
  }

  return markdownBody;
};

export default MarkdownRender;



/*
 * 【用法 1】整页只有一块 Markdown 要目录
 *  <MarkdownRender showToc>...</MarkdownRender>
 *  左侧目录 + 右侧正文，都在这一个组件里。
 * 【用法 2】多个 Markdown，中间还有表格等，但要「左边一条总目录」
 *   <MarkdownTocGroup>
 *     <MarkdownRender showToc tocSectionKey="pre">...</MarkdownRender>
 *     ...
 *     <MarkdownRender showToc tocSectionKey="after">...</MarkdownRender>
 *   </MarkdownTocGroup>
 *   外层 MarkdownTocGroup 画左边总目录；每个 MarkdownRender 只画正文，并通过 Context 把「本段目录」交给外层合并。
 * 【同名标题】同一篇里多次出现相同标题时，锚点 id 会自动加 -2、-3…，避免点目录总跳到第一个。
 */
