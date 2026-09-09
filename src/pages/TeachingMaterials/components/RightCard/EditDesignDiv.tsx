import { useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "@umijs/max";
import { Input } from "antd";
import "./EditDesign.less";

const { TextArea } = Input;
const App = (props: any) => {
  // 初始化值
  const [content, setContent] = useState<string>("");
  const divRef = useRef<HTMLDivElement>(null);

  // 处理内容变化
  const handleContentChange = () => {
    if (divRef.current) {
      // 更新状态以触发重新渲染
      setContent(divRef.current.innerHTML);
    }
  };

  // 点击时进入编辑模式
  const handleDivClick = () => {
    if (divRef.current) {
      divRef.current.contentEditable = true;
      divRef.current.focus();
    }
  };

  // 退出编辑模式
  const handleBlur = () => {
    if (divRef.current) {
      divRef.current.contentEditable = false;
    }
  };

  useEffect(() => {
    if (props?.rowText) setContent(props?.rowText);
  }, [props]);

  // 监听内容变化
  // useEffect(() => {
  //   const div = divRef.current;
  //   if (div) {
  //     div.addEventListener("input", handleContentChange);
  //   }

  //   return () => {
  //     if (div) {
  //       div.removeEventListener("input", handleContentChange);
  //     }
  //   };
  // }, []);

  return (
    <div
      className="edit_design_div_box"
      ref={divRef}
      contentEditable={false}
      suppressContentEditableWarning={true}
      onClick={handleDivClick}
      onBlur={handleBlur}
      // style={{
      //   border: '1px solid #ccc',
      //   padding: '10px',
      //   cursor: 'pointer',
      //   outline: 'none',
      //   whiteSpace: 'pre-wrap',
      //   wordBreak: 'break-word',
      // }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default connect((state: any) => ({
  aiClassroomModel: state.aiClassroomModel,
}))(App);
