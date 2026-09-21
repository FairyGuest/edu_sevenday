import { Fragment, memo } from "react";
import ReactECharts from "echarts-for-react";
import { Empty } from "antd";

/** A1 素养雷达（整行卡）：主维大图 + 二级维度图例；能力等级标签在知识点掌握分布表中 */

const LIT_HEX: Record<string, string> = {
  "数学抽象": "#2563eb", "逻辑推理": "#7c3aed", "数学建模": "#db2777",
  "直观想象": "#ea580c", "数学运算": "#0e9265", "数据分析": "#52607a",
};

function DimensionCards({ dimensions, personal = false }: { dimensions?: any; personal?: boolean }) {
  const literacy = (dimensions?.literacy || []).filter((d: any) => d.value != null);
  // ReactECharts observes its own host. Broadcasting a window resize from this
  // card caused unrelated page widgets to relayout on every local size change.

  if (!literacy.length) return personal ? <Empty description="暂无足够的作答证据，完成练习后可查看素养雷达图" /> : null;

  // 概览微统计：最强 / 最弱 / 均值（雷达标签配色与右侧概览条共用）
  const vals = literacy.map((d: any) => ({ name: d.name, value: d.value, hex: LIT_HEX[d.name] || "#1c6cff" }));
  const strongest = [...vals].sort((a, b) => b.value - a.value)[0];
  const weakest = [...vals].sort((a, b) => a.value - b.value)[0];
  const avg = Math.round(vals.reduce((a: number, v: any) => a + v.value, 0) / vals.length);

  // 六边形雷达（Figma 范式）：#F2F5FA 轨道 + #DFE3F0 描边，数据面 20% 主色 + 1.5px 主色描边，蓝心白边顶点
  const radarOption = {
    radar: {
      indicator: literacy.map((d: any) => ({ name: d.name, max: 100 })),
      radius: "62%",
      center: ["50%", "50%"],
      splitNumber: 1,
      axisNameGap: 10,
      axisName: {
        formatter: (name: string) => {
          const d = literacy.find((x: any) => x.name === name);
          const key = d?.value === strongest?.value ? "vg" : d?.value === weakest?.value ? "vr" : "vb";
          return `{n|${name}}\n{${key}|${d?.value ?? "—"}%}`;
        },
        rich: {
          n: { color: "#67696E", fontSize: 14, fontWeight: 500, lineHeight: 20, align: "center" },
          vg: { color: "#17BE6A", fontSize: 14, fontWeight: 500, lineHeight: 18, align: "center" },
          vr: { color: "#F63232", fontSize: 14, fontWeight: 500, lineHeight: 18, align: "center" },
          vb: { color: "#1C6CFF", fontSize: 14, fontWeight: 500, lineHeight: 18, align: "center" },
        },
      },
      splitLine: { lineStyle: { color: "#DFE3F0", width: 1 } },
      splitArea: { areaStyle: { color: ["#F2F5FA"] } },
      axisLine: { lineStyle: { color: "#DFE3F0" } },
    },
    series: [{
      type: "radar",
      data: [{
        value: literacy.map((d: any) => d.value ?? 0),
        name: "素养掌握度",
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { color: "#1C6CFF", width: 1.5 },
        itemStyle: { color: "#1C6CFF", borderColor: "#fff", borderWidth: 1 },
        areaStyle: { color: "rgba(28,108,255,0.20)" },
      }],
    }],
    tooltip: {
      trigger: "item" as const,
      formatter: () => literacy.map((d: any) => `${d.name}：${d.value}%`).join("<br/>"),
    },
  };

  // 个人学情：仅居中六边形雷达 + 六维标签（Figma 个人学情稿）
  if (personal) {
    return (
      <div className="lit_card pa_lit_card">
        <div className="lit_header lit_header--sm">
          <h3>素养掌握</h3>
        </div>
        <div className="lit_body pa_lit_body">
          <div className="lit_radar_col">
            <ReactECharts option={radarOption} style={{ height: "100%", minHeight: 340, width: "100%" }} notMerge />
          </div>
        </div>
      </div>
    );
  }

  // ===== 班级视图：素养掌握概况（Figma 范式：六边形雷达 + 概览条 + 六维明细）=====
  // 维度值配色：最强 #17BE6A / 最弱 #F63232 / 其余主色
  const valColor = (v: number) =>
    v === strongest?.value ? "#17BE6A" : v === weakest?.value ? "#F63232" : "#1C6CFF";
  const dimRows = [
    literacy.slice(0, 3),
    literacy.slice(3, 6),
  ].filter((r: any[]) => r.length);

  return (
    <div className="teacher_profile_card dim_card dim_card_full lit_card">
      <div className="lit_header">
        <h3>素养掌握概况</h3>
      </div>
      <div className="lit_body">
        <div className="lit_radar_col">
          <ReactECharts option={radarOption} style={{ height: "100%", minHeight: 320, width: "100%" }} notMerge />
        </div>
        <div className="lit_side_col">
          <div className="lit_stats_strip">
            <div className="lit_stat">
              <span className="lit_stat_txt"><small>最强素养</small><b>{strongest?.name}</b></span>
              <em style={{ color: "#17BE6A" }}>{strongest?.value}%</em>
            </div>
            <i className="lit_vsep" />
            <div className="lit_stat">
              <span className="lit_stat_txt"><small>待提升素养</small><b>{weakest?.name}</b></span>
              <em style={{ color: "#F63232" }}>{weakest?.value}%</em>
            </div>
            <i className="lit_vsep" />
            <div className="lit_stat">
              <span className="lit_stat_txt"><small>{literacy.length === 6 ? "六维均值" : "维度均值"}</small><b>整体水平</b></span>
              <em style={{ color: "#1C6CFF" }}>{avg}%</em>
            </div>
          </div>
          <div className="lit_detail">
            {dimRows.map((row: any[], ri: number) => (
              <div className="lit_detail_row" key={ri}>
                {row.map((d: any, i: number) => {
                  const subs = (d.subs || []).filter((sub: any) => sub.value != null);
                  return (
                    <Fragment key={d.key || d.name}>
                      {i > 0 ? <i className="lit_vsep" /> : null}
                      <div className="lit_dim">
                        <div className="lit_dim_left">
                          <b className="lit_dim_name">{d.name}</b>
                          <div className="lit_dim_subs">
                            {subs.map((sub: any) => <span key={sub.name}>{sub.name}</span>)}
                          </div>
                        </div>
                        <div className="lit_dim_right">
                          <b className="lit_dim_val" style={{ color: d.value === strongest?.value ? "#17BE6A" : d.value === weakest?.value ? "#F63232" : "#4E83FD" }}>
                            {d.value}%
                          </b>
                          <div className="lit_dim_subvals">
                            {subs.map((sub: any) => <span key={sub.name}>{sub.value}%</span>)}
                          </div>
                        </div>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DimensionCards);
