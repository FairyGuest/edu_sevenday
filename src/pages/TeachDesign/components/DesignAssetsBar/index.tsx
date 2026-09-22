import { useState } from "react";
import { Button, Drawer, Tooltip, message } from "antd";
import {
  AimOutlined,
  AppstoreOutlined,
  CheckCircleFilled,
  ThunderboltFilled,
  DeleteOutlined,
} from "@ant-design/icons";
import ObjectivePanel, { type ObjectiveItem } from "../ObjectivePanel";
import ResourceDrawerBody, { type ResourceItem } from "../ResourceDrawer";
import "./index.less";

/**
 * 备课侧栏：
 * 「教学目标」「教学资源」两个抽屉的紧凑入口 + 已选摘要 + 「注入教学设计」按钮。
 * 注入 = 将已选目标与资源追加到个性化诉求（user_require），随生成请求带入；
 * 抽屉内勾选只暂存，点注入才写入，避免双通道重复。
 */
const DesignAssetsBar = ({
  stage,
  onInject,
}: {
  stage?: string[];
  /** 注入回调：父组件把文本追加到个性化诉求输入框 */
  onInject: (
    text: string,
    summary: { objectives: number; resources: number },
  ) => void;
}) => {
  const [open, setOpen] = useState<"" | "objectives" | "resources">("");
  const [objectives, setObjectives] = useState<ObjectiveItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [injected, setInjected] = useState<{
    objectives: number;
    resources: number;
    key: string;
  } | null>(null);

  const total = objectives.length + resources.length;
  const selectionKey = JSON.stringify([objectives, resources]);
  const changed = !!injected && injected.key !== selectionKey;

  const inject = () => {
    if (!total) {
      message.warning("请先在抽屉中勾选教学目标或教学资源");
      return;
    }
    const parts: string[] = [];
    if (objectives.length) {
      parts.push(
        [
          "【已注入 · 教学目标（教师已确认）】",
          ...objectives.map(
            (o, i) =>
              `${i + 1}. ${o.text}${o.level && o.level !== "—" ? `（${o.level}）` : ""}`,
          ),
          "请以以上目标为主线设计教学与评价，目标与活动、作业保持一致。",
        ].join("\n"),
      );
    }
    if (resources.length) {
      parts.push(
        [
          "【已注入 · 教学资源】",
          ...resources.map(
            (r, i) => `${i + 1}. ${r.title}（${r.meta}；${r.basis}）`,
          ),
          "请将以上资源用于对应环节：练习配到作业/巩固环节，课件页配到讲解环节，量规配到课堂评价。",
        ].join("\n"),
      );
    }
    onInject(parts.join("\n\n"), {
      objectives: objectives.length,
      resources: resources.length,
    });
    setInjected({
      objectives: objectives.length,
      resources: resources.length,
      key: selectionKey,
    });
    setOpen("");
    message.success(
      `已注入教学设计：目标 ${objectives.length} 条 · 资源 ${resources.length} 项`,
    );
  };

  return (
    <div className="dab_bar">
      <Button
        className={"dab_btn" + (objectives.length ? " dab_btn--has" : "")}
        icon={<AimOutlined />}
        onClick={() => setOpen("objectives")}
      >
        教学目标{" "}
        {objectives.length > 0 && (
          <span className="dab_n">{objectives.length}</span>
        )}
      </Button>
      <Button
        className={"dab_btn" + (resources.length ? " dab_btn--has" : "")}
        icon={<AppstoreOutlined />}
        onClick={() => setOpen("resources")}
      >
        教学资源{" "}
        {resources.length > 0 && (
          <span className="dab_n">{resources.length}</span>
        )}
      </Button>
      <span className="dab_divider" aria-hidden="true" />
      <Button
        type="primary"
        className="dab_inject"
        icon={<ThunderboltFilled />}
        disabled={!total}
        onClick={inject}
      >
        注入教学设计
      </Button>
      {injected && (
        <>
          <span className="dab_injected">
            <CheckCircleFilled />
            {changed ? "待重新注入" : "已注入"}
          </span>
          <Tooltip title="移除已注入的目标与资源">
            <Button
              type="text"
              aria-label="移除注入"
              icon={<DeleteOutlined />}
              onClick={() => {
                onInject("", { objectives: 0, resources: 0 });
                setInjected(null);
              }}
            />
          </Tooltip>
        </>
      )}
      <Drawer
        title={
          <span className="dab_drawer_title">
            <AimOutlined /> 教学目标（学情联动）
          </span>
        }
        placement="right"
        width={620}
        open={open === "objectives"}
        onClose={() => setOpen("")}
        destroyOnHidden={false}
        footer={
          <div className="dab_drawer_footer">
            <span>已选 {objectives.length} 条目标</span>
            <Button type="primary" disabled={!total} onClick={inject}>
              注入教学设计（目标 {objectives.length} · 资源 {resources.length}）
            </Button>
          </div>
        }
      >
        <ObjectivePanel
          embedded
          stage={stage}
          selected={objectives}
          onChange={setObjectives}
        />
      </Drawer>

      <Drawer
        title={
          <span className="dab_drawer_title">
            <AppstoreOutlined /> 教学资源（学情联动）
          </span>
        }
        placement="right"
        width={620}
        open={open === "resources"}
        onClose={() => setOpen("")}
        destroyOnHidden={false}
        footer={
          <div className="dab_drawer_footer">
            <span>已选 {resources.length} 项资源</span>
            <Button type="primary" disabled={!total} onClick={inject}>
              注入教学设计（目标 {objectives.length} · 资源 {resources.length}）
            </Button>
          </div>
        }
      >
        <ResourceDrawerBody selected={resources} onChange={setResources} />
      </Drawer>
    </div>
  );
};

export default DesignAssetsBar;
