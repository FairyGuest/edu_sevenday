/**
 * 教师端 · 个性化推荐作业 mock（开发辅助，非系统功能）。
 * 接口前缀 /api/teacher/recommend/*
 * 消费 F1 的画像 fixture（class-students-*.json / questions.json），实现四方针策略引擎。
 */
import * as fs from "fs";
import * as path from "path";

const D = path.join(__dirname, "data");
const read = (f: string): any => JSON.parse(fs.readFileSync(path.join(D, f), "utf-8"));

const DIFF_ZH = { easy: "容易", easy_moderate: "较易", medium: "适中", moderate_hard: "较难", hard: "困难" };
const STRATEGY_ZH: Record<string, string> = {
  weak: "薄弱知识点练", variant: "错题变式", review: "遗忘曲线复习",
  challenge: "选做挑战题", balanced: "均衡（默认）", plan: "教案作业",
};

// 会话级存储
const homeworkStore: Record<string, any> = {};

/** 教案/章节布置的作业入库（全班同卷，供作业下发查看） */
export function recordPlanHomework(rec: any) {
  // 按章节匹配簇选题，生成全班统一的试卷（教案作业固定取教案习题 4 题）
  const questions = getQuestions();
  const key = (rec.chapter || "").replace(/^[G\d下上]+\s*第?\d*章?\s*/, "").trim() || rec.chapter || "";
  const pool = questions.filter((q: any) => key && (rec.chapter || "").includes(q.cluster));
  const items = (pool.length >= (rec.n_questions || 4) ? pool : questions)
    .slice(0, rec.n_questions || 4)
    .map((q: any, i: number) => ({
      qid: q.qid, stem: q.stem.slice(0, 120), cluster: q.cluster,
      difficulty: q.difficulty_zh || "适中", form: q.form || "选择",
      strategy: "plan", reason: rec.injected_from || "教案选题",
    }));
  homeworkStore[rec.homework_id] = {
    homework_id: rec.homework_id,
    class_id: rec.class_id || "cls-g8-03",
    mode: rec.mode || "plan",
    title: rec.title,
    status: "published",
    created_at: rec.published_at,
    published_at: rec.published_at,
    summary: { n_students: rec.n_students || 45, q_count: { min: items.length, max: items.length } },
    unified_items: items,
    papers: {},
  };
}
let hwSeq = 100;

function getQuestions(): any[] {
  return read("questions.json").items;
}

function getClasses(): any[] {
  return read("classes.json").classes;
}

function getStudents(classId: string): any[] {
  return read(`class-students-${classId}.json`);
}

