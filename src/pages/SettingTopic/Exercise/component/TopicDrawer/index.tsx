import { Drawer, Space, Skeleton } from "antd";
import QuestionType from "@/components/QuestionType";
import { useTopicDrawer } from "../../hooks";
import "./index.less";

interface TopicDrawerProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  subQuestionData: any;
}

const TopicDrawer = ({ visible, setVisible, subQuestionData }: TopicDrawerProps) => {
  const { questionList, loading, showDetailsFn, container } = useTopicDrawer(
    visible,
    subQuestionData,
  );
console.log('questionList', questionList);
  if (!visible) return null;

  return (
    <Drawer
      title="题目预览"
      placement="right"
      width={800}
      className="topic-drawer"
      closable={{ placement: "end" }}
      open={visible}
      onClose={() => setVisible(false)}
      getContainer={() => container}
      rootStyle={{ position: "absolute" }}
    >
      <div className="topic-drawer-box">
        {!loading && questionList?.length > 0 && (
          <div className="modal-content-css">
            <div className="modal-content-list">
              {questionList?.map((item: any, index: number) => (
                <div
                  className="modal-content-list-box"
                  key={index + item?.id}
                  onClick={(e) => showDetailsFn(e, item)}
                >
                  <QuestionType
                    key={item?.id}
                    uploadType=""
                    row={item}
                    items={[{ ...subQuestionData }]}
                    rowKey={index}
                    replaceQuestionFn={() => {}}
                    addQuestionFn={() => {}}
                    cancelQuestionFn={() => {}}
                    showAnswer={!item?.showDetails}
                    showSource={false}
                    setType="uploadTopic"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {loading && (
          <div className="modal-skeleton">
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              <Space direction="vertical" size={20} style={{ width: "100%" }}>
                <Skeleton active />
                <Skeleton.Node active style={{ width: 745 }} />
              </Space>
            </Space>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default TopicDrawer;
