import { useEffect, useMemo, useState } from "react";
import { Alert, Checkbox, Empty, Segmented, Spin, Tag } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import "./index.less";

/**
 * 教学资源抽屉（注入用）：学情联动练习/课件页 + 通用量规/材料。
 * 勾选后与教学目标一起经「注入教学设计」写入生成请求。
 */
export interface ResourceItem {
  id: string;
  type: "exercise" | "courseware" | "rubric" | "material";
  title: string;
  cluster?: string | null;
  desc: string;
  meta: string;
  basis: string;
  source: string;
}

const TYPE_META: Record<string, { label: string; color: string }> = {
  exercise: { label: "练习", color: "blue" },
  courseware: { label: "课件页", color: "geekblue" },
  rubric: { label: "量规", color: "purple" },
  material: { label: "材料", color: "cyan" },
};

const ResourceDrawerBody = ({
  classId,
  selected,
  onChange,
}: {
  classId?: string;
  selected: ResourceItem[];
  onChange: (items: ResourceItem[]) => void;
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/teacher/teaching/resources?class_id=${encodeURIComponent(classId || "cls-g8-03")}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 200) setData(d.data);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [classId]);

  const all: ResourceItem[] = useMemo(() => data?.resources || [], [data]);
  const filtered = useMemo(
    () => (type === "all" ? all : all.filter((r) => r.type === type)),
    [all, type],
  );
  const toggle = (item: ResourceItem) => {
    const exists = selected.some((s) => s.id === item.id);
    onChange(
      exists ? selected.filter((s) => s.id !== item.id) : [...selected, item],
    );
  };
  const isSelected = (id: string) => selected.some((s) => s.id === id);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    for (const r of all) c[r.type] = (c[r.type] || 0) + 1;
    return c;
  }, [all]);

  return (
    <div className="rd_body">
      <div className="rd_head">
        <AppstoreOutlined className="rd_icon" />
        <span className="rd_title">教学资源</span>
        <Tag color="blue" className="rd_class">
          {data?.class_name || ""}
        </Tag>
      </div>
      <div className="rd_tip">
        <Alert
          type="info"
          showIcon
          message="练习与课件页按所选班级薄弱知识点联动；勾选后与教学目标一起「注入教学设计」。"
        />
      </div>
      <Segmented
        size="small"
        value={type}
        onChange={(v) => setType(v as string)}
        options={[
          { label: `全部 ${counts.all || 0}`, value: "all" },
          { label: `练习 ${counts.exercise || 0}`, value: "exercise" },
          { label: `课件页 ${counts.courseware || 0}`, value: "courseware" },
          { label: `量规 ${counts.rubric || 0}`, value: "rubric" },
          { label: `材料 ${counts.material || 0}`, value: "material" },
        ]}
      />
      {loading && (
        <div className="rd_loading">
          <Spin />
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="该类型暂无资源"
        />
      )}
      <div className="rd_list">
        {filtered.map((r) => {
          const meta = TYPE_META[r.type] || TYPE_META.exercise;
          return (
            <div
              key={r.id}
              className={"rd_item" + (isSelected(r.id) ? " rd_item--on" : "")}
              onClick={() => toggle(r)}
            >
              <Checkbox checked={isSelected(r.id)} />
              <div className="rd_item_body">
                <div className="rd_item_title">
                  <Tag color={meta.color} className="rd_tag">
                    {meta.label}
                  </Tag>
                  <span>{r.title}</span>
                </div>
                <div className="rd_desc">{r.desc}</div>
                <div className="rd_meta">
                  <span>{r.meta}</span>
                  <span className="rd_sep">·</span>
                  <span>来源：{r.source}</span>
                  <span className="rd_sep">·</span>
                  <span className="rd_basis">{r.basis}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="rd_footer">
        已选 {selected.length} 项资源
        {selected.length > 0 && (
          <span className="rd_footer_list">
            {selected.map((s) => (
              <Tag
                key={s.id}
                closable
                onClose={() => toggle(s)}
                color={(TYPE_META[s.type] || TYPE_META.exercise).color}
              >
                {s.title.slice(0, 14)}
              </Tag>
            ))}
          </span>
        )}
      </div>
    </div>
  );
};

export default ResourceDrawerBody;
