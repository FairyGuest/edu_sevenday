import React from 'react';
import { Skeleton } from 'antd';
import './TreeSkeleton.less';

interface TreeSkeletonProps {
  rows?: number;
}

const TreeSkeleton: React.FC<TreeSkeletonProps> = ({ rows = 8 }) => {
  return (
    <div className="tree-skeleton">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="tree-skeleton-item">
          <div className="tree-skeleton-indent" style={{ paddingLeft: `${(index % 3) * 20}px` }}>
            <Skeleton.Button 
              active 
              size="small" 
              style={{ 
                width: `${120 + Math.random() * 80}px`, 
                height: '24px',
                borderRadius: '4px'
              }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TreeSkeleton;