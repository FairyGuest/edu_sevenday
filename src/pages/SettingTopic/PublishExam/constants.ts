export const HOMEWORK_TYPES = {
  ADD: "add",
  EDIT: "edit",
  COPY: "copy",
  LOOK: "look",
  PUBLISH: "publish",
} as const;

export const QUICK_HOMEWORK_FILE_TYPES = [
  "jpg",
  "jpeg",
  "bmp",
  "png",
  "pdf",
  "doc",
  "docx",
];

export const TITLE_MAX_LENGTH = 50;
export const REQUIREMENTS_MAX_LENGTH = 200;
export const UPLOAD_MAX_NUM = 10;

export const buildDefaultQuickHomeworkTitle = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}月${dd}日快捷作业`;
};

export const getHomeworkPageTitle = (homeworkType?: string | null) => {
  if (homeworkType === HOMEWORK_TYPES.LOOK) return "查看作业";
  if (homeworkType === HOMEWORK_TYPES.PUBLISH) return "发布试卷";
  return "快捷作业";
};

export const getHomeworkContentTitle = (homeworkType?: string | null) => {
  if (homeworkType === HOMEWORK_TYPES.LOOK) return "作业详情";
  if (homeworkType === HOMEWORK_TYPES.PUBLISH) return "发布试卷";
  return "作业设置";
};

export const isApiSuccess = (code: unknown) => code === 200 || code === 0;
