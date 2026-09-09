import { Button, Flex } from "antd";
import { useState } from "react";
import { useSelector, useDispatch } from "umi";
import { useRight } from "../../hooks/useRight";
import MultiSelectTags from "../MultiSelectTags";
import { ZYIcon } from "@/components";
import "./index.less";

const FilterSection = () => {
  // 展开收起状态
  const [isExpanded, setIsExpanded] = useState(true);
  // 按钮文字显示状态（延迟更新）
  const [buttonText, setButtonText] = useState('收起');

  const dispatch = useDispatch();

  // 从models获取数据
  const {
    activeTab,
    filters,
    filterOptions,
    catalogType, // 目录类型：knowledge/chapter
    searchText, // 搜索关键字
  } = useSelector((state: any) => state.resourceSearchModel);

  const COMPONENT_MAPS = {
    tags: [
      {
        label: "题型",
        key: "questionTypes",
      },
      {
        label: "难度",
        key: "difficulties",
      },
      activeTab != 'personal' && {
        label: "场景",
        key: "scenes",
      },
      activeTab != 'personal' && activeTab !== 'public' && {
        label: "类型",
        key: "categories",
      },
    ],
    select: [
      {
        label: "用途",
        key: "uses",
      },
      {
        label: "能力",
        key: "abilities",
      },
      {
        label: "年份",
        key: "years",
      },
      {
        label: "地区",
        key: "regions",
      },
      {
        label: "学期",
        key: "gradeSemesters",
      },
    ]
  }

  // 从hooks获取状态变更操作
  const {
    onSearch,
    onFilterChange,
    onClearAllFilters,
  } = useRight();

  // 处理搜索框输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只更新搜索文本状态，不触发搜索
    dispatch({
      type: "resourceSearchModel/setData",
      payload: { searchText: value }
    });
  };

  // 切换展开收起状态
  const toggleExpanded = () => {
    if (isExpanded) {
      setIsExpanded(false);
      setButtonText('展开');
    } else {
      setIsExpanded(true);
      setButtonText('收起');
    }
  };

  // 动态计算过渡时间
  const getTransitionDuration = () => {
    return isExpanded ? '0.25s' : '0';
  };

  return (
    <Flex
      className="filter-section"
      style={{
        transition: `all ${getTransitionDuration()} ease-in-out`
      }}
    >
      {/* 筛选条件容器 */}
      <Flex
        className="filter-rows"
        vertical
        gap={16}
        style={{
          maxHeight: isExpanded ? '1000px' : '28px',
          transition: `max-height ${getTransitionDuration()} ease-in-out`,
          maxWidth: isExpanded ? '100%':`calc(100% - 130px)`
        }}
      >
        {/* 平铺多选标签组件 */}
        {
          COMPONENT_MAPS["tags"]?.filter((val: any) => { return val }).map((item: any) => {

            const currentValue = filters[item.key] || ["all"];

            // 构建选项数组，在前面添加"全部"选项
            const optionsWithAll = [
              { label: `全部`, value: "all" },
              ...(filterOptions[item.key] || [])
            ];

            return (
              // filterOptions[item.key]?.length > 0 &&
              <Flex className="filter-tags-row" key={item.key} gap={8}>
                <Flex className="filter-label">{item.label}：</Flex>
                <MultiSelectTags
                  options={optionsWithAll}
                  value={currentValue}
                  onChange={(values) => onFilterChange(item.key, values)}
                />
              </Flex>
            )
          })
        }
      </Flex>

      {/* 固定在右下角的操作按钮 - 始终可见 */}
      <Flex
        className="filter-options"
        gap={8}
        style={{
          transition: `all ${getTransitionDuration()} ease-in-out`,
          height: isExpanded ? 32 : 28,
          top: isExpanded ? 'unset' : 0,
          bottom: isExpanded ? 0 : 'unset',
        }}
        justify="flex-end"
      >
        {/* <Button type="text" onClick={onClearAllFilters}>全部清空</Button> */}
        <Button type="text" onClick={toggleExpanded}>
          {buttonText}
          <ZYIcon
            type="xia"
            className="toggle-icon"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: `transform ${getTransitionDuration()} ease-in-out`
            }}
          />
        </Button>
      </Flex>
    </Flex>
  );
};

export default FilterSection;
