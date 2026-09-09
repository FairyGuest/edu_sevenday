import { useEffect, useState, useRef, useMemo } from 'react'
import { connect, useDispatch, useLocation } from '@umijs/max'
import { Divider, Image, Button } from 'antd'
import { ZYIcon } from '@/components'
import MarkdownRender from '@/components/MarkdownRender'
import ActionButtons from '../ActionButtons'
import ContentParser from '../AssayContentParser'
import ImageViewer, { ImageItem } from '../../../../components/ImageViewer'
import AudioPlayer from '@/pages/ResourceSearch/components/AudioPlayer'

import { copyText } from '@/utils'

import mokeData from '../../moke'
const { historyLogDetailData, practiceData } = mokeData

import './index.less'

const AnswerContent = ({ item }: { item: any }) => {
  return (
    <div className='answer-content'>
      <MarkdownRender>{item?.output_content}</MarkdownRender>
      <div className='tips'>
        <div className='text'>以上内容由AI生成，仅供参考和借鉴</div>
        <Divider type='vertical' style={{ margin: '0 12px 0 16px' }} />
        <ActionButtons 
          id={item?.id}
          upvoteStatus={item?.message_like?.is_like}
          downvoteStatus={item?.message_like?.is_dislike}
          content={item?.output_content}
        />
      </div>
    </div>
  )
}

const QAList = ({ 
  listData, 
  rowData 
}: { 
  listData: any, 
  rowData: any 
}) => {
  return (
    <div className="detail-content-list">
      {listData.map((item: any) => (
        <div className="detail-content-item" key={item.id}>
          <div className="question-box">
            <div className='question-content'>
              <div className='content'>{item.input_content}</div>
              {item.input_image_urls && item.input_image_urls.length > 0 &&
                <div className='image-box'>
                  <Image.PreviewGroup>
                    {item.input_image_urls.map((image: any) => (
                      <Image
                        key={image}
                        alt="svg image"
                        width={180}
                        src={image}
                        className='image'
                      />
                    ))}
                  </Image.PreviewGroup>
                </div>
              }
            </div>
            <ZYIcon type="Avatar" className='icon-avatar' />
          </div>
          <div className='answer-box'>
            <img src={rowData.assistant_avatar_url} alt={rowData.assistant_name} className='agent-avatar' />
            <AnswerContent item={item} />
          </div>
        </div>
      )
    )}
  </div>
  )
}

const PageQuestions = ({ questions }: { questions: any }) => {
  const [showIndex, setShowIndex] = useState<number>(0)

  return (
    <div className='page-questions'>
      <div className='tab-list'>
        {questions.map((q: any, index: number) => (
          <div className={`tab-item ${showIndex === index ? 'active' : ''} ${q.isWrong ? 'wrong' : ''}`} key={index} onClick={() => setShowIndex(index)}>
            {index + 1}
          </div>
        ))}
      </div>
      <Divider style={{ margin: '0' }} />
      <div className='question-box'>
        {questions?.map((question: any, index: number) => (
          <div 
            className={`question-item ${showIndex === index ? 'show' : 'hide'}`} 
            key={question.question_id}
          >
            <AnswerContent item={question.question_detail} />
          </div>
        ))}
      </div>
    </div>
  )
}

