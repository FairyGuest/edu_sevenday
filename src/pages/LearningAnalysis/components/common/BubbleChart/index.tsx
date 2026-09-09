import { useMemo } from 'react'
import EChartsReact from 'echarts-for-react'

import ChartWrapper from '../../common/ChartWrapper'

import './index.less'

const bubbleData = [
  { name: '102', value: 102 },
  { name: '160', value: 160 },
  { name: '158', value: 158 },
  { name: '55', value: 55 },
  { name: '52', value: 52 },
  { name: '50', value: 50 },
  { name: '47', value: 47 },
  { name: '45', value: 45 },
  { name: '42', value: 42 },
  { name: '40', value: 40 },
  { name: '37', value: 37 },
  { name: '35', value: 35 },
  { name: '32', value: 32 },
  { name: '29', value: 29 },
  { name: '27', value: 27 },
  { name: '24', value: 24 },
  { name: '21', value: 21 },
  { name: '18', value: 18 },
  { name: '16', value: 16 },
  { name: '11', value: 11 },
]

const colorPalette = [
  '#5B8FF9',
  '#61DDAA',
  '#65789B',
  '#F6BD16',
  '#7262fd',
  '#78D3F8',
  '#FF9D4D',
  '#949dff',
  '#7B1CF5',
  '#59c4e6',
  '#fac858',
  '#91cc75',
  '#3ba272',
  '#73c0de',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
]

export default function BubbleChart() {
  const option = useMemo(() => {
    const nodes = bubbleData.map((item, idx) => ({
      id: item.name,
      name: item.name,
      value: item.value,
      symbolSize: Math.max(26, Math.sqrt(item.value) * 6),
      itemStyle: {
        color: colorPalette[idx % colorPalette.length],
      },
      label: {
        fontSize: 12,
        color: '#1E253B',
      },
    }));

    // Use invisible edges to help the force layout spread bubbles evenly.
    const edges = nodes.map((node, idx) =>
      idx === 0
        ? null
        : {
            source: nodes[0].id,
            target: node.id,
          },
    ).filter(Boolean) as { source: string; target: string }[];

    return {
      tooltip: {
        formatter: (params: any) => `${params.data.name}: ${params.data.value}`,
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          force: {
            repulsion: 180,
            gravity: 0.08,
            edgeLength: 60,
          },
          roam: false,
          draggable: false,
          data: nodes,
          edges,
          lineStyle: {
            opacity: 0,
          },
          label: {
            show: true,
          },
        },
      ],
    }
  }, [])

  return (
    <ChartWrapper 
      title="气泡图" 
      dataSource={bubbleData}
    >
      <div className="agent-analysis-chart">
        <EChartsReact
          style={{ width: '100%', height: 420 }}
          option={option}
          notMerge
        />
      </div>
    </ChartWrapper>
  )
}
