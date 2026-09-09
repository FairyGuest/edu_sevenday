import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { message } from 'antd';
import {
  uploadPhotoQuestionImage,
  type PhotoQuestionImageUploadMode,
} from '@/utils/photoQuestionImageUpload';
import './index.less';

const insertImageIntoQuill = (quill: Quill, displaySrc: string) => {
  const range = quill.getSelection(true);
  const index = range?.index ?? quill.getLength();
  quill.insertEmbed(index, 'image', displaySrc);
  quill.setSelection(index + 1, 0);
};

/**
 * Quill 富文本编辑器公共组件
 *
 * 基础用法：
 *   <QuillEditor value={html} onChange={setHtml} />
 *
 * 自定义扩展模块：
 *   <QuillEditor modules={{ clipboard: { ... } }} />
 *
 * 通过 ref 获取编辑器实例：
 *   const ref = useRef<QuillEditorRef>(null);
 *   ref.current?.getQuill()    // 获取 Quill 实例
 *   ref.current?.getHTML()     // 获取 HTML 内容
 *   ref.current?.insertEmbed() // 插入自定义内容
 */

export interface QuillEditorProps {
  /** 编辑器内容（HTML），受控模式 */
  value?: string;
  /** 内容变化回调 */
  onChange?: (value: string) => void;
  /** 是否只读 */
  readOnly?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 编辑器最小高度 */
  height?: string | number;
  /**
   * 自定义 Quill 模块配置，用于扩展编辑器功能
   * 会与默认配置合并，同名模块会覆盖默认配置
   * 例如：{ clipboard: { ... }, keyboard: { ... } }
   */
  modules?: Record<string, any>;
  /** 失焦回调 */
  onBlur?: () => void;
  /**
   * 图片上传模式：
   * - default: /web/photoQuestion/uploadFile
   * - photo: 上传搜题编辑习题 /web/photoQuestion/uploadFileForPhoto
   */
  imageUploadMode?: PhotoQuestionImageUploadMode;
}

/** 暴露给父组件的方法 */
export interface QuillEditorRef {
  /** 获取 Quill 实例，可用于调用原生 API */
  getQuill: () => Quill | null;
  /** 获取编辑器 HTML 内容 */
  getHTML: () => string;
  /** 获取编辑器纯文本内容 */
  getText: () => string;
  /** 在指定位置插入嵌入内容（图片、视频等） */
  insertEmbed: (index: number, type: string, value: any) => void;
}

/** 默认工具栏配置 */
const DEFAULT_TOOLBAR = [
  ['bold', 'italic', 'underline', { list: 'ordered' }, { list: 'bullet' }, 'image', { script: 'sub' }, { script: 'super' }, 'clean'],
];

