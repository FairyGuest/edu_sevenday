import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import renderMathInElement from "katex/dist/contrib/auto-render";
import { message } from "antd";
import { connect, history, useDispatch } from "umi";
import { formatStaticUrl, getStorageToken } from "@/utils";
import { cogUrl } from "@/utils/host";

const styles = `
.rich-editor:empty::before {
  content: attr(data-placeholder);
  color: #999;
  pointer-events: none;
  position: absolute;
}
.rich-editor:not(:empty)::before {
  display: none;
}
`;

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
]);
const MAX_IMAGE_WIDTH = 465;
const MAX_IMAGE_HEIGHT = 465;
const INIT_IMAGE_OVERSIZE_THRESHOLD = 465;
const INIT_IMAGE_CLAMP_SIZE = 465;
const MIN_RUNTIME_SCALE = 0.3;
const MAX_RUNTIME_SCALE = 3;
const HANDLE_SIZE = 10;
const HANDLE_POSITIONS = ["nw", "ne", "sw", "se"] as const;
const CURSOR_ANCHOR = "\u200B";
const MATH_WIDGET_CLASS = "rich-editor-math-widget";

type HandlePosition = (typeof HANDLE_POSITIONS)[number];
type OverlayRect = { top: number; left: number; width: number; height: number };

const resolveUploadFileData = (response: any) => {
  const raw = response?.data;
  return Array.isArray(raw) ? raw[0] : raw;
};

