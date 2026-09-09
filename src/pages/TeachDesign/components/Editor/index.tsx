import { useState, useEffect, useRef, useImperativeHandle } from "react";
import { Button } from "antd";
import { Editor, Toolbar } from "@wangeditor-next/editor-for-react";
import {
  Boot,
  DomEditor,
  SlateNode,
  IDomEditor,
  IEditorConfig,
  IModuleConf,
  IToolbarConfig,
} from "@wangeditor-next/editor";
import { ButtonMenu } from "./MenuPlugin";
import { ZYIcon } from "@/components";
import { cogUrl } from "@/utils/host";
import { getStorageToken } from "@/utils";
import renderMathInElement from 'katex/dist/contrib/auto-render';
import "katex/dist/katex.min.css";

import "@wangeditor-next/editor/dist/css/style.css"; // 引入 css
import "./style.css";
import "./index.less";
declare global {
  interface Window {
    MathLatexSDK: {
      init: (config: any, callback: (data: any) => void) => void;
      open: (options?: { spanId?: string; content?: string }) => void;
    };
  }
}

// 注册菜单
const module: Partial<IModuleConf> = {
  menus: [
    {
      key: "insertExercise",
      factory() {
        return new ButtonMenu("插入习题");
      },
    },
    {
      key: "insertFormula",
      factory() {
        return new ButtonMenu("插入公式");
      },
    },
  ],
};
// Boot.registerModule(module);

// SDK 配置 - appID 和 secretKey 稍后填写
const SDK_CONFIG = {
  appID: "app_9661bdd4382e45dc", // TODO: 填写你的 appID
  secretKey: "0c01654a2d1de04b09317c1f690c7f5f8a64f17f3b6bc65dc0a24d1cb41a0ba4", // TODO: 填写你的 secretKey
  iframeSrc: "https://api.mathpix.pro/#/sdk",
};

