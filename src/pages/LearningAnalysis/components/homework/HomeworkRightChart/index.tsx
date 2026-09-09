import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { connect, useLocation } from '@umijs/max';
import ChartWrapper from '../../common/ChartWrapper';
import { 
  generateXAxisData, 
  getCommonTooltipStyle, 
  getCommonGridConfig, 
  getCommonYAxisConfig, 
  getMarkLineConfig 
} from '../../../utils/chartUtils';
import { useChartSize } from '../../../hooks/useChartSize';

import dayjs from 'dayjs';

import './index.less';

const filterLineData = (data: any, xAxisDataList: any) => {
  const dataMap: Record<string, any> = {};
  data.forEach((item: any) => {
    item.date = dayjs(item.date).format('MM.DD');
    dataMap[item.date] = item;
  });

  const personalData: any[] = [];
  const classData: any[] = [];

  xAxisDataList.forEach((x: any, index: number) => {
    const item = dataMap[x.date];
    personalData.push({value: item ? item.student_accuracy : 0, axis: [index, item ? item.student_accuracy : 0]});
    classData.push({value: item ? item.class_accuracy : 0, axis: [index, item ? item.class_accuracy : 0]});
  });

  return {
    personalData,
    classData
  }
}

const getLineChartOption = (dataSource: any, dateRange: any, isH5: boolean, analysisType: string) => {
  const xAxisDataList = generateXAxisData(dateRange);
  const {personalData, classData} = filterLineData(dataSource, xAxisDataList);
  const xAxisData = xAxisDataList.map((item: any) => item.date);

  return {
    tooltip: {
      trigger: 'axis',
      ...getCommonTooltipStyle(),
      formatter: function(params: any) {
        if (!params || !Array.isArray(params) || params.length === 0) {
          return '<div style="padding: 8px;">暂无数据</div>';
        }
        
        const date = params[0].axisValue;
        let tooltipContent = `<div style="padding: 8px;"><div style="margin-bottom: 4px;font-size: 14px;color: #1F2329;font-weight: 500;">${date}</div>`;
        
        params.forEach((param: any) => {
          if (param.seriesName === '个人正确率' || param.seriesName === '班级正确率') {
            let value = param.value;
            if (Array.isArray(value)) {
              value = value[1];
            }
            const seriesName = param.seriesName;
            const color = param.color;
            tooltipContent += `<div style="margin: 2px 0;"><span style="display: inline-block; width: 8px; height: 8px; background-color: ${color}; border-radius: 50%; margin-right: 8px;"></span>${seriesName} ${parseFloat(value).toFixed(0)}%</div>`;
          }
        });
        
        tooltipContent += '</div>';
        return tooltipContent;
      }
    },
    grid: getCommonGridConfig(isH5),
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: '#E5E7EB'
        }
      },
      axisLabel: {
        color: '#646A73',
        fontSize: 12
      },
      splitLine: {
        show: false
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: getCommonYAxisConfig(),
    series: [
      analysisType === 'personal' && {
        name: '个人正确率',
        type: 'line',
        data: personalData.map((item: any) => item.axis),
        smooth: false,
        symbol: 'circle',
        symbolSize: 3,
        showSymbol: true,
        lineStyle: {
          color: '#407AFF',
          width: 2
        },
        itemStyle: {
          color: '#407AFF',
          borderWidth: 0,
          borderColor: '#407AFF'
        },
        emphasis: {
          showSymbol: true,
          symbolSize: 6,
          itemStyle: {
            color: '#fff',
            borderWidth: 2,
            borderColor: '#407AFF'
          }
        },
        // blur: {
        //   showSymbol: false,
        //   symbolSize: 0
        // }
      },
      {
        name: '班级正确率',
        type: 'line',
        data: classData.map((item: any) => item.axis),
        smooth: false,
        symbol: 'circle',
        symbolSize: 3,
        showSymbol: true,
        lineStyle: {
          color: '#50CEFB',
          width: 2
        },
        itemStyle: {
          color: '#50CEFB',
          borderWidth: 0,
          borderColor: '#50CEFB'
        },
        emphasis: {
          showSymbol: true,
          symbolSize: 6,
          itemStyle: {
            color: '#fff',
            borderWidth: 2,
            borderColor: '#50CEFB'
          }
        },
        // blur: {
        //   showSymbol: false,
        //   symbolSize: 0
        // }
      },
      // 及格线和优秀线
      ...getMarkLineConfig(isH5)
    ]
  };
}

const HomeworkRightChart = ({
  analysisModel,
  loading,
  dataSource, 
  dateRange = []
}: { 
  analysisModel: any,
  loading: boolean,
  dataSource: any, 
  dateRange?: any
}) => {
  const isH5 = useLocation().pathname.includes('analysisH5');
  const { analysisType } = analysisModel
  const [option, setOption] = useState<any>({});
  const effectiveAnalysisType = isH5 ? 'personal' : analysisType;
  
  const { size: chartWidth, containerRef } = useChartSize({
    dateRange,
    isH5,
    itemSize: isH5 ? 50 : 80,
    defaultSize: '100%',
    maxLength: isH5 ? 7 : 14,
    direction: 'width',
  });

  useEffect(() => {
    if (dataSource) {
      setOption(getLineChartOption(dataSource, dateRange, isH5, effectiveAnalysisType))
    }
  }, [dataSource]);

  // 图例
  const legendContent = effectiveAnalysisType === 'personal' ? (
    <div className='homework-right-legend'>
      <div className='homework-right-legend-item'>
        <div className='color'></div>
        <div className='text'>个人正确率</div>
      </div>
      <div className='homework-right-legend-item'>
        <div className='color'></div>
        <div className='text'>班级正确率</div>
      </div>
    </div>
  ) : null;

  return (
    <ChartWrapper
      title="作业正确率趋势"
      loading={loading}
      dataSource={dataSource}
      className="homework-right"
      extra={legendContent}
    >
      <div className='homework-right-content'>
        <div className='homework-right-content-ylist'>
          {[0, 20, 40, 60, 80, 100].reverse().map((item) => (
            <div className='homework-right-content-ylist-item' key={item}>{item}%</div>
          ))}
        </div>
        <div className='homework-right-content-chart' ref={containerRef}>
          {option && (
            <ReactECharts 
              option={option} 
              style={{ width: chartWidth, height: 264 }}
              notMerge={true}
              lazyUpdate={true}
            />
          )}
        </div>
      </div>
    </ChartWrapper>
  );
};

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(HomeworkRightChart)
