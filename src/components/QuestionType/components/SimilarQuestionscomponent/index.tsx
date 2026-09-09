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

  let ti_difficulty_moderation_list: any = {
    easy: "容易",
    medium: "适中",
    hard: "困难",
    easy_moderate: "较易",
    moderate_hard: "较难",
  };

  return (
    <>
      <div className="similar_questions_box">
        <div>
          <span className="difficulty_box_css">
            <ZYIcon type="bookmark" size="12" color="#646e8b" />
            {row?.difficulty}题
          </span>
          {row?.is_ori_question == 1 && (
            <span className="difficulty_css">为你推荐相似题</span>
          )}
        </div>
        <div className="similar_questions_box_css">
          {row?.kgPointList?.map((val: any, key: any) => {
            return (
              <span className="similar_questions_box_item" key={key + val}>
                {val?.name}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
  commonModel: state.commonModel,
}))(App);
