import { useState } from "react";
import { DatePicker, Input } from "antd";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";
import "./index.less";

const { RangePicker } = DatePicker;

interface PaperComposeSearchProps {
  payloadFn?: (payload: Record<string, any>) => void;
}

const PaperComposeSearch = ({ payloadFn }: PaperComposeSearchProps) => {
  const [keyword, setKeyword] = useState("");
  const [time, setTime] = useState<any>();

  const buildPayload = (kw = keyword) => {
    const payload: Record<string, any> = {
      name: kw || undefined,
    };
    if (time?.length > 0) {
      payload.startTime = dayjs(time[0]).format("YYYY-MM-DD");
      payload.endTime = dayjs(time[1]).format("YYYY-MM-DD");
    }
    return payload;
  };

  const triggerSearch = (kw = keyword) => {
    payloadFn?.(buildPayload(kw));
  };

  return (
    <div className="paper_compose_search_box">
      {/* <div className="paper_compose_search_box_item">
        <Input
          placeholder="请输入试卷名称"
          allowClear
          value={keyword}
          onChange={(e) => {
            const value = e.target.value;
            setKeyword(value);
            if (!value) {
              triggerSearch("");
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              triggerSearch();
            }
          }}
          suffix={
            <SearchOutlined
              onClick={() => {
                triggerSearch();
              }}
            />
          }
        />
      </div> */}
      <div className="paper_compose_search_box_item">
        <RangePicker
          placeholder={["创建开始时间", "创建结束时间"]}
          style={{ width: "100%" }}
          value={time}
          onChange={(date) => {
            setTime(date);
            const payload: Record<string, any> = {
              name: keyword || undefined,
            };
            if (date?.length) {
              payload.startTime = dayjs(date[0]).format("YYYY-MM-DD");
              payload.endTime = dayjs(date[1]).format("YYYY-MM-DD");
            }
            payloadFn?.(payload);
          }}
        />
      </div>
    </div>
  );
};

export default PaperComposeSearch;
