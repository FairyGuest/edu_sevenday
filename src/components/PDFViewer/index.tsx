import { useState, useEffect } from "react";
import { connect, useDispatch } from "umi";
import {
  MinimalButton,
  Position,
  RotateDirection,
  Tooltip,
  Viewer,
  Worker,
} from "@react-pdf-viewer/core";
import { Button } from "antd";
// import { RotateBackwardIcon, RotateForwardIcon } from '@react-pdf-viewer/rotate';
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { toolbarPlugin, ToolbarSlot } from "@react-pdf-viewer/toolbar";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";

import { ProgressBar } from "@react-pdf-viewer/core";
import JumpToPagePlugin from "./JumpToPagePlugin";
import FileCatalog from "../FileCatalog";
import { ZYIcon } from "@/components";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";

import "./index.less";

const workerSrc = require("pdfjs-dist/build/pdf.worker.entry");

const App = (props: any) => {
  const {
    fileInfo = {},
    checkType = false,
    onTreeCheck = () => {},
    checkItems = [],
    onTotalpages = () => {},
    initialPage = 1,
  } = props;
  const dispatch = useDispatch();

  const thumbnailPluginInstance = thumbnailPlugin();
  const { Thumbnails } = thumbnailPluginInstance;
  const toolbarPluginInstance = toolbarPlugin();
  const { Toolbar } = toolbarPluginInstance;
  const jumpToPagePluginInstance = JumpToPagePlugin();
  const { jumpToPage } = jumpToPagePluginInstance;

  const [fileUrl, setFileUrl] = useState<any>(); // pdf存储地址
  const [curPage, setCurPage] = useState(0); // 当前页码
  const [bookInfo, setBookInfo] = useState<any>(); // 书本信息
  const [open, setOpen] = useState(true); // 侧边栏展开收起
  const [type, setType] = useState("tree"); // 树、缩略图--tree、abbr
  const [hideHeader, setHideHeader] = useState(false); // 隐藏目录头

  useEffect(() => {
    if (fileInfo?.id) {
      getFileUrl();
      if (!location.pathname.includes("/course/detail")) {
        getTreeData();
      }
    }
  }, [fileInfo]);

  // 获取pdf文件url
  const getFileUrl = async () => {
    let { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postDocAnalyzeInfo",
      payload: {
        id: fileInfo?.id,
      },
    });

    if (code === 200) {
      let fileUrl = data;
      if (fileInfo?.is_convert === 1) {
        fileUrl = `${data}.pdf`
      }
      setFileUrl(fileUrl);
    }
  };
  // 获取目录树数据
  const getTreeData = async () => {
    if (!fileInfo?.is_master_doc) {
      const { code, data }: any = await dispatch({
        type: "teachDesginModel/getData",
        apiUrl: "getDocCatalogUrl",
        payload: { doc_id: fileInfo?.id },
      });
      if (code == 200) {
        if (data.length == 0) {
          setType("abbr");
          setHideHeader(true);
        }
      }
    }
  };

  const onPageChange = (param: any) => {
    console.log("当前页码:", param);
    // console.log("总页数:", param.doc._pdfInfo.numPages);
    setCurPage(param.currentPage);
    setBookInfo(param.doc);
    onTotalpages(param?.doc?._pdfInfo?.numPages);
  };
  const onZoom = (param: any) => {
    console.log("onZoom====>", param);
  };

  const onClickTest = (param: any) => {
    console.log("onZoom====>", param);
    jumpToPage(10);
  };
  const onThum = () => {
    setOpen(!open);
  };

  return (
    <>
      <div className="pdf_viewer_container">
        {open ? (
          <div className="thumbnails">
            <div className="thumbnails_container" style={{ height: "100%" }}>
              <div className="thumbnails_container_btn">
                <span
                  className="thumbnails_container_btn_span"
                  onClick={onThum}
                >
                  <ZYIcon type="fold" />
                </span>
              </div>
              {type === "tree" && fileInfo?.is_convert !== 1 ? (
                <FileCatalog
                  fileInfo={fileInfo}
                  docUrl={fileUrl}
                  page={curPage}
                  bookInfo={bookInfo}
                  setType={setType}
                  checkType={checkType}
                  onLeafClick={jumpToPage}
                  onTreeCheck={onTreeCheck}
                  checkItems={checkItems}
                />
              ) : (
                <div className="thumbnails_container_thumbnails">
                  {!hideHeader && (
                    <div className="file-catalog-header-menu">
                      {fileInfo?.is_convert !== 1 && (
                        <div
                          className="menu-btn"
                          onClick={() => setType("tree")}
                        >
                          <ZYIcon type="list" />
                        </div>
                      )}
                      <div className="menu-btn active">
                        <ZYIcon type="outlined" />
                      </div>
                    </div>
                  )}
                  <div className="file-catalog-header-der">
                    <Thumbnails />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="pdf_viewer">
          <div
            style={{
              alignItems: "center",
              backgroundColor: "#F2F5FA",
              display: "flex",
            }}
          >
            {/* 工具栏 */}
            <Toolbar>
              {(toolbarSlot: any) => {
                const {
                  CurrentPageInput,
                  EnterFullScreen,
                  GoToNextPage,
                  GoToPreviousPage,
                  NumberOfPages,
                  Print,
                  Zoom,
                  ZoomIn,
                  ZoomOut,
                } = toolbarSlot;
                return (
                  <div className="toolbar_der">
                    <div className="toolbar_derard">
                      {open ? (
                        <span> </span>
                      ) : (
                        <span onClick={onThum}>
                          <ZYIcon type="unfold" />
                        </span>
                      )}
                    </div>
                    <div className="toolbar_container">
                      <div className="toolbar_left">
                        <div className="toolbar_left_btntop">
                          <GoToPreviousPage />
                        </div>
                        <div className="toolbar_left_btnbottom">
                          <GoToNextPage />
                        </div>
                        <div className="toolbar_left_btninput">
                          <CurrentPageInput /> /{" "}
                          <span className="toolbar_left_btninput_span">
                            <NumberOfPages />
                          </span>
                        </div>
                      </div>
                      <div className="toolbar_middle"></div>
                      <div className="toolbar_right">
                        <div className="toolbar_right_btnjian">
                          <ZoomOut />
                        </div>
                        <div className="toolbar_right_btnjia">
                          <ZoomIn />
                        </div>
                        <div className="toolbar_right_btnprint">
                          <Zoom />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            </Toolbar>
          </div>
          <div className="thumbnails_viewer">
            <div className="viewer_container">
              {fileUrl && (
                <Worker workerUrl={`${BASE}pdf.worker_3.4.120.js`}>
                  <div style={{ height: "100%" }}>
                    <Viewer
                      initialPage={initialPage - 1}
                      fileUrl={fileUrl}
                      plugins={[
                        // defaultLayoutPluginInstance,
                        thumbnailPluginInstance,
                        toolbarPluginInstance,
                        jumpToPagePluginInstance,
                      ]}
                      // renderPage={renderPage}
                      renderLoader={(percentages: number) => (
                        <div style={{ width: "240px" }}>
                          <ProgressBar progress={Math.round(percentages)} />
                        </div>
                      )}
                      onPageChange={onPageChange}
                      onZoom={onZoom}
                    />
                  </div>
                </Worker>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
}))(App);
