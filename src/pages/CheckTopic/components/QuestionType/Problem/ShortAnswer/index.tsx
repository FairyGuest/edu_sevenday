import React, { useState, useRef } from 'react'
import useMarkdownRender from '../useMarkdownRender';

import { Tag, Modal, Input, message, Button } from 'antd';
import { connect, useDispatch } from "@umijs/max";
import Answerdetails from "../../../Answerdetails";

function ShortAnswer(props: any) {
    const {
        row,
        rowIndex,
        postCheckExamStudentFn,
    } = props;
    const { markdownRenderFn, renderSource, clampImgWidth } = useMarkdownRender(row);
    const dispatch = useDispatch();

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
    const onRefvard = useRef(null);
    const [correctModalVisible, setCorrectModalVisible] = useState(false);
    const [currentRow, setCurrentRow] = useState<any>(null); // 当前待批改行数据
    const [scoreVal, setScoreVal] = useState('');      // 得分
    const [commentVal, setCommentVal] = useState('');  // 评语

    const renderSourceFn = (answerStatus: any) => {
        console.log(answerStatus, "vanswerStatus");

        if (answerStatus == "0") {
            return <Tag bordered={false} color="blue">
                未提交
            </Tag>
        }
        if (answerStatus == "1") {
            return <Tag bordered={false} color="yellow">
                批改中
            </Tag>
        }
        if (answerStatus == "2") {
            return <Tag bordered={false} color="green">
                已批改
            </Tag>
        }
        if (answerStatus == "3") {
            return <Tag bordered={false} color="red">
                批改失败
            </Tag>
        }
        return <Tag bordered={false} color="orange">未知状态</Tag>
    }

    const ondetails = (student: any) => {
        onRefvard.current?.showModal(student)
    };
    const oncorrect = (rowItem: any) => {
        setCurrentRow(rowItem);
        setScoreVal(rowItem?.score ?? '');
        setCommentVal(rowItem?.gradeComment ?? '');
        setCorrectModalVisible(true);
    }
    const handleSubmitCorrect = async () => {
        if (!currentRow) return;
        if (scoreVal === '' || isNaN(Number(scoreVal))) {
            message.warning('请输入有效分数');
            return;
        }
        try {
            const { code, data }: any = await dispatch({
                type: "setQuestionsModel/postData",
                apiUrl: "postCorrectExam",
                payload: {
                    answerId: currentRow?.answerId,
                    gradeComment: commentVal,
                    score: Number(scoreVal),
                },
            });
            if (code === 200) {
                message.success("批改提交成功");
                console.log(data);
                setCorrectModalVisible(false);
                postCheckExamStudentFn();
            } else {
                message.error("批改提交失败");
            }
        } catch (err) {
            message.error("请求异常");
        }
    }

    return (
        <div className="question-type-problem " key={row?.id}>
            <div>
                {row?.repeatedSubmit ? <Tag bordered={false} color="orange">重复提交</Tag> : ""}  {renderSourceFn(row?.answerStatus)}
            </div>
            <div className={`question-type-problem-title`}>
                <div className="question-type-problem-title-index">
                    {rowIndex + 1}.
                </div>
                <div className={`question-type-problem-titlevarder`}>
                    {markdownRenderFn(`${row?.questionInfo?.stem}`)}
                    <div >
                        {
                            row?.questionInfo?.childList?.length > 0 && row?.questionInfo?.childList?.map((item: any, index: number) => {
                                return <div key={item?.id} >
                                    <p style={{ display: "flex" }}><span style={{ marginRight: 5, width: "20px" }}>{index + 1}</span>{markdownRenderFn(`${item?.stem}`)}</p>
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
            <div className="question-type-problem-options">
                {row?.questionInfo?.optionList?.map?.((option: any, index: number) => {
                    return (
                        <div className="question-type-problem-options" key={option?.label}>
                            {markdownRenderFn(
                                `${selectOptions[index]}.${option}`,
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="question-type-problem-answer">
                <div className={`question-type-problem-answer-xsanswer ${row?.correct ? "correct" : "wrong"}`}
                >
                    {
                        row?.answerFileList?.length > 0 && <div style={{display:"flex",fontSize:"14px",lineHeight:"1.8",}}>
                           回答：<div
                                    className="answer-label-original"
                                    style={{
                                        padding:"0px",
                            
                                    }}
                                    onClick={() => ondetails(row?.answerFileList)}
                                >
                                    学生回答原件
                                </div>
                                
                        </div> || <>
                            {markdownRenderFn(`回答：${row?.studentAnswer || "未识别"}`)}
                        </>
                    }

                </div>
                <div className="answer-label">
                    {
                        row?.questionInfo?.childList?.length > 0 && <>
                            {
                                row?.questionInfo?.childList?.length > 0 && row?.questionInfo?.childList?.map((item: any, index: number) => {
                                    return <div key={item?.id} >
                                        <p style={{ display: "flex" }}>{markdownRenderFn(`【答案】 ${index + 1} . ${item?.standardAnswerList}`)}</p>
                                    </div>
                                })
                            }
                        </> || <>
                            {markdownRenderFn(`【答案】${row?.questionInfo?.standardAnswerList}`)}
                        </>
                    }
                </div>
                {
                    row?.gradeComment && <div className="answer-label-correct">{markdownRenderFn(`【评语】${row?.gradeComment}`)}</div>
                }
            </div>
            <div
                className="answer-correct"
            >
                <Button
                    onClick={() => oncorrect(row)}
                    type="primary"
                    disabled={row?.answerStatus == "0"}
                >
                    批改
                </Button>
            </div>
            <Answerdetails onRef={onRefvard} />
            <Modal
                title="批改作答"
                open={correctModalVisible}
                onOk={handleSubmitCorrect}
                onCancel={() => setCorrectModalVisible(false)}
                maskClosable={false}
            >
                <div style={{ paddingTop: 8 }}>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 4 }}>本题得分：</div>
                        <Input
                            placeholder="请输入分数，例如：8"
                            value={scoreVal}
                            onChange={(e) => setScoreVal(e.target.value)}
                        />
                    </div>
                    <div>
                        <div style={{ marginBottom: 4 }}>批改评语：</div>
                        <Input.TextArea
                            rows={4}
                            placeholder="请输入批改评语"
                            value={commentVal}
                            onChange={(e) => setCommentVal(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}
export default connect((state: any) => ({
    aiClassroomModel: state.aiClassroomModel,
}))(ShortAnswer);