/**
 * 资源平台（登录落地页 /source）与教材级联选择器 mock（开发辅助，非系统功能）。
 * 消费 mock/data fixture；仅 start:mock 模式生效（cogUrl=/api），生产构建不包含。
 *
 * 契约来源：
 * - src/pages/ResourceSearch/services/index.ts + hooks/{useHeader,useLeft,useRight}
 *   题目分页期望 data:{ records[], current, size, total }（IPage 风格）
 * - src/pages/SettingTopic/hooks/useXkwTextbookCascader
 *   章节树经 parseXkwTbKPTreeResponse 解析：data[0].treeJson.tree，节点需 type/title/id
 */
import * as fs from "fs";
import * as path from "path";

const D = path.join(__dirname, "..", "data");
const read = (f: string): any => JSON.parse(fs.readFileSync(path.join(D, f), "utf-8"));

const questionTypes = read("questionTypes.json");
const personalQuestions = read("personalQuestions.json");
const publicQuestions = read("questions.json");
const textbooksList = read("textbooksList.json");

/** fixture 的 {id,name,level,children} → 解析器需要的 {id,title,type:'catalog',children} */
const toCatalogNode = (n: any): any => ({
  id: n.id,
  code: n.code,
  title: n.name,
  name: n.name,
  level: n.level,
  sortNo: n.sortNo,
  type: "catalog",
  children: (n.children || []).map(toCatalogNode),
});
const chapterTree = [{ treeJson: { tree: read("chapterTreeData.json").map(toCatalogNode) } }];

/** 简单分页（忽略筛选条件，本地演示只保证流程可用） */
const paginate = (list: any[], body: any) => {
  const current = Number(body?.current) || 1;
  const size = Number(body?.size) || 10;
  const start = (current - 1) * size;
  return {
    records: list.slice(start, start + size),
    current,
    size,
    total: list.length,
    pages: Math.ceil(list.length / size),
  };
};

export default {
  // 题型（个人题库按课程）
  "POST /api/web/xkwQuestionType/findXkwQuestionTypeListByCourseId": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: questionTypes });
  },

  // 章节树（教材知识点树）
  "POST /api/web/xkwTestbookKnowledgePointTree/findXkwTbKPTreeList": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: chapterTree });
  },

  // 个人题库试题分页
  "POST /api/web/personalQuestion/findPersonalQuestionPage": (req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: paginate(personalQuestions, req.body) });
  },

  // 公共题库试题分页
  "POST /api/web/publicQuestion/findPublicQuestionPage": (req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: paginate(publicQuestions, req.body) });
  },

  // 相似题
  "GET /api/web/publicQuestion/findPublicQuestionSimilarList": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: { records: publicQuestions.slice(0, 5), current: 1, size: 5, total: 5 } });
  },

  // 教师学段（教材级联入口）
  "GET /api/web/mindQuestion/getTeacherStageId": (_req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: { stageId: "stage-junior", stageName: "初中" } });
  },

  // 学段下的课程列表
  "GET /api/web/xkwCourse/findXkwCourseListByStageId": (_req: any, res: any) => {
    res.json({
      code: 200,
      msg: "ok",
      data: [
        {
          id: "course-mock-001",
          name: "初中数学",
          label: "初中数学",
          stageId: "stage-junior",
          stage_name: "初中",
          subject: "数学",
          subject_name: "数学",
        },
      ],
    });
  },

  // 课程下的教材版本
  "GET /api/web/xkwTextbookVersion/findXkwTbVersListByCourseId": (_req: any, res: any) => {
    res.json({
      code: 200,
      msg: "ok",
      data: [{ id: "ver-rj-01", name: "人教版", label: "人教版", courseId: "course-mock-001" }],
    });
  },

  // 版本下的教材列表
  "GET /api/web/xkwTextbook/findXkwTextbookListByVersionId": (_req: any, res: any) => {
    res.json({
      code: 200,
      msg: "ok",
      data: textbooksList.slice(0, 6).map((t: any) => ({ ...t, label: t.name })),
    });
  },
};
