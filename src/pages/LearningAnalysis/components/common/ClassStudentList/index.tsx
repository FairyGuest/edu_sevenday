import { useState, useEffect } from 'react'
import { connect, useDispatch } from '@umijs/max';
import { Select, Spin } from 'antd';
import { ZYIcon } from "@/components";
import { useTeacherContext } from '@/components/LayoutSider';

import { getUserInfo, stopSSE } from "@/utils"

import './index.less';

/**
 * 学情分析页头 · 班级切换（页面级范围选择器）。
 * 选中班级写入 analysisModel，驱动画像总览与作业分析按班取数。
 */
const ClassStudentList = (props: any) => {
  const dispatch = useDispatch()
  const [context, contextLoading, setContext] = useTeacherContext()
  const courseId = context?.course_id

  const [classOptions, setClassOptions] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const curOrg = JSON.parse(localStorage.getItem("curOrg") || "{}");

  useEffect(() => {
    if (contextLoading) return;
    getClassList();
  }, [contextLoading, courseId]);

  const getClassList = async () => {
    const user_id = getUserInfo()
    setLoading(true)
    const { code, data = [] }: any = await dispatch({
      type: "analysisModel/postData",
      apiUrl: "getClassListUrl",
      payload: {
        user_id,
        org_id: curOrg.id,
        course_id: courseId
      }
    });
    if (code == 200) {
      if (data.length > 0) {
        const _array = data.map((item: any) => ({
          label: item.class_name,
          value: item.class_id,
          class_last_submit_time: item.class_last_submit_time,
          students: item.students
        }))
        setClassOptions(_array)
        const matchClass = _array.find((item: any) => item.value === context?.class_id)
        setSelectedClass(matchClass || _array?.[0])
      } else {
        setClassOptions([])
        setSelectedClass(null)
      }
    }
    setLoading(false)
  }

  // 班级写入全局：作业分析按班级维度取数
  useEffect(() => {
    if (!selectedClass) return;
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

  const onChangeClass = (value: any) => {
    setContext({ classId: value })
    const opt = classOptions.find((item: any) => item.value == value);
    if (opt) {
      setSelectedClass(opt)
    }
  }

  if (contextLoading || loading) {
    return <div className="analysis-class-select-loading"><Spin size="small" /></div>
  }

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
