
import { useEffect, useState } from "react";
import { Tabs } from "antd";
import Card from "./components/Card";
import "./index.less";
import { addTracking } from "@/utils";

const DigitalCourse = () => {
  const [activeKey, setActiveKey] = useState('0');

  useEffect(() => {
    addTracking({ page_name: "数字课程" })   // 数据埋点
  },[])


  return (
    <div className="digital-course">
      <div className="digital-course-header">共享课程</div>
      <div className="digital-course-content">
        <Tabs
          activeKey={activeKey}
          onChange={(key) => setActiveKey(key)}
          items={[
            {
              key: "0",
              label: "全部",
            },
            {
              key: "1",
              label: "我收藏的",
            },
          ]}
        />
        <Card id={activeKey} />
      </div>
    </div>
  );
}

export default DigitalCourse;
