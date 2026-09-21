import { useEffect, useState } from "react";
import { history } from "@umijs/max";
import {
  BulbOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  evaluationLessons,
  lessonScore,
} from "@/features/classroomEvaluation/demo";
import "./index.less";

/**
 * 首页总工作台：待办分模块——每张卡内嵌自己的待办与初级统计。
 * - 双大卡：学情分析 / 教学设计（核心模块，占满一整行）
 * - 四标准卡：作业 / 校本教研 / 课堂评价 / 资源平台
 * 数据：GET /api/teacher/workbench/summary（stats + 按模块分组 todos）
 */
type Todo = {
  id: string;
  level: "high" | "mid" | "low";
  text: string;
  to: string;
  suggestion?: boolean;
};

const MODULE_SUGGESTIONS: Record<string, Todo[]> = {
  homework: [
    {
      id: "s-review",
      level: "mid",
      text: "复核 AI 初批结果，关注得分异常的作答",
      to: "/homework?sub=grade",
      suggestion: true,
    },
    {
      id: "s-followup",
      level: "low",
      text: "查看回收进度，跟进尚未提交的学生",
      to: "/homework?sub=flow",
      suggestion: true,
    },
  ],
  research: [
    {
      id: "s-research",
      level: "low",
      text: "从近期教学反思中提炼一个共性问题",
      to: "/design/reflection",
      suggestion: true,
    },
    {
      id: "s-strategy",
      level: "low",
      text: "查阅备课组讨论，记录可复用的教学策略",
      to: "/school-research",
      suggestion: true,
    },
  ],
  evaluation: [
    {
      id: "s-evaluation",
      level: "mid",
      text: "复盘“勾股定理”示例课堂的提问与追问",
      to: "/classroom-evaluation?lesson=ce-001",
      suggestion: true,
    },
    {
      id: "s-participation",
      level: "low",
      text: "对照学生参与情况，选定一条下次课改进建议",
      to: "/classroom-evaluation?lesson=ce-005",
      suggestion: true,
    },
  ],
  source: [
    {
      id: "s-resources",
      level: "low",
      text: "围绕近期薄弱知识点，搭配练习与课件",
      to: "/source?tab=kgraph",
      suggestion: true,
    },
    {
      id: "s-tags",
      level: "low",
      text: "按题型和难度筛选一组分层练习",
      to: "/source?tab=public",
      suggestion: true,
    },
  ],
};

const TODO_DOT: Record<string, string> = {
  high: "#e05252",
  mid: "#e0913d",
  low: "#5c8ae0",
};

const CardTodos = ({
  todos,
  expanded = false,
}: {
  todos: Todo[];
  expanded?: boolean;
}) =>
  todos.length ? (
    <div className={"wb_todos" + (expanded ? " wb_todos--expanded" : "")}>
      {expanded && <span className="wb_todos_heading">待办与建议</span>}
      {todos.map((t) => (
        <button
          key={t.id}
          className="wb_todo_item"
          onClick={(ev) => {
            ev.stopPropagation();
            history.push(t.to);
          }}
        >
          {expanded ? (
            t.suggestion ? (
              <BulbOutlined />
            ) : (
              <CheckCircleOutlined />
            )
          ) : (
            <i
              className="wb_todo_dot"
              style={{ background: TODO_DOT[t.level] || TODO_DOT.low }}
            />
          )}
          {expanded && (
            <span className="wb_todo_kind">
              {t.suggestion ? "建议" : "待办"}
            </span>
          )}
          <span className="wb_todo_text">{t.text}</span>
          <RightOutlined className="wb_todo_go" />
        </button>
      ))}
    </div>
  ) : null;

const HERO_ENTRIES = [
  {
    key: "analysis",
    title: "学情分析",
    desc: "班级与个人画像统一：知识点 / 能力 / 素养 / 过程表现四维读数，每个结论可回溯证据。",
    subs: [
      { label: "班级学情", to: "/learning-analysis?tab=profile" },
      { label: "个人学情", to: "/learning-analysis?tab=personal" },
      { label: "知识图谱", to: "/learning-analysis?tab=kgraph" },
      { label: "作业分析", to: "/learning-analysis?tab=homework" },
    ],
    stats: [
      { key: "classes", label: "教学班" },
      { key: "students", label: "覆盖学生" },
      { key: "evidence_events", label: "学情证据" },
      { key: "weak_clusters", label: "待巩固知识点" },
    ],
  },
  {
    key: "design",
    title: "教学设计",
    desc: "以教案为主对象的一案到底设计：注入班级学情与教学目标，生成教案 / 学案，反思反哺下一轮。",
    subs: [
      { label: "课时设计", to: "/design" },
      { label: "单元设计", to: "/design" },
      { label: "教学反思", to: "/design/reflection" },
    ],
    stats: [
      { key: "plans", label: "历史教案" },
      { key: "study_plan_issues", label: "学案下发" },
      { key: "reflections", label: "反思记录" },
    ],
  },
];

