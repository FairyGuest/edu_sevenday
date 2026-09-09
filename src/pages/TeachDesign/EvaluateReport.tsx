import { useEffect, useState } from "react";
import { connect, useDispatch, useLocation } from "@umijs/max";
import { Button, Dropdown } from "antd";
import MarkdownRenderToc from "@/components/MarkdownRender/showToc";
import { ZYIcon } from "@/components";

import "./EvaluateReport.less";

const EvaluateReport = (props: any) => {
  const { planParams } = props.teachDesginModel;
  const dispatch = useDispatch();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const planId = searchParams.get("id") || planParams?.id;
  const [isEmpty, setIsEmpty] = useState(true);
  const [evaluateContent, setEvaluateContent] = useState("");

  useEffect(() => {
    if (!planId) return;
    loadDetail();
  }, [planId]);
  // 获取详情数据
  const loadDetail = async () => {
    if (!planId) return;
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getPlanDetailUrl",
      payload: { id: planId },
    });
    if (code === 200) {
      setIsEmpty(false);
      setEvaluateContent(data?.evaluate_plan_content || "");
    }
  };
  // 下载评估报告
  const onDownloadClick = async (e: any) => {
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/postData",
      apiUrl: "postDownloadPaln",
      payload: {
        plan_id: planId,
        download_type: "evaluate",
        download_suffix: e.key,
      },
    });
    if (code === 200) {
      window.open(data?.file_url);
    }
  };

  return (
    <div className="evaluate-report">
      <div className="evaluate-report-header">
        <div style={{ display: "flex", alignItems: "center", fontWeight: 700 }}>
          <img
            className="logo-img"
            src={require("@/assets/logoLight.png")}
            alt=""
          />
          <div>教案评估</div>
        </div>
        <div>
          <Dropdown
            menu={{
              items: [
                // { key: "pdf", label: "下载为PDF" },
                { key: "docx", label: "下载为Word" },
              ],
              onClick: onDownloadClick,
            }}
          >
            <Button type="text" icon={<ZYIcon type="download" />}>
              下载
            </Button>
          </Dropdown>
        </div>
      </div>

      {!isEmpty && evaluateContent && (
        <div className="evaluate-report-content">
          <MarkdownRenderToc showToc>{evaluateContent}</MarkdownRenderToc>
        </div>
      )}
    </div>
  );
};

export default connect((state: any) => ({
  teachDesginModel: state.teachDesginModel,
}))(EvaluateReport);
