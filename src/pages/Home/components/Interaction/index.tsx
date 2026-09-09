import { useEffect, useState, useRef, useImperativeHandle } from 'react'
import { connect, useDispatch, history } from 'umi'

import { Select, Cascader, Space, message, Divider, Tag } from 'antd'

import { ZYIcon } from '@/components'
import { useTeacherContext } from '@/components/LayoutSider'

import { getUserInfo, getOrgId, addNewTracking } from '@/utils'
import dayjs from 'dayjs'

import './index.less'

const FilterBar = ({
  onRef,
  onSearch,
}: {
  onRef: React.RefObject<any>,
  onSearch: (filterParams: any) => void
}) => {
  const dispatch = useDispatch()
  const [context, contextLoading, setContext] = useTeacherContext()
  const classId = context?.class_id

  const [subjectOptions, setSubjectOptions] = useState<any[]>([])
  const [classOptions, setClassOptions] = useState<any[]>([])

  const [cascaderValue, setCascaderValue] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<any>(null)

  const [subject, setSubject] = useState<any>(undefined)
  const [questionTypes, setQuestionTypes] = useState<any>(undefined)

  useEffect(() => {
    if (contextLoading || !classId) return
    init()
  }, [classId, contextLoading])

  const init = async () => {
    const defaultClassId = await getClassList()
    const {
      subject: defaultSubject,
      questionTypes: defaultQuestionTypes
    } = await getSubjectList()

    onSearch(
      getFilterParams({
        selectedClass: defaultClassId,
        subject: defaultSubject,
        questionTypes: defaultQuestionTypes,
      })
    )
  }

  useImperativeHandle(onRef, () => ({
    onSearch: () => {
      onSearch(getFilterParams())
    }
  }))

  const getClassList = async () => {
    const user_id = getUserInfo()
    const { code, data = [] }: any = await dispatch({
      type: "homePageModel/postData",
      apiUrl: "getClassListUrl",
      payload: {
        user_id,
        org_id: getOrgId(),
        course_id: context?.course_id
      }
    });
    if (code == 200) {
      if (data.length > 0) {
        const _array = data.map((item: any) => ({
          label: item.class_name,
          value: item.class_id,
        }))
        const defaultClassId = classId ?? _array[0]?.value ?? null
        setClassOptions(_array)
        setSelectedClass(defaultClassId)
        return defaultClassId
      } else {
        setClassOptions([])
        setSelectedClass(null)
        return null
      }
    }
    return null
  }

  const getSubjectList = async () => {
    const { code, data = [] }: any = await dispatch({
      type: "homePageModel/getData",
      apiUrl: "getSubjectListUrl",
      payload: {}
    })
    if (code == 200) {
      const subjectOptions = data.map((item: any) => ({
        label: item.label,
        value: item.value,
        children: item.children.map((child: any) => ({
          label: child.label, value: child.value
        }))
      }))
      setSubjectOptions(subjectOptions)

      const targetSubject = subjectOptions.find((item: any) =>
        subject ? item.value === subject : item.value === context?.subject_name
      )

      if (targetSubject) {
        const curSubject = targetSubject.value
        const curQuestionTypes = targetSubject.children.map((item: any) => item.value)
        setSubject(curSubject)
        setQuestionTypes(curQuestionTypes)
        setCascaderValue([[curSubject]])
        return { subject: curSubject, questionTypes: curQuestionTypes }
      }
    }
    return { subject: undefined, questionTypes: undefined }
  }

  // 获取 filterParams
  const getFilterParams = (overrides?: {
    subject?: any;
    questionTypes?: any;
    selectedClass?: any;
    selectedStudent?: any;
    eids?: any[];
  }) => ({
    start_time: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
    end_time: dayjs().format('YYYY-MM-DD'),
    subject: overrides?.subject ?? subject,
    question_types: overrides?.questionTypes ?? questionTypes,
    eids: [],
    class_id: overrides?.selectedClass ?? selectedClass,
    org_id: getOrgId(),
    is_save_config: 1,
    page: 1,
    pageSize: 5,
  })

  const handleCascaderChange = (value: any) => {
    if (!value || value.length === 0) {
      setCascaderValue([])
      setSubject(undefined)
      setQuestionTypes(undefined)
      onSearch(getFilterParams({ subject: undefined, questionTypes: undefined }))
      return
    }

    const lastSelectedPath = value[value.length - 1]
    const lastSubjectId = lastSelectedPath[0]
    const filteredValue = value.filter((path: any) => path[0] === lastSubjectId)
    setCascaderValue(filteredValue)

    const isParentSelected = filteredValue.some((path: any) => path.length === 1)
    let agentModels: any = undefined

    if (isParentSelected) {
      const selectedSubjectOption = subjectOptions.find(opt => opt.value === lastSubjectId)
      if (selectedSubjectOption && selectedSubjectOption.children) {
        agentModels = selectedSubjectOption.children.map((child: any) => child.value)
      }
    } else {
      agentModels = filteredValue.map((path: any) => path[1]).filter(Boolean)
    }

    setSubject(lastSubjectId)
    setQuestionTypes(agentModels && agentModels.length > 0 ? agentModels : undefined)
    setContext({ subjectName: lastSubjectId })

    onSearch(
      getFilterParams({
        subject: lastSubjectId,
        questionTypes: agentModels && agentModels.length > 0 ? agentModels : undefined,
      }),
    )
  }

  const handleClassChange = (value: any) => {
    setSelectedClass(value)
    // onSearch(getFilterParams({ selectedClass: value }))
    setContext({ classId: value })
  }

  return (
    <Space className="report-filter" style={{ margin: 0 }}>
      <Select
        value={selectedClass}
        style={{ width: 120 }}
        onChange={handleClassChange}
        options={classOptions}
      />
      <Cascader
        multiple
        maxTagCount={1}
        options={subjectOptions}
        placeholder="按学科筛选"
        style={{ width: 170 }}
        value={cascaderValue}
        allowClear={false}
        onChange={handleCascaderChange}
      />
    </Space>
  )
}

