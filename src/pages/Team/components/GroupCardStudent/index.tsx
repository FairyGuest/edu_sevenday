import { useEffect, useRef, useState } from "react";
import { connect, useDispatch, history } from "@umijs/max";
import { Card, Form, message, Modal, Dropdown, Button } from "antd";
import { MoreOutlined, DeleteOutlined } from "@ant-design/icons";
import StudentGroup from "@/components/StudentGroup";
import { useLocation } from "umi";
import SearchSkeleton from "../SearchSkeleton";
import { getOrgId } from "@/utils";
import { ZYIcon } from "@/components";
import ChatEmpty from "@/components/ChatEmpty";

import "./index.less";

const App = (props: any) => {
  const [modal, contextHolder] = Modal.useModal();
  const { teamModel, onRef } = props;
  let { studentLoading } = teamModel;
  const dRef = useRef<any>();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const class_id = searchParams.get("class_id");
  // const [groupId, setGroupId] = useState("");
  const [total, setTotal] = useState(0);
  const [listData, setListData] = useState([]);

  useEffect(() => {
    queryList(); // 获取群组数据
  }, []);

  const onClickAddGroup = () => {
    dRef.current.showModal(
      {
        title: "",
        group_id: class_id,
      },
      "add",
    );
  };

  // 群组列表
  const queryList = async (
    title = "",
    pageIndex: any = 0,
    pageSize: any = 1000,
  ) => {
    let payload: any = {
      org_id: getOrgId(),
      group_id: class_id,
      // org_id: "010e28d5-a9a7-11f0-9a61-41c96deaef2c",
      // group_id: "1b3afc14-ab29-11f0-86ca-ab9c2d05afbd",
      pageIndex: pageIndex,
      pageSize: pageSize,
    };
    if (title) {
      payload = { ...payload, title };
    }

    const { code, data }: any = await dispatch({
      type: "teamModel/postData",
      apiUrl: "getGroupStudentUrl",
      mLoading: "studentLoading",
      payload: payload,
    });
    if (code === 200) {
      // setGroupId(data?.list?.[0]?.group_id);
      setListData(data?.list);
      setTotal(data?.total);
    }
  };

  // 删除
  const delQueryDept = (item: any) => {
    console.log("删除", item);
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
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  // 删除调接口
  const delFn = async (item: any) => {
    let payload: any = { sub_group_id: item?.id };
    let { code } = await dispatch({
      type: "teamModel/postData",
      apiUrl: "delGroupStudentUrl",
      payload,
    });

    if (code == 200) {
      queryList();
      message.success("删除成功");
    }
  };

  const menuFn = (e: any, item: any) => {
    if (e?.key == "rename") {
      // console.log("修改", dRef.current.showModal());
      dRef.current.showModal(item, "upd");
    }
    if (e?.key == "delete") {
      delQueryDept(item);
    }
  };

  const menuItems = [
    {
      key: "rename",
      label: (
        <div>
          <ZYIcon type="edit" />
          <span style={{ margin: "0 20px 0 8px" }}>修改</span>
        </div>
      ),
    },
    {
      key: "delete",
      label: (
        <div>
          <ZYIcon type="shanchu" style={{ color: "#EF4444" }} />
          <span style={{ margin: "0 8px" }}>删除</span>
        </div>
      ),
    },
  ];

  return (
    <>
      {studentLoading && <SearchSkeleton />}
      {!studentLoading && (
        <div className="group_card_student">
          <div className="group_card_student_add">
            <Button onClick={onClickAddGroup}>新增小组</Button>
          </div>
          {total > 0 && (
            <>
              <div className="w-full grid gap-[12px] grid-cols-3 class_group_box" style={{justifyContent:'left'}}>
                {listData?.map?.((item: any, index: any) => {
                  return (
                    <Card
                      className="group_page_card"
                      key={index}
                      onClick={() => {
                        console.log("点击班级card", item);
                        // history.push(`/team/member?auth=1&group_id=${item.id}`);
                      }}
                    >
                      <div className="team_page_cardTitle">
                        <div className="team_page_cardTitle_box">
                          {item.title}
                        </div>
                        <div className="team_page_card_icon_box"></div>
                      </div>
                      <div className="team_page_cardInfo">{item.info}</div>
                      <div className="team_page_cardFoot">
                        <span className="team_page_card_edit">
                          {item?.user_count}名成员
                        </span>
                        <Dropdown
                          placement="bottom"
                          overlayClassName="menu-icon"
                          className="dropdown_box_less"
                          menu={{
                            items: menuItems,
                            onClick: (e: any) => {
                              e.domEvent.stopPropagation();
                              menuFn(e, item);
                            },
                          }}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<MoreOutlined />}
                          />
                        </Dropdown>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {total == 0 && (
            <div className="class_group_empty_box">
              <ChatEmpty
                descriptionSty={{
                  fontSize: "14px",
                  color: "#646E8B",
                  fontWeight: 400,
                  textAlign: "center",
                }}
                imgStyle={{ margin: "0 auto" }}
                ImgComponent={
                  <ZYIcon
                    type="kongshuju4"
                    className="class_group_empty_kong"
                    size={80}
                    style={{
                      width: "width: 80px",
                      height: "48px",
                    }}
                  />
                }
                title={`暂无数据`}
              />
            </div>
          )}
        </div>
      )}

      <StudentGroup onRef={dRef} {...props} reload={queryList} />

      {contextHolder}
    </>
  );
};

export default connect((state: any) => ({
  teamModel: state.teamModel,
  commonModel: state.commonModel,
}))(App);
