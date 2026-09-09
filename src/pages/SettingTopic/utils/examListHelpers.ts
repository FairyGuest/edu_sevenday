import dayjs from "dayjs";

/** postExamFindExamPage 展示状态：1未开始 2进行中 3已结束 4已撤回 */
export const DISPLAY_STATUS_MAP: Record<number, string> = {
  1: "未开始",
  2: "进行中",
  3: "已结束",
  4: "已撤回",
};

export const DISPLAY_STATUS_CLASS_MAP: Record<number, string> = {
  1: "not_started",
  2: "in_progress",
  3: "finished",
  4: "withdrawn",
};

export const displayStatusToKey = (displayStatus?: number | string) =>
  DISPLAY_STATUS_CLASS_MAP[Number(displayStatus)] || "not_started";

export const getDisplayStatusLabel = (displayStatus?: number | string) =>
  DISPLAY_STATUS_MAP[Number(displayStatus)] || "";

export const EXAM_DISPLAY_STATUS_KEYS = [
  "not_started",
  "in_progress",
  "finished",
  "withdrawn",
] as const;

export type ExamDisplayStatusKey = (typeof EXAM_DISPLAY_STATUS_KEYS)[number];

export const getExamDisplayStatus = (item: any = {}): ExamDisplayStatusKey =>
  (item?.status || displayStatusToKey(item?.displayStatus)) as ExamDisplayStatusKey;

/** 将 findExamPage 返回记录转为列表页使用的结构 */
export const normalizeExamRecord = (record: any = {}) => {
  const displayStatus = record.displayStatus ?? record.display_status;
  const studentList = record.studentList || record.student_list || [];

  return {
    ...record,
    exam_id: record.id ?? record.exam_id,
    title: record.name ?? record.title,
    displayStatus,
    status: displayStatusToKey(displayStatus),
    start_time: record.startTime ?? record.start_time,
    deadline: record.endTime ?? record.deadline,
    created_at: record.createTime ?? record.created_at,
    published_class:
      record.published_class?.length > 0
        ? record.published_class
        : studentList.length > 0
          ? [
              {
                class_name: record.className ?? record.class_name ?? "",
                publish_users: studentList.map((student: any) => ({
                  id: student?.id,
                  name: student?.name ?? "",
                })),
              },
            ]
          : [],
    published_total: record.published_total ?? studentList.length,
    submitted_total:
      record.submitted_total ??
      studentList.filter((student: any) => Number(student?.completionProgress) > 0).length,
  };
};

export const normalizeExamRecords = (records: any[] = []) =>
  (Array.isArray(records) ? records : []).map(normalizeExamRecord);

/** findExamPage 列表筛选参数 */
export const buildExamListSearchPayload = ({
  status,
  time,
}: {
  status?: string | number;
  time?: any[];
} = {}) => {
  const payload: Record<string, any> = {};

  if (status != null && status !== "") {
    payload.displayStatus = Number(status);
  }
  if (time && time.length > 0) {
    payload.createStartDate = dayjs(time[0]).format("YYYY-MM-DD");
    payload.createEndDate = dayjs(time[1]).format("YYYY-MM-DD");
  }

  return payload;
};
