import { postDataRequest, getDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  getLevelListUrl: `${cogUrl}/smart_education/subject_knowledge_graph_level_list`, // 适用水平列表
  getCourseListUrl: `${cogUrl}/course/public/list`, // 课程列表
  courseCollectUrl: `${cogUrl}/course/collect`, // 课程收藏/取消
  getCommentListUrl: `${cogUrl}/course/comment_list`,  // 获取评论列表
  getCollectListUrl: `${cogUrl}/course/course_collect_persons`, // 获取收藏列表
  sendCommentUrl: `${cogUrl}/course/create_comment`, // 发布评论回复
  deleteCommentUrl: `${cogUrl}/course/comment_delete`, // 删除评论
  getCommentAndCollectInfoUrl: `${cogUrl}/course/comment_collect_num`, // 获取评论和收藏信息
};

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
