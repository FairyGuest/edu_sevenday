import { Button, Dropdown, Checkbox, Image, Radio, Tag } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { formatStaticUrl, deepCopy, handleName } from "@/utils";
import { useState, useEffect } from "react";
import { ZYIcon } from "@/components";
import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
// dayjs.extend(relativeTime);
// 定义icon菜单选项
const menuItems = [
  {
    key: "rename",
    label: (
      <div>
        <ZYIcon type="edit" />
        <span style={{ margin: "0 20px 0 8px" }}>重命名</span>
      </div>
    ),
  },
  {
    key: "delete",
    label: (
      <div>
        <ZYIcon type="shanchu" style={{ color: "#EF4444" }} />
        <span style={{ margin: "0 8px" }}>删除</span>
      </div>
    ),
  },
];
const Card = (props: any) => {
  const {
    dataList = [],
    textbookList = [],
    maxNum = 3,
    editPageA = false,
    radioShowText = true, //选择范围/选择 文字是否显示
    selectDirectly = false, // 是否直接选择教材，不选择页码
  } = props;
  const [selectList, setSelectList] = useState([...textbookList]);

  useEffect(() => {
    if (props?.showType == "checkbox") return;
    // 解决单选删除教材后选中还在的问题
    let arr = textbookList?.map((item: any) => {
      return item;
    });
    setSelectList(arr);
  }, [textbookList]);

  // 处理时间展示
  const handleTime = (time: string) => {
    if (dayjs().diff(time, "day") === 0) {
      return dayjs(time).format("HH:mm");
    } else if (dayjs(time).year() !== dayjs().year()) {
      return dayjs(time).format("YYYY/MM/DD");
    } else {
      return dayjs(time).format("MM/DD");
    }
  };

  const onChangeCheck = (item: any) => {
    console.log("item=====>", item);
    if (props?.showType == "checkbox") {
      let arr = deepCopy(selectList);
      let flag_index = selectList?.findIndex((val: any) => {
        return val?.id == item?.id;
      });
      if (flag_index > -1) {
        arr?.splice(flag_index, 1);
      } else {
        arr?.push(item);
      }
      setSelectList(arr);
      props?.checkFn?.(arr);
    } else if (props?.showType == "radio") {
      let flag_arr = dataList?.map((val: any) => {
        if (val?.id == item?.id) {
          console.log(1);
          return {
            ...val,
            checked: true,
          };
        }

        return {
          ...val,
          checked: false,
        };
      });
      setSelectList(flag_arr);
      let flag = flag_arr?.find((val: any) => {
        return val?.id == item?.id && val?.checked;
      });
      if (
        !radioShowText ||
        (item?.file_type !== "ppt" &&
          item?.file_type !== "pdf" &&
          selectDirectly)
      ) {
        props?.checkFn?.([flag]);
      } else {
        props?.changeEditPageA?.();
        props?.openDrawerFn?.(flag);
      }
    }
  };

  const checkedFn = (item: any) => {
    let flag_index = selectList?.findIndex((val: any) => {
      return val?.id == item?.id;
    });
    if (flag_index > -1) {
      return true;
    }
    return false;
  };

  const checkeRadiodFn = (item: any) => {
    let flag_index = selectList?.findIndex((val: any) => {
      return val?.id == item?.id && val?.checked;
    });
    if (flag_index > -1) {
      return true;
    }
    return false;
  };

  const disabledFn = (item: any) => {
    if (item?.progress !== item?.total_progress) {
      return true;
    }
    if (selectList?.length == maxNum) {
      let flag_index = selectList?.findIndex((val: any) => {
        return val?.id == item?.id;
      });
      if (flag_index > -1) {
        return false;
      }
      return true;
    }
  };

  const getTitle = (item: any) => {
    let text = "";
    if (item?.file_type === "ppt" || item?.file_type === "pdf") {
      text = "选择范围";
    } else {
      text = "选择";
    }
    return text;
  };

  return (
    <div className="card-content">
      {dataList.map((item: any) => (
        <div key={item.id} className="card-content-item">
          <div className="card-content-item-tag">
            {item?.is_master_doc === 1 && <Tag color="#FFAA00">主教材</Tag>}
            {/* 解析状态 */}
            {props?.checkProgress(item)}
          </div>
          {/* 多选框 */}
          {props?.showType == "checkbox" && (
            <Checkbox
              // 设置复选框的选中状态
              checked={checkedFn(item)}
              // 当复选框状态改变时，调用onChangeCheck函数
              onChange={() => onChangeCheck(item)}
              // 设置复选框的禁用状态
              disabled={disabledFn(item)}
            />
          )}

          {props?.showType == "radio" && (
            <>
              {radioShowText && (
                <div
                  className={
                    disabledFn(item)
                      ? "card-content-item-progress"
                      : "card_radio_box"
                  }
                >
                  <span className="card_radio_box_title">{getTitle(item)}</span>
                  <Radio
                    checked={checkeRadiodFn(item)}
                    // checked={checkedFn(item)}
                    onChange={() => onChangeCheck(item)}
                    disabled={disabledFn(item)}
                  />
                </div>
              )}
              {!radioShowText && (
                <div className="radio_div_css">
                  <Radio
                    checked={checkeRadiodFn(item)}
                    // checked={checkedFn(item)}
                    onChange={() => onChangeCheck(item)}
                    disabled={disabledFn(item)}
                  />
                </div>
              )}
            </>
          )}

          <div
            className="card-content-item-body"
            onClick={() => props?.onClickView(item)}
          >
            <Image
              preview={false}
              src={formatStaticUrl(item?.first_image)}
              fallback={require("@/assets/default_bg.png")}
            />
          </div>
          <div className="card-content-item-footer">
            <div className="title" title={item.doc_name}>
              <ZYIcon type={handleName(item.doc_name, item.file_type).icon} />
              <span>{handleName(item.doc_name).name}</span>
            </div>
            <div className="desc">
              <div>
                <span>{item?.created_name} · </span>
                <span>{handleTime(item?.updated_time)}更新</span>
              </div>
              {item?.is_master_doc !== 1 && (
                <Dropdown
                  placement="bottom"
                  overlayClassName="menu-icon"
                  className="dropdown_box_less"
                  menu={{
                    items: menuItems,
                    onClick: (e: any) => props?.menuClick(e, item),
                  }}
                >
                  <Button type="text" size="small" icon={<MoreOutlined />} />
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Card;
