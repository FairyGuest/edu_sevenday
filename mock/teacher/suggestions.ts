/**
 * 教师端 · 画像建议 mock（开发辅助，非系统功能）。
 * 对应 v2.0 需求 H1/H2：班级学情 / 个人学情的可执行建议。
 * 生成方式：规则引擎（确定性，从画像 fixture 推导，必有依据），
 * P1 的 AI 归因润色在后端/助手链路上叠加，不改变本接口结构。
 * 接口：GET /api/teacher/profile/suggestions?class_id=…               → 班级建议
 *       GET /api/teacher/profile/suggestions?class_id=…&student_id=… → 个人建议
 * 建议卡结构对齐 PRD：{id, scope, type, title, detail?, evidence, actions[{key,label,params}]}
 * 动作 key 白名单（前端 ActionRegistry 消费）：
 *   filter_question_bank / personalized_paper / inject_teaching_design /
 *   assign_homework / view_student_profile
 */
import { readTeacherFixture as read, findStudent, memoizeMock } from "./fixtures";
import { computeDimensions, clusterLevel, LEVEL_META } from "./dimensions";
import { questionLiteracy } from "./questionTags";

const suggestionsCache = memoizeMock<any>();

/** 阈值口径（v2.0 PRD 风险#8：经验值，验收时与业务校准） */
const TH = {
  literacyWeak: 70,     // 素养班均低于此值 → 素养短板建议
  weakPct: 25,          // 待巩固占比 ≥ 此值 → 知识点侧重建议
  deltaDown: -10,       // 周变化 ≤ 此值 → 退步明显
  deltaUp: 10,          // 周变化 ≥ 此值 → 进步明显
  studentWeakP: 60,     // 个人掌握度低于此值 → 薄弱知识点建议
  trendStudents: 3,     // 进退步建议最多列举人数
};

/** 从学生近期答错记录做能力角度归因（确定性聚合：失分素养 + 涉及能力层级） */
function abilityAttribution(stu: any) {
  const wrong = (stu?.evidence || []).filter((e: any) => !e.correct).slice(-10);
  const litCnt: Record<string, number> = {};
  const lvCnt: Record<string, number> = {};
  for (const e of wrong) {
    const lit = questionLiteracy(e.cluster);
    litCnt[lit] = (litCnt[lit] || 0) + 1;
    const lv = clusterLevel(e.cluster);
    lvCnt[lv] = (lvCnt[lv] || 0) + 1;
  }
  const lits = Object.entries(litCnt).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const lvs = Object.entries(lvCnt).sort((a, b) => b[1] - a[1]).map(([k]) => LEVEL_META[k as "L1"].label);
  return { n_wrong: wrong.length, literacies: lits, levels: lvs };
}

