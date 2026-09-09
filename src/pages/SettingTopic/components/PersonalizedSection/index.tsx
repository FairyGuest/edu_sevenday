import { useEffect, useState } from "react";
import {
  Alert, Button, Card, Checkbox, Col, Collapse, message, Row, Select, Spin, Table, Tag, Tooltip,
} from "antd";
import { BarChartOutlined, RetweetOutlined, ThunderboltOutlined } from "@ant-design/icons";
import MarkdownRender from "@/components/MarkdownRender";
import ReactECharts from "echarts-for-react";

const { Option } = Select;
const STRATEGY_TAG: Record<string, { color: string; label: string }> = {
  weak: { color: "processing", label: "薄弱" },
  variant: { color: "purple", label: "变式" },
  review: { color: "warning", label: "遗忘" },
  challenge: { color: "success", label: "挑战" },
  balanced: { color: "default", label: "均衡" },
  plan: { color: "cyan", label: "教案" },
};
const PALETTE = ["#4f7df0", "#8e7ce0", "#4f9e70", "#e0a05e", "#df94a8", "#8fa3bf"];
const STATUS_ZH: Record<string, string> = { generated: "待发布", published: "已发布", reported: "已出报告" };

const j = (r: any) => r.json();
const post = (url: string, body: any) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(j);

/**
 * F3 个性化作业面板（嵌入作业布置页）。
 * 业务闭环：四方针配置 → 生成（每人一单）→ 发布（对象锁定）→ 学情汇总报告 → 二轮推荐。
 */
