import { ReactNode } from 'react';
import MarkdownRender from "./Markdownrender/index";
// import MarkdownRender from "@/components/MarkdownRender";
import MathHtmlRenderer from '@/components/MathHtmlRenderer';
import "./usemarkdown.less"
type MarkdownCategory = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'li' | 'strong' | 'img' | 'p';

interface RenderSourceParam {
  node: unknown;
  children: ReactNode;
  [key: string]: any;
}

const useMarkdownRender = (row = {}) => {
  const clampImgWidth = (htmlString: string): string => {
    if (!htmlString) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    doc.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src');
      if (src?.includes('svg')) {
        img.classList.add('imgCss');
      }
      // 统一设置图片最大宽度，避免溢出
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    });

    return doc.body.innerHTML;
  };

  const renderSource = (sParam: RenderSourceParam, category: MarkdownCategory): ReactNode => {
    const { children } = sParam;
    if (!children || (Array.isArray(children) && children.length === 0)) {
      return null;
    }

    const editProp = {};

    switch (category) {
      case 'h1':
        return <h1 {...editProp}>{children}</h1>;
      case 'h2':
        return <h2 {...editProp}>{children}</h2>;
      case 'h3':
        return <h3 {...editProp}>{children}</h3>;
      case 'h4':
        return <h4 {...editProp}>{children}</h4>;
      case 'h5':
        return <h5 {...editProp}>{children}</h5>;
      case 'h6':
        return <h6 {...editProp}>{children}</h6>;
      case 'li':
        return <li {...editProp}>{children}</li>;
      case 'strong':
        return <strong {...editProp}>{children}</strong>;
      case 'img':
        return (
          <img
            {...editProp}
            style={{ display: 'inline-block', maxWidth: '100%', height: 'auto' }}
            alt="markdown-image"
          />
        );
      default:
        return <p {...editProp}>{children}</p>;
    }
  };

  const judgeContentFormat = (str: string): 'markdown' | 'html' => {
    if (!str || typeof str !== 'string') return 'markdown';

    const htmlTagRegex = /<(?:[a-z]+)(?:\s[^>]*)*>|<\/[a-z]+>|<!DOCTYPE[^>]*>|<br\s*\/?>/i;
    const hasHtmlTags = htmlTagRegex.test(str);

    return hasHtmlTags ? 'html' : 'markdown';
  };

  const markdownRenderFn = (str: string): ReactNode => {
    if (!str) return null;
    const contentFormat = judgeContentFormat(str);
    switch (contentFormat) {
      case 'html':
        const processedHtml = clampImgWidth(str);
        return <MathHtmlRenderer htmlString={processedHtml} row={row} />;

      case 'markdown':
        return (
          <MarkdownRender
            className="markdown-content"
            components={{
              li: (param: any) => renderSource(param, "li"),
              p: (param: any) => renderSource(param, "p"),
              h1: (param: any) => renderSource(param, "h1"),
              h2: (param: any) => renderSource(param, "h2"),
              h3: (param: any) => renderSource(param, "h3"),
              h4: (param: any) => renderSource(param, "h4"),
              h5: (param: any) => renderSource(param, "h5"),
              h6: (param: any) => renderSource(param, "h6"),
              img: (param: any) => renderSource(param, "img"),
              strong: (param: any) => renderSource(param, "strong"),
            }}
          >
            {str}
          </MarkdownRender>
        );
    }
  };

  return {
    clampImgWidth,
    renderSource,
    markdownRenderFn,
    judgeContentFormat,
  };
};

export default useMarkdownRender;