/** 从画像数据挑选题目（简化版策略引擎，消费 F1 的 cells 数据） */
function pickForStrategy(
  cells: any[], strategy: string, qty: number, questions: any[],
  usedQids: Set<string>, allClusters: string[],
): { items: any[]; notes: string[] } {
  const items: any[] = [];
  const notes: string[] = [];

  if (strategy === "weak") {
    const weak = cells.filter((c) => c.n >= 3 && c.p < 60).sort((a, b) => a.p - b.p).slice(0, 3);
    if (!weak.length) {
      if (qty > 0) notes.push("无薄弱知识点（全掌握或证据不足）→ 份额转由进阶/复习承接");
      return { items, notes };
    }
    let got = 0;
    for (const t of weak) {
      if (got >= qty) break;
      const pool = questions.filter((q) => q.cluster === t.cluster && !usedQids.has(q.qid));
      const sorted = pool.sort((a, b) => a.diff_rank - b.diff_rank);
      const take = Math.min(sorted.length, Math.min(2, qty - got));
      for (let i = 0; i < take; i++) {
        usedQids.add(sorted[i].qid);
        items.push({
          qid: sorted[i].qid, stem: sorted[i].stem.slice(0, 100), cluster: t.cluster,
          difficulty: sorted[i].difficulty_zh || DIFF_ZH[sorted[i].difficulty] || "适中",
          form: sorted[i].form || "选择", strategy: "weak",
          reason: `「${t.cluster}」掌握度 ${t.p}%（待巩固），按难度递进补弱`,
          source_label: "诊断报告",
        });
        got++;
      }
    }
    if (got < qty) notes.push(`薄弱方针实际配 ${got}/${qty} 题（候选受限）`);
  }

  if (strategy === "variant") {
    // 错题变式：从近期答错/低掌握簇选同簇不同题（与薄弱方针互补，避开已用题）
    const wrong = cells.filter((c) => c.n >= 3 && c.p < 75).sort((a, b) => a.p - b.p).slice(0, 3);
    let got = 0;
    for (const t of wrong) {
      if (got >= qty) break;
      const pool = questions.filter((q) => q.cluster === t.cluster && !usedQids.has(q.qid));
      if (pool.length) {
        usedQids.add(pool[0].qid);
        items.push({
          qid: pool[0].qid, stem: pool[0].stem.slice(0, 100), cluster: t.cluster,
          difficulty: pool[0].difficulty_zh || "适中", form: pool[0].form || "选择", strategy: "variant",
          reason: `「${t.cluster}」近期错题同源变式（掌握度 ${t.p}%），换题巩固`,
          source_label: "错题变式",
        });
        got++;
      }
    }
    if (got < qty && qty > 0) notes.push(`错题变式实际配 ${got}/${qty} 题（可变式簇受限）`);
  }

  if (strategy === "review") {
    const due = cells.filter((c) => c.due).sort((a, b) => a.p_eff - b.p_eff).slice(0, 2);
    let got = 0;
    for (const t of due) {
      if (got >= qty) break;
      const pool = questions.filter((q) => q.cluster === t.cluster && !usedQids.has(q.qid));
      if (pool.length) {
        usedQids.add(pool[0].qid);
        items.push({
          qid: pool[0].qid, stem: pool[0].stem.slice(0, 100), cluster: t.cluster,
          difficulty: pool[0].difficulty_zh || "适中", form: pool[0].form || "选择", strategy: "review",
          reason: `遗忘复习：「${t.cluster}」距上次练习较久，预计掌握度衰减至 ${t.p_eff}%`,
          source_label: "遗忘曲线",
        });
        got++;
      }
    }
    if (got < qty && qty > 0) notes.push("遗忘复习配题不足（无到期知识点）→ 缺额转薄弱");
  }

  if (strategy === "challenge") {
    const strong = cells.filter((c) => c.n >= 5 && c.p >= 85).sort((a, b) => b.p - a.p)[0];
    if (strong) {
      const pool = questions.filter((q) => q.cluster === strong.cluster && !usedQids.has(q.qid) && q.diff_rank >= 2);
      if (pool.length) {
        usedQids.add(pool[0].qid);
        items.push({
          qid: pool[0].qid, stem: pool[0].stem.slice(0, 100), cluster: strong.cluster,
          difficulty: pool[0].difficulty_zh || "较难", form: pool[0].form || "解答", strategy: "challenge",
          reason: `「${strong.cluster}」已掌握（${strong.p}%），挑战进阶（选做）`,
          source_label: "掌握徽章", optional: true,
        });
      }
    } else if (qty > 0) {
      notes.push("无完全掌握知识点 → 选做挑战缺额转薄弱/复习");
    }
  }

  if (strategy === "balanced") {
    // 冷启动兜底：从全班高频考点选
    const pools = allClusters.slice(0, 6);
    let got = 0;
    for (const cl of pools) {
      if (got >= qty) break;
      const pool = questions.filter((q) => q.cluster === cl && !usedQids.has(q.qid));
      if (pool.length) {
        usedQids.add(pool[0].qid);
        items.push({
          qid: pool[0].qid, stem: pool[0].stem.slice(0, 100), cluster: cl,
          difficulty: pool[0].difficulty_zh || "适中", form: pool[0].form || "选择", strategy: "balanced",
          reason: `学情数据不足，按班级高频考点均衡布置（默认策略）`,
          source_label: "默认策略",
        });
        got++;
      }
    }
    notes.push("学情冷启动 → 默认均衡卷（兜底）");
  }

  return { items, notes };
}

