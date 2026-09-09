import { useState, useEffect, useImperativeHandle } from "react";
import { connect, useDispatch, history } from "@umijs/max";

import {
  Cascader,
  Form,
  InputNumber,
  TreeSelect,
  Tooltip,
  message,
} from "antd";
import ClassStudyInfo from "../ClassStudyInfo";
import { ZYIcon } from "@/components";
import { InfoCircleOutlined } from "@ant-design/icons";

import "./index.less";
import { addNewTracking } from "@/utils";

const Selection = (props: any) => {
  const { onRef, type, form, setDvaVal, } = props;

  const {
    desginForm,
    stageList,
    subjectList,
    chapterList,
    classTypeList,
    classInfo,
    gradeDocId,
    chapterInfo,
    expandedKeys,
  } = props.teachDesginModel

  const dispatch = useDispatch();
  // const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const stage = Form.useWatch("stage", form); // 学段学科值
  const subject = Form.useWatch("subject", form); // 教材册别值

  // const [stageList, setStageList] = useState<any>([]); // 学段学科选项
  // const [subjectList, setSubjectList] = useState<any>([]); // 教材册别选项
  // const [chapterList, setChapterList] = useState<any>([]); // 章节目录选项
  // const [classTypeList, setClassTypeList] = useState<any>([]); // 课型设置选项


  // const [expandedKeys, setExpandedKeys] = useState<any>([]); // 章节目录展开的key
  // const [gradeDocId, setGradeDocId] = useState<any>({}); // 年级、教材id
  // const [chapterInfo, setChapterInfo] = useState<any>({}); // 章节目录信息
  // const [classInfo, setClassInfo] = useState<any>({}); // 班型信息

  useEffect(() => {
    getStage();
  }, []);

  // 学情注入模式：从学情分析页携带班级跳转而来，自动填充学段学科/教材册别（教师免选）
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const injectClassId = q.get("class_id");
    if (!injectClassId || q.get("from") !== "analysis") return;
    fetch("/api/teacher/classes")
      .then(r => r.json())
      .then(d => {
        const cls = (d.data || []).find((c: any) => c.class_id === injectClassId);
        if (!cls) return;
        // g7/g8/g9 → 初中；c1-c3 → 高中
        const stageName = /^g/.test(cls.grade || "") ? "初中" : "高中";
        const subjectName = cls.subject || "数学";
        const gradeNum = String(cls.grade || "").replace(/[^0-9]/g, "");
        const volumeMap: Record<string, string> = { "7": "七年级下册", "8": "八年级下册", "9": "九年级下册" };
        const volume = volumeMap[gradeNum] || "八年级下册";
        form.setFieldsValue({ stage: [stageName, subjectName], subject: ["人教版", volume] });
        setDvaVal({
          gradeDocId: { doc_id: "doc-pep-g8b", grade: volume.replace("下册", ""), volume: "下册" },
        });
        // 与手动选择保持一致的联动
        getSubject();
        getCourseType();
        postClassInfo();
        // 班级学情自动设置：按该班画像推导四维（老师可在“设置班级学情”中修改）
        fetch(`/api/teacher/profile/class?class_id=${injectClassId}&sources=`)
          .then(r => r.json())
          .then(async (pd) => {
            if (pd.code !== 200) return;
            const cards = pd.data?.cards || {};
            const weakPct = Number(cards.weak_top_pct) || 0;
            const avg = Number(cards.recent5_avg) || 60;
            const derived = {
              studies_degree: weakPct <= 20 ? "优秀" : weakPct <= 30 ? "中等" : "薄弱",
              motivation_habit: avg >= 63 ? "主动" : avg >= 58 ? "一般" : "被动",
              literacy_ability: weakPct <= 20 ? "较强" : weakPct <= 30 ? "中等" : "待提升",
              class_learning_diff: weakPct <= 22 ? "较为均衡" : weakPct <= 30 ? "分化一般" : "分化明显",
            };
            // 推导班型（与弹窗内班型接口同规则）
            const ct = await fetch("/api/teach_plan/class_type", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subject: subjectName, ...derived }),
            }).then(r => r.json()).catch(() => null);
            setDvaVal({
              gradeDocId: { doc_id: "doc-pep-g8b", grade: volume.replace("下册", ""), volume: "下册" },
              classInfo: { ...derived, ...(ct?.data || {}) },
            });
          })
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (gradeDocId?.doc_id) {
      getChapterList({ doc_id: gradeDocId.doc_id, type: type });
      form.setFieldsValue({ chapter_id: undefined });
    }
  }, [type, gradeDocId]);

  useImperativeHandle(onRef, () => ({
    getData: () => {

      const formValues = form.getFieldsValue()
      setDvaVal({ desginForm: formValues })

      return {
        ...chapterInfo,
        ...gradeDocId,
        study_info: classInfo,
        studies_degree: classInfo?.studies_degree || "",
        motivation_habit: classInfo?.motivation_habit || "",
        literacy_ability: classInfo?.literacy_ability || "",
        class_learning_diff: classInfo?.class_learning_diff || "",
      };
    },
  }));

  // 获取学段学科
  const getStage = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getStageUrl",
      mTitle: "stageList",
      payload: {},
    });
    if (code === 200) {
      // setStageList(data);
      form.setFieldsValue({ ...desginForm });  // 重置表单

    }
  };
  // 获取教材章节目录
  const getSubject = async () => {
    const stage = form.getFieldValue("stage");
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getSubjectUrl",
      mTitle: "subjectList",
      payload: {
        xueduan: stage[0],
        xueke: stage[1],
      },
    });
    if (code === 200) {
      // setSubjectList(data);
    }
  };
  // 获取章节目录内容
  const getChapterList = async (params: any) => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getDocsNodeTree",
      mTitle: "chapterList",
      payload: params,
    });
    if (code === 200) {
      // setChapterList(data);
      // setExpandedKeys(getAllKeys(data));
      setDvaVal({ expandedKeys: getAllKeys(data) })
    }
  };
  // 获取课型设置
  const getCourseType = async () => {
    const stage = form.getFieldValue("stage");

    const { code, data, msg }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getCourseType",
      mTitle: "classTypeList",
      payload: { subject: stage[1], stage: stage[0] },
    });
    if (code == 200) {
      // setClassTypeList(data);
    } else {
      message.error(msg);
    }
  };

  // 获取班型信息
  const postClassInfo = async () => {
    const stage = form.getFieldValue("stage");
    const { code, data, msg }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getDesignContextUrl",
      mTitle: "classInfo",
      payload: {
        subject: stage[1],
      },
    });
    if (code == 200) {
      // setClassInfo(data);
    }
  };

  // 学科学段改变
  const onStageChange = (value: any) => {
    form.setFieldsValue({
      subject: undefined,
      chapter_id: undefined,
      classType: undefined,
    });

    setDvaVal({
      subjectList: [],
      chapterList: [],
      classTypeList: [],
      classInfo: {},
      gradeDocId: {},
    })

    // setSubjectList([]);
    // setChapterList([]);
    // setClassTypeList([]);

    // setGradeDocId({});
    // setClassInfo({});
    if (value) {
      // addNewTracking({
      //   bt: "cl",
      //   ct: "teaching_design_home_select_stage_subject",
      // });
      getSubject();
      getCourseType();
      postClassInfo();
    }
  };
  // 教材册别改变
  const onSubjectChange = (value: any, option: any) => {
    form.setFieldsValue({ chapter_id: undefined });
    // 特殊处理：高中历史清空课型
    if (stage.join("") === "高中历史") {
      form.setFieldsValue({ classType: undefined });
    }
    // setGradeDocId({});
    // setChapterList([]);
    setDvaVal({
      chapterList: [],
      gradeDocId: {},
    })

    if (value) {
      // addNewTracking({
      //   bt: "cl",
      //   ct: "teaching_design_home_select_textbook_version",
      //   extra: { version_name: value.join("") },
      // });
      setDvaVal({
        gradeDocId: {
          doc_id: option[1]?.doc_id,
          grade: option[1]?.grade,
          volume: option[1]?.volume,
        }
      });
    }
  };
  // 教材册别打开
  const onSubjectOpenChange = (open: boolean) => {
    if (open && !form.getFieldValue("stage")) {
      msgRender();
    }
  };
  // 章节目录改变
  const onChapterChange = (value: any, item: any) => {
    // setChapterInfo({ chapter_id: item.id, chapter_name: item.title });
    setDvaVal({
      chapterInfo: { chapter_id: item.id, chapter_name: item.title },
      // gradeDocId:{},
    })
    // addNewTracking({
    //   bt: "cl",
    //   ct: "teaching_design_home_select_chapter",
    //   extra: { chapter_name: item.title },
    // });
  };
  // 章节目录打开
  const onChapterOpenChange = (open: boolean) => {
    if (open && !gradeDocId?.doc_id) {
      msgRender();
    }
  };
  // 课型设置打开
  const onClassTypeOpenChange = (open: boolean) => {
    if (open && !form.getFieldValue("stage")) {
      msgRender();
    }
  };
  // 课型设置改变
  const onClassTypeChange = (value: any) => {
    if (!value) return;
    // addNewTracking({
    //   bt: "cl",
    //   ct: "teaching_design_home_select_class_type",
    //   extra: { class_type: value?.[0] },
    // });
  };
  // 提示信息
  const msgRender = () => {
    return messageApi.open({
      className: "custom-message",
      icon: <ZYIcon type="xinxi" />,
      content: `请按照顺序选择：学段学科 -> 教材册别 -> 章节目录${type === 1 ? " -> 课型设置" : ""}`,
    });
  };
  // 获取树节点所有key
  const getAllKeys = (data: any[]) => {
    let keys: any[] = [];
    data?.forEach((item: any) => {
      keys.push(item.id);
      if (item.children && item.children.length > 0) {
        keys = keys.concat(getAllKeys(item.children));
      }
    });
    return keys;
  };
  const onCourseNumBlur = (e: number) => {
    // addNewTracking({
    //   bt: "cl",
    //   ct: "teaching_design_home_input_planned_lessons",
    //   extra: { planned_lessons: e },
    // });
  }
  /**
   * 特殊情况（前端处理）
   * 高中历史册别区分必修、选必修
   * 对应的课型不一样
  */
  const historyCheck = () => {
    if (type === 2) return []; // 单元没有课型
    if (Array.isArray(stage) && stage.join("") === "高中历史") {
      if (Array.isArray(subject)) {
        if (subject[1].includes("选择性")) {
          return classTypeList.filter((item: any) => item?.classType?.includes("选必")) || [];
        } else {
          return classTypeList.filter((item: any) => item?.classType?.includes("必修")) || [];
        }
      } else {
        return [];
      }
    } else {
      return classTypeList;
    }
  };
  // tooltip 提示
  const tooltipFun = (
    tips: any[] = [],
    title?: string,
    reate_title?: string,
  ) => {
    return (
      <div className="tooltip-content">
        <div className="title">
          {title}
          {reate_title && `: ${reate_title}`}
        </div>
        {tips.map((tip) => {
          return (
            <div key={tip.title}>
              <div className="subTitle">{tip.title}</div>
              <div className="content">{tip.content}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="selection">
      <Form form={form} layout="inline" variant="borderless">
        <Form.Item
          name="stage"
          // label="学段学科"
          rules={[{ required: true, message: "请选择学段学科" }]}
        >
          <Cascader
            placeholder="学段学科"
            options={stageList}
            style={{ width: 100 }}
            suffixIcon={<ZYIcon type="xiajiantou" />}
            fieldNames={{ label: "value", value: "value" }}
            onChange={onStageChange}
            displayRender={(label) => label.join("")}
          />
        </Form.Item>
        <Form.Item
          name="subject"
          // label="教材册别"
          rules={[{ required: true, message: "请选择教材册别" }]}
        >
          <Cascader
            placeholder="教材册别"
            options={subjectList}
            style={{ width: 100 }}
            className="cascader-select"
            suffixIcon={<ZYIcon type="xiajiantou" />}
            fieldNames={{ label: "value", value: "value" }}
            onChange={onSubjectChange}
            onOpenChange={onSubjectOpenChange}
            displayRender={(label) => label.join("")}
          />
        </Form.Item>
        <Form.Item
          name="chapter_id"
          // label="章节目录"
          rules={[{ required: true, message: "请选择章节目录" }]}
        >
          <TreeSelect
            placeholder="章节目录"
            treeData={chapterList}
            treeExpandedKeys={expandedKeys}
            // onTreeExpand={setExpandedKeys}
            onTreeExpand={(val: any) => setDvaVal({ expandedKeys: val })}
            onSelect={onChapterChange}
            onOpenChange={onChapterOpenChange}
            popupMatchSelectWidth={type === 1 ? 260 : true}
            style={{ width: 160 }}
            classNames={{
              root: `chapter-select ${type === 1 ? "" : "chapter-select-type"}`,
            }}
            suffixIcon={<ZYIcon type="xiajiantou" />}
            fieldNames={{ label: "title", value: "id" }}
          />
        </Form.Item>
        {type === 1 && (
          <Form.Item
            name="classType"
            // label="课型设置"
            rules={[{ required: true, message: "请选择课型设置" }]}
          >
            <Cascader
              placeholder="课型设置"
              options={historyCheck()}
              classNames={{ root: "custom-cascader" }}
              style={{ width: 100 }}
              suffixIcon={<ZYIcon type="xiajiantou" />}
              fieldNames={{ label: "classType", value: "classType" }}
              onChange={onClassTypeChange}
              onOpenChange={onClassTypeOpenChange}
              optionRender={(option: any) => (
                <>
                  {option?.classType}
                  <Tooltip
                    color="#fff"
                    classNames={{ root: "custom-tooltip" }}
                    placement="right"
                    title={tooltipFun(option?.modules, option?.classType)}
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </>
              )}
            />
          </Form.Item>
        )}
        {type === 2 && (
          <Form.Item
            name="course_num"
            // label="计划课时数"
            rules={[{ required: true, message: "请输入计划课时数" }]}
          >
            <InputNumber
              min={1}
              max={35}
              placeholder="计划课时"
              style={{ width: 100 }}
              //  失去焦点时触发事件
              onBlur={(e: any) => onCourseNumBlur(e.target.value)}
            />
          </Form.Item>
        )}
      </Form>
      {contextHolder}
      <ClassStudyInfo
        params={{
          grade: gradeDocId?.grade,
          stage: form.getFieldValue("stage")?.[0],
          subject: form.getFieldValue("stage")?.[1],
        }}
        detailData={classInfo}
        // setDetailData={setClassInfo}
        setDetailData={(val: any) => setDvaVal({ classInfo: val })}
      />
    </div>
  );
};


export default connect((state: any) => ({
  teachDesginModel: state.teachDesginModel,
}))(Selection);
