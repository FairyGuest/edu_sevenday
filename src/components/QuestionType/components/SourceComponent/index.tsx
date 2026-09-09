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

  const sourceList = Array.isArray(row?.source) ? row.source : [];

  return (
    <>
      {showSource && (
        <div className="source-box">
          {row?.createTime && (
            <span>
              {dayjs(row?.createTime).format("YYYY-MM-DD HH:mm:ss")}
            </span>
          )}
          <>
            {row?.paperName && (
              <Divider type="vertical" />
            )}
            <div className="source-dropdown-text">
              <span className="text">{row?.paperName}</span>
            </div>
          </>
        </div>
      )}
    </>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
  commonModel: state.commonModel,
}))(App);
