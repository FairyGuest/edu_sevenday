import { Tabs, Button, Tooltip } from 'antd';
import { connect, useDispatch, useLocation } from '@umijs/max';
import { useEffect, useRef, useState } from 'react';
import { SendOutlined } from '@ant-design/icons';
import { Divider } from 'antd';

import HeaderCourse from '@/components/HeaderCourse'
import ClassStudentList from './components/common/ClassStudentList';
import ReportSendModal from './components/common/ReportSendModal';
import HomeworkAnalysis from './components/homework/HomeworkAnalysis';
import TeacherProfile from '@/pages/TeacherProfile';
import PersonalAnalysis from './components/personal/PersonalAnalysis';

import { addTracking, addNewTracking } from '@/utils';
import { replacePageQuery } from '@/utils/pageQuery';
import './index.less'

const LearningAnalysis = (props: any) => {
  const { analysisModel } = props
  const location = useLocation()
  const tabFromSearch = (search: string) => {
    const tab = new URLSearchParams(search).get('tab') || 'profile'
    return ['profile', 'personal', 'kgraph', 'homework'].includes(tab) ? tab : 'profile'
  }
  const [activeKey, setActiveKey] = useState(() => tabFromSearch(location.search))
  const dispatch = useDispatch()
  const reportSendModalRef = useRef<any>(null)
  const previousSearch = useRef<string | null>(null)

  useEffect(() => {
    addNewTracking({
      bt: 'pv',
      ct: 'study_analysis_show'
    })
    addTracking({ page_name: "学情分析" })   // 数据埋点
  }, [])

  // URL changes (including Back/Forward) take precedence; model actions update the URL.
  useEffect(() => {
    if (previousSearch.current !== location.search) {
      previousSearch.current = location.search
      const tab = tabFromSearch(location.search)
      setActiveKey(tab)
      if (analysisModel?.currentAnalysisTab !== tab) dispatch({ type: 'analysisModel/updateState', res: { currentAnalysisTab: tab } })
      return
    }
    const tab = analysisModel?.currentAnalysisTab
    if (tab && tab !== activeKey) {
      setActiveKey(tab)
      replacePageQuery({ tab: tab === 'profile' ? null : tab, ...(tab !== 'personal' ? { student_id: null } : {}) })
    }
  }, [location.search, analysisModel?.currentAnalysisTab])

  const onChangeTab = (key: string) => {
    setActiveKey(key)
    // URL ?tab= 同步（刷新后停留在当前 Tab；班级学情为默认不写）
    replacePageQuery({ tab: key === 'profile' ? null : key, ...(key !== 'personal' ? { student_id: null } : {}) })
    dispatch({
      type: 'analysisModel/updateState',
      res: {
        currentAnalysisTab: key
      }
    })
  }

  const sendDisabled = activeKey !== 'homework'
  const selectedClass = analysisModel?.selectedClass

  return (
    <div className="analysis-wrap">
      <div className="analysis-header">
        <div className="analysis-header-title">学情分析</div>
        <HeaderCourse />
        <div className="analysis-header-divider" />
        <ClassStudentList />
      </div>
      <Divider style={{ margin: '12px 0' }} />
      <div className="analysis-content">
        <div className="analysis-main">
          <Tabs
            activeKey={activeKey}
            onChange={onChangeTab}
            tabBarExtraContent={{
              right: (
                <Tooltip title={sendDisabled ? '请切换到「作业分析」标签页后发送' : ''}>
                  <Button
                    className="analysis-send-btn"
                    type="primary"
                    ghost
                    icon={<SendOutlined />}
                    disabled={sendDisabled}
                    onClick={() => reportSendModalRef.current?.openModal()}
                  >
                    发送到助学端
                  </Button>
                </Tooltip>
              )
            }}
            items={[
              // v2.0-G1：画像总览更名「班级学情」；G2：新增「个人学情」Tab
              { key: 'profile', label: '📊 班级学情' },
              { key: 'personal', label: '👤 个人学情' },
              { key: 'kgraph', label: '🕸 知识图谱' },
              { key: 'homework', label: '📝 作业分析' },
            ]}
          />
          {activeKey === 'profile' && <TeacherProfile />}
          {activeKey === 'personal' && <PersonalAnalysis />}
          {activeKey === 'kgraph' && <TeacherProfile variant="kgraph" />}
          {activeKey === 'homework' && <HomeworkAnalysis />}
        </div>
      </div>
      {/* 发送报告弹窗：学生选择在弹窗内完成 */}
      <ReportSendModal
        onRef={reportSendModalRef}
        studentList={selectedClass?.students || []}
        selectedClass={selectedClass}
      />
    </div>
  )
}

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(LearningAnalysis)
