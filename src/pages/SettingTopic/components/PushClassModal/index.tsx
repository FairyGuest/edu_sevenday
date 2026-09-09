import { useState, useEffect, memo, useMemo } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Input,
  message,
  Modal,
  TreeSelect,
  DatePicker,
  Cascader,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { ZYIcon } from "@/components";
import { cogUrl } from "@/utils/host";
import { getOrgId } from "@/utils";
import dayjs from "dayjs";
import { connect, useDispatch } from "@umijs/max";
import "./index.less";

const App = (props: any) => {
  const { exam_id = "", course_id = "", open = false, title = "" } = props;

  const [modal, contextHolder] = Modal.useModal();

  const dispatch = useDispatch();

  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [classIdsData, setClassIdsData] = useState<any>([]); // 勾选班级数组 用于提交

  const [userIdsData, setUserIdsData] = useState<any>([]); // 勾选用户数组 用于提交

  const [treeData, setTreeData] = useState([]);

  const [checkedIds, setCheckedIds] = useState<(string | number)[][]>([]);

  const [groupSubStudentListOption, setGroupSubStudentListOption] =
    useState<any>([]);

  const now = dayjs();

  useEffect(() => {
    groupSubStudentListFn();
    getCourseCatalogList();
    init();
  }, []);

  useEffect(() => {
    setIsModalOpen(open);
  }, [open]);

  useEffect(() => {
    form.setFieldsValue({
      title: title,
    });
  }, [title]);

  //初始化
  const init = () => {
    setCheckedIds([]);
    form.setFieldsValue({
      title: title,
      class_ids: [],
      catalog_id: undefined,
      start_time: dayjs(),
      deadline: now.add(1, "day"),
    });
  };

  // org/group/sub/student/v2/list 暂时隐藏
  const groupSubStudentListFn = async () => {
    setGroupSubStudentListOption([]);
    // let payload: any = { org_id: getOrgId() };
    // const { code, data }: any = await dispatch({
    //   type: "setQuestionsModel/postData",
    //   apiUrl: "groupSubStudentListUrl",
    //   payload: payload,
    // });
    // if (code === 200) {
    //   setGroupSubStudentListOption(groupDealwith(data?.list));
    // }
  };

  // 处理目录列表数据
  const groupDealwith = (list: any) => {
    return list.map((item: any) => {
      item.value = item.id;
      item.label = item.title;
      if (item?.type == "student") {
        item.label = item.name;
      }
      if (item?.type == "class") {
        item.children = groupDealwith(item?.groups);
      }
      if (item?.type == "group") {
        item.children = groupDealwith(item?.students);
      }
      return item;
    });
  };

  // 获取当前课程的目录列表
  const getCourseCatalogList = async () => {
    let payload: any = { space_id: course_id };
    payload = { ...payload };
    let { code, data } = await dispatch({
      type: "setQuestionsModel/getData",
      apiUrl: "getCourseCatalog",
      payload,
    });
    if (code === 200) {
      let arr = dealwith(data);
      selectFirst(arr?.[0]);
      setTreeData(arr);
    }
  };

  // 处理目录列表数据
  const dealwith = (list: any) => {
    return list.map((item: any) => {
      item.value = item.id;
      item.title = item.title;
      if (item?.children?.length > 0) {
        dealwith(item?.children);
      }
      return item;
    });
  };
  // 目录默认选择第一条
  const selectFirst = (row: any) => {
    if (row?.children?.length > 0) {
      selectFirst(row?.children?.[0]);
    } else if (row?.children?.length == 0) {
      form.setFieldsValue({
        catalog_id: row.id,
      });
    }
  };

  function pickerDisabledDate(current: any) {
    return current && current < dayjs().subtract(1, "days").endOf("day");
  }

  const pickerDisabledRangeTime = (currentDate: any) => {
    const isToday = !currentDate || currentDate.isSame(dayjs(), "day");
    if (!isToday) {
      // 非今天：不禁用任何时间
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => [],
      };
    }

    // 今天：获取当前时间的时/分/秒
    // const now = dayjs();
    const currentHour = now.hour();
    const currentMinute = now.minute();
    const currentSecond = now.second();

    return {
      // 禁用小于当前小时的所有小时
      disabledHours: () => {
        const hours = [];
        for (let i = 0; i < currentHour; i++) {
          hours.push(i);
        }
        return hours;
      },
      // 选中当前小时时，禁用小于当前分钟的分钟
      disabledMinutes: (selectedHour: any) => {
        const minutes = [];
        if (selectedHour === currentHour) {
          for (let i = 0; i < currentMinute; i++) {
            minutes.push(i);
          }
        }
        return minutes;
      },
      // 选中当前小时+分钟时，禁用小于当前秒的秒
      disabledSeconds: (selectedHour: any, selectedMinute: any) => {
        const seconds = [];
        if (selectedHour === currentHour && selectedMinute === currentMinute) {
          for (let i = 0; i < currentSecond; i++) {
            seconds.push(i);
          }
        }
        return seconds;
      },
    };
  };

  const publishToClassFn = async (values: any) => {
    if (!values?.deadline || !values?.start_time) {
      message.warning("请选择起止时间");
      return;
    }
    let _start_time = values?.start_time;

    if (dayjs().valueOf() > values?.start_time?.valueOf()) {
      // return message.warning("开始时间不能早于当前时间");
      _start_time = dayjs().format("YYYY-MM-DD HH:mm");
    }

    if (dayjs().valueOf() > values?.deadline?.valueOf()) {
      message.warning("截止时间不能早于当前时间");
      return;
    }

    setLoading(true);
    let json_data = {
      exam_id: exam_id,
      title: values?.title,
      // class_ids: values?.class_ids,
      course_id,
      user_ids: userIdsData,
      class_ids: classIdsData,
      catalog_id: values?.catalog_id,
      // start_time: dayjs(values?.start_time).format("YYYY-MM-DD HH:mm"),
      start_time: _start_time,
      deadline: dayjs(values?.deadline).format("YYYY-MM-DD HH:mm"),
    };

    let { code, data } = await dispatch({
      type: "setQuestionsModel/postData",
      // apiUrl: "getDistribute",
      apiUrl: "postDistributionDistribute",
      payload: { ...json_data, org_id: getOrgId() },
    });
    if (code === 200) {
      message.success("发布成功");
      // questPrintFn();
      props?.refreshListFn?.();
      handleCancel();
    }
    setLoading(false);
  };

  // 渲染已选预览
  const renderOutline = (tree: any[]) => {
    return tree?.map((cls) => (
      <div key={cls.id} className="push_group_sub_student_tree_box_css">
        <div className="push_group_sub_student_tree_box_title">
          {cls.title}
          {/* {cls.info ? `(${cls.info})` : ""} */}
        </div>
        {cls.children?.map((grp: any) => {
          const total = grp.students?.length || 0;
          const selected = grp.selected;
          const isAll = selected.length === total;
          const showList = isAll
            ? grp.students // 全量
            : grp.students?.filter((s: any) => selected?.includes(s.id));
          return (
            <div key={grp.id}>
              <div className="push_group_sub_student_tree_box_grp_box">
                {grp.title}：
                {showList?.map((s: any, i: number) => {
                  return (
                    <span
                      key={s.id}
                      className="push_group_sub_student_tree_box_grp_box_name"
                    >
                      {s.name}
                      {i === showList.length - 1 ? "" : "、"}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    ));
  };

  const displayTree = useMemo(() => {
    /* 1. 先建立 全量 映射 */
    const fullMap = new Map<string, number>(); // grpId -> 学生总数
    groupSubStudentListOption.forEach((cls) =>
      cls.groups?.forEach((grp) =>
        fullMap.set(grp.id, grp.students?.length || 0),
      ),
    );

    /* 2. 建立选中映射 */
    const selMap = new Map<string, string[]>(); // grpId -> 已选学生id数组
    checkedIds.forEach(([, grpId, stuId]) => {
      if (!selMap.has(grpId)) selMap.set(grpId, []);
      selMap.get(grpId)!.push(stuId as string);
    });

    /* 3. 拼树 */
    const tree: any[] = [];
    const clsMap = new Map<string, any>();
    checkedIds.forEach(([clsId, grpId]) => {
      if (!clsMap.has(clsId)) {
        const cls = groupSubStudentListOption.find((c) => c.id === clsId)!;
        clsMap.set(clsId, { ...cls, children: new Map() });
        tree.push(clsMap.get(clsId));
      }
      const grpNode = clsMap.get(clsId).children;
      if (!grpNode.has(grpId)) {
        const grp = groupSubStudentListOption
          .find((c) => c.id === clsId)!
          .groups!.find((g) => g.id === grpId)!;
        grpNode.set(grpId, { ...grp, selected: selMap.get(grpId) || [] });
      }
    });

    /* 4. 把 Map 转成数组，方便后续渲染 */
    return tree.map((cls: any) => ({
      ...cls,
      children: Array.from(cls.children.values()),
    }));
  }, [checkedIds]);

  const cascaderOnChange = (value: any, selectedOptions: any) => {
    let _classIdsData: any = [];
    let _userIdsData: any = [];
    selectedOptions?.map((item: any) => {
      item?.map((n: any) => {
        if (n.type == "class") {
          _classIdsData.push(n.id);
        }
        if (n.type == "student") {
          _userIdsData.push(n.id);
        }
      });
    });
    setClassIdsData([...new Set(_classIdsData)]);
    setUserIdsData([...new Set(_userIdsData)]);
    setCheckedIds(selectedOptions.map((p) => p.map((n) => n.value)));
  };

  const onFinish = async (values: any) => {
    if(userIdsData?.length > 1000){
      message.warning('单次作业发布最多支持1000人，请减少人数后重试')
      return
    }
    publishToClassFn(values);
  };

  const handleCancel = () => {
    props.onCancel();
  };

  const publishToClassComponents = () => {
    return (
      <div>
        <p>
          发布到班级后，习题将同步存入教学资源库，学生将在智启APP收到习题并进行答题，老师可以在作业批改模块查看回收试卷的批改情况
        </p>
        <div className="push_class_modal_box_css">
          <Form
            name="classForm"
            // labelCol={{ span: 6 }}
            // wrapperCol={{ span: 20 }}
            initialValues={{}}
            form={form}
            onFinish={onFinish}
            autoComplete="off"
            style={{ marginTop: "24px" }}
            layout="vertical"
          >
            <Row>
              <Col span={12}>
                <Form.Item
                  label={"作业名称"}
                  name="title"
                  rules={[
                    {
                      required: true,
                      message: "请输入作业名称且最长为50个字符",
                      min: 1,
                      max: 50,
                    },
                  ]}
                >
                  <Input
                    style={{ width: "360px" }}
                    count={{
                      show: true,
                      max: 50,
                    }}
                    placeholder="请输入作业名称"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="选择存储目录"
                  name="catalog_id"
                  rules={[{ required: true, message: "请选择存储目录" }]}
                >
                  <TreeSelect
                    style={{ width: "360px" }}
                    placeholder="请选择存储目录"
                    allowClear
                    treeDefaultExpandAll
                    treeData={treeData}
                  />
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item
                  label="起止时间"
                  name="start_time"
                  rules={[{ required: true, message: "请选择起止时间" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    showTime={{ format: "HH:mm" }}
                    format="YYYY-MM-DD HH:mm"
                    disabledDate={pickerDisabledDate}
                    disabledTime={pickerDisabledRangeTime}
                  />
                </Form.Item>
              </Col>
              <Col span={1}>
                <span className="push_to_class_time_text_css">至</span>
              </Col>
              <Col span={11}>
                <Form.Item label=" " name="deadline">
                  <DatePicker
                    style={{ width: "360px" }}
                    showTime={{ format: "HH:mm" }}
                    format="YYYY-MM-DD HH:mm"
                    disabledDate={pickerDisabledDate}
                    disabledTime={pickerDisabledRangeTime}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="发布对象"
              name="class_ids"
              rules={[{ required: true, message: "请选择发布班级" }]}
            >
              <Cascader
                options={groupSubStudentListOption}
                placeholder="请选择要发布的班级、小组、学生"
                multiple
                maxTagCount={5}
                className="cascader_fix"
                onChange={cascaderOnChange}
                showCheckedStrategy={Cascader.SHOW_CHILD}
                maxTagTextLength={10}
                optionRender={(node) => (
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "244px",
                    }}
                  >
                    {node.label}
                  </div>
                )}
              />
            </Form.Item>
            <Form.Item label="已选预览">
              <>
                <div className={userIdsData?.length > 1000 ? 'push_selected_preview_css' : `push_selected_preview_box_css`}>
                  {renderOutline(displayTree)}
                </div>
                {userIdsData?.length > 1000 && <span className="push_selected_preview_box_text">单次作业发布最多支持1000人，请减少人数后重试</span>}
              </>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Modal
        title={"发布到班级"}
        destroyOnHidden
        // closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={() => {
          form.submit();
        }}
        centered={true}
        width={780}
        onCancel={handleCancel}
        footer={[
          <Button key="back" className="back_btn_css" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="submit_btn_css"
            loading={loading}
            onClick={() => {
              form.submit();
            }}
          >
            发布
          </Button>,
        ]}
      >
        {publishToClassComponents()}
        {contextHolder}
      </Modal>
    </div>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
}))(memo(App));
