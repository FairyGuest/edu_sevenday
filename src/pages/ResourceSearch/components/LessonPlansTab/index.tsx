import { useEffect, useState } from "react";
import { Card, Table, Tag, Button } from "antd";
import { BookOutlined, DesktopOutlined } from "@ant-design/icons";

/** F6 合并版：教案列表 tab（嵌入 ResourceSearch 的 tab 体系） */
export default function LessonPlansTab() {
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
    { title: "教案", dataIndex: "chapter", ellipsis: true },
    { title: "版本", dataIndex: "version", width: 70, render: (t: string) => <Tag>{t}</Tag> },
    { title: "创建时间", dataIndex: "created_at", width: 150 },
    { title: "学案下发", dataIndex: "n_issues", width: 80,
      render: (t: number) => t > 0 ? <Tag color="green">{t}次</Tag> : <span style={{ color: "#ccc" }}>—</span> },
    { title: "对应作业", dataIndex: "homework_ids", width: 100,
      render: (ids: string[]) => ids?.length ? ids.map((h, i) => <Tag key={i} color="blue">{h}</Tag>) : "—" },
  ];

  return (
    <Card loading={loading} title={<><BookOutlined /> 历史生成的全部教案</>}
      style={{ margin: "16px 20px" }}>
      <Table columns={cols} dataSource={plans} rowKey="plan_id"
        pagination={false} size="small" tableLayout="fixed" />
    </Card>
  );
}
