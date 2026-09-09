import {postDataRequest, getDataRequest} from "@/utils";
import { cogUrl } from "@/utils/host";

// const ip = 'http://10.253.207.179'
// const ip2 = 'http://10.253.214.212:80'

const api: any = {
  getNoticeListUrl: `${cogUrl}/home_page/notice/list`, // 通知列表
  noticeReadUrl: `${cogUrl}/home_page/notice/read`, // 已读
  noticeReadAllUrl: `${cogUrl}/home_page/notice/readAll`, // 全部已读
  getCourseListUrl: `${cogUrl}/exams/get_courses_by_share_id`, // 获取课程列表
  receiveHomeworkUrl: `${cogUrl}/exams/receive_exam`, // 接收作业
};

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
 