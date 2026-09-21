import { useEffect, useMemo, useState } from "react";
import { Select } from "antd";
import { PartitionOutlined } from "@ant-design/icons";

/**
 * 知识图谱筛选项（公共组件）：公共题库 / 个人题库 / 教案 / 课件 Tab 共用。
 * 数据源：GET /api/teacher/resource/kgraph（节点名字段为 id 或 name）。
 * 值为知识点名称数组，由调用方决定写入哪个筛选通道。
 */
export default function GraphFilterSelect({
  value,
  onChange,
  placeholder = "按知识图谱筛选（可搜索多选）",
  size = "small",
  width,
}: {
  value?: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
  size?: "small" | "middle";
  width?: number;
}) {
  const [nodes, setNodes] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    let dead = false;
    fetch("/api/teacher/resource/kgraph", { signal: AbortSignal.timeout(8000) })
      .then((r) => r.json())
      .then((d) => {
        if (dead || d.code !== 200 || !d.data?.nodes) return;
        const list = d.data.nodes
          .map((n: any) => n.name || n.id)
          .filter(Boolean)
          .map((name: string) => ({ value: name, label: name }));
        // 去重保序
        setNodes([...new Map(list.map((x: any) => [x.value, x])).values()]);
      })
      .catch(() => {
        /* 图谱源不可用时选项为空，不阻断页面 */
      });
    return () => {
      dead = true;
    };
  }, []);

  return (
    <Select
      mode="multiple"
      size={size}
      allowClear
      showSearch
      maxTagCount="responsive"
      style={{ minWidth: width || 260, maxWidth: 520 }}
      placeholder={placeholder}
      prefix={<PartitionOutlined style={{ color: "#1c6cff" }} />}
      optionFilterProp="label"
      value={value || []}
      options={nodes}
      onChange={onChange}
    />
  );
}