/** 将 uploadFile 返回的相对路径转为可展示的图片地址 */
const resolveUploadedImageSrc = (url?: string) => {
  if (!url) return "";
  if (url.includes("http://") || url.includes("https://")) return url;
  const withSlash = url.startsWith("/") ? url : `/${url}`;
  // cogUrl 去掉 /api 后已含 /edu-assistant，避免路径重复
  const path = withSlash.replace(/^\/edu-assistant\//, "/");
  return formatStaticUrl(path);
};

const uploadPastedImageFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${cogUrl}/web/photoQuestion/uploadFile`, {
    method: "POST",
    headers: {
      Authorization: getStorageToken() || "",
    },
    body: formData,
  });
  const json = await response.json();
  if (json?.code !== 200) {
    throw new Error(json?.msg || "上传失败");
  }
  const data = resolveUploadFileData(json);
  const src = resolveUploadedImageSrc(data?.url);
  if (!src) {
    throw new Error(json?.msg || "上传失败");
  }
  return { src, name: data?.name || file.name };
};

const isCursorAnchor = (node: Node | null) =>
  node?.nodeType === Node.TEXT_NODE && node.textContent === CURSOR_ANCHOR;

const skipCursorAnchors = (node: Node | null, direction: "prev" | "next") => {
  let current = node;
  while (current && isCursorAnchor(current)) {
    current =
      direction === "prev"
        ? current.previousSibling
        : current.nextSibling;
  }
  return current;
};

const getRemovableBlock = (node: Node | null): HTMLElement | null => {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as HTMLElement;
  if (el.tagName === "IMG") return el;
  if (el.classList.contains(MATH_WIDGET_CLASS)) return el;
  if (el.classList.contains("katex")) {
    return el.closest<HTMLElement>(`.${MATH_WIDGET_CLASS}`) || el;
  }
  return null;
};

const removeNodeWithAnchors = (node: HTMLElement) => {
  if (isCursorAnchor(node.previousSibling)) node.previousSibling?.remove();
  if (isCursorAnchor(node.nextSibling)) node.nextSibling?.remove();
  node.remove();
};

const getCaretNeighbors = (node: HTMLElement) => {
  let prev: Node | null = node.previousSibling;
  let next: Node | null = node.nextSibling;
  if (prev && isCursorAnchor(prev)) prev = prev.previousSibling;
  if (next && isCursorAnchor(next)) next = next.nextSibling;
  return { prev, next };
};

type CaretBookmark = { path: number[]; offset: number };

const getNodePath = (root: Node, target: Node): number[] | null => {
  const path: number[] = [];
  let node: Node | null = target;
  while (node && node !== root) {
    const parentNode: Node | null = node.parentNode;
    if (!parentNode) return null;
    path.unshift(Array.from(parentNode.childNodes).indexOf(node as ChildNode));
    node = parentNode;
  }
  return node === root ? path : null;
};

const getCaretBookmark = (root: HTMLElement): CaretBookmark | null => {
  const selection = globalThis.getSelection();
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;
  const path = getNodePath(root, range.startContainer);
  if (!path) return null;
  return { path, offset: range.startOffset };
};

const restoreCaretBookmark = (
  root: HTMLElement,
  bookmark: CaretBookmark | null,
): boolean => {
  if (!bookmark) return false;
  let node: Node = root;
  for (const index of bookmark.path) {
    if (index < 0 || index >= node.childNodes.length) return false;
    node = node.childNodes[index];
  }
  const selection = globalThis.getSelection();
  if (!selection) return false;
  const range = document.createRange();
  const maxOffset =
    node.nodeType === Node.TEXT_NODE
      ? node.textContent?.length ?? 0
      : node.childNodes.length;
  range.setStart(node, Math.min(bookmark.offset, maxOffset));
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  return root.contains(range.startContainer);
};

const setRangeAtNodeBoundary = (
  range: Range,
  node: Node,
  position: "before" | "after",
) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const length = node.textContent?.length ?? 0;
    range.setStart(node, position === "after" ? length : 0);
    return;
  }
  if (position === "after") {
    range.setStartAfter(node);
  } else {
    range.setStartBefore(node);
  }
};

const stripCursorAnchors = (root: HTMLElement) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const toRemove: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    const textNode = current as Text;
    if (textNode.data === CURSOR_ANCHOR) toRemove.push(textNode);
    current = walker.nextNode();
  }
  toRemove.forEach((node) => node.remove());
};

const getVisibleText = (el: HTMLElement) =>
  (el.textContent || "").replaceAll(CURSOR_ANCHOR, "").trim();

const hasMeaningfulContent = (el: HTMLElement) =>
  getVisibleText(el).length > 0 ||
  Boolean(el.querySelector("img, br, .katex, math"));

const isIntactKatex = (katexEl: HTMLElement) => {
  const htmlPart = katexEl.querySelector(".katex-html");
  return Boolean(htmlPart && getVisibleText(htmlPart as HTMLElement));
};

const isEffectivelyEmpty = (el: HTMLElement) => !hasMeaningfulContent(el);

const hasUnhydratedMath = (root: HTMLElement) => {
  if (root.querySelector("math[latex], math[math-svg]")) return true;

  const hasInlineMath = Array.from(root.querySelectorAll(".math.inline")).some(
    (el) =>
      !el.closest(`.${MATH_WIDGET_CLASS}`) &&
      !(el as HTMLElement).querySelector(".katex"),
  );
  if (hasInlineMath) return true;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (parent?.closest(".katex, .rich-editor-math-widget")) {
      node = walker.nextNode();
      continue;
    }
    const text = (node.textContent || "").replaceAll(CURSOR_ANCHOR, "");
    if (/\$\$[\s\S]+?\$\$/.test(text) || /\$[^$\n]+\$/.test(text)) {
      return true;
    }
    node = walker.nextNode();
  }
  return false;
};

const cleanupEditorDom = (root: HTMLElement) => {
  let changed = false;

  Array.from(root.querySelectorAll(".katex")).forEach((katexEl) => {
    const el = katexEl as HTMLElement;
    const widget = el.closest<HTMLElement>(`.${MATH_WIDGET_CLASS}`);
    if (!widget || !isIntactKatex(el)) {
      removeNodeWithAnchors(widget || el);
      changed = true;
    }
  });

  Array.from(root.querySelectorAll(`.${MATH_WIDGET_CLASS}`)).forEach((widget) => {
    if (isEffectivelyEmpty(widget as HTMLElement)) {
      removeNodeWithAnchors(widget as HTMLElement);
      changed = true;
    }
  });

  Array.from(root.querySelectorAll("math")).forEach((mathEl) => {
    const widget = mathEl.closest<HTMLElement>(`.${MATH_WIDGET_CLASS}`);
    if (!widget) {
      mathEl.remove();
      changed = true;
    }
  });

  let loop = true;
  while (loop) {
    loop = false;
    Array.from(root.querySelectorAll("span, p")).forEach((node) => {
      const el = node as HTMLElement;
      if (el.classList.contains(MATH_WIDGET_CLASS)) return;
      if (el.querySelector("img, .katex, math, br")) return;
      if (isEffectivelyEmpty(el)) {
        el.remove();
        changed = true;
        loop = true;
      }
    });
  }

  return changed;
};

const placeCaretAfterNode = (node: Node) => {
  const selection = globalThis.getSelection();
  if (!selection) return;
  const range = document.createRange();
  const next = node.nextSibling;
  if (next && isCursorAnchor(next)) {
    range.setStart(next, 1);
  } else {
    range.setStartAfter(node);
  }
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

const restoreCaretAtRemovalPoint = (
  parent: Node | null,
  prev: Node | null,
  next: Node | null,
) => {
  const selection = globalThis.getSelection();
  if (!selection || !parent) return;
  const range = document.createRange();
  if (prev) {
    setRangeAtNodeBoundary(range, prev, "after");
  } else if (next) {
    setRangeAtNodeBoundary(range, next, "before");
  } else if (parent.nodeType === Node.ELEMENT_NODE) {
    range.selectNodeContents(parent);
    range.collapse(false);
  } else {
    return;
  }
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

const ensureValidCaret = (root: HTMLElement) => {
  const selection = globalThis.getSelection();
  if (!selection) return;

  const anchorNode = selection.anchorNode;
  if (
    !selection.rangeCount ||
    !anchorNode ||
    !root.contains(anchorNode)
  ) {
    return;
  }

  const anchorElement =
    anchorNode.nodeType === Node.ELEMENT_NODE
      ? (anchorNode as Element)
      : anchorNode.parentElement;
  const trapped = anchorElement?.closest(
    ".katex, .katex-mathml, math, .rich-editor-math-widget",
  );
  if (trapped && root.contains(trapped)) {
    placeCaretAfterNode(trapped);
  }
};

const getBrokenKatexContainer = (root: HTMLElement): HTMLElement | null => {
  const selection = globalThis.getSelection();
  if (!selection?.rangeCount) return null;
  const node = selection.anchorNode;
  if (!node || !root.contains(node)) return null;
  const anchorElement =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;
  const katex = anchorElement?.closest(".katex") as HTMLElement | null;
  if (!katex || isIntactKatex(katex)) return null;
  return katex.closest<HTMLElement>(`.${MATH_WIDGET_CLASS}`) || katex;
};

const getVisibleCaretOffset = (root: HTMLElement): number => {
  const selection = globalThis.getSelection();
  if (!selection?.rangeCount) return 0;
  const { startContainer, startOffset } = selection.getRangeAt(0);
  if (!root.contains(startContainer)) return 0;

  let offset = 0;
  let found = false;

  const walk = (node: Node): boolean => {
    if (found) return true;

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.classList.contains(MATH_WIDGET_CLASS)) {
        if (node === startContainer || el.contains(startContainer)) {
          found = true;
          return true;
        }
        offset += 1;
        return false;
      }
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || "").replaceAll(CURSOR_ANCHOR, "");
      if (node === startContainer) {
        offset += Math.min(startOffset, text.length);
        found = true;
        return true;
      }
      offset += text.length;
      return false;
    }

    for (const child of Array.from(node.childNodes)) {
      if (walk(child)) return true;
    }
    return false;
  };

  for (const child of Array.from(root.childNodes)) {
    if (walk(child)) break;
  }
  return offset;
};

const setVisibleCaretOffset = (root: HTMLElement, targetOffset: number) => {
  const selection = globalThis.getSelection();
  if (!selection) return;

  let offset = 0;
  let placed = false;

  const walk = (node: Node): boolean => {
    if (placed) return true;

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.classList.contains(MATH_WIDGET_CLASS)) {
        if (offset >= targetOffset) {
          placeCaretAfterNode(el);
          placed = true;
          return true;
        }
        offset += 1;
        return false;
      }
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || "").replaceAll(CURSOR_ANCHOR, "");
      if (offset + text.length >= targetOffset) {
        const range = document.createRange();
        range.setStart(node, Math.min(targetOffset - offset, text.length));
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        placed = true;
        return true;
      }
      offset += text.length;
      return false;
    }

    for (const child of Array.from(node.childNodes)) {
      if (walk(child)) return true;
    }
    return false;
  };

  for (const child of Array.from(root.childNodes)) {
    if (walk(child)) break;
  }

  if (!placed) {
    const range = document.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

const deleteCharacter = (
  root: HTMLElement,
  direction: "before" | "after",
): boolean => {
  const selection = globalThis.getSelection();
  if (!selection?.rangeCount) return false;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return false;

  if (!range.collapsed) {
    range.deleteContents();
    return true;
  }

  const adjacent = getAdjacentRemovableForRoot(
    root,
    range,
    direction === "before" ? "before" : "after",
  );
  if (adjacent) return false;

  selection.modify(
    "extend",
    direction === "before" ? "backward" : "forward",
    "character",
  );
  if (selection.isCollapsed) return false;
  selection.deleteFromDocument();
  selection.collapseToStart();
  return true;
};

const getAdjacentRemovableForRoot = (
  root: HTMLElement,
  range: Range,
  direction: "before" | "after",
): HTMLElement | null => {
  const { startContainer, startOffset } = range;
  let node: Node | null = null;

  if (startContainer.nodeType === Node.TEXT_NODE) {
    const text = startContainer.textContent || "";
    if (direction === "before") {
      if (
        startOffset > 0 &&
        text.slice(0, startOffset).replaceAll(CURSOR_ANCHOR, "").length > 0
      ) {
        return null;
      }
      node = startContainer.previousSibling;
    } else {
      if (
        startOffset < text.length &&
        text.slice(startOffset).replaceAll(CURSOR_ANCHOR, "").length > 0
      ) {
        return null;
      }
      node = startContainer.nextSibling;
    }
  } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
    const el = startContainer as Element;
    node =
      direction === "before"
        ? el.childNodes[startOffset - 1] || el.previousSibling
        : el.childNodes[startOffset] || el.nextSibling;
  }

  return getRemovableBlock(skipCursorAnchors(node, direction === "before" ? "prev" : "next"));
};

const hasCorruptedMathDom = (root: HTMLElement) =>
  Array.from(root.querySelectorAll(".katex")).some((el) => {
    const widget = (el as HTMLElement).closest(`.${MATH_WIDGET_CLASS}`);
    return !widget || !isIntactKatex(el as HTMLElement);
  });

const shouldRebuildEditorDom = (
  root: HTMLElement,
  forceCleanup?: boolean,
) => forceCleanup || hasCorruptedMathDom(root) || hasUnhydratedMath(root);

const App = forwardRef((props: any, ref) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const resizingRef = useRef<{
    image: HTMLImageElement;
    pointerId: number;
    anchorLeft: number;
    anchorTop: number;
    baseWidth: number;
    baseHeight: number;
  } | null>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [overlayRect, setOverlayRect] = useState<OverlayRect | null>(null);
  const isDirtyRef = useRef(false);
  const lastSyncedHtmlRef = useRef<string | null>(null);
  const skipNextInputRef = useRef(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = styles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  const getSanitizedHtml = (element: HTMLDivElement) => {
    const clone = element.cloneNode(true) as HTMLDivElement;
    const runtimeImages = clone.querySelectorAll<HTMLImageElement>("img");
    runtimeImages.forEach((img) => {
      if (img.dataset.runtimeResized === "true") {
        const width =
          img.offsetWidth || Number.parseInt(img.style.width, 10) || 0;
        const height =
          img.offsetHeight || Number.parseInt(img.style.height, 10) || 0;
        if (width > 0 && height > 0) {
          img.style.width = `${width}px`;
          img.style.height = `${height}px`;
        }
      }
      delete img.dataset.baseWidth;
      delete img.dataset.baseHeight;
      delete img.dataset.runtimeResized;
    });

    clone.querySelectorAll<HTMLElement>(`.${MATH_WIDGET_CLASS}`).forEach((widget) => {
      const math = document.createElement("math");
      const latex = widget.dataset.latex || "";
      const svgUrl = widget.dataset.mathSvg || "";
      if (latex) math.setAttribute("latex", latex);
      if (svgUrl) math.setAttribute("math-svg", svgUrl);
      widget.replaceWith(math);
    });

    clone.querySelectorAll<HTMLImageElement>("img[data-math-svg]").forEach((img) => {
      const math = document.createElement("math");
      const svgUrl = img.getAttribute("data-math-svg") || "";
      const latex = img.getAttribute("data-latex") || "";
      if (latex) math.setAttribute("latex", latex);
      if (svgUrl) math.setAttribute("math-svg", svgUrl);
      img.replaceWith(math);
    });

    stripCursorAnchors(clone);
    return clone.innerHTML;
  };

  const computeFitSize = (
    naturalWidth: number,
    naturalHeight: number,
    maxWidth: number,
    maxHeight: number,
  ) => {
    if (!naturalWidth || !naturalHeight) {
      return { width: maxWidth, height: maxHeight };
    }
    const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
    return {
      width: Math.round(naturalWidth * scale),
      height: Math.round(naturalHeight * scale),
    };
  };

  const getImageLogicalSize = (img: HTMLImageElement) => {
    const styleW = Number.parseInt(img.style.width, 10);
    const styleH = Number.parseInt(img.style.height, 10);
    if (styleW > 0 && styleH > 0) return { width: styleW, height: styleH };
    const attrW = Number.parseInt(img.getAttribute("width") || "", 10);
    const attrH = Number.parseInt(img.getAttribute("height") || "", 10);
    if (attrW > 0 && attrH > 0) return { width: attrW, height: attrH };
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      return { width: img.naturalWidth, height: img.naturalHeight };
    }
    return null;
  };

  const clampInitialOversizedImage = (
    img: HTMLImageElement,
    width: number,
    height: number,
  ) => {
    if (
      width <= INIT_IMAGE_OVERSIZE_THRESHOLD &&
      height <= INIT_IMAGE_OVERSIZE_THRESHOLD
    ) {
      return false;
    }
    const size = computeFitSize(
      width,
      height,
      INIT_IMAGE_CLAMP_SIZE,
      INIT_IMAGE_CLAMP_SIZE,
    );
    img.style.width = `${size.width}px`;
    img.style.height = `${size.height}px`;
    img.style.display = "inline-block";
    img.style.verticalAlign = "middle";
    img.style.objectFit = "contain";
    return true;
  };

  const normalizeInitialImages = (container: HTMLElement) => {
    let changed = false;
    const syncChange = () => {
      if (!changed || !editorRef.current || !props.onChange) return;
      const sanitized = getSanitizedHtml(editorRef.current);
      props.onChange(sanitized);
      lastSyncedHtmlRef.current = sanitized;
      changed = false;
    };

    container.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
      const apply = () => {
        const size = getImageLogicalSize(img);
        if (!size) return;
        if (clampInitialOversizedImage(img, size.width, size.height)) {
          changed = true;
        }
      };
      if (img.complete) {
        apply();
      } else {
        img.addEventListener(
          "load",
          () => {
            apply();
            syncChange();
          },
          { once: true },
        );
      }
    });
    syncChange();
  };

  /** 与 parseMathHtmlToWangeditor 中 latex 处理保持一致 */
  const normalizeMathLatexAttribute = (raw: string) => {
    let latex = raw.trim();
    latex = latex.replaceAll(/^\$+|\$+$/g, '');
    latex = latex.replaceAll(/\{\*\{\d+\}\{([^}]*)\}\}/g, '{$1}');
    const textarea = document.createElement('textarea');
    textarea.innerHTML = latex;
    return textarea.value;
  };

  const wrapInlineNode = (
    node: HTMLElement,
    latex: string,
    svgUrl: string,
  ) => {
    if (node.closest(`.${MATH_WIDGET_CLASS}`)) return;
    const parent = node.parentNode;
    if (!parent) return;

    const widget = document.createElement("span");
    widget.className = MATH_WIDGET_CLASS;
    widget.contentEditable = "false";
    if (latex) widget.dataset.latex = latex;
    if (svgUrl) widget.dataset.mathSvg = svgUrl;
    widget.style.display = "inline-block";
    widget.style.verticalAlign = "middle";

    const before = document.createTextNode(CURSOR_ANCHOR);
    const after = document.createTextNode(CURSOR_ANCHOR);
    parent.insertBefore(before, node);
    parent.insertBefore(widget, node);
    widget.appendChild(node);
    parent.insertBefore(after, widget.nextSibling);
  };

  const replaceMathElementsWithKatex = (container: HTMLElement) => {
    const mathNodes = Array.from(
      container.querySelectorAll("math[latex], math[math-svg]"),
    );
    mathNodes.forEach((mathEl) => {
      let latex = mathEl.getAttribute("latex") || "";
      latex = normalizeMathLatexAttribute(latex);
      const svgUrl = mathEl.getAttribute("math-svg") || "";

      const replaceWithImg = () => {
        if (!svgUrl) return;
        const img = document.createElement("img");
        img.src = svgUrl;
        img.alt = "";
        img.style.verticalAlign = "middle";
        img.style.display = "inline-block";
        mathEl.replaceWith(img);
        wrapInlineNode(img, "", svgUrl);
      };

      if (!latex) {
        if (svgUrl) replaceWithImg();
        else mathEl.remove();
        return;
      }

      const renderEl = document.createElement("span");
      renderEl.style.display = "inline-block";
      renderEl.style.verticalAlign = "middle";

      try {
        katex.render(latex, renderEl, {
          displayMode: false,
          throwOnError: true,
          strict: "ignore",
        });
        mathEl.replaceWith(renderEl);
        wrapInlineNode(renderEl, latex, svgUrl);
      } catch {
        if (svgUrl) {
          replaceWithImg();
          return;
        }
        katex.render(latex, renderEl, {
          displayMode: false,
          throwOnError: false,
          strict: "ignore",
        });
        mathEl.replaceWith(renderEl);
        wrapInlineNode(renderEl, latex, svgUrl);
      }
    });
  };

  const hydrateMathContent = (container: HTMLElement) => {
    replaceMathElementsWithKatex(container);

    renderMathInElement(container, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
      ignoredClasses: ["katex", MATH_WIDGET_CLASS],
    });

    container.querySelectorAll(".math.inline").forEach((element) => {
      const el = element as HTMLElement;
      if (el.closest(`.${MATH_WIDGET_CLASS}`) || el.querySelector(".katex")) {
        return;
      }

      let latex = el.textContent || "";
      if (latex.startsWith("\\(") && latex.endsWith("\\)")) {
        latex = latex.slice(2, -2);
      }

      try {
        katex.render(latex, el, {
          throwOnError: false,
          displayMode: false,
        });
        wrapInlineNode(el, latex, "");
      } catch (e) {
        console.error("KaTeX Error:", e);
      }
    });

    normalizeInitialImages(container);
  };

  useEffect(() => {
    if (!editorRef.current) return;
    const nextValue = props.value || "";

    if (lastSyncedHtmlRef.current === nextValue) return;

    const sanitizedCurrent = getSanitizedHtml(editorRef.current);
    if (sanitizedCurrent === nextValue) {
      lastSyncedHtmlRef.current = nextValue;
      isDirtyRef.current = false;
      return;
    }

    editorRef.current.innerHTML = nextValue;
    setSelectedImage(null);
    setOverlayRect(null);
    if (nextValue) {
      hydrateMathContent(editorRef.current);
    }
    lastSyncedHtmlRef.current = nextValue;
    isDirtyRef.current = false;
  }, [props.value]);

  const getAdjacentRemovable = (
    range: Range,
    direction: "before" | "after",
  ): HTMLElement | null => {
    if (!editorRef.current) return null;
    return getAdjacentRemovableForRoot(editorRef.current, range, direction);
  };

  const rebuildEditorDom = (root: HTMLDivElement, caretOffset: number | null) => {
    cleanupEditorDom(root);
    const sanitized = getSanitizedHtml(root);
    root.innerHTML = sanitized;
    if (sanitized) {
      hydrateMathContent(root);
    }
    if (caretOffset !== null) {
      setVisibleCaretOffset(root, caretOffset);
    }
    return sanitized;
  };

  const removeAdjacentBlock = (direction: "before" | "after") => {
    const selection = globalThis.getSelection();
    if (!selection?.rangeCount || !editorRef.current) return false;
    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return false;

    if (!range.collapsed) {
      range.deleteContents();
      return true;
    }

    const target = getAdjacentRemovable(
      range,
      direction === "before" ? "before" : "after",
    );
    if (!target) return false;
    const parent = target.parentNode;
    const { prev, next } = getCaretNeighbors(target);
    removeNodeWithAnchors(target);
    restoreCaretAtRemovalPoint(parent, prev, next);
    return true;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (props.readOnly) return;
    if (event.key !== "Backspace" && event.key !== "Delete") return;
    if (!editorRef.current) return;

    event.preventDefault();
    const root = editorRef.current;
    const direction = event.key === "Backspace" ? "before" : "after";
    let handled = false;

    if (selectedImage) {
      const parent = selectedImage.parentNode;
      const { prev, next } = getCaretNeighbors(selectedImage);
      removeNodeWithAnchors(selectedImage);
      restoreCaretAtRemovalPoint(parent, prev, next);
      setSelectedImage(null);
      setOverlayRect(null);
      handled = true;
    } else {
      const brokenKatex = getBrokenKatexContainer(root);
      if (brokenKatex) {
        const parent = brokenKatex.parentNode;
        const { prev, next } = getCaretNeighbors(brokenKatex);
        removeNodeWithAnchors(brokenKatex);
        restoreCaretAtRemovalPoint(parent, prev, next);
        handled = true;
      } else if (removeAdjacentBlock(direction)) {
        handled = true;
      } else {
        handled = deleteCharacter(root, direction);
      }
    }

    if (handled) {
      isDirtyRef.current = true;
      skipNextInputRef.current = true;
      syncEditorContent({ forceCleanup: true });
    }
  };

  const syncEditorContent = (options?: {
    restoreCaret?: boolean;
    forceCleanup?: boolean;
  }) => {
    if (!editorRef.current) return;
    const root = editorRef.current;

    if (shouldRebuildEditorDom(root, options?.forceCleanup)) {
      const caretOffset = getVisibleCaretOffset(root);
      const sanitized = rebuildEditorDom(root, caretOffset);
      const prevValue = props.value || "";
      if (sanitized !== prevValue && props.onChange) {
        props.onChange(sanitized);
        lastSyncedHtmlRef.current = sanitized;
      }
    } else if (isDirtyRef.current) {
      const sanitized = getSanitizedHtml(root);
      const prevValue = props.value || "";
      if (sanitized !== prevValue && props.onChange) {
        props.onChange(sanitized);
        lastSyncedHtmlRef.current = sanitized;
      }
    }

    if (options?.restoreCaret) {
      ensureValidCaret(root);
    }
    if (
      selectedImage &&
      editorRef.current &&
      !editorRef.current.contains(selectedImage)
    ) {
      setSelectedImage(null);
      setOverlayRect(null);
    }
  };

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    if (skipNextInputRef.current) {
      skipNextInputRef.current = false;
      return;
    }
    isDirtyRef.current = true;
    syncEditorContent();
  };

  const handleEditorBlur = () => {
    if (!isDirtyRef.current) return;
    syncEditorContent();
    isDirtyRef.current = false;
    props.onBlur?.();
  };

  useEffect(() => {
    const flushEditor = () => {
      if (!isDirtyRef.current || !editorRef.current) return;
      syncEditorContent();
      isDirtyRef.current = false;
    };
    document.addEventListener("topic-editor-flush", flushEditor);
    return () => document.removeEventListener("topic-editor-flush", flushEditor);
  }, []);

  const insertNodeAtCursor = (node: Node) => {
    if (!editorRef.current) return;

    const selection = globalThis.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
    }

    editorRef.current.appendChild(node);
  };

  const insertHtmlAtCursor = (html: string) => {
    if (!html) return;
    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const fragment = range.createContextualFragment(html);
    range.deleteContents();
    range.insertNode(fragment);
  };

  const insertPastedImage = (imageSrc: string, imageName?: string) => {
    if (!editorRef.current) return;

    const imageElement = document.createElement("img");
    imageElement.src = imageSrc;
    imageElement.alt = imageName || "pasted-image";
    imageElement.style.display = "inline-block";
    imageElement.style.verticalAlign = "middle";
    imageElement.style.objectFit = "contain";

    const applyDefaultImageStyle = () => {
      imageElement.style.maxWidth = "100%";
      imageElement.style.height = "auto";
      imageElement.style.display = "inline-block";
      imageElement.style.verticalAlign = "middle";
      insertNodeAtCursor(imageElement);
      isDirtyRef.current = true;
      syncEditorContent();
    };

    const measureImage = new Image();
    measureImage.onload = () => {
      const size = computeFitSize(
        measureImage.naturalWidth,
        measureImage.naturalHeight,
        MAX_IMAGE_WIDTH,
        MAX_IMAGE_HEIGHT,
      );
      imageElement.style.width = `${size.width}px`;
      imageElement.style.height = `${size.height}px`;
      insertNodeAtCursor(imageElement);
      isDirtyRef.current = true;
      syncEditorContent();
    };
    measureImage.onerror = applyDefaultImageStyle;
    measureImage.src = imageSrc;
  };

  const updateOverlay = (targetImage: HTMLImageElement | null) => {
    if (!targetImage || !wrapperRef.current || props.readOnly) {
      setOverlayRect(null);
      return;
    }
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const imageRect = targetImage.getBoundingClientRect();
    setOverlayRect({
      top: imageRect.top - wrapperRect.top,
      left: imageRect.left - wrapperRect.left,
      width: imageRect.width,
      height: imageRect.height,
    });
  };

  const applyRuntimeSize = (
    image: HTMLImageElement,
    width: number,
    height: number,
  ) => {
    image.style.width = `${Math.round(width)}px`;
    image.style.height = `${Math.round(height)}px`;
    image.dataset.runtimeResized = "true";
    updateOverlay(image);
  };

  const handleResizePointerMove = (event: PointerEvent) => {
    const resizing = resizingRef.current;
    if (!resizing) return;
    if (event.pointerId !== resizing.pointerId) return;
    event.preventDefault();

    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const wrapperRect = wrapper.getBoundingClientRect();
    const pointerX = event.clientX - wrapperRect.left;
    const pointerY = event.clientY - wrapperRect.top;

    const dx = Math.max(pointerX - resizing.anchorLeft, 1);
    const dy = Math.max(pointerY - resizing.anchorTop, 1);
    const rawScale = Math.min(
      dx / resizing.baseWidth,
      dy / resizing.baseHeight,
    );
    const clampedScale = Math.max(
      MIN_RUNTIME_SCALE,
      Math.min(MAX_RUNTIME_SCALE, rawScale),
    );
    
    // 计算拉伸后的尺寸
    let newWidth = resizing.baseWidth * clampedScale;
    let newHeight = resizing.baseHeight * clampedScale;
    
    // 限制最大宽高为465px
    if (newWidth > MAX_IMAGE_WIDTH) {
      newHeight = (newHeight / newWidth) * MAX_IMAGE_WIDTH;
      newWidth = MAX_IMAGE_WIDTH;
    }
    if (newHeight > MAX_IMAGE_HEIGHT) {
      newWidth = (newWidth / newHeight) * MAX_IMAGE_HEIGHT;
      newHeight = MAX_IMAGE_HEIGHT;
    }
    
    applyRuntimeSize(
      resizing.image,
      newWidth,
      newHeight,
    );
  };

  const handleResizePointerUp = (event: PointerEvent) => {
    const resizing = resizingRef.current;
    if (!resizing) return;
    if (event.pointerId !== resizing.pointerId) return;
    resizingRef.current = null;
    globalThis.removeEventListener("pointermove", handleResizePointerMove);
    globalThis.removeEventListener("pointerup", handleResizePointerUp);
    isDirtyRef.current = true;
    syncEditorContent();
  };

  const handleResizePointerDown = (
    event: React.PointerEvent<HTMLElement>,
    _position: HandlePosition,
  ) => {
    if (props.readOnly || !selectedImage) return;
    event.preventDefault();
    event.stopPropagation();

    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const wrapperRect = wrapper.getBoundingClientRect();
    const imageRect = selectedImage.getBoundingClientRect();
    const baseWidth = Number(
      selectedImage.dataset.baseWidth || imageRect.width,
    );
    const baseHeight = Number(
      selectedImage.dataset.baseHeight || imageRect.height,
    );
    selectedImage.dataset.baseWidth = `${baseWidth}`;
    selectedImage.dataset.baseHeight = `${baseHeight}`;

    resizingRef.current = {
      image: selectedImage,
      pointerId: event.pointerId,
      anchorLeft: imageRect.left - wrapperRect.left,
      anchorTop: imageRect.top - wrapperRect.top,
      baseWidth,
      baseHeight,
    };

    globalThis.addEventListener("pointermove", handleResizePointerMove);
    globalThis.addEventListener("pointerup", handleResizePointerUp);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (props.readOnly) return;

    const clipboardItems = event.clipboardData?.items;
    if (!clipboardItems?.length) return;

    const imageItem = Array.from(clipboardItems).find((item) =>
      item.type.startsWith("image/"),
    );
    if (!imageItem) return;

    const file = imageItem.getAsFile();
    if (!file) return;

    event.preventDefault();

    const fallbackHtml = event.clipboardData?.getData("text/html") || "";
    const fallbackText = event.clipboardData?.getData("text/plain") || "";

    const insertPasteFallback = () => {
      if (fallbackHtml) {
        insertHtmlAtCursor(fallbackHtml);
      } else if (fallbackText) {
        insertNodeAtCursor(document.createTextNode(fallbackText));
      }
      isDirtyRef.current = true;
      syncEditorContent();
    };

    const processFileAsImage = async () => {
      try {
        const { src, name } = await uploadPastedImageFile(file);
        if (!editorRef.current) return;
        insertPastedImage(src, name);
      } catch (error: any) {
        message.error(error?.message || "图片上传失败");
        insertPasteFallback();
      }
    };

    const mimeType = file.type || imageItem.type || "";
    const isKnownMime = SUPPORTED_IMAGE_MIME_TYPES.has(mimeType);
    if (!isKnownMime && !mimeType.startsWith("image/")) return;

    void processFileAsImage();
  };

  const handleEditorTargetSelection = (target: EventTarget | null) => {
    if (props.readOnly) return;
    const node = target as HTMLElement | null;
    if (!node) return;

    const widget = node.closest<HTMLElement>(`.${MATH_WIDGET_CLASS}`);
    if (widget && editorRef.current?.contains(widget)) {
      placeCaretAfterNode(widget);
      setSelectedImage(null);
      setOverlayRect(null);
      return;
    }

    const tagName = node.tagName?.toLowerCase?.() || "";
    if (tagName === "img") {
      setSelectedImage(node as HTMLImageElement);
      editorRef.current?.focus();
      return;
    }
    setSelectedImage(null);
    setOverlayRect(null);
  };

  useEffect(() => {
    updateOverlay(selectedImage);
  }, [selectedImage, props.readOnly]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !selectedImage || props.readOnly) return;
    const onScroll = () => updateOverlay(selectedImage);
    const onResize = () => updateOverlay(selectedImage);
    editor.addEventListener("scroll", onScroll);
    globalThis.addEventListener("resize", onResize);
    return () => {
      editor.removeEventListener("scroll", onScroll);
      globalThis.removeEventListener("resize", onResize);
    };
  }, [selectedImage, props.readOnly]);

  useEffect(() => {
    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target as Node)) return;
      setSelectedImage(null);
      setOverlayRect(null);
    };
    globalThis.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => {
      globalThis.removeEventListener("pointerdown", handleOutsidePointerDown);
      globalThis.removeEventListener("pointermove", handleResizePointerMove);
      globalThis.removeEventListener("pointerup", handleResizePointerUp);
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onClick = (event: MouseEvent) =>
      handleEditorTargetSelection(event.target);
    editor.addEventListener("click", onClick);
    return () => {
      editor.removeEventListener("click", onClick);
    };
  }, [props.readOnly]);

  const overlayStyle = useMemo<React.CSSProperties>(() => {
    if (!overlayRect || props.readOnly) return { display: "none" };
    return {
      position: "absolute",
      top: overlayRect.top,
      left: overlayRect.left,
      width: overlayRect.width,
      height: overlayRect.height,
      border: "1px solid #1677ff",
      boxSizing: "border-box",
      pointerEvents: "none",
      zIndex: 2,
    };
  }, [overlayRect, props.readOnly]);

  const getHandleStyle = (position: HandlePosition): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      width: HANDLE_SIZE,
      height: HANDLE_SIZE,
      borderRadius: 2,
      background: "#1677ff",
      border: "1px solid #ffffff",
      pointerEvents: "auto",
      transform: "translate(-50%, -50%)",
      cursor: "nwse-resize",
    };
    if (position === "nw") return { ...baseStyle, top: 0, left: 0 };
    if (position === "ne") {
      return {
        ...baseStyle,
        top: 0,
        left: "100%",
        cursor: "nesw-resize",
      };
    }
    if (position === "sw") {
      return {
        ...baseStyle,
        top: "100%",
        left: 0,
        cursor: "nesw-resize",
      };
    }
    return { ...baseStyle, top: "100%", left: "100%" };
  };

  const insertMathAtCursor = useCallback(
    (latex: string, svgUrl: string) => {
      if (!editorRef.current) return;
      const root = editorRef.current;

      const widget = document.createElement("span");
      widget.className = MATH_WIDGET_CLASS;
      widget.contentEditable = "false";
      widget.style.display = "inline-block";
      widget.style.verticalAlign = "middle";
      if (latex) widget.dataset.latex = latex;
      if (svgUrl) widget.dataset.mathSvg = svgUrl;

      if (latex) {
        const renderEl = document.createElement("span");
        renderEl.style.display = "inline-block";
        renderEl.style.verticalAlign = "middle";
        try {
          katex.render(latex, renderEl, {
            displayMode: false,
            throwOnError: true,
            strict: "ignore",
          });
        } catch {
          katex.render(latex, renderEl, {
            displayMode: false,
            throwOnError: false,
            strict: "ignore",
          });
        }
        widget.appendChild(renderEl);
      } else if (svgUrl) {
        const img = document.createElement("img");
        img.src = svgUrl;
        img.alt = "";
        img.style.verticalAlign = "middle";
        img.style.display = "inline-block";
        widget.appendChild(img);
      }

      const before = document.createTextNode(CURSOR_ANCHOR);
      const after = document.createTextNode(CURSOR_ANCHOR);
      const fragment = document.createDocumentFragment();
      fragment.appendChild(before);
      fragment.appendChild(widget);
      fragment.appendChild(after);

      const selection = globalThis.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (root.contains(range.commonAncestorContainer)) {
          range.deleteContents();
          range.insertNode(fragment);
          range.setStartAfter(after);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          root.appendChild(fragment);
        }
      } else {
        root.appendChild(fragment);
      }

      isDirtyRef.current = true;
      syncEditorContent();
    },
    [],
  );

  const updateMathAtIndex = useCallback(
    (index: number, latex: string, svgUrl: string) => {
      if (!editorRef.current) return;
      const root = editorRef.current;
      const widgets = Array.from(
        root.querySelectorAll<HTMLElement>(`.${MATH_WIDGET_CLASS}`),
      );
      const widget = widgets[index];
      if (!widget) {
        insertMathAtCursor(latex, svgUrl);
        return;
      }

      widget.innerHTML = "";
      delete widget.dataset.latex;
      delete widget.dataset.mathSvg;

      if (!latex) {
        if (svgUrl) {
          const img = document.createElement("img");
          img.src = svgUrl;
          img.alt = "";
          img.style.verticalAlign = "middle";
          img.style.display = "inline-block";
          widget.appendChild(img);
          widget.dataset.mathSvg = svgUrl;
        } else {
          const parent = widget.parentNode;
          const { prev, next } = getCaretNeighbors(widget);
          removeNodeWithAnchors(widget);
          restoreCaretAtRemovalPoint(parent, prev, next);
        }
      } else {
        const renderEl = document.createElement("span");
        renderEl.style.display = "inline-block";
        renderEl.style.verticalAlign = "middle";
        try {
          katex.render(latex, renderEl, {
            displayMode: false,
            throwOnError: true,
            strict: "ignore",
          });
        } catch {
          katex.render(latex, renderEl, {
            displayMode: false,
            throwOnError: false,
            strict: "ignore",
          });
        }
        widget.appendChild(renderEl);
        widget.dataset.latex = latex;
        if (svgUrl) widget.dataset.mathSvg = svgUrl;
      }

      isDirtyRef.current = true;
      syncEditorContent();
    },
    [insertMathAtCursor],
  );

  const insertImageAtCursor = useCallback(
    (imageSrc: string, imageName: string) => {
      if (!editorRef.current) return;

      const img = document.createElement("img");
      img.src = imageSrc;
      img.alt = imageName || "image";
      img.style.display = "inline-block";
      img.style.verticalAlign = "middle";
      img.style.objectFit = "contain";

      const measureImage = new Image();
      measureImage.onload = () => {
        const size = computeFitSize(
          measureImage.naturalWidth,
          measureImage.naturalHeight,
          MAX_IMAGE_WIDTH,
          MAX_IMAGE_HEIGHT,
        );
        img.style.width = `${size.width}px`;
        img.style.height = `${size.height}px`;
        insertNodeAtCursor(img);
        isDirtyRef.current = true;
        syncEditorContent();
      };
      measureImage.onerror = () => {
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        insertNodeAtCursor(img);
        isDirtyRef.current = true;
        syncEditorContent();
      };
      measureImage.src = imageSrc;
    },
    [],
  );

  useImperativeHandle(ref, () => ({
    insertMathAtCursor,
    updateMathAtIndex,
    insertImageAtCursor,
  }));

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <div
        ref={editorRef}
        className="rich-editor"
        contentEditable={!props.readOnly}
        suppressContentEditableWarning
        data-placeholder={props?.placeholder || '请输入'}
        onBlur={handleEditorBlur}
        onInput={handleEditorInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        style={{
          padding: "12px",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          outline: "none",
          lineHeight: 1.5,
          overflow: "auto",
          minHeight: props.height || "100px",
          overflowY: "hidden",
        }}
      />
      <div style={overlayStyle}>
        {HANDLE_POSITIONS.map((position) => (
          <button
            type="button"
            aria-label={`resize-${position}`}
            key={position}
            style={getHandleStyle(position)}
            onPointerDown={(event) => handleResizePointerDown(event, position)}
          />
        ))}
      </div>
    </div>
  );
});

export default connect(
  (state: any) => ({
    commonModel: state.commonModel,
  }),
  null,
  null,
  { forwardRef: true },
)(App);
