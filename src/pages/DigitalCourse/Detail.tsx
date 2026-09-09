
import { useState, useEffect } from "react";
import { connect, useDispatch, useLocation } from "@umijs/max";
import { Splitter, FloatButton } from "antd";
import { ZYIcon } from "@/components";
import TabList from "../TeachSource/components/TabList";
import CourseChat from "../TeachSource/components/CourseChat";
import CommentEntry from "./components/CommentEntry";

import "./Detail.less";

const Detail = (props: any) => {
  const { teachSourceModel } = props;
  const { activeKey } = teachSourceModel;
  const [openAI, setOpenAI] = useState(false); //  是否开启AI对话
  const [sizes, setSizes] = useState<(number | string)[]>(["70%", "30%"]); // 分割面板大小

  return (
    <div className="digital-detail">
      <div className="digital-detail-header">
        <div className="header-left" onClick={() => history.back()}>
          <ZYIcon type="zuo" />
          返回 /&nbsp;
        </div>
        共享课程
      </div>
      <div className="digital-detail-content">
        <Splitter onResize={setSizes}>
          <Splitter.Panel defaultSize={"100%"} min={540} size={sizes[0]}>
            <TabList openAI={openAI} setOpenAI={setOpenAI} />
            {/* 只有数字课程中的教学资源库展示评论入口，其他资料详情不展示 */}
            {activeKey === '' && <CommentEntry />}
          </Splitter.Panel>
          {openAI && (
            <Splitter.Panel defaultSize={"30%"} min={380} size={sizes[1]}>
              <CourseChat setOpenAI={setOpenAI} openAI={openAI} />
            </Splitter.Panel>
          )}
        </Splitter>
      </div>
    </div>
  );
};

export default connect((state: any) => ({
  teachSourceModel: state.teachSourceModel,
}))(Detail);
