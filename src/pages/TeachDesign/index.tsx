import { useState, useEffect, useRef } from "react";
import { ReadOutlined } from "@ant-design/icons";
import { ZYIcon } from "@/components";
import { connect, useDispatch, history, useLocation } from "@umijs/max";
import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  Segmented,
  Tooltip,
  message,
} from "antd";
import { researchRead, researchWrite } from "@/pages/SchoolResearch/services";
import HistoryList from "./components/HistoryList";
import Selection from "./components/Selection";
import InjectPreview from "./components/InjectPreview";
import ImportClassDialog from "./components/ClassStudyInfo/ImportClassDialog";
import { classLearningContext } from "./components/ClassStudyInfo/importContext";
import { replacePageQuery } from "@/utils/pageQuery";
import AttachList from "./components/AttachList";
import UploadFile from "./components/UploadFile";
import TabVideo from "./components/TabVideo";
import GuidedFlow from "./components/GuidedFlow";
import DesignAssetsBar from "./components/DesignAssetsBar";
import { getOrgId, scrollTop } from "@/utils";
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
  const requestRef = useRef<any>(null);
  const injectedTextRef = useRef("");

  const [segValue, setSegValue] = useState(1); // 选择项
  const [open, setOpen] = useState(false); // 抽屉显示隐藏
  const stage = Form.useWatch("stage", form); // 学段学科值
  const [userRequire, setUserRequire] = useState(""); // 个性化诉求（目标/资源注入也写入此处）
  const location = useLocation();
  const researchQuery = new URLSearchParams(location.search);
  const researchTopic = researchQuery.get("research_topic") || "";
  const researchStrategy = researchQuery.get("research_strategy") || "";
  const [researchRef, setResearchRef] = useState<any>(null);
  const [researchError, setResearchError] = useState("");
  useEffect(() => {
    let live = true;
    setResearchRef(null);
    setResearchError("");
    if (researchTopic && researchStrategy)
      researchRead("detail", { topic_id: researchTopic })
        .then((d) => {
          if (!live) return;
          const strategy = (d.strategies || []).find(
            (s: any) =>
              s.strategy_id === researchStrategy && s.can_apply_to_plan,
          );
          if (!strategy) {
            setResearchError("教研策略不存在或暂不可引用");
            return;
          }
          setResearchRef({
            ...strategy,
            topic_id: researchTopic,
            topic_title: d.topic.title,
          });
        })
        .catch((e) => {
          if (live) setResearchError(e.message);
        });
    return () => {
      live = false;
    };
  }, [researchTopic, researchStrategy]);
  useEffect(() => {
    if (props.assistantModel?.teachingDraft) {
      setUserRequire(props.assistantModel.teachingDraft);
      dispatch({
        type: "assistantModel/updateState",
        res: { teachingDraft: null },
      });
      message.success("已带入助手教学草稿，可在个性化诉求中继续编辑");
    }
  }, [props.assistantModel?.teachingDraft]);
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
    form
      .validateFields()
      .then(async (values) => {
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
          study_ctx: [
            selection?.studies_degree,
            selection?.motivation_habit,
            selection?.class_learning_diff,
          ]
            .filter(Boolean)
            .join(" · "),
          // 生成上下文快照（真正生成时复用，避免表单变动）
          gen: {
            ...formValues,
            ...selection,
            type,
            user_require: [
              userRequire,
              // 目标/资源注入统一走 DesignAssetsBar → userRequire（避免双通道重复）
              researchRef
                ? [
                    "引用校本教研策略：" + researchRef.title,
                    researchRef.content,
                    "适用场景：" + (researchRef.applicable_scene || "当前课时"),
                    "依据：" + researchRef.evidence_summary,
                    "来源议题：" + researchRef.topic_title,
                  ].join("\n")
                : "",
            ]
              .filter(Boolean)
              .join("\n\n"),
            research_reference: researchRef,
            org_id: getOrgId(),
            file_ids: fileList.map((item: any) => item.id),
            teach_guide: "",
            title: selection?.chapter_name,
          },
        };
        setGuideOpen(true);
      })
      .catch((error) => {
        // Form validation already marks invalid fields; do not leak a rejected promise.
        if (!error?.errorFields) message.error("生成准备失败，请重试");
      });
  };

  // 真正生成：guidance 为 D1 引导产物（跳过时为 null）
  const doGenerate = async (guidance: any) => {
    setGuideOpen(false);
    const data = { ...guideCtxRef.current.gen };
    const importedClasses = data.imported_class_profiles || [];
    data.user_require = [
      data.user_require,
      classLearningContext(importedClasses),
    ]
      .filter(Boolean)
      .join("\n\n");
    if (guidance) data.guidance = guidance;
    if (data.research_reference) {
      try {
        await researchWrite("reference", {
          topic_id: data.research_reference.topic_id,
          strategy_id: data.research_reference.strategy_id,
        });
      } catch (error: any) {
        message.warning("教研引用记录暂未同步：" + error.message);
      }
    }
    await dispatch({
      type: "teachDesginModel/setData",
      payload: { planParams: { ...data } },
    });
    if (data.type == 1) {
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
            aria-label="历史记录"
            onClick={() => setDvaVal({ collapse: false })}
          >
            历史记录
          </Button>
        ) : (
          // </Tracker>
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
              {/* 教学反思：批改证据 → 反思 → 教研/反哺教案（反思链入口） */}
              <div
                className="type-item type-item--reflect"
                onClick={() => history.push("/design/reflection")}
              >
                <ReadOutlined className="reflection-icon" />
                教学反思
              </div>
            </div>
            {/* 设计资产条：教学目标/教学资源两个抽屉入口 + 注入按钮（勾选后注入随生成带入） */}
            <DesignAssetsBar
              stage={stage}
              onInject={(text) => {
                  const previous = injectedTextRef.current;
                  setUserRequire((current) =>
                    previous && current.includes(previous)
                      ? current.replace(previous, text)
                      : [current, text].filter(Boolean).join("\n\n"),
                  );
                  injectedTextRef.current = text;
                  requestRef.current?.focus({ cursor: "end" });
                  requestRef.current?.resizableTextArea?.textArea?.scrollIntoView(
                    { block: "nearest", behavior: "smooth" },
                  );
                }}
            />
            <Drawer
              width={600}
              open={open}
              onClose={() => setOpen(false)}
              className="design-drawer"
              closable={{ placement: "end" }}
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
                )}
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
              <AttachList fileList={fileList} fileDelete={fileDelete} />
              {researchRef && (
                <Alert
                  showIcon
                  type="info"
                  style={{ margin: "12px 0" }}
                  message={"已引用教研策略：" + researchRef.title}
                  description={researchRef.content}
                  closable
                  onClose={() => {
                    setResearchRef(null);
                    replacePageQuery({
                      research_topic: null,
                      research_strategy: null,
                    });
                  }}
                />
              )}
              {researchError && (
                <Alert type="warning" message={researchError} />
              )}
              <TextArea
                ref={requestRef}
                id="design-requirements"
                aria-label="个性化诉求"
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
                  aria-label="上传参考材料"
                  title="上传参考材料"
                  color="default"
                  variant="text"
                  disabled={fileList?.length >= 10}
                  icon={<ZYIcon type="upload-file" size={20} />}
                  onClick={() => {
                    uploadFileRef.current?.onUploadOpen();
                  }}
                />
                <Button
                  aria-label="生成教案"
                  title="生成教案"
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
              {/* v2.0 调整：班级学情预览移到输入卡下方独立展示（参考设计稿） */}
              <InjectPreview />
              {props.teachDesginModel.importClassOpen && (
                <ImportClassDialog
                  imported={props.teachDesginModel.importedClasses || []}
                  subject={stage?.[1]}
                  onClose={() => setDvaVal({ importClassOpen: false })}
                  onConfirm={(classes) => {
                    setDvaVal({
                      importedClasses: classes,
                      importClassOpen: false,
                    });
                    replacePageQuery({
                      class_id: classes[0].class_id,
                      from: "analysis",
                    });
                    message.success(`已导入 ${classes.length} 个班级的学情`);
                  }}
                />
              )}
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
  assistantModel: state.assistantModel,
}))(TeachDesign);
