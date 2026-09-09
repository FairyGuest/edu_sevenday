import { connect } from "@umijs/max";
import { useEffect, useState } from "react";
import {
  Alert, Button, Card, Checkbox, Col, Collapse, message, Row, Select, Spin, Table, Tag,
} from "antd";
import {
  BarChartOutlined, CheckCircleOutlined, ThunderboltOutlined,
} from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import MarkdownRender from "@/components/MarkdownRender";
import "./index.less";

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

const PersonalizedPaper = (props: any) => {
  const {
    classes, homeworkList, detail, paper, report,
    loading, generateLoading, detailLoading, reportLoading, dispatch,
  } = props;

  const [classId, setClassId] = useState("");
  const [hwId, setHwId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [config, setConfig] = useState({ weak: true, variant: true, review: true, challenge: true, total: 6 });
  const classList = classes || [];

  useEffect(() => {
    dispatch({ type: "personalizedPaperModel/getData", payload: {}, apiUrl: "classesUrl", mTitle: "classes" });
  }, []);

  useEffect(() => {
    const cid = classId || classList[0]?.class_id;
    if (cid) {
      dispatch({ type: "personalizedPaperModel/getData", payload: { class_id: cid }, apiUrl: "homeworkListUrl", mTitle: "homeworkList" });
    }
  }, [classes, classId]);

  useEffect(() => {
    if (hwId) {
      dispatch({ type: "personalizedPaperModel/getData", apiUrl: `homeworkDetailUrl`, payload: { id: hwId }, mTitle: "detail", mLoading: "detailLoading" });
    }
  }, [hwId]);

  useEffect(() => {
    if (hwId && studentId) {
      dispatch({
        type: "personalizedPaperModel/getData",
        apiUrl: "paperPreviewUrl",
        payload: { id: hwId, sid: studentId },
        mTitle: "paper", mLoading: "detailLoading",
      });
    }
  }, [hwId, studentId]);

  const generate = async () => {
    const ranges: Record<string, [number, number]> = {};
    if (config.weak) ranges.weak = [2, 3];
    if (config.variant) ranges.variant = [1, 2];
    if (config.review) ranges.review = [1, 2];
    if (config.challenge) ranges.challenge = [1, 1];
    if (!Object.keys(ranges).length) { message.warning("至少选择一个布置方针"); return; }
    const cid = classId || classList[0]?.class_id;
    const result = await dispatch({
      type: "personalizedPaperModel/postData",
      apiUrl: "generateUrl",
      payload: { class_id: cid, ranges, total: config.total },
      mLoading: "generateLoading",
    });
    if (result?.code === 200) {
      message.success(`已生成：${result.data.homework_id}（${result.data.summary.n_students}人）`);
      setHwId(result.data.homework_id);
      dispatch({ type: "personalizedPaperModel/getData", payload: { class_id: cid }, apiUrl: "homeworkListUrl", mTitle: "homeworkList" });
    }
  };

  const publish = async (tamper: boolean) => {
    if (!hwId) return;
    const ids = tamper ? detail?.roster?.slice(0, -3) : undefined;
    const result = await dispatch({
      type: "personalizedPaperModel/postData",
      apiUrl: "publishUrl",
      payload: { id: hwId, student_ids: ids },
    });
    const d = result?.data || result;
    if (d?.ok === false) {
      message.warning(`🚫 ${d.msg}`);
    } else if (d?.ok) {
      message.success(`✅ ${d.msg}`);
    }
  };

  const simulate = async () => {
    if (!hwId) return;
    const result = await dispatch({
      type: "personalizedPaperModel/postData",
      apiUrl: "simulateUrl",
      payload: { id: hwId },
      mTitle: "report",
      mLoading: "reportLoading",
    });
    if (result?.code === 200) {
      message.success("报告已生成");
    }
  };

  const closeLoop = async () => {
    if (!hwId) return;
    const result = await dispatch({
      type: "personalizedPaperModel/postData",
      apiUrl: "closeLoopUrl",
      payload: { id: hwId },
    });
    if (result?.data?.ok) message.success("闭环验证完成：二轮推荐已变化");
  };

  const s = detail?.summary || {};
  const strategyEntries = Object.entries(s.strategy_mix || {});
  const topClusters = s.top_clusters || [];

  // 环形图
  const donutOption = {
    tooltip: { trigger: "item" },
    series: [{
      type: "pie", radius: ["40%", "65%"],
      label: { show: false },
      data: strategyEntries.map(([k, v], i) => ({ name: k, value: v, itemStyle: { color: PALETTE[i % PALETTE.length] } })),
    }],
  };

  // 条形图
  const barOption = {
    grid: { left: 120, right: 40, top: 8, bottom: 20 },
    xAxis: { type: "value", axisLabel: { color: "#8a94a8" }, splitLine: { lineStyle: { color: "#eef1f6" } } },
    yAxis: { type: "category", inverse: true, data: topClusters.map(([c]) => c), axisLabel: { color: "#2a3346", width: 110, overflow: "truncate" } },
    series: [{ type: "bar", barWidth: 10, itemStyle: { color: "#4f7df0", borderRadius: 5 }, data: topClusters.map(([, n]) => n) }],
  };

  // 抽样预览表列
  const paperCols = [
    { title: "#", width: 36, render: (_: any, __: any, i: number) => i + 1 },
    {
      title: "题目", dataIndex: "stem",
      render: (t: string) => (
        <div className="teacher_profile_stem"><MarkdownRender>{t}</MarkdownRender></div>
      ),
    },
    { title: "知识点", dataIndex: "cluster", width: 120, ellipsis: true },
    { title: "难度", dataIndex: "difficulty", width: 60 },
    {
      title: "方针", dataIndex: "strategy", width: 70,
      render: (t: string) => {
        const info = STRATEGY_TAG[t];
        return <Tag color={info?.color || "default"}>{info?.label || t}</Tag>;
      },
    },
    { title: "理由", dataIndex: "reason", width: 200, ellipsis: true, render: (t: string) => <span style={{ fontSize: 11, color: "#5f6b81" }}>{t}</span> },
  ];

  // 报告表列
  const reportCols = [
    { title: "知识点", dataIndex: "cluster", ellipsis: true },
    { title: "人数", dataIndex: "n_students", width: 55 },
    { title: "题次", dataIndex: "n_items", width: 55 },
    { title: "正确率", dataIndex: "accuracy", width: 70, render: (t: number) => t != null ? <b>{t}%</b> : "—" },
    { title: "选做", dataIndex: "optional", width: 90, render: (o: any) => o?.n ? `${o.accuracy}%（${o.n}题）` : "—" },
  ];

  return (
    <div className="pp_container">
      {/* 顶部：配置+生成 */}
      <Card size="small" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-3" style={{ flexWrap: "wrap" }}>
          <span className="pp_label">班级</span>
          <Select
            style={{ width: 200 }} size="small"
            value={classId || classList[0]?.class_id}
            onChange={setClassId}
            placeholder="选择班级"
            options={classList.map((c: any) => ({ value: c.class_id, label: `${c.class_name} · ${c.n_students}人` }))}
          />
          <span className="pp_divider" />
          {([["weak", "薄弱知识点 2–3 题"], ["variant", "错题变式 1–2 题"],
             ["review", "遗忘曲线复习"], ["challenge", "选做挑战（徽章）"]] as const).map(([k, label]) => (
            <Checkbox
              key={k} size="small"
              checked={(config as any)[k]}
              onChange={(e) => setConfig((c) => ({ ...c, [k]: e.target.checked }))}
            >{label}</Checkbox>
          ))}
          <span className="pp_divider" />
          <span className="pp_label">人均</span>
          <Select size="small" style={{ width: 60 }} value={config.total}
            onChange={(v) => setConfig((c) => ({ ...c, total: v }))}>
            {[5, 6, 7, 8].map((n) => <Option key={n} value={n}>{n}</Option>)}
          </Select>
          <Button type="primary" size="small" icon={<ThunderboltOutlined />}
            loading={generateLoading} onClick={generate}>
            生成作业（每人一单）
          </Button>
        </div>
      </Card>

      {/* 作业记录 */}
      <Card size="small" style={{ marginBottom: 12 }} title={
        <span className="flex items-center gap-2">
          <BarChartOutlined /> 作业记录
          <Select size="small" style={{ width: 320, marginLeft: 12 }}
            value={hwId} onChange={setHwId} placeholder="选择作业"
            options={(homeworkList || []).map((h: any) => ({
              value: h.homework_id,
              label: `${h.homework_id} · ${h.mode === "unified" ? "📖 教案" : "🎯 个性化"} · ${h.status} · ${h.n_students}人`,
            }))}
          />
          <Button size="small" onClick={() => publish(false)}>发布</Button>
          <Button size="small" danger onClick={() => publish(true)}>改名单发布(应拒)</Button>
          <Button size="small" onClick={simulate} loading={reportLoading}>📊 模拟→报告</Button>
          <Button size="small" onClick={closeLoop}>🔁 闭环</Button>
        </span>
      }>
        <Spin spinning={detailLoading}>
          {detail ? (
            <>
              <Row gutter={10} style={{ marginBottom: 10 }}>
                <Col span={5}><div className="pp_kpi"><small>{detail.mode === "unified" ? "学生(全班同题)" : "学生(每人一卷)"}</small><b>{s.n_students}</b></div></Col>
                <Col span={5}><div className="pp_kpi"><small>题量区间</small><b>{s.q_count?.min}–{s.q_count?.max}</b></div></Col>
                <Col span={5}><div className="pp_kpi"><small>兜底策略学生</small><b>{s.fallback_students}</b></div></Col>
                <Col span={7}>
                  <div className="pp_kpi" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ReactECharts option={donutOption} style={{ width: 70, height: 70 }} notMerge />
                    <div style={{ fontSize: 11, lineHeight: 1.6 }}>
                      {strategyEntries.map(([k, v], i) => (
                        <div key={k}>
                          <i className="pp_dot" style={{ background: PALETTE[i % PALETTE.length] }} /> {k} {v}
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>
              {topClusters.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <p className="pp_chart_title"><BarChartOutlined /> 全班知识点分布 Top</p>
                  <ReactECharts option={barOption} style={{ height: 140 }} notMerge />
                </div>
              )}
              {s.notes_sample?.length > 0 && (
                <Collapse size="small" items={[{
                  key: "notes", label: `兜底/降级说明（可解释性）· ${s.notes_sample.length} 条`,
                  children: (
                    <ul className="pp_notes">
                      {s.notes_sample.map((n: string, i: number) => <li key={i}>{n}</li>)}
                    </ul>
                  ),
                }]} />
              )}
            </>
          ) : (
            <Alert type="info" message="选择或生成一份作业后显示摘要" />
          )}
        </Spin>
      </Card>

      {/* 抽样预览 + 报告 */}
      <Row gutter={12}>
        <Col span={report ? 10 : 24}>
          <Card size="small" title="抽样预览（不做全量编辑）">
            {detail ? (
              <>
                <Select
                  size="small" style={{ width: 200, marginBottom: 8 }}
                  showSearch optionFilterProp="label"
                  value={studentId} onChange={setStudentId}
                  placeholder="选择学生查看专属卷"
                  options={Object.entries(detail.papers || {}).length
                    ? Object.entries(detail.papers).map(([sid, p]: [string, any]) => ({
                        value: sid, label: `${p.name}（${p.items?.length || 0}题）`,
                      }))
                    : (detail.roster || []).map((name: string, i: number) => ({
                        value: `stu_${i}`, label: name,
                      }))
                  }
                />
                <Table
                  columns={paperCols}
                  dataSource={paper?.items || []}
                  rowKey="qid"
                  pagination={false}
                  size="small"
                  tableLayout="fixed"
                />
                {paper?.items?.some((i: any) => i.optional) && (
                  <Alert type="info" style={{ marginTop: 6 }} message="含选做题（不计入正确率分母）" />
                )}
              </>
            ) : (
              <Alert type="info" message="选择作业后可抽样预览" />
            )}
          </Card>
        </Col>
        {report ? (
          <Col span={14}>
            <Card size="small" title="📊 作业学情汇总 · 按知识点聚合">
              <Row gutter={10} style={{ marginBottom: 8 }}>
                <Col span={8}><div className="pp_kpi"><small>完成率</small><b>{report.overall.completion}%</b></div></Col>
                <Col span={8}><div className="pp_kpi"><small>必做题正确率</small><b>{report.overall.required_acc}%</b></div></Col>
                <Col span={8}><div className="pp_kpi"><small>选做题正确率</small><b>{report.overall.optional_acc}%</b></div></Col>
              </Row>
              <Table
                columns={reportCols}
                dataSource={report.by_cluster || []}
                rowKey="cluster"
                pagination={false}
                size="small"
                tableLayout="fixed"
              />
              <p style={{ fontSize: 11, color: "#8a94a8", marginTop: 6 }}>
                回流：{report.ingest_receipt?.accepted || 0} 条作答已写入学情事件 → <a onClick={() => message.info("请到学情画像页查看更新")}>查看画像</a>
              </p>
            </Card>
          </Col>
        ) : null}
      </Row>
    </div>
  );
};

export default connect((state: any) => ({
  classes: state.personalizedPaperModel?.classes,
  homeworkList: state.personalizedPaperModel?.homeworkList,
  detail: state.personalizedPaperModel?.detail,
  paper: state.personalizedPaperModel?.paper,
  report: state.personalizedPaperModel?.report,
  loading: state.personalizedPaperModel?.loading,
  generateLoading: state.personalizedPaperModel?.generateLoading,
  detailLoading: state.personalizedPaperModel?.detailLoading,
  reportLoading: state.personalizedPaperModel?.reportLoading,
}))(PersonalizedPaper);
