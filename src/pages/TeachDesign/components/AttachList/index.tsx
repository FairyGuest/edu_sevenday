import { useState, useEffect, useRef } from "react";
import { Button } from "antd";
import { ZYIcon } from "@/components";
import { bytesToSize, handleName } from "@/utils";

import "./index.less";

const AttachList = (props: any) => {
  const { fileList, fileDelete } = props;

  const scrollRef = useRef<any>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      checkScroll();
      window.addEventListener("resize", checkScroll);
      return () => window.removeEventListener("resize", checkScroll);
    }
  }, [fileList]);
  const handleScroll = (direction: string) => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const checkScroll = () => {
    const container = scrollRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollWidth > container.clientWidth &&
        Math.ceil(container.scrollLeft + container.clientWidth) <
          container.scrollWidth,
    );
  };

  return (
    <div className="file-content">
      {fileList?.length > 0 && (
        <div
          className={`file-list${canScrollLeft || canScrollRight ? " file-list-scroll" : ""}`}
          ref={scrollRef}
          onScroll={checkScroll}
        >
          {canScrollLeft && (
            <div className="scroll-btn scroll-btn-left">
              <Button
                size="small"
                icon={<ZYIcon type="zuo" />}
                onClick={() => handleScroll("left")}
              />
            </div>
          )}
          {fileList?.map?.((item: any) => (
            <div className="file-item" key={item?.id}>
              <ZYIcon
                style={{ fontSize: 30 }}
                type={handleName(item?.doc_name).icon}
              />
              <div className="file-item-info">
                <div className="name">{handleName(item?.doc_name).name}</div>
                <div className="desc">
                  {handleName(item?.doc_name).type.toUpperCase()} ·{" "}
                  {bytesToSize(item?.file_size)}
                </div>
              </div>
              <ZYIcon
                type="close"
                className="close-icon"
                onClick={() => fileDelete(item)}
              />
            </div>
          ))}
          {canScrollRight && (
            <div className="scroll-btn scroll-btn-right">
              <Button
                size="small"
                icon={<ZYIcon type="you" />}
                onClick={() => handleScroll("right")}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttachList;
