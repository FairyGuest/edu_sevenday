import { Pagination, Skeleton, Space } from "antd";
import Title from "./component/Title";
import Search from "./component/Search";
import List from "./component/List";
import { SKELETON_COUNT } from "./constants";
import { useExamList } from "./hooks";
import "./index.less";

const ExamListPage = () => {
  const {
    examsList,
    loading,
    pageIndex,
    pageSize,
    total,
    getPayloadFn,
    refreshList,
    onPageChange,
  } = useExamList();

  const skeletonComponents = () =>
    Array.from({ length: SKELETON_COUNT }).map((_, index) => (
      <Space key={index} direction="vertical" size={20} style={{ width: "100%" }}>
        <Skeleton active />
      </Space>
    ));

  return (
    <div className="setting_topic_box">
      <div className="setting_topic_title_box_css">
        <Title />
      </div>
      <div className="setting_topic_search_box_css">
        <Search payloadFn={getPayloadFn} />
      </div>
      <div className="setting_topic_list_box_css">
        {!loading && <List examsList={examsList} refreshListFn={refreshList} />}
        {loading && skeletonComponents()}
      </div>
      {examsList.length > 0 && !loading && (
        <div className="setting_topic_box_pagination_box">
          <div />
          <Pagination
            showSizeChanger
            total={total}
            current={pageIndex}
            pageSize={pageSize}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ExamListPage;
