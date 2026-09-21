import { Flex, Tabs, Segmented, Tag, Button } from "antd";
import { useSelector, useSearchParams, useDispatch } from "umi";
import { useHeader } from "../../hooks/useHeader";
import { addNewTracking } from "@/utils";
import { ZYIcon } from "@/components";
import {
  FilterOutlined,
  PartitionOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useEffect, useRef } from "react";

import LessonPlansTab from "../LessonPlansTab";
import CoursewareTab from "../CoursewareTab";
import KnowledgeGraphTab from "../KnowledgeGraphTab";
import MaterialLibrary from "../MaterialLibrary";

import "./index.less";

const RESOURCE_TABS: any = {
  question: [
    { key: "public", label: "公共题库", isIndependent: false, component: null },
    {
      key: "personal",
      label: "个人题库",
      isIndependent: false,
      component: null,
    },
    {
      key: "kgraph",
      label: "知识图谱",
      isIndependent: true,
      component: <KnowledgeGraphTab />,
    },
    {
      key: "lesson-plans",
      label: "教案",
      isIndependent: true,
      component: (
        <MaterialLibrary type="plans">
          <LessonPlansTab />
        </MaterialLibrary>
      ),
    },
    {
      key: "courseware",
      label: "课件",
      isIndependent: true,
      component: (
        <MaterialLibrary type="courseware">
          <CoursewareTab />
        </MaterialLibrary>
      ),
    },
  ],
  paper: [
    { key: "public", label: "公共试卷" },
    { key: "personal", label: "个人试卷" },
  ],
};

export const isIndependentTab = (activeTab: string) => {
  return Boolean(
    RESOURCE_TABS["question"]?.find((item: any) => item.key === activeTab)
      ?.isIndependent,
  );
};

export const getIndependentTabView = (activeTab: string) => {
  return (
    RESOURCE_TABS["question"]?.find((item: any) => item.key === activeTab)
      ?.component ?? null
  );
};

const Header = () => {
  const [searchParams] = useSearchParams();
  // 从models获取数据
  const {
    activeTab,
    checkedKnowledge = [],
    graphNode,
  } = useSelector((state: any) => state.resourceSearchModel);
  const dispatch = useDispatch();
  const lastTraditional = useRef("public");
  useEffect(() => {
    if (activeTab !== "kgraph") lastTraditional.current = activeTab;
  }, [activeTab]);
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
  const switchTextbook = (
    <div
      className="switch-textbook-box"
      onClick={() => {
        switchTextbookFn();
        // addNewTracking({
        //   bt: 'cl',
        //   ct: 'qbank_page_switch_latest_q_textbook_click',
        // })
      }}
    ></div>
  );

  return (
    <Flex vertical gap={16} className="resource-header">
      <div className="resource-mode-header">
        <div>
          <h1>资源平台</h1>
          <p>初中数学 · 备课与练习资源</p>
        </div>
        <Segmented
          value={activeTab === "kgraph" ? "graph" : "tags"}
          onChange={(value) => {
            if (value === "tags" && graphNode)
              dispatch({
                type: "resourceSearchModel/setData",
                payload: { checkedKnowledge: [graphNode] },
              });
            setActiveTab(
              value === "graph" ? "kgraph" : lastTraditional.current,
            );
          }}
          options={[
            { value: "tags", label: "传统标签筛选", icon: <FilterOutlined /> },
            {
              value: "graph",
              label: "知识图谱筛选",
              icon: <PartitionOutlined />,
            },
          ]}
        />
      </div>
      {/* 资源归属标签页 */}
      {activeTab !== "kgraph" && (
        <div className="resource-tabs">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarExtraContent={activeTab == "personal" ? switchTextbook : ""}
            items={RESOURCE_TABS.question.filter(
              (item: any) => item.key !== "kgraph",
            )}
          />
        </div>
      )}
      {activeTab !== "kgraph" && checkedKnowledge.length > 0 && (
        <div className="resource-selection">
          <span>当前知识点</span>
          {checkedKnowledge.map((node: string) => (
            <Tag
              key={node}
              closable
              onClose={() =>
                dispatch({
                  type: "resourceSearchModel/setData",
                  payload: {
                    checkedKnowledge: checkedKnowledge.filter(
                      (id: string) => id !== node,
                    ),
                  },
                })
              }
            >
              {node}
            </Tag>
          ))}
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={() =>
              dispatch({
                type: "resourceSearchModel/setData",
                payload: { checkedKnowledge: [] },
              })
            }
          >
            清空知识点
          </Button>
        </div>
      )}
    </Flex>
  );
};

export default Header;
