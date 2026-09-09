import { useState, useRef, useEffect } from 'react'
import { connect, history, useDispatch } from 'umi'
import { Divider, Select, Button, Badge } from 'antd'

import CourseCardModal from '../Course/components/CourseCardModal'
import Interaction from './components/Interaction'
import Homework from './components/Homework'
import Agent from './components/Agent'
import Notice from './components/Notice'
import { useTeacherContext } from '@/components/LayoutSider'
import { ZYIcon } from '@/components'
import { usePolling } from '@/pages/Home/hooks'

import dayjs from 'dayjs';
import { getCurOrgValue, getUserInfo, getOrgId } from "@/utils";

import courseEmptyBg from "@/assets/homeEmptyImg.png";
import { SwapOutlined, PlusOutlined } from '@ant-design/icons'
import { addNewTracking } from "@/utils";
import './index.less'

const zhWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

// 切换学校选择器
const SchoolSelector = () => {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    addNewTracking({
      bt: 'pv',
      ct: 'home_show'
    })
  }, [])

  const handleSuffixClick = (e: any) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const changeSchool = async (value: any, option: any) => {
    const { code, data }: any = await dispatch({
      type: "homePageModel/postData",
      apiUrl: "postSaveDefaultOrgUrl",
      payload: {
        org_id: option?.id,
      }
    })
    if (code == 200) {
      addNewTracking({
        bt: 'cl',
        ct: 'home_switch_org_click'
      })
      localStorage.setItem("curOrg", JSON.stringify(option)); // 设置当前学校
      window.location.reload();
    }

  };

  return (
    <div className="select-box">
      <Select
        className='select-box-selector'
        open={open}
        placeholder="请选择"
        value={getCurOrgValue()}
        size='large'
        popupMatchSelectWidth={false}
        onClick={handleSuffixClick}
        suffixIcon={<SwapOutlined className='icon' />}
        onChange={(value, option) => changeSchool(value, option)}
        onBlur={() => setOpen(false)}
        options={
          getUserInfo('org_list')?.map?.((item: any) => ({
            ...item,
            label: item?.title,
            value: item?.id,
          })) || []
        }
      />
    </div>
  )
}

const Home = () => {
  const dispatch = useDispatch()
  const userInfo: any = JSON.parse(localStorage.getItem("userInfo") || '{}')
  const courseCardModalRef = useRef<{ openModal: () => void }>();
  const [context, contextLoading, setContext] = useTeacherContext();
  const [noticeUnreadCount, setNoticeUnreadCount] = useState<number>(0)

  const createCourseCallback = (courseData: any) => {
    history.push('/teach/course')
    if (!context?.course_id) {
      setContext({ courseId: courseData?.id })
    }
  }

  usePolling(async () => {
    const { code, data }: any = await dispatch({
      type: "homePageModel/postData",
      apiUrl: "getNoticeUnreadCountUrl",
      payload: {
        eid: getUserInfo('edu_id'),
        schoolId: getOrgId()
      },
    })
    if (code == 200) {
      setNoticeUnreadCount(data)
    }
  }, {
    interval: 60 * 1000, // 1分钟
  })

  return (
    <div className='home-wrap'>
      <header>
        <div className='title'>
          <div className='hello'>您好！{userInfo?.name}老师～</div>
          <div className='more-actions'>
            <div className='notice-badge' onClick={() => {
              history.push('/notice')
              addNewTracking({
                bt: 'cl',
                ct: 'home_msg_remind_msg_tag_click',
              })
            }}>
              <Badge dot={noticeUnreadCount > 0} offset={[-3, 2]}>
                <ZYIcon type='xiaoxitongzhi' className='notice-badge-icon' />
              </Badge>
              <span className='notice-badge-text'>消息({noticeUnreadCount})</span>
            </div>
            <Divider type='vertical' />
            <SchoolSelector />
          </div>
        </div>
        <div className='greeting'>今天是{dayjs().format('YYYY年M月D日')}{zhWeek[dayjs().day()]}，欢迎进入工作台，开始一天的工作吧！</div>
      </header>

      {/* 没有课程时展示 */}
      {!contextLoading && !context?.course_id && <section className='banner'>
        <div className='create-box'>
          <div className='create-box-content'>
            <p className='title'>欢迎体验智启教育平台！</p>
            <p className='subtitle'>请先创建课程，再布置作业。您布置的作业将会关联至课程。</p>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => courseCardModalRef.current?.openModal()}
            >创建课程</Button>
          </div>
        </div>
        <img src={courseEmptyBg} alt="banner" className='banner-img' />
      </section>
      }

      <section className='content'>
        <div className='homework-card'><Homework /></div>
        <div className='interaction-card'><Interaction /></div>
        <div className='agent-card'><Agent /></div>
        <div className='notice-card'><Notice /></div>
      </section>

      {/* 创建课程 Modal */}
      <CourseCardModal
        onRef={courseCardModalRef}
        onFinish={createCourseCallback}
      />
    </div>
  )
}
export default connect(({ homePageModel }: any) => ({
  homePageModel,
}))(Home);
