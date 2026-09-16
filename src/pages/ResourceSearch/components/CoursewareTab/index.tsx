import { useEffect, useState } from "react";
import { useLocation, history } from "@umijs/max";
import { Button, Card, Table, Tag, message } from "antd";
import { DesktopOutlined, FileAddOutlined } from "@ant-design/icons";

/** F6 合并版 + v2.0-J：课件大纲 tab；「生成PPT」按钮已打通课件生成页（/teaching-materials） */
export default function CoursewareTab() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation() as any;

  useEffect(() => {
    setLoading(true);
    fetch("/api/teacher/resource/plans")
      .then(r => r.json())
      .then(d => { if (d.code === 200) setPlans(d.data || []); })
      .finally(() => setLoading(false));
  }, []);

  /** 跳转课件生成页：优先复用 URL 上的 courseId，mock 下回落演示课程 */
  const openGenerator = (chapter?: string) => {
    const q = new URLSearchParams(location?.search || window.location.search);
    const courseId = q.get("courseId") || "course-mock-001";
    if (chapter) message.info(`已打开课件生成（${chapter}），可在右侧大纲基础上生成 PPT`);
    history.push(`/teaching-materials?courseId=${encodeURIComponent(courseId)}`);
  };

  const cols = [
    { title: "章节", dataIndex: "chapter", ellipsis: true },
    { title: "版本", dataIndex: "version", width: 60 },
    { title: "大纲", dataIndex: "courseware",
      render: (cw: string[]) => cw?.length ? (
        <ul style={{ margin: 0, paddingLeft: 14, fontSize: 12, color: "#5f6b81" }}>
          {cw.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      ) : "—" },
    { title: "", width: 150, render: (_: any, r: any) => (
      <Button size="small" type="primary" ghost icon={<FileAddOutlined />}
        onClick={() => openGenerator(r.chapter)}>
        生成PPT
      </Button>
    )},
  ];

  return (
    <Card loading={loading} title={<><DesktopOutlined /> 课件大纲 · 可一键生成 PPT</>}
      extra={<Button size="small" icon={<FileAddOutlined />} onClick={() => openGenerator()}>新建课件生成</Button>}
      style={{ margin: "16px 20px" }}>
      <Table columns={cols} dataSource={plans} rowKey="plan_id"
        pagination={false} size="small" tableLayout="fixed" />
    </Card>
  );
}
