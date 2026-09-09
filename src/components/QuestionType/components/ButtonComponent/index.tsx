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
import {all_question_number} from "@/global";
import {
  single_choice_list,
  multiple_choice_list,
  fill_in_the_blank_list,
  short_answer_list,
  true_false_list,
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
  } = props;

  const buttonComponent = () => {
    if (props?.uploadType == "change") {
      return (
        <div className="button-box">
          <Button
            className="button-box-change"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              props?.replaceQuestionFn(row);
            }}
          >
            换题
          </Button>
        </div>
      );
    }
    if (props?.uploadType == "add") {
      let _flag = items?.findIndex((item: any) => {
        return item?.id == row?.id;
      });
      if (_flag == -1) {
        return (
          <div className="button-box">
            <Button
              className="button-box-add"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log("items?.length", items?.length);
                if (items?.length >= all_question_number) {
                  message.error(`题目总数不能大于${all_question_number}`);
                  return;
                }
                props?.addQuestionFn(row);
              }}
            >
              加入练习
            </Button>
          </div>
        );
      }
      if (_flag != -1) {
        return (
          <div className="button-box">
            <Button
              className="button-box-add"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                props?.cancelQuestionFn(row);
              }}
            >
              取消加入
            </Button>
          </div>
        );
      }
    }
    return "";
  };

  return <>{buttonComponent()}</>;
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
  commonModel: state.commonModel,
}))(App);
