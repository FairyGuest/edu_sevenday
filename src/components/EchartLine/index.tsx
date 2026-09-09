import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const LineChart = (props:any) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // 初始化图表
    const chartInstance = echarts.init(chartRef.current!);    // 配置图表的选项
    const option = props.option || {
      title: {
        // text: '折线图示例',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['销量'],
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '销量',
          type: 'line',
          smooth: true,
          data: [520, 932, 901, 1934, 1290, 1330, 1320],
        },
      ],
    };

    // 设置图表的配置
    chartInstance.setOption(option);

    // 监听窗口大小变化，重新绘制图表
    window.addEventListener('resize', () => {
      chartInstance.resize();
    });

    // 组件卸载时销毁图表实例
    return () => {
      window.removeEventListener('resize', () => chartInstance.resize());
      chartInstance.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default LineChart;