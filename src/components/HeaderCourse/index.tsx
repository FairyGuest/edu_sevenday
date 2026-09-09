import { useState, useEffect, useRef } from "react";
import { connect, history, useDispatch, useLocation } from "umi";
import { Button, Select, Segmented, message } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { getUserInfo, getOrgId } from "@/utils";
import { useTeacherContext } from '@/components/LayoutSider'
import ZYIcon from "../ZYIcon";
import './index.less'
const Header = (props: any) => {
  const dispatch = useDispatch();
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [context, contextLoading, setTeacherContext] = useTeacherContext();
  const courseId = context?.course_id
  const segValue = searchParams.get("type") || "course"; // 默认值为"course"
  const [selectCourse, setSelectCourse] = useState<any>({});
  const [dataList, setDataList] = useState<any>([]);
  const pocShow = getUserInfo("phone") === "17811223344";

  const optionList = [
    { label: "备课", value: "course" },
    { label: "上课", value: "class" },
  ];

  useEffect(() => {
    if (contextLoading || !courseId) return;
    getDataList();
  }, [courseId, contextLoading]);

  //  获取课程
  const getDataList = async () => {
    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/getData",
      apiUrl: "userCourseUrl",
      payload: {
        org_id: getOrgId(),
        page: 1,
        page_size: 500,
      },
    });
    if (code === 200) {
      setDataList(data);
      const curRow = data?.list?.find((item: any) => item.id == courseId);

      // if (!curRow) {
      //   message.info("访问资源不存在");
      //   history.push("/");
      // }

      if(curRow) {
        setSelectCourse(curRow);
      }else {
        setSelectCourse(data?.list?.[0])
      }
      // dispatch({
      //   type: "teachSourceModel/setData",
      //   payload: {
      //     selectedSubject: curRow,
      //   },
      // });
    }
  };

  // 改变分类
  // const onChangeSeg = (value: any) => {
  //   history.push(`/teach/space/teachSource?courseId=${courseId}&type=${value}`);
  // };

  // 课程选中回调
  const onSelectCourse = async (value: any, option: any) => {
    await setTeacherContext({
      courseId:value,
    })

    setSelectCourse(option);
    // // 切换课程处理特殊情况
    if (pathname.includes("/setTopic")) {
      history.push({
        pathname: `/setTopic?courseId=${value}&type=${segValue}`,
      });
      return;
    }

    history.replace(`${pathname}?courseId=${value}&type=${segValue}`); // 修改URL但不刷新页面
  };

  // 格式化课程数据
  const formatCourse = () => {
    return (
      dataList?.list?.map((item: any) => {
        return {
          ...item,
          value: item.id,
          label: <span style={{ marginLeft: "4px" }}>{item.title}</span>,
        };
      }) || []
    );
  };

  if (contextLoading || !courseId) return null;

  return (
    <div className="header-box">
      <div className="header-box-select">
        <Select
          size="large"
          popupMatchSelectWidth={false}
          value={selectCourse?.id}
          onSelect={onSelectCourse}
          options={formatCourse()}
          prefix={<ZYIcon type="jiaocai" />}
          suffixIcon={<ZYIcon type="xiajiantou" size={16} />}
          variant="borderless"
          placement="bottomLeft"
          optionRender={(option) => {
            return (
              <div className="space_item_container">
                <span className="space_item_container_title">
                  {option?.data?.title}
                </span>
                {option?.value === courseId && <CheckOutlined />}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default connect((state: any) => ({
  setQuestionsModel: state.setQuestionsModel,
}))(Header);
