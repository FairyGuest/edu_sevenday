import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import Quill from 'quill';
import { Button } from 'antd';
import { ZYIcon } from '@/components';
import { normalizeFormulaLatex } from '@/utils';
import FormulaBlot from './formulaBlot';
import QuillEditor from '../index';
import type { QuillEditorProps, QuillEditorRef } from '../index';
import { normalizeFormulaHTML } from './util';
import './index.less';

// ==================== 全局注册 FormulaBlot ====================
Quill.register('blots/formula', FormulaBlot);

// ==================== MathLatexSDK 配置 ====================
declare global {
  interface Window {
    MathLatexSDK: {
      init: (config: any, callback: (data: any) => void) => void;
      open: (options?: { spanId?: string; content?: string }) => void;
    };
  }
}

const SDK_CONFIG = {
  appID: 'app_9661bdd4382e45dc',
  secretKey: '0c01654a2d1de04b09317c1f690c7f5f8a64f17f3b6bc65dc0a24d1cb41a0ba4',
  iframeSrc: 'https://api.mathpix.pro/#/sdk',
};

const FORMULA_SELECTED_CLASS = 'ql-formula-selected';

// ==================== 工具：在 Quill 模型中定位公式 ====================
function getFormulaModelIndex(quill: Quill, formulaEl: HTMLElement): number {
  const allFormulas = Array.from(quill.root.querySelectorAll('.ql-formula'));
  const domIndex = allFormulas.indexOf(formulaEl);
  if (domIndex < 0) return -1;

  const contents = quill.getContents();
  let formulaCount = 0;
  let charIndex = 0;

  for (const op of contents.ops ?? []) {
    const insert = op.insert;
    if (typeof insert === 'object' && insert !== null && 'formula' in insert) {
      if (formulaCount === domIndex) return charIndex;
      formulaCount++;
    }
    if (typeof insert === 'string') {
      charIndex += insert.length;
    } else {
      charIndex += 1;
    }
  }

  return -1;
}

// ==================== FormulaEditor 组件 ====================
export interface FormulaEditorProps extends Omit<QuillEditorProps, 'modules'> {
  modules?: Record<string, any>;
}

