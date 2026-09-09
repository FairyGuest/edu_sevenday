import {postDataRequest,getDataRequest} from "@/utils";
import {  cogUrl } from "@/utils/host";
import { edit } from "ace-builds";
import { add } from "lodash";

const api: any = {
  courseEditUrl: `${cogUrl}/course/update`, // 课程编辑
  userCourseUrl: `${cogUrl}/course/list_by_user`, // 课程列表
  getCourseCatalogUrl: `${cogUrl}/catalog/get_course_catalog_title`, // 获取课程目录
  addCourseCatalogUrl: `${cogUrl}/catalog/add`, // 课程目录新增
  deleteCourseCatalogUrl: `${cogUrl}/catalog/delete`, // 课程目录删除
  editCourseCatalogUrl: `${cogUrl}/catalog/update`, // 课程目录编辑
  getMasterCatalogUrl: `${cogUrl}/catalog/get_course_catalog`, // 获取主教材目录
  getDocCatalogUrl: `${cogUrl}/catalog/tree_doc`, // 获取文档目录
  getDocCatalogRes: `${cogUrl}/catalog/catalog_result`, // 获取文档目录结果
  addDocToCatalogUrl: `${cogUrl}/catalog/extract_doc_catalog`, // 文档目录生成
  editDocCatalogUrl: `${cogUrl}/catalog/upd_doc`, // 文档目录编辑
  clearDocCatalogUrl: `${cogUrl}/catalog/clear_doc`, // 文档目录清空
  exitExtractCatalogUrl: `${cogUrl}/catalog/exit_extract_catalog`, // 文档目录退出解析

  docLabelListUrl: `${cogUrl}/kb_docs/doc_label_list`, // 文档标签列表
  docLabelEditUrl: `${cogUrl}/kb_docs/update_label_doc`, // 编辑标签文档
  docLabelDelUrl: `${cogUrl}/kb_docs/delete_label_doc`, // 删除标签文档
  docUnEmptyLabelUrl: `${cogUrl}/kb_docs/get_non_empty_labels`, // 获取非空标签
  postDocAnalyzeInfo: `${cogUrl}/kb_docs/get_doc_file/:id`, //获取文件预览
  postDocContentSummary: `${cogUrl}/kb_docs/content_summary `, // 文档内容摘要
  postChatHistory: `${cogUrl}/assistant/session/history`, // 对话历史记录
  postGraphDataUrl: `${cogUrl}/graph/graphs`, // 图谱数据
  postGraphEditUrl: `${cogUrl}/docs_graph/upd_docs_graph`, // 图谱编辑（重命名）
  postGraphDeleteUrl: `${cogUrl}/docs_graph/del_docs_graph`, // 图谱删除
  postGraphPublishUrl: `${cogUrl}/docs_graph/publish_docs_graph`, // 图谱发布、下架
  getPPTDataUrl: `${cogUrl}/assistant/ppt/get_ppt_page_by_doc_id/:id`, // 获取PPT数据

  courseListUrl: `${cogUrl}/course/list`, // 课程列表
  courseAddUrl: `${cogUrl}/course/add`, // 课程新增
  courseTags: `${cogUrl}/course/list_tags`, // 课程标签列表
  courseDelUrl: `${cogUrl}/course/delete`, // 课程删除
  kbsListUrl: `${cogUrl}/kbs/space/knowledge_docs`, // 知识库列表树
  kbsAddUrl: `${cogUrl}/kbs/add`, // 新增知识库
  kbsEditUrl: `${cogUrl}/kbs/upd`, // 编辑知识库
  kbsDelUrl: `${cogUrl}/kbs/del`, // 删除知识库
  kbsDocsEditUrl: `${cogUrl}/kb_docs/updated_doc`, // 编辑知识库文档
  kbsDocsDelUrl: `${cogUrl}/kb_docs/delete_doc`, // 删除知识库文档
  kbsDocsInfoUrl: `${cogUrl}/kb_docs/get_doc_info/:doc_id`, // 获取知识库文档信息
  examsListUrl: `${cogUrl}/check/folders/:space_id`, // 考试列表树
  examsAddUrl: `${cogUrl}/operation/add`, // 新增考试
  examsEditUrl: `${cogUrl}/operation/rename`, // 编辑考试
  examsDelUrl: `${cogUrl}/operation/delete/:gen_id`, // 删除考试
  paperEditUrl: `${cogUrl}/kb_docs/updated_doc`, // 编辑试卷
  paperDelUrl: `${cogUrl}/kb_docs/delete_doc`, // 删除试卷
  paperInfoUrl: `${cogUrl}/check/result/:paper_id`, // 获取试卷信息
  exerciseListUrl: `${cogUrl}/history/list`, // 练习树列表
  saveNoteUrl: `${cogUrl}/assistant/run/teching_meterial/save`, //保存讲义
  downNoteUrl: `${cogUrl}/assistant/run/teching_meterial/download`, // 下载讲义
  postExamsgeneration: `${cogUrl}/exams/generation`, //创建出题规则
  getExamsQuestionsList: `${cogUrl}/exams/questions/list/:id`, //获取指定试卷题目列表
  getDistribute: `${cogUrl}/distribution/distribute`, //分发试卷
  getMindMapUrl: `${cogUrl}/kb_docs/mind_map`, //
  getWebSearch: `${cogUrl}/kb_docs/web_search`, //查看web搜索结果
  getCheckSubmit: `${cogUrl}/check/submit`, //提交考试答案
  getCheckExam: `${cogUrl}/check/exam/student`, //获取某个学生某个试卷的批卷结果
  groupListUrl: `${cogUrl}/org/group/list`, // 群组列表
  operationDownload: `${cogUrl}/operation/download`, //下载题
  userLabelDocList: `${cogUrl}/kb_docs/doc_label_list`, // 当前用户上传的教材
  userLabelDocDel: `${cogUrl}/kb_docs/delete_label_doc`, // 删除当前用户上传的教材
  postNewExamsgeneration: `${cogUrl}/exams/generation2`, //ai出题用这个
  postExamsCancel: `${cogUrl}/exams/cancel`, //ai终止出题
  postPrintExam: `${cogUrl}/exams/generation/html/save`, //打印试卷
  postQuestionsUpdate: `${cogUrl}/exams/questions/update`, //更新题
  postPhotoCheckProgress: `${cogUrl}/photo_check/progress`, //传group_id 获取批改结果
  postPhotoCheckRecognize: `${cogUrl}/photo_check/recognize`, //上传多文件获取group_id
  getVodKey: `${cogUrl}/kb_docs/vod_key`, // 创建音视频上传凭证
  refreshVodKey: `${cogUrl}/kb_docs/refresh_vod_key`, // 刷新音视频上传凭证
  getVodCall: `${cogUrl}/kb_docs/vod_call`, // 音视频上传成功后回调
  postGetPlayInfo: `${cogUrl}/kb_docs/get_play_info/:id`, //根据音视频id获取播放地址（有时效）
};

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
