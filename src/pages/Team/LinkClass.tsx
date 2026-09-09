import { history } from "umi";

import { useRef, useState } from "react";
import { connect, useDispatch, useLocation } from "@umijs/max";
import { Button, Input, Popconfirm, Modal, Form, message, Spin } from "antd";
import { ProTable } from "@ant-design/pro-components";
import { ZYIcon } from "@/components";
import GroupCardStudent from "./components/GroupCardStudent";
import { agentPlatformUrl } from "@/utils/host";
import { getStorageToken } from "@/utils";

import "./LinkClass.less";

const App = (props: any) => {
  const { search } = useLocation();

  const searchParams = new URLSearchParams(search);
  const classId = searchParams.get("class_id");
  const className = searchParams.get("classname");
  const dispatch = useDispatch();
  const actionRef = useRef<any>();
  const teamRef = useRef<any>();
  const [classRow, setClassRow] = useState<any>({});
  const [segValue, setSegValue] = useState<any>("成员");

  // 详情弹窗
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 添加学生
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const addStudentForm = Form.useForm()[0];

  // 编辑学生
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  // 编辑弹窗加载态（拉取详情接口）
  const [editFetchLoading, setEditFetchLoading] = useState(false);
  const editStudentForm = Form.useForm()[0];

  // 手机号脱敏 兜底防护
  const maskPhone = (phone?: string) => {
    if (!phone) return "-";
    if (phone.length === 11) {
      return `${phone.slice(0, 3)}****${phone.slice(7)}`;
    }
    return phone;
  };

  // 邮箱脱敏 兜底防护
  const maskEmail = (email?: string) => {
    if (!email) return "-";
    const arr = email.split("@");
    if (arr.length !== 2) return email;
    const username = arr[0];
    const domain = arr[1];
    if (username.length <= 2) {
      return `${username}****@${domain}`;
    }
    return `${username.slice(0, 2)}****@${domain}`;
  };

  const isMaskPhoneStr = (val?: string) => {
    if (!val) return false;
    return val.includes("****") && val.length <= 13;
  };
  const isMaskEmailStr = (val?: string) => {
    if (!val) return false;
    return val.includes("****@");
  };
  const openEditStudent = async (record: any) => {
    setEditFetchLoading(true);
    setEditModalOpen(true);
    editStudentForm.setFieldsValue({
      phone: undefined,
      email: undefined,
    });
    try {
      const { code, data }: any = await dispatch({
        type: "teamModel/getData",
        apiUrl: "postcreateTeacherUrl",
        payload: {
          id: record.id,
        },
      });
      let realData = record;
      if (code === 200) {
        realData = data;
      } else {
        message.warning("获取学生完整信息失败，使用列表展示数据");
      }
      editStudentForm.setFieldsValue({
        id: realData.id,
        name: realData.name,
        eduId: realData.eduId,
        phone: realData.phone,
        email: realData.email,
        description: realData.description,
      });
    } catch (err) {
      console.error("编辑获取学生详情异常：", err);
      message.error("网络异常，获取学生信息失败");
      editStudentForm.setFieldsValue({
        id: record.id,
        name: record.name,
        eduId: record.eduId,
        phone: record.phone,
        email: record.email,
        description: record.description,
      });
    } finally {
      setEditFetchLoading(false);
    }
  };

  const openStudentDetail = (record: any) => {
    setCurrentStudent(null);
    setDetailModalOpen(true);
    setDetailLoading(true);

    const fetchDetail = async () => {
      try {
        const { code, data }: any = await dispatch({
          type: "teamModel/getData",
          apiUrl: "postcreateTeacherUrl",
          payload: {
            id: record.id,
          },
        });
        if (code === 200) {
          setCurrentStudent(data);
        } else {
          setCurrentStudent(record);
          message.warning("获取详情接口失败，展示列表原始数据");
        }
      } catch (err) {
        console.error("获取学生详情接口异常：", err);
        setCurrentStudent(record);
        message.error("网络异常，获取详情失败");
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail().catch(() => {
      setDetailLoading(false);
    });
  };

  // 删除学生
  const handleDelete = async (id: any) => {
    const { code, message: msg }: any = await dispatch({
      type: "teamModel/getData",
      apiUrl: "getremoveStudent",
      payload: { id },
    });
    if (code === 200) {
      actionRef.current?.reload();
      message.success("移除成功");
    } else {
      message.error(msg || "移除失败");
    }
  };

  // 添加学生
  const postAddStudent = async (values: any) => {
    const classIdStr = classId?.toString();
    const { code, message: msg }: any = await dispatch({
      type: "teamModel/postData",
      apiUrl: "postaddStudentUrl",
      payload: {
        ...values,
        classIdList: [classIdStr],
      },
    });
    if (code === 200) {
      actionRef.current?.reload();
      addStudentForm.resetFields();
      setAddStudentModalOpen(false);
      message.success("添加学生成功");
    } else {
      message.error(msg || "添加学生失败");
    }
  };

  const postupdateStudentUrl = async (values: any) => {
    try {
      const submitPayload: Record<string, any> = {
        id: values.id,
        name: values.name,
        description: values.description,
        classIdList: [classId],
        phone:"",
        email:"",
      };

      if (!isMaskPhoneStr(values.phone) && values.phone) {
        submitPayload.phone = values.phone;
      }
      if (!isMaskEmailStr(values.email) && values.email) {
        submitPayload.email = values.email;
      }

      const { code, message: msg }: any = await dispatch({
        type: "teamModel/postData",
        apiUrl: "postupdateStudentUrl",
        payload: submitPayload,
      });
      if (code === 200) {
        message.success("修改学生信息成功");
        setEditModalOpen(false);
        editStudentForm.resetFields();
        editStudentForm.setFieldsValue({ phone: undefined, email: undefined });
        actionRef.current?.reload();
      }
    } catch (err) {
      console.error("编辑学生异常：", err);
      message.error("网络异常，修改失败");
    }
  };

  // 获取班级学生列表
  const getList = async () => {
    const { code, data }: any = await dispatch({
      type: "teamModel/getData",
      apiUrl: "classInfo",
      payload: { classId },
    });
    if (code === 200) {
      setClassRow(data);
    }
    return Promise.resolve({
      data: data || [],
      total: Array.isArray(data) ? data.length : 0,
      success: true,
    });
  };

  const goToAgentPlatform = () => {
    const classType = classRow?.classType;
    if (classType === "class") {
      window.open(`${agentPlatformUrl}/system/class&token=${getStorageToken()}&softId=${classId}`, "_blank");
    } else if (classType === "dept") {
      window.open(`${agentPlatformUrl}/system/user&token=${getStorageToken()}`, "_blank");
    }
  };

  const columns: any = [
    {
      title: "姓名",
      dataIndex: "name",
      width: 140,
      ellipsis: true,
      render: (text: any) => text ?? "-",
    },
    {
      title: "学生ID",
      dataIndex: "id",
      width: 140,
      ellipsis: true,
      render: (text: any) => text ?? "-",
    },
    {
      title: "学号",
      dataIndex: "eduId",
      width: 140,
      ellipsis: true,
      render: (text: any) => text ?? "-",
    },
    {
      title: "手机号",
      dataIndex: "phone",
      width: 140,
      ellipsis: true,
      render: (text: any) => maskPhone(text),
    },
    {
      title: "操作",
      dataIndex: "action",
      width: 340,
      render: (_: any, record: any) => (
        <>
          <Button type="link" onClick={() => openStudentDetail(record)}>详情</Button>
          <Button type="link" onClick={() => openEditStudent(record)}>编辑</Button>
          <Popconfirm title="确定要移除该成员吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>移除</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const headerComponent = () => {
    return (
      <div className="team_member_header">
        <div className="team_member_title">
          <ZYIcon
            type="zuo"
            size={14}
            style={{ marginRight: "16px" }}
            onClick={() => history.back()}
          />
          <span className="link_class_title">{className}</span>
        </div>
        <Button className="link_class_manage_button" onClick={() => setAddStudentModalOpen(true)}>添加学生</Button>
      </div>
    );
  };

  return (
    <div className="team_member_container" ref={teamRef}>
      {headerComponent()}
      <div style={{ marginTop: "35px" }}>
        {segValue === "小组" && <GroupCardStudent className={classRow?.title} />}

        {segValue === "成员" && (
          <div className="table-box">
            <ProTable
              className="table"
              actionRef={actionRef}
              rowKey={"id"}
              columns={columns}
              pagination={{
                defaultPageSize: 20,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              search={false}
              options={false}
              request={getList}
            />
          </div>
        )}
      </div>

      <Modal
        title="学生详情"
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setCurrentStudent(null);
          setDetailLoading(false);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>关闭</Button>
        ]}
        width={560}
      >
        <Spin spinning={detailLoading && !currentStudent}>
          {currentStudent ? (
            <div style={{ lineHeight: "2.4" }}>
              <div><b>姓名：</b>{currentStudent.name ?? "-"}</div>
              <div><b>学生ID：</b>{currentStudent.id ?? "-"}</div>
              <div><b>学号：</b>{currentStudent.eduId ?? "-"}</div>
              <div><b>手机号：</b>{currentStudent.phone ?? "-"}</div>
              <div><b>邮箱：</b>{currentStudent.email ?? "-"}</div>
              <div><b>备注：</b>{currentStudent.description ?? "-"}</div>
            </div>
          ) : (
            <div style={{ height: 120 }} />
          )}
        </Spin>
      </Modal>
      <Modal
        title="编辑学生"
        open={editModalOpen}
        confirmLoading={editLoading}
        onCancel={() => {
          setEditModalOpen(false);
          editStudentForm.resetFields();
          editStudentForm.setFieldsValue({ phone: undefined, email: undefined });
        }}
        onOk={async () => {
          setEditLoading(true);
          try {
            const values = await editStudentForm.validateFields();
            await postupdateStudentUrl(values);
          } finally {
            setEditLoading(false);
          }
        }}
        width={560}
      >
        <Spin spinning={editFetchLoading}>
          <Form form={editStudentForm} layout="vertical">
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="name" label="学生姓名" rules={[{ required: true, message: "请输入学生姓名" }]}>
              <Input placeholder="请输入学生姓名" />
            </Form.Item>
            <Form.Item name="eduId" label="学号">
              <Input disabled placeholder="学号不可修改" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                {
                  validator: (_rule, value) => {
                    if (!value || isMaskPhoneStr(value)) return Promise.resolve();
                    if (!/^1[3-9]\d{9}$/.test(value)) {
                      return Promise.reject(new Error("手机号格式不正确"));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input placeholder="如需修改，请输入新手机号，可不填" />
            </Form.Item>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                {
                  validator: (_rule, value) => {
                    if (!value || isMaskEmailStr(value)) return Promise.resolve();
                    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(value)) {
                      return Promise.reject(new Error("邮箱格式不正确"));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input placeholder="如需修改，请输入新邮箱，可不填" />
            </Form.Item>
            <Form.Item name="description" label="备注">
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* 添加学生弹窗 */}
      <Modal
        title="添加学生"
        open={addStudentModalOpen}
        confirmLoading={addStudentLoading}
        onCancel={() => {
          setAddStudentModalOpen(false);
          addStudentForm.resetFields();
        }}
        onOk={async () => {
          setAddStudentLoading(true);
          try {
            const formValues = await addStudentForm.validateFields();
            await postAddStudent(formValues);
          } finally {
            setAddStudentLoading(false);
          }
        }}
        width={520}
      >
        <Form form={addStudentForm} layout="vertical">
          <Form.Item name="name" label="学生姓名" rules={[{ required: true, message: "请输入学生姓名" }]}>
            <Input placeholder="请输入学生姓名" />
          </Form.Item>
          <Form.Item name="eduId" label="学号" rules={[{ required: true, message: "请输入学号" }]}>
            <Input placeholder="请输入学号" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default connect((state: any) => ({
  teamModel: state.teamModel,
}))(App);