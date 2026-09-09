import { useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "@umijs/max";
import MarkdownRender from "@/components/MarkdownRender";
import { Input, message } from 'antd'
import markdownit from 'markdown-it'
import PreviewEditToolbar from "@/components/PreviewEditToolbar";
import "./EditDesign.less";

let artifactsEditor; // 编辑器实例
const md = markdownit()
const result = md.render('# markdown-it rulezz!');
const App = (props: any) => {
  const dispatch = useDispatch();
  const { designModel, outlineText, selectedItem } = props;
  const [editing, setEditing] = useState(false);
  const [newText, setNewText] = useState(outlineText)

  // const { outlineText } = designModel;
  const [currentText, setCurrentText] = useState(outlineText);
  //  渲染表格
  const renderSource = (sParam: any, category: any) => {
    const { node, children } = sParam;

    if (!children || children.length == 0) {
      return null;
    }

    const editProp = {
      // contentEditable: true,
      className: "edit_design_div_box",
    };

    if (category == "h1") {
      return <h1 {...editProp}>{children}</h1>;
    }

    if (category == "h2") {
      return <h2 {...editProp}>{children}</h2>;
    }

    if (category == "h3") {
      return <h3 {...editProp}>{children}</h3>;
    }

    if (category == "h4") {
      return <h4 {...editProp}>{children}</h4>;
    }

    if (category == "h5") {
      return <h5 {...editProp}>{children}</h5>;
    }
    if (category == "h6") {
      return <h6 {...editProp}>{children}</h6>;
    }

    if (category == "li") {
      return <li {...editProp}>{children}</li>;
    }
    if (category == "strong") {
      return <strong {...editProp}>{children}</strong>;
    }
    return <p {...editProp}>{children}</p>;
  };

  const onEdit = (itype: 'open' | 'submit' | 'close') => {
    if (itype == 'open') {
      setCurrentText(newText || outlineText)
      setEditing(true);
    } else if (itype == 'close') {
      setEditing(false);
    } else if (itype == 'submit') {
      if (selectedItem.request_id) {
        dispatch({
          type: 'teachingModel/postData',
          apiUrl: "updateOutlineText",
          payload: {
            id: selectedItem.request_id,
            outline: currentText
          }
        }).then((res) => {
          if (res.code == 200) {
            message.success(res.msg)
          } else {
            message.error(res.msg)
          }
        })
      }
      setNewText(currentText)
      // 需要更新当前内容
      setEditing(false);
    }
  }

  const updateMd = (e: { target: { value: any; }; }) => {
    setCurrentText(e.target.value);
  }

  return (
    <div className="editDesign @container max-w-full relative border-1 border-black/10 overflow-hidden">

      <PreviewEditToolbar
        editing={editing}
        onEdit={(type) => onEdit(type)}
        className="tabContainer"
      />

      {editing ?
        <Input.TextArea
          className="textarea"
          value={currentText}
          onChange={updateMd}
        /> :
        <div className="text_area_box" ref={props.rightBlockRef}>
          <MarkdownRender
            components={{
              li: (param: any) => renderSource(param, "li"),
              p: (param: any) => renderSource(param, "p"),
              a: (param: any) => renderSource(param, "a"),
              h1: (param: any) => renderSource(param, "h1"),
              h2: (param: any) => renderSource(param, "h2"),
              h3: (param: any) => renderSource(param, "h3"),
              h4: (param: any) => renderSource(param, "h4"),
              h5: (param: any) => renderSource(param, "h5"),
              h6: (param: any) => renderSource(param, "h6"),
              strong: (param: any) => renderSource(param, "strong"),
            }}
          >
            {newText || outlineText}
          </MarkdownRender>
        </div>
      }
    </div>
  );
};

export default connect((state: any) => ({
  designModel: state.designModel,
}))(App);
