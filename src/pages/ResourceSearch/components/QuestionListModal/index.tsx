import { Modal, Flex, Empty, Spin } from "antd";
import QuestionCard from "../QuestionCard";
import "./index.less";

interface QuestionListModalProps {
  visible: boolean;
  onCancel: () => void;
  title: string;
  questionList: any[];
  loading?: boolean;
}

const QuestionListModal = ({
  visible,
  onCancel,
  title,
  questionList,
  loading = false,
}: QuestionListModalProps) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      className="question-list-modal"
      destroyOnHidden
      centered
    >
      <Flex className="modal-question-list" vertical>
        {questionList.length > 0 ? (
          questionList.map((item: any, index: number) => (
            <QuestionCard
              key={item.id}
              data={item}
              index={index + 1}
              actions={[]}
            />
          ))
        ) : loading ? (
          <div className="loading-container"><Spin /></div>
        ) : (
          <Empty
            description="很抱歉没能为您找到合适的试题我们会尽快补充～"
            className="empty-container"
            image={require("@/assets/question_list_empty.png")}
            styles={{ image: { width: 64, height: 44, margin: "0 auto 8px" } }}
          />
        )}
      </Flex>
    </Modal>
  );
};

export default QuestionListModal;
