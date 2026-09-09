import { useState, useEffect, useRef, useImperativeHandle } from "react";
import { useDispatch, useSelector, history, connect } from "@umijs/max";
import { Button, Modal, Popover, Tooltip, Divider } from "antd";
import ZYIcon from "@/components/ZYIcon";
import { scrollTop } from "@/utils";

import "./Guidance.less";

const { confirm } = Modal;
const Guidance = (props: any) => {
  const { leftWidth, finalizeFn, setInputValue, step } = props;
  const { planSseLoading, childPlanLoading, planParams } = useSelector(
    (state: any) => state.teachDesginModel,
  );

  const dispatch = useDispatch();
  const scrollRef = useRef<any>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [promptTempList, setPromptTempList] = useState<any>([]); // 提示词模板

  useEffect(() => {
    if (scrollRef?.current?.scrollWidth > leftWidth) {
      setCanScrollRight(true);
    }
  }, [leftWidth]);

  useEffect(() => {
    // 生成流程中（无论是否已有教案id）都提供快捷指令，便于自然语言修改
    if (!planParams) return
    getPromptTempList();
  }, [planParams]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      checkScroll();
      window.addEventListener("resize", checkScroll);
      return () => window.removeEventListener("resize", checkScroll);
    }
  }, [promptTempList]);

  const handleScroll = (direction: string) => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 1;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const checkScroll = () => {
    const container = scrollRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollWidth > container.clientWidth &&
      Math.ceil(container.scrollLeft + container.clientWidth) <
      container.scrollWidth,
    );
  };

  const getPromptTempList = async () => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postPromptTemplateUrl",
      payload: {
        subject: planParams.subject,
        // type=1: 课时 2: 单元
        type: 1,
      },
    });
    if (code === 200) {
      setPromptTempList(data || []);
    }
  };

  // tooltip 提示
  const tooltipFun = (params: Array<any>) =>
    params.map((item: any) => (
      <div key={item.title} className="prompt-item" onClick={() => setInputValue(item?.promptText)}>
        <ZYIcon className="prompt-icon" type="tishi1" />
        <div className="content">{item?.promptText}</div>
      </div>
    ));

  return (
    <div className="guidance-box-css">
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={`guidance-box ${canScrollLeft || canScrollRight ? " guidance-list-scroll" : ""}`}
      >
        {canScrollLeft && (
          <div className="left">
            <Button
              size="small"
              type="link"
              style={{ background: '#FCFCFF' }}
              icon={<ZYIcon type="zuo" />}
              onClick={() => handleScroll("left")}
            />
          </div>
        )}

        <Tooltip title="系统整合全部建议与修改内容，生成完整定稿版教学设计">
          <Button color="primary" className="icon_box_create" icon={<ZYIcon type="dinggao" />} disabled={planSseLoading} onClick={finalizeFn}>生成定稿</Button>
        </Tooltip>
        <div className="divider"></div>
        {promptTempList?.map((item: any, index: number) => (
          <Tooltip
            key={index}
            color="#fff"
            placement="top"
            title={tooltipFun(item?.templates)}
            classNames={{ root: "guidance-tooltip" }}
          >
            <Button color="primary" className="guidance-temp-btn">
              {item.categoryName}
            </Button>
          </Tooltip>
        ))}
        {canScrollRight && (
          <div className="right">
            <Button
              size="small"
              type="link"
              style={{ background: '#FCFCFF' }}
              icon={<ZYIcon type="you" />}
              onClick={() => handleScroll("right")}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default connect((state: any) => ({
  teachDesginModel: state.teachDesginModel,
}))(Guidance);
