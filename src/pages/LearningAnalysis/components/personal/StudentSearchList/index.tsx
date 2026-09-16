import { useMemo, useState } from "react";
import { Empty, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const SORTS = [
  { value: "weak", label: "薄弱优先" },
  { value: "up", label: "进步明显" },
  { value: "down", label: "退步明显" },
  { value: "name", label: "姓名" },
];
const STATUS_ORDER: Record<string, number> = { weak: 0, ok: 1, cold: 2 };

/**
 * G2/G3 个人学情左侧学生列表：
 * 搜索（姓名/学号模糊匹配）+ 排序（薄弱优先/进步/退步/姓名）+ 状态标记 + 周变化箭头。
 * 数据源为班级画像的 students（含 status_level/weak_cnt/week_delta），前端过滤即可（单班 ≤50 人）。
 */
export default function StudentSearchList({
  students,
  selectedId,
  onSelect,
}: {
  students: any[];
  selectedId?: string;
  onSelect: (sid: string) => void;
}) {
  const [kw, setKw] = useState("");
  const [sort, setSort] = useState("weak");

  const list = useMemo(() => {
    const k = kw.trim().toLowerCase();
    let arr = (students || []).filter(
      (s: any) =>
        !k ||
        String(s.name || "").toLowerCase().includes(k) ||
        String(s.display_id || "").toLowerCase().includes(k),
    );
    const byName = (a: any, b: any) => String(a.name).localeCompare(String(b.name), "zh");
    if (sort === "weak") {
      arr = [...arr].sort(
        (a, b) =>
          (STATUS_ORDER[a.status_level ?? "ok"] ?? 1) - (STATUS_ORDER[b.status_level ?? "ok"] ?? 1) ||
          (b.weak_cnt || 0) - (a.weak_cnt || 0) ||
          byName(a, b),
      );
    } else if (sort === "up") {
      arr = [...arr].sort((a, b) => (b.week_delta ?? -Infinity) - (a.week_delta ?? -Infinity));
    } else if (sort === "down") {
      // 退步（负值小者）在前，无周变化数据的置底
      arr = [...arr].sort((a, b) => {
        const na = a.week_delta == null ? 1 : 0;
        const nb = b.week_delta == null ? 1 : 0;
        if (na !== nb) return na - nb;
        return (a.week_delta ?? 0) - (b.week_delta ?? 0);
      });
    } else {
      arr = [...arr].sort(byName);
    }
    return arr;
  }, [students, kw, sort]);

  return (
    <div className="pa_list">
      <div className="pa_list_tools">
        <Input
          size="small"
          allowClear
          prefix={<SearchOutlined style={{ color: "#a0a8b8" }} />}
          placeholder="搜索姓名 / 学号"
          value={kw}
          onChange={(e) => setKw(e.target.value)}
        />
        <Select size="small" value={sort} onChange={setSort} options={SORTS} style={{ width: "100%" }} />
      </div>
      <div className="pa_list_count">
        共 {students?.length || 0} 名学生{kw.trim() ? ` · 匹配 ${list.length} 名` : ""}
      </div>
      <div className="pa_list_scroll">
        {list.length ? (
          list.map((s: any) => (
            <button
              type="button"
              key={s.student_id}
              className={`pa_list_item${s.student_id === selectedId ? " on" : ""}`}
              onClick={() => onSelect(s.student_id)}
              title={`${s.name}（${s.display_id}）`}
            >
              <i className={`pa_dot pa_dot--${s.status_level || "ok"}`} />
              <span className="pa_name">{s.name}</span>
              <span className="pa_sid">{s.display_id}</span>
              {s.status_level !== "cold" && (s.weak_cnt || 0) > 0 ? (
                <span className="pa_weak">{s.weak_cnt} 弱</span>
              ) : null}
              {s.week_delta != null ? (
                <span className={`pa_delta ${s.week_delta >= 0 ? "up" : "down"}`}>
                  {s.week_delta >= 0 ? `↑${s.week_delta}` : `↓${Math.abs(s.week_delta)}`}
                </span>
              ) : null}
            </button>
          ))
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="未找到学生" style={{ marginTop: 40 }} />
        )}
      </div>
    </div>
  );
}
