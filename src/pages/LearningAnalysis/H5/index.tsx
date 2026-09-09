import { useEffect, useMemo } from 'react'
import { useLocation } from '@umijs/max'
import { Divider } from 'antd'
import BaseInfo from '../components/common/BaseInfo';
import TaskStatistics from '../components/common/TaskStatistics';
import HomeworkTimeChart from '../components/homework/HomeworkTimeChart';
import HomeworkRightChart from '../components/homework/HomeworkRightChart';
import KnowledgeGraspChart from '../components/homework/KnowledgeGraspChart';
import KnowledgeDifficultyChart from '../components/homework/KnowledgeDifficultyChart';
import KnowledgeRightChart from '../components/homework/KnowledgeRightChart';
import ZYIcon from '@/components/ZYIcon';

import { useH5AnalysisRequest, H5RequestParams } from '../hooks/useHomeworkAnalysis'

import mokeData from '../moke';

import './index.less'

const H5HomeworkStageReview = (props: any) => {
  const { baseInfo, loading } = props

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

  if (!baseInfo || (baseInfo && !baseInfo?.ai_analysis)) {
    return null
  }

  return (
    <>
      <div className='part-title'>作业阶段点评<Divider /></div>
      <div className='homework-analysis-content-stage'>
        <ZYIcon type="aizhineng" />
        <div className='content'>
          <div className='text'>{baseInfo.ai_analysis}</div>
          <span className='tip'>以上分析由AI生成</span>
        </div>
      </div>
    </>
  )
}

export default function AnalysisH5() {
  const { search } = useLocation()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const courseId = params.get('course_id')
  const classId = params.get('class_id')
  const studentId = params.get('student_id') || ''
  const startTime = params.get('start_time')
  const endTime = params.get('end_time')
  const userId = params.get('user_id')
  const phone = params.get('phone') || ''
  const eduId = params.get('edu_id') || ''

  const { data: baseInfo, loading: infoLoading, request: getBaseInfo } = useH5AnalysisRequest('baseInfo')
  const { data: homeworkData, loading: homeworkLoading, request: getHomeworkData } = useH5AnalysisRequest('homework')
  const { data: knowledgeOverviewData, loading: knowledgeOverviewLoading, request: getKnowledgeOverviewData } = useH5AnalysisRequest('knowledgeOverview')
  const { data: knowledgesData, loading: knowledgesLoading, request: getKnowledgesData } = useH5AnalysisRequest('knowledges')

  useEffect(() => {
    if (courseId && classId && startTime && endTime && userId && (studentId || eduId || phone)) {
      getAnalysisData()
    }
  }, [])

  const getAnalysisData = async () => {
    const payload: H5RequestParams = {
      courseId,
      classId,
      startTime,
      endTime,
      userId,
      phone,
      studentId,
      eduId,
    }
    await getBaseInfo(payload)
    await getHomeworkData(payload)
    await getKnowledgeOverviewData(payload)
    await getKnowledgesData(payload)
  }

  return (
    <div className='analysis-h5'>
      {/* 学生基本信息 */}
      <BaseInfo baseInfo={baseInfo} loading={infoLoading} />
      {/* 作业阶段点评 */}
      <H5HomeworkStageReview baseInfo={baseInfo} loading={infoLoading} />
      {/* 任务统计 */}
      <div className='part-title'>任务统计<Divider /></div>
      <TaskStatistics baseInfo={baseInfo} loading={infoLoading} />
      {/* 作业提交时间轨迹 - 散点图 */}
      <HomeworkTimeChart 
        loading={homeworkLoading}
        dataSource={homeworkData} 
        dateRange={[startTime, endTime]} 
      />
      {/* 作业正确率趋势 - 折线图 */}
      <HomeworkRightChart 
        loading={homeworkLoading}
        dataSource={homeworkData} 
        dateRange={[startTime, endTime]} 
      />
      <div className='part-title'>知识点概况<Divider /></div>
      {/* 知识点掌握情况 - 环形图 */}
      <KnowledgeGraspChart 
        loading={knowledgeOverviewLoading} 
        dataSource={knowledgeOverviewData} 
      />
      {/* 出题难度占比极正确率 - 柱状图联动环形图 */}
      <KnowledgeDifficultyChart 
        loading={knowledgesLoading} 
        dataSource={knowledgesData}
      />
      {/* 知识点正确率情况 - 柱状图*/}
      <KnowledgeRightChart 
        loading={knowledgesLoading} 
        dataSource={knowledgesData} 
      />
    </div>
  )
}


