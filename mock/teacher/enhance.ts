/** 教师端 · F5教学设计补差 + F6资源平台 mock */
import * as fs from "fs";
import * as path from "path";
import { STUDY_PLAN_MD } from "../teachPlan";
import {
  registerStudyPlanIssue,
  dispatchSummaries,
  reflectionRecordList,
} from "./homeworkFlow";
const D = path.join(__dirname, "data");
const read = (f: string): any =>
  JSON.parse(fs.readFileSync(path.join(D, f), "utf-8"));

// ===== F5: 教学设计 =====
export function getTeachingPlans() {
  try {
    return read("plans.json").plans;
  } catch {
    return [];
  }
}

export function getInjectFile(chapter: string, classId = "cls-g8-03") {
  const plans = getTeachingPlans();
  const plan = plans.find((p: any) => p.chapter === chapter) || plans[0];
  if (!plan) return { empty: true, empty_hint: "暂无可参考学情", rows: [] };
  // 从对应班级画像数据构造三列表格
  try {
    const prof = read(`class-profile-${classId}.json`);
    const chapterClusters = prof.cluster_rows
      .filter((r: any) => r.chapter === chapter)
      .slice(0, 6);
    const rows = chapterClusters.map((r: any) => ({
      前置知识点: r.cluster,
      班级掌握分布:
        r.weak_pct >= 15 ? `${r.weak_pct}%待巩固（${r.weak_n}人）` : "整体向好",
      "典型错例（匿名）": r.misconception
        ? `${r.misconception.share}%错误集中在「${r.misconception.label}」`
        : "—",
    }));
    return {
      empty: rows.length === 0,
      empty_hint: "暂无可参考学情",
      rows,
      chapter,
      class_id: classId,
      plan_id: plan.plan_id,
    };
  } catch {
    return { empty: true, empty_hint: "暂无可参考学情", rows: [], chapter };
  }
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
    res.json({
      code: 200,
      msg: "ok",
      data: getInjectFile(
        req.query.chapter || "",
        req.query.class_id || "cls-g8-03",
      ),
    });
  },

  // 学案下发：记录一条下发批次并返回回执（写入内存，可在 plans/batches 查询；同步进入回收工作台）
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
    // 注册进下发回收工作台（三档分层 + 回收状态）
    const dispatch = registerStudyPlanIssue({
      plan_id: plan?.plan_id,
      chapter,
      class_id,
    });
    res.json({
      code: 200,
      msg: "ok",
      data: {
        ...rec,
        dispatch_id: dispatch.dispatch_id,
        n_students: dispatch.roster.length,
      },
    });
  },

  // 班级可用章节：来自该班画像的真实章节（学情驱动，随班变化）
  "GET /api/teacher/teaching/class-chapters": (req: any, res: any) => {
    const classId = req.query.class_id || "cls-g8-03";
    try {
      const prof = read(`class-profile-${classId}.json`);
      const seen = new Set<string>();
      const chapters: any[] = [];
      for (const r of prof.cluster_rows || []) {
        if (r.chapter && !seen.has(r.chapter)) {
          seen.add(r.chapter);
          chapters.push({ chapter: r.chapter });
        }
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
      const weakTotal = (prof.weak_ranking || []).reduce(
        (a: number, r: any) => a + (r.weak_n || 0),
        0,
      );
      const avg = prof.cards?.recent5_avg ?? 60;
      // 学业程度：按掌握度均值
      const degree = avg >= 66 ? "优秀" : avg >= 61 ? "中等" : "薄弱";
      // 动机习惯：趋势向好 → 主动，平稳 → 一般，下降 → 被动
      const trendUp = (prof.trend || [])
        .slice(-3)
        .every(
          (t: any, i: number, arr: any[]) =>
            i === 0 || t.value >= arr[i - 1].value - 1,
        );
      const habit = trendUp ? "主动" : "一般";
      // 素养能力：按薄弱知识点总量
      const literacy =
        weakTotal >= 80 ? "待提升" : weakTotal >= 40 ? "中等" : "较强";
      // 班级差异：各簇薄弱人数的离散度
      const weaks = (prof.weak_ranking || []).map((r: any) => r.weak_n);
      const spread = weaks.length ? Math.max(...weaks) - Math.min(...weaks) : 0;
      const diff =
        spread >= 6 ? "分化明显" : spread >= 3 ? "分化一般" : "较为均衡";
      res.json({
        code: 200,
        msg: "ok",
        data: {
          class_id: classId,
          class_name: prof.class_name,
          studies_degree: degree,
          motivation_habit: habit,
          literacy_ability: literacy,
          class_learning_diff: diff,
          basis: { recent5_avg: avg, weak_total: weakTotal, spread },
        },
      });
    } catch {
      res.json({ code: 200, msg: "ok", data: null });
    }
  },

  // 教学目标建议：按班级学情（薄弱知识点/最低素养）生成候选目标 + 评价量规草案；另附课标固定目标库。
  // 口径：建议目标均可观察、可评价（课标行为动词），依据引用画像读数，不凭空生成。
  "GET /api/teacher/teaching/objectives": (req: any, res: any) => {
    const classId = req.query.class_id || "cls-g8-03";
    const suggestions: any[] = [];
    let className = classId;
    try {
      const prof = read(`class-profile-${classId}.json`);
      className = prof.class_name || classId;
      const RUBRIC = (cluster: string) => [
        {
          level: "合格",
          desc: `能在教师提示下完成「${cluster}」基本题，关键步骤完整`,
        },
        {
          level: "良好",
          desc: `能独立完成「${cluster}」典型题，并口头解释每一步依据`,
        },
        {
          level: "优秀",
          desc: `能在新情境中选用「${cluster}」方法解决问题，并说明选择理由`,
        },
      ];
      for (const w of (prof.weak_ranking || [])
        .filter((r: any) => (r.weak_n || 0) > 0)
        .slice(0, 3)) {
        suggestions.push({
          id: `obj-k-${w.cluster}`,
          kind: "knowledge",
          cluster: w.cluster,
          level: "L3 掌握",
          text: `能运用「${w.cluster}」解决熟悉情境中的问题，并解释关键步骤的依据`,
          basis: `${className}「${w.cluster}」待巩固 ${w.weak_pct}%（${w.weak_n} 人），来自班级画像薄弱排行`,
          rubric: RUBRIC(w.cluster),
        });
      }
      try {
        const dims = read(`profile-dimensions-class-${classId}.json`);
        const lit = (dims.dimensions || []).find(
          (d: any) => d.dimension_key === "literacy",
        );
        const weakLit = [...(lit?.radar_items || [])]
          .filter((i: any) => typeof i.value === "number")
          .sort((a: any, b: any) => a.value - b.value)[0];
        if (weakLit)
          suggestions.push({
            id: `obj-l-${weakLit.key}`,
            kind: "literacy",
            cluster: weakLit.name,
            level: "L2 理解",
            text: `在「${weakLit.name}」维度上，能对解题过程做出有条理的表达与自我检验`,
            basis: `${className}素养画像「${weakLit.name}」班均 ${weakLit.value} 分，为六维最低项`,
            rubric: [
              { level: "合格", desc: "能写出主要结论，表达基本完整" },
              { level: "良好", desc: "能分步骤说明理由，用语与概念一致" },
              { level: "优秀", desc: "能主动检验并修正自己的表述，逻辑连贯" },
            ],
          });
      } catch {
        /* 该班无四维画像文件时跳过素养目标 */
      }
    } catch {
      /* 无班级画像时仅返回固定库 */
    }
    const fixed = [
      {
        id: "fix-1",
        kind: "knowledge",
        level: "L1 了解",
        text: "能说出本节核心概念的定义并举出一个正例和一个反例",
        literacy: "数学抽象",
      },
      {
        id: "fix-2",
        kind: "knowledge",
        level: "L2 理解",
        text: "能用图象或表格表示两个变量之间的关系，并解释变化趋势",
        literacy: "直观想象",
      },
      {
        id: "fix-3",
        kind: "knowledge",
        level: "L3 掌握",
        text: "能规范完成运算并说明算理，步骤可复查",
        literacy: "数学运算",
      },
      {
        id: "fix-4",
        kind: "literacy",
        level: "L3 掌握",
        text: "能从实际情境中抽象出数量关系，建立模型并检验结果",
        literacy: "数学建模",
      },
      {
        id: "fix-5",
        kind: "literacy",
        level: "L2 理解",
        text: "能依据已知条件进行推理，并指出推理依据",
        literacy: "逻辑推理",
      },
      {
        id: "fix-6",
        kind: "literacy",
        level: "L2 理解",
        text: "能读取图表数据并做出简单推断，说明数据口径",
        literacy: "数据分析",
      },
      {
        id: "fix-7",
        kind: "process",
        level: "—",
        text: "能按任务要求独立完成并自查，订正时标注错因",
        literacy: "学习过程",
      },
      {
        id: "fix-8",
        kind: "process",
        level: "—",
        text: "在小组讨论中能提出一个问题并回应他人观点",
        literacy: "学习过程",
      },
    ];
    res.json({
      code: 200,
      msg: "ok",
      data: {
        class_id: classId,
        class_name: className,
        suggestions,
        fixed,
        note: "建议目标由班级画像推导（AI 建议、教师决定）；固定目标为课标通用库；两者均可勾选并随生成请求带入",
      },
    });
  },

  // 教学资源（注入用）：按班级学情关联的练习/课件页/量规/材料，可与教学目标一起勾选后注入设计
  // 首页工作台聚合统计（单请求供全页；作业/反思数字与各页接口同源一致）
  "GET /api/teacher/workbench/summary": (_req: any, res: any) => {
    const classes = read("classes.json").classes || [];
    // 学情：三班观测层事件与学生数、待巩固知识点簇
    let evidenceEvents = 0,
      students = 0,
      weakClusters = 0;
    for (const c of classes) {
      try {
        const obs = read(`portrait-observations-${c.class_id}.json`);
        evidenceEvents += (obs.events || []).length;
        students += new Set((obs.events || []).map((e: any) => e.student_id))
          .size;
      } catch {
        /* 该班无观测层文件 */
      }
      try {
        const prof = read(`class-profile-${c.class_id}.json`);
        weakClusters += (prof.weak_ranking || []).filter(
          (r: any) => (r.weak_pct || 0) >= 15,
        ).length;
      } catch {
        /* 无画像 */
      }
    }
    // 设计：教案、学案下发（静态 issues + 会话内下发）、反思
    const plans = getTeachingPlans();
    const planIssues = plans.reduce(
      (a: number, p: any) => a + (p.issues?.length || 0),
      0,
    );
    const reflections = reflectionRecordList().length;
    // 作业：回收中/待复核（与 /homework-flow/list 同源）
    const dispatches = dispatchSummaries();
    const active = dispatches.filter((d: any) => !d.finished);
    const pendingReview = dispatches.reduce(
      (a: number, d: any) =>
        a +
        Math.max(
          0,
          (d.progress?.ai_graded || 0) - (d.progress?.teacher_reviewed || 0),
        ),
      0,
    );
    const lateSubmits = active.reduce(
      (a: number, d: any) => a + (d.progress?.late || 0),
      0,
    );
    // 教研
    let researchTopics = 0,
      researchUpdated = 0;
    try {
      const topics = read("research-topics.json");
      researchTopics = (topics.topics || []).length;
      researchUpdated = (topics.topics || []).filter(
        (t: any) => t.status === "discussing",
      ).length;
    } catch {
      /* 无教研数据 */
    }
    // 素养提醒：三班四维画像最低素养项
    let weakLiteracy = "";
    try {
      const dims = read("profile-dimensions-class-cls-g8-03.json");
      const lit = (dims.dimensions || []).find(
        (d: any) => d.dimension_key === "literacy",
      );
      const w = [...(lit?.radar_items || [])]
        .filter((i: any) => typeof i.value === "number")
        .sort((a: any, b: any) => a.value - b.value)[0];
      if (w) weakLiteracy = `${w.name}（班均 ${w.value}）`;
    } catch {
      /* 无四维画像 */
    }

    // 待办按模块分组（每张工作台卡展示自己的待办）
    const todos: Record<string, any[]> = {
      analysis: [],
      design: [],
      homework: [],
      research: [],
      source: [],
    };
    if (weakClusters > 0)
      todos.analysis.push({
        id: "t-weak",
        level: "mid",
        text: `${weakClusters} 个待巩固知识点分布在 ${classes.length} 个班`,
        to: "/learning-analysis?tab=profile",
      });
    if (weakLiteracy)
      todos.analysis.push({
        id: "t-literacy",
        level: "mid",
        text: `八年级(3)班素养「${weakLiteracy}」偏低`,
        to: "/learning-analysis?tab=profile&class_id=cls-g8-03",
      });
    if (reflections > 0)
      todos.design.push({
        id: "t-reflect",
        level: "low",
        text: `${reflections} 篇教学反思可反哺教案`,
        to: "/design/reflection",
      });
    if (pendingReview > 0)
      todos.homework.push({
        id: "t-review",
        level: "high",
        text: `待复核 ${pendingReview} 人次`,
        to: "/homework?sub=grade",
      });
    if (lateSubmits > 0)
      todos.homework.push({
        id: "t-late",
        level: "mid",
        text: `${lateSubmits} 人未按时提交，可核对名单`,
        to: "/homework?sub=flow",
      });
    if (researchUpdated > 0)
      todos.research.push({
        id: "t-research",
        level: "low",
        text: `${researchUpdated} 个议题讨论中，待查看`,
        to: "/school-research",
      });
    let bankRecheck = 0;
    try {
      bankRecheck = read("personal-bank.json")?.stats?.recheck || 0;
    } catch {
      /* 无个人题库数据 */
    }
    if (bankRecheck > 0)
      todos.source.push({
        id: "t-bank",
        level: "low",
        text: `个人题库 ${bankRecheck} 题复检中，暂不可布置`,
        to: "/source?tab=personal",
      });

    res.json({
      code: 200,
      msg: "ok",
      data: {
        analysis: {
          classes: classes.length,
          students,
          evidence_events: evidenceEvents,
          weak_clusters: weakClusters,
        },
        design: {
          plans: plans.length,
          study_plan_issues: planIssues,
          reflections,
        },
        homework: {
          active: active.length,
          pending_review: pendingReview,
          late_submits: lateSubmits,
        },
        research: { topics: researchTopics, discussing: researchUpdated },
        source: (() => {
          try {
            const b = read("personal-bank.json")?.stats;
            const questions = read("questions.json")?.items?.length || 0;
            return {
              public_questions: questions,
              bank_total: b?.total || 0,
              bank_recheck: b?.recheck || 0,
              plans: plans.length,
              courseware: plans.filter(
                (p: any) => (p.sections?.课件大纲 || []).length > 0,
              ).length,
            };
          } catch {
            return {
              public_questions: 0,
              bank_total: 0,
              bank_recheck: 0,
              plans: 0,
              courseware: 0,
            };
          }
        })(),
        todos,
      },
    });
  },

  "GET /api/teacher/teaching/resources": (req: any, res: any) => {
    const classId = req.query.class_id || "cls-g8-03";
    const resources: any[] = [];
    let className = classId;
    try {
      const prof = read(`class-profile-${classId}.json`);
      className = prof.class_name || classId;
      const weak = (prof.weak_ranking || [])
        .filter((r: any) => (r.weak_n || 0) > 0)
        .slice(0, 3);
      // 学情联动练习：每个薄弱知识点配题库样题（真实题干）
      const questions = read("questions.json").items;
      for (const w of weak) {
        const q = questions.find((x: any) => x.cluster === w.cluster);
        if (!q) continue;
        resources.push({
          id: `res-ex-${w.cluster}`,
          type: "exercise",
          title: `「${w.cluster}」巩固练习（${q.form}）`,
          cluster: w.cluster,
          desc: q.stem.slice(0, 60) + "…",
          meta: `约 8 分钟 · 难度${q.difficulty_zh || "适中"}`,
          basis: `${className}该知识点待巩固 ${w.weak_pct}%（${w.weak_n} 人）`,
          source: "公共题库",
        });
      }
      // 学情联动课件页建议
      for (const w of weak.slice(0, 2)) {
        resources.push({
          id: `res-cw-${w.cluster}`,
          type: "courseware",
          title: `「${w.cluster}」错例辨析页（一正一反）`,
          cluster: w.cluster,
          desc: `呈现本班典型错误（${w.misconception?.label || "高频错型"}）与正确解法对照，配课堂追问两问`,
          meta: "1 页课件草稿",
          basis: `典型错例占比 ${w.misconception?.share || 30}%`,
          source: "AI 生成",
        });
      }
    } catch {
      /* 无班级画像时跳过学情联动资源 */
    }
    // 通用资源（课标/教研沉淀）
    resources.push(
      {
        id: "res-rb-1",
        type: "rubric",
        title: "课堂表现量规（参与/表达/合作三档）",
        cluster: null,
        desc: "合格：能跟答；良好：能说理；优秀：能质疑补充。可直接用于教—学—评一致性检查",
        meta: "量规模板",
        basis: "校本教研共识",
        source: "教研沉淀",
      },
      {
        id: "res-mt-1",
        type: "material",
        title: "数学阅读材料：函数思想在生产中的两个实例",
        cluster: null,
        desc: "供水计费与行程配速两个真实情境短文，供导入或作业拓展",
        meta: "约 500 字",
        basis: "课标跨学科实践要求",
        source: "资源平台",
      },
      {
        id: "res-mt-2",
        type: "material",
        title: "分层学案任务卡模板（基础/提高/挑战）",
        cluster: null,
        desc: "与学案下发三档对齐的任务卡骨架，标注每档预计用时",
        meta: "模板",
        basis: "学案分层口径（D6）",
        source: "教研沉淀",
      },
    );
    res.json({
      code: 200,
      msg: "ok",
      data: {
        class_id: classId,
        class_name: className,
        resources,
        note: "练习与课件页按班级薄弱知识点联动生成；量规/材料为通用沉淀。勾选后经「注入」带入教学设计",
      },
    });
  },

  "GET /api/teacher/teaching/chapters": (_req: any, res: any) => {
    const plans = getTeachingPlans();
    const chapters = plans.map((p: any) => ({
      chapter: p.chapter,
      grade: p.grade,
      plan_id: p.plan_id,
      n_issues: p.issues?.length || 0,
      homework_ids: p.homework_ids || [],
    }));
    res.json({ code: 200, msg: "ok", data: chapters });
  },

  "POST /api/teacher/teaching/plans/:planId/issue": (req: any, res: any) => {
    const plans = getTeachingPlans();
    const plan = plans.find((p: any) => p.plan_id === req.params.planId);
    if (!plan) return res.json({ code: 404, msg: "教案不存在", data: null });
    const rec = {
      version: `V${(plan.issues?.length || 0) + 1}`,
      targets: "全班学生",
      channel: "消息中心（定时推送）",
      issued_at: new Date().toISOString().replace("T", " ").slice(0, 19),
      excerpt:
        plan.sections?.["四、单元学习目标与重点难点"]?.知识结构目标?.[0] ||
        "学习目标",
    };
    const dispatch = registerStudyPlanIssue({
      plan_id: plan.plan_id,
      chapter: plan.chapter,
    });
    res.json({
      code: 200,
      msg: "ok",
      data: {
        ...rec,
        dispatch_id: dispatch.dispatch_id,
        n_students: dispatch.roster.length,
      },
    });
  },

  // ===== F6: 资源平台 =====
  "GET /api/teacher/resource/plans": (_req: any, res: any) => {
    const plans = getTeachingPlans().map((p: any) => {
      const issues = [...(p.issues || []), ...(issuedRecords[p.plan_id] || [])];
      return {
        plan_id: p.plan_id,
        chapter: p.chapter,
        version: p.version,
        created_at: p.created_at,
        n_issues: issues.length,
        homework_ids: p.homework_ids || [],
        courseware: p.sections?.课件大纲 || [],
      };
    });
    res.json({ code: 200, msg: "ok", data: plans });
  },

  // 教案详情：结构化全文 + 学案 + 下发记录（资源平台点开查看）
  "GET /api/teacher/resource/plans/:id": (req: any, res: any) => {
    const plan = getTeachingPlans().find(
      (p: any) => p.plan_id === req.params.id,
    );
    if (!plan) return res.json({ code: 404, msg: "教案不存在", data: null });
    const issues = [
      ...(plan.issues || []),
      ...(issuedRecords[plan.plan_id] || []),
    ];
    res.json({
      code: 200,
      msg: "ok",
      data: {
        plan_id: plan.plan_id,
        chapter: plan.chapter,
        version: plan.version,
        sections: plan.sections,
        homework_ids: plan.homework_ids || [],
        issues,
        study_plan_md: STUDY_PLAN_MD,
      },
    });
  },

  "GET /api/teacher/resource/personal-bank": (_req: any, res: any) => {
    try {
      const d = read("personal-bank.json");
      res.json({ code: 200, msg: "ok", data: d });
    } catch {
      res.json({
        code: 200,
        msg: "ok",
        data: { stats: { total: 0, mounted: 0, recheck: 0 }, items: [] },
      });
    }
  },

  "POST /api/teacher/resource/personal-bank/upload": (req: any, res: any) => {
    const stem = req.body?.stem || `测试题 ${Date.now()}`;
    const conf = 0.35 + Math.random() * 0.6;
    res.json({
      code: 200,
      msg: "ok",
      data: {
        qid: `pers-${Date.now().toString(36)}`,
        stem,
        cluster: "待归类",
        conf: conf.toFixed(2),
        status: conf >= 0.5 ? "mounted" : "recheck",
        status_zh:
          conf >= 0.5 ? "已挂载（入推荐池）" : "复检中（隔离，不可布置）",
      },
    });
  },
};
