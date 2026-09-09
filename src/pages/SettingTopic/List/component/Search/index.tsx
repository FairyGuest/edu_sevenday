import { useEffect, useState } from "react";
import { DatePicker, Select } from "antd";
import { buildExamListSearchPayload } from "../../../utils/examListHelpers";
import "./index.less";

const { RangePicker } = DatePicker;

interface SearchProps {
  payloadFn?: (payload: Record<string, any>) => void;
}

const Search = ({ payloadFn }: SearchProps) => {
  const [status, setStatus] = useState<string>();
  const [time, setTime] = useState<any>();

  useEffect(() => {
    payloadFn?.(buildExamListSearchPayload({ status, time }));
  }, [status, time]);

  return (
    <div className="setting_topic_search_box">
      <div className="setting_topic_search_box_item">
        <Select
          style={{ width: "100%" }}
          placeholder="请选择状态"
          allowClear
          onChange={setStatus}
          options={[
            { value: "1", label: "未开始" },
            { value: "2", label: "进行中" },
            { value: "3", label: "已结束" },
            { value: "4", label: "已撤回" },
          ]}
        />
      </div>
      <div className="setting_topic_search_box_item">
        <RangePicker
          placeholder={["开始时间", "结束时间"]}
          style={{ width: "100%" }}
          value={time}
          onChange={setTime}
        />
      </div>
    </div>
  );
};

export default Search;