/** 为全班每个学生生成专属卷 */
function generateHomework(classId: string, config: any) {
  const students = getStudents(classId);
  const questions = getQuestions();
  const clusters = [...new Set(questions.map((q) => q.cluster))];
  const ranges = config.ranges || { weak: [2, 3], variant: [1, 2], review: [1, 2], challenge: [1, 1] };
  const total = Math.max(5, Math.min(8, config.total || 6));

  const papers: Record<string, any> = {};
  const allNotes = new Set<string>();
  const strategyCnt: Record<string, number> = {};
  const clusterCnt: Record<string, number> = {};

  for (const stu of students) {
    const usedQids = new Set<string>();
    const items: any[] = [];
    const isCold = stu.n_events < 10;

    if (isCold) {
      // 冷启动 → 全均衡
      const { items: bItems, notes } = pickForStrategy(stu.cells, "balanced", total, questions, usedQids, clusters);
      items.push(...bItems);
      notes.forEach((n) => allNotes.add(n));
    } else {
      // 必做题配额：按方针权重把 total 分配到启用的方针（最大余数法，各自至少 1 题）
      const WEIGHTS: Record<string, number> = { weak: 2.5, variant: 1.5, review: 1.5 };
      const requiredStrats = Object.keys(WEIGHTS).filter((k) => ranges[k]);
      const sumW = requiredStrats.reduce((a, k) => a + WEIGHTS[k], 0) || 1;
      const quotas: Record<string, number> = {};
      const frac: [string, number][] = [];
      let assigned = 0;
      for (const k of requiredStrats) {
        const exact = (WEIGHTS[k] / sumW) * total;
        quotas[k] = Math.floor(exact);
        frac.push([k, exact - Math.floor(exact)]);
        assigned += quotas[k];
      }
      // 余数分给小数部分最大的方针；并保证启用方针至少 1 题
      frac.sort((a, b) => b[1] - a[1]);
      let rest = total - assigned;
      let fi = 0;
      while (rest > 0 && frac.length) { quotas[frac[fi % frac.length][0]]++; rest--; fi++; }
      for (const k of requiredStrats) {
        if (quotas[k] === 0 && total >= requiredStrats.length) { quotas[k] = 1; rest = 0; }
      }
      // 因人微调：薄弱簇多（≥3个）的学生从复习挪 1 题给薄弱；无薄弱的挪给变式/复习
      const weakCells = stu.cells.filter((c) => c.n >= 3 && c.p < 60);
      if (quotas.review > 1) {
        if (weakCells.length >= 3 && quotas.weak != null) { quotas.weak++; quotas.review--; }
        else if (weakCells.length === 0 && quotas.variant != null) { quotas.variant++; quotas.review--; }
      }
      // 依次执行必做方针
      for (const k of requiredStrats) {
        if (quotas[k] <= 0) continue;
        const { items: sItems, notes } = pickForStrategy(stu.cells, k, quotas[k], questions, usedQids, clusters);
        items.push(...sItems);
        notes.forEach((n) => allNotes.add(n));
      }
      // 挑战为选做（+1，不计入 total）
      if (ranges.challenge) {
        const { items: cItems, notes } = pickForStrategy(stu.cells, "challenge", 1, questions, usedQids, clusters);
        items.push(...cItems);
        notes.forEach((n) => allNotes.add(n));
      }
      // 缺额回填（补足到 total）
      let guard = 0;
      while (items.filter((i) => !i.optional).length < total && guard < 20) {
        guard++;
        const cl = clusters[guard % clusters.length];
        const pool = questions.filter((q) => q.cluster === cl && !usedQids.has(q.qid));
        if (pool.length) {
          usedQids.add(pool[0].qid);
          items.push({
            qid: pool[0].qid, stem: pool[0].stem.slice(0, 100), cluster: cl,
            difficulty: pool[0].difficulty_zh || "适中", form: pool[0].form || "选择", strategy: "balanced",
            reason: `回填题：「${cl}」班级高频考点`, source_label: "默认策略",
          });
        }
      }
    }

    // 统计
    for (const item of items) {
      strategyCnt[item.strategy] = (strategyCnt[item.strategy] || 0) + 1;
      clusterCnt[item.cluster] = (clusterCnt[item.cluster] || 0) + 1;
    }
    papers[stu.student_id] = { student_id: stu.student_id, name: stu.name, items };
  }

  const counts = Object.values(papers).map((p: any) => p.items.length);
  const fallbackCount = Object.values(papers).filter(
    (p: any) => p.items.some((i: any) => i.strategy === "balanced"),
  ).length;

  hwSeq++;
  const hwId = `hw-r-${String(hwSeq).padStart(3, "0")}`;
  const hw = {
    homework_id: hwId,
    class_id: classId,
    mode: "personalized",
    title: `个性化作业 · ${getClasses().find((c) => c.class_id === classId)?.class_name || classId}`,
    status: "generated",
    config: { ranges, total },
    created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
    roster_snapshot: students.map((s) => s.student_id),
    summary: {
      n_students: students.length,
      q_count: { min: Math.min(...counts), max: Math.max(...counts) },
      fallback_students: fallbackCount,
      strategy_mix: Object.fromEntries(
        Object.entries(strategyCnt).map(([k, v]) => [STRATEGY_ZH[k] || k, v]),
      ),
      top_clusters: Object.entries(clusterCnt).sort((a, b) => b[1] - a[1]).slice(0, 8),
      notes_sample: [...allNotes].slice(0, 6),
    },
    papers,
  };
  homeworkStore[hwId] = hw;
  return hw;
}

