import { Button, Col, DatePicker, Empty, Row, Skeleton, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined, FilterOutlined, RobotOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

import KnowledgeGraph from "@/pages/TeacherProfile/components/KnowledgeGraph";
import MarkdownRender from "@/components/MarkdownRender";
import type { Suggestion } from "@/components/SuggestionCards";

/**
 * G5 个人学情整页面板（由 StudentDrawer 迁移增强）：
 * 筛选（时间窗/学情来源，口径同班级学情）+ KPI + AI 助教建议入口条（v2.0-I 建议融入助手）+
 * 个人知识图谱 + 素养掌握 + 能力等级 + 掌握明细 + 作答证据。
 * 数据获取由父组件 PersonalAnalysis 负责。
 */
export default function StudentProfilePanel({
  detail,
  evidence,
  suggestions,
  loading,
  sources,
  allSources,
  onToggleSource,
  dateRange,
  onDateRange,
  onOpenAssistant,
  onBack,
}: {
  detail: any;
  evidence: any[];
  suggestions?: Suggestion[];
  loading?: boolean;
  sources: string[];
  allSources: string[];
  onToggleSource: (src: string) => void;
  dateRange: [Dayjs | null, Dayjs | null];
  onDateRange: (vals: [Dayjs | null, Dayjs | null]) => void;
  onOpenAssistant: () => void;
  onBack: () => void;
}) {
  const cellCols: ColumnsType<any> = [
    { title: "知识点", dataIndex: "cluster" },
    {
      title: "掌握度", dataIndex: "p", width: 84,
      render: (t: number, r: any) =>
        r.n >= 3 ? <b>{t}%</b> : <Tooltip title={`仅 ${r.n} 题样本（门槛 3 题）`}><span className="g-chip g-chip--warn">证据不足</span></Tooltip>,
    },
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
    <div className="pa_panel">
      <div className="pa_panel_head">
        <div className="pa_panel_title">
          <span className="pa_panel_name">{detail ? `${detail.name} 的个人学情` : "个人学情"}</span>
          {detail ? <span className="pa_panel_sid">{detail.display_id}</span> : null}
        </div>
        <Button size="small" icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回班级学情
        </Button>
      </div>

      {/* ===== 筛选栏：时间窗 + 学情来源（口径同班级学情，来源驱动证据明细重算）===== */}
      <div className="pa_filter">
        <DatePicker.RangePicker
          size="small"
          value={dateRange as any}
          onChange={(vals) => onDateRange(vals as [Dayjs | null, Dayjs | null])}
          presets={[
            { label: "本周", value: [dayjs().startOf("week"), dayjs()] },
            { label: "本月", value: [dayjs().startOf("month"), dayjs()] },
            { label: "近三个月", value: [dayjs().subtract(3, "month"), dayjs()] },
            { label: "本学期", value: [dayjs().subtract(6, "month"), dayjs()] },
          ]}
        />
        <div className="pa_filter_sources">
          <FilterOutlined className="icon" />
          <span className="title">学情来源</span>
          <div className="pa_chips">
            {allSources.map((s) => (
              <button
                key={s}
                type="button"
                className={`source-chip ${sources.includes(s) ? "on" : ""}`}
                onClick={() => onToggleSource(s)}
              >
                <i className="g-dot" style={{ background: sources.includes(s) ? "#fff" : "var(--dim-context)" }} />
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div aria-busy={!!loading}>
        {detail ? (
          <>
            <Row gutter={12} className="teacher_profile_kpi_row">
              <Col span={6}><div className="teacher_profile_kpi"><small>学情事件</small><b>{detail.n_events}</b></div></Col>
              <Col span={6}><div className="teacher_profile_kpi"><small>待巩固知识点</small><b style={{ color: "#e05d62" }}>{detail.weak_cnt}</b></div></Col>
              <Col span={6}><div className="teacher_profile_kpi"><small>遗忘到期</small><b style={{ color: "#c08a1e" }}>{detail.due_cnt}</b></div></Col>
              <Col span={6}><div className="teacher_profile_kpi"><small>账号</small><b style={{ fontSize: 13 }}>{detail.display_id}</b></div></Col>
            </Row>
            {detail.cold_start ? <div className="teacher_profile_cold_tip">⏳ {detail.cold_start[1]}</div> : null}

            {/* ===== v2.0-I 建议融入助手：入口条（建议卡在 AI 助教面板内展示与执行）===== */}
            {suggestions?.length ? (
              <div className="pa_sg_strip" onClick={onOpenAssistant} role="button" tabIndex={0}>
                <RobotOutlined className="icon" />
                <span className="txt">
                  AI 助教「小七」已根据该生学情整理了 <b>{suggestions.length}</b> 条建议（薄弱补强 / 素养提升 / 遗忘复习）
                </span>
                <a className="link">在小助手中查看 ›</a>
              </div>
            ) : null}

            <p className="teacher_profile_chart_title" style={{ marginTop: 14 }}>知识图谱 · 个人掌握网络</p>
            <div className="drawer_graph_wrap">
              <KnowledgeGraph graph={detail.kgraph} height={420} />
            </div>

            {detail.dimensions ? (
              <>
                <p className="teacher_profile_chart_title" style={{ marginTop: 14 }}>素养掌握 · 六大素养</p>
                <div className="pa_lit_grid">
                  {(detail.dimensions.literacy || []).map((d: any) => (
                    <div key={d.key} className="drawer_lit_row">
                      <i className="g-dot" style={{ background: d.color }} />
                      <span className="name">{d.name}</span>
                      <span className="g-minibar" style={{ flex: 1 }}>
                        <i style={{ width: `${d.value ?? 0}%`, background: d.color }} />
                      </span>
                      <b>{d.value != null ? `${d.value}%` : "—"}</b>
                    </div>
                  ))}
                </div>
                {detail.levels?.length ? (
                  <>
                    <p className="teacher_profile_chart_title" style={{ marginTop: 12 }}>能力等级（个人视角）</p>
                    <div className="drawer_level_chips">
                      {detail.levels.slice(0, 10).map((l: any) => (
                        <span key={l.cluster} className="g-chip">
                          {l.cluster} · {l.level} · {l.p}%
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
            <p className="teacher_profile_chart_title" style={{ marginTop: 14 }}>知识点掌握明细</p>
            <Table
              rowKey="cluster"
              size="small"
              columns={cellCols}
              dataSource={detail.cells || []}
              pagination={{ pageSize: 8, showSizeChanger: false, size: "small", showTotal: (t) => `共 ${t} 个知识点` }}
            />
            <p className="teacher_profile_chart_title" style={{ marginTop: 16 }}>作答证据（下钻）· 每个读数可回溯原始作答</p>
            <Table
              rowKey={(r) => r.date + r.qid}
              size="small"
              columns={evCols}
              dataSource={evidence || []}
              pagination={{ pageSize: 8, showSizeChanger: false, size: "small", showTotal: (t) => `共 ${t} 条` }}
            />
          </>
        ) : loading ? <Skeleton active paragraph={{ rows: 8 }} /> : (
          <Empty description="请选择左侧学生查看个人学情" style={{ margin: "60px 0" }} />
        )}
      </div>
    </div>
  );
}
