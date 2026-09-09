import { useEffect, useState } from 'react';
import { Divider } from 'antd';
import { useLocation, connect } from '@umijs/max';
import ZYIcon from '@/components/ZYIcon';

import './index.less';

const TaskStatistics = ({
  baseInfo, 
  loading,
  analysisModel
}: {
  baseInfo: any
  loading: boolean
  analysisModel: any
}) => {
  const isH5 = useLocation().pathname.includes('analysisH5');
  const { analysisType } = analysisModel
  const effectiveAnalysisType = isH5 ? 'personal' : analysisType;
  const [dataList, setDataList] = useState<any[]>([]);

  const buildPersonalDataList = (): any[] => {
    const { task_stats = {}, question_stats = {}, accuracy_stats = {}, kp_excellence_stats = {} } = baseInfo
    const { class_avg_submitted_count, submitted_count, assigned_count } = task_stats || {};
    const { student_completed_questions, teacher_assigned_questions, class_avg_completed_questions } = question_stats || {};
    const { student_avg_accuracy, class_avg_accuracy } = accuracy_stats || {};
    const { student_rate, class_rate } = kp_excellence_stats || {};

    return [{
      title: '提交次数/作业总次数',
      middleValue: `${submitted_count}/${assigned_count}`,
      bottomText: () => {
        const diffNum = submitted_count - class_avg_submitted_count
        return (
          <>
            班级平均提交{class_avg_submitted_count}次
            (对比<span className={`comparison ${diffNum > 0 ? 'up' : 'down'}`}>
            {diffNum !== 0 && <ZYIcon type="jiantou1" />}
            {diffNum === 0
              ? <span style={{ color: '#486AFF' }}>-0</span>
              : Math.abs(diffNum).toFixed(1)}
            </span>)
          </>
        )
      },
      h5BottomText: () => {
        const diffNum = submitted_count - class_avg_submitted_count
        return (
          <span className='h5'>
            <span>班级平均提交{class_avg_submitted_count}次</span>
            <span>对比
              <span className={`comparison ${diffNum > 0 ? 'up' : 'down'}`}>
                {diffNum !== 0 && <ZYIcon type="jiantou1" />}
                {diffNum === 0
                  ? <span style={{ color: '#486AFF' }}>-0</span>
                  : Math.abs(diffNum).toFixed(1)
                }
              </span>
            </span>
          </span>
        )
      }
    }, {
      title: '完成数/题目总数',
      middleValue: `${student_completed_questions}/${teacher_assigned_questions}`,
      bottomText: () => {
        const diffNum = student_completed_questions - class_avg_completed_questions
        return (
          <>
            班级平均完成{class_avg_completed_questions}道
            (对比<span className={`comparison ${diffNum > 0 ? 'up' : 'down'}`}>
              {diffNum !== 0 && <ZYIcon type="jiantou1" />}
              {diffNum === 0
                ? <span style={{ color: '#486AFF' }}>-0</span>
                : Math.abs(diffNum).toFixed(1)
              }</span>
            )
          </>
        )
      },
      h5BottomText: () => {
        const diffNum = student_completed_questions - class_avg_completed_questions
        return (
          <span className='h5'>
            <span>班级平均完成{class_avg_completed_questions}道</span>
            <span>对比
              <span className={`comparison ${diffNum > 0 ? 'up' : 'down'}`}>
                {diffNum !== 0 && <ZYIcon type="jiantou1" />}
                {diffNum === 0
                  ? <span style={{ color: '#486AFF' }}>-0</span>
                  : Math.abs(diffNum).toFixed(1)
                }
              </span>
            </span>
          </span>
        )
      }
    }, {
      title: '平均正确率',
      middleValue: `${student_avg_accuracy}%`,
      bottomText: () => {
        const diffNum = student_avg_accuracy - class_avg_accuracy
        return (
          <>
            班级平均正确率{class_avg_accuracy}%
            (对比<span className={`comparison ${diffNum > 0 ? 'up' : 'down'}`}>
              {diffNum !== 0 && <ZYIcon type="jiantou1" />}
              {diffNum === 0
                ? <span style={{ color: '#486AFF' }}>-0</span>
                : Math.abs(diffNum).toFixed(1)
              }</span>
            )
          </>
        )
      },
      h5BottomText: () => {
        const diffNum = student_avg_accuracy - class_avg_accuracy
        return (
          <span className='h5'>
            <span>班级平均正确率{class_avg_accuracy}%</span>
            <span>对比
              <span className={`comparison ${diffNum > 0 ? 'up' : 'down'}`}>
                {diffNum !== 0 && <ZYIcon type="jiantou1" />}
                {diffNum === 0
                  ? <span style={{ color: '#486AFF' }}>-0</span>
                  : Math.abs(diffNum).toFixed(1)
                }
              </span>
            </span>
          </span>
        )
      }
    }, {
      title: '知识点优异率',
      middleValue: `${student_rate}%`,
      bottomText: () => {
        const diffNum = student_rate - class_rate
        return (
          <>
            班级知识点优异率{class_rate}%
            (对比<span className={`comparison ${diffNum > 0 ? 'up' : 'down'}`}>
              {diffNum !== 0 && <ZYIcon type="jiantou1" />}
              {diffNum === 0
                ? <span style={{ color: '#486AFF' }}>-0</span>
                : Math.abs(diffNum).toFixed(1)
              }</span>
            )
          </>
        )
      },
      h5BottomText: () => {
        const diffNum = student_rate - class_rate
        return (
          <span className='h5'>
            <span>班级知识点优异率{class_rate}%</span>
            <span>对比
              <span className={`comparison ${diffNum > 0 ? 'up' : 'down'}`}>
                {diffNum !== 0 && <ZYIcon type="jiantou1" />}
                {diffNum === 0
                  ? <span style={{ color: '#486AFF' }}>-0</span>
                  : Math.abs(diffNum).toFixed(1)
                }
              </span>
            </span>
          </span>
        )
      }
    }]
  }

  const buildClassDataList = (): any[] => {
    const { assigned_count = {}, submit_rate = {}, completed_count = {}, correct_rate = {} } = baseInfo
    const { class_assigned_count, avg_grade_assigned_count } = assigned_count
    const { class_submit_rate, avg_grade_submit_rate } = submit_rate
    const { avg_class_person_completed_count, avg_grade_person_completed_count } = completed_count
    const { class_avg_correct_rate, grade_avg_correct_rate } = correct_rate

    return [{
      title: '作业下发次数',
      middleValue: class_assigned_count,
      bottomText: () => {
        const diffNum = class_assigned_count - avg_grade_assigned_count
        return (
          <>
            年级平均布置{avg_grade_assigned_count}次
            (对比<span className={`comparison ${diffNum > 0 ? 'up' : 'down'}`}>
            {diffNum !== 0 && <ZYIcon type="jiantou1" />}
            {diffNum === 0
              ? <span style={{ color: '#486AFF' }}>-0</span>
              : Math.abs(diffNum).toFixed(1)}
            </span>)
          </>
        )
      },
      h5BottomText: null
    }, {
      title: '班级作业完成率',
      middleValue: `${class_submit_rate}%`,
      bottomText: () => {
        const diffNum = class_submit_rate - avg_grade_submit_rate
        return (
          <>
            年级作业完成率{avg_grade_submit_rate}%
            (对比<span className={`comparison ${diffNum > 0 ? 'up' : 'down'}`}>
              {diffNum !== 0 && <ZYIcon type="jiantou1" />}
              {diffNum === 0
                ? <span style={{ color: '#486AFF' }}>-0</span>
                : Math.abs(diffNum).toFixed(1)}
            </span>)
          </>
        )
      },
      h5BottomText: null
    }, {
      title: '班级人均完成题量',
      middleValue: avg_class_person_completed_count,
      bottomText: () => {
        const diffNum = avg_class_person_completed_count - avg_grade_person_completed_count
        return (
          <>
            年级人均完成{avg_grade_person_completed_count}题
            (对比<span className={`comparison ${diffNum > 0 ? 'up' : 'down'}`}>
              {diffNum !== 0 && <ZYIcon type="jiantou1" />}
              {diffNum === 0
                ? <span style={{ color: '#486AFF' }}>-0</span>
                : Math.abs(diffNum).toFixed(1)}
            </span>)
          </>
        )
      },
      h5BottomText: null
    }, {
      title: '班级平均正确率',
      middleValue: `${class_avg_correct_rate}%`,
      bottomText: () => {
        const diffNum = class_avg_correct_rate - grade_avg_correct_rate
        return (
          <>
            年级平均正确率{grade_avg_correct_rate}%
            (对比<span className={`comparison ${diffNum > 0 ? 'up' : 'down'}`}>
              {diffNum !== 0 && <ZYIcon type="jiantou1" />}
              {diffNum === 0
                ? <span style={{ color: '#486AFF' }}>-0</span>
                : Math.abs(diffNum).toFixed(1)}
            </span>)
          </>
        )
      },
      h5BottomText: null
    }]
  }

  useEffect(() => {
    if (baseInfo) {
      setDataList(
        effectiveAnalysisType === 'personal' 
        ? buildPersonalDataList() 
        : buildClassDataList()
      )
    }
  }, [baseInfo]);

  return (
    <>
      {loading
        ? <div className='loading-box'>
            <span className="anticon-spin">
              <ZYIcon type="load-color" style={{ fontSize: "20px" }} />
            </span>
            <span className="text">数据加载中</span>
          </div>
        : <div className='homework-statistics'>
            {dataList.map((item, index) => (
              <div className='homework-statistics-box' key={index}>
                <div className='homework-statistics-box-item'>
                  <div className='homework-statistics-box-item-con'>
                    <div className='top'>{item.title}</div>
                    {isH5 && <Divider style={{ margin: '8px 0 5px 0' }} />}
                    <div className='middle'>{item.middleValue}</div>
                    <div className='bottom'>
                      {isH5 
                        ? item.h5BottomText()
                        : item.bottomText()
                      }
                    </div>
                  </div>
                </div>
                {!isH5 && index < dataList.length - 1 && <Divider type="vertical" />}
              </div>
            ))}
          </div>
      }
    </>
  )
}

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(TaskStatistics)