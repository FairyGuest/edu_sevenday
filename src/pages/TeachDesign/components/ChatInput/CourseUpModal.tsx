import { useState, useEffect, useRef } from "react";
import { useDispatch } from "@umijs/max";
import { Checkbox, Modal, Image, Select } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useTeacherContext } from "@/components/LayoutSider";
import { getOrgId, formatStaticUrl, handleName, deepCopy } from "@/utils";
import { ZYIcon } from "@/components";
import dayjs from "dayjs";

interface queryParams {
  page: number;
  page_size: number;
  labels: string;
  space_id: string;
}

interface labelList {
  label: string;
  value: string;
}

const CourseUpModal = (props: any) => {
  const { open, setOpen, fileList = [], setFileList } = props;
  const dispatch = useDispatch();

  const [context] = useTeacherContext();
  const courseId = context?.course_id;
  const [courseList, setCourseList] = useState<any>([]); // 课程列表
  const [labelList, setLabelList] = useState<labelList[]>([]); // 标签列表
  const [dataList, setDataList] = useState<any>([]); // 课程资料数据列表
  const [selectList, setSelectList] = useState<any>([]); // 选中列表
  const [queryParams, setQueryParams] = useState<queryParams>({
    page: 1,
    page_size: 130,
    labels: "all",
    space_id: courseId,
  }); // 课程资料查询参数

  useEffect(() => {
    if (!open) return;
    const query = { labels: "all", space_id: courseId };
    getCourseList();
    getTagList();
    getDataList(query);
    setSelectList(fileList);
    setQueryParams((prev: any) => ({ ...prev, ...query }));
  }, [courseId, open]);

  //  获取课程
  const getCourseList = async () => {
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
      setCourseList(data?.list || []);
    }
  };
  // 获取有数据的标签
  const getTagList = async (key?: string) => {
    const { code, data = [] }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "docUnEmptyLabelUrl",
      payload: {
        space_id: key || queryParams.space_id,
      },
    });
    if (code == 200) {
      if (!data.length) {
        setLabelList([]);
        setDataList([]);
        return;
      }
      const labelArr = data.map((label: any) => {
        return {
          label,
          value: label === "讲义" ? "教案讲义" : label,
        };
      });
      labelArr.unshift({ label: "all", value: "全部" });
      setLabelList(labelArr);
    }
  };
  // 获取课程资料数据列表
  const getDataList = async (param?: any) => {
    // setDataLoading(true);
    const payload = { ...queryParams, ...param };
    const { code, data }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "docLabelListUrl",
      payload: {
        ...payload,
        labels: payload?.labels === "all" ? [] : [payload?.labels],
      },
    });
    if (code == 200 && data?.list?.length) {
      const typeArr = ["pdf", "doc", "docx", "pptx", "txt", "md", "jpg", "jpeg", "png"];
      // 筛选符合格式的文件
      const dataArr = data?.list.filter((item: any) => typeArr.includes(item?.file_type));
      const arr = dataArr.filter((item: any) => checkSize(item));
      setDataList(arr);
    }
    // setDataLoading(false);
  };
  // 文件大小校验
  const checkSize = (item: any) => {
    return item?.file_size <= 1024 * 1024 * 20;
  }
  // 课程选中回调
  const onSelectCourse = async (key: any) => {
    const query = {
      ...queryParams,
      space_id: key,
    };

    setQueryParams(query);
    getDataList(query);
    getTagList(key);
  };

  // label点击事件
  const onLabelClick = (label: any) => {
    const query = {
      ...queryParams,
      labels: label,
    };

    setQueryParams(query);
    getDataList(query);
  };

  // 处理时间展示
  const handleTime = (time: string) => {
    if (dayjs().diff(time, "day") === 0) {
      return dayjs(time).format("HH:mm");
    } else if (dayjs(time).year() !== dayjs().year()) {
      return dayjs(time).format("YYYY/MM/DD");
    } else {
      return dayjs(time).format("MM/DD");
    }
  };
  // 处理背景图片
  const handleBg = (item: any) => {
    if (item?.exam_id || handleName(item?.doc_name).type === "html") {
      return (
        <div className="card-content-item-body-text">
          <div className="title">{handleName(item?.doc_name).name}</div>
          <div className="lines">
            <li></li>
            <li></li>
            <li style={{ width: "60%" }}></li>
            <li style={{ width: "80%" }}></li>
            <li></li>
          </div>
        </div>
      );
    } else {
      return (
        <Image
          preview={false}
          style={{ minHeight: "112px" }}
          src={formatStaticUrl(item?.first_image)}
          fallback={require("@/assets/default_bg.png")}
        />
      );
    }
  };
  // 选中、取消选中回调
  const onChangeCheck = (item: any) => {
    if (selectList?.length == 10) return;
    let arr = deepCopy(selectList);
    let flag_index = selectList?.findIndex((val: any) => {
      return val?.id == item?.id;
    });
    if (flag_index > -1) {
      arr?.splice(flag_index, 1);
    } else {
      arr?.push(item);
    }
    setSelectList(arr);
  };
  // 复选框选中状态
  const checkedFn = (item: any) => {
    let flag_index = selectList?.findIndex((val: any) => {
      return val?.id == item?.id;
    });
    if (flag_index > -1) {
      return true;
    }
    return false;
  };
  // 复选框禁用状态
  const disabledFn = (item: any) => {
    if (selectList?.length == 10) {
      let flag_index = selectList?.findIndex((val: any) => {
        return val?.id == item?.id;
      });

      if (flag_index > -1) {
        return false;
      }
      return true;
    }
  };

  const handleOk = () =>{
    setOpen(false)
    setFileList(selectList);
  }

  return (
    <Modal
      className="course-upload-modal"
      title="选择课程文件"
      width={964}
      open={open}
      maskClosable={false}
      onCancel={() => setOpen(false)}
      onOk={handleOk}
    >
      <div className="header-filter">
        <Select
          popupMatchSelectWidth={false}
          value={queryParams?.space_id}
          onSelect={onSelectCourse}
          options={courseList}
          fieldNames={{
            label: "title",
            value: "id",
          }}
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
                {option?.value === queryParams?.space_id && <CheckOutlined />}
              </div>
            );
          }}
        />
        <div className="divider" />
        {/* 标签筛选 */}
        <div className="header-filter-items">
          {labelList.map((item: any) => {
            return (
              <div
                className={`filter_item ${item.label === queryParams?.labels ? "active" : ""}`}
                key={item.label}
                onClick={() => onLabelClick(item.label)}
              >
                {item.value}
              </div>
            );
          })}
        </div>
      </div>
      <div className="selected-desc">
        已选择 <span>{selectList?.length}</span> 个资料，最多选择 <span>10</span> 个
      </div>
      <div className="card-content">
        {dataList.map((item: any) => (
          <div
            key={item?.id}
            className={`card-content-item ${checkedFn(item) ? "checked" : ""}`}
            onClick={() => onChangeCheck(item)}
          >
            <Checkbox
              checked={checkedFn(item)}
              disabled={disabledFn(item)}
              onChange={() =>onChangeCheck(item)}
            />
            <div className="card-content-item-body">{handleBg(item)}</div>
            <div className="card-content-item-footer">
              <div className="title" title={item?.doc_name}>
                <ZYIcon
                  type={handleName(item?.doc_name, item?.file_type).icon}
                />
                <span>{handleName(item?.doc_name).name}</span>
              </div>
              <div className="desc">
                <div>
                  <span>{item?.created_name} · </span>
                  <span>{handleTime(item?.updated_time)}更新</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default CourseUpModal;
