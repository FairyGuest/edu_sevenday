import React, { useState } from "react";
import ProfileRadar from "./ProfileRadar";
import PipelineFlow from "./PipelineFlow";
import { Alert, Button, Drawer, Empty, Skeleton, Tag, Tooltip } from "antd";
import {
  ApartmentOutlined,
  BulbOutlined,
  CompassOutlined,
  FieldTimeOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { replacePageQuery } from "@/utils/pageQuery";
import {
  DIMENSIONS,
  Evidence,
  Scope,
  STRENGTHS,
  dimensionView,
  fullSnapshot,
  list,
  score,
  scopeLabel,
} from "./domain";
import "./style.less";

const DIMENSION_ICONS = {
  knowledge: ApartmentOutlined,
  ability: BulbOutlined,
  literacy: CompassOutlined,
  process: FieldTimeOutlined,
};

export class ChartBoundary extends React.Component<
  React.PropsWithChildren,
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <Alert
        type="warning"
        message="图表暂不可用，仍可查看下方指标"
        action={
          <Button size="small" onClick={() => this.setState({ failed: false })}>
            重试
          </Button>
        }
      />
    ) : (
      this.props.children
    );
  }
}

export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  return evidence.length ? (
    <ul className="portrait-evidence">
      {evidence.map((e) => (
        <li key={e.evidence_id}>
          <div>
            <strong>{e.source_name || "未命名记录"}</strong>
            <time>{e.occurred_at}</time>
          </div>
          {e.question_stem && <p>{e.question_stem}</p>}
          <p>
            {e.answer_summary || "暂无记录摘要"}
            {typeof e.score === "number" &&
            typeof e.full_score === "number" &&
            e.full_score > 0 ? (
              <span className="portrait-muted">
                {" "}
                · 得分 {e.score}/{e.full_score}
              </span>
            ) : null}
          </p>
        </li>
      ))}
    </ul>
  ) : (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="当前条件下暂无可追溯的证据摘要"
    />
  );
}

