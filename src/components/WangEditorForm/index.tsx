import { useState, useEffect, useRef } from "react";
import { Editor, Toolbar, } from "@wangeditor-next/editor-for-react";
import {
  Boot,
  IDomEditor,
  IEditorConfig,
  IToolbarConfig,
} from "@wangeditor-next/editor";
import { cogUrl } from "@/utils/host";
import { checkWangImgsToDom, getStorageToken, insertWangContent, parseMathHtmlToWangeditor } from "@/utils";
import renderMathInElement from "katex/dist/contrib/auto-render";

import "katex/dist/katex.min.css";
import "@wangeditor-next/editor/dist/css/style.css"; // 引入 css

import formulaModule from '@wangeditor-next/plugin-formula' // 引入数学公式插件


Boot.registerModule(formulaModule)

const WangEditorForm = (props: any) => {
  const { readOnly } = props;
  const editorRef = useRef(null);
  const [editor, setEditor] = useState<IDomEditor | null>(null); // TS 语法

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  useEffect(() => {
    renderMathInElement(editorRef.current, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true },
      ],
      throwOnError: false,
    });
  }, [editorRef.current]);

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {
    toolbarKeys: [
      "uploadImage",
      "insertTable",
      "codeBlock",
      "|",
      "undo",
      "redo",
      "|",
      "formatPainter",
      "fullScreen",
    ],
  }; // TS 语法

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: "请输入内容...",
    readOnly,
    MENU_CONF: {
     
    },
  };

  editorConfig.MENU_CONF!["uploadImage"] = {
    server: `${cogUrl}/teach_plan/upload_file`,
    fieldName: "files",
    headers: {
      Authorization: getStorageToken() || "",
    },
    base64LimitSize: 1 * 1024,
    customInsert(res: any, insertFn: (url: string, alt?: string) => void) {
      if (res.code === 200) {
        insertFn(res.data[0].file_url, res.data[0].file_name);
      }
    },
    onSuccess: (file, res) => {
      console.log("Upload Success");
    },
    onFailed: () => {
      console.log("Upload Failed");
    },
    onError: () => {
      console.log("Upload Error");
    },
  };


  // 编辑器内容改变时触发
  const onChangeEditor = (edit: any) => {
    let tmpHtml = edit.getHtml();
    const tmpText = edit.getText().trim();
    if (tmpText == "") {  // 如果编辑器里只有标签，强制去掉无用的 dom 标签
      tmpHtml = ""; 
    }
    props?.onChange?.(tmpHtml);
  };


  
  const  editorStr=parseMathHtmlToWangeditor(insertWangContent(checkWangImgsToDom(props.value)))



  return (
    <div style={{ border: "1px solid #ccc", zIndex: 100 }} ref={editorRef}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: "1px solid #ccc" }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={editorStr}
        onCreated={setEditor}
        onChange={onChangeEditor}
        mode="simple"
        style={{ minHeight: props.height || "100px", overflowY: "hidden" }}
      />
    </div>
  );
};

export default WangEditorForm;
