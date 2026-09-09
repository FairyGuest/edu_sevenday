import { cogUrl } from '@/utils/host';
import {  postDataRequest, getDataRequest } from "@/utils";


const api = {

  pdfResult: `${cogUrl}/pdf/detail`, // 获取pdf解析结果
  updateChunksUrl: `${cogUrl}/chunks/update`, // 切分或者合并
  pdfChunksResult: `${cogUrl}/chunks/get`, // 批量获取切分片

  graphAddUrl: `${cogUrl}/graph/file/add`, // 知识库添加
  graphQueryUrl: `${cogUrl}/graph/node_relation/query`,  // 图谱查询
  graphDeleteNodeUrl: `${cogUrl}/graph/node/delete`,  // 图谱查询
  graphUpdateLineUrl: `${cogUrl}/graph/rel/upd`,  // 图谱查询
  graphDeleteLineUrl: `${cogUrl}/graph/rel/delete`,  // 图谱查询
  graphUpdateNodeUrl: `${cogUrl}/graph/node/upd`,  // 图谱查询

  spaceListUrl: `${cogUrl}/user/creative/space/list`,  // 创作空间
  addSpaceUrl: `${cogUrl}/creative/space/add`,  // 创作空间添加
  updSpaceUrl: `${cogUrl}/creative/space/upd`,  // 创作空间修改
  delSpaceUrl: `${cogUrl}/creative/space/del`,  // 创作空间删除

  editPassUrl: `${cogUrl}/user/reset/pass`,  // 修改密码

  // resetPasswordUrl: `${cogUrl}/user/reset/password`,  // 修改密码
  resetPasswordUrl: `${cogUrl}/zhuguan/resetPwd`, 

  addCourse: `${cogUrl}/course/add`, // 课程添加
  editCourse: `${cogUrl}/course/update`, // 课程修改
  getGraphsUrl:`${cogUrl}/graph/graphs`, // 图谱查询

  getTeacherContextUrl: `${cogUrl}/course/teacher_context`, // 获取教师上下文
  setTeacherContextUrl: `${cogUrl}/course/teacher_context/save`, // 设置教师上下文
  getNewNoticeUrl: `${cogUrl}/home_page/new/notice`, // 获取实时新消息
  updbase64Url: `${cogUrl}/exams/upload_base64_images`, // 设置教师上下文

};

export async function postDataService(params: any, apiUrl: keyof typeof api) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
