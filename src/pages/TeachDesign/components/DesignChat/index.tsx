import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector, history, connect } from "@umijs/max";
import { Button, Modal, message, Tooltip, Dropdown } from "antd";
import QueryCard from "../QueryCard";
import AnswerCard from "../AnswerCard";
import DialogInput from "../DialogInput";
import { scrollTop } from "@/utils";
import ZYIcon from "@/components/ZYIcon";
import Guidance from "./Guidance";

import "./index.less";

const { confirm } = Modal;
const DesignChat = (props: any) => {
  const {
    chatList,
    setChatList,
    type = 1,
    onRef,
    finalize,
    teachDesginModel,
    planDetail,
    detailData,
    leftWidth,
  } = props;
  const { planSseLoading } = teachDesginModel;
  // type  1 单元/课时  2 学案
  const dispatch = useDispatch();
  const contentRef = useRef<HTMLDivElement>(null); // 创建内容
  const [messageApi, contextHolder] = message.useMessage();

  const [catalogList, setCatalogList] = useState<any>([]); // 目录列表
  const [activeId, setActiveId] = useState<string>(""); // 当前选中的目录id

  useMemo(() => {
    let arrList = chatList
      .filter((item: any) => item.role === "user")
      .map((item: any) => {
        return {
          title: item?.content?.user_require || "",
          id: item?.id,
        };
      });
    // 处理第一条标题
    if (type === 1 && arrList.length) {
      arrList[0].title = "基于以下信息生成教案";
    }
    // 格式化目录列表
    let catalogList = arrList.map((item: any) => ({
      key: item.id,
      label: (
        <Tooltip title={item.title} placement="right">
          {item.title}
        </Tooltip>
      ),
    }));
    setActiveId(catalogList.at(-1)?.key || "");
    setCatalogList(catalogList);
  }, [chatList]);

  // 目录点击
  const onDropClick = (e: any) => {
    setActiveId(e.key);
    document.getElementById(e.key)?.scrollIntoView({ behavior: "smooth" });
  };

  // 滚动到底部
  const scrollTopChat = () => {
    setTimeout(() => {
      scrollTop(contentRef);
    }, 100);
  };

  return (
    <div className="design-chat" style={{ width: leftWidth }}>
      {type == 1 && (
        <Dropdown
          overlayClassName="design-chat-catalog-dropdown"
          placement="bottomLeft"
          menu={{
            items: catalogList,
            onClick: onDropClick,
            selectedKeys: [activeId],
          }}
        >
          <Button
            className="design-chat-catalog-btn"
            shape="circle"
            icon={<ZYIcon type="wenda" />}
          />
        </Dropdown>
      )}

      <div className="design-chat-content" ref={contentRef}>
        {chatList?.map((item: any, index: any) => {
          const { role, content, content_type } = item;
          if (role == "user") {
            const { textbook_info } = content;
            return (
              <QueryCard
                key={index}
                id={item.id}
                content={content}
                {...props}
              />
            );
          }
          return (
            <AnswerCard
              key={index}
              {...props}
              content_type={content_type}
              content={content}
              scrollTopChat={scrollTopChat}
              onSend={finalize}
              type={type}
              disabledSend={planDetail?.has_study_plan}
            />
          );
        })}
      </div>
      <div className="design-chat-mask">
        <div className="design-chat-overlay"></div>
      </div>
      <div className="design-chat-input">
        {type == 1 && !planDetail?.has_study_plan && (
          <>
            <Guidance {...props} finalizeFn={finalize} />

            <DialogInput {...props} />
          </>
        )}
        {(type == 2 || (type == 1 && planDetail?.has_study_plan)) && (
          <div className="design-chat-hint">
            <img
              className="design-chat-plan-hint"
              src={require("@/assets/plan_hint.svg").default}
              alt="file_bg"
            />
            {type == 2
              ? "智能配套专属学案，保障教学评一致性。"
              : "教案已通过人机交互优化完毕啦~"}
            <img
              className="design-chat-plan-stars"
              src={require("@/assets/plan_stars.png")}
              alt="file_bg"
            />
          </div>
        )}
      </div>
      {contextHolder}
    </div>
  );
};

export default connect((state: any) => ({
  teachDesginModel: state.teachDesginModel,
}))(DesignChat);
