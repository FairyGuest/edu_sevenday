import { getDataRequest, postDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  checkToken: `${cogUrl}/user/open_token`, // 101
  checkHdToken: `${cogUrl}/user/portal_login`, // 海淀
  checkTicket: `${cogUrl}/zhuguan/sso/login`, 
};

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
