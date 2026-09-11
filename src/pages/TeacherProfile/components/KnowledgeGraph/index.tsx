import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY,
  type Simulation, type SimulationLinkDatum, type SimulationNodeDatum,
} from "d3-force";
import { drag } from "d3-drag";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type D3ZoomEvent } from "d3-zoom";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Input, Tooltip } from "antd";

/**
 * 知识点掌握图谱（借鉴 graph4rec ForceGraph 的交互范式）：
 * 力导向布局 + 滚轮缩放/拖拽平移 + 点节点聚焦邻接 + 搜索定位飞行 + 悬停 tooltip。
 * 视觉编码：圆大小=班级人数、颜色=掌握度（红→绿）、红描边=薄弱、层列=章节。
 */

interface GNode extends SimulationNodeDatum {
  id: string; chapter: string; layer: number;
  p: number; n: number; weak: boolean; fill: string;
}
interface GLink extends SimulationLinkDatum<GNode> { kind: string }

interface Props {
  graph?: { nodes: any[]; edges: { src: string; tgt: string; kind: string }[] };
  onNodeClick?: (cluster: string) => void;
}

const HEIGHT = 430;

export default function KnowledgeGraph({ graph, onNodeClick }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeEls = useRef<(SVGGElement | null)[]>([]);
  const edgeEls = useRef<(SVGLineElement | null)[]>([]);
  const labelEls = useRef<(SVGTextElement | null)[]>([]);
  const simRef = useRef<Simulation<GNode, GLink> | null>(null);
  const worldRef = useRef<SVGGElement>(null);
  const viewRef = useRef({ k: 1, x: 0, y: 0 });
  const zoomRef = useRef<any>(null);
  const draggingRef = useRef(false);
  const [width, setWidth] = useState(860);
  const [tip, setTip] = useState<{ x: number; y: number; node: GNode } | null>(null);
  const [viewK, setViewK] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const matchIdx = useRef(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((es) => { for (const e of es) setWidth(Math.max(320, Math.floor(e.contentRect.width))); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const model = useMemo(() => {
    if (!graph) return null;
    const ns: GNode[] = graph.nodes.map((n) => ({
      id: n.id, chapter: n.chapter, layer: n.layer ?? 0,
      p: n.p ?? 50, n: n.n ?? 30, weak: !!n.weak,
      fill: n.fill || "#8fa3b5",
    }));
    const byId = new Map(ns.map((d) => [d.id, d]));
    const ls: GLink[] = graph.edges
      .filter((e) => byId.has(e.src) && byId.has(e.tgt))
      .map((e) => ({ source: e.src, target: e.tgt, kind: e.kind }));
    const adj = new Map<string, Set<string>>();
    for (const e of graph.edges) {
      if (!byId.has(e.src) || !byId.has(e.tgt)) continue;
      (adj.get(e.src) ?? adj.set(e.src, new Set()).get(e.src)!).add(e.tgt);
      (adj.get(e.tgt) ?? adj.set(e.tgt, new Set()).get(e.tgt)!).add(e.src);
    }
    // 层号按全局排序分列
    const layerIdx = [...new Set(ns.map((d) => d.layer))].sort((a, b) => a - b);
    return { ns, ls, byId, adj, layerIdx };
  }, [graph]);

  const layerX = useMemo(() => {
    if (!model) return (l: number) => 0;
    const pad = Math.max(50, Math.min(84, width * 0.07));
    const li = model.layerIdx;
    const span = (li[li.length - 1] ?? 0) - (li[0] ?? 0);
    return (l: number) => (span > 0 ? pad + ((l - li[0]) / span) * (width - 2 * pad) : width / 2);
  }, [model, width]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !model || width < 60) return;
    const { ns, ls } = model;
    const radius = (d: GNode) => 7 + 9 * Math.sqrt(Math.min(d.n, 50) / 50);

    for (const d of ns) {
      d.x = layerX(d.layer) + (Math.random() - 0.5) * 90;
      d.y = HEIGHT / 2 + (Math.random() - 0.5) * HEIGHT * 0.7;
      d.vx = 0; d.vy = 0;
      (d as any).r = radius(d);
    }

    const draw = () => {
      const k = viewRef.current.k;
      for (let i = 0; i < ns.length; i++) {
        const el = nodeEls.current[i];
        if (el) el.setAttribute("transform", `translate(${ns[i].x ?? 0},${ns[i].y ?? 0})`);
        const lb = labelEls.current[i];
        if (lb) {
          lb.setAttribute("x", String((ns[i].x ?? 0) + ((ns[i] as any).r ?? 10) + 4));
          lb.setAttribute("y", String((ns[i].y ?? 0) + 3.5));
          lb.style.display = k >= 1.5 || ((ns[i] as any).r ?? 0) > 12 ? "" : "none";
        }
      }
      for (let i = 0; i < ls.length; i++) {
        const el = edgeEls.current[i];
        if (!el) continue;
        const s = ls[i].source as GNode;
        const t = ls[i].target as GNode;
        el.setAttribute("x1", String(s.x ?? 0)); el.setAttribute("y1", String(s.y ?? 0));
        el.setAttribute("x2", String(t.x ?? 0)); el.setAttribute("y2", String(t.y ?? 0));
      }
    };

    const sim = forceSimulation<GNode>(ns)
      .force("link", forceLink<GNode, GLink>(ls).id((d) => d.id)
        .distance((l) => 46 + (((l.source as GNode).n ?? 30) % 20))
        .strength(0.2))
      .force("charge", forceManyBody<GNode>().strength(-150))
      .force("collide", forceCollide<GNode>((d) => ((d as any).r ?? 10) + 3).iterations(2))
      .force("layerX", forceX<GNode>((d) => layerX(d.layer)).strength(0.09))
      .force("centerY", forceY<GNode>(HEIGHT / 2).strength(0.06))
      .alphaDecay(0.022);
    simRef.current = sim;
    sim.on("tick", draw);
    draw();

    const dragBeh = drag<SVGCircleElement, GNode>()
      .on("start", (event, d) => { draggingRef.current = true; setTip(null); sim.alphaTarget(0.25).restart(); d.fx = event.x; d.fy = event.y; })
      .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on("end", () => { draggingRef.current = false; sim.alphaTarget(0); });
    select(svg).selectAll<SVGCircleElement, GNode>("circle.kg-node").data(ns).call(dragBeh);

    viewRef.current = { k: 1, x: 0, y: 0 };
    const zoomBeh = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 4])
      .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        viewRef.current = { k: event.transform.k, x: event.transform.x, y: event.transform.y };
        setViewK(event.transform.k);
        worldRef.current?.setAttribute("transform", event.transform.toString());
        draw();
      });
    zoomRef.current = zoomBeh;
    select(svg).call(zoomBeh).on("dblclick.zoom", null);

    return () => { sim.on("tick", null); sim.stop(); simRef.current = null; select(svg).on(".zoom", null); };
  }, [model, layerX, width]);

  const resetView = () => {
    const svg = svgRef.current;
    if (!svg) return;
    viewRef.current = { k: 1, x: 0, y: 0 };
    setViewK(1);
    worldRef.current?.setAttribute("transform", "translate(0,0) scale(1)");
    setSelected(null);
  };

  const flyTo = (id: string) => {
    const node = model?.byId.get(id);
    if (!node || !zoomRef.current) return;
    const scale = 1.9;
    const tx = width / 2 - (node.x ?? 0) * scale;
    const ty = HEIGHT / 2 - (node.y ?? 0) * scale;
    const target = zoomIdentity.translate(tx, ty).scale(scale);
    select(svgRef.current).transition().duration(700).call(zoomRef.current.transform, target);
    setSelected(id);
  };

  const locateNext = () => {
    const q = search.trim();
    if (!q || !model) return;
    const hits = model.ns.filter((n) => n.id.includes(q));
    if (!hits.length) return;
    if (matchIdx.current >= hits.length) matchIdx.current = 0;
    flyTo(hits[matchIdx.current].id);
    matchIdx.current = (matchIdx.current + 1) % hits.length;
  };

  const focusSet = useMemo(() => {
    if (!selected || !model) return null;
    const s = new Set<string>([selected]);
    for (const n of model.adj.get(selected) ?? []) s.add(n);
    return s;
  }, [selected, model]);

  const hover = (i: number) => (e: any) => {
    if (draggingRef.current || !model) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    setTip({ x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0), node: model.ns[i] });
  };

  if (!model || !model.ns.length) return null;

  return (
    <div ref={wrapRef} className="kg_wrap">
      <div className="kg_toolbar">
        <span className="kg_hint">圆大小 = 班级人数 · 颜色 = 掌握度（红 → 绿）· 红描边 = 薄弱</span>
        <span className="kg_hint">滚轮缩放 · 拖拽平移 · 点节点聚焦</span>
        <Input
          size="small" allowClear
          prefix={<SearchOutlined style={{ color: "#8a94a8" }} />}
          className="kg_search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") locateNext(); }}
          placeholder="搜索知识点，回车定位"
        />
        <Tooltip title="复位视图"><ReloadOutlined className="kg_reset" onClick={resetView} /></Tooltip>
      </div>
      <svg ref={svgRef} width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} className="kg_svg">
        <g ref={worldRef}>
          {model.layerIdx.map((l) => {
            const x = layerX(l);
            return (
              <g key={`L${l}`}>
                <line x1={x} y1={26} x2={x} y2={HEIGHT - 30} strokeDasharray="2 7" style={{ stroke: "#9aa4b5", strokeOpacity: 0.35 }} />
              </g>
            );
          })}
          <g>
            {model.ls.map((l, i) => {
              const sId = typeof l.source === "object" ? (l.source as GNode).id : String(l.source);
              const tId = typeof l.target === "object" ? (l.target as GNode).id : String(l.target);
              const inFocus = focusSet?.has(sId) && focusSet?.has(tId);
              return (
                <line key={i} ref={(el) => { edgeEls.current[i] = el; }}
                  style={{
                    stroke: inFocus ? "var(--g-accent)" : l.kind === "literacy" ? "#d9dff0" : "#e3e7ec",
                    strokeOpacity: focusSet ? (inFocus ? 0.8 : 0.06) : l.kind === "literacy" ? 0.5 : 0.8,
                    strokeWidth: inFocus ? 1.8 : 1,
                    strokeDasharray: l.kind === "literacy" ? "4 4" : undefined,
                  }} />
              );
            })}
          </g>
          <g>
            {model.ns.map((d, i) => {
              const hovered = tip?.node.id === d.id;
              const dim = focusSet ? !focusSet.has(d.id) : false;
              const isSel = selected === d.id;
              return (
                <g key={d.id} ref={(el) => { nodeEls.current[i] = el; }} opacity={dim ? 0.14 : 1}>
                  <circle
                    className="kg-node"
                    r={(d as any).r ?? 10}
                    style={{
                      fill: d.fill,
                      stroke: isSel ? "var(--g-accent-deep)" : hovered ? "var(--g-accent)" : d.weak ? "var(--g-bad)" : "#fff",
                      strokeWidth: isSel ? 2.6 : d.weak ? 1.8 : 1,
                      cursor: "grab",
                      filter: "drop-shadow(0 1px 2px rgba(23,39,64,0.18))",
                    }}
                    onPointerEnter={hover(i)}
                    onPointerMove={hover(i)}
                    onPointerLeave={() => setTip(null)}
                    onDoubleClick={(e) => { e.stopPropagation(); d.fx = null; d.fy = null; setSelected(null); simRef.current?.alpha(0.3).restart(); }}
                    onClick={() => { setSelected((c) => (c === d.id ? null : d.id)); onNodeClick?.(d.id); }}
                  />
                  <text ref={(el) => { labelEls.current[i] = el; }} fontSize={10} className="kg_label">
                    {d.id.length > 9 ? d.id.slice(0, 9) + "…" : d.id}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
      <span className="kg_zoom">×{viewK.toFixed(1)}</span>
      {tip ? (
        <div className="kg_tip" style={{ left: Math.min(tip.x + 14, Math.max(0, width - 190)), top: Math.max(6, tip.y - 56) }}>
          <b>{tip.node.id}</b>
          <span>{tip.node.chapter}</span>
          <span>掌握度 <i style={{ color: tip.node.fill }}>{tip.node.p}%</i> · {tip.node.n} 人</span>
          {tip.node.weak ? <em>薄弱：建议优先干预</em> : null}
        </div>
      ) : null}
    </div>
  );
}
