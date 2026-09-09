import { useEffect, useState } from "react";
import { Tabs } from "antd";
import List from "./List";
import PersonalizedSection from "./components/PersonalizedSection";

/**
 * 作业布置（F4+F3 合并版）：
 * - 统一布置（存量 List 组件）
 * - 个性化布置（F3 PersonalizedSection：四方针引擎/逐生组卷/发布锁定/KP报告）
 */
const SettingTopic = () => {
  const [tab, setTab] = useState("normal");
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/teacher/classes")
      .then(r => r.json())
      .then(d => { if (d.code === 200) setClasses(d.data || []); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ padding: "12px 16px" }}>
      <Tabs activeKey={tab} onChange={setTab} items={[
        { key: "normal", label: "📝 统一布置", children: <List /> },
        { key: "personalized", label: "🎯 个性化布置（每人一单）", children: <PersonalizedSection classes={classes} /> },
      ]} />
    </div>
  );
};

export default SettingTopic;
