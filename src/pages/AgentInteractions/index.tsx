import { useState, useEffect } from 'react'
import { useLocation } from 'umi'
import ClassStudentList from './components/ClassStudentList'
import { ZYIcon } from '@/components'
import { Divider } from 'antd'
import HistoryLog from './components/HistoryLog'
import HistoryLogDetail from './components/HistoryLogDetail'
import { addNewTracking } from "@/utils";

type ViewType = 'history' | 'historyDetail'

import './index.less'

export default function AgentInteractions() {
  const { state }: any = useLocation()
  const [currentView, setCurrentView] = useState<ViewType>('history')
  const [detailRowData, setDetailRowData] = useState<any>(null)

  useEffect(()=>{
    addNewTracking({
      bt: 'pv',
      ct: 'interact_record_show'
    })
  },[])

  useEffect(() => {
    if (state?.detailRowData) {
      handleShowDetail(state.detailRowData)
    }
  }, [state?.detailRowData])

  const handleShowDetail = (rowData: any) => {
    setDetailRowData(rowData)
    setCurrentView('historyDetail')
  }

  const handleBackToHistory = () => {
    setCurrentView('history')
    setDetailRowData(null)
  }

  return (
    <div className="container-wrap">
      <div className="container-wrap-header">互动记录</div>
      <Divider style={{ margin: '12px 0' }} />
      <div className="container-wrap-content">
        <div className="container-wrap-left">
          <ClassStudentList />
        </div>
        <div className="container-wrap-right">
          {currentView === 'historyDetail' &&
            <div className="history-detail-header">
              <button onClick={handleBackToHistory} className="back-button">
                <ZYIcon type="zuo" /> 返回
              </button>
            </div>
          }

          {/* 历史记录 */}
          <div className={currentView === 'historyDetail' ? 'history-log-hidden' : ''}>
            <HistoryLog onShowDetail={handleShowDetail} />
          </div>

          {/* 历史记录详情 */}
          {currentView === 'historyDetail' && (
            <HistoryLogDetail rowData={detailRowData} onBack={handleBackToHistory} />
          )}
        </div>
      </div>
    </div>
  )
}
