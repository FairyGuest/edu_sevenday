/**
 * 教师端 · 下发与回收工作流 mock（作业 + 学案统一状态机）。
 * 接口前缀 /api/teacher/homework-flow/* 与 /api/teacher/reflection/*
 *
 * 状态口径对齐 PRD《基教930》作业提交状态：
 *   未布置 / 待提交 / 按时提交 / 未按时提交 / 按时重新提交 / 未按时重新提交
 * 批改口径：AI 初批（自动）→ 教师复核（改判留痕）→ 结构化反馈 → 教学反思建议。
 * 所有演示数值均为确定性推导（字符串哈希 + 画像掌握度），不使用随机数。
 */
import { readTeacherFixture as read } from "./fixtures";
import { listAssistantHomework, getAssistantHomework } from "./recommend";
import { scopedStudent, normalizeScope } from "./assistantScope";

const classes = () => read("classes.json").classes as any[];
const rosterOf = (classId: string) => {
  try {
    const r = read(`class-students-${classId}.json`);
    return Array.isArray(r) ? (r as any[]) : []; // demo 注册表缺 key 返回 undefined（g7/g9 无学生 fixture）
  } catch {
    return [];
  }
};
const className = (id: string) =>
  classes().find((c: any) => c.class_id === id)?.class_name || id;

/** 确定性哈希：同一字符串永远得到同一 0~99 的值 */
const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 100;
};

const ERROR_CAUSES = [
  "概念不清",
  "运算失误",
  "审题偏差",
  "方法选择不当",
  "表达不规范",
];

// ===== 状态存储（会话级）=====
type Submission = {
  student_id: string;
  name: string;
  display_id: string;
  status:
    "待提交" | "按时提交" | "未按时提交" | "按时重新提交" | "未按时重新提交";
  submitted_at?: string;
  ai_graded: boolean;
  teacher_reviewed: boolean;
  teacher_note?: string;
  corrections?: { index: number; from: string; to: string }[];
};
type Dispatch = {
  dispatch_id: string;
  kind: "homework" | "study_plan";
  ref_id: string;
  title: string;
  class_id: string;
  mode?: string;
  published_at: string;
  deadline: string;
  finished: boolean;
  roster: string[];
  submissions: Record<string, Submission>;
  advance_step: number; // 演示：回收推进批次
};
const dispatchStore: Record<string, Dispatch> = {};
const reflectionRecords: any[] = [
  {
    id: "ref-001",
    dispatch_id: "",
    class_id: "cls-g8-03",
    title: "一次函数图像解释单元复盘",
    content:
      "三个班在「一次函数图像解释」目标上达成 61%，低于其他目标。课堂讲解时图像→语言转换支架给得晚，多数学生先算后画而不是先读图。下轮先用 5 分钟读图口述练习再进入例题。",
    tags: ["目标达成", "课堂支架"],
    created_at: "2026-09-16 21:40",
    evidence_refs: ["hw-cls-g8-03-000", "disp-sp-cls-g8-03-001"],
  },
];