/** 模拟作答并生成按知识点聚合报告 */
function simulateReport(hw: any) {
  const students = getStudents(hw.class_id);
  const kpAgg: Record<string, { n: 0 | number; k: number; n_students: Set<string>; opt_n: number; opt_k: number }> = {};
  const stratAgg: Record<string, { n: number; k: number }> = {};
  const perStudent: Record<string, any> = {};

  for (const [sid, paper] of Object.entries(hw.papers)) {
    const stu = students.find((s) => s.student_id === sid);
    const cells = stu?.cells || [];
    let reqK = 0, reqN = 0, optK = 0, optN = 0;

    for (const item of (paper as any).items) {
      const cell = cells.find((c) => c.cluster === item.cluster);
      const p = cell && cell.n >= 3 ? cell.p / 100 : 0.55;
      // 确定性模拟：根据掌握度概率
      const correct = Math.sin(sid.charCodeAt(0) + item.qid.length) > (1 - p * 0.9) * 2 - 1;

      if (!kpAgg[item.cluster]) {
        kpAgg[item.cluster] = { n: 0, k: 0, n_students: new Set(), opt_n: 0, opt_k: 0 };
      }
      kpAgg[item.cluster].n_students.add(sid);

      if (item.optional) {
        optN++; optK += correct ? 1 : 0;
        kpAgg[item.cluster].opt_n++; kpAgg[item.cluster].opt_k += correct ? 1 : 0;
      } else {
        reqN++; reqK += correct ? 1 : 0;
        kpAgg[item.cluster].n++; kpAgg[item.cluster].k += correct ? 1 : 0;
      }

      if (!stratAgg[item.strategy]) stratAgg[item.strategy] = { n: 0, k: 0 };
      stratAgg[item.strategy].n++;
      stratAgg[item.strategy].k += correct ? 1 : 0;
    }
    perStudent[sid] = {
      name: (paper as any).name,
      required: { n: reqN, k: reqK, acc: reqN ? Math.round((reqK / reqN) * 100) : null },
      optional: { n: optN, k: optK, acc: optN ? Math.round((optK / optN) * 100) : null },
    };
  }

  const totalReqN = Object.values(perStudent).reduce((a, s) => a + s.required.n, 0);
  const totalReqK = Object.values(perStudent).reduce((a, s) => a + s.required.k, 0);
  const totalOptN = Object.values(perStudent).reduce((a, s) => a + s.optional.n, 0);
  const totalOptK = Object.values(perStudent).reduce((a, s) => a + s.optional.k, 0);

  hw.status = "reported";
  hw.report = {
    homework_id: hw.homework_id,
    sim_date: "2026-09-01",
    overall: {
      completion: 100,
      required_acc: totalReqN ? Math.round((totalReqK / totalReqN) * 100) : 0,
      optional_acc: totalOptN ? Math.round((totalOptK / totalOptN) * 100) : 0,
    },
    by_cluster: Object.entries(kpAgg)
      .map(([cluster, s]) => ({
        cluster, n_students: s.n_students.size, n_items: s.n,
        accuracy: s.n ? Math.round((s.k / s.n) * 100) : null,
        optional: { n: s.opt_n, accuracy: s.opt_n ? Math.round((s.opt_k / s.opt_n) * 100) : null },
      }))
      .sort((a, b) => b.n_items - a.n_items),
    by_strategy: Object.fromEntries(
      Object.entries(stratAgg).map(([k, v]) => [
        STRATEGY_ZH[k] || k,
        { n: v.n, accuracy: v.n ? Math.round((v.k / v.n) * 100) : 0 },
      ]),
    ),
    per_student: perStudent,
    ingest_receipt: { accepted: totalReqN + totalOptN },
    note: "选做题不计入正确率分母；作答为确定性模拟，事件已回流画像",
  };
  return hw.report;
}

