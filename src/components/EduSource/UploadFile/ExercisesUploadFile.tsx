import { useRef, useState, useImperativeHandle } from "react";
import { Button, Modal, Upload, Progress, message } from "antd";
import { ZYIcon } from "@/components";
import { getStorageToken, handleNameNew } from "@/utils";
import { cogUrl } from "@/utils/host";
import { postDataService } from "../../../services";
import { all_question_number } from "@/global";

import "./ExercisesUploadFile.less";

const MAX_UPLOAD_FILE_NUMBER = 10; // 控制最大上传文件数
const { Dragger } = Upload;

const App = (props: any) => {
  const { onRef, fileListData } = props;

  const [modal, contextHolder] = Modal.useModal();
  const [isModalOpen, setIsModalOpen] = useState(false); // 上传弹窗
  const [fileList, setFileList] = useState<any[]>([]); // 文件列表
  const isUploadingRef = useRef(false);
  const fileType = [
    "docx",
    "pdf",
    "jpg",
    "jpeg",
    "png",
    "DOCX",
    "PDF",
    "JPG",
    "JPEG",
    "PNG",
  ]; // 支持的文件类型

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    onUploadOpen: () => {
      setFileList([]);
      setIsModalOpen(true);
    },
    onUploadClose: () => setIsModalOpen(false),
  }));

  // 文件上传配置
  const uploadProps: any = {
    name: "file",
    showUploadList: true,
    data: {},
    accept: fileType, // 支持的文件类型
    action: `${cogUrl}/web/photoQuestion/uploadFile`,
    headers: { Authorization: getStorageToken() || "" },
    multiple: true,
    beforeUpload: (file: any, fileList: any) => {
      if (fileListData?.length == 10) {
        message.error("最多添加10个文件");
        return;
      }
      console.log("file上传文件大小", file);
      const isLt50M = file.size / 1024 / 1024 < 50;
      const type = handleNameNew(file.name).type;
      if (!fileType.includes(type)) {
        message.error("文件格式暂不支持！");
        return Upload.LIST_IGNORE;
      }
      if (fileList.length > MAX_UPLOAD_FILE_NUMBER) {
        message.error("最多上传 10 个文件！");
        return Upload.LIST_IGNORE;
      }
      if (!isLt50M) {
        message.error("文件必须小于 50 MB！");
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

        if (
          info.fileList.length > 0 &&
          info.fileList.some((file: any) => file.status === "done")
        ) {
          props?.onFinish?.(info.fileList);
        }
      }
    },
    // onRemove: (file: any) => onClickDelete(file),
    itemRender: (originNode: any, file: any, fileList: any, actions: any) => (
      <>
        {fileList[0]?.uid === file?.uid && handleCheck()}
        <div key={file.uid} className="file_item">
          <div className="file_item_name">
            <ZYIcon type={handleNameNew(file?.name).icon} />
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
    const uploadArr = fileList.filter(
      (item: any) => item.status === "uploading",
    );
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
          props?.onFinish?.();
          setFileList([]);
        },
      });
      return;
    }
    setIsModalOpen(false);
    props?.onFinish?.();
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
          footer={[
            <Button key="back" className="back_btn_css" onClick={handleCancel}>
              取消
            </Button>,
            <Button
              key="submit"
              type="primary"
              className="submit_btn_css"
              onClick={() => {
                const doneFiles = fileList.filter(
                  (item: any) => item?.status === "done",
                );
                if (!doneFiles.length) {
                  message.warning("请上传文件");
                  return;
                }
                if (fileList.some((item: any) => item?.status === "uploading")) {
                  message.warning("文件上传中，请稍候");
                  return;
                }
                props?.submit?.();
              }}
            >
              确定
            </Button>,
          ]}
          maskClosable={false}
        >
          <div className="upload_detail">
            <Dragger {...uploadProps} maxCount={MAX_UPLOAD_FILE_NUMBER}>
              <div className="up_top">
                <ZYIcon type="upload" style={{ color: "#94a0b8" }} />
              </div>
              <div className="up_text">
                拖入或 <span>选择文件</span> 上传
              </div>
              <div className="up_desc">
                <div className="up_desc_sub">解析题目要求：</div>
                <div className="up_desc_sub">
                  1、文件格式：docx，.pdf，.jpg，.jpeg，.png
                </div>
                <div className="up_desc_sub">
                  2、单次最多上传1个文件（文档不超过50页）或10张图片，文件大小不超过50MB，单个图片不超过10MB
                </div>
                <div className="up_desc_sub">3、题目总数不超过{all_question_number}道题</div>
              </div>
            </Dragger>
          </div>
          {contextHolder}
        </Modal>
      )}
    </>
  );
};

export default App;
