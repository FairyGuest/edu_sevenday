import { useEffect, useState } from "react";
import { Alert, Button, Select, Table, Tooltip, message } from "antd";
import { SendOutlined, ThunderboltOutlined } from "@ant-design/icons";
import "./index.less";

/**
 * F5 合并版：班级学情预览（注入教案生成）+ 布置对应作业 + 学案下发。
 * 嵌入 TeachDesign 主页面：选班级+章节后预览知识点掌握/高频错误，
 * 无学情展示"暂无可参考学情"，教案将按通用模式生成。
 */
const InjectPreview = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState<string>("");
  const [chapters, setChapters] = useState<any[]>([]);
  const [chapter, setChapter] = useState<string>("");
  const [inject, setInject] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [assigned, setAssigned] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 班级 + 可用章节
  useEffect(() => {
    fetch("/api/teacher/classes")
      .then(r => r.json())
      .then(d => { if (d.code === 200) { setClasses(d.data || []); setClassId(d.data?.[0]?.class_id || ""); } })
      .catch(() => {});
    fetch("/api/teacher/teaching/chapters")
      .then(r => r.json())
      .then(d => {
        if (d.code === 200 && d.data?.length) {
          setChapters(d.data);
          setChapter(d.data[0].chapter);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!chapter || !classId) return;
    setLoading(true);
    setAssigned(null);
    fetch(`/api/teacher/teaching/inject-file?chapter=${encodeURIComponent(chapter)}&class_id=${classId}`)
      .then(r => r.json())
      .then(d => { if (d.code === 200) setInject(d.data); })
      .finally(() => setLoading(false));
  }, [chapter, classId]);

  const issuePlan = async () => {
    const res = await fetch("/api/teacher/teaching/plans", { method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapter, class_id: classId }) });
    const d = await res.json();
    if (d.code === 200) {
      setIssues(prev => [d.data, ...prev]);
      message.success(`学案已下发（${d.data.targets}）`);
    }
  };

  const assignHomework = async () => {
    setAssigning(true);
    try {
      const res = await fetch("/api/teacher/teaching/assign-homework", { method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter, class_id: classId }) });
      const d = await res.json();
      if (d.code === 200) {
        setAssigned(d.data);
        message.success(`已注入 ${d.data.n_questions} 道题生成试卷，可到「作业布置」查看`);
      }
    } finally {
      setAssigning(false);
    }
  };

  const cols = [
    { title: "前置知识点", dataIndex: "前置知识点", ellipsis: true },
    { title: "掌握分布", dataIndex: "班级掌握分布", width: 130 },
    { title: "典型错例（匿名）", dataIndex: "典型错例（匿名）", ellipsis: true,
      render: (t: string) => <span style={{ fontSize: 12, color: "#8a94a8" }}>{t}</span> },
  ];

  if (!chapters.length) return null;

  return (
    <div className="inject_preview_card" style={{ marginBottom: 12 }}>
      <div className="inject_preview_head">
        <div className="inject_preview_title">
          <span className="accent" />
          班级学情预览
          <span className="sub">注入教案生成 · 相关知识点 / 掌握程度 / 高频错误</span>
        </div>
        <div className="inject_preview_selects">
          <Select size="small" style={{ width: 150 }} value={classId} onChange={setClassId}
            placeholder="选择班级"
            options={classes.map(c => ({ value: c.class_id, label: c.class_name }))} />
          <Select size="small" style={{ width: 200 }} value={chapter} onChange={setChapter}
            placeholder="选择章节"
            options={chapters.map(c => ({ value: c.chapter, label: c.chapter }))} />
        </div>
      </div>
      <div className="inject_preview_body">
        <Table loading={loading} columns={cols} dataSource={inject?.rows || []}
          rowKey="前置知识点" pagination={false} size="small" tableLayout="fixed"
          locale={{ emptyText: " " }} />
        {inject?.empty ? (
          <Alert type="info" showIcon style={{ marginTop: 8 }}
            message={inject.empty_hint || "暂无可参考学情（教案将按通用模式生成）"} />
        ) : null}
        <div className="inject_preview_actions">
          <Tooltip title={assigned ? `试卷 ${assigned.homework_id} · ${assigned.n_questions} 题` : "按本章薄弱知识点选题并注入试卷"}>
            <Button size="small" type="primary" icon={<ThunderboltOutlined />}
              loading={assigning}
              onClick={assignHomework}
              disabled={!inject || inject.empty}>
              布置对应作业
            </Button>
          </Tooltip>
          <Button size="small" type="primary" ghost icon={<SendOutlined />}
            onClick={issuePlan}
            disabled={!inject || inject.empty}>
            学案下发
          </Button>
        </div>
        {assigned ? (
          <Alert type="success" showIcon style={{ marginTop: 8 }}
            message={`已生成试卷（${assigned.n_questions} 题）：${assigned.injected_from}，请到「作业布置」模块查看`} />
        ) : null}
        {issues.map((r, i) => (
          <Alert key={i} type="success" showIcon style={{ marginTop: 6 }}
            message={`学案已下发：${r.targets} · ${r.issued_at}`} />
        ))}
      </div>
    </div>
  );
};

export default InjectPreview;
