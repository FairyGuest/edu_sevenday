/**
 * 知识点树数据加载工具
 */

import type { KnowledgeTreeNode, TreeKnowledgeNode } from '../types';

/**
 * 将TreeKnowledgeNode转换为KnowledgeTreeNode（适配Ant Design Tree组件）
 */
function convertToAntTreeNode(node: TreeKnowledgeNode): KnowledgeTreeNode {
  return {
    title: node.name,
    key: node.code,
    children: node.children?.map(convertToAntTreeNode),
  };
}

/**
 * 根据学段和学科加载知识点树数据
 * @param gradeLevel 学段：小学/初中/高中
 * @param subject 学科：语文/数学/英语等
 * @returns Promise<KnowledgeTreeNode[]>
 */
export async function loadKnowledgeTree(
  gradeLevel: string, 
  subject: string
): Promise<KnowledgeTreeNode[]> {
  try {
    // 动态构建文件路径并导入
    const fileName = `${gradeLevel}_${subject}.json`;
    const module = await import(`../enums/knowledgeTree/${fileName}`);
    const treeData = module.default as TreeKnowledgeNode[];
    
    // 转换为Ant Design Tree组件需要的格式
    return treeData.map(convertToAntTreeNode);
  } catch (error) {
    console.warn(`未找到或加载失败: ${gradeLevel} ${subject}`, error);
    return [];
  }
}

