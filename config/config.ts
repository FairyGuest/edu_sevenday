import { defineConfig } from "umi";
import routes from "./routes";
import proxy from "./proxy";

const {
  REACT_APP_ENV, // react 运行环境，base
  BE_ENV, // 后端环境，本地开发调试生效
  NODE_ENV, // Node 环境，是否为本地开发
} = process.env;

let base = process.env.DEPLOY_BASE || "/";

export default defineConfig({
  hash: true,
  model: {},
  esbuildMinifyIIFE: true,
  initialState: {
    // loading: 'src/components/PageLoading', // 如果有自定义加载组件
  },
  request: {},
  antd: {
    configProvider: {},
    theme: {
      token: {
        colorPrimary: "#1C6CFF",
        colorLink: "#1C6CFF",
      },
    },
  },
  headScripts: [
    { src: `${base}aliyun-oss-sdk-6.17.1.min.js` }, // 阿里云OSS SDK
    { src: `${base}aliyun-upload-sdk-1.5.7.min.js` }, // 阿里云OSS SDK
    { src: `${base}font_4874294_2n3sc6mx2ms_1.js` }, //重要的
    { src: `${base}mathlatex-sdk.js` }, // 公式sdk
    // { src: `//at.alicdn.com/t/c/font_4874294_yhdyoedqe1d.js` },
  ],

  dva: {
    immer: {
      enableES5: true, // 可以根据需要开启/关闭 ES5 支持
    },
  },
  layout: {
    locale: true,
    siderWidth: 208,
  },
  locale: {
    default: "zh-CN",
    antd: true,
    baseNavigator: true,
  },
  //
  base,
  define: {
    NODE_ENV: NODE_ENV,
    BE_ENV: BE_ENV,
    REACT_APP_ENV: REACT_APP_ENV,
    BASE: base,
    PUBLIC_PATH: base.slice(0, -1), // 创建一个新页面
    "process.env.SSR_MANIFEST": false,
  },
  links: [
    {
      rel: "icon",
      href: `${base}favicon.svg`,
    },
  ],

  styles: ["./tailwind.css"],
  scripts: [
    // 'https://www.taobao.com/help/getip.php?ipCallback=ipCallback',
    // 'https://api.map.baidu.com/api?type=webgl&v=1.0&ak=ZM3wRD3Z5uQNYm1Xav19go8jGquvkP4n',
  ],

  // https://umijs.org/zh-CN/plugins/plugin-loca
  // dynamicImport: {
  //   loading: "@ant-design/pro-layout/es/PageLoading",
  // },

  // targets: {
  //   ie: 11,
  // },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // 如果不想要 configProvide 动态设置主题需要把这个设置为 default
    // 只有设置为 variable， 才能使用 configProvide 动态设置主色调
    // https://ant.design/docs/react/customize-theme-variable-cn
    "root-entry-name": "variable",
    "primary-color": "#1C6CFF",
    // "border-color-base": "#E83421", // 边框色
    // "border-color-base": "#E83421", // 边框色
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  ignoreMomentLocale: true,
  // proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: base,
  },
  // 全局变量

  metas: [
    {
      name: "referrer",
      content: "never",
    },
  ],

  proxy,
  // Fast Refresh 热更新
  // fastRefresh: {},
  // nodeModulesTransform: { type: 'none' },
  // exportStatic: {},
  // dva: {
  // immer: true, // 表示是否启用 immer 以方便修改 reducer
  // hmr: true, // 表示是否启用 dva model 的热更新
  // skipModelValidate: true,
  // }
  publicPath: NODE_ENV === "development" ? "/" : base,
  tailwindcss: false,
  // quill 为 ESM，MFSU 联邦容器未暴露时会报 Module "./quill" does not exist
  mfsu: {
    exclude: ["quill"],
  },
});
