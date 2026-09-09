import { useState, useEffect } from 'react';
import { connect } from 'umi';
import { Button, DatePicker, Select, Space } from 'antd';
import type { DatePickerProps } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

interface ClassReportFilterProps {
  initialDateType?: 'week' | 'month';
  initialDate?: Dayjs;
  apisSettled?: boolean;
  onDateRangeChange: (dateRange: [Dayjs, Dayjs]) => void;
  onSearch: () => void;
  analysisModel: any;
}

const ClassReportFilter: React.FC<ClassReportFilterProps> = ({
  initialDateType = 'week',
  initialDate,
  apisSettled = true,
  onDateRangeChange,
  onSearch,
  analysisModel,
}) => {
  const { selectedClass } = analysisModel;
  const [selectedClassDateType, setSelectedClassDateType] = useState<'week' | 'month'>(initialDateType);
  const [selectedClassDate, setSelectedClassDate] = useState<Dayjs>(
    initialDate ||
      (initialDateType === 'month'
        ? dayjs().subtract(1, 'month')
        : dayjs().subtract(1, 'week'))
  )

  useEffect(() => {
    if (initialDate) {
      setSelectedClassDate(initialDate);
    }
    if (initialDateType) {
      setSelectedClassDateType(initialDateType);
    }
  }, [initialDate, initialDateType]);

  const filterClassDate = (type: 'week' | 'month', date: Dayjs) => {
    const dateRange: [Dayjs, Dayjs] =
      type === 'month'
        ? [dayjs(date).startOf('month'), dayjs(date).endOf('month')]
        : [dayjs(date).startOf('week'), dayjs(date).endOf('week')];
    onDateRangeChange(dateRange);
  };

  const disabledClassDate: DatePickerProps['disabledDate'] = (current) => {
    if (selectedClassDateType === 'week') {
      const startOfNextWeek = dayjs().startOf('week').add(1, 'week');
      return (current && (current.isSame(startOfNextWeek, 'day') || current.isAfter(startOfNextWeek, 'day') || current.isSame(dayjs().startOf('week'), 'week') || current.isAfter(dayjs(), 'day')));
    } else if (selectedClassDateType === 'month') {
      const startOfNextMonth = dayjs().startOf('month').add(1, 'month');
      return (current && (current.isSame(startOfNextMonth, 'day') || current.isAfter(startOfNextMonth, 'day') || current.isSame(dayjs().startOf('month'), 'month') || current.isAfter(dayjs(), 'day')));
    }
    return false;
  };

  const onClassDateTypeChange = (val: 'week' | 'month') => {
    setSelectedClassDateType(val);
    let nextDate = selectedClassDate;
    // 切换到「自然月」时，默认选中上个月
    if (val === 'month') {
      nextDate = dayjs().subtract(1, 'month');
    }
    setSelectedClassDate(nextDate);
    filterClassDate(val, nextDate);
  };

  const onClassDateChange = (date: any) => {
    if (!date) return;
    setSelectedClassDate(date);
    filterClassDate(selectedClassDateType, date);
  };

  return (
    <Space className="homework-analysis-filter">
      <Select
        style={{ width: 256 }}
        value={selectedClassDateType}
        onChange={onClassDateTypeChange}
        options={[
          { label: '自然周', value: 'week' },
          { label: '自然月', value: 'month' },
        ]}
      />
      <DatePicker
        picker={selectedClassDateType}
        value={selectedClassDate}
        format={
          selectedClassDateType === 'month'
            ? 'YYYY-MM'
            : (value: any) => `${dayjs(value).startOf('week').format('YYYY-MM-DD')} ~ ${dayjs(value).endOf('week').format('YYYY-MM-DD')}`
        }
        onChange={onClassDateChange}
        disabledDate={disabledClassDate}
        style={{ width: 256 }}
        showWeek={false}
      />
      <Button type="primary" disabled={!apisSettled || !selectedClass?.value} onClick={onSearch}>
        查询
      </Button>
    </Space>
  );
};

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(ClassReportFilter)

