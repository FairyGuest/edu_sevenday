type Dimension = { key: string; name: string; value: number | null };

/** Keep axes stable with sparse evidence; missing values are never plotted as zero. */
export default function LiteracyRadar({ dimensions }: { dimensions: Dimension[] }) {
  const cx = 210, cy = 170, radius = 98;
  const angle = (i: number) => -Math.PI / 2 - i * Math.PI * 2 / dimensions.length;
  const point = (i: number, r: number) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  const known = (d: Dimension) => d.value !== null && d.value !== undefined && Number.isFinite(d.value);
  const points = dimensions.map((d, i) => known(d) ? point(i, Math.max(0, Math.min(100, d.value!)) / 100 * radius) : null);
  const complete = points.every(Boolean);
  return <svg className="personal_literacy_svg" viewBox="0 0 420 340" role="img"
    aria-label={`个人素养雷达图：${dimensions.map(d => `${d.name}${known(d) ? `${d.value}%` : "暂无数据"}`).join("，")}`}
    style={{ width: "100%", minHeight: 260, maxHeight: 360 }}>
    <title>个人素养掌握雷达图</title>
    <desc>每个轴从中心的 0% 到外圈的 100%。缺失作答证据的维度不绘制分数。</desc>
    {[1, .75, .5, .25].map((ratio, i) => <polygon key={ratio}
      points={dimensions.map((_, j) => point(j, radius * ratio).join(",")).join(" ")}
      fill={i % 2 ? "#fcfdff" : "#f1f5fc"} stroke="#e5ebf5" />)}
    {dimensions.map((d, i) => {
      const edge = point(i, radius), label = point(i, radius + 38);
      return <g key={d.key || d.name}>
        <line x1={cx} y1={cy} x2={edge[0]} y2={edge[1]} stroke="#e5ebf5" />
        <text x={label[0]} y={label[1] - 3} textAnchor="middle" fill="#536078" fontSize="12">{d.name}</text>
        <text x={label[0]} y={label[1] + 15} textAnchor="middle" fill={known(d) ? "#1c6cff" : "#929bae"} fontSize="12" fontWeight="600">
          {known(d) ? `${d.value}%` : "暂无数据"}
        </text>
      </g>;
    })}
    {complete && <polygon points={points.map(p => p!.join(",")).join(" ")}
      fill="rgba(28,108,255,.16)" stroke="#1c6cff" strokeWidth="2" />}
    {!complete && points.map((p, i) => {
      const next = points[(i + 1) % points.length];
      return p && next ? <line key={i} x1={p[0]} y1={p[1]} x2={next[0]} y2={next[1]} stroke="#1c6cff" strokeWidth="2" /> : null;
    })}
    {points.map((p, i) => p && <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#1c6cff" stroke="#fff" strokeWidth="1.5">
      <title>{dimensions[i].name}：{dimensions[i].value}%</title>
    </circle>)}
    {!complete && <text x={cx} y="333" textAnchor="middle" fill="#929bae" fontSize="11">缺失证据的维度暂不连线</text>}
  </svg>;
}
