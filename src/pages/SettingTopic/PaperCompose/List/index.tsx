import { Pagination, Skeleton, Space } from "antd";
import Title from "./component/Title";
import Search from "./component/Search";
import PaperList from "./component/PaperList";
import { usePaperList } from "./hooks";
import "@/pages/SettingTopic/List/index.less";

const SKELETON_COUNT = 5;

const PaperComposeList = () => {
  const {
    paperList,
    loading,
    courseId,
    pageIndex,
    pageSize,
    total,
    getPayloadFn,
    refreshList,
    onPageChange,
  } = usePaperList();

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
        {!loading && (
          <PaperList paperList={paperList} courseId={courseId} refreshListFn={refreshList} />
        )}
        {loading && skeletonComponents()}
      </div>
      {paperList?.length > 0 && !loading && (
        <div className="setting_topic_box_pagination_box">
          <div />
          <Pagination
            showSizeChanger
            total={total}
            defaultPageSize={pageSize}
            defaultCurrent={pageIndex}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default PaperComposeList;
