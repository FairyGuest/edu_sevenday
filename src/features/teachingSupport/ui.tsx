import { Alert, Button, Skeleton } from "antd";
import type { useSupport } from "./services";
export const STATES: Record<string, string> = {
  observed: "有审核证据",
  pending_review: "量规待审核",
  insufficient: "证据不足",
  suspended: "暂不评价",
  conflict: "证据冲突 · 待复核",
  draft: "草案",
  in_review: "审核中",
  approved: "已审核",
  confirmed: "已确认",
  suggested: "待复核",
  rejected: "已否决",
  completed: "已完成",
};
export function LoadState({ read }: { read: ReturnType<typeof useSupport> }) {
  return read.error ? (
    <Alert
      type="error"
      showIcon
      message={read.error}
      action={<Button onClick={read.retry}>重试</Button>}
    />
  ) : read.loading ? (
    <Skeleton active paragraph={{ rows: 5 }} />
  ) : null;
}
