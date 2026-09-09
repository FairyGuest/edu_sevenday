import { connect } from "umi";
import { useImperativeHandle } from "react";
import { Upload, message } from "antd";
import ZYIcon from "../ZYIcon";
import { bytesToSize, getStorageToken } from "@/utils";
import { cogUrl } from "@/utils/host";
import "./UploadChatFile.less";

let gFileObj: any = {};
let gDelObj: any = {};

const UploadChatFile = (props: any) => {
  const { onRef } = props;

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    // getFileArr: () => getFiles().filter((item) => item["f_id"]), // 确保返回数组
    getFileArr: () => getFiles(), // 确保返回数组
    checkDone: () => isUploadDone(), // 确保返回数组
    clearFileArr: () => {
      gFileObj = {}; // 清空为空数组而不是null
    },
    closeFile: (key: string) => {
      //删除文件
      delete gFileObj[key];
      gDelObj[key] = true;
    },
  }));

  const isUploadDone = () => {
    const temp = getFiles().filter((item) => item["status"] !== "done");
    return temp.length;
  };

  // 获取文件数组
  const getFiles = () => {
    let temp = [];
    for (let key in gFileObj) {
      temp.push(gFileObj[key]);
    }
    return temp;
  };

  const updFileInfo = (info: any) => {
    const { name, uid, size, type, status, percent, response } = info;
    if (gDelObj[uid]) return; // 改文件被删了

    if (gFileObj[uid]) {
      // 如何存在，更新状态
      // const { f_id, url } = response?.data || {};
      gFileObj[uid] = {
        ...gFileObj[uid],
        ...response?.data[0],
        status: status,
        percent: Math.min(percent, 99),
      };
      // gFileObj[uid]["status"] = status;
      // gFileObj[uid]["percent"] = Math.min(percent, 99);
      // gFileObj[uid]["f_id"] = f_id;
      // gFileObj[uid]["url"] = url;
      props?.onFileChange?.(getFiles()); // 更新父组件
      return;
    }

    // 新文件
    const nameParts = name.split(".");
    const extension = nameParts.length > 1 ? nameParts.pop() : "";
    const title = nameParts.join(".");
    let newType = extension;
    if (type?.toLowerCase().includes("image/")) {
      // 图片类型合并
      newType = "image";
    }

    const newFile = {
      uid: uid,
      title: title,
      suffix: extension,
      status: "uploading",
      percent: 2,
      type: newType,
      size: bytesToSize(size),
    };

    gFileObj[uid] = newFile;
    props?.onFileChange?.(getFiles()); // 更新父组件
  };

  const uploadProps = {
    name: "files",
    showUploadList: false,
    // action: `${cogUrl}/file/upload`,
    accept: ".pdf",
    action: `${cogUrl}/kb_docs/chat_upload_docs`,
    headers: {
      Authorization: getStorageToken() || "",
    },
    data: {
      is_analyze: true,
    },
    beforeUpload: (file: any) => {
      const isDocx =
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const isPDF = file.type.toLowerCase() === "application/pdf";
      const isImage = file.type.startsWith("image/");

      if (/* !isDocx && !isImage && */ !isPDF) {
        // message.error("只能上传 docx 文档或图片文件!");
        message.error("只能上传 pdf 文件!");
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    onChange(info: any) {
      const { status, response } = info.file;
      updFileInfo(info.file);

      // 文件名过长时截断显示
      const fileName = info.file.name;
      const displayName =
        fileName.length > 20 ? fileName.substring(0, 17) + "..." : fileName;
      if (status === "done") {
        const { data, code } = response;
        if (code !== 200) {
          // message.error(`${displayName} 文件上传失败`);
          message.error(response.msg || `${displayName} 文件上传失败`);
          updFileInfo({
            ...info.file,
            status: "error",
          });
          return;
        }
        message.success(`${displayName} 文件上传成功`);
      } else if (status === "error") {
        message.error(`${displayName} 文件上传失败`);
        updFileInfo({
          ...info.file,
          status: "error",
        });
      }
    },
  };

  return (
    <>
      <div className="input_file_upload_continer">
        <Upload {...uploadProps}>
          <ZYIcon className="input_file_upload" type="shangchuanwenjian" />
        </Upload>
      </div>
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(UploadChatFile);
