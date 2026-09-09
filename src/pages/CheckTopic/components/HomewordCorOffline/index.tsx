import { useEffect, useState } from "react";
import { Skeleton } from "antd";
import { connect } from "@umijs/max";
import QuestionType from "../QuestionType/index";
import Completionstatus from "./Completionstatus";
import dayjs from "dayjs";
import "./index.less";
import ChatEmpty from "@/components/ChatEmpty";
const App = (props: any) => {

  const {
    testPaper,
    studentloading,
    // showAnswer = true,
    // studentAnswer = true,
    // optionsStudent,
    // selectedValue,
    // postCheckExamStudentFn,
    // activeStudentRow,
    // testRow,
    exportData,
  } = props;
  const [selectOptions, setSelectOptions] = useState([
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ]);
  const nolanguage = (row: any) => {
    if (testPaper?.subject == "语文") {
      return true
    } else {
      return true
    }
  }
  return (
    <div className="studentpaper">
      {
       testPaper?.questionList?.length > 0 && (
          <>
            <div className="studentpaper-titletop">
              <div className="studentpaper-titletop-title">
                {exportData?.name}作业完成情况
              </div>
              <div className="studentpaper-titletop-time">
                <span className="studentpaper-titletop-time-format">
                  {dayjs(testPaper?.startTime).format("YYYY-MM-DD HH:mm")}
                </span>
                <span className="studentpaper-titletop-time-submit">提交</span>
              </div>
            </div>
            <Completionstatus {...props} />
            <div className="studentpaper-title">
              本次作业详情
            </div>
            <div className={"studentpaper-content"}>
              {
                testPaper?.questionList?.map((question: any, index: any) => {
                  return (
                    <div key={index}>
                      <div className="studentpaper-content-item" >
                        <QuestionType
                          {...props}
                          row={question}
                          rowIndex={index}
                          nolanguage={nolanguage}
                          showReply={false}
                          showAnswer={false}
                          showAnalysis={true}
                          showStudent={true}
                          showrenshu={false}
                          selectOptions={selectOptions}
                        />
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </>
        ) || (
            <ChatEmpty
              ZYIconStyle={{ width: "100%", height: "56px" }}
              descriptionSty={{ fontSize: "14px", color: "#646E8B" }}
              title={`抱歉，暂未收到学生提交的习题`}
            />
        )
      }
      {
        studentloading && (
          <>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </>
        )
      }
    </div>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
}))(App);
