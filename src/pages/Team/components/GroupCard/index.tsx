import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { connect, useDispatch, history } from "@umijs/max";
import { Card, Form, message, Modal, Dropdown, Button, Pagination } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import { getUserInfo } from "@/utils";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import GroupUserAuth from "../GroupUserAuth";
import GroupUserAdd from "../GroupUserAdd";
import GroupAction from "../GroupAction";
import SearchSkeleton from "../SearchSkeleton";
import { getOrgId } from "@/utils";
import { ZYIcon } from "@/components";
import ChatEmpty from "@/components/ChatEmpty";

import "./index.less";

const App = (props: any) => {
  const [modal, contextHolder] = Modal.useModal();
  const { teamModel, onRef } = props;
  let { groupListObj, GroupLoading } = teamModel;
  const dRef = useRef<any>();
  const dispatch = useDispatch();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [listData, setListData] = useState([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    // console.log("groupListObj", groupListObj);
    queryDeptList(); // 获取群组数据
  }, []);

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    showModal: () => {
      console.log("showModal");
      dRef?.current?.showModal();
    },
    onSearch: (param?: any) => {
      setKeyword(param); // 搜索
      queryDeptList(param);
    },
  }));

  // 群组列表
  const queryDeptList = async (
    title = "",
    pageIndex: any = 0,
    pageSize: any = 1000,
  ) => {
    console.log("获取列表");
    let payload: any = {
      org_id: getOrgId(),
      pageIndex: pageIndex,
      pageSize: pageSize,
    };
    if (title) {
      payload = { ...payload, title };
    }
    const { code, data }: any = await dispatch({
      type: "teamModel/postData",
      apiUrl: "groupListUrl",
      mTitle: "groupListObj",
      mLoading: "GroupLoading",
      payload: payload,
    });
    if (code === 200) {
      console.log("群组列表", data);
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
    let payload: any = { id: item?.id };
    let { code } = await dispatch({
      type: "teamModel/postData",
      apiUrl: "delGroupUrl",
      mTitle: "groupListObj",
      mLoading: "GroupLoading",
      payload,
    });
    if (code == 200) {
      queryDeptList();
      message.success("删除成功");
    }
  };

  // 编辑
  // const editQueryDept = async (item: any) => {
  //   console.log("编辑", item);
  //   dRef.current.showModal(item);
  // };

  const menuFn = (e: any, item: any) => {
    if (e?.key == "rename") {
      dRef.current.showModal(item);
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
      {GroupLoading && <SearchSkeleton />}
      {!GroupLoading && (
        <>
          {total > 0 && (
            <>
              <div className="w-full grid gap-[12px] grid-cols-3 class_group_box">
                {listData?.map((item: any, index: any) => {
                  return (
                    <Card
                      className="group_page_card"
                      key={index}
                      onClick={() => {
                        console.log("点击班级card", item);
                        history.push(`/team/member?auth=1&group_id=${item.id}`);
                      }}
                    >
                      <div className="team_page_cardTitle">
                        <div className="team_page_cardTitle_box">
                          {item.title}
                        </div>
                        <div className="team_page_card_icon_box">
                          {/* <span
                    className="team_page_card_edit"
                    onClick={() => {
                      console.log("编辑");
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
                  </span> */}
                        </div>
                      </div>
                      <div className="team_page_cardInfo">{item.info}</div>
                      <div className="team_page_cardFoot">
                        <GroupUserAdd currDept={item} onload={queryDeptList} />
                        {/* <GroupUserAuth currDept={item} onload={queryDeptList} /> */}
                        <Dropdown
                          placement="bottom"
                          overlayClassName="menu-icon"
                          className="dropdown_box_less"
                          // onClick={(e: any) => {
                          //   console.log("click", e);
                          // }}
                          menu={{
                            items: menuItems,
                            onClick: (e: any) => {
                              //  props?.menuClick(e, item)
                              e.domEvent.stopPropagation();
                              menuFn(e, item);
                              console.log("点击1111", e, item);
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

              {/* <div className="group_pagination_box">
                <Pagination
                  showSizeChanger
                  total={total}
                  size="small"
                  showTotal={(total: any, range: any) =>
                    `第${range[0]}-${range[1]}条 /总共 ${total} 条`
                  }
                  defaultPageSize={pageSize}
                  defaultCurrent={pageIndex}
                  onChange={(pageIndex: any, pageSize: any) => {
                    console.log(pageIndex, pageSize);
                    setPageSize(pageSize);
                    setPageIndex(pageIndex);
                    queryDeptList(keyword, pageIndex - 1, pageSize);
                  }}
                />
              </div> */}
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
        </>
      )}
      <GroupAction onRef={dRef} reload={queryDeptList} />
      {contextHolder}
    </>
  );
};

export default connect((state: any) => ({
  teamModel: state.teamModel,
}))(App);
