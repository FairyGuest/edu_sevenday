import { useRef, useState, useImperativeHandle } from "react";
import { Button, Modal, Upload, Progress, message } from "antd";
import { ZYIcon } from "@/components";
import { getStorageToken, handleName } from "@/utils";
import { cogUrl } from "@/utils/host";
import { postDataService } from "../../../services";
import OSS from "ali-oss";
// import "./index.less";

const MAX_UPLOAD_FILE_NUMBER = 5; // 控制最大上传文件数
const { Dragger } = Upload;

const DraggerUploadFile = (props: any) => {
  const { courseId, catalogId, onRef } = props;

  const [modal, contextHolder] = Modal.useModal();
  const [label, setLabel] = useState("教材");
  const [isModalOpen, setIsModalOpen] = useState(false); // 上传弹窗
  const [fileList, setFileList] = useState<any[]>([]); // 文件列表
  const [file, setFile] = useState(null);
  const isUploadingRef = useRef(false);

  const fileType = ["txt", "doc", "docx", "pdf", "html"]; // 支持的文件类型
  const pptType = ["pptx"]; // ppt类型
  const imgType = ["jpg", "jpeg", "png"]; // 图片类型
  const excelType = ["xlsx", "csv"]; // excel类型
  const videoType = ["mp3"]; // 音视频类型
  const mindType = ["xmind", "mm", "mmap"]; // 思维导图类型

  const SecurityToken =
    "CAISjwh1q6Ft5B2yfSjIr5mABYjGmoZX7pKNU2HGg0Y+dcJkpY3NkTz2IHhMeXJvBuwcv/o2mmlV6fwblrIqFMUfHxOfMpIqts0MqlL5JoHbvNeu0bsHhZv9qp4i5OGgjqHoeOzcYI737JrPAgm2P0QRrJL+cTK9JfbPU/mggoJmadI6RxSxaSE8av5dOgplrr3bXxm0Mu22YCb3nk3aDkdjpmgajnhku5y42dG74BjTh0GYrOgOvNbaJYC1SMNuMZxjMbKyx/ckWafd9yRS5hNWlt9xl7cW0C/fs9eRJFNT7h6aUYzT6cY9DAJwao8wGaNPsJqFkuZj6MPei6P9yRtGIcRYTy29N4e725nlHuK1N98leJPmP2jMytmVKqTttwQtbRBgMxhRKf88LmNxERU2VgzCLqiu9DKsZRy4GZWd1KY/3aJ81UmKh92RPAqyW7Ge2CogM4UgREQwJnxl2nf6IIQBdhRIfk9qIquRUYRrZQpClLvsugTeNF1n1WoFlvf5fe/zp6QDaJ32RI57yY4abZgkw2wxVAbTSqmyr1oQaG19SKxK7bHpPpaz893gx/6IM8rHEew/s09GakrKzUy3RGhXMDf66/A6dFOc4L6x9qHX9I56GwZc2bJiBAqeI9F2tA4kseng8xWa9u3iVDW4/msg557G+IUKuBs5Jan+xPSM+WSBtSbPO/Ni3Z6GCTI3S0rsK3Anh6rNjyhY/Upa1jjlaklH4QrKhWruOsgczI5XrBEoLqpViJ5yIlXE1258CNWPzq8WUOd5Bo5nWeq92gcbB5SFyRqroN/5tgx5QOT2erA6AehPGAmhy6P1fPYcm+JpE12GfrVH+KJG3xSR0xMh3cgHa7ZIAFFDVqcjYKuVqJK6kooLga9CmdKNAYe9Qr32nKL4WGi4DnlTlbM45hpySHjK9+7eeWfffLV4lh2Jv3F4Kwa8m7bTlXtHXMneCcZRuNQudmunjmgVDdVuRbEzkcu7GtxjOg8WAZZyKzquJfIp7PVPBDBw9qwqW8O1eQ3I71LZAgQJGN9BnKaEHbA18iX1jao7/O3SKPvx/yi3hpzkov1Ktx8aABvs3pzHbBvvZkNUPQxihdvSHZFg2+Aptz8ia9KTN8fe2KmE2KBBXwq35VqxQ8jL6XHqMVbbZ2veJEQYigpgtpkR4LZeZzIxMzUQVJrlG6RXgXLBpmWwDSy2KV7AXW/RHSFtj7d9h13Fyy+c0+lsDS9tbwp1UsyjiJj574nkpYHZZHujKsyk27R/fdLPWb1FmNbn9Sq0P2TAS+ShJGhy0APUvo842pLAqAyagi8PImTELhiFe30Ua7hb7e09zE9dk8+4PY7A/nuNVOYyQv7ylSZ0hDesXsreoLYh1jJaMU3Ab+1O6pEYGoABHAKli15k37crSFeeHAPK2MSlXarlzcwRIARBGIVmQZ4WHr1kPzKcrMGdiRPOW6RHW4AQ9d2zoH7K1hB4zWdU02BjpG4AVBofBJzStNJeDysjHcWPNDdAIx/SaxCjlF4UlV4cfpXCn/uAXzsQTEuw1sAloeFReGN9OjNAX7mBlBsgAA==";

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    onUploadOpen: (label: string) => {
      setLabel(label);
      setIsModalOpen(true);
    },
  }));

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

  const client = new OSS({
    region: "oss-cn-beijing", // 替换为你的区域
    accessKeyId: "STS.NXkg5165ypwW2nEQP6oVDMZ6z",
    accessKeySecret: "GiBiTsdM3UJ6HBVJNzH7gE7pZjmnuhaT4DJDAgpjZ7rz",
    stsToken: SecurityToken, // 如果使用 STS
    bucket: "tianjin-zhipu",
    secure: true,
    authorizationV4: true,
    cname: false,
    // endpoint: "https://tianjin-zhipu.oss-cn-beijing.aliyuncs.com",
  });

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * 上传文件到OSS
   * @return {Promise<void>} 上传结果
   */
  /*******  6d625ce2-8ada-4bad-ba71-d512b6a06db3  *******/
  const handleUpload = async () => {
    if (!file) {
      alert("请先选择文件");
      return;
    }

    try {
      const result = await client.put(file?.name, file, {
        mime: file.type,
      });
      console.log("上传成功:", result);
    } catch (error) {
      console.error("上传失败:", error);
    }
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
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
              <button onClick={handleUpload}>上传</button>
              {/* <Dragger {...uploadProps} maxCount={MAX_UPLOAD_FILE_NUMBER}>
                <div className="up_top">
                  <ZYIcon type="upload" style={{ color: "#94a0b8" }} />
                </div>
                <p className="up_text">
                  拖入或 <span>选择文件</span> 上传
                </p>
                <p className="up_desc">
                  {label === "音视频" ? (
                    <>
                      <span>1、视频格式：mp4；最大2G，支持单个文件时长最多6小时。</span>
                      <span>2、音频支持：mp3；最大500M。</span>
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
              </Dragger> */}
            </div>
          </div>
          {contextHolder}
        </Modal>
      )}
    </>
  );
};

export default DraggerUploadFile;
