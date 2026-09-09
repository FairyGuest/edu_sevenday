import { useRef, useState } from "react";
import { Button, Cascader, Dropdown, message } from "antd";
import { useDispatch } from "@umijs/max";
import { history } from "umi";
import ExercisesUploadFile from "@/components/EduSource/UploadFile/ExercisesUploadFile";
import { useTeacherContext } from "@/components/LayoutSider";
import { useXkwTextbookCascader } from "@/pages/SettingTopic/hooks/useXkwTextbookCascader";
import "@/pages/SettingTopic/List/component/Title/index.less";

const Title = () => {
  const dispatch = useDispatch();
  const [context] = useTeacherContext();
  const courseId = context?.course_id;
  const [fileList, setFileList] = useState<any[]>([]);
  const uploadRef = useRef<any>(null);

  const {
    cascaderOptions,
    cascaderValue,
    loadCascaderData,
    onCascaderChange,
  } = useXkwTextbookCascader();

  const items: any = [
    {
      key: "1",
      label: (
        <div onClick={() => history.push(`/setTopic/new`)}>智能出题</div>
      ),
    },
    {
      key: "2",
      label: (
        <div onClick={() => uploadRef.current?.onUploadOpen()}>上传搜题</div>
      ),
    },
  ];

  const onFinish = async (list: any) => {
    if (list?.length > 0) {
      setFileList([...list]);
    }
  };

  const submit = async () => {
    if (!fileList?.length) {
      message.warning("请上传文件");
      return;
    }
    const { code, data }: any = await dispatch({
      type: "settingTopicModel/postData",
      apiUrl: "postPhotoQuestionUploadResource",
      payload: fileList?.map((item: any) => {
        return item?.response?.data?.id
      }),
    });
    if (code === 200 && data) {
      history.push(`/setTopic/exercise?rootTaskId=${data}`);
    } else if (code !== 200) {
      message.error("上传失败，请重试");
    }
  };

  return (
    <>
      <div className="setting_topic_title_box">
        <div className="setting_topic_title_left">
          <span className="setting_topic_title_left_text">试卷列表</span>
          <Cascader
            className="setting_topic_title_cascader"
            placeholder="请选择课程 / 版本 / 教材"
            options={cascaderOptions}
            value={cascaderValue}
            loadData={loadCascaderData}
            onChange={onCascaderChange}
            changeOnSelect={false}
            allowClear={false}
            displayRender={(labels) => labels.join(" / ")}
          />
        </div>
        <div className="setting_topic_title_right">
          <Dropdown
            trigger={["hover"]}
            menu={{ items }}
            overlayClassName="setting_topic_title_right_dropdown"
            getPopupContainer={(node) => node.parentNode as HTMLElement}
            placement="bottomRight"
          >
            <Button type="primary">创建试卷</Button>
          </Dropdown>
        </div>
      </div>
      <ExercisesUploadFile
        onRef={uploadRef}
        courseId={courseId}
        onFinish={onFinish}
        submit={submit}
        showType="checkbox"
        multiple
      />
    </>
  );
};

export default Title;
