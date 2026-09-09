import { useState, useImperativeHandle } from 'react'
import { useDispatch } from 'umi'
import { Modal, Button, Space, Checkbox, message } from 'antd'
import { ZYIcon } from '@/components'

import { getUserInfo } from '@/utils'
import { addNewTracking } from "@/utils";

import './index.less'

export default function ReceiveHomework({
  onRef,
  notice,
}: {
  onRef: any;
  notice: any;
}) {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lessonData, setLessonData] = useState<any>({})
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [accepting, setAccepting] = useState(false)

  const getShareLessonData = async () => {
    setLoading(true)
    const { code, data }: any = await dispatch({
      type: "noticePageModel/getData",
      apiUrl: "getCourseListUrl",
      payload: {
        notice_id: notice?.id,
        edu_id: getUserInfo('edu_id'),
      },
    })
    if (code === 200) {
      setLessonData(data)
      const choosedCourseIds = (data?.courses || [])
        .filter((item: any) => item?.is_choosed)
        .map((item: any) => item?.id)
      if (choosedCourseIds.length > 0) {
        setSelectedIds(choosedCourseIds)
      } else if (data?.courses?.length === 1) {
        setSelectedIds([data.courses[0].id])
      }
      addNewTracking({
        bt: 'pv',
        ct: 'home_receive_shared_exercise_modal_show',
        ctid: data?.exam_id,
        ctvl: data?.exam_title
      })
    }
    setLoading(false)
  }
  useImperativeHandle(onRef, () => ({
    openModal: () => {
      setSelectedIds([])
      setOpen(true)
      getShareLessonData()
    }
  }))
  const onCancel = () => {
    setOpen(false)
    setSelectedIds([])
    addNewTracking({
      bt: 'cl',
      ct: 'home_receive_shared_exercise_modal_close_click',
      ctid: lessonData?.exam_id,
      ctvl: lessonData?.exam_title
    })
  }

  const toggleLesson = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    )
  }

  const handleAccept = async () => {
    const selectedLessons = lessonData?.courses?.filter((item: any) => selectedIds.includes(item?.id))
    if (selectedLessons.length === 0) {
      message.warning('请至少选择一个课程')
      return
    }
    const payload = {
      exam_id: lessonData?.exam_id,
      share_id: lessonData?.id,
      edu_id: getUserInfo('edu_id'),
      course_ids: selectedLessons?.map((item: any) => item?.id)
    }
    setAccepting(true)
    const { code, data }: any = await dispatch({
      type: "noticePageModel/postData",
      apiUrl: "receiveHomeworkUrl",
      payload,
    })
    if (code === 200) {
      message.success('接收成功')
      onCancel()
      addNewTracking({
        bt: 'cl',
        ct: 'home_receive_shared_exercise_modal_accept_click',
        ctid: lessonData?.exam_id,
        ctvl: lessonData?.exam_title
      })
    } else {
      message.error(data?.msg)
    }
    setAccepting(false)
  }

  return (
    <Modal 
      title='接收共享作业' 
      open={open} 
      onCancel={onCancel} 
      width={664}
      footer={
        <Space>
          <Button className='btn' onClick={onCancel}>取消</Button>
          <Button type='primary' className='btn' onClick={handleAccept} disabled={loading || lessonData?.courses?.length === 0 || accepting}>接收</Button>
        </Space>
      }
      destroyOnHidden={true}
      className='receive-homework-modal'
    >
      {loading 
        ? <div className="loading-box">
            <span className="anticon-spin">
              <ZYIcon type="load-color" style={{ fontSize: "30px" }} />
            </span>
            <span className="text">加载中</span>
          </div>
        : (
          <div className='content'>
            <div className='tips'>{notice?.description}</div>
            {lessonData?.courses?.length > 0 ? (
              <div className='lesson-list'>
                {lessonData?.courses?.map((item: any) => (
                  <div key={item.id} className='lesson-item'>
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) => toggleLesson(item.id, e.target.checked)}
                    >
                      {item.title}
                    </Checkbox>
                  </div>
                ))}
              </div>
            ) : (
              <div className='empty-box'>
                <ZYIcon type='kongshuju7' className='icon' />
                <span className='text'>暂无符合当前共享作业学科学段的课程</span>
              </div>
            )}
          </div>
        )}
    </Modal>
  )
}