export default {
  // 生成个性化作业
  "POST /api/teacher/recommend/generate": (req: any, res: any) => {
    const { class_id, ranges, total } = req.body || {};
    const cid = class_id || getClasses()[0].class_id;
    setTimeout(() => {
      const hw = generateHomework(cid, { ranges, total });
      res.json({ code: 200, msg: "ok", data: hw });
    }, 800); // 模拟逐生组卷延迟
  },

  // 作业列表
  "GET /api/teacher/recommend/homework": (req: any, res: any) => {
    const classId = req.query.class_id;
    // 合并 fixture 中的既有作业 + 会话生成的
    const fixtureList: any[] = [];
    for (const c of getClasses()) {
      if (classId && c.class_id !== classId) continue;
      try {
        const hw = read(`homework-${c.class_id}.json`);
        if (!homeworkStore[hw.homework_id]) homeworkStore[hw.homework_id] = hw;
      } catch { /* 可能没有 */ }
    }
    const list = Object.values(homeworkStore)
      .filter((h: any) => !classId || h.class_id === classId)
      .sort((a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || ""))
      .map((h: any) => ({
        homework_id: h.homework_id, mode: h.mode, title: h.title,
        status: h.status, n_students: h.summary?.n_students || 0,
        created_at: h.created_at, q_count: h.summary?.q_count?.min || 0,
      }));
    res.json({ code: 200, msg: "ok", data: list });
  },

  // 作业详情（摘要）
  "GET /api/teacher/recommend/homework/:id": (req: any, res: any) => {
    const hw = homeworkStore[req.params.id];
    if (!hw) return res.json({ code: 404, msg: "作业不存在", data: null });
    const { papers, ...summary } = hw;
    // roster 为学生ID列表（发布篡改校验用）；students 供抽样预览按人选择
    res.json({ code: 200, msg: "ok", data: {
      ...summary,
      unified_items: hw.unified_items || null,
      roster: Object.keys(papers),
      students: Object.entries(papers).map(([sid, p]: [string, any]) => ({
        sid, name: p.name, n: p.items?.length || 0,
      })),
    } });
  },

  // 抽样预览（扁平化 URL，id/sid 走 query）
  "GET /api/teacher/recommend/paper-preview": (req: any, res: any) => {
    const hw = homeworkStore[req.query.id];
    if (!hw) return res.json({ code: 404, msg: "作业不存在", data: null });
    const paper = hw.papers[req.query.sid];
    if (!paper) return res.json({ code: 404, msg: "该学生不在名单快照中", data: null });
    res.json({ code: 200, msg: "ok", data: { ...paper, status: hw.status, notes: [] } });
  },

  // 教案/章节布置的作业（入库到作业记录，作业下发可查看）
  "POST /api/teacher/teaching/assign-homework": (req: any, res: any) => {
    const { chapter, class_id, from } = req.body || {};
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    if (from === "plan") {
      const rec = {
        homework_id: "hw-plan-" + Date.now().toString(36),
        chapter: chapter || "", class_id: class_id || "cls-g8-03",
        n_questions: 4, injected_from: "教案「四、习题」选题", published_at: now,
        mode: "plan", title: `教案作业 · ${chapter || "教案习题"}`,
      };
      recordPlanHomework(rec);
      return res.json({ code: 200, msg: "ok", data: rec });
    }
    const { getInjectFile } = require("./enhance");
    const inject = getInjectFile(chapter || "", class_id || "cls-g8-03");
    const n = Math.max(3, (inject.rows || []).length + 2);
    const rec2 = {
      homework_id: "hw-ch-" + Date.now().toString(36),
      chapter: chapter || "", class_id: class_id || "cls-g8-03",
      n_questions: n, injected_from: "章节薄弱知识点选题", published_at: now,
      mode: "chapter", title: `章节作业 · ${chapter || "薄弱知识点"}`,
    };
    recordPlanHomework(rec2);
    res.json({ code: 200, msg: "ok", data: rec2 });
  },

  // 发布（对象锁定，扁平化 URL）
  "POST /api/teacher/recommend/publish": (req: any, res: any) => {
    const hw = homeworkStore[req.body?.id];
    if (!hw) return res.json({ code: 404, msg: "作业不存在", data: null });
    const { student_ids } = req.body || {};
    if (student_ids !== undefined) {
      const sorted1 = [...student_ids].sort();
      const sorted2 = [...hw.roster_snapshot].sort();
      if (JSON.stringify(sorted1) !== JSON.stringify(sorted2)) {
        return res.json({
          code: 200, msg: "ok",
          data: { ok: false, code: "ROSTER_LOCKED",
            msg: "作业为针对该班级的个性化作业，不支持修改发布对象" },
        });
      }
    }
    hw.status = "published";
    hw.published_at = new Date().toISOString().replace("T", " ").slice(0, 19);
    res.json({ code: 200, msg: "ok", data: { ok: true, msg: "发布成功", published_at: hw.published_at } });
  },

  // 模拟作答 → KP 聚合报告（扁平化 URL）
  "POST /api/teacher/recommend/simulate": (req: any, res: any) => {
    const hw = homeworkStore[req.body?.id];
    if (!hw) return res.json({ code: 404, msg: "作业不存在", data: null });
    if (hw.report) {
      return res.json({ code: 200, msg: "ok", data: { ...hw.report, note: hw.report.note + "（重复调用：沿用首次报告）" } });
    }
    setTimeout(() => {
      const report = simulateReport(hw);
      res.json({ code: 200, msg: "ok", data: report });
    }, 600);
  },

  // 获取报告（扁平化 URL）
  "GET /api/teacher/recommend/report": (req: any, res: any) => {
    const hw = homeworkStore[req.query.id];
    if (!hw) return res.json({ code: 404, msg: "作业不存在", data: null });
    if (!hw.report) return res.json({ code: 409, msg: "尚未模拟作答", data: null });
    res.json({ code: 200, msg: "ok", data: hw.report });
  },

  // 闭环验证（扁平化 URL）
  "POST /api/teacher/recommend/close-loop": (req: any, res: any) => {
    const hw = homeworkStore[req.body?.id];
    if (!hw || !hw.report) {
      return res.json({ code: 200, msg: "ok", data: { ok: false, msg: "请先模拟作答" } });
    }
    const samples = Object.entries(hw.papers).slice(0, 3).map(([sid, p]: [string, any]) => ({
      name: p.name, old_n: p.items.length, new_n: p.items.length,
      overlap: Math.floor(p.items.length * 0.3), changed_pct: 70,
    }));
    res.json({ code: 200, msg: "ok", data: { ok: true, homework_id: hw.homework_id, samples } });
  },
};
