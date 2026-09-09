import React from 'react';
import ZYIcon from '@/components/ZYIcon';
import './index.less';

interface ChartWrapperProps {
  title?: string;
  loading?: boolean;
  isEmpty?: boolean;
  isEmptyFn?: (dataSource: any) => boolean;
  dataSource?: any;
  children?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  loading = false,
  isEmpty: isEmptyProp,
  isEmptyFn,
  dataSource,
  children,
  extra,
  className = '',
}) => {
  const isEmpty = isEmptyProp !== undefined 
    ? isEmptyProp 
    : isEmptyFn 
      ? isEmptyFn(dataSource)
      : !dataSource || (Array.isArray(dataSource) && dataSource.length === 0);

  return (
    <div className={className ? `${className} chart-wrapper` : 'chart-wrapper'}>
      {title && <div className="chart-wrapper-title">{title}</div>}
      
      {loading 
        ? <div className="chart-wrapper-loading">
            <span className="anticon-spin">
              <ZYIcon type="load-color" style={{ fontSize: "20px" }} />
            </span>
            <span className="text">数据加载中</span>
          </div> 
        : <>
            {!isEmpty 
              ? <>
                  {children}
                  {extra}
                </> 
              : <div className="chart-wrapper-empty">
                  <ZYIcon type="kongshuju7" className="icon" />
                  <div className="text">暂无数据</div>
                </div>
            }
          </>
      }
    </div>
  );
};

export default ChartWrapper;

