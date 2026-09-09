import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

const BAND_COLORS: Record<string, string> = {
  待巩固: "#e05d62", 练习中: "#e8a23d", 较熟练: "#c0a83e", 已掌握: "#4f9e70",
};
const BANDS = ["待巩固", "练习中", "较熟练", "已掌握"];

/** 四级人数堆叠条（待巩固<50 / 练习中50-70 / 较熟练70-85 / 已掌握≥85） */
function StackBar({ counts }: { counts: Record<string, number> }) {
  const total = BANDS.reduce((a, b) => a + (counts?.[b] || 0), 0) || 1;
  return (
    <div className="teacher_profile_stackbar">
      {BANDS.map((b) =>
        counts?.[b] ? (
          <i
            key={b}
            style={{ width: `${(counts[b] / total) * 100}%`, background: BAND_COLORS[b] }}
            title={`${b} ${counts[b]}人`}
          />
        ) : null,
      )}
    </div>
  );
}

/** F1.2 知识点掌握分布表（图例移至右列图表下方，此处不再展示） */
export default function ClusterTable({ rows }: { rows: any[] }) {
  const columns: ColumnsType<any> = [
    {
      title: "知识点",
      dataIndex: "cluster",
      width: 180,
      render: (t: string, r: any) => (
        <div>
          <div>{t}</div>
          {r.chapter ? <div className="teacher_profile_subtext">{r.chapter}</div> : null}
        </div>
      ),
    },
    {
      title: "分布",
      dataIndex: "band_counts",
      width: 150,
      render: (counts: Record<string, number>) => <StackBar counts={counts} />,
    },
    {
      title: "待巩固",
      dataIndex: "weak_n",
      width: 110,
      render: (t: number, r: any) => `${t}人 (${r.weak_pct}%)`,
    },
    {
      title: "趋势",
      dataIndex: "trend",
      width: 90,
      render: (t: string) => (
        <span
          style={{
            color: t === "向好↑" ? "#4f9e70" : t === "连续下降" ? "#e05d62" : "#8a94a8",
          }}
        >
          {t}
        </span>
      ),
    },
    {
      title: "高频错因",
      dataIndex: "misconception",
      render: (m: any) =>
        m ? `${m.share}%集中在「${m.label}」` : "—",
    },
  ];
  return (
    <Table
      rowKey="cluster"
      size="small"
      columns={columns}
      dataSource={rows.filter((r) => r.n_students >= 3).slice(0, 10)}
      pagination={false}
    />
  );
}
