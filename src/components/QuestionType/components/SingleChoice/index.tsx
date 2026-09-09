import React, { useEffect, useState, useRef } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Skeleton,
  Select,
  Tag,
  Spin,
  Carousel,
  Image as ImageCode,
  message,
  Progress,
  Divider,
  Dropdown,
  Space,
  Tooltip,
} from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { connect, history, useDispatch } from "umi";
import { formatStaticUrl, getSpaceInfo } from "@/utils";
import MarkdownRender from "@/components/MarkdownRender";
import ZYIcon from "../../../ZYIcon";

import ButtonComponent from "./../ButtonComponent";
import SourceComponent from "./../SourceComponent";
import SimilarQuestionscomponent from "../SimilarQuestionscomponent";
import AnswerLabel from "../AnswerLabel";

import MathHtmlRenderer from '@/components/MathHtmlRenderer';

import {
  single_choice_list_name,
  multiple_choice_list_name,
  fill_in_the_blank_list_name,
  true_false_list_name,
  short_answer_list_name,
} from "@/global";

import dayjs from "dayjs";

import "./../../index.less";

const { Title } = Typography;
const App = (props: any) => {
  const {
    row,
    rowKey,
    showAnswer,
    studentAnswer,
    items,
    commonModel,
    showSource = true,
    selectPrintType,
    download
  } = props;

  const markdownRenderFn = (str: any) => {
    return (
      <MathHtmlRenderer htmlString={str} row={row} />
      // <div
      //   className={`render_title_box ${row?.question_type === "cloze_test" ? "english" : ""}`}
      //   dangerouslySetInnerHTML={{ __html: str }}
      // />
    );
  };

  return (
    <div className="question_type_box_css">
      {/* 单选 */}
        <>
          <div className="question-item" key={row?.id}>
            <div
              className="question-title"
              {
              ...download && {
                style: {
                  display: "flex",
                  alignItems: "baseline",
                }
              }
              }
            >
              <span className="question_number">{rowKey + 1}.</span>
              {/* <p>{`${rowKey + 1}.${row?.type}`}</p> */}
              {markdownRenderFn(row?.question_text)}
            </div>
            <div className="question-options">
              {row?.optionsList?.map?.((option: any) => {
                return (
                  <div key={rowKey + option?.label + ""}>
                    {showAnswer ? (
                      <div
                        // className={`question-option ${option?.label === row?.answer ? "correct-answer" : ""}`}
                        className={"question-option"}
                        key={option?.label}
                      >
                        {markdownRenderFn(
                          `${option?.label}.${option?.content}`,
                        )}
                        <div className="question-option-progress"></div>
                      </div>
                    ) : (
                      <div className="question-option" key={option?.label}>
                        {markdownRenderFn(
                          `${option?.label}.${option?.content}`,
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {studentAnswer && (
              <div
                className={`answer_result ${row?.is_correct ? "correct" : "wrong"}`}
              >
                {markdownRenderFn(`回答：${row?.studentAnswer}`)}
              </div>
            )}

            {
              !download && (
                <div
                  className={`question-answer  ${showAnswer ? "show_answer_question_css" : "none_show_answer_question_css"}`}
                >
                  {row?.kgPointList?.length > 0 && (
                    // similarQuestionscommponent(row)
                    <SimilarQuestionscomponent {...props} />
                  )}
                  <AnswerLabel answer={row?.answer} row={row} />
                  <div className="answer-analysis">
                    {markdownRenderFn(row?.explanation)}
                  </div>
                  <SourceComponent {...props} />
                  <ButtonComponent {...props} />
                  {/* {sourceComponent()}
              {buttonComponent()} */}
                </div>
              )
            }
            {
              download && selectPrintType === "teacher" && (
                <div
                  className={`question-answer  ${showAnswer ? "show_answer_question_css" : "none_show_answer_question_css"}`}
                >
                  <AnswerLabel answer={row?.answer} row={row} />
                  <div className="answer-analysis">
                    {markdownRenderFn(row?.explanation)}
                  </div>
                  {/* {sourceComponent()}
              {buttonComponent()} */}
                  <br />
                </div>
              )
            }
          </div>
        </>
    </div>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
  commonModel: state.commonModel,
}))(App);
