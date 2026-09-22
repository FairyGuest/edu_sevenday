import { Checkbox, DatePicker, Tooltip, Button, TreeSelect } from "antd";
import { useLocation } from "@umijs/max";
import { useSupport } from "@/features/teachingSupport/services";
import {
  ReloadOutlined,
  CalendarOutlined,
  ReadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import DatePresetGroup from "@/pages/TeacherProfile/components/DatePresetGroup";
import { replacePageQuery } from "@/utils/pageQuery";
import { SOURCES } from "./domain";
import "./style.less";

export default function ScopeFilters({
  sources,
  dateRange,
  onSources,
  onDateRange,
  classId = "",
}: {
  sources: string[];
  dateRange: [Dayjs | null, Dayjs | null];
  onSources: (values: string[]) => void;
  onDateRange: (dates: [Dayjs | null, Dayjs | null]) => void;
  classId?: string;
}) {
  const location = useLocation();
  const q = new URLSearchParams(location.search);
  const catalog = useSupport("catalog", { class_id: classId }, !!classId);
  const books = catalog.data?.textbooks || [];
  const bookId = q.get("textbook_id") || books[0]?.textbook_id || "";
  const type = q.get("curriculum_scope_type") || "all";
  const tree = books.map((book: any) => ({
    value: book.textbook_id,
    title: book.name,
    selectable: false,
    children: (book.chapters || []).map((chapter: any) => ({
      value: `chapter:${book.textbook_id}:${chapter.chapter_id}`,
      title: `${chapter.no} ${chapter.title}`,
      children: (chapter.sections || []).map((section: any) => ({
        value: `section:${book.textbook_id}:${section.section_id}`,
        title: `${section.no} ${section.title}`,
      })),
    })),
  }));
  const unit = (catalog.data?.units || []).find(
    (u: any) => u.unit_id === q.get("curriculum_scope_id"),
  );
  return (
    <div className="portrait-scope-filters">
      <div className="portrait-scope-dates">
        <div className="portrait-filter-field portrait-filter-time">
          <span className="portrait-filter-label">
            <CalendarOutlined />
            时间范围
          </span>
          <div className="portrait-date-controls">
            <DatePresetGroup value={dateRange} onChange={onDateRange} />
            <DatePicker.RangePicker
              aria-label="自定义证据时间"
              value={dateRange}
              allowClear
              onChange={(dates) => onDateRange(dates || [null, null])}
            />
          </div>
        </div>
        {classId && (
          <div className="portrait-filter-field portrait-filter-course">
            <span className="portrait-filter-label">
              <ReadOutlined />
              课程范围
            </span>
            <Tooltip
              title={
                catalog.error ||
                "章节筛选可单独使用，也可与日期交叉；清除章节不改变日期"
              }
            >
              <TreeSelect
                className="portrait-chapter-select"
                aria-label="章节筛选"
                placeholder="全部章节"
                allowClear
                showSearch
                treeNodeFilterProp="title"
                treeLine
                popupClassName="portrait-course-popup"
                dropdownStyle={{
                  maxHeight: 420,
                  overflow: "auto",
                  minWidth: 280,
                  maxWidth: "calc(100vw - 32px)",
                }}
                loading={catalog.loading}
                treeData={tree}
                value={
                  type === "all"
                    ? undefined
                    : {
                        value: `${type}:${bookId}:${q.get("curriculum_scope_id")}`,
                        label:
                          type === "unit"
                            ? unit?.title || "教学单元"
                            : undefined,
                      }
                }
                labelInValue
                onChange={(option) => {
                  const [nextType, book, id] = (option?.value || "all::").split(
                    ":",
                  );
                  replacePageQuery({
                    curriculum_scope_type: nextType === "all" ? null : nextType,
                    curriculum_scope_id: id || null,
                    ...(book ? { textbook_id: book } : {}),
                  });
                }}
              />
            </Tooltip>
          </div>
        )}
        <Tooltip title="恢复默认时间与来源">
          <Button
            className="portrait-filter-reset"
            type="text"
            icon={<ReloadOutlined />}
            aria-label="重置时间与来源"
            onClick={() =>
              replacePageQuery({
                start_date: null,
                end_date: null,
                sources: null,
                date_all: null,
              })
            }
          />
        </Tooltip>
      </div>
      <div className="portrait-source-controls">
        <span className="portrait-filter-label">
          <FilterOutlined />
          数据来源
        </span>
        <Checkbox.Group
          value={sources}
          onChange={(values) => onSources(values as string[])}
          options={SOURCES.map((value) => ({
            label: value,
            value,
            disabled: sources.length === 1 && sources.includes(value),
          }))}
        />
        <span className="portrait-source-count">
          {sources.length} / {SOURCES.length}
        </span>
      </div>
    </div>
  );
}
