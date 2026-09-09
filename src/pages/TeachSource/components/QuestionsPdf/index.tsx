import { useEffect, useState, useRef } from "react";
import { fileViewUrl, preViewUrl } from "@/utils/host";
import { connect, useDispatch, useLocation } from "umi";
import { Affix, message, Tooltip, Segmented, Splitter } from "antd";
import CourseChat from "../CourseChat";
import { ZYIcon } from "@/components";
import MindGraph from "../MindGraph";

import "./index.less";

const App = (props: any) => {
  const { docId, openAI, setOpenAI } = props;

  const dispatch = useDispatch();
  const pdfRef = useRef<HTMLDivElement>(null);

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const segValue = searchParams.get("type");
  const [urlPdf, setUrlPdf] = useState("");
  const [fullScreen, setFullScreen] = useState(false);
  const [isOpenAI, setIsOpenAI] = useState(false);
  const [sizes, setSizes] = useState<(number | string)[]>(["50%", "50%"]); // 分割面板大小
  const [segOutlineType, setSegOutlineType] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (docId) getUrlPdf();
  }, [docId]);

  useEffect(() => {
    if (openAI) {
      setSegOutlineType("");
    }
    setRefreshKey((prev) => prev + 1);
  }, [openAI]);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [segOutlineType]);

  useEffect(() => {
    const handleEsc = () => {
      if (!document.fullscreenElement) {
        setFullScreen(false);
        setIsOpenAI(false);
      }
    };
    // 添加事件监听器
    document.addEventListener("fullscreenchange", handleEsc);
    return () => document.removeEventListener("fullscreenchange", handleEsc);
  }, []);
  // 获取pdf预览地址
  const getUrlPdf = async () => {
    let { code, data }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "postDocAnalyzeInfo",
      payload: { id: docId },
    });

    if (code === 200) {
      const file_url: string = `${fileViewUrl}${data}`;
      const view_url: string =
        preViewUrl +
        "/preview/onlinePreview?url=" +
        encodeURIComponent(btoa(encodeURIComponent(file_url)));
      setUrlPdf(view_url);
    }
  };

  // 全屏处理
  const handleFullScreen = () => {
    pdfRef?.current?.requestFullscreen();
    setFullScreen(true);
  };

  const clickSegType = (param: any) => {
    if (
      (segOutlineType === "graph" && param === "graph") ||
      (segOutlineType === "mindMap" && param === "mindMap") ||
      (segOutlineType === "outline" && param === "outline")
    ) {
      setSegOutlineType("");
      return;
    }
    setSegOutlineType(param);
    setOpenAI?.(false);
  };

  const clickOpenAI = () => {
    setIsOpenAI(true);
  };

  return (
    <>
      <Splitter onResize={setSizes}>
        <Splitter.Panel defaultSize={"100%"} min={540} size={sizes[0]}>
          <div className="carousel-css-box" ref={pdfRef}>
            {fullScreen && !isOpenAI && (
              <div className="btn" onClick={clickOpenAI}>
                <ZYIcon type="qingyan" />
                AI课堂助手
              </div>
            )}
            {isOpenAI && (
              <div className="ai-chat">
                <CourseChat openAI={isOpenAI} setOpenAI={setIsOpenAI} />
              </div>
            )}
            <iframe
              key={refreshKey}
              title="嵌入的pdf网页"
              src={urlPdf}
              width={"100%"}
              height={"100%"}
              loading="eager"
            ></iframe>
          </div>
        </Splitter.Panel>
        {segOutlineType && (
          <Splitter.Panel defaultSize={"50%"} min={380} size={sizes[1]}>
            <MindGraph outlineType={segOutlineType} docId={docId} />
          </Splitter.Panel>
        )}
      </Splitter>
      {!fullScreen && segValue !== "course" && (
        <Affix offsetBottom={70}>
          <div className="affix_segmented">
            <Tooltip placement="left" title="演示模式">
              <div className="relation_container_left" onClick={handleFullScreen}>
                <ZYIcon type="airplay" style={{ fontSize: "16px" }} />
              </div>
            </Tooltip>
          </div>
        </Affix>
      )}

      <Affix offsetBottom={150}>
        <div className="affix_segmented">
          <Tooltip placement="left" title="思维导图">
            <div
              className={
                segOutlineType === "mindMap"
                  ? "relation_container_css_leftact"
                  : "relation_container_css_left"
              }
              onClick={() => clickSegType("mindMap")}
            >
              <ZYIcon
                type={"shanchu3"}
                className="shanchu_icon"
                style={{ fontSize: "16px" }}
              />
              <ZYIcon
                type={"fork"}
                className="hover_icon_css"
                style={{ fontSize: "16px" }}
              />
            </div>
          </Tooltip>
          <Tooltip placement="left" title="树形大纲">
            <div
              className={
                segOutlineType === "outline"
                  ? "relation_container_css_leftact"
                  : "relation_container_css_left"
              }
              onClick={() => clickSegType("outline")}
            >
              <ZYIcon
                type={"shanchu3"}
                className="shanchu_icon"
                style={{ fontSize: "16px" }}
              />
              <ZYIcon
                type={"list1"}
                className="hover_icon_css"
                style={{ fontSize: "16px" }}
              />
            </div>
          </Tooltip>
        </div>
      </Affix>
    </>
  );
};

export default connect((state: any) => ({
  teachSourceModel: state.teachSourceModel,
}))(App);
