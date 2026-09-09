import { useRef, useState, useEffect } from "react";
import { connect, history, useDispatch } from "umi";
import { Button, Empty, Skeleton, Tour } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CourseModal from "./components/CourseModal";
import CourseCard from "./components/CourseCard";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { addTracking, addNewTracking, getUserInfo, getOrgId } from "@/utils";
import homeEmptyImg from "@/assets/homeEmptyImg.png";
import CourseCardModal from "./components/CourseCardModal";
import { useSiderTour } from "@/components/useSiderTour";
import { useTeacherContext } from '@/components/LayoutSider';
import "./index.less";

const Course = () => {
  const dispatch = useDispatch();
  const [parent] = useAutoAnimate();
  const courseModalRef = useRef<{ openModal: () => void }>();
  const courseCardModalRef = useRef<{ openModal: () => void }>();
  const [activeTag, setActiveTag] = useState("全部"); // 默认标签
  const [tags, setTags] = useState<any[]>([]); // 标签列表

  const [courseData, setCourseData] = useState<any[]>([]); // 课程列表
  const [loading, setLoading] = useState(true); // 加载中
  const [hasMore, setHasMore] = useState(true); // 是否还有更多数据
  const [isShowEnd, setIsShowEnd] = useState(false); // 是否显示到底了
  const [context, contextLoading, setContext] = useTeacherContext()

  const {
    tourOpen,
    getTourhome,
    oncloseTour
  } = useSiderTour();
  const local = localStorage.getItem("userInfo") || "{}";
  const shopInfo = JSON.parse(local);
  const [requestParams, setRequestParams] = useState({
    page: 1,
    page_size: 50,
    tag: void 0, // 标签
    keyword: void 0, // 关键字
    org_id: getOrgId(),
  }); // 请求参数

  useEffect(() => {
    getCourseData();
    getTagsList();
    addTracking({ page_name: "我的课程" }); // 数据埋点
    addNewTracking({
      bt: 'pv',
      ct: 'course_manage_show'
    })
  }, []);

  // 监听滚动事件
  useEffect(() => {
    const container = document.querySelector("#home_container");
    if (!container) return;
    if (container.scrollHeight > container.clientHeight) {
      setIsShowEnd(true);
    } else {
      setIsShowEnd(false);
    }
  }, [courseData]);

  // 获取课程列表
  const getCourseData = async (params: any = {}) => {
    const payload = { ...requestParams, ...params };
    if (payload.page === 1) {
      setLoading(true);
    }
    const { code, data }: any = await dispatch({
      type: "courseModel/getData",
      apiUrl: "userCourseListUrl",
      mLoading: "getCourseLoading",
      payload,
    });
    setLoading(false);
    if (code !== 200) return;
    const newList =
      payload.page === 1 ? data?.list : [...courseData, ...data?.list];
    setCourseData(newList);
    // 当前没有数据了 或者 当前总的条数和total一样了
    if (newList.length === 0 || newList.length >= data?.total) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  };
  // 获取标签
  const getTagsList = async () => {
    const { code, data }: any = await dispatch({
      type: "courseModel/getData",
      apiUrl: "courseTagsUrl",
      payload: {
        page: 1,
        pageSize: 20,
      },
    });
    if (code === 200) {
      if (!data?.length) {
        setTags([]);
        return;
      }
      const tags = data?.map((item: any) => {
        return {
          label: item,
          value: item,
        };
      });
      tags.unshift({ label: "全部", value: "全部" });
      setTags(tags);
    }
  };
  // 下一页
  const fetchNextPage = () => {
    const page = Math.floor(courseData.length / requestParams.page_size) + 1;
    getCourseData({ page: page });
    setRequestParams((pre) => ({ ...pre, page: page }));
  };
  // 标签点击
  const onClickTag = (tag: any) => {
    const newParams = {
      ...requestParams,
      page: 1,
      tag: tag?.value === "全部" ? undefined : tag.value,
    };
    setActiveTag(tag?.label);
    getCourseData(newParams);
    setRequestParams(newParams);
  };
  // 刷新页面
  const refreshPage = () => {
    getCourseData();
    getTagsList();
  };

  const createCourseCallback = (courseData: any) => {
    if (!context?.course_id) {
      setContext({ courseId: courseData?.id })
    }
    addNewTracking({
      bt: 'cl',
      ct: 'course_manage_create_confirm_click'
    })
    refreshPage()
  }

  // 生成骨架屏列表
  const renderSkeletons = () => {
    return (
      <div className="ant_skeleton_box">
        {Array.from({ length: 20 }).map((_, index) => (
          <Skeleton.Node key={`skeleton-${index}`} active />
        ))}
      </div>
    );
  };

  const courseEmpty = () => {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Empty
          image={homeEmptyImg}
          styles={{
            image: {
              width: "493px",
              height: "329px",
              margin: "0 auto 12px",
            },
          }}
          description={
            <span
              style={{
                color: "#646E8B",
                fontSize: 16,
                textAlign: "left",
                display: "inline-block",
              }}
            >
              <div className="course_empty_box">
                <p className="course_empty_box_greetings">
                  老师您好，欢迎您体验智启教育平台！
                </p>
                <p className="course_empty_box_tips">
                  请点击下方“创建课程”按钮，选择您所执教的学科和学阶，平台为您准备了丰富的课程资料
                </p>
                <Button
                  id="create_course_btn"
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    courseCardModalRef.current?.openModal();
                  }}
                  className="course_empty_box_btn"
                >
                  创建课程
                </Button>
              </div>
            </span>
          }
        />
      </div>
    );
  };

  return (
    <div className={"home_container"} id="home_container">
      {loading && renderSkeletons()}
      {!loading && courseData?.length > 0 && (
        <div ref={parent} className="course_wrapper">
          <div className="course_header">
            <div className="course_title">
              <span>课程管理</span>
              {getUserInfo("member_type") === 1 && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    addNewTracking({
                      bt: 'cl',
                      ct: 'course_manage_create_click'
                    })
                    addNewTracking({
                      bt: 'pv',
                      ct: 'course_manage_create_drawer_show'
                    })
                    courseModalRef.current?.openModal()
                  }
                  }
                  className="create_course_btn"
                >
                  创建课程
                </Button>
              )}
            </div>

            <div className="course_filter">
              {tags.map((item) => (
                <div
                  className={`filter_item ${activeTag === item.label ? "active" : ""}`}
                  key={item.label}
                  onClick={() => onClickTag(item)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <InfiniteScroll
            dataLength={courseData.length}
            next={fetchNextPage}
            hasMore={hasMore}
            loader={
              isShowEnd && (
                <div
                  style={{
                    textAlign: "center",
                    width: "100%",
                    fontSize: 12,
                    color: "#999",
                  }}
                ></div>
              )
            }
            scrollableTarget="home_container"
          >
            <div className="course_ul">
              {courseData.map((item) => (
                <CourseCard
                  key={item.id}
                  data={item}
                  onClick={() => {
                    history.push(
                      `/teach/course/detail?courseId=${item?.id}&type=class`,
                    );
                  }}
                  onFinish={refreshPage}
                />
              ))}
            </div>
          </InfiniteScroll>
          <CourseModal onRef={courseModalRef} onFinish={refreshPage} />
        </div>
      )}
      {/* 无数据展示 */}
      {!loading && courseData?.length == 0 && courseEmpty()}
      <CourseCardModal onRef={courseCardModalRef} onFinish={createCourseCallback} />
      {
        !loading && shopInfo?.guide_step == 1 && <Tour
          open={tourOpen} // 控制是否显示Tour组件
          onClose={oncloseTour}
          steps={getTourhome()} // 动态获取步骤
          placement="left"
          gap={{ offset: [6, 7], radius: 8 }}
          disabledInteraction={true}
          mask={true}
        />
      }
    </div>
  );
};

export default connect((state: any) => ({
  courseModel: state.courseModel,
}))(Course);
