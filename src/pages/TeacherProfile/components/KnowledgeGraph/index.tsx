import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY,
  type Simulation, type SimulationLinkDatum, type SimulationNodeDatum,
} from "d3-force";
import { drag } from "d3-drag";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type D3ZoomEvent } from "d3-zoom";
import "d3-transition";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Checkbox, Input, Tooltip } from "antd";

/**
 * 知识点掌握图谱（借鉴 graph4rec ForceGraph 的交互范式）：
 * 力导向布局 + 滚轮缩放/拖拽平移 + 点节点聚焦邻接 + 搜索定位飞行 + 悬停 tooltip。
 * 节点=全量知识点目录（细粒度，≤本年级）：有学情数据的（大小=覆盖人数、填充=掌握度红→绿、
 * 红虚线圈=薄弱），无数据的灰色小点；外环色=L1~L4 等级；四列=L1→L4 分布；
 * 连线=同章脉络(实线)/素养同源(虚线)；可一键只看有学情数据的节点。
 */

type Level = "L1" | "L2" | "L3" | "L4";
const LEVELS: { key: Level; label: string; verb: string; color: string; desc: string }[] = [
  { key: "L1", label: "了解", verb: "了解 / 知道 / 识别", color: "#52607a", desc: "能再认再现，识别基本概念与符号" },
  { key: "L2", label: "理解", verb: "理解 / 描述 / 说明", color: "#2563eb", desc: "能解释含义、举例说明，明白为什么" },
  { key: "L3", label: "掌握", verb: "掌握 / 运用 / 计算", color: "#7c3aed", desc: "能在熟悉情境中独立使用与计算" },
  { key: "L4", label: "综合", verb: "综合 / 迁移 / 建模", color: "#db2777", desc: "能在新情境中组合应用、建模探究" },
];
const LEVEL_COLOR: Record<string, string> = Object.fromEntries(LEVELS.map((l) => [l.key, l.color]));
const levelOf = (n: any): Level => {
  const i = LEVELS.findIndex((l) => l.key === n.level);
  return i >= 0 ? LEVELS[i].key : "L2";
};

interface GNode extends SimulationNodeDatum {
  id: string; chapter: string; layer: number; level?: Level;
  p: number; n: number; weak: boolean; nodata?: boolean; fill: string;
}
interface GLink extends SimulationLinkDatum<GNode> { kind: string }

interface Props {
  graph?: { nodes: any[]; edges: { src: string; tgt: string; kind: string }[] };
  onNodeClick?: (cluster: string) => void;
  height?: number;
}

const HEIGHT = 620;
const COL_TOP = 46; // 列头文字下方起点

