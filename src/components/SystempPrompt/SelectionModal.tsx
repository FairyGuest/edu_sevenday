
import { Avatar, Button, Tabs } from "antd";
import { useEffect, useRef, useState } from "react";
import { connect} from "umi";

import ZYIcon from "../ZYIcon";
import "./SelectionModal.less";

/**
 * 
创建列表项组件：创建一个列表项组件，它将代表列表中的每个元素。
监听键盘事件：在父组件中，监听键盘事件，通常是keydown事件。
管理焦点状态：在父组件的状态中，保持跟踪当前获得焦点的列表项的索引。
更新焦点：当用户按下上或下箭头键时，更新状态中的焦点索引，以反映新的焦点项。
键盘导航逻辑：实现逻辑以在按下上箭头时减少焦点索引，在按下下箭头时增加焦点索引。
防止默认行为：在事件处理函数中，如果按下了上下箭头键，防止事件的默认行为。
聚焦管理：确保当焦点索引更新时，相应的列表项获得焦点。
 */

const ListItem = (props: {
  children: any;
  isSelected: boolean;
  onSelect: (info: any) => void;
  item: any;
}) => {
  const { children, isSelected, onSelect, item } = props;
  const ref = useRef<any>(null);
  useEffect(() => {
    console.log("ddeeee",isSelected)
    if (isSelected) {
      console.log("deeexxdd")
      ref?.current?.focus();
    }
  }, [isSelected]);

  return (
    <div
      ref={ref}
      tabIndex={0}
      className={`assist_skill_item ${isSelected ? "assist_skill_item_selected" : ""}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSelect(item);
        }
      }}
    >
      {children}
    </div>
  );
};






const tabObj = {
  "tool": "API",
  "flow": "flow",
  "kb": "知识库",
}

const colorObj = {
  "tool": "#7265e6",
  "flow": "#ffbf00",
  "kb": "#00a2ae",
}





const List = (props: any) => {


  const { onClose,  updEditContent, assistantModel, position } = props;
  const { toolListObj, kbListObj, flowListObj } = assistantModel

  const [activeKey, setActiveKey] = useState("flow");
  const [selectedInfo, setSelectedInfo] = useState<any>();


  const onSelect = (selectedData: any) => {
    setSelectedInfo(selectedData);
    updEditContent?.(selectedData,activeKey);
  };


  const onChangeTab = (key: string) => {
    setActiveKey(key);
  };


  //  立刻添加
  const openRightTab = (tab: any) => {
    //@ts-ignore
    // updTab(SKILL_MAP[tab?.key] as number);
  };


  const getListItem = (itemArr: any) => {

    return <div className="item_list_container">

      {itemArr?.map((item: any, index: any) => {
        return <ListItem
          key={item.id}
          item={item}
          isSelected={item.id == selectedInfo?.id || index == 1}
          onSelect={onSelect}
        >

          <Avatar src={item.logoUrl} style={{ backgroundColor: colorObj[activeKey], verticalAlign: 'middle' }} size={'small'}>
            {tabObj[activeKey]}
          </Avatar>

          <span className="text_title">
            {item?.title || "问答助手"}
          </span>
        </ListItem>
      })}

      {!itemArr?.length &&
        <div className="empty">
          <ZYIcon type="a-" />
          <span className="empty_text">暂无可调用</span>
          <div className="empty_btn">
            <Button
              type="link"
              onClick={() => { }}
              size="small"
            >
              立即添加
            </Button>
          </div>
        </div>
      }

    </div>

  }


  const tabItems = [
    {
      key: 'flow',
      label: '工作流',
      children: getListItem(flowListObj?.list || []),
    },
    {
      key: 'kb',
      label: '知识库',
      children: getListItem(kbListObj?.list || []),
    },

    {
      key: 'tool',
      label: '工具',
      children: getListItem(toolListObj?.list || []),
    }
  ];



  return (
    <div
      className="prompt_selection_modal"
      style={{
        top: position.top,
        left: position.left > 250 ? 250 : position.left,
      }}
    >
      <Tabs
        tabBarExtraContent={
          <ZYIcon type="wrong" className="close" onClick={onClose} />
        }
        activeKey={activeKey}
        onChange={onChangeTab}
        items={tabItems}
      />
    </div>
  );
};

export default connect((state: any) => ({
  assistantModel: state.assistantModel,
}))(List);
