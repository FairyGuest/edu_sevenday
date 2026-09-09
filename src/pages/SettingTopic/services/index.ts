import { postDataRequest, getDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  postUploadTaskUrl: `${cogUrl}/external_question_bank/photo_search_questions`, // 上传图片生成任务
  postPhotoSearchQuestionOrder: `${cogUrl}/external_question_bank/photo_search_question_order`, // 上传搜题题目排序
  postPhotoSearchQuestionDelete: `${cogUrl}/external_question_bank/photo_search_question_delete`, // 上传搜题单个题删除
  postPhotoSearchSubQuestionBatchUpdate: `${cogUrl}/external_question_bank/photo_search_sub_question_batch_update`, // 批量关联章节知识点
  postPhotoSearchSubQuestionDetail: `${cogUrl}/external_question_bank/photo_search_sub_question_detail`, // 单个子题题目详情
  postPhotoSearchResultQuestionsBrief: `${cogUrl}/external_question_bank/photo_search_result_questions_brief`, // 批量关联章节知识点

  getMindQuestionGetTeacherStageId: `${cogUrl}/web/mindQuestion/getTeacherStageId`, // 查出老师的学段
  getFindXkwCourseList: `${cogUrl}/web/xkwCourse/findXkwCourseListByStageId`, // 根据学段ID查询所有关联课程
  getFindXkwTbVersList: `${cogUrl}/web/xkwTextbookVersion/findXkwTbVersListByCourseId`, // 根据课程ID查询教材版本
  getFindXkwTextbookList: `${cogUrl}/web/xkwTextbook/findXkwTextbookListByVersionId`, // 根据教材版本ID查询教材
  getFindXkwTbKPTreeList: `${cogUrl}/web/xkwTestbookKnowledgePointTree/findXkwTbKPTreeList`, // 根据教材ID查询教材JSON
  getFindXkwPaperTypeList: `${cogUrl}/web/xkwPaperType/findXkwPaperTypeListByStageId`, // 返回试卷类型
  getFindXkwQuestionTypeList: `${cogUrl}/web/xkwQuestionType/findXkwQuestionTypeListByCourseId`, // 返回题目类型
  getFindXkwAreaList: `${cogUrl}/web/xkwArea/findXkwAreaListByLevel`, // 返回行政区信息
  postFindPersonalQuestionList: `${cogUrl}/web/mindQuestion/findPersonalQuestionList`, // 智能出题接口
  postPhotoQuestionUploadFileForPhoto: `${cogUrl}/web/photoQuestion/uploadFileForPhoto`, // 上传搜题编辑习题图片
  postPhotoQuestionUploadResource: `${cogUrl}/web/photoQuestion/uploadResource`, // 上传搜题资源
  postTaskStatusUrl: `${cogUrl}/web/photoQuestion/checkStatus`, // 获取任务状态
  postPhotoQuestionFindQuestionSearchList: `${cogUrl}/web/photoQuestion/findQuestionSearchList`, // 获取题目搜索列表
  postExamFindExamPage: `${cogUrl}/web/exam/findExamPage`, // 获取试卷列表
  getExamRevokeExam: `${cogUrl}/web/exam/revokeExam`, // 撤回发布
  getExamDeleteExam: `${cogUrl}/web/exam/deleteExam`, // 删除作业
  postFindClassListByTeacher: `${cogUrl}/web/orgClass/findClassListByTeacher`, // 教师班级列表 data: [{ id, name, classList }]
  postExamSaveExam: `${cogUrl}/web/exam/saveExam`, // 创建并下发作业
  postPaperFindTeacherPaperPage: `${cogUrl}/web/paper/findTeacherPaperPage`, // 教师试卷分页列表
  postFindQuestionListByClassStudy: `${cogUrl}/web/mindQuestion/findQuestionListByClassStudy`, // 一键组作业（班级学情）
  getExamGetExamDetail: `${cogUrl}/web/exam/getExamDetail`, // 作业详情
  getOrgClassGroupTree: `${cogUrl}/web/orgClass/classGroupTree`, // 年级→班级→小组→学生树
  getPaperGetPaper: `${cogUrl}/web/paper/getPaper`, // 试卷详情（图2）params: paperId
  getPaperGetPaperFullData: `${cogUrl}/web/paper/getPaperFullData`, // 试卷全量 params: paperId → paper / paperQuestionList / paperFulldataDraft
  postPersonalQuestionFindPersonalQuestionList: `${cogUrl}/web/personalQuestion/findPersonalQuestionList`, // 个人题详情（图4）body: questionId[]
  postSavePaperUrl: `${cogUrl}/web/paper/updatePaperFullData`, // 组成试卷（全量更新试卷）
  postInsertPaperFullDataByPhoto: `${cogUrl}/web/paper/insertPaperFullDataByPhoto`, // 上传搜题保存并出题
};

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
