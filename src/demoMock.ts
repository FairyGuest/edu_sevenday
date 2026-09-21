/**
 * 浏览器端 mock 拦截器：把 mock/ 目录的路由表打进构建产物，
 * 拦截 fetch 发出的 /api 请求并直接返回 mock 数据，
 * 让 GitHub Pages 等纯静态部署也能演示完整流程（登录、学情等）。
 * 仅 REACT_APP_ENV === "demo"（npm run build:demo）时启用。
 */
import aiGuide from "./demo-mock/aiGuide";
import analysis from "./demo-mock/analysis";
import devAuth from "./demo-mock/devAuth";
import teachPlan from "./demo-mock/teachPlan";
import enhance from "./demo-mock/teacher/enhance";
import teacherImport from "./demo-mock/teacher/import";
import profile from "./demo-mock/teacher/profile";
import portraits from "./demo-mock/teacher/portraits";
import research from "./demo-mock/teacher/research";
import recommend from "./demo-mock/teacher/recommend";
import eduAuth from "./demo-mock/web/eduAuth";
import resourceSearch from "./demo-mock/web/resourceSearch";
import suggestions from "./demo-mock/teacher/suggestions";
import kgraph from "./demo-mock/teacher/kgraph";
import homeworkFlow from "./demo-mock/teacher/homeworkFlow";
import assistant from "./demo-mock/assistant";
import workspace from "./demo-mock/web/workspace";
import materials from "./demo-mock/teacher/materials";

const tables = [
  aiGuide,
  analysis,
  devAuth,
  teachPlan,
  enhance,
  teacherImport,
  profile,
  portraits,
  research,
  recommend,
  eduAuth,
  resourceSearch,
  suggestions,
  kgraph,
  homeworkFlow,
  assistant,
  workspace,
  materials,
];

interface CompiledRoute {
  method: string;
  regex: RegExp;
  keys: string[];
  handler: any;
}

function compile(key: string, value: any): CompiledRoute | null {
  const m = key.match(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+(.*)$/);
  if (!m) return null;
  const keys: string[] = [];
  const pattern = m[2]
    .split("/")
    .map((seg) => {
      if (seg.startsWith(":")) {
        keys.push(seg.slice(1));
        return "([^/]+)";
      }
      return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return {
    method: m[1],
    regex: new RegExp(`^${pattern}/?$`),
    keys,
    handler: value,
  };
}

const compiled: CompiledRoute[] = [];
tables.forEach((t) =>
  Object.entries(t || {}).forEach(([k, v]) => {
    const c = compile(k, v);
    if (c) compiled.push(c);
  }),
);

function matchRoute(method: string, pathname: string) {
  for (const r of compiled) {
    if (r.method !== method) continue;
    const mm = pathname.match(r.regex);
    if (mm) {
      const params: Record<string, string> = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(mm[i + 1])));
      return { handler: r.handler, params };
    }
  }
  return null;
}

function createRes(
  onDone: (
    status: number,
    bodyText: string | null,
    headers: Record<string, string>,
  ) => void,
) {
  let status = 200;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const chunks: string[] = [];
  let finished = false;
  const finish = (bodyText: string | null) => {
    if (finished) return;
    finished = true;
    // 204/304 等状态不允许带响应体
    const noBody = [204, 205, 304].includes(status) || status < 200;
    onDone(status, noBody ? null : bodyText, headers);
  };
  const res: any = {
    status(code: number) {
      status = code;
      return res;
    },
    writeHead(code: number, values: Record<string, string> = {}) {
      status = code;
      Object.assign(headers, values);
      return res;
    },
    set(k: string, v: string) {
      headers[k] = v;
      return res;
    },
    setHeader(k: string, v: string) {
      headers[k] = v;
      return res;
    },
    json(data: any) {
      finish(JSON.stringify(data));
      return res;
    },
    send(data: any) {
      finish(typeof data === "string" ? data : JSON.stringify(data));
      return res;
    },
    write(chunk: any) {
      chunks.push(typeof chunk === "string" ? chunk : String(chunk));
      return true;
    },
    end(chunk?: any) {
      if (chunk != null)
        chunks.push(typeof chunk === "string" ? chunk : String(chunk));
      finish(chunks.join(""));
      return res;
    },
  };
  return res;
}

function jsonResponse(status: number, data: any) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function installDemoMock() {
  const origFetch = window.fetch.bind(window);
  window.fetch = async (input: any, init?: any) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof Request
          ? input.url
          : String(input);
    const method = String(
      init?.method ??
        (input instanceof Request ? input.method : "GET") ??
        "GET",
    ).toUpperCase();
    let parsed: URL;
    try {
      parsed = new URL(url, window.location.origin);
    } catch {
      return origFetch(input, init);
    }

    if (parsed.pathname === "/api/assistant/model")
      return origFetch(input, init);
    const hit = matchRoute(method, parsed.pathname);
    if (!hit) {
      if (parsed.pathname.startsWith("/api")) {
        console.warn(`[demoMock] 未匹配到路由: ${method} ${parsed.pathname}`);
        return jsonResponse(404, {
          code: 404,
          success: false,
          msg: `demo mock 未覆盖该接口: ${method} ${parsed.pathname}`,
        });
      }
      return origFetch(input, init);
    }

    // 纯值路由（值不是函数）直接作为 JSON 返回
    if (typeof hit.handler !== "function") {
      return jsonResponse(200, hit.handler);
    }

    let body: any = null;
    const rawBody = init?.body ?? null;
    if (typeof rawBody === "string") {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody;
      }
    } else if (rawBody instanceof URLSearchParams) {
      body = Object.fromEntries(rawBody as any);
    } else if (rawBody) {
      body = rawBody;
    } else if (
      input instanceof Request &&
      method !== "GET" &&
      method !== "HEAD"
    ) {
      try {
        body = await input.clone().json();
      } catch {
        body = null;
      }
    }

    const req = {
      method,
      url: parsed.pathname + parsed.search,
      query: Object.fromEntries(parsed.searchParams as any),
      body,
      params: hit.params,
      headers: Object.fromEntries(
        new Headers(
          init?.headers ?? (input instanceof Request ? input.headers : {}),
        ),
      ),
    };

    return new Promise<Response>((resolve, reject) => {
      let settled = false;
      const signal =
        init?.signal ?? (input instanceof Request ? input.signal : undefined);
      const cleanup = () => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
      };
      const abort = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(signal?.reason || new DOMException("Aborted", "AbortError"));
      };
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(
          jsonResponse(504, {
            code: 504,
            success: false,
            msg: "demo mock timeout",
          }),
        );
      }, 10000);
      if (signal?.aborted) {
        abort();
        return;
      }
      signal?.addEventListener("abort", abort, { once: true });
      const res = createRes((status, bodyText, headers) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(new Response(bodyText, { status, headers }));
      });
      const fail = (err: any) => {
        console.error(
          `[demoMock] handler 执行出错: ${method} ${parsed.pathname}`,
          err,
        );
        if (!settled) {
          settled = true;
          cleanup();
          resolve(
            jsonResponse(500, { code: 500, success: false, msg: String(err) }),
          );
        }
      };
      try {
        Promise.resolve(hit.handler(req, res)).catch(fail);
      } catch (err) {
        fail(err);
      }
    });
  };
  console.info(`[demoMock] 浏览器端 mock 已启用，共 ${compiled.length} 条路由`);
}
