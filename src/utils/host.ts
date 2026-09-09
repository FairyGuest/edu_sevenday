export const NEXT_PUBLIC_AMAP_KEY = "54370f9255c351ba4d00703089fb1086"
export const NEXT_PUBLIC_AMAP_SECURITY = "a3e557d97ea459843b37012c4b40f7ee"

function getBascUrl() {
  // if (REACT_APP_ENV === "prod") return `https://edu.aiworkflow.cn/api`   // 生产环境
  // if (REACT_APP_ENV === "uat") return `https://edu-uat.aiworkflow.cn/api`  // 预发环境
  if (REACT_APP_ENV === "test") return `https://edu-7net-test.aiworkflow.cn/api/edu-assistant`
  // if (REACT_APP_ENV === "test") {
  //   // 本地开发走 umi 代理，避免 Captcha-Key 等自定义头触发跨域
  //   if (NODE_ENV === "development") return `/edu-assistant`;
  //   return `http://10.253.204.56:30080/edu-assistant`;
  // return `https://edu-7net-test.aiworkflow.cn/api/edu-assistant`;
  // }
  return "/api"// 本地开发默认走 umi mock（start:mock 模式）；正常启动走 REACT_APP_ENV 指定的远程后端
}

function getFileViewUrl()  {
  return ``// 本地连接本地后端
  // if (REACT_APP_ENV === "offline") return `http://minio:9000`
  // else return ``// 本地连接本地后端
}

function getPreViewUrl()  {
  return `https://www.aiworkflow.cn`// 本地连接本地后端
  // if (REACT_APP_ENV === "offline") return `${window.location.protocol}//${window.location.host}`
  // else return `https://www.aiworkflow.cn`// 本地连接本地后端
}

function getAgentPlatformUrl() {
  // 适配华北清流
  if (REACT_APP_ENV === "prod") return "https://zhiqi-edu-hb.zhipuai-infra.cn/base-edu-plat"
  if (REACT_APP_ENV === "uat") return "https://zhiqi-edu-hb.zhipuai-infra.cn/base-edu-plat"
  return `https://qingliu-hb.zhipuai-infra.cn/edu/base-edu-plat`
}

// 清流智能体，iframe 嵌套使用
export function getQingliuUrl() {
  // 适配华北清流
  if (REACT_APP_ENV === "prod") return "https://shanke-qingliu-hb.zhipuai-infra.cn"
  if (REACT_APP_ENV === "uat") return "https://shanke-qingliu-hb.zhipuai-infra.cn"
  return `https://qingliu-hb.zhipuai-infra.cn/kong`
}



export const cogUrl = getBascUrl()
export const fileViewUrl = getFileViewUrl()
export const preViewUrl = getPreViewUrl()
export const agentPlatformUrl = getAgentPlatformUrl()

// export const appcenterUrl = getappcenterUrl()
// export const knowledgeUrl = getKnowledgeUrl()
// export const appcenterUrl =
//   "https://aminer-edu-qingliu-fe.jyzhang.cn/qingliu/appcenter_v2";

// export const knowledgeUrl = "https://aminer-edu-knowledge-fe.jyzhang.cn/knowledge/";

