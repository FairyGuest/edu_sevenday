import { useState } from 'react'
import { connect, useDispatch } from '@umijs/max'
import { Pagination, Divider, Tag } from 'antd'
import FilterBar from '../FilterBar'
import { ZYIcon } from '@/components'
import { useTeacherContext } from '@/components/LayoutSider'
import dayjs from 'dayjs'
import { getOrgId,addNewTracking } from '@/utils'
interface HistoryLogProps {
  agentInteractionsModel?: any
  onShowDetail?: (rowData: any) => void
}

import mokeData from '../../moke'
const { historyLogData } = mokeData

import './index.less'

const HistoryLog = (props: HistoryLogProps) => {
  const { onShowDetail } = props
  const dispatch = useDispatch()
  const [c, _, setContext] = useTeacherContext()

  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState<number>(0)
  const [listLoading, setListLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)
  const [currentFilterParams, setCurrentFilterParams] = useState<any>(null)

  // 查询数据列表（点击查询按钮或切换班级/学生/教材时调用）
  const onSearch = async (filterParams: any) => {
    setCurrentFilterParams(filterParams)
    setPage(1)
    setPageSize(20)
    setContext({ subjectName: filterParams?.subject })
    getHistoryLogList({
      page: 1,
      pageSize: 20,
      ...filterParams,
    })
  }

  const onPageChange = (pageIndex: number, newPageSize: number) => {
    setPage(pageIndex)
    setPageSize(newPageSize)
    getHistoryLogList({
      page: pageIndex,
      pageSize: newPageSize,
      org_id: getOrgId(),
      is_save_config: 1,
      ...currentFilterParams,
    })
  }

  const getHistoryLogList = async (payload: any) => {
    // console.log(payload, '------')
    // setData(formatHistoryLogList(historyLogData.data.list))
    // return
    setListLoading(true)
    const { code, data = [] }: any = await dispatch({
      type: "agentInteractionsModel/postData",
      apiUrl: "getHistoryLogListUrl",
      payload,
    })
    if (code == 200) {
      setData(data.total > 0 ? formatHistoryLogList(data.list) : [])
      setTotal(data.total)
    }
    setListLoading(false)
  }

  const formatHistoryLogList = (rawList: Record<string, any[]> = {}) => {
    const dateTypes = [
      { date: '今日', key: 'today' },
      { date: '7天内', key: 'seven' },
      { date: '一个月内', key: 'month' },
      { date: '超过一个月', key: 'more_month' },
    ]

    return dateTypes.reduce((result: any[], type) => {
      const list = Array.isArray(rawList[type.key]) ? rawList[type.key] : [];
      if (list.length > 0) {
        result.push({
          date: type.date,
          list,
        });
      }
      return result;
    }, []);
  }

  return (
    <div className="history-log-container">
      <FilterBar onSearch={onSearch} />
      <div className="list-wrap">
        {listLoading
          ? <div className="list-loading">
              <span className="anticon-spin">
                <ZYIcon type="load-color" style={{ fontSize: "30px" }} />
              </span>
              <span className="text">加载中</span>
            </div>
          : <>
            {data.length > 0
              ? <div className="list-box">
                  {data.map((dateItem: any) => (
                    <div className='date-item' key={dateItem.date}>
                      <div className='date-item-title'>{dateItem.date}</div>
                      <div className='date-item-list'>
                        {dateItem.list.map((item: any, index: number) => (
                          <div className='list-item' key={index} onClick={() => {
                            addNewTracking({
                              bt: 'cl',
                              ct: 'interact_record_title_click',
                              ctid: item?.record_id,
                              ctvl: item?.title
                            })
                            addNewTracking({
                              bt: 'pv',
                              ct: 'interact_record_content_show',
                              ctid: item?.record_id,
                              ctvl: item?.title
                            })
                            onShowDetail?.(item)
                          }}>
                            <div className='list-item-top'>
                              <img src={item?.assistant_avatar_url} alt={item?.user_name} className='avatar' />
                              <div className='title-box'>
                                <div className='title'>{item?.title}</div>
                                {/* {item.stem_image_url && <img src={item.stem_image_url} className='topic-img' alt={item.title} />} */}
                                {item?.question_type === 'AI教师' ? <ZYIcon type="dianhua" /> : null}
                              </div>
                            </div>
                            <div className='list-item-bottom'>
                              <div className='left'>
                                <span className='text'>{item?.assistant_name}</span>
                                {item?.assistant_name
                                  && item?.question_type
                                  && item?.assistant_name !== item?.question_type
                                  && <Divider type='vertical' style={{ margin: '2px 0 0 0' }} />
                                }
                                {item?.assistant_name !== item?.question_type
                                  && <span className='text'>{item?.question_type}</span>
                                }
                                {item?.question_type === '今日练习' && (
                                  <div className='practice-info'>
                                    {item?.qtype_distribution &&
                                      <>
                                        <Divider type='vertical' style={{ margin: '2px 0 0 0' }} />
                                        <div className="practice-info-group">
                                          <ZYIcon type='tixing2' size='14' />
                                          {item?.qtype_distribution?.single_choice && <span className='text'>单选题 {item?.qtype_distribution?.single_choice_voice ? item?.qtype_distribution?.single_choice + item?.qtype_distribution?.single_choice_voice : item?.qtype_distribution?.single_choice}</span>}
                                          {item?.qtype_distribution?.syllable_compose && <span className='text'>单词拼合题 {item?.qtype_distribution?.syllable_compose}</span>}
                                        </div>
                                      </>
                                    }
                                    <Divider type='vertical' style={{ margin: '2px 0 0 0' }} />
                                    {/* {item?.kp_num && <div className="practice-info-group">
                                      <ZYIcon type='shejizhishidian' size='14' />
                                      <span className='text' style={{ marginRight: 2 }}>涉及知识点 {item?.kp_num}</span>
                                    </div>} */}
                                    <Tag bordered={false} className={Number((item?.correct_rate * 100).toFixed(2)) >= 60 ? 'success' : 'error'}>正确率 {(item?.correct_rate * 100).toFixed(2)}%</Tag>
                                  </div>
                                )}
                              </div>
                              <div className='right'>
                                <span className='text'>{item?.user_name}</span>
                                <Divider type='vertical' style={{ margin: '0 12px' }} />
                                <span className='text'>{dayjs(item?.created_at_ts * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Pagination
                    total={total}
                    align='center'
                    showTotal={(total: number) => `共 ${total} 条`}
                    pageSize={pageSize}
                    current={page}
                    className='list-pagination'
                    onChange={onPageChange}
                  />
                </div>
              : <div className="list-empty">
                  <ZYIcon type="kongshuju7" className="icon" />
                  <div className="text">暂无数据</div>
                </div>
            }
          </>
        }
      </div>
    </div>
  )
}

export default connect((state: any) => ({
  agentInteractionsModel: state.agentInteractionsModel,
}))(HistoryLog)
