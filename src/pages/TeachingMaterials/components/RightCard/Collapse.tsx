import { connect } from "umi";

import React, { memo, useRef, useState, useEffect } from "react";
import MarkdownRender from "@/components/MarkdownRender";
import "./index.less";

const mdTemp = "\n> 我需要帮助用户收集关于制作一份分析《老友记》中人物MBTI类型的PPT所需的信息。让我系统性地思考这个任务：\n> \n> 1. **核心概念理解**：\n>    - 《老友记》(Friends)是一部经典美国情景喜剧，有六个主要角色\n>    - MBTI是迈尔斯-布里格斯类型指标(Myers-Briggs Type Indicator)，一种人格类型测试工具\n>    - 需要分析六个主要角色的MBTI类型并制作成PPT\n> \n> 2. **信息需求分析**：\n>    - 《老友记》六个主要角色是谁\n>    - 每个角色的性格特点、行为模式和典型表现\n>    - 可能的MBTI类型分析(16种MBTI类型的基本特征)\n>    - 已有的《老友记》角色MBTI分析文章或讨论\n>    - PPT制作的结构和内容建议\n> \n> 3. **搜索规划**：\n>    - 首先搜索《老友记》六个主要角色介绍\n>    - 搜索MBTI类型的基本特征和解释\n>    - 搜索已有的《老友记》角色MBTI分析\n>    - 搜索PPT制作关于人物性格分析的结构建议\n> \n> 让我开始执行这个搜索计划：\n"

interface CollapseProps {
    data: string;
    className?: string;
    thinkStatus: boolean;
}

const Collapse: React.FC<CollapseProps> = (props) => {
    const [isExpand, setIsExpand] = useState(props.thinkStatus);
    const { data, className } = props;

    const expandAndCollapse = () => {
        setIsExpand(!isExpand);
    }
    useEffect(() => {
        setIsExpand(props.thinkStatus)
    }, [props.thinkStatus])

    return (
        <>
            <div className={`border-1 border-black/10 py-3 px-4 ${className}`} onClick={() => expandAndCollapse()}>
                {/* header */}
                <div className={`gap-2 flex justify-between cursor-pointer items-center ${isExpand ? 'mb-2' : ''}`}>
                    <div className=" flex grap-2 overflow-hidden items-center">
                        <div className="size-4 shrink-0 flex justify-center items-center" style={{ marginRight: "4px" }}>
                            <div className="size-1 rounded-full bg-black/50 "></div>
                        </div>
                        {isExpand ? <div>思考过程</div> : <div className="truncate text_ccc">
                            {data}
                        </div>}
                    </div>

                    <div className="flex items-center gap-2 px-2">
                        {!isExpand ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="size-3"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"></path></svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="size-3"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5"></path></svg>}
                    </div>

                </div>
                {isExpand && <div className="relative overflow-hidden">
                    <MarkdownRender
                        className="markdown-prose blue_black"
                        components={{
                            blockquote: ({ node, ...props }) => {
                                return (
                                    <blockquote className="" {...props} />
                                );
                            },
                            ol: ({ node, ...props }) => {
                                return (
                                    <ol start={1} {...props} />
                                );
                            }
                        }
                        }
                    >{data}</MarkdownRender>
                </div>}
            </div >
        </>
    );
};

export default connect((state: any) => ({
    commonModel: state.commonModel,
    designModel: state.designModel,
}))(memo(Collapse));
