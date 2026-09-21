import { useEffect, useState } from "react";
import { Button, Tooltip } from "antd";
import { FormOutlined } from "@ant-design/icons";
import AssignHomeworkDialog from "./AssignHomeworkDialog";
import "./assignButton.less";

export default function AssignHomeworkButton({
  planId,
  docTitle,
  defaultClassId,
  disabled,
  visible,
  onPublish,
}: {
  planId?: string;
  docTitle: string;
  defaultClassId?: string;
  disabled?: boolean;
  visible: boolean;
  onPublish: (classId: string) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [planId, visible]);
  if (!visible) return null;
  return (
    <>
      <Tooltip
        title={disabled ? "教案正在生成，请稍候" : "布置作业"}
        placement="left"
      >
        <Button
          className="plan_assign_floating"
          type="primary"
          aria-label="布置作业"
          disabled={disabled}
          icon={<FormOutlined />}
          onClick={() => setOpen(true)}
        />
      </Tooltip>
      {open && (
        <AssignHomeworkDialog
          defaultClassId={defaultClassId}
          docTitle={docTitle}
          onPublish={onPublish}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
