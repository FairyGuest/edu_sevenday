import type { ImportedClass } from "./ImportClassDialog";

// Use the existing user_require field as well as structured snapshots so current
// generation endpoints receive the selected classes without a new API contract.
export function classLearningContext(classes: ImportedClass[]) {
  if (!classes.length) return "";
  return (
    "请参考以下已导入班级的学情，分别说明共性教学重点与班级差异化安排：\n" +
    classes
      .map((cls) => {
        const rows = cls.preview?.rows || [];
        const overview = (cls.profile?.cluster_rows || [])
          .slice(0, 5)
          .map((r: any) => `${r.cluster}：${r.weak_pct ?? "未知"}% 待巩固`)
          .join("；");
        return (
          `【${cls.class_name}】${cls.chapter || ""}\n` +
          (rows.length
            ? rows
                .map(
                  (r: any) =>
                    `${r["前置知识点"]}：${r["班级掌握分布"]}；${r["典型错例（匿名）"] || "暂无典型错例"}`,
                )
                .join("\n")
            : overview || "暂无可参考学情，请按通用模式设计，不推断学生表现。")
        );
      })
      .join("\n\n")
  );
}
