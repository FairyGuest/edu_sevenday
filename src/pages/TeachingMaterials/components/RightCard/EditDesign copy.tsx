import { useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "@umijs/max";
import { Input, Popover, Image } from "antd";
import "./EditDesign.less";
import EditDesignDiv from "./EditDesignDiv";
import MarkdownRender from "@/components/MarkdownRender";
import { handlerHtmlText, hanlderMarkdownImgText, latexReplace } from "@/utils";

const { TextArea } = Input;
const App = (props: any) => {

  const {designModel}=props
  const {outline}=designModel;


  const [arr, setArr] = useState<any>([]);
  const [answerRowData, setAnswerRowData] = useState({});


  useEffect(() => {
    // console.log("answerRow", props?.answerRow);
    // dealWith();
    console.log("props?.answerRow", props?.answerRow);
    setAnswerRowData(props?.answerRow);
  }, []);


  

  //  li标签和P标签特殊处理
  const handlerTagImg = (newChild: any) => {
    const tagArr = []; // 其他标签处理
    const imgArr = []; // 图片特殊处理
    for (const pChild of newChild) {
      const { node, src, alt } = pChild["props"] || {};
      if (node && node.tagName == "img") {
        // 图片处理
        imgArr.push(renderImg({ src, alt }));
        continue;
      }
      tagArr.push(pChild);
    }
    return { tagArr, imgArr };
  };

  // 图片渲染
  const renderImg = (param: any) => {
    const { src, alt } = param;
    return <Image src={src} className="echart_img" alt={alt} />;
  };

  // Tooltip 文字提示
  const rendeTooltip = (sourceArr: any) => {
    return (
      <>
        {/* {citations &&
          sourceArr?.map((item: any, sIndex: any) => {
            const { page_content = "", index } = citations[item]; // 引用内容
            const text = (
              <div className="source_pop">{renderText(page_content)}</div>
            );
            return (
              <Popover content={text} key={sIndex}>
                <span className="source_item_num">{index}</span>
              </Popover>
            );
          })} */}
      </>
    );
  };

  const renderSource = (sParam: any, category: any) => {


    console.log("sParam", sParam, category);
    const { node, children } = sParam;
    if (!children || children.length == 0) {
      return null;
    }

    // 去掉html 标签
    const { newChild, sourceArr, endChar } = handlerHtmlText(children, "");
    if (category == "a") {
      return (
        <a {...sParam} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    if (category == "li") {
      const { tagArr, imgArr } = handlerTagImg(newChild);
      return (
        <>
          <li contentEditable={true} className="edit_design_div_box">
            {tagArr}
            {rendeTooltip(sourceArr)}
            {endChar}
          </li>
          {imgArr}
        </>
      );
    }

    if (category == "strong") {
      const { tagArr, imgArr } = handlerTagImg(newChild);
      return (
        <strong contentEditable={true} className="edit_design_div_box">
          {tagArr}
        </strong>
      );
    }

    if (
      category == "h1" ||
      category == "h2" ||
      category == "h3" ||
      category == "h4" ||
      category == "h5" ||
      category == "h6"
    ) {
      const { tagArr, imgArr } = handlerTagImg(newChild);
      switch (category) {
        case "h1":
          return (
            <h1
              contentEditable={true}
              className="edit_design_div_box"
              style={{ padding: "8px" }}
            >
              {newChild}
            </h1>
          );
        case "h2":
          return (
            <h2
              contentEditable={true}
              className="edit_design_div_box"
              style={{ padding: "8px" }}
            >
              {newChild}
            </h2>
          );
        case "h3":
          return (
            <h3
              contentEditable={true}
              className="edit_design_div_box"
              style={{ padding: "8px" }}
            >
              {newChild}
            </h3>
          );
        case "h4":
          return (
            <h4
              contentEditable={true}
              className="edit_design_div_box"
              style={{ padding: "8px" }}
            >
              {newChild}
            </h4>
          );
        case "h5":
          return (
            <h5
              contentEditable={true}
              className="edit_design_div_box"
              style={{ padding: "8px" }}
            >
              {tagArr}
            </h5>
          );

        default:
          return (
            <h6
              contentEditable={true}
              className="edit_design_div_box"
              style={{ padding: "8px" }}
            >
              {newChild}
            </h6>
          );
      }
    }

    // P 标签渲染
    const { tagArr, imgArr } = handlerTagImg(newChild);
    return (
      <>
        <p contentEditable={true} className="edit_design_div_box">
          {tagArr}
          {rendeTooltip(sourceArr)}
          {endChar}
        </p>
     
      </>
    );
  };

  const renderText = (text: string) => {
    // let result = latexReplace(text); // 公式处理
    return (
      <MarkdownRender
        components={{
          li: (param: any) => renderSource(param, "li"),
          p: (param: any) => renderSource(param, "p"),
          a: (param: any) => renderSource(param, "a"),
          strong: (param: any) => renderSource(param, "strong"),
          h1: (param: any) => renderSource(param, "h1"),
          h2: (param: any) => renderSource(param, "h2"),
          h3: (param: any) => renderSource(param, "h3"),
          h4: (param: any) => renderSource(param, "h4"),
          h5: (param: any) => renderSource(param, "h5"),
          h6: (param: any) => renderSource(param, "h6"),
          // img: (param: any) => renderImg(param),
        }}
      >
        {text}
      </MarkdownRender>
    );
  };

  return (
    <div className="text_area_box">
      {renderText(outline)}
    </div>
  );
};

export default connect((state: any) => ({
  designModel: state.designModel,
}))(App);
