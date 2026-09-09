import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "@umijs/max";
import { Button, Dropdown, Input, Tooltip, message } from "antd";
import CourseUpModal from "./CourseUpModal";
import UploadFile from "../UploadFile";
import AttachList from "../AttachList";
import ZYIcon from "@/components/ZYIcon";

import "./index.less";

const ChatInput = (props: any) => {
  const {
    step = 1,
    leftWidth = 600,
    chatList = [],
    detailData = {},
    inputValue = "",
    setInputValue = () => {},
    fileList = [],
    setFileList = () => {},
    onSend = () => {},
  } = props;
  const { planSseLoading, childPlanLoading, leftChatLoading, planParams } = useSelector(
    (state: any) => state.teachDesginModel,
  );

  const dispatch = useDispatch();
  const uploadFileRef = useRef<any>(null); // 上传文件ref
  const scrollRef = useRef<any>(null); // 滚动按钮栏
  const [messageApi, contextHolder] = message.useMessage();
  const [promptTempList, setPromptTempList] = useState<any>([]); // 提示词模板
  const [courseUpOpen, setCourseUpOpen] = useState(false); // 弹窗是否显示
  const [canScrollLeft, setCanScrollLeft] = useState(false); // 是否显示左滚动按钮
  const [canScrollRight, setCanScrollRight] = useState(false); // 是否显示右滚动按钮

  useEffect(() => {
    if (step === 3) return;
    if (planParams?.subject) {
      getPromptTempList();
    }
  }, [planParams, step]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      checkScroll();
      window.addEventListener("resize", checkScroll);
      return () => window.removeEventListener("resize", checkScroll);
    }
  }, [leftWidth, promptTempList]);
  // 滚动事件
  const handleScroll = (direction: string) => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
  // 检查滚动按钮是否显示
  const checkScroll = () => {
    const container = scrollRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollWidth > container.clientWidth &&
        Math.ceil(container.scrollLeft + container.clientWidth) <
          container.scrollWidth,
    );
  };
  // 获取提示词模板
  const getPromptTempList = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postPromptTemplateUrl",
      // type=1: 课时 2: 单元
      payload: {
        subject: planParams.subject,
        type: step === 1 ? 2 : 1,
      },
    });
    if (code === 200) {
      setPromptTempList(data || []);
    }
  };

  // 上传文件点击事件
  const onUploadClick = (e: any) => {
    if (e.key === "local") {
      uploadFileRef.current?.onUploadOpen();
    } else if (e.key === "course") {
      setCourseUpOpen(true);
    }
  };
  // 删除上传文件
  const tagsDelete = (dele: any) => {
    const newFileList = fileList.filter((item: any) => item.id !== dele.id);
    setFileList(newFileList);
  };
  // 输入框回车事件
  const handleKeyDown = (event: any) => {
    if (event.key == "Enter") {
      // 换行实现
      // if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
      //   return;
      // }
      // 阻止默认的换行行为
      event.preventDefault();
      // 回车发起请求
      sendStop();
    }
  }
  // 发送拦截
  const sendStop = (msg?: string) => {
    if (detailData?.is_new_evaluate === 1) {
      messageApi.warning("教案评估中，请稍后");
      return;
    } else if (planSseLoading || childPlanLoading || leftChatLoading) {
      messageApi.warning("内容生成中，请稍后");
      return;
    } else if (!inputValue.trim() && !msg) {
      messageApi.warning("请输入有效内容");
      return;
    }
    // 生成定稿校验
    if (msg && chatList?.length < 4) {
      message.error("教案已生成，如需重新生成，请输入最新的问题与建议。");
      return;
    }
    onSend(msg);
  };

  // tooltip 提示
  const tooltipFun = (params: Array<any>) =>
    params.map((item: any, index: number) => (
      <div key={index} className="prompt-item" onClick={() => setInputValue(item?.promptText)}>
        <ZYIcon className="prompt-icon" type="tishi1" />
        <div className="content">{item?.promptText}</div>
      </div>
    ));

  return (
    <div className="chat-input">
      <div
        className={`chat-input-btns${canScrollLeft || canScrollRight ? " chat-btns-scroll" : ""}`}
        ref={scrollRef}
        onScroll={checkScroll}
      >
        {canScrollLeft && (
          <div className="scroll-btn scroll-btn-left">
            <Button
              size="small"
              type="link"
              icon={<ZYIcon type="zuo" />}
              onClick={() => handleScroll("left")}
            />
          </div>
        )}
        <Tooltip title="系统整合全部建议与修改内容，生成完整定稿版教学设计">
          <Button
            className="prompt-temp-btn"
            disabled={planSseLoading || childPlanLoading || leftChatLoading}
            onClick={() => sendStop("生成定稿")}
            icon={<ZYIcon type="dinggao" />}
          >
            生成定稿
          </Button>
        </Tooltip>
        <div className="divider"></div>
        {promptTempList.map((item: any, index: number) => (
          <Tooltip
            key={index}
            color="#fff"
            placement="top"
            title={tooltipFun(item?.templates)}
            classNames={{ root: "prompt-tooltip" }}
          >
            <Button
              color="primary"
              className="prompt-temp-btn"
              // disabled={planSseLoading || childPlanLoading || leftChatLoading}
            >
              {item.categoryName}
            </Button>
          </Tooltip>
        ))}
        {canScrollRight && (
          <div className="scroll-btn scroll-btn-right">
            <Button
              size="small"
              type="link"
              icon={<ZYIcon type="you" />}
              onClick={() => handleScroll("right")}
            />
          </div>
        )}
      </div>
      <div className="chat-input-wrapper">
        <div className="chat-input-content">
          {fileList?.length > 0 && (
            <AttachList fileList={fileList} fileDelete={tagsDelete} />
          )}
          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 11 }}
            placeholder="对生成的教案，您有哪些修改或优化建议呢？例如增加课堂提问、增加分层任务、完善评价环节等。"
            variant="borderless"
            value={inputValue}
            onChange={(e: any) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="footer-btn">
            <Dropdown
              trigger={["click"]}
              placement="topLeft"
              menu={{
                items: [
                  { key: "local", label: "本地文件" },
                  // { key: "course", label: "课程文件" },
                ],
                onClick: onUploadClick,
              }}
            >
              <Tooltip title="上传参考资料" placement="right">
                <Button
                  color="default"
                  variant="text"
                  className="upload-btn"
                  disabled={
                    fileList?.length >= 10 ||
                    planSseLoading ||
                    leftChatLoading
                  }
                  icon={<ZYIcon type="upload-file" style={{color: "#475069"}} />}
                />
              </Tooltip>
            </Dropdown>

            <Button
              type="primary"
              disabled={
                planSseLoading ||
                childPlanLoading ||
                leftChatLoading ||
                !inputValue
              }
              className="send-btn"
              icon={<ZYIcon type="send" />}
              onClick={() => sendStop()}
            />
          </div>
        </div>
      </div>
      {contextHolder}
      <UploadFile
        onRef={uploadFileRef}
        dataList={fileList}
        setDataList={setFileList}
      />
      <CourseUpModal
        open={courseUpOpen}
        setOpen={setCourseUpOpen}
        fileList={fileList}
        setFileList={setFileList}
      />
    </div>
  );
};

export default ChatInput;
