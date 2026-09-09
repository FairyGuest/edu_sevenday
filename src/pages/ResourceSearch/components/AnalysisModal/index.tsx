import { useState, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Drawer, Table } from 'antd'
import ReactECharts from 'echarts-for-react';
import { useDispatch } from '@umijs/max'
import type { TableProps } from 'antd';

import './index.less'

interface QuestionTypeDataType {
  type: string
  count: number
}
interface KPointDataType {
  num: string
  kpoint: number
  questions: number
}
interface DetailDataType {
  num: string
  difficulty: string
  points: string
}

const getOption = (dataSource: any) => {
  const colorMap = {
    '容易': '#4E83FD', 
    '较易': '#50CEFB',    
    '适中': '#935AF6',     
    '较难': '#FAD355', 
    '困难': '#F76964'
  };

  const processedData = (dataSource || []).map((item: any) => ({
    ...item,
    itemStyle: {
      color: colorMap[item.name as keyof typeof colorMap] || '#ccc'
    }
  }));

  return {
    animation: false,
    legend: {
      show: true,
      orient: 'vertical',
      right: 0,
      bottom: '2%',
      align: 'right',
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20,
      textStyle: {
        color: '#646A73',
        fontSize: 14
      },
      data: ['容易', '较易', '适中', '较难', '困难'].map(name => ({
        name,
        icon: 'roundRect',
        itemStyle: {
          color: colorMap[name as keyof typeof colorMap]
        }
      }))
    },
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
        
        const { name, percent } = params;
        return `
          <div style="display: flex;padding: 4px;">
            <div style="width: 12px;height: 12px;border-radius: 3px;background-color: ${colorMap[name as keyof typeof colorMap]};margin-top: 2px;"></div>
            <div style="display: flex;flex-direction: column;margin-left: 8px;">
              <div style="margin-bottom: 4px;font-size: 14px;color: #1F2329;font-weight: 500;">${name}</div>
              <div style="margin-top: 4px;"><span style="color: #646E8B;width: 56px;">占比</span> <span style="color: #1F2329;font-weight: 500;">${percent}%</span></div>
            </div>
          </div>
        `;
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['60%', '90%'],
        center: ['41%', '53%'],
        data: processedData,
        label: {
          show: false
        },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 1.1,
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
        },
      },
    ],
  };
};

export default function AnalysisModel(props: any) {
  const { onRef, currentDataId, title } = props
  const [open, setOpen] = useState(false)
  const drawerContentRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<React.ComponentRef<typeof ReactECharts>>(null)
  const dispatch = useDispatch()
  const [questionTypeData, setQuestionTypeData] = useState<QuestionTypeDataType[]>([])
  const [kpointAnalysisData, setKpointAnalysisData] = useState([])
  const [chartOption, setChartOption] = useState<any>({ series: [] })
  const questionTypeColumns: TableProps<QuestionTypeDataType>['columns'] = useMemo(() => [
    {
      title: '题型',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      render: (text: string) => <div style={{ color: '#646E8B' }}>{text}</div>
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      align: 'center'
    }
  ], [])

  const kPointColumns: TableProps<KPointDataType>['columns'] = useMemo(() => [
    {
      title: '序号',
      dataIndex: 'num',
      key: 'num',
      align: 'center',
      render: (text: string) => <div style={{ color: '#646E8B' }}>{text}</div>
    },
    {
      title: '知识点',
      dataIndex: 'kpoint',
      key: 'kpoint',
      align: 'center'
    },
    {
      title: '对应题号',
      dataIndex: 'questions',
      key: 'questions',
      align: 'center'
    }
  ], [])

  useEffect(() => {
    if (open) {
      getAnalysisData()
    }
  }, [open])

  const resizeChart = () => {
    chartRef.current?.getEchartsInstance()?.resize()
  }

  // Drawer 第一次打开时容器宽度高度可能还是 0，ECharts 会按 0 尺寸初始化，数据返回或动画结束后再 resize
  useEffect(() => {
    if (!open) return
    const id = window.requestAnimationFrame(() => {
      resizeChart()
      window.requestAnimationFrame(resizeChart)
    })
    return () => window.cancelAnimationFrame(id)
  }, [open, chartOption])

  const getAnalysisData = async () => {
    const { code, data = [] }: any = await dispatch({
      type: 'resourceSearchModel/getData',
      apiUrl: 'questionGroupAnalysis',
      payload: {
        paper_id: currentDataId
      }
    })
    if (code === 200) {
      const { 
        question_type_data, 
        difficulty_data, 
        kpoint_analysis_data, 
      } = data

      setQuestionTypeData(
        Object.entries(question_type_data).map(([key, value]) => ({
          type: key,
          count: value
        })
      ) as QuestionTypeDataType[] ?? [])
      setChartOption(getOption(difficulty_data))
      setKpointAnalysisData(kpoint_analysis_data.map((item: any) => ({ ...item, questions: item.questions.replace(/,/g, '、') })) ?? [])
    }
  }

  useImperativeHandle(onRef, () => ({
    openModal: () => {
      setOpen(true)
    }
  }))

  return (
    <Drawer 
      open={open} 
      onClose={() => setOpen(false)}
      afterOpenChange={(visible) => {
        if (visible) {
          window.requestAnimationFrame(() => {
            resizeChart()
          })
        }
      }}
      title={title ?? "组题分析"}
      width='720'
      closable={{ placement: 'end' }}
      // getContainer={window.document.body}
    >
      <div className='analysis-modal-content' ref={drawerContentRef}>
        <div className='first-box'>
          <div className='first-box-left'>
            <div className='title'>练习题型</div>
            <Table<QuestionTypeDataType> 
              columns={questionTypeColumns} 
              dataSource={questionTypeData} 
              pagination={false}
            />
          </div>
          <div className='first-box-right'>
            <div className='title'>练习难度</div>
            <div className='chart'>
              <ReactECharts 
                ref={chartRef}
                option={chartOption}
                style={{ width: 322, height: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            </div>
          </div>
        </div>
        <div className='second-box'>
          <div className='title'>知识点分析</div>
          <Table<KPointDataType> 
            columns={kPointColumns} 
            dataSource={kpointAnalysisData} 
            pagination={false}
          />
        </div>
      </div>
    </Drawer>
  )
}
