import { useEffect, useState } from "react";
import { Button, Dropdown, Tooltip } from "antd";
import AssignHomeworkDialog from "./AssignHomeworkDialog";
import MarkdownRenderToc from "@/components/MarkdownRender/showToc";
import { ZYIcon } from "@/components";
import { ThunderboltOutlined } from "@ant-design/icons";

import "./index.less";

/** 评估分数字典：A 绿 / B 蓝 / C 橙 / 其他红 */
function scoreTag(value: string | number) {
  const score = String(value);
  let bg = "#FEF3F2";
  let color = "#EF4444";
  if (score.includes("A")) { bg = "#E1FAEB"; color = "#1A805E"; }
  else if (score.includes("B")) { bg = "#EAF1FC"; color = "#2B75D9"; }
  else if (score.includes("C")) { bg = "#FFF3E3"; color = "#FFAD37"; }
  return (
    <span className="plan_viewer_score" style={{ background: bg, color }}>
      {score}
    </span>
  );
}

/**
 * v2.0 查看教案（课件预览）浮层：对应设计稿「教案查看页」。
 * 入口：课时设计页「生成课件」按钮；查看态提供布置作业 / 评估结果 / 下载 / 全屏 / 关闭，
 * 左侧为文档目录（可折叠），右侧为教案正文（含课件大纲）。
 */
const PlanViewer = (props: {
  open: boolean;
  onClose: () => void;
  docTitle: string; // 完整标题，如「课时教案：《16.1 二次根式》」/「单元教案：《第16章 二次根式》单元整体教学设计」
  version?: string;
  content: string; // 教案 markdown
  score?: string | number; // 后端既有字母等级，也有数值分数
  evaluating?: boolean; // 评估中
  evalDisabled?: boolean;
  onEvaluate?: () => void;
  onOpenReport?: () => void;
  onDownload?: (e: any) => void;
  onAssignHomework?: (classId: string) => void | Promise<unknown>;
  defaultClassId?: string;
  planId?: string;
  assignDisabled?: boolean;
}) => {
  const {
    open, onClose, docTitle, version, content, score,
    evaluating, evalDisabled, onEvaluate, onOpenReport, onDownload, onAssignHomework, assignDisabled, defaultClassId, planId,
  } = props;
  const [wide, setWide] = useState(false); // 全屏（宽版）布局
  const [assignOpen, setAssignOpen] = useState(false);
  useEffect(() => { setAssignOpen(false); }, [open, planId]);

  // Esc 关闭
  useEffect(() => {
    if (!open || assignOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, assignOpen]);

  if (!open) return null;

  return (
    <div className="plan_viewer_mask">
      <div className={`plan_viewer${wide ? " plan_viewer--wide" : ""}`}>
        <div className="plan_viewer_toolbar">
          <div className="plan_viewer_toolbar-left">
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              disabled={assignDisabled || !onAssignHomework}
              onClick={() => setAssignOpen(true)}
            >
              布置作业
            </Button>
            {evaluating ? (
              <div className="plan_viewer_evaluating">
                <ZYIcon type="dengdai" style={{ fontSize: 16, animation: "spin 1s linear infinite" }} />
                评估中...
              </div>
            ) : score !== undefined && score !== null && score !== "" ? (
              <Button type="text" className="plan_viewer_report_btn" onClick={onOpenReport} icon={<ZYIcon type="tiku" />}>
                评估结果{scoreTag(score)}
              </Button>
            ) : (
              <Tooltip title="已完成教案优化，评估一下效果如何?">
                <Button type="primary" icon={<ZYIcon type="evaluate" />} disabled={evalDisabled} onClick={onEvaluate}>
                  评估教案
                </Button>
              </Tooltip>
            )}
          </div>
          <div className="plan_viewer_toolbar-right">
            <Dropdown
              disabled={evalDisabled}
              menu={{ items: [{ key: "docx", label: "下载为Word" }], onClick: onDownload }}
            >
              <Button type="text" icon={<ZYIcon type="download" />}>下载</Button>
            </Dropdown>
            <span className="plan_viewer_divider" />
            <Button
              type="text"
              className="plan_viewer_icon_btn"
              aria-label={wide ? "退出全屏预览" : "全屏预览"}
              icon={<ZYIcon type={wide ? "icon_fold" : "icon_unfold"} />}
              onClick={() => setWide((v) => !v)}
            />
            <Button
              type="text"
              className="plan_viewer_icon_btn"
              aria-label="关闭教案预览"
              icon={<ZYIcon type="close" />}
              onClick={onClose}
            />
          </div>
        </div>
        <div className="plan_viewer_doc">
          <div className="plan_viewer_doc_header">
            <ZYIcon className="icon" type="jiaoan" />
            <div className="title">{docTitle}</div>
            {version && <div className="version">{version}</div>}
          </div>
          <div className="plan_viewer_doc_body">
            <MarkdownRenderToc showToc>{content}</MarkdownRenderToc>
          </div>
        </div>
      </div>
      {assignOpen && onAssignHomework && <AssignHomeworkDialog
        defaultClassId={defaultClassId} docTitle={docTitle}
        onPublish={onAssignHomework} onClose={() => setAssignOpen(false)}
      />}
    </div>
  );
};

export default PlanViewer;
