import { useState, useEffect } from "react";
import { useDispatch } from "umi";
import { Button, Drawer, Dropdown } from "antd";
import PdfView from "@/components/PDFViewer";
import MarkdownRenderToc from "@/components/MarkdownRender/showToc";
import { addNewTracking } from "@/utils";
import ZYIcon from "@/components/ZYIcon";

import "./index.less";

const StepDrawer = (props: any) => {
  const { item, detailData } = props;
  const dispatch = useDispatch();
  const element = document.getElementsByClassName("drawer-element")[0];

  const [open, setOpen] = useState(false); // 抽屉是否打开
  const [pageNum, setPageNum] = useState(1); // 教材页码
  const [dropdownOpen, setDropdownOpen] = useState(false); // 菜单按钮是否打开
  const [fullScreen, setFullScreen] = useState(false); // 抽屉是否全屏

  useEffect(() => {
    if (!open) return;
    if (item.type === "book") {
      getTextbookPage();
    }
  }, [open, item]);

  // 获取教材页码
  const getTextbookPage = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postBookPageUrl",
      payload: {
        doc_id: item?.id,
        chapter_name: item?.description?.subTitle,
      },
    });
    if (code === 200) {
      setPageNum(data?.page || 1);
    }
  };

  // 下载按钮点击事件
  const onDownloadClick = async (e: any) => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postDownloadPaln",
      payload: {
        md_content: item?.content,
        download_type: "guide",
        download_suffix: e.key,
      },
    });
    if (code === 200) {
      window.open(data?.file_url);
    }
  };
  const showDrawer = () => {
    setOpen(true);
    // if (detailData?.type == "2") {
    //   if (item.type === "book") {
    //     addNewTracking({
    //       bt: "pv",
    //       ct: "unit_plan_textbook_content_view",
    //       extra: {
    //         unit_id: detailData?.id,
    //       },
    //     });
    //   } else if (item.type === "standard") {
    //     addNewTracking({
    //       bt: "pv",
    //       ct: "unit_plan_new_curriculum_view",
    //       extra: {
    //         unit_id: detailData?.id,
    //       },
    //     });
    //   } else if (item.type === "guide") {
    //     addNewTracking({
    //       bt: "pv",
    //       ct: "unit_plan_generation_guide_view",
    //       extra: {
    //         unit_id: detailData?.id,
    //       },
    //     });
    //   }
    // } else {
    //   if (item.type === "book") {
    //     addNewTracking({
    //       bt: "pv",
    //       ct: "lesson_plan_textbook_content_view",
    //       extra: {
    //         lesson_id: detailData?.id,
    //       },
    //     });
    //   } else if (item.type === "standard") {
    //     addNewTracking({
    //       bt: "pv",
    //       ct: "lesson_plan_new_curriculum_view",
    //       extra: {
    //         lesson_id: detailData?.id,
    //       },
    //     });
    //   } else if (item.type === "guide") {
    //     addNewTracking({
    //       bt: "pv",
    //       ct: "lesson_plan_generation_guide_view",
    //       extra: {
    //         lesson_id: detailData?.id,
    //       },
    //     });
    //   }
    // }
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="drawer-btn" onClick={showDrawer}>
        <div className="drawer-btn-left">
          <div className="title">{item.description?.subTitle}</div>
          <div className="desc">
            查看原文
            <ZYIcon type={"you"} />
          </div>
        </div>
        <img
          className="drawer-btn-right"
          src={require(`@/assets/${item.type}_icon.png`)}
          alt={item.type}
        />
      </div>
      <Drawer
        open={open}
        mask={true}
        onClose={onClose}
        className="step-drawer"
        width={fullScreen ? "100%" : 840}
        closable={{ placement: "end" }}
        getContainer={() => element}
        rootStyle={{ position: "absolute" }}
        title={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {item.type === "book" && <div>{item.title}</div>}
            {item.type === "standard" && <div>{item.description?.subTitle}</div>}
            {item.type === "guide" && <div>{item.description?.subTitle}</div>}
            {item.type === "guide" && (
              <div>
                <Dropdown
                  onOpenChange={setDropdownOpen}
                  menu={{
                    items: [
                      // { key: "pdf", label: "下载为PDF" },
                      { key: "docx", label: "下载为Word" },
                    ],
                    onClick: onDownloadClick,
                  }}
                >
                  <Button type="text" icon={<ZYIcon type="download" />}>
                    下载
                    {/* <ZYIcon
                      type="xia"
                      size={12}
                      style={{
                        transform: `rotate(${dropdownOpen ? 180 : 0}deg)`,
                        transition: "transform 0.3s ease-in-out",
                      }}
                    /> */}
                  </Button>
                </Dropdown>
                <Button
                  type="text"
                  icon={<ZYIcon type={fullScreen ? "icon_fold" : "icon_unfold"} />}
                  onClick={() => setFullScreen(!fullScreen)}
                >
                  {fullScreen ? "收起" : "全览"}
                </Button>
              </div>
            )}
          </div>
        }
      >
        {item.type === "book" && ( <PdfView fileInfo={{ id: item.id }} initialPage={pageNum} /> )}
        {item.type === "standard" && <PdfView fileInfo={{ id: item.id }} />}
        {item.type === "guide" && ( <MarkdownRenderToc showToc={fullScreen}>{item.content}</MarkdownRenderToc> )}
      </Drawer>
    </>
  );
};

export default StepDrawer;