const dayOffset = (base: string, days: number, hhmm = "20:30") => {
  const d = new Date(base.replace(" ", "T") + "+08:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().replace("T", " ").slice(0, 11) + hhmm + ":00";
};
const isOld = (at: string) =>
  Date.now() - new Date(at.replace(" ", "T") + "Z").getTime() > 7 * 86400000;

/** 学生掌握度（0-100）：证据不足返回 55 作为演示基线 */
function masteryOf(
  classId: string,
  studentId: string,
  cluster: string,
): number {
  try {
    const raw = rosterOf(classId).find((s: any) => s.student_id === studentId);
    const d = scopedStudent(raw, normalizeScope({}, false));
    const cell = d.cells.find((c: any) => c.cluster === cluster);
    return cell && cell.n >= 3 ? cell.p : 55;
  } catch {
    return 55;
  }
}

function seedSubmissions(d: Dispatch, publishedAt: string, deadline: string) {
  for (const s of rosterOf(d.class_id)) {
    if (!d.roster.includes(s.student_id)) continue;
    const r = hash(d.dispatch_id + s.student_id);
    let status: Submission["status"];
    if (d.finished)
      status = r < 6 ? "未按时提交" : r < 9 ? "未按时重新提交" : "按时提交";
    else if (d.kind === "study_plan")
      status = r < 72 ? "待提交" : r < 80 ? "按时提交" : "按时重新提交"; // 刚下发：多数待提交
    else if (d.advance_step === 0)
      status =
        r < 34
          ? "待提交"
          : r < 42
            ? "未按时提交"
            : r < 47
              ? "按时重新提交"
              : "按时提交";
    else status = r < 12 ? "待提交" : r < 17 ? "未按时重新提交" : "按时提交";
    const submitted = status !== "待提交";
    const late = status === "未按时提交" || status === "未按时重新提交";
    const sub: Submission = {
      student_id: s.student_id,
      name: s.name,
      display_id: s.display_id,
      status,
      ai_graded: submitted,
      teacher_reviewed: false,
      submitted_at: submitted
        ? dayOffset(publishedAt, late ? 2 : 0, late ? "09:12" : "21:05")
        : undefined,
    };
    if (submitted)
      sub.teacher_reviewed =
        hash("rv" + d.dispatch_id + s.student_id) < (d.finished ? 38 : 24);
    d.submissions[s.student_id] = sub;
  }
}

/** 从已发布作业视图（homework-list.json）+ 推荐作业库同步到下发记录 */
function syncFromHomework(classId?: string) {
  // 1) homework-list.json：演示环境的“已发布作业”视图（进行中/已结束）
  let published: any[] = [];
  try {
    published = read("homework-list.json").list || [];
  } catch {
    /* 无则跳过 */
  }
  for (const row of published) {
    const id = "disp-" + row.homework_id;
    if (dispatchStore[id]) continue;
    // 从 homework_id 中解析班级（hw-cls-g8-03-xxx / hw-plan-cls-g7-01-xxx）
    const cid = row.homework_id.match(/cls-g\d+-\d+/)?.[0] || "cls-g8-03";
    if (!rosterOf(cid).length) continue; // 该班无学生 fixture（g7/g9 演示班），跳过回收模拟
    // 题目与名单：优先取推荐库 fixture（同 id），否则按班级文件推导
    const hw = getAssistantHomework(row.homework_id) || tryReadHomework(cid);
    const roster =
      hw?.roster_snapshot ||
      Object.keys(hw?.papers || {}) ||
      rosterOf(cid).map((s: any) => s.student_id);
    const publishedAt = row.created_at || "2026-08-30 09:00";
    const d: Dispatch = {
      dispatch_id: id,
      kind: "homework",
      ref_id: row.homework_id,
      title: row.title,
      class_id: cid,
      mode: row.mode,
      published_at: publishedAt,
      deadline: dayOffset(publishedAt, 2),
      finished: row.status === "已结束",
      roster,
      submissions: {},
      advance_step: 0,
    };
    seedSubmissions(d, publishedAt, d.deadline);
    dispatchStore[id] = d;
  }
  // 2) 会话内生成并发布的推荐作业（生成→发布链路）
  for (const hw of listAssistantHomework(classId)) {
    if (hw.status !== "published" && hw.status !== "reported") continue;
    const id = "disp-" + hw.homework_id;
    if (dispatchStore[id]) continue;
    const roster = hw.roster_snapshot || Object.keys(hw.papers || {});
    const published = String(
      hw.published_at || hw.created_at || "2026-09-01 09:00",
    );
    const d: Dispatch = {
      dispatch_id: id,
      kind: "homework",
      ref_id: hw.homework_id,
      title: hw.title,
      class_id: hw.class_id,
      mode: hw.mode,
      published_at: published,
      deadline: hw.deadline || dayOffset(published, 2),
      finished: hw.status === "reported" || isOld(published),
      roster,
      submissions: {},
      advance_step: 0,
    };
    seedSubmissions(d, published, d.deadline);
    dispatchStore[id] = d;
  }
}

/** 直读班级作业 fixture（g7/g9 班不在 classes.json 作用域内时兜底） */
function tryReadHomework(classId: string): any {
  try {
    const hw = read(`homework-${classId}.json`);
    if (hw?.homework_id && !getAssistantHomework(hw.homework_id)) return hw;
  } catch {
    /* 本班无 fixture */
  }
  return null;
}

// ===== 学案下发（D4/D6：关联教案、三档分层、统一发放）=====
const STUDY_PLAN_TASKS = [
  {
    tier: "基础（必做）",
    title: "任务1 · 梳理本节核心概念，完成 4 道基础巩固题",
    eta: "约15分钟",
  },
  {
    tier: "基础（必做）",
    title: "任务2 · 复做课堂例题并写出每一步依据",
    eta: "约10分钟",
  },
  {
    tier: "提高（选做）",
    title: "任务3 · 综合应用 2 题（图像/运算结合）",
    eta: "约15分钟",
  },
  {
    tier: "挑战（选做）",
    title: "任务4 · 拓展探究 1 题（开放设问）",
    eta: "约20分钟",
  },
];

export function registerStudyPlanIssue(input: {
  plan_id?: string;
  chapter?: string;
  class_id?: string;
  title?: string;
}): Dispatch {
  const classId =
    input.class_id && classes().some((c: any) => c.class_id === input.class_id)
      ? input.class_id
      : classes()[0].class_id;
  const plans: any[] = (() => {
    try {
      return read("plans.json")?.plans || [];
    } catch {
      return [];
    }
  })();
  const plan =
    plans.find((p: any) => p.plan_id === input.plan_id) ||
    plans.find((p: any) => input.chapter && p.chapter === input.chapter);
  const seq =
    Object.values(dispatchStore).filter((d) => d.kind === "study_plan").length +
    1;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const d: Dispatch = {
    dispatch_id: `disp-sp-${classId}-${String(seq).padStart(3, "0")}`,
    kind: "study_plan",
    ref_id: input.plan_id || plan?.plan_id || "",
    title:
      input.title ||
      `学案 · ${input.chapter || plan?.chapter || "当前章节"}（基础必做 + 提高/挑战选做）`,
    class_id: classId,
    mode: "layered",
    published_at: now,
    deadline: dayOffset(now, 3),
    finished: false,
    roster: rosterOf(classId).map((s: any) => s.student_id),
    submissions: {},
    advance_step: 0,
  };
  seedSubmissions(d, now, d.deadline);
  dispatchStore[d.dispatch_id] = d;
  return d;
}

// ===== 批改明细（AI 初批 + 教师复核）=====
function dispatchItems(d: Dispatch, studentId: string): any[] {
  if (d.kind === "study_plan") return STUDY_PLAN_TASKS;
  const hw = getAssistantHomework(d.ref_id) || tryReadHomework(d.class_id);
  if (!hw) return [];
  const paper = hw.papers?.[studentId];
  if (paper?.items?.length) return paper.items;
  if (hw.unified_items?.length) return hw.unified_items;
  const first = Object.values(hw.papers || {})[0] as any;
  return first?.items || [];
}

function gradeItem(d: Dispatch, studentId: string, item: any, index: number) {
  const cluster = item.cluster || "综合";
  const form = item.form || "选择";
  const p = masteryOf(d.class_id, studentId, cluster);
  const r = hash(studentId + item.qid + index);
  const correct = r < Math.round(p * 0.9);
  let verdict: "对" | "半对" | "错" = correct ? "对" : "错";
  if (!correct && /解答|证明|填空|计算/.test(form) && r % 5 < 2)
    verdict = "半对";
  const cause = ERROR_CAUSES[r % ERROR_CAUSES.length];
  const answer = /选择|判断/.test(form)
    ? `选 ${"ABCD"[r % 4]}`
    : verdict === "对"
      ? "书写完整解题过程，关键步骤与结论均正确（演示作答）"
      : verdict === "半对"
        ? `思路正确，但${cause === "运算失误" ? "中间一步运算出错" : "结论表述不完整"}后继续作答（演示作答）`
        : `第${r % 2 === 0 ? 1 : 2}步起${cause === "概念不清" ? "概念用错" : cause === "审题偏差" ? "看错条件" : "方法选择偏移"}，后续过程围绕错误展开（演示作答）`;
  return {
    index,
    qid: item.qid,
    stem: item.stem,
    cluster,
    form,
    tier: item.tier || null,
    strategy: item.strategy,
    reason: item.reason,
    optional: !!item.optional,
    student_answer: answer,
    ai_verdict: verdict,
    cause: verdict === "对" ? null : cause,
    score: verdict === "对" ? 100 : verdict === "半对" ? 60 : 0,
  };
}

function buildSubmissionDetail(d: Dispatch, studentId: string) {
  const items = dispatchItems(d, studentId).map((it: any, i: number) =>
    gradeItem(d, studentId, it, i),
  );
  const sub = d.submissions[studentId];
  const scored = items.filter((i: any) => i.tier == null);
  const score = scored.length
    ? Math.round(
        scored.reduce((a: number, i: any) => a + i.score, 0) / scored.length,
      )
    : null;
  const wrong = items.filter((i: any) => i.ai_verdict !== "对");
  const causeMix = ERROR_CAUSES.map((c) => ({
    label: c,
    n: wrong.filter((i: any) => i.cause === c).length,
  }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const clusterAcc: Record<string, { k: number; n: number }> = {};
  for (const i of scored) {
    clusterAcc[i.cluster] ||= { k: 0, n: 0 };
    clusterAcc[i.cluster].n++;
    clusterAcc[i.cluster].k +=
      i.ai_verdict === "对" ? 1 : i.ai_verdict === "半对" ? 0.5 : 0;
  }
  const clusters = Object.entries(clusterAcc)
    .map(([cluster, v]) => ({
      cluster,
      n: v.n,
      accuracy: Math.round((v.k / v.n) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
  const next: string[] = [];
  if (clusters[0] && clusters[0].accuracy < 60)
    next.push(
      `「${clusters[0].cluster}」正确率 ${clusters[0].accuracy}%：建议先讲 1 道例题，再完成 2 道同知识点变式`,
    );
  if (wrong.some((i: any) => i.ai_verdict === "半对"))
    next.push(
      "存在「半对」：过程分失分集中在表达规范，建议复述关键步骤后再落笔",
    );
  if (causeMix[0] && causeMix[0].n >= 2)
    next.push(
      `错因集中于「${causeMix[0].label}」（${causeMix[0].n} 处）：下次练习前先做 2 分钟针对性提醒`,
    );
  if (!wrong.length) next.push("全部正确：可推送 1 道挑战题保持提升");
  return {
    dispatch_id: d.dispatch_id,
    student_id: studentId,
    name: sub?.name,
    status: sub?.status,
    submitted_at: sub?.submitted_at,
    score,
    teacher_reviewed: sub?.teacher_reviewed || false,
    teacher_note: sub?.teacher_note || "",
    corrections: sub?.corrections || [],
    items,
    feedback: {
      summary:
        sub?.status === "待提交"
          ? "尚未提交，暂无批改结果；请先催交或代交（演示）"
          : `AI 初批完成：${scored.filter((i: any) => i.ai_verdict === "对").length} 题全对、${wrong.filter((i: any) => i.ai_verdict === "半对").length} 题半对、${wrong.filter((i: any) => i.ai_verdict === "错").length} 题错误，得分 ${score}。教师复核后入档并回流画像。`,
      cause_mix: causeMix,
      clusters,
      next_steps: next,
      basis: {
        n_items: scored.length,
        graded_by: "AI 初批 + 教师复核（留痕）",
        source: d.kind === "study_plan" ? "学案回收" : "作业提交",
      },
    },
  };
}

function layerStats(d: Dispatch) {
  const submitted = Object.values(d.submissions).filter(
    (s) => s.status !== "待提交",
  );
  const basic = submitted.length;
  let adv = 0,
    chal = 0;
  for (const s of submitted) {
    if (hash("adv" + d.dispatch_id + s.student_id) < 45) adv++;
    if (hash("ch" + d.dispatch_id + s.student_id) < 20) chal++;
  }
  const n = d.roster.length || 1;
  return {
    tasks: STUDY_PLAN_TASKS,
    basic: {
      done: basic,
      total: d.roster.length,
      pct: Math.round((basic / n) * 100),
    },
    advanced: { done: adv, pct: Math.round((adv / n) * 100) },
    challenge: { done: chal, pct: Math.round((chal / n) * 100) },
  };
}

function summaryOf(d: Dispatch) {
  const subs = Object.values(d.submissions);
  const submitted = subs.filter((s) => s.status !== "待提交");
  const ontime = subs.filter(
    (s) => s.status === "按时提交" || s.status === "按时重新提交",
  );
  const late = subs.filter(
    (s) => s.status === "未按时提交" || s.status === "未按时重新提交",
  );
  const pending = subs.filter((s) => s.status === "待提交");
  const reviewed = submitted.filter((s) => s.teacher_reviewed);
  const extras = d.kind === "study_plan" ? { layers: layerStats(d) } : {};
  return {
    dispatch_id: d.dispatch_id,
    kind: d.kind,
    ref_id: d.ref_id,
    title: d.title,
    class_id: d.class_id,
    class_name: className(d.class_id),
    mode: d.mode,
    published_at: d.published_at,
    deadline: d.deadline,
    finished: d.finished,
    n_students: d.roster.length,
    progress: {
      submitted: submitted.length,
      ontime: ontime.length,
      late: late.length,
      pending: pending.length,
      submit_pct: d.roster.length
        ? Math.round((submitted.length / d.roster.length) * 100)
        : 0,
      ai_graded: submitted.length,
      teacher_reviewed: reviewed.length,
    },
    ...extras,
  };
}

/** 聚合批改证据 → 教学反思建议（规则引擎，逐条带证据摘要） */
export function computeReflectionSuggestions(classId?: string) {
  syncFromHomework(classId);
  const ds = Object.values(dispatchStore)
    .filter(
      (d) => (!classId || d.class_id === classId) && d.kind === "homework",
    )
    .sort((a, b) => b.published_at.localeCompare(a.published_at))
    .slice(0, 3);
  if (!ds.length)
    return {
      scope: classId ? className(classId) : "全部班级",
      basis: [],
      suggestions: [],
    };

  const causeCount: Record<string, number> = {};
  const clusterStat: Record<string, { k: number; n: number; hw: string }> = {};
  const evidencePool: { title: string; text: string }[] = [];
  let totalItems = 0;
  for (const d of ds) {
    for (const sid of d.roster.slice(0, 12)) {
      if (d.submissions[sid]?.status === "待提交") continue;
      const detail = buildSubmissionDetail(d, sid);
      for (const it of detail.items) {
        if (it.tier) continue;
        totalItems++;
        clusterStat[it.cluster] ||= { k: 0, n: 0, hw: d.title };
        clusterStat[it.cluster].n++;
        clusterStat[it.cluster].k +=
          it.ai_verdict === "对" ? 1 : it.ai_verdict === "半对" ? 0.5 : 0;
        if (it.ai_verdict !== "对" && it.cause)
          causeCount[it.cause] = (causeCount[it.cause] || 0) + 1;
        if (it.ai_verdict === "错" && evidencePool.length < 8) {
          evidencePool.push({
            title: `${it.cluster} · ${detail.name} · ${d.title}`,
            text: `${it.stem}\n错因判定：${it.cause}（AI 初批，待教师复核）`,
          });
        }
      }
    }
  }
  const clusters = Object.entries(clusterStat)
    .map(([cluster, v]) => ({
      cluster,
      n: v.n,
      accuracy: Math.round((v.k / v.n) * 100),
      hw: v.hw,
    }))
    .filter((c) => c.n >= 6)
    .sort((a, b) => a.accuracy - b.accuracy);
  const causes = Object.entries(causeCount)
    .map(([label, n]) => ({ label, n }))
    .sort((a, b) => b.n - a.n);
  const latest = ds[0];
  const lateStudents = Object.values(latest.submissions).filter((s) =>
    s.status.includes("未按时"),
  );
  const suggestions: any[] = [];
  if (clusters[0] && clusters[0].accuracy < 75) {
    suggestions.push({
      id: "rs-knowledge",
      type: "知识点达成",
      confidence: "credible",
      title: `「${clusters[0].cluster}」批后正确率 ${clusters[0].accuracy}%（${clusters[0].n} 题证据），为当前最低`,
      evidence: evidencePool
        .filter((e) => e.title.includes(clusters[0].cluster))
        .slice(0, 3),
      advice:
        "下轮教学建议：先做 5 分钟读题口述，再进入例题；配套 2 道同知识点变式练习巩固。",
      actions: [
        {
          key: "personalized_paper",
          label: `生成「${clusters[0].cluster}」变式练习`,
          params: {
            class_id: latest.class_id,
            cluster: clusters[0].cluster,
            strategy: "variant",
          },
        },
        {
          key: "inject_teaching_design",
          label: "带入教学设计调整教案",
          params: { class_id: latest.class_id },
        },
      ],
    });
  }
  if (causes[0]) {
    suggestions.push({
      id: "rs-cause",
      type: "共性错因",
      confidence: "credible",
      title: `全班错因集中于「${causes[0].label}」（${causes[0].n} 处，占错误 ${Math.round(
        (causes[0].n /
          Math.max(
            1,
            Object.values(causeCount).reduce((a, b) => a + b, 0),
          )) *
          100,
      )}%）`,
      evidence: evidencePool
        .filter((e) => e.text.includes(causes[0].label))
        .slice(0, 3),
      advice:
        "建议课堂增加针对性对比讲解（一正一反示例），并在下轮作业前做 2 分钟错因提醒。",
      actions: [
        {
          key: "filter_question_bank",
          label: `筛选${causes[0].label === "运算失误" ? "运算" : "综合"}类题目`,
          params: { cluster: clusters[0]?.cluster || "" },
        },
      ],
    });
  }
  if (lateStudents.length) {
    suggestions.push({
      id: "rs-submission",
      type: "提交习惯",
      confidence: "credible",
      title: `${latest.title}：${lateStudents.length} 人未按时提交（${lateStudents
        .slice(0, 4)
        .map((s) => s.name)
        .join("、")}${lateStudents.length > 4 ? " 等" : ""}）`,
      evidence: [
        {
          title: "提交记录",
          text: lateStudents
            .slice(0, 5)
            .map((s) => `${s.name} · ${s.status} · ${s.submitted_at || "—"}`)
            .join("\n"),
        },
      ],
      advice:
        "建议核对名单后一对一确认原因；连续两次未按时提交再纳入家校沟通，不直接推断学习态度。",
      actions: [
        {
          key: "open_homework_flow",
          label: "查看回收进度",
          params: { dispatch_id: latest.dispatch_id },
        },
      ],
    });
  }
  const sp = Object.values(dispatchStore)
    .filter(
      (d) => (!classId || d.class_id === classId) && d.kind === "study_plan",
    )
    .slice(-1)[0];
  if (sp) {
    const ls = layerStats(sp);
    suggestions.push({
      id: "rs-layer",
      type: "分层选做",
      confidence: "credible",
      title: `学案选做率：提高 ${ls.advanced.pct}% / 挑战 ${ls.challenge.pct}%（基础必做完成 ${ls.basic.pct}%）`,
      evidence: [
        {
          title: "学案回收统计",
          text: `${sp.title}\n基础（必做）：${ls.basic.done}/${ls.basic.total}\n提高（选做）：${ls.advanced.done} 人\n挑战（选做）：${ls.challenge.done} 人`,
        },
      ],
      advice:
        ls.advanced.pct < 40
          ? "提高档选做率偏低：建议课堂展示 1 份优秀选做作品并明确选做价值，而非强制全员。"
          : "选做参与度尚可：可在下一学案提高档中保留 1 道开放题观察参与变化。",
      actions: [
        {
          key: "open_homework_flow",
          label: "查看学案回收",
          params: { dispatch_id: sp.dispatch_id },
        },
      ],
    });
  }
  return {
    scope: classId ? className(classId) : "全部班级",
    basis: ds.map((d) => ({
      title: d.title,
      published_at: d.published_at,
      n_graded: Object.values(d.submissions).filter(
        (s) => s.status !== "待提交",
      ).length,
    })),
    n_items_sampled: totalItems,
    suggestions,
  };
}

/** 供首页工作台复用的统计（与 /homework-flow/list 同源同口径，数字一致） */
export function dispatchSummaries(classId?: string, kind?: string) {
  syncFromHomework(classId);
  let rows = Object.values(dispatchStore);
  if (classId) rows = rows.filter((d) => d.class_id === classId);
  if (kind) rows = rows.filter((d) => d.kind === kind);
  rows.sort((a, b) => b.published_at.localeCompare(a.published_at));
  return rows.map(summaryOf);
}

export function reflectionRecordList(classId?: string) {
  return reflectionRecords.filter((r) => !classId || r.class_id === classId);
}

export default {
  // 下发记录列表（作业 + 学案统一）
  "GET /api/teacher/homework-flow/list": (req: any, res: any) => {
    res.json({
      code: 200,
      msg: "ok",
      data: dispatchSummaries(
        req.query.class_id || undefined,
        req.query.kind || undefined,
      ),
    });
  },

  "GET /api/teacher/homework-flow/detail": (req: any, res: any) => {
    syncFromHomework();
    const d = dispatchStore[req.query.id];
    if (!d) return res.json({ code: 404, msg: "下发记录不存在", data: null });
    res.json({
      code: 200,
      msg: "ok",
      data: {
        ...summaryOf(d),
        submissions: Object.values(d.submissions).sort((a, b) =>
          a.display_id.localeCompare(b.display_id),
        ),
      },
    });
  },

  "GET /api/teacher/homework-flow/submission": (req: any, res: any) => {
    syncFromHomework();
    const d = dispatchStore[req.query.id];
    if (!d || !d.submissions[req.query.sid])
      return res.json({ code: 404, msg: "提交记录不存在", data: null });
    res.json({
      code: 200,
      msg: "ok",
      data: buildSubmissionDetail(d, req.query.sid),
    });
  },

  // 教师复核：改判留痕 + 备注，复核后计入已复核
  "POST /api/teacher/homework-flow/review": (req: any, res: any) => {
    syncFromHomework();
    const { id, sid, corrections = [], note = "" } = req.body || {};
    const d = dispatchStore[id];
    if (!d || !d.submissions[sid])
      return res.json({
        code: 200,
        msg: "ok",
        data: { ok: false, msg: "提交记录不存在" },
      });
    const detail = buildSubmissionDetail(d, sid);
    const trail = corrections
      .filter(
        (c: any) =>
          detail.items[c.index] &&
          detail.items[c.index].ai_verdict !== c.verdict,
      )
      .map((c: any) => ({
        index: c.index,
        from: detail.items[c.index].ai_verdict,
        to: c.verdict,
      }));
    const sub = d.submissions[sid];
    sub.corrections = [...(sub.corrections || []), ...trail];
    if (note) sub.teacher_note = note;
    sub.teacher_reviewed = true;
    res.json({
      code: 200,
      msg: "ok",
      data: {
        ok: true,
        n_changes: trail.length,
        msg: trail.length
          ? `复核完成：改判 ${trail.length} 处（${trail.map((t: any) => `第${t.index + 1}题 ${t.from}→${t.to}`).join("、")}），已留痕并入档`
          : "复核完成：维持 AI 初批结果，已留痕并入档",
      },
    });
  },

  // 演示：推进回收（未提交学生批量补交）
  "POST /api/teacher/homework-flow/advance": (req: any, res: any) => {
    syncFromHomework();
    const d = dispatchStore[req.body?.id];
    if (!d)
      return res.json({
        code: 200,
        msg: "ok",
        data: { ok: false, msg: "下发记录不存在" },
      });
    d.advance_step++;
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    let n = 0;
    for (const s of Object.values(d.submissions)) {
      if (
        s.status === "待提交" &&
        hash("adv" + d.dispatch_id + s.student_id + d.advance_step) < 55
      ) {
        s.status =
          hash("adv-l" + s.student_id) < 18 ? "未按时重新提交" : "按时重新提交";
        s.submitted_at = now;
        s.ai_graded = true;
        n++;
      }
    }
    res.json({
      code: 200,
      msg: "ok",
      data: {
        ok: true,
        newly_submitted: n,
        hint: n ? `${n} 名学生已补交（演示推进）` : "没有待提交学生了",
      },
    });
  },

  // 学案下发（注册进回收工作台；三档分层 + 预计用时）
  "POST /api/teacher/homework-flow/issue-study-plan": (req: any, res: any) => {
    const d = registerStudyPlanIssue(req.body || {});
    res.json({
      code: 200,
      msg: "ok",
      data: { ...summaryOf(d), layers: layerStats(d) },
    });
  },

  // ===== 教学反思 =====
  "GET /api/teacher/reflection/suggestions": (req: any, res: any) => {
    res.json({
      code: 200,
      msg: "ok",
      data: computeReflectionSuggestions(req.query.class_id || undefined),
    });
  },

  "GET /api/teacher/reflection/records": (req: any, res: any) => {
    const rows = reflectionRecords.filter(
      (r) => !req.query.class_id || r.class_id === req.query.class_id,
    );
    res.json({ code: 200, msg: "ok", data: rows });
  },

  "POST /api/teacher/reflection/records": (req: any, res: any) => {
    const {
      title,
      content,
      tags = [],
      dispatch_id = "",
      class_id = "cls-g8-03",
    } = req.body || {};
    if (!title || !content)
      return res.json({
        code: 200,
        msg: "ok",
        data: { ok: false, msg: "标题和内容不能为空" },
      });
    const rec = {
      id: "ref-" + String(reflectionRecords.length + 1).padStart(3, "0"),
      dispatch_id,
      class_id,
      title,
      content,
      tags,
      created_at: new Date().toISOString().replace("T", " ").slice(0, 16),
      evidence_refs: dispatch_id ? [dispatch_id] : [],
    };
    reflectionRecords.unshift(rec);
    res.json({
      code: 200,
      msg: "ok",
      data: { ok: true, record: rec, msg: "反思已记录，可沉淀为校本教研议题" },
    });
  },
};
