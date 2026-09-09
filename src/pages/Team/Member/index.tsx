import { useEffect, useRef, useState } from "react";
import { connect, useDispatch, useLocation } from "@umijs/max";
import {
  Select,
  Input,
  Button,
  Space,
  Tooltip,
  Tag,
  message,
  Modal,
  Popconfirm,
} from "antd";
import { history } from "umi";
import {
  formatStaticUrl,
  getSpaceInfo,
  setLocalSpaceInfo,
  getOrgId,
  getCurOrgValue,
  getUserInfo,
} from "@/utils";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import "./index.less";
import { ZYIcon } from "@/components";
import RemoteSearchSelect from "../components/RemoteSearchSelect";
import ResetPassword from "@/components/EditPassword/ResetPassword";



const { Search } = Input;

const App = (props: any) => {
  const { search } = useLocation();
  const [modal, contextHolder] = Modal.useModal();
  const searchParams = new URLSearchParams(search);
  const groupId = searchParams.get("group_id");
  const auth = searchParams.get("auth");
  const dispatch = useDispatch();
  const actionRef = useRef<any>();
  const teamRef = useRef<any>();
  const [options, setOptions] = useState<any>([]);
  const [single, setSingle] = useState<string>();
  const [usersGroupIn, setUsersGroupIn] = useState(false);
  const [classRow, setClassRow] = useState<any>({});

  useEffect(() => {
    // queryDeptList() // 获取部门数据
    // queryGroupList() // 获取群组数据
    usersGroupInFn();
    getGroupInfo();
  }, []);

  const getPermissionFn = () => {
    return getCurOrgValue("auth") == "管理员" && auth == "1";
  };

  // 判断当前用户是否在当前班级中
  const usersGroupInFn = async () => {
    let { code, data } = await dispatch({
      type: "teamModel/postData",
      apiUrl: "usersGroupIn",
      payload: {
        group_id: groupId,
      },
    });
    console.log(data);
    if (code === 200) {
      setUsersGroupIn(data);
    }
  };

  // 获取组织详情
  const getGroupInfo = async () => {
    let { code, data } = await dispatch({
      type: "teamModel/postData",
      apiUrl: "groupInfo",
      payload: {
        group_id: groupId,
      },
    });
    if (code == 200) {
      setClassRow(data);
    }
  };

  // 更新权限
  const handleChangeAuth = async (record: any, value: any) => {
    let { code, data } = await dispatch({
      type: "teamModel/postData",
      apiUrl: "updDelUrl",
      payload: { ...record, auth: value, org_id: getOrgId() },
    });
    if (code == 200) {
      message.success("操作成功");
    }
  };

  // 获取搜索全部成员的列表list2
  const mockFetch = async (kw: string) => {
    let payload: any = {
      pageIndex: 0,
      pageSize: 1000,
      org_id: getOrgId(),
      group_id: groupId,
      keyword: kw,
    };

    let { code, data } = await dispatch({
      type: "teamModel/postData",
      apiUrl: "userListPagination",
      mTitle: "spaceUserListObj",
      payload,
    });

    const list = data?.list || [];
    const result_list = list?.map((item: any) => {
      const auth_row =
        item?.org_list &&
        item?.org_list?.find((item: any) => {
          return item?.id == getOrgId();
        });

      const { department_id_list, department_list } = item;

      let department_name = "";
      if (department_id_list && department_id_list.length)
        department_name = department_id_list[0]?.title;
      if (department_list && department_list?.length)
        department_name = department_list[0]?.title;
      return {
        ...item,
        key: item?.id,
        auth: auth_row?.auth,
        department_name,
      };
    });

    return new Promise<{ label: string; value: string }[]>((resolve) => {
      setTimeout(() => {
        resolve(
          result_list?.map((item: any) => ({
            ...item,
            label: item?.name,
            value: item?.id,
          })),
        );
      }, 600);
    });
  };

  // 班级添加成员
  const classAddMember = async (row: any) => {
    let payload = {
      // phone_num_list: iphoneArr,
      member_type: row?.member_type,
      org_id: getOrgId(),
      phone: row?.phone + "",
      name: row?.name,
      stu_no: row?.stu_no,
      group_id: groupId,
    };
    let { code, data } = await dispatch({
      type: "teamModel/postData",
      apiUrl: "addUsers",
      mLoading: "addLoading",
      isInfo: true,
      payload,
    });
    if (code == 200) {
      usersGroupInFn();
      actionRef?.current?.reload?.();
    }
  };

  // 获取当前班级的列表list
  const getList = async (params?: any) => {
    let { code, data } = await dispatch({
      type: "teamModel/postData",
      apiUrl: "getGroupUserUrl",
      payload: { group_id: groupId },
    });

    const list = data || [];
    const result_list = list?.map((item: any) => {
      const auth_row =
        item?.org_list &&
        item?.org_list?.find((item: any) => {
          return item?.id == getOrgId();
        });

      const { department_id_list, department_list } = item;

      let department_name = "";
      if (department_id_list && department_id_list.length)
        department_name = department_id_list[0]?.title;
      if (department_list && department_list?.length)
        department_name = department_list[0]?.title;
      return {
        ...item,
        key: item?.id,
        auth: auth_row?.auth,
        department_name,
        // created_time: dayjs(item.created_time).format("YYYY-MM-DD hh:mm")
      };
    });

    return Promise.resolve({
      data: result_list || [],
      total: data.length * 1,
      success: true,
    });
  };

  //  加入/退出班级
  const joinOrOutClass = async (type: any) => {
    // let curOrg = JSON.parse(localStorage.getItem("curOrg") || "{}");
    // const local = JSON.parse(localStorage.getItem("userInfo") || "{}");
    // type 1 加入 2 退出
    if (type == 1) {
      modal.confirm({
        title: (
          <div>
            <span>是否成为该班级的任课老师？</span>
          </div>
        ),
        icon: (
          <span className="anticon">
            <ZYIcon type="tuichu1" style={{ color: "#1C6CFF" }} />
          </span>
        ),
        content: "",
        okButtonProps: {
          style: {
            backgroundColor: "#1C6CFF",
            color: "white",
          },
        },
        onOk: async function () {
          let flag_row = {
            org_id: getOrgId(),
            group_id: groupId,
            member_type: getUserInfo("member_type"), //local?.member_type,
            phone: getUserInfo("phone"), //local?.phone,
            name: getUserInfo("name"), // local?.name,
            stu_no: getUserInfo("stu_no"), //local?.stu_no,
          };
          classAddMember(flag_row);
        },
      });
    }
    if (type == 2) {
      modal.confirm({
        title: (
          <div>
            <span style={{ marginLeft: "4px" }}>确认退出该班级？</span>
          </div>
        ),
        icon: (
          <span className="anticon">
            <ZYIcon type="tuichu1" style={{ color: "#EF4444" }} />
          </span>
        ),
        content: "",
        okButtonProps: {
          style: {
            backgroundColor: "red",
            color: "white",
          },
        },
        onOk: async function () {
          let { code, data } = await dispatch({
            type: "teamModel/postData",
            apiUrl: "delGroupUserUrl",
            payload: { group_id: groupId, user_id_list: [getUserInfo("id")] },
          });
          if (code == 200) {
            usersGroupInFn();
            actionRef?.current?.reload?.();
          }
        },
      });
    }
  };

  let columns = [
    {
      title: "姓名",
      dataIndex: "name",
      width: 140,
      ellipsis: true,
      render: (text: any) => text || "-",
    },
    {
      title: "教育ID",
      dataIndex: "edu_id",
      width: 140,
      ellipsis: true,
      render: (text: any) => text || "-",
    },
    {
      title: "班级",
      dataIndex: "department_name",
      width: 160,
      // ellipsis: true,
      sortDirections: ["descend"],
      showSorterTooltip: false,
      render: (text: any, record: any) => {
        const department_list =
          record?.group_list.filter((item: any) => item.title) || [];
        return (
          <>
            {department_list?.map((item: any) => (
              <Tooltip placement="top" title={item?.title} key={item.id}>
                <Tag
                  key={item.id}
                  className="department-name-tag"
                  bordered={false}
                  color={"lime"}
                >
                  {item?.title}
                </Tag>
              </Tooltip>
            ))}
            {department_list.length == 0 && "-"}
          </>
        );
      },
    },
    {
      title: "登录虚拟号",
      dataIndex: "phone",
      width: 140,
      ellipsis: true,
      render: (text: any) => text || "-",
    },
    // {
    //   title: '是否加入',
    //   dataIndex: 'join_status',
    //   width: 120,
    //   ellipsis: true,
    //   sorter: (a, b) => {
    //     const getValue = (text: string) => (text === '已加入' ? 1 : 0);
    //     return getValue(a.join_status) - getValue(b.join_status);
    //   },
    //   sortDirections: ['descend'],
    //   showSorterTooltip: false,
    //   render: (text: any, ) => [
    //     <Tag bordered={false} color={text === '已加入' ? 'lime' : ''}>{text}</Tag>
    //   ]
    // },
    // {
    //   title: "手机号",
    //   dataIndex: "phone",
    //   width: 150,
    //   ellipsis: true,
    //   render: (text: any) => text || "-",
    // },
    {
      title: "角色",
      dataIndex: "member_type",
      width: 140,
      ellipsis: true,
      render: (text: any, record: any) => {
        let { member_type } = record;
        return member_type == "1" ? "老师" : "学生";
      },
    },
    {
      title: "权限",
      dataIndex: "auth",
      width: 120,
      ellipsis: true,
      // sorter: (a, b) => a.auth.length - b.auth.length,
      sortDirections: ["descend"],
      showSorterTooltip: false,
      // render: (text) => [
      //   // todo: 管理员的权限颜色特别处理。
      //   <span className={text == '所有者' ? 'text-primary' : ''}>{text || '-'}</span>
      // ]
      render: (_: any, record: any, index: any) => {
        const { id, member_type } = record;
        if (getPermissionFn()) {
          return (
            <Select
              id={id}
              key={id}
              size={"small"}
              disabled={member_type != 1}
              defaultValue={record?.auth}
              onChange={(value: any) => handleChangeAuth(record, value)}
              style={{ width: 100 }}
              popupMatchSelectWidth={false}
              options={[
                { value: "管理员", label: "管理员" },
                { value: "普通用户", label: "普通用户" },
              ]}
            />
          );
        }
        return record?.auth || "-";
      },
    },
    // {
    //   title: "加入时间",
    //   dataIndex: "created_time",
    //   width: 200,
    //   ellipsis: true,
    //   sorter: (a, b) =>
    //     new Date(a.created_time).getTime() - new Date(b.created_time).getTime(),
    //   sortDirections: ["descend", "ascend"],
    //   showSorterTooltip: false,
    //   // render: (text: any) => dayjs(text).format("YYYY-MM-DD hh:mm") || '-',
    // },
    {
      title: "操作",
      key: "option",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_: any, param: any) => [
        <ResetPassword key={param.id + 1} param={param} />,
        // <Button
        //   color="default"
        //   variant="link"
        //   onClick={() => {
        //     // setRow(param);
        //     setRowId(param.id);
        //     initModal(param);
        //   }}
        // >
        //   编辑
        // </Button>,
        // <Popconfirm
        //   title={`确认要删除“${param.name || param.phone}”?`}
        //   cancelButtonProps={{ className: "" }}
        //   okButtonProps={{ danger: true, className: "" }}
        //   icon={null}
        //   onConfirm={() => {
        //     // delUser([param.id]);
        //     delUser(param.id);
        //   }}
        // >
        //   <Button key="warn" color="danger" variant="link">
        //     删除
        //   </Button>
        // </Popconfirm>,
      ],
    },
  ];

  const columnsFn = () => {
    // let curOrg = JSON.parse(localStorage.getItem("curOrg") || "{}");
    let arr_columns = columns;
    if (getPermissionFn()) {
      arr_columns = [
        ...columns,
        {
          title: "操作",
          key: "option",
          width: 100,
          align: "center",
          fixed: "right",
          render: (_: any, param: any) => [
            <Popconfirm
              key={param?.id}
              title={`确认要删除“${param?.name || param?.phone}”?`}
              cancelButtonProps={{ className: "" }}
              okButtonProps={{ danger: true, className: "" }}
              icon={null}
              onConfirm={async () => {
                let { code, data } = await dispatch({
                  type: "teamModel/postData",
                  apiUrl: "delGroupUserUrl",
                  payload: { group_id: groupId, user_id_list: [param?.id] },
                });
                if (code == 200) {
                  usersGroupInFn();
                  actionRef?.current?.reload?.();
                }
              }}
            >
              <Button key="warn" color="danger" variant="link">
                删除
              </Button>
            </Popconfirm>,
          ],
        },
      ];
    }
    return arr_columns;
  };

  const joinOrOutClassComponent = () => {
    // let curOrg = JSON.parse(localStorage.getItem("curOrg") || "{}");
    if (auth == "1") {
      return (
        <>
          {!usersGroupIn && (
            <Button
              onClick={() => {
                joinOrOutClass(1);
              }}
            >
              加入班级
            </Button>
          )}
          {usersGroupIn && (
            <Button
              onClick={() => {
                joinOrOutClass(2);
              }}
              className="member_out_btn"
            >
              退出班级
            </Button>
          )}
        </>
      );
    }
    return <></>;
  };

  const teamMemberLeftComponent = () => {
    // let curOrg = JSON.parse(localStorage.getItem("curOrg") || "{}");
    if (getPermissionFn()) {
      return (
        <>
          <span className="team_member_left_text">添加成员：</span>
          <RemoteSearchSelect
            style={{ width: "280px" }}
            placeholder="搜索添加成员"
            value={single}
            onChange={(value: any, option: any) => {
              console.log("option_row", value, option);
              // setSingle()
            }}
            fetchOptions={mockFetch}
            onAdd={(row: any) => {
              classAddMember(row);
            }}
          />
        </>
      );
    }
    return <></>;
  };

  const headerComponent = () => {
    return (
      <div className="team_member_header">
        <div className="team_member_title">
          <ZYIcon
            type="zuo"
            size={14}
            style={{ marginRight: "16px" }}
            onClick={() => {
              history.back();
            }}
          />
          {classRow?.title}
        </div>
        <div className="team_member_info">
          <div className="team_member_infoText">
            <span>{classRow?.info}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="team_member_container" ref={teamRef}>
      <div>{headerComponent()}</div>
      <div className="team_member_search">
        <div className="team_member_left">{teamMemberLeftComponent()}</div>
        <div>{joinOrOutClassComponent()}</div>
      </div>
      <div style={{ marginTop: "16px" }}>
        <div className="relative w-full mb-24 team_member_list_box">
          <ProTable
            actionRef={actionRef}
            rowClassName="px-0"
            rowKey={"id"}
            scroll={{ x: "100%" }}
            columns={columnsFn()}
            // columns={columns}
            pagination={{
              defaultPageSize: 20, // 默认每页显示条数
              showSizeChanger: true, // 是否显示每页条数切换器
              pageSizeOptions: ["10", "20", "50", "100"], // 可选的每页条数选项
            }}
            search={false}
            options={false}
            request={getList}
          />
        </div>
      </div>
      {contextHolder}
    </div>
  );
};

export default connect((state: any) => ({
  teamModel: state.teamModel,
}))(App);
