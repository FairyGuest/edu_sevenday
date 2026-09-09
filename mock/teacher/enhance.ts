/** 教师端 · F5教学设计补差 + F6资源平台 mock */
import * as fs from "fs";
import * as path from "path";
const D = path.join(__dirname, "data");
const read = (f: string): any => JSON.parse(fs.readFileSync(path.join(D, f), "utf-8"));

// ===== F5: 教学设计 =====
export function getTeachingPlans() {
  try { return read("plans.json").plans; } catch { return []; }
}

export function getInjectFile(chapter: string, classId = "cls-g8-03") {
  const plans = getTeachingPlans();
  const plan = plans.find((p: any) => p.chapter === chapter) || plans[0];
  if (!plan) return { empty: true, empty_hint: "暂无可参考学情", rows: [] };
  // 从对应班级画像数据构造三列表格
  try {
    const prof = read(`class-profile-${classId}.json`);
    const chapterClusters = prof.cluster_rows.filter((r: any) => r.chapter === chapter).slice(0, 6);
    const rows = chapterClusters.map((r: any) => ({
      前置知识点: r.cluster,
      班级掌握分布: r.weak_pct >= 15 ? `${r.weak_pct}%待巩固（${r.weak_n}人）` : "整体向好",
      "典型错例（匿名）": r.misconception
        ? `${r.misconception.share}%错误集中在「${r.misconception.label}」`
        : "—",
    }));
    return { empty: rows.length === 0, empty_hint: "暂无可参考学情", rows, chapter, class_id: classId, plan_id: plan.plan_id };
  } catch { return { empty: true, empty_hint: "暂无可参考学情", rows: [], chapter }; }
}

// 学案下发记录（内存持久：下发后可从 plans/batches 查询，学生端消息中心触达）
const issuedRecords: Record<string, any[]> = {};

export default {
  // ===== F5: 教学设计补差 =====
  "GET /api/teacher/teaching/plans": (_req: any, res: any) => {
    const plans = getTeachingPlans().map((p: any) => ({
      ...p,
      issues: [...(p.issues || []), ...(issuedRecords[p.plan_id] || [])],
    }));
    res.json({ code: 200, msg: "ok", data: plans });
  },

  "GET /api/teacher/teaching/inject-file": (req: any, res: any) => {
    res.json({ code: 200, msg: "ok", data: getInjectFile(req.query.chapter || "", req.query.class_id || "cls-g8-03") });
  },

  // 学案下发：记录一条下发批次并返回回执（写入内存，可在 plans/batches 查询）
  "POST /api/teacher/teaching/plans": (req: any, res: any) => {
    const { chapter, class_id } = req.body || {};
    const plans = getTeachingPlans();
    const plan = plans.find((p: any) => p.chapter === chapter) || plans[0];
    const rec = {
      chapter: chapter || "",
      targets: "全班学生",
      channel: "消息中心（定时推送）",
      issued_at: new Date().toISOString().replace("T", " ").slice(0, 19),
    };
    if (plan) (issuedRecords[plan.plan_id] ||= []).push(rec);
    res.json({ code: 200, msg: "ok", data: rec });
  },

  // 布置对应作业：将章节薄弱知识点的题目注入试卷
  "POST /api/teacher/teaching/assign-homework": (req: any, res: any) => {
    const { chapter, class_id } = req.body || {};
    const inject = getInjectFile(chapter || "", class_id || "cls-g8-03");
    const n = Math.max(3, (inject.rows || []).length + 2);
    res.json({ code: 200, msg: "ok", data: {
      homework_id: "hw-" + Date.now().toString(36),
      chapter: chapter || "", class_id: class_id || "cls-g8-03",
      n_questions: n, injected_from: "教案学情（薄弱知识点优先）",
    } });
  },

  "GET /api/teacher/teaching/chapters": (_req: any, res: any) => {
    const plans = getTeachingPlans();
    const chapters = plans.map((p: any) => ({
      chapter: p.chapter, grade: p.grade, plan_id: p.plan_id,
      n_issues: p.issues?.length || 0, homework_ids: p.homework_ids || [],
    }));
    res.json({ code: 200, msg: "ok", data: chapters });
  },

  "POST /api/teacher/teaching/plans/:planId/issue": (req: any, res: any) => {
    const plans = getTeachingPlans();
    const plan = plans.find((p: any) => p.plan_id === req.params.planId);
    if (!plan) return res.json({ code: 404, msg: "教案不存在", data: null });
    const rec = {
      version: `V${(plan.issues?.length || 0) + 1}`,
      targets: "全班学生", channel: "消息中心（定时推送）",
      issued_at: new Date().toISOString().replace("T", " ").slice(0, 19),
      excerpt: plan.sections?.["四、单元学习目标与重点难点"]?.知识结构目标?.[0] || "学习目标",
    };
    res.json({ code: 200, msg: "ok", data: rec });
  },

  // ===== F6: 资源平台 =====
  "GET /api/teacher/resource/plans": (_req: any, res: any) => {
    const plans = getTeachingPlans().map((p: any) => ({
      plan_id: p.plan_id, chapter: p.chapter, version: p.version,
      created_at: p.created_at, n_issues: p.issues?.length || 0,
      homework_ids: p.homework_ids || [],
      courseware: p.sections?.课件大纲 || [],
    }));
    res.json({ code: 200, msg: "ok", data: plans });
  },

  "GET /api/teacher/resource/personal-bank": (_req: any, res: any) => {
    try {
      const d = read("personal-bank.json");
      res.json({ code: 200, msg: "ok", data: d });
    } catch {
      res.json({ code: 200, msg: "ok", data: { stats: { total: 0, mounted: 0, recheck: 0 }, items: [] } });
    }
  },

  "POST /api/teacher/resource/personal-bank/upload": (req: any, res: any) => {
    const stem = req.body?.stem || `测试题 ${Date.now()}`;
    const conf = 0.35 + Math.random() * 0.6;
    res.json({ code: 200, msg: "ok", data: {
      qid: `pers-${Date.now().toString(36)}`, stem, cluster: "待归类",
      conf: conf.toFixed(2), status: conf >= 0.5 ? "mounted" : "recheck",
      status_zh: conf >= 0.5 ? "已挂载（入推荐池）" : "复检中（隔离，不可布置）",
    }});
  },
};
