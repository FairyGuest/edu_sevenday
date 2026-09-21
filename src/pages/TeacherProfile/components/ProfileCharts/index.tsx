import { memo, useMemo, useState } from "react";
import { Button, Modal, Table, Tooltip } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";

// 视觉规范色板：主色 #1C6CFF / hover 浅蓝 #8EB6FE / 成功 #17BE6A / 基础色 #333C55 / 辅助紫 #935AF6
const SRC_COLORS: Record<string, string> = {
  作业记录: "#1C6CFF", 人机交互: "#8EB6FE", 自主练习: "#935AF6", 考试记录: "#333C55",
};
const TEXT_HINT = "#67696E";   // 二级文字
const TEXT_BODY = "#1E253B";   // 灰/9 正文
const GRID_LINE = "#D3D8E4";   // 趋势图网格线

/** "06-01~06-11" → "06.01"（取窗口起始日做 x 轴标签） */
const shortWin = (w?: string) => (w || "").split("~")[0].replace("-", ".");

/** F1.2 右列三图（Figma 设计稿范式：趋势折线 / 来源环形 / 薄弱排行） */
function ProfileCharts({ trend, sourceMix, weakRanking, classId }: {
  trend: any[]; sourceMix: any[]; weakRanking: any[]; classId?: string;
}) {
  // B3 人机交互明细（来源=人机交互 的问答记录）
  const [iaOpen, setIaOpen] = useState(false);
  const [iaRows, setIaRows] = useState<any[]>([]);
  const [iaLoading, setIaLoading] = useState(false);
  const openInteractions = () => {
    setIaOpen(true); setIaLoading(true);
    fetch(`/api/teacher/interactions?class_id=${classId || ""}`)
      .then(r => r.json())
      .then(d => { if (d.code === 200) setIaRows(d.data || []); })
      .finally(() => setIaLoading(false));
  };

  const lineOption = useMemo(() => ({
    grid: { left: 34, right: 14, top: 40, bottom: 28 },
    xAxis: {
      type: "category", boundaryGap: true,
      data: trend.map((t) => shortWin(t.window)),
      axisLabel: { color: TEXT_HINT, fontSize: 14 },
      axisLine: { show: false }, axisTick: { show: false },
    },
    yAxis: {
      type: "value", min: 0, max: 100, interval: 20,
      name: "(%)",
      nameTextStyle: { color: TEXT_HINT, fontSize: 14, align: "right", padding: [0, 4, 2, 0] },
      axisLabel: { color: TEXT_HINT, fontSize: 12 },
      splitLine: { lineStyle: { color: GRID_LINE, opacity: 0.8 } },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line", lineStyle: { color: GRID_LINE } },
      backgroundColor: "#fff", borderColor: "rgba(187, 191, 196, 0.5)",
      textStyle: { color: "#222222" },
      formatter: (ps: any) => {
        const i = ps[0].dataIndex;
        return `${shortWin(trend[i]?.window)}<br/>掌握度：${trend[i]?.value ?? "—"}%`;
      },
    },
    series: [{
      type: "line", data: trend.map((t) => t.value), smooth: false,
      symbol: "circle", symbolSize: 9,
      itemStyle: { color: "#fff", borderColor: "#1C6CFF", borderWidth: 2 },
      lineStyle: { width: 2, color: "#1C6CFF" },
      label: { show: true, position: "top", distance: 6, color: "#222222", fontSize: 14 },
    }],
  }), [trend]);

  const pieData = useMemo(() => sourceMix.filter((s) => s.n > 0), [sourceMix]);
  const srcTotal = pieData.reduce((a, b) => a + (b.n || 0), 0);
  const pieOption = useMemo(() => ({
    tooltip: { trigger: "item", formatter: "{b}：{c}次（{d}%）" },
    // 环心显示总记录数
    title: {
      text: `${srcTotal}次`, subtext: "总记录", left: "center", top: "40%",
      textStyle: { color: TEXT_BODY, fontSize: 18, fontWeight: 500 },
      subtextStyle: { color: TEXT_HINT, fontSize: 12 },
    },
    series: [{
      type: "pie", radius: ["34%", "50%"], center: ["50%", "50%"],
      itemStyle: { borderColor: "#fff", borderWidth: 2, borderRadius: 4 },
      label: { show: false },
      data: pieData.map((s) => ({ name: s.source, value: s.n, itemStyle: { color: SRC_COLORS[s.source] || TEXT_HINT } })),
    }],
  }), [pieData, srcTotal]);

  const barOption = useMemo(() => {
    const top = weakRanking.slice(0, 10);
    return {
    grid: { left: 112, right: 96, top: 6, bottom: 6 },
    xAxis: {
      type: "value",
      axisLabel: { show: false }, splitLine: { show: false },
      axisLine: { show: false }, axisTick: { show: false },
    },
    yAxis: {
      type: "category", inverse: true, data: top.map((w) => w.cluster),
      axisLabel: { color: TEXT_HINT, fontSize: 14, width: 100, overflow: "truncate" },
      axisLine: { show: false }, axisTick: { show: false },
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: (ps: any) => {
      const w = top[ps[0].dataIndex];
      return `${w.cluster}：${w.weak_n}人待巩固（${w.weak_pct}%）`;
    } },
    series: [{
      type: "bar", barWidth: 8, itemStyle: { color: "#F76964", borderRadius: [0, 4, 4, 0] },
      label: {
        show: true, position: "right", distance: 8,
        color: TEXT_HINT, fontSize: 14,
        formatter: (p: any) => `${p.value}人待巩固`,
      },
      data: top.map((w) => w.weak_n),
    }],
    };
  }, [weakRanking]);

  return (
    <div className="teacher_profile_charts analysis_charts">
      <div className="teacher_profile_chart_card">
        <div className="profile_chart_heading">
          <p className="teacher_profile_chart_title">班级掌握度趋势 · 近8次评估</p>
        </div>
        <div className="profile_chart_plot">
          <ReactECharts option={lineOption} style={{ height: "100%" }} notMerge />
        </div>
      </div>
      <div className="teacher_profile_chart_card">
        <div className="profile_chart_heading">
          <p className="teacher_profile_chart_title">数据来源构成</p>
          <Tooltip title="查看人机交互明细">
            <Button size="small" type="link" icon={<MessageOutlined />} className="ia_link"
              aria-label="查看人机交互明细" onClick={openInteractions}>
              查看明细
            </Button>
          </Tooltip>
        </div>
        <div className="profile_chart_plot pc_source_mix">
          <div className="pc_pie">
            <ReactECharts option={pieOption} style={{ height: "100%" }} notMerge />
          </div>
          <div className="pc_source_legend">
            <div className="pc_source_names">
              {pieData.map((s) => (
                <span key={s.source} className="pc_source_name">
                  <i style={{ background: SRC_COLORS[s.source] || TEXT_HINT }} />
                  {s.source}
                </span>
              ))}
            </div>
            <div className="pc_source_values">
              {pieData.map((s) => (
                <span key={s.source} className="pc_source_value">
                  <b>{s.n}次</b>
                  <em>{srcTotal ? Math.round((s.n / srcTotal) * 1000) / 10 : 0}%</em>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="teacher_profile_chart_card">
        <div className="profile_chart_heading">
          <p className="teacher_profile_chart_title">薄弱知识点排行</p>
        </div>
        <div className="profile_chart_plot">
          <ReactECharts option={barOption} style={{ height: "100%" }} notMerge />
        </div>
      </div>
      {/* B3 人机交互明细弹窗 */}
      <Modal open={iaOpen} onCancel={() => setIaOpen(false)} footer={null} width={640}
        title="人机交互明细 · 学生与 AI 的问答记录（来源：人机交互）">
        <Table loading={iaLoading} size="small" rowKey={(r: any) => r.student + r.time + r.question}
          pagination={{ pageSize: 8, size: "small" }}
          columns={[
            { title: "学生", dataIndex: "student", width: 80 },
            { title: "知识点", dataIndex: "cluster", width: 130, ellipsis: true },
            { title: "提问/练习内容", dataIndex: "question", ellipsis: true },
            { title: "时间", dataIndex: "time", width: 100 },
            { title: "对错", dataIndex: "correct", width: 60,
              render: (t: boolean) => <span style={{ color: t ? "#17BE6A" : "#F63232" }}>{t ? "✓" : "✗"}</span> },
          ]}
          dataSource={iaRows} />
      </Modal>

    </div>
  );
}

export default memo(ProfileCharts);
