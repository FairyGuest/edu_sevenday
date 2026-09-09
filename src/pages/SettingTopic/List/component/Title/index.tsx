import { Button } from "antd";
import { history } from "umi";
import "./index.less";

const Title = () => (
  <div className="setting_topic_title_box">
    <div className="setting_topic_title_left">
      <span className="setting_topic_title_left_text">组卷记录</span>
    </div>
    <div className="setting_topic_title_right">
      <Button
        type="primary"
        onClick={() => {
          history.push("/setTopic/homework?homeworkType=publish");
        }}
      >
        作业组卷
      </Button>
    </div>
  </div>
);

export default Title;
