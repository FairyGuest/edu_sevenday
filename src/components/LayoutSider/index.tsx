import React, { useState, useEffect } from "react";
import {
  useLocation,
  useNavigate,
  history,
  useDispatch,
  useSelector,
} from "umi";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Layout, Menu, Popover, Tooltip } from "antd";
import ZYIcon from "@/components/ZYIcon";
import { agentPlatformUrl } from "@/utils/host";
import { getStorageToken, getUserInfo, getOrgId } from "@/utils";

import { useNewNoticePolling } from "./useNewNoticePolling";

import "./index.less";

const { Sider } = Layout;

const SiderMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useNewNoticePolling();

  // 页面加载时获取 teacherContext，存到 commonModel
  // 注意：不恢复此加载，teacherContextLoading 将永远为 true，
  // HeaderCourse / ClassStudentList 等消费 useTeacherContext 的组件不会渲染
  useEffect(() => {
    const org_id = getOrgId();
    if (org_id) {
      dispatch({
        type: "commonModel/postData",
        apiUrl: "getTeacherContextUrl",
        payload: { org_id },
        mTitle: "teacherContext",
        mLoading: "teacherContextLoading",
      });
    } else {
      dispatch({
        type: "commonModel/updateState",
        res: { teacherContextLoading: false },
      });
    }
  }, []);

  const [collapsed, setCollapsed] = useState(false); // 侧边栏折叠状态
  const [openKeys, setOpenKeys] = useState([""]); // 当前展开的菜单项
  const [selectedKey, setSelectedKey] = useState([location.pathname]); // 当前选中的菜单项

  useEffect(() => {
    if (location.pathname.startsWith("/setTopic")) {
      setSelectedKey(["/setTopic"]);
    } else if (location.pathname.startsWith("/paperCompose")) {
      setSelectedKey(["/paperCompose"]);
    } else if (location.pathname.startsWith("/design")) {
      setSelectedKey(["/design"]);
    } else {
      setSelectedKey([trimPathName(location.pathname)]);
    }
    if (collapsed) {
      setOpenKeys([]);
    } else {
      handleOpenChange();
    }
  }, [location.pathname, collapsed]);

  // 处理路径名，只保留前两级路径
  const trimPathName = (str: string) => {
    // 找出所有斜杠的位置
    const slashIndices = [];
    for (let i = 0; i < str.length; i++) {
      if (str[i] === "/") {
        slashIndices.push(i);
      }
    }
    if (slashIndices.length < 3) {
      return str;
    }
    return str.substring(0, slashIndices[2]);
  };
  // 处理菜单展开
  const handleOpenChange = () => {
    const pathArr = location.pathname.split("/");
    if (pathArr.length > 2) {
      setOpenKeys([`${pathArr.at(1)}`]);
    } else if (pathArr.at(1) == "") {
      setOpenKeys(["/"]);
    } else {
      setOpenKeys([""]);
    }
  };
  // 跳转至助管平台
  const goToAgentPlatform = () => {
    window.open(
      `${agentPlatformUrl}/system/user&token=${getStorageToken()}`,
      "_blank",
    );
  };
  // 跳转至个人中心
  const profileSetting = () => {
    history.push("/profile");
  };

  return (
    <Sider
      className="main-sider"
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      collapsedWidth={60}
    >
      <div className="main-sider-logo">
        {collapsed ? (
          <Tooltip title="展开侧边栏" placement="right">
            <div className="expand-btn" onClick={() => setCollapsed(false)}>
              <img src={require("@/assets/menu/fold.svg").default} alt="" />
            </div>
          </Tooltip>
        ) : (
          <>
            <div className="logo">
              <img className="logo-img" src={require("@/assets/logo.png")} />
              <div className="logo-text">智谱七天</div>
            </div>

            <Tooltip title="收起侧边栏" placement="right">
              <div className="collapsed-btn" onClick={() => setCollapsed(true)}>
                <img src={require("@/assets/menu/unfold.svg").default} alt="" />
              </div>
            </Tooltip>
          </>
        )}
      </div>
      <Menu
        className="main-sider-menu"
        theme="light"
        mode="inline"
        inlineIndent={12}
        inlineCollapsed={collapsed}
        selectedKeys={selectedKey}
        onClick={(e) => navigate(e.key)}
        openKeys={openKeys}
        onOpenChange={(keys) => {
          if (!collapsed) setOpenKeys(keys);
        }}
        items={[
          {
            key: "/learning-analysis",
            icon: (
              <img
                src={
                  location.pathname.includes("/learning-analysis")
                    ? require("@/assets/menu/course-active.svg").default
                    : require("@/assets/menu/course.svg").default
                }
              />
            ),
            label: "学情分析",
          },
          {
            key: "/design",
            icon: (
              <img
                src={
                  location.pathname.includes("/design")
                    ? require("@/assets/menu/teach_active.svg").default
                    : require("@/assets/menu/teach.svg").default
                }
              />
            ),
            label: "教学设计",
          },
          {
            key: "/paperCompose",
            icon: (
              <img
                src={
                  location.pathname.includes("/paperCompose")
                    ? require("@/assets/menu/list_active.svg").default
                    : require("@/assets/menu/list.svg").default
                }
              />
            ),
            label: "作业组卷",
          },
          {
            key: "/setTopic",
            icon: (
              <img
                src={
                  location.pathname.includes("/setTopic")
                    ? require("@/assets/menu/teach_active.svg").default
                    : require("@/assets/menu/teach.svg").default
                }
              />
            ),
            label: "作业下发",
          },
          {
            key: "/teach/correction",
            icon: (
              <img
                src={
                  location.pathname.includes("/teach/correction")
                    ? require("@/assets/menu/teach_active.svg").default
                    : require("@/assets/menu/teach.svg").default
                }
              />
            ),
            label: "作业批改",
          },
          {
            key: "/source",
            icon: (
              <img
                src={
                  location.pathname.split("/").at(1) == "source"
                    ? require("@/assets/menu/resource-active.svg").default
                    : require("@/assets/menu/resource.svg").default
                }
              />
            ),
            label: "资源平台",
          },
        ]}
      />
      <div className="main-sider-avatar" style={{ paddingInline: collapsed ? 12 : 20 }}>
        <Popover
          trigger="click"
          classNames={{ root: "avatar-popover" }}
          placement="right"
          content={
            <>
              <div className="avatar-content">
                <Avatar size={40} src={require(`@/assets/menu/avatar.svg`).default} />
                <div className="avatar-text">
                  <div className="avatar-text-name">{getUserInfo("name")}</div>
                  <div className="avatar-text-info">{getOrgId("title")}</div>
                </div>
              </div>
              {/* <div className="list-item" onClick={goToAgentPlatform}>
                <ZYIcon type="zhuguanpingtai" />
                <span className="list-item-title">助管平台</span>
              </div> */}
              <div className="list-item" onClick={profileSetting}>
                <UserOutlined />
                <span className="list-item-title">个人中心</span>
              </div>
            </>
          }
        >
          <div className="avatar-show">
            <Avatar
              size={36}
              src={require(`@/assets/menu/avatar.svg`).default}
            />
            {!collapsed && (
              <div>
                <div className="avatar-show-name">{getUserInfo("name")}</div>
                <div className="avatar-show-info">{getOrgId("title")}</div>
              </div>
            )}
          </div>
        </Popover>
      </div>
    </Sider>
  );
};

export default SiderMenu;

// 获取 teacherContext
export const useTeacherContext = () => {
  const dispatch = useDispatch();
  const teacherContext = useSelector(
    (state: any) => state.commonModel?.teacherContext,
  );
  const teacherContextLoading = useSelector(
    (state: any) => state.commonModel?.teacherContextLoading,
  );

  const setTeacherContext = async (values: any) => {
    const result: any = await dispatch({
      type: "commonModel/setTeacherContext",
      payload: {
        org_id: getOrgId(),
        course_id: values?.courseId ?? "",
        class_id: values?.classId ?? "",
        agent_apps: values?.agentApps ?? [],
        subject_name: values?.subjectName ?? "",
      },
    });
    if (result?.code !== 200) return;
  };

  return [teacherContext, teacherContextLoading, setTeacherContext] as const;
};
