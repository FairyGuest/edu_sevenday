import { useEffect, useRef, useState } from "react";
import { connect, useDispatch } from '@umijs/max';
import { Avatar, Segmented, Input, Button, Modal, Card, Table, Popconfirm, Tag, message } from 'antd';
import Icon, { ExclamationCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { TableColumnsType } from "antd"
import "../../index.less"
import { getSpaceInfo } from "@/utils";


const DelSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    {/* <path d="M2 12H22M20 12V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V12M4 8L20 4M8.86 6.78004L8.41 4.97004C8.34553 4.71527 8.33189 4.4503 8.36988 4.19026C8.40787 3.93022 8.49674 3.68022 8.6314 3.45454C8.76606 3.22887 8.94388 3.03194 9.15469 2.87503C9.3655 2.71811 9.60517 2.60428 9.86 2.54004L11.8 2.06004C12.0554 1.99573 12.3211 1.98251 12.5816 2.02114C12.8422 2.05977 13.0926 2.14949 13.3184 2.28515C13.5441 2.42081 13.7409 2.59974 13.8974 2.81166C14.0538 3.02358 14.1669 3.26431 14.23 3.52004L14.68 5.32004" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /> */}
  </svg>
)
const DelIcon = (props: any) => <Icon component={DelSvg} {...props} />;

const App = (props: any) => {
  const { onRef, teamModel } = props;
  // console.log(`管理${ type }用户`, id);

  // const { loading, orgListObj } = teamModel

  const [userData, setUserData] = useState([]);
  const [type, setType] = useState('');
  const [currId, setCurrId] = useState('');

  const spaceUserRef = useRef<any>();
  const spaceUserTableRef = useRef<any>();

  useEffect(() => {
    setType(props.type);
    setCurrId(props.id);
    getUserList() // 获取用户
  }, []);

  const [modal, contextHolder] = Modal.useModal();
  const dispatch = useDispatch();

  const [selectIds, setSelectIds] = useState<number | string | any>([])

  // 获取列表
  const getUserList = async () => {

    let payload: any = {
      pageIndex: 0,
      space_id: getSpaceInfo('id'),
    };
    if (type === 'department') {
      payload.department_id = currId;
    } else if (type === 'group') {
      payload.group_id = currId;
    }

    let { code, data }: any = await dispatch({
      type: "teamModel/postData",
      apiUrl: type === 'department' ? "getDepartmentUrl" : "getGroupUrl",
      payload,
    });

    console.log("用户管理获得的列表", data);
    // setUserData(data.list || [])
  };

  // 勾选删除弹窗
  const showConfirm = (ids: any) => {

    const names = userData.filter((item: any) => ids.includes(item.id)).map((item: any) => item.name).join("、")
    const content = `是否确认删除“${names}”这${ids.length}个人。`

    modal.confirm({
      title: <div style={{ lineHeight: '28px', fontSize: '18px' }}>是否确认删除?</div>,
      icon: <DelIcon />,
      closable: true,
      content: content,
      getContainer: () => spaceUserRef.current,
      cancelButtonProps: { className: "" },
      okButtonProps: { danger: true, className: "" },
      onOk() {
        delUsers(ids)
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  // 删除多条数据
  const delUsers = async (ids?: any) => {
    let { code, data }: any = await dispatch({
      type: 'teamModel/postData',
      apiUrl: "delUsersUrl",
      isInfo: true, // api 请求成功提示
      payload: { ids }
    });
    code == 200 ? message.success('删除成功') : message.error('删除失败')
    code == 200 && getUserList()
  }
  
  // 删除单条数据
  const delUser = async (id?: any) => {
    let { code, data }: any = await dispatch({
      type: 'teamModel/postData',
      apiUrl: "delUserUrl",
      isInfo: true, // api 请求成功提示
      payload: { id }
    });
    code == 200 ? message.success('删除成功') : message.error('删除失败')
    code == 200 && getUserList()
  }


  // todo： 自定义筛选菜单，每一列的数据 
  const columns: TableColumnsType<any> = [
    {
      title: '用户名',
      dataIndex: 'name',
      width: 140,
      ellipsis: true,
      render: (text: any) => text || '-',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      width: 150,
      ellipsis: true,
      render: (text: any) => text || '-',
    },
    {
      title: '权限',
      dataIndex: 'role_name',
      width: 120,
      ellipsis: true,
      sorter: (a, b) => a.role_id - b.role_id,
      sortDirections: ['descend'],
      showSorterTooltip: false,
      render: (_: any, param: any) => [
        <span className={param.role_id && 'text-primary'}>{param.role_id || '-'}</span>
      ]
    },
    {
      title: '操作',
      key: 'option',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_: any, param: any) => [
        <Popconfirm
          title={`确认要删除“${param.name}”?`}
          getPopupContainer={() => spaceUserRef.current}
          cancelButtonProps={{ className: "" }}
          okButtonProps={{ danger: true, className: "" }}
          icon={null}
          onConfirm={() => {
            delUser(param.id)
          }}
        >
          <Button key="warn" color="danger" variant="link">删除</Button>
        </Popconfirm>
      ],
    }
  ];

  // rowSelection object indicates the need for row selection
  const rowSelection: any = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: []) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setSelectIds(selectedRows.map((item: any) => item.id))
    },
    getCheckboxProps: (record: any) => ({
      // todo: 禁止选中删除自己删除。 
      // disabled: record.name === 'Disabled User', // Column configuration not to be checked
      // name: record.name,
    }),
    columnWidth: 52
  };


  return <>


    <div className="w-full" ref={spaceUserRef}>

      <div className="team_table_header">
        <div className="team_table_headerLeft">
          已选中:
          <span className={
            "team_table_headerNum " + (selectIds.length && "team_table_headerNumActive")
          }>
            {selectIds.length}
          </span>
          人
          <Button
            className="ml-12"
            disabled={!selectIds.length}
            onClick={() => {
              if (!selectIds.length) return
              showConfirm(selectIds)
            }}
          >
            批量删除
          </Button>
        </div>
        <div className="team_table_headerRight">
          共{userData.length}人
          <Button
            icon={<PlusOutlined />}
            className="ml-12"
            type="primary"
            onClick={() => { }}>
            添加成员
          </Button>
        </div>
      </div>

      <div className="relative w-full mb-24">
        <Table
          ref={spaceUserTableRef}
          rowClassName="px-0"
          rowKey={"id"}
          scroll={{ x: 'max-content' }}
          rowSelection={{ type: 'checkbox', ...rowSelection }}
          columns={columns}
          pagination={false}
          dataSource={userData}
        />
      </div>

    </div>
  </>
};


export default connect((state: any) => ({
  teamModel: state.teamModel,
}))(App);
