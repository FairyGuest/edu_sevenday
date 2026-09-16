import { Pagination, Spin, Empty, Flex, Button, Alert } from "antd";
import QuestionCard from "../QuestionCard";
import "./index.less";
import { useSelector } from "umi";
import { useRight } from "../../hooks/useRight";

const ResultList = () => {
  // 从models获取数据
  const {
    questionList,
    questionLoading,
    questionError,
    pagination,
    checkedKnowledge,
    checkedChapter,
    activeTab
  } = useSelector((state: any) => state.resourceSearchModel);

  // 从hooks获取状态变更操作
  const { onPageChange, loadQuestionList } = useRight();

  // 试题库模式的渲染
  return (
      <Flex className="question-list-section" vertical gap={8}>
        <Flex className="result-info" justify="space-between" align="center">
          <span className="latest-button">最新</span>
          <span className="result-count">共计{pagination.total}题</span>
        </Flex>
        <Spin spinning={questionLoading}>
          {questionError ? <Alert type="error" showIcon message={questionError}
            action={<Button onClick={() => loadQuestionList(checkedKnowledge, checkedChapter, pagination.current)}>重试</Button>} /> : questionList.length > 0 ? (
            <>
              {questionList.map((item: any, index: number) => (
                <QuestionCard
                  key={item.id}
                  data={item}
                  index={index + 1}
                  onRefreshList={() =>
                    loadQuestionList(
                      checkedKnowledge,
                      checkedChapter,
                      pagination.current,
                    )
                  }
                  pageNum={pagination.current}
                  pageSize={pagination.pageSize}
                  actions={activeTab === 'personal' ? ['personalDelete'] : ['similar']}
                />
              ))}
              <div className="pagination-wrapper">
                <Pagination
                  className="custom-pagination"
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  pageSizeOptions={[10, 20, 50]}
                  total={pagination.total}
                  onChange={onPageChange}
                  showSizeChanger={true}
                  showQuickJumper
                />
              </div>
            </>
          ) : (
            <Empty
              description={
                  <p>
                    暂无符合当前筛选条件的资源
                    <br />
                    请调整后重试
                  </p>
              }
              image={require("@/assets/question_list_empty.png")}
              styles={{ image: { width: 64, height: 44, margin: "0 auto 8px" } }}
            />
          )}
        </Spin>
      </Flex>
  );
};

export default ResultList;
