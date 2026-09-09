import { useState, useEffect, useRef, useImperativeHandle } from "react";
import { Editor, Toolbar } from "@wangeditor-next/editor-for-react";
import {
  IDomEditor,
  IEditorConfig,
  IToolbarConfig,
} from "@wangeditor-next/editor";
import { ZYIcon } from "@/components";
import { cogUrl } from "@/utils/host";
import { getStorageToken } from "@/utils";

import "@wangeditor-next/editor/dist/css/style.css"; // 引入 css
import "./style.css";
import "./index.less";

const MyEditor = (props: any) => {
  const { data, onRef, onChange } = props;
  const editorRef = useRef(null);
  const [editor, setEditor] = useState<IDomEditor | null>(null);
  const [html, setHtml] = useState("");

  useImperativeHandle(onRef, () => ({
    getEditData: () => editor?.getHtml(), // 获取数据
    getEditRef: () => editorRef, // 获取 editor 实例
  }));

  // 设置 html
  useEffect(() => {
    // setHtml(data?.html_content || "");
    setHtml(props?.value || '')
  }, [props?.value]);

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {
    toolbarKeys: [
      // {
      //   key: "group-image",
      //   title: "图片",
      //   iconSvg:
      //     '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
      //   // menuKeys: ["insertImage", "uploadImage"],
      //   menuKeys: ["uploadImage"],
      // },
    ],
  };

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: "请输入...",
    MENU_CONF: {},
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
    onSuccess: (file: any, res: any) => {
      console.log("Upload Success");
    },
    onFailed: () => {
      console.log("Upload Failed");
    },
    onError: () => {
      console.log("Upload Error");
    },
  } as any;

  return (
    <div className="editor">
      <div className="editor-header">
        <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" />
      </div>
      <div className="editor-container" ref={editorRef}>
        <Editor
          mode="default"
          className="editor-content"
          defaultConfig={editorConfig}
          value={html}
          onCreated={setEditor}
          onChange={(editor) => {
            const htmlContent = editor.getHtml();
            setHtml(htmlContent);
            onChange?.(htmlContent);
          }}
        />
      </div>
    </div>
  );
};

export default MyEditor;
