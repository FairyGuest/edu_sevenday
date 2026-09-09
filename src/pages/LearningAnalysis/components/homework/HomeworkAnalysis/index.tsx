import { useState, useEffect, useRef } from 'react'
import { connect, useDispatch, useLocation } from '@umijs/max';
import { Divider } from 'antd'
import BaseInfo from '../../common/BaseInfo';
import TaskStatistics from '../../common/TaskStatistics';
import HomeworkStageReview from '../HomeworkStageReview';
import HomeworkTimeChart from '../HomeworkTimeChart';
import HomeworkRightChart from '../HomeworkRightChart';
import KnowledgeGraspChart from '../KnowledgeGraspChart';
import KnowledgeDifficultyChart from '../KnowledgeDifficultyChart';
import KnowledgeRightChart from '../KnowledgeRightChart';
import PersonalReportFilter from '../PersonalReportFilter';
import ClassReportFilter from '../ClassReportFilter';
import ZYIcon from '@/components/ZYIcon';
import { useTeacherContext } from '@/components/LayoutSider';

import { getUserInfo } from '@/utils';
import dayjs from 'dayjs'

import { useAnalysisRequest, RequestParams } from '../../../hooks/useHomeworkAnalysis'

import mokeData from '../../../moke';
import './index.less';

const HomeworkAnalysis = (props: any) => {
  const { analysisModel } = props
  const dispatch = useDispatch()
  const { selectedClass, selectedStudent, analysisType } = analysisModel
  const [context] = useTeacherContext()
  const courseId = context?.course_id
  const userId = getUserInfo('id')

  // 用于请求数据时，使用最新的时间范围和分析类型
  const effectiveRange = useRef<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')])

  // 个人报告筛选条件初始值
  const [personalFilterInitialRange, setPersonalFilterInitialRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')])
  const [personalFilterInitialRadio, setPersonalFilterInitialRadio] = useState<string>('1')

  // 班级报告筛选条件初始值
  const [classFilterInitialDateType, setClassFilterInitialDateType] = useState<'week' | 'month'>('week')
  const [classFilterInitialDate, setClassFilterInitialDate] = useState<dayjs.Dayjs>(dayjs().subtract(1, 'week'))

  // const [showEmptyState, setShowEmptyState] = useState<boolean>(false)  // 学科是语文或英语时不显示页面
  const { data: baseInfo, loading: infoLoading, request: getBaseInfo } = useAnalysisRequest('baseInfo')
  const { data: homeworkData, loading: homeworkLoading, request: getHomeworkData } = useAnalysisRequest('homework')
  const { data: knowledgeOverviewData, loading: knowledgeOverviewLoading, request: getKnowledgeOverviewData } = useAnalysisRequest('knowledgeOverview')
  const { data: knowledgesData, loading: knowledgesLoading, request: getKnowledgesData } = useAnalysisRequest('knowledges')
  const [apisSettled, setApisSettled] = useState<boolean>(true) // 报告相关接口是否全部完成

  useEffect(() => {
    // selectedStudent 为 null 的时候是班级报告，否则是个人报告
    let timer = setTimeout(() => {
      if (selectedClass && selectedStudent) {
        initPersonalReport()
      } else if (selectedClass && !selectedStudent) {
        initClassReport()
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [selectedClass, selectedStudent, courseId])

  // 初始化个人报告
  const initPersonalReport = () => {
    // setShowEmptyState(false)
    // 如果有 last_submit_time 则以 last_submit_time 为基准，否则以7天前为基准
    const initRange: [dayjs.Dayjs, dayjs.Dayjs] = selectedStudent.last_submit_time 
    ? [dayjs(selectedStudent.last_submit_time).subtract(7, 'day'), dayjs(selectedStudent.last_submit_time).subtract(1, 'day')] 
    : [dayjs().subtract(7, 'day'), dayjs().subtract(1, 'day')]
    setPersonalFilterInitialRange(initRange)
    effectiveRange.current = initRange

    // 如果 last_submit_time 和昨天不是同一天，就不选中 radio
    const lastSubmit = selectedStudent.last_submit_time;
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const radioShouldSelectedOne = !lastSubmit || dayjs(lastSubmit).subtract(1, 'day').format('YYYY-MM-DD') === yesterday;
    setPersonalFilterInitialRadio(radioShouldSelectedOne ? '1' : '');

    getAnalysisData()
  }

  // 初始化班级报告
  const initClassReport = () => {
    setClassFilterInitialDateType('week')
    // setShowEmptyState(false)
    // 如果有 class_last_submit_time 则以 class_last_submit_time 为基准，否则以1周前为基准
    const initClassDate: dayjs.Dayjs = selectedClass.class_last_submit_time 
      ? dayjs(selectedClass.class_last_submit_time).startOf('week') 
      : dayjs().subtract(1, 'week')
    setClassFilterInitialDate(initClassDate)
    // 计算初始日期范围
    const dateRange: [dayjs.Dayjs, dayjs.Dayjs] = [
      dayjs(initClassDate).startOf('week'),
      dayjs(initClassDate).endOf('week')
    ]
    effectiveRange.current = dateRange

    getAnalysisData()
  }

  // 请求报告数据
  const getAnalysisData = async () => {
    setApisSettled(false)

    const payload: RequestParams = {
      selectedClass,
      selectedStudent,
      courseId,
      userId,
      dateRange: effectiveRange.current,
      analysisType,
    }

    try {
      // const shouldShowEmpty = await getAnalysisInfo(payload) // 获取基本信息和总览
      // if (shouldShowEmpty) return

      await Promise.all([
        await getAnalysisInfo(payload), // 获取基本信息和总览
        await getHomeworkData(payload), // 获取作业数据
        await getKnowledgeOverviewData(payload), // 获取知识点掌握情况数据
        await getKnowledgesData(payload) // 获取知识点正确率数据
      ])
    } finally {
      setApisSettled(true)
    }
  }

  const getAnalysisInfo = async (payload: RequestParams) => {
    // let shouldShowEmpty = false
    const { code, data }: any = await getBaseInfo(payload)
    if (code === 200) {
      // const subjectName = data?.subject_name || ''
      // shouldShowEmpty = subjectName === '语文' || subjectName === '英语'
      // setShowEmptyState(shouldShowEmpty)
      // 班级/个人模式都需写入：发送报告弹窗读取报告周期与学科
      dispatch({
        type: "analysisModel/setData",
        payload: {
          homeworkAnalysisInfo: data,
        }
      })
    }
    // return shouldShowEmpty
  }

  const handlePersonalDateRangeChange = (dateRange: [dayjs.Dayjs, dayjs.Dayjs]) => {
    effectiveRange.current = dateRange
  }

  const handleClassDateRangeChange = (dateRange: [dayjs.Dayjs, dayjs.Dayjs]) => {
    effectiveRange.current = dateRange
  }

  const onSearch = () => {
    // setShowEmptyState(false)
    getAnalysisData() 
  }

  return (
    <div className='homework-analysis'>
      {/* 个人报告筛选条件 */}
      {analysisType == 'personal' && (
        <PersonalReportFilter
          initialDateRange={personalFilterInitialRange}
          initialRadio={personalFilterInitialRadio}
          apisSettled={apisSettled}
          onDateRangeChange={handlePersonalDateRangeChange}
          onSearch={onSearch}
        />
      )}
      {/* 班级报告筛选条件 */}
      {analysisType == 'class' && (
        <ClassReportFilter
          initialDateType={classFilterInitialDateType}
          initialDate={classFilterInitialDate}
          apisSettled={apisSettled}
          onDateRangeChange={handleClassDateRangeChange}
          onSearch={onSearch}
        />
      )}
      {selectedClass
      ? <div className='homework-analysis-content'>
          {/* 报告基本信息 */}
          <BaseInfo 
            baseInfo={baseInfo} 
            loading={infoLoading} 
          />
          {/* AI作业阶段点评 */}
          <HomeworkStageReview
            baseInfo={baseInfo}
            apisSettled={apisSettled}
            loading={infoLoading} 
            dateRange={effectiveRange.current}
            classAnalysisPayload={analysisType == 'personal' ? null : {
              class_daily_timeline: homeworkData,
              class_knowledge_point_overview: knowledgeOverviewData
            }}
          />
          {/* 任务统计 */}
          <div className='part-title'>任务统计<Divider /></div>
          <TaskStatistics
            baseInfo={baseInfo} 
            loading={infoLoading}
          />
          {/* 作业提交时间轨迹 - 散点图 */}
          <HomeworkTimeChart
            loading={homeworkLoading}
            dataSource={homeworkData} 
            dateRange={effectiveRange.current?.map((item: any) => dayjs(item).format('YYYY-MM-DD'))}
          />
          {/* 作业正确率趋势 - 折线图 */}
          <HomeworkRightChart
            loading={homeworkLoading}
            dataSource={homeworkData} 
            dateRange={effectiveRange.current?.map((item: any) => dayjs(item).format('YYYY-MM-DD'))}
          />
          <div className='part-title'>知识点概况<Divider /></div>
          {/* 知识点掌握情况 - 环形图 */}
          <KnowledgeGraspChart
            dataSource={knowledgeOverviewData} 
            loading={knowledgeOverviewLoading}
          />
          {/* 出题难度占比极正确率 - 柱状图联动环形图 */}
          <KnowledgeDifficultyChart
            dataSource={knowledgesData} 
            loading={knowledgesLoading}
          />
          {/* 知识点正确率情况 - 柱状图*/}
          <KnowledgeRightChart
            dataSource={knowledgesData} 
            loading={knowledgesLoading}
          />
        </div>
      : <div className="homework-analysis-empty">
          <ZYIcon type="kongshuju7" />
          <div className="text">暂无数据</div>
        </div>
      }
    </div>
  )
}

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(HomeworkAnalysis);