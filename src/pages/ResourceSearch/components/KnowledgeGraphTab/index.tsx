import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "@umijs/max";
import { Alert, Button, Card, Empty, Segmented, Spin, Tag, message } from "antd";
import { PartitionOutlined } from "@ant-design/icons";

import KnowledgeGraph from "@/pages/TeacherProfile/components/KnowledgeGraph";
import "./index.less";

/** 模块级缓存：同年级图谱数据为静态目录，Tab 反复切换不再重复拉取（force 刷新可清） */
const graphCache = new Map<string, any>();
const fetchGraph = async (grade: string): Promise<any> => {
  if (graphCache.has(grade)) return graphCache.get(grade);
  const q = grade && grade !== "all" ? `?grade=${grade}` : "";
  const r = await fetch(`/api/teacher/resource/kgraph${q}`, { signal: AbortSignal.timeout(8000) });
  const j = await r.json();
  if (j?.code !== 200) throw new Error(j?.msg || "图谱数据加载失败");
  graphCache.set(grade, j.data);
  return j.data;
};

/** 六大素养主色（与智能筛选徽章同色系） */
const LIT_COLOR: Record<string, string> = {
  数学抽象: "#2563eb",
  逻辑推理: "#7c3aed",
  数学建模: "#db2777",
  直观想象: "#ea580c",
  数学运算: "#0e9265",
  数据分析: "#52607a",
};
const LEVEL_COLOR: Record<string, string> = {
  L1: "#52607a", L2: "#2563eb", L3: "#7c3aed", L4: "#db2777",
};

/**
 * v2.0-K1 资源平台「知识图谱」Tab（轻量版）：
 * 全学段知识目录图谱（素养着色 + L1-L4 分层）+ 节点点击解释
 * （定位/先修后继/教学提示，走 /api/teacher/resource/kgraph/explain）。
 * 详细交互（章节树联动、掌握度着色等）待产品后续讨论后增强。
 */
