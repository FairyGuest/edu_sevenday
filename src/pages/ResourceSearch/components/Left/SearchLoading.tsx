import React from 'react';
import { Spin } from 'antd';
import './SearchLoading.less';

const SearchLoading: React.FC = () => {
  return (
    <div className="search-loading">
      <div className="search-loading-content">
        <Spin size="small" />
        <span className="search-loading-text">关键字匹配中</span>
      </div>
    </div>
  );
};

export default SearchLoading;