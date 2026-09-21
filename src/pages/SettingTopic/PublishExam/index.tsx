import { useRef, useState } from "react";
import { Button, Image } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { history, useLocation } from "@umijs/max";
import Breadcrumb from "../components/Breadcrumb";
import { useTeacherContext } from "@/components/LayoutSider";
import PublishExamForm from "./component/PublishExamForm";
import QuickHomeworkForm from "./component/QuickHomeworkForm";
import { useQuickHomework } from "./hooks";
import {
  HOMEWORK_TYPES,
  getHomeworkContentTitle,
  getHomeworkPageTitle,
} from "./constants";
import "./index.less";

const PublishExam = () => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [context] = useTeacherContext();
  const courseId = context?.course_id;

  const homeworkType = searchParams.get("homeworkType");
  const status = searchParams.get("status");
  const paperId = searchParams.get("paperId") || "";
  const paperName = searchParams.get("paperName") || "";

  const uploadRef = useRef<any>(null);
  const publishFormRef = useRef<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [publishLoading, setPublishLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const { form, examId, uploadList, flagStatus, details, loading, onFinish } =
    useQuickHomework({
      courseId,
      homeworkType,
      status,
      examIdFromUrl: searchParams.get("examId"),
    });

  const isPublishMode = homeworkType === HOMEWORK_TYPES.PUBLISH;
  const isLookMode = homeworkType === HOMEWORK_TYPES.LOOK;
  const returnToWorkbench = () =>
    history.push(
      `/homework?sub=assign${courseId ? `&courseId=${encodeURIComponent(courseId)}` : ""}`,
    );

  return (
    <div className="setting_homework_box">
      <Button
        className="homework-back"
        aria-label="返回作业工作台"
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={returnToWorkbench}
      >
        返回作业工作台
      </Button>
      <Breadcrumb
        items={[
          {
            title: "作业下发",
            onClick: returnToWorkbench,
          },
          { title: getHomeworkPageTitle(homeworkType) },
        ]}
      />
      <div className="setting_homework_title_box">
        <div className="setting_homework_title_text">
          {getHomeworkContentTitle(homeworkType)}
        </div>
        {isPublishMode && (
          <div className="setting_homework_save_cancel_btn_box">
            <Button onClick={returnToWorkbench}>取消</Button>
            <Button
              type="primary"
              loading={publishLoading}
              onClick={() => publishFormRef.current?.submit()}
            >
              发布
            </Button>
          </div>
        )}
        {!isPublishMode && !isLookMode && (
          <div className="setting_homework_save_cancel_btn_box">
            <Button
              type="primary"
              loading={loading}
              onClick={() => form.submit()}
            >
              保存
            </Button>
          </div>
        )}
      </div>
      {isPublishMode || isLookMode ? (
        <div className="setting_homework_content_box">
          <PublishExamForm
            courseId={courseId}
            examId={examId}
            paperId={paperId}
            paperName={paperName}
            mode={isLookMode ? "look" : "publish"}
            onRef={publishFormRef}
            onLoadingChange={setPublishLoading}
          />
        </div>
      ) : (
        <div ref={printRef} className="setting_homework_content_box">
          <QuickHomeworkForm
            form={form}
            flagStatus={flagStatus}
            uploadRef={uploadRef}
            uploadList={uploadList}
            details={details}
            onFinish={(values) => onFinish(values, uploadRef)}
          />
        </div>
      )}
      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </div>
  );
};

export default PublishExam;
