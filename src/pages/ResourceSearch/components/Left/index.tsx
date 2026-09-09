import { useState, useMemo, useEffect } from "react";
import { Tree, Input, Empty, Flex, Tooltip, Cascader } from "antd";
import { useDispatch, useSelector } from "umi";
import { useLeft } from "../../hooks/useLeft";
import { useRight } from "../../hooks/useRight";
import { useXkwTextbookCascader } from "@/pages/SettingTopic/hooks/useXkwTextbookCascader";
import ZYIcon from "@/components/ZYIcon";
import { useHeader } from "../../hooks/useHeader";
import GradeSubjectDropdown from "../GradeSubjectDropdown";

import "./index.less";

const { Search } = Input;

const PersonalTextbookCascader = () => {
  const dispatch = useDispatch();
  const { loadChapterTree } = useLeft();
  const { loadPersonalFilterOptions } = useHeader();
  const {
    cascaderOptions,
    cascaderValue,
    loadCascaderData,
    onCascaderChange,
  } = useXkwTextbookCascader();
  const { xkwTextbookId, xkwCourseId } = useSelector(
    (state: any) => state.settingTopicModel,
  );

  useEffect(() => {
    if (!xkwTextbookId) return;
    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        textbookId: xkwTextbookId,
        textbookVersion: cascaderValue?.[1] ?? "",
      },
    });
    loadChapterTree(xkwTextbookId);
  }, [xkwTextbookId]);

  useEffect(() => {
    if (!xkwCourseId) return;
    loadPersonalFilterOptions(xkwCourseId);
  }, [xkwCourseId]);

  return (
    <Cascader
      className="setting_topic_title_cascader"
      placeholder="请选择课程 / 版本 / 教材"
      options={cascaderOptions}
      value={cascaderValue}
      loadData={loadCascaderData}
      onChange={onCascaderChange}
      changeOnSelect={false}
      allowClear={false}
      displayRender={(labels) => labels.join(" / ")}
      style={{ flex: 1, minWidth: 0 }}
      prefix={
        <img style={{width:'18px',transform: 'translateY(-1px)'}} src={require("@/assets/personalquestionbank.png")} />
      }
      suffixIcon={<ZYIcon type="xiajiantou" style={{ fontSize: 14, color: '#64748B' }} />}
    />
  );
};

// Tab配置
const TAB_CONFIG = [
  {
    key: 'knowledge',
    label: '知识点',
    placeholder: '搜索知识点',
    emptyDescription: '未找到匹配的知识点，\n请更换关键字'
  },
  // {
  //   key: 'chapter',
  //   label: '章节',
  //   placeholder: '输入关键字过滤章 / 节',
  //   emptyDescription: '当前版本，暂无章节目录'
  // }
];

