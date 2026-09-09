
const colorObj = {
  "RootPoint": "rgb(251,191,36)",
  "DocPoint": "rgb(72,106,255)",
  "LearningPoint": "rgb(28,108,255)",
  "PowerPoint": "rgb(16,185,129)",
}


export function transformGraphDatas(datas: any) {


  // 2. 找出根节点
  const rootId = findRootNode(datas);

  // 3. 转换为新格式
  const result = {
    rootId,
    nodes: [],
    lines: [],
  };

  // 4. 转换节点
  datas.nodes.forEach((node: any) => {
    // 根据是否是根节点和category来决定颜色

    const { node_type = "LearningPoint" } = node
    const category = node.id === rootId ? "RootPoint" : node_type;
    const nodeColor = colorObj?.[category]

    const nodeData = {
      id: node.id,
      text: node.name || node.label,
      color: nodeColor,
      borderColor: nodeColor,
      data: {
        // 添加描述（如果有category）
        // description: node.category ? getNodeDescription(node) : "暂无描述",
        // 保留其他属性
        is_root: node.id === rootId,
        ...Object.entries(node).reduce((acc, [key, value]) => {
          if (key !== "name") {
            acc[key] = value;
          }
          return acc;
        }, {}),
      },
    };

    result.nodes.push(nodeData);
  });

  // 5. 转换关系
  datas?.relations?.forEach((rel: any) => {
    const temp={
      id: rel.id,
      from: rel.start,
      to: rel.end,
      text: rel.relation || "",
      color: "#CBD2E1",
      fontColor: "rgba(255, 153, 0, 1)",
      data: {
        ...rel,
        type: rel.relation,
        description: `从 ${rel.start} 到 ${rel.end} 的关系`,
        weight: 1,
      },
    }
    result.lines.push(temp);
  });

  return result;
}

function findRootNode(data: any) {
  // 创建入度映射
  const inDegree = new Map();

  // 初始化所有节点的入度为0
  data.nodes.forEach((node: any) => {
    inDegree.set(node.id, 0);
  });

  // 计算每个节点的入度
  data.relations?.forEach((rel: any) => {
    if (inDegree.has(rel.end)) {
      inDegree.set(rel.end, inDegree.get(rel.end) + 1);
    }
  });

  // 找出入度为0的节点
  const rootCandidates = Array.from(inDegree.entries())
    .filter(([_, degree]) => degree === 0)
    .map(([id]) => id);

  if (rootCandidates.length === 0) {
    // 如果没有入度为0的节点，使用第一个节点作为根节点
    console.warn("警告：未找到明确的根节点，使用第一个节点作为根节点");
    return data.nodes[0].id;
  } else if (rootCandidates.length > 1) {
    // 如果有多个入度为0的节点，查找出度最大的作为根节点
    const outDegree = new Map(rootCandidates.map((id) => [id, 0]));
    data.relations.forEach((rel: any) => {
      if (outDegree.has(rel.start)) {
        outDegree.set(rel.start, outDegree.get(rel.start) + 1);
      }
    });

    const rootId = Array.from(outDegree.entries()).reduce((max, curr) =>
      curr[1] > max[1] ? curr : max
    )[0];

    console.warn(
      `发现多个可能的根节点，选择出度最大的节点 ${rootId} 作为根节点`
    );
    return rootId;
  }

  return rootCandidates[0];
}



// function getNodeDescription(node: any) {
//   if (node.category === "root") {
//     return "知识图谱根节点";
//   } else if (node.category === "kb") {
//     return `知识库: ${node.name}`;
//   } else if (node.category === "file") {
//     return `文件: ${node.name}`;
//   } else if (node.category === "node") {
//     return `出现次数: ${node.num || 1}`;
//   }
//   return "暂无描述";
// }