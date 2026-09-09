import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';

interface UseChartSizeOptions {
  dataLength?: number;  // 数据长度或日期范围
  dateRange?: any;  // 日期范围
  isH5?: boolean;  // 是否为H5环境
  itemSize?: number;  // 每个数据点的预估宽度/高度（像素）
  defaultSize?: number | string;  // 默认尺寸
  maxLength?: number;  // 最大长度阈值（超过此值才开始计算）
  direction?: 'width' | 'height';  // 计算方式：'width' | 'height'
  customCalculator?: (params: {
    dataLength: number;
    itemSize: number;
    containerSize: number;
    defaultSize: number | string;
  }) => number | string;
}

/**
 * 图表响应式尺寸计算Hook
 * 根据数据量自动计算图表宽度或高度
 */
export const useChartSize = (options: UseChartSizeOptions) => {
  const {
    dataLength,
    dateRange,
    isH5 = false,
    itemSize = 80,
    defaultSize = '100%',
    maxLength = 14,
    direction = 'width',
    customCalculator,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number | string>(defaultSize);

  // 计算尺寸
  const calculateSize = () => {
    const actualLength = dataLength !== undefined 
    ? dataLength 
    : dateRange && dateRange.length === 2 
      ? dayjs(dateRange[1]).diff(dayjs(dateRange[0]), 'day')
      : 0
    
    // 如果数据量小于阈值，使用默认尺寸
    if (actualLength <= maxLength) {
      return defaultSize;
    }

    // 使用自定义计算函数
    if (customCalculator) {
      const containerSize = direction === 'width'
        ? containerRef.current?.clientWidth || 0
        : containerRef.current?.clientHeight || 0;
      
      return customCalculator({
        dataLength: actualLength,
        itemSize,
        containerSize,
        defaultSize,
      });
    }

    // 默认计算逻辑
    const pxSize = actualLength * itemSize;
    const containerSize = direction === 'width'
      ? containerRef.current?.clientWidth || 0
      : containerRef.current?.clientHeight || 0;

    if (containerSize > 0) {
      // 如果计算出来的尺寸小于容器实际尺寸（排不满），则使用100%
      if (pxSize < containerSize) {
        return '100%';
      }
      return `${pxSize}px`;
    }
    
    // 首次渲染拿不到容器尺寸时，先返回计算尺寸
    return `${pxSize}px`;
  };

  useEffect(() => {
    const newSize = calculateSize();
    setSize(newSize);
  }, [dataLength, dateRange, isH5, itemSize, maxLength]);

  return {
    size,
    containerRef,
  };
};

