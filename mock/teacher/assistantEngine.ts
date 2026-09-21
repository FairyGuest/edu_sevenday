import { readTeacherFixture as read } from "./fixtures";
import {
  SOURCES,
  Scope,
  dateKey,
  validDate,
  normalizeScope,
  scopedStudent,
  scopeLabel,
} from "./assistantScope";
import {
  questionCatalog,
  selectQuestions,
  validateQuestionFilter,
  QuestionFilter,
} from "./assistantQuestions";
import {
  generateTargetedHomework,
  getAssistantHomework,
  listAssistantHomework,
  replaceAssistantQuestion,
  publishAssistantHomework,
} from "./recommend";
import { computeReflectionSuggestions } from "./homeworkFlow";
import { explainNode, allNodeNames } from "./kgraph";
import { pinyin } from "pinyin-pro";

type StudentRef = {
  class_id: string;
  student_id: string;
  name: string;
  display_id: string;
  class_name: string;
};
type Session = {
  id: string;
  scope: Scope;
  class_id?: string;
  students: StudentRef[];
  filter: QuestionFilter;
  intent?: string;
  draft_id?: string;
  pending?: { query: string; candidates: StudentRef[]; token?: string };
  confirmation?: {
    token: string;
    id: string;
    revision: number;
    deadline: string;
  };
  lastUsed: number;
  requests: Map<string, any>;
  draftText?: string;
  cohort_condition?: { threshold: number; decline: boolean };
};
const sessions = new Map<string, Session>();
let sequence = 0;
const uid = () =>
  Date.now().toString(36) +
  "-" +
  (++sequence).toString(36) +
  "-" +
  Math.random().toString(36).slice(2);
const classes = () => read("classes.json").classes as any[];
function roster(classId?: string): StudentRef[] {
  return classes()
    .filter((c) => !classId || c.class_id === classId)
    .flatMap((c) =>
      read("class-students-" + c.class_id + ".json").map((s: any) => ({
        class_id: c.class_id,
        class_name: c.class_name,
        student_id: s.student_id,
        name: s.name,
        display_id: s.display_id,
      })),
    );
}
const rawStudent = (s: StudentRef) =>
  read("class-students-" + s.class_id + ".json").find(
    (x: any) => x.student_id === s.student_id,
  );
const fullClassName = (id?: string) =>
  classes().find((c) => c.class_id === id)?.class_name || "";
const cnNumber = (s: string): number => {
  if (/^\d+$/.test(s)) return Number(s);
  const digits: Record<string, number> = {
    零: 0,
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };
  if (s.includes("十") && s !== "十") {
    const [a, b] = s.split("十");
    return (digits[a] || 1) * 10 + (digits[b] || 0);
  }
  return digits[s] ?? NaN;
};
function scopeFromMessage(message: string, previous: Scope): Scope {
  const next = { ...previous, sources: [...previous.sources] };
  const now = new Date(),
    today = dateKey(now);
  const dates = message.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/g);
  const format = (d: string) =>
    d
      .split(/[-/]/)
      .map((x, i) => (i ? x.padStart(2, "0") : x))
      .join("-");
  if (dates?.length) {
    next.start_date = format(dates[0]);
    next.end_date = format(dates[1] || dates[0]);
  } else {
    const month = message.match(/(?:(20\d{2})年)?(\d{1,2})月(?:份)?/);
    const recent = message.match(
      /(?:近|最近|过去)([一二两三四五六七八九十\d]+)(天|周|个月)/,
    );
    if (/全部时间|所有时间|不限日期|全部历史|历史所有/.test(message)) {
      next.start_date = "";
      next.end_date = "";
    } else if (recent) {
      const n = cnNumber(recent[1]);
      if (!Number.isFinite(n) || n < 1 || n > 365)
        throw new Error("时间范围无效，请给出具体日期。");
      const start = new Date(now);
      if (recent[2] === "个月") start.setMonth(start.getMonth() - n);
      else
        start.setDate(start.getDate() - n * (recent[2] === "周" ? 7 : 1) + 1);
      next.start_date = dateKey(start);
      next.end_date = today;
    } else if (/上月|上个月/.test(message)) {
      next.start_date = dateKey(
        new Date(now.getFullYear(), now.getMonth() - 1, 1),
      );
      next.end_date = dateKey(new Date(now.getFullYear(), now.getMonth(), 0));
    } else if (/本月|这个月/.test(message)) {
      next.start_date = today.slice(0, 8) + "01";
      next.end_date = today;
    } else if (/本周|这周/.test(message)) {
      const start = new Date(now);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
      next.start_date = dateKey(start);
      next.end_date = today;
    } else if (month) {
      const y = Number(month[1] || now.getFullYear()),
        mo = Number(month[2]);
      if (mo < 1 || mo > 12) throw new Error("月份应为 1 至 12。");
      next.start_date = dateKey(new Date(y, mo - 1, 1));
      next.end_date = dateKey(new Date(y, mo, 0));
    }
  }
  const excluded = SOURCES.filter((s) =>
    new RegExp("(不看|排除|不要|去掉)" + s).test(message),
  );
  const included = SOURCES.filter(
    (s) => message.includes(s) && !excluded.includes(s),
  );
  if (/全部来源|所有来源/.test(message)) next.sources = [...SOURCES];
  else if (included.length) next.sources = included;
  if (excluded.length)
    next.sources = next.sources.filter((s) => !excluded.includes(s));
  return normalizeScope(next);
}
const longestTopic = (m: string) =>
  [...new Set([...questionCatalog().map((q) => q.cluster), ...allNodeNames()])]
    .filter((n) => m.includes(n))
    .sort((a, b) => b.length - a.length)[0] || "";
