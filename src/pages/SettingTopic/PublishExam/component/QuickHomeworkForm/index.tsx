import { Form, Input } from "antd";
import UploadComponents from "../../../components/UploadComponents";
import {
  QUICK_HOMEWORK_FILE_TYPES,
  REQUIREMENTS_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  UPLOAD_MAX_NUM,
} from "../../constants";

const { TextArea } = Input;

interface QuickHomeworkFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  flagStatus: string;
  uploadRef: React.MutableRefObject<any>;
  uploadList: any[];
  details: any;
  onFinish: (values: any) => void;
}

const QuickHomeworkForm = ({
  form,
  flagStatus,
  uploadRef,
  uploadList,
  details,
  onFinish,
}: QuickHomeworkFormProps) => (
  <Form
    name="classForm"
    initialValues={{}}
    form={form}
    onFinish={onFinish}
    autoComplete="off"
    style={{ marginTop: "24px" }}
    layout="vertical"
  >
    {flagStatus === "edit" ? (
      <div style={{ maxWidth: "600px" }}>
        <Form.Item
          label="作业名称:"
          name="title"
          rules={[
            {
              required: true,
              message: "请输入作业名称且最长为50个字符",
              min: 1,
              max: TITLE_MAX_LENGTH,
            },
          ]}
        >
          <Input
            style={{ maxWidth: "600px" }}
            count={{
              show: true,
              max: TITLE_MAX_LENGTH,
            }}
            placeholder="请输入作业名称"
          />
        </Form.Item>
        <Form.Item
          label="作业要求:"
          name="requirements"
          rules={[
            {
              required: true,
              message: "请输入作业要求",
              min: 1,
              max: REQUIREMENTS_MAX_LENGTH,
            },
          ]}
        >
          <TextArea
            showCount
            maxLength={REQUIREMENTS_MAX_LENGTH}
            placeholder="请输入作业要求"
            style={{ height: 120, resize: "none", maxWidth: "600px" }}
          />
        </Form.Item>
        <Form.Item label="作业附件" name="file_urls">
          <UploadComponents
            onRef={uploadRef}
            maxNum={UPLOAD_MAX_NUM}
            flagStatus={flagStatus}
            fileType={QUICK_HOMEWORK_FILE_TYPES}
            uploadList={[...uploadList]}
          />
        </Form.Item>
      </div>
    ) : (
      <div style={{ maxWidth: "600px" }}>
        <Form.Item label="作业名称:" name="title">
          <span>{details?.title || ""}</span>
        </Form.Item>
        <Form.Item label="作业要求:" name="requirements">
          <span>{details?.content || ""}</span>
        </Form.Item>
        <Form.Item label="作业附件:" name="file_urls">
          {uploadList?.length > 0 ? (
            <UploadComponents flagStatus={flagStatus} uploadList={[...uploadList]} />
          ) : (
            <>无</>
          )}
        </Form.Item>
      </div>
    )}
  </Form>
);

export default QuickHomeworkForm;
