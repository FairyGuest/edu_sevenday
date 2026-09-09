import React, { useRef } from "react";
import { connect } from "umi";
import ShortAnswer from "./Problem/ShortAnswer"


import "./index.less";
const App = (props: any) => {
    const {
        row,
        postCheckExamStudentFn,
    } = props;
    const onRefvard = useRef<any>(); // 回答详情弹窗
    const ondetails = () => {
        onRefvard.current?.showModal(row, true)
    }
    return (
        <div className="question-type">
            <ShortAnswer {...props} ondetails={ondetails} />
        </div>
    );
};

export default connect((state: any) => ({
    setquestionsModel: state.setquestionsModel,
    authModel: state.authModel,
    commonModel: state.commonModel,
}))(App);
