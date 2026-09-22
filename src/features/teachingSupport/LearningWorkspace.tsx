import { useEffect, useState } from "react";
import { useDispatch, useLocation, history } from "@umijs/max";
import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  Empty,
  Pagination,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  TreeSelect,
} from "antd";
import {
  BookOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  UploadOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  ReadOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import LearningContent from "@/components/LearningContent";
import DatePresetGroup from "@/pages/TeacherProfile/components/DatePresetGroup";
import ScopedPortraitOverview, {
  ScopedKnowledgeGraph,
} from "./ScopedPortraitOverview";
import ImportModal from "@/pages/TeacherProfile/components/ImportModal";
import { replacePageQuery } from "@/utils/pageQuery";
import { CurriculumScope, useSupport } from "./services";
import { LoadState, STATES } from "./ui";
import "./style.less";

export const SOURCES: Record<string, string> = {
  homework: "作业记录",
  exam: "考试记录",
  classroom: "课堂互动",
  ai_tutor: "人机交互",
  practice: "自主练习",
};
const a = (v: any): any[] => (Array.isArray(v) ? v : []);
export function EvidenceDrawer({
  scope,
  filter,
  onClose,
}: {
  scope: CurriculumScope;
  filter: any;
  onClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const read = useSupport(
    "evidence",
    { ...scope, node_id: filter?.node_id || "", ids: filter?.ids || "", page },
    !!filter,
  );
  useEffect(() => setPage(1), [JSON.stringify(scope), JSON.stringify(filter)]);
  return (
    <Drawer
      title={filter?.title || "任务证据"}
      width={620}
      open={!!filter}
      onClose={onClose}
    >
      <LoadState read={read} />
      {read.data && (
        <>
          <p className="ts-muted">
            {read.data.effective_scope.label} · {read.data.total} 条记录
          </p>
          {a(read.data.items).length ? (
            a(read.data.items).map((e) => (
              <article className="ts-evidence" key={e.evidence_id}>
                <Space wrap>
                  <Tag>{SOURCES[e.source_type]}</Tag>
                  <strong>{e.student_name}</strong>
                  <span className="ts-muted">
                    {dayjs(e.occurred_at).format("YYYY-MM-DD HH:mm")}
                  </span>
                </Space>
                <h4>{e.source_name}</h4>
                <LearningContent>
                  {e.question_stem || e.task_description || "任务题干待补充"}
                </LearningContent>
                <blockquote>
                  <LearningContent>
                    {e.answer_summary || "作答过程未采集"}
                  </LearningContent>
                </blockquote>
                <small className="ts-muted">
                  {e.evidence_id} ·{" "}
                  {e.mapping_status === "chapter_only"
                    ? "仅章级归属"
                    : "任务观察记录"}
                </small>
              </article>
            ))
          ) : (
            <Empty description="当前范围没有匹配证据" />
          )}
          <Pagination
            current={page}
            pageSize={8}
            total={read.data.total}
            onChange={setPage}
            showSizeChanger={false}
            size="small"
          />
        </>
      )}
    </Drawer>
  );
}
export function CurriculumReference({ meta }: { meta: any }) {
  const [subject, setSubject] = useState("math"),
    [stage, setStage] = useState("junior");
  const item = a(meta?.subject_references).find(
    (s) => s.subject_id === subject,
  );
  return (
    <div className="ts-reference">
      <Space wrap>
        <Select
          aria-label="课标学科"
          value={subject}
          onChange={setSubject}
          options={a(meta?.subject_references).map((s) => ({
            value: s.subject_id,
            label: s.name,
          }))}
        />
        <Select
          aria-label="课标学段"
          value={stage}
          onChange={setStage}
          options={[
            { value: "junior", label: "义教 · 初中" },
            { value: "senior", label: "高中" },
          ]}
        />
      </Space>
      <h3>
        {item?.name} · 核心素养
        {subject === "math" && stage === "junior" ? "主要表现" : ""}
      </h3>
      <div className="ts-tags">
        {a(item?.[stage]).map((c) => (
          <Tag key={c} color="blue">
            {c}
          </Tag>
        ))}
      </div>
      {subject === "math" && stage === "junior" && (
        <p>
          会用数学的眼光观察、思维思考、语言表达现实世界。九项表现不是九个由正确率换算的分数。
        </p>
      )}
      <p className="ts-muted">
        依据已提供的层次化 Markdown 摘录。文件自标版本：义教 2022 年版 2025
        年修订 / 高中 2017 年版 2025 年修订；未对照原 PDF 核验。
      </p>
      <Alert
        showIcon
        type="info"
        message="课标对应与学生评价分开审核"
        description="有课程对应关系，不等于学生已达成该素养。其他学科目录与评分量规尚未接入。"
      />
    </div>
  );
}

export default function LearningWorkspace({
  classId,
  mode = "profile",
}: {
  classId: string;
  mode?: string;
}) {
  const location = useLocation(),
    dispatch = useDispatch(),
    q = new URLSearchParams(location.search);
  const metaRead = useSupport("catalog", { class_id: classId }, !!classId),
    meta = metaRead.data;
  const people = a(meta?.students),
    books = a(meta?.textbooks);
  const studentId =
    mode === "personal"
      ? q.get("student_id") || people[0]?.student_id || ""
      : "";
  const bookId = q.get("textbook_id") || books[0]?.textbook_id || "";
  const book = books.find((b) => b.textbook_id === bookId);
  const sourceValue = q.has("sources")
    ? q.get("sources")!
    : Object.keys(SOURCES).join(",");
  const sources =
    sourceValue === "none"
      ? []
      : sourceValue
          .split(",")
          .filter(Boolean)
          .map((s) => Object.keys(SOURCES).find((k) => SOURCES[k] === s) || s);
  const scope: CurriculumScope = {
    class_id: classId,
    student_id: studentId,
    subject_id: book?.subject_id || "math",
    textbook_id: bookId,
    curriculum_scope_type: (q.get("curriculum_scope_type") || "all") as any,
    curriculum_scope_id: q.get("curriculum_scope_id") || "",
    start_date: q.get("start_date") || "",
    end_date: q.get("end_date") || "",
    sources: sources.sort().join(","),
    dataset_version: meta?.dataset_version,
    framework_version: meta?.framework_version,
  };
  const read = useSupport(
      "profile",
      scope,
      !!meta && !!bookId && !!classId && (mode !== "personal" || !!studentId),
    ),
    data = read.data;
  const [evidence, setEvidence] = useState<any>(null),
    [indicator, setIndicator] = useState<any>(null);
  const [referenceOpen, setReferenceOpen] = useState(false),
    [importOpen, setImportOpen] = useState(false);
  const [view, setView] = useState("knowledge");
  useEffect(() => {
    if (mode === "personal" && studentId && !q.get("student_id"))
      replacePageQuery({ student_id: studentId });
  }, [mode, studentId, location.search]);
  useEffect(() => {
    setEvidence(null);
    setIndicator(null);
  }, [JSON.stringify(scope)]);
  useEffect(() => {
    if (!data) return;
    dispatch({
      type: "assistantModel/setPageContext",
      payload: {
        route: "/learning-analysis",
        title: "学情画像",
        summary: `${data.effective_scope.label}；${data.coverage.events} 条有效记录；覆盖 ${data.coverage.students}/${data.coverage.total_students} 名学生；任务得分率不代表素养等级。`,
        data: {
          ...scope,
          ...(mode === "kgraph" ? { graphKind: "evidence" } : {}),
          evaluation_status: "evidence_based_pending_review",
        },
      },
    });
    return () => {
      dispatch({ type: "assistantModel/setPageContext", payload: null });
    };
  }, [data, mode]);
  const tree = [
    { value: "all:", title: "全部章节" },
    {
      value: "units",
      title: "教学单元",
      selectable: false,
      children: a(meta?.units)
        .filter((u) => u.textbook_id === bookId)
        .map((u) => ({ value: `unit:${u.unit_id}`, title: u.title })),
    },
    ...a(book?.chapters).map((c) => ({
      value: `chapter:${c.chapter_id}`,
      title: `${c.no} ${c.title}`,
      children: a(c.sections).map((s) => ({
        value: `section:${s.section_id}`,
        title: `${s.no} ${s.title}`,
      })),
    })),
  ];
  const reset = () =>
    replacePageQuery({
      textbook_id: null,
      curriculum_scope_type: null,
      curriculum_scope_id: null,
      start_date: null,
      end_date: null,
      sources: null,
    });
  const dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [
    scope.start_date ? dayjs(scope.start_date) : null,
    scope.end_date ? dayjs(scope.end_date) : null,
  ];
  const changeDates = (v: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) =>
    replacePageQuery({
      start_date: v?.[0]?.format("YYYY-MM-DD") || null,
      end_date: v?.[1]?.format("YYYY-MM-DD") || null,
    });
  if (!classId) return <Empty description="请选择班级" />;
  return (
    <div className="teaching-support ts-learning">
      <LoadState read={metaRead} />
      {meta && (
        <>
          <div className="ts-filterbar portrait-filterbar">
            <label className="portrait-date-filter">
              记录时间
              <div className="portrait-date-controls">
                <DatePresetGroup value={dateRange} onChange={changeDates} />
                <DatePicker.RangePicker
                  aria-label="学情记录时间"
                  value={dateRange}
                  allowClear
                  placeholder={["开始日期（可选）", "结束日期（可选）"]}
                  onChange={changeDates}
                />
              </div>
            </label>
            <label>
              教材
              <Select
                aria-label="学情教材"
                value={bookId || undefined}
                onChange={(v) =>
                  replacePageQuery({
                    textbook_id: v,
                    curriculum_scope_type: null,
                    curriculum_scope_id: null,
                  })
                }
                options={books.map((b) => ({
                  value: b.textbook_id,
                  label: b.name,
                }))}
              />
            </label>
            <label>
              章节 / 单元（可选）
              <TreeSelect
                aria-label="课程范围"
                allowClear
                placeholder="全部章节"
                treeDefaultExpandAll
                value={
                  scope.curriculum_scope_type === "all"
                    ? undefined
                    : `${scope.curriculum_scope_type}:${scope.curriculum_scope_id}`
                }
                treeData={tree}
                onChange={(v) => {
                  const [type, id] = (v || "all:").split(":");
                  replacePageQuery({
                    curriculum_scope_type: type === "all" ? null : type,
                    curriculum_scope_id: id || null,
                  });
                }}
              />
            </label>
            {mode === "personal" && (
              <label>
                学生
                <Select
                  aria-label="学情学生"
                  showSearch
                  optionFilterProp="label"
                  value={studentId || undefined}
                  options={people.map((p) => ({
                    value: p.student_id,
                    label: `${p.name} · ${p.display_id}`,
                  }))}
                  onChange={(v) => replacePageQuery({ student_id: v })}
                />
              </label>
            )}
            <Tooltip title="重置筛选">
              <Button
                icon={<ReloadOutlined />}
                aria-label="重置学情筛选"
                onClick={reset}
              />
            </Tooltip>
          </div>
          <div className="portrait-active-filters">
            <Tag
              data-testid="portrait-date-scope"
              closable={!!(scope.start_date || scope.end_date)}
              onClose={(event) => {
                event.preventDefault();
                changeDates(null);
              }}
            >
              {scope.start_date || scope.end_date
                ? `${scope.start_date || "最早记录"} 至 ${scope.end_date || "最新记录"}`
                : "全部时间"}
            </Tag>
            <Tag
              data-testid="portrait-curriculum-scope"
              closable={scope.curriculum_scope_type !== "all"}
              onClose={(event) => {
                event.preventDefault();
                replacePageQuery({
                  curriculum_scope_type: null,
                  curriculum_scope_id: null,
                });
              }}
            >
              {scope.curriculum_scope_type === "all"
                ? "全部章节"
                : data?.effective_scope.label || "章节筛选中"}
            </Tag>
          </div>
          <div className="ts-toolbar">
            <Space wrap>
              <span className="ts-muted">
                数据参考日 {meta.demo_reference_date || "待补充"}
              </span>
            </Space>
            <Space wrap>
              <Button
                icon={<BookOutlined />}
                onClick={() => setReferenceOpen(true)}
              >
                课标依据
              </Button>
              <Button
                icon={<ExperimentOutlined />}
                disabled={!data}
                onClick={() =>
                  history.push({
                    pathname: "/design",
                    search:
                      "?" +
                      new URLSearchParams({
                        ...Object.fromEntries(
                          Object.entries(scope).filter(
                            ([, v]) => typeof v === "string" && v !== "",
                          ),
                        ),
                        sources: scope.sources || "none",
                        from: "analysis",
                      } as Record<string, string>).toString(),
                  })
                }
              >
                注入教学设计
              </Button>
              <Button
                icon={<UploadOutlined />}
                onClick={() => setImportOpen(true)}
              >
                导入考试记录
              </Button>
              <Tooltip title="刷新数据">
                <Button
                  aria-label="刷新学情数据"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    metaRead.retry();
                    read.retry();
                  }}
                />
              </Tooltip>
            </Space>
          </div>
          <div className="ts-sourcebar" aria-label="数据来源">
            {Object.entries(SOURCES).map(([key, name]) => (
              <button
                type="button"
                key={key}
                className={sources.includes(key) ? "is-selected" : ""}
                aria-pressed={sources.includes(key)}
                onClick={() =>
                  replacePageQuery({
                    sources:
                      (sources.includes(key)
                        ? sources.filter((s) => s !== key)
                        : [...sources, key]
                      ).join(",") || "none",
                  })
                }
              >
                <span>{name}</span>
                <strong>
                  {data
                    ? (a(data.sources).find((s) => s.key === key)?.count ?? 0)
                    : "--"}
                </strong>
                <small>条记录</small>
              </button>
            ))}
          </div>
          <LoadState read={read} />
          {!books.length && <Empty description="教材章、节目录尚未接入" />}
          {data && (
            <>
              <div className="ts-pipeline">
                <div>
                  <FileSearchOutlined />
                  <span>范围内有效记录</span>
                  <b>{data.coverage.events}</b>
                </div>
                <ArrowRightOutlined />
                <div>
                  <ReadOutlined />
                  <span>去重观测条目</span>
                  <b>{data.measurement_count}</b>
                </div>
                <ArrowRightOutlined />
                <div>
                  <BookOutlined />
                  <span>相关课标主题</span>
                  <b>{a(data.content_links).length}</b>
                </div>
                <ArrowRightOutlined />
                <div>
                  <AuditOutlined />
                  <span>可评价指标</span>
                  <b>
                    {
                      a(data.indicators).filter((i) => i.state === "observed")
                        .length
                    }
                    <small> / {a(data.indicators).length}</small>
                  </b>
                </div>
              </div>
              <div className="ts-toolbar ts-scope-note">
                <span>
                  {data.effective_scope.label} ·{" "}
                  {scope.start_date || "最早记录"} 至{" "}
                  {scope.end_date || "最新记录"} · 覆盖 {data.coverage.students}
                  /{data.coverage.total_students} 名学生
                </span>
                <Button
                  type="link"
                  icon={<FileSearchOutlined />}
                  onClick={() => setEvidence({})}
                >
                  查看筛选证据
                </Button>
              </div>
              {(data.excluded_counts.unclassified > 0 ||
                data.excluded_counts.chapter_only > 0) && (
                <p className="ts-muted">
                  待归属记录 {data.excluded_counts.unclassified} 条；仅章级记录{" "}
                  {data.excluded_counts.chapter_only}{" "}
                  条。全部范围保留待归属记录，节级范围不分摊章级记录。
                </p>
              )}
              {!sources.length && (
                <Alert
                  type="info"
                  showIcon
                  message="未选择数据来源，当前不纳入任何记录"
                />
              )}
              {data.data_state !== "available" && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    data.data_state === "not_collected"
                      ? "本班观测数据尚未接入"
                      : "当前课程、时间与来源范围内暂无数据"
                  }
                />
              )}
              {mode !== "kgraph" && (
                <ScopedPortraitOverview
                  data={data}
                  onEvidence={setEvidence}
                  onIndicator={setIndicator}
                  onReference={() => setReferenceOpen(true)}
                />
              )}
              <Tabs
                activeKey={mode === "kgraph" ? "graph" : view}
                onChange={setView}
                items={
                  mode === "kgraph"
                    ? [{ key: "graph", label: "知识与证据图谱" }]
                    : [
                        { key: "knowledge", label: "知识点分布" },
                        { key: "standards", label: "课标与任务对应" },
                        { key: "indicators", label: "学科能力与量规" },
                        { key: "context", label: "经验与学习过程" },
                      ]
                }
              />
              {mode === "kgraph" ? (
                <section className="ts-section">
                  <ScopedKnowledgeGraph data={data} onEvidence={setEvidence} />
                </section>
              ) : view === "knowledge" ? (
                <ScopedPortraitOverview
                  part="distribution"
                  data={data}
                  onEvidence={setEvidence}
                  onIndicator={setIndicator}
                  onReference={() => setReferenceOpen(true)}
                />
              ) : view === "standards" ? (
                <section className="ts-section">
                  {a(data.content_links).length ? (
                    a(data.content_links).map((l) => (
                      <article className="ts-link" key={l.key}>
                        <h4>
                          {l.title}
                          <Tag>
                            {l.basis === "mixed"
                              ? "原文关系 + 教学推导"
                              : "教学推导 · 待审核"}
                          </Tag>
                        </h4>
                        <LearningContent>
                          {l.excerpt || l.summary}
                        </LearningContent>
                        <p className="ts-muted">
                          {l.source} · 第 {l.line} 行 ·{" "}
                          {l.excerpt ? "原文摘录" : "概括"}
                        </p>
                        <div className="ts-tags">
                          {l.competencies.map((c: string) => (
                            <Tag key={c}>{c}</Tag>
                          ))}
                        </div>
                        <p>
                          <b>任务建议：</b>
                          {l.task}
                        </p>
                        <p>
                          <b>证据要求：</b>
                          {l.evidence}
                        </p>
                      </article>
                    ))
                  ) : (
                    <Empty description="本范围尚无经过整理的课标对应" />
                  )}
                </section>
              ) : view === "indicators" ? (
                <section className="ts-section">
                  <Alert
                    type="info"
                    showIcon
                    message="量规草案与证据审核状态分开保留；未审核、不足或冲突均不计为零分。"
                  />
                  {data.unmapped_measurement_count > 0 && (
                    <p className="ts-muted">
                      本范围有 {data.unmapped_measurement_count}{" "}
                      个旧观测条目尚未显式关联新学科指标，保留原证据，不转换为新素养分数。
                    </p>
                  )}
                  <div className="ts-indicators">
                    {a(data.indicators).map((i) => (
                      <article key={i.indicator_id}>
                        <div>
                          <h4>{i.name}</h4>
                          <Tag
                            color={
                              i.state === "conflict"
                                ? "orange"
                                : i.state === "observed"
                                  ? "green"
                                  : "default"
                            }
                          >
                            {STATES[i.state]}
                          </Tag>
                        </div>
                        <p>{i.definition}</p>
                        <p className="ts-muted">{i.interpretation_limits}</p>
                        <span>{i.evidence_count} 条显式关联证据</span>
                        {i.distribution && (
                          <p>
                            学生最近一次已审核任务等级分布：
                            {Object.entries(i.distribution)
                              .map(([level, count]) => `${level}级 ${count}人`)
                              .join("、")}
                          </p>
                        )}
                        <Button
                          type="link"
                          icon={<AuditOutlined />}
                          onClick={() => setIndicator(i)}
                        >
                          查看依据与量规
                        </Button>
                      </article>
                    ))}
                  </div>
                  {!data.framework && (
                    <Empty description="当前学科评价框架尚未配置" />
                  )}
                </section>
              ) : (
                <section className="ts-section">
                  <header>
                    <h3>学习经验、习惯与策略</h3>
                    <Tag>{data.context_coverage} 名学生有背景记录</Tag>
                  </header>
                  <Alert
                    type="info"
                    showIcon
                    message="背景资料独立于课程筛选统计"
                    description="下列记录为当前班级 / 学生的背景资料，保留各自日期及来源，不冒充当前章、节或全班调查结论。"
                  />
                  {a(data.class_contexts).map((c, i) => (
                    <blockquote key={i}>
                      <strong>{c.aspect}</strong>：{c.content}
                      <small> · {c.coverage}</small>
                    </blockquote>
                  ))}
                  <Table
                    rowKey={(r: any) => `${r.student_id}:${r.aspect}`}
                    size="small"
                    pagination={{ pageSize: 6, showSizeChanger: false }}
                    dataSource={data.learner_contexts}
                    scroll={{ x: 560 }}
                    columns={[
                      { title: "学生", dataIndex: "name", width: 85 },
                      { title: "维度", dataIndex: "aspect", width: 125 },
                      { title: "记录", dataIndex: "content" },
                      {
                        title: "来源 / 日期",
                        render: (_, r: any) => (
                          <span>
                            {(
                              {
                                observation: "教师观察",
                                self_report: "学生自述",
                                unknown: "未采集",
                              } as any
                            )[r.source] || r.source}
                            <br />
                            <small>{r.recorded_at || "--"}</small>
                          </span>
                        ),
                        width: 145,
                      },
                    ]}
                  />
                  <h4>
                    <TeamOutlined /> 协作证据边界
                  </h4>
                  {a(data.group_tasks).map((g: any) => (
                    <p key={g.group_id}>
                      <b>{g.task}</b> · {g.note}
                    </p>
                  ))}
                  {!a(data.group_tasks).length && (
                    <p className="ts-muted">
                      暂无可归属个人的协作任务记录，不生成个人协作分数。
                    </p>
                  )}
                </section>
              )}
            </>
          )}
          <EvidenceDrawer
            scope={scope}
            filter={evidence}
            onClose={() => setEvidence(null)}
          />
          <Drawer
            title="课标与素养依据"
            width={600}
            open={referenceOpen}
            onClose={() => setReferenceOpen(false)}
          >
            <CurriculumReference meta={meta} />
          </Drawer>
          <Drawer
            title={indicator?.name || "评价量规"}
            width={600}
            open={!!indicator}
            onClose={() => setIndicator(null)}
          >
            {indicator && (
              <>
                <Tag>{STATES[indicator.state]}</Tag>
                <p>{indicator.interpretation_limits}</p>
                <h4>课标条目</h4>
                {a(indicator.standard_ids).length ? (
                  a(indicator.standard_ids).map((id) => {
                    const s = a(meta.standards).find(
                      (s) => s.standard_id === id,
                    );
                    return (
                      <blockquote key={id}>
                        <b>{s?.section_path || id}</b>
                        <LearningContent>
                          {s?.source_text || "原文待补充"}
                        </LearningContent>
                        <Tag>
                          课标条目 · {STATES[s?.review_status] || "待审核"}
                        </Tag>
                      </blockquote>
                    );
                  })
                ) : (
                  <p>尚未建立条目对应</p>
                )}
                <h4>任务条件与量规</h4>
                {a(indicator.rubrics).map((r) => (
                  <article className="ts-evidence" key={r.rubric_id}>
                    <h4>
                      {r.rubric_id} · {r.version}
                      <Tag>{STATES[r.review_status] || "待审核"}</Tag>
                    </h4>
                    <p>{r.task_conditions}</p>
                    {a(r.levels).map((l) => (
                      <p key={l.level}>
                        <b>{l.level}级：</b>
                        {l.description} · {l.observable}
                      </p>
                    ))}
                    <h4>正例 / 反例 / 边界锚例</h4>
                    {["positive", "negative", "boundary"].flatMap((key) =>
                      a(r.anchors?.[key]).map((ex, idx) => (
                        <blockquote key={`${key}:${idx}`}>
                          {
                            (
                              {
                                positive: "正例",
                                negative: "反例",
                                boundary: "边界",
                              } as any
                            )[key]
                          }
                          ：{ex.desc}
                          <small> · 草案 {ex.level} 级</small>
                        </blockquote>
                      )),
                    )}
                    <p>缺失处理：{r.missing_evidence_rule}</p>
                    <p>分歧记录：{r.conflict_rule}</p>
                    <p className="ts-muted">{r.forbidden_extrapolation}</p>
                  </article>
                ))}
                {!a(indicator.rubrics).length && (
                  <Empty description="量规待补充" />
                )}
                <Button
                  icon={<FileSearchOutlined />}
                  disabled={!indicator.evidence_count}
                  onClick={() => {
                    setEvidence({
                      ids: indicator.evidence_ids.join(","),
                      title: indicator.name,
                    });
                    setIndicator(null);
                  }}
                >
                  查看关联证据
                </Button>
              </>
            )}
          </Drawer>
          <ImportModal
            open={importOpen}
            classId={classId}
            students={people}
            onClose={() => setImportOpen(false)}
            onDone={() => {
              read.retry();
              metaRead.retry();
            }}
          />
        </>
      )}
    </div>
  );
}