function questionFilter(m: string, prior: QuestionFilter): QuestionFilter {
  const f = { ...prior },
    topic = longestTopic(m);
  if (topic) {
    f.cluster = topic;
    delete f.clusters;
  }
  if (/不限知识点|全部知识点/.test(m)) {
    delete f.cluster;
    delete f.clusters;
  }
  const count = m.match(/([一二两三四五六七八九十\d]+)\s*(?:道|题)(?!号)/);
  if (count) f.total = cnNumber(count[1]);
  const difficulty = /容易|简单|基础题/.test(m)
    ? "容易"
    : /较易/.test(m)
      ? "较易"
      : /适中|中等/.test(m)
        ? "适中"
        : /较难/.test(m)
          ? "较难"
          : /困难|难题/.test(m)
            ? "困难"
            : "";
  if (difficulty) f.difficulty = difficulty;
  if (/不限难度/.test(m)) delete f.difficulty;
  const forms: [string[], string][] = [
    [["选择", "单选", "多选"], "选择"],
    [["填空"], "填空"],
    [["证明"], "证明"],
    [["计算", "解答"], "解答计算"],
    [["作图"], "作图"],
  ];
  const excluded = forms
    .filter(([words]) =>
      words.some((w) => new RegExp("(不要|排除|不含|去掉).{0,2}" + w).test(m)),
    )
    .map(([, v]) => v);
  const form = forms.find(
    ([words, v]) => words.some((w) => m.includes(w)) && !excluded.includes(v),
  )?.[1];
  if (form) f.form = form;
  if (excluded.length) {
    f.exclude_forms = [...new Set([...(f.exclude_forms || []), ...excluded])];
    if (f.form && excluded.includes(f.form)) delete f.form;
  }
  if (/不限题型/.test(m)) {
    delete f.form;
    f.exclude_forms = [];
  }
  if (/排除做过|不要做过|没做过|没练过|未做过/.test(m)) f.exclude_done = true;
  if (/包括做过|可以重复/.test(m)) f.exclude_done = false;
  const lit = [
    "数学抽象",
    "逻辑推理",
    "数学建模",
    "直观想象",
    "数学运算",
    "数据分析",
  ].find((l) => m.includes(l));
  if (lit) f.literacy = lit;
  const source = [
    "真题",
    "模拟题",
    "月考卷",
    "期中卷",
    "期末卷",
    "同步练习",
    "专项练习",
  ].find((s) => m.includes(s));
  if (source) f.source_type = source;
  return validateQuestionFilter(f);
}
function requestedClass(m: string): string | undefined {
  const id = m.match(/cls-g\d+-\d+/)?.[0];
  if (id) return id;
  const match = m.match(
    /(?:八年级|初二)?[（(]?([一二三四五六七八九十\d]+)[）)]?班/,
  );
  if (match) return "cls-g8-" + String(cnNumber(match[1])).padStart(2, "0");
  return undefined;
}
function distance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i ? (j ? 0 : i) : j)),
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + Number(a[i - 1] !== b[j - 1]),
      );
  return dp[a.length][b.length];
}
function resolveStudents(
  m: string,
  classId?: string,
  explicitClass = false,
): {
  matches?: StudentRef[];
  candidates?: StudentRef[];
  missing?: string;
  explicit?: boolean;
  token?: string;
} {
  const all = roster(),
    local = roster(classId);
  const positive = m.replace(
    /(?:不是|不看|不要看|别看|排除)[\u4e00-\u9fffA-Za-z0-9]+?(?=而是|改看|换成|，|,|。|$)/g,
    "",
  );
  let found = all.filter(
    (s) =>
      positive.includes(s.name) ||
      new RegExp("(^|[^a-z0-9])" + s.display_id + "(?![a-z0-9])", "i").test(
        positive,
      ) ||
      new RegExp("(^|[^0-9])" + s.student_id + "(?![0-9])").test(positive),
  );
  if (found.length === 1) {
    const nameText = positive.replace(
      /上月|上个月|本月|这个月|近两周|最近/g,
      "",
    );
    const explicitName = nameText.match(
      /(?:查看|看看|看一下|看|换成|换|给)([\u4e00-\u9fff]{2,4}?)(?:的(?:个人)?学情|的画像|同学|学情|生成|布置|$)/,
    )?.[1];
    if (
      explicitName &&
      explicitName !== found[0].name &&
      explicitName.startsWith(found[0].name)
    )
      return { candidates: found, explicit: true, token: explicitName };
  }
  if (found.length) {
    if (explicitClass) {
      const inside = found.filter((s) => s.class_id === classId);
      if (found.some((s) => !inside.some((x) => x.name === s.name)))
        return {
          missing:
            found
              .filter((s) => !inside.some((x) => x.name === s.name))
              .map((s) => s.name)
              .join("、") + "不在指定班级",
          explicit: true,
        };
      found = inside;
    } else if (classId)
      found = found.filter(
        (s) =>
          !found.some((t) => t.name === s.name && t.class_id === classId) ||
          s.class_id === classId,
      );
    if (new Set(found.map((s) => s.name)).size !== found.length)
      return { candidates: found, explicit: true };
    const namedList = positive.match(
      /(?:给|比较|对比|看看|查看|看)([\u4e00-\u9fff]{2,4}(?:[、和与,，][\u4e00-\u9fff]{2,4})+)(?:的|各|生成|布置|学情|，|$)/,
    )?.[1];
    if (namedList) {
      const unknown = namedList
        .split(/[、和与,，]/)
        .filter((n) => !found.some((s) => s.name === n));
      if (unknown.length)
        return { missing: unknown.join("、"), explicit: true };
    }
    return { matches: found, explicit: true };
  }
  const identityText = positive
    .replace(
      /(?:上个?月|上月|本月|这个月|本周|这周|最近|近)[一二两三四五六七八九十\d]*(?:天|周|个月)?/g,
      "",
    )
    .replace(/(?:20\d{2}年)?\d{1,2}月(?:份)?/g, "")
    .replace(/(?:八年级|初二)?[（(]?[一二三四五六七八九十\d]+[）)]?班/g, "")
    .replace(/([a-z])\s+(?=[a-z])/gi, "$1");
  const token =
    identityText.match(
      /(?:学号|姓名|名字|叫做|叫)\s*[：:]?\s*([A-Za-z0-9\u4e00-\u9fff]{1,24}?)(?:同学|的|学情|个人|[，。,\s]|$)/,
    )?.[1] ||
    identityText.match(
      /(?:查看|看看|看一下|看|换成|换|给)\s*([\u4e00-\u9fffA-Za-z0-9]{1,24}?)(?:同学的?|的(?:个人)?学情|的画像|的成绩|的情况|学情|生成|布置|$)/,
    )?.[1];
  if (
    !token ||
    /^(我|他|她|这两个人|这几个学生|这些学生|他们|全班|本班|个人|班级|当前学生|一下|近|最近|本月|上月)/.test(
      token,
    )
  )
    return {};
  if (
    /^(作业|提交|未交|报告|题库|知识|教学|出|这些条件|这些证据|全部|所有|历史|考试|自主练习|人机交互)/.test(
      token,
    ) ||
    longestTopic(token) === token
  )
    return {};
  const candidates = (explicitClass ? local : all)
    .filter(
      (s) =>
        s.name.includes(token) ||
        s.display_id.toLowerCase().includes(token.toLowerCase()) ||
        (/^[a-z]+$/i.test(token) &&
          pinyin(s.name, { toneType: "none" })
            .replace(/\s/g, "")
            .startsWith(token.toLowerCase())) ||
        (token.length >= 2 && distance(token, s.name) <= 1),
    )
    .slice(0, 12);
  return candidates.length
    ? { candidates, explicit: true, token }
    : { missing: token, explicit: true };
}
const profileAction = (s: StudentRef, scope: Scope) => ({
  key: "view_student_profile",
  label: "打开" + s.name + "的个人学情",
  params: {
    class_id: s.class_id,
    student_id: s.student_id,
    ...scope,
    sources: scope.sources.join(","),
  },
});
function studentFacts(s: StudentRef, scope: Scope) {
  const d = scopedStudent(rawStudent(s), scope);
  return {
    ...s,
    n: d.n_events,
    accuracy: d.accuracy,
    weak: d.cells.filter((c: any) => c.n >= 3 && c.p < 60),
    cells: d.cells,
    evidence: d.evidence.slice(0, 12),
    latest_available:
      (rawStudent(s).evidence || [])
        .map((e: any) => e.date)
        .sort()
        .at(-1) || null,
  };
}
function studentText(f: any) {
  if (!f.n)
    return `${f.name}（${f.class_name}，${f.display_id}）：当前范围无作答明细。${f.latest_available ? "最近可用记录为 " + f.latest_available + "。" : "尚无历史学情记录。"}`;
  return (
    `${f.name}（${f.class_name}，${f.display_id}）：${f.n} 条可用作答，观察正确率 ${f.accuracy}%。` +
    (f.weak.length
      ? `待巩固：${f.weak.map((c: any) => `${c.cluster} ${c.k}/${c.n}（${c.p}%）`).join("；")}。`
      : "没有达到证据门槛的薄弱知识点。")
  );
}
function draftCard(hw: any) {
  return {
    kind: "draft",
    title: hw.title + " · " + hw.homework_id,
    subtitle: `仅草稿 · ${hw.summary.n_students} 人 · 每人 ${hw.summary.q_count.min}–${hw.summary.q_count.max} 题 · 版本 ${hw.revision || 1}`,
    rows: Object.values(hw.papers).map((p: any) => ({
      title: p.name,
      text: p.items
        .map(
          (q: any, i: number) =>
            `${i + 1}. ${q.stem}\n${q.cluster} · ${q.form} · ${q.difficulty} · ${q.qid}`,
        )
        .join("\n\n"),
    })),
    detail: JSON.stringify(hw.config),
    homework_id: hw.homework_id,
    actions: [
      {
        key: "open_homework",
        label: "到作业页预览",
        params: { homework_id: hw.homework_id },
      },
    ],
    prompts: ["第2题换掉", "查看作业提交情况"],
    notes: hw.summary.notes_sample || [],
  };
}
function deadlineFrom(m: string): string | undefined {
  const absolute = m.match(
    /(?:截止|截至|到)\s*(\d{4}-\d{2}-\d{2})(?:[ T日\s]*(\d{1,2})(?::|点)(\d{2})?)?/,
  );
  if (absolute) {
    if (
      !validDate(absolute[1]) ||
      (absolute[2] && Number(absolute[2]) > 23) ||
      (absolute[3] && Number(absolute[3]) > 59)
    )
      return undefined;
    return (
      absolute[1] +
      "T" +
      (absolute[2] || "23").padStart(2, "0") +
      ":" +
      (absolute[3] || (absolute[2] ? "00" : "59")) +
      ":00+08:00"
    );
  }
  if (/明天|明晚|后天|今晚|今天/.test(m)) {
    const d = new Date();
    d.setDate(d.getDate() + (/后天/.test(m) ? 2 : /明天|明晚/.test(m) ? 1 : 0));
    const hour = m.match(/(\d{1,2})(?:点|:)(\d{2})?/);
    const h = hour
      ? Number(hour[1]) + (/晚上|晚/.test(m) && Number(hour[1]) < 12 ? 12 : 0)
      : 23;
    if (h > 23 || (hour?.[2] && Number(hour[2]) > 59)) return undefined;
    return (
      dateKey(d) +
      "T" +
      String(h).padStart(2, "0") +
      ":" +
      (hour?.[2] || (hour ? "00" : "59")) +
      ":00+08:00"
    );
  }
  return undefined;
}
function initSession(body: any): Session {
  const existing =
    typeof body.session_id === "string" ? sessions.get(body.session_id) : null;
  if (existing && Date.now() - existing.lastUsed < 7200000) {
    existing.lastUsed = Date.now();
    return existing;
  }
  const s: Session = {
    id: uid(),
    scope: normalizeScope(body.page?.data),
    class_id: classes().some((c) => c.class_id === body.page?.data?.class_id)
      ? body.page.data.class_id
      : undefined,
    students: [],
    filter: { total: 6 },
    lastUsed: Date.now(),
    requests: new Map(),
  };
  const sid = body.page?.data?.student_id;
  if (sid) s.students = roster(s.class_id).filter((x) => x.student_id === sid);
  sessions.set(s.id, s);
  if (sessions.size > 80) sessions.delete(sessions.keys().next().value!);
  return s;
}

