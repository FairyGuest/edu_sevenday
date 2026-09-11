import { useState, useEffect, useRef } from "react";
import { connect, useDispatch, history } from "@umijs/max";
import { Button, Drawer, Form, Input, Segmented, Tooltip, message } from "antd";
import HistoryList from "./components/HistoryList";
import Tracker from "@/components/Tracker";
import Selection from "./components/Selection";
import InjectPreview from "./components/InjectPreview";
import AttachList from "./components/AttachList";
import UploadFile from "./components/UploadFile";
import TabVideo from "./components/TabVideo";
import GuidedFlow from "./components/GuidedFlow";
import { ZYIcon } from "@/components";
import { addNewTracking, getOrgId, scrollTop } from "@/utils";
import courseImg from "@/assets/course_desc.svg";
import unitImg from "@/assets/unit_desc.svg";

import "./index.less";

const { TextArea } = Input;

const TeachDesign = (props: any) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { collapse, type } = props.teachDesginModel;
  const selectionRef = useRef<any>(null); // 选择组件ref
  const uploadFileRef = useRef<any>(null); // 上传组件ref
  const rightRef = useRef<any>(null); // 右侧组件ref
  const element = document.getElementsByClassName("teach-design")[0];

  const [segValue, setSegValue] = useState(1); // 选择项
  const [open, setOpen] = useState(false); // 抽屉显示隐藏
  const stage = Form.useWatch("stage", form); // 学段学科值
  const [userRequire, setUserRequire] = useState(""); // 个性化诉求
  const [guideOpen, setGuideOpen] = useState(false); // D1 启发式引导
  const guideCtxRef = useRef<any>({}); // 引导上下文（表单+学情快照）
  const [fileList, setFileList] = useState<any>([]); // 附件列表

  const setDvaVal = async (payload: any) => {
    await dispatch({
      type: "teachDesginModel/setData",
      payload,
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
  // 删除上传文件
  const fileDelete = (dele: any) => {
    const newFileList = fileList.filter((item: any) => item.id !== dele.id);
    setFileList(newFileList);
  };
  // 确定提交（入口）：校验通过后先进入 D1 启发式引导，完成/跳过后执行真正生成
  const onFinish = async (values?: any) => {
    form.validateFields().then(async (values) => {
      const formValues = {
        stage: values.stage[0],
        subject: values.stage[1],
        class_type: values.classType?.at(-1) || "",
        doc_version: values.subject[0],
        course_num: values.course_num || 1,
      };
      const selection = selectionRef.current?.getData();
      if (!selection?.study_info?.classType) {
        message.error("请先设置班级学情");
        return;
      }
      // 引导上下文：章节/课型/学情（供 AI 提问）
      guideCtxRef.current = {
        chapter: selection?.chapter_name || "",
        class_type: formValues.class_type,
        studies_degree: selection?.studies_degree || "",
        motivation_habit: selection?.motivation_habit || "",
        class_learning_diff: selection?.class_learning_diff || "",
        study_ctx: [selection?.studies_degree, selection?.motivation_habit, selection?.class_learning_diff].filter(Boolean).join(" · "),
        // 生成上下文快照（真正生成时复用，避免表单变动）
        gen: {
          ...formValues,
          ...selection,
          type,
          user_require: userRequire,
          org_id: getOrgId(),
          file_ids: fileList.map((item: any) => item.id),
          teach_guide: "",
          title: selection?.chapter_name,
        },
      };
      setGuideOpen(true);
    });
  };

  // 真正生成：guidance 为 D1 引导产物（跳过时为 null）
  const doGenerate = async (guidance: any) => {
    setGuideOpen(false);
    const data = { ...guideCtxRef.current.gen };
    if (guidance) data.guidance = guidance;
    await dispatch({
      type: "teachDesginModel/setData",
      payload: { planParams: { ...data } },
    });
    if (type == 1) {
      history.push("/design/hour");
    } else {
      history.push("/design/unit");
    }
  };

  // 滚动到顶部
  const scrollClick = () => {
    scrollTop(rightRef);
  };

  return (
    // <Tracker
    //   eventType="view"
    //   trackData={{ bt: "pv", ct: "teaching_design_home_view"}}
    // >
    <div className="teach-design">
      <div className="teach-design-left">
        {collapse ? (
          // <Tracker
          //   eventType="click"
          //   trackData={{ bt: "cl", ct: "teaching_design_home_click_history" }}
          // >
          <Button
            className="history-btn"
            onClick={() => setDvaVal({ collapse: false })}
          >
            历史记录
          </Button>
          // </Tracker>
        ) : (
          <HistoryList
            setCollapse={(val: any) => setDvaVal({ collapse: val })}
          />
        )}
      </div>
      <div className="teach-design-right" ref={rightRef}>
        <div className="right">
          <div className="right-wrapper">
            <div className="right-wrapper-title" onClick={() => setOpen(true)}>
              以新课标核心素养为导向的教学设计
              <Tooltip title="点击查看说明">
                <img src={require("@/assets/design_nav.svg").default} />
              </Tooltip>
            </div>
            <div className="right-wrapper-type">
              <div
                className={`type-item ${type === 1 ? "course-active" : "course"}`}
                onClick={() => setDvaVal({ type: 1 })}
              >
                <div className="type-item-img" />
                课时教学设计
              </div>
              <div
                className={`type-item ${type === 2 ? "unit-active" : "unit"}`}
                onClick={() => setDvaVal({ type: 2 })}
              >
                <div className="type-item-img" />
                单元教学设计
              </div>
              <Drawer
                width={600}
                open={open}
                onClose={() => setOpen(false)}
                className="design-drawer"
                getContainer={() => element}
                closable={{ placement: "end" }}
                rootStyle={{ position: "absolute" }}
                title={
                  <Segmented
                    size="large"
                    value={segValue}
                    onChange={setSegValue}
                    options={[
                      { label: "课时教学设计", value: 1 },
                      { label: "单元教学设计", value: 2 },
                    ]}
                  />
                }
              >
                <div className="drawer-content">
                  {segValue === 1 ? (
                    <img src={courseImg} />
                  ) : (
                    <img src={unitImg} />
                  ) }
                </div>
              </Drawer>
            </div>
            <div className="right-wrapper-content">
              <div className="right-wrapper-img" />
              <div className="dialog-box">
                <Selection
                  onRef={selectionRef}
                  form={form}
                  type={type}
                  setDvaVal={setDvaVal}
                />
                <InjectPreview />
                <AttachList fileList={fileList} fileDelete={fileDelete} />
                <TextArea
                  autoSize={{ minRows: 3, maxRows: 11 }}
                  placeholder={`1、选择学科学段、教材版本、章节与${type === 1 ? "课堂类型" : "课时"}，并完善学情信息；
2、若无额外内容输入，可直接生成教案，并进入“人机交互”阶段，通过与AI对话深度打磨教案(推荐)；
3、若输入内容或上传附件，将生成AI+用户输入相结合的${type === 1 ? "课时" : "单元"}教案。`}
                  variant="borderless"
                  value={userRequire}
                  onChange={(e: any) => setUserRequire(e.target.value)}
                  // 失焦时触发
                  // onBlur={() => {
                  //   addNewTracking({
                  //     bt: "cl",
                  //     ct: "teaching_design_home_input_custom_text",
                  //     extra: {
                  //       has_custom_text: userRequire == "" ? "no" : "yes",
                  //     },
                  //   });
                  // }}
                />
                <div className="input-btn">
                  <Button
                    color="default"
                    variant="text"
                    disabled={fileList?.length >= 10}
                    icon={<ZYIcon type="upload-file" size={20} />}
                    onClick={() => {
                      uploadFileRef.current?.onUploadOpen();
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<ZYIcon type="send" size={20} />}
                    onClick={() => {
                      onFinish();
                      // addNewTracking({
                      //   bt: "cl",
                      //   ct: type === 1 ? "lesson_plan_home_click_generate" : "unit_plan_click_generate",
                      //   extra: {
                      //     tab_type: type === 1 ? "lesson_tab" : "unit_tab",
                      //     has_custom_text: userRequire == "" ? "no" : "yes",
                      //     attach_num: fileList.length,
                      //     school_id: getOrgId("id"),
                      //     school_name: getOrgId("title"),
                      //     subject_name: stage?.join("") || "",
                      //   },
                      // });
                    }}
                  />
                </div>
                <GuidedFlow
                  open={guideOpen}
                  params={guideCtxRef.current}
                  onComplete={(g) => doGenerate(g)}
                  onSkip={() => doGenerate(null)}
                  onClose={() => setGuideOpen(false)}
                />
                <UploadFile
                  onRef={uploadFileRef}
                  dataList={fileList}
                  setDataList={setFileList}
                />
              </div>
            </div>
          </div>
          {stage && <TabVideo form={form} scrollClick={scrollClick} />}
        </div>
      </div>
    </div>
    // </Tracker>
  );
};

export default connect((state: any) => ({
  teachDesginModel: state.teachDesginModel,
}))(TeachDesign);
