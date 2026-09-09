


import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Avatar, message, Upload, } from "antd";
import { useState } from "react";
import { cogUrl } from "@/utils/host";
import { formatStaticUrl, getStorageToken } from "@/utils";
import "./index.less";


const AvatarUpload = (props: any) => {


  const accept = props.accept || ["image/jpeg", "image/png"]
  const size = props?.size || "default"
  const cardSize= props?.cardSize 

  const [updLoading, setUpdLoading] = useState(false);


  // 文件上传校验
  const beforeUpload = (file: any) => {

    const isAccept = accept.includes(file.type)
    console.log("isAccept", file.type)
    console.log("accept", accept)
    if (!isAccept) {
      message.error('该文件格式不支持');
    }
    const isLt2M = file.size / 1024 / 1024 < 50;
    if (!isLt2M) {
      message.error('文件小于 50MB!');
    }
    return isAccept && isLt2M;
  };


  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setUpdLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const { data, code, msg } = info.file.response
      setUpdLoading(false);
      if (code == 200) {
        props?.onChange?.(data?.url)
        props?.onSave?.()
      } else {
        message.error(msg)
      }
    }
  };




  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {updLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8, display: size == "small" ? "none" : "" }}>{props?.title || "上传"}</div>
    </button>
  );
  const RenderValueCard = () => {
    return <Avatar
    size={size == "small" ? 24 : 64}
    src={formatStaticUrl(props?.value || "")}
  />
    
}
  return (
    <>
      <Upload
        accept={accept?.join(",")}
        name="file"
        listType={props?.listType || "picture-circle"}
        className={ size == "small" ? "avatar_uploader_small" : "avatar_uploader"}
        showUploadList={false}
        action={`${cogUrl}/file/upload`}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        headers={{ Authorization: getStorageToken() }}
        style={{
          width: cardSize?.width,
          height: cardSize?.height
        }}
      >
        {props?.value ? RenderValueCard(): uploadButton}
      </Upload>
    </>
  );
}

export default AvatarUpload;
