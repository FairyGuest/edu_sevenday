import { useRef, useState, useImperativeHandle, useEffect } from "react";
import { Button, Modal, Upload, Progress, message } from "antd";
import { ZYIcon } from "@/components";
import { getStorageToken, handleName } from "@/utils";
import { cogUrl } from "@/utils/host";
import { postDataService } from "../../../services";
import { connect, useDispatch } from "umi";
import SparkMD5 from "spark-md5";
import { set } from "lodash";

// import "public/ailyun-upload.js";

const MAX_UPLOAD_FILE_NUMBER = 5; // 控制最大上传文件数
const { Dragger } = Upload;

const DraggerUploadFile = (props: any) => {
  var uploader = null;
  const dispatch = useDispatch();
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
  const videoType = ["mp3", "mp4"]; // 音视频类型
  const mindType = ["xmind", "mm", "mmap"]; // 思维导图类型

  const [onUploadProgressNum, setOnUploadProgressNum] = useState<any>(0);

  // const [fileVodKey, setFileVodKey] = useState<any>({});
  let fileVodKey = {};
  // let fileList: any = [];
  let _flag = "";

  let uploadStatus = ""; // error loading secucess
  // let onUploadProgressNum: any = 0;

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    onUploadOpen: (label: string) => {
      setLabel(label);
      setIsModalOpen(true);
      setFileList([]);
      // onUploadProgressNum = 0;
      setOnUploadProgressNum(0);
      uploadStatus = "";
    },
  }));

  const getFileType = (label: any) => {
    switch (label) {
      case "音视频":
        return videoType;

      default:
        return fileType;
    }
  };

  // md5加密
  const computeMD5 = (file: File) =>
    new Promise<string>((resolve) => {
      const chunkSize = 2 * 1024 * 1024;
      const chunks = Math.ceil(file.size / chunkSize);
      let current = 0;
      const spark = new SparkMD5.ArrayBuffer();
      const fr = new FileReader();
      fr.onload = (e) => {
        spark.append((e.target as any).result);
        current += 1;
        if (current < chunks) loadNext();
        else resolve(spark.end());
      };
      const loadNext = () => {
        const start = current * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        fr.readAsArrayBuffer(file.slice(start, end));
      };
      loadNext();
    });

  const createUploader = () => {
    var uploader = new AliyunUpload.Vod({
      timeout: 60000,
      partSize: 1048576,
      parallel: 5,
      retryCount: 3,
      retryDuration: 2,
      region: "oss-cn-beijing",
      userId: "277061178764196939",
      localCheckpoint: true, //此参数是禁用服务端缓存
      // 添加文件成功
      addFileSuccess: function (uploadInfo: any) {
        console.log("添加文件", uploadInfo);
      },
      // 开始上传
      onUploadstarted: async function (uploadInfo: any) {
        if (uploadStatus === "error") {
          return;
        }
        setFileList([uploadInfo.file]);
        console.log("开始上传", uploadInfo);
        const md5 = await computeMD5(uploadInfo.file);
        console.log("md5", md5);
        const { code, data }: any = await dispatch({
          type: "teachSourceModel/postData",
          apiUrl: "getVodKey",
          payload: {
            file_name: uploadInfo.file.name,
            vod_md5: md5,
            file_size: uploadInfo.file.size + "",
            space_id: courseId,
            catalog_id: catalogId === "all" ? "" : catalogId, // 目录id
          },
        });

        if (code === 200) {
          // setFileVodKey(data);
          fileVodKey = { ...data };
          let aaa = {
            RequestId: data?.auth_map?.RequestId,
            UploadAddress: data?.auth_map?.UploadAddress,
            UploadAuth: data?.auth_map?.UploadAuth,
            VideoId: data?.auth_map?.VideoId,
          };

          let uploadAuth = aaa.UploadAuth;
          let uploadAddress = aaa.UploadAddress;
          let videoId = aaa.VideoId;

          uploader.setUploadAuthAndAddress(
            uploadInfo,
            uploadAuth,
            uploadAddress,
            videoId,
          );
          uploadStatus = "loading";
        } else {
          uploadStatus = "error";
        }
      },
      // 文件上传成功
      onUploadSucceed: function (uploadInfo: any) {
        setFileList([uploadInfo.file]);
        uploadStatus = "secucess";
        console.log("上传成功", uploadInfo);
      },
      // 文件上传失败
      onUploadFailed: function (uploadInfo: any, code: any, message: any) {
        console.log(
          "onUploadFailed: file:" +
            uploadInfo.file.name +
            ",code:" +
            code +
            ", message:" +
            message,
        );
      },
      // 取消文件上传
      onUploadCanceled: function (uploadInfo: any, code: any, message: any) {
        console.log(
          "Canceled file: " +
            uploadInfo.file.name +
            ", code: " +
            code +
            ", message:" +
            message,
        );
      },
      // 文件上传进度，单位：字节, 可以在这个函数中拿到上传进度并显示在页面上
      onUploadProgress: function (
        uploadInfo: any,
        totalSize: any,
        progress: any,
      ) {
        setOnUploadProgressNum(Math.ceil(progress * 100));
        console.log("进度", onUploadProgressNum);
        // console.log(
        //   "onUploadProgress:file:" +
        //     uploadInfo.file.name +
        //     ", fileSize:" +
        //     totalSize +
        //     ", percent:" +
        //     Math.ceil(progress * 100) +
        //     "%",
        // );

        // $("#sts-progress").text(progressPercent);
        // $("#status").text("文件上传中...");
      },
      // 上传凭证超时
      onUploadTokenExpired: async function (uploadInfo: any) {
        if (uploadStatus === "error") {
          console.log("上传凭证超时");
          return;
        }
        if (fileVodKey?.auth_map?.VideoId) {
          const { code, data }: any = await dispatch({
            type: "teachSourceModel/getData",
            apiUrl: "refreshVodKey",
            payload: {
              vodId: fileVodKey?.auth_map?.VideoId,
            },
          });
          if (code === 200) {
            let uploadAuth = data?.UploadAuth;
            uploader.resumeUploadWithAuth(uploadAuth);
            uploader.startUpload();
          }
        } else {
          console.log("上传凭证超时1111");
          uploadStatus = "error";
        }
      },
      // 全部文件上传结束
      onUploadEnd: async function (uploadInfo: any) {
        // $("#status").text("文件上传完毕!");
        console.log(fileVodKey);
        // const { code, data }: any = await dispatch({
        //   type: "teachSourceModel/postData",
        //   apiUrl: "getVodCall",
        //   payload: {
        //     vod_id: fileVodKey?.auth_map?.VideoId,
        //   },
        // });
        // if (code === 200) {
        //   console.log("阿里云音视频缩略图更新");
        // }

        console.log("onUploadEnd: uploaded all the files", uploadStatus);
        setTimeout(() => {
          if (uploadStatus === "secucess") {
            handleCancel();
          }
        }, 2000);
      },
    });
    return uploader;
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
    props?.onFinish?.();
    setIsModalOpen(false);
    setFileList([]);
  };

  const onChangeFile = (file: any) => {
    console.log("changeFile111111", file);
    uploadStatus = "";
    uploader = createUploader();
    var userData = '{"Vod":{}}';
    uploader.addFile(file, null, null, null, userData);
    uploader.startUpload();
  };

  const uploadProps = {
    beforeUpload: (file: any, fileList: any) => {
      const isLt200M = file.size / 1024 / 1024 < 200;
      const isLt2G = file.size / 1024 / 1024 / 1024 < 2;
      const type = handleName(file.name).type;
      if (!isLt2G && label === "音视频") {
        message.error("文件必须小于 2 GB！");
        return Upload.LIST_IGNORE;
      }
      onChangeFile(file);
      return true;
    },
    onChange: async (info: any) => {
      // onChangeFile(info?.file?.originFileObj);
    },
    showUploadList: false,
    accept: getFileType(label)
      .map((item: any) => `.${item}`)
      .join(","), // 支持的文件类型
  };

  const handleCheck = () => {
    // const uploadArr = fileList.filter((item: any) => item.status === "Ready");
    // const doneArr = fileList.filter((item: any) => item.status === "done");
    // const errorArr = fileList.filter((item: any) => item.status === "error");

    // const uploadArr = fileList.filter((item: any) => item.state === "Ready");
    // console.log(
    //   "handleCheckuploadArruploadArruploadArruploadArruploadArruploadArr",
    //   uploadArr,
    // );
    // const doneArr = fileList.filter((item: any) => !item.state);
    // const errorArr = fileList.filter((item: any) => item.state === "error");

    return (
      <div className="file_list">
        {fileList.length > 0 && (
          <>
            <span className="anticon-spin">
              <ZYIcon type="load-color" style={{ fontSize: "20px" }} />
            </span>
            <span className="text">上传中</span>
            <span>
              {fileList.length}／{fileList.length}
            </span>
            {uploadStatus == "error" && <span>，失败{1}个</span>}
          </>
        )}

        {fileList.length === 0 && (
          <>
            <ZYIcon
              type="check"
              style={{ color: "#10B981", fontSize: "18px" }}
            />
            <span className="text">上传完成</span>
            <span>
              {fileList.length}／{fileList.length}
            </span>
            {fileList.length > 0 && <span>，失败{fileList.length}个</span>}
          </>
        )}
        <div className="file_item">
          <div className="file_item_name">
            <ZYIcon type={"yinpin"} />
            <span>{fileList?.[0]?.name}</span>
          </div>
          <div className="file_item_content">
            <div></div>
            {uploadStatus !== "loading" ? (
              <div className="file_item_progress">
                <Progress
                  type="dashboard"
                  size={20}
                  gapDegree={10}
                  gapPosition="right"
                  // percent={Math.round(file.percent)}
                  percent={onUploadProgressNum}
                  strokeColor={uploadStatus === "error" ? "#EF4444" : "#52c41a"} // 进度条颜色
                />
                {uploadStatus !== "error" && (
                  <span className="text">{onUploadProgressNum}%</span>
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
                onClick={() => {
                  setFileList([]);
                }}
                icon={<ZYIcon type="close" />}
              />
            </div>
          </div>
        </div>
      </div>
    );
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
              {/* <input
                type="file"
                onChange={(e) => {
                  onChangeFile(e.target.files?.[0]);
                  console.log("change", e.target.files?.[0]);
                }}
              /> */}
              <Dragger {...uploadProps} maxCount={MAX_UPLOAD_FILE_NUMBER}>
                <div className="up_top">
                  <ZYIcon type="upload" style={{ color: "#94a0b8" }} />
                </div>
                <p className="up_text">
                  拖入或 <span>选择文件</span> 上传
                </p>
                <p className="up_desc_video">
                  {label === "音视频" ? (
                    <>
                      <span>1、视频格式：mp4；支持单个文件时长最多6小时。</span>
                      <span>2、音频支持：mp3；最大500M。</span>
                      <span>
                        3、文件单次最多上传1个，文件上传完成，将自动关闭弹窗，进行后台解析。
                      </span>
                    </>
                  ) : (
                    <>
                      目前支持{" "}
                      {getFileType(label)
                        .map((item: any) => `.${item}`)
                        .join(",")}
                      格式，单次上传1个文件，单个文件最大200MB
                    </>
                  )}
                </p>
                <p className="up_desc">
                  （最后一个文件上传完成，将自动关闭弹窗，进行后台解析。）
                </p>
              </Dragger>
              {fileList?.length > 0 && handleCheck()}
            </div>
          </div>
          {contextHolder}
        </Modal>
      )}
    </>
  );
};

export default connect((state: any) => ({
  teachSourceModel: state.teachSourceModel,
}))(DraggerUploadFile);
