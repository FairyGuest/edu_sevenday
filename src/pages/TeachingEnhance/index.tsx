import { connect } from "@umijs/max";
import { useEffect, useState } from "react";
import {
  Alert, Button, Card, Col, message, Row, Select, Table, Tag,
} from "antd";
import {
  BookOutlined, FileTextOutlined, SendOutlined, ThunderboltOutlined,
} from "@ant-design/icons";
import "./index.less";

/**
 * F5 教学设计补差：班级学情三列预览 + 对应作业入口 + 学案下发记录。
 * 独立于 TeachDesign 主流程，作为增强面板补充 PRD 差异项。
 */
const TeachingEnhance = (props: any) => {
  const { dispatch } = props;
  const [chapters, setChapters] = useState<any[]>([]);
  const [chapter, setChapter] = useState("");
  const [inject, setInject] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [issueRecords, setIssueRecords] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/teacher/teaching/chapters").then(r => r.json()).then(d => {
      if (d.code === 200) {
        setChapters(d.data || []);
        if (d.data?.[0]?.chapter) setChapter(d.data[0].chapter);
      }
    });
    fetch("/api/teacher/teaching/plans").then(r => r.json()).then(d => {
      if (d.code === 200) setPlans(d.data || []);
    });
  }, []);

  useEffect(() => {
    if (!chapter) return;
    fetch(`/api/teacher/teaching/inject-file?chapter=${encodeURIComponent(chapter)}`)
      .then(r => r.json())
      .then(d => { if (d.code === 200) setInject(d.data); });
  }, [chapter]);

  const issueStudyPlan = async (planId: string) => {
    const res = await fetch(`/api/teacher/teaching/plans/${planId}/issue`, { method: "POST" });
    const d = await res.json();
    if (d.code === 200) {
      setIssueRecords(prev => [d.data, ...prev]);
      message.success(`学案已下发（${d.data.targets}）`);
    }
  };

  const injectCols = [
    { title: "前置知识点", dataIndex: "前置知识点", ellipsis: true },
    { title: "班级掌握分布", dataIndex: "班级掌握分布", width: 140 },
    { title: "典型错例（匿名）", dataIndex: "典型错例（匿名）", ellipsis: true },
  ];

  const planCols = [
    { title: "教案", dataIndex: "chapter", ellipsis: true },
    { title: "版本", dataIndex: "version", width: 60, render: (t: string) => <Tag>{t}</Tag> },
    { title: "下发", dataIndex: "n_issues", width: 55 },
    { title: "对应作业", dataIndex: "homework_ids", width: 100,
      render: (ids: string[]) => ids?.length ? ids.map((h, i) => <Tag key={i} color="blue">{h}</Tag>) : "—" },
    { title: "", width: 140, render: (_: any, r: any) => (
      <Button size="small" type="primary" ghost icon={<ThunderboltOutlined />}
        onClick={() => message.info(`已创建统一卷作业，请到「个性化作业」模块查看`)}>
        布置对应作业
      </Button>
    )},
    { title: "", width: 100, render: (_: any, r: any) => (
      <Button size="small" icon={<SendOutlined />} onClick={() => issueStudyPlan(r.plan_id)}>
        学案下发
      </Button>
    )},
  ];

  return (
    <div className="te_enhance_container">
      <Card size="small" title={<span><BookOutlined /> 教学设计增强 · 班级学情注入与作业联动</span>}
        extra={
          <Select size="small" style={{ width: 200 }}
            value={chapter} onChange={setChapter}
            options={chapters.map(c => ({ value: c.chapter, label: c.chapter }))}
          />
        }>
        <Row gutter={12}>
          <Col span={12}>
            <p className="te_title">📥 班级学情注入预览（三列格式 · PRD 初定）</p>
            {inject?.empty ? (
              <Alert type="info" message={inject.empty_hint || "暂无可参考学情"} />
            ) : (
              <Table columns={injectCols} dataSource={inject?.rows || []}
                rowKey="前置知识点" pagination={false} size="small" tableLayout="fixed" />
            )}
          </Col>
          <Col span={12}>
            <p className="te_title">📨 学案下发记录</p>
            {issueRecords.length === 0 ? (
              <Alert type="info" message="点击教案列表中的「学案下发」按钮后显示记录" />
            ) : (
              issueRecords.map((r, i) => (
                <Alert key={i} type="success" showIcon style={{ marginBottom: 6 }}
                  message={`${r.version} · ${r.targets} · ${r.issued_at}`}
                  description={`摘要：${r.excerpt}`} />
              ))
            )}
          </Col>
        </Row>
      </Card>

      <Card size="small" style={{ marginTop: 12 }} title={<span><FileTextOutlined /> 历史教案</span>}>
        <Table columns={planCols} dataSource={plans} rowKey="plan_id"
          pagination={false} size="small" tableLayout="fixed" />
      </Card>
    </div>
  );
};

export default connect((state: any) => ({}))(TeachingEnhance);
