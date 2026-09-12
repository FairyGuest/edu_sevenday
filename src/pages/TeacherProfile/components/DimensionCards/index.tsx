import { useEffect, useRef } from "react";
import { BarChartOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";

/** A1 素养雷达（整行卡）：主维大图 + 二级维度图例；能力等级标签在知识点掌握分布表中 */

const LIT_HEX: Record<string, string> = {
  "数学抽象": "#2563eb", "逻辑推理": "#7c3aed", "数学建模": "#db2777",
  "直观想象": "#ea580c", "数学运算": "#0e9265", "数据分析": "#52607a",
};

export default function DimensionCards({ dimensions }: { dimensions?: any }) {
  const literacy = (dimensions?.literacy || []).filter((d: any) => d.value != null);
  const radarBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = radarBoxRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => window.dispatchEvent(new Event("resize")));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!literacy.length) return null;

  const radarOption = {
    radar: {
      indicator: literacy.map((d: any) => ({ name: d.name, max: 100 })),
      radius: "66%",
      center: ["50%", "49%"],
      splitNumber: 4,
      axisName: {
        formatter: (name: string) => {
          const d = literacy.find((x: any) => x.name === name);
          return `{n|${name}}
{v|${d?.value ?? "—"}%}`;
        },
        rich: {
          n: { color: "#1f2733", fontSize: 11.5, fontWeight: 600, lineHeight: 16 },
          v: { color: "#1c6cff", fontSize: 10.5, fontWeight: 700, lineHeight: 13 },
        },
      },
      splitLine: { lineStyle: { color: "#e6ebf3", width: 1 } },
      splitArea: { areaStyle: { color: ["#fdfefe", "#f6f8fc", "#f1f4fa", "#eceff7"] } },
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

  // 概览微统计：最强 / 最弱 / 均值（图例行顶部常显）
  const vals = literacy.map((d: any) => ({ name: d.name, value: d.value, hex: LIT_HEX[d.name] || "#1c6cff" }));
  const strongest = [...vals].sort((a, b) => b.value - a.value)[0];
  const weakest = [...vals].sort((a, b) => a.value - b.value)[0];
  const avg = Math.round(vals.reduce((a: number, v: any) => a + v.value, 0) / vals.length);

  return (
    <div className="teacher_profile_card dim_card dim_card_full">
      <div className="g-panel-head" style={{ marginBottom: 2 }}>
        <span className="g-panel-head__icon"><BarChartOutlined /></span>
        <h3>素养掌握 · 六大素养</h3>
        <span className="g-hint">同维度跨页面同色 · 能力等级标签见知识点掌握分布</span>
      </div>
      <div className="dim_radar_row">
        <div className="dim_radar_main" ref={radarBoxRef}>
          <ReactECharts option={radarOption} style={{ height: "100%", minHeight: 240, width: "100%" }} notMerge />
        </div>
        <div className="dim_radar_side">
          <div className="dim_side_stats">
            <div className="dim_side_stat" style={{ ["--c" as any]: strongest?.hex }}>
              <small>最强素养</small>
              <b>{strongest?.name}</b>
              <em>{strongest?.value}%</em>
            </div>
            <div className="dim_side_stat" style={{ ["--c" as any]: weakest?.hex }}>
              <small>待提升</small>
              <b>{weakest?.name}</b>
              <em>{weakest?.value}%</em>
            </div>
            <div className="dim_side_stat" style={{ ["--c" as any]: "#1c6cff" }}>
              <small>六维均值</small>
              <b>整体水平</b>
              <em>{avg}%</em>
            </div>
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
                {d.subs?.filter((sub: any) => sub.value != null).map((sub: any) => (
                  <span key={sub.name} className="dim_rl_sub">{sub.name} {sub.value}%</span>
                ))}
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
