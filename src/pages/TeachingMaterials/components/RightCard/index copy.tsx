import { connect, useLocation, history } from "@umijs/max";
import { Button, message, Modal, Skeleton, Spin } from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  CloseOutlined,
  FileDoneOutlined,
  FilePptOutlined,
  UnorderedListOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

import "./index.less";
import "./markdown-body.less";

import { useEffect, useRef, useState } from "react";
import {
  scrollTop,
  getUserInfo,
  sseRequset,
  str2json,
  deepCopy,
  uuid,
} from "@/utils";
import { ppt_arr } from "../../models/mock";
import EditDesign from "./EditDesign";
import CreatePPT from "./CreatePPT";

const gFile = [
  // {
  //   key: "chat",
  //   icon: <PlayCircleOutlined />,
  //   text: "预览PPT",
  // },
  {
    key: "outline",
    icon: <UnorderedListOutlined />,
    text: "大纲",
  },
  {
    key: "create",
    icon: <PlayCircleOutlined />,
    text: "生成PPT",
  },
  {
    key: "down",
    icon: <DownloadOutlined />,
    text: "查看&导出PPT",
  },
];

let gTotalPage = 0;
let gContentList = [];

const App = (props: any) => {
  const { onRef, designModel } = props;
  const { pptArr } = designModel;
  const chatListRef = useRef(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showCreate, setShowCreate] = useState("create");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null); // 引用父容器
  const [parentWidth, setParentWidth] = useState(0);
  const [scaleNum, setScaleNum] = useState(1);

  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(0);

  const [contentList, setContentList] = useState([
    // {url:"https://aminer-workflow-graph.jyzhang.cn/ppt/getPPT/22344431-053b-435d-ba24-043be14a5143/1"},
    // {url:"https://aminer-workflow-graph.jyzhang.cn/ppt/getPPT/22344431-053b-435d-ba24-043be14a5143/2"},
    // {url:"https://aminer-workflow-graph.jyzhang.cn/ppt/getPPT/22344431-053b-435d-ba24-043be14a5143/3"},
    // {url:"https://aminer-workflow-graph.jyzhang.cn/ppt/getPPT/22344431-053b-435d-ba24-043be14a5143/4"},
    // {url:"https://aminer-workflow-graph.jyzhang.cn/ppt/getPPT/22344431-053b-435d-ba24-043be14a5143/5"},
    // {url:"https://aminer-workflow-graph.jyzhang.cn/ppt/getPPT/22344431-053b-435d-ba24-043be14a5143/6"},
    // {url:"https://aminer-workflow-graph.jyzhang.cn/ppt/getPPT/22344431-053b-435d-ba24-043be14a5143/7"},
    // {url:"https://aminer-workflow-graph.jyzhang.cn/ppt/getPPT/22344431-053b-435d-ba24-043be14a5143/8"},
  ]);
  const [isStop, setIsStop] = useState(false);

  const { search, state: queryState } = useLocation();
  const searchParams = new URLSearchParams(search);
  const session_id = searchParams.get("session_id"); // 助手 ID
  const [first, setFirst] = useState(true);

  useEffect(() => {
    // setLoading(true);
    // setTimeout(() => {
    //   setLoading(false);
    // }, 2000);
    // if (props?.showPPT) {
    //   setShowCreate("outline");
    //   setIsStop(true);
    // } else {
    //   setContentList([]);
    //   setShowCreate("");
    //   setTotalPage(0);
    //   setPage(0);
    //   setIsStop(false);
    //   setFirst(true);
    // }
  }, [props?.showPPT]);

  // useEffect(() => {
  //   scrollTopChat();
  // }, [contentList]);

  // useEffect(() => {
  //   // 添加键盘事件监听
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (!previewVisible) return;

  //     if (e.key === "ArrowLeft") {
  //       prevSlide();
  //     } else if (e.key === "ArrowRight") {
  //       nextSlide();
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [previewVisible, currentSlide, pptArr]);

  useEffect(() => {
    // 创建 ResizeObserver 实例
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // 获取父容器的宽度
        const newWidth = entry.contentRect.width;
        setParentWidth(newWidth);
        setScaleNum(newWidth / 1280);
      }
    });

    // 监听父容器的尺寸变化
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    // 组件卸载时取消监听
    return () => {
      if (parentRef.current) {
        resizeObserver.unobserve(parentRef.current);
      }
    };
  }, []);

  const scrollTopChat = () => {
    setTimeout(() => {
      scrollTop(chatListRef);
    }, 100);
  };

  const showPreview = () => {
    setCurrentSlide(0);
    setPreviewVisible(true);
  };

  const nextSlide = () => {
    if (currentSlide < pptArr.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  //预览

  const contentIcon = () => {
    return (
      <div className="design_right_card_container_box_content">
        <p>
          <FileDoneOutlined />
        </p>
        <p>{props?.showRight ? "教案生成中" : "教案预览"}</p>
      </div>
    );
  };

  const getCreatePPT = () => {
    //  mock 生成数据

    let tempPageArr = deepCopy(gContentList);
    tempPageArr.push({ id: uuid(), pageNum: 1 });
    setContentList(tempPageArr);

    const payload = {
      sseUrl: "https://aminer-workflow-graph.jyzhang.cn/ppt/gerneratePPT",
      id: session_id,
      userName: getUserInfo("name"),
      reportText: props?.answerRow?.text,
    };
    sseRequset(payload, (res: any) => updChatInfo(res));
  };

  const updChatInfo = async (param: any) => {
    if (!isStop) {
      return;
    }

    const content = str2json(param.data);

    debugger;
    const { total_page, page = 0, html } = content;

    let tempPageArr = deepCopy(gContentList);
    if (total_page) {
      // 第一次多少条
      gTotalPage = total_page;
      // tempPageArr.push({id:uuid(),pageNum:1})
    }

    if (page) {
      tempPageArr[page - 1]["content"] = html;
      tempPageArr[page - 1]["url"] =
        `https://aminer-workflow-graph.jyzhang.cn/ppt/getPPT/${session_id}/${page}`;
      const index = page;
      if (gTotalPage > page) {
        // 提取添加下一条
        tempPageArr.push({ id: uuid(), pageNum: index + 1 }); // 提取加载下一条
      }
    }

    setContentList(tempPageArr);
    gContentList = tempPageArr;
    scrollTopChat(); // 滚动
    console.log("gContentListgContentList", gContentList);
  };

  const getClassName = (item: any) => {
    if (item?.key == "outline" && showCreate == "outline") {
      return "active_button_css";
    }
    if (item?.key == "create" && showCreate == "create") {
      return "active_button_css";
    }
    return "";
  };

  return (
    <div className="design_outline_header_container_box" ref={parentRef}>
      <div className="design_right_card_container_box_title">
        <span className="design_right_card_container_box_title_content">
          <FileDoneOutlined style={{ marginRight: "4px" }} />
          AI教案智能体
        </span>

        {/* <span className="action_container">
          <Button>大纲</Button>
          <Button>PPT生成</Button>
        </span> */}
      </div>

      {/* 大纲生成 */}

      {props?.showPPT && (
        <div className="design_outline_header_container">
          <div className="header-box">
            {gFile.map((button) => (
              <Button
                key={button.key}
                type="primary"
                icon={button.icon}
                // onClick={() => onClickAgent(button.key)}
                className={getClassName(button)}
                onClick={() => {
                  if (button.key === "outline") {
                    // 预览 ppt
                    setShowCreate("outline");
                    // showPreview();
                  } else if (button.key === "create") {
                    setShowCreate("create");
                    if (first) {
                      getCreatePPT();
                    }
                    setFirst(false);
                  } else if (button.key === "down") {
                    if (page == 0 || totalPage == 0 || page != totalPage) {
                      message.warning("请先生成PPT");
                      return;
                    }

                    // history.push(
                    //   `/ai-design-ppt?id=${session_id}&totalPage=${totalPage}`,
                    // );
                  }
                }}
                // className={rightCardStatus === button.key ? 'active-button' : ''}
              >
                {button.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* {!props?.showPPT && contentIcon()} */}

      {showCreate == "outline" && <EditDesign {...props} />}

      {/* {showCreate == "create" && ( */}

      <div className="iframe_box_css" ref={chatListRef}>
        {contentList?.map?.((item: any, index: any) => {
          return (
            <CreatePPT
              totalPage={gTotalPage}
              key={index}
              scaleNum={scaleNum}
              {...item}
              data={item}
            />
          );
        })}
      </div>

      {/* )} */}

      {/* {props?.showPPT && (
        <div className="design_right_card_container" ref={chatListRef}>
          {loading && (
            <div className="skeleton_box">
              <Skeleton avatar active paragraph={{ rows: 4 }} />
            </div>
          )}
          {!loading &&
            pptArr?.map?.((item: any, index: any) => {
              return <PPT data={item} key={index} />;
            })}
        </div>
      )} */}

      <Modal
        open={previewVisible}
        closable={false}
        className="ppt-preview-modal"
        footer={null}
        width={1000}
        centered
      >
        {pptArr?.length > 0 && (
          <iframe
            style={{
              width: 1280,
              height: 720,
              transform: `scale(${1000 / 1280})`,
              transformOrigin: "top left",
            }}
            src={pptArr[currentSlide].url}
            frameBorder="0"
          ></iframe>
        )}

        <div
          className="close"
          onClick={(e) => {
            e.stopPropagation(); // 阻止事件冒泡
            setPreviewVisible(false);
            console.log("关闭按钮被点击");
          }}
        >
          <CloseOutlined />
        </div>
      </Modal>
    </div>
  );
};
export default connect((state: any) => ({
  designModel: state.designModel,
  commonModel: state.commonModel,
}))(App);
