import { useEffect, useState } from "react";
import { connect, history, useDispatch } from "umi";
import { Empty, Skeleton, Tooltip } from "antd";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { getOrgId, getUserInfo } from "@/utils";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";

import "./index.less";

const Card = (props: any) => {
  const { id } = props;
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false); // 加载状态
  const [levelList, setLevelList] = useState([]); // 适用水平列表
  const [activeLevel, setActiveLevel] = useState("all"); // 适用水平--默认选中
  const [dataList, setDataList] = useState([]); // 数据列表
  const [hasMore, setHasMore] = useState(true); // 是否还有更多数据
  const [page, setPage] = useState(1) // 页码请求参数

  useEffect(() => {
    getLevelList();
    getDataList();
  }, [id]);

  // 获取适用水平列表
  const getLevelList = async () => {
    const { code, data = [] }: any = await dispatch({
      type: "digitalCourseModel/getData",
      apiUrl: "getLevelListUrl",
      payload: {},
    });
    if (code == 200) {
      if (!data.length) {
        setLevelList([]);
        setDataList([]);
        return;
      }

      data.unshift({ id: "all", name: "全部" });
      setActiveLevel("all");
      setLevelList(data);
    }
  }

  // 获取数据列表
  const getDataList = async (param?: any) => {
    setLoading(true);
    const label = param?.level || activeLevel;
    const payload = {
      page: param?.page || page,
      page_size: 48,
      my_collect: Number(id),
      major: label === "all" ? void 0 : label,
      org_id: getOrgId(),
    };
    const { code, data }: any = await dispatch({
      type: "digitalCourseModel/getData",
      apiUrl: "getCourseListUrl",
      payload,
    });
    if (code == 200) {
      const newList = payload.page === 1 ? data?.list : [...dataList, ...data?.list];
      setDataList(newList);
      // 当前没有数据了 或者 当前总的条数和total一样了
      if (newList.length === 0 || newList.length >= data?.total) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    }
    setLoading(false);
  };

  // 适用水平点击事件
  const onLevelClick = (level: any) => {
    setActiveLevel(level);
    setPage(1);
    getDataList({ level, page: 1 });
  };

  // 收藏/取消收藏
  const handleCollect = async (e: any, data: any) => {
    e.stopPropagation();
    const { code }: any = await dispatch({
      type: "digitalCourseModel/postData",
      apiUrl: "courseCollectUrl",
      payload: { ...data },
    });
    if (code == 200) {
      getDataList();
    }
  };

  // 点击事件
  const onClick = (data: any) => {
    if (data?.is_public === 0) return;
    history.push(`/source/share/detail?courseId=${data?.id}`);
  };

  // 生成骨架屏列表
  const renderSkeletons = () => {
    return Array.from({ length: 20 }).map((_, index) => (
      <Skeleton.Node key={`skeleton-${index}`} active />
    ));
  };

  const fetchNextPage = () => {
    setPage((pre) => pre + 1)
    getDataList({page: page + 1})
  };

  return (
    <div className="card-source">
      <div className="card-source-header">
        <div className="text">适用水平</div>
        <div className="card-source-filter">
          {levelList.map((item: any) => {
            return (
              <div
                className={`filter_item ${item.id === activeLevel ? "active" : ""}`}
                key={item.id}
                onClick={() => onLevelClick(item.id)}
              >
                {item?.name}
              </div>
            );
          })}
        </div>
      </div>
      <div className="card-source-list" id="card-source-list">
        {loading ? (
          renderSkeletons()
        ) : dataList.length > 0 ? (
          <>
            <InfiniteScroll
              dataLength={dataList.length}
              next={fetchNextPage}
              hasMore={hasMore}
              loader={null}
              scrollableTarget="card-source-list"
            >
              <div className="card-source-list-content">
                {dataList.map((data: any) => {
                  return (
                    <Tooltip title={data?.is_public === 0 ? "课程已设置成私密状态，不可查看" : ""} key={data?.id}>
                      <div
                        key={data?.id}
                        className={`${data?.is_public === 0 ? "card-disabled" : ""} course-card`}
                        onClick={() => onClick(data)}
                        style={{
                          background: "border-box",
                          backgroundImage: `url(${require(`@/assets/${data?.icon || "coursebg0.png"}`)})`,
                          backgroundSize: "contain",
                        }}
                      >
                        <div className="content">
                          <div className="course-title">{data.title}</div>
                          <div className="course-info">
                            {/* <Avatar
                              icon={<UserOutlined />}
                              style={{ width: 18, height: 18 }}
                              src={formatStaticUrl(data?.created_by_avatar)}
                            /> */}
                            <span className="course-info-text" title={data?.created_by_name}>{data?.created_by_name}</span>
                            <div className="divider" />
                            <span className="course-info-text" title={data?.stage_name}>{data?.stage_name}</span>
                            <div className="divider" />
                            <span className="course-info-text" title={data?.categories}>{data?.categories}</span>
                          </div>
                          {data?.version_info && <div className="course-version">{data?.version_info}</div>}
                        </div>

                        <div className="footer">
                          <div className="footer-desc">
                            文件&nbsp;{data?.material_count}
                            <div className="divider" />
                            {dayjs(data?.updated_time).format("YYYY-MM-DD")}更新
                          </div>
                          {data?.created_by !== getUserInfo("id") && (
                            <div className="footer-action">
                              {data?.is_collect ? (
                                <Tooltip title="点击取消收藏">
                                  <div onClick={(e) => handleCollect(e, {course_id: data?.id, is_collect: 0})}>
                                    <StarFilled style={{ color: "#FFAA00" }} />
                                    <span style={{ marginLeft: "4px" }}>已收藏</span>
                                  </div >
                                </Tooltip>
                              ) : (
                                <Tooltip title="点击收藏">
                                  <StarOutlined onClick={(e) => handleCollect(e, {course_id: data?.id, is_collect: 1})} />
                                </Tooltip>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </InfiniteScroll>
          </>
        ) : (
          <div className="empty-state">
            <Empty
              description="暂无资源"
              image={require("@/assets/courseEmpty.png")}
              styles={{
                image: {
                  width: 80,
                  height: 48,
                  margin: "0 auto 10px",
                },
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default connect((state: any) => ({
  digitalCourseModel: state.digitalCourseModel,
}))(Card);
