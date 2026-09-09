import { useState, useEffect } from "react";
import { Empty, Modal, Form, Input, Skeleton, Dropdown, Button, Tooltip } from "antd";
import { useDispatch, useRequest, history } from "@umijs/max";
import ZYIcon from "@/components/ZYIcon";
import Tracker from "@/components/Tracker";
import { MoreOutlined } from "@ant-design/icons";
import { getOrgId } from "@/utils";

import "./index.less";

const HistoryList = (props: any) => {
  const dispatch = useDispatch();
  const [renameForm] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const [isRenameVisible, setIsRenameVisible] = useState<boolean>(false); // 重命名弹窗是否显示
  const [planListLoading, setPlanListLoading] = useState<any>([]); // 教案列表loading
  const [planList, setPlanList] = useState<any>([]); // 教案列表
  const [editItem, setEditItem] = useState<any>(null); // 当前列表编辑项

  useEffect(() => {
    getTeachPlanList();
  }, []);

  // 获取教案列表
  const getTeachPlanList = async () => {
    setPlanListLoading(true);
    const { code, data }: any = await dispatch({
      type: "teachDesginModel/getData",
      apiUrl: "getPlanListUrl",
      payload: {
        org_id: getOrgId(),
        page: 1,
        page_size: 200,
      },
    });
    if (code === 200) {
      setPlanList(data?.list || []);
    }
    setPlanListLoading(false);
  };

  // 重命名提交
  const { run, loading } = useRequest(
    async (values: any) => {
      const { code }: any = await dispatch({
        type: "teachDesginModel/postData",
        apiUrl: "postEditPlanUrl",
        payload: { ...values, id: editItem?.id },
      });
      if (code === 200) {
        getTeachPlanList();
      }
      setIsRenameVisible(false);
    },
    { manual: true }, // 手动触发
  );

  // 跳转详情页
  const goDetail = async (item: any) => {
    await dispatch({
      type: "teachDesginModel/setData",
      payload: { planParams: item },
    });
    if(item?.type == 1){
      history.push("/design/hour");
    }else {
      history.push("/design/unit");
    }
  };

  // 教案列表loading
  const renderSkeletons = () => {
    return Array.from({ length: 10 }).map((_, index) => (
      <div className="list-item" key={`skeleton-${index}`}>
        <Skeleton active round paragraph={{ rows: 2 }} />
      </div>
    ));
  };

  // icon菜单点击事件
  const menuClick = (e: any, item: any) => {
    e.domEvent.stopPropagation();
    if (e.key === "delete") {
      modal.confirm({
        className: "delete-confirm",
        title: "确定删除对话？",
        icon: <ZYIcon type="shanchu1" className="delete-icon" />,
        content: "删除后聊天记录将不可恢复",
        okText: "删除",
        okButtonProps: { danger: true },
        onOk: async () => {
          const { code }: any = await dispatch({
            type: "teachDesginModel/postData",
            apiUrl: "postDeletePlanUrl",
            payload: { id: item.id },
          });
          if (code === 200) {
            // 删除成功后刷新列表
            getTeachPlanList();
          }
        },
      });
    } else if (e.key === "rename") {
      setIsRenameVisible(true);
      setEditItem(item);
      renameForm.setFieldsValue({
        title: item.title,
      });
    }
  };

  // 列表渲染
  const listRender = (data: any) => {
    return data.map((item: any) => (
      // <Tracker
      //   key={item.id}
      //   eventType="click"
      //   trackData={{
      //     bt: "cl",
      //     ct: "teaching_design_history_click_plan_detail",
      //     extra: {
      //       tab_type: item?.type === 2 ? "unit_plan" : "lesson_plan",
      //     },
      //   }}
      // >
        <div className="list-item" key={item.id} onClick={() => goDetail(item)}>
          {item?.type === 2 ? (
            <div className="list-item-type unit">单元</div>
          ) : (
            <div className="list-item-type">课时</div>
          )}
          <div className="list-item-content">
            <Tooltip title={item?.title}>
              <div className="title">{item?.title}</div>
            </Tooltip>
            <div className="desc">
              {item?.class_type}
              {item?.type === 2 ? (
                <span className="course_num">{item?.course_num}课时</span>
              ) : null}
            </div>
          </div>
          <Dropdown
            placement="bottom"
            overlayClassName="menu-icon"
            menu={{
              items: [
                { key: "rename", label: "重命名" },
                { key: "delete", label: "删除" },
              ],
              onClick: (e: any) => menuClick(e, item),
            }}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              className="list-item-btn"
            />
          </Dropdown>
        </div>
      // </Tracker>
    ));
  };

  return (
    <div className="teach-design-history">
      <div className="header">
        <div className="title">历史记录</div>
        <Button
          type="text"
          icon={<ZYIcon type="arrow-go" />}
          onClick={() => props?.setCollapse(true)}
        />
      </div>
      <div className="list">
        {planListLoading ? (
          renderSkeletons()
        ) : (
          <>
            {planList.length > 0 ? (
              listRender(planList)
            ) : (
              <div className="empty-content">
                <Empty
                  description="还没有历史对话"
                  image={require("@/assets/history_empty.png")}
                />
              </div>
            )}
          </>
        )}
      </div>
      {contextHolder}
      <Modal
        title={"历史记录重命名"}
        open={isRenameVisible}
        destroyOnHidden
        confirmLoading={loading}
        onCancel={() => setIsRenameVisible(false)}
        onOk={async () => {
          const v = await renameForm.getFieldsValue();
          await run(v);
        }}
      >
        <Form name="renameForm" form={renameForm} layout="vertical">
          <Form.Item
            name="title"
            label="名称"
            rules={[{ required: true, message: "请输入名称" }]}
          >
            <Input placeholder="请输入名称" showCount maxLength={60} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HistoryList;
