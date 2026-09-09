import React from 'react'
import "./Compevaluate.less"
import summary from "@/assets/summary.svg";
function Compevaluate(props: any) {
    const { testPaper } = props;
    return (
        <div className='compevaluate'>
            <div className='compevaluate-content'>
                <div className='compevaluate-content-img'>
                    <img className='compevaluate-content-img-iocn' src={summary} alt="" />
                </div>
                <div className='compevaluate-content-text'>
                    {
                        testPaper?.ai_analysis == null && <span>AI评价生成中</span> ||
                        <span>{testPaper?.ai_analysis}</span>
                    }
                </div>
            </div>
        </div>
    )
}

export default Compevaluate