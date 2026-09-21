import { getDataRequest, postDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";
import { createReadCache } from "@/utils/readCache";

const reads = createReadCache();

const api: any = {
  portraitsUrl: `${cogUrl}/teacher/portraits`,
  classesUrl: `${cogUrl}/teacher/classes`, // 班级列表
  classProfileUrl: `${cogUrl}/teacher/profile/class`, // 班级画像（sources 勾选后重算）
  studentProfileUrl: `${cogUrl}/teacher/profile/student`, // 个人画像
  studentEvidenceUrl: `${cogUrl}/teacher/profile/student/evidence`, // 作答证据
  profileSuggestionsUrl: `${cogUrl}/teacher/profile/suggestions`, // 画像建议（v2.0-H：班级/个人）
  importQuestionsUrl: `${cogUrl}/teacher/import/questions`, // 导入题目选择池
  importHistoryUrl: `${cogUrl}/teacher/import/history`, // 提交学情导入
  importBatchesUrl: `${cogUrl}/teacher/import/batches`, // 导入批次记录
};

export async function getDataService(params: any, apiUrl: string) {
  const token = window.__POWERED_BY_WUJIE__
    ? (window as any).$wujie?.props?.token : localStorage.getItem("accessToken");
  const key = JSON.stringify([token, api[apiUrl], Object.keys(params || {}).sort().map((k) => [k, params[k]])]);
  return reads.get(key, () => getDataRequest(params, api[apiUrl]));
}

export async function postDataService(params: any, apiUrl: string) {
  try { return await postDataRequest(params, api[apiUrl]); }
  finally { reads.clear(); }
}

export const invalidateProfileReads = () => reads.clear();
