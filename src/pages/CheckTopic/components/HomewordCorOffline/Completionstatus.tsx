import React from 'react'
import { Divider } from 'antd';
import "./Completionstatus.less"
function Completionstatus(props: any) {
    const {
        testPaper,
        activeStudentRow,
        exportData
    } = props

    return (
        <div className='completionstatus'>
            <div className='completionstatus-varder'>
                <div className='completionstatus-varder-top'>
                    {exportData?.totalQuestionCount}
                </div>
                <div className='completionstatus-varder-botton'>
                    总题数
                </div>
            </div>
            <Divider
                className="completionstatus-vardivider"
                type="vertical"
            />
            <div className='completionstatus-varder'>
                <div className='completionstatus-varder-top'>
                   {exportData?.completedQuestionCount}
                </div>
                <div className='completionstatus-varder-botton'>
                    完成题数
                </div>
            </div>
            <Divider
                className="completionstatus-vardivider"
                type="vertical"
            />
            <div className='completionstatus-varder'>
                <div className='completionstatus-varder-top'>
                    {exportData?.completionProgress}%
                </div>
                <div className='completionstatus-varder-botton'>
                    完成率
                </div>
            </div>
        </div>
    )
}

export default Completionstatus
