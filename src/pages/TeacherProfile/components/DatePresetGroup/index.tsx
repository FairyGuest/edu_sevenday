import { memo } from "react";
import dayjs, { Dayjs } from "dayjs";

/** 时间窗预设（Figma：筛选栏为 近7天 / 近1个月 / 近3个月 按钮组，非日期面板） */
export const DATE_PRESETS = [
  { key: "7d", label: "近7天", range: () => [dayjs().subtract(6, "day"), dayjs()] as [Dayjs, Dayjs] },
  { key: "1m", label: "近1个月", range: () => [dayjs().subtract(1, "month"), dayjs()] as [Dayjs, Dayjs] },
  { key: "3m", label: "近3个月", range: () => [dayjs().subtract(3, "month"), dayjs()] as [Dayjs, Dayjs] },
] as const;

/** 默认取近3个月（演示数据按月累积，过短窗口常见空画像） */
export const defaultDateRange = (): [Dayjs, Dayjs] => DATE_PRESETS[2].range();

function DatePresetGroup({ value, onChange }: {
  value: [Dayjs | null, Dayjs | null];
  onChange: (v: [Dayjs | null, Dayjs | null]) => void;
}) {
  const activeKey = DATE_PRESETS.find((p) => {
    const [s, e] = p.range();
    return value?.[0]?.isSame(s, "day") && value?.[1]?.isSame(e, "day");
  })?.key;
  return (
    <div className="date_preset_group" role="group" aria-label="时间窗">
      {DATE_PRESETS.map((p) => (
        <button
          key={p.key}
          type="button"
          className={activeKey === p.key ? "on" : ""}
          onClick={() => onChange(p.range())}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export default memo(DatePresetGroup);
