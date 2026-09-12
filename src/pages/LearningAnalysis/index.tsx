import { Tabs, Button, Tooltip } from 'antd';
import { connect, useDispatch } from '@umijs/max';
import { useEffect, useRef, useState } from 'react';
import { SendOutlined } from '@ant-design/icons';
import { Divider } from 'antd';

import HeaderCourse from '@/components/HeaderCourse'
import ClassStudentList from './components/common/ClassStudentList';
import ReportSendModal from './components/common/ReportSendModal';
import HomeworkAnalysis from './components/homework/HomeworkAnalysis';
import TeacherProfile from '@/pages/TeacherProfile';

import { addTracking, addNewTracking } from '@/utils';
import './index.less'

const LearningAnalysis = (props: any) => {
  const { analysisModel } = props
  const [activeKey, setActiveKey] = useState('profile');
  const dispatch = useDispatch()
  const reportSendModalRef = useRef<any>(null)

  useEffect(() => {
    addNewTracking({
      bt: 'pv',
      ct: 'study_analysis_show'
    })
    addTracking({ page_name: "学情分析" })   // 数据埋点
  }, [])

  const onChangeTab = (key: string) => {
    setActiveKey(key)
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
              { key: 'profile', label: '📊 画像总览' },
              { key: 'kgraph', label: '🕸 知识图谱' },
              { key: 'homework', label: '📝 作业分析' },
            ]}
          />
          {activeKey === 'profile' && <TeacherProfile />}
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
