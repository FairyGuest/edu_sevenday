
// import {  ZYIcon } from "@/components";
// import { copyText,  } from "@/utils";
// import Highlight from "react-highlight";
import "./index.less";


const CodeLight = (props:any) => {
  const {data,language="javascript",title,leftTitle}=props
  // let title="接口响应参数 Schema"
  return (
    <>
       {/* <div className="code_light_container">
        {title && <div className="h2 mg_top_16">{title}</div>}
        <div className="code_wrap">
          <div className="code_title">
            {leftTitle || language}
            <ZYIcon className="copy" type="copy" onClick={() => copyText(data)} /></div>
          <div className="code_content">
            <Highlight className={language}>{data}</Highlight>
          </div>
        </div>
       </div> */}
    </>
  );
};
export default CodeLight;
