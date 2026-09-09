export const normalizeXkwTreeNodeKey = (node: any) => ({
  ...node,
  key: String(node?.key ?? node?.id ?? ""),
  title: node?.title ?? "",
});

/** 将教材 JSON 树拆分为章节树（catalog）与一级知识点列表（kpoint） */
export const splitXkwTextbookTree = (tree: any[] = []) => {
  const kpoints: any[] = [];

  const processNodes = (nodes: any[] = []): any[] => {
    const catalogNodes: any[] = [];

    nodes.forEach((node) => {
      if (node?.type === "kpoint") {
        kpoints.push(
          normalizeXkwTreeNodeKey({
            ...node,
            children: [],
          }),
        );
        return;
      }

      if (node?.type === "catalog") {
        catalogNodes.push(
          normalizeXkwTreeNodeKey({
            ...node,
            children: processNodes(node?.children || []),
          }),
        );
      }
    });

    return catalogNodes;
  };

  return {
    catalogTree: processNodes(tree),
    kpoints,
  };
};

export const parseXkwTbKPTreeResponse = (data: any[] = []) => {
  const treeJson = data?.[0]?.treeJson || {};
  const tree = treeJson?.tree || [];
  const { catalogTree, kpoints } = splitXkwTextbookTree(tree);

  return {
    catalog_tree: catalogTree,
    kpoints,
    treeJson,
  };
};
