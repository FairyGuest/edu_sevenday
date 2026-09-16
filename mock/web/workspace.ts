/** Adapt existing demo datasets to the current workspace list API contracts. */
import papers from "../data/papers.json";
import recommend from "../teacher/recommend";

function pageData(items: any[], body: any = {}) {
  const current = Math.max(1, Number(body.current) || 1);
  const size = Math.max(1, Math.min(100, Number(body.size) || 10));
  const keyword = String(body.name || body.keyword || "").trim();
  const filtered = items.filter(item => (!keyword || item.name.includes(keyword)) &&
    (!body.displayStatus || Number(item.displayStatus) === Number(body.displayStatus)));
  return { records: filtered.slice((current - 1) * size, current * size), total: filtered.length, current, size };
}

export default {
  "POST /api/web/paper/findTeacherPaperPage": (req: any, res: any) => {
    res.json({ code: 200, data: pageData(papers.map(p => ({ ...p, createTime: p.uploadTime })), req.body) });
  },
  "POST /api/web/exam/findExamPage": (req: any, res: any) => {
    recommend["GET /api/teacher/recommend/homework"]({ query: req.body || {} }, {
      json(result: any) {
        const items = result.data.map((h: any) => ({
          ...h, id: h.homework_id, name: h.title,
          displayStatus: h.status === "已结束" ? 3 : h.status === "进行中" ? 2 : 1,
          createTime: h.created_at, published_total: h.n_students,
        }));
        res.json({ code: 200, data: pageData(items, req.body) });
      },
    });
  },
};
