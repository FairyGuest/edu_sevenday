import { postDataRequest, getDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  historyList: `${cogUrl}/assistant/ppt/get_history_list/:courseId`, // 获取历史列表
  getOutlineById: `${cogUrl}/assistant/ppt/get_outline/:session_id`, // 教案讲义大纲接口
  getPPTPageById: `${cogUrl}/assistant/ppt/get_ppt_page/:session_id`, // 教案讲义大纲接口
  pptPublishToLibrary: `${cogUrl}/assistant/ppt/publish`, // 分发到库
  updatePPT: `${cogUrl}/assistant/ppt/modify_page_content/:session_id`, // 更新PPT
  updateOutlineText: `${cogUrl}/assistant/ppt/modify_outline`, // 编辑教案讲义
};

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
