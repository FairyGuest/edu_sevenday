import { useState, useEffect } from 'react';
import { connect } from 'umi';
import { Button, DatePicker, Radio, Space } from 'antd';
import type { DatePickerProps } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const MAX_DATE_RANGE = 180;

interface PersonalReportFilterProps {
  initialDateRange?: [Dayjs, Dayjs] | null;
  initialRadio?: string;
  apisSettled?: boolean;
  onDateRangeChange: (dateRange: [Dayjs, Dayjs]) => void;
  onSearch: () => void;
  analysisModel: any;
}

const PersonalReportFilter: React.FC<PersonalReportFilterProps> = ({
  initialDateRange,
  initialRadio = '1',
  apisSettled = true,
  onDateRangeChange,
  onSearch,
  analysisModel,
}) => {
  const { selectedStudent } = analysisModel;
  const [selectedDateRange, setSelectedDateRange] = useState<[Dayjs, Dayjs] | null>(
    initialDateRange || [dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')]
  );
  const [selectedRadio, setSelectedRadio] = useState<string>(initialRadio);

  useEffect(() => {
    if (initialDateRange) {
      setSelectedDateRange(initialDateRange);
    }
    if (initialRadio !== undefined) {
      setSelectedRadio(initialRadio);
    }
  }, [initialDateRange, initialRadio]);

  const getYearMonth = (date: Dayjs) => date.year() * 12 + date.month();

  const disabledRangeDate: DatePickerProps['disabledDate'] = (current, { from, type }) => {
    const todayStart = dayjs().startOf('day');
    if (current.isSame(todayStart, 'day') || current.isAfter(todayStart, 'day')) {
      return true;
    }

    if (from) {
      const minDate = from.add(-MAX_DATE_RANGE, 'days');
      const maxDate = from.add(MAX_DATE_RANGE, 'days');

      switch (type) {
        case 'year':
          return current.year() < minDate.year() || current.year() > maxDate.year();

        case 'month':
          return (
            getYearMonth(current) < getYearMonth(minDate) ||
            getYearMonth(current) > getYearMonth(maxDate)
          );

        default:
          return Math.abs(current.diff(from, 'days')) >= MAX_DATE_RANGE;
      }
    }

    return false;
  };

  const handleDateRangeChange = (dates: any) => {
    setSelectedDateRange(dates);
    setSelectedRadio('');
    if (dates && dates[0] && dates[1]) {
      onDateRangeChange([dates[0], dates[1]]);
    }
  };

  const handleRadioChange = (e: any) => {
    const value = e.target.value;
    setSelectedRadio(value);

    let startDate: Dayjs;
    const endDate = dayjs().subtract(1, 'day'); // 结束日期为昨天（今天不可选）

    switch (value) {
      case '1': // 近7天(除今天)
        startDate = dayjs().subtract(7, 'day');
        break;
      case '2': // 近1个月(除今天)
        startDate = dayjs().subtract(30, 'day');
        break;
      case '3': // 近3个月(除今天)
        startDate = dayjs().subtract(90, 'day');
        break;
      default:
        return;
    }

    const newRange: [Dayjs, Dayjs] = [startDate, endDate];
    setSelectedDateRange(newRange);
    onDateRangeChange(newRange);
  };

  return (
    <Space className="homework-analysis-filter">
      <RangePicker
        allowClear={false}
        value={selectedDateRange}
        onChange={handleDateRangeChange}
        disabledDate={disabledRangeDate}
      />
      <Radio.Group value={selectedRadio} onChange={handleRadioChange}>
        <Radio.Button value="1">近 7 天</Radio.Button>
        <Radio.Button value="2">近 1 个月</Radio.Button>
        <Radio.Button value="3">近 3 个月</Radio.Button>
      </Radio.Group>
      <Button type="primary" disabled={!apisSettled || !selectedStudent?.edu_id} onClick={onSearch}>
        查询
      </Button>
    </Space>
  );
};

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(PersonalReportFilter)

