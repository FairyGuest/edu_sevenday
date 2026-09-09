import { postDataRequest, getDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";
import { getRequestParams, getStorageToken } from "@/utils/index";
import { message } from "antd";
import { history } from "@@/core/history";

const isMock = false;
const prefix = isMock ? '/api' : cogUrl;

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
async function postDataRequestWithCancel(params: any, url: string, requestKey: string, contentType?: string) {
  // 取消之前的请求
  if (abortControllers[requestKey]) {
    abortControllers[requestKey].abort();
  }

  // 创建新的控制器
  const controller = new AbortController();
  abortControllers[requestKey] = controller;

  try {
    const { newUrl, payload } = getRequestParams(url, { payload: params });
    const authorization = window.__POWERED_BY_WUJIE__
      ? (window as any).$wujie?.props?.token
      : getStorageToken();

    let headers: any = {
      'Content-Type': contentType || 'application/json',
    };

    if (authorization) {
      headers['Authorization'] = authorization.startsWith("Bearer ")
        ? authorization
        : `Bearer ${authorization}`;
    }

    const response = await fetch(newUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // 状态码检查，与原有逻辑保持一致
    if (response.status >= 200 && response.status < 401) {
      const data = await response.json();
      const { code, msg, error } = data;

      // 处理 401 状态码
      if (code === 401) {
        localStorage.clear();
        history.push("/login");
      }

      // 处理错误消息
      if ((msg || error) && code > 200) {
        message.error({
          content: `${msg || error}`,
          key: `error${code}`,
        });
      }

      // 请求成功后清理控制器
      delete abortControllers[requestKey];
      return data;
    } else {
      // 处理 HTTP 错误状态码
      if (response.status === 401) {
        localStorage.clear();
        history.push("/login");
      }

      const error: any = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  } catch (error: any) {
    // 如果是取消请求，不抛出错误
    if (error.name === 'AbortError') {
      console.log(`Request ${requestKey} was cancelled`);
      return { cancelled: true };
    }

    // 清理控制器
    delete abortControllers[requestKey];

    // 返回错误格式，与原有逻辑保持一致
    return { err: error };
  }
}

export async function postDataService(params: any, apiUrl: string, contentType?: string) {
  // 对于需要取消处理的接口，使用支持取消的请求函数
  if (apiUrl === 'postGlobalQuestions' || apiUrl === 'postFavoriteQuestions' ||
      apiUrl === 'postGlobalPapers' || apiUrl === 'postPersonalPapers') {
    return postDataRequestWithCancel(params, api[apiUrl], apiUrl, contentType);
  }

  // 其他接口使用原来的请求函数
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  // 对于需要路径参数的接口，特殊处理
  if (apiUrl === 'getPaperDetail' && params?.id) {
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
