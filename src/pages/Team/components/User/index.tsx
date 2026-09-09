import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { connect, useDispatch } from "@umijs/max";
import {
  Button,
  Modal,
  Table,
  Popconfirm,
  Tag,
  message,
  Select,
  Space,
  Tooltip,
  Input,
  InputNumber,
  Radio,
} from "antd";
import { getOrgId, getUserInfo, getCurOrgValue } from "@/utils";
import { ProTable } from "@ant-design/pro-components";
import ResetPassword from "@/components/EditPassword/ResetPassword";

import "./index.less";
import { ZYIcon } from "@/components";

const App = (props: any) => {
  const { onRef, teamModel } = props;

  const { addLoading } = teamModel;

  const [rowId, setRowId] = useState<any>("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [iphoneArr, setIphoneArr] = useState([]);

  const [selectedRow, setSelectedRow] = useState([]);

  const [facultyList, setFacultyList] = useState([]); // 院系

  const [majorList, setMajorList] = useState([]); // 专业

  const [postList, setPostList] = useState([]); // 岗位

  const [queryDeptListOption, setQueryDeptListOption] = useState([]); // 班级

  const [phone, setPhone] = useState<any>();
  const [member_type, setMember_type] = useState("1");
  const [name, setName] = useState("");
  const [stu_no, setStu_no] = useState("");
  const [faculty, setFaculty] = useState({}); // 院系Row
  const [major, setMajor] = useState({}); // 专业Row
  const [group_row, setGroup_row] = useState({}); // 班级Row
  const [post, setPost] = useState({}); // 岗位Row
  const [push, setPush] = useState(0); // 是否推送清言
  const [disabledPush, setDisabledPush] = useState(false);

  const [modal, contextHolder] = Modal.useModal();
  const dispatch = useDispatch();
  const actionRef = useRef<any>();

  const [searchValue, setSearchValue] = useState(""); // 搜索值

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    showModal: (param?: any) => {
      initModal({});
    },
    onSearch: (param?: any) => {
      setSearchValue(param);
      actionRef.current.reload();
    },
  }));

  // 初始化
  const initModal = (row: any) => {
    if (row?.id) {
      setIsModalOpen(true);
      console.log("编辑", row);
      setName(row?.name || "");
      setPhone(row?.phone ? Number(row?.phone) : undefined);
      setMember_type(row?.member_type + "" || "1");
      setStu_no(row?.stu_no || "");
      setName(row?.name || "");
      // setPush(row?.qy_push_flag ? 1 : 0);
      // setFaculty({
      //   value: row?.faculty?.id,
      //   label: row?.faculty?.name,
      // });

      // setMajor({
      //   value: row?.major?.id,
      //   label: row?.major?.name,
      // });

      setGroup_row({
        value: row?.group_list?.[0]?.id,
        label: "",
      });

      // setPost({
      //   value: row?.post?.id,
      //   label: row?.post?.name,
      // });
      // if (row?.qy_push_flag) {
      //   setDisabledPush(true);
      // }
    } else {
      console.log("新增");
      setIsModalOpen(true);
      // setIphoneArr([]); // 清空添加手机号
      setPhone(undefined);
      setName("");
      setStu_no("");
      setMember_type("1");
      setFaculty({});
      setMajor({});
      setGroup_row({});
      setPost({});
      setPush(0);
      setDisabledPush(false);
    }
  };

  useEffect(() => {
    // facultyListFn();
    // majorListFn();
    // postListFn();
    // queryDeptList();
  }, []);

  // 取消弹框
  const handleCancel = () => {
    setIsModalOpen(false);
    actionRef.current?.reload();
    setRowId("");
    setDisabledPush(false);
    // props?.onLoadTable?.() // 加载表格
  };

  //  格式化用户数据
  const formatOption = () => {
    const options = iphoneArr.map((item: any) => {
      return { value: item, label: item };
    });
    return options;
  };

  // 获取院系
  // const facultyListFn = async () => {
  //   let { code, data } = await dispatch({
  //     type: "teamModel/postData",
  //     apiUrl: "facultyList",
  //     mTitle: "spaceUserListObj",
  //     payload: {
  //       org_id: getOrgId(),
  //       name: "",
  //     },
  //   });
  //   if (code == 200) {
  //     let _array = data?.list?.map((item: any, index: any) => {
  //       return {
  //         value: item?.id,
  //         label: item?.name,
  //       };
  //     });
  //     console.log("院系", _array);
  //     setFacultyList(_array);
  //   } else {
  //     setFacultyList([]);
  //   }
  // };

  // 获取专业
  // const majorListFn = async () => {
  //   let { code, data } = await dispatch({
  //     type: "teamModel/postData",
  //     apiUrl: "majorList",
  //     mTitle: "spaceUserListObj",
  //     payload: {
  //       org_id: getOrgId(),
  //       name: "",
  //     },
  //   });
  //   if (code == 200) {
  //     let _array = data?.list?.map((item: any, index: any) => {
  //       return {
  //         value: item?.id,
  //         label: item?.name,
  //       };
  //     });
  //     console.log("专业", _array);
  //     setMajorList(_array);
  //   } else {
  //     setMajorList([]);
  //   }
  // };

  // 岗位专业
  // const postListFn = async () => {
  //   let { code, data } = await dispatch({
  //     type: "teamModel/postData",
  //     apiUrl: "postList",
  //     mTitle: "spaceUserListObj",
  //     payload: {
  //       org_id: getOrgId(),
  //       name: "",
  //     },
  //   });
  //   if (code == 200) {
  //     let _array = data?.list?.map((item: any, index: any) => {
  //       return {
  //         value: item?.id,
  //         label: item?.name,
  //       };
  //     });
  //     console.log("岗位", _array);
  //     setPostList(_array);
  //   } else {
  //     setPostList([]);
  //   }
  // };

  // 获取班级列表
  const queryDeptList = async () => {
    console.log("获取列表");
    // let payload: any = { org_id: getUserInfo("org_list")?.[0]?.id };
    let payload: any = { org_id: getOrgId() };

    payload = { ...payload };
    const { code, data }: any = await dispatch({
      type: "teamModel/postData",
      apiUrl: "groupListUrl",
      mTitle: "groupListObj",
      mLoading: "GroupLoading",
      payload: payload,
    });
    if (code === 200) {
      let _array = data?.list?.map((item: any, index: any) => {
        return {
          value: item?.id,
          label: item?.title,
        };
      });
      console.log("班级", _array);
      setQueryDeptListOption(_array);
    }
  };

  //校验手机号
  const extractPhoneNumbers = (str: any) => {
    // 定义手机号正则表达式
    const phoneRegex = /1[3-9]\d{9}/g;
    // 使用正则表达式匹配字符串
    const phoneNumbers = str.match(phoneRegex);
    // 如果没有匹配到手机号，返回空数组
    return phoneNumbers || [];
  };

  //手机号
  const onChangePhones = (param: any) => {
    const tempIphoneArr = param.map((item: any) => extractPhoneNumbers(item));
    const arr = tempIphoneArr.flat(); //  数组打平
    const uniqueArray: any = [...new Set(arr)]; // 数组去掉重复
    setIphoneArr(uniqueArray);
  };

  // 弹框确认保存
  const onOkUser = async () => {
    if (!phone) {
      message.warning("请填成员手机号");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      message.warning("请输入正确的手机号");
      return;
    }
    if (!name) {
      message.warning("请填姓名");
      return;
    }

    // if (!stu_no) {
    //   message.warning("请填学号");
    //   return;
    // }
    // if (!faculty?.value) {
    //   message.warning("请选择院系");
    //   return;
    // }
    // if (!major?.value) {
    //   message.warning("请选择专业");
    //   return;
    // }
    // if (!group_row?.value) {
    //   message.warning("请选择班级");
    //   return;
    // }

    let payload = {
      // phone_num_list: iphoneArr,
      member_type,
      org_id: getOrgId(),
      phone: phone + "",
      name,
      stu_no,
      group_id: group_row?.value,
      // qingyan_push: push,
      // faculty: {
      //   id: faculty?.value,
      //   name: faculty?.label,
      // },
      // major: {
      //   id: major?.value,
      //   name: major?.label,
      // },
      // post: {
      //   id: post?.value,
      //   name: post?.label,
      // },
    };

    if (rowId) {
      let { code, data } = await dispatch({
        type: "teamModel/postData",
        apiUrl: "updateUsers",
        mLoading: "addLoading",
        isInfo: true,
        payload: {
          ...payload,
          id: rowId,
        },
      });
      if (code == 200) {
        handleCancel();
      }
    } else {
      let { code, data } = await dispatch({
        type: "teamModel/postData",
        apiUrl: "addUsers",
        mLoading: "addLoading",
        isInfo: true,
        payload,
      });
      if (code == 200) {
        handleCancel();
      }
    }
  };

  // 获取列表
  const getList = async (params?: any) => {
    const { current, ...rest } = params || {};
    let payload: any = {
      pageIndex: current,
      org_id: getOrgId(),
      // show_department: true,
      ...rest,
    };

    if (searchValue) {
      payload.keyword = searchValue;
    }

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
        // created_time: dayjs(item.created_time).format("YYYY-MM-DD hh:mm")
      };
    });

    return Promise.resolve({
      data: result_list,
      total: data?.total * 1,
      success: true,
    });
  };

  // 勾选删除弹窗
  const showConfirm = () => {
    // const content = `是否确认删除“${names}”这${selectedRowKeys.length}个人。`
    const content = `是否确认删除这${selectedRow.length}个人。`;
    modal.confirm({
      title: (
        <div style={{ lineHeight: "28px", fontSize: "18px" }}>
          是否确认删除?
        </div>
      ),
      // icon: <DelIcon />,
      closable: true,
      content: content,
      cancelButtonProps: { className: "" },
      okButtonProps: { danger: true, className: "" },
      onOk() {
        // delUser(selectedRow.map((item) => item.id));
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  // 删除单条数据
  const delUser = async (idArr: any) => {
    let { code, data }: any = await dispatch({
      type: "teamModel/postData",
      apiUrl: "delUserNew",
      isInfo: true, // api 请求成功提示
      payload: { user_id: idArr, org_id: getOrgId() },
    });

    if (code == 200) {
      actionRef.current.reload();
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

  // todo： 自定义筛选菜单，每一列的数据
  const columns = [
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
      title: "登陆虚拟号",
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
        return (
          <Select
            id={id}
            key={id}
            size={"small"}
            disabled={member_type != 1 || getCurOrgValue("auth") !== "管理员"}
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
      ],
    },
  ];

  // const rowSelection: any = {
  //   onChange: (sRowKeys: [], selectedRows: []) => {
  //     setSelectedRow(selectedRows);
  //   },
  // };

  const iconFn = () => {
    return <span className="user_icon_red">*</span>;
  };

  return (
    <>
      <div className="w-full">
        <div className="relative w-full mb-24  user_list_box">
          <ProTable
            actionRef={actionRef}
            // tableAlertRender={({
            //   selectedRowKeys,
            //   selectedRows,
            //   onCleanSelected,
            // }) => {
            //   return (
            //     <Space size={24}>
            //       <span>
            //         <span>已选 {selectedRowKeys.length} 项</span>
            //         <a
            //           style={{ marginInlineStart: 8 }}
            //           onClick={onCleanSelected}
            //         >
            //           取消选择
            //         </a>
            //       </span>
            //     </Space>
            //   );
            // }}
            // tableAlertOptionRender={() => {
            //   return (
            //     <Space size={16}>
            //       <a onClick={showConfirm}>批量删除</a>
            //     </Space>
            //   );
            // }}
            rowClassName="px-0"
            rowKey={"id"}
            scroll={{ x: "100%" }}
            // rowSelection={{
            //   ...rowSelection,
            // }}
            columns={columns}
            // pagination={false}
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

        <Modal
          title={rowId ? `编辑成员` : `添加成员`}
          width={480}
          maskClosable={false}
          confirmLoading={addLoading}
          open={isModalOpen}
          okText={`确认`}
          // loading={loading}
          onOk={() => onOkUser()}
          onCancel={() => handleCancel()}
        >
          <div className="modal_user_box">
            <div className="modal-info mt-4">
              对方可查阅或使用团队内的其他资源
            </div>

            <div className="my-24">
              <div className="modal-form-label">{iconFn()}成员手机号</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder={"请输入手机号"}
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                }}
                controls={false}
                maxLength={11}
                minLength={11}
                min="1"
                max="99999999999"
              />
              {/* <Select
                mode="tags"
                value={iphoneArr}
                style={{ width: "100%" }}
                placeholder="可一次输入或粘贴多个成员手机号，使用逗号分隔。"
                onChange={onChangePhones}
                options={formatOption()}
              /> */}
            </div>
            <div className="my-24">
              <div className="modal-form-label">{iconFn()}姓名</div>
              <Input
                placeholder={"请输入姓名"}
                value={name}
                onChange={(e) => {
                  setName(e?.target?.value);
                }}
                showCount
                maxLength={20}
              />
            </div>
            <div className="my-24">
              <div className="modal-form-label">{iconFn()}用户类型</div>
              <Select
                value={member_type}
                onChange={(value) => setMember_type(value)}
                style={{ width: "100%" }}
              >
                <Select.Option value="1">老师</Select.Option>
                <Select.Option value="2">学生</Select.Option>
              </Select>
            </div>
            {/* <div className="my-24">
              <div className="modal-form-label">{iconFn()}学号</div>
              <Input
                placeholder={"请输入学号"}
                value={stu_no}
                onChange={(e) => {
                  setStu_no(e?.target?.value);
                }}
                showCount
                maxLength={99}
              />
            </div> */}
            {/* <div className="my-24">
              <div className="modal-form-label">{iconFn()}院系</div>
              <Select
                value={faculty?.value}
                onChange={(value, option: any) => {
                  setFaculty(option);
                }}
                style={{ width: "100%" }}
                placeholder="请选择发布班级"
                options={facultyList}
              />
            </div> */}
            {/* <div className="my-24">
              <div className="modal-form-label">{iconFn()}专业</div>
              <Select
                value={major?.value}
                onChange={(value, option: any) => {
                  setMajor(option);
                }}
                style={{ width: "100%" }}
                placeholder="请选择发布班级"
                options={majorList}
              />
            </div> */}
            <div className="my-24">
              <div className="modal-form-label">班级</div>
              <Select
                value={group_row?.value}
                onChange={(value, option: any) => {
                  setGroup_row(option);
                }}
                style={{ width: "100%" }}
                placeholder="请选择发布班级"
                options={queryDeptListOption}
              />
            </div>
            {/* <div className="my-24">
              <div className="modal-form-label">岗位</div>
              <Select
                value={post?.value}
                onChange={(value, option: any) => {
                  setPost(option);
                }}
                style={{ width: "100%" }}
                placeholder="请选择发布班级"
                options={postList}
              />
            </div> */}
            {/* <div className="my-24">
              <div
                className="modal-form-label"
                style={{ display: "inline-block", marginRight: "16px" }}
              >
                是否推送清言
              </div>
              <Radio.Group
                value={push}
                onChange={(e) => {
                  setPush(e?.target?.value);
                }}
                disabled={disabledPush}
                options={[
                  { value: 1, label: "是" },
                  { value: 0, label: "否" },
                ]}
              />
            </div> */}
          </div>
        </Modal>

        {contextHolder}
      </div>
    </>
  );
};

export default connect((state: any) => ({
  teamModel: state.teamModel,
  commonModel: state.commonModel,
  assistantModel: state.assistantModel,
  designModel: state.designModel,
}))(App);