const FormulaEditor = forwardRef<QuillEditorRef, FormulaEditorProps>(
  (props, ref) => {
    const {
      value,
      onChange,
      readOnly = false,
      placeholder,
      height,
      modules: customModules,
      onBlur,
      imageUploadMode,
    } = props;

    const editorRef = useRef<QuillEditorRef>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [selectedFormulaEl, setSelectedFormulaEl] = useState<HTMLElement | null>(null);
    const editingElMapRef = useRef<Record<string, HTMLElement>>({});

    // ==================== 旧格式公式 → ql-formula ====================
    const normalizedValue = useMemo(
      () => normalizeFormulaHTML(value || ''),
      [value],
    );

    // ==================== 暴露 ref ====================
    useImperativeHandle(ref, () => ({
      getQuill: () => editorRef.current?.getQuill() ?? null,
      getHTML: () => editorRef.current?.getHTML() ?? '',
      getText: () => editorRef.current?.getText() ?? '',
      insertEmbed: (index: number, type: string, val: any) => {
        editorRef.current?.insertEmbed(index, type, val);
      },
    }));

    // ==================== SDK 回调 ====================
    const handleFormulaCallback = useCallback((data: any) => {
      const latex = normalizeFormulaLatex(data?.latexOut || '');
      if (!latex) return;

      const quill = editorRef.current?.getQuill();
      if (!quill) return;

      const spanId = data?.spanId as string | undefined;
      const editEl = spanId != null ? editingElMapRef.current[spanId] : undefined;

      if (editEl) {
        // 编辑已有公式
        const index = getFormulaModelIndex(quill, editEl);
        if (index >= 0) {
          quill.deleteText(index, 1);
          quill.insertEmbed(index, 'formula', { latex });
          quill.setSelection(index + 1, 0);
        }
        if (spanId) delete editingElMapRef.current[spanId];
      } else {
        // 插入新公式
        const range = quill.getSelection(true);
        const index = range?.index ?? quill.getLength();
        quill.insertEmbed(index, 'formula', { latex });
        quill.setSelection(index + 1, 0);
      }

      editingElMapRef.current = {};
      setSelectedFormulaEl(null);
    }, []);

    // ==================== 初始化 SDK ====================
    const initSDK = useCallback((callback: (data: any) => void) => {
      if (!window.MathLatexSDK) return false;
      window.MathLatexSDK.init(
        {
          iframeSrc: SDK_CONFIG.iframeSrc,
          appID: SDK_CONFIG.appID,
          secretKey: SDK_CONFIG.secretKey,
        },
        callback,
      );
      return true;
    }, []);

    // ==================== 插入公式 ====================
    const openFormulaEditor = useCallback(() => {
      if (readOnly) return;
      setSelectedFormulaEl(null);
      editingElMapRef.current = {};

      const open = () => {
        if (!window.MathLatexSDK) { setTimeout(open, 100); return; }
        initSDK(handleFormulaCallback);
        window.MathLatexSDK.open();
      };
      open();
    }, [readOnly, initSDK, handleFormulaCallback]);

    // ==================== 点击编辑已有公式 ====================
    const openExistingFormulaEditor = useCallback(
      (formulaEl: HTMLElement) => {
        if (readOnly) return;

        const rawLatex = formulaEl.getAttribute('data-latex') || '';
        const latex = normalizeFormulaLatex(rawLatex);

        setSelectedFormulaEl(formulaEl);

        const formulaId = `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        editingElMapRef.current[formulaId] = formulaEl;

        const open = () => {
          if (!window.MathLatexSDK) { setTimeout(open, 100); return; }
          initSDK(handleFormulaCallback);
          window.MathLatexSDK.open({ spanId: formulaId, content: latex });
        };
        open();
      },
      [readOnly, initSDK, handleFormulaCallback],
    );

    // ==================== 监听公式点击 ====================
    useEffect(() => {
      if (readOnly) return;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const formulaEl = target.closest('.ql-formula') as HTMLElement | null;
        if (!formulaEl || !wrapper.contains(formulaEl)) {
          setSelectedFormulaEl(null);
          return;
        }
        setTimeout(() => openExistingFormulaEditor(formulaEl), 0);
      };

      wrapper.addEventListener('click', handleClick);
      return () => wrapper.removeEventListener('click', handleClick);
    }, [readOnly, openExistingFormulaEditor]);

    // ==================== 点击外部取消选中 ====================
    useEffect(() => {
      const handleOutside = (e: PointerEvent) => {
        if (!wrapperRef.current?.contains(e.target as Node)) {
          setSelectedFormulaEl(null);
        }
      };
      globalThis.addEventListener('pointerdown', handleOutside);
      return () => globalThis.removeEventListener('pointerdown', handleOutside);
    }, []);

    // ==================== 同步选中态到 DOM ====================
    useEffect(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      wrapper
        .querySelectorAll(`.${FORMULA_SELECTED_CLASS}`)
        .forEach((el) => el.classList.remove(FORMULA_SELECTED_CLASS));
      if (selectedFormulaEl && wrapper.contains(selectedFormulaEl)) {
        selectedFormulaEl.classList.add(FORMULA_SELECTED_CLASS);
      }
    }, [selectedFormulaEl]);

    return (
      <div className="quill-formula-editor" ref={wrapperRef}>
        {!readOnly && (
          <Button
            className="formula-btn"
            type="text"
            size="small"
            icon={<ZYIcon type="math" />}
            onClick={openFormulaEditor}
          >
            插入公式
          </Button>
        )}
        <QuillEditor
          ref={editorRef}
          value={normalizedValue}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          height={height}
          modules={customModules}
          onBlur={onBlur}
          imageUploadMode={imageUploadMode}
        />
      </div>
    );
  },
);

FormulaEditor.displayName = 'FormulaEditor';

export default FormulaEditor;
