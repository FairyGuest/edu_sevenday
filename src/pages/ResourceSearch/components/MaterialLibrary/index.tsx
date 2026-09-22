import { useEffect, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "@umijs/max";
import { Alert, Button, Empty, Input, Modal, Select, Spin, Tag } from "antd";
import {
  BookOutlined,
  DesktopOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./index.less";
import LearningContent from "@/components/LearningContent";

export type Material = {
  id: string;
  type: "plans" | "courseware";
  title: string;
  knowledge_ids: string[];
  grade: string;
  subject: string;
  chapter: string;
  summary: string;
  format: string;
  author: string;
  updated_at: string;
  is_demo: boolean;
  file_url: string | null;
  preview: { title: string; content: string }[];
};
export const gradeLabels: Record<string, string> = {
  all: "全部年级",
  g7: "七年级",
  g8: "八年级",
  g9: "九年级",
};

export async function resourceJSON(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`请求失败（${response.status}）`);
  const result = await response.json();
  if (result.code !== 200) throw new Error(result.msg || "资源暂不可用");
  return result.data;
}

export function useMaterials(
  node?: string | null,
  grade = "all",
  type = "all",
  enabled = true,
) {
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setItems([]);
    setError("");
    setLoading(enabled);
    if (!enabled) return;
    const timer = setTimeout(() => controller.abort(), 8000);
    const query = new URLSearchParams({ grade, type });
    if (node) query.set("node", node);
    resourceJSON(`/api/teacher/resource/materials?${query}`, {
      signal: controller.signal,
    })
      .then((data) => {
        if (active) setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch((e) => {
        if (active)
          setError(
            controller.signal.aborted ? "资源加载超时，请重试" : e.message,
          );
      })
      .finally(() => {
        clearTimeout(timer);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [node, grade, type, enabled, revision]);
  return { items, loading, error, reload: () => setRevision((v) => v + 1) };
}

function fileLink(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value, window.location.origin);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function MaterialPreview({
  item,
  onClose,
}: {
  item: Material | null;
  onClose: () => void;
}) {
  const href = fileLink(item?.file_url);
  return (
    <Modal
      open={!!item}
      onCancel={onClose}
      title={item?.title}
      width={720}
      className="resource-preview"
      footer={
        <>
          <Button onClick={onClose}>关闭</Button>
          {href && (
            <Button
              type="primary"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              打开资源文件
            </Button>
          )}
        </>
      }
    >
      {item && (
        <>
          <div className="material-meta">
            <Tag color={item.type === "plans" ? "blue" : "cyan"}>
              {item.type === "plans" ? "教案" : "课件"}
            </Tag>
            <span>
              {gradeLabels[item.grade]} · {item.subject}
            </span>
            
          </div>
          <LearningContent>{item.summary}</LearningContent>
          {(item.preview || []).map((section, index) => (
            <section key={index}>
              <h3>{section.title}</h3>
              <LearningContent>{section.content}</LearningContent>
            </section>
          ))}
          {!item.preview?.length && <Empty description="暂无内容预览" />}
          {!href && (
            <p className="material-note">
              当前仅提供内容预览，尚未附加资源文件。
            </p>
          )}
        </>
      )}
    </Modal>
  );
}

export function MaterialItems({
  items,
  onPreview,
}: {
  items: Material[];
  onPreview: (item: Material) => void;
}) {
  return (
    <div className="material-items">
      {items.map((item) => (
        <article key={item.id} className="material-item">
          <div className="material-meta">
            {item.type === "plans" ? <BookOutlined /> : <DesktopOutlined />}
            <span>{item.format}</span>
            
          </div>
          <button className="material-title" onClick={() => onPreview(item)}>
            {item.title}
          </button>
          <LearningContent className="material-summary">
            {item.summary}
          </LearningContent>
          <div className="material-tags">
            {item.knowledge_ids.map((id) => (
              <span key={id}>{id}</span>
            ))}
          </div>
          <footer>
            <span>
              {gradeLabels[item.grade]} · {item.updated_at}
            </span>
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              aria-label={`预览${item.title}`}
              onClick={() => onPreview(item)}
            >
              预览
            </Button>
          </footer>
        </article>
      ))}
    </div>
  );
}

export default function MaterialLibrary({
  type,
  children,
}: {
  type: "plans" | "courseware";
  children?: ReactNode;
}) {
  const dispatch = useDispatch();
  const nodes: string[] = useSelector(
    (state: any) => state.resourceSearchModel.checkedKnowledge || [],
  );
  const { items, loading, error, reload } = useMaterials(null, "all", type);
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState<string>();
  const [preview, setPreview] = useState<Material | null>(null);
  const [legacyOpened, setLegacyOpened] = useState(false);
  const selectNodes = (value: string[]) =>
    dispatch({
      type: "resourceSearchModel/setData",
      payload: { checkedKnowledge: value },
    });
  const filtered = items.filter(
    (item) =>
      (!grade || item.grade === grade) &&
      (!nodes.length ||
        nodes.some((node) => item.knowledge_ids.includes(node))) &&
      `${item.title} ${item.summary}`.includes(search.trim()),
  );
  const nodeOptions = [
    ...new Set([...nodes, ...items.flatMap((item) => item.knowledge_ids)]),
  ].map((value) => ({ label: value, value }));
  return (
    <section className="material-library">
      <header>
        <h2>{type === "plans" ? "教案资源" : "课件资源"}</h2>
        <span>共 {filtered.length} 份</span>
      </header>
      <div className="material-filters">
        <Input
          aria-label="搜索教学资源"
          prefix={<SearchOutlined />}
          placeholder="搜索名称或内容"
          value={search}
          allowClear
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          aria-label="资源年级"
          placeholder="全部年级"
          allowClear
          value={grade}
          onChange={setGrade}
          options={Object.entries(gradeLabels)
            .filter(([key]) => key !== "all")
            .map(([value, label]) => ({ value, label }))}
        />
        <Select
          aria-label="资源知识点"
          mode="multiple"
          maxTagCount="responsive"
          placeholder="全部知识点"
          value={nodes}
          onChange={selectNodes}
          options={nodeOptions}
          allowClear
        />
        <Button
          title="重置筛选"
          aria-label="重置资源标签"
          icon={<ReloadOutlined />}
          onClick={() => {
            setSearch("");
            setGrade(undefined);
            selectNodes([]);
          }}
        />
      </div>
      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          action={<Button onClick={reload}>重试</Button>}
        />
      )}
      <Spin spinning={loading}>
        <MaterialItems items={filtered} onPreview={setPreview} />
        {!loading && !error && !filtered.length && (
          <Empty description="没有匹配的资源" />
        )}
      </Spin>
      {children && (
        <details
          className="material-legacy"
          onToggle={(event) => {
            if (event.currentTarget.open) setLegacyOpened(true);
          }}
        >
          <summary>
            {type === "plans" ? "历史教案与下发记录" : "历史课件大纲与生成"}
          </summary>
          {legacyOpened && children}
        </details>
      )}
      <MaterialPreview item={preview} onClose={() => setPreview(null)} />
    </section>
  );
}
