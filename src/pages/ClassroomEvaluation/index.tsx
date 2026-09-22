import { useEffect, useRef, useState } from "react";
import { history, useLocation } from "@umijs/max";
import {
  Button,
  Empty,
  Input,
  Progress,
  Select,
  Tabs,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  AuditOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  DownloadOutlined,
  FileTextOutlined,
  ReloadOutlined,
  RobotOutlined,
  SearchOutlined,
  SendOutlined,
  StarFilled,
  StarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import ClassroomEvidence from "@/features/teachingSupport/ClassroomEvidence";
import {
  evaluationLessons,
  lessonStages,
  type EvaluationLesson,
} from "@/features/classroomEvaluation/demo";
import "./index.less";

const FAVORITES_KEY = "classroom-evaluation:demo-favorites";
const subjectColor: Record<string, string> = {
  数学: "blue",
  物理: "cyan",
  语文: "purple",
};

function readFavorites(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(saved)
      ? saved.filter((id) =>
          evaluationLessons.some((lesson) => lesson.id === id),
        )
      : [];
  } catch {
    return [];
  }
}

function FavoriteButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  const label = active ? "取消收藏" : "收藏课堂";
  return (
    <Tooltip title={label}>
      <Button
        type="text"
        aria-label={label}
        aria-pressed={active}
        className={active ? "ce-favorite-active" : ""}
        icon={active ? <StarFilled /> : <StarOutlined />}
        onClick={onClick}
      />
    </Tooltip>
  );
}