export default function KnowledgeGraph({ graph, onNodeClick, height }: Props) {
  const H = height ?? HEIGHT;
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeEls = useRef<(SVGGElement | null)[]>([]);
  const circleEls = useRef<(SVGCircleElement | null)[]>([]);
  const edgeEls = useRef<(SVGLineElement | null)[]>([]);
  const labelEls = useRef<(SVGTextElement | null)[]>([]);
  const simRef = useRef<Simulation<GNode, GLink> | null>(null);
  const worldRef = useRef<SVGGElement>(null);
  const viewRef = useRef({ k: 1, x: 0, y: 0 });
  const zoomRef = useRef<any>(null);
  const draggingRef = useRef(false);
  const selectedRef = useRef<string | null>(null);
  const drawRef = useRef<(() => void) | null>(null);
  const [width, setWidth] = useState(860);
  const [tip, setTip] = useState<{ x: number; y: number; node: GNode } | null>(null);
  const [viewK, setViewK] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [onlyData, setOnlyData] = useState(false);
  const matchIdx = useRef(0);
  selectedRef.current = selected;
  // 选中态变化时立即重绘（让选中节点标签马上显示）
  useEffect(() => { drawRef.current?.(); }, [selected]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((es) => { for (const e of es) setWidth(Math.max(320, Math.floor(e.contentRect.width))); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const model = useMemo(() => {
    if (!graph) return null;
    const all: GNode[] = graph.nodes.map((n) => ({
      id: n.id, chapter: n.chapter, layer: n.layer ?? 0, level: n.level,
      p: n.p ?? 50, n: n.n ?? 30, weak: !!n.weak, nodata: !!n.nodata,
      // 无数据节点用更深的灰，保证在浅色背景上可见
      fill: n.nodata ? "#9aa7b5" : (n.fill || "#8fa3b5"),
    }));
    // "仅看有学情"过滤：隐藏无数据节点及其关联边
    const ns = onlyData ? all.filter((d) => !d.nodata) : all;
    const keep = new Set(ns.map((d) => d.id));
    const byId = new Map(ns.map((d) => [d.id, d]));
    const ls: GLink[] = graph.edges
      .filter((e) => keep.has(e.src) && keep.has(e.tgt))
      .map((e) => ({ source: e.src, target: e.tgt, kind: e.kind }));
    const adj = new Map<string, Set<string>>();
    for (const e of graph.edges) {
      if (!keep.has(e.src) || !keep.has(e.tgt)) continue;
      (adj.get(e.src) ?? adj.set(e.src, new Set()).get(e.src)!).add(e.tgt);
      (adj.get(e.tgt) ?? adj.set(e.tgt, new Set()).get(e.tgt)!).add(e.src);
    }
    // 每级分布概要（数量含全部节点；均值只算有学情的）
    const stats = LEVELS.map((l) => {
      const group = ns.filter((d) => levelOf(d) === l.key);
      const dataGroup = group.filter((d) => !d.nodata);
      const avg = dataGroup.length ? Math.round(dataGroup.reduce((s, d) => s + d.p, 0) / dataGroup.length) : 0;
      return { ...l, count: group.length, dataCount: dataGroup.length, avg, weakCount: dataGroup.filter((d) => d.weak).length };
    });
    return { ns, ls, byId, adj, stats, dataTotal: all.filter((d) => !d.nodata).length };
  }, [graph, onlyData]);

  const colX = useMemo(() => {
    const pad = Math.max(70, Math.min(110, width * 0.11));
    return (i: number) => pad + (i * (width - 2 * pad)) / (LEVELS.length - 1);
  }, [width]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !model || width < 60) return;
    const { ns, ls } = model;
    const radius = (d: GNode) => (d.nodata ? 8.5 : 9 + 8 * Math.sqrt(Math.min(d.n, 50) / 50));

    // 初始化：每列内数据节点均匀铺到各槽位、灰点填充其余，避免"灰点堆顶、大点沉底"
    const colBuckets: GNode[][] = LEVELS.map(() => []);
    for (const d of ns) colBuckets[LEVELS.findIndex((l) => l.key === levelOf(d))].push(d);
    const usable = H - COL_TOP - 26;
    for (const bucket of colBuckets) {
      const dataNodes = bucket.filter((d) => !d.nodata);
      const grayNodes = bucket.filter((d) => d.nodata);
      const slots: (GNode | null)[] = new Array(bucket.length).fill(null);
      // 数据节点等距落位（含首尾），灰点按序填空
      dataNodes.forEach((d, k) => {
        const idx = dataNodes.length === 1
          ? Math.floor(bucket.length / 2)
          : Math.round((k * (bucket.length - 1)) / (dataNodes.length - 1));
        let j = idx;
        while (slots[j] !== null) j = (j + 1) % bucket.length; // 撞位顺延
        slots[j] = d;
      });
      let gi = 0;
      for (let s = 0; s < slots.length; s++) if (!slots[s]) slots[s] = grayNodes[gi++] ?? null;
      const li = LEVELS.findIndex((l) => l.key === levelOf(bucket[0]));
      slots.forEach((d, i) => {
        if (!d) return;
        d.x = colX(li) + (Math.random() - 0.5) * 46;
        d.y = COL_TOP + ((i + 0.5) / bucket.length) * usable + (Math.random() - 0.5) * 10;
        (d as any).slotY = d.y; // 目标槽位：模拟中持续拉回，保持数据/灰点交错分布
        d.vx = 0; d.vy = 0;
        (d as any).r = radius(d);
      });
    }

    const draw = () => {
      for (let i = 0; i < ns.length; i++) {
        const el = nodeEls.current[i];
        if (el) el.setAttribute("transform", `translate(${ns[i].x ?? 0},${ns[i].y ?? 0})`);
        // 半径同步（React 只渲染初始值，力导向过程中统一由 draw 维护）
        const circle = circleEls.current[i];
        if (circle) circle.setAttribute("r", String((ns[i] as any).r ?? 10));
        const halo = el?.querySelector("circle.kg-halo");
        if (halo) halo.setAttribute("r", String(((ns[i] as any).r ?? 10) + 3.5));
        const lb = labelEls.current[i];
        if (lb) {
          // 标签是节点 g(translate) 的子元素，坐标系相对节点圆心：x=r+4, y=3.5
          // （若写绝对坐标会被 g 的 translate 二次叠加，文字飞到两倍坐标处）
          lb.setAttribute("x", String(((ns[i] as any).r ?? 10) + 4));
          lb.setAttribute("y", "3.5");
          // 标签常显（用户偏好：灰点也带字，不空荡）；灰点标签小一号淡一档
          lb.style.display = "";
          lb.style.fill = ns[i].nodata ? "#8e99a8" : "#33445c";
          lb.setAttribute("font-size", ns[i].nodata ? "9" : "10");
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
        .distance((l) => 40 + (((l.source as GNode).n ?? 30) % 20))
        .strength(0.14))
      .force("charge", forceManyBody<GNode>().strength(-120))
      .force("collide", forceCollide<GNode>((d) => ((d as any).r ?? 10) + (d.nodata ? 5 : 4)).iterations(2))
      .force("colX", forceX<GNode>((d) => colX(LEVELS.findIndex((l) => l.key === levelOf(d)))).strength(0.14))
      .force("slotY", forceY<GNode>((d) => (d as any).slotY ?? (H + COL_TOP) / 2).strength(0.22))
      .force("centerY", forceY<GNode>((H + COL_TOP) / 2).strength(0.05))
      .alphaDecay(0.022);
    simRef.current = sim;
    sim.on("tick", draw);
    drawRef.current = draw;
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
  }, [model, colX, width]);

  const resetView = () => {
    const svg = svgRef.current;
    if (!svg) return;
    viewRef.current = { k: 1, x: 0, y: 0 };
    setViewK(1);
    worldRef.current?.setAttribute("transform", "translate(0,0) scale(1)");
    setSelected(null);
    drawRef.current?.(); // 标签可见性按新缩放级别重算
  };

  const flyTo = (id: string) => {
    const node = model?.byId.get(id);
    if (!node || !zoomRef.current) return;
    // 无数据灰点标签 2.5× 起显示，定位时放大到 2.6 保证可见
    const scale = node.nodata ? 2.6 : 1.9;
    const tx = width / 2 - (node.x ?? 0) * scale;
    const ty = H / 2 - (node.y ?? 0) * scale;
    const target = zoomIdentity.translate(tx, ty).scale(scale);
    try {
      select(svgRef.current).transition().duration(700).call(zoomRef.current.transform, target);
    } catch {
      select(svgRef.current).call(zoomRef.current.transform, target);
    }
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
  const total = model.ns.length;

  return (
    <div ref={wrapRef} className="kg_wrap">
      <div className="kg_toolbar">
        <span className="kg_hint">圆大小 = 覆盖人数 · 填充 = 掌握度（红 → 绿）· 外环 = L1~L4 · 灰点 = 无学情数据</span>
        <span className="kg_hint">滚轮缩放 · 拖拽平移 · 点节点聚焦</span>
        <Checkbox
          className="kg_onlydata"
          checked={onlyData}
          onChange={(e) => setOnlyData(e.target.checked)}
        >
          仅看有学情
        </Checkbox>
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
      {/* L1~L4 分布概要：等级 × 数量 × 平均掌握度（hover 看等级动词释义） */}
      <div className="kg_lvstats">
        {model.stats.map((s) => (
          <Tooltip key={s.key} color="#fff" overlayClassName="ct_lv_tip" title={`${s.key}＝${s.label}（${s.verb}）：${s.desc}`}>
            <span className="kg_lvstat" style={{ ["--c" as any]: s.color }}>
              <b>{s.key}</b>{s.label}
              <em>{s.count} 个{s.dataCount < s.count ? `（${s.dataCount} 有学情）` : ""}</em>
              <i style={{ color: s.dataCount ? `hsl(${Math.max(15, Math.min(95, s.avg)) * 1.05}, 62%, 46%)` : "#9aa4b5" }}>
                {s.dataCount ? `均 ${s.avg}%` : "暂无学情"}
              </i>
              {s.weakCount ? <u>{s.weakCount} 薄弱</u> : null}
            </span>
          </Tooltip>
        ))}
        <span className="kg_lvtotal">共 {total} 个知识点 · {model.dataTotal} 个有学情数据</span>
      </div>
      <svg ref={svgRef} width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="kg_svg">
        <g ref={worldRef}>
          {LEVELS.map((l, i) => {
            const x = colX(i);
            const st = model.stats[i];
            return (
              <g key={l.key}>
                <line x1={x} y1={COL_TOP - 8} x2={x} y2={H - 24} strokeDasharray="2 7" style={{ stroke: "#9aa4b5", strokeOpacity: 0.35 }} />
                <circle cx={x - 44} cy={18} r={4} style={{ fill: l.color }} />
                <text x={x - 36} y={21.5} fontSize={11.5} fontWeight={700} style={{ fill: "#33445c" }}>
                  {l.key} {l.label}
                </text>
                <text x={x - 36} y={35} fontSize={9.5} style={{ fill: "#8a94a8" }}>
                  {st.dataCount ? `${st.count} 个 · 均 ${st.avg}%` : `${st.count} 个 · 无学情`}
                </text>
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
              const lvColor = LEVEL_COLOR[levelOf(d)] ?? "#8fa3b5";
              const r = (d as any).r ?? 10;
              return (
                <g key={d.id} ref={(el) => { nodeEls.current[i] = el; }} opacity={dim ? 0.14 : 1}>
                  {d.weak ? (
                    <circle className="kg-halo" r={r + 3.5} fill="none" stroke="var(--g-bad)" strokeWidth={1.2} strokeDasharray="3 3" style={{ pointerEvents: "none" }} />
                  ) : null}
                  <circle
                    className="kg-node"
                    ref={(el) => { circleEls.current[i] = el; }}
                    r={r}
                    style={{
                      fill: d.fill,
                      stroke: isSel ? "var(--g-accent-deep)" : hovered ? "var(--g-accent)" : lvColor,
                      strokeWidth: isSel ? 3 : d.nodata ? 1.4 : 2.2,
                      cursor: "grab",
                      filter: d.nodata ? undefined : "drop-shadow(0 1px 2px rgba(23,39,64,0.18))",
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
        <div className="kg_tip" style={{ left: Math.min(tip.x + 14, Math.max(0, width - 200)), top: Math.max(6, tip.y - 72) }}>
          <b>{tip.node.id}</b>
          <span>{tip.node.chapter}</span>
          <span style={{ color: LEVEL_COLOR[levelOf(tip.node)] }}>
            {levelOf(tip.node)} {LEVELS.find((l) => l.key === levelOf(tip.node))?.label} · {LEVELS.find((l) => l.key === levelOf(tip.node))?.verb}
          </span>
          {tip.node.nodata ? (
            <em style={{ color: "#8a94a8" }}>暂无学情数据（未测/未学）</em>
          ) : (
            <span>掌握度 <i style={{ color: tip.node.fill }}>{tip.node.p}%</i> · {tip.node.n} 人</span>
          )}
          {tip.node.weak ? <em>薄弱：建议优先干预</em> : null}
        </div>
      ) : null}
    </div>
  );
}
