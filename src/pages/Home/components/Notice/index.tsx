import { useState, useRef } from 'react'
import { Button, Badge } from 'antd'
import { useTeacherContext } from '@/components/LayoutSider'
import { history, useDispatch } from 'umi'
import { ZYIcon } from '@/components'

import { usePolling } from '@/pages/Home/hooks'
import { addNewTracking, getOrgId, getUserInfo } from '@/utils'
import dayjs from 'dayjs'

import './index.less'

const noticeTypeMap: any = {
  'pub_notice': '通知',
  'sys_notice': '系统通知',
  'question': '常见问题',
  'document': '最新文档'
}

export default function Notice() {
  const dispatch = useDispatch()
  const [context] = useTeacherContext()
  const [loading, setLoading] = useState<boolean>(false)
  const [noticeList, setNoticeList] = useState<any[]>([])
  const [total, setTotal] = useState<number>(0)
  const isFirstLoadRef = useRef(true)

  usePolling(async () => {
    if (isFirstLoadRef.current) {
      setLoading(true)
    }
    const { code, data = [] }: any = await dispatch({
      type: "noticePageModel/postData",
      apiUrl: "getNoticeListUrl",
      payload: {
        eid: getUserInfo('edu_id'),
        pageNum: 1,
        pageSize: 10,
        schoolId: getOrgId()
      },
    })
    if (code == 200) {
      setNoticeList(data.list)
      setTotal(data.total)
    }
    if (isFirstLoadRef.current) {
      setLoading(false)
      isFirstLoadRef.current = false
    }
  }, {
    interval: 60 * 1000, // 1分钟
  })

  return (
    <div className='home-notice'>
      <div className='home-notice-header'>
        <div className='title'>
          <span className='text'>消息提醒</span>
          {total > 0 && <span className='count'>共 {total} 条</span>}
        </div>
        {context?.course_id && <div className='right'>
          <Button type='text' onClick={() => {
            history.push('/notice')
            addNewTracking({
              bt: 'cl',
              ct: 'home_msg_remind_view_all_click',
            })
          }}>
            <span>查看全部</span>
            <ZYIcon type='arrow-go' />
          </Button>
        </div>}
      </div>
      <div className='home-notice-content'>
        {loading ? (
          <div className="loading-box">
            <span className="anticon-spin">
              <ZYIcon type="load-color" style={{ fontSize: "30px" }} />
            </span>
            <span className="text">加载中</span>
          </div>
        ) : noticeList.length === 0 ? (
          <div className='empty-box'>
            <ZYIcon type='zanwuxiaoxitixing' className='icon' />
            <span className='text'>暂无消息提醒</span>
          </div>
        ) : (
          <div className='notice-list-box'>
            <div className='notice-list'>
              {noticeList.map((item: any) => (
                <div className='notice-item' key={item.id} onClick={() => {
                  history.push('/notice', { noticeId: item.id })
                  addNewTracking({
                    bt: 'cl',
                    ct: 'home_msg_remind_msg_name_click',
                    ctid: item.id,
                    ctvl: item.noticeTitle,
                  })
                }}>
                  <Badge dot={!item?.read} offset={[-5, 5]} className='dot'>
                    {item?.noticeType === 'shared_homework' ? <div className='avatar'>{item.user_name?.slice(0, 2)}</div> : <div className='avatar notice'><ZYIcon type='xitongxiaoxi' /></div>}
                  </Badge>
                  <div className='con'>
                    <div className='top'>
                      <div className='role-name'>{item?.noticeType === 'shared_homework' ? `${item.user_name}` : item?.noticeTitle}</div>
                      <div className='time'>{dayjs(item.publishTime).format('YYYY-MM-DD HH:mm')}</div>
                    </div>
                    <div className='bottom'>
                      <div className='desc'>{item?.noticeType === 'shared_homework' ? '共享给您一份作业' : `收到一条${noticeTypeMap[item?.noticeType]}`}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className='tips'>点击右上方“查看全部”，查阅全部消息</div>
          </div>
        )}
      </div>
    </div>
  )
}