export default function KnowledgeGraphTab() {
  const dispatch = useDispatch();
  const [grade, setGrade] = useState<string>("all");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [node, setNode] = useState<string | null>(null);
  const [explain, setExplain] = useState<any>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const explainRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setData(null);
    setNode(null);
    setExplain(null);
    setExplainLoading(false);
    explainRequest.current?.abort();
    fetchGraph(grade)
      .then((d) => { if (active) setData(d); })
      .catch((e) => { if (active) setError(`知识图谱加载失败：${e?.message || "网络异常"}`); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; explainRequest.current?.abort(); };
  }, [grade, retry]);

  // v2.0-I：注册 AI 助手图谱上下文（图谱统计 + 图谱专属快捷指令；卸载注销）
  useEffect(() => {
    if (!data?.stats) return;
    dispatch({
      type: "assistantModel/setPageContext",
      payload: {
        route: "/source",
        title: "资源平台 · 知识图谱",
        summary: `学科知识图谱（目录版）：${data.stats.n_nodes} 个知识点、${data.stats.n_edges} 条关联，覆盖 ${data.stats.grades?.join(" / ")}；节点按主素养着色、外环为课标能力等级 L1~L4，可按年级切换；点击节点查看解释（定位/先修后继/教学提示）。`,
        data: {
          graphKind: "catalog",
          quick: [
            { label: "图谱怎么看？", query: "这个图谱怎么看" },
            { label: "解释「二次根式」", query: "解释一下二次根式" },
            { label: "解释「一元二次方程」", query: "解释一下一元二次方程" },
          ],
        },
      },
    });
    return () => { dispatch({ type: "assistantModel/setPageContext", payload: null }); };
  }, [data?.stats]);

  const onNodeClick = useCallback((id: string) => {
    explainRequest.current?.abort();
    const controller = new AbortController();
    explainRequest.current = controller;
    const timeout = setTimeout(() => controller.abort(), 8000);
    setNode(id);
    setExplain(null);
    setExplainLoading(true);
    fetch(`/api/teacher/resource/kgraph/explain?node=${encodeURIComponent(id)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => { if (!controller.signal.aborted && d.code === 200) setExplain(d.data); })
      .catch((e) => { if (!controller.signal.aborted) message.error(`解释获取失败：${e?.message || "网络异常"}`); })
      .finally(() => {
        clearTimeout(timeout);
        if (explainRequest.current === controller) setExplainLoading(false);
      });
  }, []);

  const graph = useMemo(() => data && {
    nodes: (Array.isArray(data.nodes) ? data.nodes : []).filter((n: any) => n?.id).map((n: any) => ({
      id: n.id,
      chapter: n.chapter,
      layer: n.layer,
      level: n.level,
      literacy: n.literacy,
      gradeName: n.grade_name,
      // 目录模式：按章内序给轻微大小差异，颜色 = 主素养
      n: 14 + (n.layer ?? 0) * 3,
      p: 0,
      weak: false,
      nodata: false,
      fill: LIT_COLOR[n.literacy] || "#8fa3b5",
    })),
    edges: data.edges || [],
  }, [data]);

  return (
    <div className="kg_tab">
      <Card
        className="kg_tab_main"
        title={<><PartitionOutlined /> 学科知识图谱 · 初中数学</>}
        extra={
          <Segmented
            size="small"
            value={grade}
            onChange={(v) => setGrade(v as string)}
            options={[
              { label: "全部", value: "all" },
              { label: "七年级", value: "g7" },
              { label: "八年级", value: "g8" },
              { label: "九年级", value: "g9" },
            ]}
          />
        }
      >
        <Spin spinning={loading}>
          {error ? <Alert type="error" showIcon message={error} action={<Button onClick={() => setRetry(v => v + 1)}>重试</Button>} /> : graph?.nodes?.length ? (
            <KnowledgeGraph graph={graph} variant="catalog" height={560} onNodeClick={onNodeClick} />
          ) : !loading ? (
            <Empty description="暂无图谱数据" style={{ margin: "80px 0" }} />
          ) : <div style={{ height: 560 }} aria-label="正在加载知识图谱" />}
        </Spin>
        {data?.stats ? (
          <p className="kg_tab_note">
            {data.stats.n_nodes} 个知识点 · {data.stats.n_edges} 条关联 · {data.stats.grades?.join(" / ")}
            {"　"}点击节点查看解释（定位、先修后继与教学提示）
          </p>
        ) : null}
      </Card>

      {node ? (
        <Card
          className="kg_tab_side"
          title="节点解释"
          extra={<a onClick={() => { explainRequest.current?.abort(); setNode(null); setExplain(null); }}>收起</a>}
        >
          <Spin spinning={explainLoading}>
            {explain ? (
              <>
                <h4 className="kg_ex_name">{explain.node?.id}</h4>
                <div className="kg_ex_meta">
                  <Tag color="blue">{explain.node?.grade_name} · {explain.node?.chapter}</Tag>
                  {explain.node?.level ? (
                    <Tag style={{ color: LEVEL_COLOR[explain.node.level], borderColor: LEVEL_COLOR[explain.node.level] }}>
                      {explain.node?.level_label}
                    </Tag>
                  ) : null}
                  {explain.node?.literacy ? (
                    <Tag style={{ color: LIT_COLOR[explain.node.literacy], borderColor: LIT_COLOR[explain.node.literacy] }}>
                      {explain.node?.literacy}
                    </Tag>
                  ) : null}
                </div>
                <p className="kg_ex_summary">{explain.summary}</p>
                <div className="kg_ex_sec">
                  <span className="kg_ex_label">先修知识</span>
                  <div className="kg_ex_chips">
                    {explain.prerequisites?.length
                      ? explain.prerequisites.map((p: string) => (
                          <a key={p} className="kg_ex_chip" onClick={() => onNodeClick(p)}>{p}</a>
                        ))
                      : <em>本章起始知识点，暂无章内先修</em>}
                  </div>
                </div>
                <div className="kg_ex_sec">
                  <span className="kg_ex_label">后续衔接</span>
                  <div className="kg_ex_chips">
                    {explain.successors?.length
                      ? explain.successors.map((p: string) => (
                          <a key={p} className="kg_ex_chip" onClick={() => onNodeClick(p)}>{p}</a>
                        ))
                      : <em>—</em>}
                  </div>
                </div>
                <div className="kg_ex_sec">
                  <span className="kg_ex_label">同素养关联</span>
                  <div className="kg_ex_chips">
                    {explain.related_same_literacy?.length
                      ? explain.related_same_literacy.map((p: string) => (
                          <a key={p} className="kg_ex_chip" onClick={() => onNodeClick(p)}>{p}</a>
                        ))
                      : <em>—</em>}
                  </div>
                </div>
                <div className="kg_ex_tip">💡 {explain.teaching_tip}</div>
              </>
            ) : !explainLoading ? <Empty description="暂无解释" /> : null}
          </Spin>
        </Card>
      ) : null}
    </div>
  );
}
