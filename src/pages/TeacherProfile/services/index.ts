import { getDataRequest, postDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  classesUrl: `${cogUrl}/teacher/classes`, // 班级列表
  classProfileUrl: `${cogUrl}/teacher/profile/class`, // 班级画像（sources 勾选后重算）
  studentProfileUrl: `${cogUrl}/teacher/profile/student`, // 个人画像
  studentEvidenceUrl: `${cogUrl}/teacher/profile/student/evidence`, // 作答证据
  importQuestionsUrl: `${cogUrl}/teacher/import/questions`, // 导入题目选择池
  importHistoryUrl: `${cogUrl}/teacher/import/history`, // 提交学情导入
  importBatchesUrl: `${cogUrl}/teacher/import/batches`, // 导入批次记录
};

export async function getDataService(params: any, apiUrl: string) {
  return getDataRequest(params, api[apiUrl]);
}

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}
