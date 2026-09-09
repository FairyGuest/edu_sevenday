import { useCallback } from "react";
import { useReactToPrint } from "react-to-print";

export interface ExercisePrintConfig {
  /** 打印内容的DOM引用（必填） */
  contentRef: React.RefObject<HTMLDivElement>;
  /** 打印文档标题（默认：习题批改） */
  documentTitle?: string;
  /** 打印前回调（默认：空Promise） */
  onBeforePrint?: () => Promise<void>;
  /** 打印后回调（默认：无） */
  onAfterPrint?: () => void;
  /** 打印缩放比例（默认：0.85，对应85%） */
  scale?: number;
  /** 页面边距配置（默认：上下1.5cm，左右2cm） */
  margins?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  /** 自定义打印样式（覆盖默认样式） */
  customPageStyle?: string;
}
export const useExercisePrint = ({
  contentRef,
  documentTitle = "Ai出题批改系统",
  onBeforePrint = () => Promise.resolve(),
  onAfterPrint,
  scale = 1.0,
  margins = {
    top: "60px",
    bottom: "60px",
    left: "17px",
    right: "10px",
  },
  customPageStyle = "",
}: ExercisePrintConfig) => {
  // 合并默认样式与自定义样式
  const getPageStyle = useCallback(() => {
    // 默认打印样式（保留原完整配置）
    const defaultStyle = `
      /*打印页面核心设置：边距、纸张适配 */
      @page {
        margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left} !important;
        size: A4;             /* 适配A4纸大小 */
        @bottom-center {
          content: "第 " counter(page) " 页，共 " counter(pages) " 页";
          font-size: 12px;
          margin-top: -50px; /* 页脚距离底部 */
          color: #666; /* 页脚字体颜色 */
          font-family: "Microsoft YaHei", sans-serif; /* 字体适配中文 */
        }
      }

      /*全局样式：清除默认样式，适配中文打印 */
      body {
        font-family: "Microsoft YaHei", "宋体", sans-serif; /* 中文兼容字体 */
        font-size: 14px; /* 正文字体大小 */
        color: #333; /* 字体颜色 */
        background: white !important; /* 强制白色背景 */
        zoom: ${scale}; /* 辅助缩放（兼容部分浏览器） */
        margin: 0;
        padding: 0;
        audio {
          display: none !important;
        }
      }
      /* 图片自适应 */
      img {
        max-width: 100% !important;
        height: auto !important;
        margin: 10px 0;
      }
    `;
    // 优先使用自定义样式，无则用默认样式
    return defaultStyle + customPageStyle;
  }, [scale, margins, customPageStyle]);

  // 生成打印函数
  const handlePrint = useReactToPrint({
    contentRef, // 打印内容的DOM引用（由使用页面传入）
    documentTitle, // 打印文档标题
    onBeforePrint: async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      }); // 等待100ms，确保页面渲染完成
    },
    onAfterPrint: () => {
      onAfterPrint?.(); // 打印后回调（可选）
    },
    pageStyle: getPageStyle(), // 合并后的打印样式
  });

  return handlePrint;
};
