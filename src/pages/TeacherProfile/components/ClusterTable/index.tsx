import { memo } from "react";
import { Tooltip } from "antd";

const BAND_COLORS: Record<string, string> = {
  待巩固: "#F76964", 练习中: "#8EB6FE", 较熟练: "#1C6CFF", 已掌握: "#1FD479",
};
const BANDS = ["待巩固", "练习中", "较熟练", "已掌握"];
const LEVEL_META: Record<string, { color: string; short: string; label: string; verb: string; desc: string }> = {
  L1: { color: "#52607a", short: "L1", label: "了解", verb: "了解 / 知道 / 识别", desc: "能再认再现，识别基本概念与符号" },
  L2: { color: "#2563eb", short: "L2", label: "理解", verb: "理解 / 描述 / 说明", desc: "能解释含义、举例说明，明白为什么" },
  L3: { color: "#7c3aed", short: "L3", label: "掌握", verb: "掌握 / 运用 / 计算", desc: "能在熟悉情境中独立使用与计算" },
  L4: { color: "#db2777", short: "L4", label: "综合", verb: "综合 / 迁移 / 建模", desc: "能在新情境中组合应用、建模探究" },
};
const TRUST_META: Record<string, string> = { credible: "可信", coarse: "粗估", insufficient: "证据不足" };

/** 四级人数堆叠条；95% 置信区间与可信度收进悬停提示 */
function StackBar({ counts, ci, p, trust }: { counts: Record<string, number>; ci?: [number, number]; p?: number; trust?: string }) {
  const total = BANDS.reduce((a, b) => a + (counts?.[b] || 0), 0) || 1;
  const tip = [
    ...BANDS.filter((b) => counts?.[b]).map((b) => `${b} ${counts[b]}人`),
    ci ? `掌握度 ${p}% · 95% 区间 [${ci[0]}, ${ci[1]}] · ${TRUST_META[trust || ""] || ""}` : "",
  ].filter(Boolean).join("\n");
  return (
    <Tooltip title={tip} overlayClassName="ct_lv_tip">
      <div className="teacher_profile_stackbar">
        {BANDS.map((b) =>
          counts?.[b] ? (
            <i key={b} style={{ width: `${(counts[b] / total) * 100}%`, background: BAND_COLORS[b] }} />
          ) : null,
        )}
      </div>
    </Tooltip>
  );
}

const trendChipCls = (t: string) =>
  t.includes("向好") ? "ct_chip ct_chip--ok" : t.includes("下降") ? "ct_chip ct_chip--bad" : "ct_chip ct_chip--flat";

/** 单个知识点行：名称/章节 → 四级堆叠条 → 待巩固人数 + 趋势/错因标签 */
function ClusterRow({ r }: { r: any }) {
  const lv = LEVEL_META[r.level];
  const m = r.misconception;
  return (
    <div className="ct_row">
      <div className="ct_row_top">
        <span className="ct_row_name" title={`${r.cluster}${r.level ? "（" + r.level + "）" : ""}`}>
          {r.cluster}
          {lv ? (
            <Tooltip title={`能力等级 ${r.level}：${lv.verb}
${lv.desc}`} color="#fff" overlayClassName="ct_lv_tip">
              <span className="ct_lv" style={{ ["--c" as any]: lv.color }}>{lv.short}</span>
            </Tooltip>
          ) : null}
        </span>
        <i className="ct_row_sep" />
        <span className="ct_row_chapter">{r.chapter || "—"}</span>
      </div>
      <StackBar counts={r.band_counts} ci={r.ci} p={r.p} trust={r.trust} />
      <div className="ct_row_bottom">
        <span className="ct_row_weak">
          待巩固 <b>{r.weak_n}人</b> <i className="ct_row_sep" /> <b>{r.weak_pct}%</b>
        </span>
        <span className="ct_row_tags">
          {r.trend ? <span className={trendChipCls(r.trend)}>{r.trend}</span> : null}
          {m ? (
            <Tooltip title={`${m.share}% 集中在「${m.label}」${m.evidence ? "：" + m.evidence : ""}`}>
              <span className="ct_misc">
                {m.share}%错误集中在「{m.label}」
              </span>
            </Tooltip>
          ) : null}
        </span>
      </div>
    </div>
  );
}

/** F1.2 知识点掌握分布（行卡片范式，Figma 设计稿重做） */
function ClusterTable({ rows }: { rows: any[] }) {
  const list = rows.filter((r) => r.n_students >= 3).slice(0, 10);
  return (
    <div className="ct_rows">
      {list.map((r) => (
        <ClusterRow key={r.cluster} r={r} />
      ))}
    </div>
  );
}

export default memo(ClusterTable);
