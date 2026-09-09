import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Form, Input, message, DatePicker, Cascader, Select } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "@umijs/max";
import { history } from "umi";
import { useTeacherContext } from "@/components/LayoutSider";
import UploadComponents, {
  resolveExamUploadFileId,
} from "../../../components/UploadComponents";
import { DEFAULT_PAPER_ORDERS } from "@/pages/SettingTopic/PaperCompose/List/constants";
import "../../index.less";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface PublishExamFormProps {
  courseId?: string | number;
  examId?: string | number | null;
  /** 从组卷详情「发布」带入，用于预选试卷 */
  paperId?: string | number | null;
  paperName?: string;
  mode?: "publish" | "look";
  onRef?: React.MutableRefObject<any>;
  onLoadingChange?: (loading: boolean) => void;
}

/**
 * classGroupTree 当前结构：
 * data: [{
 *   currentGrade,
 *   classList: [{
 *     nodeId, name, currentGrade,
 *     groupNodeVOList: [{ nodeId, name, classId, studentVOList: [{ id, name }] }]
 *   }]
 * }]
 */
const flattenClassGroupTreeClasses = (data: any): any[] => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.records)
      ? data.records
      : Array.isArray(data?.list)
        ? data.list
        : [];
  return list.flatMap((item: any) => {
    // 年级包一层：有 classList 则展开为班级
    if (Array.isArray(item?.classList) && item.classList.length > 0) {
      return item.classList.map((cls: any) => ({
        ...cls,
        currentGrade: cls.currentGrade ?? item.currentGrade,
      }));
    }
    // 兼容：item 本身是班级
    if (item?.nodeId != null || item?.id != null || item?.classId != null) {
      return [item];
    }
    return [];
  });
};

/** Cascader：班级 → 小组 → 学生 */
const transformClassGroupTree = (data: any) =>
  flattenClassGroupTreeClasses(data).map((cls: any) => {
    const classId = cls.nodeId ?? cls.classId ?? cls.id;
    const groups = (cls.groupNodeVOList || []).map((group: any) => {
      const groupClassId = group.classId ?? classId;
      const groupValue = `${groupClassId}_${group.nodeId}`;
      const students = (group.studentVOList || []).map((student: any) => ({
        ...student,
        value: student.id,
        label: student.name,
        type: "student",
        id: student.id,
        title: student.name,
        isLeaf: true,
      }));
      return {
        ...group,
        value: groupValue,
        label: group.name,
        type: "group",
        id: groupValue,
        title: group.name,
        classId: groupClassId,
        students,
        children: students,
      };
    });
    return {
      ...cls,
      value: classId,
      label: cls.name,
      type: "class",
      id: classId,
      title: cls.name,
      currentGrade: cls.currentGrade,
      isLeaf: groups.length === 0,
      children: groups.length > 0 ? groups : undefined,
    };
  });

const resolveFileId = resolveExamUploadFileId;

