import { Progress, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

/** F1.3 学生列表（全宽）：仅显示待巩固数不打等级；冷启动置底；点击行查看个人学情 */
export default function StudentList({ students, onOpen }: { students: any[]; onOpen: (sid: string) => void }) {
  const columns: ColumnsType<any> = [
    {
      title: "学生", dataIndex: "name", width: 100,
      render: (t: string) => <span style={{ fontWeight: 600 }}>{t}</span>,
    },
    {
      title: "账号", dataIndex: "display_id", width: 100,
      render: (t: string) => <span style={{ color: "#a0a8b8", fontSize: 12 }}>{t}</span>,
    },
    {
      title: "掌握状态", dataIndex: "status", width: 180,
      render: (t: string, r: any) => {
        if (r.status_level === "cold") return <Tag color="default">{t}</Tag>;
        if (r.status_level === "ok") return <Tag color="success">{t}</Tag>;
        return <Tag color="error">{t}</Tag>;
      },
    },
    {
      title: "待巩固知识点", dataIndex: "weak_cnt", width: 130,
      render: (t: number, r: any) => {
        if (r.status_level === "cold") return <span style={{ color: "#c3c9d4" }}>—</span>;
        return (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 24, fontSize: 12, fontWeight: 600, color: t > 3 ? "#e05d62" : "#e8a23d" }}>{t}</span>
            <Progress
              percent={Math.min(t * 12, 100)}
              showInfo={false}
              size="small"
              strokeColor={t > 3 ? "#e58a8e" : "#eec27e"}
              trailColor="#f0f2f6"
              style={{ width: 56, margin: 0 }}
            />
          </span>
        );
      },
    },
    {
      title: "本周进步", dataIndex: "week_delta", width: 90,
      render: (t: any) =>
        t == null ? <span style={{ color: "#c3c9d4" }}>—</span> : (
          <span style={{ color: t >= 0 ? "#4f9e70" : "#e05d62", fontWeight: 600 }}>
            {t >= 0 ? `↑${t}` : `↓${Math.abs(t)}`}
          </span>
        ),
    },
    { title: "", width: 70, render: () => <a style={{ fontSize: 12 }}>画像 ›</a> },
  ];
  return (
    <Table
      rowKey="student_id"
      size="small"
      columns={columns}
      dataSource={students}
      pagination={{
        pageSize: 15,
        showSizeChanger: false,
        showTotal: (t) => `共 ${t} 名学生`,
        size: "small",
      }}
      onRow={(r) => ({ onClick: () => onOpen(r.student_id), style: { cursor: "pointer" } })}
      rowClassName={(r) => (r.status_level === "cold" ? "teacher_profile_row_cold" : "")}
    />
  );
}