const Left = () => {
  const {
    activeTab,
    catalogType,
    isCatalogOpen,
    knowledgeTree,
    chapterTree,
    checkedKnowledge,
    checkedChapter,
    expandedKeys,
    chapterExpandedKeys,
    autoExpandParent,
    chapterAutoExpandParent,
    textbookVersion,
    textbooksList = [],
    gradeName,
    subjectName,
    textbookId,
    catalogueTree
  } = useSelector((state: any) => state.resourceSearchModel);

  // 从hooks获取状态变更操作
  const {
    onTreeCheck,
    getTreeKeys,
    onTreeExpand,
    onKnowledgeSearch,
    onChapterTreeCheck,
    onChapterTreeExpand,
    onChapterSearch,
    setIsCatalogOpen,
  } = useLeft();

  // 获取试题列表加载函数
  const { loadQuestionList } = useRight();

  // 统一的搜索文本状态
  const [searchText, setSearchText] = useState("");

  // 当前tab配置
  const currentTabConfig = TAB_CONFIG.find(tab => tab.key === catalogType) || TAB_CONFIG[0];

  // 切换tab时重置搜索文本
  useEffect(() => {
    setSearchText("");
  }, [catalogType]);

  // 当前树数据和状态（根据catalogType动态获取）
  const currentTreeData = catalogType === 'knowledge' ? knowledgeTree : chapterTree;
  const currentCheckedKeys = catalogType === 'knowledge' ? checkedKnowledge : checkedChapter;
  const currentExpandedKeys = catalogType === 'knowledge' ? expandedKeys : chapterExpandedKeys;
  const currentAutoExpandParent = catalogType === 'knowledge' ? autoExpandParent : chapterAutoExpandParent;

  // 统一的树节点选择处理
  const handleTreeCheck = (checked: any, info: any) => {
    if (activeTab === 'personal') {
      let checkedKeysValue = info.checkedNodes?.map((item: any) => {
        return item?.id ?? item?.key
      })

      onChapterTreeCheck(checkedKeysValue)
      loadQuestionList([], checkedKeysValue, 1)
    } else if (activeTab === 'public') {
      const checkedKeysValue = checked.checked || checked;

      if (catalogType === 'knowledge') {
        onTreeCheck(checked);
        // 选择知识点后加载试题列表
        if (gradeName && subjectName) {
          loadQuestionList(checkedKeysValue, [], 1);
        }
      } else {
        onChapterTreeCheck(checked);
        // 选择章节后加载试题列表
        if (gradeName && subjectName) {
          loadQuestionList([], checkedKeysValue, 1);
        }
      }
    }
  };

  // 从教材列表中提取版本选项
  const versionOptions = useMemo(() => {
    const versions = new Set<string>();
    textbooksList.forEach((item: any) => {
      if (item.version) {
        versions.add(item.version);
      }
    });
    return Array.from(versions).map(version => ({
      label: version,
      value: version,
    }));
  }, [textbooksList]);

  // 获取所有节点的key（用于展开）
  const getAllNodeKeys = (nodes: any[]): string[] => {
    const keys: string[] = [];

    const traverse = (node: any) => {
      keys.push(node.key || node.book_id);
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    nodes.forEach(traverse);
    return keys;
  };

  // 高亮匹配文字的渲染函数
  const renderHighlightText = (text: string, searchText: string) => {
    if (!searchText) return text;

    const regex = new RegExp(`(${searchText})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} style={{ color: '#722ed1', fontWeight: 'bold' }}>
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  // 为所有子节点添加高亮逻辑的辅助函数
  const addHighlightToAllChildren = (node: any, searchText: string): any => {
    const nodeText = node.name || node.title || '';
    const highlightedNode = {
      ...node,
    };

    // 根据树类型设置高亮标题
    const titleField = catalogType === 'knowledge' ? 'title' : 'name';
    highlightedNode[titleField] = renderHighlightText(nodeText, searchText);

    // 递归处理所有子节点，为它们也添加高亮
    if (node.children && node.children.length > 0) {
      highlightedNode.children = node.children.map((child: any) =>
        addHighlightToAllChildren(child, searchText)
      );
    }

    return highlightedNode;
  };

  // 搜索过滤树节点
  const filterTreeData = (nodes: any[], searchText: string): any[] => {
    if (!searchText) return nodes;

    const filtered: any[] = [];

    const traverse = (node: any): any | null => {
      // 对于章节树使用name字段，对于知识点树使用title字段
      const nodeText = node.name || node.title || '';
      const textMatch = nodeText.toLowerCase().includes(searchText.toLowerCase());

      // 如果当前节点匹配，直接返回包含所有子节点的节点（停止继续搜索子节点）
      if (textMatch) {
        return addHighlightToAllChildren(node, searchText);
      }

      // 如果当前节点不匹配，递归搜索子节点
      const filteredChildren = node.children
        ? node.children.map(traverse).filter(Boolean)
        : [];

      // 如果有匹配的子节点，则保留当前节点
      if (filteredChildren.length > 0) {
        const highlightedNode = {
          ...node,
          children: filteredChildren,
        };

        // 为当前节点添加高亮（虽然不匹配，但可能包含匹配的关键词）
        const titleField = catalogType === 'knowledge' ? 'title' : 'name';
        highlightedNode[titleField] = renderHighlightText(nodeText, searchText);

        return highlightedNode;
      }

      return null;
    };

    nodes.forEach(node => {
      const result = traverse(node);
      if (result) filtered.push(result);
    });

    return filtered;
  };

  // 过滤后的树数据
  const filteredTreeData = useMemo(() => {
    return filterTreeData(currentTreeData, searchText);
  }, [currentTreeData, searchText, catalogType]);

  // 统一的搜索处理
  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();
    setSearchText(trimmedValue);

    if (catalogType === 'knowledge') {
      onKnowledgeSearch(trimmedValue);
      if (trimmedValue) {
        // 如果有搜索内容，展开所有节点
        const allKeys = getAllNodeKeys(knowledgeTree);
        onTreeExpand(allKeys);
      } else {
        // 如果搜索内容为空，还原到默认展开状态（只展开第一级）
        const firstLevelKeys = knowledgeTree.map((node: any) => node.key);
        onTreeExpand(firstLevelKeys);
      }
    } else {
      onChapterSearch(trimmedValue);
      if (trimmedValue) {
        // 如果有搜索内容，展开所有节点
        const allKeys = getAllNodeKeys(chapterTree);
        onChapterTreeExpand(allKeys);
      } else {
        // 如果搜索内容为空，还原到默认展开状态（只展开第一级）
        const firstLevelKeys = chapterTree.map((node: any) => node.code);
        onChapterTreeExpand(firstLevelKeys);
      }
    }
  };

  // 统一的树展开处理
  const handleTreeExpand = (keys: any) => {
    if (catalogType === 'knowledge') {
      onTreeExpand(keys);
    } else {
      onChapterTreeExpand(keys);
    }
  };

  return (
    <Flex className={`catalog-container ${!isCatalogOpen ? 'collapsed' : ''}`}>
      {!isCatalogOpen ? (
        <Flex className="catalog-close" justify="center">
          <Tooltip title="展开">
            <Flex className="catalog-close-icon" justify="center" align="center" onClick={() => setIsCatalogOpen(true)}>
              <ZYIcon type="arrow-go" className="unfold-icon" />
            </Flex>
          </Tooltip>
        </Flex>
      ) : (
        <Flex className="catalog-tree-panel" vertical gap={8}>
          {/* 折叠按钮 + 目录类型Tab */}
          {activeTab != 'personal' && <Flex className="catalog-tabs-wrapper" vertical>
            <Flex className="catalog-tabs-row" align="center">
              <GradeSubjectDropdown />
              <Tooltip title="收起">
                <Flex className="icon-btn" justify="center" align="center">
                  <ZYIcon
                    type="arrow-go"
                    className="fold-icon"
                    onClick={() => setIsCatalogOpen(false)}
                  />
                </Flex>
              </Tooltip>
            </Flex>
          </Flex>}
          {/* 个人题库 */}
          {activeTab == 'personal' && <Flex className="catalog-tabs-wrapper-individual" align="center">
            <Flex className="custom-tabs">
              <PersonalTextbookCascader />
            </Flex>
            <Tooltip title="收起">
              <Flex className="icon-btn" justify="center" align="center">
                <ZYIcon
                  type="arrow-go"
                  className="fold-icon"
                  onClick={() => setIsCatalogOpen(false)}
                />
              </Flex>
            </Tooltip>
          </Flex>}

          {/* 内容区域 - 使用固定结构避免抖动 */}
          <Flex className="catalog-content" vertical gap={8}>
            {/* 搜索框 */}
            {activeTab != 'personal' && <Search
              placeholder={currentTabConfig.placeholder}
              value={searchText}
              allowClear
              maxLength={30}
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              size="small"
              variant="borderless"
              className="search-input"
              prefix={<ZYIcon type="sousuo" style={{ color: '#94A0B8', fontSize: 14 }} />}
            />}

            {/* 树形组件区域 */}
            {activeTab === 'personal' && <Flex className="tree-wrapper" vertical>
              {catalogueTree?.length > 0 ? (
                <Tree
                  checkable
                  blockNode
                  defaultExpandAll
                  treeData={catalogueTree}
                  className="catalog-tree"
                  onCheck={handleTreeCheck}
                  switcherIcon={
                    <span>
                      <ZYIcon type="xia" style={{ fontSize: 12 }} />
                    </span>
                  }
                  titleRender={(nodeData: any) => {
                    const nodeText = catalogType === 'chapter' ? nodeData.name : nodeData.title;
                    return (
                      <Tooltip title={nodeText}>
                        <div className="tree-node-title">{nodeText}</div>
                      </Tooltip>
                    );
                  }}
                />
              ) : (
                <Empty
                  image={<ZYIcon type="kongshuju" style={{ width: 80, height: 48 }} />}
                  description={
                    catalogType === 'chapter' && (!textbookVersion || !textbookId)
                      ? "请先选择教材版本和学期"
                      : <p>{currentTabConfig.emptyDescription.split('\n').map((line, index) => (
                        <span key={index}>
                          {line}
                          {index < currentTabConfig.emptyDescription.split('\n').length - 1 && <br />}
                        </span>
                      ))}</p>
                  }
                />
              )}
            </Flex>}

            {activeTab === 'public' && <Flex className="tree-wrapper" vertical>
              {filteredTreeData?.length > 0 ? (
                <Tree
                  checkable
                  blockNode
                  treeData={filteredTreeData}
                  checkedKeys={currentCheckedKeys}
                  expandedKeys={currentExpandedKeys}
                  autoExpandParent={currentAutoExpandParent}
                  onExpand={handleTreeExpand}
                  onCheck={handleTreeCheck}
                  fieldNames={catalogType === 'chapter' ? { title: 'name', key: 'code', children: 'children' } : undefined}
                  switcherIcon={
                    <span>
                      <ZYIcon type="xia" style={{ fontSize: 12 }} />
                    </span>
                  }
                  titleRender={(nodeData: any) => {
                    const nodeText = catalogType === 'chapter' ? nodeData.name : nodeData.title;
                    return (
                      <Tooltip title={nodeText}>
                        <div className="tree-node-title">{nodeText}</div>
                      </Tooltip>
                    );
                  }}
                />
              ) : (
                <Empty
                  image={<ZYIcon type="kongshuju" style={{width: 80, height: 48}}/>}
                  description={
                    catalogType === 'chapter' && (!textbookVersion || !textbookId)
                      ? "请先选择教材版本和学期"
                      : <p>{currentTabConfig.emptyDescription.split('\n').map((line, index) => (
                          <span key={index}>
                            {line}
                            {index < currentTabConfig.emptyDescription.split('\n').length - 1 && <br/>}
                          </span>
                        ))}</p>
                  }
                />
              )}
            </Flex>}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export default Left;
