import { useRef } from "react";
import { Avatar, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import CourseModal from "../CourseModal/index";
import { formatStaticUrl } from "@/utils";
import { ZYIcon } from "@/components";
import dayjs from "dayjs";

import "./index.less";

const CourseCard = ({ data = {}, onClick, onFinish }: any) => {
  const courseModalRef = useRef<{ openModal: (params?: any) => void }>();

  // 打开课程设置模态框
  const onClickEdit = (event: any, data: any) => {
    event.stopPropagation();
    courseModalRef.current?.openModal(data);
  };

  return (
    <div>
      <div
        className="course-card"
        onClick={onClick}
        style={{
          background: "border-box",
          backgroundImage: `url(${require(`@/assets/${data?.icon || "coursebg0.png"}`)})`,
          backgroundSize: "contain",
        }}
      >
        {data?.is_public === 1 && <div className="course-tag">已公开</div>}
        <div className="content">
          <div className="course-title">{data.title}</div>
          <div className="course-info">
            {/* <Avatar
              icon={<UserOutlined />}
              style={{ height: 18, width: 18 }}
              src={formatStaticUrl(data?.created_by_avatar)}
            /> */}
            {/* <span className="course-info-text" title={data?.created_by_name}>
              {data?.created_by_name}
            </span>
            <div className="divider" /> */}
            {/* ⬆️ 12_15版本中，暂时去掉创建者名 */}
            <span className="course-info-text" title={data?.stage_name}>
              {data?.stage_name}
            </span>
            <div className="divider" />
            <span className="course-info-text" title={data?.categories}>
              {data?.categories}
            </span>
          </div>
          {data?.version_info && <div className="course-version">{data?.version_info}</div>}
          {/* {data?.is_public === 1 && <div className="course-tag">已公开</div>} */}
        </div>

        <div className="footer">
          <div className="footer-desc">
            文件&nbsp;{data?.material_count}
            <div className="divider" />
            {dayjs(data?.updated_time).format("YYYY-MM-DD")}更新
          </div>
          <Tooltip title="课程设置">
            <div
              className="footer-action"
              onClick={(event) => onClickEdit(event, data)}
            >
              <span>
                <ZYIcon type="shezhi" />
              </span>
            </div>
          </Tooltip>
        </div>
      </div>
      <CourseModal onRef={courseModalRef} onFinish={onFinish} />
    </div>
  );
};

export default CourseCard;
