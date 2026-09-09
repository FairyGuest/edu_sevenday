import { useState, useEffect, memo } from "react";
import { Form, Skeleton } from "antd";
import { connect, useDispatch } from "@umijs/max";
import { history, Outlet, useLocation } from "umi";
import { ExportOutlined, ShareAltOutlined } from "@ant-design/icons";
import {
  deepCopy,
  getSpaceInfo,
  windowOpen,
  getUserInfo,
  scrollTop,
} from "@/utils";
import { ZYIcon } from "@/components";
import "./index.less";

const App = (props: any) => {
  const { showAvatar = true } = props;
  return (
    <div className="chatloading_box">
      <div className="chatloading_box_query">
        <div className="answer_card_container_teaching_plan_content_skeleton">
          <Skeleton active />
        </div>
      </div>
      <div className="answer_card_container_chatloading_box">
        {showAvatar && (
          <div className="assistant_basic">
            <div className="assistant_basic_logo">
              <ZYIcon type={"logo"} style={{ fontSize: 18 }} />
            </div>
            <div className="assistant_name">智谱AI</div>
          </div>
        )}
        <div className="answer_card_container_chatloading_box_content">
          <div className="answer_card_container_chatloading_box_content_skeleton">
            <Skeleton active />
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
}))(memo(App));
