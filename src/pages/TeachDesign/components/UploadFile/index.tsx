import { useState, useImperativeHandle } from "react";
import { Button, Modal, Upload, Progress, message } from "antd";
import { ZYIcon } from "@/components";
// import { cogUrl } from "@/utils/host";
import { getStorageToken, handleName, bytesToSize, addNewTracking } from "@/utils";
import { postDataService, cogUrl } from "../../services";

import "./index.less";

const { Dragger } = Upload;

const DraggerUploadFile = (props: any) => {
  const { onRef, dataList = [], setDataList } = props;
  const [isModalOpen, setIsModalOpen] = useState(false); // 上传弹窗
  const [batchList, setBatchList] = useState<any[]>([]); // 文件列表
  const [loading, setLoading] = useState(false);  // 上传loading

  const MAX_UPLOAD_FILE_NUMBER = 10 - dataList.length;
  const fileType = ["pdf", "doc", "docx", "pptx", "txt", "md", "jpg", "jpeg", "png"];

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    onUploadOpen: () => setIsModalOpen(true),
  }));

  // 文件上传配置
  const uploadProps: any = {
    name: "files",
    showUploadList: true,
    data: {
      space_id: "chat_agent", // id
      label: "other", // 标签
    },
    accept: fileType, // 支持的文件类型
    action: `${cogUrl}/kb_docs/chat_upload_docs`,
    headers: { Authorization: getStorageToken() || "" },
    multiple: true,
    beforeUpload: (file: any, fileList: any) => {
      const isLt20M = file.size / 1024 / 1024 < 20;
      const type = handleName(file.name).type;
      if (!fileType.includes(type)) {
        message.error("文件格式暂不支持！");
        return Upload.LIST_IGNORE;
      }
      if (fileList.length > MAX_UPLOAD_FILE_NUMBER) {
        message.error(`最多上传 10 个文件, 还可以上传 ${MAX_UPLOAD_FILE_NUMBER} 个文件`);
        return Upload.LIST_IGNORE;
      }
      if (!isLt20M) {
        message.error("文件必须小于 20 MB！");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    // 上传文件状态改变时触发
    onChange: async (info: any) => {
      setLoading(true);
      const { file, fileList } = info;
      // 所有文件上传完成
      if (
        fileList.every((file: any) => file.status !== "uploading") ||
        fileList.length === 0
      ) {
        const list = fileList.filter((file: any) => {
          if (file.status === "done" && file.response?.code !== 200) {
            file.status = "error";
            message.error(file.response?.msg || "文件上传失败");
          }
          return file;
        });
        setBatchList(list);
        setLoading(false);
      }
    },
    onRemove: (file: any) => onClickDelete(file),
    itemRender: (originNode: any, file: any, fileList: any, actions: any) => (
      <>
        {batchList[0]?.uid === file?.uid && handleCheck()}
        <div key={file.uid} className="file_item">
          <div className="file_item_name">
            <ZYIcon type={handleName(file?.name).icon} />
            <span>{file?.name}</span>
          </div>
          <div className="file_item_content">
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
              <>
                <div>{bytesToSize(file?.size)}</div>
                <ZYIcon
                  type="check"
                  style={{ color: "#10B981", fontSize: "18px" }}
                />
              </>
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
        setBatchList(batchList.filter((item: any) => item.uid !== file.uid));
      } else {
        message.error(res?.msg || "删除失败, 请稍后重试");
        return false;
      }
    } else {
      // 其他删除文件
      message.success("取消上传");
    }
    return true;
  };
  // 上传个数处理展示
  const handleCheck = () => {
    const uploadArr = batchList.filter((item: any) => item.status === "uploading");
    const doneArr = batchList.filter((item: any) => item.status === "done");
    const errorArr = batchList.filter((item: any) => item.status === "error");

    return (
      <div className="file_list">
        {uploadArr.length > 0 && (
          <>
            <span className="anticon-spin">
              <ZYIcon type="load-color" style={{ fontSize: "20px" }} />
            </span>
            <span className="text">上传中</span>
            <span>
              {uploadArr.length}／{batchList.length}
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
              {doneArr.length}／{batchList.length}
            </span>
            {errorArr.length > 0 && <span>，失败{errorArr.length}个</span>}
          </>
        )}
      </div>
    );
  };

  // 关闭弹窗
  const handleCancel = () => {
    setLoading(false);
    setIsModalOpen(false);
    setBatchList([]);
  };
  // 关闭上传弹窗
  const handleOk = () => {
    const doneArr = batchList
      .filter((item: any) => item.status === "done")
      .map((item: any) => item.response.data[0]);

    setDataList([...dataList, ...doneArr]); // 保存上传文件列表
    handleCancel();
    // addNewTracking({
    //   bt: "cl",
    //   ct: "teaching_design_home_upload_attachment",
    //   extra: { attach_num: doneArr.length },
    // });
  }

  return (
    <>
      {isModalOpen && (
        <Modal
          width={760}
          destroyOnHidden
          open={isModalOpen}
          maskClosable={false}
          title={`选择本地文件上传`}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loading}
          cancelButtonProps={{disabled: loading}}
        >
          <div className="upload_detail">
            <div className="main_content">
              <Dragger
                {...uploadProps}
                maxCount={MAX_UPLOAD_FILE_NUMBER}
                disabled={MAX_UPLOAD_FILE_NUMBER <= batchList.length}
              >
                <div className="up_top">
                  <ZYIcon type="upload" style={{ color: "#94a0b8" }} />
                </div>
                <div className="up_text">
                  拖入或 <span>选择文件</span> 上传
                </div>
                <div className="up_desc">
                  <div className="up_desc_sub">
                    1、支持文件格式{" "}
                    {fileType.map((item: any) => `.${item}`).join("、")}
                  </div>
                  <div className="up_desc_sub">
                    2、最多上传10个文件，单个文件大小不超过20MB
                  </div>
                </div>
              </Dragger>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default DraggerUploadFile;
