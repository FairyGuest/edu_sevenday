import { message } from "antd";
import { history } from "@@/core/history";
import { getStorageToken, getRequestParams } from "@/utils/index";
import { cogUrl } from "@/utils/host";
import qs from "query-string";

const inflight = new Map<string, Promise<any>>();

function stableValue(value: any): string {
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return `[${value.map(stableValue).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableValue(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function requestKey(method: string, url: string, payload: any) {
  return `${method.toUpperCase()} ${url} ${stableValue(payload)}`;
}

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

function clearLoginAndRedirect(requestToken: string | null | undefined) {
  const currentToken = window.__POWERED_BY_WUJIE__ ? (window as any).$wujie?.props?.token : getStorageToken();
  const normalize = (token: any) => String(token || "").replace(/^Bearer\s+/i, "");
  // An old session's delayed 401 must not log out a newly authenticated session.
  if (normalize(currentToken) !== normalize(requestToken)) return;
  // TODO(debug) 临时定位登出触发方，验收后移除
  try { sessionStorage.setItem("__logout_debug", (new Error("logout").stack || "no-stack") + "\n@@url:" + (window as any).__lastReqUrl); } catch {}
  const currentPath = history.location?.pathname || window.location.pathname;
  if (currentPath.includes("/login")) {
    return;
  }

  if (window.__POWERED_BY_WUJIE__) {
    localStorage.removeItem("accessToken");
    (window as any).$wujie?.bus?.$emit?.("host:logout");
    return;
  }

  localStorage.clear();
  message.warning("登录已失效，请重新登录");
  history.replace("/login");
}

function checkStatus(response: any, url: string, requestToken: string | null | undefined) {
  if (response.status >= 200 && response.status < 401) {
    return response;
  }

  if (response.status === 401 && !isAuthExemptUrl(url)) {
    guardLogout(requestToken);
  }

  const error: any = new Error(response.statusText);
  error.response = response;
  throw error;
}

/** 401 会话探针：先问权威鉴权接口（getUser），确认会话真的失效才全局登出。
 *  避免个别接口的网关鉴权配置问题（如测试网关未给 /course/* 转发 Authorization 头，
 *  后端报"缺失令牌"）在登录成功后立刻摧毁会话，形成"登录即被踢回"的死循环。 */
let logoutProbing = false;
function guardLogout(requestToken: string | null | undefined) {
  if (logoutProbing) return;
  const token = window.__POWERED_BY_WUJIE__
    ? (window as any).$wujie?.props?.token : getStorageToken();
  if (!token) {
    clearLoginAndRedirect(requestToken);
    return;
  }
  logoutProbing = true;
  fetch(`${cogUrl}/web/eduAuth/getUser`, {
    headers: { Authorization: token.startsWith?.("Bearer ") ? token : `Bearer ${token}` },
  })
    .then(async (r) => {
      let expired = r.status === 401;
      if (!expired) {
        const j = await r.json().catch(() => null);
        if (j && Number(j.code) === 401) expired = true;
      }
      if (expired) clearLoginAndRedirect(requestToken);
      // 探针通过：会话仍有效，本次 401 属于该接口自身问题（网关未转发鉴权头），不全局登出
    })
    .catch(() => clearLoginAndRedirect(requestToken))
    .finally(() => { logoutProbing = false; });
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
    const query = qs.stringify(payload);
    if (query) newUrl += (newUrl.includes("?") ? "&" : "?") + query;
  }
  if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    options.body = JSON.stringify(payload); // post 请求
  }
  let aUrl = `${newUrl}`;
  if (newUrl.includes("http://") || newUrl.includes("https://")) {
    // 全路径处理
    aUrl = newUrl;
  }

  const isLoginOrCaptcha =
    aUrl.includes("/eduAuth/login") || aUrl.includes("/eduAuth/captcha");
  if (authorization && !isLoginOrCaptcha) {
    const bearer = authorization.startsWith("Bearer ")
      ? authorization
      : `Bearer ${authorization}`;
    headers["Authorization"] = bearer;
    // 双鉴权头兼容：/web/** 自定义过滤读 Authorization；BladeX 服务（/course/** 等）
    // 读 Blade-Auth（缺失时后端报"缺失令牌,鉴权失败"）。两头并发互不干扰。
    headers["Blade-Auth"] = `bearer ${bearer.replace(/^Bearer\s+/i, "")}`;
  }

  // 处理下载二进制流文件  download_type === zip  就走不走parseJSON
  const isBlob = options.payload?.download_type === "zip";

  // Only independent GET readers can share work. Writes must execute separately;
  // callers with their own abort signal retain control over their own request.
  const share = method.toUpperCase() === "GET" && !options.signal;
  const key = requestKey(method, aUrl, { payload, headers, isBlob, credentials: options.credentials });
  const existing = share ? inflight.get(key) : undefined;
  if (existing) return existing;

  const promise = fetch(aUrl, {
    ...options,
    signal: options.signal || (method.toUpperCase() === "GET" && !isBlob ? AbortSignal.timeout(30000) : undefined),
    headers,
  })
    .then((response) => checkStatus(response, aUrl, authorization))
    .then((response) => {
      return isBlob ? parseBlob(response) : parseJSON(response);
    })
    .then((data: any) => {
      if (isBlob) {
        return data;
      }
      const { code, msg, error } = data;
      if (code == 401 && !isAuthExemptUrl(aUrl)) {
        guardLogout(authorization);
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

  if (share) {
    inflight.set(key, promise);
    promise.finally(() => { if (inflight.get(key) === promise) inflight.delete(key); });
  }
  return promise;
}
