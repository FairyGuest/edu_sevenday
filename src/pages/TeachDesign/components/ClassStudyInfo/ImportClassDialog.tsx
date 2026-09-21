import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Modal, Select, Tag } from "antd";

export type ImportedClass = {
  class_id: string;
  class_name: string;
  subject?: string;
  grade?: string;
  profile: any;
  chapter: string;
  chapters: any[];
  preview: any;
};

async function readData(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  const result = await response.json();
  if (!response.ok || result.code !== 200)
    throw new Error(result.msg || "学情加载失败，请重试");
  return result.data;
}

export default function ImportClassDialog({
  imported,
  subject,
  onConfirm,
  onClose,
}: {
  imported: ImportedClass[];
  subject?: string;
  onConfirm: (classes: ImportedClass[]) => void;
  onClose: () => void;
}) {
  const [classes, setClasses] = useState<any[]>([]);
  const [selected, setSelected] = useState(imported.map((c) => c.class_id));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);
  const request = useRef<AbortController>();

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    setLoading(true);
    setError("");
    readData("/api/teacher/classes", controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setClasses(Array.isArray(data) ? data : []);
      })
      .catch((e) =>
        setError(e.name === "AbortError" ? "班级加载超时，请重试" : e.message),
      )
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);
  useEffect(() => () => request.current?.abort(), []);

  const available = classes.filter(
    (c) => !subject || !c.subject || c.subject === subject,
  );
  const validSelection = selected.every((id) =>
    available.some((c) => c.class_id === id),
  );
  const submit = async () => {
    if (busy.current || !selected.length || !validSelection) return;
    busy.current = true;
    setSaving(true);
    setError("");
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const results = await Promise.all(
        selected.map(async (id) => {
          const cls = available.find((c) => c.class_id === id);
          const existing = imported.find((c) => c.class_id === id);
          if (existing) return existing;
          const query = encodeURIComponent(id);
          const [profile, chapters] = await Promise.all([
            readData(
              `/api/teacher/profile/class?class_id=${query}&sources=`,
              controller.signal,
            ),
            readData(
              `/api/teacher/teaching/class-chapters?class_id=${query}`,
              controller.signal,
            ),
          ]);
          const chapter = chapters?.[0]?.chapter || "";
          const preview = chapter
            ? await readData(
                `/api/teacher/teaching/inject-file?class_id=${query}&chapter=${encodeURIComponent(chapter)}`,
                controller.signal,
              )
            : { rows: [], empty: true, empty_hint: "暂无可参考学情" };
          return {
            ...cls,
            profile: {
              cards: profile?.cards,
              cluster_rows: profile?.cluster_rows,
            },
            chapters: chapters || [],
            chapter,
            preview,
          };
        }),
      );
      onConfirm(results);
    } catch (e: any) {
      setError(e.name === "AbortError" ? "学情导入超时，请重试" : e.message);
    } finally {
      clearTimeout(timeout);
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title="导入班级学情"
      onCancel={() => {
        if (!busy.current) onClose();
      }}
      onOk={submit}
      okText={`确认导入${selected.length ? `（${selected.length}）` : ""}`}
      cancelText="取消"
      confirmLoading={saving}
      okButtonProps={{
        disabled: loading || !selected.length || !validSelection,
      }}
      cancelButtonProps={{ disabled: saving }}
      closable={!saving}
      maskClosable={!saving}
      keyboard={!saving}
    >
      <p style={{ color: "#7c879b", margin: "16px 0" }}>
        可多选任教班级。导入后可分别查看学情，生成教案时将参考所有已导入班级。
      </p>
      <Form layout="vertical">
        <Form.Item label="选择班级" required>
          <Select
            mode="multiple"
            aria-label="选择导入班级"
            placeholder="搜索并选择班级，可多选"
            value={selected}
            onChange={setSelected}
            loading={loading}
            disabled={saving || loading}
            showSearch
            optionFilterProp="label"
            style={{ width: "100%" }}
            options={available.map((c) => ({
              value: c.class_id,
              label: c.class_name,
            }))}
            notFoundContent={loading ? "正在加载班级…" : "暂无可导入的任教班级"}
          />
        </Form.Item>
      </Form>
      {imported.length > 0 && (
        <div style={{ marginBottom: 12, color: "#7c879b" }}>
          已导入：
          {imported.map((c) => (
            <Tag key={c.class_id}>{c.class_name}</Tag>
          ))}
        </div>
      )}
      {!loading && !available.length && !error && (
        <Alert type="info" showIcon message="当前学科暂无可导入的班级" />
      )}
      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          action={
            <Button
              size="small"
              disabled={saving}
              onClick={() => setAttempt((n) => n + 1)}
            >
              重试
            </Button>
          }
        />
      )}
    </Modal>
  );
}
