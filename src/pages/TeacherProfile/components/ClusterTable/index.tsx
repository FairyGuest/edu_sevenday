import { Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";

const BAND_COLORS: Record<string, string> = {
  待巩固: "#e05d62", 练习中: "#e8a23d", 较熟练: "#c0a83e", 已掌握: "#4f9e70",
};
const BANDS = ["待巩固", "练习中", "较熟练", "已掌握"];
const LEVEL_META: Record<string, { color: string; short: string; label: string; verb: string; desc: string }> = {
  L1: { color: "#52607a", short: "L1", label: "了解", verb: "了解 / 知道 / 识别", desc: "能再认再现，识别基本概念与符号" },
  L2: { color: "#2563eb", short: "L2", label: "理解", verb: "理解 / 描述 / 说明", desc: "能解释含义、举例说明，明白为什么" },
  L3: { color: "#7c3aed", short: "L3", label: "掌握", verb: "掌握 / 运用 / 计算", desc: "能在熟悉情境中独立使用与计算" },
  L4: { color: "#db2777", short: "L4", label: "综合", verb: "综合 / 迁移 / 建模", desc: "能在新情境中组合应用、建模探究" },
};
const TRUST_META: Record<string, { label: string; cls: string; color: string }> = {
  credible: { label: "可信", cls: "ok", color: "var(--g-ok)" },
  coarse: { label: "粗估", cls: "warn", color: "var(--g-warn)" },
  insufficient: { label: "证据不足", cls: "", color: "var(--g-faint)" },
};

/** 四级人数堆叠条 */
function StackBar({ counts }: { counts: Record<string, number> }) {
  const total = BANDS.reduce((a, b) => a + (counts?.[b] || 0), 0) || 1;
  return (
    <div className="teacher_profile_stackbar">
      {BANDS.map((b) =>
        counts?.[b] ? (
          <i key={b} style={{ width: `${(counts[b] / total) * 100}%`, background: BAND_COLORS[b] }} title={`${b} ${counts[b]}人`} />
        ) : null,
      )}
    </div>
  );
}

/** Wilson 置信区间条（graph4rec ability-bar 范式）：range 带 + mark 竖线 */
function CIBar({ ci, p, trust }: { ci: [number, number]; p: number; trust: string }) {
  const c = TRUST_META[trust]?.color || "var(--g-accent)";
  return (
    <Tooltip title={`掌握度 ${p}% · 95% 区间 [${ci[0]}, ${ci[1]}] · ${TRUST_META[trust]?.label}`}>
      <span className="ci_bar" style={{ ["--c" as any]: c }}>
        <span className="ci_bar_range" style={{ left: `${ci[0]}%`, width: `${Math.max(2, ci[1] - ci[0])}%` }} />
        <span className="ci_bar_mark" style={{ left: `${p}%` }} />
      </span>
    </Tooltip>
  );
}

/** F1.2 知识点掌握分布（graph4rec ability-row 范式重做） */
export default function ClusterTable({ rows }: { rows: any[] }) {
  const columns: ColumnsType<any> = [
    {
      title: "知识点", dataIndex: "cluster", width: 150,
      render: (t: string, r: any) => {
        const lv = LEVEL_META[r.level];
        return (
          <div className="ct_kp">
            <div className="ct_kp_name" title={`${t}${r.level ? "（" + r.level + "）" : ""}`}>
              {t}
              {lv ? (
                <Tooltip title={`能力等级 ${r.level}：${lv.verb}
${lv.desc}`} color="#fff" overlayClassName="ct_lv_tip">
                  <span className="ct_lv" style={{ ["--c" as any]: lv.color }}>{lv.short}</span>
                </Tooltip>
              ) : null}
            </div>
            {r.chapter ? <div className="teacher_profile_subtext">{r.chapter}</div> : null}
          </div>
        );
      },
    },
    {
      title: "分布", dataIndex: "band_counts", width: 82,
      render: (counts: Record<string, number>) => <StackBar counts={counts} />,
    },
    {
      title: "掌握度 · 95% 区间", key: "ci", width: 150,
      render: (_: any, r: any) =>
        r.ci ? (
          <span className="ct_ci_cell">
            <CIBar ci={r.ci} p={r.p} trust={r.trust} />
            <b className="ct_ci_p" style={{ color: r.trust === "insufficient" ? "var(--g-faint)" : "var(--g-text)" }}>
              {r.trust === "insufficient" ? "—" : `${r.p}%`}
            </b>
          </span>
        ) : <span style={{ color: "#c3c9d4" }}>—</span>,
    },
    {
      title: "待巩固", dataIndex: "weak_n", width: 80,
      render: (t: number, r: any) => (
        <span>
          <b style={{ color: t > 0 ? "#e05d62" : "#4f9e70" }}>{t}人</b>
          <span style={{ color: "#8a94a8", fontSize: 11, marginLeft: 3 }}>({r.weak_pct}%)</span>
        </span>
      ),
    },
    {
      title: "趋势", dataIndex: "trend", width: 64,
      render: (t: string) => {
        const cls = t === "向好↑" ? "g-chip--ok" : t === "连续下降" ? "g-chip--bad" : "";
        return <span className={`g-chip ${cls}`}>{t}</span>;
      },
    },
    {
      title: "高频错因", dataIndex: "misconception", width: 132, ellipsis: true,
      render: (m: any) =>
        m ? (
          <Tooltip title={`${m.share}% 集中在「${m.label}」${m.evidence ? "：" + m.evidence : ""}`}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, maxWidth: "100%" }}>
              <i className="g-dot" style={{ background: "var(--dim-cognitive)", flex: "none" }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {m.label} {m.share}%
              </span>
            </span>
          </Tooltip>
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
      scroll={{ x: 560, y: 700 }}
    />
  );
}
