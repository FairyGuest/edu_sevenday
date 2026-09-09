import { useEffect, useState } from "react";
import {
  Alert, Button, Card, Col, Input, message, Row, Select, Spin, Table, Tabs, Tag,
} from "antd";
import {
  BookOutlined, DesktopOutlined, UploadOutlined,
} from "@ant-design/icons";
import "./index.less";

/**
 * F6 资源平台补齐：题库（公共/个人挂载状态）+ 教案列表 + 课件大纲。
 */
const ResourcePlatform = () => {
  const [tab, setTab] = useState("bank");
  const [questions, setQuestions] = useState<any[]>([]);
  const [personalBank, setPersonalBank] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [uploadStem, setUploadStem] = useState("");
  const [loading, setLoading] = useState(false);
  const [cluster, setCluster] = useState("");
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    fetch("/api/teacher/import/questions?subject=%E6%95%B0%E5%AD%A6").then(r => r.json())
      .then(d => { if (d.code === 200) setQuestions(d.data.slice(0, 30)); });
    fetch("/api/teacher/resource/personal-bank").then(r => r.json())
      .then(d => { if (d.code === 200) setPersonalBank(d.data); });
    fetch("/api/teacher/resource/plans").then(r => r.json())
      .then(d => { if (d.code === 200) setPlans(d.data); });
  }, []);

  const upload = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/resource/personal-bank/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stem: uploadStem.trim() || undefined }),
      });
      const d = await res.json();
      if (d.code === 200) {
        message.info(d.data.status === "mounted"
          ? `挂载成功 conf=${d.data.conf} → 已入推荐池`
          : `复检隔离 conf=${d.data.conf} < 0.5`);
        setUploadStem("");
        const refreshed = await fetch("/api/teacher/resource/personal-bank").then(r => r.json());
        if (refreshed.code === 200) setPersonalBank(refreshed.data);
      }
    } finally { setLoading(false); }
  };

  const qCols = [
    { title: "题干", dataIndex: "stem", ellipsis: true },
    { title: "知识点", dataIndex: "cluster", width: 130, ellipsis: true },
    { title: "", width: 70, render: () => <Button size="small" type="link">相似题</Button> },
  ];

  const personalCols = [
    { title: "题干", dataIndex: "stem", ellipsis: true },
    { title: "挂载知识点", dataIndex: "cluster", width: 120 },
    { title: "置信度", dataIndex: "conf", width: 70 },
    { title: "状态", dataIndex: "status_zh", width: 160,
      render: (t: string, r: any) => (
        <Tag color={r.status === "mounted" ? "success" : "warning"}>{t}</Tag>
      ) },
  ];

  const planCols = [
    { title: "教案", dataIndex: "chapter", ellipsis: true },
    { title: "版本", dataIndex: "version", width: 60, render: (t: string) => <Tag>{t}</Tag> },
    { title: "创建时间", dataIndex: "created_at", width: 150 },
    { title: "下发次数", dataIndex: "n_issues", width: 80 },
  ];

  const cwCols = [
    { title: "章节", dataIndex: "chapter", ellipsis: true },
    { title: "版本", dataIndex: "version", width: 60 },
    { title: "大纲", dataIndex: "courseware",
      render: (cw: string[]) => cw?.length ? (
        <ul style={{ margin: 0, paddingLeft: 14, fontSize: 12 }}>
          {cw.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      ) : "—" },
    { title: "", width: 110, render: () => (
      <Button size="small" disabled style={{ opacity: 0.5 }}>生成PPT（待开发）</Button>
    )},
  ];

  const stats = personalBank?.stats || {};

  return (
    <div className="rp_container">
      <Tabs activeKey={tab} onChange={setTab} items={[
        { key: "bank", label: "📚 题库" },
        { key: "plans", label: "📖 教案" },
        { key: "cw", label: "🖥 课件" },
      ]} />

      {tab === "bank" && (
        <Row gutter={12}>
          <Col span={14}>
            <Card size="small" title="公共题库（数学）">
              <Table columns={qCols} dataSource={questions} rowKey="qid"
                pagination={{ pageSize: 8 }} size="small" tableLayout="fixed" />
            </Card>
          </Col>
          <Col span={10}>
            <Card size="small" title="个人题库 · 上传挂载"
              extra={<Tag color={stats.mounted > 0 ? "success" : "default"}>
                {stats.mounted || 0} 挂载 / {stats.recheck || 0} 复检
              </Tag>}>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <Input size="small" placeholder="输入题干（留空随机生成）"
                  value={uploadStem} onChange={e => setUploadStem(e.target.value)}
                  style={{ flex: 1 }} />
                <Button size="small" type="primary" icon={<UploadOutlined />}
                  loading={loading} onClick={upload}>上传</Button>
              </div>
              <Table columns={personalCols} dataSource={personalBank?.items || []}
                rowKey="qid" pagination={{ pageSize: 5 }} size="small" tableLayout="fixed" />
            </Card>
          </Col>
        </Row>
      )}

      {tab === "plans" && (
        <Card size="small" title={<span><BookOutlined /> 历史生成的全部教案</span>}
          extra={<span style={{ fontSize: 12, color: "#8a94a8" }}>与教学设计增强模块同源</span>}>
          <Table columns={planCols} dataSource={plans} rowKey="plan_id"
            pagination={false} size="small" tableLayout="fixed" />
        </Card>
      )}

      {tab === "cw" && (
        <Card size="small" title={<span><DesktopOutlined /> 课件大纲 · PPT 生成待开发</span>}>
          <Table columns={cwCols} dataSource={plans} rowKey="plan_id"
            pagination={false} size="small" tableLayout="fixed" />
        </Card>
      )}
    </div>
  );
};

export default ResourcePlatform;
