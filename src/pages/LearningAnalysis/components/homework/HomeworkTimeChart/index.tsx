import React, { useState, useEffect, useRef } from 'react';
import { Empty, Slider } from 'antd';
import { connect, useLocation } from '@umijs/max';
import ReactECharts from 'echarts-for-react';
import ChartWrapper from '../../common/ChartWrapper';

import { useChartSize } from '../../../hooks/useChartSize';

import { generateYAxisData } from '../../../utils/chartUtils';

import './index.less';

// 过滤数据用于图表
const filterDataForChart = (dataList: any, dateRange: any, isH5: boolean) => {
  const yAxisDataList: any[] = generateYAxisData(dateRange);
  const yAxisData = yAxisDataList.map((item: any) => `${item.date}${isH5 ? '\n' : ''} ${item.week}`);
  const seriesData: {
    normal: number[][];
    delay: number[][];
    abnormal: number[][];
  } = {
    normal: [], // 6-22点 正常
    delay: [],  // 22-24点 拖延
    abnormal: [] // 0-6点 异常
  };
  dataList.forEach((time: any) => {
    const newDate = new Date(time);
    const hour = newDate.getHours();
    const dataForYAxisIndex = `${newDate.getMonth() + 1}.${newDate.getDate()}`;

    // 根据时间判断状态
    let status: 'normal' | 'delay' | 'abnormal';
    if (hour >= 6 && hour < 22) {
      status = 'normal';
    } else if (hour >= 22 || hour < 6) {
      if (hour >= 22) {
        status = 'delay';
      } else {
        status = 'abnormal';
      }
    } else {
      status = 'normal';
    }

    // 计算横坐标（小时 + 分钟/60）
    const xValue = hour + (newDate.getMinutes() / 60);
    
    // 纵坐标是索引（对应yAxisData中的位置）
    const yValue = yAxisDataList.findIndex((item: any) => item.indexForYAxis === dataForYAxisIndex);

    seriesData[status].push([xValue, yValue]);
  });
  return {
    yAxisData,
    seriesData
  }
}

const emptyOption = {
  xAxis: {
    type: 'value',
    min: 0,
    max: 24
  },
  yAxis: {
    type: 'category',
    data: []
  },
  series: []
}

const fullColors = [
  ...new Array(6).fill('#F769641A'),
  ...new Array(16).fill('#4E83FD1A'),
  ...new Array(2).fill('#F790091A')
];

const getScatterTableOption = (dataSource: any, dateRange: any, isH5: boolean, analysisType: string, timeRange: [number, number]) => {
  const { yAxisData, seriesData } = filterDataForChart(dataSource, dateRange, isH5);
  const [minTime, maxTime] = timeRange;
  
  return {
    animation: true,
    animationDuration: 300,
    grid: {
      left: '0',
      right: isH5 ? '8px' : '25px',
      top: '0',
      bottom: '0',
      show: true,
      containLabel: true,
      backgroundColor: '#fafafa',
      borderWidth: 0
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      axisLine: {
        lineStyle: {
          color: 'transparent'
        }
      },
      axisLabel: {
        color: '#646E8B',
        fontSize: 12,
        margin: 18,
        lineHeight: 20
      },
      // 网格线
      splitLine: {
        show: true,
        zlevel: 2,
        lineStyle: {
          color: '#fff',
          type: 'solid',
          width: 1
        }
      }
    },
    xAxis: {
      type: 'value',
      min: minTime,
      max: maxTime,
      interval: 1,
      axisLabel: {
        show: false,
      },
      position: 'top',
      axisLine: {
        show: false,
        lineStyle: {
          color: 'transparent'
        }
      },
      axisTick: {
        show: false,
        alignWithLabel: false,
        interval: 1
      },
      // 网格线
      splitLine: {
        show: true,
        zlevel: 1,
        lineStyle: {
          color: '#ffffff99',
          type: 'solid',
          width: 1
        }
      },
      // 添加背景色分段
      splitArea: {
        show: true,
        zlevel: 1,
        areaStyle: {
          color: fullColors.slice(minTime, maxTime)
        }
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (!params || !params.data || !Array.isArray(params.data) || params.data.length < 2) {
          return '<div style="padding: 8px;">暂无数据</div>';
        }
        
        try {
          const hour = Number(params.data[0]);
          const dateIndex = Number(params.data[1]);
          const dateLabels = yAxisData;
          
          // 格式化时间显示
          const hours = Math.floor(hour);
          const minutes = Math.round((hour - hours) * 60);
          const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          const date = dateLabels[dateIndex] || '未知日期';
          
          let statusColor = '';
          if (hour >= 0 && hour < 6) {
            statusColor = '#ff4d4f';
          } else if (hour >= 6 && hour < 22) {
            statusColor = '#4E83FD';
          } else {
            statusColor = '#faad14';
          }
          
          return `
            <div>
              <div style="margin-bottom: 4px;font-size: 14px;color: #1F2329;font-weight: 500;">${date}</div>
              <div><span style="color: #646E8B;margin-rigth: 8px">${analysisType === 'personal' ? '提交时间' : '班级平均提交时间'}：</span><span style="color: ${statusColor};">${time}</span></div>
            </div>
          `;
        } catch (error) {
          return '<div style="padding: 8px;">数据解析错误</div>';
        }
      },
      borderColor: '#BBBFC480',
      borderWidth: 1,
      extraCssText: 'box-shadow: 0 2px 10px rgba(0,0,0,.05); border-radius: 4px;'
    },
    series: [
      {
        name: '提交时间合理',
        data: seriesData.normal,
        type: 'scatter',
        symbol: 'rect',
        symbolSize: [4, 12],
        itemStyle: {
          color: '#4E83FD'
        },
        emphasis: {
          scale: 1.5
        }
      },
      {
        name: '提交时间拖延',
        data: seriesData.delay,
        type: 'scatter',
        symbol: 'rect',
        symbolSize: [4, 12],
        itemStyle: {
          color: '#FAD355'
        },
        emphasis: {
          scale: 1.5
        }
      },
      {
        name: '提交时间异常',
        data: seriesData.abnormal,
        type: 'scatter',
        symbol: 'rect',
        symbolSize: [4, 12],
        itemStyle: {
          color: '#F76964'
        },
        emphasis: {
          scale: 1.5
        },
      }
    ]
  };
}