const QuillEditor = forwardRef<QuillEditorRef, QuillEditorProps>((props, ref) => {
  const {
    value,
    onChange,
    readOnly = false,
    placeholder = '请输入内容...',
    height = '200px',
    modules: customModules,
    onBlur,
    imageUploadMode = 'default',
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isInternalChange = useRef(false);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const resizeHandleRef = useRef<HTMLSpanElement | null>(null);
  const isImageResizingRef = useRef(false);
  const imageResizeStartRef = useRef({
    clientX: 0,
    width: 0,
  });
  // 保持 onBlur 引用最新，避免闭包过期
  const onBlurRef = useRef(onBlur);
  onBlurRef.current = onBlur;
  // 保持 onChange 引用最新
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const readOnlyRef = useRef(readOnly);
  readOnlyRef.current = readOnly;
  const imageUploadModeRef = useRef(imageUploadMode);
  imageUploadModeRef.current = imageUploadMode;

  const updateImageResizeHandlePosition = useCallback(() => {
    const quill = quillRef.current;
    const img = selectedImageRef.current;
    const handle = resizeHandleRef.current;
    if (!quill || !img || !handle || !img.isConnected) {
      if (handle) handle.style.display = 'none';
      return;
    }

    const containerRect = quill.container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    handle.style.left = `${imgRect.right - containerRect.left - 6}px`;
    handle.style.top = `${imgRect.bottom - containerRect.top - 6}px`;
    handle.style.display = readOnlyRef.current ? 'none' : 'block';
  }, []);

  const clearSelectedImage = useCallback(() => {
    selectedImageRef.current?.classList.remove('ql-image-selected');
    selectedImageRef.current = null;
    if (resizeHandleRef.current) {
      resizeHandleRef.current.style.display = 'none';
    }
  }, []);

  const selectImage = useCallback((img: HTMLImageElement) => {
    if (readOnlyRef.current) return;
    if (selectedImageRef.current !== img) {
      selectedImageRef.current?.classList.remove('ql-image-selected');
      selectedImageRef.current = img;
      img.classList.add('ql-image-selected');
    }
    updateImageResizeHandlePosition();
  }, [updateImageResizeHandlePosition]);

  // ==================== 图片上传处理 ====================
  // 参考 src/components/ContentEditable/index.tsx 和 WangEditorForm 的上传接口
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !quillRef.current) return;

      try {
        const { displaySrc } = await uploadPhotoQuestionImage(
          file,
          imageUploadModeRef.current,
        );
        insertImageIntoQuill(quillRef.current, displaySrc);
      } catch (error: any) {
        console.error('图片上传失败:', error);
        message.error(error?.message || '图片上传失败');
      }
    };
  }, []);

  // ==================== 初始化 Quill（仅挂载时执行一次） ====================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // quillRef.current 不为 null 说明已经初始化过，避免 Strict Mode 下重复创建
    if (quillRef.current) return;

    // 合并模块配置：默认 toolbar + 用户自定义模块
    const mergedModules: Record<string, any> = {
      toolbar: {
        container: DEFAULT_TOOLBAR,
        handlers: {
          image: imageHandler,
        },
      },
      ...customModules,
    };

    const quill = new Quill(container, {
      theme: 'snow',
      placeholder,
      readOnly,
      modules: mergedModules,
    });

    quillRef.current = quill;

    // 设置初始内容
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    // 监听内容变化
    quill.on('text-change', () => {
      if (!isInternalChange.current) {
        // 编辑过程中保留展示 URL，保存并出题时再归一化相对路径
        onChangeRef.current?.(quill.getSemanticHTML());
      }
      updateImageResizeHandlePosition();
    });

    // 监听失焦
    const handleBlur = () => onBlurRef.current?.();
    quill.root.addEventListener('blur', handleBlur);

    // 粘贴图片：走 uploadFile，避免插入 base64
    const handlePaste = (event: ClipboardEvent) => {
      if (readOnlyRef.current) return;

      const clipboardItems = event.clipboardData?.items;
      if (!clipboardItems?.length) return;

      const imageItem = Array.from(clipboardItems).find((item) =>
        item.type.startsWith('image/'),
      );
      if (!imageItem) return;

      const file = imageItem.getAsFile();
      if (!file) return;

      event.preventDefault();
      event.stopPropagation();

      void (async () => {
        try {
          const { displaySrc } = await uploadPhotoQuestionImage(
            file,
            imageUploadModeRef.current,
          );
          if (!quillRef.current) return;
          insertImageIntoQuill(quillRef.current, displaySrc);
        } catch (error: any) {
          console.error('图片上传失败:', error);
          message.error(error?.message || '图片上传失败');
        }
      })();
    };
    quill.root.addEventListener('paste', handlePaste, true);

    // 图片尺寸拖拽点（无依赖实现）
    const resizeHandle = document.createElement('span');
    resizeHandle.className = 'ql-image-resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.width = '10px';
    resizeHandle.style.height = '10px';
    resizeHandle.style.borderRadius = '50%';
    resizeHandle.style.background = '#6D28D9';
    resizeHandle.style.border = '1px solid #fff';
    resizeHandle.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.25)';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.zIndex = '10';
    resizeHandle.style.display = 'none';
    quill.container.appendChild(resizeHandle);
    resizeHandleRef.current = resizeHandle;

    const handleEditorPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const targetImage = target.closest('img');
      if (targetImage && quill.root.contains(targetImage)) {
        selectImage(targetImage as HTMLImageElement);
        return;
      }
      if (target !== resizeHandle) {
        clearSelectedImage();
      }
    };

    const handleResizeMouseDown = (event: MouseEvent) => {
      if (readOnlyRef.current || !selectedImageRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      isImageResizingRef.current = true;
      imageResizeStartRef.current = {
        clientX: event.clientX,
        width: selectedImageRef.current.getBoundingClientRect().width,
      };
      document.body.style.userSelect = 'none';
    };

    const handleDocumentMouseMove = (event: MouseEvent) => {
      if (!isImageResizingRef.current || !selectedImageRef.current) return;
      const deltaX = event.clientX - imageResizeStartRef.current.clientX;
      const nextWidth = Math.max(40, Math.round(imageResizeStartRef.current.width + deltaX));
      selectedImageRef.current.setAttribute('width', `${nextWidth}`);
      selectedImageRef.current.style.width = `${nextWidth}px`;
      selectedImageRef.current.style.height = 'auto';
      selectedImageRef.current.removeAttribute('height');
      updateImageResizeHandlePosition();
    };

    const stopImageResizing = () => {
      if (!isImageResizingRef.current) return;
      isImageResizingRef.current = false;
      document.body.style.userSelect = '';

      const quillInstance = quillRef.current;
      const selectedImage = selectedImageRef.current;
      if (quillInstance && selectedImage) {
        const finalWidth = Math.max(
          40,
          Math.round(selectedImage.getBoundingClientRect().width),
        );
        selectedImage.setAttribute('width', `${finalWidth}`);
        selectedImage.style.width = `${finalWidth}px`;
        selectedImage.style.height = 'auto';
        selectedImage.removeAttribute('height');
        // 同步 Quill 内部内容，确保预览/保存拿到最新图片尺寸
        quillInstance.update('user');
        onChangeRef.current?.(quillInstance.getSemanticHTML());
      }
    };

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node;
      if (!quill.root.contains(targetNode) && !resizeHandle.contains(targetNode)) {
        clearSelectedImage();
      }
    };

    quill.root.addEventListener('pointerdown', handleEditorPointerDown);
    quill.root.addEventListener('scroll', updateImageResizeHandlePosition);
    resizeHandle.addEventListener('mousedown', handleResizeMouseDown);
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', stopImageResizing);
    globalThis.addEventListener('pointerdown', handleOutsidePointerDown);
    globalThis.addEventListener('resize', updateImageResizeHandlePosition);

    return () => {
      stopImageResizing();
      clearSelectedImage();
      // 移除 blur 监听
      quill.root.removeEventListener('blur', handleBlur);
      quill.root.removeEventListener('paste', handlePaste, true);
      quill.root.removeEventListener('pointerdown', handleEditorPointerDown);
      quill.root.removeEventListener('scroll', updateImageResizeHandlePosition);
      resizeHandle.removeEventListener('mousedown', handleResizeMouseDown);
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', stopImageResizing);
      globalThis.removeEventListener('pointerdown', handleOutsidePointerDown);
      globalThis.removeEventListener('resize', updateImageResizeHandlePosition);
      resizeHandle.remove();
      resizeHandleRef.current = null;
      // 销毁 Quill 创建的工具栏 DOM（Snow 主题会在 container 前面插入）
      const toolbar = container.previousElementSibling;
      if (toolbar?.classList.contains('ql-toolbar')) {
        toolbar.remove();
      }
      // 清空编辑器 DOM，确保下次挂载时容器是干净的
      container.innerHTML = '';
      quillRef.current = null;
    };
    // 仅在组件挂载/卸载时执行，props 变化通过下面的 effect 同步
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== 同步外部 value 变化 ====================
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || value === undefined) return;

    const currentHtml = quill.getSemanticHTML();
    // 只有当外部 value 与编辑器内容真正不同时才更新，避免循环
    if (value !== currentHtml) {
      isInternalChange.current = true;
      quill.clipboard.dangerouslyPasteHTML(value || '');
      // 清空撤销历史，防止切换题目后 Ctrl+Z 还原到上一个题目的内容
      quill.history?.clear();
      isInternalChange.current = false;
    }
  }, [value]);

  // ==================== 同步 readOnly 状态 ====================
  useEffect(() => {
    quillRef.current?.enable(!readOnly);
    if (readOnly) {
      clearSelectedImage();
    } else {
      updateImageResizeHandlePosition();
    }
  }, [readOnly, clearSelectedImage, updateImageResizeHandlePosition]);

  // ==================== 暴露方法给父组件 ====================
  useImperativeHandle(ref, () => ({
    getQuill: () => quillRef.current,
    getHTML: () => quillRef.current?.getSemanticHTML() || '',
    getText: () => quillRef.current?.getText() || '',
    insertEmbed: (index: number, type: string, value: any) => {
      quillRef.current?.insertEmbed(index, type, value);
    },
  }));

  return (
    <div className={`quill-editor-wrapper${readOnly ? ' quill-editor-readonly' : ''}`}>
      <div
        ref={containerRef}
        style={{ minHeight: height }}
      />
    </div>
  );
});

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;
