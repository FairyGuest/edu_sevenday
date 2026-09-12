import { Col, Row } from "antd";
import { FallOutlined, RiseOutlined, SafetyOutlined, SolutionOutlined } from "@ant-design/icons";

/**
 * 语义概览网格（graph4rec cockpit 范式）：
 * 左语义色竖条 + 大数字 + faint 标签 + sparkline 迷你趋势，2×2 紧凑网格替代平铺大卡。
 */

function Sparkline({ points, color, invert }: { points: number[]; color: string; invert?: boolean }) {
  if (!points?.length) return null;
  const w = 72, h = 26, pad = 2;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const step = (w - pad * 2) / Math.max(points.length - 1, 1);
  const y = (v: number) => h - pad - ((v - min) / span) * (h - pad * 2);
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"}${(pad + i * step).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${d} L${(pad + (points.length - 1) * step).toFixed(1)},${h - pad} L${pad},${h - pad} Z`;
  // 好坏方向：invert 时下降=好（如待巩固占比）
  const last = points[points.length - 1], first = points[0];
  const good = invert ? last <= first : last >= first;
  const c = good ? "#178a4c" : "#b42323";
  return (
    <svg width={w} height={h} className="ov_spark" aria-hidden>
      <path d={area} fill={color} opacity={0.12} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={pad + (points.length - 1) * step} cy={y(last)} r={2.2} fill={c} />
    </svg>
  );
}

export default function OverviewGrid({ cards, trend }: { cards: any; trend: any[] }) {
  if (!cards) return null;
  const trendVals = (trend || []).map((t: any) => t.value).filter((v: any) => v != null);

  const items = [
    {
      key: "weak", label: "待巩固占比", value: `${cards.weak_top_pct}%`,
      sub: cards.weak_top?.replace("待巩固占比", "") || "—",
      color: "var(--g-bad)", soft: "var(--g-bad-soft)", icon: <FallOutlined />,
      spark: trendVals.map((v: number) => Math.max(0, 100 - v)), invert: true,
    },
    {
      key: "support", label: "支援建议", value: cards.support_suggestions,
      sub: "优先补弱方向", color: "#b45309", soft: "#fdf4e3", icon: <SolutionOutlined />, spark: null,
    },
    {
      key: "mastered", label: "全员已掌握", value: cards.mastered_all_count,
      sub: "全班 ≥85% 的知识点", color: "var(--g-ok)", soft: "var(--g-ok-soft)", icon: <SafetyOutlined />, spark: null,
    },
    {
      key: "avg", label: "掌握度均值", value: cards.recent5_avg ?? "—",
      sub: "近 5 次评估", color: "var(--g-accent)", soft: "var(--g-accent-soft)", icon: <RiseOutlined />,
      spark: trendVals.slice(-5),
    },
  ];

  return (
    <Row gutter={12} className="ov_grid">
      {items.map(it => (
        <Col span={6} key={it.key}>
          <div className="ov_cell">
            <span className="ov_bar" style={{ background: it.color }} />
            <div className="ov_body">
              <div className="ov_top">
                <span className="ov_value" style={{ color: it.key === "weak" ? it.color : undefined }}>{it.value}</span>
                {it.spark ? <Sparkline points={it.spark} color={it.color} invert={(it as any).invert} /> : null}
              </div>
              <div className="ov_label">{it.label}</div>
              <div className="ov_sub" title={it.sub}>{it.sub}</div>
            </div>
            <span className="ov_icon" style={{ color: it.color, background: it.soft }}>{it.icon}</span>
          </div>
        </Col>
      ))}
    </Row>
  );
}
