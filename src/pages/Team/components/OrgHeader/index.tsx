import { useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "@umijs/max";
import { Avatar, Input, Button } from "antd";
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { formatStaticUrl, getOrgId } from "@/utils";
import avatar from "@/assets/avatar.png";
import "./index.less";

const App = (props: any) => {
  const { teamModel } = props;
  const { orgInfo } = teamModel;
  const dispatch = useDispatch();
  const inputRef = useRef();
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    getOrgData(); // 获取组织信息
  }, []);

  // 获取团队
  const getOrgData = async () => {
    const { code, data }: any = await dispatch({
      type: "teamModel/postData",
      apiUrl: "getOrgUrl",
      mTitle: "orgInfo",
      payload: { id: getOrgId() },
    });
  };

  // 获取团队
  const updOrgData = async (param?: any) => {
    const title = inputRef.current.input.value;
    if (title) {
      const { code, data }: any = await dispatch({
        type: "teamModel/postData",
        apiUrl: "updOrgUrl",
        payload: { ...orgInfo, ...param, title },
      });
      if (code == 200) {
        getOrgData(); //
      }
    }
  };

  return (
    <>
      <div className="team_page_header">
        <div className="team_page_title">班级管理</div>
        <div className="team_page_info">
          <div className="team_page_infoText">
            <span>{orgInfo?.title || "团队名称"}</span>
          </div>
          {/* <Avatar
            className="team_page_infoAvatar"
            size={24}
            src={formatStaticUrl(orgInfo?.icon) || avatar}
          /> */}

          {/* {!isEditMode && (
            <>
              <div className="team_page_infoText">
                <span>{orgInfo?.title || "团队名称"}</span>
              </div>
              <Button
                color={"default"}
                size="small"
                variant={"link"}
                className="mt-2"
                onClick={() => {
                  setIsEditMode(!isEditMode);
                }}
              >
                <EditOutlined />
              </Button>
            </>
          )} */}

          {isEditMode && (
            <>
              <div className="team_page_infoText">
                <Input
                  size="small"
                  maxLength={20}
                  allowClear
                  ref={inputRef}
                  defaultValue={orgInfo?.title}
                  className="mx-8 h-26"
                  placeholder="请输入团队名称"
                />
              </div>

              <Button
                color={"primary"}
                size="small"
                variant={"filled"}
                className="ml-16 mt-2"
                onClick={() => {
                  setIsEditMode(!isEditMode);
                  updOrgData();
                }}
              >
                <CheckOutlined />
              </Button>

              <Button
                color="danger"
                size="small"
                variant="filled"
                className="ml-16 mt-2"
                onClick={() => {
                  setIsEditMode(false);
                }}
              >
                <CloseOutlined />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default connect((state: any) => ({
  teamModel: state.teamModel,
}))(App);
