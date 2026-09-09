import type { FormInstance } from "antd";
import {
  Form,
  Input,
  Select,
  Drawer,
  Button,
  Modal,
  Cascader,
  Radio,
  message,
} from "antd";
import { connect, useDispatch, history } from "umi";
import { useEffect, useImperativeHandle, useState } from "react";
import { getUserInfo, getOrgId, addNewTracking } from "@/utils";
import { ZYIcon } from "@/components";
import { useTeacherContext } from '@/components/LayoutSider';
import "./index.less";

interface SubmitButtonProps {
  form: FormInstance;
}
// 基础教育Id
const baseEduId = "143fb281-7cda-11f0-bbe6-7c214a6d4174";

const CreateModal = (props: any) => {
  const { onRef, onFinish } = props;
  const [modal, contextHolder] = Modal.useModal();
  const dispatch = useDispatch();

  const [context, contextLoading, setContext] = useTeacherContext()
  const [modalVisible, setModalVisible] = useState(false); // 弹窗是否显示
  const [editInfo, setEditInfo] = useState<any>(null); // 编辑回显信息
  const [eduType, setEduType] = useState<any>(); // 教育类型
  const [major, setMajor] = useState<any>([]); // 年级/专业
  const [subject, setSubject] = useState<any>([]); // 学科列表
  const [masterDoc, setMasterDoc] = useState<any>([]); // 主教材
  const [teachers, setTeachers] = useState<any>([
    {
      value: getUserInfo("id"),
      label: getUserInfo("name"),
      disabled: true,
    },
  ]); // 老师
  const [form] = Form.useForm();
  const edu_stage = Form.useWatch("edu_stage", form); // 教育类型值
  const majorValue = Form.useWatch("major", form); // 年级/专业值
  const categories = Form.useWatch("categories", form); // 学科值
  const [saveLoading, setSaveLoading] = useState(false); // 保存loading
  const [loading, setLoading] = useState({
    eduType: false,
    major: false,
    subject: false,
    masterDoc: false,
  });
  const tipElement = <span className="label-info">创建课程后不可更换</span>;

  useEffect(() => {
    if (modalVisible) {
      getTeacherData();
      getEduType();
    }
  }, [modalVisible]);

  // 定义父调用子的钩子函数
  useImperativeHandle(onRef, () => ({
    // 父组件的方法
    openModal: (record?: any) => {
      setModalVisible(true);

      if (record) {
        getMajorData(record?.edu_stage); // 先发送请求
        getMasterDocData(record?.major, record?.categories, record?.edu_stage);
        setEditInfo(record);
        form.setFieldsValue({
          ...record,
          teachers: record?.teachers?.map((item: any) => ({
            value: item.id,
            label: item.name,
          })),
        });
      } else {
        form.setFieldsValue({
          teachers: [
            {
              value: getUserInfo("id"),
              label: getUserInfo("name"),
            },
          ],
        });
      }
    },
  }));
  // 获取教育类型
  const getEduType = async () => {
    setLoading((prev) => ({ ...prev, eduType: true }));
    const { code, data }: any = await dispatch({
      type: "courseModel/getData",
      apiUrl: "getEduTypeUrl",
      payload: {},
    });
    if (code === 200) {
      setEduType(data);
    }
    setLoading((prev) => ({ ...prev, eduType: false }));
  };
  // 获取年级/专业
  const getMajorData = async (eduStage: any) => {
    setLoading((prev) => ({ ...prev, major: true }));
    const { code, data }: any = await dispatch({
      type: "courseModel/getData",
      apiUrl: "getEduMajorUrl",
      payload: { stage_id: eduStage.join(",") },
    });
    if (code === 200) {
      setMajor(data);
    }
    setLoading((prev) => ({ ...prev, major: false }));
  };
  // 获取学科列表
  const getSubjectData = async (eduStage: any) => {
    setLoading((prev) => ({ ...prev, subject: true }));
    const { code, data }: any = await dispatch({
      type: "courseModel/getData",
      apiUrl: "getEduSubjectUrl",
      payload: { edu_stage: eduStage },
    });
    if (code === 200) {
      setSubject(data);
    }
    setLoading((prev) => ({ ...prev, subject: false }));
  };
  // 获取主教材
  const getMasterDocData = async (
    major: any,
    category: any,
    eduStage?: any,
  ) => {
    setLoading((prev) => ({ ...prev, masterDoc: true }));
    const { code, data }: any = await dispatch({
      type: "courseModel/postData",
      apiUrl: "postMasterDocUrl",
      payload: {
        edu_stage: eduStage || edu_stage,
        major: major,
        categories: typeof category === "string" ? [category] : category,
      },
    });
    if (code === 200) {
      setMasterDoc(data);
    }
    setLoading((prev) => ({ ...prev, masterDoc: false }));
  };
  // 获取教师数据
  const getTeacherData = async () => {
    const { code, data }: any = await dispatch({
      type: "courseModel/postData",
      apiUrl: "teacherListUrl",
      payload: {
        org_id: getOrgId(),
        member_type: 1,
      },
    });
    if (code === 200) {
      const arr = data?.filter((item: any) => item.name !== "")
        .map((item: any) => {
          return {
            value: item.id,
            label: item.name,
            disabled: item.id == (editInfo ? editInfo.created_by : getUserInfo("id")),
          };
        });
      setTeachers(arr);
    }
  };
  // 关闭弹层
  const onCancel = () => {
    setModalVisible(false);
    setEditInfo(null);
    form.resetFields();
  };
  // 课程保存
  const onOk = async () => {
    form.validateFields().then(async (values) => {
      console.log("values____", values)
      if (!Array.isArray(values.categories)) {
        values.categories = [values.categories];
      }
      setSaveLoading(true);
      const { code }: any = await dispatch({
        type: "courseModel/postData",
        apiUrl: editInfo ? "courseEditUrl" : "courseAddUrl",
        payload: editInfo
          ? {
            ...editInfo,
            ...values,
          }
          : {
            ...values,
            org_id: getOrgId(), // 获取当前机构id
            // 本地assets中的图片随机一个为背景
            icon: `coursebg${Math.floor(Math.random() * 14)}.png`
          },
      });

      if (code === 200) {
        addNewTracking({
          bt: 'cl',
          ct: 'course_manage_create_confirm_click'
        })
        message.success(editInfo ? "修改成功" : "添加成功");
        onFinish?.();
        onCancel();
      }
      setSaveLoading(false);
    });
  };
  // 删除课程弹窗
  const courseDel = (data: any) => {
    modal.confirm({
      className: "course-dele-modal",
      title: (
        <div>
          <span>
            确定要删除我的课程
            <span style={{ marginLeft: "4px" }}>「{data?.title}」 吗?</span>
          </span>
        </div>
      ),
      icon: (
        <span className="anticon">
          <ZYIcon type="shanchu1" style={{ color: "#EF4444" }} />
        </span>
      ),
      content: "删除课程后，所有关联作业、作业报告、学情分析会被永久清除，不可找回，请确认无误后再操作。",
      okButtonProps: {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      },
      okText: "删除",
      onOk() {
        delFn(data);
      },
    });
  };
  // 删除课程
  const delFn = async (item: any) => {
    let { code, data }: any = await dispatch({
      type: "courseModel/postData",
      apiUrl: "courseDelUrl",
      payload: { id: item?.id },
    });
    if (code == 200) {
      console.log('data', data)

      if (data?.replace_course) {
        setContext({ courseId: data?.replace_course?.id })
      } else {
        setContext({ courseId: '' })
      }
      onFinish?.();
      message.success("删除成功");
    }
  };

  const SubmitButton = ({ form }: SubmitButtonProps) => {
    const [submittable, setSubmittable] = useState<boolean>(false);
    const values = Form.useWatch([], form);
    useEffect(() => {
      form
        .validateFields({ validateOnly: true })
        .then(() => setSubmittable(true))
        .catch(() => setSubmittable(false));
    }, [form, values]);
    return (
      <Button
        type="primary"
        style={{ border: "none" }}
        onClick={onOk}
        disabled={!submittable}
        loading={saveLoading}
      >
        确定
      </Button>
    );
  };

  // 教育类型变化时加载年级/专业、学科
  const eduTypeChange = async (eduType: any) => {
    // 清空选择的年级/专业、学科、主教材
    form.setFieldsValue({
      major: undefined,
      categories: undefined,
      master_doc: undefined,
    });
    setMajor([]);
    setSubject([]);
    setMasterDoc([]);

    if (!eduType) return;
    getMajorData(eduType);
    getSubjectData(eduType);
  };
  // 年级/专业变化时加载主教材
  const majorChange = async (major: any) => {
    form.setFieldsValue({ master_doc: undefined });
    if (!major || !categories) return;

    await getMasterDocData(major, categories);
  };
  // 学科变化时加载主教材
  const categoryChange = async (category: any) => {
    form.setFieldsValue({ master_doc: undefined });
    if (!category || !majorValue) return;

    await getMasterDocData(majorValue, category);
  };

  return (
    <Drawer
      className="course-drawer"
      title={editInfo ? "课程设置" : "创建课程"}
      placement="right"
      footer={
        <div className="drawer_footer">
          {editInfo && (
            <Button
              className="delete_btn"
              htmlType="submit"
              onClick={() => courseDel(editInfo)}
            >
              <ZYIcon type="shanchu" /> 删除
            </Button>
          )}
          <Button className="cancel_btn" onClick={onCancel}>
            取消
          </Button>
          {editInfo ? (
            <Button type="primary" onClick={onOk} loading={saveLoading}>
              确定
            </Button>
          ) : (
            <SubmitButton form={form} />
          )}
        </div>
      }
      onClose={onCancel}
      open={modalVisible}
      width={480}
      forceRender
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="课程名称"
          rules={[{ required: true, message: "请输入课程名称" }]}
        >
          <Input placeholder="请输入课程名称" showCount maxLength={20}></Input>
        </Form.Item>
        <Form.Item
          name="edu_stage"
          label={<div className="label-flex">教育类型{tipElement}</div>}
          rules={[{ required: true, message: "请选择教育类型" }]}
        >
          <Cascader
            allowClear
            showSearch
            options={eduType}
            placeholder="请选择教育类型，支持搜索"
            onChange={eduTypeChange}
            loading={loading.eduType}
            disabled={editInfo}
            suffixIcon={<ZYIcon type="xia" />}
            fieldNames={{
              label: "name",
              value: "id",
            }}
          />
        </Form.Item>
        <Form.Item
          name="major"
          label={<div className="label-flex">适用水平{tipElement}</div>}
          rules={[{ required: true, message: "请选择适用水平" }]}
        >
          <Cascader
            showSearch
            options={major}
            placeholder="请选择适用水平，支持搜索"
            loading={loading.major}
            disabled={loading.major || !edu_stage || editInfo?.master_doc}
            suffixIcon={<ZYIcon type="xia" />}
            onChange={majorChange}
            fieldNames={{
              label: "name",
              value: "id",
            }}
          />
        </Form.Item>
        <Form.Item
          name="categories"
          label={<div className="label-flex">学科{tipElement}</div>}
          rules={[{ required: true, message: "学科不能为空" }]}
        >
          {edu_stage && edu_stage[0] === baseEduId ? (
            <Select
              style={{ width: "100%" }}
              options={subject}
              placeholder="请选择学科"
              suffixIcon={<ZYIcon type="xia" />}
              onChange={categoryChange}
              disabled={editInfo}
              fieldNames={{
                label: "name",
                value: "id",
              }}
            />
          ) : (
            <Input placeholder="请输入学科名称" disabled={editInfo} />
          )}
        </Form.Item>
        {edu_stage && edu_stage[0] === baseEduId && (
          <Form.Item
            name="master_doc"
            label={<div className="label-flex">选择主教材{tipElement}</div>}
            rules={[{ required: true, message: "请选择教材版本" }]}
          >
            <Cascader
              options={masterDoc}
              loading={loading.masterDoc}
              placeholder="请选择教材版本"
              disabled={!categories || !majorValue || editInfo}
              suffixIcon={<ZYIcon type="xia" />}
              fieldNames={{
                label: "name",
                value: "id",
              }}
            />
          </Form.Item>
        )}
        <Form.Item
          style={{ display: "none" }}
          name="teachers"
          label={
            <div className="label-flex">
              课程老师
              <span className="label-info">允许搜索并添加多个老师</span>
            </div>
          }
          rules={[{ required: true, message: "请选择课程老师" }]}
        >
          <Select
            mode="multiple"
            suffixIcon={<ZYIcon type="xia" />}
            placeholder="请选择课程老师"
            options={teachers}
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>
        <Form.Item
          // className="is-public"
          name="is_public"
          label={
            <div className="label-flex-left">
              是否公开到数字课程
              <span className="label-info">
                公开后，课程卡片将公开到数字课程相关分类下，所有用户可见
              </span>
            </div>
          }
          initialValue={0}
        >
          <Radio.Group>
            <Radio value={1}> 公开 </Radio>
            <Radio value={0}> 私密 </Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
      {contextHolder}
    </Drawer>
  );
};

export default connect((state: any) => ({
  courseModel: state.courseModel,
}))(CreateModal);
