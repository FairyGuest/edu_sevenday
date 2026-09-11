import { useState, useRef, useEffect } from "react";
import { useSelector, history } from "@umijs/max";
import { Button, Modal, Popover, Tooltip, message } from "antd";
import { ZYIcon } from "@/components";

import "./index.less";

const UnitHeader = (props: any) => {
  const {
    sizes,
    step,
    setStep,
    teachPlan,
    studyPlan,
    currClass,
    currStudy,
    setCurrClass,
    setCurrStudy,
  } = props;

  const {
    planParams,
    planSseLoading,
    childPlanLoading,
    studyPlanLoading,
    leftChatLoading,
  } = useSelector((state: any) => state.teachDesginModel);
  const [messageApi, contextHolder] = message.useMessage();
  const { confirm } = Modal;
  const [openClass, setOpenClass] = useState(false);
  const [openStudy, setOpenStudy] = useState(false);

  // 课时、学案下拉渲染
  const teachPlanRender = (data: any[], step: number) => {
    return (
      <>
        <div className="plan-item-tips">
          {step === 2 ? (
            <>
              生成课时教案，请到单元教案<span>「单元规划表」</span>操作
            </>
          ) : (
            <>生成学案，请到对应的课时教案操作</>
          )}
        </div>
        {data.map((item: any, index: number) => (
          <div
            key={item?.id || index}
            onClick={() => planSelectClick(item, step)}
            className={checkClassName(item, step)}
          >
            <div className="plan-item-left">
              <div className="plan-item-icon">
                {!item?.has_plan && !item?.has_study_plan && (
                  <ZYIcon type="circle" style={{ color: "#cbd2e1" }} />
                )}
                {(item?.has_plan || item?.has_study_plan) && (
                  <ZYIcon type="check1" style={{ color: "#1c6cff" }} />
                )}
              </div>
              <Tooltip title={item?.title}>
                <div className="plan-item-title">{item?.title}</div>
              </Tooltip>
            </div>
          </div>
        ))}
      </>
    );
  };
  // 检查类名
  const checkClassName = (item: any, step: number) => {
    let name = "plan-item";
    if (step === 2) {
      if (item?.has_plan) {
        name += " plan-item-done";
      }
      if (item?.id === currClass?.id) {
        name += " plan-item-active";
      }
    } else if (step === 3) {
      if (item?.has_study_plan) {
        name += " plan-item-done";
      }
      if (item?.plan_id === currStudy?.plan_id) {
        name += " plan-item-active";
      }
    }
    return name;
  };
  // 单元教案图标
  const unitPlanIcon = () => {
    return <ZYIcon type={planParams?.id ? "check1" : "weianshitijiao"} />;
  };
  // 课时教案图标
  const classPlanIcon = () => {
    let type = "";
    if (teachPlan.every((item: any) => !item?.has_plan)) {
      type = "circle";
    } else if (teachPlan.every((item: any) => item?.has_plan)) {
      type = "check1";
    } else {
      type = "weianshitijiao";
    }
    return (
      <ZYIcon
        type={type}
        style={{ color: type === "circle" ? "#cbd2e1" : "" }}
      />
    );
  };
  // 学案图标
  const studyPlanIcon = () => {
    let type = "";
    if (studyPlan.every((item: any) => !item?.has_study_plan)) {
      type = "circle";
    } else if (studyPlan.every((item: any) => item?.has_study_plan)) {
      type = "check1";
    } else {
      type = "weianshitijiao";
    }
    return (
      <ZYIcon
        type={type}
        style={{ color: type === "circle" ? "#cbd2e1" : "" }}
      />
    );
  };

  // 课时、学案点击
  const planSelectClick = (item: any, step: number) => {
    if (!item?.has_plan && !item?.has_study_plan) {
      // D3：学案支持单元内直接生成（教案仍引导到规划表）
      if (step === 3) {
        confirm({
          title: `为「${item?.title}」生成学案？`,
          content: "将以该课时教案为依据生成学生版学案（含分层任务）。",
          okText: "生成学案",
          cancelText: "取消",
          onOk: () => {
            setCurrClass({});
            setCurrStudy({ plan_id: item?.plan_id || item?.id, title: item?.title });
            setOpenStudy(false);
            setStep(3);
          },
        });
        return;
      }
      messageApi.error("请先生成对应教案或学案，才可以查看");
      return;
    }
    if (step === 2) {
      setCurrClass(item);
      setOpenClass(false);
      setCurrStudy({});
    } else if (step === 3) {
      setCurrClass({});
      setCurrStudy(item);
      setOpenStudy(false);
    }
    setStep(step);
  };

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
    <div className="unit-header">
      <div className="unit-header-left">
        <Button
          color="default"
          variant="text"
          size="small"
          icon={<ZYIcon type={"zuo"} />}
          onClick={() => history.replace("/design")}
        />
      </div>
      <div className="unit-header-right">
        <div className="step">
          <div className={step === 1 ? "step-item active" : "step-item"}>
            <Button
              color="default"
              variant="text"
              disabled={
                planSseLoading ||
                childPlanLoading ||
                studyPlanLoading ||
                leftChatLoading
              }
              onClick={() => {
                setStep(1);
                setCurrClass({});
                setCurrStudy({});
              }}
            >
              {unitPlanIcon()}
              单元教案
            </Button>
            <div className="step-item-line"></div>
          </div>
          <div className={step === 2 ? "step-item active" : "step-item"}>
            <Popover
              trigger="click"
              placement="bottom"
              open={openClass}
              onOpenChange={setOpenClass}
              title={teachPlanRender(teachPlan, 2)}
              classNames={{ root: "plan-popover" }}
            >
              <Button
                color="default"
                variant="text"
                disabled={
                  planSseLoading ||
                  childPlanLoading ||
                  studyPlanLoading ||
                  leftChatLoading ||
                  !teachPlan?.length
                }
              >
                {classPlanIcon()}
                课时教案
                <ZYIcon type="xia" />
              </Button>
            </Popover>
            <div className="step-item-line"></div>
          </div>
          <div className={step === 3 ? "step-item active" : "step-item"}>
            <Popover
              trigger="click"
              placement="bottom"
              open={openStudy}
              onOpenChange={setOpenStudy}
              title={teachPlanRender(studyPlan, 3)}
              classNames={{ root: "plan-popover" }}
            >
              <Button
                color="default"
                variant="text"
                disabled={
                  planSseLoading ||
                  childPlanLoading ||
                  studyPlanLoading ||
                  leftChatLoading ||
                  !studyPlan?.length
                }
              >
                {studyPlanIcon()}
                学案
                <ZYIcon type="xia" />
              </Button>
            </Popover>
            {contextHolder}
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

export default UnitHeader;
