import { useState, useEffect, useRef } from 'react'
import { connect, useDispatch, useLocation } from '@umijs/max';
import { Button, Select, Spin } from 'antd';
import { ZYIcon } from "@/components";
import { useTeacherContext } from '@/components/LayoutSider';

import { getUserInfo, stopSSE } from "@/utils"
import { replacePageQuery } from '@/utils/pageQuery';

import './index.less';

/**
 * 学情分析页头 · 班级切换（页面级范围选择器）。
 * 选中班级写入 analysisModel，驱动画像总览与作业分析按班取数。
 */
const ClassStudentList = (props: any) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const requestedClass = new URLSearchParams(location.search).get('class_id')
  const requestSeq = useRef(0)
  const [context, contextLoading, setContext] = useTeacherContext()
  const courseId = context?.course_id

  const [classOptions, setClassOptions] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState(false);
  const curOrg = JSON.parse(localStorage.getItem("curOrg") || "{}");

  useEffect(() => {
    if (contextLoading) return;
    getClassList();
    return () => { ++requestSeq.current; };
  }, [contextLoading, courseId]);

  const getClassList = async () => {
    const seq = ++requestSeq.current
    const user_id = getUserInfo()
    setLoading(true)
    setError(false)
    dispatch({ type: 'analysisModel/updateState', res: { classSelectionLoading: true } })
    try {
    const { code, data = [] }: any = await dispatch({
      type: "analysisModel/postData",
      apiUrl: "getClassListUrl",
      payload: {
        user_id,
        org_id: curOrg.id,
        course_id: courseId
      }
    }) || {};
    if (seq !== requestSeq.current) return;
    if (code == 200) {
      if (Array.isArray(data) && data.length > 0) {
        const _array = data.map((item: any) => ({
          label: item.class_name,
          value: item.class_id,
          class_last_submit_time: item.class_last_submit_time,
          students: item.students
        }))
        setClassOptions(_array)
        const matchClass = _array.find((item: any) => item.value === requestedClass) || _array.find((item: any) => item.value === context?.class_id)
        setSelectedClass(matchClass || _array?.[0])
        if (requestedClass && !_array.some((item: any) => item.value === requestedClass)) {
          replacePageQuery({ class_id: (matchClass || _array[0]).value, student_id: null })
        }
      } else {
        setClassOptions([])
        setSelectedClass(null)
      }
    } else { throw new Error('班级加载失败'); }
    } catch {
      if (seq !== requestSeq.current) return;
      setClassOptions([])
      setSelectedClass(null)
      setError(true)
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false)
        dispatch({ type: 'analysisModel/updateState', res: { classSelectionLoading: false } })
      }
    }
  }

  // 班级写入全局：作业分析按班级维度取数
  useEffect(() => {
    stopSSE();
    dispatch({
      type: "analysisModel/setData",
      payload: {
        selectedClass,
        selectedStudent: null,
        analysisType: 'class'
      }
    })
  }, [selectedClass])

  useEffect(() => {
    const match = classOptions.find((item: any) => item.value === requestedClass)
    if (match && match.value !== selectedClass?.value) setSelectedClass(match)
  }, [requestedClass, classOptions])

  const onChangeClass = (value: any) => {
    setContext({ classId: value })
    const opt = classOptions.find((item: any) => item.value == value);
    if (opt) {
      setSelectedClass(opt)
      replacePageQuery({ class_id: String(value), student_id: null })
    }
  }

  if (contextLoading || loading) {
    return <div className="analysis-class-select-loading"><Spin size="small" /></div>
  }

  if (error) return <Button size="small" onClick={getClassList}>班级加载失败，点击重试</Button>;

  return (
    <Select
      className='analysis-class-select'
      value={selectedClass?.value}
      suffixIcon={<ZYIcon type="xia" className="select-icon" />}
      onChange={onChangeClass}
      options={classOptions}
      placeholder={classOptions.length ? '选择班级' : '暂无班级'}
      disabled={!classOptions.length}
    />
  )
}

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(ClassStudentList);