const MyEditor = (props: any) => {
  const { data, onRef } = props;
  const editorRef = useRef(null);
  const [editor, setEditor] = useState<IDomEditor | null>(null); // editor 实例
  const [html, setHtml] = useState("<p>欢迎使用教学设计编辑器</p>"); // 编辑器内容
  const [cataloagData, setCataloagData] = useState([]); // 目录数据
  const [treeOpen, setTreeOpen] = useState(true); // 目录树是否展开
  const isInitialized = useRef(false);

  // const toolbar = DomEditor.getToolbar(editor as IDomEditor);
  // const curToolbarConfig = toolbar?.getConfig();
  // console.log("🚀 ~ MyEditor ~ curToolbarConfig:", curToolbarConfig);
  // console.log(editor?.getAllMenuKeys());

  useImperativeHandle(onRef, () => ({
    getEditData: () => editor?.getHtml(), // 获取数据
    getEditRef: () => editorRef, // 获取 editor 实例
  }));

  // 设置 html
  useEffect(() => {
    setHtml(data?.html_content || "<p>欢迎使用教学设计编辑器</p>");
  }, [data]);

  useEffect(() => {
    renderMathInElement(editorRef.current, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false,
    })
  }, [html]);

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);
  // 自定义校验链接
  const customCheckLinkFn = (
    text: string,
    url: string,
  ): string | boolean | undefined => {
    if (!url) {
      return;
    }
    if (url.indexOf("http") !== 0) {
      return "链接必须以 http/https 开头";
    }
    return true;
  };

  // 自定义转换链接 url
  const customParseLinkUrl = (url: string): string => {
    if (url.indexOf("http") !== 0) {
      return `http://${url}`;
    }
    return url;
  };

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {
    toolbarKeys: [
      "headerSelect",
      "bold",
      "underline",
      "italic",
      "color",
      "bgColor",
      "|",
      "bulletedList",
      "numberedList",
      {
        key: "group-justify",
        title: "对齐",
        iconSvg:
          '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
        menuKeys: [
          "justifyLeft",
          "justifyRight",
          "justifyCenter",
          "justifyJustify",
        ],
      },
      {
        key: "group-indent",
        title: "缩进",
        iconSvg:
          '<svg viewBox="0 0 1024 1024"><path d="M0 64h1024v128H0z m384 192h640v128H384z m0 192h640v128H384z m0 192h640v128H384zM0 832h1024v128H0z m0-128V320l256 192z"></path></svg>',
        menuKeys: ["indent", "delIndent"],
      },
      "|",
      "emotion",
      "insertLink",
      {
        key: "group-image",
        title: "图片",
        iconSvg:
          '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
        menuKeys: ["insertImage", "uploadImage"],
      },
      {
        key: "group-video",
        title: "视频",
        iconSvg:
          '<svg viewBox="0 0 1024 1024"><path d="M981.184 160.096C837.568 139.456 678.848 128 512 128S186.432 139.456 42.816 160.096C15.296 267.808 0 386.848 0 512s15.264 244.16 42.816 351.904C186.464 884.544 345.152 896 512 896s325.568-11.456 469.184-32.096C1008.704 756.192 1024 637.152 1024 512s-15.264-244.16-42.816-351.904zM384 704V320l320 192-320 192z"></path></svg>',
        menuKeys: ["insertVideo", "uploadVideo"],
      },
      "insertTable",
      "undo",
      "redo",
      // insertFormula,
      // "insertExercise",
    ],
  };

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: "请输入内容...",
    MENU_CONF: {},
    // 选中公式时的悬浮菜单
    hoverbarKeys: {
      image: {
        menuKeys: [], // “编辑公式”菜单
      },
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

  // 插入链接
  editorConfig.MENU_CONF!["insertLink"] = {
    checkLink: customCheckLinkFn, // 也支持 async 函数
    parseLinkUrl: customParseLinkUrl, // 也支持 async 函数
  };
  // 更新链接
  editorConfig.MENU_CONF!["editLink"] = {
    checkLink: customCheckLinkFn, // 也支持 async 函数
    parseLinkUrl: customParseLinkUrl, // 也支持 async 函数
  };

  // 公式插入（将 SVG 转为图片插入）
  const handleCKEditorFormulaInsert = (data: any) => {
    if (editor == null) return;
    const { latexOut, outSvgImage, spanId } = data;
    if (!outSvgImage) {
      console.warn("没有 SVG 数据");
      return;
    }
    // 1. 将 SVG 转换为 data URL
    const dataUrl = svgToDataUrl(outSvgImage);
    if (spanId) {
      const imgs = document.querySelectorAll("img");
      imgs.forEach(function (img) {
        const id = img.getAttribute("data-href");
        if (id === spanId) {
          img.setAttribute("src", dataUrl);
          img.setAttribute("alt", latexOut);
          img.setAttribute("href", "formula-" + Date.now());
        }
      });
    } else {
      // 2. 创建图片节点
      const imageNode = {
        type: "image",
        src: dataUrl,
        children: [{ text: "" }],
        alt: latexOut,
        href: "formula-" + Date.now(), // 这里存放的是id
      };
      editor.insertNode(imageNode);
    }
  };

  // 将 SVG 字符串转换为 base64 图片 URL
  const svgToDataUrl = (svgString: string) => {
    const encoded = encodeURIComponent(svgString)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    return `data:image/svg+xml,${encoded}`;
  };

  // 初始化 MathLatex SDK
  const initSDK = () => {
    if (typeof window.MathLatexSDK === "undefined") {
      setTimeout(initSDK, 100);
      return;
    }

    // 构建配置对象
    const config: {
      iframeSrc: string;
      appID?: string;
      secretKey?: string;
    } = {
      iframeSrc: SDK_CONFIG.iframeSrc,
    };

    // 如果有 appID 和 secretKey，则添加到配置中
    if (SDK_CONFIG.appID) {
      config.appID = SDK_CONFIG.appID;
    }
    if (SDK_CONFIG.secretKey) {
      config.secretKey = SDK_CONFIG.secretKey;
    }

    // 初始化 SDK - 使用统一的回调处理
    window.MathLatexSDK.init(config, handleCKEditorFormulaInsert);
    console.log("MathLatex SDK 初始化成功");
  };
  // 打开公式编辑器（Quill）
  const openCKEditorFormulaEditor = (element: any) => {
    // 确保 SDK 只初始化一次
    if (!isInitialized.current) {
      isInitialized.current = true;
      // 等待 SDK 加载完成
      initSDK();
    }

    if (element) {
      // 编辑模式
      window.MathLatexSDK.open({
        spanId: element.id,
        content: element.latex,
      });
    } else {
      // 新增模式
      setTimeout(() => {
        if (window.MathLatexSDK) {
          window.MathLatexSDK.open();
        } else {
          console.log("SDK 未加载完成，请稍后重试");
        }
      }, 0);
    }
  };
  // 目录点击
  const catalogClick = (event: any) => {
    if (event.target.tagName !== "DIV") return;
    event.preventDefault();
    const id = event.target.getAttribute("attr-id");
    editor?.scrollToElem(id); // 滚动到标题
  };

  // 利用href中的值区分图片还是公式
  const startsWithFormula = (str: string) => {
    return /^formula-/.test(str);
  };

  const handleCreated = (editor: any) => {
    const editorContainers = document.querySelectorAll(".w-e-image-container");
    editorContainers.forEach(function (editorContainer) {
      // 使用事件代理监听点击
      editorContainer?.addEventListener("click", (e) => {
        // 1. 检查点击的目标是否是图片
        const { tagName, alt, dataset }: any = e.target;
        if (tagName === "IMG" && startsWithFormula(dataset.href)) {
          openCKEditorFormulaEditor({
            id: dataset.href,
            latex: alt,
          });
        }
      });
    });
  };

  return (
    <div className="editor">
      <div className="editor-header">
        <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" />
        <div className="editor-header-btn">
          {/* <Button
            className="exercises"
            icon={<ZYIcon type="xiti" />}
            onClick={() => console.log("插入习题")}
          >
            插入习题
          </Button> */}
          <Button
            className="math"
            icon={<ZYIcon type="math" />}
            onClick={openCKEditorFormulaEditor}
          >
            插入公式
          </Button>
        </div>
      </div>
      <div className="editor-container">
        <div className={`editor-catalog ${treeOpen ? "open" : "close"}`}>
          <div className="editor-catalog-header">
            <ZYIcon
              style={{ fontSize: 18 }}
              onClick={() => setTreeOpen(!treeOpen)}
              type={treeOpen ? "menu-close" : "menu-open"}
            />
          </div>
          {treeOpen && (
            <div className="editor-catalog-list" onMouseDown={catalogClick}>
              {cataloagData}
            </div>
          )}
        </div>
        <div className="editor-ref" ref={editorRef}>

        <Editor
          mode="default"
          className="editor-content"
          defaultConfig={editorConfig}
          value={html}
          onCreated={setEditor}
          onChange={(editor) => {
            setHtml(editor.getHtml());
            const catalogData = editor
              .getElemsByTypePrefix("header")
              .map((header) => {
                const { id, type } = header;
                return (
                  <div key={id} attr-id={id} type={type}>
                    {SlateNode.string(header)}
                  </div>
                );
              });
            setCataloagData(catalogData);
            handleCreated(editor);
          }}
        />
        </div>
      </div>
    </div>
  );
};

export default MyEditor;
