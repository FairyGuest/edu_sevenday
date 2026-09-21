import { Flex } from "antd";
import Header from "./components/Header";
import Left from "./components/Left";
import Right from "./components/Right";
import { useHeader } from "./hooks/useHeader";
import { useLeft } from "./hooks/useLeft";
import { useRight } from "./hooks/useRight";
import { getIndependentTabView, isIndependentTab } from "./components/Header";
import "./index.less";
import { useDispatch, useSelector } from "umi";
import { useEffect } from "react";

const ResourceSearch = () => {
  const dispatch = useDispatch();

  // 获取hooks中的状态变更操作
  const { initData } = useHeader();
  const { getTreeKeys, loadKnowledgeTree } = useLeft();
  const { loadQuestionList } = useRight();

  // 从models获取状态
  const {
    gradeName,
    subjectName,
    activeTab,
    searchText,
    filters,
    catalogueTree,
    pagination,
    checkedChapter,
    checkedKnowledge,
  } = useSelector((state: any) => state.resourceSearchModel);
  const { xkwStageName, xkwSubjectName } = useSelector(
    (state: any) => state.settingTopicModel,
  );

  const independentTabView = getIndependentTabView(activeTab);
  const independent = isIndependentTab(activeTab);
  useEffect(
    () => () => {
      dispatch({ type: "resourceSearchModel/invalidateQuestions" });
    },
    [activeTab],
  );

  // 初始化数据：字典数据、用户选择数据（没有前置依赖，只需要加载一次）
  useEffect(() => {
    initData();
  }, []);

  // 个人题库：xkw 学段学科属于选课级联状态（settingTopicModel），资源平台直达时未初始化会导致列表永不加载
  useEffect(() => {
    if (xkwStageName && xkwSubjectName) return;
    let dead = false;
    fetch("/api/web/mindQuestion/getTeacherStageId")
      .then((r) => r.json())
      .then(async (stageRes: any) => {
        if (dead || stageRes.code !== 200) return;
        const courseRes = await fetch(
          "/api/web/xkwCourse/findXkwCourseListByStageId",
        ).then((r) => r.json());
        if (dead || courseRes.code !== 200 || !courseRes.data?.length) return;
        dispatch({
          type: "settingTopicModel/updateState",
          res: {
            xkwStageName: stageRes.data.stageName || "",
            xkwSubjectName:
              courseRes.data[0].subject_name || courseRes.data[0].name || "",
            xkwCourseId: courseRes.data[0].id,
          },
        });
      })
      .catch(() => {
        /* 初始化失败不阻断公共题库链路 */
      });
    return () => {
      dead = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 独立tab不复用 ResourceSearch 旧的加载链路
    if (independent) return;

    if (gradeName && subjectName) {
      // 只有试题库模式才加载知识点树和教材列表
      // 学段学科变化时加载知识点树(作为异步js模块从本地加载)
      // loadKnowledgeTree();
      // 加载教材列表 -> 选中第一个版本+该版本下的第一个学期 -> 加载章节树

      // console.log('activeTab',activeTab)

      if (activeTab == "public") {
        loadKnowledgeTree();
      }
      // if(activeTab == 'personal') {
      //   loadTextbooksList();
      // }
    }
  }, [gradeName, subjectName, activeTab, independent]);

  // 筛选条件变化时重置页码为1并加载资源列表
  useEffect(() => {
    // 独立tab不复用旧列表的加载逻辑
    if (independent) return;
    let arr =
      checkedChapter?.length > 0 ? checkedChapter : getTreeKeys(catalogueTree);
    if (activeTab === "personal") {
      if (!xkwStageName || !xkwSubjectName) return;
    } else if (!gradeName || !subjectName) {
      return;
    }
    loadQuestionList(checkedKnowledge, arr, 1);
    // checkedKnowledge：知识图谱筛选/知识点树勾选变化时联动刷新列表
  }, [
    activeTab,
    filters,
    gradeName,
    subjectName,
    searchText,
    independent,
    catalogueTree,
    xkwStageName,
    xkwSubjectName,
    checkedKnowledge,
  ]);

  // 试题篮暂时隐藏，不再拉取试题篮数据
  // useEffect(() => {
  //   if (independent) return;
  //   if (!gradeName || !subjectName) return;
  //   loadQuestionBasket();
  // }, [gradeName, subjectName, activeTab, independent])

  return (
    <Flex
      className="resource-search-container"
      vertical
      style={{ width: "100%", height: "100%" }}
    >
      {/* Header 组件 */}
      <Header />

      {/* 主内容区 */}
      <Flex className="main-content" flex={1}>
        {independent ? (
          independentTabView
        ) : (
          <>
            {/* Left 组件 */}
            <Left />

            {/* Right 组件 */}
            <div className="main-content-right">
              <Right />
            </div>

            {/* 试题篮暂时隐藏 */}
            {/* <QuestionBasket /> */}
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default ResourceSearch;
