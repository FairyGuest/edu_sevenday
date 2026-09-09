import { useEffect, useState, useRef } from "react";
import { Layout, Popover, Modal, Progress, Button, Dropdown, message, Divider, Space } from "antd";
import { connect, useDispatch } from "@umijs/max";
import { history, Outlet, useLocation } from "umi";
import { MoreOutlined } from "@ant-design/icons";
import zhinengchutiImg from "@/assets/zhinengchuti.png";
import zidingyizuoyeImg from "@/assets/zidingyizuoye.png";
import shangchuansoutiImg from "@/assets/shangchuansouti.png";
import takeaphoto from "@/assets/takeaphoto.png";
import yuwenzuoyeImg from "@/assets/yuwenzuoye.png";
import yingyuzuoyeImg from "@/assets/yingyuzuoye.png";
import questionbankImg from "@/assets/questionbank.png";
import dailytaskicon from "@/assets/dailytaskicon.png"
import { ZYIcon } from "@/components";

import { ExclamationCircleOutlined } from "@ant-design/icons";

import { addNewTracking } from "@/utils";

import PushClassModal from "@/pages/SettingTopic/components/PushClassModal";
import ShareHomework from "@/components/ShareHomework";

import "./index.less";

const STATUS_MAP: any = {
  pending_publish: "待发布",
  publish_failed: "发布失败",
  not_started: "未开始",
  in_progress: "进行中",
  finished: "已结束",
  parsing: "解析中",
  editing: "编辑中",
  parse_failed: "解析失败",
}

const { Content, Sider } = Layout;
const { confirm } = Modal;

