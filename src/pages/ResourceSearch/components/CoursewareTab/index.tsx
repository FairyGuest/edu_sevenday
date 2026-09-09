import { useEffect, useState } from "react";
import { Button, Card, Table, Tag } from "antd";
import { DesktopOutlined } from "@ant-design/icons";

/** F6 合并版：课件大纲 tab（嵌入 ResourceSearch 的 tab 体系） */
export default function CoursewareTab() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/teacher/resource/plans")
      .then(r => r.json())
      .then(d => { if (d.code === 200) setPlans(d.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const cols = [
    { title: "章节", dataIndex: "chapter", ellipsis: true },
    { title: "版本", dataIndex: "version", width: 60 },
    { title: "大纲", dataIndex: "courseware",
      render: (cw: string[]) => cw?.length ? (
        <ul style={{ margin: 0, paddingLeft: 14, fontSize: 12, color: "#5f6b81" }}>
          {cw.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      ) : "—" },
    { title: "", width: 120, render: () => (
      <Button size="small" disabled style={{ opacity: 0.5 }}>生成PPT（待开发）</Button>
    )},
  ];

  return (
    <Card loading={loading} title={<><DesktopOutlined /> 课件大纲 · PPT 生成待开发</>}
      style={{ margin: "16px 20px" }}>
      <Table columns={cols} dataSource={plans} rowKey="plan_id"
        pagination={false} size="small" tableLayout="fixed" />
    </Card>
  );
}