// 生成时间轴数据
const generateTimeAxis = (min: number, max: number, isH5: boolean) => {
  const rangeSize = max - min;
  const result = [];
  
  for (let i = min; i <= max; i++) {
    let showLabel = false;
    
    // 显示策略：
    // 1. 范围小于等于12小时（非H5）或10小时（H5），全部显示
    if (!isH5 && rangeSize <= 12 || isH5 && rangeSize <= 10) {
      showLabel = true;
    } 
    // 2. H5环境下，如果是4的倍数显示
    else if (isH5) {
      showLabel = i % 4 === 0;
    }
    // 3. 非H5环境，如果是2的倍数显示
    else {
      showLabel = i % 2 === 0;
    }

    // 始终显示首尾
    if (i === min || i === max) {
      showLabel = true;
    }

    if (showLabel) {
      result.push({
        value: i,
        label: `${i < 10 ? '0' + i : i}:00`,
        position: ((i - min) / rangeSize) * 100
      });
    }
  }
  return result;
};

const HomeworkTimeChart = ({
  analysisModel,
  loading,
  dataSource, 
  dateRange = []
}: {
  analysisModel: any,
  loading: boolean,
  dataSource: any, 
  dateRange: any,
}) => {
  const { analysisType } = analysisModel
  const isH5 = useLocation().pathname.includes('analysisH5');
  const effectiveAnalysisType = isH5 ? 'personal' : analysisType;
  const [option, setOption] = useState<any>(null);
  const [data, setData] = useState<any>([]);
  const [timeRange, setTimeRange] = useState<[number, number]>([18, 24]);
  const { size: chartHeight, containerRef } = useChartSize({
    dateRange,
    isH5,
    itemSize: isH5 ? 50 : 40,
    defaultSize: isH5 ? 340 : 560,
    maxLength: 14,
    direction: 'height',
  });

  useEffect(() => {
    if (dataSource) {
      const data = dataSource.map((item: any) => item.submissions.map((submission: any) => submission.submit_time)).flat();
      
      // 计算最早提交时间
      let earliestHour = 16;
      if (data.length > 0) {
        const hours = data.map((time: string) => new Date(time).getHours());
        const minHour = Math.min(...hours);
        if (minHour < 16) {
          earliestHour = minHour;
        }
      }
      
      setData(data)
      setTimeRange([earliestHour, 24]);
    } else {
      setOption(emptyOption)
    }
  }, [dataSource]);

  useEffect(() => {
    if (dataSource) {
      const chartOption = getScatterTableOption(data, dateRange, isH5, effectiveAnalysisType, timeRange)
      setOption(chartOption)
    }
  }, [data, timeRange]);

  const timeAxisData = generateTimeAxis(timeRange[0], timeRange[1], isH5);

  return (
    <ChartWrapper 
      title="作业提交时间轨迹" 
      loading={loading} 
      dataSource={dataSource}
      className='homework-time'
    >
      <div className='time-axis'>
        {timeAxisData.map((item) => (
          <div key={item.value} className='time-axis-item' style={{ left: `${item.position}%` }}>
            {item.label}
          </div>
        ))}
      </div>
      <div className="homework-time-chart" ref={containerRef} >
        {option
          ? <ReactECharts 
              option={option} 
              style={{ width: '100%', height: chartHeight }} 
              notMerge={true}
              lazyUpdate={true}
            />
          : <Empty description="暂无数据" />
        }
      </div>
      <div className='slider-box'>
        <Slider
          className='homework-time-slider'
          range={{ draggableTrack: true }}
          min={0}
          max={24}
          value={timeRange}
          onChange={(val: any) => setTimeRange(val as [number, number])}
          tooltip={{ formatter: (val) => `${val}:00` }}
        />
      </div>
      <div className='homework-time-legend'>
        <div className='homework-time-legend-item'>提交时间合理</div>
        <div className='homework-time-legend-item'>提交时间拖延</div>
        <div className='homework-time-legend-item'>提交时间异常</div>
      </div>
    </ChartWrapper>
  )
}

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(HomeworkTimeChart)