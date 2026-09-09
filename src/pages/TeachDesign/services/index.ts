import { postDataRequest, getDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {
  postDocAnalyzeInfo: `${cogUrl}/kb_docs/get_doc_file/:id`, //获取文件预览
  getDocCatalogUrl: `${cogUrl}/catalog/tree_doc`, // 获取文档目录
  getPlanListUrl: `${cogUrl}/teach_plan/teach_plan_history/list`, // 教案列表
  postEditPlanUrl: `${cogUrl}/teach_plan/update_teach_plan`, // 教案修改
  postDeletePlanUrl: `${cogUrl}/teach_plan/delete_teach_plan`, // 教案删除
  postCategoryUrl: `${cogUrl}/teach_plan/category_list`, // 教案类型
  getDocsNodeTree: `${cogUrl}/docs_content/docs_node_tree`, // 教材目录树
  postTeachMakerUrl: `${cogUrl}/teach_plan/teach_maker`, // 教案生成
  postTeachChatUrl: `${cogUrl}/teach_plan/get_temp_teach_plan_chat`, // 教案聊天
  postTempChildPlan: `${cogUrl}/teach_plan/temp_child_teach_plan_chat`, // 临时单元课时教案对话
  getUnitClassUrl: `${cogUrl}/teach_plan/unit_plan/child_plan_info`, // 获取单元的课时教案
  getCourseType: `${cogUrl}/teach_plan/course_type`, // 获取课程类型
  postLearningInfo: `${cogUrl}/teach_plan/learning_info`, // 获取学情信息
  postClassType: `${cogUrl}/teach_plan/class_type`, // 获取班型信息
  createTeachGuide: `${cogUrl}/teach_plan/teach_guide`, // 创建教案指南
  getCoursePlanInfo: `${cogUrl}/course/teach_plan_get_course`, // 教案获取课程
  postPublishToLib: `${cogUrl}/teach_plan/publish/lib`, // 教案发布到课程
  getPlanReplaceUrl: `${cogUrl}/teach_plan/replace_content`, // 教案内容替换
  getPlanReplaceContent: `${cogUrl}/teach_plan/single_teach_plan_content`, // 教案内容替换
  getPlanDetailUrl: `${cogUrl}/teach_plan/teach_plan_history/:id`, // 教案详情
  postDownloadPaln: `${cogUrl}/teach_plan/download`, // 教案下载
  getCheckTeachPlan: `${cogUrl}/teach_plan/check_teach_plan`, // 教案审核
  updateUnitPlanUrl: `${cogUrl}/teach_plan/update_unit_teach_plan`, // 更新单元教案
  singlePlanMaker: `${cogUrl}/teach_plan/single_teach_maker`, // 单条教案生成
  getUnitPlanUrl: `${cogUrl}/teach_plan/get_teach_plan_by_id`, // 获取单元--课时教案
  postBookPageUrl: `${cogUrl}/teach_plan/chapter/page`, // 获取教材页码
  docLabelDelUrl: `${cogUrl}/kb_docs/delete_label_doc`, // 删除标签文档
  getStageUrl: `${cogUrl}/teach_plan/xueduan_xueke`, // 获取学段学科
  getSubjectUrl: `${cogUrl}/teach_plan/banben_ceci`, // 获取教材章节
  getClassTypeUrl: `${cogUrl}/teach_plan/class_type`, // 获取班型信息
  getDesignContextUrl: `${cogUrl}/teach_plan/user_context`, // 获取教案上下文
  postStudyPlanGenerateInfo: `${cogUrl}/teach_plan/study_plan_generate_info`, // 通过教案获取学案
  getStudyPlanHistory: `${cogUrl}/teach_plan/study_plan_history/:id`, // 查看学案历史详情
  postTempStudyPlanChat: `${cogUrl}/teach_plan/temp_study_plan_chat`, // 获取临时学案对话
  postUserIntentRecognition: `${cogUrl}/teach_plan/user_intent_recognition`, // 用户意向判断
  postPromptTemplateUrl: `${cogUrl}/teach_plan/get_teach_prompt_template`, // 获取教案提示模板
  postTeachPlanEvaluate: `${cogUrl}/teach_plan/evaluate`, // 评估
  postTeachVideo: `${cogUrl}/teach_plan/video/list`, // 获取教案视频
};

export { cogUrl };

export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}
