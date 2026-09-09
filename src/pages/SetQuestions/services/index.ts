import { postDataRequest, getDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  courseListUrl: `${cogUrl}/course/list`, // 课程列表
  userCourseUrl: `${cogUrl}/course/list_by_user`, // 课程列表
  courseAddUrl: `${cogUrl}/course/add`, // 课程新增
  courseEditUrl: `${cogUrl}/course/update`, // 课程编辑
  courseTags: `${cogUrl}/course/list_tags`, // 课程标签列表
  courseDelUrl: `${cogUrl}/course/delete`, // 课程删除
  getteacherlist: `${cogUrl}/org/user/list`, // 获取教师列表
  postcourseadd: `${cogUrl}/course/add`, //  新增老师
  postcourseupdate: `${cogUrl}/course/update`, //  编辑添加老师
  kbsListUrl: `${cogUrl}/kbs/space/knowledge_docs`, // 知识库列表树
  kbsDocsListUrl: `${cogUrl}/kb_docs/get_graph_chunk`, // 知识库文档列表
  kbsAddUrl: `${cogUrl}/kbs/add`, // 新增知识库
  kbsEditUrl: `${cogUrl}/kbs/upd`, // 编辑知
  kbsDelUrl: `${cogUrl}/kbs/del`, // 删除知识库
  kbsDocsEditUrl: `${cogUrl}/kb_docs/updated_doc`, // 编辑知识库文档
  kbsDocsDelUrl: `${cogUrl}/kb_docs/delete_doc`, // 删除知识库文档
  kbsDocsInfoUrl: `${cogUrl}/kb_docs/get_doc_info/:doc_id`, // 获取知识库文档信息
  docLabelListUrl: `${cogUrl}/kb_docs/doc_label_list`, // 文档标签列表
  docLabelListGraphUrl: `${cogUrl}/docs_graph/get_graph_doc_list`, // 学科知识图谱列表
  docLabelDelUrl: `${cogUrl}/kb_docs/delete_label_doc`, // 删除文档标签
  docLabelEditUrl: `${cogUrl}/kb_docs/update_label_doc`, // 编辑文档标签
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
  getGraphsUrl: `${cogUrl}/graph/graphs`, // 下载讲义

  postExamsgeneration: `${cogUrl}/exams/generation`, //创建出题规则
  getDocAnalyzeInfo: `${cogUrl}/kb_docs/get_doc_file/:id`, //获取文件分析详情
  getExamsQuestionsList: `${cogUrl}/exams/questions/list/:id`, //获取指定试卷题目列表
  getExamsQuestionclassstats: `${cogUrl}/check/class_stats/v1`, //班级获取指定试卷题目列表
  postwordCorOfflineClass: `${cogUrl}/check/class_custom_status/v1`, //班级自定义作业指定试卷题目列表
  postwordTaskClass: `${cogUrl}/daily_task/date_detail`, //班级日常任务
  postRevisionMarksClass: `${cogUrl}/check/class_image`, //班级批改标记
  getSynchronization : `${cogUrl}/essay/synchronize_essay`, //同步出题进度
  getCollection: `${cogUrl}/essay/make_model`, //获取出题收藏列表
  getEchartsdata: `${cogUrl}/student_analysis/exam_kp_accuracy_list/v1`, //班级知识点统计图数据
  postaddReviewModal: `${cogUrl}/exams/generation/comment/add/v1`, // 自动批改添加评论
  postaddReviewtasks: `${cogUrl}/daily_task/comment`, // 自动批改添加任务评论
  postaddReviewquestionModal: `${cogUrl}/exams/question/comment/add/v1`, // 自动批改添加题目评论
  delREviewModal: `${cogUrl}/exams/generation/comment/delete/v1`, // 自动批改删除评价
  delQuestionReview: `${cogUrl}/exams/question/comment/delete/v1`, // 自动批改删除题目评价
  postdeletecomment: `${cogUrl}/daily_task/delete_comment`, // 日常任务删除任务评价
  postQuestionimageURL: `${cogUrl}/check/oss/file_url`, // 获取题目图片地址

  getClassstudentAnswer: `${cogUrl}/check/question/answers/v1`, //获取班级学生对这道题的答题情况

  getDistribute: `${cogUrl}/distribution/v2/distribute`, //分发试卷
  getMindMapUrl: `${cogUrl}/kb_docs/mind_map`, //
  getWebSearch: `${cogUrl}/kb_docs/web_search`, //查看web搜索结果
  getCheckSubmit: `${cogUrl}/check/submit`, //提交考试答案
  getCheckExam: `${cogUrl}/check/exam/student/v1`, //获取某个学生某个试卷的批卷结果

  groupListUrl: `${cogUrl}/org/group/list`, // 群组列表
  // groupSubStudentListUrl: `${cogUrl}/org/group/sub/student/list `, // 群组列表树
  // groupSubStudentListUrl: `${cogUrl}/org/group/sub/student/v2/list `, // 群组列表树(助管API版本)（暂时隐藏）

  operationDownload: `${cogUrl}/operation/download`, //下载题
  userLabelDocList: `${cogUrl}/kb_docs/doc_label_list`, // 当前用户上传的教材
  userLabelDocDel: `${cogUrl}/kb_docs/delete_label_doc`, // 删除当前用户上传的教材

  postExamsCancel: `${cogUrl}/exams/cancel`, //ai终止出题
  postPrintExam: `${cogUrl}/exams/generation/html/save`, //打印试卷

  postQuestionsUpdate: `${cogUrl}/exams/questions/update`, //更新题

  postdownloadExam: `${cogUrl}/exams/questions/listening/audio_zip/stream`, //下载试卷音频

  postPhotoCheckProgress: `${cogUrl}/photo_check/progress`, //传group_id 获取批改结果

  postPhotoCheckRecognize: `${cogUrl}/photo_check/recognize`, //上传多文件获取group_id

  postDistributionList: `${cogUrl}/web/exam/findExamPage`, //当前课程下的当前用户的发布试题列表接口
  postCorrectExam: `${cogUrl}/web/examQuestionAnswer/gradeAnswer`, // 批改试卷
  postDistributionClassStudents: `${cogUrl}/distribution/class_students/v1`, // 班级获取学生列表
  postCompositionStudent: `${cogUrl}/essay/class_student_status`, // 班级获取作文学生列表接口
  postDAilyTaskClass:`${cogUrl}/web/exam/findDistributedStudentList`, // 发布日常任务到班级
  getCompositionStudentclass: `${cogUrl}/essay/excellent_list`, // 班级获取作文

  postEditEvaluation: `${cogUrl}/essay/essay_comment/update`, // 更新作文批改方案

  delEditEvaluate: `${cogUrl}/essay/essay_sentence_comment/delete`, // 删除作文评价
  postAddEvaluation: `${cogUrl}/essay/essay_sentence_comment/save`, // 添加作文评价

  postCheckExamStudent: `${cogUrl}/web/examQuestionAnswer/teacherAnswerDetail`, // 学生获取答题试卷
  postDailyTaskStudent: `${cogUrl}/daily_task/student_detail`, // 学生获取日常任务

  postStudentComposition: `${cogUrl}/essay/assignment_content`, // 学生获取作文试卷
  // 下载作文 
  postdownloadComposition: `${cogUrl}/essay/export_pdf`, // 下载作文
  postExportComposition: `${cogUrl}/distribution/homework/export`, // 导出作业报告
  postQuestionBankGenerate: `${cogUrl}/question_bank/generate`, //题库中抽题

  postDistributionDistribute: `${cogUrl}/distribution/v2/distribute`, // 发布到班级（分发试卷-用户使用助学端API）
  postDistributionDailyTasks: `${cogUrl}/daily_task/distribute_daily_task`, // 日常任务发布到班级

  postDistributionPublishToLibrary: `${cogUrl}/distribution/publish_to_library`, // 发布到资源库
  postDistributionRename: `${cogUrl}/distribution/rename`, // 自动批改重命名
  postDistributionDelete: `${cogUrl}/distribution/delete`, // 自动批改删除文件
  postExamChatHistoryCreate: `${cogUrl}/exam_chat_history/create`, // 历史对话存入数据库
  postExamChatHistoryList: `${cogUrl}/exam_chat_history/list`, // 获取出题历史对话
  postTeachingPlanList: `${cogUrl}/assistant/teaching_plan/list/:space_id`, // 获取出题历史对话
  updateTeachingPlan: `${cogUrl}/assistant/teaching_plan/modify`, // 更新教学计划
  postTeachingPlanPublish: `${cogUrl}/assistant/teaching_plan/publish`, // 发布到教学资源库
  postNewExamsgeneration: `${cogUrl}/exams/generation2`, //ai出题用这个（旧）
  postExternalQuestionBank: `${cogUrl}/external_question_bank/external_generate`, // 出题(题库出题最新)
  getlearningstage: `${cogUrl}/smart_education/get_stage_and_major`, // 获取外侧图谱tab
  postdocsgraphlist: `${cogUrl}/docs_graph/docs_graph_list`, // 图谱列表
  postupddocsgraph: `${cogUrl}/docs_graph/upd_docs_graph`, // 外侧修改图谱
  postdeldocsgraph: `${cogUrl}/docs_graph/del_docs_graph`, // 外侧删除图谱
  // getCourseCatalog: `${cogUrl}/kb_docs/get_course_catalog`, // 获取当前课程的目录
  getCourseCatalog: `${cogUrl}/catalog/get_course_catalog`, // 获取当前课程的目录
  courseCheckStageSubject: `${cogUrl}/course/check_stage_subject`, // 校验课程阶段科目是否匹配
  postTakePhotoSearchQuestions: `${cogUrl}/external_question_bank/take_photo_search_questions`, // 搜题
  postPrintExamHtml: `${cogUrl}/question_bank/exam_html/convert`, //打印试卷
  getCourseInfo: `${cogUrl}/course/get`, // 根据课程id获取课程信息
  getCatalogKpointTree: `${cogUrl}/external_question_bank/catalog_kpoint_tree`, // 获取课程目录知识点树
  postExternalGenerateByKpoint: `${cogUrl}/external_question_bank/external_generate_by_kpoint`, // 出题（自定义学出题的）
  postExternalQuestionBankAreaIds: `${cogUrl}/external_question_bank/area_ids `, // 获取地区、场景、年份、题型
  postExternalGenerateOverallDifficulty: `${cogUrl}/external_question_bank/external_generate_overall_difficulty`, // 出题（整体难度学出题的）
  postExternalGenerateConsistentDifficulty: `${cogUrl}/external_question_bank/external_generate_consistent_difficulty`, // 出题（试题难度一致出题的）
  getTaskId: `${cogUrl}/external_question_bank/external_generate_consistent_difficulty`, // 获取出题任务id
  getAnalysisData: `${cogUrl}/exams/exam/analysis`, // 获取练习分析数据

  postExamsCustomHomework: `${cogUrl}/exams/custom_homework `, // 自定义作业创建记录
  postAddDailyTasks: `${cogUrl}/daily_task/save_daily_task`, // 添加日常任务
  getDailyTaskUrl: `${cogUrl}/daily_task/get_daily_task`, //日常任务列表
  postExamsCustomHomeworkUpdate: `${cogUrl}/exams/custom_homework/update `, // 自定义作业更新
  postExamsUploadCustomDocs: `${cogUrl}/exams/upload_custom_docs`, //自定义作业上传
  getTeachPlanBankTypes: `${cogUrl}/teach_plan/bank_types`, // 获取题目类型
  getTeachPlanBankKpointTree: `${cogUrl}/teach_plan/catalog_kpoint_tree`, // 章节知识点目录树、题型、年份等数据
  postTeachPlanSearchQuestions: `${cogUrl}/teach_plan/search_questions`, // 章节知识点搜题
  postDistributionPaperList: `${cogUrl}/distribution/paper/list/v1`, //作业列表
  DelDistributionPaperList: `${cogUrl}/distribution/paper/delete`, //作业列表删除
  WithdrawDistributionPaperList: `${cogUrl}/distribution/paper/withdraw`, //作业列表删除
  distributionPaperClone: `${cogUrl}/distribution/paper/clone`, //作业记录复制
  examsTitleUpdate: `${cogUrl}/exams/title/update`, //更改作业名称
  postuseSiderTour: `${cogUrl}/zhuguan/complete_guide`, // 引导栏

  postSaveEssayPlan: `${cogUrl}/essay/save_essay_plan`, // 新增或更新作文批改方案
  delEssayPlan: `${cogUrl}/essay/delete_essay_plan`, // 删除
  getListStage: `${cogUrl}/essay/list_stage`, // 获取适用学段列表
  getListEssay: `${cogUrl}/essay/list_essay`, // 获取批改方案列表
  getEssayDetail: `${cogUrl}/essay/get_essay_detail`, // 获取批改方案列表
  getGradeList: `${cogUrl}/essay/get_grade_list`, // 作文设置获取年级列表
  postSaveEssayRule: `${cogUrl}/essay/save_essay_rule`, // 新增或更新作文批改方案
  postEssayAssignmentSave: `${cogUrl}/essay/essay_assignment/save`, // 作文作业保存/更新
  getEssayAssignment: `${cogUrl}/essay/essay_assignment/get`, // 获取作文作业详情
  postSaveClassAnalysis: `${cogUrl}/essay/save_class_analysis`, // 保存班级分析
  getOrgGradeList: `${cogUrl}/exams/school/dept`, // 获取当前组织下的年级列表（用于共享作业）
  shareHomeworkUrl: `${cogUrl}/exams/share_exam`, // 共享作业
  getOrgTeacherList: `${cogUrl}/exams/school/teachers`, // 获取当前组织下的教师列表（用于共享作业）
  getFrequentUserList: `${cogUrl}/exams/get_frequent_user`, // 获取常用用户列表
};
// https://flow.aminer.cn/kb_api_test/api/v1/kb_docs_segment/list_bbox?doc_id=814d1e4f-063d-11f0-a61a-35cf773740d6
export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
