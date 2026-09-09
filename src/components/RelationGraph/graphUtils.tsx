const colors = [
    "rgb(78, 121, 167)",   // #4E79A7
    "rgb(237, 201, 72)",   // #EDC948
    "rgb(242, 142, 43)",   // #F28E2B
    "rgb(176, 122, 161)",  // #B07AA1
    "rgb(225, 87, 89)",    // #E15759
    "rgb(255, 157, 167)",  // #FF9DA7
    "rgb(118, 183, 178)",  // #76B7B2
    "rgb(156, 117, 95)",   // #9C755F
    "rgb(89, 161, 79)",    // #59A14F
    "rgb(186, 176, 172)",  // #BAB0AC
    "rgb(54, 88, 183)",    // #3658B7
    "rgb(242, 180, 62)",   // #F2B43E
    "rgb(131, 158, 204)",  // #839ECC
    "rgb(87, 191, 154)",   // #57BF9A
    "rgb(176, 210, 157)",  // #B0D29D
    "rgb(70, 157, 180)",   // #469DB4
    "rgb(242, 167, 135)",  // #F2A787
    "rgb(237, 119, 136)",  // #ED7788
    "rgb(229, 205, 130)",  // #E5CD82
    "rgb(179, 153, 59)",   // #B3993B
    "rgb(156, 179, 191)",  // #9CB3BF
    "rgb(126, 123, 158)",  // #7E7B9E
    "rgb(81, 129, 224)",   // #5181E0
    "rgb(165, 201, 119)",  // #A5C977
    "rgb(100, 174, 131)",  // #64AE83
    "rgb(239, 204, 106)",  // #EFCC6A
    "rgb(231, 147, 92)",   // #E7935C
    "rgb(222, 95, 92)",    // #DE5F5C
    "rgb(191, 106, 206)",  // #BF6ACE
    "rgb(129, 90, 201)",   // #815AC9
    "rgb(83, 89, 174)",    // #5359AE
    "rgb(111, 179, 233)",  // #6FB3E9
    "rgb(135, 208, 216)",  // #87D0D8
    "rgb(176, 97, 124)",   // #B0617C
    "rgb(48, 107, 186)",   // #306BBA
    "rgb(239, 140, 63)",   // #EF8C3F
    "rgb(82, 169, 215)",   // #52A9D7
    "rgb(62, 122, 141)",   // #3E7A8D
    "rgb(83, 96, 173)",    // #5360AD
    "rgb(179, 140, 76)",   // #B38C4C
    "rgb(96, 138, 170)",   // #608AAA
    "rgb(137, 198, 238)",  // #89C6EE
    "rgb(225, 225, 159)",  // #E1E19F
    "rgb(140, 172, 195)",  // #8CACC3
    "rgb(43, 86, 176)",    // #2B56B0
    "rgb(75, 133, 42)",    // #4B852A
    "rgb(177, 95, 42)",    // #B15F2A
    "rgb(103, 64, 140)",   // #67408C
    "rgb(190, 42, 102)",   // #BE2A66
    "rgb(147, 111, 67)",   // #936F43
    "rgb(82, 105, 152)",   // #526998
    "rgb(13, 41, 88)",     // #0D2958
    "rgb(70, 130, 103)",   // #468267
    "rgb(166, 102, 42)",   // #A6662A
    "rgb(119, 146, 231)",  // #7792E7
    "rgb(79, 95, 127)",    // #4F5F7F
    "rgb(123, 189, 184)",  // #7BBDB8
    "rgb(75, 148, 159)",   // #4B949F
    "rgb(239, 183, 97)",   // #EFB761
    "rgb(216, 131, 142)",  // #D8838E
    "rgb(221, 156, 168)",  // #DD9CA8
    "rgb(150, 172, 119)",  // #96AC77
    "rgb(117, 144, 178)",  // #7590B2
    "rgb(135, 199, 226)",  // #87C7E2
  ];
  
  // 用于存储category和颜色的映射关系
  const categoryColorMap = new Map<string, string>();
  let colorIndex = 0;
  
  // 生成随机RGB颜色
  function generateRandomColor(): string {
    const usedColors = new Set([...colors, ...categoryColorMap.values()]);
    let newColor;
    do {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      newColor = `rgb(${r}, ${g}, ${b})`;
    } while (usedColors.has(newColor));
    return newColor;
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
    datas.nodes.forEach((node) => {
      // 根据是否是根节点和category来决定颜色
      const isRoot = node._id === rootId;
      const nodeColor = isRoot
        ? "rgb(196, 53, 49)"
        : node.category
        ? getColorByCategory(node.category)
        : "rgb(186, 210, 170)";
  
      const nodeData = {
        id: node._id,
        text: node.name,
        color: nodeColor,
        borderColor: nodeColor,
        data: {
          // 添加描述（如果有category）
          description: node.category ? getNodeDescription(node) : "暂无描述",
          // 保留其他属性
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
    datas.relationships.forEach((rel) => {
      result.lines.push({
        from: rel.start,
        to: rel.end,
        text: rel.relation || "",
        color: "rgb(210, 192, 165)",
        fontColor: "rgb(210, 192, 165)",
        data: {
          type: rel.relation,
          description: `从 ${rel.start} 到 ${rel.end} 的关系`,
          weight: 1,
        },
      });
    });
  
    return result;
  }
  
  function findRootNode(data) {
    // 创建入度映射
    const inDegree = new Map();
  
    // 初始化所有节点的入度为0
    data.nodes.forEach((node) => {
      inDegree.set(node._id, 0);
    });
  
    // 计算每个节点的入度
    data.relationships.forEach((rel) => {
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
      return data.nodes[0]._id;
    } else if (rootCandidates.length > 1) {
      // 如果有多个入度为0的节点，查找出度最大的作为根节点
      const outDegree = new Map(rootCandidates.map((id) => [id, 0]));
      data.relationships.forEach((rel) => {
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
  
  function getColorByCategory(category: string): string {
    // 如果已经分配过颜色，直接返回
    if (categoryColorMap.has(category)) {
      return categoryColorMap.get(category)!;
    }
  
    let color: string;
    if (colorIndex < colors.length) {
      // 如果还有预设颜色可用，使用预设颜色
      color = colors[colorIndex++];
    } else {
      // 如果预设颜色用完，生成随机颜色
      color = generateRandomColor();
    }
  
    // 保存category和颜色的映射关系
    categoryColorMap.set(category, color);
    return color;
  }
  
  function getNodeDescription(node) {
    if (node.category === "root") {
      return "知识图谱根节点";
    } else if (node.category === "kb") {
      return `知识库: ${node.name}`;
    } else if (node.category === "file") {
      return `文件: ${node.name}`;
    } else if (node.category === "node") {
      return `出现次数: ${node.num || 1}`;
    }
    return "暂无描述";
  }