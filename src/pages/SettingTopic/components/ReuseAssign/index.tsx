import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, message, Modal, Row, Select, Spin, Table, Tag, Tooltip } from "antd";
import { ArrowRightOutlined, TeamOutlined, ThunderboltOutlined } from "@ant-design/icons";
import MarkdownRender from "@/components/MarkdownRender";
import "./index.less";

/**
 * 作业下发 · 跨班复用：
 * 老师在组卷页生成的作业（如七班）可在此复用——点开查看摘要与抽样，
 * 一键「下发到其他班」：个性化作业按目标班学情重算每人一单（复用组卷配置），
 * 统一作业（全班同卷）直接下发。
 */

const MODE_ZH: Record<string, string> = {
  personalized: "🎯 个性化（每人一单）",
  plan: "📘 教案作业（全班同卷）",
  chapter: "📗 章节作业（全班同卷）",
  unified: "📖 教案同步",
};

export default function ReuseAssign({ classes }: { classes: any[] }) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hwId, setHwId] = useState<string>("");
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [targetClass, setTargetClass] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  const loadList = async () => {
    setLoading(true);
    try {
      const d = await fetch("/api/teacher/recommend/homework").then(r => r.json());
      if (d.code === 200) setList(d.data || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadList(); }, []);

  useEffect(() => {
    if (!hwId) { setDetail(null); return; }
    setDetailLoading(true);
    fetch(`/api/teacher/recommend/homework/${hwId}`)
      .then(r => r.json())
      .then(d => { if (d.code === 200) setDetail(d.data); })
      .finally(() => setDetailLoading(false));
  }, [hwId]);

  // 目标班：排除作业原班
  const targetOptions = useMemo(() => {
    const origin = detail?.class_id;
    return (classes || []).filter(c => c.class_id !== origin);
  }, [classes, detail?.class_id]);

  const assignToClass = () => {
    if (!hwId || !targetClass) return;
    const target = classes.find(c => c.class_id === targetClass);
    const sameKind = detail?.mode === "personalized" ? "按八班学情重算每人一单" : "同卷直接下发";
    Modal.confirm({
      title: `下发到「${target?.class_name || targetClass}」？`,
      content: detail?.mode === "personalized"
        ? "个性化作业将复用组卷配置（方针/题量），按目标班级学情为每名学生重新组卷。"
        : "全班同卷作业将原卷下发给目标班级。",
      okText: "确认下发",
      cancelText: "取消",
      onOk: async () => {
        setAssigning(true);
        try {
          const d = await fetch("/api/teacher/recommend/assign-to-class", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ homework_id: hwId, target_class_id: targetClass }),
          }).then(r => r.json());
          if (d.code === 200) {
            message.success(`已下发到 ${d.data.target_class_name}（${d.data.n_students}人 · 新作业 ${d.data.homework_id}）`);
            loadList();
            setTargetClass("");
          } else {
            message.error(d.msg || "下发失败");
          }
        } finally { setAssigning(false); }
      },
    });
  };

  const listCols = [
    { title: "作业", dataIndex: "title", ellipsis: true,
      render: (t: string, r: any) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <TeamOutlined style={{ color: "var(--g-accent)" }} />
          {t || r.homework_id}
        </span>
      ) },
    { title: "来源班级", dataIndex: "class_name", width: 110 },
    { title: "类型", dataIndex: "mode", width: 150, render: (t: string) => MODE_ZH[t] || t },
    { title: "状态", dataIndex: "status", width: 80,
      render: (t: string) => <Tag color={t === "published" ? "success" : t === "reported" ? "processing" : "default"}>{t === "published" ? "已下发" : t === "reported" ? "已出报告" : "待下发"}</Tag> },
    { title: "人数", dataIndex: "n_students", width: 60 },
    { title: "", width: 70, render: (_: any, r: any) => (
      <a onClick={() => { setHwId(r.homework_id); setTargetClass(""); }}>复用 ›</a>
    )},
  ];

  return (
    <div className="reuse_assign">
      <Alert type="info" showIcon style={{ marginBottom: 12 }}
        message="跨班复用：选择任一班级的作业，一键下发到其他班级（个性化作业按目标班学情重算）" />

      <Card size="small" title={<><ThunderboltOutlined /> 作业列表（全部班级）</>} loading={loading}>
        <Table columns={listCols} dataSource={list} rowKey="homework_id"
          onRow={(r) => ({ onClick: () => { setHwId(r.homework_id); setTargetClass(""); }, style: { cursor: "pointer" } })}
          pagination={false} size="small" tableLayout="fixed" />
      </Card>

      {hwId ? (
        <Card size="small" className="reuse_detail" loading={detailLoading}
          title={`作业详情 · ${hwId}`}
          extra={
            <div className="reuse_actions">
              <Select size="small" style={{ width: 170 }} value={targetClass || undefined}
                onChange={setTargetClass} placeholder="选择要下发到的班级"
                options={targetOptions.map(c => ({ value: c.class_id, label: c.class_name }))} />
              <Tooltip title={detail?.mode === "personalized" ? "按目标班学情重算每人一单" : "同卷直接下发"}>
                <Button size="small" type="primary" icon={<ArrowRightOutlined />}
                  disabled={!targetClass} loading={assigning} onClick={assignToClass}>
                  下发到该班
                </Button>
              </Tooltip>
            </div>
          }>
          {detail ? (
            <Row gutter={10}>
              <Col span={6}><div className="g-kv"><small>来源班级</small><b>{detail.class_name || detail.class_id}</b></div></Col>
              <Col span={6}><div className="g-kv"><small>学生数</small><b>{detail.summary?.n_students ?? "—"}</b></div></Col>
              <Col span={6}><div className="g-kv"><small>题量区间</small><b>{detail.summary?.q_count ? `${detail.summary.q_count.min}–${detail.summary.q_count.max}` : "—"}</b></div></Col>
              <Col span={6}><div className="g-kv"><small>类型</small><b style={{ fontSize: 13 }}>{MODE_ZH[detail.mode] || detail.mode}</b></div></Col>
            </Row>
          ) : (
            <Alert type="info" message="选择作业后显示详情" />
          )}
          {detail?.unified_items?.length ? (
            <Table className="reuse_paper" size="small" tableLayout="fixed"
              columns={[
                { title: "#", width: 36, render: (_: any, __: any, i: number) => i + 1 },
                { title: "题目", dataIndex: "stem",
                  render: (t: string) => <div className="teacher_profile_stem"><MarkdownRender>{t}</MarkdownRender></div> },
                { title: "知识点", dataIndex: "cluster", width: 120, ellipsis: true },
              ]}
              dataSource={detail.unified_items} rowKey="qid" pagination={false} />
          ) : null}
          {detail?.students?.length ? (
            <p className="reuse_hint">个性化作业（每人一单）：目标班下发时将按该班学情重新组卷，抽样可在「作业组卷 → 个性化组卷」查看。</p>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
