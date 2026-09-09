import { useEffect, useState, useRef } from "react";
import { fileViewUrl, preViewUrl } from "@/utils/host";
import { connect, useDispatch, useLocation } from "umi";
import { Affix, message, Tooltip } from "antd";
import CourseChat from "../CourseChat";
import { ZYIcon } from "@/components";
import ReactPlayer from "react-player";
import ChatEmpty from "@/components/ChatEmpty";
import mp3Img from "@/assets/mp3.png";

import "./index.less";

const App = (props: any) => {
  const { vodId, file_type } = props;

  const dispatch = useDispatch();
  const pdfRef = useRef<HTMLDivElement>(null);

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const segValue = searchParams.get("type");
  const [urlPdf, setUrlPdf] = useState("");
  const [fullScreen, setFullScreen] = useState(false);
  const [isOpenAI, setIsOpenAI] = useState(false);

  useEffect(() => {
    if (vodId) getUrlPdf();
  }, [vodId]);

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
      apiUrl: "postGetPlayInfo",
      payload: { id: vodId },
    });

    if (code === 200) {
      if (file_type == "mp4") {
        let _row = data?.PlayInfoList?.PlayInfo?.filter((item: any) => {
          return item.Width == "1920";
        });
        if (_row?.length > 0) {
          setUrlPdf(_row?.[0]?.PlayURL);
        } else {
          setUrlPdf(
            data?.PlayInfoList?.PlayInfo?.[
              data?.PlayInfoList?.PlayInfo?.length - 1
            ]?.PlayURL,
          );
        }
      }
      if (file_type == "mp3") {
        let _row =
          data?.PlayInfoList?.PlayInfo?.[
            data?.PlayInfoList?.PlayInfo?.length - 1
          ];
        setUrlPdf(_row?.PlayURL);
      }
    }
  };

  // 全屏处理
  const handleFullScreen = () => {
    pdfRef?.current?.requestFullscreen();
    setFullScreen(true);
  };

  const handleContextMenu = (e) => {
    e.preventDefault(); // 阻止默认的右键菜单行为
  };
  return (
    <>
      <div
        className="carousel-css-box-video"
        ref={pdfRef}
        onContextMenu={handleContextMenu}
      >
        {fullScreen && !isOpenAI && (
          <div className="btn" onClick={() => setIsOpenAI(true)}>
            <ZYIcon type="qingyan" />
            AI课堂助手
          </div>
        )}
        {isOpenAI && (
          <div className="ai-chat">
            <CourseChat openAI={isOpenAI} setOpenAI={setIsOpenAI} />
          </div>
        )}
        {file_type === "mp3" && (
          <div className="react_player_box">
            <div className="react_player_img">
              <ChatEmpty
                descriptionSty={{
                  fontSize: "18px",
                  color: "#1E253B",
                  fontWeight: 400,
                  textAlign: "center",
                }}
                ZYIconStyle={{ minWidth: "160px" }}
                imgStyle={{ margin: "0 auto" }}
                ImgComponent={<img src={mp3Img} alt="cover" />}
                title={`mp3音频预览`}
              />
            </div>

            {urlPdf && (
              <ReactPlayer
                src={urlPdf}
                controls
                width="100%"
                // height="100%"
                className="react_player_mp3"
              />
            )}
          </div>
        )}
        {file_type === "mp4" && (
          <div className="react_player_box_mp4">
            {urlPdf && (
              <ReactPlayer
                src={urlPdf}
                controls
                width="100%"
                height="100%"
                className="react_player"
              />
            )}
          </div>
        )}
      </div>
      {!fullScreen && segValue !== "course" && (
        // <Affix offsetBottom={60}>
        //   <div className="affix_bottom" onClick={handleFullScreen}>
        //     <ZYIcon type="airplay" />
        //     演示模式
        //   </div>
        // </Affix>
        <Affix offsetBottom={70}>
          <div className="affix_segmented">
            <Tooltip placement="left" title="演示模式">
              <div className={"relation_container_left"}>
                <button onClick={handleFullScreen}>
                  <ZYIcon type="airplay" style={{ fontSize: "16px" }} />
                </button>
              </div>
            </Tooltip>
          </div>
        </Affix>
      )}
    </>
  );
};

export default connect((state: any) => ({
  teachSourceModel: state.teachSourceModel,
}))(App);
