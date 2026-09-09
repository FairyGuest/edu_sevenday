import { connect } from "umi";
import { memo, useEffect, useState } from "react";
import { copyText, formatStaticUrl, handleName } from "@/utils";
import MarkdownRender from "@/components/MarkdownRender";

// import FilePreview from "./FilePreview";
import { ZYIcon } from "@/components";
import Drawer from "@/components/EduSource/Drawer";

import "./index.less";

const QueryCard = (props: any) => {
  const { row } = props;
  const [x, setX] = useState(0);
  let title = row.title || "";
  title = title.split("参考资料")[0];
  const refData = row?.ref_question_list;

  const [openDrawer, setOpenDrawer] = useState < boolean > (false);
  const [rowDrawer, setRowDrawer] = useState({});

  const viewFn = (item: any) => {
    setOpenDrawer(!openDrawer);
    setRowDrawer(item);
  };

  const pdfRow = () => {
    return (
      <>
        {row?.question_pdf?.map((item: any, index: any) => {
          if (!item?.doc_name) {
            return;
          }
          return (
            <div
              className="pdf_box"
              key={index}
              onClick={() => {
                viewFn(item);
              }}
            >
              <div className="pdf_box_left">
                <div className="pdf_box_left_img">
                  <ZYIcon type={"pdf-color"} style={{ fontSize: 16 }} />
                </div>
                <div className="pdf_box_left_center">
                  <p className="pdf_box_left_center_top">{handleName(item?.doc_name)?.name}</p>
                  {/* <p className="pdf_box_left_center_bottom">范围</p> */}
                </div>
              </div>
              <div className="pdf_box_left_center_right"></div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <>
      <div className="user_chat_query_container flex question-answer-mt-32">
        {/* <div className="user_basic">
          <div>
            <img
              className="user_avatar"
              src={
                formatStaticUrl(getUserInfo("icon")) ||
                require("@/assets/user.png")
              }
              alt=""
            />
          </div>
          <div className="user_name">
            {getUserInfo("name") || getUserInfo("phone") || "用户"}
          </div>
        </div> */}
        <div className="placeholder flex flex-grow"></div>
        <div
          className="user_content overflow-hidden"
          onCopy={(e) => {
            e.preventDefault();
            let clipboardData = e.clipboardData;
            let content = window.getSelection()?.toString();
            clipboardData.setData("text", content || "");
          }}
          onMouseEnter={(e) => {
            const rect = (e.target as HTMLDivElement).getBoundingClientRect();
            let a = e.clientX - rect.left - 60;

            if (a < 0) {
              a = 0;
            }
            if (a > rect.width - 60) {
              a = rect.width - 60;
            }
            setX(a);
          }}
        >
          <div className="user_content_ReactMarkdown">
            <MarkdownRender>{`${title}`}</MarkdownRender>
          </div>
          {/* {refData?.map?.((item:any,index:any)=>{
            return <FilePreview key={index} file={item} />
          })} */}
          <div
            className="copy-btn"
            style={{ left: x }}
            onClick={() => {
              copyText(row.title);
              props.onClickCopy?.(row.title);
            }}
          >
            <div>
              <ZYIcon type="copy" />
            </div>
            <div>复制入框</div>
          </div>
          <div className="ai_design_content_pdf flex justify-end">{pdfRow()}</div>
        </div>
      </div>
      {openDrawer && (
        <Drawer
          rowDrawer={rowDrawer}
          openDrawer={openDrawer}
          cancel={() => {
            setOpenDrawer(false);
          }}
        />
      )}
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(memo(QueryCard));
