export const normalizeCheckedKeys = (keys: any): any[] => {
  if (Array.isArray(keys)) return keys;
  if (Array.isArray(keys?.checked)) return keys.checked;
  return [];
};

export const getAllNodeKeys = (nodes: any[]): string[] => {
  const keys: string[] = [];
  const traverse = (node: any) => {
    keys.push(node?.key || node?.book_id);
    node?.children?.forEach(traverse);
  };
  nodes?.forEach(traverse);
  return keys;
};

export const findNodeById = (nodes: any[], targetId: any): any | null => {
  for (const node of nodes || []) {
    if (node?.key === targetId) return node;
    if (node?.children?.length > 0) {
      const found = findNodeById(node?.children, targetId);
      if (found) return found;
    }
  }
  return null;
};

export const getAllChildIds = (node: any): any[] => {
  let ids: any[] = [];
  node?.children?.forEach((child: any) => {
    ids.push(child?.key);
    if (child?.children?.length > 0) {
      ids = [...ids, ...getAllChildIds(child)];
    }
  });
  return ids;
};

export const isAllChildrenChecked = (node: any, checkedKeys: any[]): boolean => {
  if (node?.type && node.type !== "catalog") return false;
  if (node?.children?.length === 0) return false;
  const childIds = getAllChildIds(node);
  return childIds?.every((id) => checkedKeys?.includes(id));
};

export const displayNodesToCheckedKeys = (
  tree: any[],
  displayNodes: any[] = [],
): string[] => {
  if (!displayNodes?.length) return [];

  const keys = new Set<string>();
  displayNodes.forEach((node) => {
    const treeNode = findNodeById(tree, node?.key);
    if (!treeNode) {
      keys.add(node?.key);
      return;
    }
    if (treeNode?.children?.length > 0) {
      keys.add(treeNode?.key);
      getAllChildIds(treeNode).forEach((id) => keys.add(id));
      return;
    }
    keys.add(treeNode?.key);
  });
  return Array.from(keys);
};

export const calculateCheckedDisplayNodes = (
  nodes: any[],
  checkedKeys: any[],
): any[] => {
  if (!checkedKeys?.length) return [];

  const result: any[] = [];
  const processedIds = new Set<any>();

  const processFullSelectedCatalogs = (catalogNodes: any[]) => {
    for (const node of catalogNodes) {
      if (node?.type !== "catalog") continue;
      if (node?.children?.length > 0) {
        if (isAllChildrenChecked(node, checkedKeys)) {
          result.push(node);
          processedIds.add(node?.key);
          getAllChildIds(node).forEach((id) => processedIds.add(id));
        } else {
          processFullSelectedCatalogs(node?.children);
        }
      }
    }
  };

  processFullSelectedCatalogs(nodes);

  checkedKeys.forEach((id) => {
    if (!processedIds.has(id)) {
      const node = findNodeById(nodes, id);
      if (node) {
        result.push(node);
        processedIds.add(id);
      }
    }
  });

  return result;
};

/** 搜索过滤后 Tree onCheck 只含可见节点，需保留不可见但已选中的 key */
export const mergeCheckedKeysWithFilteredTree = (
  prevCheckedKeys: string[],
  newKeys: any,
  filteredTree: any[],
  searchText: string,
): string[] => {
  const normalizedNew = normalizeCheckedKeys(newKeys);
  if (!searchText.trim()) return normalizedNew;

  const visibleKeys = new Set(getAllNodeKeys(filteredTree));
  const hiddenPrevKeys = prevCheckedKeys.filter((key) => !visibleKeys.has(key));
  const visibleNewKeys = normalizedNew.filter((key) => visibleKeys.has(key));

  return Array.from(new Set([...hiddenPrevKeys, ...visibleNewKeys]));
};

export const filterTreeNodes = (nodes: any[], searchText: string): any[] => {
  if (!searchText) return nodes || [];

  const filtered: any[] = [];

  const traverse = (node: any): any | null => {
    const nodeText = node?.name || node?.title || "";
    const textMatch = nodeText.toLowerCase().includes(searchText.toLowerCase());

    if (textMatch) {
      return { ...node, children: node?.children };
    }

    const filteredChildren = node?.children
      ? node?.children.map(traverse).filter(Boolean)
      : [];

    if (filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }
    return null;
  };

  nodes?.forEach((node) => {
    const result = traverse(node);
    if (result) filtered.push(result);
  });

  return filtered;
};

export const getFilterDataByType = (data: any[], type: 1 | 2) => {
  const field = type === 1 ? "chapter" : "knowledgePoint";
  return data?.filter((val) => val?.[field]?.length > 0) || [];
};

export const hasDataByType = (data: any[], type: 1 | 2) =>
  getFilterDataByType(data, type).length > 0;

export const hasKnowledgeChapterSelection = (data: any[] = []) =>
  hasDataByType(data, 1) || hasDataByType(data, 2);

export const countSelectedItems = (data: any[]) => {
  let chapterCount = 0;
  let knowledgePointCount = 0;
  data?.forEach((item) => {
    chapterCount += item?.chapter?.length || 0;
    knowledgePointCount += item?.knowledgePoint?.length || 0;
  });
  return { chapterCount, knowledgePointCount };
};
