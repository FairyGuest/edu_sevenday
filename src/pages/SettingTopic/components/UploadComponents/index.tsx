import React, { useEffect, useState, useImperativeHandle, useRef } from "react";
import { Upload, Button, Card, Typography, Space, message, Image } from "antd";
import {
  UploadOutlined,
  PictureOutlined,
  EyeOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { ZYIcon } from "@/components";
import { cogUrl } from "@/utils/host";
import { getStorageToken, handleName, formatStaticUrl } from "@/utils";
import "./index.less";

const { Text, Title } = Typography;

const IMAGE_EXTS = ["jpeg", "jpg", "png", "bmp"];

/** 从文件名或 URL 路径取扩展名（详情接口 name 常无后缀，需从 url 推断） */
const getExtFromPath = (path?: string) => {
  if (!path || typeof path !== "string") return "";
  const clean = path.split("?")[0].split("#")[0];
  const base = clean.split("/").pop() || clean;
  const parts = base.split(".");
  return parts.length > 1 ? (parts.pop() || "").toLowerCase() : "";
};

const resolveUploadedFileData = (response: any) => {
  const raw = response?.data;
  return Array.isArray(raw) ? raw[0] : raw;
};

const getFileExtension = (fileOrName?: any) => {
  if (!fileOrName) return "";
  if (typeof fileOrName === "string") return getExtFromPath(fileOrName);

  const type = fileOrName.type;
  if (typeof type === "string" && type) {
    if (!type.includes("/")) return type.toLowerCase();
    const mimeExt = type.split("/").pop()?.toLowerCase();
    if (mimeExt) return mimeExt === "jpeg" ? "jpg" : mimeExt;
  }

  const fromName = getExtFromPath(
    fileOrName.name || fileOrName.filename || fileOrName.fileName,
  );
  if (fromName) return fromName;

  return getExtFromPath(
    fileOrName.url || resolveUploadedFileData(fileOrName.response)?.url,
  );
};

/** 解析 /web/file/saveUploadedFile 返回：data 为对象 { id, url, size, type, ... } */
export const resolveExamUploadFileId = (file: any) => {
  const raw = file?.response?.data;
  const data = Array.isArray(raw) ? raw[0] : raw;
  if (data != null && typeof data === "object") {
    return data.id ?? data.fileId ?? data.file_id;
  }
  if (data != null && data !== "") {
    return data;
  }
  return file?.id ?? file?.fileId ?? file?.file_id;
};

const App = (props: any) => {
  const { flagStatus = "edit", maxNum = 3, uploadList = [], onRef, onChange, fileType = ["jpg", "jpeg", "bmp", "png", "doc", "docx", "pdf", 'pptx', 'ppt'], btnText = '上传附件' } = props;
  const normalizedFileTypes = fileType.map((t: string) => t.toLowerCase());

  // console.log("上传", props);

  const [fileList, setFileList] = useState<any>([]);
  const fileListRef = useRef<any[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);

  const [previewImage, setPreviewImage] = useState("");

  const uploadProps: any = {
    name: "file",
    action: `${cogUrl}/web/exam/uploadFile`,
    headers: { Authorization: getStorageToken() || "" },
    data: {
      path: 'edu-assistant/exam-distribution'
    }
  };

  useEffect(() => {
    const arr = (uploadList || []).map((item: any, index: number) => ({
      ...item,
      uid: item?.uid ?? item?.id ?? item?.url ?? String(index),
      name: item?.name ?? item?.filename ?? item?.fileName ?? `附件${index + 1}`,
      status: item?.status ?? "done",
      url: item?.url,
      size: item?.size ?? item?.size_bytes,
      response: item?.response ?? { data: item },
    }));
    setFileList(arr);
  }, [uploadList]);

  useEffect(() => {
    fileListRef.current = fileList;
  }, [fileList]);

  useImperativeHandle(onRef, () => ({
    getFileList: () => fileListRef.current,
    getFileIdList: () =>
      fileListRef.current
        .filter(
          (file) =>
            file?.status === "done" ||
            file?.status == null ||
            resolveExamUploadFileId(file),
        )
        .map(resolveExamUploadFileId)
        .filter((id: any) => id != null && id !== ""),
  }));

  // 处理文件上传前的验证
  const beforeUpload = (file: File) => {

    if (file.size == 0) {
      message.error("上传的文件为空");
      return Upload.LIST_IGNORE;
    }
    // 文件大小限制 20MB
    const isLt20M = file.size / 1024 / 1024 <= 20;
    if (!isLt20M) {
      message.error("单个文件大小不超过20MB");
      return Upload.LIST_IGNORE;
    }

    // 文件数量限制（排除示例文件）
    if (fileList.length >= maxNum) {
      message.error(`最多上传${maxNum}个文件`);
      return Upload.LIST_IGNORE;
    }

    const fileExtension = getFileExtension(file?.name);

    if (!fileExtension || !normalizedFileTypes.includes(fileExtension)) {
      message.error(`不支持 ${fileExtension} 格式，请上传支持的文件格式`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  // 处理文件变化
  const handleChange = (info: any) => {
    // console.log("info", info);

    let newFileList = [...info?.fileList];

    // 限制最多3个真实文件
    if (newFileList.length > maxNum) {
      newFileList = [...newFileList.slice(-3)];
      message.warning(`最多上传${maxNum}个文件，已自动移除较早的文件`);
    }

    if (info?.file?.status === "done") {
      const response = info?.file?.response || {};
      const { code } = response;
      if (code === 200 || code === 0) {
        // data: { id, md5, name, type, size, url, ... }；接口 name 常为 Default，保留本地文件名
        const uploaded = resolveUploadedFileData(response);
        newFileList = newFileList.map((file: any) =>
          file.uid === info.file.uid
            ? {
                ...file,
                id: uploaded?.id ?? file.id,
                url: uploaded?.url ?? file.url,
                size: uploaded?.size ?? file.size,
                name: file.name || info.file.name,
                response,
              }
            : file,
        );
        message.success(`${info?.file?.name} 上传成功`);
      } else {
        message.warning(response?.msg || `${info?.file?.name} 上传失败`);
      }
    } else if (info?.file?.status === "error") {
      message.error(`${info?.file?.name} 上传失败`);
      return;
    }
    setFileList(newFileList);
    onChange?.(newFileList);
  };

  // 删除文件
  const handleRemove = (file: any) => {
    const newFileList = fileList.filter((item: any) => item.uid !== file.uid);
    setFileList(newFileList);
    onChange?.(newFileList);
  };

  const fileTypeName = () => {
    return fileType?.join('、')
  }

  const isFlagIncludedPdf = (file: any) => {
    return getFileExtension(file) === "pdf";
  };

  const isFlagIncluded = (file: any) => {
    return IMAGE_EXTS.includes(getFileExtension(file));
  };

  // 获取文件图标（不变）
  const getFileIcon = (file: any) => {
    if (file?.status === "uploading") {
      return <LoadingOutlined spin className="file-icon uploading" />; // 上传中加载动画
    }
    const ext = getFileExtension(file);
    if (IMAGE_EXTS.includes(ext))
      return <ZYIcon type={"tupianwenjianicon"} style={{ fontSize: 38 }} />;
    if (ext === "pdf" || file?.type?.includes?.("pdf"))
      return <ZYIcon type={"pdfwenjianicon"} style={{ fontSize: 38 }} />;
    if (["doc", "docx"].includes(ext) || file?.type?.includes?.("word"))
      return <ZYIcon type={"wordwenjianicon"} style={{ fontSize: 38 }} />;
    if (["ppt", "pptx"].includes(ext))
      return <ZYIcon type={"pptwenjianicon"} style={{ fontSize: 38 }} />;

    return <ZYIcon type={"wordwenjianicon"} style={{ fontSize: 38 }} />;
  };
  return (
    <div className="homework_upload_file">
      {/* 上传按钮 */}
      {flagStatus == 'edit' && <>
        <Upload
          {...uploadProps}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          fileList={[...fileList]}
          onRemove={handleRemove}
          showUploadList={false}
          listType="picture"
        >
          <Button icon={<UploadOutlined />} disabled={fileList?.length >= maxNum || flagStatus != 'edit'}>
            {btnText}
          </Button>
        </Upload>

        {/* 文件格式说明 */}
        <div className="homework_file_tip">
          支持{fileTypeName()}，单个文件大小不超过
          20MB，最多上传{maxNum}个文件。
        </div>
      </>
      }

      <div className="upload_file_list_edit">
        {fileList?.map((file: any, index: any) => {
          return (
            <div key={index} className="file_item">
              <div className="file_info">
                <div className="file_icon">{getFileIcon(file)}</div>
                <div className="file_meta">
                  <Text className="file_name_look">{file?.name}</Text>
                  <Text className="file_size">
                    {getFileExtension(file)?.toUpperCase() || "文件"}
                    {file?.size
                      ? ` - ${(file.size / (1024 * 1024)).toFixed(1)}M`
                      : ""}
                  </Text>
                </div>
              </div>
              <div className="file_actions">
                {file?.status !== "uploading" &&
                  (isFlagIncluded(file) || isFlagIncludedPdf(file)) && (
                    <ZYIcon
                      type={"chakan"}
                      className="homework_chakan_icon"
                      onClick={() => {
                        if (isFlagIncluded(file)) {
                          setPreviewOpen(true);
                          setPreviewImage(
                            resolveUploadedFileData(file?.response)?.url ||
                              file?.url,
                          );
                        }
                        if (isFlagIncludedPdf(file)) {
                          window.open(
                            resolveUploadedFileData(file?.response)?.url ||
                              file?.url,
                          );
                        }
                      }}
                    />
                  )}

                {flagStatus == "edit" && (
                  <ZYIcon
                    type={"shanchu4"}
                    className="homework_shanchu_icon"
                    onClick={() => handleRemove(file)}
                  />
                )}

                {flagStatus != "edit" && (
                  <div className="homework_xiazai_icon_box">
                    <ZYIcon
                      type={"download"}
                      className="homework_xiazai_icon"
                      onClick={() => {
                        window.open(
                          resolveUploadedFileData(file?.response)?.url ||
                            file?.url,
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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

export default App;
