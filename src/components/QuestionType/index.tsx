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

import SingleChoice from "./components/SingleChoice";
import FillInTheBlank from "./components/FillInTheBlank";
import MultipleChoice from "./components/MultipleChoice";
import ShortAnswer from "./components/ShortAnswer";
import TrueFalse from "./components/TrueFalse";

import {
  single_choice_list_name,
  multiple_choice_list_name,
  fill_in_the_blank_list_name,
  true_false_list_name,
} from "@/global";

import dayjs from "dayjs";

import "./index.less";

const { Title } = Typography;
const App = (props: any) => {
  const {
    row,
    // rowKey,
    // showAnswer,
    // studentAnswer,
    // items,
    // commonModel,
    // showSource = false,
  } = props;

  const quesType = row?.quesType;

  const isSingleChoice = single_choice_list_name.includes(quesType);
  const isMultipleChoice = multiple_choice_list_name.includes(quesType);
  const isFillInTheBlank = fill_in_the_blank_list_name.includes(quesType);
  const isTrueFalse = true_false_list_name.includes(quesType);
  const isShortAnswer =
    !isSingleChoice && !isMultipleChoice && !isFillInTheBlank && !isTrueFalse;

  return (
    <div>
      {/* 单选 */}
      {isSingleChoice && <SingleChoice {...props} />}
      {/* 多选 */}
      {isMultipleChoice && <MultipleChoice {...props} />}
      {/* 填空 */}
      {isFillInTheBlank && <FillInTheBlank {...props} />}
      {/* 判断 */}
      {isTrueFalse && <TrueFalse {...props} />}
      {/* 简答（其他题型统一按简答处理） */}
      {isShortAnswer && <ShortAnswer {...props} />}
    </div>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
  commonModel: state.commonModel,
}))(App);
