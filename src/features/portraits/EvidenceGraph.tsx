import { useMemo, useState } from "react";
import { Empty, Select, Button, Tag, Tooltip } from "antd";
import { ReloadOutlined, CommentOutlined } from "@ant-design/icons";
import { history } from "@umijs/max";
import KnowledgeGraph from "@/pages/TeacherProfile/components/KnowledgeGraph";
import {
  DEFAULT_GRAPH_FILTER,
  DIMENSIONS,
  Scope,
  STRENGTHS,
  graphView,
  list,
} from "./domain";
import { ChartBoundary, EvidenceList } from "./PortraitOverview";
import "./style.less";

export default function EvidenceGraph({
  data,
  scope,
  classId,
}: {
  data: any;
  scope: Scope;
  classId: string;
}) {
  const [filter, setFilter] = useState(DEFAULT_GRAPH_FILTER);
  const [selected, setSelected] = useState("");
  const view = useMemo(
    () => graphView(data, scope, filter),
    [data, scope, filter],
  );
  const node = view.nodes.find((n) => n.node_id === selected) || view.nodes[0];
  const graph = useMemo(
    () => ({
      nodes: view.nodes.map((n) => ({
        id: n.name,
        chapter: n.chapter,
        level: n.level,
        p: n.mastery,
        n: n.sample_count,
        nodata: n.mastery == null,
        weak: n.mastery_band === "待巩固",
        fill:
          n.mastery == null
            ? "#9da4ae"
            : n.mastery < 50
              ? "#d95762"
              : n.mastery < 71
                ? "#6294c8"
                : "#329c80",
      })),
      edges: view.edges.map((e) => ({
        src: view.nodes.find((n) => n.node_id === e.source)?.name,
        tgt: view.nodes.find((n) => n.node_id === e.target)?.name,
        kind: e.relation_type,
      })),
    }),
    [view],
  );
  const change = (key: string, value: string) => {
    setFilter((f) => ({ ...f, [key]: value || "" }));
    setSelected("");
  };
  return (
    <section className="evidence-graph" aria-label="画像证据图谱">
      <div className="portrait-heading">
        <h3>知识图谱与证据</h3>
        <span>{view.nodes.length} 个知识点</span>
      </div>
      <div className="evidence-filters">
        <label>
          关联维度
          <Select
            aria-label="关联维度"
            value={filter.dimension}
            options={DIMENSIONS.map((d) => ({
              value: d.key,
              label: d.name.replace("画像", ""),
            }))}
            onChange={(v) => change("dimension", v)}
          />
        </label>
        <label>
          掌握状态
          <Select
            aria-label="掌握状态"
            value={filter.mastery || undefined}
            allowClear
            placeholder="全部状态"
            options={["待巩固", "练习中", "较熟练", "已掌握", "证据不足"].map(
              (value) => ({ value, label: value }),
            )}
            onChange={(v) => change("mastery", v)}
          />
        </label>
        <label>
          证据强度
          <Select
            aria-label="证据强度"
            value={filter.strength || undefined}
            allowClear
            placeholder="全部强度"
            options={Object.entries(STRENGTHS).map(([value, label]) => ({
              value,
              label,
            }))}
            onChange={(v) => change("strength", v)}
          />
        </label>
        <label className="evidence-goal">
          学习目标
          <Select
            aria-label="学习目标"
            value={filter.goal || undefined}
            allowClear
            placeholder="全部目标"
            options={list(data?.graph?.filters?.goals).map((g) => ({
              value: g.goal_id,
              label: g.name,
            }))}
            onChange={(v) => change("goal", v)}
          />
        </label>
        <Tooltip title="重置图谱筛选">
          <Button
            aria-label="重置图谱筛选"
            icon={<ReloadOutlined />}
            onClick={() => {
              setFilter(DEFAULT_GRAPH_FILTER);
              setSelected("");
            }}
          />
        </Tooltip>
      </div>
      <p className="portrait-scope">
        {view.complete
          ? "显示当前快照内的知识点及其关联证据。"
          : "仅显示当前时间与来源条件命中的证据；掌握度等待完整数据更新。"}
        {filter.dimension !== "knowledge" &&
          " 当前展示与所选维度关联的知识点，分数仍为知识掌握度。"}
      </p>
      {view.nodes.length ? (
        <>
          <div className="evidence-graph-body">
            <div className="evidence-canvas">
              <ChartBoundary>
                <KnowledgeGraph
                  graph={graph as any}
                  height={470}
                  onNodeClick={(name) =>
                    setSelected(
                      view.nodes.find((n) => n.name === name)?.node_id || "",
                    )
                  }
                />
              </ChartBoundary>
            </div>
            <aside className="evidence-node" aria-label="节点证据">
              <h4>{node.name}</h4>
              <Tag>{node.mastery_band}</Tag>
              <Tag>{STRENGTHS[node.evidence_strength] || "未标注"}</Tag>
              <p className="evidence-node-score">
                {node.mastery ?? "--"}
                <small> / 100</small>
              </p>
              <p>{node.explanation}</p>
              {node.evidence_strength === "stale" && (
                <p className="portrait-warning">久未作答，读数可能滞后。</p>
              )}
              {node.evidence_strength === "low_sample" && (
                <p className="portrait-warning">
                  证据不足，不宜直接判断为薄弱。
                </p>
              )}
              <EvidenceList evidence={node.evidence.slice(0, 3)} />
              {node.complete &&
              node.evidence.length > 0 &&
              node.explanations.find((e: any) => e.suggestion)?.suggestion ? (
                <p className="portrait-suggestion">
                  {node.explanations.find((e: any) => e.suggestion).suggestion}
                </p>
              ) : null}
              <Button
                icon={<CommentOutlined />}
                onClick={() =>
                  history.push({
                    pathname: "/school-research",
                    search: new URLSearchParams({
                      knowledge: node.node_id,
                      class_id: classId,
                    }).toString(),
                  })
                }
              >
                相关教研
              </Button>
            </aside>
          </div>
          <div className="evidence-node-list" aria-label="知识点列表">
            {view.nodes.map((n) => (
              <button
                type="button"
                key={n.node_id}
                aria-pressed={n.node_id === node.node_id}
                onClick={() => setSelected(n.node_id)}
              >
                {n.name}
                <span>{n.mastery ?? "--"}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <Empty
          description="当前筛选条件下暂无匹配证据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </section>
  );
}
