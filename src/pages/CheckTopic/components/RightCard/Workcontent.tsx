import React from 'react'
import HomewordCorOffline from "../HomewordCorOffline";
import ChatEmpty from "@/components/ChatEmpty";
import "./index.less"

function Workcontent(props: any) {
  const {
    testPaper,
    optionsStudent,
    selectedValue,
    activeStudentRow,
    studentloading,
    postCheckExamStudentFn,
  } = props;
  return (
    <div className="accuracy_page">
      {
        testPaper && (
          <HomewordCorOffline
            {...props}
            testPaper={testPaper}
            studentloading={studentloading}
            optionsStudent={optionsStudent}
            activeStudentRow={activeStudentRow}
            selectedValue={selectedValue}
            postCheckExamStudentFn={postCheckExamStudentFn}
          />
        ) || (
          <ChatEmpty
            ZYIconStyle={{ width: "100%", height: "56px" }}
            descriptionSty={{ fontSize: "14px", color: "#646E8B" }}
            title={`抱歉，暂未收到学生提交的习题`}
          />
        )
      }
    </div>
  )
}

export default Workcontent