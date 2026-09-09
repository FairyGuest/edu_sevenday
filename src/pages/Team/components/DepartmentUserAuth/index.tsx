import { useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "@umijs/max";
import { Button, Modal, Popconfirm, Space, Select } from "antd";
import { ProTable } from "@ant-design/pro-components";
import { UserOutlined } from "@ant-design/icons";
import "./index.less";

const App = (props: any) => {
  const { currDept } = props;
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectRow, setSelectRow] = useState([]);
  const [modal, contextHolder] = Modal.useModal();
  const actionRef = useRef<any>();

  useEffect(() => {}, []);

  // 取消弹框
  const onCancel = () => {
    setIsModalOpen(false);
    props?.onload?.(); // 加载数据
  };

  // 更新权限
  const handleChangeAuth = async (record: any, value: any) => {
    let { code, data } = await dispatch({
      type: "teamModel/postData",
      apiUrl: "updDepartUserUrl",
      payload: { user_id: record?.id, auth: value, department_id: currDept.id },
    });
  };

  const onClickShowModal = () => {
    actionRef?.current?.reload?.();
    setIsModalOpen(true);
  };

  // 勾选删除弹窗
  const showConfirm = () => {
    const content = `是否确认从${currDept?.title}删除这${selectRow?.length}个人。`;
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
        delUser(selectRow.map((item) => item.id));
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const delUser = async (param: any) => {
    let { code, data } = await dispatch({
      type: "teamModel/postData",
      apiUrl: "delDepartUserUrl",
      payload: { department_id: currDept?.id, user_id_list: param },
    });
    if (code == 200) actionRef?.current?.reload?.();
  };

  // 获取部门用户
  const queryDepartUserList = async (params?: any) => {
    if (isModalOpen) {
      let { code, data } = await dispatch({
        type: "teamModel/postData",
        apiUrl: "getDepartmentUrl",
        payload: { department_id: currDept?.id },
      });

      return Promise.resolve({
        data: data || [],
        total: data.length * 1,
        success: true,
      });
    }
  };

  const rowSelection: any = {
    onChange: (sRowKeys: [], selectedRows: []) => {
      setSelectRow(selectedRows);
    },
  };

  const getPartmentAuth = (record: any) => {
    const { department_list = [] } = record;
    return (
      department_list?.filter((item: any) => currDept.id == item.id)?.[0]?.[
        "auth"
      ] || "普通用户"
    );
  };

  const columns = [
    {
      title: "用户名",
      dataIndex: "name",
      width: 140,
      ellipsis: true,
      render: (text: any) => text || "-",
    },
    {
      title: "电话",
      dataIndex: "phone",
      width: 150,
      ellipsis: true,
      render: (text: any) => text || "-",
    },
    {
      title: "权限",
      dataIndex: "auth",
      width: 120,
      ellipsis: true,
      render: (_: any, record: any, index: any) => {
        const { id } = record;
        return (
          <Select
            id={id}
            size={"small"}
            defaultValue={getPartmentAuth(record)}
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
    {
      title: "操作",
      key: "option",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_: any, param: any) => [
        <Popconfirm
          title={`确认要移除“${param.name || param.phone}”?`}
          cancelButtonProps={{ className: "" }}
          okButtonProps={{ danger: true, className: "" }}
          icon={null}
          onConfirm={() => {
            delUser([param.id]);
          }}
        >
          <Button key="warn" color="danger" variant="link">
            移除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  // todo: 部门列表中成员的数量字段。
  return (
    <>
      <Button
        className="custom-blue-icon"
        icon={<UserOutlined />}
        onClick={() => onClickShowModal()}
      >
        管理成员
      </Button>

      {/* 修改权限 */}
      <Modal
        forceRender={true} // 强制渲染 Modal
        destroyOnHidden={true} // 关闭时销毁 Modal 里的子元素
        width={600}
        title={
          <div style={{ paddingRight: "10px" }}>{currDept?.title}成员管理</div>
        }
        open={isModalOpen}
        onCancel={onCancel}
        footer={null}
      >
        <div className="modal-info mt-4 flex items-center justify-between">
          您可以对部门内的成员进行增删，也可以修改成员的权限
        </div>

        <div className="relative w-full mt-20">
          <ProTable
            actionRef={actionRef}
            tableAlertRender={(param: any) => {
              const { selectedRowKeys, onCleanSelected } = param;
              return (
                <Space size={24}>
                  <span>
                    <span>已选 {selectedRowKeys.length} 项</span>
                    <a
                      style={{ marginInlineStart: 8 }}
                      onClick={onCleanSelected}
                    >
                      取消选择
                    </a>
                  </span>
                </Space>
              );
            }}
            tableAlertOptionRender={() => {
              return (
                <Space size={16}>
                  <a onClick={showConfirm}>批量移除</a>
                </Space>
              );
            }}
            rowClassName="px-0"
            rowKey={"id"}
            scroll={{ x: "100%" }}
            rowSelection={{
              ...rowSelection,
            }}
            columns={columns}
            pagination={false}
            search={false}
            options={false}
            request={queryDepartUserList}
          />
        </div>
      </Modal>

      {contextHolder}
    </>
  );
};

export default connect((state: any) => ({
  teamModel: state.teamModel,
}))(App);