const InteractionItem = ({ item, index }: { item: any, index: number }) => {
  const handleShowDetail = (item: any) => {
    history.push('/interact/record', { detailRowData: item })
  }

  return (
    <div className='list-item' key={index} onClick={() => {
      addNewTracking({
        bt: 'cl',
        ct: 'home_interact_record_title_click',
        ctid: item?.record_id,
        ctvl: item?.assistant_name
      })
      handleShowDetail?.(item)
    }}>
      <div className='list-item-top'>
        <img src={item?.assistant_avatar_url} alt={item?.user_name} className='avatar' />
        <div className='title-box'>
          <div className='title'>{item?.title}</div>
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
              {/* {item?.qtype_distribution &&
                <>
                  <Divider type='vertical' style={{ margin: '2px 0 0 0' }} />
                  <div className="practice-info-group">
                    <ZYIcon type='tixing2' size='14' />
                    {item?.qtype_distribution?.single_choice && <span className='text'>单选题 {item?.qtype_distribution?.single_choice_voice ? item?.qtype_distribution?.single_choice + item?.qtype_distribution?.single_choice_voice : item?.qtype_distribution?.single_choice}</span>}
                    {item?.qtype_distribution?.syllable_compose && <span className='text'>单词拼合题 {item?.qtype_distribution?.syllable_compose}</span>}
                  </div>
                </>
              } */}
              {/* <Divider type='vertical' style={{ margin: '2px 0 0 0' }} /> */}
              <Tag bordered={false} className={Number((item?.correct_rate * 100).toFixed(0)) >= 60 ? 'success' : 'error'}>正确率 {(item?.correct_rate * 100).toFixed(0)}%</Tag>
            </div>
          )}
        </div>
        <div className='right'>
          <span className={`text ${item?.question_type === '今日练习' ? 'hidden-text' : ''}`}>{item?.user_name}</span>
          <span className='text time'>{dayjs(item?.created_at_ts * 1000).format('YYYY-MM-DD HH:mm:ss')}</span>
        </div>
      </div>
    </div>
  )
}

const Interaction = () => {
  const dispatch = useDispatch()
  const [context] = useTeacherContext()
  const courseId = context?.course_id
  const filterBarRef = useRef<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [interactionList, setInteractionList] = useState<any[]>([]);

  const handleSearch = async (filterParams: any) => {
    // if (!filterParams.class_id || !filterParams.subject || !filterParams.question_types) {
    //   message.error('班级或学科不能为空')
    //   return
    // }
    setLoading(true)
    const { code, data = [] }: any = await dispatch({
      type: "homePageModel/postData",
      apiUrl: "getInteractionListUrl",
      payload: filterParams,
    })
    if (code == 200) {
      setInteractionList(
        data?.list
          ? Object.values(data.list).reduce((acc: any[], cur: any) => acc.concat(cur), [])
          : []
      )
    }
    setLoading(false)
  }

  return (
    <div className='interaction'>
      <div className='interaction-header'>
        <div className='header-left'>
          <span className='title'>互动记录</span>
          {courseId && <ZYIcon type='shuaxin' className='refresh-icon' onClick={() => filterBarRef.current.onSearch()} />}
        </div>
        {courseId && <FilterBar onRef={filterBarRef} onSearch={handleSearch} />}
      </div>
      <div className='interaction-content'>
        {loading ? (
          <div className="loading-box">
            <span className="anticon-spin">
              <ZYIcon type="load-color" style={{ fontSize: "30px" }} />
            </span>
            <span className="text">加载中</span>
          </div>
        ) : interactionList.length === 0 ? (
          <div className='empty-box'>
            <ZYIcon type='kongpinglun' className='icon' />
            <span className='text'>暂无互动记录</span>
          </div>
        ) : (
          <div className='interaction-list'>
            {interactionList.map((item: any, index: number) => (
              <InteractionItem key={index} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default connect(({ homePageModel }: any) => ({
  homePageModel,
}))(Interaction);
