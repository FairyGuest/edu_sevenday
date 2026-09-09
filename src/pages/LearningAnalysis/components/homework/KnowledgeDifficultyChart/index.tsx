import { useState, useEffect } from 'react'
import { connect, useLocation } from '@umijs/max';
import { Dropdown, Button, Divider, Empty, Tooltip } from 'antd';
import ReactECharts from 'echarts-for-react';
import { CheckOutlined } from "@ant-design/icons";
import ChartWrapper from '../../common/ChartWrapper';
import { ZYIcon } from '@/components';

import './index.less'

const emptyOption = {
  series: []
};

const getKnowledgeDifficultyOption = (item: any, isH5: boolean) => {
  const colorMap: Record<string, string> = {
    '容易题目': '#4E83FD',
    '较易题目': '#50CEFB',
    '适中题目': '#935AF6',
    '较难题目': '#FAD355',
    '困难题目': '#F76964',
  };

  const seriesData = [
    {
      name: '容易题目',
      value: Number(item.easyNum || 0),
      correctness: `${Number(item.easyRightRate || 0)}%`,
      itemStyle: { color: colorMap['容易题目'] },
    },
    {
      name: '较易题目',
      value: Number(item.easyModerateNum || 0),
      correctness: `${Number(item.easyModerateRightRate || 0)}%`,
      itemStyle: { color: colorMap['较易题目'] },
    },
    {
      name: '适中题目',
      value: Number(item.mediumNum || 0),
      correctness: `${Number(item.mediumRightRate || 0)}%`,
      itemStyle: { color: colorMap['适中题目'] },
    },
    {
      name: '较难题目',
      value: Number(item.moderateHardNum || 0),
      correctness: `${Number(item.moderateHardRightRate || 0)}%`,
      itemStyle: { color: colorMap['较难题目'] },
    },
    {
      name: '困难题目',
      value: Number(item.hardNum || 0),
      correctness: `${Number(item.hardRightRate || 0)}%`,
      itemStyle: { color: colorMap['困难题目'] },
    },
  ];

  return {
    animation: false,
    legend: {
      orient: isH5 ? 'vertical' : 'horizontal',
      bottom: '0',
      itemWidth: 0,
      itemHeight: 0,
      itemGap: 0,
      padding: isH5 ? 12 : [16, 19, 0, 16],
      backgroundColor: '#F7F8FA',
      borderRadius: 4,
      formatter: (name: string) => {
        const found = seriesData.find((it: any) => it.name === name);
        if (!found) return name;
        let key = '';
        switch (name) {
          case '容易题目':
            key = 'simple';
            break;
          case '较易题目':
            key = 'littleSimple';
            break;
          case '适中题目':
            key = 'medium';
            break;
          case '较难题目':
            key = 'littleHard';
            break;
          case '困难题目':
            key = 'hard';
            break;
        }
        return `{dot_${key}|}{title|${name}}${isH5 ? '' : '\n'}{empty|}{label|题目数量} {val_${key}|${found.value}}${isH5 ? '' : '\n'}{empty|}{label|正确率} {rateVal|${found.correctness}}`;
      },
      textStyle: {
        lineHeight: 20,
        padding: isH5 ? [4, 24, 4, 0] : [0, 15, 16, 18],
        rich: {
          dot_simple: { width: 12, height: 12, backgroundColor: colorMap['容易题目'], borderRadius: 2 },
          dot_littleSimple: { width: 12, height: 12, backgroundColor: colorMap['较易题目'], borderRadius: 2 },
          dot_medium: { width: 12, height: 12, backgroundColor: colorMap['适中题目'], borderRadius: 2 },
          dot_littleHard: { width: 12, height: 12, backgroundColor: colorMap['较难题目'], borderRadius: 2 },
          dot_hard: { width: 12, height: 12, backgroundColor: colorMap['困难题目'], borderRadius: 2 },
          title: { fontSize: 14, fontWeight: 600, color: '#333C55', padding: isH5 ? [0, 24, 0, 6] : [0, 0, 0, 6] },
          empty: { width: 18, height: 12},
          label: { fontSize: isH5 ? 14 : 12, color: '#646E8B', padding: [0, 6, 0, 0] },
          val_simple: { width: 20, fontSize: isH5 ? 14 : 12, fontWeight: 600, color: colorMap['容易题目'], padding: isH5 ? [0, 24, 0, 0] : 0 },
          val_littleSimple: { width: 20, fontSize: isH5 ? 14 : 12, fontWeight: 600, color: colorMap['较易题目'], padding: isH5 ? [0, 24, 0, 0] : 0 },
          val_medium: { width: 20, fontSize: isH5 ? 14 : 12, fontWeight: 600, color: colorMap['适中题目'], padding: isH5 ? [0, 24, 0, 0] : 0 },
          val_littleHard: { width: 20, fontSize: isH5 ? 14 : 12, fontWeight: 600, color: colorMap['较难题目'], padding: isH5 ? [0, 24, 0, 0] : 0 },
          val_hard: { width: 20, fontSize: isH5 ? 14 : 12, fontWeight: 600, color: colorMap['困难题目'], padding: isH5 ? [0, 24, 0, 0] : 0 },
          rateVal: { fontSize: isH5 ? 14 : 12, fontWeight: 600, color: '#333C55' }
        }
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      textStyle: {
        color: '#1F2329',
        fontSize: 12,
      },
      extraCssText: 'box-shadow: 0 2px 10px rgba(0,0,0,.05); border-radius: 4px;',
      formatter: function (params: any) {
        if (!params || !params.data) return '<div style="padding: 8px;">暂无数据</div>';
        const { name, value } = params;
        const correctness = params.data.correctness;
        return `
          <div style="padding: 4px;">
            <div style="display:flex;align-items:center;margin-bottom:4px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background-color:${params.color};margin-right:8px;"></span>
              <span style="font-size:14px;color:#1F2329;font-weight:500;">${name}</span>
            </div>
            <div style="font-size:12px;color:#646E8B;margin-left:18px;">题数 ${value}</div>
            <div style="font-size:12px;color:#646E8B;margin-left:18px;">正确率 ${correctness}</div>
          </div>`;
      },
    },
    series: [
      {
        type: 'pie',
        radius: isH5 ? ['37%', '56%'] : ['38%', '58%'],
        center: isH5 ? ['50%', '35%'] : ['50%', '35%'],
        data: seriesData,
        label: {
          show: true,
          position: 'center',
          formatter: item.knowledgeName.length > 8 && item.knowledgeName.length < 16
            ? item.knowledgeName.slice(0, 8) + '\n' + item.knowledgeName.slice(8)
            : (item.knowledgeName.length >= 16
              ? item.knowledgeName.slice(0, 8) + '\n' + item.knowledgeName.slice(8, 15) + '...'
              : item.knowledgeName),
          color: '#1E253B',
          fontSize: 16,
          fontWeight: 600,
          lineHeight: 24,
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

const KnowledgeDifficultyChart = ({ 
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
  const [data, setData] = useState<any>([]);
  const [selectedKey, setSelectedKey] = useState<string>('1');
  const [hoverItem, setHoverItem] = useState<any>(null);
  const [option, setOption] = useState<any>(null);

  useEffect(() => {
    if (dataSource && dataSource.length > 0) {
      // 只展示前10条
      setData(dataSource.slice(0, 10));
      setHoverItem(dataSource[0]);
    } else {
      setOption(emptyOption);
      setHoverItem(null);
    }
  }, [dataSource]);

  useEffect(() => {
    if (hoverItem) {
      setOption(getKnowledgeDifficultyOption(hoverItem, isH5));
    } else {
      setOption(emptyOption);
    }
  }, [hoverItem]);

  const items = [
    {
      key: '1',
      label: (
        <div className='dropdown-item'>
          <span className='text'>按正确率正序</span>
          {selectedKey === '1' && <CheckOutlined style={{ color: '#10B981', marginLeft: '8px' }} />}
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div className='dropdown-item'>
          <span className='text'>按正确率倒序</span>
          {selectedKey === '2' && <CheckOutlined style={{ color: '#10B981', marginLeft: '8px' }} />}
        </div>
      ),
    },
  ];

  const onSelectChange = (key: string) => {
    setSelectedKey(key);
    // 只展示前10条
    if (key === '1') {
      setData(dataSource.slice(0, 10));
    } else {
      setData([...dataSource].reverse().slice(0, 10));
    }
  }

  return (
    <ChartWrapper 
      title="出题难度占比及正确率" 
      loading={loading} 
      dataSource={dataSource}
      className='knowledge-difficulty'
    >
      <div className='knowledge-difficulty-content'>
        <div className='knowledge-difficulty-content-left'>
          <div className='top'>
            <div className='title'>知识点正确率</div>
            <Dropdown 
              placement="bottomRight"
              menu={{
                items, 
                selectable: true, 
                selectedKeys: [selectedKey], 
                onSelect: (val: any) => onSelectChange(val.key)
                }}
              >
              <Button type='text' icon={<ZYIcon type="shaixuan" />} size='small' className='dropdown-button' />
            </Dropdown>
          </div>
          <div className='list'>
            {data.map((item: any) => (
              <div 
                className={`list-item ${hoverItem === item ? 'active' : ''}`}
                key={item.knowledgeName}
                onMouseEnter={() => setHoverItem(item)}
              >
                <div className='list-item-name'>
                  <Tooltip placement="left" title={item.knowledgeName}>
                    <div className='text-content'>{item.knowledgeName}</div>
                  </Tooltip>
                </div>
                <div className='list-item-value'>
                  <div className='process' style={{ width: `${effectiveAnalysisType == 'personal' ? item.personalRate : item.classRate}%` }} />
                  <div className='value'>{effectiveAnalysisType == 'personal' ? item.personalRate : item.classRate}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Divider type='vertical'/>
        <div className='knowledge-difficulty-content-right'>
          {hoverItem
            ? <div className='chart'>
                <ReactECharts 
                  option={option}
                  style={{ width: '100%', height: '100%' }} 
                  notMerge={true}
                  lazyUpdate={true}
                />
              </div>
            : <Empty />}
        </div>
      </div>
    </ChartWrapper>
  )
}

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(KnowledgeDifficultyChart)