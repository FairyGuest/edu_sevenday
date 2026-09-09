import { useState, useRef } from "react";
import { Button, Dropdown, Input, Tooltip, Modal, message } from "antd";
import { connect, useDispatch, useRequest, history } from "umi";
import CourseUpModal from "./CourseUpModal";
import UploadFile from "../UploadFile";
import ZYIcon from "@/components/ZYIcon";
import AttachList from "../AttachList";
import { handleName } from "@/utils";

import "./index.less";

const { TextArea } = Input;
const { confirm } = Modal;
const DialogInput = (props: any) => {
  const { loading, inputValue, setInputValue, fileList, setFileList, onPublishClick, disabled = false, leftWidth = 500, teachDesginModel, planDetail, detailData} = props;
  const { planSseLoading,evaluateSseLoading } = teachDesginModel;

  const uploadFileRef = useRef<any>(null); // 上传文件ref
  const [courseUpOpen, setCourseUpOpen] = useState(false); // 弹窗是否显示
  // const [fileList, setFileList] = useState<any[]>([]); // 上传的文件列表

  // 上传文件点击事件
  const onUploadClick = (e: any) => {
    if (e.key === "local") {
      uploadFileRef.current?.onUploadOpen();
    } else if (e.key === "course") {
      setCourseUpOpen(true);
    }
  };
  // 删除上传文件
  const tagsDelete = (dele: any) => {
    const newFileList = fileList.filter((item: any) => item.id !== dele.id);
    setFileList(newFileList);
  };

    // 输入框回车事件
    const handleKeyDown = (event: any) => {
      if (event.key == "Enter") {
        // 换行实现
        // if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
        //   return;
        // }
        // 阻止默认的换行行为
        event.preventDefault();
        onPublishClick?.()
      }
    }


  return (
    <div className="dialog-input">
      <div className="dialog-input-content">
        {fileList?.length > 0 && (
          <div className="dialog-input-attch" style={{ maxWidth: `${leftWidth}px` }}>
            <AttachList fileList={fileList} fileDelete={tagsDelete} />
          </div>
        )}
        <TextArea
          autoSize={{ minRows: 2, maxRows: 2 }}
          style={{fontSize:'15px'}}
          placeholder="对生成的教案，您有哪些修改或优化建议呢？例如增加课堂提问、增加分层任务、完善评价环节等。"
          variant="borderless"
          value={inputValue}
          onChange={(e: any) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="upload-btn">
          <div className="upload-btn-drop">
            <Dropdown
              trigger={["click"]}
              placement="topLeft"
              menu={{
                items: [
                  { key: "local", label: "本地文件" },
                  // { key: "course", label: "课程文件" },
                ],
                onClick: onUploadClick,
              }}
            >
              <Tooltip title="上传参考资料" placement="right">
                <Button
                  color="default"
                  variant="text"
                  disabled={fileList?.length >= 10 || loading || planSseLoading}
                  icon={<ZYIcon type="upload-file" size={20} />}
                />
              </Tooltip>
            </Dropdown>
          </div>
          <div className="icon_box_css">
            {(planSseLoading || !inputValue) ? <div className="icon_box_disabled">
              <ZYIcon
                type="send"
                size={20}
              />
            </div>
              : <div className='icon_box'
                // style={{
                //   background: inputValue ? '#1C6CFF' : '#EDF4FF',
                //   color: inputValue ? '#ffffff' : '#A8C8FF'
                // }}
                >
                <ZYIcon
                  type="send"
                  size={20}
                  onClick={() => {
                    // if(detailData?.is_new_evaluate) {
                    //   message.warning('教案评估中,请稍后...')
                    //   return
                    // }
                    onPublishClick?.()
                  }}
                />
              </div>}


          </div>
        </div>
      </div>
      <UploadFile
        onRef={uploadFileRef}
        dataList={fileList}
        setDataList={setFileList}
      />
      <CourseUpModal
        open={courseUpOpen}
        setOpen={setCourseUpOpen}
        fileList={fileList}
        setFileList={setFileList}
      />
    </div>
  );
};

export default connect((state: any) => ({
  teachDesginModel: state.teachDesginModel,
}))(DialogInput);
