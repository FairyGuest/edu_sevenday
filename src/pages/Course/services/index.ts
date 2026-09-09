import {postDataRequest, getDataRequest} from "@/utils";
import {  cogUrl } from "@/utils/host";

const api: any = {
  courseListUrl: `${cogUrl}/course/list`, // 课程列表
  courseAddUrl: `${cogUrl}/course/add`, // 课程添加
  courseEditUrl: `${cogUrl}/course/update`, // 课程修改
  courseDelUrl: `${cogUrl}/course/delete`, // 课程删除
  courseTagsUrl: `${cogUrl}/course/list_tags`, // 课程标签列表
  userCourseListUrl: `${cogUrl}/course/list_by_user`, // 用户课程列表

  getEduTypeUrl: `${cogUrl}/smart_education/get_learning_stage`, // 教育类型
  getEduMajorUrl: `${cogUrl}/smart_education/get_major_classify`, // 年级/专业
  getEduSubjectUrl: `${cogUrl}/smart_education/course_category`, // 学科列表
  getMasterDocUrl: `${cogUrl}/smart_education/get_master_doc`, // 主教材
  postMasterDocUrl: `${cogUrl}/course/list_master_doc`, // 主教材
  teacherListUrl: `${cogUrl}/zhuguan/org_user_list`, // 教师列表
};

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
