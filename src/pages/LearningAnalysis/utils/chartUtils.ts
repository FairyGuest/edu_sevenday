import dayjs from 'dayjs';

/**
 * 根据日期范围生成X轴数据（用于折线图、柱状图）
 * @param dateRange 日期范围 [start, end]
 * @returns 格式化的日期数组 [{ date: 'MM.DD' }]
 */
export const generateXAxisData = (dateRange: any): Array<{ date: string }> => {
  if (!dateRange || dateRange.length !== 2) {
    return [];
  }
  
  const [start, end] = dateRange;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const result: Array<{ date: string }> = [];
  
  // 循环从开始日期到结束日期
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // 获取月份和日期，补零
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const date = currentDate.getDate().toString().padStart(2, '0');
    
    result.push({
      date: `${month}.${date}`
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
};

/**
 * 根据日期范围生成Y轴数据（用于散点图）
 * @param dateRange 
 * @param isH5 
 * @returns 包含日期、星期、索引的数据数组
 */
export const generateYAxisData = (dateRange: any, isH5: boolean = false) => {
  if (!dateRange || dateRange.length !== 2) {
    return [];
  }
  
  const [start, end] = dateRange;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const result: Array<{ date: string; week: string; indexForYAxis: string }> = [];
  
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  // 循环从开始日期到结束日期
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // 获取月份和日期，补零
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const date = currentDate.getDate().toString().padStart(2, '0');
    
    // 获取星期几
    const week = weekDays[currentDate.getDay()];
    
    result.push({
      date: `${month}.${date}`,
      week: week,
      indexForYAxis: `${currentDate.getMonth() + 1}.${currentDate.getDate()}`
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
};

/**
 * 处理长文本换行（用于图表标签）
 * @param text 原始文本
 * @param maxLength 单行最大长度
 * @param maxLines 最大行数
 * @returns 
 */
export const splitTextForLabel = (
  text: string, 
  maxLength: number = 6, 
  maxLines: number = 2
): string => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  if (text.length <= maxLength * maxLines) {
    return text.slice(0, maxLength) + '\n' + text.slice(maxLength);
  }
  
  return text.slice(0, maxLength) + '\n' + text.slice(maxLength, maxLength * maxLines - 3) + '...';
};

/**
 * 获取ECharts通用tooltip样式配置
 */
export const getCommonTooltipStyle = () => ({
  backgroundColor: '#fff',
  borderColor: '#E5E7EB',
  borderWidth: 1,
  textStyle: {
    color: '#1F2329',
    fontSize: 12
  },
  extraCssText: 'box-shadow: 0 2px 10px rgba(0,0,0,.05); border-radius: 4px;'
});

/**
 * 获取ECharts通用grid配置
 * @param isH5
 * @param customConfig 自定义配置
 */
export const getCommonGridConfig = (isH5: boolean = false, customConfig: any = {}) => ({
  left: isH5 ? '17px' : '7px',
  right: '0',
  top: '5%',
  bottom: '8%',
  containLabel: true,
  ...customConfig
});

/**
 * 获取ECharts通用yAxis配置（百分比类型）
 */
export const getCommonYAxisConfig = () => ({
  type: 'value' as const,
  min: 0,
  max: 100,
  interval: 20,
  axisLine: {
    lineStyle: {
      color: '#E5E7EB'
    }
  },
  axisLabel: {
    show: false
  },
  splitLine: {
    show: true,
    lineStyle: {
      color: '#F0F0F0',
      type: 'dashed' as const
    }
  }
});

/**
 * 获取及格线和优秀线的markLine配置
 * @param isH5 
 */
export const getMarkLineConfig = (isH5: boolean = false) => [
  {
    name: '及格线',
    type: 'line',
    symbol: 'none',
    silent: true,
    z: 1,
    markLine: {
      silent: true,
      lineStyle: {
        color: '#FFA53D',
        width: 1,
        type: 'dashed' as const
      },
      label: {
        show: true,
        position: 'insideStartTop' as const,
        formatter: '及格线',
        color: '#FFA53D',
        fontSize: 12,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        padding: isH5 ? [0, 0, 0, -18] : [0, 0, 0, -10]
      },
      symbol: 'none',
      data: [{ yAxis: 60 }]
    }
  },
  {
    name: '优秀线',
    type: 'line',
    symbol: 'none',
    silent: true,
    z: 1,
    markLine: {
      silent: true,
      lineStyle: {
        color: '#96BDFF',
        width: 1,
        type: 'dashed' as const
      },
      label: {
        show: true,
        position: 'insideStartTop' as const,
        formatter: '优秀线',
        color: '#96BDFF',
        fontSize: 12,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        padding: isH5 ? [0, 0, 0, -18] : [0, 0, 0, -10]
      },
      symbol: 'none',
      data: [{ yAxis: 80 }]
    }
  }
];

