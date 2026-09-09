import { getDataRequest, postDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  // getUrl: `${cogUrl}/user/get`, // 工具添加
  // loginUrl:  `${cogUrl}/user/login`,
  loginUrl: `${cogUrl}/web/eduAuth/login`, // 登录接口
  getCaptchaUrl: `${cogUrl}/web/eduAuth/captcha`,  // 获取验证码
  getUserInfoUrl: `${cogUrl}/web/eduAuth/getUser?accessToken=${localStorage.getItem("accessToken") || ""}`, // 用户信息
  postorgLoginUrl: `${cogUrl}/web/eduAuth/orgLogin`, // 选择机构登录
};

export async function postDataService(
  params: any,
  apiUrl: string,
  extra?: { headers?: Record<string, string> },
) {
  return postDataRequest(params, api[apiUrl], extra);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
