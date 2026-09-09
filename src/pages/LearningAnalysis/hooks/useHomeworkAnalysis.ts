import { useCallback, useMemo, useState } from 'react'
import { useDispatch } from '@umijs/max'
import { message } from 'antd'
import dayjs from 'dayjs'

const API_CONFIG = {
  baseInfo: {
    personal: 'getBaseInfoUrl',
    class: 'getClassBaseInfoUrl',
  },
  homework: {
    personal: 'getHomeworkDataUrl',
    class: 'getClassHomeworkDataUrl',
  },
  knowledgeOverview: {
    personal: 'getKnowledgeOverviewDataUrl',
    class: 'getClassKnowledgeOverviewDataUrl',
  },
  knowledges: {
    personal: 'getKnowledgesDataUrl',
    class: 'getClassKnowledgesDataUrl',
  },
}

const H5_API_CONFIG = {
  baseInfo: 'h5GetBaseInfoUrl',
  homework: 'h5GetHomeworkDataUrl',
  knowledgeOverview: 'h5GetKnowledgeOverviewUrl',
  knowledges: 'h5GetKnowledgesUrl',
}

type ApiType = keyof typeof API_CONFIG
type H5ApiType = keyof typeof H5_API_CONFIG
type AnalysisType = 'personal' | 'class'

interface RequestParams {
  selectedClass: any
  selectedStudent?: any
  courseId: string | null
  userId: string | null
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null
  analysisType: string
}

interface H5RequestParams {
  courseId: string | null
  classId: string | null
  startTime: string | null
  endTime: string | null
  userId: string | null
  phone: string | null
  studentId: string | null
  eduId: string | null
}

/**
 * 基础请求 hook，负责 loading/data 状态管理和 dispatch 调用
 */
const useBaseRequest = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const sendRequest = useCallback(async (apiUrl: string, payload: any) => {
    setLoading(true)
    const { code, data: resData }: any = await dispatch({
      type: 'analysisModel/postData',
      apiUrl,
      payload,
    })
    if (code === 200) {
      setData(resData)
    } else {
      message.error(resData?.msg || '请求失败')
    }
    setLoading(false)
    return { code, data: resData }
  }, [dispatch])

  return { data, loading, sendRequest }
}

/**
 * 通用分析请求 hook
 * @param apiType - 接口类型：baseInfo | homework | knowledgeOverview | knowledges
 */
const useAnalysisRequest = (apiType: ApiType) => {
  const { data, loading, sendRequest } = useBaseRequest()
  const curOrg = useMemo(() => JSON.parse(localStorage.getItem('curOrg') || '{}'), [])

  const request = useCallback(
    async (params: RequestParams) => {
      const { selectedClass, selectedStudent, courseId, userId, dateRange, analysisType } = params

      if (!dateRange) {
        console.warn('日期是必传参数')
        return { code: -1, data: null }
      }

      const apiUrl = API_CONFIG[apiType][analysisType as AnalysisType]
      const payload = {
        class_id: selectedClass?.value,
        course_id: courseId,
        user_id: userId,
        start_time: dayjs(dateRange[0]).format('YYYY-MM-DD'),
        end_time: dayjs(dateRange[1]).format('YYYY-MM-DD'),
        ...(analysisType === 'personal'
          ? { student_id: selectedStudent?.id }
          : { org_id: curOrg?.id || '' }),
      }

      return sendRequest(apiUrl, payload)
    },
    [apiType, curOrg?.id, sendRequest]
  )

  return { data, loading, request }
}

/**
 * H5 通用分析请求 hook
 * @param apiType - 接口类型：baseInfo | homework | knowledgeOverview | knowledges
 */
const useH5AnalysisRequest = (apiType: H5ApiType) => {
  const { data, loading, sendRequest } = useBaseRequest()

  const request = useCallback(
    async (params: H5RequestParams) => {
      const { courseId, classId, startTime, endTime, userId, phone, studentId, eduId } = params

      const apiUrl = H5_API_CONFIG[apiType]
      const payload = {
        course_id: courseId,
        class_id: classId,
        start_time: startTime,
        end_time: endTime,
        user_id: userId,
        phone,
        student_id: studentId,
        edu_id: eduId
      }

      return sendRequest(apiUrl, payload)
    },
    [apiType, sendRequest]
  )

  return { data, loading, request }
}

export { useAnalysisRequest, useH5AnalysisRequest }
export type { RequestParams, AnalysisType, H5RequestParams, H5ApiType }