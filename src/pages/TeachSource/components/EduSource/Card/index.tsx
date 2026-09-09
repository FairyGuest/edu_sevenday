import { Button, Dropdown, Image, Tag, Skeleton } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { formatStaticUrl, handleName } from "@/utils";
import dayjs from "dayjs";
import { ZYIcon } from "@/components";
// import relativeTime from "dayjs/plugin/relativeTime";
// dayjs.extend(relativeTime);

// 定义icon菜单选项
const menuItems = [
  {
    key: "rename",
    label: "重命名",
    // icon: <ZYIcon type="edit" />,
  },
  {
    key: "edit",
    label: "编辑",
    // icon: <ZYIcon type="bianji" />,
  },
  {
    key: "down",
    label: "下架",
    // icon: <ZYIcon type="xiajia" />,
  },
  {
    key: "publish",
    label: "发布",
    // icon: <ZYIcon type="send" />,
  },
  {
    key: "delete",
    label: "删除",
    // icon: <ZYIcon type="shanchu" style={{ color: "#EF4444" }} />,
  },
];
const Card = (props: any) => {
  const { dataList = [] } = props;
  const isDigitalCourse = window.location.pathname.includes('/source/share/detail');

  // 处理时间展示
  const handleTime = (time: string) => {
    if (dayjs().diff(time, "day") === 0) {
      return dayjs(time).format("HH:mm");
    } else if (dayjs(time).year() !== dayjs().year()) {
      return dayjs(time).format("YYYY/MM/DD");
    } else {
      return dayjs(time).format("MM/DD");
    }
  };
  // 处理背景图片
  const handleBg = (item: any) => {
    if (item?.exam_id || handleName(item?.doc_name).type === "html") {
      return (
        <div className="card-content-item-body-text">
          <div className="title">{handleName(item?.doc_name).name}</div>
          <div className="lines">
            <li></li>
            <li></li>
            <li style={{ width: "60%" }}></li>
            <li style={{ width: "80%" }}></li>
            <li></li>
          </div>
        </div>
      );
    } else if (item?.file_type === "graph") {
      return (
        <img className="graph-img" src={require("@/assets/graph_bg.png")} />
      );
    } else if (item?.file_type === "teachingMaterials") {
      return <div className="ppt-img">{handleName(item?.doc_name).name}</div>;
    } else if (
      ["mp3", "wav", "m4a", "wma", "aac", "ogg", "amr", "flac"].includes(
        item?.file_type,
      )
    ) {
      return (
        // <div className="audio-img">{handleName(item?.doc_name).name}</div>
        <>
          <div className="audio-img">
            <img
              alt="图片"
              className="bgimg"
              src={require("@/assets/audio_bg.png")}
            />
            <div className="audio-mask-name">
              {handleName(item?.doc_name).name}
            </div>
            <div className="audio-mask-layer"></div>
            <ZYIcon type="bofanghei" className="play" />
          </div>
        </>
      );

      // <div className="audio-img">{handleName(item?.doc_name).name}</div>;
    } else if (
      ["mp4", "wmv", "m4v", "flv", "rmvb", "dat", "mov"].includes(
        item?.file_type,
      )
    ) {
      return (
        <>
          {item?.first_image && (
            <div className="video-img">
              <img alt="图片" className="bgimg" src={item?.first_image} />
              <div className="video-mask-layer"></div>
              <ZYIcon type="bofanghei" className="play" />
            </div>
          )}
          {!item?.first_image && (
            <div className="no-video-img">
              <img
                alt="图片"
                className="bgimg"
                src={require("@/assets/videobackground.png")}
              />
              <div className="video-mask-name">
                {handleName(item?.doc_name).name}
              </div>
              <div className="video-mask-layer"></div>
              <ZYIcon type="bofanghei" className="play" />
            </div>
          )}
        </>
      );
    } else {
      return (
        <Image
          preview={false}
          style={{ minHeight: "112px" }}
          src={formatStaticUrl(item?.first_image)}
          fallback={require("@/assets/default_bg.png")}
        />
      );
    }
  };

  const handleMenuItems = (item: any) => {
    if (item?.file_type === "graph") {
      if (item?.is_publish === 1) {
        return menuItems.filter((item: any) => item?.key !== "publish");
      } else {
        return menuItems.filter((item: any) => item?.key !== "down");
      }
    } else {
      return [menuItems[0], menuItems[4]];
    }
  };

  return (
    <div className="card-content">
      {dataList.map((item: any) => (
        <div key={item?.id} className="card-content-item">
          <div className="card-content-item-tag">
            {item?.is_master_doc === 1 && <Tag color="#FFAA00">主教材</Tag>}
            {/* 解析状态 */}
            {props?.checkProgress(item)}
          </div>
          <div
            className="card-content-item-body"
            onClick={() => props?.onClickView(item)}
          >
            {handleBg(item)}
          </div>
          <div className="card-content-item-footer">
            <div className="title" title={item?.doc_name}>
              <ZYIcon type={handleName(item?.doc_name, item?.file_type).icon} />
              <span>{handleName(item?.doc_name).name}</span>
            </div>
            <div className="desc">
              <div>
                <span>{item?.created_name} · </span>
                <span>{handleTime(item?.updated_time)}更新</span>
              </div>
              {/* 如果是数字课程则不展示更多按钮 */}
              {item?.is_master_doc !== 1 && !isDigitalCourse && (
                <Dropdown
                  placement="bottom"
                  overlayClassName="menu-icon"
                  menu={{
                    items: handleMenuItems(item),
                    onClick: (e: any) => props?.menuClick(e, item),
                  }}
                >
                  <Button type="text" size="small" icon={<MoreOutlined />} />
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Card;
