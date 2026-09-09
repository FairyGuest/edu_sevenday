import { Button, Tabs } from "antd";
import { CopyFilled } from "@ant-design/icons";
import { useState } from "react";

type exampleItem = {
  label: string;
  key: string;
  text: string;
};
const Example = ({ onSubmit, data }: any) => {
  const [activeItem, setActiveItem] = useState<exampleItem>(data[0]);
  const onChangeTab = (key: string) => {
    setActiveItem(
      data?.find((item) => item.key === key) || ({} as exampleItem)
    );
  };

  const onUseExample = () => {
    // 将activeItem 选中的数据  填写到 输入框中
    onSubmit(activeItem.text);
  };
  return (
    <div className="example_content">
      <Tabs
        onChange={onChangeTab}
        activeKey={activeItem?.key}
        items={data?.map((item) => {
          return {
            ...item,
            children: <div className="example_content_text">{item.text}</div>,
          };
        })}
      />
      <div className="example_btn">
        <Button type="link" onClick={onUseExample}>
          <CopyFilled />
          使用示例
        </Button>
      </div>
    </div>
  );
};
export default Example;
