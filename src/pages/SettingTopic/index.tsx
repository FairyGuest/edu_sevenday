import { useEffect, useState } from "react";
import { Tabs } from "antd";
import List from "./List";
import ReuseAssign from "./components/ReuseAssign";

/**
 * 作业下发（E1/E2 后的定位）：
 * - 统一布置：存量 List
 * - 跨班复用：其他班级生成的作业一键下发到本班（个性化按本班学情重算）
 * 注：个性化组卷入口已前移至「作业组卷」（先组卷 → 组完即下发）
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
        { key: "reuse", label: "🔁 跨班复用下发", children: <ReuseAssign classes={classes} /> },
      ]} />
    </div>
  );
};

export default SettingTopic;
