import { Button, Empty, Skeleton, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined, RobotOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";

import PortraitOverview from "@/features/portraits/PortraitOverview";
import EvidenceGraph from "@/features/portraits/EvidenceGraph";
import ScopeFilters from "@/features/portraits/ScopeFilters";
import type { Scope } from "@/features/portraits/domain";
import MarkdownRender from "@/components/MarkdownRender";
import type { Suggestion } from "@/components/SuggestionCards";

/** 掌握度分档着色（Figma）：≥85 成功 / 71-85 主色 / 51-70 浅主色 / <51 报错 */
const masteryColor = (v?: number | null) =>
  v == null ? "#67696E" : v >= 85 ? "#17BE6A" : v >= 71 ? "#1C6CFF" : v >= 51 ? "#71A4FF" : "#F63232";
const BAND_DOT: Record<string, string> = {
  待巩固: "#F63232", 练习中: "#8EB6FE", 较熟练: "#1C6CFF", 已掌握: "#17BE6A",
};

/**
 * G5 个人学情整页面板（Figma 个人学情稿范式）：
 * KPI 三格渐变条 + 知识图谱（L1-L4 统计卡 + 图）+ 素养掌握雷达 + 能力等级三列 + 掌握明细/作答证据表。
 * 数据获取由父组件 PersonalAnalysis 负责。
 */
export default function StudentProfilePanel({
  portrait, scope, classId, onSources,
  detail,
  evidence,
  suggestions,
  loading,
  sources,
  dateRange,
  onDateRange,
  onOpenAssistant,
  onBack,
}: {
  portrait: any; scope: Scope; classId: string; onSources: (values: string[]) => void;
  detail: any;
  evidence: any[];
  suggestions?: Suggestion[];
  loading?: boolean;
  sources: string[];
  dateRange: [Dayjs | null, Dayjs | null];
  onDateRange: (vals: [Dayjs | null, Dayjs | null]) => void;
  onOpenAssistant: () => void;
  onBack: () => void;
}) {
  const cellCols: ColumnsType<any> = [
    { title: "知识点", dataIndex: "cluster" },
    {
      title: "状态", dataIndex: "band", width: 110,
      render: (t: string) => (
        <span className="pa_band"><i style={{ background: BAND_DOT[t] || "#999" }} />{t || "—"}</span>
      ),
    },
    {
      title: "掌握度", dataIndex: "p", width: 90, align: "right",
      render: (t: number, r: any) =>
        r.n >= 3 ? <b style={{ fontWeight: 500 }}>{t}%</b> : <Tooltip title={`仅 ${r.n} 题样本（门槛 3 题）`}><span className="g-chip g-chip--warn">证据不足</span></Tooltip>,
    },
  ];

  const evCols: ColumnsType<any> = [
    { title: "日期", dataIndex: "date", width: 104 },
    { title: "来源", dataIndex: "source", width: 90 },
    {
      title: "题目", dataIndex: "stem",
      render: (t: string) => (
        <div className="teacher_profile_stem">
          <MarkdownRender>{t}</MarkdownRender>
        </div>
      ),
    },
    {
      title: "对错", dataIndex: "correct", width: 64,
      render: (t: boolean) => <span style={{ color: t ? "#17BE6A" : "#F63232" }}>{t ? "✓" : "✗"}</span>,
    },
  ];

  // 能力等级三列：按列均分（Figma：3 列知识点行，名称 + Lx | 掌握度%）
  const levels: any[] = detail?.levels || [];
  const perCol = Math.ceil(levels.length / 3) || 1;
  const lvCols = [levels.slice(0, perCol), levels.slice(perCol, perCol * 2), levels.slice(perCol * 2)].filter((c) => c.length);

  return (
    <div className="pa_panel portrait-personal-panel">
      <div className="pa_panel_head">
        <div className="pa_panel_title">
          <span className="pa_panel_name">{detail ? `${detail.name}的个人学情（${detail.display_id}）` : "个人学情"}</span>
        </div>
        <Button size="small" icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回班级学情
        </Button>
      </div>

      {/* ===== 筛选栏：时间窗（预设按钮组）+ 学情来源（口径同班级学情）===== */}
      <div className="pa_filter">
        <ScopeFilters sources={sources} dateRange={dateRange} onSources={onSources} onDateRange={onDateRange} />
      </div>

      <div aria-busy={!!loading}>
        {detail ? (
          <>
            {/* ===== KPI 三格渐变条（Figma 范式）===== */}
            <div className="ov_strip pa_kpi_strip">
              <div className="ov_cell">
                <b className="ov_value">{detail.n_events}</b>
                <span className="ov_label">学情事件</span>
              </div>
              <i className="ov_sep" />
              <div className="ov_cell">
                <b className="ov_value">{detail.weak_cnt}</b>
                <span className="ov_label">待巩固知识点</span>
              </div>
              <i className="ov_sep" />
              <div className="ov_cell">
                <b className="ov_value">{detail.due_cnt}</b>
                <span className="ov_label">遗忘到期</span>
              </div>
            </div>
            {detail.cold_start ? <div className="teacher_profile_cold_tip">⏳ {detail.cold_start[1]}</div> : null}
            <PortraitOverview data={portrait.data} scope={scope} loading={portrait.loading}
              error={portrait.error} onRetry={portrait.retry} />
            <EvidenceGraph data={portrait.data} scope={scope} classId={classId} />

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



            {/* ===== 能力等级：三列知识点行 ===== */}
            {levels.length ? (
              <section className="pa_sec">
                <div className="pa_sec_head"><h4>能力等级</h4></div>
                <div className="pa_ab_cols">
                  {lvCols.map((col, ci) => (
                    <div key={ci} className="pa_ab_col">
                      {col.map((l: any) => (
                        <div key={l.cluster} className="pa_ab_row">
                          <span className="pa_ab_name" title={l.cluster}>{l.cluster}</span>
                          <b className="pa_ab_lv">{l.level}</b>
                          <i className="pa_ab_sep" />
                          <em className="pa_ab_p" style={{ color: masteryColor(l.p) }}>{l.p}%</em>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* ===== 知识点掌握明细 ===== */}
            <section className="pa_sec">
              <div className="pa_sec_head"><h4>知识点掌握明细</h4></div>
              <Table
                className="pa_table"
                rowKey="cluster"
                size="middle"
                columns={cellCols}
                dataSource={detail.cells || []}
                pagination={{ pageSize: 10, showSizeChanger: false, size: "small", showTotal: (t) => `共 ${t} 个知识点` }}
              />
            </section>

            {/* ===== 作答证据（下钻）：每个读数可回溯原始作答 ===== */}
            <section className="pa_sec">
              <div className="pa_sec_head"><h4>作答证据</h4></div>
              <Table
                className="pa_table"
                rowKey={(r) => r.date + r.qid}
                size="middle"
                columns={evCols}
                dataSource={evidence || []}
                pagination={{ pageSize: 10, showSizeChanger: false, size: "small", showTotal: (t) => `共 ${t} 条` }}
              />
            </section>
          </>
        ) : loading ? <Skeleton active paragraph={{ rows: 8 }} /> : (
          <Empty description="请选择左侧学生查看个人学情" style={{ margin: "60px 0" }} />
        )}
      </div>
    </div>
  );
}
