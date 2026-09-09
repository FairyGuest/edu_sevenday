import { useEffect, useRef, useState } from "react";
import { connect, useDispatch, history } from "@umijs/max";
import {
  Button,
  Input,
  Modal,
  Segmented,
  Select,
  Tag,
  InputNumber,
} from "antd";
import {
  DownOutlined,
  UpOutlined,
  CloseOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import { ZYIcon } from "@/components";
import "./index.less";

const App = (props: any) => {
  const { commonModel, questionTypesListData } = props;
  const dispatch = useDispatch();
  const [showTop, setShowTop] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pdfList, setPdfList] = useState([]);

  let questionTypesList_arr = [
    {
      type: "单选题",
      code: "single_choice",
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0,
      easy_moderate: 0,
      moderate_hard: 0,
      score: 1,
    },
    {
      type: "多选题",
      code: "multiple_choice",
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0,
      easy_moderate: 0,
      moderate_hard: 0,
      score: 1,
    },
    {
      type: "填空题",
      code: "fill_in_the_blank",
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0,
      easy_moderate: 0,
      moderate_hard: 0,
      score: 1,
    },
    {
      type: "简答题",
      code: "short_answer",
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0,
      easy_moderate: 0,
      moderate_hard: 0,
      score: 1,
    },
    {
      type: "判断题",
      code: "true_false",
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0,
      easy_moderate: 0,
      moderate_hard: 0,
      score: 1,
    },
  ];

  const [questionTypesList, setQuestionTypesList] = useState<any>([]);

  useEffect(() => {
    if (questionTypesListData?.length > 0) {
      let flag_arr = questionTypesListData?.map((item: any, index: any) => {
        return {
          ...item,
          easy: item?.easy || 0,
          medium: item?.medium || 0,
          hard: item?.hard || 0,
          total: item.total || 0,
          easy_moderate: item?.easy_moderate || 0,
          moderate_hard: item?.moderate_hard || 0,
        };
      });
      setQuestionTypesList(flag_arr);
    }
  }, [questionTypesListData]);

  // useEffect(() => {
  //   // initData()
  //   setShowTop(props?.showNewChat);
  // }, [props?.showNewChat]);

  // useEffect(() => {
  //   if (props?.ruleList?.length > 0) setQuestionTypesList(props?.ruleList);
  // }, [props?.ruleList]);

  // useEffect(() => {
  //   setQuestionTypesList([...questionTypesList_arr]);
  // }, [props?.initType]);

  const handleTypeScoreChange = (
    type: any,
    item: any,
    index: number,
    value: any,
  ) => {
    let arr = questionTypesList?.map((val: any, key: any) => {
      if (item?.en_name == val?.en_name) {
        if (type == "easy") {
          val.easy = value || 0;
        }
        if (type == "easy_moderate") {
          val.easy_moderate = value || 0;
        }
        if (type == "medium") {
          val.medium = value || 0;
        }
        if (type == "moderate_hard") {
          val.moderate_hard = value || 0;
        }
        if (type == "hard") {
          val.hard = value || 0;
        }
        return {
          ...val,
          total:
            val.easy +
            val.medium +
            val.hard +
            val.easy_moderate +
            val.moderate_hard,
        };
      }
      return {
        ...val,
      };
    });
    console.log("arr", arr);
    setQuestionTypesList(
      arr?.map((item: any) => {
        return { ...item };
      }),
    );
    props?.changeQuestionListFn(arr);
  };

  const clearBtn = (item: any) => {
    console.log("item", item);
    if (
      item?.easy == 0 &&
      item?.medium == 0 &&
      item?.hard == 0 &&
      item?.easy_moderate == 0 &&
      item?.moderate_hard == 0 &&
      item?.total == 0
    ) {
      return;
    }
    let arr = questionTypesList?.map((val: any, index: any) => {
      if (item?.en_name == val?.en_name) {
        val.easy = 0;
        val.medium = 0;
        val.hard = 0;
        val.easy_moderate = 0;
        val.moderate_hard = 0;
        // val.score = 1;
        return { ...val };
      }
      return { ...val };
    });
    setQuestionTypesList(arr);
    props?.changeQuestionListFn(arr);
  };

  const getTotalSum = (
    easy: any,
    easy_moderate: any,
    medium: any,
    moderate_hard: any,
    hard: any,
  ) => {
    let easy_num = easy ?? 0;
    let medium_num = medium ?? 0;
    let hard_num = hard ?? 0;
    let easy_moderate_num = easy_moderate ?? 0;
    let moderate_hard_num = moderate_hard ?? 0;
    return (
      easy_num + medium_num + hard_num + easy_moderate_num + moderate_hard_num
    );
  };

  // useEffect(() => {
  //   setPdfList(props?.pdfList);
  // }, [props?.pdfList]);

  // const onFinish = (list: any) => {
  //   setPdfList(list);
  // };

  // const delRow = (item: any) => {
  //   let arr = pdfList?.filter((val: any) => {
  //     return val?.id != item?.id;
  //   });
  //   setPdfList(arr);
  // };

  // useEffect(() => {
  //   props?.showPullupDrawer(showTop);
  // }, [showTop]);

  // useEffect(() => {
  //   if (pdfList?.length > 0) props?.getPdfList(pdfList);
  // }, [pdfList]);

  return (
    <div className="set_topic_chat_text_area_drawer_box_less_top">
      <div className="chat_text_area_drawer_box">
        {/* <div
          className="chat_text_area_drawer_box_top"
          onClick={() => {
            if (
              commonModel?.upload_list_flag?.length > 0 ||
              commonModel?.topic_list_flag?.length == 0
            ) {
              return;
            }
            setShowTop(!showTop);
          }}
        >
          <span className="chat_text_area_drawer_box_top_font">
            <span style={{ transform: "translateY(1px)" }}>
              <ZYIcon type={"biji"} style={{ fontSize: 16 }} />
            </span>
            出题类型设置
          </span>
          {showTop && (
            <span className="icon_xia_less">
              <ZYIcon type={"xia"} style={{ fontSize: 8, color: "#1C6CFF" }} />
            </span>
          )}
          {!showTop && (
            <span className="icon_xia_less">
              <ZYIcon
                type={"shang"}
                style={{ fontSize: 8, color: "#1C6CFF" }}
              />
            </span>
          )}
        </div> */}
        <div className="chat_text_area_drawer_box_content">
          {questionTypesList?.map((item: any, index: any) => {
            return (
              <div className="question_set_new_box_less" key={index}>
                <div className="question_set_new_box_top">
                  <p className="question_set_new_box_top_left">
                    {item?.name}
                    <span className="question_set_new_box_top_left_right">
                      共
                      {getTotalSum(
                        item?.easy,
                        item?.easy_moderate,
                        item?.medium,
                        item?.moderate_hard,
                        item?.hard,
                      )}
                      题
                    </span>
                  </p>
                  <span
                    className={
                      getTotalSum(
                        item?.easy,
                        item?.easy_moderate,
                        item?.medium,
                        item?.moderate_hard,
                        item?.hard,
                      ) == 0
                        ? "question_set_new_box_top_right_less"
                        : "question_set_new_box_top_right"
                    }
                    onClick={() => {
                      clearBtn(item);
                    }}
                  >
                    清空
                  </span>
                </div>
                <div className="question_set_new_box_bottom">
                  <InputNumber
                    className="question_set_new_box_bottom_css_input_num"
                    // addonBefore="简单"
                    prefix="容易"
                    precision={0}
                    min={0}
                    max={20}
                    // controls={false}
                    step={1}
                    placeholder="0"
                    value={item?.easy === 0 ? undefined : item?.easy}
                    onChange={(value) =>
                      handleTypeScoreChange(
                        "easy",
                        item,
                        index,
                        value as number,
                      )
                    }
                  />
                  <InputNumber
                    className="question_set_new_box_bottom_css_input_num"
                    prefix="较易"
                    precision={0}
                    min={0}
                    max={20}
                    // controls={false}
                    step={1}
                    placeholder="0"
                    value={
                      item?.easy_moderate === 0
                        ? undefined
                        : item?.easy_moderate
                    }
                    onChange={(value) =>
                      handleTypeScoreChange(
                        "easy_moderate",
                        item,
                        index,
                        value as number,
                      )
                    }
                  />
                  <InputNumber
                    className="question_set_new_box_bottom_css_input_num"
                    prefix="适中"
                    precision={0}
                    min={0}
                    max={20}
                    // controls={false}
                    step={1}
                    placeholder="0"
                    value={item?.medium === 0 ? undefined : item?.medium}
                    onChange={(value) =>
                      handleTypeScoreChange(
                        "medium",
                        item,
                        index,
                        value as number,
                      )
                    }
                  />
                  <InputNumber
                    className="question_set_new_box_bottom_css_input_num"
                    prefix="较难"
                    precision={0}
                    min={0}
                    max={20}
                    // controls={false}
                    step={1}
                    placeholder="0"
                    value={
                      item?.moderate_hard === 0
                        ? undefined
                        : item?.moderate_hard
                    }
                    onChange={(value) =>
                      handleTypeScoreChange(
                        "moderate_hard",
                        item,
                        index,
                        value as number,
                      )
                    }
                  />
                  <InputNumber
                    className="question_set_new_box_bottom_css_input_num"
                    prefix="困难"
                    precision={0}
                    min={0}
                    max={20}
                    // controls={false}
                    step={1}
                    placeholder="0"
                    // value={item?.hard}
                    value={item?.hard === 0 ? undefined : item?.hard}
                    onChange={(value) =>
                      handleTypeScoreChange(
                        "hard",
                        item,
                        index,
                        value as number,
                      )
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default connect((state: any) => ({
  aiClassroomModel: state.aiClassroomModel,
  commonModel: state.commonModel,
}))(App);
