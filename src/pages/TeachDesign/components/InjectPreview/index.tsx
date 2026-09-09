import { useEffect, useState } from "react";
import { Alert, Select, Table } from "antd";
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
  const [loading, setLoading] = useState(false);

  // 班级 + 可用章节（支持从学情分析页跳转带入班级：/design?class_id=xxx）
  useEffect(() => {
    fetch("/api/teacher/classes")
      .then(r => r.json())
      .then(d => {
        if (d.code === 200) {
          setClasses(d.data || []);
          const fromQuery = new URLSearchParams(window.location.search).get("class_id");
          const preset = (d.data || []).find((c: any) => c.class_id === fromQuery);
          setClassId(preset ? preset.class_id : (d.data?.[0]?.class_id || ""));
          if (preset) message.info(`已带入「${preset.class_name}」的班级学情，预览将注入教案生成`);
        }
      })
      .catch(() => {});
  }, []);

  // 章节跟随班级：来自该班画像的真实章节（学情驱动）
  useEffect(() => {
    if (!classId) return;
    setChapter("");
    fetch(`/api/teacher/teaching/class-chapters?class_id=${classId}`)
      .then(r => r.json())
      .then(d => {
        if (d.code === 200 && d.data?.length) {
          setChapters(d.data);
          setChapter(d.data[0].chapter);
        } else {
          // 无画像班级回退到通用章节列表
          fetch("/api/teacher/teaching/chapters")
            .then(r2 => r2.json())
            .then(d2 => { if (d2.code === 200) { setChapters(d2.data || []); setChapter(d2.data?.[0]?.chapter || ""); } });
        }
      })
      .catch(() => {});
  }, [classId]);

  useEffect(() => {
    if (!chapter || !classId) return;
    setLoading(true);
    fetch(`/api/teacher/teaching/inject-file?chapter=${encodeURIComponent(chapter)}&class_id=${classId}`)
      .then(r => r.json())
      .then(d => { if (d.code === 200) setInject(d.data); })
      .finally(() => setLoading(false));
  }, [chapter, classId]);

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
        {/* 下发动作在生成并查看内容之后提供：教案页「布置作业」、学案页「学案下发」 */}
      </div>
    </div>
  );
};

export default InjectPreview;
