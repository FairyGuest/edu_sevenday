import { useState, useImperativeHandle, useEffect } from 'react'
import { connect, useDispatch, useLocation } from '@umijs/max';
import { getUserInfo } from "@/utils"
import { useTeacherContext } from '@/components/LayoutSider';
import { Modal, Button, Select, Form, message } from 'antd'

import './index.less'

const ReportSendModal = (props: any) => {
  const { onRef, studentList, selectedStudent, homeworkAnalysisInfo, selectedClass } = props
  const dispatch = useDispatch()
  const [context] = useTeacherContext()
  const courseId = context?.course_id
  const [open, setOpen] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<any[]>([])
  const [reportType, setReportType] = useState<any>('1')
  const [form] = Form.useForm();

  useImperativeHandle(onRef, () => ({
    openModal: () => {
      setOpen(true)
    }
  }))

  useEffect(() => {
    if (selectedStudent) {
      setSelectedStudents([selectedStudent.edu_id])
      form.setFieldsValue({ students: [selectedStudent.edu_id] })
    }
  }, [selectedStudent])

  const onCancel = () => {
    setOpen(false)
  } 

  const onFinish = async(values: any) => {
    const user_id = getUserInfo()
    const student_info = studentList
      .map((item: any) => values.students
      .filter((student: any) => student === item.edu_id)
      .map(() => ({name: item.name, edu_id: item.edu_id})))
      .flat()

    const main_url = `${window.location.origin}/analysisH5?course_id=${courseId}&user_id=${user_id}&start_time=${homeworkAnalysisInfo.start_time}&end_time=${homeworkAnalysisInfo.end_time}&class_id=${selectedClass.value}&edu_id=`
    const payload = {
      main_url,
      student_info: student_info,
      sub_title: `报告周期：${homeworkAnalysisInfo.start_time} 至 ${homeworkAnalysisInfo.end_time}`,
      subject: homeworkAnalysisInfo.subject_name
    }

    const { code, data = [] }: any = await dispatch({
      type: "analysisModel/postData",
      apiUrl: "sendReportUrl",
      payload
    });
    if (code == 200) {
      message.success('发送成功')
      setOpen(false)
    } else {
      message.error('发送失败')
    }
  }

  const handleChange = (value: any) => {
    let next: any[] = []
    if (Array.isArray(value) && value.includes('all')) {
      next = studentList.map((item: any) => item.edu_id)
    } else {
      next = value
    }
    setSelectedStudents(next)
    form.setFieldsValue({ students: next })
  }

  return (
    <Modal
      title="发送报告"
      width={552}
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <div className="report-send-modal-content">
        <Form
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          layout="vertical"
          style={{ width: '100%' }}
        >
          <Form.Item name="type" label="报告类型" rules={[{ required: true }]} initialValue='1'>
            <Select
              placeholder="请选择报告类型"
              value={reportType}
              onChange={setReportType}
              disabled={true}
              options={[{
                label: '作业分析',
                value: '1'
              }]}
            />
          </Form.Item>
          <Form.Item name="students" label="选择学生" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              allowClear
              placeholder="请选择学生"
              value={selectedStudents}
              onChange={handleChange}
              options={[{label: '全选', value: 'all'}, ...studentList.map((item: any) => ({
                label: item.name,
                value: item.edu_id
              }))]}
            />
          </Form.Item>
          <div className="report-send-modal-footer">
            <Button onClick={onCancel}>取消</Button>
            <Form.Item noStyle>
              <Button type="primary" htmlType="submit">发送</Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
export default connect(({ analysisModel }: any) => ({
  homeworkAnalysisInfo: analysisModel.homeworkAnalysisInfo,
}))(ReportSendModal);
