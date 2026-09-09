import { useState, useEffect, useRef } from 'react';
import { connect, useLocation } from '@umijs/max';
import { Empty } from 'antd';
import ReactECharts from 'echarts-for-react';
import ChartWrapper from '../../common/ChartWrapper';
import { useChartSize } from '../../../hooks/useChartSize';

import './index.less';

const getBarChartOption = (dataSource: any, isH5: boolean, analysisType: string) => {
  const xAxisData = dataSource.map((item: any) => ({
    name: item.knowledgeName, 
    splitName: item.knowledgeName.length > 6 && item.knowledgeName.length < 12 
      ? item.knowledgeName.slice(0, 6) + '\n' + item.knowledgeName.slice(6) 
      : (item.knowledgeName.length >= 12 
        ? item.knowledgeName.slice(0, 6) + '\n' + item.knowledgeName.slice(6, 11) + '...' 
        : item.knowledgeName
      )
    }));
  const firstCategoryData = dataSource.map((item: any) => analysisType == 'personal' ? item.personalRate : item.classRate);
  const secondCategoryData = dataSource.map((item: any) => analysisType == 'personal' ? item.classRate : item.gradeRate);

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      textStyle: {
        color: '#1F2329',
        fontSize: 12
      },
      extraCssText: 'box-shadow: 0 2px 10px rgba(0,0,0,.05); border-radius: 4px;',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(31, 35, 41, 0.05)'
        }
      },
      formatter: function(params: any) {
        if (!params || !Array.isArray(params) || params.length === 0) {
          return '<div style="padding: 8px;">暂无数据</div>';
        }
        
        const name = xAxisData.find((item: any) => item.splitName === params[0].axisValue)?.name || '';
        let tooltipContent = `<div style="padding: 4px;"><div style="margin-bottom: 8px;font-size: 14px;color: #1F2329;font-weight: 500;">${name}</div>`;
        
        params.forEach((param: any) => {
          if (analysisType === 'personal' && (param.seriesName === '个人正确率' || param.seriesName === '班级正确率') || analysisType === 'class' && (param.seriesName === '班级正确率' || param.seriesName === '年级正确率')) {
            const value = param.value;
            const seriesName = param.seriesName;
            const color = param.color;
            tooltipContent += `<div style="margin: 2px 0;display: flex;align-items: center;">
              <span style="display: inline-block; width: 12px; height: 12px; background-color: ${color}; border-radius: 3px; margin-right: 4px;"></span>
              <span style="font-size: 14px;color: #646E8B;">${seriesName}</span>
              <span style="font-size: 14px;color: #1F2329; font-weight: 500;margin-left: 4px;">${value}%</span>
            </div>`;
          }
        });
        
        tooltipContent += '</div>';
        return tooltipContent;
      }
    },
    grid: {
      left: isH5 ? '17px' : '12px',
      right: '0',
      top: '3%',
      bottom: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData.map((item: any) => item.splitName),
      axisLine: {
        lineStyle: {
          color: '#E5E7EB'
        }
      },
      axisLabel: {
        color: '#646E8B',
        fontSize: 12,
        interval: 0
      },
      splitLine: {
        show: false
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
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
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: analysisType === 'personal' ? '个人正确率' : '班级正确率',
        type: 'bar',
        data: firstCategoryData,
        barWidth: '8px',
        itemStyle: {
          color: '#407AFF',
          borderRadius: [1, 1, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#407AFF',
            shadowBlur: 10,
            shadowColor: 'rgba(64, 122, 255, 0.3)'
          }
        }
      },
      {
        name: analysisType === 'personal' ? '班级正确率' : '年级正确率',
        type: 'bar',
        data: secondCategoryData,
        barWidth: '8px',
        itemStyle: {
          color: '#50CEFB',
          borderRadius: [1, 1, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#50CEFB',
            shadowBlur: 10,
            shadowColor: 'rgba(80, 206, 251, 0.3)'
          }
        }
      },
      // 及格线 60%
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
            type: 'dashed'
          },
          label: {
            show: true,
            position: 'insideStartTop',
            formatter: '及格线',
            color: '#FFA53D',
            fontSize: 12,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            padding: [0, 0, 0, -15]
          },
          symbol: 'none',
          data: [
            {
              yAxis: 60
            }
          ]
        }
      },
      // 优秀线 80%
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
            type: 'dashed'
          },
          label: {
            show: true,
            position: 'insideStartTop',
            formatter: '优秀线',
            color: '#96BDFF',
            fontSize: 12,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            padding: [0, 0, 0, -15]
          },
          symbol: 'none',
          data: [
            {
              yAxis: 80
            }
          ]
        }
      }
    ]
  };
}

const KnowledgeRightChart = ({ 
  analysisModel,
  dataSource, 
  loading = false
}: { 
  analysisModel: any,
  dataSource: any, 
  loading: boolean
}) => {
  const { analysisType } = analysisModel
  const isH5 = useLocation().pathname.includes('analysisH5');
  const effectiveAnalysisType = isH5 ? 'personal' : analysisType;
  const [option, setOption] = useState<any>({});
  const { size: chartWidth, containerRef } = useChartSize({
    dataLength: dataSource?.length,
    isH5,
    itemSize: 80,
    defaultSize: '100%',
    maxLength: isH5 ? 5 : 14,
    direction: 'width',
  });

  useEffect(() => {
    if (dataSource && dataSource.length > 0) {
      setOption(getBarChartOption(dataSource, isH5, effectiveAnalysisType))
    }
  }, [dataSource]);

  const legendContent = (
    <div className='knowledge-right-legend'>
      <div className='knowledge-right-legend-item'>
        <div className='text'>{effectiveAnalysisType === 'personal' ? '个人正确率' : '班级正确率'}</div>
      </div>
      <div className='knowledge-right-legend-item'>
        <div className='text'>{effectiveAnalysisType === 'personal' ? '班级正确率' : '年级正确率'}</div>
      </div>
    </div>
  )

  return (
    <ChartWrapper 
      title="知识点正确率情况" 
      loading={loading} 
      dataSource={dataSource}
      extra={legendContent}
      className='knowledge-right'
    >
      <div className='knowledge-right-content'>
        <div className='knowledge-right-content-ylist'>
          {[0, 20, 40, 60, 80, 100].reverse().map((item) => (
            <div className='knowledge-right-content-ylist-item' key={item}>{item}%</div>
          ))}
        </div>
        <div className='knowledge-right-content-chart' ref={containerRef}>
          {option 
            ? <ReactECharts 
                option={option} 
                style={{ width: chartWidth, height: 264 }} 
                notMerge={true}
                lazyUpdate={true}
              /> 
            : <Empty description="暂无数据" />
          }
        </div>
      </div>
    </ChartWrapper>
  )
}

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(KnowledgeRightChart)
