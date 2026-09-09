import { Flex, Tabs, Tooltip } from "antd";
import { useSelector, useSearchParams, useDispatch } from "umi";
import { useHeader } from "../../hooks/useHeader";
import { addNewTracking } from "@/utils";
import { ZYIcon } from "@/components";
import { SwapOutlined } from '@ant-design/icons'
import { useEffect, useState } from "react";

import LessonPlansTab from "../LessonPlansTab";
import CoursewareTab from "../CoursewareTab";

import "./index.less";

const RESOURCE_TABS: any = {
  question: [
    { key: "public", label: "公共题库", isIndependent: false, component: null },
    { key: "personal", label: "个人题库", isIndependent: false, component: null },
    { key: "lesson-plans", label: "教案", isIndependent: true, component: <LessonPlansTab /> },
    { key: "courseware", label: "课件", isIndependent: true, component: <CoursewareTab /> },
  ],
  paper: [
    { key: "public", label: "公共试卷" },
    { key: "personal", label: "个人试卷" },
  ],
};

export const isIndependentTab = (activeTab: string) => {
  return Boolean(RESOURCE_TABS['question']?.find((item: any) => item.key === activeTab)?.isIndependent);
};

export const getIndependentTabView = (activeTab: string) => {
  return RESOURCE_TABS['question']?.find((item: any) => item.key === activeTab)?.component ?? null;
};

const Header = () => {
  const [searchParams] = useSearchParams();
  // 从models获取数据
  const { activeTab } = useSelector((state: any) => state.resourceSearchModel);
  // 从hooks获取状态变更操作
  const { setActiveTab, switchTextbookFn } = useHeader();
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   if (activeder) {
  //     dispatch({
  //       type: "resourceSearchModel/setData",
  //       payload: {
  //         activeTab: activeder === "1" ? 'public' : 'personal',
  //       }
  //     });
  //   }
  // }, [activeder])
  const switchTextbook = <div className="switch-textbook-box" onClick={() => {
    switchTextbookFn()
    // addNewTracking({
    //   bt: 'cl',
    //   ct: 'qbank_page_switch_latest_q_textbook_click',
    // })
  }}>
  </div>

  return (
    <Flex vertical gap={16}>
      {/* 资源归属标签页 */}
      <div className="resource-tabs">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={activeTab == 'personal' ? switchTextbook : ''}
          items={RESOURCE_TABS.question}
        />
      </div>
    </Flex>
  );
};

export default Header;
