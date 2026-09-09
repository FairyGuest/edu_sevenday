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
  scale = 0.8,
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
      /*打印根容器（需在使用页面保持此类名）*/
      .question_intel {
        width: 100%;
        max-width: 850px; /* 适配A4打印区域 */
        margin: 0 auto; /* 水平居中 */
        padding: 10px 0;
        page-break-after: auto !important;
      }
      /* 题目列表容器：清除滚动，展开内容 */
      .question-list-container {
        overflow: visible !important;
        height: auto !important;
      }
      /* 试卷标题样式 */
      .question_intel_name {
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        margin: 25px 0 30px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ccc;
      }
      /*题目列表样式 */
      .question-list {
        line-height: 1.5; /* 优化可读性 */
      }
      .questiona_type_css {
        text-indent: -10px; /* 避免序号错位 */
      }
      /* 单个题目样式（禁止内部分页） */
      .question_row_box {
        margin-bottom: 20px;
        // page-break-inside: avoid !important; /* 核心：避免题目被截断 */
        padding: 5px 0;
      }
      /* 选择题选项对齐 */
      .question-options {
        margin:0px !important;
        padding-left: 20px !important;
        text-indent: 10px; /* 避免序号错位 */
      }
      /* 隐藏不需要打印的元素 */
      .source-box,
      .design_right_card_container_box_title_content button,
      .design_outline_header_container_btn,
      .question-list-switch,
      .spin_box,
      .question_hint,
      .question_drag_icon,
      .question_row_icon,
      .question_drag_box_title_box,
      .question_affix_box,
      .header_box {
        display: none !important;
      }
      .unshow-answer {
        display: none;
      }
      .answer-list {
        margin-top: 40px;
        .qml-answer, p, img {
          display: inline !important;
        }
      }
      .answer-list-title {
        font-size: 16px;
        font-weight: 600;
        line-height: 30px;
        color: #1e253b;
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
        setTimeout(resolve, 100);
      }); // 等待100ms，确保页面渲染完成
    },
    onAfterPrint: () => {
      onAfterPrint?.(); // 打印后回调（可选）
    },
    pageStyle: getPageStyle(), // 合并后的打印样式
  });

  return handlePrint;
};
