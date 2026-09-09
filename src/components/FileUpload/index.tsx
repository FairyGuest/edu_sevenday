import { ZYIcon } from "@/components";
import { getSpaceId, getStorageToken } from "@/utils";
import { cogUrl } from "@/utils/host";
import { Button, Modal, Upload, Tooltip, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";

import "./index.less";

const MAX_UPLOAD_FILE_NUMBER = 1; // 控制最大上传文件数
const { Dragger } = Upload;

function DraggerUploadFile(props: any) {
  const { id } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 文件上传配置
  const uploadProps: any = {
    name: "files",
    showUploadList: true,
    data: {
      // space_id: getSpaceId(), // 课程id
      // label: "其他", // 标签
    },

    // accept: '.pdf',
    // action: `${cogUrl}/exams/upload-document`,
    action: `${cogUrl}/kb_docs/chat_upload_docs`,

    headers: {
      Authorization: getStorageToken() || "",
    },
    multiple: false,
    beforeUpload: (file: any) => {
      const isPdf = file.type === "application/pdf";
      const isLt100M = file.size / 1024 / 1024 < 200;
      if (!isPdf) {
        message.error("文件必须为 PDF 格式！");
        return Upload.LIST_IGNORE;
      }
      if (!isLt100M) {
        message.error("文件必须小于 200 MB！");
        return Upload.LIST_IGNORE;
      }
      return true;
    },

    onChange(info: any) {
      const { status, response } = info.file;
      console.log("info.file", info.file);
      if (status !== "uploading") {
      }
      if (status === "done") {
        const { code, data } = response;
        if (code === 200) {
          message.success(`${info.file.name} 上传成功`);
          props?.onFinish?.(data?.[0]);
          props?.onChange?.(data?.[0]);
          // handleCancel()
        } else {
          message.error(response?.msg || "上传失败");
        }
      } else if (status === "error") {
        message.error(`${info.file.name} 失败`);
      }
    },
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    props?.onFinish?.();
  };

  return (
    <>
      <div className="com_file_upload_detail">
        <div className="main_content">
          <Dragger {...uploadProps} maxCount={MAX_UPLOAD_FILE_NUMBER}>
            <div className="up_top">
              {props.types === "excel" ? (
                <div className="excel_icon">
                  <ZYIcon type="table" />
                </div>
              ) : (
                <div className="docs_icon">
                  <ZYIcon type="txt" />
                </div>
              )}
              <img className="up2" src={require("@/assets/up2.png")} alt="up" />
            </div>
            <p className="up_text">
              将文件拖拽到这里上传或 <span>点击添加</span>
            </p>
            <p className="up_desc">目前仅支持上传单个文件</p>
          </Dragger>
        </div>
      </div>
      {/* </Modal> */}
      {/* } */}
    </>
  );
}

export default DraggerUploadFile;
