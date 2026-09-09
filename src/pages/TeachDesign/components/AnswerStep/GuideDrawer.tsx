import { useState, useEffect } from "react";
import { useDispatch } from "umi";
import { Button, Drawer, Dropdown } from "antd";
import PdfView from "@/components/PDFViewer";
import MarkdownRenderToc from "@/components/MarkdownRender/showToc";
import ZYIcon from "@/components/ZYIcon";

import "./index.less";

const GuideDrawer = (props: any) => {
  const { content } = props;
  const dispatch = useDispatch();
  const element = document.getElementsByClassName("drawer-element")[0];

  const [open, setOpen] = useState(false); // 抽屉是否打开
  const [dropdownOpen, setDropdownOpen] = useState(false); // 菜单按钮是否打开
  const [fullScreen, setFullScreen] = useState(false); // 抽屉是否全屏

  // 下载按钮点击事件
  const onDownloadClick = async (e: any) => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postDownloadPaln",
      payload: {
        md_content: content,
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
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="affix-guide-btn" onClick={showDrawer}>
        <img style={{ width: '48px', height: '48px' }} src={require('@/assets/teachingplanguide.png')} alt="" />
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
            <div>课标对齐指南</div>
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
          </div>
        }
      >
        <MarkdownRenderToc showToc={fullScreen}>{content}</MarkdownRenderToc>
      </Drawer>
    </>
  );
};

export default GuideDrawer;