const PublishExamForm = ({
  courseId,
  examId,
  paperId,
  paperName,
  mode = "publish",
  onRef,
  onLoadingChange,
}: PublishExamFormProps) => {
  const dispatch = useDispatch();
  const [context] = useTeacherContext();
  const { xkwCourseId } = useSelector((state: any) => state.settingTopicModel);
  const [form] = Form.useForm();
  const uploadRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [examOptions, setExamOptions] = useState<any[]>([]);
  const [examListLoading, setExamListLoading] = useState(false);
  const [classIdsData, setClassIdsData] = useState<any[]>([]);
  const [userIdsData, setUserIdsData] = useState<any[]>([]);
  const [gradeValue, setGradeValue] = useState<number | undefined>();
  const [checkedIds, setCheckedIds] = useState<(string | number)[][]>([]);
  const [classGroupTreeOption, setClassGroupTreeOption] = useState<any[]>([]);
  const [uploadList, setUploadList] = useState<any[]>([]);
  const [detailClassName, setDetailClassName] = useState("");
  const [detailName, setDetailName] = useState("");
  const [detailData, setDetailData] = useState<any>(null);
  const now = dayjs();
  const isLook = mode === "look";

  const isApiSuccess = (code: any) => code === 200 || code === 0;

  const updateLoading = (next: boolean) => {
    setLoading(next);
    onLoadingChange?.(next);
  };

  useImperativeHandle(onRef, () => ({
    submit: () => form.submit(),
  }));

  const getClassGroupTreeFn = useCallback(async () => {
    const { code, data }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getOrgClassGroupTree",
      payload: {},
    });
    if (isApiSuccess(code)) {
      setClassGroupTreeOption(transformClassGroupTree(data));
    }
  }, [dispatch]);

  const getExamList = useCallback(
    async (keyword = "") => {
      setExamListLoading(true);
      const { code, data }: any = await dispatch({
        type: "settingTopicModel/postData",
        apiUrl: "postPaperFindTeacherPaperPage",
        payload: {
          current: 1,
          size: 100,
          orders: DEFAULT_PAPER_ORDERS,
          name: keyword || undefined,
          keyword: keyword || undefined,
        },
      });
      let options: any[] = [];
      if (isApiSuccess(code)) {
        options = (data?.records || []).map((item: any) => ({
          value: item?.id,
          label: item?.name ?? "",
          raw: item,
        }));
        setExamOptions(options);
      }
      setExamListLoading(false);
      return options;
    },
    [dispatch],
  );

  useEffect(() => {
    getClassGroupTreeFn();
    if (!isLook) {
      (async () => {
        const options = await getExamList();
        // 组卷详情发布带入 paperId：预选该试卷
        if (paperId != null && paperId !== "") {
          const matched = (options || []).find(
            (item: any) => String(item.value) === String(paperId),
          );
          const selectedValue = matched?.value ?? (Number(paperId) || paperId);
          if (!matched) {
            setExamOptions([
              {
                value: selectedValue,
                label: paperName || String(paperId),
                raw: {},
              },
              ...(options || []),
            ]);
          }
          form.setFieldsValue({ exam_id: selectedValue });
        }
        form.setFieldsValue({
          createDateRange: [dayjs(), now.add(1, "day")],
        });
      })();
    }
  }, []);

  // 查看作业：拉详情回填
  useEffect(() => {
    if (!examId) return;
    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const { code, data }: any = await dispatch({
          type: "settingTopicModel/getData",
          apiUrl: "getExamGetExamDetail",
          payload: { id: examId },
        });
        if (!isApiSuccess(code) || !data) return;

        const paperId = data.paperId ?? data.paper_id;
        const paperName = data.paperName ?? data.paper_name ?? data.name ?? "";
        setExamOptions([
          {
            value: paperId,
            label: paperName,
            raw: data,
          },
        ]);
        setDetailName(data.name ?? "");
        setDetailClassName(data.className ?? data.class_name ?? "");
        setDetailData(data);
        setGradeValue(data.grade);
        if (data.classId != null || data.class_id != null) {
          const classId = data.classId ?? data.class_id;
          setClassIdsData([classId]);
          setCheckedIds([[classId]]);
        }

        const files = (data.fileList || data.file_list || []).map(
          (file: any, index: number) => {
            const url = file.url || file.fileUrl || "";
            const extFromUrl = (() => {
              const clean = String(url).split("?")[0];
              const base = clean.split("/").pop() || "";
              const parts = base.split(".");
              return parts.length > 1 ? parts.pop()?.toLowerCase() : "";
            })();
            return {
              uid: String(file.id ?? file.fileId ?? index),
              id: file.id ?? file.fileId,
              name: file.name ?? file.filename ?? file.fileName ?? `附件${index + 1}`,
              status: "done",
              url,
              size: file.size ?? file.size_bytes,
              type: file.type || extFromUrl,
              response: { data: file },
            };
          },
        );
        setUploadList(files);

        form.setFieldsValue({
          exam_id: paperId,
          requirements: data.requirement ?? data.requirements ?? "",
          createDateRange: (() => {
            const start = data.startTime || data.start_time;
            const end = data.endTime || data.end_time || data.deadline;
            if (!start || !end) return undefined;
            return [dayjs(start), dayjs(end)];
          })(),
          class_ids:
            data.classId != null || data.class_id != null
              ? [[data.classId ?? data.class_id]]
              : undefined,
        });
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [examId, dispatch, form]);

  const pickerDisabledDate = (current: any) =>
    current && current < dayjs().subtract(1, "days").endOf("day");

  const pickerDisabledRangeTime = (currentDate: any, _type?: "start" | "end") => {
    const isToday = !currentDate || currentDate.isSame(dayjs(), "day");
    if (!isToday) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => [],
      };
    }

    const currentHour = now.hour();
    const currentMinute = now.minute();
    const currentSecond = now.second();

    return {
      disabledHours: () => Array.from({ length: currentHour }, (_, i) => i),
      disabledMinutes: (selectedHour: any) => {
        if (selectedHour !== currentHour) return [];
        return Array.from({ length: currentMinute }, (_, i) => i);
      },
      disabledSeconds: (selectedHour: any, selectedMinute: any) => {
        if (selectedHour !== currentHour || selectedMinute !== currentMinute) {
          return [];
        }
        return Array.from({ length: currentSecond }, (_, i) => i);
      },
    };
  };

  const renderOutline = (tree: any[]) =>
    tree?.map((cls) => (
      <div key={cls.id} className="push_group_sub_student_tree_box_css">
        <div className="push_group_sub_student_tree_box_title">{cls.title}</div>
        {cls.children?.map((grp: any) => {
          const total = grp.students?.length || 0;
          const selected = grp.selected || [];
          const isAll = total > 0 && selected.length === total;
          const showList = isAll
            ? grp.students
            : grp.students?.filter((s: any) =>
                selected.map(String).includes(String(s.id)),
              );
          return (
            <div key={grp.id}>
              <div className="push_group_sub_student_tree_box_grp_box">
                {grp.title}：
                {showList?.map((s: any, i: number) => (
                  <span
                    key={s.id}
                    className="push_group_sub_student_tree_box_grp_box_name"
                  >
                    {s.name}
                    {i === showList.length - 1 ? "" : "、"}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    ));

  // checkedIds: [classId] 或 [classId, groupValue, studentId]
  const displayTree = useMemo(() => {
    const selMap = new Map<string, string[]>();
    checkedIds.forEach((path) => {
      if (path.length >= 3) {
        const groupValue = path[path.length - 2];
        const studentId = path[path.length - 1];
        const key = String(groupValue);
        if (!selMap.has(key)) selMap.set(key, []);
        if (studentId != null) selMap.get(key)!.push(String(studentId));
      }
    });

    const tree: any[] = [];
    const classMap = new Map<string, any>();

    checkedIds.forEach((path) => {
      const classId = path[0];
      const classKey = String(classId);
      if (!classMap.has(classKey)) {
        const cls = classGroupTreeOption.find(
          (c) => String(c.value) === classKey || String(c.id) === classKey,
        );
        if (!cls) return;
        classMap.set(classKey, {
          id: cls.id,
          title: cls.title || cls.label,
          children: new Map(),
        });
        tree.push(classMap.get(classKey));
      }

      if (path.length < 3) return;

      const groupValue = path[path.length - 2];
      const groupKey = String(groupValue);
      const groupNodeMap = classMap.get(classKey)?.children;
      if (groupNodeMap && !groupNodeMap.has(groupKey)) {
        const grp = classGroupTreeOption
          .find((c) => String(c.value) === classKey || String(c.id) === classKey)
          ?.children?.find(
            (g: any) => String(g.value) === groupKey || String(g.id) === groupKey,
          );
        if (grp) {
          groupNodeMap.set(groupKey, {
            id: grp.id,
            title: grp.title || grp.label,
            students: grp.students || [],
            selected: selMap.get(groupKey) || [],
          });
        }
      }
    });

    return tree.map((cls: any) => ({
      ...cls,
      children: Array.from(cls.children.values()),
    }));
  }, [checkedIds, classGroupTreeOption]);

  const treeHasStudents = useMemo(
    () =>
      classGroupTreeOption.some((cls) =>
        (cls.children || []).some(
          (g: any) => (g.students || g.children || []).length > 0,
        ),
      ),
    [classGroupTreeOption],
  );

  const cascaderOnChange = (_value: any, selectedOptions: any) => {
    const nextClassIds: any[] = [];
    const nextUserIds: any[] = [];
    let nextGrade: number | undefined;
    selectedOptions?.forEach((path: any) => {
      path?.forEach((n: any) => {
        if (n.type === "class") {
          nextClassIds.push(n.id);
          if (nextGrade == null) {
            nextGrade = n.currentGrade ?? n.grade;
          }
        }
        if (n.type === "student") {
          nextUserIds.push(n.id);
        }
      });
    });
    setGradeValue(nextGrade);
    setClassIdsData([...new Set(nextClassIds)]);
    setUserIdsData([...new Set(nextUserIds)]);
    setCheckedIds(selectedOptions.map((p: any) => p.map((n: any) => n.value)));
  };

  const onFinish = async (values: any) => {
    if (isLook) return;
    if (userIdsData?.length > 1000) {
      message.warning("单次作业发布最多支持1000人，请减少人数后重试");
      return;
    }
    const [createStartDate, createEndDate] = values?.createDateRange || [];
    if (!createStartDate || !createEndDate) {
      message.warning("请选择起止时间");
      return;
    }
    if (!classIdsData.length) {
      message.warning("请选择班级");
      return;
    }
    // 接口有小组/学生时才强制选学生；仅班级叶子（无学生树）时只校验班级
    if (treeHasStudents && !userIdsData.length) {
      message.warning("请选择学生");
      return;
    }

    let startTime = createStartDate;
    if (dayjs().valueOf() > createStartDate.valueOf()) {
      startTime = dayjs();
    }
    if (dayjs().valueOf() > createEndDate.valueOf()) {
      message.warning("截止时间不能早于当前时间");
      return;
    }

    const selectedExam = examOptions.find((item) => item.value === values?.exam_id);
    const subjectId =
      selectedExam?.raw?.subjectId ??
      selectedExam?.raw?.subject_id ??
      xkwCourseId ??
      context?.subject_id ??
      courseId;

    if (!subjectId) {
      message.warning("缺少学科信息，请先选择课程");
      return;
    }

    const file_urls_list =
      uploadRef?.current?.getFileList?.() || uploadList || [];
    const fileIdList =
      uploadRef?.current?.getFileIdList?.() ||
      file_urls_list.map(resolveFileId).filter((id: any) => id != null && id !== "");

    const paperGrade = selectedExam?.raw?.grade;
    updateLoading(true);
    const { code }: any = await dispatch({
      type: "settingTopicModel/postData",
      apiUrl: "postExamSaveExam",
      payload: {
        paperId: values?.exam_id,
        classIdList: classIdsData,
        studentList: userIdsData,
        subjectId,
        name: selectedExam?.label || "",
        grade: gradeValue ?? paperGrade,
        requirement: values?.requirements,
        fileIdList,
        startTime: dayjs(startTime).format("YYYY-MM-DD HH:mm:ss"),
        endTime: dayjs(createEndDate).format("YYYY-MM-DD HH:mm:ss"),
      },
    });
    if (isApiSuccess(code)) {
      message.success("发布成功");
      history.push(`/setTopic?courseId=${courseId}`);
    }
    updateLoading(false);
  };

  const formatDetailTime = (value?: string) =>
    value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "";

  if (isLook) {
    const paperName =
      detailData?.paperName ??
      detailData?.paper_name ??
      examOptions[0]?.label ??
      "—";
    const requirement =
      detailData?.requirement ?? detailData?.requirements ?? "—";
    const startText = formatDetailTime(
      detailData?.startTime || detailData?.start_time,
    );
    const endText = formatDetailTime(
      detailData?.endTime || detailData?.end_time || detailData?.deadline,
    );
    const timeText =
      startText || endText ? `${startText || "—"} 至 ${endText || "—"}` : "—";

    return (
      <div className="setting_homework_publish_box">
        <div className="exam_detail_view">
          <div className="exam_detail_item">
            <span className="exam_detail_item_title">试卷:</span>
            <span className="exam_detail_item_content">
              {detailLoading ? "加载中..." : paperName}
            </span>
          </div>
          <div className="exam_detail_item">
            <span className="exam_detail_item_title">作业名称:</span>
            <span className="exam_detail_item_content">
              {detailName || "—"}
            </span>
          </div>
          <div className="exam_detail_item">
            <span className="exam_detail_item_title">作业要求:</span>
            <span className="exam_detail_item_content">{requirement || "—"}</span>
          </div>
          <div className="exam_detail_item">
            <span className="exam_detail_item_title">作业附件:</span>
            <div className="exam_detail_item_content">
              {uploadList?.length > 0 ? (
                <UploadComponents
                  flagStatus="look"
                  uploadList={[...uploadList]}
                />
              ) : (
                "无"
              )}
            </div>
          </div>
          <div className="exam_detail_item">
            <span className="exam_detail_item_title">起止时间:</span>
            <span className="exam_detail_item_content">{timeText}</span>
          </div>
          <div className="exam_detail_item">
            <span className="exam_detail_item_title">发布对象:</span>
            <span className="exam_detail_item_content">
              {detailClassName || "—"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="setting_homework_publish_box">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        style={{ marginTop: 24, maxWidth: 780 }}
      >
        <Form.Item
          label="选择试卷"
          name="exam_id"
          rules={[{ required: true, message: "请选择试卷" }]}
        >
          <Select
            placeholder="请输入搜索或选择试卷"
            allowClear
            showSearch
            loading={examListLoading}
            options={examOptions}
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            onSearch={(value) => getExamList(value)}
            notFoundContent={examListLoading ? "加载中..." : "暂无数据"}
          />
        </Form.Item>

        <Form.Item
          label="作业要求"
          name="requirements"
          rules={[
            {
              required: true,
              message: "请输入作业要求",
              min: 1,
              max: 200,
            },
          ]}
        >
          <TextArea
            showCount
            maxLength={200}
            placeholder="请输入作业要求"
            style={{ height: 120, resize: "none" }}
          />
        </Form.Item>

        <Form.Item label="作业附件" name="fileIdList">
          <UploadComponents
            onRef={uploadRef}
            maxNum={10}
            flagStatus="edit"
            fileType={["jpg", "jpeg", "bmp", "png", "pdf", "doc", "docx"]}
            uploadList={[...uploadList]}
            onChange={(list: any[]) => setUploadList(list || [])}
          />
        </Form.Item>

        <Form.Item
          label="起止时间"
          name="createDateRange"
          rules={[{ required: true, message: "请选择起止时间" }]}
        >
          <RangePicker
            style={{ width: "100%" }}
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
            disabledDate={pickerDisabledDate}
            disabledTime={pickerDisabledRangeTime}
          />
        </Form.Item>

        <Form.Item
          label="发布对象"
          name="class_ids"
          rules={[{ required: true, message: "请选择发布班级" }]}
        >
          <Cascader
            options={classGroupTreeOption}
            placeholder="请选择要发布的班级、小组、学生"
            multiple
            maxTagCount={5}
            className="cascader_form"
            onChange={cascaderOnChange}
            showCheckedStrategy={Cascader.SHOW_CHILD}
            maxTagTextLength={10}
            optionRender={(node) => (
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 244,
                }}
              >
                {node.label}
              </div>
            )}
          />
        </Form.Item>

        <Form.Item label="已选预览">
          <div
            className={
              userIdsData?.length > 1000
                ? "push_selected_preview_css"
                : "push_selected_preview_box_css"
            }
          >
            {renderOutline(displayTree)}
          </div>
          {userIdsData?.length > 1000 && (
            <span className="push_selected_preview_box_text">
              单次作业发布最多支持1000人，请减少人数后重试
            </span>
          )}
        </Form.Item>
      </Form>
    </div>
  );
};

export default PublishExamForm;
