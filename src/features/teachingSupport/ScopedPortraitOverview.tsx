import { useState } from "react";
import { Button, Empty, Segmented, Tag, Tooltip } from "antd";
import {
  ApartmentOutlined,
  BulbOutlined,
  CompassOutlined,
  FieldTimeOutlined,
  RightOutlined,
} from "@ant-design/icons";
import ProfileRadar from "@/features/portraits/ProfileRadar";
import EvidenceGraph from "@/features/portraits/EvidenceGraph";
import { ChartBoundary } from "@/features/portraits/PortraitOverview";
import { DIMENSIONS } from "@/features/portraits/domain";
import ClusterTable from "@/pages/TeacherProfile/components/ClusterTable";
import ProfileCharts from "@/pages/TeacherProfile/components/ProfileCharts";
import "@/pages/TeacherProfile/index.less";
import "@/features/portraits/style.less";
import "./portrait.less";

const icons = {
  knowledge: ApartmentOutlined,
  ability: BulbOutlined,
  literacy: CompassOutlined,
  process: FieldTimeOutlined,
};

export function ScopedKnowledgeGraph({
  data,
  onEvidence,
}: {
  data: any;
  onEvidence: (value: any) => void;
}) {
  return (
    <EvidenceGraph
      data={null}
      scope={data.effective_scope}
      classId={data.effective_scope.class_id}
      currentGraph={data.portrait.graph}
      onEvidence={(n) =>
        onEvidence({ node_id: n.node_id, title: `${n.name} · 任务证据` })
      }
    />
  );
}

