
import { useEffect, useState } from "react";
import { useLocation } from "umi";
import { message } from "antd";

import "./Player.less";


const Player = (props: any) => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const videoId = searchParams.get("id");

  const [messageApi, contextHolder] = message.useMessage();
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (!videoId) {
      messageApi.error("视频ID不能为空");
      window.location.href = "/design";
    } else {
      setVideoUrl(`https://s3-cn-wlcb.ufileos.com/edu-filestore/teach_plan_videos/${videoId}.mp4`);
    }

  }, [videoId]);

  return (
    <div className="design-player">
      <div className="player">
        <div className="player-header">
          <img src={require("@/assets/logoLight.png")} alt="" />
          <div className="player-header-title">教学设计使用讲解视频</div>
        </div>
        <video
          className="player-video"
          src={videoUrl}
          controls
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        />
        {contextHolder}
      </div>
    </div>
  );
};

export default Player;
