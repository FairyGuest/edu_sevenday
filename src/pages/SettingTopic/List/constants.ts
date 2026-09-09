export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE_INDEX = 1;
export const POLL_INTERVAL_MS = 20000;
/** 组卷记录列表轮询，暂时关闭 */
export const ENABLE_EXAM_LIST_POLLING = false;
export const SKELETON_COUNT = 5;

export const isApiSuccess = (code: unknown) => code === 200 || code === 0;