export default function ScopedPortraitOverview({
  data,
  onEvidence,
  onIndicator,
  onReference,
  part = "radars",
}: {
  data: any;
  onEvidence: (value: any) => void;
  onIndicator: (value: any) => void;
  onReference: () => void;
  part?: "radars" | "distribution";
}) {
  const [distView, setDistView] = useState("table");
  const portrait = data.portrait;
  if (!portrait) return <Empty description="画像统计待接入" />;
  if (part === "distribution")
    return (
      <div className="teacher_profile_container scoped-portrait-distribution">
        <div className={distView === "table" ? "analysis_row" : ""}>
          <div className="analysis_distribution">
            <div className="ct_header">
              <h3 className="teacher_profile_chart_title">知识点掌握分布</h3>
              <Segmented
                size="small"
                aria-label="知识点分布视图"
                value={distView}
                onChange={(v) => setDistView(String(v))}
                options={[
                  { label: "知识图谱", value: "graph" },
                  { label: "分布表格", value: "table" },
                ]}
              />
            </div>
            {distView === "graph" ? (
              <ScopedKnowledgeGraph data={data} onEvidence={onEvidence} />
            ) : (
              <>
                <div className="ct_legend">
                  {[
                    ["待巩固", "<50%", "#F76964"],
                    ["练习中", "50%-<71%", "#8EB6FE"],
                    ["较熟练", "71%-<86%", "#1C6CFF"],
                    ["已掌握", ">=86%", "#1FD479"],
                  ].map(([label, range, color]) => (
                    <span className="ct_legend_item" key={label}>
                      <i style={{ background: color }} />
                      {label}
                      <em>{range}</em>
                    </span>
                  ))}
                </div>
                <p className="portrait-muted">
                  按有记录学生的任务得分率分组；分档为当前统计口径，不是课标能力等级。
                </p>
                <ClusterTable
                  rows={portrait.cluster_rows}
                  minStudents={1}
                  maxRows={Infinity}
                  onSelect={(r) =>
                    onEvidence({
                      node_id: r.node_id,
                      title: `${r.cluster} · 任务证据`,
                    })
                  }
                />
              </>
            )}
          </div>
          {distView === "table" && (
            <div className="analysis_right">
              <ProfileCharts
                scoped
                trend={portrait.trend}
                sourceMix={data.sources.map((s: any) => ({
                  source: s.name,
                  n: s.count,
                }))}
                weakRanking={portrait.cluster_rows
                  .filter((r: any) => r.weak_n > 0)
                  .sort((a: any, b: any) => b.weak_n - a.weak_n)}
                onDetail={() => onEvidence({})}
              />
            </div>
          )}
        </div>
      </div>
    );
  return (
    <section
      className="portrait-overview scoped-portrait-overview"
      aria-label="四维画像总览"
    >
      <header className="portrait-heading">
        <div className="portrait-heading-title">
          <h3>四维画像</h3>
          <span>
            {data.effective_scope.student_id ? "个人发展概览" : "班级发展概览"}
          </span>
        </div>
        <Tag>
          {portrait.subject_name} ·{" "}
          {portrait.stage === "senior" ? "高中" : "初中"}
        </Tag>
      </header>
      <div className="portrait-grid">
        {DIMENSIONS.map((meta) => {
          const d = portrait.dimensions.find((d: any) => d.key === meta.key);
          const items = d?.items || [];
          const Icon = icons[meta.key];
          const max =
            d?.unit === "%"
              ? 100
              : Math.max(1, ...items.map((i: any) => i.value));
          const height = items.length > 10 ? 310 : 248;
          const select = (item?: any) => {
            if (item?.indicator_id)
              return onIndicator(
                data.indicators.find(
                  (i: any) => i.indicator_id === item.indicator_id,
                ),
              );
            if (meta.key === "literacy" && (!item || !item.evidence_ids.length))
              return onReference();
            const ids = item?.evidence_ids || [
              ...new Set(items.flatMap((i: any) => i.evidence_ids)),
            ];
            onEvidence({
              ...(item?.node_id
                ? { node_id: item.node_id }
                : {
                    ids: ids.length
                      ? ids.join(",")
                      : "__no_matching_evidence__",
                  }),
              title: item?.name || meta.name,
            });
          };
          return (
            <article
              key={meta.key}
              data-dimension={meta.key}
              className="portrait-dimension"
              style={{ "--portrait-color": meta.color } as React.CSSProperties}
            >
              <header>
                <h4>
                  <Icon />
                  {meta.name}
                </h4>
                <Tag>{items.length} 项指标</Tag>
              </header>
              <div className="portrait-score">
                <b>{d?.evidence_count ?? 0}</b>
                <span>条关联记录</span>
                <span className="portrait-comparison">{d?.measure}</span>
              </div>
              <div className="portrait-dimension-body">
                <div
                  className="portrait-radar"
                  data-testid={`radar-${meta.key}`}
                  style={{ height }}
                >
                  {items.length >= 3 ? (
                    <ChartBoundary>
                      <ProfileRadar
                        items={items}
                        color={meta.color}
                        personal={false}
                        max={max}
                        height={height}
                        seriesName={`${d.measure}（${d.unit}）`}
                      />
                    </ChartBoundary>
                  ) : (
                    <div className="portrait-chart-empty">
                      <Icon />
                      <strong>
                        {items.length
                          ? `${items.length} 项有效指标`
                          : "暂无本期观测"}
                      </strong>
                      <span>
                        {items.length
                          ? "按实际任务指标统计"
                          : "等待有效任务记录"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="portrait-metrics">
                  {items.map((item: any) => (
                    <Tooltip
                      key={item.key}
                      title={
                        meta.key === "literacy" && !item.mapping_count
                          ? "本范围尚无教学对应关系，不作能力判断"
                          : `${item.name} · ${d.measure}`
                      }
                    >
                      <button type="button" onClick={() => select(item)}>
                        <span className="portrait-metric-label">
                          {item.name}
                        </span>
                        <b>
                          {item.value}
                          {d.unit}
                        </b>
                        <RightOutlined />
                        <span
                          className="portrait-metric-track"
                          aria-hidden="true"
                        >
                          <i
                            style={{ width: `${(100 * item.value) / max}%` }}
                          />
                        </span>
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>
              <div className="portrait-reason">
                <p>{d?.note}</p>
              </div>
              <footer className="portrait-card-footer">
                <span>
                  {meta.key === "knowledge"
                    ? "当前筛选范围"
                    : "证据分布 · 非能力评分"}
                </span>
                <Button
                  type="link"
                  size="small"
                  icon={<RightOutlined />}
                  onClick={() => select()}
                >
                  查看依据
                </Button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
