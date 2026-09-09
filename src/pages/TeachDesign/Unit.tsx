import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector, history } from "@umijs/max";
import { Modal, Splitter, Tooltip, message } from "antd";
import UnitHeader from "./components/UnitHeader";
import UnitChat from "./components/UnitChat";
import UnitRight from "./components/UnitRight";
import ClassRight from "./components/UnitRight/ClassRight";
import StudyRight from "./components/UnitRight/StudyRight";
import GuideDrawer from "./components/AnswerStep/GuideDrawer";
import { sseRequset, getOrgId, str2json, deepCopy, stopSSE, uuid } from "@/utils";
// import { cogUrl } from "@/utils/host";
import { cogUrl } from "./services";

import "./Unit.less";

let mdDataStr: string = ""; // 缓存流式数据
let gChatList: any = []; // 缓存聊天列表

const Unit = () => {
  const dispatch = useDispatch();
  const rightRef = useRef<any>(null); // 右侧组件ref
  const unitTimerRef = useRef<any>(null); // 单元轮询定时器
  const classTimerRef = useRef<any>(null); // 课时轮询定时器
  const unitRightRef = useRef<any>(null); // 单元右侧组件ref
  const classRightRef = useRef<any>(null); // 课时右侧组件ref
  const studyRightRef = useRef<any>(null); // 学案右侧组件ref

  const {
    planParams,
    planSseLoading, // 教案加载
    childPlanLoading, // 子教案加载
    studyPlanLoading, // 学案加载
    leftChatLoading, // 左侧聊天加载
  } = useSelector((state: any) => state.teachDesginModel);
  const [messageApi, contextHolder] = message.useMessage();
  const [sizes, setSizes] = useState([600, "auto"]); // 分割器大小
  const [rightWidth, setRightWidth] = useState(600); // 右侧宽度
  const [step, setStep] = useState(1); // 当前步骤  1: 单元教案 2: 课时教案 3: 学案
  const [unitChatList, setUnitChatList] = useState<any[]>([]); // 单元聊天列表
  const [unitDetailData, setUnitDetailData] = useState<any>({}); // 单元详情数据
  const [teachPlan, setTeachPlan] = useState([]); // 课时教案列表
  const [currClass, setCurrClass] = useState<any>({}); // 当前课时数据
  const [classChatList, setClassChatList] = useState<any[]>([]); // 课时聊天列表
  const [classDetailData, setClassDetailData] = useState<any>({}); // 课时详情数据
  const [studyPlan, setStudyPlan] = useState([]); // 学案列表
  const [currStudy, setCurrStudy] = useState<any>({}); // 当前学案数据
  const [studyChatList, setStudyChatList] = useState<any[]>([]); // 学案聊天列表
  const [studyDetailData, setStudyDetailData] = useState<any>({}); // 学案详情数据
  const [courseList, setCourseList] = useState<any>([]); // 课程列表
  const [fileList, setFileList] = useState<any>([]); // 文件列表
  const [inputValue, setInputValue] = useState(""); // 输入框值
  const [fullScreen, setFullScreen] = useState(false); // 右侧抽屉是否全屏
  const [isInView, setIsInView] = useState(false); // 是否在视图中

  // 生成中跳转阻止
  useEffect(() => {
    // 阻止跳转的函数
    const unblock = history.block((tx: any) => {
      if (planSseLoading || childPlanLoading || studyPlanLoading || leftChatLoading) {
        Modal.confirm({
          className: "stop-modal",
          title: "确定离开该页面?",
          content: "离开该页面会导致内容停止生成",
          okText: "离开，停止生成",
          cancelText: "继续生成",
          okButtonProps: { style: { backgroundColor: "#ef4444" } },
          onOk: () => {
            unblock(); // 解除阻止
            stopSSE(); // 停止SSE
            dispatch({
              type: "teachDesginModel/setData",
              payload: {
                planSseLoading: false, // 教案加载
                childPlanLoading: false, // 子教案加载
                studyPlanLoading: false, // 学案加载
                leftChatLoading: false, // 左侧聊天加载
              },
            });
            tx.retry(); // 继续跳转
          },
          onCancel: () => {},
        });
      } else {
        unblock(); // 解除阻止
        tx.retry(); // 继续跳转
      }
    });

    return () => unblock(); // 组件卸载时清理
  }, [planSseLoading, childPlanLoading, studyPlanLoading, leftChatLoading]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      clearInterval(unitTimerRef.current);
      clearInterval(classTimerRef.current);
    };
  }, []);
  // 监听右侧宽度变化
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;
        setRightWidth(newWidth + 4);
      }
    });
    if (rightRef.current) {
      resizeObserver.observe(rightRef.current);
    }

    return () => {
      if (rightRef.current) {
        resizeObserver.unobserve(rightRef.current);
      }
    }
  }, [rightRef]);

  // 单元教案
  useEffect(() => {
    if (planSseLoading) return;
    if (planParams?.id) {
      getTeachPlan();
      getStudyPlan();
      getUnitDetail();
    } else if (!planParams?.doc_id) {
      history.push(`/design`);
    } else {
      unitMakerClick(planParams);
      getUnitChatList(planParams);
    }
    // if (planParams?.doc_id) {
    //   getCourseList();
    // }
  }, [planParams]);

  // 课时教案
  useEffect(() => {
    if (step !== 2) return;
    if (currClass?.has_plan) {
      getClassDetail();
    } else {
      classMakerClick(currClass);
      getClassChatList(currClass);
    }
  }, [step, currClass]);

  // 学案
  useEffect(() => {
    if (step !== 3) return;
    if (currStudy?.study_plan_id) {
      getStudyDetail();
    } else {
      studyMakerClick();
      getStudyChatList();
    }
  }, [step, currStudy]);

  useEffect(() => {
    if (step === 1) {
      setCurrClass({});
      setClassChatList([]);
      setClassDetailData({});
      setCurrStudy({});
      setStudyChatList([]);
      setStudyDetailData({});
    } else if (step === 2) {
      setCurrStudy({});
      setStudyChatList([]);
      setStudyDetailData({});
    }
  }, [step]);

  // 获取头部教案列表
  const getTeachPlan = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getUnitClassUrl",
      payload: { id: planParams.id },
    });
    if (code === 200) {
      setTeachPlan(data || []);
    }
  };

  // 获取头部学案列表
  const getStudyPlan = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postStudyPlanGenerateInfo",
      payload: { plan_id: planParams.id },
    });
    if (code === 200) {
      setStudyPlan(data || []);
    }
  };
  // 获取课程列表
  const getCourseList = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getCoursePlanInfo",
      payload: {
        doc_id: planParams?.doc_id,
        org_id: getOrgId(),
      },
    });
    if (code === 200) {
      setCourseList(data);
    }
  };
  // 获取单元详情
  const getUnitDetail = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getPlanDetailUrl",
      payload: { id: planParams.id },
    });
    if (code === 200) {
      setUnitChatList(data?.chat_history || []);
      setUnitDetailData(data);
      // 先清除定时器
      clearInterval(unitTimerRef.current);
      if (data?.is_new_evaluate == 1) {
        unitPolling();
      }
    }
  };
  // 单元轮询查询-10s
  const unitPolling = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getPlanDetailUrl",
      payload: { id: planParams.id },
    });
    if (code === 200) {
      if (data?.is_new_evaluate == 1) {
        unitTimerRef.current = setTimeout(() => {
          unitPolling();
        }, 10000);
      } else {
        message.success("评估报告已生成完毕");
        setUnitDetailData(data);
      }
    }
  };
  // 获取单元聊天列表
  const getUnitChatList = async (params: any, type?: string) => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postTeachChatUrl",
      payload: params,
    });
    if (code === 200) {
      setUnitChatList(data || []);
      if (type === "chat") {
        gChatList = [
          ...data,
          {
            id: uuid(),
            role: "assistant",
            content_type: "md",
            content: {
              end: {
                chat_content: "",
              },
            },
          },
        ];
      }
    }
  };
  // 单元生成发送
  const unitMakerClick = async (params: any) => {
    const payload = {
      sseUrl: `${cogUrl}/teach_plan/teach_maker`,
      ...params,
    };
    setUnitDetailData({
      id: unitDetailData?.id,
      evaluate_score: unitDetailData?.evaluate_score,
      status: 0,
    }); // 保留评估分数、生成状态
    unitRightRef.current?.handleReset();
    sseRequset(payload, (res: any) => unitRightRef.current?.handleData(res));
  };

  // 获取课时详情
  const getClassDetail = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getUnitPlanUrl",
      payload: { id: currClass?.id },
    });
    if (code === 200) {
      setClassChatList(data?.chat_history || []);
      setClassDetailData(data);
      // 先清除定时器
      clearInterval(classTimerRef.current);
      if (data?.is_new_evaluate == 1) {
        classPolling();
      }
    }
  };
  // 课时轮询查询-10s
  const classPolling = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getUnitPlanUrl",
      payload: { id: currClass?.id },
    });
    if (code === 200) {
      if (data?.is_new_evaluate == 1) {
        classTimerRef.current = setTimeout(() => {
          classPolling();
        }, 10000);
      } else {
        message.success("评估报告已生成完毕");
        setClassDetailData(data);
      }
    }
  };
  // 获取课时聊天列表
  const getClassChatList = async (params: any, type?: string) => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postTempChildPlan",
      payload: params,
    });
    if (code === 200) {
      setClassChatList(data || []);
      if (type === "chat") {
        gChatList = [
          ...data,
          {
            id: uuid(),
            role: "assistant",
            content_type: "md",
            content: {
              end: {
                chat_content: "",
              },
            },
          },
        ];
      }
    }
  };
  // 课时生成发送
  const classMakerClick = async (params: any) => {
    const payload = {
      sseUrl: `${cogUrl}/teach_plan/single_teach_maker`,
      ...params,
    };
    setClassDetailData({
      id: classDetailData?.id,
      evaluate_score: classDetailData?.evaluate_score,
      status: 0,
    }); // 保留评估分数、生成状态
    classRightRef.current?.handleReset();
    sseRequset(payload, (res: any) => classRightRef.current?.handleData(res));
  };
  // 获取学案详情
  const getStudyDetail = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getStudyPlanHistory",
      payload: { id: currStudy.study_plan_id },
    });
    if (code === 200) {
      setStudyChatList(data?.chat_history || []);
      // 学案状态：0生成中,1已生成,2生成失败
      setStudyDetailData({ ...data, status: 1 });
    }
  };
  // 获取学案聊天列表
  const getStudyChatList = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postTempStudyPlanChat",
      payload: { plan_id: currStudy?.plan_id },
    });
    if (code === 200) {
      setStudyChatList(data || []);
    }
  };
  // 学案生成发送
  const studyMakerClick = async () => {
    const payload = {
      sseUrl: `${cogUrl}/teach_plan/single_study_plan_maker`,
      plan_id: currStudy?.plan_id,
      id: currStudy?.study_plan_id || null,
    };
    setStudyDetailData({ status: 0 });
    sseRequset(payload, (res: any) => studyRightRef.current?.handleData(res));
  };
  /**
   * 二次对话发送聊天
   * --获取对应聊天列表
   * --根据typeStr判断是否直接教案生成
   * --意图判断-修改对应聊天列表或直接生成教学、案
   * */
  const sendChat = async (typeStr?: string) => {
    await leftChatList(typeStr);
    if (typeStr) {
      rightPlanMaker(typeStr);
    } else {
      leftChatHandle();
      // const { code, data }: any = await dispatch({
      //   type: "teachDesginModel/postData",
      //   apiUrl: "postUserIntentRecognition",
      //   payload: { user_require: inputValue },
      // });
      // if (code === 200) {
      //   setFileList([]);
      //   setInputValue("");
      //   if (data?.is_chat) {
      //     leftChatHandle();
      //   } else {
      //     rightPlanMaker();
      //   }
      // }
    }
  };

  // 左侧聊天列表获取
  const leftChatList = async (typeStr?: string) => {
    const file_ids = fileList?.map((item: any) => item?.id);
    const type = typeStr ? "" : "chat";
    if (step === 1) {
      await getUnitChatList({
        ...planParams,
        user_require: typeStr || inputValue,
        file_ids: typeStr ? [] : file_ids,
        is_final_version: typeStr ? 1 : 0,
      }, type);
    } else if (step === 2) {
      await getClassChatList({
        ...currClass,
        user_require: typeStr || inputValue,
        file_ids: typeStr ? [] : file_ids,
        is_final_version: typeStr ? 1 : 0,
      }, type);
    }
  };
  // 左侧聊天处理
  const leftChatHandle = async () => {
    const file_ids = fileList?.map((item: any) => item?.id);
    if (step === 1) {
      const payload = {
        sseUrl: `${cogUrl}/teach_plan/teach_maker`,
        ...planParams,
        user_require: inputValue,
        file_ids,
      };
      sseRequset(payload, (res: any) => updChatSSE(res));
    } else if (step === 2) {
      const payload = {
        sseUrl: `${cogUrl}/teach_plan/single_teach_maker`,
        ...currClass,
        user_require: inputValue,
        file_ids,
      };
      sseRequset(payload, (res: any) => updChatSSE(res));
    }
    // 清空文件列表和输入框
    setFileList([]);
    setInputValue("");
  };

  // 右侧教案生成
  const rightPlanMaker = async (typeStr?: string) => {
    const file_ids = fileList?.map((item: any) => item?.id);
    if (step === 1) {
      unitMakerClick({
        ...planParams,
        user_require: typeStr || inputValue,
        file_ids: typeStr ? [] : file_ids,
        is_final_version: typeStr ? 1 : 0,
      });
    } else if (step === 2) {
      classMakerClick({
        ...currClass,
        user_require: typeStr || inputValue,
        file_ids: typeStr ? [] : file_ids,
        is_final_version: typeStr ? 1 : 0,
      });
    }
  };
  // 更新对话流内容
  const updChatSSE = async (params: any) => {
    const content = str2json(params.data);
    const { __action, data, thinking, id } = content;

    if (__action == "start") {
      gChatList[gChatList.length - 1]["content"]["end"]["status"] = "thinking";
      mdDataStr = "";
      if (step === 1) {
        setUnitChatList(deepCopy(gChatList));
      } else if (step === 2) {
        setClassChatList(deepCopy(gChatList));
      }

      dispatch({
        type: "teachDesginModel/setData",
        payload: { leftChatLoading: true },
      });
      return;
    }
    if (__action == "end") {
      gChatList[gChatList.length - 1]["content"]["end"]["status"] = "success";
      if (step === 1) {
        setUnitChatList(deepCopy(gChatList));
      } else if (step === 2) {
        setClassChatList(deepCopy(gChatList));
      }
      mdDataStr = "";
      gChatList = [];
      dispatch({
        type: "teachDesginModel/setData",
        payload: { leftChatLoading: false },
      });
      if (step === 1) {
        getUnitDetail();
      } else if (step === 2) {
        getClassDetail();
      }
    }
    if (__action == "error") {
      messageApi.error(data);
      gChatList[gChatList.length - 1]["content"]["end"]["status"] = "error";
      // gChatList[gChatList.length - 1]["content"]["end"]["chat_content"] = "生成失败";
      if (step === 1) {
        setUnitChatList(deepCopy(gChatList));
      } else if (step === 2) {
        setClassChatList(deepCopy(gChatList));
      }
      mdDataStr = "";
      gChatList = [];
      dispatch({
        type: "teachDesginModel/setData",
        payload: { leftChatLoading: false },
      });
    }
    if (__action == "chat") {
      if (thinking) {
        gChatList[gChatList.length - 1]["content"]["end"]["status"] = "thinking";
        return;
      }
      gChatList[gChatList.length - 1]["content"]["end"]["status"] = "loading";
      mdDataStr += data;
      gChatList[gChatList.length - 1]["content"]["end"]["chat_content"] = mdDataStr;
      if (step === 1) {
        setUnitChatList(deepCopy(gChatList));
      } else if (step === 2) {
        setClassChatList(deepCopy(gChatList));
      }
    }
  };

  return (
    <div className="unit-design drawer-element">
      <Splitter onResize={setSizes} layout={typeof window !== "undefined" && window.innerWidth <= 900 ? "vertical" : "horizontal"}>
        <Splitter.Panel
          className="unit-design-left"
          defaultSize={typeof window !== "undefined" && window.innerWidth <= 900 ? "50%" : 600}
          min={typeof window !== "undefined" && window.innerWidth <= 900 ? "20%" : 434}
          collapsible
        >
          <UnitHeader
            sizes={sizes}
            step={step}
            setStep={setStep}
            teachPlan={teachPlan}
            studyPlan={studyPlan}
            currClass={currClass}
            currStudy={currStudy}
            setCurrClass={setCurrClass}
            setCurrStudy={setCurrStudy}
          />
          {step === 1 && (
            <UnitChat
              step={step}
              leftWidth={sizes[0]}
              teachPlan={teachPlan}
              chatList={unitChatList}
              detailData={unitDetailData}
              inputValue={inputValue}
              setInputValue={setInputValue}
              fileList={fileList}
              setFileList={setFileList}
              onSend={sendChat}
              setIsInView={setIsInView}
            />
          )}
          {step === 2 && (
            <UnitChat
              step={step}
              leftWidth={sizes[0]}
              chatList={classChatList}
              detailData={classDetailData}
              inputValue={inputValue}
              setInputValue={setInputValue}
              fileList={fileList}
              setFileList={setFileList}
              onSend={sendChat}
            />
          )}
          {step === 3 && (
            <UnitChat
              step={step}
              leftWidth={sizes[0]}
              chatList={studyChatList}
              detailData={studyDetailData}
            />
          )}
        </Splitter.Panel>
        <Splitter.Panel className="unit-design-right" min={typeof window !== "undefined" && window.innerWidth <= 900 ? "20%" : 560} collapsible>
          <div ref={rightRef} style={{ height: "100%" }}>
            {!isInView && step === 1 && (
              <Tooltip placement="right" title={"课标对齐指南"}>
                <GuideDrawer
                  content={
                    unitDetailData?.teach_guide ||
                    unitChatList[1]?.content?.teach_guide?.content || ""
                  }
                />
              </Tooltip>
            )}
            {step === 1 && (
              <UnitRight
                onRef={unitRightRef}
                rightWidth={rightWidth}
                courseList={courseList}
                detailData={unitDetailData}
                teachPlanList={teachPlan}
                setStep={setStep}
                setCurrClass={setCurrClass}
                refreshContent={getUnitDetail}
                fullScreen={fullScreen}
                setFullScreen={setFullScreen}
              />
            )}
            {step === 2 && (
              <ClassRight
                onRef={classRightRef}
                rightWidth={rightWidth}
                courseList={courseList}
                itemData={currClass}
                detailData={classDetailData}
                studyPlanList={studyPlan}
                setStep={setStep}
                currClass={currClass}
                setCurrClass={setCurrClass}
                setCurrStudy={setCurrStudy}
                refreshContent={getClassDetail}
                fullScreen={fullScreen}
                setFullScreen={setFullScreen}
              />
            )}
            {step === 3 && (
              <StudyRight
                onRef={studyRightRef}
                rightWidth={sizes[1]}
                courseList={courseList}
                itemData={currStudy}
                detailData={studyDetailData}
                setCurrStudy={setCurrStudy}
                fullScreen={fullScreen}
                setFullScreen={setFullScreen}
              />
            )}
          </div>
        </Splitter.Panel>
      </Splitter>
      {contextHolder}
    </div>
  );
};

export default Unit;
