import React from 'react';
import { Tag } from 'antd';
import type { MultiSelectTagsProps } from './types';
import './index.less';

const MultiSelectTags: React.FC<MultiSelectTagsProps> = ({
  options,
  value = [],
  onChange,
  placeholder
}) => {
  const handleTagClick = (tagValue: string) => {
    let newValues: string[];
    
    if (tagValue === "all") {
      // 点击"全部"时，只保留"全部"
      newValues = ["all"];
    } else {
      // 点击具体选项时
      if (value.includes(tagValue)) {
        // 如果已经选中，则取消选择
        newValues = value.filter(v => v !== tagValue);
        // 如果取消后没有任何选项，自动选择"全部"
        if (newValues.length === 0) {
          newValues = ["all"];
        }
      } else {
        // 如果未选中，则添加选择，并移除"全部"
        newValues = value.filter(v => v !== "all").concat(tagValue);
      }
    }
    
    onChange?.(newValues);
  };

  return (
    <div className="multi-select-tags">
      {options.map(option => (
        <Tag.CheckableTag
          key={option.value}
          checked={value.includes(option.value)}
          onChange={() => handleTagClick(option.value)}
          className="select-tag"
        >
          {option.label}
        </Tag.CheckableTag>
      ))}
    </div>
  );
};

export default MultiSelectTags;