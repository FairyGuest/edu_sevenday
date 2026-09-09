import { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
import { connect, useDispatch } from "@umijs/max";
import { history, Outlet, useLocation } from "umi";
import LeftCard from "./components/LeftCard";
import RightCard from "./components/RightCard";
import HeaderCourse from '@/components/HeaderCourse'
import { useTeacherContext } from '@/components/LayoutSider';
import "./index.less";
import { addTracking, addNewTracking } from '@/utils';
import ChatEmpty from "@/components/ChatEmpty";
import { ZYIcon } from "@/components";
const { Content, Sider } = Layout;

const App = (props: any) => {
  // const { search } = useLocation();
  // const searchParams = new URLSearchParams(search);
  // const courseId = searchParams.get("courseId");
  const [context, contextLoading] = useTeacherContext()
  const courseId = context?.course_id
  const [dataListData, setDataListData] = useState([]);
  const curOrg = JSON.parse(localStorage.getItem("curOrg") || "{}");
  const [examvarder, setExamvader] = useState<any>(true);
  const [testRow, setTestRow] = useState();

  const dispatch = useDispatch();

  useEffect(() => {
    // addNewTracking({
    //   bt: 'pv',
    //   ct: 'hw_correct_show'
    // })     // 行为埋点
    addTracking({ page_name: "自动批改" })   // 数据埋点
  }, []);


  useEffect(() => {
    postDistributionListFn();
  }, []);

  const postDistributionListFn = async () => {
    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "postDistributionList",
      payload: {
        size:999,
      },
    });
    if (code === 200) {
      setDataListData(data?.records || []);
    }
  };

  const rowFn = (item: any) => {
    setTestRow(item);
  };

  const getDataList = () => {
    postDistributionListFn(courseId);
  };
  return (
    <div className="check_correction">
      <div className="check_correction_header">
        <span>作业批改</span>
        <HeaderCourse />
      </div>
      <div className="check_correction_content">
        {dataListData?.length > 0 && (
          <div className="check_correction_content_left">
            <LeftCard
              dataListData={dataListData}
              rowFn={rowFn}
              getDataList={getDataList}
              setExamvader={setExamvader}
            />
          </div>
        )}
        {
          examvarder && (
            <div className="check_correction_content_right">
              <RightCard
                dataListData={dataListData}
                testRow={testRow}
                refreshListFn={getDataList}
              />
            </div>
          ) || (
            <div className="check_correction_content_right">
              <ChatEmpty
                ZYIconStyle={{ width: "100%", height: "56px" }}
                descriptionSty={{
                  fontSize: "14px",
                  color: "#646E8B"
                }}
                imgStyle={{ margin: "0 auto" }}
                title={`抱歉，暂未收到学生提交的习题`}
              />
            </div>
          )
        }
      </div>

    </div>
  );
};

export default connect((state: any) => ({
  aiClassroomModel: state.aiClassroomModel,
}))(App);
