import { postDataRequest, getDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  // getClassListUrl: `${cogUrl}/student_analysis/classes_by_user`,
  getClassListUrl: `${cogUrl}/student_analysis/classes_by_user/v1`,
  // getBaseInfoUrl: `${cogUrl}/student_analysis/student_report`,
  getBaseInfoUrl: `${cogUrl}/student_analysis/student_report/v1`,
  // getClassBaseInfoUrl: `${cogUrl}/student_analysis/class_report`,
  getClassBaseInfoUrl: `${cogUrl}/student_analysis/class_report/v1`,
  // getHomeworkDataUrl: `${cogUrl}/student_analysis/student_daily_timeline`,
  getHomeworkDataUrl: `${cogUrl}/student_analysis/student_daily_timeline/v1`,
  // getClassHomeworkDataUrl: `${cogUrl}/student_analysis/class_daily_timeline`,
  getClassHomeworkDataUrl: `${cogUrl}/student_analysis/class_daily_timeline/v1`,
  // getKnowledgeOverviewDataUrl: `${cogUrl}/student_analysis/knowledge_point_overview`,
  getKnowledgeOverviewDataUrl: `${cogUrl}/student_analysis/knowledge_point_overview/v1`,
  // getClassKnowledgeOverviewDataUrl: `${cogUrl}/student_analysis/class_knowledge_point_overview`,
  getClassKnowledgeOverviewDataUrl: `${cogUrl}/student_analysis/class_knowledge_point_overview/v1`,
  // getKnowledgesDataUrl: `${cogUrl}/student_analysis/knowledge_point_accuracy_list`,
  getKnowledgesDataUrl: `${cogUrl}/student_analysis/knowledge_point_accuracy_list/v1`,
  // getClassKnowledgesDataUrl: `${cogUrl}/student_analysis/class_knowledge_point_accuracy_list`,
  getClassKnowledgesDataUrl: `${cogUrl}/student_analysis/class_knowledge_point_accuracy_list/v1`,
  // sendReportUrl: `${cogUrl}/student_analysis/push_study_report`,
  sendReportUrl: `${cogUrl}/student_analysis/push_study_report/v1`,
  // h5相关接口
  // h5GetBaseInfoUrl: `${cogUrl}/student_analysis/h5/student_report`,
  h5GetBaseInfoUrl: `${cogUrl}/student_analysis/h5/student_report/v1`,
  // h5GetHomeworkDataUrl: `${cogUrl}/student_analysis/h5/student_daily_timeline`,
  h5GetHomeworkDataUrl: `${cogUrl}/student_analysis/h5/student_daily_timeline/v1`,
  // h5GetKnowledgeOverviewUrl: `${cogUrl}/student_analysis/h5/knowledge_point_overview`,
  h5GetKnowledgeOverviewUrl: `${cogUrl}/student_analysis/h5/knowledge_point_overview/v1`,
  // h5GetKnowledgesUrl: `${cogUrl}/student_analysis/h5/knowledge_point_accuracy_list`,
  h5GetKnowledgesUrl: `${cogUrl}/student_analysis/h5/knowledge_point_accuracy_list/v1`,
};

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
