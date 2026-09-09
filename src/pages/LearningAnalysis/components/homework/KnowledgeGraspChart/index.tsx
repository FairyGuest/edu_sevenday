import { useState, useEffect } from 'react';
import { connect, useLocation } from '@umijs/max';
import ReactECharts from 'echarts-for-react';
import ChartWrapper from '../../common/ChartWrapper';

import './index.less';

const emptyOption = {
  series: []
};

const getKnowledgeGraspOption = (dataSource: any, isH5: boolean, analysisType: string) => {
  const firstPieData = analysisType == 'personal' ? dataSource?.personalData : dataSource?.classData;
  const secondPieData = analysisType == 'personal' ? dataSource?.classData : dataSource?.gradeData;

  const colorMap = {
    '优异': '#4E83FD', 
    '良好': '#50CEFB',    
    '一般': '#935AF6',     
    '较薄弱': '#FAD355', 
    '急需提升': '#F76964'
  };

  // 处理个人数据，确保包含所有等级
  const allLevels = ['优异', '良好', '一般', '较薄弱', '急需提升'];
  const personalSeries = allLevels.map(level => {
    const existingItem = firstPieData?.find((item: any) => item.name === level);
    return {
      name: level,
      value: existingItem ? existingItem.value : 0,
      itemStyle: {
        color: colorMap[level as keyof typeof colorMap]
      }
    };
  });

  // 处理班级数据，确保包含所有等级
  const classSeries = allLevels.map(level => {
    const existingItem = secondPieData?.find((item: any) => item.name === level);
    return {
      name: level,
      value: existingItem ? existingItem.value : 0,
      itemStyle: {
        color: colorMap[level as keyof typeof colorMap]
      }
    };
  });

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      textStyle: {
        color: '#1F2329',
        fontSize: 12
      },
      extraCssText: 'box-shadow: 0 2px 10px rgba(0,0,0,.05); border-radius: 4px;',
      formatter: function(params: any) {
        if (!params || !params.data) {
          return '<div style="padding: 8px;">暂无数据</div>';
        }
        
        const { name, value, percent } = params;
        return `
          <div style="display: flex;padding: 4px;">
            <div style="width: 12px;height: 12px;border-radius: 3px;background-color: ${colorMap[name as keyof typeof colorMap]};margin-top: 2px;"></div>
            <div style="display: flex;flex-direction: column;margin-left: 8px;">
              <div style="margin-bottom: 4px;font-size: 14px;color: #1F2329;font-weight: 500;">${name}</div>
              <div style="margin-top: 4px;"><span style="color: #646E8B;width: 56px;">${analysisType === 'personal' ? '知识点个数' : '平均知识点数'}</span> <span style="color: #1F2329;font-weight: 500;">${value}</span></div>
              <div style="margin-top: 4px;"><span style="color: #646E8B;width: 56px;">占比</span> <span style="color: #1F2329;font-weight: 500;">${percent}%</span></div>
            </div>
          </div>
        `;
      }
    },
    legend: {
      show: !isH5, // H5下不显示ECharts自带legend
      orient: 'vertical',
      right: 0,
      top: '38%',
      align: 'right',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20,
      textStyle: {
        color: '#646A73',
        fontSize: 12
      },
      formatter: (name: string) => {
        const percentageMap: { [key: string]: string } = {
          '优异': '90%-100%',
          '良好': '80%-89%',
          '一般': '70%-79%',
          '较薄弱': '50%-69%',
          '急需提升': '0%-49%'
        };
        return `${name} ${percentageMap[name]}`;
      },
      data: ['优异', '良好', '一般', '较薄弱', '急需提升']
    },
    graphic: [
      {
        type: 'text',
        right: isH5 ? '' : 30,
        left: isH5 ? 0 : '',
        top: isH5 ? '90%' : '15%',
        style: {
          text: '知识点总数',
          textAlign: 'right',
          fontSize: 12,
          fill: '#646A73'
        }
      },
      {
        type: 'text',
        right: isH5 ? '' : 7,
        left: isH5 ? 70 : '',
        top: isH5 ? '90%' : '15%',
        style: {
          text: dataSource?.knowledge_point_count || 0,
          textAlign: 'right',
          fontWeight: 500,
          fontSize: 12,
          fill: '#1F2329'
        }
      },
      {
        type: 'text',
        right: isH5 ? '' : 7,
        left: isH5 ? 0 : '',
        top: isH5 ? '96%' : '30%',
        style: {
          text: '正确率',
          textAlign: 'right',
          fontSize: 14,
          fontWeight: 500,
          fill: '#333C55'
        }
      }
    ],
    series: [
      {
        name: analysisType === 'personal' ? '个人知识点掌握情况' : '班级知识点掌握情况',
        type: 'pie',
        radius: ['70', '110'],
        center: isH5 ? ['50%', '22%'] : ['20%', '50%'],
        data: firstPieData?.every((item: any) => item.value === 0) ? [] : personalSeries,
        label: {
          show: true,
          position: 'center',
          formatter: firstPieData?.every((item: any) => item.value === 0) ? '暂无数据' : (analysisType === 'personal' ? '个人知识点\n掌握情况' : '班级知识点\n掌握情况'),
          fontSize: 16,
          lineHeight: 24,
          fontWeight: 500,
          color: '#1E253B'
        },
        labelLine: {
          show: false
        },
        emphasis: {
          scale: true,
          scaleSize: 1.2,
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      },
      {
        name: analysisType === 'personal' ? '班级知识点掌握情况' : '年级知识点掌握情况',
        type: 'pie',
        radius: ['70', '110'],
        center: isH5 ? ['50%', '68%'] : ['62%', '50%'],
        data: classSeries,
        label: {
          show: true,
          position: 'center',
          formatter: analysisType === 'personal' ? '班级知识点\n掌握情况' : '年级知识点\n掌握情况',
          fontSize: 16,
          lineHeight: 24,
          fontWeight: 500,
          color: '#1E253B'
        },
        labelLine: {
          show: false
        },
        emphasis: {
          scale: true,
          scaleSize: 1.2,
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ]
  };
};

const KnowledgeGraspChart = ({ 
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
  const [option, setOption] = useState<any>(emptyOption);

  useEffect(() => {
    if (dataSource && dataSource?.classData && (dataSource?.personalData || dataSource?.gradeData)) {
      setOption(getKnowledgeGraspOption(dataSource, isH5, effectiveAnalysisType));
    }
  }, [dataSource]);

  const isEmpty = (data: any) => {
    if (effectiveAnalysisType == 'personal') {
      return data && data.personalData && data.classData && data.personalData?.every((item: any) => item.value === 0) && data.classData?.every((item: any) => item.value === 0);
    } else {
      return data && data.classData && data.gradeData && data.classData?.every((item: any) => item.value === 0) && data.gradeData?.every((item: any) => item.value === 0);
    }
  }

  return (
    <ChartWrapper 
      title="掌握概况" 
      loading={loading} 
      dataSource={dataSource}
      isEmptyFn={isEmpty}
      className='knowledge-grasp'
    >
      <div className='knowledge-grasp-chart'>
        <ReactECharts
          option={option} 
          style={{ width: '100%', height: isH5 ? 600 : 350 }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
      {isH5 && (
        <div className="knowledge-grasp-legend-h5">
          <div className="legend-row">
            <span className="legend-item"><span className='label'>优异</span> <span className="range">90%~100%</span> <span className="dot better" /></span>
            <span className="legend-item"><span className='label'>较薄弱</span> <span className="range">50%~69%</span> <span className="dot weak" /></span>
          </div>
          <div className="legend-row">
            <span className="legend-item"><span className='label'>良好</span> <span className="range">80%~89%</span> <span className="dot good" /></span>
            <span className="legend-item"><span className='label'>急需提升</span> <span className="range">0%~49%</span> <span className="dot urgent" /></span>
          </div>
          <div className="legend-row">
            <span className="legend-item"><span className='label'>一般</span> <span className="range">70%~79%</span> <span className="dot normal" /></span>
          </div>
        </div>
      )}
    </ChartWrapper>
  )
}

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(KnowledgeGraspChart)