const PersonalizedSection = ({ classes }: { classes: any[] }) => {
  const [classId, setClassId] = useState("");
  const [config, setConfig] = useState({ weak: true, variant: true, review: true, challenge: true, total: 6 });
  const [detail, setDetail] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [hwId, setHwId] = useState("");
  const [paper, setPaper] = useState<any>(null);
  const [studentId, setStudentId] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [rptLoading, setRptLoading] = useState(false);
  const [homeworkList, setHomeworkList] = useState<any[]>([]);

  const classList = classes || [];
  const s = detail?.summary || {};
  const strategyEntries = Object.entries(s.strategy_mix || {});
  const topClusters = s.top_clusters || [];

  const loadHomeworkList = async (cid?: string) => {
    const c = cid || classId || classList[0]?.class_id;
    if (!c) return;
    const d = await fetch(`/api/teacher/recommend/homework?class_id=${c}`).then(j);
    if (d.code === 200) setHomeworkList(d.data || []);
  };

  useEffect(() => { loadHomeworkList(); }, [classId, classes.length]);

  // 选中作业：拉详情 + 已有报告
  useEffect(() => {
    if (!hwId) return;
    setReport(null); setPaper(null); setStudentId("");
    fetch(`/api/teacher/recommend/homework/${hwId}`).then(j).then(d => { if (d.code === 200) setDetail(d.data); });
    fetch(`/api/teacher/recommend/report?id=${hwId}`).then(j).then(d => { if (d.code === 200) setReport(d.data); });
  }, [hwId]);

  useEffect(() => {
    if (hwId && studentId) {
      fetch(`/api/teacher/recommend/paper-preview?id=${hwId}&sid=${studentId}`)
        .then(j).then(d => { if (d.code === 200) setPaper(d.data); });
    }
  }, [hwId, studentId]);

  const donutOption = {
    series: [{ type: "pie", radius: ["40%", "65%"], label: { show: false },
      data: strategyEntries.map(([k, v], i) => ({ name: k, value: v, itemStyle: { color: PALETTE[i % PALETTE.length] } })) }],
  };

  const generate = async () => {
    const ranges: Record<string, [number, number]> = {};
    if (config.weak) ranges.weak = [2, 3];
    if (config.variant) ranges.variant = [1, 2];
    if (config.review) ranges.review = [1, 2];
    if (config.challenge) ranges.challenge = [1, 1];
    if (!Object.keys(ranges).length) { message.warning("至少选择一个布置方针"); return; }
    setGenLoading(true);
    try {
      const cid = classId || classList[0]?.class_id;
      const d = await post("/api/teacher/recommend/generate", { class_id: cid, ranges, total: config.total });
      if (d.code === 200) {
        setDetail(d.data);
        setHwId(d.data.homework_id);
        setReport(null);
        message.success(`已生成 ${d.data.homework_id}（${d.data.summary.n_students}人，每人一单）`);
        loadHomeworkList(cid);
      }
    } finally { setGenLoading(false); }
  };

  const publish = async (tamper: boolean) => {
    if (!hwId) return;
    const ids = tamper ? detail?.roster?.slice(0, -3) : undefined;
    const d = await post("/api/teacher/recommend/publish", { id: hwId, student_ids: ids });
    if (d.data?.ok === false) {
      message.warning(`🚫 ${d.data.msg}`);
    } else if (d.data?.ok) {
      message.success(`✅ ${d.data.msg}（${d.data.published_at}）`);
      // 状态流转：刷新列表与详情
      loadHomeworkList();
      setDetail((prev: any) => ({ ...prev, status: "published", published_at: d.data.published_at }));
    }
  };

  const simulate = async () => {
    if (!hwId) return;
    setRptLoading(true);
    try {
      const d = await post("/api/teacher/recommend/simulate", { id: hwId });
      if (d.code === 200) { setReport(d.data); message.success("学情汇总报告已生成"); }
    } finally { setRptLoading(false); }
  };

  const closeLoop = async () => {
    if (!hwId) return;
    const d = await post("/api/teacher/recommend/close-loop", { id: hwId });
    if (d.data?.ok) message.success("学情已回流：二轮推荐将基于最新掌握度生成");
    else message.info(d.data?.msg || "请先生成学情报告");
  };

  const paperCols = [
    { title: "#", width: 32, render: (_: any, __: any, i: number) => i + 1 },
    {
      title: "题目", dataIndex: "stem",
      render: (t: string) => (
        <div className="teacher_profile_stem"><MarkdownRender>{t}</MarkdownRender></div>
      ),
    },
    { title: "知识点", dataIndex: "cluster", width: 110, ellipsis: true },
    { title: "方针", dataIndex: "strategy", width: 65,
      render: (t: string) => <Tag color={STRATEGY_TAG[t]?.color || "default"}>{STRATEGY_TAG[t]?.label || t}</Tag> },
    { title: "理由", dataIndex: "reason", width: 180, ellipsis: true,
      render: (t: string) => <span style={{ fontSize: 11, color: "#8a94a8" }}>{t}</span> },
  ];

  const rptCols = [
    { title: "知识点", dataIndex: "cluster", ellipsis: true },
    { title: "人数", dataIndex: "n_students", width: 55 },
    { title: "题次", dataIndex: "n_items", width: 55 },
    { title: "正确率", dataIndex: "accuracy", width: 65, render: (t: number) => t != null ? <b>{t}%</b> : "—" },
  ];

  const statusTag = detail?.status
    ? <Tag color={detail.status === "published" ? "success" : "default"}>{STATUS_ZH[detail.status] || detail.status}</Tag>
    : null;

  return (
    <div style={{ padding: "0 0 12px" }}>
      {/* 配置+生成 */}
      <Card size="small" style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>🎯 个性化布置（每人一单）</span>
          <Select size="small" style={{ width: 160 }}
            value={classId || classList[0]?.class_id}
            onChange={(v) => { setClassId(v); setHwId(""); setDetail(null); }}
            placeholder="选择班级"
            options={classList.map(c => ({ value: c.class_id, label: `${c.class_name} · ${c.n_students}人` }))} />
          {([["weak","薄弱知识点"],["variant","错题变式"],["review","遗忘复习"],["challenge","挑战(选做)"]] as const).map(([k,l]) => (
            <Checkbox key={k} size="small" checked={(config as any)[k]}
              onChange={e => setConfig(c => ({...c, [k]: e.target.checked}))}>{l}</Checkbox>
          ))}
          <Tooltip title="人均必做题量：按方针权重自动分配（薄弱优先），挑战题为选做+1">
            <Select size="small" style={{ width: 78 }} value={config.total}
              onChange={v => setConfig(c => ({...c, total: v}))}>
              {[5,6,7,8].map(n => <Option key={n} value={n}>人均{n}题</Option>)}
            </Select>
          </Tooltip>
          <Button size="small" type="primary" icon={<ThunderboltOutlined />}
            loading={genLoading} onClick={generate}>生成作业</Button>
        </div>
      </Card>

      {/* 作业记录：生成 → 发布 → 报告 的状态都在这里流转 */}
      <Card size="small" style={{ marginBottom: 10 }} title={
        <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <BarChartOutlined /> 作业记录 {statusTag}
          <Select size="small" style={{ width: 340 }}
            value={hwId || undefined} onChange={setHwId} placeholder="选择作业（含历史）"
            allowClear onClear={() => { setHwId(""); setDetail(null); }}
            options={homeworkList.map(h => ({
              value: h.homework_id,
              label: `${h.homework_id} · ${h.mode === "unified" ? "📖 教案同步" : h.mode === "plan" ? "📘 教案作业" : h.mode === "chapter" ? "📗 章节作业" : "🎯 个性化"} · ${STATUS_ZH[h.status] || h.status} · ${h.n_students}人`,
            }))} />
          {hwId ? <>
            <Tooltip title="发布对象为生成时锁定的班级名单，不可修改">
              <Button size="small" type="primary" ghost onClick={() => publish(false)}>发布</Button>
            </Tooltip>
            <Tooltip title="验证发布器锁定：篡改名单应被拦截">
              <Button size="small" danger onClick={() => publish(true)}>改名单发布(演示拦截)</Button>
            </Tooltip>
            <Tooltip title="学生作答后按知识点聚合生成作业报告（复用学情报告字段）">
              <Button size="small" loading={rptLoading} onClick={simulate}>生成学情报告</Button>
            </Tooltip>
            <Tooltip title="作答回流画像后，二轮推荐基于最新掌握度">
              <Button size="small" icon={<RetweetOutlined />} onClick={closeLoop}>二轮推荐</Button>
            </Tooltip>
          </> : null}
        </span>
      }>
        <Spin spinning={genLoading}>
          {detail ? (
            <Row gutter={8}>
              <Col span={6}><div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 750 }}>{s.n_students}</div><div style={{ fontSize: 11, color: "#8a94a8" }}>学生(每人一卷)</div></div></Col>
              <Col span={6}><div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 750 }}>{s.q_count?.min}–{s.q_count?.max}</div><div style={{ fontSize: 11, color: "#8a94a8" }}>题量区间</div></div></Col>
              <Col span={6}><div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 750 }}>{s.fallback_students ?? 0}</div><div style={{ fontSize: 11, color: "#8a94a8" }}>兜底策略</div></div></Col>
              <Col span={6}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ReactECharts option={donutOption} style={{ width: 55, height: 55 }} notMerge />
                  <div style={{ fontSize: 10, lineHeight: 1.5 }}>
                    {strategyEntries.slice(0, 3).map(([k, v], i) => (
                      <div key={k}><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: PALETTE[i % PALETTE.length], marginRight: 3 }} />{k} {v}</div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          ) : (
            <Alert type="info" showIcon message="配置方针后点击「生成作业」，或从作业记录中选择历史作业" />
          )}
        </Spin>
      </Card>

      {/* 抽样预览 + 报告 */}
      <Row gutter={10}>
        <Col span={report ? 10 : 24}>
          <Card size="small" title={
            detail?.unified_items
              ? "查看作业（全班同卷 · 教案选题）"
              : "抽样预览（个性化作业不做全量预览/编辑）"
          } extra={
            detail?.unified_items ? undefined : (
            <Select size="small" style={{ width: 160 }} showSearch optionFilterProp="label"
              value={studentId || undefined} onChange={setStudentId} placeholder="选择学生查看专属卷"
              options={detail?.students?.length
                ? detail.students.map((x: any) => ({ value: x.sid, label: `${x.name}（${x.n}题）` }))
                : Object.entries(detail?.papers || {}).map(([sid, p]: [string, any]) => ({
                    value: sid, label: `${p.name}（${p.items?.length || 0}题）`,
                  }))} />)
          }>
            {detail ? (
              detail.unified_items ? (
                <Table columns={paperCols} dataSource={detail.unified_items}
                  rowKey="qid" pagination={false} size="small" tableLayout="fixed" />
              ) : (
                <Table columns={paperCols} dataSource={paper?.items || []}
                  rowKey="qid" pagination={false} size="small" tableLayout="fixed"
                  locale={{ emptyText: studentId ? " " : "选择学生后展示其专属试卷" }} />
              )
            ) : (
              <Alert type="info" message="选择作业后可查看（教案/章节作业为全班同卷，个性化作业按学生抽样）" />
            )}
          </Card>
        </Col>
        {report ? (
          <Col span={14}>
            <Card size="small" title="📊 作业学情汇总 · 按知识点聚合">
              <Row gutter={8} style={{ marginBottom: 8 }}>
                <Col span={8}><div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 750 }}>{report.overall.completion}%</div><div style={{ fontSize: 11, color: "#8a94a8" }}>完成率</div></div></Col>
                <Col span={8}><div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 750 }}>{report.overall.required_acc}%</div><div style={{ fontSize: 11, color: "#8a94a8" }}>必做正确率</div></div></Col>
                <Col span={8}><div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 750 }}>{report.overall.optional_acc}%</div><div style={{ fontSize: 11, color: "#8a94a8" }}>选做正确率</div></div></Col>
              </Row>
              <Table columns={rptCols} dataSource={report.by_cluster || []}
                rowKey="cluster" pagination={false} size="small" tableLayout="fixed" />
              <p style={{ fontSize: 11, color: "#8a94a8", marginTop: 6 }}>
                回流：{report.ingest_receipt?.accepted || 0} 条作答已写入学情事件，可在「学情分析」查看画像更新
              </p>
            </Card>
          </Col>
        ) : null}
      </Row>
    </div>
  );
};

export default PersonalizedSection;