const HistoryLogDetail = ({
  rowData,
  onBack,
  agentInteractionsModel
}: {
  rowData?: any | null
  onBack?: () => void
  agentInteractionsModel?: any
}) => {
  const { state }: any = useLocation()
  const dispatch = useDispatch()
  const prevSelectedRef = useRef<{ class: any; student: any; } | null>(null)
  const isDirectJumpRef = useRef(Boolean(state?.detailRowData))
  const hasSkippedAutoBackRef = useRef(false)
  const { selectedStudent, selectedClass } = agentInteractionsModel

  const [detailLoading, setDetailLoading] = useState<boolean>(false)
  const [detailData, setDetailData] = useState<any>(null)
  const [correctionData, setCorrectionData] = useState<any>(null)
  const [correctionAdditionalData, setCorrectionAdditionalData] = useState<any>(null)
  
  const [imageList, setImageList] = useState<any>([])
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const assayData = useMemo(() => rowData?.extra?.analysis, [rowData])
  const photoPagesData = useMemo(() => rowData?.extra?.photo_pages || [], [rowData])

  useEffect(() => {
    const imgArr = photoPagesData?.map((i: any) => ({
      url: i.page_img_url,
      name: i.page_id
    }))
    setImageList(imgArr)
    setSelectedImage(imgArr[0])
  }, [photoPagesData])

  useEffect(() => {
    if (rowData) {
      if (rowData.question_type === '今日练习') {
        loadPracticeDetailData(rowData)
      } else {
        loadDetailData(rowData)
      }
    }
  }, [rowData])

  useEffect(() => {
    const prevSelected = prevSelectedRef.current
    if (prevSelected === null) {
      prevSelectedRef.current = { class: selectedClass, student: selectedStudent }
      return
    }
    
    const classChanged = prevSelected.class !== selectedClass
    const studentChanged = prevSelected.student !== selectedStudent
    
    if (classChanged || studentChanged) {
      // 首页直达详情时，初始化阶段的班级/学生自动同步会触发一次变更，这里跳过一次。
      if (isDirectJumpRef.current && !hasSkippedAutoBackRef.current) {
        hasSkippedAutoBackRef.current = true
        prevSelectedRef.current = { class: selectedClass, student: selectedStudent }
        return
      }
      onBack?.()
      prevSelectedRef.current = { class: selectedClass, student: selectedStudent }
    }
  }, [selectedClass, selectedStudent])

  // 加载详情
  const loadDetailData = async(rowData: any) => {
    setDetailLoading(true)
    const { code, data }: any = await dispatch({
      type: "agentInteractionsModel/postData",
      apiUrl: "getHistoryLogDetailUrl",
      payload: {
        conversation_id: rowData.id
      }
    })

    if (code == 200) {
      setDetailData(data)
      if (rowData?.question_type === '作业批改' && photoPagesData?.length > 0) {
        filterCorrectionData(data)
      }
    }
    setDetailLoading(false)
  }

  // 加载今日练习详情
  const loadPracticeDetailData = async(rowData: any) => {
    // console.log(rowData, 'rowData')
    // setDetailData(practiceData.data)
    // return
    setDetailLoading(true)
    const { record_id, eid, subject, section_id } = rowData
    const { code, data }: any = await dispatch({
      type: "agentInteractionsModel/postData",
      apiUrl: "getPracticeDetailUrl",
      payload: {
        record_id,
        edu_id: eid,
        subject,
        section_id
      }
    })

    if (code == 200) {
      setDetailData(data)
    }
    setDetailLoading(false)
  }

  const filterCorrectionData = (data: any) => {
    // 图片问答数据
    const correctionList = photoPagesData.map((page: any) => {
      const questions = page.questions?.map((question: any) => {
        const matchedItem = data.find((item: any) => 
          item.extra?.page_id === page.page_id && 
          item.extra?.question_id === question.question_id
        )
        // 判断是否有存疑（错误）题目
        const outputContent = matchedItem?.output_content || ''
        const isWrong = /### 批改结果\s*\n+\s*错误/.test(outputContent)
        return {
          ...question,
          question_detail: matchedItem,
          isWrong
        }
      }) || []
      
      // 当前 page 的题目数和存疑数
      const total = questions.length
      const wrongCount = questions.filter((q: any) => q.isWrong).length
      
      return {
        ...page,
        questions,
        summary: { total, wrongCount }
      }
    })
    // console.log('correctionList', correctionList)
    setCorrectionData(correctionList)

    // 额外问答数据
    const diffData = data.filter((item: any) => {
      const { page_id, question_id } = item.extra || {}
      const existsInPhotoPages = photoPagesData.some((page: any) => {
        return page.page_id === page_id && page.questions?.some((q: any) => q.question_id === question_id)
      })
      return !existsInPhotoPages
    })
    setCorrectionAdditionalData(diffData)
  }

  const handleSelect = (image: ImageItem, index: number) => {
    setSelectedImage(image)
    setSelectedIndex(index)
  }

  return (
    <div className="history-log-detail">
      {detailLoading
        ? <div className="detail-loading">
            <span className="anticon-spin">
              <ZYIcon type="load-color" style={{ fontSize: "30px" }} />
            </span>
            <span className="text">加载中</span>
          </div>
        : <div className="detail-content">
            {(detailData && detailData?.length > 0) ||
            (detailData?.question_list?.length > 0)
            ? <>
                {/* 信息头 */}
                <div className='agent-info'>
                  <img src={rowData.assistant_avatar_url} alt={rowData.assistant_name} className='avatar' />
                  <div className='info'>
                    <span className='name'>{rowData.assistant_name}</span>
                    <span className='text'>来自智启</span>
                  </div>
                </div>

                {/* 作文批改：作文题目和作文内容 */}
                {rowData.question_type === '作文批改' 
                  && assayData 
                  && <div className='assay-box'>
                      <div className='assay-title'>作文要求</div>
                      <div className='assay-requirement'>{assayData.essay_requirement}</div>
                      {assayData.essay_content 
                        && assayData.sentences.length > 0
                        && <>
                            <div className='assay-content-header'>
                              <div className='assay-title'>作文内容</div>
                              <Button onClick={() => copyText(assayData.essay_content)}>复制全文</Button>
                            </div>
                            <ContentParser content={assayData.essay_content} parserData={assayData.sentences} />
                          </>
                      }
                      <Divider 
                        plain 
                        style={{ color: '#94A0B8', fontSize: 13 }}
                        >{assayData.sentences.length > 0 ? '亮点、优化点已标出' : '内容已解析'}
                      </Divider>
                    </div>
                }

                {/* 作业批改：图片问答 + 额外问答 */}
                {rowData.question_type === '作业批改' 
                && photoPagesData?.length > 0
                && <div className='correction-wrapper'>
                    <div className='question-box'>
                      <div className='content'>批改题目</div>
                      <ZYIcon type="Avatar" className='icon-avatar' />
                    </div>
                    <div className='photo-page-box'>
                      <img src={rowData.assistant_avatar_url} alt={rowData.assistant_name} className='agent-avatar' />
                      <div className='photo-page-content'>
                        <ImageViewer 
                          images={imageList} 
                          onSelect={handleSelect} 
                          selectedIndex={selectedIndex} 
                        />
                        {correctionData?.map((page: any) => (
                          <div className={`photo-page-questions ${selectedImage?.name === page.page_id ? 'show' : 'hide'}`} key={page.page_id}>
                            <div className='page-summary'>
                              共{page.summary?.total}题
                              {page.summary?.wrongCount > 0 && (
                                <>，<span className='wrong-count'>{page.summary?.wrongCount}</span>题存疑</>
                              )}
                            </div>
                            <PageQuestions questions={page.questions} />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 额外问答 */}
                    {correctionAdditionalData?.length > 0 
                      && <QAList listData={correctionAdditionalData} rowData={rowData} />
                    }
                  </div>
                }

                {/* 英语：拓展阅读-阅读要求 */}
                {rowData.question_type === '拓展阅读' 
                  && assayData 
                  && <div className='assay-box'>
                      <div className='assay-content-header'>
                        <div className='assay-title'>阅读要求</div>
                        <Button onClick={() => copyText(assayData?.reading_requirement)}>复制全文</Button>
                      </div>
                      <div className='assay-requirement'>{assayData?.reading_requirement}</div>
                      <Divider plain style={{ color: '#94A0B8', fontSize: 13 }}>内容已解析</Divider>
                    </div>
                }

                {/* 语文：阅读分析-文章内容 */}
                {rowData.question_type === '阅读分析' 
                  && assayData 
                  && <div className='assay-box'>
                      <div className='assay-content-header'>
                        <div className='assay-title'>文章内容</div>
                        <Button onClick={() => copyText(assayData?.reading_content)}>复制全文</Button>
                      </div>
                      <ContentParser content={assayData?.reading_content} parserData={assayData?.sentences} />
                      <Divider plain style={{ color: '#94A0B8', fontSize: 13 }}>已标记关键句</Divider>
                    </div>
                }

                {/* 今日练习：题目列表 */}
                {rowData.question_type === '今日练习' 
                  && <div className='practice-box'>
                      {detailData?.section_content && (
                        <div className='section-content'>
                          <div className='section-content-title'>{detailData?.section_content?.title}</div>
                          <div className='section-content-info'>
                            <span className='dynasty'>{detailData?.section_content?.dynasty} · </span>
                            <span className='author'>{detailData?.section_content?.author}</span>
                          </div>
                          <MarkdownRender>{detailData?.section_content?.passage?.replace(/\n/g, '<br />')}</MarkdownRender>
                        </div>
                      )}
                      <div className='practice-list'>
                        {detailData?.question_list?.map((item: any, index: number) => (
                          <div className='practice-item' key={item.question_id}>
                            <div className="practice-item-order">{index + 1}.</div>
                            <div className="practice-item-content">
                              {item?.stem && <div className='stem'>
                                <MarkdownRender>{item?.stem}</MarkdownRender>
                              </div>}
                              {!item?.stem && item?.am_voice && <div className='am-voice'>
                                <div className='placeholder'>.</div>
                                <AudioPlayer src={item?.am_voice.audio_url} />
                              </div>}
                              {item.options && item.options?.length > 0 && (
                                <div className="options">
                                  {item.options.map((option: any) => (
                                    <div className="option" key={option.id}>
                                      <span className="option-label">{option.id}.</span>
                                      <MarkdownRender>{option.content}</MarkdownRender>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="answer-box">
                                <div className={`user-answer-box ${item.correct === 1 ? 'correct' : 'error'}`}>
                                  {/* <span className='correct-rate'>综合正确率：{item.correct_rate === 0 ? 0 : `${item.correct_rate}%`}</span> */}
                                  <p>
                                    回答：
                                    {item.question_type === 'syllable_compose'
                                      ? item?.is_phrase
                                        ? item?.user_answer?.split(',').join(' ')
                                        : item?.user_answer?.split(',').join('·')
                                      : item?.user_answer ?? ''}
                                  </p>
                                </div>
                                <div className="answer-box-content">
                                  <div className='answer-label'>【答案】</div>
                                  {item.question_type === 'syllable_compose'
                                  ? <div>{item.is_phrase ? item?.order_split?.join(' ') : item?.order_split?.join('·')}</div>
                                  : <MarkdownRender>{item?.answer}</MarkdownRender>}
                                </div>
                                <div className='analysis-box'>
                                  <div className='analysis-label'>【解析】</div>
                                  <MarkdownRender>{item?.explanation}</MarkdownRender>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                }

                {/* 通用问答 */}
                {(rowData.question_type !== '作业批改' 
                  && rowData.question_type !== '今日练习')
                  && <QAList listData={detailData} rowData={rowData} />
                }
            </>
            : <div className="detail-empty">
                <ZYIcon type="kongshuju7" className="icon" />
                <div className="text">暂无数据</div>
              </div>
            }
          </div>
      }
    </div>
  )
}

export default connect((state: any) => ({
  agentInteractionsModel: state.agentInteractionsModel,
}))(HistoryLogDetail)

