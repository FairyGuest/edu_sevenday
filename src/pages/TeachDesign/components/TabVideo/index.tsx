import { useState, useEffect } from "react";
import { useDispatch } from "@umijs/max";
import { Button, Form, Tabs } from "antd";
import { ZYIcon } from "@/components";

import "./index.less";

const TabVideo = (props: any) => {
  const { form, scrollClick } = props;
  const dispatch = useDispatch();

  const stage = Form.useWatch("stage", form); // 学段学科值
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    if (stage) getVideoList();
  }, [stage]);

  // 获取视频数据
  const getVideoList = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postTeachVideo",
      payload: {
        xueduan: stage[0],
        xueke: stage[1],
      },
    });
    if (code === 200) {
      setDataList(data || []);
    }
  };
  // 学科颜色
  const subjectColor = (subject: string) => {
    let color = "";
    switch (subject) {
      case "语文":
        return (color = "#3c73bd");
      case "数学":
        return (color = "#ffad37");
      case "英语":
        return (color = "#1b94ff");
      case "物理":
        return (color = "#1a7aff");
      case "化学":
        return (color = "#0ea58c");
      case "生物学":
        return (color = "#0698ba");
      case "历史":
        return (color = "#ff823e");
      case "地理":
        return (color = "#00bc7b");
      case "思想政治":
      case "道德与法治":
        return (color = "#d10e0e");
      default:
        return (color = "#ffad37");
    }
  };

  return (
    <div className="tab-video">
      <div className="tab-video-tabs" style={{ display: "flex", justifyContent: "flex-end", padding: "4px 0" }}>
        <Button
          type="link"
          icon={<ZYIcon type="up-top" />}
          onClick={scrollClick}
        />
      </div>
      <div className="tab-video-content">
        {dataList.map((item: any) => (
          <div
            key={item?.id}
            className="tab-video-item"
            onClick={() => {
              window.open(`/design/player?id=${item?.video_url.split("/").at(-1).split(".")[0]}`);
            }}
          >
            <div
              className={`item-type${item?.subject.length >= 3 ? " item-type-long" : ""}`}
              style={{ backgroundColor: subjectColor(item?.subject) }}
            >
              {item?.subject}
            </div>
            <div className="item-img">
              <img src={item?.thumbnail_url} alt="" />
            </div>
            <div className="item-desc">
              <div className="tag">{item?.topic_name}</div>
              <div className="time">时长 {item?.duration_display}</div>
            </div>
            <div className="item-title">{item?.description}</div>
          </div>
        ))}
        {dataList.length === 0 && (
          <div className="tab-video-empty">
            <div className="empty-data">
              <img src={require("@/assets/no_video.svg").default} alt="" />
              <div className="empty-text">
                全新教学视频即将上线 各位老师敬请期待～
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabVideo;
