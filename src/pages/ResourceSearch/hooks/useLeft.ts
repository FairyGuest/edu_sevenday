import { useDispatch, useSelector } from "umi";
import { addNewTracking } from "@/utils";
import type { KnowledgeTreeNode } from "../types";
import { loadKnowledgeTree as loadLocalKnowledgeTree } from "../utils/knowledgeTreeLoader";
import { parseXkwTbKPTreeResponse } from "@/pages/SettingTopic/utils/xkwTextbookTreeHelpers";

export const useLeft = () => {
  const dispatch = useDispatch();
  const {
    gradeName,
    subjectName,
    textbookId,
    textbookVersion,
    userSelectionTextbook,
    semester,
    textbooksList,
    knowledgeTree,
    chapterTree,
    expandedKeys,
    chapterExpandedKeys,
    activeTab
  } = useSelector((state: any) => state.resourceSearchModel);

  // 获取节点的所有子节点key
  const getChildrenKeys = (nodes: any[], targetKeys: string[], keyField = 'key'): string[] => {
    const childrenKeys: string[] = [];

    const findChildren = (nodeList: any[]) => {
      nodeList.forEach((node: any) => {
        const nodeKey = node[keyField] || node.key || node.code;
        if (targetKeys.includes(nodeKey)) {
          // 找到目标节点，收集其所有子节点
          const collectAllChildren = (children: any[]) => {
            children.forEach((child: any) => {
              const childKey = child[keyField] || child.key || child.code;
              childrenKeys.push(childKey);
              if (child.children && child.children.length > 0) {
                collectAllChildren(child.children);
              }
            });
          };

          if (node.children && node.children.length > 0) {
            collectAllChildren(node.children);
          }
        } else if (node.children && node.children.length > 0) {
          findChildren(node.children);
        }
      });
    };

    findChildren(nodes);
    return childrenKeys;
  };

  // 加载知识点树
  const loadKnowledgeTree = async () => {

    // if(activeTab == 'public') {
    //   addNewTracking({
    //     bt: 'pv',
    //     ct: 'pub_qbank_show'
    //   })
    // }
    try {
      // 设置加载状态 - 暂时注释，加载很快不需要骨架屏
      // dispatch({
      //   type: "resourceSearchModel/setData",
      //   payload: { knowledgeTreeLoading: true }
      // });

      // 从本地JSON文件加载知识点树数据
      const treeData = await loadLocalKnowledgeTree(gradeName, subjectName);
      const firstLevelKeys = treeData.map((node: KnowledgeTreeNode) => node.key);
      dispatch({
        type: "resourceSearchModel/setData",
        payload: {
          knowledgeTree: treeData,
          expandedKeys: firstLevelKeys,
          autoExpandParent: true,
          checkedKnowledge: [],
          // knowledgeTreeLoading: false,
        }
      });
    } catch (error) {
      console.error('加载知识点树失败:', error);
      dispatch({
        type: "resourceSearchModel/setData",
        payload: { knowledgeTreeLoading: false }
      });
    }
  };


  const saveUserSelection = async (
    textbookId?: string,
    textbookVersion?: string,
    stageName = gradeName,
    subjectValue = subjectName
  ) => {
    // 暂时不再调用 /bank/user_selection
  }


  // 获取章节树的全部勾选id
  const getTreeKeys = (val: any) => {
    const _arr: any = []
    const dealwith = (list: any) => {
      return list.map((item: any) => {
        if (item?.children?.length > 0) {
          dealwith(item?.children);
        }
        _arr.push(item?.id ?? item?.key)
        return;
      });
    };
    dealwith(val)
    return _arr
  }

  // 处理教材列表树数据
  const transformToCascader = (treeData: any) => {
    if (!Array.isArray(treeData) || treeData.length === 0) {
      return [];
    }

    return treeData.map(versionItem => {
      // 第一层：版本
      const versionNode = {
        value: versionItem.version_id,
        label: versionItem.version_name,
        // 第二层：教材
        children: versionItem.children?.map((textbook: any) => ({
          value: textbook.textbook_id,
          label: textbook.textbook_name,
        })) || []
      };
      return versionNode;
    });
  };

  // 加载个人题库教材列表
  const loadTextbooksList = async () => {

    // 埋点
    // addNewTracking({
    //   bt: 'pv',
    //   ct: 'ind_qbank_show'
    // })

    const res: any = await dispatch({
      type: "resourceSearchModel/postData",
      apiUrl: 'getVersionTree',
      mTitle: "textbooksListTree",
      payload: {
        stage: gradeName,
        subject: subjectName
      },
    });

    // 回填选择
    const list = res?.data?.version_tree || [];
    const firstVersionId = list?.[0]?.version_id || "";
    const firstTextbookId = list?.[0]?.children?.[0]?.textbook_id || "";

    const selectedVersionId = textbookVersion || firstVersionId;
    const selectedVersionNode = list?.find((item: any) => String(item?.version_id) === String(selectedVersionId));

    const selectedTextbookExists = selectedVersionNode?.children?.some((item: any) => String(item?.textbook_id) === String(textbookId));

    const currentTextbookVersion = selectedVersionNode?.version_id || firstVersionId;
    const currentTextbookId = selectedTextbookExists
      ? textbookId
      : selectedVersionNode?.children?.[0]?.textbook_id || firstTextbookId;

    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        textbookVersion: currentTextbookVersion,
        textbookId: currentTextbookId,
        userSelectionTextbook: {
          ...userSelectionTextbook,
          personalTextbookVersion: currentTextbookVersion,
          personalTextbookId: currentTextbookId
        },
        chapterTree: [],
      }
    });

    if (
      String(textbookId || "") !== String(currentTextbookId || "") ||
      String(textbookVersion || "") !== String(currentTextbookVersion || "")
    ) {
      saveUserSelection(currentTextbookId + "", currentTextbookVersion + "");
    }

    // 加载章节树
    if (currentTextbookId) {
      loadChapterTree(currentTextbookId)
    }
  };

  // 加载章节树
  const loadChapterTree = async (textbookId?: string) => {
    const targetTextbookId = textbookId;
    if (!targetTextbookId) {
      return;
    }

    // 设置加载状态 - 暂时注释，加载很快不需要骨架屏
    // dispatch({
    //   type: "resourceSearchModel/setData",
    //   payload: { chapterTreeLoading: true }
    // });

    try {
      const result: any = await dispatch({
        type: "resourceSearchModel/getData",
        apiUrl: "getCatalogueTree",
        payload: {
          textbookId: targetTextbookId
        },
      });

      // 章节树加载完成后，设置默认展开第一级节点
      if (result?.code === 200) {
        const parsed = parseXkwTbKPTreeResponse(result?.data);
        const catalogueTree = parsed?.catalog_tree || [];

        dispatch({
          type: "resourceSearchModel/setData",
          payload: {
            catalogueTree,
            treeAllKeyIdList: getTreeKeys(catalogueTree),
            chapterAutoExpandParent: true,
            checkedChapter: [], // 重置选中状态
          }
        });
      }

      // dispatch({
      //   type: "resourceSearchModel/setData",
      //   payload: { chapterTreeLoading: false }
      // });
    } catch (error) {
      console.error('加载章节树失败:', error);
      // dispatch({
      //   type: "resourceSearchModel/setData",
      //   payload: { chapterTreeLoading: false }
      // });
    }
  };

  // 知识点树复选框选中
  const onTreeCheck = (checked: any) => {
    const checkedKeysValue = checked.checked || checked;

    // 获取新选中的节点（与之前选中的差集）
    const previousChecked = checked.checked ? [] : checkedKeysValue; // 如果是对象形式，说明有之前的选中状态
    const newlyChecked = Array.isArray(checkedKeysValue) ? checkedKeysValue : [];

    // 获取新选中节点的子节点，需要展开
    const childrenToExpand = getChildrenKeys(knowledgeTree, newlyChecked, 'key');
    const newExpandedKeys = [...new Set([...expandedKeys, ...newlyChecked, ...childrenToExpand])];

    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        checkedKnowledge: checkedKeysValue,
        // 选中知识点时清空章节选中
        checkedChapter: [],
        // 展开选中的节点及其子节点
        expandedKeys: newExpandedKeys
      }
    });
  };

  // 知识点树展开/收起
  const onTreeExpand = (keys: any) => {
    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        expandedKeys: keys,
        autoExpandParent: false
      }
    });
  };

  // 章节树复选框选中
  const onChapterTreeCheck = (checkedList: any) => {
    // const checkedKeysValue = checked.checked || checked;

    // // 获取新选中的节点
    // const newlyChecked = Array.isArray(checkedKeysValue) ? checkedKeysValue : [];

    // // 获取新选中节点的子节点，需要展开
    // const childrenToExpand = getChildrenKeys(chapterTree, newlyChecked, 'code');
    // const newExpandedKeys = [...new Set([...chapterExpandedKeys, ...newlyChecked, ...childrenToExpand])];

    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        checkedChapter: checkedList,
        // 选中章节时清空知识点选中
        // checkedKnowledge: [],
        // 展开选中的节点及其子节点
        // chapterExpandedKeys: newExpandedKeys
      }
    });
  };

  // 章节树展开/收起
  const onChapterTreeExpand = (keys: any) => {
    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        chapterExpandedKeys: keys,
        chapterAutoExpandParent: false
      }
    });
  };

  // // 设置教材版本和教材ID（级联选择时保持受控值一致）
  // const setTextbookSelection = (versionId: string | number, textbookId: string | number) => {
  //   const versionValue = versionId ?? "";
  //   const textbookValue = textbookId ?? "";
  //   dispatch({
  //     type: "resourceSearchModel/setData",
  //     payload: {
  //       textbookVersion: versionValue,
  //       textbookId: textbookValue,
  //       userSelectionTextbook: activeTab === 'public'
  //         ? {
  //           ...userSelectionTextbook,
  //           publicTextbookVersion: versionValue,
  //           publicTextbookId: textbookValue
  //         }
  //         : {
  //           ...userSelectionTextbook,
  //           personalTextbookVersion: versionValue,
  //           personalTextbookId: textbookValue
  //         }
  //     }
  //   });
  // };

  // // 设置学期
  // const setSemester = async (value: string) => {
  //   dispatch({
  //     type: "resourceSearchModel/setData",
  //     payload: {
  //       // semester: value, // 因为semester的值就是教材ID
  //       textbookId: value,
  //     }
  //   });
  // };

  // 设置目录类型
  const setCatalogType = (value: string) => {
    // 计算默认展开的第一级节点
    const knowledgeFirstLevelKeys = knowledgeTree.map((node: any) => node.key);
    const chapterFirstLevelKeys = chapterTree.map((node: any) => node.code);

    dispatch({
      type: "resourceSearchModel/setData",
      payload: {
        catalogType: value,
        // 切换tab时清空选中的节点
        checkedKnowledge: [],
        checkedChapter: [],
        // 恢复展开状态到默认（只展开第一级）
        expandedKeys: knowledgeFirstLevelKeys,
        chapterExpandedKeys: chapterFirstLevelKeys,
        autoExpandParent: true,
        chapterAutoExpandParent: true,
      }
    });
  };

  // 设置目录面板开关
  const setIsCatalogOpen = (value: boolean) => {
    dispatch({
      type: "resourceSearchModel/setData",
      payload: { isCatalogOpen: value }
    });
  };

  // 知识点搜索
  const onKnowledgeSearch = async (value: string) => {
    // 暂时注释搜索加载状态，前端搜索很快，会有闪现效果
    // if (value.trim()) {
    //   // 设置搜索加载状态
    //   dispatch({
    //     type: "resourceSearchModel/setData",
    //     payload: { knowledgeSearchLoading: true }
    //   });

    //   // 模拟搜索延迟
    //   setTimeout(() => {
    //     dispatch({
    //       type: "resourceSearchModel/setData",
    //       payload: { knowledgeSearchLoading: false }
    //     });
    //   }, 500);
    // } else {
    //   dispatch({
    //     type: "resourceSearchModel/setData",
    //     payload: { knowledgeSearchLoading: false }
    //   });
    // }
  };

  // 章节搜索
  const onChapterSearch = async (value: string) => {
    // 暂时注释搜索加载状态，前端搜索很快，会有闪现效果
    // if (value.trim()) {
    //   // 设置搜索加载状态
    //   dispatch({
    //     type: "resourceSearchModel/setData",
    //     payload: { chapterSearchLoading: true }
    //   });

    //   // 模拟搜索延迟
    //   setTimeout(() => {
    //     dispatch({
    //       type: "resourceSearchModel/setData",
    //       payload: { chapterSearchLoading: false }
    //     });
    //   }, 500);
    // } else {
    //   dispatch({
    //     type: "resourceSearchModel/setData",
    //     payload: { chapterSearchLoading: false }
    //   });
    // }
  };

  return {
    loadKnowledgeTree,
    loadTextbooksList,
    loadChapterTree,
    onTreeCheck,
    onTreeExpand,
    onKnowledgeSearch,
    onChapterTreeCheck,
    onChapterTreeExpand,
    onChapterSearch,
    // setTextbookSelection,
    // setSemester,
    setCatalogType,
    setIsCatalogOpen,
    transformToCascader,
    getTreeKeys,
    saveUserSelection
  };
};
