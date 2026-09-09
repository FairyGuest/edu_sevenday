import { useState, useEffect, useRef } from "react";
import { Button, Tooltip } from "antd";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import AnswerStep from "../AnswerStep";
import CreateLeft from "../CreateLeft";
import { ZYIcon } from "@/components";

import "./index.less";

/**
 * AnswerCard组件
 * content_type: md、非md
 * md为左侧对话流，非md为包含start、book、end等字段的对象
 * end?is_new: 是否是最后一个卡片
 * detailData?.status: 右侧生成状态:0-生成中,1-已生成,2-生成失败
 */
const AnswerCard = (props: any) => {
  const {
    content,
    content_type,
    detailData,
    setGuideInView,
    scrollTopChat,
    refreshFn,
    onSend,
    disabledSend,
  } = props;
  const { start, book, version, end } = content;

  // 左侧卡片点击
  const onLeftPreview = (end: any) => {
    const collapseEnd = document.querySelector(
      ".ant-splitter-bar-collapse-bar-end",
    ) as HTMLElement;
    // 最后一个卡片且没有折叠
    if (end?.is_new && !collapseEnd) {
      const collapseBtn = document.querySelector(
        ".ant-splitter-bar-collapse-bar",
      ) as HTMLElement;
      collapseBtn?.click();
    } else {
      return;
    }
  };

  return (
    <div className="answer-card">
      <div className="answer-content">
        {content_type !== "md" && (
          <>
            {start && (
              <div className="answer-content-start">
                {start == "人机协作中" ? (
                  <>
                    <DotLottieReact
                      className="loading-lottie"
                      loop
                      autoplay
                      src={require("@/assets/roobot.lottie")}
                    />
                    人机协作中...
                  </>
                ) : (
                  <div>{start}</div>
                )}
              </div>
            )}
            {book && (
              <AnswerStep
                content={content}
                scrollTopChat={scrollTopChat}
                setGuideInView={setGuideInView}
                detailData={detailData}
              />
            )}
            {end && (
              <div className="answer-content-end">
                {end?.head && <div className="end-title">{end?.head}</div>}
                <div
                  className={`end-card${end?.is_new ? " end-card-active" : ""}`}
                  onClick={() => onLeftPreview(end)}
                >
                  <div className="end-card-left">
                    <Tooltip title={end?.chapter_name}>
                      <div
                        className="title"
                        style={{ color: end?.is_new ? "#333C55" : "#CBD2E1" }}
                      >
                        <ZYIcon type="jiaoan" /> {end?.chapter_name}
                      </div>
                    </Tooltip>
                    {!end?.is_new ? (
                      <div className="time" style={{ color: "#CBD2E1" }}>
                        创建时间：{end?.create_time}
                      </div>
                    ) : (
                      <>
                        {detailData?.status == 0 && (
                          <div className="desc">正在生成文档……</div>
                        )}
                        {detailData?.status == 1 && (
                          <div className="time">创建时间：{end?.create_time}</div>
                        )}
                        {detailData?.status == 2 && (
                          <div className="error">
                            生成失败
                            <Button
                              color="default"
                              variant="link"
                              onClick={refreshFn?.()}
                              icon={<ZYIcon type={"refresh"} />}
                            >
                              重新生成
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <img
                    className="end-card-right"
                    src={require("@/assets/file_bg.png")}
                    alt="file_bg"
                  />
                  {version && <div className="end-card-version">{version}</div>}
                </div>
              </div>
            )}
          </>
        )}
        {content_type === "md" && (
          <CreateLeft
            content={end}
            detailData={detailData}
            onSend={onSend}
            disabledSend={disabledSend}
          />
        )}
      </div>
    </div>
  );
};

export default AnswerCard;
