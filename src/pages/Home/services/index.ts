import {postDataRequest, getDataRequest} from "@/utils";
import {  cogUrl } from "@/utils/host";

// const ip = 'http://10.253.207.179'

const api: any = {
  getClassListUrl: `${cogUrl}/student_analysis/classes_by_user/v1`, // 获取班级列表
  getSubjectListUrl: `${cogUrl}/zhiqi_agent/zhiqi_subject_type_map`, // 获取学科列表
  getInteractionListUrl: `${cogUrl}/zhiqi_agent/analysis/conversations`, // 互动记录列表  
  getMyAgentListUrl: `${cogUrl}/zhiqi_agent/app/applicationv2`, // 获取我的智能体列表
  getAgentShopListUrl: `${cogUrl}/zhiqi_agent/app/template/list`, // 获取智能体广场列表
  getNoticeUnreadCountUrl: `${cogUrl}/home_page/notice/unreadCount`, // 获取通知未读数量
  postSaveDefaultOrgUrl: `${cogUrl}/zhuguan/save_default_org`, // 设置默认组织

};

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
 