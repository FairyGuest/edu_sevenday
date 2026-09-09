import katex from "katex";
import { EmbedBlot } from "parchment";
import { sanitizeFormulaLatexForKatex } from "@/utils/formulaKatex";

/**
 * 自定义 Quill 公式 Blot
 * - 存储 LaTeX 字符串在 data-latex 属性中
 * - 使用 KaTeX 渲染为数学公式
 * - contentEditable 设为 false，作为不可编辑的嵌入元素
 * - 在 Quill 文档模型中占 1 个字符长度
 */
class FormulaBlot extends EmbedBlot {
  static blotName = "formula";
  static tagName = "span";
  static className = "ql-formula";

  static create(value: any): HTMLElement {
    const node = super.create(value) as HTMLElement;
    const rawLatex = typeof value === "string" ? value : value?.latex || "";
    const latex = sanitizeFormulaLatexForKatex(rawLatex);

    node.setAttribute("data-latex", latex);
    node.setAttribute("contenteditable", "false");

    if (latex) {
      try {
        katex.render(latex, node, {
          throwOnError: false,
          displayMode: false,
          strict: "ignore",
        });
      } catch {
        node.textContent = latex;
      }
    }

    return node;
  }

  static value(domNode: HTMLElement): { latex: string } {
    return { latex: domNode.getAttribute("data-latex") || "" };
  }
}

export default FormulaBlot;
