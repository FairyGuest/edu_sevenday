import { connect } from "umi";
import { memo, useState } from "react";
import { copyText, formatStaticUrl, getUserInfo } from "@/utils";
import MarkdownRender from "@/components/MarkdownRender";
// import FilePreview from "./FilePreview";
import { ZYIcon } from "@/components";

import "./index.less";

const QueryCard = (props: any) => {
  const { row } = props;
  const [x, setX] = useState(0);
  let title = row.title || "";
  title = title.split("参考资料")[0];
  const refData = row?.ref_question_list;

  return (
    <>
      <div className="user_chat_query_container">
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
        <div
          className="user_content"
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
        </div>
      </div>
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(memo(QueryCard));
