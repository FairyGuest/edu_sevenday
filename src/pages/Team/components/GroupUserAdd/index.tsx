import { useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "@umijs/max";
import { Modal, Space, Select } from "antd";
import { ProTable } from "@ant-design/pro-components";
import { deepCopy, getOrgId } from "@/utils";

import "./index.less";

const App = (props: any) => {
  const { currDept, teamModel } = props;
  let { userLoading } = teamModel;
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableDataList, setTableDataList] = useState([]); // 组织用户
  const [selectRowKeys, setSelectRowKeys] = useState([]);
  const actionAddUserRef = useRef<any>();

  // useEffect(() => {
  //   if (isModalOpen) {
  //     if (currDept?.user_list?.length > 0) {
  //       const data = currDept?.user_list?.map((item:any)=>{return item})
  //       setSelectRowKeys(data)
  //     }
  //   }
  // },[isModalOpen])

  // 组织用户列表
  const queryOrgUserList = async () => {
    let payload: any = { org_id: getOrgId(), group_id: currDept?.id };
    const { code, data }: any = await dispatch({
      type: "teamModel/postData",
      apiUrl: "userListUrl",
      mTitle: "userListObj",
      mLoading: "userLoading",
      payload,
    });

    setTableDataList(data?.list || []);
  };

  //  表单提交
  const onOk = async () => {
    if (selectRowKeys.length > 0) {
      let tempArr = tableDataList?.filter((item) =>
        selectRowKeys.includes(item.id),
      );

      const newList = tempArr.map((row: any) => {
        const { id, auth = "普通用户" } = row;
        return { user_id: id, auth };
      });

      await dispatch({
        type: "teamModel/postData",
        apiUrl: "addGroupUserUrl",
        isInfo: true, // api 请求成功提示
        payload: { list: newList, group_id: currDept?.id },
      });
    }
    handleCancel();
  };

  // 取消弹框
  const handleCancel = () => {
    setIsModalOpen(false);
    props?.onload?.(); // 加载数据
  };

  // 修改权限
  const handleChangeAuth = async (index: any, value: any) => {
    const tempList = deepCopy(tableDataList);
    tempList[index]["auth"] = value;
    setTableDataList(tempList);
  };

  const onClickShowModal = () => {
    setIsModalOpen(true);
    queryOrgUserList();
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
        const { auth = "普通用户", id } = record;
        return (
          <Select
            id={id}
            size={"small"}
            defaultValue={auth}
            onChange={(value: any) => handleChangeAuth(index, value)}
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
  ];

  // todo: 部门列表中成员的数量字段。
  return (
    <>
      {/* <span className="add_icon" onClick={() => onClickShowModal()}>{item.total || 0}名成员</span> */}
      <span
        className="add_icon"
        onClick={() => {
          // onClickShowModal()
        }}
      >
        {currDept?.user_list?.length || 0}名成员
      </span>

      <Modal
        forceRender={true} // 强制渲染 Modal
        destroyOnHidden={true} // 关闭时销毁 Modal 里的子元素
        width={600}
        title={`添加部门成员`}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={() => onOk()}
      >
        <div className="w-full mt-20">
          <ProTable
            loading={userLoading}
            actionRef={actionAddUserRef}
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
            rowClassName="px-0"
            rowKey={"id"}
            scroll={{ x: "100%" }}
            rowSelection={{
              selectedRowKeys: selectRowKeys,
              onChange: (sRowKeys: [], selectedRows: []) => {
                console.log("sRowKeys", sRowKeys);
                console.log("selectedRows", selectedRows);
                setSelectRowKeys(sRowKeys);
              },
            }}
            columns={columns}
            dataSource={tableDataList}
            pagination={false}
            search={false}
            options={false}
          />
        </div>
      </Modal>
    </>
  );
};

export default connect((state: any) => ({
  teamModel: state.teamModel,
}))(App);
