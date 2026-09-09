import { Image, Progress, Tooltip } from "antd";
import { useImperativeHandle, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { formatStaticUrl } from "@/utils";
import Drawer from "@/components/EduSource/Drawer";

const defaultUrl = require("@/assets/upFile.png");
import "./CheckFileList.less";
import ZYIcon from "@/components/ZYIcon";

const CheckFileList = (props: any) => {
  const { onRef, textbookList = [] } = props;

  const [fileData, setFileData]: any = useState([]);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [rowDrawer, setRowDrawer] = useState({});

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    onFileChange: (files: any) => {
      //更新文件
    },
  }));

  const viewFn = (item: any) => {
    setOpenDrawer(!openDrawer);
    setRowDrawer(item);
  };

  return (
    <div className="check_file_list_box">
      {textbookList?.length > 0 &&
        textbookList?.map((item: any, index: any) => {
          return (
            <div
              className="check_file_list_box_css"
              key={index}
              onClick={() => {
                viewFn(item);
              }}
            >
              <div className="check_file_list_box_left">
                <ZYIcon type={"pdf-color"} style={{ fontSize: 24 }} />
              </div>
              <div className="check_file_list_box_right">
                <div className="check_file_list_box_doc_name">
                  {item?.doc_name}
                </div>
              </div>
              <div
                className="check_file_list_box_close"
                onClick={(event) => {
                  event.stopPropagation();
                  props?.cancel?.(item);
                }}
              >
                <CloseOutlined />
              </div>
            </div>
          );
        })}
      {openDrawer && (
        <Drawer
          rowDrawer={rowDrawer}
          openDrawer={openDrawer}
          cancel={() => {
            setOpenDrawer(false);
          }}
        />
      )}
    </div>
  );
};

export default CheckFileList;
