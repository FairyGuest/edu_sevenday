import { useEffect, useRef } from "react";
import { Col, Row } from "antd";
import { BarChartOutlined, TrophyOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";

/** A1/A2 多维标签展示：能力等级（课标动词 L1-L4）条形 + 素养雷达（主维大图 + 二级维度图例） */
const LEVEL_COLORS: Record<string, string> = {
  L1: "#52607a", L2: "#2563eb", L3: "#7c3aed", L4: "#db2777",
};
// 素养专属色（与雷达/图谱跨页同色）
const LIT_HEX: Record<string, string> = {
  数学抽象: "#2563eb", 逻辑推理: "#7c3aed", 数学建模: "#db2777",
  直观想象: "#ea580c", 数学运算: "#0e9265", 数据分析: "#52607a",
};

export default function DimensionCards({ dimensions }: { dimensions?: any }) {
  if (!dimensions) return null;
  const ability = dimensions.ability_dist || [];
  const literacy = (dimensions.literacy || []).filter((d: any) => d.value != null);
  const maxLevelN = Math.max(1, ...ability.map((a: any) => a.n));

  // 主雷达：六素养（带值），渐变面积 + 彩色角标
  const radarOption = {
    radar: {
      indicator: literacy.map((d: any) => ({ name: d.name, max: 100 })),
      radius: "72%",
      center: ["50%", "53%"],
      splitNumber: 4,
      axisName: {
        formatter: (name: string) => {
          const d = literacy.find((x: any) => x.name === name);
          return `{n|${name}}\n{v|${d?.value ?? "—"}%}`;
        },
        rich: {
          n: { color: "#1f2733", fontSize: 12, fontWeight: 600, lineHeight: 17 },
          v: { color: LIT_HEX[""] || "#1c6cff", fontSize: 11, fontWeight: 700, lineHeight: 14 },
        },
      },
      splitLine: { lineStyle: { color: "#e6ebf3", width: 1 } },
      splitArea: {
        areaStyle: { color: ["#fdfefe", "#f6f8fc", "#f1f4fa", "#eceff7"] },
      },
      axisLine: { lineStyle: { color: "#dde4ef" } },
    },
    series: [{
      type: "radar",
      data: [{
        value: literacy.map((d: any) => d.value ?? 0),
        name: "素养掌握度",
        symbol: "circle",
        symbolSize: 5.5,
        lineStyle: { color: "#1c6cff", width: 2.2, shadowColor: "rgba(28,108,255,0.35)", shadowBlur: 8 },
        itemStyle: { color: "#fff", borderColor: "#1c6cff", borderWidth: 2 },
        areaStyle: {
          color: {
            type: "radial", x: 0.5, y: 0.5, r: 0.65,
            colorStops: [
              { offset: 0, color: "rgba(28,108,255,0.30)" },
              { offset: 1, color: "rgba(77,141,255,0.10)" },
            ],
          },
        },
      }],
    }],
    tooltip: {
      trigger: "item" as const,
      formatter: () => literacy.map((d: any) => `${d.name}：${d.value}%`).join("<br/>"),
    },
  };

  // 动态布局：容器尺寸变化时让 echarts 自适应重绘
  const radarBoxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = radarBoxRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      window.dispatchEvent(new Event("resize"));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Row gutter={16} className="dim_cards_row">
      {/* A2 能力等级分布 */}
      <Col span={10}>
        <div className="teacher_profile_card dim_card">
          <div className="g-panel-head" style={{ marginBottom: 10 }}>
            <span className="g-panel-head__icon"><TrophyOutlined /></span>
            <h3>能力等级分布</h3>
            <span className="g-hint">依据课标行为动词标定</span>
          </div>
          <div className="dim_level_list">
            {ability.map((a: any) => (
              <div key={a.level} className="dim_level_row">
                <span className="g-chip" style={{ background: `${LEVEL_COLORS[a.level]}1a`, color: LEVEL_COLORS[a.level] }}>
                  {a.label}
                </span>
                <span className="dim_verb">{a.verb}</span>
                <span className="g-minibar" style={{ flex: 1 }}>
                  <i style={{ width: `${(a.n / maxLevelN) * 100}%`, background: LEVEL_COLORS[a.level] }} />
                </span>
                <span className="dim_n">{a.n} 个</span>
                <span className="dim_avg">{a.avg != null ? `均 ${a.avg}%` : "证据不足"}</span>
              </div>
            ))}
          </div>
          <p className="dim_note">{dimensions.sample_rule}</p>
        </div>
      </Col>

      {/* A1 素养雷达：左大图 + 右二级维度图例 */}
      <Col span={14}>
        <div className="teacher_profile_card dim_card">
          <div className="g-panel-head" style={{ marginBottom: 2 }}>
            <span className="g-panel-head__icon"><BarChartOutlined /></span>
            <h3>素养掌握 · 六大素养</h3>
            <span className="g-hint">同维度跨页面同色</span>
          </div>
          <div className="dim_radar_row">
            <div className="dim_radar_main" ref={radarBoxRef}>
              <ReactECharts option={radarOption} style={{ height: 292, width: "100%" }} notMerge />
            </div>
            <div className="dim_radar_legend">
              {literacy.map((d: any) => (
                <div key={d.key} className="dim_rl_item">
                  <div className="dim_rl_head">
                    <i className="g-dot" style={{ background: LIT_HEX[d.name] || "#1c6cff" }} />
                    <span className="dim_rl_name">{d.name}</span>
                    <b className="dim_rl_val">{d.value}%</b>
                  </div>
                  <div className="dim_rl_subs">
                    {d.subs?.filter((s: any) => s.value != null).map((s: any) => (
                      <span key={s.name} className="dim_rl_sub">{s.name} {s.value}%</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}
