import { useEffect } from "react";
import { Col, Drawer, Empty, Row, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import MarkdownRender from "@/components/MarkdownRender";

/** F1.4 个人画像抽屉：掌握明细（含遗忘到期）+ 作答证据下钻 */
export default function StudentDrawer({ open, detail, evidence, loading, onClose }: {
  open: boolean; detail: any; evidence: any[]; loading: boolean; onClose: () => void;
}) {
  useEffect(() => { /* 数据由父组件 dispatch 拉取 */ }, [detail]);

  const cellCols: ColumnsType<any> = [
    { title: "知识点", dataIndex: "cluster" },
    { title: "掌握度", dataIndex: "p", width: 84, render: (t: number) => <b>{t}%</b> },
    {
      title: "状态", dataIndex: "band", width: 92,
      render: (t: string) => (
        <Tag color={t === "待巩固" ? "error" : t === "已掌握" ? "success" : t === "练习中" ? "warning" : "default"}>{t}</Tag>
      ),
    },
    { title: "证据", dataIndex: "k", width: 76, render: (t: number, r: any) => `${t}/${r.n}` },
    {
      title: "遗忘后", dataIndex: "p_eff", width: 110,
      render: (t: number, r: any) => (
        <span style={r.due ? { color: "#e05d62" } : undefined}>{t}%{r.due ? " ⏰到期" : ""}</span>
      ),
    },
  ];

  const evCols: ColumnsType<any> = [
    { title: "日期", dataIndex: "date", width: 96, render: (t: string) => <span style={{ color: "#8a94a8" }}>{t}</span> },
    { title: "来源", dataIndex: "source", width: 76 },
    {
      title: "题目", dataIndex: "stem",
      render: (t: string) => (
        <div className="teacher_profile_stem">
          <MarkdownRender>{t}</MarkdownRender>
        </div>
      ),
    },
    {
      title: "对错", dataIndex: "correct", width: 60,
      render: (t: boolean) => <span style={{ color: t ? "#4f9e70" : "#e05d62" }}>{t ? "✓" : "✗"}</span>,
    },
  ];

  return (
    <Drawer open={open} onClose={onClose} width={720} title={detail ? `${detail.name} 的个人学情` : "个人学情"}>
      <Spin spinning={loading}>
        {detail ? (
          <>
            <Row gutter={12} className="teacher_profile_kpi_row">
              <Col span={6}><div className="teacher_profile_kpi"><small>学情事件</small><b>{detail.n_events}</b></div></Col>
              <Col span={6}><div className="teacher_profile_kpi"><small>待巩固知识点</small><b style={{ color: "#e05d62" }}>{detail.weak_cnt}</b></div></Col>
              <Col span={6}><div className="teacher_profile_kpi"><small>遗忘到期</small><b style={{ color: "#c08a1e" }}>{detail.due_cnt}</b></div></Col>
              <Col span={6}><div className="teacher_profile_kpi"><small>账号</small><b style={{ fontSize: 13 }}>{detail.display_id}</b></div></Col>
            </Row>
            {detail.cold_start ? (
              <div className="teacher_profile_cold_tip">⏳ {detail.cold_start[1]}</div>
            ) : null}
            <p className="teacher_profile_chart_title" style={{ marginTop: 14 }}>知识点掌握明细</p>
            <Table rowKey="cluster" size="small" columns={cellCols} dataSource={detail.cells.slice(0, 16)} pagination={false} />
            <p className="teacher_profile_chart_title" style={{ marginTop: 16 }}>作答证据（下钻）· 每个读数可回溯原始作答</p>
            <Table rowKey={(r) => r.date + r.qid} size="small" columns={evCols} dataSource={evidence.slice(0, 14)} pagination={false} />
          </>
        ) : (
          <Empty description="暂无数据" />
        )}
      </Spin>
    </Drawer>
  );
}
