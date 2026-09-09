import {
  postDataRequest,
} from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  // getUrl: `${cogUrl}/user/get`, // 工具添加
  registerUrl:  `${cogUrl}/user/register`, //
};


export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}
