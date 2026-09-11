import { Table } from "antd";
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
        if (r.status_level === "cold") return <span className="g-chip">{t}</span>;
        if (r.status_level === "ok") return <span className="g-chip g-chip--ok">{t}</span>;
        return <span className="g-chip g-chip--bad">{t}</span>;
      },
    },
    {
      title: "待巩固知识点", dataIndex: "weak_cnt", width: 130,
      render: (t: number, r: any) => {
        if (r.status_level === "cold") return <span style={{ color: "#c3c9d4" }}>—</span>;
        const color = t > 3 ? "var(--g-bad)" : "var(--g-warn)";
        return (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 20, fontSize: 12, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{t}</span>
            <span className="g-minibar" style={{ width: 56 }}>
              <i style={{ width: `${Math.min(t * 12, 100)}%`, background: color }} />
            </span>
          </span>
        );
      },
    },
    {
      title: "本周进步", dataIndex: "week_delta", width: 90,
      render: (t: any) =>
        t == null ? <span style={{ color: "#c3c9d4" }}>—</span> : (
          <span className={`g-chip ${t >= 0 ? "g-chip--ok" : "g-chip--bad"}`}>
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
