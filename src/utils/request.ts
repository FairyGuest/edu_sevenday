import { message } from "antd";
import { history } from "@@/core/history";
import { getStorageToken, getRequestParams } from "@/utils/index";
import qs from "query-string";

let isRedirectingToLogin = false;

function parseJSON(response: any) {
  return response.json();
}
function parseBlob(response: any) {
  return response.blob();
}

/** 登录、验证码、第三方 token 校验等接口不触发登出跳转 */
function isAuthExemptUrl(url: string) {
  const exemptPaths = [
    "/eduAuth/login",
    "/eduAuth/captcha"
  ];
  return exemptPaths.some((path) => url.includes(path));
}

function clearLoginAndRedirect() {
  // TODO(debug) 临时定位登出触发方，验收后移除
  try { sessionStorage.setItem("__logout_debug", (new Error("logout").stack || "no-stack") + "\n@@url:" + (window as any).__lastReqUrl); } catch {}
  if (isRedirectingToLogin) {
    return;
  }

  const currentPath = history.location?.pathname || window.location.pathname;
  if (currentPath.includes("/login")) {
    return;
  }

  isRedirectingToLogin = true;

  if (window.__POWERED_BY_WUJIE__) {
    localStorage.removeItem("accessToken");
    (window as any).$wujie?.bus?.$emit?.("host:logout");
    return;
  }

  localStorage.clear();
  message.warning("登录已失效，请重新登录");
  history.replace("/login");
}

function checkStatus(response: any, url: string) {
  if (response.status >= 200 && response.status < 401) {
    return response;
  }

  if (response.status === 401 && !isAuthExemptUrl(url)) {
    clearLoginAndRedirect();
  }

  const error: any = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */

export function requestJson(url: string, options: any) {
  const authorization = window.__POWERED_BY_WUJIE__
    ? (window as any).$wujie?.props?.token : getStorageToken();
  let headers: any = {
    "Content-Type": "application/json",
    ...(options.extraHeaders || {}),
  };

  let { newUrl, payload } = getRequestParams(url, options); // 自动加前坠
  const { method } = options;
  if (
    (method.toUpperCase() == "GET" || method.toUpperCase() == "DELETE") &&
    payload
  ) {
    // get 请求
    newUrl += "?" + qs.stringify(payload);
  }
  if (method.toUpperCase() == "POST") {
    options.body = JSON.stringify(payload); // post 请求
  }
  let aUrl = decodeURI(`${newUrl}`);
  if (newUrl.includes("http://") || newUrl.includes("https://")) {
    // 全路径处理
    aUrl = newUrl;
  }

  const isLoginOrCaptcha =
    aUrl.includes("/eduAuth/login") || aUrl.includes("/eduAuth/captcha");
  if (authorization && !isLoginOrCaptcha) {
    headers["Authorization"] = authorization.startsWith("Bearer ")
      ? authorization
      : `Bearer ${authorization}`;
  }

  // 处理下载二进制流文件  download_type === zip  就走不走parseJSON
  const isBlob = options.payload?.download_type === "zip";

  return fetch(aUrl, {
    ...options,
    headers,
  })
    .then((response) => checkStatus(response, aUrl))
    .then((response) => {
      return isBlob ? parseBlob(response) : parseJSON(response);
    })
    .then((data: any) => {
      if (isBlob) {
        return data;
      }
      const { code, msg, error } = data;
      if (code == 401 && !isAuthExemptUrl(aUrl)) {
        clearLoginAndRedirect();
        return data;
      }

      if ((msg || error) && code > 200) {
        message.error({
          content: `${msg || error}`,
          key: `error${code}`,
        });
      }
      return data;
    })
    .catch((err: any) => {
      return { err };
    });
}
