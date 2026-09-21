/** Adapt existing demo datasets to the current workspace list API contracts. */
import papers from "../data/papers.json";
import recommend, { listAssistantHomework } from "../teacher/recommend";
import { readTeacherFixture } from "../teacher/fixtures";

function pageData(items: any[], body: any = {}) {
  const current = Math.max(1, Number(body.current) || 1);
  const size = Math.max(1, Math.min(100, Number(body.size) || 10));
  const keyword = String(body.name || body.keyword || "").trim();
  const filtered = items.filter(
    (item) =>
      (!keyword || item.name.includes(keyword)) &&
      (!body.displayStatus ||
        Number(item.displayStatus) === Number(body.displayStatus)),
  );
  return {
    records: filtered.slice((current - 1) * size, current * size),
    total: filtered.length,
    current,
    size,
  };
}

export default {
  "POST /api/web/paper/findTeacherPaperPage": (req: any, res: any) => {
    res.json({
      code: 200,
      data: pageData(
        papers.map((p) => ({ ...p, createTime: p.uploadTime })),
        req.body,
      ),
    });
  },
  "POST /api/web/exam/findExamPage": (req: any, res: any) => {
    recommend["GET /api/teacher/recommend/homework"](
      { query: req.body || {} },
      {
        json(result: any) {
          const items = result.data.map((h: any) => ({
            ...h,
            id: h.homework_id,
            name: h.title,
            displayStatus:
              h.status === "已结束" ? 3 : h.status === "进行中" ? 2 : 1,
            createTime: h.created_at,
            published_total: h.n_students,
          }));
          res.json({ code: 200, data: pageData(items, req.body) });
        },
      },
    );
  },

  // 作业详情（作业下发「查看作业」回填）：从推荐作业库派生，字段对齐 PublishExamForm 查看态
  "GET /api/web/exam/getExamDetail": (req: any, res: any) => {
    const id = String(req.query.id || "");
    const hw = listAssistantHomework().find((h: any) => h.homework_id === id);
    if (!hw) return res.json({ code: 200, msg: "ok", data: null });
    let className = hw.class_id;
    try {
      const classes = readTeacherFixture("classes.json").classes;
      className =
        classes.find((c: any) => c.class_id === hw.class_id)?.class_name ||
        className;
    } catch {
      /* 保持 class_id */
    }
    const firstPaper = Object.values(hw.papers || {})[0] as any;
    const items = hw.unified_items || firstPaper?.items || [];
    const requirement = [
      hw.mode === "personalized"
        ? "个性化作业：按学生学情每人一单"
        : "全班统一作业",
      hw.summary?.q_count
        ? `题量 每人 ${hw.summary.q_count.min}–${hw.summary.q_count.max} 题`
        : "",
      hw.deadline ? `截止 ${String(hw.deadline).slice(0, 16)}` : "",
    ]
      .filter(Boolean)
      .join("；");
    res.json({
      code: 200,
      msg: "ok",
      data: {
        id,
        examId: id,
        name: hw.title,
        paperId: hw.homework_id,
        paperName: hw.title,
        className,
        classId: hw.class_id,
        grade: "八年级",
        requirement,
        requirements: requirement,
        startTime: hw.published_at,
        endTime: hw.deadline,
        question_count: items.length,
        questions: items.map((q: any, i: number) => ({
          index: i + 1,
          qid: q.qid,
          stem: q.stem,
          cluster: q.cluster,
          form: q.form,
          strategy: q.strategy,
          reason: q.reason,
          optional: !!q.optional,
        })),
      },
    });
  },
};
