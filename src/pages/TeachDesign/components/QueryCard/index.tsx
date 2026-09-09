import { useState } from "react";
import MarkdownRender from "@/components/MarkdownRender";
import { ZYIcon } from "@/components";
import { handleName, bytesToSize } from "@/utils";
import { Image } from "antd";

import "./index.less";

const QueryCard = (props: any) => {
  const { id, content, leftWidth } = props;
  const { textbook_info = "", doc_ids = [], user_require = "" } = content || {};

  const imgeType = ["png", "jpg", "jpeg"];
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // 图片预览
  const openImage = (item: any) => {
    setPreviewOpen(true);
    setPreviewUrl(item?.url);
  };

  return (
    <div className="query-card" id={id}>
      <div style={{ flex: 1, minWidth: 24 }}></div>
      <div className="query-content" style={{ maxWidth: leftWidth ? leftWidth - 70 : "auto" }}>
        {textbook_info && (
          <div className="query-content-info">
            <MarkdownRender>{textbook_info}</MarkdownRender>
          </div>
        )}
        {doc_ids?.length > 0 && (
          <div className="query-content-file">
            {doc_ids?.map?.((item: any) => (
              <div className="file-item" key={item?.id}>
                <ZYIcon
                  className="file-item-icon"
                  type={handleName(item?.doc_name).icon}
                />
                <div className="file-item-name">
                  {handleName(item?.doc_name).name}
                </div>
                <div className="file-item-desc">
                  {handleName(item?.doc_name).type.toUpperCase()} ·{" "}
                  {bytesToSize(item?.file_size)}
                </div>
                {imgeType.includes(handleName(item?.doc_name).type) && (
                  <div className="file-item-preview" onClick={() => openImage(item)}>
                    <ZYIcon type="chakan" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {user_require && (
          <div className="query-content-text">{user_require}</div>
        )}
      </div>

      {previewUrl && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewUrl(""),
          }}
          src={previewUrl}
        />
      )}
    </div>
  );
};

export default QueryCard;