/** H1 班级建议：素养短板 / 知识点侧重 / 学生进退步（能力归因）/ 遗忘复习 */
function classSuggestions(classId: string) {
  const prof = read(`class-profile-${classId}.json`);
  const studentsFile: any[] = read(`class-students-${classId}.json`);
  const detailMap = new Map(studentsFile.map((s: any) => [s.student_id, s]));
  const out: any[] = [];

  // —— 1) 素养短板（能力维度）：最低且低于阈值的素养 → 练对应素养的题目
  const classCells = (prof.cluster_rows || []).map((r: any) => ({
    cluster: r.cluster,
    p: Math.max(20, Math.min(98, Math.round(100 - (r.weak_pct || 0) * 2))),
    n: r.n_students || 3,
  }));
  const lits = computeDimensions(classCells).literacy
    .filter((l: any) => l.value != null)
    .sort((a: any, b: any) => a.value - b.value);
  if (lits.length && lits[0].value < TH.literacyWeak) {
    const low = lits[0];
    const high = lits[lits.length - 1];
    out.push({
      id: `sg-${classId}-ability`,
      scope: "class",
      type: "ability",
      title: `本班「${low.name}」素养较为薄弱（班均 ${low.value} 分）`,
      detail: `覆盖 ${low.n_clusters} 个知识点样本。是否需要提供一些可以锻炼${low.name}能力的题目？`,
      evidence: {
        metric: "素养班均",
        value: low.value,
        n_clusters: low.n_clusters,
        compare: `与班内最强素养「${high.name}」（${high.value} 分）相差 ${high.value - low.value} 分`,
        weak_subs: low.subs.filter((s: any) => s.value != null)
          .sort((a: any, b: any) => a.value - b.value).slice(0, 2)
          .map((s: any) => `${s.name} ${s.value}`),
      },
      actions: [
        { key: "filter_question_bank", label: `筛选${low.name}题目`, params: { literacy: low.name } },
        { key: "personalized_paper", label: "生成素养专项练习", params: { strategy: "weak", literacy: low.name } },
      ],
    });
  }

  // —— 2) 知识点侧重：薄弱排行 top2（人数 ≥3 且占比达标）
  (prof.weak_ranking || [])
    .filter((r: any) => r.n_students >= 3 && (r.weak_pct || 0) >= TH.weakPct)
    .slice(0, 2)
    .forEach((r: any, i: number) => {
      out.push({
        id: `sg-${classId}-knowledge-${i}`,
        scope: "class",
        type: "knowledge",
        title: `「${r.cluster}」待巩固 ${r.weak_n} 人（占比 ${r.weak_pct}%），建议本单元教学侧重提升`,
        detail: r.misconception
          ? `主要错因：${r.misconception.label}（约 ${r.misconception.share}%），例："${String(r.misconception.evidence || "").slice(0, 40)}…"`
          : undefined,
        evidence: {
          chapter: r.chapter,
          weak_pct: r.weak_pct,
          n_students: r.n_students,
          trend: r.trend,
          n_sample: r.n_sample,
          trust: r.trust,
        },
        actions: [
          { key: "inject_teaching_design", label: "注入教学设计", params: { class_id: classId, cluster: r.cluster } },
          { key: "personalized_paper", label: "按薄弱知识点组卷", params: { strategy: "weak", clusters: [r.cluster] } },
        ],
      });
    });

  // —— 3) 学生进退步（从能力角度归因）
  const withDelta = (prof.students || []).filter((s: any) => s.week_delta != null);
  const down = withDelta.filter((s: any) => s.week_delta <= TH.deltaDown)
    .sort((a: any, b: any) => a.week_delta - b.week_delta).slice(0, TH.trendStudents);
  if (down.length) {
    const details = down.map((s: any) => {
      const reason = abilityAttribution(detailMap.get(s.student_id));
      return {
        student_id: s.student_id, name: s.name, week_delta: s.week_delta,
        lost_literacies: reason.literacies.slice(0, 2),
        lost_levels: reason.levels.slice(0, 2),
      };
    });
    const litCnt: Record<string, number> = {};
    details.forEach((d: any) => d.lost_literacies.forEach((l: string) => { litCnt[l] = (litCnt[l] || 0) + 1; }));
    const topLit = Object.entries(litCnt).sort((a, b) => b[1] - a[1])[0]?.[0] || "逻辑推理";
    out.push({
      id: `sg-${classId}-trend-down`,
      scope: "class",
      type: "trend",
      title: `${down.length} 名学生近一周退步明显（${down.map((s: any) => s.name).join("、")}）`,
      detail: `从能力角度看，近期失分集中在「${topLit}」类知识点，建议推送针对性练习并关注课堂状态`,
      evidence: { window: "近一周", students: details },
      actions: [
        { key: "view_student_profile", label: `查看 ${down[0].name} 个人学情`, params: { class_id: classId, student_id: down[0].student_id } },
        { key: "personalized_paper", label: "生成错题变式练习", params: { strategy: "variant", student_ids: down.map((s: any) => s.student_id) } },
      ],
    });
  }
  const up = withDelta.filter((s: any) => s.week_delta >= TH.deltaUp)
    .sort((a: any, b: any) => b.week_delta - a.week_delta).slice(0, TH.trendStudents);
  if (up.length) {
    out.push({
      id: `sg-${classId}-trend-up`,
      scope: "class",
      type: "trend",
      title: `${up.length} 名学生进步明显（${up.map((s: any) => `${s.name} +${s.week_delta}`).join("、")}）`,
      detail: "建议在班级内表扬保持节奏，并为其追加选做挑战题，避免\"吃不饱\"",
      evidence: { window: "近一周", students: up.map((s: any) => ({ name: s.name, week_delta: s.week_delta })) },
      actions: [
        { key: "personalized_paper", label: "追加选做挑战题", params: { strategy: "challenge", student_ids: up.map((s: any) => s.student_id) } },
        { key: "view_student_profile", label: `查看 ${up[0].name} 个人学情`, params: { class_id: classId, student_id: up[0].student_id } },
      ],
    });
  }

  // —— 4) 遗忘复习（班级总量提醒）
  const dueStudents = studentsFile.filter((s: any) => (s.due_cnt || 0) > 0);
  if (dueStudents.length) {
    out.push({
      id: `sg-${classId}-review`,
      scope: "class",
      type: "review",
      title: `全班 ${dueStudents.length} 名学生有知识点进入遗忘复习期`,
      detail: `共 ${dueStudents.reduce((a: number, s: any) => a + s.due_cnt, 0)} 人次知识点距上次练习较久、预计掌握度已衰减，建议布置遗忘复习作业`,
      evidence: {
        n_students: dueStudents.length,
        sample: dueStudents.slice(0, 3).map((s: any) => `${s.name}（${s.due_cnt} 个）`),
      },
      actions: [
        { key: "personalized_paper", label: "生成遗忘复习作业", params: { strategy: "review" } },
      ],
    });
  }

  return {
    class_id: classId,
    class_name: prof.class_name,
    scope: "class",
    generated_at: prof.updated_at,
    suggestions: out,
  };
}