export function assistantConversation(body: any): any {
  const prior = sessions.get(body.session_id);
  const expired =
    !!body.session_id && (!prior || Date.now() - prior.lastUsed >= 7200000);
  const s = initSession(body);
  const requestId =
    typeof body.request_id === "string" ? body.request_id.slice(0, 150) : "";
  if (requestId && s.requests.has(requestId)) return s.requests.get(requestId);
  const result = (reply: string, cards: any[] = [], extra: any = {}) => {
    const response = {
      reply,
      cards,
      source: "data",
      session_id: s.id,
      task: {
        students: s.students.map((x) => x.name),
        class_name: fullClassName(s.class_id),
        scope: scopeLabel(s.scope),
        draft_id: s.draft_id,
      },
      ...extra,
    };
    if (requestId) {
      s.requests.set(requestId, response);
      if (s.requests.size > 24)
        s.requests.delete(s.requests.keys().next().value!);
    }
    return response;
  };
  try {
    if (expired) {
      s.students = [];
      return result(
        "会话已过期或演示服务已重启，请重新指定学生和任务；未执行之前的操作。",
        [],
        { source: "clarification" },
      );
    }
    let m = String(body.message || "")
      .trim()
      .slice(0, 4000);
    // A greeting shortcut deliberately targets its page snapshot. Ordinary chat
    // keeps conversational references even after navigation.
    if (body.page_command === true) {
      const data = body.page?.data || {},
        cid = data.class_id;
      if (!classes().some((c) => c.class_id === cid))
        return result("请先选择要操作的班级。", [], {
          source: "clarification",
        });
      const selected = data.student_id
        ? roster(cid).filter((x) => x.student_id === data.student_id)
        : [];
      if (data.student_id && !selected.length)
        return result("当前班级没有这位学生，请重新选择。", [], {
          source: "clarification",
        });
      const scope = normalizeScope(data);
      s.class_id = cid;
      s.students = selected;
      s.scope = scope;
      s.pending = undefined;
      s.confirmation = undefined;
    }
    if (body.suggestion_action) {
      const action = body.suggestion_action,
        p = action.params || {};
      if (!["personalized_paper", "assign_homework"].includes(action.key))
        return result("不支持这个建议动作。");
      const cid = p.class_id || s.class_id;
      if (!classes().some((c) => c.class_id === cid))
        return result("请指定建议要应用的班级。");
      const ids =
        p.student_ids === undefined
          ? (body.page_command === true && s.students.length
              ? s.students
              : roster(cid)
            ).map((x) => x.student_id)
          : p.student_ids;
      const hw = generateTargetedHomework(cid, {
        ...p,
        student_ids: ids,
        scope: s.scope,
        total: p.total ?? 6,
      });
      s.draft_id = hw.homework_id;
      s.class_id = cid;
      s.students = roster(cid).filter((x) => ids.includes(x.student_id));
      s.filter = validateQuestionFilter(p);
      s.confirmation = undefined;
      return result("已按建议中的对象和条件生成草稿。尚未发布。", [
        draftCard(hw),
      ]);
    }
    if (typeof body.document_text === "string")
      s.draftText = body.document_text.slice(0, 20000);
    if (typeof body.semantic_read === "string") {
      const semantic = body.semantic_read.slice(0, 300);
      const userText =
        m +
        (Array.isArray(body.history)
          ? body.history
              .filter((h: any) => h.role === "user")
              .map((h: any) => h.text)
              .join(" ")
          : "");
      const mentioned = roster().filter(
        (x) =>
          semantic.includes(x.name) ||
          semantic.includes(x.display_id) ||
          semantic.includes(x.student_id),
      );
      if (
        /发布|下发|生成|创建|布置|删除|修改|替换|发给/.test(semantic) ||
        mentioned.some(
          (x) =>
            !userText.includes(x.name) &&
            !userText.includes(x.display_id) &&
            !userText.includes(x.student_id),
        )
      ) {
        return result("需要补充具体查询对象，未执行模型推测的操作。", [], {
          source: "clarification",
        });
      }
      m = semantic;
    }
    if (!m) return result("请输入学生姓名、教学问题或要完成的任务。");
    if (body.confirmation) {
      const c = s.confirmation;
      if (!c || c.token !== body.confirmation)
        return result("这张确认卡已失效，请重新发起发布请求。");
      const receipt = publishAssistantHomework(c.id, c.revision, c.deadline);
      return result("发布完成，以下是系统回执。", [
        {
          kind: "receipt",
          title: "发布回执（演示环境）",
          rows: Object.entries(receipt).map(([title, text]) => ({
            title,
            text: String(text),
          })),
        },
      ]);
    }
    s.confirmation = undefined;
    if (/^(取消|先别发|别发|暂不发布|停止|不要发布)[！!。.\s]*$/.test(m)) {
      s.pending = undefined;
      return result("已取消发布意图，现有草稿仍可预览和修改。");
    }
    let chosen: StudentRef | undefined;
    if (body.candidate_id && !s.pending)
      return result("候选已失效，请重新查询。", [], {
        source: "clarification",
      });
    if (body.candidate_id && s.pending) {
      chosen = s.pending.candidates.find(
        (c) =>
          c.student_id === body.candidate_id &&
          (!body.candidate_class || c.class_id === body.candidate_class),
      );
      if (!chosen) return result("候选已失效，请重新查询。");
      m = s.pending.token
        ? s.pending.query.replace(s.pending.token, chosen.name)
        : s.pending.query;
      s.pending = undefined;
      s.students = [chosen];
      s.class_id = chosen.class_id;
    }
    if (!body.candidate_id) s.pending = undefined;
    // A bounded sequence carries the resolved target/filters forward and stops on clarification.
    const steps = m
      .split(
        /(?:[，,。]\s*)?(?:然后|接着|再|并且|并)(?=给|为|查看|看|生成|写|找|筛|发布)/,
      )
      .map((x) => x.trim())
      .filter(Boolean);
    if (!body.sequence_step && steps.length > 1) {
      if (steps.length > 3)
        return result("一次最多串联3个任务，请把后续任务拆到下一条消息。", [], {
          source: "clarification",
        });
      const replies: string[] = [],
        cards: any[] = [];
      let last: any;
      for (const step of steps) {
        last = assistantConversation({
          ...body,
          message: step,
          session_id: s.id,
          request_id: "",
          sequence_step: true,
          candidate_id: undefined,
          semantic_read: undefined,
        });
        replies.push(last.reply);
        cards.push(...last.cards);
        if (last.source === "clarification") {
          if (s.pending) s.pending.query = m;
          break;
        }
      }
      return result(replies.join("\n\n"), cards, {
        source: last.source,
        needs_model: last.needs_model,
        model_context: last.model_context,
      });
    }
    const explicitClass = requestedClass(m);
    if (explicitClass && !classes().some((c) => c.class_id === explicitClass))
      return result("没有找到你可查看的这个班级。", [
        {
          kind: "choice",
          title: "可选班级",
          prompts: classes().map((c) => `查看${c.class_name}学情`),
        },
      ]);
    if (explicitClass) {
      s.class_id = explicitClass;
      if (s.students.some((x) => x.class_id !== explicitClass)) s.students = [];
    }
    if (/当前页|当前班|本页|本班/.test(m) && body.page?.data?.class_id) {
      const cid = body.page.data.class_id;
      if (classes().some((c) => c.class_id === cid)) {
        s.class_id = cid;
        s.students = [];
      }
    }
    const instructional =
      /(?:怎么|如何|怎样|能否|可不可以|能不能).{0,12}(?:布置|发布|下发|生成|组卷|操作)/.test(
        m,
      ) && !/请帮我|帮我|直接/.test(m);
    if (instructional)
      return result(
        "可以先指定班级或学生、知识点和题数，例如“给彭媛生成5道二次根式练习”。我会建立草稿供你预览、换题。需要下发时，再说“发布这份草稿，截止明晚8点”，核对对象、题目和截止时间后点击确认发布。",
      );
    const resolved: ReturnType<typeof resolveStudents> = chosen
      ? { matches: [chosen] }
      : /第\s*[一二两三四五六七八九十\d]+\s*题/.test(m)
        ? {}
        : resolveStudents(m, s.class_id, !!explicitClass);
    if (resolved.missing) {
      s.pending = undefined;
      s.students = [];
      return result(
        `未找到“${resolved.missing}”。请提供完整姓名或学号；当前没有替你选择其他学生。`,
        [],
        { source: "clarification" },
      );
    }
    if (resolved.candidates?.length) {
      s.pending = {
        query: m,
        candidates: resolved.candidates,
        token: resolved.token,
      };
      s.students = [];
      return result(
        "需要确认具体是哪位学生，选择后继续原来的任务。",
        [
          {
            kind: "choice",
            title: "学生候选",
            candidates: resolved.candidates,
          },
        ],
        { source: "clarification" },
      );
    }
    if (resolved.matches?.length) {
      const previous = s.students;
      s.students =
        /比较|对比/.test(m) && /他|她/.test(m) && resolved.matches.length === 1
          ? [
              ...previous.filter(
                (x) =>
                  !resolved.matches!.some((y) => y.student_id === x.student_id),
              ),
              ...resolved.matches,
            ]
          : resolved.matches;
      s.class_id = s.students[0].class_id;
    }
    if (/全班|全部学生|所有学生/.test(m)) s.students = [];
    const write =
      !/(不要|先别|暂不|不必|不用).{0,4}(生成|创建|布置|组卷)/.test(m) &&
      !(/例题|解题步骤|完整讲解/.test(m) && !/布置|组卷|作业/.test(m)) &&
      /(生成|创建|布置|出|留|安排|组).{0,14}(作业|练习|试卷|题)|组卷/.test(m);
    const publish =
      /发布|下发|发给/.test(m) &&
      !/(别|不要|不|勿|暂缓|暂不|先不).{0,4}(发布|下发|发给|发)/.test(m);
    s.scope = scopeFromMessage(m.replace(/(?:截止|截至).*/, ""), s.scope);
    const topic = longestTopic(
      s.students.reduce(
        (text, student) => text.split(student.name).join(""),
        m,
      ),
    );
    const scopesLearningData =
      !!resolved.matches?.length ||
      /只看|学情|画像|成绩|掌握|正确率|薄弱|证据|比较|对比|教学片段|教案/.test(
        m,
      );
    if (topic && scopesLearningData && !write && !/找|搜|题库/.test(m))
      s.scope.cluster = topic;
    if (/全部知识点|不限知识点/.test(m)) s.scope.cluster = "";
    if (
      /(?:生成|撰写|写|设计|准备|备).{0,12}(?:教案|教学设计|教学片段|课|讲解)|家长|学情报告|学生版/.test(
        m,
      )
    ) {
      const targets = s.students.length
        ? s.students
        : s.class_id
          ? roster(s.class_id)
          : [];
      if (!targets.length)
        return result("请先指定学生或班级，让草稿能依据对应学情生成。");
      const facts = targets.map((x) => studentFacts(x, s.scope)),
        available = facts.filter((f) => f.n);
      const isReport = /家长|学情报告|学生版/.test(m);
      const topicName =
        topic ||
        facts.flatMap((f) => f.weak).sort((a, b) => a.p - b.p)[0]?.cluster ||
        "当前学习内容";
      const text = isReport
        ? `${/家长/.test(m) ? "家长沟通稿" : "学生学情报告"}（草稿）\n\n${facts.slice(0, 6).map(studentText).join("\n\n")}\n\n建议从有作答依据的薄弱点开始复习，每次先讲解一道示例，再独立完成同类练习。错误原因还需要结合解题过程核实，不给学生贴能力或态度标签。\n\n统计范围：${scopeLabel(s.scope)}。${available.length ? "依据可用作答明细。" : "当前范围无明细，请补充数据后再作个体诊断。"}`
        : `《${topicName}》教学片段（草稿）\n\n学情依据：${facts.slice(0, 4).map(studentText).join("\n")}\n\n目标：学生能解释${topicName}的关键条件，并独立完成同类练习。\n\n1. 诊断导入（3分钟）：请学生说出相关定义及使用条件，用一正一反两个例子判断。\n2. 示范与追问（5分钟）：围绕${topicName}展示分步解题，追问“这一步为什么成立？条件改变后还成立吗？”\n3. 分层练习（5分钟）：证据充分的薄弱学生先做基础题，其余学生做变式题；证据不足者先补诊断题。\n4. 出门测（2分钟）：独立完成一道同知识点题，并解释关键一步。记录过程后再更新学情。\n\n评价：观察解题理由和独立完成情况，不能只凭一次答对判断掌握。\n统计范围：${scopeLabel(s.scope)}。`;
      s.draftText = text;
      return result(
        "已生成可编辑的内容草稿。可以继续要求调整讲解方式、面向家长改写或补充具体例题。",
        [
          {
            kind: "document",
            title: isReport ? "学情沟通稿" : "教学片段",
            text,
            actions: isReport
              ? []
              : [
                  {
                    key: "inject_teaching_design",
                    label: "带入教学设计",
                    params: { class_id: s.class_id, assistant_draft: text },
                  },
                ],
          },
        ],
        {
          needs_model: true,
          model_context: {
            scope: s.scope,
            facts: facts.slice(0, 6),
            draft: text,
            purpose:
              "深化为满足老师问题的具体教学内容，可补充正确例题与解答；保留数据口径，不得补造学生事实。",
          },
        },
      );
    }
    if (
      /第\s*([一二两三四五六七八九十\d]+)\s*题.{0,6}(换|替换|更换)|换.{0,3}第\s*([一二两三四五六七八九十\d]+)\s*题/.test(
        m,
      )
    ) {
      const index = m.match(/第\s*([一二两三四五六七八九十\d]+)\s*题/)!;
      const hw = replaceAssistantQuestion(
        s.draft_id || "",
        cnNumber(index[1]) - 1,
      );
      return result("替换完成，原名单、题数和筛选条件已保留。", [
        draftCard(hw),
      ]);
    }
    const refineCohort =
      s.intent === "cohort" &&
      !!s.cohort_condition &&
      /只看|近|本月|上月|排除.*记录/.test(m) &&
      !resolved.matches?.length;
    const cohort =
      refineCohort ||
      (/哪些|哪几个|筛出|找出|名单|低于|不到|下降|退步/.test(m) &&
        /学生|同学|掌握|正确率|下降|退步/.test(m));
    let cohortFacts: any[] | undefined;
    if (cohort) {
      if (!s.class_id)
        return result("请指定要筛选的班级，例如“1班正确率低于60%的学生”。");
      const thresholdMatch = m.match(
        /(?:低于|不到|小于|低过|<)\s*(\d+(?:\.\d+)?)\s*[%％]?/,
      );
      const threshold = thresholdMatch
        ? Number(thresholdMatch[1])
        : refineCohort
          ? s.cohort_condition!.threshold
          : 60;
      const decline =
        /下降|退步/.test(m) || (!!refineCohort && s.cohort_condition!.decline);
      s.cohort_condition = { threshold, decline };
      if (threshold < 0 || threshold > 100)
        return result("正确率阈值应在 0% 至 100% 之间。");
      const all = roster(s.class_id).map((x) => studentFacts(x, s.scope));
      if (decline) {
        if (!s.scope.start_date || !s.scope.end_date)
          return result("比较下降需要具体日期范围，我会与之前相同天数比较。");
        const start = new Date(s.scope.start_date + "T12:00:00"),
          end = new Date(s.scope.end_date + "T12:00:00");
        const days =
          Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
        const prevEnd = new Date(start);
        prevEnd.setDate(prevEnd.getDate() - 1);
        const prevStart = new Date(start);
        prevStart.setDate(prevStart.getDate() - days);
        cohortFacts = all
          .map((f) => ({
            ...f,
            previous: studentFacts(f, {
              ...s.scope,
              start_date: dateKey(prevStart),
              end_date: dateKey(prevEnd),
            }),
          }))
          .filter(
            (f) =>
              f.n >= 3 &&
              f.previous.n >= 3 &&
              f.accuracy! < f.previous.accuracy!,
          );
      } else
        cohortFacts = all.filter((f) => f.n >= 3 && f.accuracy! < threshold);
      s.students = cohortFacts.map((f) => ({
        class_id: f.class_id,
        class_name: f.class_name,
        name: f.name,
        student_id: f.student_id,
        display_id: f.display_id,
      }));
      s.intent = "cohort";
      if (!write)
        return result(
          `找到 ${cohortFacts.length} 名符合条件的学生。已排除当前范围少于3条作答证据的学生；下降比较要求两个时间段均有至少3条记录。`,
          [
            {
              kind: "cohort",
              title: fullClassName(s.class_id) + " · 条件筛选",
              subtitle: scopeLabel(s.scope),
              rows: cohortFacts.map((f) => ({
                title: `${f.name} · ${f.display_id}`,
                text: `${f.accuracy}% · ${f.n}条${f.previous ? `；前期 ${f.previous.accuracy}% / ${f.previous.n}条` : ""}`,
                action: profileAction(f, s.scope),
              })),
              prompts: cohortFacts.length
                ? ["给这些学生生成5道练习", "为这些学生写一段教学设计"]
                : [],
            },
          ],
        );
    }
    const findQuestions =
      /找|搜|筛|推荐|来几|题库/.test(m) && /题|练习/.test(m);
    if (
      write ||
      findQuestions ||
      (s.intent === "questions" && /只要|换成|不要|排除|改成/.test(m))
    ) {
      s.filter = questionFilter(m, s.filter);
      if (!s.filter.cluster && s.scope.cluster)
        s.filter.cluster = s.scope.cluster;
      if (s.filter.exclude_done && !s.students.length && !s.class_id)
        return result("排除做过的题需要指定学生或班级。");
      if (write) {
        if (
          !s.students.length &&
          (cohortFacts || /这些|他们|她们|这几个|这两|给他|给她/.test(m))
        )
          return result(
            "当前选中的学生名单为空，不能为它生成作业。请先查到学生。",
          );
        const targets = s.students.length
          ? s.students
          : s.class_id
            ? roster(s.class_id)
            : [];
        if (!targets.length)
          return result(
            "请指定学生姓名或班级，例如“给彭媛生成5道二次根式练习”。",
          );
        if (new Set(targets.map((x) => x.class_id)).size > 1)
          return result(
            "这些学生来自不同班级，请按班级分别生成草稿，以便准确下发。",
          );
        const hw = generateTargetedHomework(targets[0].class_id, {
          ...s.filter,
          student_ids: targets.map((x) => x.student_id),
          scope: s.scope,
          target_weak: /薄弱|补弱/.test(m) && !s.filter.cluster,
          strategy: /复习/.test(m)
            ? "review"
            : /变式/.test(m)
              ? "variant"
              : "weak",
        });
        s.draft_id = hw.homework_id;
        s.intent = "draft";
        if (!publish)
          return result(
            "已生成草稿，可直接预览和换题。尚未发布。" +
              (hw.summary.notes_sample.length
                ? "\n" + hw.summary.notes_sample.join("\n")
                : ""),
            [draftCard(hw)],
          );
      } else {
        const targets = s.students.length
          ? s.students
          : s.class_id
            ? roster(s.class_id)
            : [];
        const done = targets.flatMap((x) =>
          (rawStudent(x).evidence || []).map((e: any) => e.qid),
        );
        const pool = selectQuestions(s.filter, done);
        s.intent = "questions";
        return result(
          `符合全部条件的题目有 ${pool.length} 道，展示 ${Math.min(pool.length, s.filter.total!)} 道。${pool.length < s.filter.total! ? "数量不足，未放宽条件。" : ""}`,
          [
            {
              kind: "questions",
              title: "题目检索结果",
              subtitle: JSON.stringify(s.filter),
              rows: pool
                .slice(0, s.filter.total)
                .map((q) => ({
                  title: q.cluster + " · " + q.form + " · " + q.difficulty_zh,
                  text: q.stem + "\n题号：" + q.qid,
                })),
              prompts: pool.length ? ["用这些条件生成练习草稿"] : [],
            },
          ],
        );
      }
    }
    if (publish) {
      const hw = getAssistantHomework(s.draft_id || "");
      if (!hw) return result("还没有可发布的草稿，请先生成并预览具体题目。");
      const deadline = deadlineFrom(m);
      if (
        !deadline ||
        !Number.isFinite(new Date(deadline).getTime()) ||
        new Date(deadline).getTime() <= Date.now()
      )
        return result(
          "请补充未来的截止时间，例如“发布这份草稿，截止明晚8点”。",
        );
      const token = uid();
      s.confirmation = {
        token,
        id: hw.homework_id,
        revision: hw.revision,
        deadline,
      };
      return result("请核对以下具体内容。点击确认发布后才会下发。", [
        draftCard(hw),
        {
          kind: "confirmation",
          title: "确认发布",
          token,
          subtitle: `${fullClassName(hw.class_id)} · ${hw.homework_id} · 截止 ${deadline}`,
          rows: [
            {
              title: "收件学生",
              text: Object.values(hw.papers)
                .map((p: any) => p.name)
                .join("、"),
            },
            {
              title: "题量",
              text: `每人 ${hw.summary.q_count.min}–${hw.summary.q_count.max} 题，以上预览为本次发布内容。`,
            },
          ],
        },
      ]);
    }
    if (
      /作业(?!记录)|提交|未交|催交|完成情况/.test(m) &&
      !/为什么|讲解|解题/.test(m)
    ) {
      const id = m.match(/hw-[\w-]+/)?.[0] || s.draft_id;
      const hws = id
        ? [getAssistantHomework(id)].filter(Boolean)
        : listAssistantHomework(s.class_id);
      if (!hws.length)
        return result("当前范围没有找到作业记录。可以先生成一份草稿。");
      const cards = hws.map((hw) => {
        const report = hw.report,
          simulation = !!report && /模拟/.test(report.note || "");
        const actual =
          !simulation && hw.submissions && typeof hw.submissions === "object"
            ? hw.submissions
            : null;
        const targetIds = hw.roster_snapshot || Object.keys(hw.papers || {}),
          missing = actual
            ? targetIds.filter((id: string) => !actual[id]?.submitted_at)
            : null;
        return {
          kind: "homework",
          title: hw.title + " · " + hw.homework_id,
          subtitle: hw.status,
          rows: [
            {
              title: "对象",
              text: `${targetIds.length || hw.summary?.n_students || 0} 人`,
            },
            {
              title: "提交情况",
              text:
                hw.status === "generated"
                  ? "尚未发布，暂无提交要求。"
                  : actual
                    ? `已交 ${targetIds.length - missing!.length} 人，未交 ${missing!.length} 人。`
                    : simulation
                      ? "只有模拟作答报告，不能据此判断真实提交或催交名单。"
                      : "当前接口未提供真实提交记录，无法确定谁未交。",
            },
            ...(report
              ? [
                  {
                    title: simulation ? "演示报告（模拟）" : "作业报告",
                    text: JSON.stringify(report.overall),
                  },
                ]
              : []),
            ...(/催交/.test(m)
              ? [
                  {
                    title: "催交文案草稿（未发送）",
                    text: `请尚未提交《${hw.title}》的同学确认提交情况。${missing ? "待核对名单：" + missing.map((id: string) => hw.papers?.[id]?.name || id).join("、") : "老师需先核对实际记录。"}`,
                  },
                ]
              : []),
          ],
          actions: [
            {
              key: "open_homework",
              label: "查看作业",
              params: { homework_id: hw.homework_id },
            },
          ],
        };
      });
      return result("以下信息来自作业记录。", cards);
    }
    if (/教学反思|反思建议|复盘|这节课.{0,4}(问题|不足)|教学改进/.test(m)) {
      const sug = computeReflectionSuggestions(s.class_id || undefined);
      if (!sug.suggestions.length) {
        return result(
          "当前还没有可用于反思的批改证据。请先在「作业批改」完成复核，或下发作业/学案并等待回收，再来生成反思建议。",
          [],
          { auto_action: { key: "open_homework_flow", params: {} } },
        );
      }
      const cards = sug.suggestions.map((x: any, i: number) => ({
        kind: "cohort",
        title: "教学反思建议 · " + x.type,
        subtitle: x.title,
        rows: [
          ...x.evidence
            .slice(0, 3)
            .map((e: any) => ({ title: "证据 · " + e.title, text: e.text })),
          { title: "建议", text: x.advice },
        ],
        actions: [
          ...(x.actions || []),
          ...(i === 0
            ? [
                {
                  key: "open_teaching_reflection",
                  label: "打开教学反思页",
                  params: { class_id: s.class_id || "" },
                },
              ]
            : []),
        ],
      }));
      return result(
        `依据最近 ${sug.basis.length} 次下发的批改证据（抽样 ${sug.n_items_sampled} 题，复核口径：AI 初批 + 教师复核），整理出 ${sug.suggestions.length} 条反思建议。每条都附证据摘要；执行动作前请确认。`,
        cards,
      );
    }
    const compare =
      /对比|比较|这两|两个人|这几个/.test(m) &&
      (s.students.length > 1 || /比较|对比/.test(m));
    const lookup =
      !!resolved.matches?.length ||
      /学情|画像|成绩|薄弱|正确率|证据|为什么|原因|哪里|哪些|这名|这个学生|他|她|只看|换|近两周/.test(
        m,
      );
    if (compare || (lookup && s.students.length)) {
      if (compare && s.students.length < 2)
        return result("请再指定一位学生，我会用相同日期、来源和知识点比较。");
      const facts = s.students.map((x) => studentFacts(x, s.scope));
      const cards: any[] = [
        {
          kind: compare ? "comparison" : "student",
          title: compare ? "同口径学生对比" : "个人学情",
          subtitle: scopeLabel(s.scope),
          rows: facts.map((f) => ({
            title: f.name + " · " + f.display_id,
            text: studentText(f),
            action: profileAction(f, s.scope),
          })),
          prompts: ["只看上月", "只看近两周", "依据这些证据怎么辅导？"],
        },
      ];
      if (/证据|为什么|原因|薄弱|辅导/.test(m))
        cards.push({
          kind: "evidence",
          title: "作答依据",
          rows: facts.flatMap((f) =>
            f.evidence.map((e: any) => ({
              title: f.name + " · " + e.date + " · " + e.source,
              text: `${e.cluster} · ${e.correct ? "答对" : "答错"} · ${e.qid}\n${e.stem}`,
            })),
          ),
        });
      s.intent = compare ? "comparison" : "student";
      const teachingQuestion =
        /为什么|原因|怎么|如何|辅导|建议|解释|是否|是不是|分析/.test(m);
      return result(
        facts.map(studentText).join("\n\n") +
          "\n\n口径：观察正确率=答对明细数/可用明细数；少于3条不判定薄弱。" +
          (teachingQuestion
            ? "\n答错记录可以定位知识点，不能仅凭正确率推断粗心、态度或确切认知原因。建议先让学生复述解题步骤，再用同知识点变式验证。"
            : ""),
        cards,
        {
          needs_model: teachingQuestion,
          model_context: { scope: s.scope, facts },
          ...(/打开|跳转|进入|带我/.test(m) && facts.length === 1
            ? { auto_action: profileAction(facts[0], s.scope) }
            : {}),
        },
      );
    }
    if (
      (/班级学情|本班|全班|班学情/.test(m) ||
        (s.intent === "class" && /只看|来源|本月|上月|近/.test(m))) &&
      s.class_id
    ) {
      s.intent = "class";
      const facts = roster(s.class_id).map((x) => studentFacts(x, s.scope)),
        ev = facts.reduce((n, f) => n + f.n, 0);
      return result(
        `${fullClassName(s.class_id)}：${facts.length}名学生，${facts.filter((f) => f.n).length}人有当前范围作答，合计${ev}条明细。`,
        [
          {
            kind: "cohort",
            title: "班级学情",
            subtitle: scopeLabel(s.scope),
            rows: facts.map((f) => ({
              title: f.name,
              text: f.n ? `${f.n}条 · ${f.accuracy}%` : "无当前范围数据",
              action: profileAction(f, s.scope),
            })),
          },
        ],
        {
          needs_model: /怎么|如何|分析|建议/.test(m),
          model_context: { scope: s.scope, facts },
        },
      );
    }
    if (/注入|带入.{0,6}教学设计/.test(m)) {
      if (!s.class_id) return result("请先指定班级，再把学情带入教学设计。");
      return result("已准备好教学设计上下文。", [], {
        auto_action: {
          key: "inject_teaching_design",
          params: { class_id: s.class_id, assistant_draft: s.draftText },
        },
      });
    }
    if (
      /图谱|标签体系|怎么看图|掌握度/.test(m) &&
      /怎么|什么|解释|介绍|读/.test(m)
    )
      return result(
        "知识图谱中的节点代表知识点，连线表示先修或同素养关系。掌握图谱颜色反映当前学情，灰色表示无数据；能力等级 L1–L4 表示要求层次。题库还可以按核心素养、题型和来源筛选。当前日期范围无记录时不能据此判断学生不会。",
      );
    const node = topic ? explainNode(topic) : null,
      facts = s.students.map((x) => studentFacts(x, s.scope));
    return result(
      node
        ? `${node.summary}\n\n${node.teaching_tip}`
        : "我可以依据学生作答分析薄弱点，也可以解释数学知识、逐步解题、设计课堂提问和改写家长沟通稿。具体学情请提供学生姓名或班级；教学问题可以直接给出题目和困惑。",
      [],
      {
        needs_model: true,
        allow_interpret: true,
        source: "fallback",
        model_context: {
          scope: s.scope,
          facts,
          knowledge: node || null,
          previous_draft: s.draftText || null,
        },
      },
    );
  } catch (e: any) {
    return result(e?.message || "未能完成，请调整条件后重试。", [], {
      source: "clarification",
    });
  }
}
