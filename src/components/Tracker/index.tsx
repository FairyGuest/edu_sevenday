// Tracker.tsx
import { addNewTracking } from '@/utils';
import React, { useEffect, useRef } from 'react';

const Tracker = (props:any) => {

  const { 
    trackData, 
    eventType = 'click', 
    disabled = false, 
    children 
  }:any=props;  


  // 处理曝光埋点
  useEffect(() => {

    if (eventType === 'view' && !disabled) {
      // 简单的曝光上报
      console.log("==预览埋点执行==",trackData) 
      addNewTracking({bt: 'pv',...trackData})
    
    }
  }, []);

  // 处理点击埋点
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;

    // 1. 执行埋点
    if (eventType === 'click') {
      console.log("==点击埋点执行==",trackData)   
      addNewTracking({bt: 'cl',...trackData})
    }

    // 2. 执行子组件原本的 onClick 事件
    const childProps = children.props;
    if (childProps && childProps.onClick) {
      childProps.onClick(e);
    }
  };

  // 克隆子元素，将我们的 handleClick 赋予它
  // 注意：这种方式只适用于包装单个子元素
  if (!React.isValidElement(children)) {
    return <>{children}</>;
  }

  return React.cloneElement(children, {
    onClick: handleClick,
    // 如果需要处理 hover，可以在这里加 onMouseEnter
    // onMouseEnter: ...
  });
};

export default Tracker;
