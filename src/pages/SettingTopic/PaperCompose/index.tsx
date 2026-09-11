import { useEffect, useState } from "react";
import { Tabs } from "antd";
import List from "./List";
import PersonalizedSection from "../components/PersonalizedSection";

/**
 * 作业组卷（E1/E2）：先组卷，组完即下发。
 * - 统一组卷：存量试卷列表（List）
 * - 个性化组卷：四方针引擎逐生组卷（每人一单）→ 抽样确认 → 发布（对象锁定）
 */
const PaperCompose = () => {
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
        { key: "normal", label: "📝 统一组卷", children: <List /> },
        { key: "personalized", label: "🎯 个性化组卷（每人一单）", children: <PersonalizedSection classes={classes} /> },
      ]} />
    </div>
  );
};

export default PaperCompose;
