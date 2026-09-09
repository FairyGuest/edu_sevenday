import { useState, useEffect, useRef } from 'react'
import { useLocation, useDispatch, connect } from 'umi'
import { Space, Button, Cascader, DatePicker, message } from 'antd'
import type { DatePickerProps } from 'antd';
import { useTeacherContext } from '@/components/LayoutSider';

import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs';
import { getOrgId } from '@/utils';

import './index.less'

const { RangePicker } = DatePicker
interface ReportFilterProps {
  onSearch: (filterParams: any) => void
  agentInteractionsModel: any
}

const FilterBar = ({ 
  onSearch, 
  agentInteractionsModel,
}: ReportFilterProps) => {
  const dispatch = useDispatch()
  const { analysisType, selectedClass, selectedStudent } = agentInteractionsModel
  const [context] = useTeacherContext()
  const selectedSubject = context?.subject_name

  const prevSelectedRef = useRef<{ class: any; student: any; } | null>(null)
  const isSubjectLoadedRef = useRef<boolean>(false) // 标记 subjectList 是否已加载完成
  const isFirstSearchDoneRef = useRef<boolean>(false) // 标记首次查询是否已执行

  const [subjectOptions, setSubjectOptions] = useState<any[]>([])
  const [groupOptions, setGroupOptions] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const [selectedDateRange, setSelectedDateRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(6, 'day'), dayjs()])
  const [cascaderValue, setCascaderValue] = useState<any[]>([])
  const [groupValue, setGroupValue] = useState<any[]>([])

  const [subject, setSubject] = useState<any>(undefined)
  const [questionTypes, setQuestionTypes] = useState<any>(undefined)
  const [eids, setEids] = useState<any[]>([])

  // 获取 filterParams
  const getFilterParams = (overrides?: {
    subject?: any;
    questionTypes?: any;
    selectedClass?: any;
    selectedStudent?: any;
    eids?: any[];
  }) => ({
    start_time: selectedDateRange?.[0].format('YYYY-MM-DD'),
    end_time: selectedDateRange?.[1].format('YYYY-MM-DD'),
    subject: overrides?.subject ?? subject,
    question_types: overrides?.questionTypes ?? questionTypes,
    org_id: getOrgId(),
    is_save_config: 1,
    eids: analysisType === 'class' 
      ? (overrides?.eids ?? eids) 
      : ((overrides?.selectedStudent ?? selectedStudent) ? [(overrides?.selectedStudent ?? selectedStudent).edu_id] : []),
    class_id: (overrides?.selectedClass ?? selectedClass) && analysisType === 'class' 
      ? (overrides?.selectedClass ?? selectedClass).value 
      : undefined,
  })

  // 监听 selectedClass、selectedStudent
  useEffect(() => {
    const prevSelected = prevSelectedRef.current;
    const isFirstLoad = prevSelected === null;
    const classChanged = !isFirstLoad && prevSelected.class !== selectedClass;
    const studentChanged = !isFirstLoad && prevSelected.student !== selectedStudent;

    if (selectedClass) {
      // 班级模式下，班级变化时获取小组列表
      if (analysisType === 'class' && (isFirstLoad || classChanged)) {
        getGroupList();
      }

      // 非首次加载时，触发查询
      if (!isFirstLoad && (classChanged || studentChanged) && isSubjectLoadedRef.current) {
        onSearch(getFilterParams({ selectedClass, selectedStudent }));
      }

      prevSelectedRef.current = { class: selectedClass, student: selectedStudent };
    }
  }, [selectedClass, selectedStudent]);

  useEffect(() => {
    if (selectedSubject) {
      getSubjectList()
    }
  }, [selectedSubject])

   // 触发首次查询
   useEffect(() => {
    if (!isFirstSearchDoneRef.current && isSubjectLoadedRef.current && selectedClass && subject) {
      isFirstSearchDoneRef.current = true
      onSearch(getFilterParams())
    }
  }, [selectedClass, subject])

  const getSubjectList = async () => {
    setLoading(true)
    const { code, data = [] }: any = await dispatch({
      type: "agentInteractionsModel/getData",
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

      // 学科使用当前选中教材的学科，否则使用通用学科
      const matchedSubject = subjectOptions.find((item: any) => item.value === selectedSubject)
      const fallbackSubject = subjectOptions.find((item: any) => item.label === '通用')
      const targetSubject = matchedSubject || fallbackSubject

      if (targetSubject) {
        const curSubject = targetSubject.value
        const curQuestionTypes = targetSubject.children.map((item: any) => item.value)
        setSubject(curSubject)
        setQuestionTypes(curQuestionTypes)
        setCascaderValue([[curSubject]])

        // 非首次加载时（切换教材），直接用新值触发查询
        // if (isFirstSearchDoneRef.current && selectedClass) {
        //   onSearch(getFilterParams({ subject: curSubject, questionTypes: curQuestionTypes }))
        // }
      }

      isSubjectLoadedRef.current = true
    }
    setLoading(false)
  }

  const getGroupList = async () => {
    setLoading(true)
    const { code, data = [] }: any = await dispatch({
      type: "agentInteractionsModel/postData",
      apiUrl: "getGroupListUrl",
      payload: {
        group_id: selectedClass?.value
      },
    });
    if (code == 200) {
      const groupOptions = data.groups.map((item: any) => ({ 
        label: `${item.title.slice(0, 8)}${item.title.length > 8 ? '...' : ''}`, 
        value: item.id, 
        children: item.students.map((student: any) => ({
          label: `${student.name.slice(0, 8)}${student.name.length > 8 ? '...' : ''}`, 
          value: student.edu_id
        }))
      }))
      setGroupOptions(groupOptions)
    }
    setLoading(false)
  }

  const handleCascaderChange = (value: any) => {
    if (!value || value.length === 0) {
      setCascaderValue([])
      setSubject(undefined)
      setQuestionTypes(undefined)
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
  }

  const handleGroupChange = (value: any) => {
    const groupVal = value || []
    setGroupValue(groupVal)
    
    const studentIds: any[] = []
    groupVal.forEach((path: any) => {
      if (path.length === 2) {
        studentIds.push(path[1])
      } else if (path.length === 1) {
        const groupId = path[0]
        const group = groupOptions.find((g: any) => g.value === groupId)
        if (group && group.children) {
          group.children.forEach((student: any) => {
            studentIds.push(student.value)
          })
        }
      }
    })
    
    setEids(studentIds)
  }

  const disabledRangeDate: DatePickerProps['disabledDate'] = (current) => {
    if (!current) return false
    const today = dayjs().startOf('day')
    const sevenDaysAgo = today.subtract(6, 'day')

    if (current.isAfter(today, 'day')) return true
    if (current.isBefore(sevenDaysAgo, 'day')) return true

    return false
  }

  const handleSearch = () => {
    if (!subject || !questionTypes) {
      message.error('学科不能为空')
      return
    }

    onSearch(getFilterParams())
  }

  return (
    <Space className="report-filter" wrap size={[8, 24]}>
      <RangePicker
        allowClear={false}
        value={selectedDateRange}
        onChange={(date: any) => setSelectedDateRange(date)}
        disabledDate={disabledRangeDate}
        style={{ width: 256 }}
      />
      <Cascader 
        multiple
        maxTagCount={1}
        options={subjectOptions} 
        placeholder="按学科筛选" 
        style={{ width: 256 }}
        value={cascaderValue}
        onChange={handleCascaderChange}
      />
      {analysisType === 'class' && (
        <Cascader
          options={groupOptions}
          placeholder="按小组筛选" 
          style={{ width: 256 }}
          value={groupValue}
          onChange={handleGroupChange}
          multiple
          maxTagCount={3}
        />
      )}
      <Button 
        type="primary" 
        onClick={handleSearch} 
        disabled={loading || !selectedClass?.value} 
        style={{ width: 80 }}
      >
        查询 
      </Button>
    </Space>
  )
}

export default connect((state: any) => ({
  agentInteractionsModel: state.agentInteractionsModel,
  teachSourceModel: state.teachSourceModel,
}))(FilterBar)
