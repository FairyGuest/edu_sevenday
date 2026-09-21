import { Checkbox, DatePicker, Tooltip, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
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
}: {
  sources: string[];
  dateRange: [Dayjs | null, Dayjs | null];
  onSources: (values: string[]) => void;
  onDateRange: (dates: [Dayjs | null, Dayjs | null]) => void;
}) {
  return (
    <div className="portrait-scope-filters">
      <div className="portrait-scope-dates">
        <DatePresetGroup value={dateRange} onChange={onDateRange} />
        <DatePicker.RangePicker
          aria-label="自定义证据时间"
          value={dateRange}
          allowClear={false}
          onChange={(dates) => dates && onDateRange(dates)}
        />
        <Tooltip title="恢复默认时间与来源">
          <Button
            icon={<ReloadOutlined />}
            aria-label="重置时间与来源"
            onClick={() =>
              replacePageQuery({
                start_date: null,
                end_date: null,
                sources: null,
              })
            }
          />
        </Tooltip>
      </div>
      <Checkbox.Group
        value={sources}
        onChange={(values) => onSources(values as string[])}
        options={SOURCES.map((value) => ({
          label: value,
          value,
          disabled: sources.length === 1 && sources.includes(value),
        }))}
      />
    </div>
  );
}
