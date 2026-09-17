import { useEffect, useRef, useState } from "react";
import { Alert, Button, Modal, Select, Spin } from "antd";

type ClassOption = { value: string; label: string };

export default function AssignHomeworkDialog({ defaultClassId, docTitle, onPublish, onClose }: {
  defaultClassId?: string;
  docTitle: string;
  onPublish: (classId: string) => Promise<unknown> | void;
  onClose: () => void;
}) {
  const [options, setOptions] = useState<ClassOption[]>([]);
  const [classId, setClassId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [publishError, setPublishError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const publishingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    setLoading(true);
    setLoadError("");
    setClassId(undefined);
    (async () => {
      try {
        const response = await fetch("/api/teacher/classes", { signal: controller.signal });
        const result = await response.json();
        if (!response.ok || result.code !== 200 || !Array.isArray(result.data)) {
          throw new Error(result.msg || "班级加载失败，请重试");
        }
        if (disposed) return;
        const classes: ClassOption[] = Array.from(new Map<string, ClassOption>(result.data
          .filter((item: any) => item && typeof item.class_id === "string" && item.class_id)
          .map((item: any) => [item.class_id, { value: item.class_id, label: item.class_name || item.class_id }] as [string, ClassOption])).values());
        setOptions(classes);
        setClassId(classes.some(item => item.value === defaultClassId) ? defaultClassId : undefined);
      } catch (error) {
        if (!disposed) setLoadError(error instanceof Error && error.name !== "AbortError" ? error.message : "班级加载超时，请重试");
      } finally {
        window.clearTimeout(timeout);
        if (!disposed) setLoading(false);
      }
    })();
    return () => { disposed = true; window.clearTimeout(timeout); controller.abort(); };
  }, [defaultClassId, attempt]);

  const publish = async () => {
    if (publishingRef.current || loading || loadError || !options.some(item => item.value === classId)) return;
    publishingRef.current = true;
    setPublishing(true);
    setPublishError("");
    try {
      await onPublish(classId!);
      onClose();
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "发布失败，请重试");
    } finally {
      publishingRef.current = false;
      setPublishing(false);
    }
  };

  return <Modal
    open title="选择班级发布作业" zIndex={1100}
    okText="确认发布" cancelText="取消" onOk={publish}
    onCancel={() => { if (!publishingRef.current) onClose(); }}
    confirmLoading={publishing} closable={!publishing} maskClosable={!publishing} keyboard={!publishing}
    cancelButtonProps={{ disabled: publishing }}
    okButtonProps={{ disabled: loading || !!loadError || !classId || !options.some(item => item.value === classId) }}
  >
    <p className="plan_assignment_title">{docTitle}</p>
    <p>将教案中的习题发布给所选班级，发布后可在「作业下发」查看。</p>
    {loading ? <Spin tip="正在加载班级"><div style={{ height: 80 }} /></Spin> : loadError ?
      <Alert type="error" showIcon message={loadError} action={<Button onClick={() => setAttempt(n => n + 1)}>重试</Button>} /> :
      options.length === 0 ? <Alert type="info" showIcon message="暂无可发布的班级，请先添加任教班级" action={<Button onClick={() => setAttempt(n => n + 1)}>刷新</Button>} /> : <>
        <label htmlFor="plan-assignment-class">发布班级</label>
        <Select id="plan-assignment-class" style={{ width: "100%", margin: "8px 0 12px" }}
          placeholder="请选择发布班级" options={options} value={classId} showSearch optionFilterProp="label"
          disabled={publishing} onChange={value => { setClassId(value); setPublishError(""); }} />
        {defaultClassId && <Alert type="info" showIcon message={options.some(item => item.value === defaultClassId)
          ? `教案关联学情：${options.find(item => item.value === defaultClassId)!.label}，已默认选中，可改选其他班级。`
          : "教案关联的学情班级当前不可用，请重新选择发布班级。"} />}
      </>}
    {publishError && <Alert style={{ marginTop: 12 }} type="error" showIcon message={publishError} />}
  </Modal>;
}
