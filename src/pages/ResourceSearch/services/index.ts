import { postDataRequest, getDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";
import { requestJson } from "@/utils/request";

const isMock = false;
const prefix = isMock ? "/api" : cogUrl;

const api: any = {
  getFindXkwQuestionTypeList: `${prefix}/web/xkwQuestionType/findXkwQuestionTypeListByCourseId`, // 个人题库题型（按课程）
  getCatalogueTree: `${prefix}/web/xkwTestbookKnowledgePointTree/findXkwTbKPTreeList`, // 获取章节树（个人题库）
  getQuestionPersonalPage: `${prefix}/web/personalQuestion/findPersonalQuestionPage`, // 获取试题（个人题库）
  postPersonalDelete: `${prefix}/web/personalQuestion/remove`, // 删除（个人题库）
  postGlobalQuestions: `${prefix}/web/publicQuestion/findPublicQuestionPage`, // 获取公共试题列表
  getSimilarQuestions: `${prefix}/web/publicQuestion/findPublicQuestionSimilarList`, // 获取相似题
};

// 存储可取消的请求控制器
const abortControllers: { [key: string]: AbortController } = {};

// 支持取消的请求函数
async function postDataRequestWithCancel(
  params: any,
  url: string,
  requestKey: string,
  contentType?: string,
) {
  // 取消之前的请求
  if (abortControllers[requestKey]) {
    abortControllers[requestKey].abort();
  }

  // 创建新的控制器
  const controller = new AbortController();
  abortControllers[requestKey] = controller;
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    return await requestJson(url, {
      method: "POST",
      payload: params,
      extraHeaders: { "Content-Type": contentType || "application/json" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
    // Completion of an older request must not delete the newer controller.
    if (abortControllers[requestKey] === controller)
      delete abortControllers[requestKey];
  }
}

export async function postDataService(
  params: any,
  apiUrl: string,
  contentType?: string,
) {
  // 对于需要取消处理的接口，使用支持取消的请求函数
  if (
    apiUrl === "postGlobalQuestions" ||
    apiUrl === "getQuestionPersonalPage" ||
    apiUrl === "postFavoriteQuestions" ||
    apiUrl === "postGlobalPapers" ||
    apiUrl === "postPersonalPapers"
  ) {
    return postDataRequestWithCancel(params, api[apiUrl], apiUrl, contentType);
  }

  // 其他接口使用原来的请求函数
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  // 对于需要路径参数的接口，特殊处理
  if (apiUrl === "getPaperDetail" && params?.id) {
    const url = `${api[apiUrl]}/${params.id}`;
    // 对于路径参数，不传递 params，避免被添加到查询字符串
    return getDataRequest({}, url);
  }

  return getDataRequest(params, api[apiUrl]);
}

// 手动取消指定请求的函数
export function cancelRequest(requestKey: string) {
  if (abortControllers[requestKey]) {
    abortControllers[requestKey].abort();
    delete abortControllers[requestKey];
  }
}