function exportReport(lesson: EvaluationLesson) {
  const content = [
    `# ${lesson.title} · 课堂评价报告`,
    "本报告依据课堂记录整理，评价结论待教师复核。",
    `${lesson.teacher} | ${lesson.className} | ${lesson.subject} | ${lesson.date} | 40分钟`,
    "## 课堂概览",
    lesson.focus,
    "评价状态：学科任务与量规待专家审核，不输出综合评分。行为统计仅为过程描述。",
    `学生参与率：${lesson.participation}% | 课堂提问：${lesson.questions}次 | 开放性提问：${lesson.openQuestions}次 | 学生发言时长占比：${lesson.studentTalk}%`,
    "## 教学环节与评价依据",
    ...lessonStages(lesson).flatMap((stage) => [
      `### ${stage.time} - ${stage.end} ${stage.name}`,
      stage.evidence,
      `改进建议：${stage.advice}`,
    ]),
    "## 课堂对话节选",
    `教师：${lesson.question}`,
    `学生：${lesson.answer}`,
    `教师追问：${lesson.followup}`,
    "## 下次课改进",
    lesson.suggestion,
  ].join("\n\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", content], { type: "text/markdown;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${lesson.title}-课堂评价（示例）.md`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function CourseAssistant({
  lesson,
  stageIndex,
}: {
  lesson: EvaluationLesson;
  stageIndex: number;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const log = useRef<HTMLDivElement>(null);
  const stage = lessonStages(lesson)[stageIndex];
  useEffect(() => {
    log.current?.scrollTo({
      top: log.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);
  const send = (question: string) => {
    const value = question.trim();
    if (!value) return;
    let answer: string;
    if (/参与|发言|状态/.test(value)) {
      answer = `这节课堂的学生参与率为 ${lesson.participation}%，学生发言时长占比为 ${lesson.studentTalk}%。${lesson.observation} 建议通过独立作答与小组汇报，进一步确认每位学生的理解情况。`;
    } else if (/提问|追问/.test(value)) {
      answer = `课堂共记录 ${lesson.questions} 次提问，其中 ${lesson.openQuestions} 次为开放性提问。关键追问是：“${lesson.followup}” 这一追问把学生的回答推进到条件辨析或证据解释。`;
    } else if (/建议|改进|调整|重上/.test(value)) {
      answer = `${stage.name}（${stage.time} - ${stage.end}）的改进建议：${stage.advice} 下次课可同时记录独立作答与解释的完成情况，再判断调整是否有效。`;
    } else {
      answer = `当前环节：${stage.name}（${stage.time} - ${stage.end}）。${stage.evidence} 本节课的核心任务是：${lesson.focus}`;
    }
    setMessages((items) => [
      ...items,
      { role: "user", text: value },
      { role: "assistant", text: answer },
    ]);
    setInput("");
  };
  return (
    <aside className="ce-assistant" aria-label="AI评课助手">
      <header>
        <RobotOutlined />
        <h2>AI 评课助手</h2>
        <Tag>示例问答</Tag>
      </header>
      <div className="ce-assistant-context">
        <ClockCircleOutlined /> {stage.time} · {stage.name}
      </div>
      <div ref={log} className="ce-chat-log" role="log" aria-live="polite">
        {!messages.length && (
          <div className="ce-chat-welcome">
            <span className="ce-assistant-symbol">
              <CommentOutlined />
            </span>
            <h3>这堂课，哪些地方值得复盘？</h3>
            <p>{lesson.title}</p>
          </div>
        )}
        {messages.map((item, index) => (
          <div
            key={index}
            className={`ce-chat-message ce-chat-message--${item.role}`}
          >
            <span>{item.role === "user" ? "我" : "助手 · 示例解读"}</span>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
      <div className="ce-quick-questions">
        {[
          "当前环节有哪些课堂证据？",
          "课堂提问的质量如何？",
          "这节课可以怎样改进？",
        ].map((question) => (
          <button
            key={question}
            aria-label={question}
            onClick={() => send(question)}
          >
            {question}
            <ArrowRightOutlined />
          </button>
        ))}
      </div>
      <form
        className="ce-chat-form"
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
      >
        <Input.TextArea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={500}
          placeholder="关于这节课，我想了解……"
          aria-label="评课问题"
          autoSize={{ minRows: 2, maxRows: 4 }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              send(input);
            }
          }}
        />
        <div>
          <span>基于课堂记录</span>
          <Tooltip title="发送问题">
            <Button
              htmlType="submit"
              type="primary"
              aria-label="发送评课问题"
              icon={<SendOutlined />}
              disabled={!input.trim()}
            />
          </Tooltip>
        </div>
      </form>
    </aside>
  );
}

function LessonDetail({
  lesson,
  favorite,
  onFavorite,
  onBack,
}: {
  lesson: EvaluationLesson;
  favorite: boolean;
  onFavorite: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState("report");
  const [stageIndex, setStageIndex] = useState(2);
  const stages = lessonStages(lesson);
  const stage = stages[stageIndex];
  const showStage = (index: number) => {
    setStageIndex(index);
    setTab("stages");
  };
  return (
    <>
      <div className="ce-detail-toolbar">
        <Button
          type="text"
          aria-label="返回课堂列表"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
        >
          返回课堂列表
        </Button>
        <div>
          <FavoriteButton active={favorite} onClick={onFavorite} />
          <Button
            icon={<DownloadOutlined />}
            aria-label="导出报告"
            onClick={() => exportReport(lesson)}
          >
            导出报告
          </Button>
        </div>
      </div>
      <header className="ce-detail-heading">
        <div className="ce-title-line">
          <h1>{lesson.title}</h1>
          <Tag color="blue">课堂报告</Tag>
        </div>
        <p>
          {lesson.teacher}
          <span>{lesson.className}</span>
          <span>{lesson.subject}</span>
          <span>{lesson.date}</span>
          <span>
            <ClockCircleOutlined /> 40 分钟
          </span>
        </p>
      </header>
      <div className="ce-detail-layout">
        <div className="ce-report-main">
          <div className="ce-report-metrics">
            <div>
              <span>评价状态</span>
              <strong>
                <small>量规待审</small>
              </strong>
            </div>
            <div>
              <span>学生参与率</span>
              <strong>
                {lesson.participation}
                <small>%</small>
              </strong>
            </div>
            <div>
              <span>课堂提问</span>
              <strong>
                {lesson.questions}
                <small> 次</small>
              </strong>
            </div>
            <div>
              <span>学生发言占比</span>
              <strong>
                {lesson.studentTalk}
                <small>%</small>
              </strong>
            </div>
          </div>
          <Tabs
            activeKey={tab}
            onChange={setTab}
            items={[
              {
                key: "report",
                label: "评价报告",
                children: (
                  <>
                    <section className="ce-section">
                      <h2>课堂概览</h2>
                      <p>{lesson.focus}</p>
                      <ClassroomEvidence lesson={lesson} />
                    </section>
                    <section className="ce-section">
                      <div className="ce-section-heading">
                        <h2>课堂节奏</h2>
                        <span>40 分钟</span>
                      </div>
                      <div className="ce-rhythm" aria-label="课堂环节时长">
                        {stages.map((item, index) => (
                          <Tooltip
                            key={item.name}
                            title={`${item.name} · ${item.time} - ${item.end}`}
                          >
                            <button
                              style={{
                                flex: item.minutes,
                                background: item.color,
                              }}
                              aria-label={`查看${item.name}`}
                              onClick={() => showStage(index)}
                            >
                              {item.minutes}′
                            </button>
                          </Tooltip>
                        ))}
                      </div>
                      <div className="ce-rhythm-legend">
                        {stages.map((item) => (
                          <span key={item.name}>
                            <i style={{ background: item.color }} />
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </section>
                    <section className="ce-section">
                      <h2>评价依据与建议</h2>
                      <div className="ce-observation">
                        <CheckCircleOutlined />
                        <div>
                          <h3>课堂观察</h3>
                          <p>{lesson.observation}</p>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => showStage(2)}
                          >
                            查看 15:00 课堂记录 <ArrowRightOutlined />
                          </Button>
                        </div>
                      </div>
                      <div className="ce-observation ce-observation--advice">
                        <FileTextOutlined />
                        <div>
                          <h3>下次课改进</h3>
                          <p>{lesson.suggestion}</p>
                        </div>
                      </div>
                    </section>
                  </>
                ),
              },
              {
                key: "dialogue",
                label: "课堂对话",
                children: (
                  <section className="ce-section">
                    <div className="ce-section-heading">
                      <h2>师生对话节选</h2>
                      <Tag>示例记录</Tag>
                    </div>
                    {[
                      { time: "05:00", role: "教师", text: lesson.question },
                      { time: "15:00", role: "学生", text: lesson.answer },
                      { time: "15:40", role: "教师", text: lesson.followup },
                      {
                        time: "36:00",
                        role: "教师",
                        text: `今天的学习目标是：${lesson.focus} 请写下一条收获和一个仍有疑问的地方。`,
                      },
                    ].map((item, index) => (
                      <article className="ce-dialogue" key={item.time}>
                        <Button
                          type="link"
                          onClick={() => showStage([1, 2, 2, 4][index])}
                        >
                          {item.time}
                        </Button>
                        <div>
                          <Tag color={item.role === "学生" ? "cyan" : "blue"}>
                            {item.role}
                          </Tag>
                          <p>{item.text}</p>
                        </div>
                      </article>
                    ))}
                  </section>
                ),
              },
              {
                key: "questions",
                label: "课堂提问",
                children: (
                  <section className="ce-section">
                    <h2>提问结构</h2>
                    <div className="ce-question-summary">
                      <CommentOutlined />
                      <span>
                        共 <b>{lesson.questions}</b> 次提问，其中开放性提问{" "}
                        <b>{lesson.openQuestions}</b> 次，占比{" "}
                        <b>
                          {Math.round(
                            (lesson.openQuestions / lesson.questions) * 100,
                          )}
                          %
                        </b>
                      </span>
                    </div>
                    <Progress
                      percent={Math.round(
                        (lesson.openQuestions / lesson.questions) * 100,
                      )}
                      showInfo={false}
                      strokeColor="#20a39e"
                    />
                    {[
                      {
                        title: "观察与解释",
                        question: lesson.question,
                        advice: "从现象出发，让学生表达初步判断并给出解释。",
                        stage: 1,
                      },
                      {
                        title: "辨析与迁移",
                        question: lesson.followup,
                        advice:
                          "改变条件或表达方式，检验学生能否说明依据并迁移理解。",
                        stage: 2,
                      },
                    ].map((item) => (
                      <article className="ce-question" key={item.title}>
                        <Tag color="cyan">{item.title}</Tag>
                        <h3>{item.question}</h3>
                        <p>{item.advice}</p>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => showStage(item.stage)}
                        >
                          查看课堂依据 <ArrowRightOutlined />
                        </Button>
                      </article>
                    ))}
                  </section>
                ),
              },
              {
                key: "stages",
                label: "教学环节",
                children: (
                  <section className="ce-section">
                    <h2>课堂过程</h2>
                    <div
                      className="ce-stage-tabs"
                      role="group"
                      aria-label="教学环节"
                    >
                      {stages.map((item, index) => (
                        <button
                          className={index === stageIndex ? "is-active" : ""}
                          key={item.name}
                          aria-pressed={index === stageIndex}
                          onClick={() => setStageIndex(index)}
                        >
                          <span>{item.time}</span>
                          <b>{item.name}</b>
                          <small>{item.minutes} 分钟</small>
                        </button>
                      ))}
                    </div>
                    <div className="ce-stage-detail">
                      <Tag color="blue">
                        {stage.time} - {stage.end}
                      </Tag>
                      <h3>{stage.name}</h3>
                      <h4>课堂证据</h4>
                      <p>{stage.evidence}</p>
                      <h4>改进建议</h4>
                      <p>{stage.advice}</p>
                    </div>
                  </section>
                ),
              },
            ]}
          />
        </div>
        <CourseAssistant lesson={lesson} stageIndex={stageIndex} />
      </div>
    </>
  );
}

export default function ClassroomEvaluation() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const lessonId = params.get("lesson");
  const view = params.get("view") === "favorites" ? "favorites" : "all";
  const [favorites, setFavorites] = useState(readFavorites);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<string>();
  const [grade, setGrade] = useState<string>();
  const [sort, setSort] = useState("newest");
  const navigate = (patch: Record<string, string | null>) => {
    const query = new URLSearchParams(location.search);
    Object.entries(patch).forEach(([key, value]) =>
      value ? query.set(key, value) : query.delete(key),
    );
    history.push({
      pathname: "/classroom-evaluation",
      search: query.toString() ? `?${query}` : "",
    });
  };
  const toggleFavorite = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((value) => value !== id)
      : [...favorites, id];
    setFavorites(next);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      message.info("收藏已更新，本次浏览期间有效");
    }
  };
  const selectedLesson = evaluationLessons.find(
    (lesson) => lesson.id === lessonId,
  );
  const filtered = evaluationLessons
    .filter(
      (lesson) =>
        (view !== "favorites" || favorites.includes(lesson.id)) &&
        (!subject || lesson.subject === subject) &&
        (!grade || lesson.grade === grade) &&
        `${lesson.title} ${lesson.teacher} ${lesson.className}`.includes(
          search.trim(),
        ),
    )
    .sort((a, b) =>
      sort === "subject"
        ? a.subject.localeCompare(b.subject, "zh-CN")
        : b.date.localeCompare(a.date),
    );
  const average = (value: (lesson: EvaluationLesson) => number) =>
    Math.round(
      evaluationLessons.reduce((sum, lesson) => sum + value(lesson), 0) /
        evaluationLessons.length,
    );

  return (
    <main className="classroom-evaluation">
      {lessonId ? (
        selectedLesson ? (
          <LessonDetail
            key={selectedLesson.id}
            lesson={selectedLesson}
            favorite={favorites.includes(selectedLesson.id)}
            onFavorite={() => toggleFavorite(selectedLesson.id)}
            onBack={() => navigate({ lesson: null })}
          />
        ) : (
          <Empty description="未找到这节课堂">
            <Button onClick={() => navigate({ lesson: null })}>
              返回课堂列表
            </Button>
          </Empty>
        )
      ) : (
        <>
          <header className="ce-page-heading">
            <div>
              <div className="ce-title-line">
                <AuditOutlined />
                <h1>课堂评价</h1>
                
              </div>
              <p>课堂观察与教学复盘</p>
            </div>
            <span className="ce-heading-meta">
              <CheckCircleOutlined /> {evaluationLessons.length} 份课堂报告
            </span>
          </header>
          <div className="ce-summary" aria-label="课堂记录统计">
            <div>
              <BookOutlined />
              <span>
                课堂观察记录
                <strong>
                  {evaluationLessons.length}
                  <small> 节</small>
                </strong>
              </span>
            </div>
            <div>
              <AuditOutlined />
              <span>
                待审核量规
                <strong>
                  {evaluationLessons.length}
                  <small> 节课</small>
                </strong>
              </span>
            </div>
            <div>
              <TeamOutlined />
              <span>
                平均学生参与率
                <strong>
                  {average((lesson) => lesson.participation)}
                  <small>%</small>
                </strong>
              </span>
            </div>
            <div>
              <StarOutlined />
              <span>
                我的收藏
                <strong>
                  {favorites.length}
                  <small> 节</small>
                </strong>
              </span>
            </div>
          </div>
          <Tabs
            activeKey={view}
            onChange={(value) =>
              navigate({ view: value === "all" ? null : value })
            }
            items={[
              { key: "all", label: `全部课堂（${evaluationLessons.length}）` },
              { key: "favorites", label: `我的收藏（${favorites.length}）` },
            ]}
          />
          <div className="ce-filters">
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索课程名称、教师或班级"
              aria-label="搜索课堂"
              allowClear
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select
              aria-label="评价学科"
              placeholder="全部学科"
              allowClear
              value={subject}
              onChange={setSubject}
              options={[
                ...new Set(evaluationLessons.map((lesson) => lesson.subject)),
              ].map((value) => ({ value, label: value }))}
            />
            <Select
              aria-label="评价年级"
              placeholder="全部年级"
              allowClear
              value={grade}
              onChange={setGrade}
              options={["七年级", "八年级"].map((value) => ({
                value,
                label: value,
              }))}
            />
            <Select
              aria-label="课堂排序"
              value={sort}
              onChange={setSort}
              options={[
                { value: "newest", label: "最近授课" },
                { value: "subject", label: "按学科" },
              ]}
            />
            <Tooltip title="重置筛选">
              <Button
                aria-label="重置课堂筛选"
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearch("");
                  setSubject(undefined);
                  setGrade(undefined);
                  setSort("newest");
                }}
              />
            </Tooltip>
            <span className="ce-result-count">共 {filtered.length} 节课堂</span>
          </div>
          {filtered.length ? (
            <div className="ce-lesson-grid">
              {filtered.map((lesson) => (
                <article key={lesson.id} className="ce-lesson">
                  <div className="ce-lesson-top">
                    <span
                      className={`ce-subject-icon ce-subject-icon--${subjectColor[lesson.subject]}`}
                    >
                      <BookOutlined />
                    </span>
                    <Tag color={subjectColor[lesson.subject]}>
                      {lesson.subject} · {lesson.grade}
                    </Tag>
                    <span className="ce-completed">
                      <AuditOutlined /> 待复核
                    </span>
                  </div>
                  <button
                    className="ce-lesson-title"
                    onClick={() => navigate({ lesson: lesson.id })}
                  >
                    {lesson.title}
                  </button>
                  <p className="ce-lesson-meta">
                    {lesson.teacher}
                    <span>{lesson.className}</span>
                  </p>
                  <div className="ce-lesson-score">
                    <div>
                      <span>评价依据</span>
                      <strong>
                        <small>待审核</small>
                      </strong>
                    </div>
                    <div className="ce-lesson-indicators">
                      <span>
                        学生参与 <b>{lesson.participation}%</b>
                      </span>
                      <Progress
                        percent={lesson.participation}
                        showInfo={false}
                        strokeColor="#20a39e"
                        size="small"
                      />
                      <span>
                        课堂提问 <b>{lesson.questions} 次</b>
                      </span>
                    </div>
                  </div>
                  <p className="ce-lesson-focus">{lesson.focus}</p>
                  <div className="ce-lesson-date">
                    <span>{lesson.date}</span>
                    <span>
                      <ClockCircleOutlined /> 40 分钟
                    </span>
                  </div>
                  <footer>
                    <Button
                      type="link"
                      onClick={() => navigate({ lesson: lesson.id })}
                    >
                      查看评价 <ArrowRightOutlined />
                    </Button>
                    <FavoriteButton
                      active={favorites.includes(lesson.id)}
                      onClick={() => toggleFavorite(lesson.id)}
                    />
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <Empty
              className="ce-empty"
              description={
                view === "favorites" && !favorites.length
                  ? "暂无收藏课堂"
                  : "没有匹配的课堂"
              }
            />
          )}
        </>
      )}
    </main>
  );
}