const NORMAL_ENTRIES = [
  {
    key: "homework",
    statGroup: "homework",
    title: "作业",
    desc: "组卷 → 下发 → 回收 → 批改全流程：个性化每人一单、AI 初批 + 教师复核。",
    stats: [
      { key: "active", label: "回收中" },
      { key: "pending_review", label: "待复核" },
    ],
    subs: [
      { label: "作业组卷", to: "/homework?sub=compose" },
      { label: "作业下发", to: "/homework?sub=assign" },
      { label: "下发与回收", to: "/homework?sub=flow" },
      { label: "作业批改", to: "/homework?sub=grade" },
    ],
    to: "/homework",
  },
  {
    key: "research",
    statGroup: "research",
    title: "校本教研",
    desc: "从班级共性问题和教学反思沉淀教研议题，形成可复用策略并引用到教案。",
    stats: [
      { key: "discussing", label: "讨论中" },
      { key: "topics", label: "议题总数" },
    ],
    subs: [
      { label: "教研议题", to: "/school-research" },
      { label: "发起讨论", to: "/school-research" },
    ],
    to: "/school-research",
  },
  {
    key: "evaluation",
    statGroup: "evaluation",
    title: "课堂评价",
    desc: "课堂观察、师生对话与提问分析，结合评价依据形成教学改进建议。",
    stats: [
      { key: "lessons", label: "示例课堂" },
      { key: "average", label: "示例均分" },
    ],
    subs: [
      { label: "全部课堂", to: "/classroom-evaluation" },
      { label: "评价报告", to: "/classroom-evaluation?lesson=ce-001" },
      { label: "我的收藏", to: "/classroom-evaluation?view=favorites" },
    ],
    to: "/classroom-evaluation",
  },
  {
    key: "source",
    statGroup: "source",
    title: "资源平台",
    desc: "公共 / 个人题库（能力素养双维、知识图谱筛选）、历史教案、课件。",
    stats: [
      { key: "public_questions", label: "公共题库" },
      { key: "bank_total", label: "个人题库" },
      { key: "plans", label: "教案" },
      { key: "courseware", label: "课件" },
    ],
    subs: [
      { label: "公共题库", to: "/source" },
      { label: "教案资源", to: "/source?tab=lesson-plans" },
      { label: "知识图谱", to: "/source?tab=kgraph" },
    ],
    to: "/source",
  },
];

const WorkbenchNav = () => {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const j = (r: any) => r.json();
    fetch("/api/teacher/workbench/summary")
      .then(j)
      .then((d: any) => {
        if (d.code === 200) setSummary(d.data);
      })
      .catch(() => {});
  }, []);

  const statOf = (group: string, key: string) => {
    if (group === "evaluation") {
      return key === "lessons"
        ? evaluationLessons.length
        : Math.round(
            evaluationLessons.reduce(
              (sum, lesson) => sum + lessonScore(lesson),
              0,
            ) / evaluationLessons.length,
          );
    }
    return summary?.[group]?.[key];
  };
  const todosOf = (key: string): Todo[] => {
    const tasks = Array.isArray(summary?.todos?.[key])
      ? summary.todos[key]
      : [];
    return [
      ...tasks,
      ...(MODULE_SUGGESTIONS[key] || []).slice(
        0,
        Math.max(0, 2 - tasks.length),
      ),
    ];
  };

  return (
    <section className="wb_nav">
      <div className="wb_nav_head">
        <span className="wb_nav_title">功能工作台</span>
        <span className="wb_nav_hint">
          学情 · 设计 · 作业 · 教研 · 评价 · 资源
        </span>
      </div>

      {/* 双大卡：学情分析 / 教学设计 */}
      <div className="wb_hero_row">
        {HERO_ENTRIES.map((e) => (
          <div
            key={e.key}
            className="wb_hero_card"
            onClick={() => history.push(e.subs[0].to)}
          >
            <div className="wb_hero_head">
              <span className="wb_hero_title">{e.title}</span>
              <span className="wb_hero_enter">
                进入 <RightOutlined />
              </span>
            </div>
            <div className="wb_hero_desc">{e.desc}</div>
            <div className="wb_hero_stats">
              {e.stats.map((s) => (
                <div key={s.key} className="wb_stat">
                  <b className="wb_stat_num">{statOf(e.key, s.key) ?? "—"}</b>
                  <span className="wb_stat_label">{s.label}</span>
                </div>
              ))}
            </div>
            <CardTodos todos={todosOf(e.key)} />
            <div className="wb_hero_subs">
              {e.subs.map((s) => (
                <span
                  key={s.label}
                  className="wb_nav_sub"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    history.push(s.to);
                  }}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 四标准卡：作业 / 校本教研 / 课堂评价 / 资源平台 */}
      <div className="wb_nav_grid">
        {NORMAL_ENTRIES.map((e) => (
          <div
            key={e.key}
            className="wb_nav_card"
            onClick={() => history.push(e.to)}
          >
            <div className="wb_nav_card_head">
              <span className="wb_nav_card_title">{e.title}</span>
              <span className="wb_nav_card_enter">
                进入 <RightOutlined />
              </span>
            </div>
            <div className="wb_nav_card_desc">{e.desc}</div>
            {e.stats.length > 0 && (
              <div className="wb_card_stats">
                {e.stats.map((s) => (
                  <span key={s.key} className="wb_card_stat">
                    <b>{statOf(e.statGroup, s.key) ?? "—"}</b> {s.label}
                  </span>
                ))}
              </div>
            )}
            <CardTodos todos={todosOf(e.key)} expanded />
            <div className="wb_nav_card_subs">
              {e.subs.map((s) => (
                <span
                  key={s.label}
                  className="wb_nav_sub"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    history.push(s.to);
                  }}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkbenchNav;
