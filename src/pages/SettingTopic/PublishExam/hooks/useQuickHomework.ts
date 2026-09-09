import { useCallback, useEffect, useState } from "react";
import { Form, message } from "antd";
import { history } from "@umijs/max";
import { useDispatch } from "@umijs/max";
import {
  HOMEWORK_TYPES,
  buildDefaultQuickHomeworkTitle,
  isApiSuccess,
} from "../constants";

export const useQuickHomework = ({
  courseId,
  homeworkType,
  status,
  examIdFromUrl,
}: {
  courseId?: string | number;
  homeworkType?: string | null;
  status?: string | null;
  examIdFromUrl?: string | null;
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [examId, setExamId] = useState(examIdFromUrl || "");
  const [uploadList, setUploadList] = useState<any[]>([]);
  const [flagStatus, setFlagStatus] = useState("edit");
  const [flagType, setFlagType] = useState("add");
  const [details, setDetails] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const getRecordRowExams = useCallback(async () => {
    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "getExamsQuestionsList",
      payload: {
        id: examId,
      },
    });
    if (isApiSuccess(code)) {
      setDetails(data);
      form.setFieldsValue({
        title: data?.title || "",
        requirements: data?.content || "",
      });
      setUploadList(data?.file_urls || []);
    }
  }, [dispatch, examId, form]);

  useEffect(() => {
    if (homeworkType === HOMEWORK_TYPES.PUBLISH || homeworkType === HOMEWORK_TYPES.LOOK) {
      setFlagType(homeworkType);
      setFlagStatus(homeworkType === HOMEWORK_TYPES.LOOK ? "look" : "edit");
      return;
    }

    let nextType = homeworkType === HOMEWORK_TYPES.COPY ? HOMEWORK_TYPES.EDIT : homeworkType;
    if (status === "editable") {
      nextType = HOMEWORK_TYPES.EDIT;
    }

    setFlagType(nextType || HOMEWORK_TYPES.ADD);

    if (homeworkType === HOMEWORK_TYPES.ADD) {
      form.setFieldsValue({
        title: buildDefaultQuickHomeworkTitle(),
        requirements: "",
        file_urls: [],
      });
      setFlagStatus("edit");
    }

    if (homeworkType === HOMEWORK_TYPES.EDIT || homeworkType === HOMEWORK_TYPES.COPY) {
      setFlagStatus("edit");
    }

    if (homeworkType === HOMEWORK_TYPES.LOOK) {
      setFlagStatus("edit");
    }
  }, []);

  useEffect(() => {
    if (homeworkType === HOMEWORK_TYPES.PUBLISH || homeworkType === HOMEWORK_TYPES.LOOK) {
      return;
    }
    if (examId) {
      getRecordRowExams();
    }
  }, [examId, getRecordRowExams, homeworkType]);

  const onFinish = useCallback(
    async (values: any, uploadRef: React.MutableRefObject<any>) => {
      setLoading(true);
      const fileUrlsList = uploadRef?.current?.getFileList();
      const file_urls =
        fileUrlsList?.length > 0
          ? fileUrlsList.map((item: any) => item?.response?.data)
          : [];

      const payload = {
        title: values?.title,
        course_id: courseId,
        requirements: values?.requirements,
        file_urls,
      };

      const { code, data }: any = await dispatch({
        type: "setQuestionsModel/postData",
        apiUrl: "postExamsCustomHomework",
        payload,
      });
      if (isApiSuccess(code)) {
        message.success("操作成功");
        setExamId(data?.exam_id);
        setFlagType(HOMEWORK_TYPES.EDIT);
        setFlagStatus("edit");
        history.push("/setTopic");
      }
      setLoading(false);
    },
    [courseId, dispatch],
  );

  return {
    form,
    examId,
    uploadList,
    flagStatus,
    flagType,
    details,
    loading,
    onFinish,
  };
};
