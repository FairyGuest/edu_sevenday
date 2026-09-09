import { useEffect, useRef, useState } from "react";
import { useDispatch, useLocation } from "@umijs/max";
import { Affix, Switch, Spin, Tooltip } from "antd";
import DraggableListNode from "./DraggableListNode";
import { ZYIcon } from "@/components";
import CourseChat from "@/pages/TeachSource/components/CourseChat";
import {
  selectOptionsData,
  single_choice_list,
  multiple_choice_list,
  fill_in_the_blank_list,
  short_answer_list,
  true_false_list,
} from "@/global";

import "./index.less";

const App = (props: any) => {
  const dispatch = useDispatch();

  const { search, state: queryState } = useLocation();
  const searchParams = new URLSearchParams(search);
  const segValue = searchParams.get("type");
  const quesRef = useRef<any>(null);
  const scrollableDivRef = useRef<any>(null);
  const exam_id = searchParams.get("exam_id") || props?.exam_id;
  const [selectOptions, setSelectOptions] = useState(selectOptionsData);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [paperName, setPaperName] = useState("");
  const [fullScreen, setFullScreen] = useState(false);
  const [isOpenAI, setIsOpenAI] = useState(false);

  useEffect(() => {
    getRecordRowExams(exam_id);
  }, [exam_id]);

  useEffect(() => {
    const handleEsc = () => {
      if (!document.fullscreenElement) {
        setFullScreen(false);
        setIsOpenAI(false);
      }
    };
    // 添加事件监听器
    document.addEventListener("fullscreenchange", handleEsc);
    return () => document.removeEventListener("fullscreenchange", handleEsc);
  }, []);
  const getRecordRowExams = async (id: any) => {
    let { code, data }:any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "getExamsQuestionsList",
      payload: {
        id,
      },
    });
    if (code === 200) {
      let questions_list = [];
      setPaperName(data?.title);

      if (data?.questions?.length > 0) {
        questions_list = dealwithQuestionList(
          data?.questions,
          data?.info,
          data?.question_rules,
        );
        setQuestions(questions_list);
      }
    }
  };

  const dealwithQuestionList = (list: any, info: any, rules: any) => {
    return list?.map((item: any) => {
      return {
        ...item,
        info,
        question_rules: rules,
        optionsList:
          item?.options?.length > 0 &&
          item?.options?.map((val: any, key: any) => {
            return {
              label: selectOptions[key],
              content: val,
            };
          }),
        answer: getAnswer(item),
        type: rules?.find((k: any) => {
          return k?.en_name === item?.question_type;
        })?.name,
      };
    });
  };

  //处理答案数据
  const getAnswer = (item: any) => {
    // 单选
    if (single_choice_list.includes(item?.question_type)) {
      return selectOptions[
        item?.options?.findIndex((val: any) => {
          return val === item?.correct_answers[0];
        })
      ];
    }
    // 多选
    if (multiple_choice_list.includes(item?.question_type)) {
      let flag_string = "";
      item?.correct_answers?.map((val: any) => {
        let flag_string_index = item?.options?.findIndex((k: any) => {
          return k === val;
        });
        if (flag_string_index !== -1) {
          flag_string += selectOptions[flag_string_index];
        }
      });

      return flag_string;
    }
    // 简单题
    if (short_answer_list.includes(item?.question_type)) {
      return item?.correct_answers?.[0];
    }
    // 判断题
    if (true_false_list.includes(item?.question_type)) {
      return item?.correct_answers?.[0];
    }
    // 填空题
    if (fill_in_the_blank_list.includes(item?.question_type)) {
      return item?.correct_answers?.[0];
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 全屏处理
  const handleFullScreen = () => {
    quesRef?.current?.requestFullscreen();
    setFullScreen(true);
  };
  return (
    <div className="look_topic_box">
      <div className="question_intel" ref={quesRef}>
        {fullScreen && !isOpenAI && (
          <div className="btn" onClick={() => setIsOpenAI(true)}>
            <ZYIcon type="qingyan" />
            AI课堂助手
          </div>
        )}
        {isOpenAI && (
          <div className="ai-chat">
            <CourseChat openAI={isOpenAI} setOpenAI={setIsOpenAI} />
          </div>
        )}
        {/* 题列表 */}
        <div className="question-list-container" ref={scrollableDivRef}>
          <>
            {questions?.length > 0 && (
              <div className="question-list-switch">
                <Switch
                  defaultChecked
                  onChange={(checked, event) => {
                    // setShowAnswer(checked);
                    if (checked) {
                      handleTabChange("1");
                    } else {
                      handleTabChange("2");
                    }
                  }}
                />
                <span className="switch_box_css_font">
                  {activeTab === "1" ? "展示答案" : "隐藏答案"}
                </span>
              </div>
            )}
            {questions?.length > 0 && (
              <div className="question_intel_name">{paperName}</div>
            )}
            <div className="tab-content">
              <div className="question-list" ref={scrollableDivRef}>
                {questions?.length > 0 && (
                  <DraggableListNode
                    questions={questions}
                    showAnswer={activeTab === "1" ? true : false}
                    topicUpdate={(arr: any) => {
                      setQuestions(arr);
                    }}
                  />
                )}
                {/* {questions?.[0]?.info && (
                  <div className="question_hint">
                    <span className="question_hint_icon">
                      <ZYIcon style={{ fontSize: "16px" }} type={"tishi"} />
                    </span>

                    <span className="question_hint_content">
                      {questions?.[0]?.info}
                    </span>
                  </div>
                )} */}
                {/* 加载中... */}
                {props?.finshLoading && questions?.length > 0 && (
                  <div className="spin_box">
                    <Spin />
                  </div>
                )}
              </div>
              <div />
            </div>
          </>
        </div>
      </div>

      {!fullScreen && segValue !== "course" && (
        // <Affix offsetBottom={60}>
        //   <div className="affix_bottom" onClick={handleFullScreen}>
        //     <ZYIcon type="airplay" />
        //     演示模式
        //   </div>
        // </Affix>
        <Affix offsetBottom={70}>
          <div className="affix_segmented">
            <Tooltip placement="left" title="演示模式">
              <div className={"relation_container_left"}>
                <button onClick={handleFullScreen}>
                  <ZYIcon type="airplay" style={{ fontSize: "16px" }} />
                </button>
              </div>
            </Tooltip>
          </div>
        </Affix>
      )}
    </div>
  );
};

export default App;
