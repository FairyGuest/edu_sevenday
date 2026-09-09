import { Pagination, Spin, Empty, Flex, Button } from "antd";
import QuestionCard from "../QuestionCard";
import "./index.less";
import { useSelector } from "umi";
import { useRight } from "../../hooks/useRight";
import { useCallback } from "react";

const ResultList = () => {
  // 从models获取数据
  const {
    questionList,
    questionLoading,
    pagination,
    filters,
    checkedKnowledge,
    checkedChapter,
    activeTab
  } = useSelector((state: any) => state.resourceSearchModel);

  // 从hooks获取状态变更操作
  const { onPageChange, loadQuestionList } = useRight();

  // 判断是否所有筛选条件都是"全部"
  const isAllFiltersDefault = () => {
    const filterKeys = [
      "scenes",
      "questionTypes",
      "difficulties",
      "categories",
      "uses",
      "abilities",
      "years",
      "regions",
      "gradeSemesters",
    ];
    const allFiltersAreDefault = filterKeys.every(
      (key) => filters[key].length === 1 && filters[key][0] === "all",
    );
    const noSearchText =
      !filters.searchText || filters.searchText.trim() === "";
    const noKnowledgeSelected = checkedKnowledge.length === 0;
    const noChapterSelected = checkedChapter.length === 0;

    return (
      allFiltersAreDefault &&
      noSearchText &&
      noKnowledgeSelected &&
      noChapterSelected
    );
  };

  // 试题库模式的渲染
  const renderQuestionList = useCallback(
    () => (
      <Flex className="question-list-section" vertical gap={8}>
        <Flex className="result-info" justify="space-between" align="center">
          <span className="latest-button">最新</span>
          <span className="result-count">共计{pagination.total}题</span>
        </Flex>
        <Spin spinning={questionLoading}>
          {questionList.length > 0 ? (
            <>
              {questionList.map((item: any, index: number) => (
                <QuestionCard
                  key={item.id}
                  data={item}
                  index={index + 1}
                  onRefreshList={() =>
                    loadQuestionList(
                      checkedChapter,
                      checkedKnowledge,
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
                isAllFiltersDefault() ? (
                  <p>
                    暂无符合当前筛选条件的资源
                    <br />
                    请调整后重试
                  </p>
                ) : (
                  <p>
                    暂无符合当前筛选条件的资源
                    <br />
                    请调整后重试
                  </p>
                )
              }
              image={require("@/assets/question_list_empty.png")}
              styles={{ image: { width: 64, height: 44, margin: "0 auto 8px" } }}
            />
          )}
        </Spin>
      </Flex>
    ),
    [questionList, questionLoading],
  );

  return renderQuestionList()
};

export default ResultList;
