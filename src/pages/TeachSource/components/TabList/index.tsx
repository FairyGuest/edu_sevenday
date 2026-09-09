import { useEffect, useState, useRef } from "react";
import { Tabs } from "antd";
import { useLocation, useDispatch } from "umi";
import QuestionsPdf from "../QuestionsPdf";
import EduSource from "../EduSource";
import GraphShow from "../GraphShow";
import PptShow from "../PptShow";
import PdfShow from "../PdfShow";
import LookTopic from "../LookTopic";
import Video from "../Video";
import MarkdownShow from "../MarkdownShow";
import { ZYIcon } from "@/components";
import { handleName } from "@/utils";

import "./index.less";
import HtmlShow from "../HtmlShow";

const TabList = (props: any) => {
  const { openAI, setOpenAI } = props;
  const dispatch = useDispatch();

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const segValue = searchParams.get("type");
  const courseId = searchParams.get("courseId");
  const [activeTab, setActiveTab] = useState({
    category: "source",
    id: "source",
  });
  const [activeKey, setActiveKey] = useState("");
  const [tabList, setTabList] = useState<any>([]);
  const [fullScreen, setFullScreen] = useState(false); // 全屏

  useEffect(() => {
    clearBtn();
    setTabList([]);
  }, [courseId]);

  useEffect(() => {
    const handleEsc = () => {
      if (!document.fullscreenElement) {
        setFullScreen(false);
      }
    };
    // 添加事件监听器
    document.addEventListener("fullscreenchange", handleEsc);
    return () => document.removeEventListener("fullscreenchange", handleEsc);
  }, []);
  // 选中左侧tab
  const clearBtn = () => {
    setActiveKey("");
    setActiveTab({ category: "source", id: "source" });

    dispatch({
      type: "teachSourceModel/setData",
      payload: {
        activeTab: { category: "source", id: "source" },
        activeKey: "",
      },
    });
  };
  // 选择文档预览
  const onCheckNode = (param: any) => {
    console.log("tab节点", param);
    const { id, label, doc_name } = param;
    const { name, icon } = handleName(doc_name);
    // key、label是组件要求字段，原label是文档标签用tag存储
    const row = {
      ...param,
      label: <span title={name}>{name}</span>,
      key: id,
      tag: label,
      icon: <ZYIcon type={icon} />,
    };
    setActiveKey(id);
    setActiveTab(row);
    dispatch({
      type: "teachSourceModel/setData",
      payload: { activeTab: row, activeKey: id },
    });

    // 判断是否存在
    if (!tabList.some((item: any) => item.id === id)) {
      setTabList([...tabList, row]);
    }
  };
  // tab 切换
  const onChangeTab = (param: any) => {
    const row = getRow(param);
    setActiveTab(row);
    setActiveKey(param);

    dispatch({
      type: "teachSourceModel/setData",
      payload: { activeTab: row, activeKey: param },
    });
  };
  // 获取选中的tab
  const getRow = (targetKey: any) => {
    let newTabList = tabList?.filter((item: any) => {
      return item.key == targetKey;
    });
    return newTabList[0];
  };
  // tab 删除
  const onEdit = (targetKey: any, action: any) => {
    if (action === "remove") removeTab(targetKey);
  };

  // 删除
  const removeTab = (targetKey: any) => {
    const index = tabList?.findIndex((item: any) => item.key == targetKey);
    const newTabList = tabList?.filter((item: any) => item.key != targetKey);
    const length = newTabList?.length;
    setTabList(newTabList);
    // 不是当前tab，直接删除
    if (targetKey !== activeKey) {
      return;
    }
    if (length > 0) {
      // 删除当前tab，切换到下一个tab
      onChangeTab(newTabList[length > index ? index : length - 1]["id"]);
    } else {
      // 删除所有tab，切换到默认tab
      clearBtn();
    }
  };
  // tab 操作插槽
  const OperationsSlot = {
    left: (
      <div
        className={activeKey != "" ? "first_tab" : "first_tab_css"}
        onClick={() => clearBtn()}
      >
        <ZYIcon type="file-color" />
        教学资源库
      </div>
    ),
    //  todo  AI课堂助手
    // right: (
    //   <div className="right_btn">
    //     {!openAI && (
    //       <div className="btn btn_bg" onClick={() => setOpenAI(!openAI)}>
    //         <ZYIcon type="qingyan" />
    //         {segValue !== "course" ? "AI课堂助手" : "教学资源检索助手"}
    //       </div>
    //     )}
    //   </div>
    // )
  };
  // 文档展示处理
  const handleFileShow = (activeTab: any) => {
  
    if (activeTab?.file_type === "md") {  // md 类型文件预览
      return <MarkdownShow  docData={activeTab}/>
    }

    if (activeTab?.file_type === "html") {  // md 类型文件预览
      return <HtmlShow  docData={activeTab}/>
    }

  
  
    if (activeTab?.file_type === "teachingMaterials") {
      return (
        <PptShow
          docData={activeTab}
          fullScreen={fullScreen}
          setFullScreen={setFullScreen}
          openAI={openAI}
          setOpenAI={setOpenAI}
        />
      );
    } else if (activeTab?.file_type == "graph") {
      return <GraphShow docData={activeTab} />;
    } else if (activeTab?.exam_id) {
      return (
        <LookTopic
          exam_id={activeTab?.exam_id}
          fullScreen={fullScreen}
          setFullScreen={setFullScreen}
          openAI={openAI}
          setOpenAI={setOpenAI}
        />
      );
    } else if (activeTab.file_type == "mp3" || activeTab.file_type == "mp4") {
      return (
        <Video
          vodId={activeTab?.vod_id}
          file_type={activeTab?.file_type}
          fullScreen={fullScreen}
          setFullScreen={setFullScreen}
          openAI={openAI}
          setOpenAI={setOpenAI}
        />
      );
    } else if (activeTab.file_type === "pdf" || activeTab.is_convert === 1) {
      return (
        <PdfShow
          fileInfo={activeTab}
          fullScreen={fullScreen}
          setFullScreen={setFullScreen}
          openAI={openAI}
          setOpenAI={setOpenAI}
        />
      );
    } else if (activeTab.category !== "source") {
      return (
        <QuestionsPdf
          docId={activeKey}
          fullScreen={fullScreen}
          setFullScreen={setFullScreen}
          openAI={openAI}
          setOpenAI={setOpenAI}
        />
      );
    }
  };

  return (
    <div className="tab-list">
      <Tabs
        type="editable-card"
        className="file_card_tab"
        onChange={onChangeTab}
        activeKey={activeKey}
        onEdit={onEdit}
        items={tabList}
        hideAdd={true}
        tabBarExtraContent={OperationsSlot}
      />
      <>
        {activeTab.category == "source" && (
          <EduSource onCheckNode={onCheckNode} />
        )}

        {/* 文件内容展示 */}
        {handleFileShow(activeTab)}
      </>
    </div>
  );
};

export default TabList;
