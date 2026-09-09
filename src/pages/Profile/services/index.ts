import {
  postDataRequest,
  getDataRequest,
} from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  // getUrl: `${cogUrl}/user/get`, // 用户获取
  getUserInfoUrl: `${cogUrl}/zhuguan/user_info`, // 用户获取
  updUrl: `${cogUrl}/user/upd`, // 用户更新
  logoutUrl: `${cogUrl}/zhuguan/logout`, // 退出登录
  postorgClassUrl: `${cogUrl}/web/orgClass/findClassPageByTeacher`, // 发布班级

};


export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
