import { useState, useEffect } from 'react'
import { connect, useDispatch, useLocation } from '@umijs/max';
import { Select, Empty, Spin } from 'antd';
import { ZYIcon } from "@/components";
import { useTeacherContext } from '@/components/LayoutSider';

import { getUserInfo, stopSSE } from "@/utils"

import './index.less';

const ClassStudentList = () => {
  const dispatch = useDispatch()
  const [context, contextLoading, setContext] = useTeacherContext()
  const courseId = context?.course_id

  const [classOptions, setClassOptions] = useState<any>([]);  // 班级下拉选项
  const [selectedClass, setSelectedClass] = useState<any>(null);  // 选中的班级
  const [classStudents, setClassStudents] = useState<any>([]);  // 选中班级的学生
  const [selectedStudent, setSelectedStudent] = useState<any>(null);  // 选中的学生
  const [loading, setLoading] = useState<boolean>(false);
  const curOrg = JSON.parse(localStorage.getItem("curOrg") || "{}");

  useEffect(() => {
    if (contextLoading) return;
    getClassList();
  }, [contextLoading, courseId]);
  
  const getClassList = async() => {
    const user_id = getUserInfo()
    setLoading(true)
    const { code, data = [] }: any = await dispatch({
      type: "agentInteractionsModel/postData",
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

  useEffect(() => {
    if (!selectedClass) return;
    const students = classOptions?.find((item: any) => item.value == selectedClass.value)?.students || []
    setClassStudents(students)
    setSelectedStudent(null)
    onDispatch()
  }, [selectedClass])

  useEffect(() => {
    onDispatch()
  }, [selectedStudent])

  const onDispatch = () => {
    dispatch({
      type: "agentInteractionsModel/setData",
      payload: {
        selectedClass,
        selectedStudent,
        analysisType: selectedStudent ? 'personal' : 'class'
      }
    })
  }

  const onChangeClass = (value: any) => {
    setContext({ classId: value })
    setSelectedClass({
      name: classOptions.find((item: any) => item.value == value)?.label,
      value,
      class_last_submit_time: classOptions.find((item: any) => item.value == value)?.class_last_submit_time
    })
    stopSSE()
  }

  const onChangeStudent = (value: string) => {
    setSelectedStudent(value)
    stopSSE()
  }

  const onClassStageAnalysis = () => {
    setSelectedStudent(null)
  }

  if (contextLoading || loading) {
    return <div className="class-student-list-loading">
      <Spin />
    </div>
  }

  return (
    <div className="class-student-list">
      {classOptions.length > 0 ? (
        <>
          {/* 班级下拉选项 */}
          <Select
            className='class-student-list-select'
            value={selectedClass?.value}
            suffixIcon={<ZYIcon type="xia" className="select-icon" />}
            onChange={onChangeClass}
            options={classOptions}
          />
          {/* 学生列表 */}
          <div className="class-student-list-students">
            <div className={`class-student-list-students-item class ${!selectedStudent ? 'active' : ''}`} onClick={onClassStageAnalysis}>
              <span className="text"><ZYIcon type="wanchengqingkuang" className="icon" />班级互动记录</span>
              <ZYIcon type="arrow-go" className="arrow-icon" />
            </div>
            {classStudents.map((item: any) => (
              <div 
                className={`class-student-list-students-item ${selectedStudent?.id == item.id ? 'active' : ''}`}
                key={item.id}
                onClick={() => onChangeStudent(item)}
              >
                {item.name}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="class-student-list-empty">
          <Empty description="暂无班级" />
        </div>
      )}
    </div>
  )
}

export default connect((state: any) => ({
  agentInteractionsModel: state.agentInteractionsModel,
}))(ClassStudentList);