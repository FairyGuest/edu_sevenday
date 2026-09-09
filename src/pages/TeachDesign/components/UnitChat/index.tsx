import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "@umijs/max";
import { Button, Dropdown, Tooltip } from "antd";
import QueryCard from "../QueryCard";
import AnswerCard from "../AnswerCard";
import ChatInput from "../ChatInput";
import { ZYIcon } from "@/components";
import { scrollTop } from "@/utils";

import "./index.less";

const UnitChat = (props: any) => {
  const {
    step,
    leftWidth,
    teachPlan = [],
    chatList,
    detailData,
    inputValue,
    setInputValue,
    fileList,
    setFileList,
    onSend,
    setIsInView,
  } = props;

  const { leftChatLoading } = useSelector((state: any) => state.teachDesginModel);
  const chatRef = useRef<HTMLDivElement>(null); // 对话内容
  const [hasPlan, setHasPlan] = useState<boolean>(false); // 是否有单课时教案
  const [catalogList, setCatalogList] = useState<any>([]); // 目录列表
  const [activeId, setActiveId] = useState<string>(""); // 当前选中的目录id

  useEffect(() => {
    if (step !== 1) return;
    if (teachPlan.some((item: any) => item?.has_plan)) {
      setHasPlan(true);
    }
  }, [teachPlan, step]);

  useEffect(() => {
    scrollTopChat();
  }, [chatList]);

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
    if (step === 1 && arrList.length) {
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

  // 滚动到底部
  const scrollTopChat = () => {
    setTimeout(() => {
      scrollTop(chatRef);
    }, 100);
  };
  // 目录点击
  const onDropClick = (e: any) => {
    setActiveId(e.key);
    document.getElementById(e.key)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="unit-chat" style={{ width: leftWidth }}>
      {step !== 3 && (
        <Dropdown
          overlayClassName="catalog-dropdown"
          placement="bottomLeft"
          menu={{
            items: catalogList,
            onClick: onDropClick,
            selectedKeys: [activeId],
          }}
        >
          <Button
            className="catalog-btn"
            shape="circle"
            icon={<ZYIcon type="wenda" />}
          />
        </Dropdown>
      )}
      <div className="unit-chat-content" ref={chatRef}>
        {chatList.map((item: any, index: number) => {
          const { id, role, content, content_type } = item;
          if (role == "user") {
            return (
              <QueryCard
                key={id}
                id={id}
                content={content}
                leftWidth={leftWidth}
              />
            );
          }
          return (
            <AnswerCard
              key={index}
              content={content}
              content_type={content_type}
              detailData={detailData}
              scrollTopChat={scrollTopChat}
              setGuideInView={setIsInView}
              onSend={onSend}
              disabledSend={
                hasPlan || detailData?.study_info?.study_plan_id || step === 3
              }
            />
          );
        })}
      </div>
      <div className="unit-chat-mask">
        <div className="unit-chat-overlay"></div>
      </div>
      {hasPlan || detailData?.study_info?.study_plan_id || step === 3 ? (
        <div className="unit-chat-footer">
          <img
            className="footer-img"
            src={require("@/assets/plan_hint.svg").default}
            alt="file_bg"
          />
          <div className="footer-text">
            {step === 3
              ? "智能配套专属学案，保障教学评一致性。"
              : "教案已通过人机交互优化完毕啦~"}
          </div>
          <img
            className="footer-stars"
            src={require("@/assets/plan_stars.png")}
            alt="file_bg"
          />
        </div>
      ) : (
        <div className="unit-chat-input">
          <ChatInput
            step={step}
            leftWidth={leftWidth}
            chatList={chatList}
            detailData={detailData}
            inputValue={inputValue}
            setInputValue={setInputValue}
            fileList={fileList}
            setFileList={setFileList}
            onSend={onSend}
          />
        </div>
      )}
    </div>
  );
};

export default UnitChat;
