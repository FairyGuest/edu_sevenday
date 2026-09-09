import { useState, useEffect, useRef } from "react";
import { Steps } from "antd";
import { useSelector } from "@umijs/max";
import StepDrawer from "./StepDrawer";
import { ZYIcon } from "@/components";
import { LoadingOutlined } from "@ant-design/icons";

import "./index.less";

const AnswerStep = (props: any) => {
  const { content, scrollTopChat, setGuideInView, detailData } = props;
  const { book, course_standard, teach_guide } = content;

  const params = useSelector((state: any) => state.teachDesginModel.planParams);
  const [stepItem, setStepItem] = useState<any>([]); // 步骤条数据

  const arr = [
    {
      title: book?.head,
      type: "book",
      id: book?.doc_id,
      description: {
        title: book?.title,
        subTitle: book?.chapter_name,
      },
    },
    {
      title: course_standard?.head,
      type: "standard",
      id: course_standard?.doc_id,
      description: {
        title: "",
        subTitle: course_standard?.title,
      },
    },
    {
      title: teach_guide?.head,
      type: "guide",
      content: teach_guide?.content,
      description: {
        title: teach_guide?.comment,
        subTitle: teach_guide?.head,
      },
    },
  ];

  useEffect(() => {
    if (params?.id) {
      handleStep(arr);
      scrollTopChat?.()
      return;
    }

    handleStep([{ title: book?.head }]);
    setTimeout(() => {
      handleStep([arr[0], { title: course_standard?.head }]);
      scrollTopChat?.()
    }, 1000);
    setTimeout(() => {
      handleStep([arr[0], arr[1], { title: teach_guide?.head }]);
      scrollTopChat?.()
    }, 2000);
    setTimeout(() => {
      handleStep(arr);
      scrollTopChat?.()
    }, 3000);
  }, [book, params]);

  // 监听课标对齐
  function useIntersectionObserver(options = {}) {
    const [isInView, setIsInView] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
      const el = elementRef.current;
      if (!el) return;

      // 创建观察者
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          setIsInView(entry.isIntersecting); // 进入/离开可视区
        },
        {
          threshold: 0, // 露出多少触发（0=刚露出就触发）
          ...options
        }
      );

      observer.observe(el);
      return () => observer.unobserve(el); // 销毁
    }, [options]);

    return { elementRef, isInView };
  }

  const { elementRef, isInView } = useIntersectionObserver();

  useEffect(() => {
    setGuideInView(isInView)
  }, [isInView])


  // 处理步骤条数据
  const handleStep = (params: any[]) => {
    let arr = params.map((item: any) => {
      return {
        title: (
          <div className="answer-step-title">
            <ZYIcon type="zhuxuexueban" /> {item.title}
          </div>
        ),
        icon: item.description ? <ZYIcon type="check1" /> : <LoadingOutlined />,
        description: item.description ? (
          <div className="answer-step-description" ref={elementRef}>
            <span style={{fontSize:'16px'}}>{item.description?.title}</span>
            <StepDrawer item={item} detailData={detailData}/>
          </div>
        ) : null,
      };
    });

    setStepItem(arr);
  };

  return (
    <Steps className="answer-step" direction="vertical" items={stepItem} />
  );
};

export default AnswerStep;
