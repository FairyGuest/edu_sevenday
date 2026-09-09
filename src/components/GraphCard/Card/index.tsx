import { Button, Dropdown, Checkbox, Image, Radio, Tag } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { formatStaticUrl, deepCopy, handleName, handleTime } from "@/utils";
import { useState, useEffect } from "react";
import { ZYIcon } from "@/components";
import { useLocation } from '@umijs/max';
import dayjs from "dayjs";



// 定义icon菜单选项
const menuItems = [
  {
    key: "rename",
    label: (
      <div>
        <ZYIcon type="edit" />
        <span style={{ margin: "0 20px 0 8px" }}>编辑</span>
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
    curSubject,
    maxNum = 3,
    editPageA = false,
    radioShowText = true, //选择范围/选择 文字是否显示
    selectDirectly = false, // 是否直接选择教材，不选择页码
  } = props;
  const [selectList, setSelectList] = useState([...textbookList]);
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const coursetype = searchParams.get("coursetype");
  const [coursetypeId, setCoursetype] = useState<number>(Number(coursetype)||3); // 课程类型
  useEffect(() => {
    // let arr = textbookList?.map((item: any) => {
    //   return item;
    // });
    // setSelectList(arr);


  }, [textbookList]);

  // 处理时间展示



  const onChangeCheck = (item: any) => {


    console.log("item=====>>>>>", item)



    // console.log("item=====>", item);
    // if (props?.showType == "checkbox") {
    //   let arr = deepCopy(selectList);
    //   let flag_index = selectList?.findIndex((val: any) => {
    //     return val?.id == item?.id;
    //   });
    //   if (flag_index > -1) {
    //     arr?.splice(flag_index, 1);
    //   } else {
    //     arr?.push(item);
    //   }
    //   setSelectList(arr);
    //   props?.checkFn?.(arr);
    // } else if (props?.showType == "radio") {
    //   let flag_arr = dataList?.map((val: any) => {
    //     if (val?.id == item?.id) {
    //       console.log(1);
    //       return {
    //         ...val,
    //         checked: true,
    //       };
    //     }

    //     return {
    //       ...val,
    //       checked: false,
    //     };
    //   });
    //   setSelectList(flag_arr);
    //   let flag = flag_arr?.find((val: any) => {
    //     return val?.id == item?.id && val?.checked;
    //   });
    //   if (
    //     !radioShowText ||
    //     (item?.file_type !== "ppt" &&
    //       item?.file_type !== "pdf" &&
    //       selectDirectly)
    //   ) {
    //     props?.checkFn?.([flag]);
    //   } else {
    //     props?.changeEditPageA?.();
    //     props?.openDrawerFn?.(flag);
    //   }
    // }
  };

  // const checkedFn = (item: any) => {
  //   let flag_index = selectList?.findIndex((val: any) => {
  //     return val?.id == item?.id;
  //   });
  //   if (flag_index > -1) {
  //     return true;
  //   }
  //   return false;
  // };

  // const checkeRadiodFn = (item: any) => {
  //   let flag_index = selectList?.findIndex((val: any) => {
  //     return val?.id == item?.id && val?.checked;
  //   });
  //   if (flag_index > -1) {
  //     return true;
  //   }
  //   return false;
  // };

  // const disabledFn = (item: any) => {
  //   if (item?.progress !== item?.total_progress) {
  //     return true;
  //   }
  //   if (selectList?.length == maxNum) {
  //     let flag_index = selectList?.findIndex((val: any) => {
  //       return val?.id == item?.id;
  //     });
  //     if (flag_index > -1) {
  //       return false;
  //     }
  //     return true;
  //   }
  // };






  return (
    <div className="card-content">
      {dataList?.map((item: any, index: any) => (
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
              checked={item.__checked}
              // 当复选框状态改变时，调用onChangeCheck函数
              // onChange={() => onChangeCheck(item)}
              onChange={() => props?.onChangeCheck?.(item, index)}
              // 设置复选框的禁用状态
              disabled={item.__disabled}
            />
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
              {item?.is_master_doc !== 1 && coursetypeId == 3 && (
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
