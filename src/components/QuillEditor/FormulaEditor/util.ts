import { normalizeFormulaLatex } from "@/utils";
import { removeLegacyKatexErrorMarkup } from "@/utils/formulaKatex";

// ==================== 常量 ====================

/**
 * 匹配 $$...$$（块级）或 $...$（行内）LaTeX 公式分隔符。
 * 正则先尝试匹配 $$...$$，失败后再尝试 $...$。
 * $...$ 要求 $ 后紧跟非空、非 $ 字符，避免匹配 $$ 边界。
 */
const LATEX_DELIMITER_RE = /\$\$([\s\S]+?)\$\$|\$([^\s$][^$]*?)\$/g;

// ==================== KaTeX 兼容性 ====================

/**
 * 将 KaTeX 不支持的 LaTeX 命令映射到支持的等价命令
 * 主要处理 MathJax / unicode-math 特有的 \up... 系列直立字体命令
 */
const KATEX_COMPAT_MAP: Record<string, string> = {
  "\\uppi": "\\mathrm{\\pi}",
};

function makeKatexCompatible(latex: string): string {
  return latex.replace(/\\uppi\b/g, KATEX_COMPAT_MAP["\\uppi"]);
}

/** normalizeFormulaLatex + KaTeX 兼容性处理 */
function normalizeLatex(raw: string): string {
  return makeKatexCompatible(normalizeFormulaLatex(raw));
}

// ==================== HTML 公式格式规范化 ====================

/**
 * 将旧格式的公式 HTML 转换为 Quill FormulaBlot 能识别的格式
 *
 * 支持转换：
 *   <math latex="$x^2$">        → <span class="ql-formula" data-latex="x^2">
 *   <math math-svg="url">       → <img src="url"> （仅有 SVG 无 LaTeX 时降级为图片）
 *   .rich-editor-math-widget    → <span class="ql-formula" data-latex="...">
 *   [data-w-e-type="formula"]   → <span class="ql-formula" data-latex="...">
 *   $...$ / $$...$$ 文本分隔符   → <span class="ql-formula" data-latex="...">
 */
export function normalizeFormulaHTML(html: string): string {
  if (!html) return html;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    let changed = false;

    if (doc.body.querySelector(".katex-error")) {
      removeLegacyKatexErrorMarkup(doc.body);
      changed = true;
    }

    // 1) <math latex="..."> → ql-formula（latex 值会经过 normalizeFormulaLatex 规范化）
    //    <math math-svg="...">（无 latex）→ 降级为图片
    doc.body
      .querySelectorAll("math[latex], math[math-svg]")
      .forEach((mathEl) => {
        const rawLatex = mathEl.getAttribute("latex") || "";
        const svgUrl = mathEl.getAttribute("math-svg") || "";

        if (rawLatex) {
          // normalizeFormulaLatex 会剥离外层的 $ 符号、处理 Word 格式分组等
          const latex = normalizeLatex(rawLatex);
          if (latex) {
            const span = doc.createElement("span");
            span.className = "ql-formula";
            span.setAttribute("data-latex", latex);
            span.setAttribute("contenteditable", "false");
            mathEl.replaceWith(span);
            changed = true;
          } else {
            mathEl.remove();
            changed = true;
          }
        } else if (svgUrl) {
          const img = doc.createElement("img");
          img.src = svgUrl;
          img.alt = "";
          img.style.verticalAlign = "middle";
          img.style.display = "inline-block";
          mathEl.replaceWith(img);
          changed = true;
        } else {
          mathEl.remove();
          changed = true;
        }
      });

    // 2) .rich-editor-math-widget → ql-formula
    doc.body.querySelectorAll(".rich-editor-math-widget").forEach((widget) => {
      const el = widget as HTMLElement;
      const rawLatex = el.dataset.latex || "";
      if (rawLatex) {
        const latex = normalizeLatex(rawLatex);
        if (latex) {
          const span = doc.createElement("span");
          span.className = "ql-formula";
          span.setAttribute("data-latex", latex);
          span.setAttribute("contenteditable", "false");
          el.replaceWith(span);
          changed = true;
        } else {
          el.remove();
          changed = true;
        }
      } else {
        el.remove();
        changed = true;
      }
    });

    // 3) [data-w-e-type="formula"] → ql-formula（wangEditor 格式）
    doc.body.querySelectorAll('[data-w-e-type="formula"]').forEach((el) => {
      const rawLatex = (el as HTMLElement).dataset.latex || "";
      if (rawLatex) {
        const latex = normalizeLatex(rawLatex);
        if (latex) {
          const span = doc.createElement("span");
          span.className = "ql-formula";
          span.setAttribute("data-latex", latex);
          span.setAttribute("contenteditable", "false");
          el.replaceWith(span);
          changed = true;
        }
      }
    });

    // 4) 文本中 $...$ / $$...$$ 分隔符 → ql-formula
    if (convertLatexDelimiters(doc)) {
      changed = true;
    }

    return changed ? doc.body.innerHTML : html;
  } catch {
    return html;
  }
}

// ==================== 文本分隔符转换 ====================

/**
 * 处理单个文本节点，将其中的 $...$ / $$...$$ 替换为 ql-formula span
 */
function processLatexDelimiters(textNode: Text, doc: Document): boolean {
  const text = textNode.textContent || "";
  LATEX_DELIMITER_RE.lastIndex = 0;

  const matches: Array<{ start: number; end: number; latex: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = LATEX_DELIMITER_RE.exec(text)) !== null) {
    const rawLatex = (match[1] || match[2] || "").trim();
    if (!rawLatex) continue;
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      latex: rawLatex,
    });
  }

  if (matches.length === 0) return false;

  const parent = textNode.parentNode;
  if (!parent) return false;

  let lastIndex = 0;
  for (const m of matches) {
    if (m.start > lastIndex) {
      parent.insertBefore(
        doc.createTextNode(text.slice(lastIndex, m.start)),
        textNode,
      );
    }
    const latex = normalizeLatex(m.latex);
    const span = doc.createElement("span");
    span.className = "ql-formula";
    span.setAttribute("data-latex", latex);
    span.setAttribute("contenteditable", "false");
    parent.insertBefore(span, textNode);

    lastIndex = m.end;
  }

  if (lastIndex < text.length) {
    parent.insertBefore(doc.createTextNode(text.slice(lastIndex)), textNode);
  }

  parent.removeChild(textNode);
  return true;
}

/**
 * 遍历 body 中所有文本节点，将 $...$ / $$...$$ 分隔符转换为 ql-formula
 */
function convertLatexDelimiters(doc: Document): boolean {
  const textNodes: Text[] = [];
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;
    if (!parent) continue;
    if (
      parent.closest(
        'code, pre, .ql-formula, .katex, math, [contenteditable="false"]',
      )
    ) {
      continue;
    }
    if (!/\$/.test(node.textContent || "")) continue;
    textNodes.push(node);
  }

  let changed = false;
  for (const node of textNodes) {
    if (processLatexDelimiters(node, doc)) {
      changed = true;
    }
  }
  return changed;
}
