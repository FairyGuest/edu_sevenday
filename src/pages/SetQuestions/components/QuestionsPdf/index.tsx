import React, { useEffect, useState, useRef } from "react";
import {fileViewUrl, preViewUrl} from "@/utils/host";
import { connect, useDispatch } from "umi";


import "./index.less";



const App = (props: any) => {
  // 从props中解构出pdfcontentwidth, fullScreenFlag, flagRow, controlBtnFn, docId
  const { pdfcontentwidth, fullScreenFlag, flagRow, controlBtnFn, docId,page } =
    props;

  // 创建一个ref对象，用于获取img元素的引用
  const imgRef = useRef<HTMLDivElement>(null);
  // 创建一个dispatch对象，用于发送action
  const dispatch = useDispatch();
  // 创建一个state对象，用于保存当前索引
  const [currentIndex, setCurrentIndex] = useState(0);
  // 创建一个state对象，用于保存滑动标志
  const [slideFlag, setSlideFlag] = useState(false);
  // 创建一个state对象，用于保存pdf数组
  const [arrPdf, setArrPdf] = useState<any>([]);

  // 当docId发生变化时，调用getArrPdfFn函数
  useEffect(() => {
    if (docId) getArrPdfFn();
  }, [docId]);

  // 获取pdf数组
  const getArrPdfFn = async () => {
    let { code, data } = (await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "getDocAnalyzeInfo",
      payload: {
        id: docId,
      },
    }) as unknown) as { code: number; data: string };

    if (code === 200) {
      // 获取文件url和预览url
      const file_url: string = `${fileViewUrl}${data}`;
      const view_url: string = preViewUrl + "/preview/onlinePreview?url=" + encodeURIComponent(btoa((encodeURIComponent(file_url))));
      // 设置pdf数组
      setArrPdf(view_url);
    }
  };

  // 当pdfcontentwidth发生变化时，判断img元素的高度是否大于等于窗口高度减去120
  useEffect(() => {
    if (
      imgRef?.current && imgRef.current.getBoundingClientRect()?.height >=
      window?.innerHeight - 120
    ) {
      setSlideFlag(true);
    } else {
      setSlideFlag(false);
    }
  }, [pdfcontentwidth]);

  // 添加窗口大小改变事件监听，当窗口大小改变时，判断img元素的高度是否大于等于窗口高度减去120
  useEffect(() => {
    const handleResize = () => {
      if (
        imgRef?.current && imgRef.current.getBoundingClientRect()?.height >=
        window?.innerHeight - 120
      ) {
        setSlideFlag(true);
      } else {
        setSlideFlag(false);
      }
    };

    // 添加事件监听
    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // 空依赖数组表示只在组件挂载和卸载时执行

  return (
    <>
      {/* <KegHeader {...props} title="资料详情" defaultValue={"chat"} /> */}
      <div
        className={`carousel-css-box  ${slideFlag ? "" : "carousel-scroll"}`}
      >
        <iframe title="嵌入的网页"
          src={arrPdf}
          width={"100%"}
          height={"100%"}
          frameBorder="0" // 设置iframe的边框为0
          loading="eager"
          // 设置页数
        >
        </iframe>
      </div>
    </>
  );
};

// 将state中的setQuestionsModel映射到props中
export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
}))(App);
