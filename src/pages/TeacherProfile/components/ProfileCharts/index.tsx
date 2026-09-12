import { useState } from "react";
import { Button, Modal, Table } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";

const SRC_COLORS: Record<string, string> = {
  作业记录: "#4f7df0", 自主练习: "#4f9e70", 人机交互: "#8e7ce0", 考试记录: "#e0a05e",
};
const BAND_COLORS: Record<string, string> = {
  待巩固: "#e58a8e", 练习中: "#eec27e", 较熟练: "#cfc07a", 已掌握: "#6cbf93",
};
const BAND_RANGES: Record<string, string> = {
  待巩固: "<50", 练习中: "50–70", 较熟练: "70–85", 已掌握: "≥85",
};

/** F1.2 右列三图 + 四级掌握度图例（图例从分布表上方移至此处） */
export default function ProfileCharts({ trend, sourceMix, weakRanking, classId }: {
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
  const lineOption = {
    grid: { left: 40, right: 16, top: 24, bottom: 26 },
    xAxis: { type: "category", data: trend.map((_, i) => `${i + 1}`), axisLabel: { color: "#8a94a8" } },
    yAxis: { type: "value", min: (v: any) => Math.max(0, Math.floor(v.min - 5)), axisLabel: { color: "#8a94a8" }, splitLine: { lineStyle: { color: "#eef1f6" } } },
    tooltip: { trigger: "axis", formatter: (ps: any) => {
      const i = ps[0].dataIndex;
      return `${trend[i]?.window || ""}<br/>正确率：${trend[i]?.value ?? "—"}%`;
    } },
    series: [{
      type: "line", data: trend.map((t) => t.value), smooth: true,
      symbolSize: 7, itemStyle: { color: "#4f7df0" }, lineStyle: { width: 2.5 },
      areaStyle: { color: "rgba(79,125,240,0.08)" },
    }],
  };

  const pieOption = {
    tooltip: { trigger: "item", formatter: "{b}：{c}次（{d}%）" },
    legend: { bottom: 0, icon: "circle", itemWidth: 8, itemHeight: 8, textStyle: { color: "#5f6b81", fontSize: 11 } },
    series: [{
      type: "pie", radius: ["48%", "72%"], center: ["50%", "44%"],
      itemStyle: { borderColor: "#fff", borderWidth: 2, borderRadius: 4 },
      label: { show: false },
      data: sourceMix.filter((s) => s.n > 0).map((s) => ({ name: s.source, value: s.n, itemStyle: { color: SRC_COLORS[s.source] || "#999" } })),
    }],
  };

  const top = weakRanking.slice(0, 6);
  const barOption = {
    grid: { left: 110, right: 46, top: 8, bottom: 20 },
    xAxis: { type: "value", axisLabel: { color: "#8a94a8" }, splitLine: { lineStyle: { color: "#eef1f6" } } },
    yAxis: { type: "category", inverse: true, data: top.map((w) => w.cluster), axisLabel: { color: "#2a3346", width: 100, overflow: "truncate" } },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: (ps: any) => {
      const w = top[ps[0].dataIndex];
      return `${w.cluster}：${w.weak_n}人待巩固（${w.weak_pct}%）`;
    } },
    series: [{
      type: "bar", barWidth: 10, itemStyle: { color: "#8e7ce0", borderRadius: 5 },
      data: top.map((w) => w.weak_n),
    }],
  };

  return (
    <div className="teacher_profile_charts analysis_charts">
      <div className="teacher_profile_chart_card">
        <p className="teacher_profile_chart_title">班级掌握度趋势 · 近8次评估</p>
        <ReactECharts option={lineOption} style={{ height: 212 }} notMerge />
      </div>
      <div className="teacher_profile_chart_card">
        <p className="teacher_profile_chart_title">数据来源构成</p>
        <ReactECharts option={pieOption} style={{ height: 228 }} notMerge />
        <Button size="small" type="link" icon={<MessageOutlined />} className="ia_link" onClick={openInteractions}>
          查看人机交互明细
        </Button>
      </div>
      <div className="teacher_profile_chart_card">
        <p className="teacher_profile_chart_title">薄弱知识点排行</p>
        <ReactECharts option={barOption} style={{ height: 204 }} notMerge />
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
              render: (t: boolean) => <span style={{ color: t ? "#4f9e70" : "#e05d62" }}>{t ? "✓" : "✗"}</span> },
          ]}
          dataSource={iaRows} />
      </Modal>

    </div>
  );
}
