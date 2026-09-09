import React, { useEffect, useMemo, useRef } from 'react';
import { prepareMathHtmlForRender } from '@/utils';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import './index.less';
import "katex/contrib/mhchem"; // 支持化学方程式 \ce 语法

/** 与公式预处理链路中的 latex 处理保持一致 */
const normalizeMathLatexAttribute = (raw: string) => {
  let latex = raw.trim();
  latex = latex.replaceAll(/^\$+|\$+$/g, '');
  latex = latex.replaceAll(/\{\*\{\d+\}\{([^}]*)\}\}/g, '{$1}');
  const textarea = document.createElement('textarea');
  textarea.innerHTML = latex;
  return textarea.value;
};

const LATEX_COMMAND_PATTERN =
  /\\(frac|times|cdot|div|sqrt|pm|leq|geq|neq|approx|sum|prod|int|sin|cos|tan|log|ln|alpha|beta|gamma|theta|pi|left|right)\b/;
const INLINE_LATEX_SEGMENT_PATTERN =
  /[A-Za-z0-9+\-*/=().\[\]{}^_]*\\[A-Za-z]+[A-Za-z0-9+\-*/=().,;:\[\]{}^_\\]*/g;

const replaceMathElementsWithKatex = (container: HTMLElement) => {
  const mathNodes = Array.from(container.querySelectorAll('math[latex]'));
  mathNodes.forEach((mathEl) => {
    let latex = mathEl.getAttribute('latex') || '';
    latex = normalizeMathLatexAttribute(latex);
    const svgUrl = mathEl.getAttribute('math-svg') || '';

    const replaceWithImg = () => {
      if (!svgUrl) return;
      const img = document.createElement('img');
      img.src = svgUrl;
      img.alt = '';
      img.style.verticalAlign = 'middle';
      img.style.maxHeight = '1.2em';
      mathEl.parentNode?.replaceChild(img, mathEl);
    };

    if (!latex) {
      if (svgUrl) replaceWithImg();
      else mathEl.remove();
      return;
    }

    const renderEl = document.createElement('span');
    renderEl.style.display = 'inline-block';
    renderEl.style.verticalAlign = 'middle';

    try {
      katex.render(latex, renderEl, {
        displayMode: false,
        throwOnError: true,
        strict: 'ignore',
      });
      mathEl.parentNode?.replaceChild(renderEl, mathEl);
    } catch {
      if (svgUrl) {
        replaceWithImg();
        return;
      }
      katex.render(latex, renderEl, {
        displayMode: false,
        throwOnError: false,
        strict: 'ignore',
      });
      mathEl.parentNode?.replaceChild(renderEl, mathEl);
    }
  });
};

const replaceInlineLatexTextWithKatex = (container: HTMLElement) => {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const text = textNode.nodeValue || '';
    if (!text.includes('\\')) return;

    const parent = textNode.parentElement;
    if (!parent || parent.closest('code, pre, script, style, textarea, .katex, .rich-editor-math-widget')) {
      return;
    }

    const fragment = document.createDocumentFragment();
    let cursor = 0;
    let changed = false;
    let match = INLINE_LATEX_SEGMENT_PATTERN.exec(text);

    while (match) {
      const matchedText = match[0];
      const start = match.index;
      const end = start + matchedText.length;
      const latex = normalizeMathLatexAttribute(matchedText);

      if (LATEX_COMMAND_PATTERN.test(latex)) {
        if (start > cursor) {
          fragment.appendChild(document.createTextNode(text.slice(cursor, start)));
        }
        const renderEl = document.createElement('span');
        renderEl.style.display = 'inline-block';
        renderEl.style.verticalAlign = 'middle';
        katex.render(latex, renderEl, {
          displayMode: false,
          throwOnError: false,
          strict: 'ignore',
        });
        fragment.appendChild(renderEl);
        cursor = end;
        changed = true;
      }

      match = INLINE_LATEX_SEGMENT_PATTERN.exec(text);
    }

    INLINE_LATEX_SEGMENT_PATTERN.lastIndex = 0;

    if (!changed) return;

    if (cursor < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(cursor)));
    }
    textNode.replaceWith(fragment);
  });
};

const SolubilityAnalysis = ({ htmlString, row }: any) => {
  // 注意：在 JS 字符串中，必须使用双反斜杠 \\ 来表示单反斜杠 \
  // 这样最终渲染出来的 HTML 才会是你原文中的 \( ... \)

  const containerRef = useRef<HTMLDivElement | null>(null);
  const preparedHtml = useMemo(
    () => prepareMathHtmlForRender(htmlString),
    [htmlString],
  );

  useEffect(() => {
    if (containerRef.current) {
      replaceMathElementsWithKatex(containerRef.current);
      replaceInlineLatexTextWithKatex(containerRef.current);

      renderMathInElement(containerRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true }, // 块级公式（居中）
          { left: '$', right: '$', display: false },   // 行内公式
        ],
        throwOnError: false, // 公式错误不崩溃
      });
      // 查找所有数学公式所在的 span 标签
      const mathElements = containerRef.current.querySelectorAll('.math.inline');

      mathElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        // 获取原始文本内容，此时 JS 已经将 \\ 转义回 \，所以我们能拿到正确的 \(...\)
        let latex = htmlElement.textContent || '';

        // 去掉首尾的 \( 和 \)
        const inlineMathOpen = String.raw`\(`;
        const inlineMathClose = String.raw`\)`;
        if (latex.startsWith(inlineMathOpen) && latex.endsWith(inlineMathClose)) {
          latex = latex.slice(2, -2);
        }

        // 使用 KaTeX 渲染
        try {
          katex.render(latex, htmlElement, {
            throwOnError: false,
            displayMode: false // 行内公式模式
          });
        } catch (e) {
          console.error('KaTeX Error:', e);
        }
      });
    }
  }, [preparedHtml]);


  const getEnglishCss = () => {
    if (row?.question_type == 'cloze_test') {
      return 'english'
    }
    return ''
  }

  return (
    <div
      ref={containerRef}
      className={`render_title_box  katex_render_div_box_css  ${getEnglishCss()}`}
      dangerouslySetInnerHTML={{ __html: preparedHtml }}
    />
  );
};

export default SolubilityAnalysis;
