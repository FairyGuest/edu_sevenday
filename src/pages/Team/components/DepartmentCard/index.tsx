import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { connect, useDispatch } from "@umijs/max";
import { Card, Form, message, Modal, Tooltip } from "antd";

import { getOrgId } from "@/utils";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import DepartmentUserAuth from "../DepartmentUserAuth";
import DepartmentUserAdd from "../DepartmentUserAdd";
import DepartmentAction from "../DepartmentAction";
import SearchSkeleton from "../SearchSkeleton";

import "./index.less";

const App = (props: any) => {
  const [modal, contextHolder] = Modal.useModal();
  const { teamModel, onRef } = props;
  let { deptListObj, deptLoading } = teamModel;
  const dRef = useRef<any>();
  const dispatch = useDispatch();

  useEffect(() => {
    queryDeptList(); // 获取部门数据
  }, []);

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    showModal: () => {
      dRef.current.showModal();
    },
    onSearch: (param?: any) => {
      queryDeptList(param);
    },
  }));

  // 组织部门列表
  const queryDeptList = async (title = "") => {
    let payload: any = { org_id: getOrgId() };
    if (title) {
      payload = { ...payload, title };
    }
    await dispatch({
      type: "teamModel/postData",
      apiUrl: "departmentListUrl",
      mTitle: "deptListObj",
      mLoading: "deptLoading",
      payload,
    });
  };

  // 删除
  const delQueryDept = (item: any) => {
    modal.confirm({
      title: (
        <div>
          <span>
            你确定删除<span style={{ marginLeft: "4px" }}>{item?.title}?</span>
          </span>
        </div>
      ),
      icon: <DeleteOutlined style={{ color: "red" }} />,
      content: "",
      okButtonProps: {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      },
      onOk() {
        delFn(item);
      },
      onCancel() {},
    });
  };

  // 删除调接口
  const delFn = async (item: any) => {
    let payload: any = { id: item?.id };
    let { code } = await dispatch({
      type: "teamModel/postData",
      apiUrl: "delDepartmentUrl",
      mTitle: "deptListObj",
      mLoading: "deptLoading",
      payload,
    });
    if (code == 200) {
      queryDeptList();
      message.success("删除成功");
    }
  };

  // 编辑
  const editQueryDept = async (item: any) => {
    dRef.current.showModal(item);
  };

  // todo: 部门列表中成员的数量字段。
  return (
    <>
      <div className="w-full grid gap-[12px] grid-cols-3">
        {deptListObj?.list?.map((item: any, index: any) => {
          return (
            <Card className="team_page_card_box" key={index}>
              <div className="team_page_cardTitle">
                <div className="team_page_cardTitle_box">{item.title}</div>
                <div className="team_page_card_icon_box">
                  <span
                    className="team_page_card_edit"
                    onClick={() => {
                      editQueryDept(item);
                    }}
                  >
                    <EditOutlined />
                  </span>
                  <span
                    className="team_page_card_del"
                    onClick={() => {
                      delQueryDept(item);
                    }}
                  >
                    <DeleteOutlined />
                  </span>
                </div>
              </div>
              <div className="team_page_cardInfo">{item.info}</div>
              <div className="team_page_cardFoot">
                <DepartmentUserAdd currDept={item} onload={queryDeptList} />
                <DepartmentUserAuth currDept={item} onload={queryDeptList} />
              </div>
            </Card>
          );
        })}
      </div>

      <DepartmentAction onRef={dRef} reload={queryDeptList} />
      {deptLoading && <SearchSkeleton />}
      {contextHolder}
    </>
  );
};

export default connect((state: any) => ({
  teamModel: state.teamModel,
}))(App);
