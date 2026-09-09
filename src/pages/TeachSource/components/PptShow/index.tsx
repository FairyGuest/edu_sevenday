import { useEffect, useState, useRef } from "react";
import { connect, useDispatch, useLocation } from "umi";
import { Affix, Spin, Tooltip } from "antd";
import CourseChat from "../CourseChat";
import PptListRender from "@/pages/TeachingMaterials/components/RightCard/PptListRender";
import { ZYIcon } from "@/components";
import "./index.less";

const PptShow = (props: any) => {
  const { docData } = props;
  const pptRef = useRef<any>(null);

  const dispatch = useDispatch();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const segValue = searchParams.get("type");

  const [loading, setLoading] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [isOpenAI, setIsOpenAI] = useState(false);
  const [pptData, setPPTData] = useState<any>([]);

  useEffect(() => {
    getPPTData();
  }, [docData]);

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
  // 获取ppt数据
  const getPPTData = async () => {
    setLoading(true);
    let { code, data }: any = await dispatch({
      type: "teachSourceModel/getData",
      apiUrl: "getPPTDataUrl",
      payload: { id: docData?.id },
    });
    if (code == 200 && data) {
      setPPTData(data);
    }
    setLoading(false);
  };
  // 处理cdn前缀
  const addCdnPrefixToHtml = (html: string) => {
    const regex =
      /(<script\s+src=|<link\s+(?:[^>]*?\s+)?href=)(["'])([^"']+)\2/gi;
    return html.replace(regex, (match, prefix, quote, url) => {
      return `${prefix}${quote}https://artifacts-cdn.chatglm.site/${url}${quote}`;
    });
  };
  // 全屏处理
  const handleFullScreen = () => {
    pptRef?.current?.requestFullscreen();
    setFullScreen(true);
  };

  return (
    <div className="ppt-show" ref={pptRef}>
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
      <Spin size="large" tip="PPT加载中..." spinning={loading}>
        {pptData.map((item: any, index: number) => (
          <div style={{ padding: "10px 10px 0" }} key={`ppt_${index}`}>
            <PptListRender
              session_id={docData?.id}
              codeText={addCdnPrefixToHtml(item?.index_html)}
              pageIndex={index}
              type={"preview"}
            />
          </div>
        ))}

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
      </Spin>
    </div>
  );
};

export default connect((state: any) => ({
  teachSourceModel: state.teachSourceModel,
}))(PptShow);
