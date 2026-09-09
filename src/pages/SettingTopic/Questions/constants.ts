export const SET_TYPE = {
  UPLOAD_TOPIC: "uploadTopic",
  CHAPTER_TOPIC: "chapterTopic",
  PAPER: "paper",
} as const;

export const PRINT_TYPE = {
  STUDENT: "student",
  TEACHER: "teacher",
} as const;

export const DEFAULT_PRINT_TYPE = PRINT_TYPE.STUDENT;

export const isApiSuccess = (code: unknown) => code === 200 || code === 0;

export const resolvePaperId = (searchParams: URLSearchParams) =>
  searchParams.get("id") ||
  searchParams.get("paperId") ||
  searchParams.get("examId");

export const resolveIsPaperCompose = (pathname: string, searchParams: URLSearchParams) =>
  pathname.startsWith("/paperCompose") ||
  !!searchParams.get("id") ||
  !!searchParams.get("paperId");
