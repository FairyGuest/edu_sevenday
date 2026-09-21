import { useMemo, useState, type CSSProperties } from "react";
import { Alert, Tag, Tooltip } from "antd";
import {
  ArrowRightOutlined,
  DownOutlined,
  FileTextOutlined,
  AuditOutlined,
  CommentOutlined,
  RobotOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import type { Scope } from "./domain";

/**
 * 画像生成过程（正向链路）：证据(L1) → 观测(L2) → 维度(L3) → 画像(L4)。
 * 与「查看依据」（反向溯源）互补：这里回答"这些读数是怎么从原始证据算出来的"。
 * 数据来自 /api/teacher/portraits 的 pipeline 字段（原子观测层真实聚合，非摆设数字）。
 */
const STAGE_META = [
  { key: "l1", title: "① 原始证据", desc: "作业/考试/练习等作答事件入库打标" },
  {
    key: "l2",
    title: "② 观测聚合",
    desc: "逐条映射到指标与知识点：k/n、样本量",
  },
  { key: "l3", title: "③ 维度计算", desc: "指标按维度上卷：100×Σ得分/Σ满分" },
  { key: "l4", title: "④ 画像组装", desc: "四维读数成雷达，附快照核对" },
];

const SOURCE_ORDER = [
  "作业记录",
  "考试记录",
  "课堂互动",
  "人机交互",
  "自主练习",
];

const SOURCE_STYLE = [
  { icon: <FileTextOutlined />, color: "#1c6cdd" },
  { icon: <AuditOutlined />, color: "#6879bf" },
  { icon: <CommentOutlined />, color: "#209c90" },
  { icon: <RobotOutlined />, color: "#9a70b8" },
  { icon: <ReadOutlined />, color: "#c69138" },
];

const SOURCE_PIPE: Record<
  string,
  {
    raw: string;
    transform: string;
    metrics: string;
    dimensions: string[];
  }
> = {
  作业记录: {
    raw: "题目作答、得分、错题、提交时间",
    transform: "按知识点、题型、错因与分层任务打标，剔除无效提交",
    metrics: "正确率、订正率、薄弱知识点命中、完成稳定性",
    dimensions: ["知识点画像", "能力画像", "学习过程表现画像"],
  },
  考试记录: {
    raw: "试卷小题、双向细目表、标准分、班级分布",
    transform: "按考查目标拆到知识点与能力等级，并做同卷标准化",
    metrics: "掌握度、班均差、易错题型、阶段性波动",
    dimensions: ["知识点画像", "能力画像", "素养画像"],
  },
  课堂互动: {
    raw: "抢答、点名、讨论、随堂反馈与教师标注",
    transform: "把互动行为转换成参与、表达、倾听、协作等过程指标",
    metrics: "参与频次、表达质量、课堂即时正确率、协作表现",
    dimensions: ["素养画像", "学习过程表现画像"],
  },
  人机交互: {
    raw: "AI 问答轮次、追问、提示使用、生成式表达",
    transform: "识别求助类型、迁移表达与自我修正路径",
    metrics: "提示依赖度、纠错成功率、解释完整度、迁移尝试",
    dimensions: ["能力画像", "素养画像", "学习过程表现画像"],
  },
  自主练习: {
    raw: "自主启动、练习时长、重做记录、目标卡完成",
    transform: "按学习策略与持续投入归因，合并到近期学习轨迹",
    metrics: "主动练习量、坚持度、重做提升、目标达成率",
    dimensions: ["知识点画像", "素养画像", "学习过程表现画像"],
  },
};

export default function PipelineFlow({
  pipeline,
  scope,
}: {
  pipeline: any;
  scope?: Scope;
}) {
  const [open, setOpen] = useState(true);
  const [activeSource, setActiveSource] = useState(SOURCE_ORDER[0]);
  const l1 = pipeline?.l1_evidence || {},
    l2 = pipeline?.l2_observation || {},
    l3 = pipeline?.l3_dimension || {},
    l4 = pipeline?.l4_profile || {};
  const sourceStats = useMemo(() => {
    const map = new Map<string, any>(
      (l1.sources || []).map((s: any) => [s.source_name || s.source, s]),
    );
    return SOURCE_ORDER.map((name) => {
      const hit = map.get(name) || {};
      return {
        name,
        events: hit.events || 0,
        students: hit.students || 0,
        share: hit.share || 0,
        ...SOURCE_PIPE[name],
      };
    });
  }, [l1.sources]);
  const selectedSource =
    sourceStats.find((s) => s.name === activeSource) || sourceStats[0];
  const sourcePipeline = pipeline?.source_breakdown?.[selectedSource.name];
  const selectedSamples = (
    sourcePipeline?.l1_evidence?.sample ||
    l1.sample ||
    []
  )
    .filter(
      (e: any) =>
        !selectedSource?.name || e.source_name === selectedSource.name,
    )
    .slice(0, 2);
  if (!pipeline) return null;
  const dimColor = (v: number | null) =>
    v == null
      ? "#8a93ab"
      : v >= 86
        ? "#0e9265"
        : v >= 71
          ? "#5c9ded"
          : v >= 51
            ? "#e0a05e"
            : "#e06666";

  return (
    <div className="pf_wrap">
      <button
        type="button"
        className="pf_head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="pf_title">数据来源与画像生成</span>
        <span className="pf_chain">
          证据 {l1.total_events ?? 0} 条
          <ArrowRightOutlined /> 观测 {l2.metrics?.length ?? 0} 指标
          <ArrowRightOutlined /> 维度 {l3.dimensions?.length ?? 0} 项
          <ArrowRightOutlined /> 四维画像
        </span>
        <span className="pf_hint">
          统计窗口 {l1.window?.start_date} 至 {l1.window?.end_date}
        </span>
        <DownOutlined className={"pf_arrow" + (open ? " pf_arrow--up" : "")} />
      </button>

      {open && (
        <div className="pf_body">
          <div className="pf_source_board">
            <div className="pf_source_intro">
              <strong>学习证据</strong>
              <span>
                覆盖 {l1.total_students ?? 0} 名学生 · 共 {l1.total_events ?? 0}{" "}
                条有效记录
              </span>
            </div>
            <div className="pf_source_tabs">
              {sourceStats.map((s, index) => (
                <button
                  key={s.name}
                  type="button"
                  className={`pf_source_tab${activeSource === s.name ? " is-active" : ""}`}
                  onClick={() => setActiveSource(s.name)}
                  aria-pressed={activeSource === s.name}
                  style={
                    {
                      "--source-color": SOURCE_STYLE[index].color,
                    } as CSSProperties
                  }
                >
                  <span className="pf_source_name">
                    {SOURCE_STYLE[index].icon}
                    {s.name}
                  </span>
                  <b>
                    {s.events}
                    <small> 条记录</small>
                  </b>
                  <em>
                    占比 {s.share}% · {s.students} 人
                  </em>
                  <i className="pf_source_meter">
                    <i style={{ width: `${Math.min(100, s.share)}%` }} />
                  </i>
                </button>
              ))}
            </div>
            <div className="pf_transform" key={activeSource}>
              <div>
                <span>
                  <i>01</i>采集内容
                </span>
                <strong>{selectedSource.raw}</strong>
              </div>
              <ArrowRightOutlined />
              <div>
                <span>
                  <i>02</i>变换规则
                </span>
                <strong>{selectedSource.transform}</strong>
              </div>
              <ArrowRightOutlined />
              <div>
                <span>
                  <i>03</i>形成统计
                </span>
                <strong>{selectedSource.metrics}</strong>
              </div>
              <ArrowRightOutlined />
              <div>
                <span>
                  <i>04</i>汇入画像
                </span>
                <p>
                  {selectedSource.dimensions.map((d) => (
                    <Tag key={d}>{d}</Tag>
                  ))}
                </p>
              </div>
            </div>
            <div
              className="pf_source_evidence"
              key={`${activeSource}-evidence`}
            >
              <section>
                <h4>{activeSource} · 记录节选</h4>
                {selectedSamples.length ? (
                  selectedSamples.map((e: any, i: number) => (
                    <article key={i}>
                      <time>
                        {e.date}
                        {e.activity_name ? ` · ${e.activity_name}` : ""}
                      </time>
                      <p>{e.stem || e.answer || "暂无作答摘要"}</p>
                    </article>
                  ))
                ) : (
                  <p className="pf_no_data">当前窗口暂无该来源的记录节选</p>
                )}
              </section>
              <section>
                <h4>本来源形成的指标</h4>
                {sourcePipeline?.l2_observation?.metrics?.length ? (
                  sourcePipeline.l2_observation.metrics
                    .slice(0, 3)
                    .map((m: any) => (
                      <div key={m.key} className="pf_source_metric">
                        <span>
                          {m.name}
                          <small>
                            {m.n_events} 条证据 · {m.earned} / {m.possible}
                          </small>
                        </span>
                        <b>
                          {m.value ?? "—"}
                          <small> / 100</small>
                        </b>
                      </div>
                    ))
                ) : (
                  <p className="pf_no_data">当前来源暂无可计算指标</p>
                )}
                <p className="pf_no_data">
                  指标值 = 100 × 得分合计 / 满分合计；完整画像合并全部来源。
                </p>
              </section>
            </div>
          </div>

          <details className="pf_calculation">
            <summary>全部来源的汇总计算与快照核对</summary>
            <div className="pf_stages">
              {/* L1 证据 */}
              <div className="pf_stage">
                <div className="pf_stage_title">
                  {STAGE_META[0].title}
                  <span>{STAGE_META[0].desc}</span>
                </div>
                <div className="pf_stage_body">
                  <div className="pf_line">
                    窗口 {l1.window?.start_date} ~ {l1.window?.end_date} ·{" "}
                    {l1.total_students} 名学生 · {l1.total_events} 条事件
                  </div>
                  <div className="pf_chips">
                    {(l1.sources || []).map((s: any) => (
                      <Tooltip
                        key={s.source}
                        title={`${s.events} 条 · ${s.students} 人`}
                      >
                        <Tag className="pf_chip">
                          {s.source_name} {s.share}%
                        </Tag>
                      </Tooltip>
                    ))}
                  </div>
                  {(l1.sample || []).slice(0, 2).map((e: any, i: number) => (
                    <div key={i} className="pf_sample">
                      <span className="pf_sample_date">
                        {e.date} · {e.source_name}
                      </span>
                      <span className="pf_sample_text">
                        {(e.stem || e.answer || "").slice(0, 40)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <ArrowRightOutlined className="pf_flow" />

              {/* L2 观测 */}
              <div className="pf_stage">
                <div className="pf_stage_title">
                  {STAGE_META[1].title}
                  <span>
                    {STAGE_META[1].desc}｜口径 {l2.metrics?.[0]?.formula}
                  </span>
                </div>
                <div className="pf_stage_body">
                  {(l2.metrics || []).slice(0, 4).map((m: any) => (
                    <div key={m.key} className="pf_obs">
                      <span className="pf_obs_name" title={m.name}>
                        {m.name}
                      </span>
                      <span className="pf_obs_bar">
                        <i
                          style={{
                            width: `${m.value ?? 0}%`,
                            background: dimColor(m.value),
                          }}
                        />
                      </span>
                      <span className="pf_obs_val">
                        {m.value ?? "—"}
                        <em>({m.n_events}事)</em>
                      </span>
                    </div>
                  ))}
                  <div className="pf_more">
                    知识点观测 Top：
                    {(l2.knowledge || [])
                      .slice(0, 3)
                      .map((k) => `${k.name} ${k.value ?? "—"}%`)
                      .join("｜")}
                  </div>
                </div>
              </div>
              <ArrowRightOutlined className="pf_flow" />

              {/* L3 维度 */}
              <div className="pf_stage">
                <div className="pf_stage_title">
                  {STAGE_META[2].title}
                  <span>{STAGE_META[2].desc}</span>
                </div>
                <div className="pf_stage_body">
                  <div className="pf_formula">{l3.formula}</div>
                  {(l3.dimensions || []).map((d) => (
                    <div key={d.key} className="pf_obs">
                      <span className="pf_obs_name">
                        {d.name}维
                        <span className="pf_obs_sub">{d.n_metrics} 指标</span>
                      </span>
                      <span className="pf_obs_bar">
                        <i
                          style={{
                            width: `${d.value ?? 0}%`,
                            background: dimColor(d.value),
                          }}
                        />
                      </span>
                      <span className="pf_obs_val">{d.value ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ArrowRightOutlined className="pf_flow" />

              {/* L4 画像 */}
              <div className="pf_stage pf_stage--final">
                <div className="pf_stage_title">
                  {STAGE_META[3].title}
                  <span>{STAGE_META[3].desc}</span>
                </div>
                <div className="pf_stage_body">
                  {(l4.dimensions || []).map((d) => (
                    <div key={d.key} className="pf_dim">
                      <span className="pf_dim_name">{d.name}</span>
                      <b
                        className="pf_dim_val"
                        style={{ color: dimColor(d.value) }}
                      >
                        {d.value ?? "—"}
                      </b>
                      {d.snapshot_value != null && (
                        <Tooltip
                          title={`独立快照值 ${d.snapshot_value}${d.gap != null ? `，抽样偏差 ${d.gap > 0 ? "+" : ""}${d.gap}` : ""}`}
                        >
                          <span className="pf_dim_snap">
                            快照 {d.snapshot_value}
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  ))}
                  <div className="pf_more">{l4.note}</div>
                </div>
              </div>
            </div>
            <Alert
              className="pf_caliber"
              type="info"
              showIcon
              message={pipeline.caliber}
            />
          </details>
        </div>
      )}
    </div>
  );
}
