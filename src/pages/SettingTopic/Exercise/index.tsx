import { useEffect, useRef } from "react";
import { useLocation, history } from "@umijs/max";
import { Button, Tabs, FloatButton, Modal, Spin, message } from "antd";
import Breadcrumb from "../components/Breadcrumb";
import Topic from "./component/Topic";
import TopicNumber from "./component/TopicNumber";
import { ZYIcon } from "@/components";
import OriginQuestionModal from "./component/OriginQuestionModal";
import ExerciseProgress from "./component/ExerciseProgress";
import ExercisesUploadFile from "@/components/EduSource/UploadFile/ExercisesUploadFile";
import { useExercise } from "./hooks";
import {all_question_number} from "@/global";

import "./index.less";


const Exercise = () => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const courseId = searchParams.get("courseId");
  const taskId = searchParams.get("taskId");
  // const rootTaskId = '6a84572a7b7e19fd47110156' //searchParams.get("rootTaskId");
  const rootTaskId = searchParams.get("rootTaskId");
  const status = searchParams.get("status");  // parsing: "解析中", editing: "编辑中", parse_failed: "解析失败",
  const topicRef = useRef<any>(null);
  const originQuestionModalRef = useRef<any>(null);
  const uploadRef = useRef<any>(null);

  const {
    questions,
    progress,
    progressMessage,
    taskStatus,
    pageLoading,
    saveLoading,
    activeIndex,
    topicKey,
    selectData,
    onSavePaper,
    onDeleteQuestion,
    onActiveChange,
    onQuestionsReorder,
    onTabsChange,
    flushCurrentQuestionOnLeave,
    originImages,
    onUploadFinish,
    onUploadSubmit,
  } = useExercise(courseId, taskId, rootTaskId, topicRef);

  useEffect(() => {
    const handlePageLeave = () => {
      flushCurrentQuestionOnLeave();
    };

    window.addEventListener("beforeunload", handlePageLeave);
    window.addEventListener("pagehide", handlePageLeave);

    return () => {
      window.removeEventListener("beforeunload", handlePageLeave);
      window.removeEventListener("pagehide", handlePageLeave);
    };
  }, [flushCurrentQuestionOnLeave]);

  const topicData = questions?.[activeIndex];
  const tabItems =
    topicData?.sub_questions?.map((item: any, index: number) => ({
      key: String(index + 1),
      label: item?.source_from === "ai_gen" ? "AI解析" : `题库原题${index + 1}`,
    })) || [];

  const isEditingStatus = status === "editing";
  const showProcessingInline =
    taskStatus === "processing" && !isEditingStatus;
  const showProcessingModal =
    taskStatus === "processing" && isEditingStatus;

  const onAddQuestion = () => {
    if ((questions?.length ?? 0) >= all_question_number) {
      message.warning("当前已达到最大题目数，建议删减题目后再增加");
      return;
    }
    uploadRef.current?.onUploadOpen();
  };

  const onBatchAssociate = () => {
    history.push(`/setTopic/associatedChapterKnowledgePoints${search}`);
  };

  return (
    <div className="exercise">
      <Spin spinning={saveLoading} wrapperClassName="exercise-save-spin">
        <div className="exercise-body">
          <Breadcrumb
            items={[
              {
                onClick: () =>
                  history.push(`/paperCompose`),
              },
              { title: "习题录入" },
            ]}
          />
          <div className="exercise-header">
            <div className="header-title">习题录入</div>
            <div className="header-btn">
              {questions?.length > 0 && (
                <>
                  {/* <Button
                    disabled={taskStatus !== "success" || !questions?.length}
                    onClick={onDeleteQuestion}
                  >
                    删除本题
                  </Button> */}
                  {/* <Button
                    disabled={taskStatus !== "success"}
                    onClick={onAddQuestion}
                  >
                    新增题目
                  </Button> */}
                  {/* <Button
                    disabled={taskStatus !== "success"}
                    onClick={onBatchAssociate}
                  >
                    批量关联
                  </Button> */}

                  <Button
                    type="primary"
                    disabled={selectData?.length === 0}
                    onClick={onSavePaper}
                  >
                    保存并出题
                  </Button>
                </>
              )}
            </div>
          </div>
          <>
            {pageLoading && (
              <div className="exercise-loading">
                <Spin />
              </div>
            )}
            {!pageLoading && taskStatus === "failed" && (
              <div className="exercise-error">
                <ZYIcon className="error-icon" type="tijiaochenggong" />
                <div className="error-text">题目解析失败</div>
              </div>
            )}
            {!pageLoading && showProcessingInline && (
              <ExerciseProgress
                progress={progress}
                progressMessage={progressMessage}
              />
            )}
            <Modal
              open={!pageLoading && showProcessingModal}
              title="新增题目"
              footer={null}
              closable={false}
              maskClosable={false}
              centered
              width={720}
              transitionName=""
              maskTransitionName=""
            >
              <ExerciseProgress
                progress={progress}
                progressMessage={progressMessage}
                className="exercise-progress-modal"
              />
            </Modal>
            {!pageLoading && taskStatus === "success" && questions?.length > 0 && (
              <div className="exercise-content">
                <div className="content-header">
                  <div className="content-title">
                    共识别
                    <span className="total">{questions?.length}</span>
                    道习题，已录入
                    <span className="entered">{selectData?.length}</span>题，保存并出题后，录入的题目将自动同步至个人题库对应教材章节
                  </div>
                  <TopicNumber
                    questions={questions}
                    activeIndex={activeIndex}
                    onActiveIndexChange={(index) => onActiveChange(index, topicRef)}
                    onQuestionsReorder={onQuestionsReorder}
                    tagIcon={<ZYIcon type="xuanze" />}
                  />
                </div>
                <div className="content-question">
                  <Tabs
                    activeKey={topicKey}
                    onChange={(key) => onTabsChange(key, topicRef)}
                    items={tabItems}
                  />
                  <Topic onRef={topicRef} />
                </div>
              </div>
            )}
            {/* {!pageLoading && taskStatus === "success" && <FloatButton
              shape="square"
              description='展开原题'
              icon={<ZYIcon type="zhankaiyuanti" />}
              className='float-button'
              onClick={() => originQuestionModalRef?.current?.openModal()}
            />} */}
            <OriginQuestionModal
              onRef={originQuestionModalRef}
              originImages={originImages}
            />
            <ExercisesUploadFile
              onRef={uploadRef}
              courseId={courseId}
              onFinish={onUploadFinish}
              submit={() => onUploadSubmit(uploadRef)}
              showType="checkbox"
              multiple
            />
          </>
        </div>
      </Spin>
    </div>
  );
};

export default Exercise;
