import { connect, useDispatch } from "@umijs/max";
import { useEffect, useImperativeHandle, useState } from "react";
import { Form, Input, Modal, Transfer } from "antd";
import { getOrgId } from "@/utils";

import "./index.less";

const ACTION_STATUS_OBJ: any = {
  add: "创建小组",
  upd: "修改小组",
};

// let group_id = ""; //班级id

const StudentGroup = (props: any) => {
  const { commonModel, onRef } = props;
  const { loading } = commonModel;
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionVal, setActionVal] = useState("add");

  const [mockData, setMockData] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [curRow, setCurRow] = useState<any>({}); // 缓存编辑带过来的数据

  // 父调子函数
  useImperativeHandle(onRef, () => ({
    showModal: async (param: any, action = "add") => {
      console.log("param", param);
      setCurRow(param);
      setActionVal(action);
      showModal(); // 显示弹框
      let { group_id } = param;
      await getStudentData({ group_id });
      if (action == "add") {
        initForm({
          title: "",
        });
      }
      if (action == "upd") {
        initForm(param);
      }
    },
  }));

  // 初始化表单
  const initForm = async (param: any) => {
    let { title, user_list = [] } = param;
    setTargetKeys(user_list);
    form.setFieldsValue({
      title,
      user_id_list: user_list,
    });
  };

  // 获取学生列表
  const getStudentData = async (payload = {}) => {
    let { code, data }: any = await dispatch({
      type: "teamModel/postData",
      apiUrl: "getStudentListUrl",
      payload,
    });
    let tempData = data?.students || [];
    tempData.map((item: any) => {
      return { ...item, key: item["id"] }; // 按组件要求格式数据
    });

    setMockData(data?.students || []);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    props?.reload?.();
  };

  const onFinish = async (values: any) => {
    let org_id = getOrgId(); //组织 id
    if (actionVal == "add") {
      let { code } = await dispatch({
        type: "teamModel/postData",
        apiUrl: "addStudentGroupUrl",
        payload: {
          ...values,
          org_id,
          group_id: curRow?.group_id,
        },
      });

      if (code == 200) {
        handleCancel();
      }
    } else {
      let { code, data }: any = await dispatch({
        //修改小组
        type: "teamModel/postData",
        apiUrl: "updStudentGroupUrl",
        isInfo: true, // api 请求成功提示
        payload: {
          ...values,
          sub_group_id: curRow?.id,
          group_id: curRow?.group_id,
        },
      });
      if (code == 200) {
        handleCancel();
      }
    }
  };

  const onFinishFailed = (values: any) => {
    console.log("表单校验失败:", values);
  };

  return (
    <Modal
      title={ACTION_STATUS_OBJ[actionVal]}
      open={isModalOpen}
      loading={loading}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      width={664}
      destroyOnHidden={true}
    >
      <Form
        name="basic"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        form={form}
      >
        <div className="student_group_class_name">{props?.className}</div>
        <Form.Item
          label="小组名称"
          name="title"
          rules={[{ required: true, message: "请输入小组名称" }]}
        >
          <Input placeholder="请输入小组名称" maxLength={20} showCount />
        </Form.Item>
        <Form.Item
          label=""
          name="user_id_list"
          style={{ width: "100%" }}
          rules={[{ required: true, message: "请选择小组成员" }]}
        >
          <Transfer
            style={{ width: "100%" }}
            listStyle={{
              width: 300,
              height: 300,
            }}
            rowKey={(record) => record.id}
            dataSource={mockData}
            targetKeys={targetKeys}
            locale={{ itemUnit: "人", itemsUnit: "人" }}
            showSearch={{ placeholder: "输入姓名查找学生" }}
            filterOption={(value: string, option: any) =>
              option?.name?.includes(value)
            }
            onChange={(newTargetKeys: any) => setTargetKeys(newTargetKeys)}
            render={(item) => item.name}
            selectAllLabels={[
              ({ selectedCount, totalCount }) =>
                `${selectedCount}/${totalCount}`, // 左侧底部
              ({ selectedCount, totalCount }) =>
                `${selectedCount}/${totalCount}`, // 右侧底部
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default connect((state: any) => ({
  teamModel: state.teamModel,
  commonModel: state.commonModel,
}))(StudentGroup);
