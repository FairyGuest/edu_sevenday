import React, { useEffect, useState, useRef, useMemo } from "react";
import {
    Typography,
    Modal,

    message,
    Image as ImageCode,
} from "antd";
import useMarkdownRender from '../useMarkdownRender';
import ZYIcon from "@/components/ZYIcon";
import Review from "../../Review"
import "./index.less";
const Index = (props: any) => {
    const {
        row,
        rowIndex,
        showReply = true,  // 是否显示回复
        showAnswer = true,  // 是否显示答案
        showAnalysis = true, // 是否显示解析
        DetailsShow = false,
        showStudent = false, // 是否显示学生答案
    } = props;
    const { markdownRenderFn, renderSource, clampImgWidth } = useMarkdownRender(row);        // markdown渲染
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
    const topicRef = useRef<HTMLDivElement>(null); // 获取dom
    const analysis = useRef<HTMLDivElement>(null); // 详情是否显示 默认不显示
    const [details, setDetails] = useState(showStudent); //是否显示完全
    const [detailsShow, setDetailsShow] = useState(showStudent); //是否显示完全
    const [isTitleOverLines, setIsTitleOverLines] = useState(false);
    const [isanalysisOverLines, setIsanalysisOverLines] = useState(false);
    const gettopic = useMemo(() => {
        if (!topicRef.current) return 0;
        const targetEl = topicRef.current;
        const refEl = document.createElement("div");
        refEl.style.cssText = `
                  position: absolute;
                  visibility: hidden;
                  width: ${targetEl.offsetWidth}px;
                  font-size: ${getComputedStyle(targetEl).fontSize};
                  line-height: ${getComputedStyle(targetEl).lineHeight};
                  font-family: ${getComputedStyle(targetEl).fontFamily};
                  `;
        refEl.innerText = "1\n2\n3\n4\n5";
        document.body.appendChild(refEl);
        const height = refEl.offsetHeight;
        document.body.removeChild(refEl);
        return height;
    }, [topicRef?.current?.offsetWidth])
    const analysisshow = useMemo(() => {
        if (!analysis.current) return 0;
        const targetEl = analysis.current;
        const refEl = document.createElement("div");
        refEl.style.cssText = `
                  position: absolute;
                  visibility: hidden;
                  width: ${targetEl.offsetWidth}px;
                  font-size: ${getComputedStyle(targetEl).fontSize};
                  line-height: ${getComputedStyle(targetEl).lineHeight};
                  font-family: ${getComputedStyle(targetEl).fontFamily};
                  `;
        refEl.innerText = "1\n2";
        document.body.appendChild(refEl);
        const height = refEl.offsetHeight;
        document.body.removeChild(refEl);
        return height;
    }, [analysis?.current?.offsetWidth])
    useEffect(() => {
        const checkOver5Lines = () => {
            if (!analysis.current) return;
            const targetHeight = analysis.current.offsetHeight;
            setIsanalysisOverLines(targetHeight >= analysisshow);
        }
        checkOver5Lines();
        window.addEventListener("resize", checkOver5Lines);
        return () => window.removeEventListener("resize", checkOver5Lines);

    }, [analysisshow, row?.explanation])
    useEffect(() => {
        const checkOver5Lines = () => {
            if (!topicRef.current) return;
            const targetHeight = topicRef.current.offsetHeight;
            setIsTitleOverLines(targetHeight >= gettopic);
        };
        checkOver5Lines();
        window.addEventListener("resize", checkOver5Lines);
        return () => window.removeEventListener("resize", checkOver5Lines);
    }, [gettopic, row?.question_text]);
    return (
        <div className="question-type-problem" key={row?.id}>
            <div className={`question-type-problem-title`}>
                {
                    DetailsShow && (<>
                        <div className="question-type-problem-title-index">{row?.question_index}.</div>
                        <div ref={topicRef} className={`question-type-problem-titlevarder ${details ? "correct" : " "}`}>
                            {markdownRenderFn(`${row?.questionInfo?.stem}`)}
                        </div>
                    </>) || (<>
                        <div className="question-type-problem-title-index">
                            {rowIndex + 1}.
                        </div>
                        <div ref={topicRef} className={`question-type-problem-titlevarder ${details ? "correct" : " "}`}>
                            {markdownRenderFn(`${row?.questionInfo?.stem}`)}
                        </div>
                    </>)
                }
            </div>
            {
                isTitleOverLines && (
                    <>
                        {
                            showStudent && (
                                <div className="question-type-problem-details" onClick={() => setDetails(!details)}>
                                    {details ? "展开" : "收起"} <ZYIcon type={details ? "arrow-down" : "arrow-up"} />
                                </div>
                            )
                        }
                    </>
                )
            }
            <div className="question-type-problem-options">
                {row?.questionInfo?.optionList?.map?.((option: any,index: number) => {
                    let _flag = row?.answer?.indexOf(option?.label);
                    return (
                        <div key={rowIndex + option?.label + ""}>
                            {showReply ? (
                                <div
                                    className={`question-type-problem-options ${_flag > -1 ? "correct-answer" : ""}`}
                                    key={option?.label}
                                >
                                    {markdownRenderFn(
                                        `${selectOptions[index]}.${option}`,
                                    )}
                                </div>
                            ) : (
                                <div className="question-type-problem-options" key={option?.label}>
                                    {markdownRenderFn(
                                        `${selectOptions[index]}.${option}`,
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {
                showReply && (
                    <div className={`question-type-problem-xsanswer ${row?.is_correct ? "correct" : "wrong"}`}
                    >
                        {markdownRenderFn(`回答：${row?.questionInfo?.standardAnswerList || "未识别"}`)}
                    </div>
                )
            }
            {
                showAnswer && (
                    <div className="question-type-problem-answerclass">
                        <div className="question-type-problem-answerclass-xsanswer">
                            {markdownRenderFn(`答案：${row?.answer ? row?.answer : ""}`)}
                        </div>
                    </div>
                )
            }
            {
                showAnalysis && (
                    <div className="question-type-problem-answerclass">
                        <div className="question-type-problem-answer">
                            {
                                !DetailsShow && (
                                    <div className={`question-type-problem-answer-xsanswer ${row?.is_correct ? "correct" : "wrong"}`}
                                    >
                                        {markdownRenderFn(`回答：${row?.studentAnswer || "未识别"}`)}
                                        {/* {!row?.is_correct && markdownRenderFn(`理由：${row?.reason || "未识别"}`)} */}
                                    </div>
                                )
                            }
                            <div className="answer-label">
                                {markdownRenderFn(`【答案】${row?.answer ? row?.answer : ""}`)}
                            </div>
                            <div ref={analysis} className={`answer-analysis ${detailsShow ? "correct" : ""}`}>
                                {markdownRenderFn(row?.explanation)}
                            </div>
                            {
                                isanalysisOverLines && (
                                    <>
                                        {
                                            showStudent && (
                                                <>
                                                    <div className="expand-collect" onClick={() => setDetailsShow(!detailsShow)}>
                                                        {detailsShow ? "展开" : "收起"}<ZYIcon type={detailsShow ? "arrow-down" : "arrow-up"} />
                                                    </div>
                                                </>
                                            )
                                        }
                                    </>
                                )
                            }
                            {/* {
                                !DetailsShow && (
                                    <div className="answer-review">
                                        <Review {...props} />
                                    </div>
                                )
                            } */}
                        </div>
                    </div>

                )
            }
        </div>
    );
};

export default Index;
