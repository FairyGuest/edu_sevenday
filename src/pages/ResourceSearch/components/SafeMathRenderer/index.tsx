import React, { useMemo } from "react";
import MathHtmlRenderer from "@/components/MathHtmlRenderer";
import "./index.less";

export interface SafeMathRendererProps {
  html: string;
  options?: string[];
  isSelectQuestion?: boolean;
  displayMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
  number?: string; // 题干序号（如 "1."、"(2)" 等）
  download?: boolean; // 是否下载题干图片
}

const removeEscapedWhitespaceBetweenTags = (content: string) => {
  if (!content) return "";
  return content.replace(/>\s*(?:\\[tnr]\s*)+</g, "><");
};

const SafeMathRenderer: React.FC<SafeMathRendererProps> = ({
  html,
  options = [],
  isSelectQuestion = false,
  displayMode = false,
  className,
  style,
  number = "",
  download = false,
}) => {
  if (!html) return null;

  // 为 img 标签补充默认属性，避免样式异常
  const enhanceImgTags = (content: string) => {
    if (!content) return content;
    return content.replace(/<img\b[^>]*>/gi, (imgTag) => {
      let nextTag = imgTag;
      if (!/\balt\s*=/.test(nextTag)) {
        nextTag = nextTag.replace("<img", '<img alt="question-image"');
      }
      if (!/\bloading\s*=/.test(nextTag)) {
        nextTag = nextTag.replace("<img", '<img loading="lazy"');
      }
      if (!/\bstyle\s*=/.test(nextTag)) {
        nextTag = nextTag.replace(
          "<img",
          '<img style="max-width:700px;height:auto;vertical-align:middle;"',
        );
      }
      return nextTag;
    });
  };

  const normalizeMathInput = (content: string) => {
    if (!content) return "";
    const decodeHtmlEntities = (input: string) => {
      if (!input || !input.includes("&")) return input;
      const textarea = document.createElement("textarea");
      textarea.innerHTML = input;
      return textarea.value;
    };

    return content
      .replace(/>\s*(?:\\[tnr]\s*)+</g, "><")
      .replace(/\\u00a0/gi, " ")
      .replace(/\u00a0/g, " ")
      .replace(/\\+\[\s*([\s\S]+?)\s*\\+\]/g, (_m, inner) => `$$${inner}$$`)
      .replace(/\\+\(\s*([\s\S]+?)\s*\\+\)/g, (_m, inner) => `$${inner}$`)
      .replace(/(\$\$?)([\s\S]+?)\1/g, (_m, delimiter, inner) => {
        return `${delimiter}${inner}${delimiter}`;
      });
  };

  const prepareMarkdownInput = (content: string) => {
    return normalizeMathInput(
      enhanceImgTags(removeEscapedWhitespaceBetweenTags(content)),
    );
  };

  const safeOptions = Array.isArray(options) ? options : [];

  const parsedContent = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      removeEscapedWhitespaceBetweenTags(html),
      "text/html",
    );
    const body = doc.body;

    const stemNodes: string[] = [];
    const mergedPContents: string[] = [];

    const flushMergedP = () => {
      if (mergedPContents.length > 0) {
        stemNodes.push(mergedPContents.join(" "));
        mergedPContents.length = 0;
      }
    };

    Array.from(body.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        // if (el.tagName.toLowerCase() === "p") {
        //   const pContent = el.innerHTML?.replace(/\n/g, "").trim() || "";
        //   if (pContent) {
        //     mergedPContents.push(pContent);
        //   }
        //   return;
        // }
        flushMergedP();
        stemNodes.push(el.outerHTML);
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.replace(/\n/g, "").trim() || "";
        if (text) {
          flushMergedP();
          stemNodes.push(text);
        }
      }
    });
    flushMergedP();

    const parsedOptions = safeOptions.map((option) => {
      if (typeof option !== "string") {
        return {
          className: "",
          content: "",
        };
      }
      const optionDoc = parser.parseFromString(
        removeEscapedWhitespaceBetweenTags(option),
        "text/html",
      );
      const choiceEl = optionDoc.querySelector("choice") || optionDoc.body;
      return {
        className: choiceEl.getAttribute("class") || "",
        content: choiceEl.innerHTML?.replace(/\n/g, "").trim() || "",
      };
    });

    const isChoicePerP =
      parsedOptions.length > 1 ||
      (parsedOptions[0]?.content &&
        parsedOptions[0].content.includes("<choice"));

    return {
      stemText: stemNodes.join(""),
      parsedOptions,
      isChoicePerP,
    };
  }, [html, number, safeOptions, isSelectQuestion]);

  const { stemText, parsedOptions, isChoicePerP } = parsedContent;
  void displayMode;
  const stemBoldClass = number ? "safe-math-renderer--stem-bold" : "";

  return (
    <div
      className={`safe-math-renderer ${stemBoldClass} ${className || ""}`}
      style={{
        ...style,
        lineHeight: "1.8",
      }}
    >
      <div
        key="stem-wrapper"
        className="stem-wrapper"
        {
        ...download && {
          style: {
            display: "flex",
            alignItems: "baseline",
          }
        }
        }
      >
        {number && (
          <span key="question-number" className="question-number">
            {number}
          </span>
        )}
        <span key="stem-content" className="stem-content">
          <MathHtmlRenderer htmlString={prepareMarkdownInput(stemText)} />
        </span>
      </div>

      {isSelectQuestion && parsedOptions.length > 0 && (
        <>
          {/* {stemText && <br key="stem-option-separator" />} */}
          <div className="options-wrap" key="options-wrap">
            {parsedOptions.map((choice, idx) => (
              <React.Fragment key={`choice-${idx}`}>
                <MathHtmlRenderer htmlString={prepareMarkdownInput(choice.content)} />
                {/* {isChoicePerP && idx < parsedOptions.length - 1 ? (
                  <br key={`choice-br-${idx}`} />
                ) : !isChoicePerP && idx < parsedOptions.length - 1 ? (
                  <span key={`choice-space-${idx}`}>&nbsp;&nbsp;</span>
                ) : null} */}
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SafeMathRenderer;
