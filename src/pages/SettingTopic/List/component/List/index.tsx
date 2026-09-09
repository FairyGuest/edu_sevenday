import { Button, Divider, Dropdown, Modal, Popover, Space, message } from "antd";
import { ExclamationCircleOutlined, MoreOutlined } from "@ant-design/icons";
import { useDispatch } from "@umijs/max";
import { history } from "umi";
import zhinengchutiImg from "@/assets/zhinengchuti.png";
import zidingyizuoyeImg from "@/assets/zidingyizuoye.png";
import shangchuansoutiImg from "@/assets/shangchuansouti.png";
import takeaphoto from "@/assets/takeaphoto.png";
import yuwenzuoyeImg from "@/assets/yuwenzuoye.png";
import yingyuzuoyeImg from "@/assets/yingyuzuoye.png";
import questionbankImg from "@/assets/questionbank.png";
import { ZYIcon } from "@/components";
import {
  EXAM_DISPLAY_STATUS_KEYS,
  getDisplayStatusLabel,
  getExamDisplayStatus,
} from "../../../utils/examListHelpers";
import "./index.less";

const { confirm } = Modal;

interface ListProps {
  examsList?: any[];
  refreshListFn?: () => void;
}

const List = ({ examsList = [], refreshListFn }: ListProps) => {
  const dispatch = useDispatch();

  const delHomework = async (item: any) => {
    const id = item?.exam_id || item?.id;
    if (!id) {
      message.warning("未找到作业ID");
      return;
    }

    const { code }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getExamDeleteExam",
      payload: { id },
    });
    if (code === 200) {
      refreshListFn?.();
      message.success("操作成功");
    }
  };

  const withdrawHomework = async (item: any) => {
    const id = item?.exam_id || item?.id;
    if (!id) {
      message.warning("未找到作业ID");
      return;
    }

    const { code }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getExamRevokeExam",
      payload: { id },
    });
    if (code === 200) {
      refreshListFn?.();
      message.success("操作成功");
    }
  };

  const StatusComponents = (item: any) => {
    const statusClass = getExamDisplayStatus(item);
    const statusLabel = getDisplayStatusLabel(item?.displayStatus);

    return <div className={`status_tag ${statusClass}`}>{statusLabel}</div>;
  };

  const StatusIconComponents = (row: any) => {
    const creationType = row?.paper_type?.creation_type;

    if (creationType === "photo_search_qing_yan") {
      return (
        <div className="setting_topic_list_row_top_box_left_icon_souti">
          <img src={shangchuansoutiImg} alt="" />
          上传搜题
        </div>
      );
    }
    if (
      creationType === "external_question_bank" ||
      creationType === "consistent_question_difficulty" ||
      creationType === "overall_comprehensive_difficulty"
    ) {
      return (
        <div className="setting_topic_list_row_top_box_left_icon_chuti">
          <img src={zhinengchutiImg} alt="" />
          智能出题
        </div>
      );
    }

    return null;
  };

  const PopoverComponents = (item: any) => (
    <>
      {item?.published_class?.length > 0 ? (
        <div className="setting_topic_popover_components_people">
          {item.published_class.map((classItem: any, index: number) => {
            const names = (classItem?.publish_users || [])
              .map((user: any) => user?.name)
              .filter(Boolean)
              .join("、");

            return (
              <p className="setting_topic_popover_components_people_row" key={index}>
                {classItem?.class_name}: {names}
              </p>
            );
          })}
        </div>
      ) : (
        <span>暂无数据</span>
      )}
    </>
  );

  const renderPeople = (item: any) => (
    <span>
      {item?.published_class?.map((classItem: any, index: number) => {
        const names = (classItem?.publish_users || [])
          .map((user: any) => user?.name)
          .filter(Boolean)
          .join("、");

        return (
          <span key={index}>
            {classItem?.class_name}: {names};
          </span>
        );
      })}
    </span>
  );

  const goLinkFn = (item: any, type: string) => {
    const status = getExamDisplayStatus(item);
    const statusType = status === "not_started" || type === "copy" ? "editable" : "noEditable";
    const examId = item?.exam_id ?? item?.id;
    const creationType = item?.paper_type?.creation_type;

    if (type === "look") {
      history.push(
        `/setTopic/homework?examId=${examId}&homeworkType=look&status=${statusType}`,
      );
      return;
    }

    if (creationType === "custom") {
      history.push(
        `/setTopic/homework?examId=${examId}&homeworkType=${type}&status=${statusType}`,
      );
      return;
    }

    if (creationType === "paper") {
      history.push(
        `/setTopic/questions?examId=${examId}&homeworkType=${type}&setType=paper&status=${statusType}`,
      );
      return;
    }
  };

  const clickFn = (type: string, item: any) => {
    if (type === "recallPublish") {
      confirm({
        closable: true,
        title: "你确定要撤回发布吗?",
        icon: <ExclamationCircleOutlined />,
        content: "",
        onOk: async () => {
          await withdrawHomework(item);
        },
      });
      return;
    }

    if (type === "delete") {
      confirm({
        closable: true,
        title: <div>你确定删除该数据吗?</div>,
        icon: (
          <span className="anticon">
            <ZYIcon type="shanchu1" style={{ color: "#EF4444" }} />
          </span>
        ),
        content: "",
        okButtonProps: {
          style: {
            backgroundColor: "red",
            color: "white",
          },
        },
        onOk: async () => {
          await delHomework(item);
        },
      });
      return;
    }

    if (type === "look" || type === "edit") {
      goLinkFn(item, type);
    }
  };

  const RowComponents = (item: any, index: number) => {
    const status = getExamDisplayStatus(item);
    const menuOptions = [
      {
        key: "view",
        label: "查看作业",
        supportStatus: [...EXAM_DISPLAY_STATUS_KEYS],
        onClick: () => clickFn("look", item),
        inDropdown: false,
      },
      {
        key: "edit",
        label: "编辑作业",
        supportStatus: ["not_started"],
        onClick: () => clickFn("edit", item),
        inDropdown: true,
      },
      {
        key: "recallPublish",
        label: "撤回发布",
        supportStatus: ["in_progress"],
        onClick: () => clickFn("recallPublish", item),
        inDropdown: true,
      },
      {
        key: "delete",
        label: "删除",
        supportStatus: ["not_started", "finished", "withdrawn"],
        onClick: () => clickFn("delete", item),
        inDropdown: true,
      },
    ];

    const dropdownItems = menuOptions
      .filter((opt) => opt.supportStatus.includes(status) && opt.inDropdown)
      .map((opt) => ({
        key: opt.key,
        label: <div onClick={opt.onClick}>{opt.label}</div>,
      }));

    return (
      <div className="setting_topic_list_row" key={index}>
        {item?.sharer_name && (
          <div className="share-tag">
            <ZYIcon type="fenxiang" />
            <span className="share-tag-text">共享作业</span>
            <div className="divider" />
            <span>共享人：{item?.sharer_name}</span>
          </div>
        )}
        <div className="setting_topic_list_row_top_box">
          <div className="setting_topic_list_row_top_box_left">
            {StatusIconComponents(item)}
            <div
              className="setting_topic_list_row_top_box_left_title"
              onClick={() => {
                clickFn("look", item);
              }}
            >
              {item?.name}
            </div>
            {StatusComponents(item)}
          </div>
          <div className="setting_topic_list_row_top_box_right">
            <Space size={10}>
              {menuOptions.map(
                (option) =>
                  !option.inDropdown &&
                  option.supportStatus.includes(status) && (
                    <Button
                      key={option.key}
                      onClick={option.onClick}
                      className="setting_topic_list_row_top_box_right_btn"
                    >
                      {option.label}
                    </Button>
                  ),
              )}
            </Space>
            <div className="setting_topic_list_row_top_box_right_more">
              <Dropdown
                menu={{ items: dropdownItems }}
                overlayClassName="setting_topic_title_right_dropdown"
                placement="bottomRight"
                getPopupContainer={(node) => node.parentNode as HTMLElement}
              >
                <Button
                  className="setting_topic_list_row_top_box_right_btn"
                  icon={<MoreOutlined />}
                />
              </Dropdown>
            </div>
          </div>
        </div>
        <div className="setting_topic_list_row_bottom_box_css">
          <div className="setting_topic_list_row_bottom_box">
            <span className="setting_topic_list_row_bottom_box_time_css">
              <span className="setting_topic_list_row_bottom_box_time">
                {item?.createTime ? <>创建：{item.createTime}</> : <>-</>}
              </span>
              <Divider type="vertical" style={{ margin: "4px 0 0 0" }} />
              <span className="setting_topic_list_row_bottom_box_time setting_topic_list_row_bottom_box_time_answer">
                作答：
                {item?.startTime ? (
                  <>
                    {item.startTime} 至 {item.endTime || "-"}
                  </>
                ) : (
                  <>-</>
                )}
              </span>
            </span>
            {item?.published_class?.length > 0 && (
              <Popover
                placement="bottom"
                content={PopoverComponents(item)}
                title="已发布班级"
                arrow={false}
                getPopupContainer={(node) => node.parentNode as HTMLElement}
              >
                <span className="setting_topic_list_row_bottom_box_people">
                  已发布：{renderPeople(item)}
                </span>
              </Popover>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="setting_topic_list_box">
      {examsList.length > 0 ? (
        examsList.map((item, index) => RowComponents(item, index))
      ) : (
        <div className="setting_topic_list_box_empty">
          <ZYIcon type="kongshuju7" />
          <p className="text">暂无数据</p>
        </div>
      )}
    </div>
  );
};

export default List;
