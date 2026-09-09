import { Image, Progress, Tooltip } from "antd";
import { useImperativeHandle, useState } from "react";
import { CloseCircleOutlined } from "@ant-design/icons";
import { formatStaticUrl } from "@/utils";

const defaultUrl = require("@/assets/upFile.png");
import "./ShowChatFileList.less";
import ZYIcon from "../ZYIcon";

const ShowChatFileList = (props: any) => {
  const { onRef } = props;

  const [fileData, setFileData]: any = useState([]);

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    onFileChange: (files: any) => {
      //更新文件
      setFileData(files);
    },
  }));

  const onCloseFile = (file: any, index: any) => {
    const uid = file.uid;
    const newArr = fileData.filter((item: any) => item.uid !== uid);
    setFileData(newArr);
    props?.onClose?.(file.uid);
  };

  return (
    <>
      <div className="chat_upload_file_wrapper">
        {fileData?.map((file: any, index: number) => (
          <div className="chat_upload_file_container" key={file.id || index}>
            <div
              className={
                file.status === "error"
                  ? "file_item_error file_item"
                  : "file_item"
              }
            >
              <div>
                {file?.status === "done" && (
                  <>
                    {/* <img src={ (file?.type?.includes("image") && formatStaticUrl(file.url)).replace('/api', '') || defaultUrl} alt=""/> */}
                    {/* <Image
                      width={36}
                      height={36}
                      src={
                        (
                          file?.type?.includes?.("image") &&
                          formatStaticUrl(file.url)
                        )?.replace?.("/api", "") || defaultUrl
                      }
                      alt=""
                    /> */}
                    <ZYIcon type="pdf-color" size={36} />
                  </>
                )}
                {file.status === "uploading" && (
                  <Progress
                    type="circle"
                    percent={Math.round(file.percent || 0)}
                    width={30}
                    status={file.percent < 100 ? "active" : "success"}
                  />
                )}
              </div>
              <div className="file_info">
                <Tooltip title={file.title}>
                  <div className="title">{file.title}</div>
                </Tooltip>
                <span
                  className="close_icon"
                  onClick={() => onCloseFile(file, index)}
                >
                  <CloseCircleOutlined
                    style={{
                      color: "#fff",
                      background: "#525966",
                      borderRadius: "50%",
                    }}
                  />
                </span>
                <div className="subtitle">
                  {file.category} {file.size}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ShowChatFileList;
