import { connect, useDispatch } from "@umijs/max";
import {
  Form,
  Skeleton,
  Checkbox,
  message
} from "antd";
import "./index.less";
import { useEffect, useState, useRef } from "react";
import Workcontent from "./Workcontent";
import ChatEmpty from "@/components/ChatEmpty";
import { useTeacherContext } from '@/components/LayoutSider';
import { ZYIcon } from "@/components";
const App = (props: any) => {
  const { onRef, roleModel, testRow } = props;
  const dispatch = useDispatch();

  const [context] = useTeacherContext()
  const courseId = context?.course_id
  const [optionsStudent, setOptionsStudent] = useState<any>([]);
  const [activeStudentRow, setActiveStudentRow] = useState<any>();
  const [selectType, setSelectType] = useState("1"); //1:班级 2：试卷
  const [testPaper, setTestPaper] = useState();
  const [loading, setLoading] = useState(false);
  const [download, setDownload] = useState(false);
  const [exportData, setExportData] = useState<any>(); // 导出数据
  const CheckboxGroup = Checkbox.Group;
  const [messageApi, contextHolder] = message.useMessage();
  const requestLockRef = useRef(false);

  useEffect(() => {
    postDAilyTaskClass(testRow?.id)
  }, [testRow]);

  useEffect(() => {
    setExportData(optionsStudent[0]);
    setActiveStudentRow(optionsStudent[0]?.id);
    if(optionsStudent[0]?.id && testRow?.id){
      postCheckExamStudentFn(optionsStudent[0]?.id);
    }
  }, [optionsStudent, testRow?.id])

  const postDAilyTaskClass = async (class_id: any) => {
    setLoading(true);
    if (!class_id) return;
    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/getData",
      apiUrl: "postDAilyTaskClass",
      payload: {
        id: class_id,
      },
    });
    if (code === 200) {
      setOptionsStudent(data);
    }
    setLoading(false);
  };
  const postCheckExamStudentFn = async (studentId: any) => {
    const examId = testRow?.id;
    if (!examId || !studentId) return;
    if(requestLockRef.current) return;
    try {
      requestLockRef.current = true;
      setTestPaper(undefined);

      const { code, data }: any = await dispatch({
        type: "setQuestionsModel/postData",
        apiUrl: "postCheckExamStudent",
        payload: {
          examId: examId,
          studentId: studentId,
        },
      });
      if (code === 200) {
        setTestPaper(data);
      } else {
        messageApi.warning("获取学生试卷数据失败");
      }
    } catch (err) {
      messageApi.error("接口请求异常");
    } finally {
      requestLockRef.current = false;
    }
  };

  const onAccuracyStuden = (item: any, index: number) => {
    setExportData(item);
    setActiveStudentRow(item?.id);
    postCheckExamStudentFn(item?.id);
  }

  const studentList = () => {
    return (
      <>
        <div>
          {optionsStudent?.map((item: any, index: any) => (
            <div
              className={item?.id == activeStudentRow ? "check_topic_right_css_right_left_content_name_active" : "check_topic_right_css_right_left_content_name"}
              key={index}
              onClick={() => {
                onAccuracyStuden(item, index)
              }}
            >
              <div className="check_topic_right_css_right_left_content_name_css">
                <span className={`student-name`}>
                  <>
                    {item.name}
                  </>
                </span>
                <span className={`student-grade`}>
                  {item?.completionProgress + "%"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };
  return (
    <div className='check_topic_right_css_right_div'>
      {props?.dataListData?.length == 0 && (
        <ChatEmpty
          descriptionSty={{
            fontSize: "14px",
            color: "#646E8B",
            fontWeight: 400,
            textAlign: "center",
            margin: "0 auto 0px"
          }}
          ZYIconStyle={{
            height: "55px",
            width: "100%",
            margin: "0 auto 0px"
          }}
          imgStyle={{
            margin: "0 auto"
          }}
          ImgComponent={
            <ZYIcon
              type="kongshuju6"
              style={{
                height: "55px",
                width: "100%"
              }}
            />
          }
          title={`暂无发布的习题`}
        />
      )}
      {props?.dataListData?.length > 0 && (
        <>
          {!loading && (
            <div className='check_topic_right_css_right_content'>
              <div className='check_topic_right_css_right_header_box'>
                {selectType == "1" && (
                  <div className='check_topic_right_css_right_left'>
                    <div className='check_topic_right_css_right_left_top'>
                    </div>
                    <div className={download ? 'check_topic_right_css_right_left_download' : " check_topic_right_css_right_left_content"} >
                      {studentList()}
                    </div>
                  </div>
                )}
              </div>
              {selectType == "1" && (
                <Workcontent
                  {...props}
                  testPaper={testPaper}
                  optionsStudent={optionsStudent}
                  postCheckExamStudentFn={postCheckExamStudentFn}
                  exportData={exportData}
                />
              )}
            </div>
          )}
          {loading && (
            <div className='check_topic_right_loading_box'>
              <Skeleton active />
              <Skeleton active />
              <Skeleton active />
              <Skeleton active />
            </div>
          )}
        </>
      )}
      {contextHolder}
    </div>
  );
};

export default connect((state: any) => ({
  authModel: state.authModel,
  commonModel: state.commonModel,
}))(App);