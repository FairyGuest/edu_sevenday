import {getDataRequest, postDataRequest,} from "@/utils";
import { cogUrl } from "@/utils/host";

const api = {

  getGraphUrl: `${cogUrl}/graphs/graphs`, // 查询图谱
  getNodeDescUrl: `${cogUrl}/graphs/node_describe`, // 图谱节点查看
  updDocUrl: `${cogUrl}/docs_graph/upd_graph_doc`, // 某个知识下的所有文件
  renameUrl: `${cogUrl}/graphs/node_label_upd`, // 重命名
  addNodeUrl: `${cogUrl}/graphs/node_add`, // 图谱节点创建
  delNodeUrl: `${cogUrl}/graphs/node_delete`, // 删除节点创建
  updNodeUrl: `${cogUrl}/graphs/node_upd`, // 编辑节点创建
  addRelNodeUrl: `${cogUrl}/graphs/rel_add`, // 编辑节点创建
  updRelNodeUrl: `${cogUrl}/graphs/rel_upd`, // 编辑节点创建
  delRelNodeUrl: `${cogUrl}/graphs/rel_delete`, // 编辑节点创建
  getRelNodeUrl: `${cogUrl}/graphs/node_describe`, // 编辑节点创建
  getSubjectInfoUrl: `${cogUrl}/docs_graph/get_subject_knowledge_graph`, // 编辑节点创建
  uprellabelUrl:`${cogUrl}/graphs/rel_upd_label`, // 编辑节点创建
  tikuUrl: `https://aminer-workflow-graph.jyzhang.cn/tiku/api/v1/edu/query`, // 题库查询
  graphsandcatalog3Url: `${cogUrl}/graphs/graphs_and_catalog`, // 3D图谱

};



export async function postDataService(
  params: any,
  apiUrl: keyof typeof api,
) {
  return postDataRequest(params, api[apiUrl]);
}


export async function getDataService(params: any, apiUrl: keyof typeof api) { 
  return getDataRequest(params, api[apiUrl]);
}
