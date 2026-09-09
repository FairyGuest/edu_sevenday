import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector, history, connect } from "@umijs/max";
import { Button, Splitter, Modal, Affix, message, Tooltip } from "antd";
import _ from 'lodash';
import HourHeader from "./components/HourHeader";
import DesignChat from "./components/DesignChat";
import CreateRight from "./components/CreateRight";
import StudyPlan from "./components/CreateRight/StudyPlan";
import GuideDrawer from './components/AnswerStep/GuideDrawer'
import { sseRequset, str2json, deepCopy, stopSSE } from "@/utils";
// import { cogUrl } from "@/utils/host";
import { cogUrl } from "./services";

import "./Hour.less";

const Hour = (props: any) => {
  const dispatch = useDispatch();
  const rightRef = useRef<any>(null); // 右侧组件
  const leftRef = useRef<any>(null); // 右侧组件
  const rightPanelRef = useRef(null);
  const leftPanelRef = useRef(null);
  // const affixContainerRef = useRef(null); // Affix 外壳
  const { teachDesginModel } = props;
  const { planSseLoading } = teachDesginModel;
  const params = useSelector((state: any) => state.teachDesginModel.planParams);

  let gMarkdownStart = ""; // 缓存 stream 输出

  let gChatList: any = []; // 当前问答历史

  const [chatList, setChatList] = useState<any[]>([
    { role: "user", content: "" },
    { role: "assistant", content: "" },
  ]); // 课时聊天列表

  const [planChatList, setPlanChatList] = useState<any[]>([
    { role: "user", content: "" },
    { role: "assistant", content: "" },
  ]); // 学案聊天列表

  const timerIdRef = useRef<any | null>(null);

  const [detailData, setDetailData] = useState<any>({ status: 0 }); // 详情数据中 status = Column(SmallInteger, comment="生成状态:0生成中,1已生成,2生成失败")

  const [hiddenRight, setHiddenRight] = useState(false); // 隐藏右侧组件

  const [fileList, setFileList] = useState<any[]>([]); // 上传的文件列表

  const [planDetailData, setPlanDetailData] = useState<any>({})

  const [planDetail, setPlanDetail] = useState<any>({})

  const [step, setStep] = useState(1); // 当前步骤  1: 课时教案 2: 学案

  const [hourStatus, setHourStatus] = useState('') //课时 loading 进行中   finish 完成

  const [planStatus, setPlanStatus] = useState('') //学案 loading 进行中   finish 完成

  const [showMore, setShowMore] = useState(false)  // 右侧是否展示更多...

  const [inputValue, setInputValue] = useState('')  // 输入内容

  const [againEvaluation, setAgainEvaluation] = useState(false)

  const [leftWidth, setLeftWidth] = useState(600) // 左侧宽度

  const [sizes, setSizes] = useState([600, "auto"]); // 分割器大小

  const [leftChatStatus, setLeftChatStatus] = useState('')  // 左侧对话流的状态

  const [evaluateLoading, setEvaluateLoading] = useState(0) // 评估loading

  const [guideInView, setGuideInView] = useState(false)  // 课标对齐指南Icon是否展示

  // let maxRightWidth = 850;

  useEffect(() => {
    return () => {
      clearTimeout(timerIdRef?.current);
      clearInterval(timerIdRef?.current);
    };
  }, [params?.id]);

  useEffect(() => {
    const panel = rightPanelRef.current;
    if (!panel) return;

    // 监听面板大小变化（窗口缩放 + 拖拽分割条 都能监听到）
    const ro = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      {/* is_new_evaluate = Column(SmallInteger, default=0, comment="评估状态, 0重新生成，1生成中，2完成") */ }
      {/* evaluate_score = Column(SmallInteger, default=0, comment="评估分数") */ }

      // 保存编辑隐藏的数值
      if (detailData?.is_new_evaluate == 1 && detailData?.evaluate_score && width < 650) {
        console.log(4)
        setShowMore(true)
      } else if (detailData?.is_new_evaluate == 1 && !detailData?.evaluate_score && width < 500) {
        console.log(3)
        setShowMore(true)
      }
      else if (!detailData?.is_new_evaluate && detailData?.evaluate_score && width < 650) {
        console.log(1)
        setShowMore(true)
      } else {
        console.log(6)
        setShowMore(false)
      }

      // 保存、编辑 未隐藏的数值
      // if (!detailData?.is_new_evaluate && detailData?.evaluate_score && width < 850) {
      //   console.log(1)
      //   setShowMore(true)
      // } else if (!detailData?.is_new_evaluate && !detailData?.evaluate_score && width < 650) {
      //   console.log(2)
      //   setShowMore(true)
      // } else if (detailData?.is_new_evaluate == 1 && !detailData?.evaluate_score && width < 680) {
      //   console.log(3)
      //   setShowMore(true)
      // } else if (detailData?.is_new_evaluate == 1 && detailData?.evaluate_score && width < 850) {
      //   console.log(4)
      //   setShowMore(true)
      // } else if (detailData?.is_new_evaluate == 2 && width < 650) {
      //   console.log(5)
      //   setShowMore(true)
      // } else {
      //   console.log(6)
      //   setShowMore(false)
      // }
    });

    ro.observe(panel);

    return () => ro.disconnect();
  }, [hiddenRight, detailData?.is_new_evaluate]);


  // 路由跳转拦截处理器
  useEffect(() => {
    const blocker = history.block((tx) => {
      if (planSseLoading) {
        Modal.confirm({
          className: "stop-modal",
          title: "确定离开该页面？",
          content: "离开该页面会导致内容停止生成",
          okText: '离开，停止生成',
          cancelText: '继续生成',
          okButtonProps: {
            style: {
              backgroundColor: '#EF4444', // 红色
              color: '#fff',
            },
          },
          onOk: () => {
            stopSSE();
            dispatch({
              type: "teachDesginModel/setData",
              payload: { planSseLoading: false },
            });
            blocker();
            tx.retry();
          },
        });
      } else {
        blocker();
        tx.retry();
      }
    });

    // 组件卸载时清理拦截器
    return () => blocker();
  }, [planSseLoading]);


  //刷新后返回教案首页
  useEffect(() => {
    if (!params?.type) {
      history.push("/design");
    }
  }, [params])

  useEffect(() => {
    if (step == 1) {
      if (!planSseLoading) {
        setHourStatus('finish')
      } else {
        setHourStatus('loading')
      }
    }
    if (step == 2) {
      if (!planSseLoading) {
        setPlanStatus('finish')
      } else {
        setPlanStatus('loading')
      }
    }
  }, [planSseLoading])

  useEffect(() => {
    if (planSseLoading) return;
    if (step == 1) {
      if (params?.id) {
        getDetail();
      } else {
        onChatClick?.(params);
        getTeachChatListData(params, 1);
      }
    }
  }, [params?.id]);

  // 获取课时详情（课时）
  const getDetail = async () => {
    if (!params?.id) return
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getPlanDetailUrl",
      payload: { id: params.id },
    });
    if (code === 200) {
      console.log('课时详情', data)
      setChatList(data?.chat_history || []);
      setDetailData({ ...data });

      getPlanInfoFn?.(data?.id)
      postTempStudyPlanChatFn?.(data?.id)
      // is_new_evaluate = Column(SmallInteger, default=0, comment="评估状态, 0重新生成，1生成中，2完成")
      if (data?.is_new_evaluate == 1) {
        setEvaluateLoading(evaluateLoading + 1)
        getDetailData()
      }
    }
  };

  // 评估
  const postTeachPlanEvaluateFn = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postTeachPlanEvaluate",
      payload: {
        id: detailData?.id
      },
    });
    if (code === 200) {
      message.success(data?.message)
      getDetailData()
    }
  };

  // 获取课时详情（课时\10s一次获取再次评估状态）
  const getDetailData = async () => {
    if (!params?.id) return
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getPlanDetailUrl",
      payload: { id: params.id },
    });
    if (code === 200) {
      if (data?.is_new_evaluate == 1) {
        setDetailData({
          ...detailData,
          is_new_evaluate: 1
        })
        timerIdRef.current = setTimeout(() => {
          getDetailData?.()
        }, 10000);
      } else {
        message.success('评估报告已生成完毕')
        setDetailData({
          ...detailData,
          evaluate_score: data?.evaluate_score,
          is_new_evaluate: data?.is_new_evaluate
        })
        setEvaluateLoading(0)
      }
    }
  };

  // 获取课时聊天列表（课时）
  const getTeachChatListData = async (val: any, type = 1) => {
    if (!val || JSON.stringify(val) === '{}') return
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postTeachChatUrl",
      payload: val,
    });
    if (code === 200) {
      console.log('课时无详情', data)

      gChatList = [...data, {
        role: "assistant", content: {
          end: {
            chat_content: '',
          }
        },
        content_type: 'md'
      }]

      // setChatList([...chatList, { role: "assistant", content: {
      //   end:{
      //     chat_content:''
      //   }
      // }}])

      setChatList(data);

      if (type == 2) {
        // 获取用于意向 左/右

        let file_ids = fileList?.map((item: any) => {
          return item?.id
        })

        // 是否是定稿确定是左侧还是右侧流式输出
        if (val?.is_final_version != 1) {
          console.log('左')
          onChatClickLeft?.({ ...params, user_require: inputValue, file_ids })
          setInputValue('')
        } else {
          console.log('右')
          onChatClick?.({ ...params, user_require: inputValue, file_ids })
          setInputValue('')
        }
        setFileList([])
        // const { code, data }: any = await dispatch({
        //   type: "teachDesginModel/postData",
        //   apiUrl: "postUserIntentRecognition",
        //   payload: {
        //     user_require: inputValue
        //   },
        // });
        // if (code === 200) {
        //   let file_ids = fileList?.map((item: any) => {
        //     return item?.id
        //   })

        //   if (data?.is_chat) {
        //     console.log('左')
        //     onChatClickLeft?.({ ...params, user_require: inputValue, file_ids })
        //     setInputValue('')
        //   } else {
        //     console.log('右')
        //     onChatClick?.({ ...params, user_require: inputValue, file_ids })
        //     setInputValue('')
        //   }
        //   setFileList([])
        // }
      }
    }
  };

  // 获取学案聊天列表（学案）
  const postTempStudyPlanChatFn = async (planId: any) => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postTempStudyPlanChat",
      payload: {
        plan_id: planId
      },
    });
    if (code === 200) {
      console.log('获取学案对话列表', data);
      setPlanChatList(data);
    }
  };

  // 通过教案获取学案（学案）
  const getPlanInfoFn = async (planId: any) => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postStudyPlanGenerateInfo",
      payload: {
        plan_id: planId
      },
    });
    if (code === 200) {
      console.log('课时课时课时', data);
      if (data?.length > 0) {
        setPlanDetail(data?.[0])
        if (data?.[0]?.study_plan_id) {
          getPlanDetailFn(data?.[0]?.study_plan_id)
        }
      }
    }
  };

  // 获取学案详情（学案）
  const getPlanDetailFn = async (studyPlanId: any) => {
    if (!params?.id) return
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getStudyPlanHistory",
      payload: { id: studyPlanId },
    });
    if (code === 200) {
      console.log('学案', data);
      setPlanChatList(data?.chat_history || []);
      setPlanDetailData({ ...data, status: 1 });
    }
  };

  //生成学案
  const createPlanFn = () => {
    setStep(2)

    let id = null

    if (planDetail?.has_study_plan) {
      id = planDetail?.study_plan_id
    }

    setPlanDetailData?.({
      status: 0
    })

    const payload = {
      sseUrl: `${cogUrl}/teach_plan/single_study_plan_maker`,
      plan_id: detailData?.id,
      id
    };

    sseRequset(payload, (res: any) => rightRef.current?.handleData(res));
  }

  // 拖拽过程实时触发
  const handleResize = (sizes: any) => {
    setSizes(sizes)
    setLeftWidth(sizes[0])

    // if (sizes[1] < maxRightWidth) {
    //   setShowMore(true)
    // } else {
    //   setShowMore(false)
    // }
  };

  // 课时聊天发送（右侧）
  const onChatClick = async (value: any) => {
    const payload = {
      sseUrl: `${cogUrl}/teach_plan/teach_maker`,
      ...value,
    };

    sseRequset(payload, (res: any) => rightRef.current?.handleData(res));
  };


  // // 拖拽结束触发（最终尺寸）
  // const handleResizeEnd = (sizes: any) => {
  //   // setRightSize(sizes[1]);
  //   console.log('右侧最终宽度：', sizes[1]);
  // };


  // 左侧对话发送
  const onChatClickLeft = (value: any) => {
    const payload = {
      sseUrl: `${cogUrl}/teach_plan/teach_maker`,
      ...value,
    };

    sseRequset(payload, (res: any) => {
      updChatSSE?.(res)
      // leftRef.current?.handleData(res)
    });
  }

  const updChatSSE = async (val: any) => {

    const content = str2json(val.data);
    const { __action, data, thinking, id } = content;

    setLeftChatStatus(__action)

    if (__action == "start") {
      gChatList[gChatList.length - 1]["content"]['end']['status'] = 'thinking';
      const tempChatList = deepCopy([...gChatList]);
      setChatList(tempChatList);
      dispatch({
        type: "teachDesginModel/setData",
        payload: { planSseLoading: true },
      });
      return;
    }

    if (__action == "end") {
      gMarkdownStart = ''
      gChatList[gChatList.length - 1]["content"]['end']['status'] = 'success';
      getDetail();
      dispatch({
        type: "teachDesginModel/setData",
        payload: { planSseLoading: false },
      });
      const tempChatList = deepCopy([...gChatList]);
      setChatList(tempChatList);
    }

    if (__action == "error") {
      gChatList[gChatList.length - 1]["content"]["end"]["status"] = "error";
      // gChatList[gChatList.length - 1]["content"]['end']['chat_content'] = '生成失败';
      gMarkdownStart = ''
      dispatch({
        type: "teachDesginModel/setData",
        payload: { planSseLoading: false },
      });
      const tempChatList = deepCopy([...gChatList]);
      setChatList(tempChatList);
    }

    if (__action == "chat") {
      if (thinking) {
        gChatList[gChatList.length - 1]["content"]['end']['status'] = 'thinking';
        return
      }
      gChatList[gChatList.length - 1]["content"]['end']['status'] = 'loading';

      const mergeMarkdown = [gMarkdownStart, data].join("");

      gChatList[gChatList.length - 1]["content"]['end']['chat_content'] = mergeMarkdown;


      const tempChatList = deepCopy([...gChatList]);

      setChatList(tempChatList);

      gMarkdownStart = mergeMarkdown;
    }
  };




  const onPublishClick = async () => {
    // evaluateLoading  != 0 时，不能点击发布
    if (detailData?.is_new_evaluate == 1) {
      message.warning("教案评估中，请稍后");
      return;
    } else if (planSseLoading) {
      message.warning("内容生成中，请稍后");
      return
    } else if (!inputValue.trim()) {
      message.warning("请输入有效内容");
      return;
    }

    let file_ids = fileList?.map((item: any) => {
      return item?.id
    })

    getTeachChatListData({
      ...params,
      user_require: inputValue,
      file_ids
    }, 2)
  }

  // 确认定稿
  const finalize = () => {

    if (chatList?.length < 4) {
      message.error('教案已生成，如需重新生成，请输入最新的问题与建议。')
      return
    }

    if (detailData?.is_new_evaluate == 1) {
      message.warning("教案评估中，请稍后");
      return;
    }

    rightRef.current?.handleReset?.()

    setAgainEvaluation(true)

    setDetailData({ ...detailData, status: 0, title: '' });

    onChatClick?.({
      ...params,
      user_require: '生成定稿',
      is_final_version: 1,
      file_ids: []
    })

    getTeachChatListData({
      ...params,
      user_require: '生成定稿',
      is_final_version: 1,
      file_ids: []
    }, 1)

    setInputValue('')
  }

  // 全览收起  关闭左侧 （右侧全屏）
  const onPreviewRightClick = () => {
    if (!hiddenRight) {
      const collapseBtn = document.querySelector(
        '.ant-splitter-bar-collapse-bar-start'
      ) as HTMLElement;
      collapseBtn?.click();
    } else {
      const collapseBtn = document.querySelector(
        '.ant-splitter-bar-collapse-bar-end'
      ) as HTMLElement;
      collapseBtn?.click();
    }
    setHiddenRight(!hiddenRight)
  };

  // 关闭右侧 （左侧全屏）
  const onPreviewLeftClick = () => {
    const collapseBtn = document.querySelector(
      '.ant-splitter-bar-collapse-bar-end'
    ) as HTMLElement;
    collapseBtn?.click();
    if (hiddenRight) {
      setHiddenRight(!hiddenRight)
      setTimeout(() => {
        collapseBtn?.click();
      }, 100);
    }
  };

  return (
    <div className="hour-design drawer-element">

      <Splitter
        onResize={handleResize}
      // onResizeEnd={handleResizeEnd}
       layout={typeof window !== "undefined" && window.innerWidth <= 900 ? "vertical" : "horizontal"}>
        {<Splitter.Panel
          className="hour-design-left"
          defaultSize={typeof window !== "undefined" && window.innerWidth <= 900 ? "50%" : 600}
          min={typeof window !== "undefined" && window.innerWidth <= 900 ? "20%" : 434}
          // collapsible
          collapsible={{ start: true, end: true, showCollapsibleIcon: false }}
        >
          <div ref={leftPanelRef}></div>
          <HourHeader
            setStep={setStep}
            step={step}
            hourStatus={hourStatus}
            planStatus={planStatus}
            planDetail={planDetail}
            refreshContent={() => { getDetail() }}
            setPlanStatus={setPlanStatus}
            sizes={sizes}
          />
          {step == 1 && <DesignChat
            onRef={leftRef}
            chatList={chatList}
            setChatList={setChatList}
            fileList={fileList}
            setFileList={setFileList}
            type={1}
            step={step}
            setInputValue={setInputValue}
            onPublishClick={onPublishClick}
            inputValue={inputValue}
            finalize={finalize}
            leftWidth={leftWidth}
            leftChatStatus={leftChatStatus}
            planDetail={planDetail}
            detailData={detailData}
            // guideInView={guideInView}
            setGuideInView={setGuideInView}
            refreshFn={() => {
              console.log('重新生成')
              rightRef.current?.handleReset?.()
              onChatClick?.(params)
              getDetail()
            }}
          />}
          {step == 2 && <DesignChat
            detailData={planDetailData}
            chatList={planChatList}
            setChatList={setPlanChatList}
            fileList={fileList}
            setFileList={setFileList}
            type={2}
          />}
        </Splitter.Panel>}
        <Splitter.Panel
          className="hour-design-right"
          collapsible={{ start: true, end: true, showCollapsibleIcon: false }}
          min={typeof window !== "undefined" && window.innerWidth <= 900 ? "20%" : 560}
        >
          <div ref={rightPanelRef}>
          </div>
          {!guideInView && step === 1 && (
            <Tooltip placement="right" title={"课标对齐指南"}>
              <GuideDrawer content={
                detailData?.teach_guide ||
                chatList[1]?.content?.teach_guide?.content || ""
              } />
            </Tooltip>
          )}
          {step == 1 && <CreateRight
            onRef={rightRef}
            detailData={detailData}
            planDetail={planDetail}
            refreshContent={() => { getDetail() }}
            hiddenRight={hiddenRight}
            setHiddenRight={setHiddenRight}
            createPlan={createPlanFn}
            showMore={showMore}
            againEvaluation={againEvaluation}
            setStep={setStep}
            step={step}
            evaluateLoading={evaluateLoading}
            setEvaluateLoading={setEvaluateLoading}
            guideInView={guideInView}
            postTeachPlanEvaluateFn={postTeachPlanEvaluateFn}
            onPreviewRightClick={onPreviewRightClick}
            onPreviewLeftClick={onPreviewLeftClick}
          />}
          {step == 2 && <StudyPlan
            onRef={rightRef}
            detailData={planDetailData}
            refreshContent={() => { getPlanInfoFn?.(detailData?.id) }}
            hiddenRight={hiddenRight}
            setHiddenRight={setHiddenRight}
            leftWidth={leftWidth}
            showMore={showMore}
            onPreviewLeftClick={onPreviewLeftClick}
          />}

        </Splitter.Panel>
      </Splitter>
    </div>
  );
};

export default connect((state: any) => ({
  teachDesginModel: state.teachDesginModel,
}))(Hour);
