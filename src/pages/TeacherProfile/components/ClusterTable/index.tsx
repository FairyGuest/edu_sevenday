import { Table, Tag, Tooltip } from "antd";
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
      title: "能力等级",
      dataIndex: "level",
      width: 92,
      render: (t: string) => {
        if (!t) return "—";
        const colors: Record<string, string> = { L1: "#52607a", L2: "#2563eb", L3: "#7c3aed", L4: "#db2777" };
        const labels: Record<string, string> = { L1: "L1 了解", L2: "L2 理解", L3: "L3 掌握", L4: "L4 综合" };
        return <span className="g-chip" style={{ background: `${colors[t]}1a`, color: colors[t] }}>{labels[t] || t}</span>;
      },
    },
    {
      title: "待巩固",
      dataIndex: "weak_n",
      width: 130,
      render: (t: number, r: any) => (
        <span>
          {t}人 ({r.weak_pct}%)
          {r.n_sample != null && r.n_sample < 3 ? (
            <Tooltip title={`仅 ${r.n_sample} 题样本，低于 3 题门槛，结论供参考`}>
              <span className="g-chip g-chip--warn" style={{ marginLeft: 5 }}>证据不足</span>
            </Tooltip>
          ) : null}
        </span>
      ),
    },
    {
      title: "趋势",
      dataIndex: "trend",
      width: 90,
      render: (t: string) => {
        const cls = t === "向好↑" ? "g-chip--ok" : t === "连续下降" ? "g-chip--bad" : "";
        return <span className={`g-chip ${cls}`}>{t}</span>;
      },
    },
    {
      title: "高频错因",
      dataIndex: "misconception",
      render: (m: any) =>
        m ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <i className="g-dot" style={{ background: "var(--dim-cognitive)" }} />
            {m.share}% 集中在「{m.label}」
          </span>
        ) : "—",
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
