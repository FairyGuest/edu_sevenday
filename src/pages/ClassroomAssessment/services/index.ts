import {postDataRequest, getDataRequest} from "@/utils";
import {  cogUrl } from "@/utils/host";

const api: any = {
  getIssueUrl: `${cogUrl}/sso/class_eval/issue`, // 获取班级列表
};

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}
