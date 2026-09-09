import { useState, useEffect } from "react";
import { useDispatch } from "@umijs/max";
import { Button, Modal, Tooltip } from "antd";
import { ZYIcon } from "@/components";

import "./index.less";
import Tracker from "@/components/Tracker";
import { addNewTracking } from "@/utils";

const ClassStudyInfo = (props: any) => {
  const { params, detailData, setDetailData } = props;

  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false); // 弹窗是否显示
  const [classInfo, setClassInfo] = useState<any>(null); // 班型信息
  const [learnInfo, setLearnInfo] = useState<any>([]); // 学情信息
  const [selected, setSelected] = useState<any>({}); // 选中的学情信息

  useEffect(() => {
    if (Object.keys(selected).length === 4) {
      postClassInfo();
    }
  }, [selected]);

  useEffect(() => {
    if (visible && detailData?.studies_degree) {
      const selected = {
        studies_degree: detailData?.studies_degree,
        motivation_habit: detailData?.motivation_habit,
        literacy_ability: detailData?.literacy_ability,
        class_learning_diff: detailData?.class_learning_diff,
      };
      setSelected({ ...selected });
    }
  }, [visible]);

  // 学情信息
  const postLearningInfo = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postLearningInfo",
      payload: params,
    });
    if (code == 200) {
      setLearnInfo(data);
    }
  };
  // 获取班型信息
  const postClassInfo = async () => {
    const { code, data, msg }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postClassType",
      payload: {
        subject: params?.subject,
        ...selected,
      },
    });
    if (code == 200) {
      setClassInfo(data);
    }
  };

  // 选择学情信息
  const setSelectedFun = (key: string, level: string) => {
    selected[key] = level;
    setSelected({ ...selected });
  };
  // 打开弹窗
  const openModal = () => {
    setVisible(true);
    postLearningInfo();
  };
  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
    setClassInfo({});
    setLearnInfo([]);
    setSelected({});
  };
  // 确认设置
  const handleOk = () => {
    closeModal();
    setDetailData({ ...selected, ...classInfo });
    // addNewTracking({
    //   bt: "cl",
    //   ct: "teaching_design_home_select_class_info",
    //   extra: { class_situation: classInfo?.classType },
    // });
  };

  // tooltip 提示
  const tooltipFun = (
    tips: Array<any>,
    title?: string,
    reate_title?: string,
  ) => {
    return (
      <div className="tooltip-content">
        <div className="title">
          {title}
          {reate_title && `: ${reate_title}`}
        </div>
        {tips.map((tip) => {
          return (
            <div key={tip.title}>
              <div className="subTitle">{tip.title}</div>
              <div className="content">{tip.content}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Button
        disabled={!params?.grade || !params?.stage}
        className={detailData?.classType ? "select-btn" : "unselect-btn"}
        onClick={openModal}
      >
        {detailData?.classType || "设置班级学情"}
        <ZYIcon type="settings" />
      </Button>
      <Modal
        title="设置班级学情"
        open={visible}
        destroyOnHidden
        maskClosable={false}
        onCancel={closeModal}
        onOk={handleOk}
      >
        <div className="study-info">
          {learnInfo.map((learning: any) => (
            <div key={learning.key}>
              <div className="title">
                {learning.title} <span className="required">*</span>
              </div>
              <div className="type">
                {learning.rates.map((level: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className={`type-item${selected[learning.key] === level.title ? " active" : ""}`}
                      onClick={() => setSelectedFun(learning.key, level.title)}
                    >
                      {level.title}
                      <Tooltip
                        color="#fff"
                        placement="bottom"
                        mouseEnterDelay={0.5}
                        classNames={{ root: "custom-tooltip" }}
                        title={tooltipFun(level.tips, learning.title, level.title)}
                      >
                        <div className="tooltip-icon">
                          <ZYIcon type={"xinxi"} />
                        </div>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="class-info">
          {classInfo?.classType && (
            <>
              <div className="title">{classInfo.classType}</div>
              <div className="content">
                {classInfo?.modules?.map(
                  (module: { title: string; content: string }) => (
                    <div key={module.title}>
                      <span className="subtitle">{module.title}</span>:{" "}
                      {module.content}
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ClassStudyInfo;