const App = (props: any) => {
  const courseId = props?.courseId
  const { examsList = [] } = props;
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);

  const [row, setRow] = useState<any>({});

  const [isModalOpen, setIsModalOpen] = useState(false);

  const shareHomeworkRef = useRef<any>(null);

  const dispatch = useDispatch();

  // 作业记录删除
  const delHomework = async (item: any) => {
    let payload: any = { paper_id: item?.paper_id };
    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "DelDistributionPaperList",
      payload: payload,
    });
    if (code === 200) {
      addNewTracking({
        bt: 'cl',
        ct: 'home_online_hw_delete_click',
        ctid: item?.exam_id,
        ctvl: item?.title
      })
      props?.refreshListFn?.()
      message.success('操作成功')
    }
  };

  // 未开始作业撤回发布
  const withdrawHomework = async (item: any) => {
    let payload: any = { distribution_id: item?.paper_id };
    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "WithdrawDistributionPaperList",
      payload: payload,
    });
    if (code === 200) {
      addNewTracking({
        bt: 'cl',
        ct: 'home_online_hw_revoke_click',
        ctid: item?.exam_id,
        ctvl: item?.title
      })
      props?.refreshListFn?.()
      message.success('操作成功')
    }
  };

  // 复制并编辑
  const distributionPaperCloneFn = async (exam_id: any) => {
    let payload: any = { exam_id };
    const { code, data }: any = await dispatch({
      type: "setQuestionsModel/postData",
      apiUrl: "distributionPaperClone",
      payload: payload,
    });
    if (code === 200) {
      // props?.refreshListFn?.()
      // message.success('操作成功')
      goLinkFn(data, "copy");
    }
  };

  // 名字后面的状态
  const StatusComponents = (item: any) => (
    <div className={`status_tag ${item?.status}`}>
      {STATUS_MAP[item?.status]}
    </div>
  );

  // 状态icon
  const StatusIconComponents = (row: any) => {
    // type_map = {
    //   external_question_bank: "智能出题",
    //   consistent_question_difficulty: "智能出题",
    //   overall_comprehensive_difficulty: "智能出题",
    //   custom: "快捷作业",
    //   photo_search_qing_yan: "上传搜题",
    //   chinese_composition: "语文作文",
    //   english_composition: "英语作文",
    // };

    if (row?.paper_type?.creation_type == "photo_search_qing_yan") {
      return (
        <div className="setting_topic_list_row_top_box_left_icon_souti icon_title_css">
          <img src={shangchuansoutiImg} alt="" />
          上传搜题
        </div>
      );
    }
    if (row?.paper_type?.creation_type == "photo_search_take_photo") {
      return (
        <div className="setting_topic_list_row_top_box_left_icon_takeaphoto">
          <img src={takeaphoto} alt="" />
          拍照搜题
        </div>
      )
    }
    if (row?.paper_type?.creation_type == "daily_task") {
      return (
        <div className="setting_topic_list_row_top_box_left_icon_dailytasks">
          <img src={dailytaskicon} alt="" />
          日常任务
        </div>
      )
    }
    if (
      row?.paper_type?.creation_type == "external_question_bank" ||
      row?.paper_type?.creation_type == "consistent_question_difficulty" ||
      row?.paper_type?.creation_type == "overall_comprehensive_difficulty"
    ) {
      return (
        <div className="setting_topic_list_row_top_box_left_icon_chuti icon_title_css">
          <img src={zhinengchutiImg} alt="" />
          智能出题
        </div>
      );
    }
    if (row?.paper_type?.creation_type == "custom") {
      return (
        <div className="setting_topic_list_row_top_box_left_icon_zidingyizuoye icon_title_css">
          <img src={zidingyizuoyeImg} alt="" />
          快捷作业
        </div>
      );
    }
    if (row?.paper_type?.creation_type == "chinese_composition") {
      return (
        <div className="setting_topic_list_row_top_box_left_icon_yuwenzuowen icon_title_css">
          <img src={yuwenzuoyeImg} alt="" />
          语文作文
        </div>
      );
    }
    if (row?.paper_type?.creation_type == "english_composition") {
      return (
        <div className="setting_topic_list_row_top_box_left_icon_yingyuzuowen icon_title_css">
          <img src={yingyuzuoyeImg} alt="" />
          英语作文
        </div>
      );
    }

    if (row?.paper_type?.creation_type == "paper") {
      return (
        <div className="setting_topic_list_row_top_box_left_question_bank icon_title_css">
          <img src={questionbankImg} alt="" />
          题库出题
        </div>
      );
    }

    return "";
  };

  const PopoverComponents = (item: any) => {
    return (
      <>
        {item?.published_class?.length > 0 && (
          <div className="setting_topic_popover_components_people">
            {item?.published_class?.map((row: any, index: any) => {
              let str = "";
              row?.publish_users?.map((r: any, i: any) => {
                if (row?.publish_users?.length - 1 === i) {
                  return (str += r?.name);
                }
                return (str += r?.name + "、");
              });

              return (
                <p
                  className="setting_topic_popover_components_people_row"
                  key={index}
                >
                  {row?.class_name}: {str}
                </p>
              );
            })}
          </div>
        )}
        {item?.published_class?.length == 0 && <span>暂无数据</span>}
      </>
    );
  };

  const renderPeople = (item: any) => {
    return (
      <span>
        {item?.published_class?.map((row: any, index: any) => {
          let str = "";
          row?.publish_users?.map((r: any, i: any) => {
            if (row?.publish_users?.length - 1 === i) {
              return (str += r?.name);
            }
            return (str += r?.name + "、");
          });
          return (
            <span key={index}>
              {row?.class_name}: {str};
            </span>
          );
        })}
      </span>
    );
  };

  const shareHomework = (item: any) => {
    shareHomeworkRef.current?.openModal(item, "home");
    addNewTracking({
      bt: 'pv',
      ct: 'home_online_hw_share_hw_modal_show',
      ctid: item?.exam_id,
      ctvl: item?.title
    })
  }

  const clickFn = (type: any, item: any) => {
    // console.log(item);
    // publish 发布  republish 再次发布 delete 删除  recallPublish 撤回发布 edit 修改  look 查看 viewReport 查看报告
    if (type == "publish") {
      console.log("发布", item);
      addNewTracking({
        bt: 'pv',
        ct: 'hw_assign_publish_class_modal_show',
        ctid: item?.exam_id,
        ctvl: item?.title
      })

      setIsModalOpen(true);
      setRow(item);
    }
    if (type == "viewReport") { // 查看报告
      addNewTracking({
        bt: 'cl',
        ct: 'home_online_hw_view_report_click',
        ctid: item?.exam_id,
        ctvl: item?.title
      })
      history.push(
        `/teach/correction?courseId=${courseId}&examId=${item?.exam_id}`,
      );
    }
    if (type == "republish") {

      addNewTracking({
        bt: 'pv',
        ct: 'hw_assign_republish_modal_show',
        ctid: item?.exam_id,
        ctvl: item?.title
      })

      setRow(item);
      console.log("再次发布");
      confirm({
        // maskClosable: true,
        title: (
          <div className="setting_topic_list_modal_title">
            <span>再次发布</span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                Modal.destroyAll();
              }}
            >
              <ZYIcon type="shanchu3" />
            </span>
          </div>
        ),
        content: "复制当前作业生成新副本并发布，原作业不受影响。",
        icon: (
          <span className="anticon anticon-exclamation-circle">
            <ZYIcon type="tishi" />
          </span>
        ),
        okText: "复制并发布",
        cancelText: "复制并编辑",
        onOk: () => {
          console.log("复制并发布");
          addNewTracking({
            bt: 'cl',
            ct: 'hw_assign_republish_copy_publish_click',
            ctid: item?.exam_id,
            ctvl: item?.title
          })
          setIsModalOpen(true);
        },
        onCancel: () => {
          console.log("复制并编辑");
          addNewTracking({
            bt: 'cl',
            ct: 'hw_assign_republish_copy_edit_click',
            ctid: item?.exam_id,
            ctvl: item?.title
          })
          distributionPaperCloneFn(item?.exam_id)
        },
      });
    }
    if (type == "recallPublish") {
      console.log("撤回发布");
      confirm({
        closable: true,
        title: "你确定要撤回发布吗?",
        icon: <ExclamationCircleOutlined />,
        content: "",
        onOk: async () => {
          withdrawHomework(item)
        },
        onCancel() { },
      });
    }
    if (type == "delete") {
      console.log("删除");
      confirm({
        closable: true,
        title: (
          <div>
            <span>你确定删除该数据吗?</span>
          </div>
        ),
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
          console.log('删除', item)
          delHomework(item)
        },
      });
    }
    if (type == "look") {
      addNewTracking({
        bt: 'cl',
        ct: 'hw_assign_record_view_detail_click',
        ctid: item?.exam_id,
        ctvl: item?.title
      })
      goLinkFn(item, type);
    }
    if (type == 'edit') {
      addNewTracking({
        bt: 'cl',
        ct: 'hw_assign_record_edit_click',
        ctid: item?.exam_id,
        ctvl: item?.title
      });
      goLinkFn(item, type);
    }
    if (type == "share") {
      addNewTracking({
        bt: 'cl',
        ct: 'hw_assign_record_share_hw_click',
        ctid: item?.exam_id,
        ctvl: item?.title
      })
      shareHomework(item);
    }
  };

  const goLinkFn = (item: any, type: any) => {
    // status枚举值：pending_publish（待发布）/publish_failed（发布失败）/not_started（未开始）/in_progress（进行中）/finished（已结束）

    let statusType = 'noEditable'   // noEditable 不可编辑  editable 可编辑

    if (item?.status == "pending_publish" || item?.status == "publish_failed" || type == 'copy') {
      statusType = 'editable'
    }

    if (item?.paper_type?.creation_type == "custom") {
      //快捷作业
      history.push(
        `/setTopic/homework?courseId=${courseId}&examId=${item?.exam_id}&homeworkType=${type}&status=${statusType}`,
      );
    }
    if (item?.paper_type?.creation_type == "daily_task") {
      //日常任务
      history.push(
        `/setTopic/dailytask?courseId=${courseId}&examId=${item?.exam_id}&homeworkType=${type}&status=${statusType}`,
      );
    }
    if (
      item?.paper_type?.creation_type == "external_question_bank" ||
      item?.paper_type?.creation_type == "consistent_question_difficulty" ||
      item?.paper_type?.creation_type == "overall_comprehensive_difficulty"
    ) {
      //智能出题
      history.push(
        `/setTopic/questions?courseId=${courseId}&examId=${item?.exam_id}&homeworkType=${type}&setType=chapterTopic&status=${statusType}`,
      );
    }

    if (item?.paper_type?.creation_type == "photo_search_qing_yan" || item?.paper_type?.creation_type == "photo_search_take_photo") {

      // parsing: "解析中",
      // editing: "编辑中",
      // parse_failed: "解析失败",

      if (item?.status == "parsing" || item?.status == "editing") {
        history.push(
          `/setTopic/exercise?courseId=${courseId}&status=${item?.status}&rootTaskId=${item?.root_task_id}`,
        );
      } else {
        //上传搜题
        history.push(
          `/setTopic/questions?courseId=${courseId}&examId=${item?.exam_id}&homeworkType=${type}&setType=uploadTopic&status=${statusType}`,
        );
      }

    }

    if (item?.paper_type?.creation_type == "paper") {
      //题库组题
      history.push(
        `/setTopic/questions?courseId=${courseId}&examId=${item?.exam_id}&homeworkType=${type}&setType=paper&status=${statusType}`,
      );
    }


    if (item?.paper_type?.creation_type == "chinese_composition") {
      //语文作文 chinese
      history.push(
        `/setTopic/composition?courseId=${courseId}&examId=${item?.exam_id}&type=${type}&status=${statusType}&subject=${subject}`,
      );
    }

    if (item?.paper_type?.creation_type == "english_composition") {
      //英语作文 english
      history.push(
        `/setTopic/composition?courseId=${courseId}&examId=${item?.exam_id}&type=${type}&status=${statusType}&subject=${subject}`,
      );
    }
  };

  const RowComponents = (item: any, index: any) => {
    // status枚举值：pending_publish（待发布）/publish_failed（发布失败）/not_started（未开始）/in_progress（进行中）/finished（已结束）/ editing（编辑中）/ parsing（解析中）/ parse_failed（解析失败）
    const isItemDisabled = item?.status === 'parse_failed';
    const menuOptions: any = [
      {
        key: "viewReport",
        label: "查看作业",
        supportStatus: ["pending_publish", "publish_failed", "not_started", "in_progress", "finished", "editing", "parsing", "parse_failed"],
        onClick: () => clickFn("look", item),
        inDropdown: false
      },
      {
        key: "viewReport",
        label: "查看报告",
        supportStatus: ["in_progress", "finished"],
        onClick: () => clickFn("viewReport", item),
        inDropdown: false
      },
      {
        key: "publish",
        label: "发布作业",
        supportStatus: ["pending_publish", "publish_failed"],
        onClick: () => clickFn("publish", item),
        inDropdown: false
      },
      {
        key: "edit",
        label: "编辑作业",
        supportStatus: ["pending_publish", "publish_failed", "editing"],
        onClick: () => clickFn("edit", item),
        inDropdown: true
      },
      {
        key: "share",
        label: "共享作业",
        supportStatus: ["pending_publish", "publish_failed", "not_started", "in_progress", "finished"],
        onClick: () => clickFn("share", item),
        inDropdown: true
      },
      {
        key: "recallPublish",
        label: "撤回发布",
        supportStatus: ["not_started"],
        onClick: () => clickFn("recallPublish", item),
        inDropdown: true
      },
      {
        key: "republish",
        label: "再次发布",
        supportStatus: ["not_started", "in_progress", "finished"],
        onClick: () => clickFn("republish", item),
        inDropdown: true
      },
      {
        key: "delete",
        label: "删除",
        supportStatus: ["pending_publish", "publish_failed", "not_started", "parsing", "parse_failed", "editing"],
        onClick: () => clickFn("delete", item),
        inDropdown: true
      }
    ];

    const dropdownItems: any = menuOptions
      .filter((opt: any) => opt.supportStatus?.includes(item?.status) && opt.inDropdown)
      .map((opt: any) => ({
        key: opt.key,
        label: (
          <div onClick={opt.onClick}>
            {opt.label}
          </div>
        )
      }));

    let percentNumber = item?.published_total
      ? Math.floor(item?.submitted_total / item?.published_total * 100)
      : 0;

    let alreadyPercentNumber = item?.submitted_total
      ? Math.floor((item?.submitted_total - item?.teacher_unread_total) / item?.submitted_total * 100)
      : 0;

    let dailyTaskPercentNumber = item?.submitted_total
      ? Math.floor(item?.submitted_total / item?.published_total * 100)
      : 0;
    let compositionPercentNumber = item?.running_days
      ? Math.floor(item?.running_days / item?.total_days * 100)
      : 0;
    return (
      <div className={`setting_topic_list_row${isItemDisabled ? ' disabled' : ''}`} key={index}>
        {item?.sharer_name && <div className="share-tag">
          <ZYIcon type='fenxiang' />
          <span className="share-tag-text">共享作业</span>
          <div className="divider" />
          <span>共享人：{item?.sharer_name}</span>
        </div>}
        <div className="setting_topic_list_row_top_box">
          <div className="setting_topic_list_row_top_box_left">
            <>{StatusIconComponents(item)}</>
            <div className="setting_topic_list_row_top_box_left_title" onClick={() => {
              if (isItemDisabled) return;
              addNewTracking({
                bt: 'cl',
                ct: 'hw_assign_record_title_click',
                ctid: item?.exam_id,
                ctvl: item?.title
              })
              clickFn("look", item);
            }}>
              {item?.title}
            </div>
            <>{StatusComponents(item)}</>
          </div>
          <div className="setting_topic_list_row_top_box_right">
            <Space size={10}>
              {menuOptions.map((i: any) => !i.inDropdown && i.supportStatus?.includes(item?.status) && (
                <Button
                  key={i.key}
                  onClick={i.onClick}
                  className="setting_topic_list_row_top_box_right_btn"
                  disabled={isItemDisabled}
                >
                  {i.label}
                </Button>
              ))}
            </Space>
            <div className="setting_topic_list_row_top_box_right_more">
              <Dropdown
                menu={{ items: dropdownItems }}
                overlayClassName="setting_topic_title_right_dropdown"
                placement={'bottomRight'}
                getPopupContainer={(node) => node.parentNode as HTMLElement}
              >
                <Button className="setting_topic_list_row_top_box_right_btn" icon={<MoreOutlined />}></Button>
              </Dropdown>
            </div>
          </div>
        </div>
        <div className="setting_topic_list_row_bottom_box_css">
          <div className="setting_topic_list_row_bottom_box">
            <div className="setting_topic_list_row_left_box">
              <div className="setting_topic_list_row_bottom_box_top">
                <span className="setting_topic_list_row_bottom_box_time_css">
                  <span className="setting_topic_list_row_bottom_box_time">
                    {item?.created_at && (
                      <>
                        创建：{item?.created_at || "-"}
                      </>
                    )}
                    {!item?.created_at && <>-</>}
                  </span>
                  <Divider type='vertical' style={{ margin: '4px 0 0 0' }} />
                  <span className="setting_topic_list_row_bottom_box_time  setting_topic_list_row_bottom_box_time_answer">
                    作答：
                    {item?.start_time && (
                      <>
                        {item?.start_time || "-"} 至 {item?.deadline || "-"}
                      </>
                    )}
                    {!item?.start_time && <>-</>}
                  </span>
                  {
                    item?.is_periodic && item?.paper_type?.creation_type == "daily_task" && (
                      <Divider type='vertical' style={{ margin: '4px 0 0 0' }} />
                    )
                  }
                  {
                    item?.is_periodic && item?.paper_type?.creation_type == "daily_task" && (
                      <span className="setting_topic_list_row_bottom_box_timeder">
                        频率 : {item?.frequency}
                      </span>
                    )
                  }
                </span>
              </div>
              <div>
                <span>
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
                </span>
              </div>
            </div>
            {item?.paper_type?.creation_type != "daily_task" && <div>
              <p style={{ marginBottom: '8px' }}>
                <span className="setting_topic_list_row_bottom_box_progress">
                  <span className="progress">
                    <Progress
                      percent={percentNumber}
                      showInfo={false}
                      strokeColor={'#486AFF'}
                      size="small"
                      trailColor={'#E2E6F0'}
                    />
                  </span>
                  <span className="submit_num">
                    <i>{item?.submitted_total}</i>/{item?.published_total || 0}
                    人提交
                  </span>
                </span>
              </p>
              <p style={{ marginBottom: '8px' }}>
                <span className="setting_topic_list_row_bottom_box_progress">
                  <span className="progress">
                    <Progress
                      percent={alreadyPercentNumber}
                      showInfo={false}
                      strokeColor={'#486AFF'}
                      size="small"
                      trailColor={'#E2E6F0'}
                    />
                  </span>
                  <span className="submit_num">
                    <i>{item?.submitted_total - item?.teacher_unread_total}</i>/{item?.submitted_total || 0}
                    人已阅
                  </span>
                </span>
              </p>
            </div>}
            {item?.paper_type?.creation_type == "daily_task" && <div>
              {
                item?.is_periodic && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                  }}>
                    <p style={{ marginBottom: '8px' }}>
                      <span className="setting_topic_list_row_bottom_box_progress">
                        <span className="progress">
                          <Progress
                            percent={compositionPercentNumber}
                            showInfo={false}
                            strokeColor={'#486AFF'}
                            size="small"
                            trailColor={'#E2E6F0'}
                          />
                        </span>
                        <span className="submit_num">
                          <i>{item?.running_days || 0}</i>/{item?.total_days || 0}进行天数
                        </span>
                      </span>
                    </p>
                  </div>
                ) || (
                  <>
                    <p style={{ marginBottom: '8px' }}>
                      <span className="setting_topic_list_row_bottom_box_progress">
                        <span className="progress">
                          <Progress
                            percent={dailyTaskPercentNumber}
                            showInfo={false}
                            strokeColor={'#486AFF'}
                            size="small"
                            trailColor={'#E2E6F0'}
                          />
                        </span>
                        <span className="submit_num">
                          <i>{item?.submitted_total || 0}</i>/{item?.published_total || 0}人提交
                        </span>
                      </span>
                    </p>
                    <p style={{ marginBottom: '8px' }}>
                      <span className="setting_topic_list_row_bottom_box_progress">
                        <span className="progress">
                          <Progress
                            percent={alreadyPercentNumber}
                            showInfo={false}
                            strokeColor={'#486AFF'}
                            size="small"
                            trailColor={'#E2E6F0'}
                          />
                        </span>
                        <span className="submit_num">
                          <i>{item?.submitted_total - item?.teacher_unread_total}</i>/{item?.submitted_total || 0}
                          人已阅
                        </span>
                      </span>
                    </p>
                  </>
                )
              }
            </div>
            }
          </div>
        </div>
      </div >
    );
  };

  return (
    <div className="setting_topic_list_box_home">
      {examsList?.length > 0 && (
        <>
          {examsList?.map((item: any, index: any) => {
            return <div key={index} className="setting_topic_list_row_box">
              {RowComponents(item, index)}
              <div className="setting_topic_list_row_line"></div>
            </div>
          })}
        </>
      )}
      {isModalOpen && <PushClassModal
        course_id={courseId}
        title={row?.title}
        exam_id={row?.exam_id}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        refreshListFn={() => {
          addNewTracking({
            bt: 'cl',
            ct: 'home_online_hw_publish_class_confirm_click',
            ctid: row?.exam_id,
            ctvl: row?.title
          })
          console.log('刷新列表')
          props?.refreshListFn?.()
        }}
      />}
      <ShareHomework onRef={shareHomeworkRef} />
    </div>
  );
};

export default connect((state: any) => ({
  aiClassroomModel: state.aiClassroomModel,
  commonModel: state.commonModel,
  authModel: state.authModel,
}))(App);
