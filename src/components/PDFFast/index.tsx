import { message } from "antd";
import { useImperativeHandle, useState } from "react";
import { CopyOutlined } from "@ant-design/icons";
import { formatStaticUrl } from "@/utils";
import "./index.less";



const pWidth = 674;

const PDFFast = (props: any) => {


  const { list, onRef } = props;
  const [isEdit, setIsEdit] = useState<any>(false);

  // 父掉子函数
  useImperativeHandle(onRef, () => ({
    setEditStatus: (status: any) => {
      setIsEdit(status)
    }
  }));


  const copyParagraphText = async (event: any, lines: any[]) => {
    event.stopPropagation()
    try {
      const text = lines.map((line) => line.text).join("\n");

      // 优先使用 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        message.success("复制成功");
        return;
      }

      // 降级方案：使用 document.execCommand
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand("copy");
        message.success("复制成功");
      } catch (err) {
        message.error("复制失败，请手动复制");
        console.error("Copy failed:", err);
      } finally {
        document.body.removeChild(textarea);
      }
    } catch (err) {
      message.error("复制失败，请手动复制");
      console.error("Copy failed:", err);
    }
  };



  const mergeLines = (pageWidth: any, lines: any) => {

    let x0 = Math.min(
      ...lines.map((line: any) => line.position.x0)
    );
    let y0 = Math.min(
      ...lines.map((line: any) => line.position.y0)
    );
    let x1 = Math.max(
      ...lines.map((line: any) => line.position.x1)
    );
    let y1 = Math.max(
      ...lines.map((line: any) => line.position.y1)
    );
    const baseWidth = pWidth
    const ratio = pageWidth / baseWidth // 缩放比例
    x0 = x0 / ratio
    y0 = y0 / ratio
    x1 = x1 / ratio
    y1 = y1 / ratio

    return {
      left: x0,
      top: y0,
      width: x1 - x0,
      height: y1 - y0,
    }
  }


  const mergeText = (lines: any) => {
    const textArr = lines.map((item: any) => item.text) || []
    return textArr?.join("\n")
  }


  return (
    <>

      <div className="pdf_fast_parse_container" style={{ width: `${isEdit ? '1200px' : '100%'}` }}>
        <div className="left_privew_container" style={{ width: pWidth }}>
          {list?.map?.((param: any, index: any) => {
            const { paragraphs } = param
            return (
              <div key={`pre-${index}`} className="relative">
                <img
                  src={formatStaticUrl(`/static/${param?.page_image}`)}
                  className="page_img"
                  style={{ width: pWidth }}
                />

                {paragraphs?.map((paragraph: any, pIndex: any) => {
                  const { lines } = paragraph;
                  return (
                    <div
                      key={`p-${pIndex}`}
                      className="paragraph-block"
                      style={mergeLines(595.32, lines)}
                    >
                      <CopyOutlined className="copy_icon" onClick={(event) => copyParagraphText(event, lines)} />
                    </div>
                  );
                })}
              </div>
            )
          })}
        </div>

        {isEdit &&
          <div className="right_edit_container">
            {list?.map?.((param: any, index: any) => {
              const { paragraphs } = param
              return <div key={index}>
                {paragraphs?.map((paragraph: any, pIndex: any) => {
                  const { lines } = paragraph;

                  return <div className="text_cart" contentEditable key={pIndex}>{mergeText(lines)}</div>
                })}
              </div>
            })}
          </div>
        }

      </div>

    </>
  );
};

export default PDFFast;
