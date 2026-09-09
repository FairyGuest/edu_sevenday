import { useRef } from 'react'
import { notification } from 'antd'
import { history, useLocation } from 'umi'
import { usePolling } from '@/pages/Home/hooks'
import { getDataService } from '@/services'
import { ZYIcon } from '@/components'
import { getOrgId } from '@/utils'

const noticeTypeMap: Record<string, string> = {
  pub_notice: '通知',
  sys_notice: '系统通知',
  question: '常见问题',
  document: '最新文档',
  shared_homework: '共享作业',
}

const hasNewNoticeContent = (data: unknown) => {
  if (data == null || data === '') return false
  if (Array.isArray(data)) return data.length > 0
  if (typeof data === 'object') return Object.keys(data as object).length > 0
  return true
}

const getNoticeKey = (data: any) => {
  if (data?.id != null) return String(data.id)
  if (Array.isArray(data) && data[0]?.id != null) return String(data[0].id)
  return JSON.stringify(data)
}

// 全局轮询新消息，有内容时右上角提示
export const useNewNoticePolling = () => {
  // const location = useLocation()
  // const locationRef = useRef(location)
  // locationRef.current = location

  // const lastNotifiedKeyRef = useRef('')

  // usePolling(async () => {
  //   const schoolId = getOrgId()
  //   if (!schoolId) return

  //   const { code, data }: any = await getDataService(
  //     { schoolId },
  //     'getNewNoticeUrl',
  //   )

  //   if (code !== 200 || !hasNewNoticeContent(data)) return
  //   if (locationRef.current.pathname === '/notice') return

  //   const noticeKey = getNoticeKey(data)
  //   if (noticeKey === lastNotifiedKeyRef.current) return
  //   lastNotifiedKeyRef.current = noticeKey

  //   const fromPath = locationRef.current.pathname
  //   const noticeTypeLabel = noticeTypeMap[data?.noticeType] ?? '新消息'

  //   notification.open({
  //     key: 'new-notice',
  //     message: <div style={{ cursor: 'pointer' }}>你收到一条 <b>{noticeTypeLabel}</b> ，点击查看详情</div>,
  //     placement: 'topRight',
  //     icon: (
  //       <ZYIcon
  //         type="xiaoxitongzhi"
  //         style={{ fontSize: 22, color: '#1C6CFF' }}
  //       />
  //     ),
  //     onClick: () => {
  //       notification.destroy('new-notice')
  //       history.push('/notice', { from: fromPath, noticeId: data?.id })
  //     },
  //   })
  // }, { 
  //   enabled: !!getOrgId(),
  //   interval: 60 * 1000, // 1分钟
  // })
}
