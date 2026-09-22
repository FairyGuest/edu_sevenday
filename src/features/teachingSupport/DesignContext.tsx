import { useEffect, useImperativeHandle, useState } from "react";
import { useLocation } from "@umijs/max";
import { Button, Drawer, Empty, Input, Select, Space, Tag, Tabs } from "antd";
import {
  ApartmentOutlined,
  ArrowRightOutlined,
  BookOutlined,
  EditOutlined,
} from "@ant-design/icons";
import LearningContent from "@/components/LearningContent";
import { useSupport } from "./services";
import { LoadState, STATES } from "./ui";
import { DESIGN_FIELDS, mergeDesignDraft } from "./designDraft";
import { useDesignDraft } from "./useDesignDraft";
import "./style.less";

const a = (v: any): any[] => (Array.isArray(v) ? v : []);
const labels = DESIGN_FIELDS;
export function designContextText(context: any) {
  if (!context) return "";
  return [
    "## 教学设计依据与任务对齐",
    "先明确单元目标与课时位置，按情境、任务、评价组织内容。未采集的经验、习惯和协作信息标记待补充，不按正确率推断素养。",
    context.unit
      ? `所属单元：${context.unit.title}；版本：${context.unit.version || context.unit.confirmed_at || "草案"}；状态：${context.unit.status}`
      : "单元关联：待补充（兼容历史课时）",
    context.lesson
      ? `关联课时：${context.lesson.title}；版本 ${context.lesson.version || 1}`
      : "",
    ...Object.entries(labels).map(
      ([key, label]) => `${label}：${context[key]?.trim() || "尚未补充"}`,
    ),
    ...a(context.content_links).map(
      (l) =>
        `课标内容：${l.title}；素养对应：${a(l.competencies).join("、")}；依据 ${l.source}:${l.line}；具体任务对应待教研审核。`,
    ),
    context.learning
      ? `当前学情范围：${context.learning.effective_scope.label}；有效记录 ${context.learning.coverage.events}；覆盖 ${context.learning.coverage.students}/${context.learning.coverage.total_students} 人。\n${a(
          context.learning.knowledge,
        )
          .map(
            (k) =>
              `${k.name}：任务得分率 ${k.value}%（${k.events} 条记录，非素养等级）`,
          )
          .join("；")}`
      : "",
    ...a(context.learning?.learner_contexts).map(
      (c) =>
        `${c.name} · ${c.aspect}：${c.content}（${c.source}，${c.recorded_at || "时间未采集"}；独立背景资料，非本节统计）`,
    ),
  ]
    .filter(Boolean)
    .join("\n\n");
}
export default function DesignContext({
  type,
  stage,
  value,
  onChange,
  onType,
  onRef,
  chapterName,
}: any) {
  const { search } = useLocation(),
    query = new URLSearchParams(search),
    classId = query.get("class_id") || "";
  const read = useSupport("design"),
    meta = read.data;
  const [open, setOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const unit = a(meta?.units).find((u) => u.unit_id === value.unit_id),
    lesson = a(meta?.lessons).find((l) => l.lesson_id === value.lesson_id);
  const subjectSupported =
    !stage || (stage[0] === "初中" && stage[1] === "数学");
  const requestedUnit = query.get("unit_id") || "";
  const learningScope = {
    class_id: classId,
    student_id: query.get("student_id") || "",
    subject_id: "math",
    textbook_id:
      query.get("textbook_id") || meta?.textbooks?.[0]?.textbook_id || "",
    curriculum_scope_type:
      query.get("curriculum_scope_type") || (value.unit_id ? "unit" : "all"),
    curriculum_scope_id:
      query.get("curriculum_scope_id") ||
      (query.has("curriculum_scope_type") ? "" : value.unit_id || ""),
    start_date: query.get("start_date") || "",
    end_date: query.get("end_date") || "",
    ...(query.has("sources") ? { sources: query.get("sources") } : {}),
  };
  const learning = useSupport(
    "profile",
    learningScope,
    !!meta && !!classId && subjectSupported,
  );
  const contextKey = JSON.stringify([
    learningScope,
    stage,
    value.unit_id || "",
    value.lesson_id || "",
    chapterName || "",
    type,
  ]);
  const draft = useDesignDraft(
    {
      stage,
      chapterName,
      type,
      unit: subjectSupported ? unit : null,
      lesson: subjectSupported ? lesson : null,
      learning:
        subjectSupported && learning.data
          ? {
              effective_scope: learning.data.effective_scope,
              coverage: learning.data.coverage,
              knowledge: a(learning.data.knowledge)
                .slice(0, 10)
                .map((k) => ({
                  name: k.name,
                  value: k.value,
                  events: k.events,
                })),
              learner_contexts: a(learning.data.learner_contexts).slice(0, 12),
              dataset_version: learning.data.dataset_version,
            }
          : null,
    },
    subjectSupported &&
      !read.loading &&
      !learning.loading &&
      !learning.error &&
      !!(unit || chapterName || learning.data?.coverage?.events),
  );
  const overrides =
    value.summary_overrides?.[contextKey] ||
    (!value.summary_overrides
      ? Object.fromEntries(
          Object.keys(labels)
            .filter((k) => typeof value[k] === "string")
            .map((k) => [k, value[k]]),
        )
      : {});
  const fields = mergeDesignDraft(draft.fields, overrides);
  const updateField = (key: string, text: string) =>
    onChange({
      ...value,
      summary_overrides: {
        ...value.summary_overrides,
        [contextKey]: { ...overrides, [key]: text },
      },
    });
  useEffect(() => {
    if (
      requestedUnit &&
      meta &&
      a(meta.units).some((u) => u.unit_id === requestedUnit) &&
      value.unit_id !== requestedUnit
    )
      onChange({ ...value, unit_id: requestedUnit, lesson_id: "" });
  }, [requestedUnit, meta]);
  useImperativeHandle(
    onRef,
    () => ({
      getData: () => {
        if (classId && subjectSupported && (learning.loading || learning.error))
          throw new Error(learning.error || "学情还在加载，请稍后生成");
        return {
          unit_id: value.unit_id,
          lesson_id: value.lesson_id,
          ...fields,
          summary_source: draft.status === "ai" ? "ai" : "provided_materials",
          teacher_edited_fields: Object.keys(overrides),
          unit: subjectSupported ? unit || null : null,
          lesson: subjectSupported ? lesson || null : null,
          content_links: subjectSupported
            ? a(meta?.content_links).filter((l) =>
                a(value.content_link_ids).includes(l.key),
              )
            : [],
          learning:
            subjectSupported && learning.data
              ? {
                  effective_scope: learning.data.effective_scope,
                  coverage: learning.data.coverage,
                  knowledge: learning.data.knowledge,
                  learner_contexts: learning.data.learner_contexts,
                  dataset_version: learning.data.dataset_version,
                }
              : null,
        };
      },
    }),
    [
      value,
      unit,
      lesson,
      meta,
      learning.data,
      learning.loading,
      learning.error,
      subjectSupported,
      classId,
      JSON.stringify(fields),
      draft.status,
    ],
  );
  const chooseUnit = (id?: string) =>
    onChange({ ...value, unit_id: id || "", lesson_id: "" });
  return (
    <div className="teaching-support ts-design-context">
      <div className="ts-design-heading">
        <div className="ts-design-unit-title">
          <ApartmentOutlined />
          <strong>{type === 2 ? "单元整体框架" : "单元到课时"}</strong>
        </div>
        <p className="ts-design-unit-name">
          {subjectSupported && unit ? unit.title : "未关联单元"}
        </p>
        {subjectSupported && unit && (
          <p className="ts-muted">
            {STATES[unit.status] || unit.status} · {a(unit.unit_goals).length}{" "}
            项目标 · {a(unit.lesson_ids).length} 课时
          </p>
        )}
        <Button
          type="link"
          size="small"
          icon={<BookOutlined />}
          onClick={() => setOpen(true)}
        >
          单元与课时
        </Button>
      </div>
      <LoadState read={read} />
      {classId && subjectSupported && <LoadState read={learning} />}
      <div className="ts-design-supplement">
        <div className="ts-design-unit-title">
          <EditOutlined />
          <strong>学情补充</strong>
        </div>
        <p className="ts-muted">
          {Object.keys(overrides).length
            ? "已按教师意见调整"
            : draft.status === "ai"
              ? "AI 已整理 · 待确认"
              : draft.status === "loading"
                ? "AI 正在整理"
                : "依据已有资料整理"}
        </p>
        <div className="ts-design-scope">
          {learning.data?.coverage?.events ? (
            <>
              <span>{learning.data.effective_scope?.label || "当前范围"}</span>
              <span>{learning.data.coverage.students} 人学情</span>
            </>
          ) : (
            "学情资料待补充"
          )}
        </div>
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          aria-label="查看与调整"
          onClick={() => setContextOpen(true)}
        >
          查看与调整
        </Button>
        <p className="ts-design-topics">情境 · 任务 · 评价</p>
      </div>
      <Drawer
        title="学情补充与情境、任务、评价"
        width={640}
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        footer={
          <Button type="primary" onClick={() => setContextOpen(false)}>
            完成调整
          </Button>
        }
      >
        <div className="teaching-support ts-design-details">
          <div className="ts-form-grid ts-design-association">
            <label className={type === 2 ? "ts-wide" : ""}>
              关联单元
              <Select
                aria-label="教学关联单元"
                value={
                  subjectSupported ? value.unit_id || undefined : undefined
                }
                placeholder="关联单元框架"
                allowClear
                disabled={!subjectSupported}
                onChange={chooseUnit}
                options={a(meta?.units).map((u) => ({
                  value: u.unit_id,
                  label: u.title + " · " + (STATES[u.status] || u.status),
                }))}
              />
            </label>
            {type === 1 && (
              <label>
                课时位置
                <Select
                  aria-label="关联课时"
                  value={
                    subjectSupported ? value.lesson_id || undefined : undefined
                  }
                  placeholder="课时位置（选填）"
                  allowClear
                  disabled={!unit || !subjectSupported}
                  onChange={(id) => onChange({ ...value, lesson_id: id || "" })}
                  options={a(meta?.lessons)
                    .filter((l) => l.unit_id === value.unit_id)
                    .map((l) => ({
                      value: l.lesson_id,
                      label: l.title,
                    }))}
                />
              </label>
            )}
          </div>
          <Tabs
            items={[
              {
                key: "learning",
                label: "学情补充",
                fields: [
                  "knowledge",
                  "experience",
                  "habits",
                  "strategies",
                  "collaboration",
                ],
              },
              {
                key: "planning",
                label: "情境、任务与评价",
                fields: ["situation", "task", "assessment"],
              },
            ].map((tab) => ({
              key: tab.key,
              label: tab.label,
              forceRender: true,
              children: (
                <div className="ts-form-grid">
                  {tab.fields.map((key) => (
                    <label key={key} className="ts-wide">
                      {labels[key]}
                      <Input.TextArea
                        aria-label={labels[key]}
                        value={fields[key]}
                        autoSize={{ minRows: 2, maxRows: 6 }}
                        maxLength={3000}
                        onChange={(event) =>
                          updateField(key, event.target.value)
                        }
                      />
                    </label>
                  ))}
                </div>
              ),
            }))}
          />
          <div className="ts-form-grid">
            <label className="ts-wide">
              课标与素养依据
              <Select
                aria-label="教学课标依据"
                mode="multiple"
                disabled={!subjectSupported}
                value={subjectSupported ? value.content_link_ids || [] : []}
                onChange={(ids) =>
                  onChange({ ...value, content_link_ids: ids })
                }
                options={a(meta?.content_links).map((l) => ({
                  value: l.key,
                  label: l.title,
                }))}
              />
            </label>
          </div>
        </div>
      </Drawer>
      <Drawer
        title="单元框架与关联课时"
        width={620}
        open={open}
        onClose={() => setOpen(false)}
      >
        <LoadState read={read} />
        {!subjectSupported ? (
          <Empty description="当前学科 / 学段的单元资料待接入" />
        ) : (
          a(meta?.units).map((u) => (
            <section className="ts-section" key={u.unit_id}>
              <Space wrap>
                <h3>{u.title}</h3>
                <Tag>{STATES[u.status] || u.status}</Tag>
              </Space>
              <p className="ts-muted">
                {u.confirmed_at || "未确认"} · {a(u.scope?.section_ids).length}{" "}
                节
              </p>
              {a(u.unit_goals).map((g) => (
                <article className="ts-evidence" key={g.goal_id}>
                  <LearningContent>{g.behavior}</LearningContent>
                  <p>
                    条件：{g.condition}；产出：{g.output}
                  </p>
                </article>
              ))}
              <Button
                icon={<BookOutlined />}
                onClick={() => {
                  chooseUnit(u.unit_id);
                  onType(2);
                  setOpen(false);
                }}
              >
                引用单元框架
              </Button>
              <h4>关联课时</h4>
              {a(u.lesson_ids).map((id) => {
                const l = a(meta.lessons).find((l) => l.lesson_id === id);
                return (
                  <div className="ts-evidence" key={id}>
                    {l ? (
                      <>
                        <Space wrap>
                          <strong>{l.title}</strong>
                          <Tag>v{l.version}</Tag>
                          <Tag>{STATES[l.status] || l.status}</Tag>
                        </Space>
                        {a(l.steps)
                          .filter((s) =>
                            ["goals", "tasks", "assessment"].includes(
                              s.step_key,
                            ),
                          )
                          .map((s) => (
                            <div key={s.step_key}>
                              <small>
                                {
                                  (
                                    {
                                      goals: "目标",
                                      tasks: "任务",
                                      assessment: "评价",
                                    } as any
                                  )[s.step_key]
                                }
                              </small>
                              <LearningContent>
                                {a(s.draft).join("\n\n")}
                              </LearningContent>
                            </div>
                          ))}
                        <Button
                          type="link"
                          icon={<ArrowRightOutlined />}
                          onClick={() => {
                            onChange({
                              ...value,
                              unit_id: u.unit_id,
                              lesson_id: l.lesson_id,
                            });
                            onType(1);
                            setOpen(false);
                          }}
                        >
                          基于此单元准备课时
                        </Button>
                      </>
                    ) : (
                      <p>{id} · 课时内容待补充</p>
                    )}
                  </div>
                );
              })}
            </section>
          ))
        )}
        {!!a(meta?.unlinked_lessons).length && (
          <section className="ts-section">
            <h3>历史课时 · 尚未关联单元</h3>
            {meta.unlinked_lessons.map((l: any) => (
              <p key={l.lesson_id}>
                {l.title}
                <br />
                <small>{l.note}</small>
              </p>
            ))}
          </section>
        )}
      </Drawer>
    </div>
  );
}