export default function PortraitOverview({
  data,
  scope,
  loading,
  error,
  onRetry,
}: {
  data: any;
  scope: Scope;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}) {
  const [selected, setSelected] = useState<{
    key: string;
    item?: string;
  } | null>(null);
  const personal =
    data?.scope === "student" || data?.snapshot?.scope === "student";
  const snapshot = data?.snapshot;
  const complete = fullSnapshot(snapshot, scope);
  const snapshotWindow = snapshot?.time_window;
  const showSnapshot = () =>
    replacePageQuery({
      start_date: snapshotWindow.start_date,
      end_date: snapshotWindow.end_date,
      sources: list(snapshot.sources).join(","),
    });
  const active = selected ? dimensionView(data, selected.key, scope) : null;
  const activeItem = active?.items.find((i) => i.key === selected?.item);
  const activeExplanations =
    active?.explanations.filter(
      (e) => !selected?.item || e.target_id === selected.item,
    ) || [];
  const activeEvidence = [
    ...new Map(
      activeExplanations
        .flatMap((e) => e.evidence)
        .map((e) => [e.evidence_id, e]),
    ).values(),
  ] as Evidence[];
  return (
    <section
      className="portrait-overview"
      aria-label="四维画像总览"
      aria-busy={loading}
    >
      <header className="portrait-heading">
        <div className="portrait-heading-title">
          <h3>四维画像</h3>
          <span>{personal ? "个人发展概览" : "班级发展概览"}</span>
        </div>
        <div className="portrait-legend">
          <span>
            <i />
            {personal ? "个人表现" : "班级均值"}
          </span>
          {personal && (
            <span>
              <i className="is-comparison" />
              班级均值
            </span>
          )}
        </div>
        <Tooltip title="知识点与能力使用学科证据；素养与学习过程反映阶段性观察，不作为固定人格评价。">
          <Button
            type="text"
            size="small"
            icon={<InfoCircleOutlined />}
            aria-label="画像统计说明"
          />
        </Tooltip>
      </header>
      {error && (
        <Alert
          type="warning"
          showIcon
          message={error}
          action={
            <Button icon={<ReloadOutlined />} size="small" onClick={onRetry}>
              重试
            </Button>
          }
        />
      )}
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          {snapshotWindow && !complete && (
            <div className="portrait-coverage" role="status">
              <FileSearchOutlined />
              <div>
                <strong>当前范围缺少完整统计数据</strong>
                <p>
                  已有快照：{snapshotWindow.start_date} 至{" "}
                  {snapshotWindow.end_date}
                  。下方仅展示本次筛选命中的证据，不以旧分数代替当前表现。
                </p>
              </div>
              <Button
                size="small"
                aria-label="查看已有快照"
                icon={<FieldTimeOutlined />}
                onClick={showSnapshot}
              >
                查看已有快照
              </Button>
            </div>
          )}
          <div className="portrait-period">
            <span>{complete ? "统计快照" : "证据范围"}</span>
            <time>
              {complete ? snapshotWindow.start_date : scope.start_date} 至{" "}
              {complete ? snapshotWindow.end_date : scope.end_date}
            </time>
            <Tooltip
              title={(complete ? list(snapshot.sources) : scope.sources).join(
                "、",
              )}
            >
              <span className="portrait-period-sources">
                {(complete ? list(snapshot.sources) : scope.sources).length}{" "}
                类数据来源
              </span>
            </Tooltip>
          </div>
          {/* 正向链路：证据 → 观测 → 维度 → 画像（与「查看依据」反向溯源互补） */}
          <PipelineFlow pipeline={data?.pipeline} scope={scope} />
          <div className="portrait-grid">
            {DIMENSIONS.map((meta) => {
              const view = dimensionView(data, meta.key, scope);
              const d = view.dimension;
              const value = view.complete ? score(d?.score) : null;
              const avg = view.complete ? score(d?.class_avg) : null;
              const valid = view.items.filter((i) => score(i.value) !== null);
              const hasChart = view.complete && valid.length >= 3;
              const weak = [...view.items]
                .filter((i) => score(i.value) !== null)
                .sort((a, b) => a.value - b.value)[0];
              const strength = d?.evidence_strength || "unknown";
              const Icon = DIMENSION_ICONS[meta.key];
              const focus = weak && score(weak.value)! < 71 ? weak : null;
              const compare =
                value !== null && avg !== null
                  ? value === avg
                    ? "与班均持平"
                    : `${value > avg ? "高于" : "低于"}班均 ${Math.abs(value - avg)} 分`
                  : "";
              return (
                <article
                  className={`portrait-dimension${hasChart ? "" : " is-incomplete"}`}
                  key={meta.key}
                  data-dimension={meta.key}
                  style={
                    { "--portrait-color": meta.color } as React.CSSProperties
                  }
                >
                  <header>
                    <h4>
                      <Icon />
                      {meta.name}
                    </h4>
                    <Tag>
                      {view.complete && d
                        ? STRENGTHS[strength] || "未标注"
                        : "待补充"}
                    </Tag>
                  </header>
                  <div className="portrait-score">
                    <b>{value ?? "--"}</b>
                    <span>/ 100</span>
                    <span className="portrait-comparison">
                      {compare ||
                        (value !== null ? "阶段性读数" : "暂无本期读数")}
                    </span>
                  </div>
                  <div className="portrait-dimension-body">
                    <div
                      className="portrait-radar"
                      data-testid={"radar-" + meta.key}
                    >
                      {hasChart ? (
                        <ChartBoundary key={snapshot?.snapshot_id + meta.key}>
                          <ProfileRadar
                            items={valid}
                            color={meta.color}
                            personal={personal}
                          />
                        </ChartBoundary>
                      ) : (
                        <div className="portrait-chart-empty">
                          <FileSearchOutlined />
                          <strong>
                            {!d
                              ? "暂无该维度数据"
                              : view.complete
                                ? "有效指标不足"
                                : "尚无本期统计"}
                          </strong>
                          <span>
                            {view.evidence.length
                              ? `${view.evidence.length} 条可追溯证据`
                              : "等待有效观测"}
                          </span>
                        </div>
                      )}
                    </div>
                    {view.items.length > 0 && (
                      <div className="portrait-metrics">
                        {view.items.map((item) => (
                          <button
                            type="button"
                            key={item.key}
                            onClick={() =>
                              setSelected({ key: meta.key, item: item.key })
                            }
                          >
                            <span className="portrait-metric-label">
                              {item.name}
                            </span>
                            <b>
                              {view.complete
                                ? (score(item.value) ?? "--")
                                : "--"}
                            </b>
                            <RightOutlined />
                            <span
                              className="portrait-metric-track"
                              aria-hidden="true"
                            >
                              {view.complete && score(item.value) !== null && (
                                <i style={{ width: `${item.value}%` }} />
                              )}
                              {view.complete &&
                                personal &&
                                score(item.class_avg) !== null && (
                                  <em style={{ left: `${item.class_avg}%` }} />
                                )}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="portrait-reason">
                    {strength === "stale" && view.complete && (
                      <p className="portrait-warning">
                        久未作答，读数可能滞后。
                      </p>
                    )}
                    {strength === "low_sample" && view.complete && (
                      <p className="portrait-warning">
                        证据不足，当前读数仅供参考。
                      </p>
                    )}
                    {view.complete && d && (
                      <div className="portrait-focus">
                        <span>{focus ? "重点关注" : "阶段观察"}</span>
                        <strong>{focus?.name || "整体表现"}</strong>
                      </div>
                    )}
                    <p>
                      {!d
                        ? data?.coverage_note ||
                          "尚未采集该维度，暂不判断表现。"
                        : !view.complete
                          ? `筛选命中 ${view.evidence.length} 条证据摘要；不足以重算完整画像。`
                          : focus?.explanation ||
                            d.explanation ||
                            "快照未提供进一步原因。"}
                    </p>
                  </div>
                  <footer className="portrait-card-footer">
                    <span>
                      {view.complete && d
                        ? `${typeof d.sample_count === "number" ? d.sample_count.toLocaleString("zh-CN") : "--"} 条统计证据`
                        : "统计待更新"}
                      <Tooltip title="证据摘要是统计记录的部分示例，不代表全部样本量。">
                        <small> / {view.evidence.length} 条摘要</small>
                      </Tooltip>
                    </span>
                    <Button
                      type="link"
                      size="small"
                      icon={<RightOutlined />}
                      onClick={() => setSelected({ key: meta.key })}
                    >
                      查看依据
                    </Button>
                  </footer>
                </article>
              );
            })}
          </div>
          <p className="portrait-scope portrait-footnote">
            <InfoCircleOutlined />{" "}
            素养与学习过程反映阶段性观察，不作为固定人格评价。
            {complete && "分数为上述快照的统计值。"}
          </p>
        </>
      )}
      <Drawer
        title={
          activeItem?.name ||
          DIMENSIONS.find((d) => d.key === selected?.key)?.name ||
          "画像依据"
        }
        open={!!selected}
        onClose={() => setSelected(null)}
        width={520}
      >
        <div className="portrait-detail">
          <Tag>{active?.complete ? "完整快照口径" : "筛选证据摘要"}</Tag>
          <p>{scopeLabel(scope)}</p>
          {active?.complete && (
            <p>
              {activeItem?.explanation ||
                active?.dimension?.explanation ||
                "快照未提供详细解释。"}
            </p>
          )}
          {active?.complete &&
            activeEvidence.length > 0 &&
            active?.dimension?.suggestion && (
              <p className="portrait-suggestion">
                {active.dimension.suggestion}
              </p>
            )}
          {activeExplanations
            .filter((e) => e.evidence.length)
            .map((e) => (
              <section key={e.explanation_id}>
                <h4>{active?.complete ? e.conclusion : "匹配的证据"}</h4>
                {active?.complete && (
                  <>
                    <p>{e.reason}</p>
                    <p>{e.evidence_summary}</p>
                  </>
                )}
                <EvidenceList evidence={e.evidence} />
                {active?.complete && e.suggestion && (
                  <p className="portrait-suggestion">{e.suggestion}</p>
                )}
              </section>
            ))}
          {!activeEvidence.length && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无匹配的证据摘要，暂不补充原因或建议"
            />
          )}
        </div>
      </Drawer>
    </section>
  );
}
