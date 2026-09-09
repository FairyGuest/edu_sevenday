/** 教师端 · F5教学设计补差 + F6资源平台 mock */
import * as fs from "fs";
import * as path from "path";
import { STUDY_PLAN_MD } from "../teachPlan";
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


  // 班级可用章节：来自该班画像的真实章节（学情驱动，随班变化）
  "GET /api/teacher/teaching/class-chapters": (req: any, res: any) => {
    const classId = req.query.class_id || "cls-g8-03";
    try {
      const prof = read(`class-profile-${classId}.json`);
      const seen = new Set<string>();
      const chapters: any[] = [];
      for (const r of prof.cluster_rows || []) {
        if (r.chapter && !seen.has(r.chapter)) { seen.add(r.chapter); chapters.push({ chapter: r.chapter }); }
      }
      return res.json({ code: 200, msg: "ok", data: chapters });
    } catch {
      res.json({ code: 200, msg: "ok", data: [] });
    }
  },

  // 班级学情摘要：由画像推导四维（注入教学设计时自动设置班级学情用）
  "GET /api/teacher/teaching/class-summary": (req: any, res: any) => {
    const classId = req.query.class_id || "cls-g8-03";
    try {
      const prof = read(`class-profile-${classId}.json`);
      const weakTotal = (prof.weak_ranking || []).reduce((a: number, r: any) => a + (r.weak_n || 0), 0);
      const avg = prof.cards?.recent5_avg ?? 60;
      // 学业程度：按掌握度均值
      const degree = avg >= 66 ? "优秀" : avg >= 61 ? "中等" : "薄弱";
      // 动机习惯：趋势向好 → 主动，平稳 → 一般，下降 → 被动
      const trendUp = (prof.trend || []).slice(-3).every((t: any, i: number, arr: any[]) => i === 0 || t.value >= arr[i - 1].value - 1);
      const habit = trendUp ? "主动" : "一般";
      // 素养能力：按薄弱知识点总量
      const literacy = weakTotal >= 80 ? "待提升" : weakTotal >= 40 ? "中等" : "较强";
      // 班级差异：各簇薄弱人数的离散度
      const weaks = (prof.weak_ranking || []).map((r: any) => r.weak_n);
      const spread = weaks.length ? Math.max(...weaks) - Math.min(...weaks) : 0;
      const diff = spread >= 6 ? "分化明显" : spread >= 3 ? "分化一般" : "较为均衡";
      res.json({ code: 200, msg: "ok", data: {
        class_id: classId, class_name: prof.class_name,
        studies_degree: degree, motivation_habit: habit,
        literacy_ability: literacy, class_learning_diff: diff,
        basis: { recent5_avg: avg, weak_total: weakTotal, spread },
      } });
    } catch {
      res.json({ code: 200, msg: "ok", data: null });
    }
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
    const plans = getTeachingPlans().map((p: any) => {
      const issues = [...(p.issues || []), ...(issuedRecords[p.plan_id] || [])];
      return {
        plan_id: p.plan_id, chapter: p.chapter, version: p.version,
        created_at: p.created_at, n_issues: issues.length,
        homework_ids: p.homework_ids || [],
        courseware: p.sections?.课件大纲 || [],
      };
    });
    res.json({ code: 200, msg: "ok", data: plans });
  },

  // 教案详情：结构化全文 + 学案 + 下发记录（资源平台点开查看）
  "GET /api/teacher/resource/plans/:id": (req: any, res: any) => {
    const plan = getTeachingPlans().find((p: any) => p.plan_id === req.params.id);
    if (!plan) return res.json({ code: 404, msg: "教案不存在", data: null });
    const issues = [...(plan.issues || []), ...(issuedRecords[plan.plan_id] || [])];
    res.json({ code: 200, msg: "ok", data: {
      plan_id: plan.plan_id, chapter: plan.chapter, version: plan.version,
      sections: plan.sections, homework_ids: plan.homework_ids || [],
      issues, study_plan_md: STUDY_PLAN_MD,
    } });
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
