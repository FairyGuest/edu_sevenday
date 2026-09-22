import { Fragment, memo } from "react";

/** 语义概览条（Figma 范式）：渐变底横条 + 居中大数字 + 竖分隔线 */
function OverviewGrid({ cards }: { cards: any; trend?: any[] }) {
  if (!cards) return null;
  // 待巩固占比前缀最薄弱知识点名（如「二次根式」），与设计稿「「一般过去时」待巩固占比」同构
  const weakTopic = (cards.weak_top || "").replace("待巩固占比", "").trim();

  const items = [
    { key: "weak", label: `${weakTopic}待巩固占比`, value: cards.weak_top_pct == null ? "--" : `${cards.weak_top_pct}%` },
    { key: "support", label: cards.support_label || "知识点支援建议", value: cards.support_suggestions ?? "--" },
    { key: "mastered", label: "全员已掌握知识点", value: cards.mastered_all_count },
    { key: "avg", label: cards.avg_label || "近5次掌握度均值", value: cards.recent5_avg ?? "—" },
  ];

  return (
    <div className="ov_strip">
      {items.map((it, i) => (
        <Fragment key={it.key}>
          {i > 0 ? <i className="ov_sep" /> : null}
          <div className="ov_cell">
            <b className="ov_value">{it.value ?? "--"}</b>
            <span className="ov_label">{it.label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export default memo(OverviewGrid);
