/**
 * 教师端 · 学情导入 mock（开发辅助，非系统功能）。
 * 接口：POST /api/teacher/import/history | GET /api/teacher/import/batches | GET /api/teacher/import/questions
 * 仅 start:mock 模式生效，生产构建不包含。
 */
import * as fs from "fs";
import * as path from "path";

const D = path.join(__dirname, "data");
const read = (f: string): any => JSON.parse(fs.readFileSync(path.join(D, f), "utf-8"));

const REF_DATE = "2026-08-31";
const batches: any[] = []; // 内存批次存储
let batchSeq = 0;
let newStudentSeq = 100; // 新学生学号自增

/** 题目选择池（从 questions.json 按学科筛选，默认取数学前 100 题） */
let questionPool: any[] | null = null;
export function getQuestions(subject?: string) {
  if (!questionPool) {
    const q = read("questions.json");
    // fixture 全部为义教数学；subject 参数为未来扩展预留（非数学题会被过滤）
    questionPool = q.items
      .filter((item: any) => {
        if (!subject || subject === "数学") return true;
        // 非数学学科暂无数据，返回空（避免跨学科题目混入）
        return false;
      })
      .slice(0, 100)
      .map((item: any) => ({
        qid: item.qid,
        // 不截断题干：60字截断会把 $...$ 公式切成两半导致无法渲染
        stem: item.stem,
        cluster: item.cluster,
        subject: "数学",
      }));
  }
  return questionPool;
}

/** 获取班级学生名单（用于校验账号是否存在） */
function getClassStudents(classId: string): any[] {
  try {
    return read(`class-students-${classId}.json`).map((s: any) => ({
      student_id: s.student_id,
      name: s.name,
      display_id: s.display_id,
    }));
  } catch {
    return [];
  }
}

/** 模拟导入校验+入库，返回 PRD 回执 */
function processImport(body: any) {
  const { rows = [], source = "导入", allow_new_students = false, subject, comment, exam_name, exam_date } = body;
  const classId = body.class_id || "cls-g8-03";
  const classStudents = getClassStudents(classId);
  const knownIds = new Set(classStudents.map((s) => s.student_id));
  const questions = new Set(getQuestions().map((q) => q.qid));

  const errors: any[] = [];
  const accepted: any[] = [];
  const newStudents: any[] = [];
  const queued: any[] = [];
  const touched = new Set<string>();
  const seen = new Set<string>(); // 去重键

  rows.forEach((row: any, i: number) => {
    const sid = String(row.student_id || "").trim();
    const qid = String(row.qid || "").trim();
    const dateStr = String(row.date || "").trim();

    // 1. 账号缺失
    if (!sid) {
      errors.push({ row: i, code: "ACCOUNT_MISSING", msg: `第 ${i + 1} 行：缺少账号ID` });
      return;
    }

    // 2. 账号不存在（且不允许新学生）
    if (!knownIds.has(sid) && !allow_new_students) {
      errors.push({ row: i, code: "ACCOUNT_NOT_FOUND", msg: `第 ${i + 1} 行：账号 ${sid.slice(0, 8)}… 不在班级名单中` });
      return;
    }

    // 3. 日期无法解析
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      errors.push({ row: i, code: "DATE_INVALID", msg: `第 ${i + 1} 行：日期格式错误 "${dateStr}"` });
      return;
    }

    // 4. 未来日期
    if (dateStr > REF_DATE) {
      errors.push({ row: i, code: "DATE_IN_FUTURE", msg: `第 ${i + 1} 行：练习时间 ${dateStr} 晚于画像基准日 ${REF_DATE}` });
      return;
    }

    // 5. 题目未映射
    if (qid && !questions.has(qid)) {
      errors.push({ row: i, code: "QUESTION_UNMAPPED", msg: `第 ${i + 1} 行：题目 ${qid.slice(0, 12)}… 未映射到题库，已转打标队列` });
      queued.push({ qid, stem: row.stem || "", row: i });
      return;
    }

    // 6. 重复事件
    const dedupKey = `${sid}|${qid}|${dateStr}`;
    if (seen.has(dedupKey)) {
      errors.push({ row: i, code: "DUPLICATED", msg: `第 ${i + 1} 行：重复事件（账号+题目+日期已存在）` });
      return;
    }
    seen.add(dedupKey);

    // 通过校验 → 接受
    accepted.push({ student_id: sid, qid, correct: !!row.correct, date: dateStr });
    touched.add(row.cluster || "未分类");

    // 新学生
    if (!knownIds.has(sid) && !newStudents.some((ns) => ns.student_id === sid)) {
      const stu = classStudents.find((s) => s.student_id === sid);
      newStudents.push({
        student_id: sid,
        name: row.name || stu?.name || `新生${newStudentSeq}`,
        display_id: `edu${String(newStudentSeq++).padStart(4, "0")}`,
      });
    }
  });

  batchSeq++;
  const batch = {
    batch_id: `batch_${String(batchSeq).padStart(3, "0")}`,
    accepted: accepted.length,
    rejected: errors.length,
    errors,
    queued_for_tagging: queued,
    new_students: newStudents,
    mastery_updated: { n_clusters: touched.size, clusters: [...touched].slice(0, 10) },
    meta: { subject, comment, exam_name, exam_date },
    source,
    class_id: classId,
    time: new Date().toISOString().replace("T", " ").slice(0, 19),
  };
  batches.unshift(batch);

  return {
    code: 200,
    msg: "ok",
    data: {
      accepted: batch.accepted,
      rejected: batch.rejected,
      errors,
      queued_for_tagging: queued,
      new_students: newStudents,
      mastery_updated: batch.mastery_updated,
      meta: batch.meta,
      source,
    },
  };
}

export default {
  "GET /api/teacher/import/questions": (req: any, res: any) => {
    const subject = req.query.subject || "数学";
    res.json({ code: 200, msg: "ok", data: getQuestions(subject) });
  },

  "POST /api/teacher/import/history": (req: any, res: any) => {
    setTimeout(() => {
      res.json(processImport(req.body || {}));
    }, 400); // 模拟网络延迟
  },

  "GET /api/teacher/import/batches": (req: any, res: any) => {
    const classId = req.query.class_id;
    const list = classId ? batches.filter((b) => b.class_id === classId) : batches;
    res.json({ code: 200, msg: "ok", data: list.slice(0, 20) });
  },
};

// ===== C1 题库多维标签（差异化筛选：能力/素养/区域/题型/难度/场景）=====
import { tagQuestion, tagFacets, filterQuestions } from "./questionTags";

function taggedPool() {
  return getQuestions().map(tagQuestion);
}

export { taggedPool, filterQuestions };