/** H2 个人建议：与班级同口径但聚焦个体（薄弱知识点 / 素养短板 / 到期复习 / 冷启动） */
function studentSuggestions(classId: string, studentId: string) {
  const one: any = findStudent(classId, studentId);
  if (!one) return null;
  const dims = computeDimensions(one.cells || []);
  const out: any[] = [];

  // —— 1) 薄弱知识点（样本 ≥3、掌握度 < 阈值，最薄弱 2 个）
  (one.cells || [])
    .filter((c: any) => c.n >= 3 && c.p < TH.studentWeakP)
    .sort((a: any, b: any) => a.p - b.p)
    .slice(0, 2)
    .forEach((c: any, i: number) => {
      out.push({
        id: `sg-${studentId}-knowledge-${i}`,
        scope: "student",
        type: "knowledge",
        title: `「${c.cluster}」掌握度 ${c.p}%（${c.band}，${c.n} 题样本）`,
        detail: c.p_eff != null && c.p_eff < c.p
          ? `遗忘衰减后预计仅剩 ${c.p_eff}%，近期错题 ${((c.wrong_qids || []).length)} 道，建议优先巩固`
          : `近期错题 ${((c.wrong_qids || []).length)} 道，建议优先巩固`,
        evidence: {
          band: c.band,
          n_sample: c.n,
          p_eff: c.p_eff,
          due: !!c.due,
          last_observed: c.last_observed,
          level: LEVEL_META[clusterLevel(c.cluster)].label,
        },
        actions: [
          { key: "filter_question_bank", label: "筛选该知识点题目", params: { cluster: c.cluster } },
          { key: "personalized_paper", label: "生成补弱练习", params: { strategy: "weak", clusters: [c.cluster] } },
        ],
      });
    });

  // —— 2) 素养短板（个人口径：对比自身各素养，最低且低于阈值）
  const lits = dims.literacy.filter((l: any) => l.value != null).sort((a: any, b: any) => a.value - b.value);
  if (lits.length && lits[0].value < TH.literacyWeak) {
    const low = lits[0];
    out.push({
      id: `sg-${studentId}-ability`,
      scope: "student",
      type: "ability",
      title: `${one.name}的「${low.name}」素养相对薄弱（${low.value} 分）`,
      detail: `与其较强的${lits[lits.length - 1].name}（${lits[lits.length - 1].value} 分）差距明显，建议选择锻炼${low.name}的题目`,
      evidence: { metric: "素养个人均分", value: low.value, n_clusters: low.n_clusters },
      actions: [
        { key: "filter_question_bank", label: `筛选${low.name}题目`, params: { literacy: low.name } },
      ],
    });
  }

  // —— 3) 到期复习（个人）
  const dueCells = (one.cells || []).filter((c: any) => c.due);
  if (dueCells.length) {
    out.push({
      id: `sg-${studentId}-review`,
      scope: "student",
      type: "review",
      title: `有 ${dueCells.length} 个知识点进入遗忘复习期（${dueCells.slice(0, 3).map((c: any) => c.cluster).join("、")}${dueCells.length > 3 ? " 等" : ""}）`,
      detail: "距上次练习较久，预计掌握度已衰减，建议尽快安排复习",
      evidence: { clusters: dueCells.map((c: any) => ({ cluster: c.cluster, p: c.p, p_eff: c.p_eff })) },
      actions: [
        { key: "personalized_paper", label: "生成遗忘复习练习", params: { strategy: "review" } },
      ],
    });
  }

  // —— 4) 冷启动（样本不足，不给强结论）
  if (one.n_events < 10) {
    out.push({
      id: `sg-${studentId}-cold`,
      scope: "student",
      type: "cold",
      title: `${one.name} 的学情样本不足（仅 ${one.n_events} 条记录）`,
      detail: "先布置基础练习积累作答记录，画像结论将随样本补充自动完善",
      evidence: { n_events: one.n_events },
      actions: [
        { key: "assign_homework", label: "布置基础练习", params: { class_id: classId, student_ids: [studentId] } },
      ],
    });
  }

  return {
    class_id: classId,
    student_id: studentId,
    name: one.name,
    scope: "student",
    suggestions: out,
  };
}

export default {
  "GET /api/teacher/profile/suggestions": (req: any, res: any) => {
    const classesData = read("classes.json").classes;
    const classId = req.query.class_id || classesData[0].class_id;
    try {
      if (req.query.student_id) {
        const sid = String(req.query.student_id);
        const data = suggestionsCache(JSON.stringify([classId, sid]), () => studentSuggestions(String(classId), sid));
        if (!data) return res.json({ code: 404, msg: "学生不存在", data: null });
        return res.json({ code: 200, msg: "ok", data });
      }
      res.json({ code: 200, msg: "ok", data: suggestionsCache(JSON.stringify([classId]), () => classSuggestions(String(classId))) });
    } catch (e: any) {
      res.json({ code: 500, msg: e?.message || "建议生成失败", data: null });
    }
  },
};
