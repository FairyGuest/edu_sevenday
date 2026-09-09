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
      apiUrl: "updGroupUserUrl",
      payload: { user_id: record?.id, auth: value, group_id: currDept.id },
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
      apiUrl: "delGroupUserUrl",
      payload: { group_id: currDept?.id, user_id_list: param },
    });
    if (code == 200) actionRef?.current?.reload?.();
  };

  // 获取部门用户
  const queryDepartUserList = async (params?: any) => {
    if (isModalOpen) {
      let { code, data } = await dispatch({
        type: "teamModel/postData",
        apiUrl: "getGroupUserUrl",
        payload: { group_id: currDept?.id },
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
    const { group_list = [] } = record;
    return (
      group_list?.filter((item: any) => currDept.id == item.id)?.[0]?.[
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
            onChange={(value: any) => {}}
            style={{ width: 100 }}
            popupMatchSelectWidth={false}
            disabled
            options={[
              { value: "管理员", label: "管理员" },
              { value: "普通用户", label: "普通用户" },
            ]}
          />
        );
      },
    },
  ];

  // todo: 部门列表中成员的数量字段。
  return (
    <>
      <span style={{ cursor: "pointer" }} onClick={() => onClickShowModal()}>
        查看成员
      </span>
      {/* <Button
        className="custom-blue-icon"
        icon={<UserOutlined />}
        onClick={() => onClickShowModal()}
      >
        管理成员
      </Button> */}

      {/* 修改权限 */}
      <Modal
        forceRender={true} // 强制渲染 Modal
        destroyOnHidden={true} // 关闭时销毁 Modal 里的子元素
        width={600}
        // title={`${currDept?.title}成员管理`}
        title={
          <div style={{ paddingRight: "10px" }}>{currDept?.title}成员管理</div>
        }
        open={isModalOpen}
        onCancel={onCancel}
        footer={null}
      >
        <div className="relative w-full mt-20">
          <ProTable
            actionRef={actionRef}
            rowClassName="px-0"
            rowKey={"id"}
            scroll={{ x: "100%" }}
            // rowSelection={{
            //   ...rowSelection,
            // }}
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
