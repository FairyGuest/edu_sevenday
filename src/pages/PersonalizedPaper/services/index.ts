import { getDataRequest, postDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  classesUrl: `${cogUrl}/teacher/classes`,
  generateUrl: `${cogUrl}/teacher/recommend/generate`,
  homeworkListUrl: `${cogUrl}/teacher/recommend/homework`,
  homeworkDetailUrl: `${cogUrl}/teacher/recommend/homework/:id`, // :id 在末尾，getRequestParams 可替换
  paperPreviewUrl: `${cogUrl}/teacher/recommend/paper-preview`, // 扁平化，id 走 query/payload
  publishUrl: `${cogUrl}/teacher/recommend/publish`,
  simulateUrl: `${cogUrl}/teacher/recommend/simulate`,
  reportUrl: `${cogUrl}/teacher/recommend/report`,
  closeLoopUrl: `${cogUrl}/teacher/recommend/close-loop`,
};

export async function getDataService(params: any, apiUrl: string) {
  return getDataRequest(params, api[apiUrl]);
}

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}
