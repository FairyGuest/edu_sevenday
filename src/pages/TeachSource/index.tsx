import { Splitter } from "antd";
import { useState, useRef, useEffect } from "react";
import { connect } from "umi";
import TabList from "./components/TabList";
import CourseChat from "./components/CourseChat";
import { ZYIcon } from "@/components";

import "./index.less";
import { addTracking } from "@/utils";

const TeachSource = (props: any) => {
  const [openAI, setOpenAI] = useState(false); //  是否开启AI对话
  const [sizes, setSizes] = useState<(number | string)[]>(["70%", "30%"]); // 分割面板大小


  useEffect(() => {
    addTracking({ page_name: "教学资源库" })   // 数据埋点
  }, []);

  return (
    <div className="teach-source">
      <Splitter onResize={setSizes}>
        <Splitter.Panel defaultSize={"100%"} min={540} size={sizes[0]}>
          <div className="teach-source-header">
            <div className="header-left" onClick={() => history.back()}>
              <ZYIcon type="zuo" />
              返回 /&nbsp;
            </div>
            课程管理
          </div>
          <TabList openAI={openAI} setOpenAI={setOpenAI} />
        </Splitter.Panel>
        {openAI && (
          <Splitter.Panel defaultSize={"30%"} min={380} size={sizes[1]}>
            <CourseChat setOpenAI={setOpenAI} openAI={openAI} />
          </Splitter.Panel>
        )}
      </Splitter>
    </div>
  );
};

export default TeachSource;
