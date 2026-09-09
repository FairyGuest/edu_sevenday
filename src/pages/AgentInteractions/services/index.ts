import { postDataRequest, getDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  // getClassListUrl: `${cogUrl}/student_analysis/classes_by_user`,
  getClassListUrl: `${cogUrl}/student_analysis/classes_by_user/v1`,
  getSubjectListUrl: `${cogUrl}/zhiqi_agent/zhiqi_subject_type_map`, // 获取学科列表
  getGroupListUrl: `${cogUrl}/org/group/sub/student/by_class`, // 获取小组列表
  getHistoryLogListUrl: `${cogUrl}/zhiqi_agent/analysis/conversations`, // 历史记录列表
  getHistoryLogDetailUrl: `${cogUrl}/zhiqi_agent/analysis/messages`, // 历史记录详情
  upVoteUrl: `${cogUrl}/zhiqi_agent/feedback/like`,  // 点赞
  downVoteUrl: `${cogUrl}/zhiqi_agent/feedback/dislike`,  // 踩
  feedbackUrl: `${cogUrl}/zhiqi_agent/feedback/submit`,  // 反馈
  getPracticeDetailUrl: `${cogUrl}/zhiqi_agent/analysis/practice_today`, // 今日练习详情
};

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
