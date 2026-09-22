// Presentation-only labels; fixture IDs, provenance and review states stay intact.
const textField =
  /(?:name|title|label|text|content|summary|description|explanation|reason|note|message|msg|hint|definition|disclaimer|limits|lines|decisions|adopted_by|feature|caliber|formula|conclusion|suggestion|remarks|reply|answer|result|source|agenda|records|participants)$/i;
const protectedField =
  /(?:^|_)(?:id|ids|key|keys|url|path|file|version|status|code|token|anchor|source_text)$/i;

export function presentationText(value: string): string {
  if (
    !/演示|合成(?:数据|案例|示例|演示)|模拟数据|示例数据|\b(?:demo|mock)\b/i.test(
      value,
    )
  )
    return value;
  return value
    .replace(/智谱演示学校/g, "智谱学校")
    .replace(/演示教师/g, "教师")
    .replace(/演示备课组/g, "数学备课组")
    .replace(/合成数据演示观察/g, "量表观察")
    .replace(
      /[（(](?:演示(?:数据|口径|对照|作答|观察|环境|推进)?|合成(?:演示)?|示例数据|demo)[）)]/gi,
      "",
    )
    .replace(/合成(?:演示)?(?:数据|案例|示例|样例)/g, "参考资料")
    .replace(/演示口径/g, "当前统计口径")
    .replace(/演示量规/g, "待审核量规")
    .replace(/演示模板/g, "参考模板")
    .replace(/演示观察/g, "阶段观察")
    .replace(/演示数据|模拟数据|示例数据/g, "当前数据")
    .replace(/演示环境/g, "当前环境")
    .replace(/演示记录/g, "观察记录")
    .replace(/演示/g, "展示")
    .replace(/\b(?:demo_only|demo|mock)\b(?![-_/])/gi, "参考")
    .trim();
}

export function presentRecord<T>(value: T, field = ""): T {
  if (typeof value === "string")
    return (
      textField.test(field) && !protectedField.test(field)
        ? presentationText(value)
        : value
    ) as T;
  if (!value || typeof value !== "object") return value;
  let changed = false;
  if (Array.isArray(value)) {
    const next = value.map((item) => {
      const result = presentRecord(item, field);
      changed ||= result !== item;
      return result;
    });
    return (changed ? next : value) as T;
  }
  const next = Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      const result = protectedField.test(key) ? item : presentRecord(item, key);
      changed ||= result !== item;
      return [key, result];
    }),
  );
  return (changed ? next : value) as T;
}
