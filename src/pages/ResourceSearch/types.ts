// 知识点树节点（Ant Design Tree组件格式）
export interface KnowledgeTreeNode {
  title: string;
  key: string;
  children?: KnowledgeTreeNode[];
}

// 树形知识点节点（从JSON文件中读取的原始格式）
export interface TreeKnowledgeNode {
  id: string;
  stage: string;
  subject_name: string;
  name: string;
  code: string;
  parentCode: string | null;
  level: number;
  sortNo: number;
  children?: TreeKnowledgeNode[];
}

// 扁平知识点节点（转换前的原始数据格式）
export interface FlatKnowledgeNode {
  id: string;
  stage: string;
  subject_name: string;
  name: string;
  code: string;
  parentCode: string | null;
  level: number;
  sortNo: number;
}

// 试题选项
export interface QuestionOption {
  label: string;
  content: string;
}

// 试题数据
export interface Question {
  id: string;
  question_text: string;
  question_type: string;
  type: string;
  tags: string[];
  knowledge_tags: string[];
  update_time: string;
  optionsList?: QuestionOption[];
}