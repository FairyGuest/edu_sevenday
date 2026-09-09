import { question_type_nume } from "@/global";

export const paperYearOptions = [
  { value: "2017", label: "全部" },
  { value: "2022", label: "近5年" },
  { value: "2024", label: "近3年" },
];

/** 与智能出题 submitFn 一致：递归遍历多层级 checkItems */
export const buildCatalogAndKpointIdsFromCheckItems = (nodes: any[] = []) => {
  const catalogIdList: number[] = [];
  const kpointIdList: number[] = [];

  const walkCheckItems = (list: any[] = []) => {
    list.forEach((node: any) => {
      if (node?.type === "kpoint") {
        const id = Number(node?.kpoint_id ?? node?.id);
        if (!Number.isNaN(id)) kpointIdList.push(id);
      } else if (node?.type === "catalog") {
        const id = Number(node?.id);
        if (!Number.isNaN(id)) catalogIdList.push(id);
      }
      if (node?.children?.length) {
        walkCheckItems(node.children);
      }
    });
  };

  walkCheckItems(nodes);

  return {
    catalogIdList: [...new Set(catalogIdList)],
    kpointIdList: [...new Set(kpointIdList)],
  };
};

/** 解析 findPersonalQuestionList 接口返回的题目列表 */
export const parsePersonalQuestionListResponse = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.personalQuestionList)) return data.personalQuestionList;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export type PaperFullDataDraftPayload = {
  paper?: Record<string, any>;
  paperQuestionList?: any[];
  personalQuestionList?: any[];
};

const isPersonalQuestionItem = (item: any) =>
  !!(item?.stem || item?.question_text || item?.quesType || item?.optionList);

const isDraftSnapshot = (item: any) =>
  !!(item?.paperQuestionList?.length || item?.paper);

/**
 * 雪花 id 超过 Number.MAX_SAFE_INTEGER，JSON.parse 会丢精度。
 * 将 ≥16 位的未加引号数字先转成字符串再 parse。
 */
const parseJsonPreserveBigInt = (raw: string) => {
  const normalized = raw.replace(
    /([:\[,]\s*)(-?\d{16,})(?=\s*[,\]}])/g,
    '$1"$2"',
  );
  return JSON.parse(normalized);
};

/** paperQuestionList 中 id 是否仍可用（无精度丢失导致的重复） */
const hasHealthyPaperQuestionIds = (list: any[] = []) => {
  if (!list.length) return true;
  const ids = list
    .map((item) => (item?.id == null ? "" : String(item.id)))
    .filter(Boolean);
  if (!ids.length) return false;
  return new Set(ids).size === ids.length;
};

const pickLatestDraftSnapshot = (list: any[]) => {
  const snapshots = [...list].reverse().filter(isDraftSnapshot);
  return (
    snapshots.find((item) =>
      hasHealthyPaperQuestionIds(item?.paperQuestionList || []),
    ) ??
    snapshots[0] ??
    list[list.length - 1]
  );
};

/** 解析 getPaperFullData.paperFulldataDraft（updatePaperFullData 草稿结构） */
export const parsePaperFullDataDraft = (draftRaw: string): PaperFullDataDraftPayload => {
  if (!draftRaw?.trim()) return {};
  try {
    const parsed = parseJsonPreserveBigInt(draftRaw);

    if (Array.isArray(parsed) && parsed.length > 0) {
      const snapshot = pickLatestDraftSnapshot(parsed);
      if (isDraftSnapshot(snapshot)) {
        return {
          paper: snapshot.paper,
          paperQuestionList: snapshot.paperQuestionList || [],
          personalQuestionList: snapshot.personalQuestionList || [],
        };
      }
      if (isPersonalQuestionItem(parsed[0])) {
        return { personalQuestionList: parsed };
      }
    }

    if (parsed && typeof parsed === "object") {
      if (parsed.paperQuestionList || parsed.paper) {
        return {
          paper: parsed.paper,
          paperQuestionList: parsed.paperQuestionList || [],
          personalQuestionList: parsed.personalQuestionList || [],
        };
      }
      if (Array.isArray(parsed.personalQuestionList)) {
        return { personalQuestionList: parsed.personalQuestionList };
      }
      if (Array.isArray(parsed.data)) return { personalQuestionList: parsed.data };
      if (Array.isArray(parsed.list)) return { personalQuestionList: parsed.list };
      if (Array.isArray(parsed.records)) return { personalQuestionList: parsed.records };
      if (Array.isArray(parsed.questions)) return { personalQuestionList: parsed.questions };
    }

    return {};
  } catch (e) {
    console.warn("解析草稿失败", e);
    return {};
  }
};

const normalizeQuestionSource = (item: any): string[] => {
  if (Array.isArray(item?.source)) {
    return item.source.filter(Boolean);
  }
  const summary = item?.sourceSummary || item?.source_summary;
  if (summary) return [String(summary)];
  if (typeof item?.source === "string" && item.source) {
    return [item.source];
  }
  return [];
};

export const mapPersonalQuestionToRow = (item: any) => {
  const rawOptions = Array.isArray(item?.optionList)
    ? item.optionList
    : Array.isArray(item?.options)
      ? item.options
      : [];
  const options = rawOptions.map((option: any) =>
    typeof option === "string" ? option : option?.content ?? option?.text ?? "",
  );

  const quesTypeName = item?.quesType || item?.question_type || item?.type;
  const questionType =
    question_type_nume.find((q) => q.type === quesTypeName)?.code ||
    question_type_nume.find((q) => q.code === quesTypeName)?.code ||
    (typeof quesTypeName === "string" && quesTypeName.includes("_")
      ? quesTypeName
      : "short_answer");

  const rawAnswers = Array.isArray(item?.answerList)
    ? item.answerList
    : Array.isArray(item?.correct_answers)
      ? item.correct_answers
      : [];
  const answers = rawAnswers.map((ans: any) => {
    if (
      typeof ans === "string" &&
      /^[A-Za-z]$/.test(ans.trim()) &&
      options.length
    ) {
      const idx = ans.trim().toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < options.length) return options[idx];
    }
    return ans;
  });

  const kgPointList = Array.isArray(item?.kgPointList)
    ? item.kgPointList
    : Array.isArray(item?.kgPoints)
      ? item.kgPoints
      : Array.isArray(item?.knowledgePointList)
        ? item.knowledgePointList
        : [];
  const sourceSummary =
    item?.sourceSummary || item?.source_summary || normalizeQuestionSource(item)[0] || "";
  const source = normalizeQuestionSource(item);

  return {
    ...item,
    id: item?.id ?? item?.questionId ?? item?.oldId,
    question_text: item?.stem || item?.question_text || item?.content || "",
    question_type: questionType,
    options,
    correct_answers: answers,
    explanation:
      item?.quesAnalysis || item?.analysis || item?.explanation || "",
    source_summary: sourceSummary,
    source,
    kpoint_ids: kgPointList.map((kp: any) => ({
      id: kp?.id,
      name: kp?.name,
    })),
  };
};

export const buildQuestionRulesFromList = (list: any[] = []) => {
  const seen = new Set<string>();
  const rules: any[] = [];
  list.forEach((item) => {
    const code = item?.question_type;
    if (!code || seen.has(code)) return;
    seen.add(code);
    const matched = question_type_nume.find((q) => q.code === code);
    rules.push({
      type: code,
      en_name: code,
      name: matched?.type || code,
    });
  });
  return rules;
};
