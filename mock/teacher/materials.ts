import { readTeacherFixture } from "./fixtures";

export default {
  "GET /api/teacher/resource/materials": (req: any, res: any) => {
    const { node, type = "all", grade = "all", q = "" } = req.query;
    if (
      !["all", "plans", "courseware"].includes(type) ||
      !["all", "g7", "g8", "g9"].includes(grade)
    ) {
      return res.json({ code: 400, msg: "无效的资源类型或年级", data: null });
    }
    const all = readTeacherFixture("resources.json").items || [];
    const matches = all.filter(
      (item: any) =>
        (!node || item.knowledge_ids.includes(node)) &&
        (grade === "all" || item.grade === grade) &&
        (!q || `${item.title} ${item.summary}`.includes(String(q).trim())),
    );
    const items = matches.filter(
      (item: any) => type === "all" || item.type === type,
    );
    res.json({
      code: 200,
      msg: "ok",
      data: {
        items,
        total: items.length,
        counts: {
          plans: matches.filter((item: any) => item.type === "plans").length,
          courseware: matches.filter((item: any) => item.type === "courseware")
            .length,
        },
        match: { node: node || null, strategy: "knowledge_id_exact" },
      },
    });
  },
};
