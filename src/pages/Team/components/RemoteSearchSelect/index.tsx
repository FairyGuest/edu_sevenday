import React, { useState, useRef, useCallback, useEffect } from "react";
import { Select, Spin, Empty, Button, message } from "antd";
import debounce from "lodash/debounce";
import type { SelectProps } from "antd/es/select";
import "./index.less";
import { ZYIcon } from "@/components";

const { Option } = Select;

export interface RemoteItem {
  label: string;
  value: string | number;
  [key: string]: any;
}

// export interface RemoteSearchSelectProps
//   extends Omit<SelectProps<any>, "options" | "onSearch"> {
//   /** 远程搜索函数，返回 Promise<Item[]> */
//   fetchOptions: (keyword: string) => Promise<RemoteItem[]>;
//   /** 自定义字段映射，默认 { label: 'label', value: 'value' } */
//   fieldNames?: { label?: string; value?: string };
//   /** 防抖等待时间，默认 400ms */
//   debounceTimeout?: number;
//   /** 空数据时的文案 */
//   emptyText?: React.ReactNode;
//   /** 是否支持多选 */
//   // mode?: "multiple" | "tags";
//   onAdd: (row: any) => Promise<RemoteItem[]>;
// }
const RemoteSearchSelect: React.FC<any> = ({
  fetchOptions,
  fieldNames = { label: "label", value: "value" },
  debounceTimeout = 400,
  emptyText = "暂无数据",
  mode,
  onAdd,
  ...restProps
}) => {
  const [options, setOptions] = useState<RemoteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchRef = useRef(0); // 请求序号，用于丢弃过期响应
  const keywordRef = useRef(""); // 记住当前关键字
  const [open, setOpen] = useState(false);

  // 真正的搜索函数
  const doSearch = useCallback(
    async (keyword: string) => {
      const fetchId = ++fetchRef.current;
      if (!keyword) {
        setOptions([]);
        return;
      }
      keywordRef.current = keyword;
      setLoading(true);
      try {
        const data = await fetchOptions(keyword);
        if (fetchId !== fetchRef.current) return; // 过期响应直接丢弃
        setOptions(data || []);
      } catch (e) {
        if (fetchId !== fetchRef.current) return;
        setOptions([]);
        console.error("远程搜索出错：", e);
      } finally {
        if (fetchId === fetchRef.current) setLoading(false);
      }
    },
    [fetchOptions],
  );

  // 防抖包装
  const debouncedSearch = useRef(
    debounce(doSearch, debounceTimeout, { leading: false, trailing: true }),
  ).current;

  // 组件卸载时取消未完成的防抖
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // 搜索回调
  const handleSearch = useCallback(
    (val: string) => {
      debouncedSearch(val);
    },
    [debouncedSearch],
  );

  const handleAdd = async (item: any) => {
    console.log("handleAdd", item);
    try {
      await onAdd(item?.data); // 先调后端新增
      await doSearch(keywordRef.current); // 重新搜索一次，拿到最新 added 状态
    } catch (err) {
      message.error("添加失败，请重试");
    } finally {
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key !== "Enter") return;
    console.log("handleKeyDown");
    e.preventDefault();
    e.stopPropagation();
    debouncedSearch.flush(); // 立即执行
    setOpen(true);
  };

  // 空态展示
  const renderNotFound = () => {
    if (loading) return <Spin size="small" />;
    if (!options.length)
      return (
        <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      );
    return null;
  };

  return (
    <Select
      showSearch
      filterOption={false} // 前端不筛选，由远程完成
      getPopupContainer={(triggerNode) => triggerNode.parentElement}
      onSearch={handleSearch}
      notFoundContent={renderNotFound()}
      onDropdownVisibleChange={setOpen}
      onInputKeyDown={handleKeyDown}
      suffixIcon={<ZYIcon type="sousuo" />}
      className="team_member_select_css"
      allowClear
      {...restProps}
      options={options}
      optionRender={(option) => {
        return (
          <div
            className="team_member_option_box"
            key={option?.data?.id}
            onClick={(e) => {
              e.stopPropagation(); // 阻止事件冒泡
              e.preventDefault(); // 阻止默认行为
            }}
          >
            <div className="team_member_option_info">
              <p className="team_member_name">
                姓名:{option?.data?.name || "-"}
              </p>
              <p className="team_member_id">
                教育ID:{option?.data?.edu_id || "-"}
              </p>
              <p className="team_member_phone">
                虚拟手机号:{option?.data?.phone || "-"}
              </p>
            </div>
            <div className="team_member_option_btn">
              <Button
                className={
                  option?.data?.in_group
                    ? "team_member_option_btn_css_disabled"
                    : "team_member_option_btn_css"
                }
                type="primary"
                disabled={option?.data?.in_group}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault(); // 阻止默认行为
                  // onAdd(option?.data);
                  handleAdd(option);
                }}
              >
                {option?.data?.in_group ? "已添加" : "添加"}
              </Button>
            </div>
          </div>
        );
      }}
    >
      {/* {options.map((option) => (
        <Option
          key={option.value}
          value={option.value}
          style={{ height: "76px" }}
          disabled={true}
        >
          <div
            className="team_member_option_box"
            key={option?.id}
            onClick={(e) => {
              e.stopPropagation(); // 阻止事件冒泡
              e.preventDefault(); // 阻止默认行为
            }}
          >
            <div className="team_member_option_info">
              <p className="team_member_name">姓名:{option?.name || "-"}</p>
              <p className="team_member_id">教育ID:{option?.edu_id || "-"}</p>
              <p className="team_member_phone">
                虚拟手机号:{option?.phone || "-"}
              </p>
            </div>
            <div className="team_member_option_btn">
              <Button
                className={
                  option?.in_group
                    ? "team_member_option_btn_css_disabled"
                    : "team_member_option_btn_css"
                }
                type="primary"
                disabled={option?.in_group}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault(); // 阻止默认行为
                  // onAdd(option?.data);
                  handleAdd(option);
                }}
              >
                {option?.in_group ? "已添加" : "添加"}
              </Button>
            </div>
          </div>
        </Option>
      ))} */}
    </Select>
  );
};

export default RemoteSearchSelect;
