const KATEX_UNICODE_SYMBOL_MAP: Record<string, string> = {
  "2230": '\\char"2230',
  "2231": '\\char"2231',
  "2232": '\\char"2232',
  "2233": '\\char"2233',
};

const toKatexCharCommand = (hex: string) => `\\char"${hex.toUpperCase()}`;

interface LatexGroup {
  content: string;
  end: number;
}

const INVALID_CONTROL_CHARACTER_RE =
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

/**
 * 清理历史内容中已经持久化的 KaTeX 错误节点。
 * 原始 LaTeX 已丢失时无法重新渲染，只移除错误包装和控制字符，保留文字及图片。
 */
export function removeLegacyKatexErrorMarkup(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>(".katex-error").forEach((errorNode) => {
    const walker = errorNode.ownerDocument.createTreeWalker(
      errorNode,
      NodeFilter.SHOW_TEXT,
    );
    const textNodes: Text[] = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text);
    }

    textNodes.forEach((textNode) => {
      textNode.nodeValue = (textNode.nodeValue || "")
        .replace(INVALID_CONTROL_CHARACTER_RE, "")
        .replace(/\u0332/g, "");
    });

    errorNode.replaceWith(...Array.from(errorNode.childNodes));
  });
}

function readLatexGroup(
  latex: string,
  start: number,
  open: string,
  close: string,
): LatexGroup | null {
  if (latex[start] !== open) return null;

  let depth = 1;
  for (let index = start + 1; index < latex.length; index += 1) {
    if (latex[index] === "\\") {
      index += 1;
      continue;
    }
    if (latex[index] === open) depth += 1;
    if (latex[index] === close) depth -= 1;
    if (depth === 0) {
      return {
        content: latex.slice(start + 1, index),
        end: index + 1,
      };
    }
  }

  return null;
}

function replaceTensorCommands(latex: string): string {
  return latex.replace(
    /\\tensor\*?\s*(\[[\s\S]*?\])?\s*(\{(?:[^{}]|\{[^{}]*\})*\})\s*(\{(?:[^{}]|\{[^{}]*\})*\})/g,
    (command, rawPrescripts: string | undefined) => {
      let cursor = command.indexOf(rawPrescripts || "{");
      let prescripts = "";

      if (rawPrescripts) {
        const group = readLatexGroup(command, cursor, "[", "]");
        if (!group) return command;
        prescripts = group.content;
        cursor = group.end;
      }

      cursor = command.indexOf("{", cursor);
      const nucleus = readLatexGroup(command, cursor, "{", "}");
      if (!nucleus) return command;

      cursor = command.indexOf("{", nucleus.end);
      const postscripts = readLatexGroup(command, cursor, "{", "}");
      if (!postscripts) return command;

      const prescriptLatex = prescripts ? `{${prescripts}}` : "";
      return `${prescriptLatex}{${nucleus.content}}${postscripts.content}`;
    },
  );
}

function mergeConsecutiveSuperscripts(latex: string): string {
  return latex.replace(/\^\{([^{}]*)\}\s*\^\{([^{}]*)\}/g, "^{$1$2}");
}

function removeUnmatchedRightCommands(latex: string): string {
  let leftDepth = 0;

  return latex.replace(/\\(left|right)\b\s*/g, (command, side: string) => {
    if (side === "left") {
      leftDepth += 1;
      return command;
    }

    if (leftDepth > 0) {
      leftDepth -= 1;
      return command;
    }

    return "";
  });
}

/**
 * 统一编辑器和预览使用的 KaTeX 兼容处理。
 */
export function sanitizeFormulaLatexForKatex(rawLatex: string): string {
  const controlCharacterRepaired = rawLatex
    .replace(/\u0008oldsymbol\b/g, "\\boldsymbol")
    .replace(INVALID_CONTROL_CHARACTER_RE, "");

  const normalizedLegacyCommand = controlCharacterRepaired.replace(
    /\\+ointclockwise\b/g,
    KATEX_UNICODE_SYMBOL_MAP["2232"],
  );
  const textCommandReplaced = normalizedLegacyCommand.replace(
    /\\textasciitilde\b/g,
    "\\sim",
  );

  const unicodeCommandReplaced = textCommandReplaced.replace(
    /\\+unicode\s*(?:\{\s*x(?:\{)?([0-9a-fA-F]{4,6})(?:\})?\s*\}|["“”']\s*([0-9a-fA-F]{4,6}))/g,
    (full, hexInBraces: string, hexInQuote: string) => {
      const hex = (hexInBraces || hexInQuote || "").toLowerCase();
      if (!hex) return full;
      return KATEX_UNICODE_SYMBOL_MAP[hex] || toKatexCharCommand(hex);
    },
  );

  const unicodeSymbolReplaced = unicodeCommandReplaced.replace(
    /[∰∱∲∳]/g,
    (symbol) => {
      const hex = symbol.codePointAt(0)?.toString(16).toLowerCase() || "";
      return (hex && KATEX_UNICODE_SYMBOL_MAP[hex]) || symbol;
    },
  );

  return removeUnmatchedRightCommands(
    mergeConsecutiveSuperscripts(replaceTensorCommands(unicodeSymbolReplaced)),
  );
}
