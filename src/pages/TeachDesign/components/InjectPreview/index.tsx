import { useEffect, useState } from "react";
import { Alert, message, Select, Table } from "antd";
import { useLocation } from "@umijs/max";
import { replacePageQuery } from "@/utils/pageQuery";
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
  const [error, setError] = useState("");
  const [chapterClassId, setChapterClassId] = useState("");
  const location = useLocation();
  const fromQuery = new URLSearchParams(location.search).get("class_id");

  // 班级 + 可用章节（支持从学情分析页跳转带入班级：/design?class_id=xxx）
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/teacher/classes", { signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        if (controller.signal.aborted) return;
        if (d.code === 200 && Array.isArray(d.data)) {
          setClasses(d.data);
          const preset = d.data.find((c: any) => c.class_id === fromQuery);
          setClassId(preset ? preset.class_id : (d.data[0]?.class_id || ""));
          if (preset) message.info(`已带入「${preset.class_name}」的班级学情，预览将注入教案生成`);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [fromQuery]);

  // 章节跟随班级：来自该班画像的真实章节（学情驱动）
  useEffect(() => {
    if (!classId) return;
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setChapter("");
    setChapters([]);
    setInject(null);
    setError("");
    fetch(`/api/teacher/teaching/class-chapters?class_id=${encodeURIComponent(classId)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(async d => {
        if (controller.signal.aborted) return;
        if (!(d.code === 200 && Array.isArray(d.data) && d.data.length)) {
          // 无画像班级回退到通用章节列表
          d = await fetch("/api/teacher/teaching/chapters", { signal: controller.signal }).then(r => r.json());
        }
        if (controller.signal.aborted) return;
        if (d.code !== 200) throw new Error(d.msg || "章节加载失败");
        const items = Array.isArray(d.data) ? d.data : [];
        setChapters(items);
        setChapter(items[0]?.chapter || "");
        setChapterClassId(classId);
      })
      .catch(() => { if (active) setError("章节加载失败，请重新选择班级"); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [classId]);

  useEffect(() => {
    if (!chapter || !classId || chapterClassId !== classId) { setLoading(false); return; }
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setLoading(true);
    setInject(null);
    setError("");
    fetch(`/api/teacher/teaching/inject-file?chapter=${encodeURIComponent(chapter)}&class_id=${encodeURIComponent(classId)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { if (d.code !== 200) throw new Error(d.msg); if (active) setInject(d.data); })
      .catch(() => { if (active) setError("学情预览加载失败，请重新选择班级或章节"); })
      .finally(() => { clearTimeout(timeout); if (active) setLoading(false); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [chapter, classId, chapterClassId]);

  const cols = [
    { title: "前置知识点", dataIndex: "前置知识点", ellipsis: true },
    { title: "班级掌握分布", dataIndex: "班级掌握分布", width: 130 },
    { title: "典型错例", dataIndex: "典型错例（匿名）", ellipsis: true,
      render: (t: string) => <span style={{ fontSize: 12, color: "#8a94a8" }}>{t}</span> },
  ];

  if (!classes.length) return null;

  return (
    <div className="inject_preview_card" style={{ marginTop: 12, width: 800, maxWidth: "100%" }}>
      <div className="inject_preview_head">
        <div className="inject_preview_title">
          <span className="accent" />
          班级学情
          <span className="sub">学情预览 · 注入教案生成（前置知识点 / 掌握分布 / 典型错例）</span>
        </div>
        <div className="inject_preview_selects">
          <Select size="small" style={{ width: 150 }} value={classId} onChange={(value) => {
            setClassId(value);
            replacePageQuery({ class_id: value, from: "analysis" });
          }}
            placeholder="选择班级"
            options={classes.map(c => ({ value: c.class_id, label: c.class_name }))} />
          <Select size="small" style={{ width: 200 }} value={chapter} onChange={setChapter}
            placeholder="选择章节"
            options={chapters.map(c => ({ value: c.chapter, label: c.chapter }))} />
        </div>
      </div>
      <div className="inject_preview_body">
        {error ? <Alert type="error" message={error} showIcon /> : null}
        <Table loading={loading} columns={cols} dataSource={Array.isArray(inject?.rows) ? inject.rows : []}
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
