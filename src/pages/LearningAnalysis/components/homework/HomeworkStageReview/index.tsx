import { useState, useEffect, useCallback } from 'react'
import { connect, useLocation } from '@umijs/max';
import { Divider, Spin } from 'antd'
import ZYIcon from '@/components/ZYIcon'
import MarkdownRender from '@/components/MarkdownRender'
import { cogUrl } from "@/utils/host";
import { sseRequset, str2json, stopSSE, getUserInfo } from '@/utils';
import { useTeacherContext } from '@/components/LayoutSider';
// import { useAIAnalysis } from './useAIAnalysis'

import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs';

import './index.less'

type AIStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error'

const HomeworkStageReview = ({
  baseInfo,
  loading,
  analysisModel,
  dateRange,
  apisSettled,
  classAnalysisPayload
}: {
  baseInfo: any,
  loading: boolean,
  analysisModel: any,
  dateRange: [Dayjs, Dayjs] | null,
  apisSettled: boolean,
  classAnalysisPayload?: any
}) => {
  const { selectedClass, selectedStudent, analysisType } = analysisModel
  const [context] = useTeacherContext()
  const courseId = context?.course_id
  const curOrg = JSON.parse(localStorage.getItem("curOrg") || "{}");

  const [status, setStatus] = useState<AIStatus>('idle')
  const [content, setContent] = useState<string>('')
  const userId = getUserInfo('id')

  useEffect(() => {
    // 切换学生或筛选后重置状态
    resetState()

    if (!baseInfo || !apisSettled) return

    

    if (baseInfo.ai_analysis && baseInfo.ai_analysis !== content) {
      setContent(baseInfo.ai_analysis)
      setStatus('done')
    } else if (
      (analysisType == 'personal' && baseInfo?.task_stats?.submitted_count !== 0) || 
      (analysisType == 'class' && baseInfo?.assigned_count?.class_assigned_count !== 0)
    ) {
      requestAnalysis()
    }
  }, [apisSettled])

  useEffect(() => {
    return () => {
      stopSSE()
    }
  }, [])

  const resetState = () => {
    stopSSE()
    setContent('')
    setStatus('idle')
  }

  const handleStreamData = useCallback((param: any) => {
    const data = str2json(param.data);
    const { __action, data: streamData } = data;

    switch (__action) {
      case 'start':
        setContent('')
        break
      
      case 'stream':
        setStatus('streaming')
        setContent(prev => prev + streamData)
        break

      case 'end':
        setStatus('done')
        break
      
      case 'error':
        setStatus('error')
        break
    }
  }, [])

  const requestAnalysis = useCallback(() => {
    if (!selectedClass?.value || !dateRange) return

    const payload = analysisType == 'personal' 
      ? {
          sseUrl: `${cogUrl}/student_analysis/student_ai_analysis`,
          class_id: selectedClass.value,
          student_id: selectedStudent.id,
          course_id: courseId,
          user_id: userId,
          start_time: dayjs(dateRange[0]).format('YYYY-MM-DD'),
          end_time: dayjs(dateRange[1]).format('YYYY-MM-DD'),
        }
      : {
        sseUrl: `${cogUrl}/student_analysis/class_ai_analysis`,
        req_params: {
          class_id: selectedClass.value,
          org_id: curOrg.id,
          course_id: courseId,
          user_id: userId,
          start_time: dayjs(dateRange[0]).format('YYYY-MM-DD'),
          end_time: dayjs(dateRange[1]).format('YYYY-MM-DD'),
        },
        class_report: baseInfo,
        ...classAnalysisPayload
      }

    setStatus('loading')
    sseRequset(payload, handleStreamData)
  }, [analysisType, selectedClass, selectedStudent, courseId, dateRange, handleStreamData, classAnalysisPayload])


  if (loading) {
    return (
      <div className='loading-box'>
        <span className="anticon-spin">
          <ZYIcon type="load-color" style={{ fontSize: "20px" }} />
        </span>
        <span className="text">数据加载中</span>
      </div>
    )
  }

  if (!baseInfo ||
    (analysisType == 'personal' && (!baseInfo?.task_stats || baseInfo?.task_stats?.submitted_count === 0)) || 
    (analysisType == 'class' && (!baseInfo?.assigned_count || baseInfo?.assigned_count?.class_assigned_count === 0))
  ) {
    return null
  } else {
    return (
      <>
        <div className='part-title'>作业阶段点评<Divider /></div>
        <div className='homework-analysis-content-stage'>
          {status === 'loading' ? (
            <div className='ai-loading'>
              <Spin size="small"/>
              <span className='text'>AI分析中...</span>
            </div>
          ) : (
            <>
              <ZYIcon type="aizhineng" />
              <div className='content'>
                <div className='text'>
                  <MarkdownRender>{content}</MarkdownRender>
                </div>
                {status === 'done' && <span className='tip'>以上分析由AI生成</span>}
              </div>
            </>
          )}
        </div>
      </>
    )
  }
}

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(HomeworkStageReview)

