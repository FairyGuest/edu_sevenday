import { useState, useEffect, useRef } from 'react'
import { Button, Badge, Tooltip, message, Tag, Divider, Pagination } from 'antd'
import { useDispatch } from 'umi'
import { history, useLocation } from 'umi'
import { ZYIcon } from '@/components'
import { usePolling } from '@/pages/Home/hooks'
import ReceiveHomework from './components/ReceiveHomework'
import dayjs from 'dayjs'
import { getUserInfo, getOrgId, addNewTracking } from '@/utils'

import './index.less'

const noticeTypeMap: any = {
  'pub_notice': '通知',
  'sys_notice': '系统通知',
  'question': '常见问题',
  'document': '最新文档'
}

export default function Notice() {
  const { state }: any = useLocation()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState<boolean>(false)
  const [currentNotice, setCurrentNotice] = useState<any>({})
  const receiveHomeworkRef = useRef<any>(null)
  const [noticeList, setNoticeList] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })
  const pendingNoticeIdRef = useRef(state?.noticeId)
  const isFirstLoadRef = useRef(true)
  const currentNoticeIdRef = useRef(currentNotice?.id)
  currentNoticeIdRef.current = currentNotice?.id

  useEffect(() => {
    if (pendingNoticeIdRef.current != null) {
      history.replace('/notice')
    }
    addNewTracking({
      bt: 'pv',
      ct: 'msg_list_show',
    })
  }, [])

  const getNoticeList = async (pageNum = pagination.current, showLoading = false) => {
    if (showLoading) {
      setLoading(true)
    }
    const { code, data = [] }: any = await dispatch({
      type: "noticePageModel/postData",
      apiUrl: "getNoticeListUrl",
      payload: {
        eid: getUserInfo('edu_id'),
        pageNum,
        pageSize: pagination.pageSize,
        schoolId: getOrgId()
      },
    })
    if (code == 200) {
      const list = data.list || []
      setNoticeList(list)
      setPagination((prev) => ({
        ...prev,
        current: pageNum,
        total: data.total || 0,
      }))
      const noticeId = pendingNoticeIdRef.current
      pendingNoticeIdRef.current = undefined
      if (noticeId != null) {
        const notice = list.find((item: any) => item.id == noticeId)
        if (notice) {
          setCurrentNotice(notice)
          if (!notice.read) readNotice(notice, list)
        }
      } else if (currentNoticeIdRef.current != null) {
        const notice = list.find((item: any) => item.id === currentNoticeIdRef.current)
        if (notice) {
          setCurrentNotice(notice)
        }
      }
    }
    if (showLoading) {
      setLoading(false)
    }
  }

  usePolling(async () => {
    await getNoticeList(pagination.current, isFirstLoadRef.current)
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false
    }
  }, {
    interval: 60 * 1000, // 1分钟
  })

  // 已读消息
  const readNotice = async (item: any, list: any[] = []) => {
    const { code, data }: any = await dispatch({
      type: 'noticePageModel/postData',
      apiUrl: 'noticeReadUrl',
      payload: {
        eid: getUserInfo('edu_id'),
        noticeId: item.id,
        noticeType: item.noticeType
      },
    })
    if (code == 200) {
      setNoticeList(list.map((i: any) => 
        i.id == item.id 
        ? { ...i, read: 1 } 
        : i
      ))
    } else {
      message.error(data?.msg)
    }
  }

  // 已读全部消息
  const readAllNotice = async() => {
    const { code, data }: any = await dispatch({
      type: 'noticePageModel/postData',
      apiUrl: 'noticeReadAllUrl',
      payload: {
        eid: getUserInfo('edu_id'),
        schoolId: getOrgId()
      },
    })

    if (code == 200) {
      message.success('消息全部已读')
      setNoticeList(noticeList.map((item: any) => ({ ...item, read: 1 })))
    } else {
      message.error(data?.msg)
    }
  }

  const receiveHomework = () => {
    receiveHomeworkRef?.current.openModal()
  }

  const handleCurrentNotice = (item: any) => {
    setCurrentNotice(item)
    if (!item.read) {
      readNotice(item, noticeList)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentNotice({})
    getNoticeList(page, true)
  }

  return (
    <div className='notice'>
      <div className='notice-header'>
        <Button type='text' className='back' onClick={() => history.back()}>
          <ZYIcon type='zuo' />返回
        </Button>
      </div>
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
        <div className='notice-content'>
          <div className='notice-list-box'>
            <div className='title'>
              <span className='text'>全部消息</span>
              <Tooltip title='全部已读'>
                <Button 
                  type='text' 
                  className='clear' 
                  icon={<ZYIcon type='quanbuyidu' />} 
                  onClick={() => readAllNotice()} 
                />
              </Tooltip>
            </div>
            <div className='notice-list'>
              {noticeList.map((item: any) => (
                <div
                  className={`notice-item ${currentNotice?.id === item?.id ? 'active' : ''}`}
                  key={item.id}
                  onClick={() => {
                    addNewTracking({
                      bt: 'cl',
                      ct: 'msg_list_click',
                      ctid: item.id,
                      ctvl: item.noticeTitle,
                    })
                    handleCurrentNotice(item)
                  }}>
                  <Badge dot={!item?.read} offset={[-5, 5]} className='dot'>
                    {item?.noticeType === 'shared_homework' 
                      ? <div className='avatar'>{item.user_name?.slice(0, 2)}</div> 
                      : <div className='avatar notice'>
                          <ZYIcon type='xitongxiaoxi' />
                        </div>
                    }
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
            {pagination.total > pagination.pageSize && (
              <div className='notice-pagination'>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showSizeChanger={false}
                  size='small'
                  onChange={handlePageChange}
                />
              </div>
            )}
          </div>
          <div className='notice-detail'>
            {!currentNotice?.id ? (
              <div className='notice-detail-empty'>
                <ZYIcon type='zanwuxiaoxitixing' className='icon' />
                <span className='text'>请选择一条消息查看详情</span>
              </div>
            ) : currentNotice?.noticeType === 'shared_homework' ? (
              <div className='notice-detail-content'>
                <div className='work-box'>
                  <div className='con-box'>
                    <div className='title'>共享给您一份作业</div>
                    <div className='info'>
                      <Tag color='blue'>共享作业</Tag>
                      <span>发布时间：{dayjs(currentNotice?.publishTime).format('YYYY-MM-DD HH:mm')} · 共享人：{currentNotice?.user_name}</span>
                    </div>
                    <Divider />
                    <p className='text'>{currentNotice?.description}</p>
                    <Button className='btn' onClick={() => receiveHomework()}>接收作业</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className='notice-detail-content'>
                <iframe
                  src={currentNotice?.shareUrl}
                  className='iframe'
                />
              </div>
            )}
          </div>
          <ReceiveHomework onRef={receiveHomeworkRef} notice={currentNotice} />
        </div>
      )}
    </div>
  )
}
