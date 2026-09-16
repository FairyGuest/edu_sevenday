import { history, RuntimeAntdConfig, useLocation } from "umi";
import React from "react";
import LayoutSider from "@/components/LayoutSider";
import { ConfigProvider, Result, Tour, Modal } from "antd";
import zhCN from "antd/locale/zh_CN";
import "dayjs/locale/zh-cn";
import "./markdown-body.less";
import "@/components/useSiderTour/index.less";
import { setStorageToken } from "@/utils";
import { GlobalAssistantSafe } from "@/components/GlobalAssistant";
import RouteProgress from "@/components/RouteProgress";

// demo 静态部署模式（build:demo）：浏览器端拦截 /api 请求返回 mock 数据
if (REACT_APP_ENV === "demo") {
  // Keep the fixture registry and mock handlers out of non-demo bundles.
  require("@/demoMock").installDemoMock();
}

declare global {
  interface Window {
    // 是否存在无界
    __POWERED_BY_WUJIE__?: boolean;
    // 子应用mount函数
    __WUJIE_MOUNT: () => void;
    // 子应用unmount函数
    __WUJIE_UNMOUNT: () => void | Promise<void>;
    // 子应用无界实例
    __WUJIE: { mount: () => void };
  }
}
const isWujiEnv = () => !!window.__POWERED_BY_WUJIE__;

// ====== 全局资源加载错误监听 ======
function setupChunkErrorListener() {
  // 监听 JS chunk 加载错误
  window.addEventListener(
    "error",
    (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "SCRIPT" && target.src) {
        const error = `Loading JS chunk failed: ${target.src}`;
        handleChunkError(error);
      }
    },
    true,
  );

  // 监听 CSS chunk 加载错误
  window.addEventListener(
    "error",
    (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "LINK" && target.href) {
        const error = `Loading CSS chunk failed: ${target.href}`;
        handleChunkError(error);
      }
    },
    true,
  );
}

// 统一处理 chunk 加载错误
function handleChunkError(error: string) {
  console.error("检测到 chunk 加载失败:", error);

  // 检查是否是 ChunkLoadError 或资源加载错误
  const isChunkError =
    error?.includes(".async.js") || error?.includes(".chunk.css");
  console.log("isChunkError:", isChunkError);

  if (isChunkError) {
    const now = Date.now();
    const lastReloadTime = Number(sessionStorage.getItem("chunk_reload_flag")) || 0;
    const timeDiff = (now - lastReloadTime) / 1000; // 间隔时间（秒）

    console.log("上次刷新时间戳:", lastReloadTime, "时间间隔(s):", timeDiff);

    // 如果标记不存在（lastReloadTime 为 0），或者距离上次刷新时间间隔大于 10 秒
    if (!lastReloadTime || timeDiff > 10) {
      sessionStorage.setItem("chunk_reload_flag", String(now));
      // 提供用户友好的错误提示
      Modal.warning({
        title: "系统已更新",
        content: "点击刷新页面获取最新版本",
        okText: "刷新",
        onOk() {
          setTimeout(() => (window.location.href = "/"), 0);
        },
      });
    }
  }
}

// 初始化错误监听
setupChunkErrorListener();

// ===== 页面级错误边界：业务页渲染异常时只降级内容区（侧边栏/助手存活），不再整页白屏 =====
class PageErrorBoundary extends React.Component<{ children: any }, { err: any }> {
  state = { err: null };
  static getDerivedStateFromError(error: any) {
    return { err: error };
  }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 8 }}>页面渲染异常</h3>
          <p style={{ color: "#8a94a8", marginBottom: 12 }}>{String(this.state.err?.message || "")}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ padding: "4px 14px", borderRadius: 8, cursor: "pointer" }}
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
// ================================================================
// ================================================================

function RoutedPageBoundary({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return <PageErrorBoundary key={location.pathname}>{children}</PageErrorBoundary>;
}

export async function getInitialState() {
  return {
    navTheme: "light",
    layout: "mix",
    contentWidth: "Fluid",
    fixedHeader: false,
    fixSiderbar: false,
    headerHeight: 48,
    splitMenus: false,
  };
}

if (isWujiEnv()) {
  console.log("当前应用运行在 Wujie 微前端环境中");
  const { token, userInfo, curOrg } = (window as any).$wujie?.props ?? {};

  setStorageToken(token);
  localStorage.setItem("userInfo", JSON.stringify(userInfo) || "{}");
  localStorage.setItem("curOrg", JSON.stringify(curOrg) || "{}");

  // 退出登录态
  (window as any).$wujie?.bus.$on("host:logout", () => {
    console.log("host:logout");
    localStorage.removeItem("accessToken");
  });
  // 监听用户信息变化
  (window as any).$wujie?.bus.$on("host:user-change", (props: any) => {
    console.log("host:user-change", props);
    const { token, userInfo, curOrg } = props;
    setStorageToken(token);
    localStorage.setItem("userInfo", JSON.stringify(userInfo) || "{}");
    localStorage.setItem("curOrg", JSON.stringify(curOrg) || "{}");
  });
}
// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout = (props: any) => {
  const { initialState, setInitialState } = props;

  if (isWujiEnv()) {
    return { pure: true };
  }

  //todo 不同路由处理
  return {
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    onPageChange: () => {},
    menuRender: false,
    links: [],

    childrenRender: (children: any, props: any) => {
      const cRouter = history.location.pathname;
      // 排除登录
      const excludeRoute = [
        "/login",
        "/register",
        "/create",
        "/answerQuestions",
        "/third",
      ];

      if (
        cRouter.includes("appcenter_v2/flow") ||
        cRouter.includes("setQuestions")
      ) {
        return <div className="page_root">{children}</div>;
      }

      if (excludeRoute.findIndex((d) => cRouter.includes(d)) !== -1) {
        return <div className="page_root">{children}</div>;
      }

      return (
        <>
          <ConfigProvider locale={zhCN}>
            <div className="layout_content">
              <LayoutSider {...props} />
              <div className="content_wrap">
                <RoutedPageBoundary>{children}</RoutedPageBoundary>
              </div>
            </div>
            {/* v2.0-I 全局 AI 小助手（独立错误边界，自身异常不拖垮页面；登录/嵌入页不渲染） */}
            <GlobalAssistantSafe />
            {/* v2.0 页面流转优化：路由切换顶部进度条（即时反馈） */}
            <RouteProgress />
          </ConfigProvider>
        </>
      );
    },
    ...initialState?.settings,
    title: "智谱七天",
    headerRender: false,
    headerContentRender: false,
  };
};

export const antd: RuntimeAntdConfig = (memo) => {
  memo.theme ??= {
    token: {
      // colorPrimary: "#444CE7",
      // colorTextPlaceholder: "#94A0B8",
    },
    components: {
      // 按钮颜色
      Button: {
        // colorError: "#EF4444",
        // borderRadius: 8,
      },
      Modal: {
        // titleFontSize: 18,
        // titleLineHeight: '28px'
      },
    },
  };
  return memo;
};
