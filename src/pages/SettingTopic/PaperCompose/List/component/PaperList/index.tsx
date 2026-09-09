import { Button, Divider, Space } from "antd";
import { history } from "umi";
import { ZYIcon } from "@/components";
import "@/pages/SettingTopic/List/component/List/index.less";

interface PaperListProps {
  paperList?: any[];
  courseId?: string | number;
  refreshListFn?: () => void;
}

const DIFFICULTY_MAP: Record<number, string> = {
  1: "容易",
  2: "较易",
  3: "适中",
  4: "较难",
  5: "困难",
};

const PaperList = ({ paperList = [], courseId }: PaperListProps) => {
  const goQuestions = (item: any, type: "look" | "edit") => {
    const paperId = item?.id;
    if (!paperId) return;
    history.push(
      `/paperCompose/questions?id=${paperId}&paperId=${paperId}&homeworkType=${type}&setType=paper&status=${type === "edit" ? "editable" : "noEditable"}`,
    );
  };

  if (!paperList.length) {
    return (
      <div className="setting_topic_list_box">
        <div className="setting_topic_list_box_empty">
          <ZYIcon type="kongshuju7" />
          <p className="text">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="setting_topic_list_box">
      {paperList.map((item: any, index: number) => {
        const createTime = item?.createTime ?? item?.created_at ?? "-";
        const difficulty =
          DIFFICULTY_MAP[Number(item?.difficulty)] || item?.difficulty || "-";
        return (
          <div className="setting_topic_list_row" key={item?.id ?? index}>
            <div className="setting_topic_list_row_top_box">
              <div className="setting_topic_list_row_top_box_left">
                <div
                  className="setting_topic_list_row_top_box_left_title"
                  onClick={() => goQuestions(item, "look")}
                >
                  {item?.name || "-"}
                </div>
              </div>
              <div className="setting_topic_list_row_top_box_right">
                <Space size={10}>
                  <Button
                    className="setting_topic_list_row_top_box_right_btn"
                    onClick={() => goQuestions(item, "look")}
                  >
                    详情
                  </Button>
                  <Button
                    className="setting_topic_list_row_top_box_right_btn"
                    onClick={() => goQuestions(item, "edit")}
                  >
                    编辑
                  </Button>
                </Space>
              </div>
            </div>
            <div className="setting_topic_list_row_bottom_box_css">
              <div className="setting_topic_list_row_bottom_box">
                <span className="setting_topic_list_row_bottom_box_time_css">
                  <span className="setting_topic_list_row_bottom_box_time">
                    创建：{createTime}
                  </span>
                  {/* <Divider type="vertical" style={{ margin: "4px 0 0 0" }} />
                  <span className="setting_topic_list_row_bottom_box_time">
                    题量：{item?.questionCount ?? "-"}
                  </span> */}
                  {/* <Divider type="vertical" style={{ margin: "4px 0 0 0" }} />
                  <span className="setting_topic_list_row_bottom_box_time">
                    总分：{item?.totalScore ?? "-"}
                  </span> */}
                  {/* <Divider type="vertical" style={{ margin: "4px 0 0 0" }} />
                  <span className="setting_topic_list_row_bottom_box_time">
                    难度：{difficulty}
                  </span> */}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaperList;
