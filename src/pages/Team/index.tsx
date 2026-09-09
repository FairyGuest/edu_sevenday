import { useEffect, useRef, useState } from "react";
import { connect } from "@umijs/max";
import { Segmented, Input, Button } from "antd";

import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import User from "./components/User";
import OrgHeader from "./components/OrgHeader";
import DepartmentCard from "./components/DepartmentCard";
import GroupCard from "./components/GroupCard";
import QRCodeModal from "./components/QRCodeModal";
import { getCurOrgValue } from "@/utils";
import "./index.less";

const { Search } = Input;

const App = (props: any) => {
  const userRef = useRef(); // 用户
  const departRef = useRef(); // 部门
  const groupRef = useRef(); // 群组
  const qrcodeRef = useRef(); // 二维码
  const teamRef = useRef<any>();

  useEffect(() => {
    // queryDeptList() // 获取部门数据
    // queryGroupList() // 获取群组数据
  }, []);

  const [currTab, setCurrTab] = useState("user");
  const [currTabName, setCurrTabName] = useState<any>("成员");
  const [searchValue, setSearchValue] = useState(""); // 搜索值

  const onShowAddModal = (isQrCode = false) => {
    if (isQrCode) {
      qrcodeRef?.current?.showModal?.();
      return;
    }

    if (currTab == "user") {
      userRef?.current?.showModal?.();
    }

    if (currTab == "department") {
      departRef?.current?.showModal?.();
    }
    if (currTab == "group") {
      groupRef?.current?.showModal?.();
    }
  };

  // todo: 搜索用户列表， 用户列表的【是否加入】【部门】字段。
  const onSearch = (value: any) => {
    if (currTab == "user") {
      userRef?.current?.onSearch?.(value);
    }
    if (currTab == "department") {
      departRef?.current?.onSearch?.(value);
    }
    if (currTab == "group") {
      groupRef?.current?.onSearch?.(value);
    }
  };

  const placeholderFn = () => {
    if (currTabName == "班级") {
      return "搜索班级名称";
    }
    if (currTabName == "成员") {
      return "搜索“姓名、教育ID、虚拟登录手机号”";
    }
    return "";
  };

  return (
    <>
      <div className="team_page_container" ref={teamRef}>
        <OrgHeader />

        <div className="team_page_menu">
          <div className="team_page_menuLeft">
            <Segmented
              className="team_page_segmented mr-12"
              options={[
                { label: "成员", value: "user" },
                // { label: "部门", value: "department" },
                // { label: '群组', value: 'group' },
                { label: "班级", value: "group" },
              ]}
              value={currTab}
              onChange={(value) => {
                setSearchValue("");
                setCurrTab(value);
                // setSearchValue('')
                setCurrTabName(
                  { user: "成员", department: "部门", group: "班级" }[value],
                );
              }}
            />
          </div>

          <div className="team_page_menuRight">
            <Search
              className=""
              value={searchValue}
              style={{ width: "320px" }}
              placeholder={placeholderFn()}
              // placeholder={`搜索“${currTabName}”`}
              // prefix={<SearchOutlined />}
              allowClear
              // onPressEnter={(param: any) => {
              // console.log("param", param)
              // setSearchValue(e.target.value)
              // onSearch(e.target.value)
              // }}
              onChange={(e: any) => {
                setSearchValue(e.target.value);
              }}
              onSearch={(value: any) => {
                setSearchValue(value);
                onSearch(value);
              }}
            />
            {currTabName == "班级" && getCurOrgValue("auth") == "管理员" && (
              <Button
                icon={<PlusOutlined />}
                type="primary"
                className="ml-12"
                // style={{ height: '36px'}}
                onClick={() => onShowAddModal()}
              >
                添加{currTabName}
              </Button>
            )}
            {/* <Button
              icon={<UserOutlined />}
              className="ml-12 custom-white-icon"
              type="primary"
              onClick={() => onShowAddModal(true)}
            >
              邀请注册
            </Button> */}
          </div>
        </div>

        {currTab == "user" && <User onRef={userRef} />}
        {currTab == "department" && <DepartmentCard onRef={departRef} />}
        {currTab == "group" && <GroupCard onRef={groupRef} />}

        <QRCodeModal onRef={qrcodeRef} />
      </div>
    </>
  );
};

export default connect((state: any) => ({
  teamModel: state.teamModel,
}))(App);
