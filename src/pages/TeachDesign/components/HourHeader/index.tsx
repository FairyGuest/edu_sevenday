import { useEffect, useState } from "react";
import { Button, Popover, Tooltip } from "antd";
import { connect, useDispatch, useRequest, history } from "umi";
import { ZYIcon } from "@/components";

import "./index.less";

const HourHeader = (props: any) => {
  const dispatch = useDispatch();
  const { teachDesginModel, step = 1, setStep, hourStatus, planStatus, planDetail, refreshContent, setPlanStatus, sizes } = props;
  const { planSseLoading } = teachDesginModel;
  const { has_study_plan } = planDetail

  // const [step, setStep] = useState(1); // 当前步骤  1: 课时教案 2: 学案
  // const [hourStatus, setHourStatus] = useState('loading') //课时 loading 进行中   finish 完成
  // const [planStatus, setPlanStatus] = useState('') //学案 loading 进行中   finish 完成

  const stepChange = (val: any) => {
    setStep(val)
    if (val == 1) {
      refreshContent?.()
      setPlanStatus('')
    }
  }

  // 学案的状态icon
  const getPlanIcon = () => {
    if (step == 2) {
      if (has_study_plan) {

        return <ZYIcon type="check1" />

      } else {

        if (planStatus == 'loading') {
          return <ZYIcon type="weianshitijiao" />
        }

        if (planStatus == 'finish') {
          return <ZYIcon type="check1" />
        }

        return <ZYIcon type="circle" />
      }
    } else {
      if (has_study_plan) {

        return <ZYIcon type="check1" />

      } else {
        if (planStatus == 'loading') {

          return <ZYIcon type="weianshitijiao" />
        }
        if (planStatus == 'finish') {

          return <ZYIcon type="check1" />

        }
        return <ZYIcon type="circle" style={{ color: "#CBD2E1" }} />
      }
    }
  }

  // 头部收起点击
  const onLeftPreview = () => {
    const collapseEnd = document.querySelector(
      ".ant-splitter-bar-collapse-bar-end",
    ) as HTMLElement;
    // 折叠才能点击
    if (!collapseEnd) {
      const collapseBtn = document.querySelector(
        ".ant-splitter-bar-collapse-bar-start",
      ) as HTMLElement;
      collapseBtn?.click();
    } else {
      return;
    }
  };

  return (
    <div className="hour-header">
      <div className="hour-header-left">
        <Button
          color="default"
          variant="text"
          size="small"
          icon={<ZYIcon type={"zuo"} />}
          onClick={() => history.replace("/design")}
        />
      </div>
      <div className="hour-header-right">
        <div className="step">
          <div className={step === 1 ? "step-item active" : "step-item"}>
            <Button color="default" variant="text" disabled={planSseLoading && step != 1} onClick={() => { stepChange(1) }}>
              {hourStatus == 'loading' && <ZYIcon type="weianshitijiao" />}
              {hourStatus == 'finish' && <ZYIcon type="check1" />}
              课时教案
            </Button>
            <div className="step-item-line"></div>
          </div>
          <div className={step === 2 ? "step-item active" : "step-item"}>
            <Button color="default" variant="text" disabled={(planSseLoading && step != 2) || (!has_study_plan && step != 2)} onClick={() => { stepChange(2) }}>
              {/* {step == 2 ? <ZYIcon type="circle" /> : <ZYIcon type="circle" style={{ color: "#CBD2E1" }} />} */}
              {getPlanIcon()}
              {/* {planStatus == 'loading' && <ZYIcon type="weianshitijiao" />}
              {planStatus == 'finish' && <ZYIcon type="check1" />} */}
              {/* <ZYIcon type="circle" /> */}
              学案
            </Button>
          </div>
        </div>
      </div>
      {!sizes[1] && (
        <Tooltip title={"打开教案"} placement="left">
          <Button
            type="text"
            size="small"
            icon={<ZYIcon type="jiaoan" />}
            onClick={() => onLeftPreview()}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default connect((state: any) => ({
  teachDesginModel: state.teachDesginModel,
}))(HourHeader);
