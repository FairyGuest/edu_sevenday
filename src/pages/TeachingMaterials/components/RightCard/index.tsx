import { connect, useLocation, history, useDispatch } from "@umijs/max";
import { Spin } from "antd";
import ZYIcon from "@/components/ZYIcon"
import PublishToResourseLibary from "./PublishToResourseLibary";

import { useEffect, useRef, useState } from "react";
import { deepCopy, } from "@/utils";
import EditDesign from "./EditDesign";
import CreatePPT from "./CreatePPT";
// import ZPpt from './zppt';
import PptListRender from "./PptListRender";
import "./index.less";
import "./markdown-body.less";

let gTotalPage = 0;
let gThinkText = "";
let gHtmlText = "";
let gStartStatus = false; // 是否开始生成PPT
let firstTime = true; // 是否第一次
let gContentList: any = [];

const App = (props: any) => {
  const dispatch = useDispatch();
  const { designModel, showPPT, chatList, tabStatus, setTabStatus, isStartCreatePPT, course_id, selectedItem } = props;
  const { outlineText } = designModel;

  // const chatListRef = useRef(null);

  const [showCreate, setShowCreate] = useState("outline");

  const parentRef = useRef < HTMLDivElement > (null); // 引用父容器
  const [parentWidth, setParentWidth] = useState(0);
  const [scaleNum, setScaleNum] = useState(1);

  const [contentList, setContentList] = useState([]);

  const { search, state: queryState } = useLocation();
  const searchParams = new URLSearchParams(search);
  const session_id = searchParams.get("session_id"); // 助手 ID
  const courseId = searchParams.get("courseId"); // 课程ID

  // const [modelData, setModelData] = useState < { details: string, thinkStatus: boolean, content: string, glmBlock: {} }[] > ([]);
  // let modelDataTemp: { glmBlock: {}; details: string; content: string; thinkStatus: boolean; }[] = [];

  useEffect(() => {
    if (outlineText?.length > 0) {
      init();
    }
  }, [outlineText]);

  const init = () => {
    firstTime = true;
    gStartStatus = false;
    setContentList([]);
  };

  useEffect(() => {
    // 创建 ResizeObserver 实例
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width; // 获取父容器的宽度
        setParentWidth(newWidth);
        setScaleNum((newWidth - 24) / 1080);
      }
    });
    if (parentRef.current) {
      // 监听父容器的尺寸变化
      resizeObserver.observe(parentRef.current);
    }

    return () => {
      // 组件卸载时取消监听
      if (parentRef.current) {
        resizeObserver.unobserve(parentRef.current);
      }
    };
  }, []);

  const getTabStatus = () => {
    if (showCreate == "outline") {
      return "outline";
    } else if (showCreate == "create") {
      return "create";
    } else {
      return "edit";
    }
  }

  const onClickOutLine = () => {
    setShowCreate("outline");
  };

  const getClassName = (param: any) => {
    if (showCreate == param) {
      return "active_button_css";
    }
    return "";
  };

  //  切换状态
  const onChangeSegmented = (index: any, status: any) => {
    let tempPageArr = deepCopy(gContentList);
    tempPageArr[index - 1]["status"] = status;
    setContentList(tempPageArr);
    gContentList = tempPageArr;
  };


  const onClickShowPPT = () => {
    if (gTotalPage != 0 && gTotalPage != 1 && contentList?.length > 0) {
      window.open(
        `/ai-design-ppt?session_id=${session_id}&totalPage=${gTotalPage}`,
      );
    }
  };



  function addCdnPrefixToHtml(html: string): string {
    const regex = /(<script\s+src=|<link\s+(?:[^>]*?\s+)?href=)(["'])([^"']+)\2/gi;
    return html.replace(regex, (match, prefix, quote, url) => {
      return `${prefix}${quote}https://artifacts-cdn.chatglm.site/${url}${quote}`;
    });
  }

  return (
    <div className="teaching_materials_right">
      {/* {showPPT && <ZPpt modelData={modelData} />} */}
      <div className="design_outline_header_container_box " ref={parentRef}>
        <div className="design_right_card_container_box_title flex items-center justify-between">
          <span className="design_right_card_container_box_title_content flex items-center">
            {/* <FileDoneOutlined style={{ marginRight: "4px" }} /> */}
            <ZYIcon type="beike" className="mr-2" />
            {/* AI教案智能体 */}
            教案讲义预览
          </span>
          {/* 大纲生成 */}
          <div className="tab flex">
            {(isStartCreatePPT?.loadding || isStartCreatePPT?.status == 'finish') && <>
              <div
                className={`tabItem cursor-pointer tabItemHover ${(tabStatus == 'ppt') && "tabItemActive"}`}
                onClick={() => { setTabStatus('ppt'); props.setSelectedItem({ ...selectedItem, type: 'ppt' }) }}>
                讲义
              </div>
              <div
                className={`tabItem cursor-pointer tabItemHover ${(tabStatus == 'outline') && "tabItemActive"}`}
                onClick={() => { setTabStatus('outline'); props.setSelectedItem({ ...selectedItem, type: 'outline' }) }}
              >
                教案
              </div>
            </>}
          </div>
          <div className="flex" style={{ gap: 12 }}>
            {(selectedItem?.fileName && selectedItem?.fileName !== '') &&
              <PublishToResourseLibary
                selectedItem={selectedItem}
                course_id={course_id}
              />}

            {(designModel?.htmlData?.length == 0 &&
              selectedItem?.fileName && outlineText?.length !== 0 && tabStatus == "outline") &&
              <div className="cursor-pointer flex create_ppt_btn_css items-center" onClick={() => { props.getCreatePPTNew() }}>
                <ZYIcon type="shengchengppt" />
                <div className="flex items-center">生成PPT</div>
              </div>}
          </div>
        </div>



        {(outlineText?.length == 0 && designModel?.htmlData?.length == 0) && (
          <div className="design_right_card_container_box_content w-full h-full flex w-full justify-center flex-col items-center">
            {(chatList.length > 0 && chatList[chatList.length - 1].loading)
              ?
              <div className="loadding_bg w-full h-full flex w-full justify-center flex-col items-center">
                <p>
                  <div style={{ marginBottom: "12px" }}>
                    <Spin />
                  </div>
                </p>
                <p style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#646E8B"
                }}>
                  {chatList[chatList.length - 1].text}
                </p>
              </div>
              :
              <>
                <p>
                  {/* <FileDoneOutlined /> */}
                  <ZYIcon type="beike" style={{ width: "24px", height: "24px", fill: "#646E8B" }} />
                </p>
                <p className="text-base" style={{ color: "#646E8B" }}>教案讲义预览</p>
              </>}
          </div>
        )}
        {tabStatus == "outline" && <div>
          <EditDesign
            rightBlockRef={props.chatListRef}
            outlineText={designModel?.outlineText}
            selectedItem={selectedItem}
          />
        </div>}

        {(tabStatus == "ppt") && (
          <div className="iframe_box_css" ref={props.chatListRef}>
            {(designModel?.htmlData.length == 0 || (isStartCreatePPT.status == 'ppt' && isStartCreatePPT.pptLoading)) &&
              <div className="loadding_bg w-full h-full flex w-full justify-center flex-col items-center">
                <p>
                  <div style={{ marginBottom: "12px" }}>
                    <Spin />
                  </div>
                </p>
                <p style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: "#646E8B"
                }}>
                  讲义PPT生成中...
                </p>
              </div>}
            {isStartCreatePPT.type == 'create' ?
              chatList[chatList.length - 1]?.modelData?.length > 0 &&
              chatList[chatList.length - 1]?.modelData?.map((record, index) => {
                if (!record.glmBlock?.html) return;
                return <div style={{ padding: "10px 10px 0 10px" }} key={`ppt_${index}`}>
                  <PptListRender
                    session_id={selectedItem?.session_id || session_id}
                    codeText={addCdnPrefixToHtml(record.glmBlock?.html)}
                    pageIndex={index}
                    type={record.glmBlock?.type || 'preview'}
                  />
                </div>
              }) :
              designModel?.htmlData.length > 0 && designModel.htmlData.map((record, index) => {
                {/* if (!record?.html || !record?.index_html) return; */ }
                return <div style={{ padding: "10px 10px 0 10px" }} key={`ppt_${record?.index_html}_${index}`} ref={props.chatListRef}>
                  <PptListRender
                    session_id={selectedItem?.session_id || session_id}
                    codeText={addCdnPrefixToHtml(record?.html || record?.index_html)}
                    type={record?.type || 'preview'}
                    pageIndex={index}
                  />
                </div>
              })
            }

          </div>
        )}


      </div>
      {/* <PublishToResourseLibary
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        form={form}
        request_id={selectedItem.request_id}
      /> */}

    </div>
  );
};

export default connect((state: any) => ({
  designModel: state.designModel,
  commonModel: state.commonModel,
}))(App);
