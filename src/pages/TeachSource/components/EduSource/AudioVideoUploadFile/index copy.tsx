import { useRef, useState, useImperativeHandle } from "react";
import { Button, Modal, Upload, Progress, message } from "antd";
import { ZYIcon } from "@/components";
import { getStorageToken, handleName } from "@/utils";
import { cogUrl } from "@/utils/host";
import { postDataService } from "../../../services";
import { connect, useDispatch, useRequest, useLocation } from "umi";
import OSS from "ali-oss";
// import "./index.less";

const MAX_UPLOAD_FILE_NUMBER = 5; // 控制最大上传文件数
const { Dragger } = Upload;

const DraggerUploadFile = (props: any) => {
  const dispatch = useDispatch();
  const { courseId, catalogId, onRef } = props;
  const [modal, contextHolder] = Modal.useModal();
  const [label, setLabel] = useState("教材");
  const [isModalOpen, setIsModalOpen] = useState(false); // 上传弹窗
  const [fileList, setFileList] = useState<any[]>([]); // 文件列表
  const [file, setFile] = useState(null);
  const isUploadingRef = useRef(false);

  const [securityToken, setSecurityToken] = useState<any>({});

  // const SecurityToken = {
  //   SecurityToken:
  //     "CAISjQh1q6Ft5B2yfSjIr5n2MtH5i5Rq4qqoWmf9jlU/a/tCq43xrDz2IHhMeXJvBuwcv/o2mmlV6fwblrIqFMUfHxOfMpIqts0MqlL5JoHbvNeu0bsHhZv9hqRG6OGgjqHoeOzcYI737prPAgm2QUQRrJL+cTK9JfbPU/mggoJmadI6RxSxaSE8av5dOgplrr3bXxm0Mu22YCb3nk3aDkdjpmgajnhku5y42dG74BjTh0GYrOgOvNbaJYC1SMNuMZxjMbKyx/ckWafd9yRS5hNWlt9xl7cW0C/fs9eRJFNT7h6aUYzT6cY9DAJwao8wGaNPsJqFkuZj6MPei6P9yRtGIcRYTy29N4e725nlHuK1N98leJPmP2jMytmVKqTttwQtbRBgMxhRKf88LmNxERU2VgzCLqiu9DKsZRy4GZWd1KY/3aJ81UmKh92RPAqyW7Ge2CogM4UgREQwJnxl2nf6IIQBdhRIfk9qIquRUYRrZQpClLvsugTeNF1n1WoFlvf5fe/zp6QDaJ32RI57yY4abZgkw2wxVAbTSqmyr1oQaG19SKxK7bHpPpaz893gx/6IM8rHEew/s09GakrIzUy3RGhXMDf66/A6dFOc4L6x9qHX9I56GwZc27JkBAqeI9F2tA4kseng8xWa9u3iVDW4/msg557G+IUKuBs5Jan+xPSM+TSOsHKcOfd8wZaGBzQ1T0+9dSI+yqCeiH5f+VVYwjDrYkwRsF6fiyC1e9NpDpbpql9JBLYpM426Lx6r4mRnD/+Q/r8PQpkMVetSU/G6r8AApJvgtAbig4rarTBvZeP/a9lAZJVTUTn0+LXKZ9MbkvMAdzjlYvx1spNTwRWw1TYm1NluBNMgHBh5Aoc5YL6IrKuqs4sOhadAjPWJOJiwSdaB+cLkEVb3L3hWkbs68z12cWfH/IW0HBrDNZMyrwKEtEB9CRPE/dOyiTJhFvDBBM1gvfY7R3CUmBJ8aLZyDJJ8tfGtP9tqKy0BLP8TTkSybNFmyM9ZITd5591BQ9LtEizC6U/PFSIdKM9Yjtj/Xd0U+CPom71Cmv3QCOid52Lu/r35vvNhoS8KGQmSueGgcFLkcVQKIVJ+yt7VFIAuzq4kznMyWqj3Jd7V1+2VkLNAExno+1y9Paaxl2PzOlmfdiPNJW9s8S1js5kU4bZcYjMyMDcaV/HQe5ddg3ivm37MPyqoOVf3VlHbJDddjrIPjU+c6SyZ0OtoDipgawJ1Us+lj565yrqcjZTFc1iCOMeF+bBscNPxQoNPjGQj6QqrCg5qd+ZqOqplWwvUvo842nEYtfcojB2Hd6kBvCEdchVsa6jjeJAa42Baka3QDeb43gONdPZCcr6i1WZUsnKMTsHOr7YHtjVZoEumutZ76hqAAUzvbVMsudeETOILLiB6hcGnrC//VPAJnH55/PnYi7CFQK2StztY7Iq9QkwolGNYVEp2pdFKCeLGvpAOTSdum33PLRB1hH/HEcs4sv2fWElqis1cc2r53uCH3R7NwwSBAaa4nEm5jS8iU5o4Zpmv0s45eSrM13MPzZbgar7I2ccYIAA=",
  //   AccessKeyId: "STS.NZCykMfKKUhCXALjUjgtnDHZN",
  //   ExpireUTCTime: "2025-09-22T12:39:05Z",
  //   AccessKeySecret: "CgoVfUR9iKasFP5nFfRPaRYHoMix2LjjQGUXpZNJbYY1",
  //   Expiration: "3600",
  //   Region: "cn-beijing",
  // };

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

    const client = new OSS({
      region: "oss-cn-beijing", // 替换为你的区域
      accessKeyId: securityToken?.AccessKeyId,
      accessKeySecret: securityToken?.AccessKeySecret,
      stsToken: securityToken?.SecurityToken, // 如果使用 STS
      bucket: "tianjin-zhipu",
      // secure: true,
      // authorizationV4: true,
      // cname: false,
      endpoint: "oss-cn-beijing.aliyuncs.com",
    });
    try {
      const result = await client.put(file?.name, file, {
        mime: file.type,
      });
      console.log("上传成功:", result);
    } catch (error) {
      console.error("上传失败:", error);
    }
  };

  const getFileType = async (_file: any) => {
    setFile(_file.target.files[0]);
    const { code, data }: any = await dispatch({
      type: "teachSourceModel/getData",
      apiUrl: "getVodKey",
      payload: {
        file_name: _file.target.files[0].name,
      },
    });
    if (code == 200) {
      setSecurityToken(data);
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
              <input
                type="file"
                onChange={(e) => {
                  getFileType(e);
                }}
              />
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

// export default DraggerUploadFile;
export default connect((state: any) => ({
  teachSourceModel: state.teachSourceModel,
}))(DraggerUploadFile);
