import { useCallback, useEffect, useRef } from 'react';
import FormulaEditor from '@/components/QuillEditor/FormulaEditor';

const AUTO_SAVE_DEBOUNCE_MS = 600;

interface TopicEditorProps {
  sourceFrom?: string;
  height: string;
  placeholder: string;
  readOnly?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  editorKey?: string;
}

const TopicEditor = ({
  height,
  placeholder,
  readOnly,
  value,
  onChange,
  onBlur,
}: TopicEditorProps) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /** 修改时触发：防抖后自动保存 */
  const handleChange = useCallback(
    (val: string) => {
      onChange?.(val);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onBlur?.();
      }, AUTO_SAVE_DEBOUNCE_MS);
    },
    [onChange, onBlur],
  );

  /** 失焦时触发：立即保存（清除防抖避免重复） */
  const handleBlur = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onBlur?.();
  }, [onBlur]);

  return (
    <FormulaEditor
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      height={height}
      readOnly={readOnly}
      onBlur={handleBlur}
      imageUploadMode="photo"
    />
  );
};

export default TopicEditor;
