import { useState, useEffect, useImperativeHandle, useRef } from "react";
import { connect, useDispatch, history, useLocation } from "@umijs/max";

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
import { getDataService } from "../../services";

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
    injectClassId,
  } = props.teachDesginModel

  const dispatch = useDispatch();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const requestedClass = query.get("from") === "analysis" ? query.get("class_id") || "" : "";
  const requestedClassRef = useRef(requestedClass);
  requestedClassRef.current = requestedClass;
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
    if (!requestedClass) { setDvaVal({ injectClassId: "" }); return; }
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const current = () => active && !controller.signal.aborted;
    setDvaVal({ injectClassId: "", classInfo: {}, gradeDocId: {}, chapterInfo: {}, chapterList: [] });
    form.setFieldsValue({ subject: undefined, chapter_id: undefined });
    const fill = async () => {
      try {
        const d = await fetch("/api/teacher/classes", { signal: controller.signal }).then(r => r.json());
        if (!current()) return;
        const cls = (Array.isArray(d.data) ? d.data : []).find((c: any) => c.class_id === requestedClass);
        if (!cls) throw new Error("班级不存在");
        const stageName = /^g/.test(cls.grade || "") ? "初中" : "高中";
        const subjectName = cls.subject || "数学";
        const gradeNum = String(cls.grade || "").replace(/[^0-9]/g, "");
        const volume = ({ "7": "七年级下册", "8": "八年级下册", "9": "九年级下册" } as Record<string, string>)[gradeNum];
        form.setFieldsValue({ stage: [stageName, subjectName] });
        setDvaVal({ injectClassId: cls.class_id });
        const [books, courses, pd] = await Promise.all([
          getDataService({ xueduan: stageName, xueke: subjectName }, "getSubjectUrl"),
          getDataService({ stage: stageName, subject: subjectName }, "getCourseType"),
          fetch(`/api/teacher/profile/class?class_id=${encodeURIComponent(cls.class_id)}&sources=`, { signal: controller.signal }).then(r => r.json()),
        ]);
        if (!current()) return;
        const editions = books?.code === 200 && Array.isArray(books.data) ? books.data : [];
        const matches = (edition: any) => Array.isArray(edition.children) && edition.children.some((book: any) => book.value === volume && book.doc_id);
        const edition = editions.find((e: any) => e.value === "人教版" && matches(e)) || editions.find(matches);
        const book = edition?.children.find((b: any) => b.value === volume && b.doc_id);
        setDvaVal({ subjectList: editions, classTypeList: courses?.code === 200 && Array.isArray(courses.data) ? courses.data : [] });
        if (book) {
          form.setFieldsValue({ subject: [edition.value, book.value] });
          setDvaVal({ gradeDocId: { doc_id: book.doc_id, grade: book.grade, volume: book.volume } });
        } else {
          message.info("未找到该班级对应的教材册别，请手动选择教材");
        }
        if (pd.code !== 200) throw new Error("学情加载失败");
        const cards = pd.data?.cards || {};
        const weakPct = Number(cards.weak_top_pct) || 0;
        const avg = Number(cards.recent5_avg) || 60;
        const derived = {
          studies_degree: weakPct <= 20 ? "优秀" : weakPct <= 30 ? "中等" : "薄弱",
          motivation_habit: avg >= 63 ? "主动" : avg >= 58 ? "一般" : "被动",
          literacy_ability: weakPct <= 20 ? "较强" : weakPct <= 30 ? "中等" : "待提升",
          class_learning_diff: weakPct <= 22 ? "较为均衡" : weakPct <= 30 ? "分化一般" : "分化明显",
        };
        const ct = await fetch("/api/teach_plan/class_type", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: subjectName, ...derived }), signal: controller.signal,
        }).then(r => r.json());
        if (current()) setDvaVal({ classInfo: { ...derived, ...(ct.code === 200 ? ct.data : {}) } });
      } catch {
        if (active) message.warning("班级学情自动填充失败，请手动设置班级学情");
      } finally { clearTimeout(timeout); }
    };
    fill();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [requestedClass]);

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
        // 学情注入的班级：布置作业等后续动作按此班级下发
        class_id: injectClassId || "",
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
      if (!requestedClassRef.current) form.setFieldsValue({ ...desginForm });  // 注入数据不能被迟到的初始化覆盖

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
