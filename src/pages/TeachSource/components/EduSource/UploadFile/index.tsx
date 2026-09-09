import { useRef, useState, useImperativeHandle } from "react";
import { Button, Modal, Upload, Progress, message } from "antd";
import { ZYIcon } from "@/components";
import { getStorageToken, handleName } from "@/utils";
import { cogUrl } from "@/utils/host";
import { postDataService } from "../../../services";

import "./index.less"

const MAX_UPLOAD_FILE_NUMBER = 5; // 控制最大上传文件数
const { Dragger } = Upload;

const DraggerUploadFile = (props: any) => {
  const { courseId, catalogId, onRef } = props;

  const [modal, contextHolder] = Modal.useModal();
  const [label, setLabel] = useState("教材");
  const [isModalOpen, setIsModalOpen] = useState(false); // 上传弹窗
  const [fileList, setFileList] = useState<any[]>([]); // 文件列表
  const isUploadingRef = useRef(false);

  const fileType = ["txt", "doc", "docx", "pdf", "html"]; // 支持的文件类型
  const pptType = ["pptx"]; // ppt类型
  const imgType = ["jpg", "jpeg", "png"]; // 图片类型
  const excelType = ["xlsx", "csv"]; // excel类型
  const videoType = ["mp3", "wav", "m4a", "wma", "aac", "ogg", "amr", "flac", "mp4", "wmv", "m4v", "flv", "rmvb", "dat", "mov"]; // 音视频类型
  const mindType = ["xmind", "mm", "mmap"]; // 思维导图类型

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    onUploadOpen: (label: string) => {
      setLabel(label);
      setIsModalOpen(true);
    },
  }));

  // 文件上传类型
  const getFileType = (label: any) => {
    switch (label) {
      case "教材":
        return [...fileType, ...imgType];
      case "教学计划":
        return [...fileType, ...imgType];
      case "讲义":
        return [...fileType, ...pptType, ...imgType];
      case "文献":
        return [...fileType, ...imgType];
      case "题库":
        return [...fileType, ...excelType];
      case "参考书":
        return [...fileType, ...imgType];
      case "音视频":
        return videoType;
      case "其他":
        return [...fileType, ...imgType, ...pptType, ...excelType];
      default:
        return fileType;
    }
  };

  // 文件上传配置
  const uploadProps: any = {
    name: "files",
    showUploadList: true,
    data: {
      space_id: courseId, // 课程id
      catalog_id: catalogId === "all" ? "" : catalogId, // 目录id
      label: label, // 标签
    },
    accept: getFileType(label).map((item: any) => `.${item}`).join(","), // 支持的文件类型
    action: `${cogUrl}/kb_docs/upload_label_docs`,
    headers: { Authorization: getStorageToken() || "" },
    multiple: true,
    beforeUpload: (file: any, fileList: any) => {
      const isLt200M = file.size / 1024 / 1024 < 200;
      const isLt2G = file.size / 1024 / 1024 / 1024 < 2;
      const type = handleName(file.name).type;
      if (!getFileType(label).includes(type)) {
        message.error("文件格式暂不支持！");
        return Upload.LIST_IGNORE;
      }
      if (fileList.length > MAX_UPLOAD_FILE_NUMBER) {
        message.error("最多上传 5 个文件！");
        return Upload.LIST_IGNORE;
      }
      if (!isLt200M && label !== "音视频") {
        message.error("文件必须小于 200 MB！");
        return Upload.LIST_IGNORE;
      }
      if (!isLt2G && label === "音视频") {
        message.error("文件必须小于 2 GB！");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    // 上传文件状态改变时触发
    onChange: async (info: any) => {
      isUploadingRef.current = true;
      const { status, response = {} } = info.file;

      if (status === "uploading") {
        setFileList(info.fileList);
      }
      if (status === "done") {
        const { data, code } = response;
        if (code === 200) {
          message.success(`${info.file.name} 上传成功`);
          setFileList((prev: any) => {
            const newFileList = [...prev];
            const index = prev.findIndex(
              (item: any) => item.uid === info.file.uid,
            );
            if (index !== -1) {
              newFileList[index] = {
                ...info.file,
                ...data[0],
              };
              info.file.id = data[0]?.id;
            }
            return newFileList;
          });
        } else {
          message.error(response?.msg || `${info.file.name} 上传失败`);
          // 上传失败的文件
          setFileList((prev: any) => {
            const newFileList = [...prev];
            const index = prev.findIndex(
              (item: any) => item.uid === info.file.uid,
            );
            if (index !== -1) {
              newFileList[index] = {
                ...newFileList[index],
                status: "error",
              };
              info.file.status = "error";
            }
            return newFileList;
          });
        }
      } else if (status === "error") {
        message.error(`${info.file.name} 上传失败`);
        setFileList(info.fileList);
      }

      // 所有文件上传完成
      if (info.fileList.every((file: any) => file.status !== "uploading")) {
        isUploadingRef.current = false;
        setTimeout(() => {
          if (
            info.fileList.length > 0 &&
            info.fileList.some((file: any) => file.status === "done")
          ) {
            handleCancel();
          }
        }, 2000);
      }
    },
    onRemove: (file: any) => onClickDelete(file),
    itemRender: (originNode: any, file: any, fileList: any, actions: any) => (
      <>
        {fileList[0]?.uid === file?.uid && handleCheck()}
        <div key={file.uid} className="file_item">
          <div className="file_item_name">
            <ZYIcon type={handleName(file?.name).icon} />
            <span>{file?.name}</span>
          </div>
          <div className="file_item_content">
            <div></div>
            {file?.status !== "done" ? (
              <div className="file_item_progress">
                <Progress
                  type="dashboard"
                  size={20}
                  gapDegree={10}
                  gapPosition="right"
                  percent={Math.round(file.percent)}
                  strokeColor={file.status === "error" ? "#EF4444" : "#52c41a"} // 进度条颜色
                />
                {file.status !== "error" && (
                  <span className="text">{Math.round(file.percent)}%</span>
                )}
              </div>
            ) : (
              <ZYIcon
                type="check"
                style={{ color: "#10B981", fontSize: "18px" }}
              />
            )}
            <div className="file_item_action">
              <Button
                type="text"
                onClick={() => actions.remove(file)}
                icon={<ZYIcon type="close" />}
              />
            </div>
          </div>
        </div>
      </>
    ),
  };

  // 点击删除文件
  const onClickDelete = async (file: any) => {
    // 上传成功删除文件
    if (file?.id) {
      const res = await postDataService({ doc_id: file?.id }, "docLabelDelUrl");
      if (res?.code == 200) {
        message.success(res?.msg || "删除成功");
        setFileList(fileList.filter((item: any) => item.uid !== file.uid));
      } else {
        message.error(res?.msg || "删除失败, 请稍后重试");
      }
      return;
    }
    // 其他删除文件
    const newArr = fileList.filter((item: any) => item.uid !== file.uid);
    setFileList(newArr);
    message.success("取消上传成功");
    return true;
  };
  // 上传个数处理展示
  const handleCheck = () => {
    const uploadArr = fileList.filter((item: any) => item.status === "uploading");
    const doneArr = fileList.filter((item: any) => item.status === "done");
    const errorArr = fileList.filter((item: any) => item.status === "error");

    return (
      <div className="file_list">
        {uploadArr.length > 0 && (
          <>
            <span className="anticon-spin">
              <ZYIcon type="load-color" style={{ fontSize: "20px" }} />
            </span>
            <span className="text">上传中</span>
            <span>
              {uploadArr.length}／{fileList.length}
            </span>
            {errorArr.length > 0 && <span>，失败{errorArr.length}个</span>}
          </>
        )}

        {uploadArr.length === 0 && (
          <>
            <ZYIcon
              type="check"
              style={{ color: "#10B981", fontSize: "18px" }}
            />
            <span className="text">上传完成</span>
            <span>
              {doneArr.length}／{fileList.length}
            </span>
            {errorArr.length > 0 && <span>，失败{errorArr.length}个</span>}
          </>
        )}
      </div>
    );
  };

  // 关闭上传弹窗
  const handleCancel = () => {
    if (isUploadingRef.current) {
      modal.confirm({
        title: `还有正在上传的文件，关闭窗口将取消上传！`,
        content: "",
        okButtonProps: {
          style: {
            backgroundColor: "red",
            color: "white",
          },
        },
        onOk() {
          setIsModalOpen(false);
          setFileList([]);
          props?.onFinish?.();
        },
      });
      return;
    }
    if (fileList.length) {
      props?.onFinish?.();
    }
    setIsModalOpen(false);
    setFileList([]);
  };

  return (
    <>
      {isModalOpen && (
        <Modal
          forceRender={true} // 强制渲染 Modal
          destroyOnHidden={true} // 关闭时销毁 Modal 里的子元素
          width={760}
          title={`选择上传的文档`}
          open={isModalOpen}
          onCancel={() => handleCancel()}
          footer={null}
          maskClosable={false}
        >
          <div className="upload_detail">
            <div className="main_content">
              <Dragger {...uploadProps} maxCount={MAX_UPLOAD_FILE_NUMBER}>
                <div className="up_top">
                  <ZYIcon type="upload" style={{ color: "#94a0b8" }} />
                </div>
                <p className="up_text">
                  拖入或 <span>选择文件</span> 上传
                </p>
                <p className="up_desc">
                  {label === "音视频" ? (
                    <>
                      <span>1、视频格式：mp4、wmv、m4v、 flv、 rmvb、 dat、mov；最大2G，支持单个文件时长最多6小时。</span>
                      <span>2、音频支持：mp3、wav、m4a、wma、aac、ogg、amr、flac；最大500M。</span>
                      <span>3、文件单次最多上传5个，最后一个文件上传完成，将自动关闭弹窗，进行后台解析。</span>
                    </>
                  ) : (
                    <>
                      目前支持{" "}
                      {getFileType(label).map((item: any) => `.${item}`).join(",")}
                      格式，单次上传1-5个文件，单个文件最大200MB
                    </>
                  )}
                </p>
                <p className="up_desc">
                  （最后一个文件上传完成，将自动关闭弹窗，进行后台解析。）
                </p>
              </Dragger>
            </div>
          </div>
          {contextHolder}
        </Modal>
      )}
    </>
  );
}

export default DraggerUploadFile;
