import { useEffect, useState } from "react";
import { useLocation, history } from "@umijs/max";
import { Tabs } from "antd";
import PaperCompose from "@/pages/SettingTopic/PaperCompose";
import SettingTopic from "@/pages/SettingTopic";
import HomeworkFlow from "@/pages/HomeworkFlow";
import CheckTopic from "@/pages/CheckTopic";
import Diagnostics from "@/features/teachingSupport/Diagnostics";
import "./index.less";

/**
 * 作业工作台（四合一）：组卷 → 下发 → 回收 → 批改 同域子 Tab，
 * 组织方式对齐学情分析（一个一级入口 + 子功能 Tab）。
 * URL：/homework?sub=compose|assign|flow|grade，其余参数（tab/dispatch_id/sid/class_id）透传给子页。
 */
const SUB_KEYS = ["compose", "assign", "flow", "grade", "diagnostics"] as const;

const Homework = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const sub = params.get("sub") || "compose";
  const [active, setActive] = useState<string>(
    SUB_KEYS.includes(sub as any) ? sub : "compose",
  );

  // 外部跳转（助手/发布引导）带 sub 参数时切换到对应子 Tab
  useEffect(() => {
    if (SUB_KEYS.includes(sub as any) && sub !== active) setActive(sub);
  }, [sub]);

  const onTabChange = (key: string) => {
    setActive(key);
    const next = new URLSearchParams(search);
    next.set("sub", key);
    if (key !== "diagnostics") ["case_id", "diagnostic_status", "homework_id", "student_id"].forEach(k => next.delete(k));
    // 子 Tab 间切换时清掉只属于其他子页的定位参数
    ["dispatch_id", "sid"].forEach((k) => {
      if (key !== "flow" && key !== "grade") next.delete(k);
    });
    history.replace(`/homework?${next.toString()}`);
  };

  return (
    <div className="hw_tabs_page">
      <Tabs
        activeKey={active}
        onChange={onTabChange}
        destroyOnHidden={false}
        items={[
          {
            key: "compose",
            label: "作业组卷",
            children: (
              <div className="hw_tab_body">
                <PaperCompose />
              </div>
            ),
          },
          {
            key: "assign",
            label: "作业下发",
            children: (
              <div className="hw_tab_body">
                <SettingTopic />
              </div>
            ),
          },
          {
            key: "flow",
            label: "下发与回收",
            children: (
              <div className="hw_tab_body hw_tab_body--full">
                <HomeworkFlow />
              </div>
            ),
          },
          {
            key: "grade",
            label: "作业批改",
            children: (
              <div className="hw_tab_body hw_tab_body--full">
                <CheckTopic />
              </div>
            ),
          },
          {
            key: "diagnostics",
            label: "错因分析",
            children: <div className="hw_tab_body">{active === "diagnostics" && <Diagnostics />}</div>,
          },
        ]}
      />
    </div>
  );
};

export default Homework;
