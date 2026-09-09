import { Row, Col } from 'antd';
import ZYIcon from '@/components/ZYIcon';
import { useLocation } from '@umijs/max';
import { connect } from '@umijs/max'

import './index.less';

const BaseInfo = ({
  baseInfo, 
  loading,
  analysisModel
}: {
  baseInfo: any, 
  loading: boolean
  analysisModel: any
}) => {
  const isH5 = useLocation().pathname.includes('analysisH5');
  const { analysisType } = analysisModel
  const effectiveAnalysisType = isH5 ? 'personal' : analysisType;

  return (
    <>
      {loading
        ? <div className='loading-box'>
            <span className="anticon-spin">
              <ZYIcon type="load-color" style={{ fontSize: "20px" }} />
            </span>
            <span className="text">数据加载中</span>
          </div>
        : <div className='student-info'>
          {/* <Avatar src={formatStaticUrl(studentInfo?.avatar)} size={40} /> */}
          <div className='student-info-box'>
            <div className='student-info-box-title'>
              {effectiveAnalysisType == 'personal' 
                ? baseInfo?.student_name 
                : baseInfo?.class_name}{isH5 ? <br /> : ''
              }《作业分析报告-{baseInfo?.subject_name}》
            </div>
            <Row className='student-info-box-items'>
              <Col span={isH5 ? 24 : 7} className='student-info-box-items-part'>
                <div className='item'>
                  <ZYIcon type="banji" />
                  <span className='label'>班级</span>
                  <span className='value'>{baseInfo?.class_name}</span>
                </div>
                <div className='item'>
                  <ZYIcon type="banzhuren" />
                  <span className='label'>老师</span>
                  <span className='value'>{baseInfo?.teacher_name}</span>
                </div>
              </Col>
              <Col span={isH5 ? 24 : 12} className='student-info-box-items-part'>
                <div className='item'>
                  <ZYIcon type="baogaozhouqi" />
                  <span className='label'>报告周期</span>
                  <span className='value'>{baseInfo?.start_time} 至 {baseInfo?.end_time}</span>
                </div>
                <div className='item'>
                  <ZYIcon type="shengchengriqi" />
                  <span className='label'>生成日期</span>
                  <span className='value'>{baseInfo?.report_generated_date}</span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      }
    </>
  )
}

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
}))(BaseInfo)