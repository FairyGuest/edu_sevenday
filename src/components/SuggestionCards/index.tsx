import { Button, Empty, Tooltip } from "antd";
import "./index.less";

/** v2.0-H 建议卡数据结构（与 mock /api/teacher/profile/suggestions 对齐） */
export interface SuggestionAction {
  key: string;
  label: string;
  params?: Record<string, any>;
}
export interface Suggestion {
  id: string;
  scope: "class" | "student";
  type: string;
  title: string;
  detail?: string;
  evidence?: Record<string, any>;
  actions?: SuggestionAction[];
}

const TYPE_META: Record<string, { label: string; color: string }> = {
  ability: { label: "素养短板", color: "#2563eb" },
  knowledge: { label: "薄弱知识点", color: "#e05d62" },
  trend: { label: "进退步关注", color: "#7c3aed" },
  review: { label: "遗忘复习", color: "#c08a1e" },
  cold: { label: "样本不足", color: "#8a94a8" },
};
const EV_LABEL: Record<string, string> = {
  metric: "口径", value: "数值", n_clusters: "知识点样本", compare: "对比", weak_subs: "薄弱子维",
  chapter: "章节", weak_pct: "待巩固占比", n_students: "涉及人数", trend: "趋势", n_sample: "样本题数",
  trust: "证据强度", window: "统计窗口", n_events: "学情事件", band: "掌握档位", p_eff: "遗忘后",
  due: "到期", last_observed: "最近作答", n_wrong: "近期错题", level: "能力等级", n: "样本量",
};
const TRUST_ZH: Record<string, string> = { credible: "充分", coarse: "一般", insufficient: "不足" };

/**
 * v2.0-H 结构化建议 → 卡片渲染。
 * G5 个人建议区先行使用；H1 班级建议区与 AI 小助手引用同一组件。
 * 执行统一走 onAction 回调（调用方各自接动作处理器 / 后续 ActionRegistry）。
 */
export default function SuggestionCards({
  suggestions,
  emptyText = "暂无建议",
  onAction,
}: {
  suggestions?: Suggestion[];
  emptyText?: string;
  onAction?: (action: SuggestionAction, suggestion: Suggestion) => void;
}) {
  if (!suggestions?.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} style={{ margin: "18px 0" }} />;
  }
  return (
    <div className="sg_cards">
      {suggestions.map((s) => {
        const meta = TYPE_META[s.type] || { label: s.type, color: "#52607a" };
        const evEntries = Object.entries(s.evidence || {})
          .filter(([, v]) => {
            if (v == null || Array.isArray(v) || typeof v === "object") return false;
            if (typeof v === "boolean") return v; // false 不展示（如"到期 false"）
            return true;
          })
          .map(([k, v]) => [k, typeof v === "boolean" ? "✓" : v] as [string, any])
          .slice(0, 5);
        return (
          <div key={s.id} className="sg_card" style={{ ["--sg-c" as any]: meta.color }}>
            <div className="sg_card_head">
              <span className="sg_card_type">{meta.label}</span>
              <span className="sg_card_title">{s.title}</span>
            </div>
            {s.detail ? <div className="sg_card_detail">{s.detail}</div> : null}
            {evEntries.length ? (
              <div className="sg_card_ev">
                {evEntries.map(([k, v]) => {
                  const text = k === "trust" ? TRUST_ZH[String(v)] || String(v) : String(v);
                  return (
                    <Tooltip key={k} title={`${EV_LABEL[k] || k}：${text}`}>
                      <span className="sg_ev_chip">{EV_LABEL[k] || k} {text}</span>
                    </Tooltip>
                  );
                })}
              </div>
            ) : null}
            {s.actions?.length ? (
              <div className="sg_card_actions">
                {s.actions.map((a) => (
                  <Button key={`${s.id}-${a.key}`} size="small" onClick={() => onAction?.(a, s)}>
                    {a.label}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
