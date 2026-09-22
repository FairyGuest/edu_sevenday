import { useEffect, useRef, useState } from "react";
import { useLocation, history } from "@umijs/max";
import {
  Alert,
  Button,
  Checkbox,
  Drawer,
  Empty,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  message,
} from "antd";
import {
  AuditOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import LearningContent from "@/components/LearningContent";
import { replacePageQuery } from "@/utils/pageQuery";
import { useSupport, supportWrite } from "./services";
import { LoadState, STATES } from "./ui";
import "./style.less";
const a = (v: any): any[] => (Array.isArray(v) ? v : []);
const ACTIONS: Record<string, string> = {
  stop: "已达标 · 停止加题",
  collect_evidence: "继续采集证据",
  adjust_support: "调整支架与讲解",
};

function DiagnosticDetail({
  caseId,
  classId,
  onChanged,
}: {
  caseId: string;
  classId: string;
  onChanged: () => void;
}) {
  const read = useSupport("diagnostic", { case_id: caseId, class_id: classId }),
    d = read.data;
  const [tab, setTab] = useState("evidence"),
    [form] = Form.useForm(),
    [followForm] = Form.useForm();
  const [saving, setSaving] = useState(false),
    lock = useRef(false),
    requestId = useRef("");
  const outcome = Form.useWatch("next_action", followForm);
  useEffect(() => {
    form.resetFields();
    followForm.resetFields();
    if (d)
      form.setFieldsValue({
        status: d.status === "suggested" ? "insufficient" : d.status,
        confirmed_cause_ids: d.confirmed_cause_ids || [],
      });
  }, [d]);
  const mutate = async (path: "review" | "followup") => {
    if (lock.current) return;
    let values;
    try {
      values = await (path === "review" ? form : followForm).validateFields();
    } catch {
      return;
    }
    if (lock.current) return;
    lock.current = true;
    setSaving(true);
    requestId.current ||= `followup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try {
      await supportWrite(path, {
        ...values,
        case_id: caseId,
        class_id: classId,
        expected_revision: d.review?.revision || 0,
        request_id: requestId.current,
      });
      message.success(
        path === "review" ? "复核已保存，干预建议已同步" : "复测记录已保存",
      );
      requestId.current = "";
      read.retry();
      onChanged();
    } catch (e: any) {
      message.error(e.message);
    } finally {
      lock.current = false;
      setSaving(false);
    }
  };
  if (!d) return <LoadState read={read} />;
  const question = a(d.questions).find((q) => q.question_id === d.question_id);
  const attempt = (id: string) =>
    a(d.attempts).find((v) => v.attempt_id === id);
  const renderAttempt = (id: string, kind: string) => {
    const v = attempt(id),
      q = a(d.questions).find((q) => q.question_id === v?.question_id);
    return (
      <article className="ts-evidence" key={`${kind}:${id}`}>
        <Space wrap>
          <Tag color={kind === "反向证据" ? "orange" : "blue"}>{kind}</Tag>
          <span>{id}</span>
          <span className="ts-muted">{v?.occurred_at?.slice(0, 10)}</span>
        </Space>
        {v ? (
          <>
            <LearningContent>{q?.stem}</LearningContent>
            <LearningContent>
              {a(v.answer_steps)
                .map((s, i) => `${i + 1}. ${s}`)
                .join("\n") || "未采集作答步骤"}
            </LearningContent>
            <p>
              最终答案：<strong>{v.final_answer || "未识别"}</strong>
            </p>
            <p className="ts-muted">{v.evidence_note}</p>
          </>
        ) : (
          <Alert type="warning" message="引用证据未接入，不能据此确认错因" />
        )}
      </article>
    );
  };
  return (
    <div className="teaching-support ts-diagnostic-detail">
      <Space wrap>
        <strong>{d.student_name}</strong>
        <Tag>{STATES[d.status]}</Tag>
        <span>{d.case_id}</span>
      </Space>
      <h3>题目与正确依据</h3>
      <LearningContent>{question?.stem || "题目待补充"}</LearningContent>
      <LearningContent>{question?.analysis}</LearningContent>
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { key: "evidence", label: "作答与错因" },
          { key: "review", label: "教师复核" },
          { key: "support", label: "定向干预" },
          { key: "followup", label: "复测与停止" },
        ]}
      />
      {tab === "evidence" && (
        <>
          <h3>候选错因</h3>
          {a(d.candidate_causes).map((c) => (
            <div className="ts-cause" key={c.cause_id}>
              <Tag>{c.type}</Tag>
              {c.claim}
              {a(d.confirmed_cause_ids).includes(c.cause_id) &&
                d.status === "confirmed" && <Tag color="green">教师确认</Tag>}
            </div>
          ))}
          {a(d.supporting_evidence_ids).map((id) =>
            renderAttempt(id, "支持证据"),
          )}
          {a(d.counter_evidence_ids).map((id) => renderAttempt(id, "反向证据"))}
          {a(d.attempt_ids)
            .filter(
              (id) =>
                ![
                  ...a(d.supporting_evidence_ids),
                  ...a(d.counter_evidence_ids),
                ].includes(id),
            )
            .map((id) => renderAttempt(id, "相关作答"))}
          <h3>待核对与追问</h3>
          {a(d.alternative_explanations).map((t, i) => (
            <p key={i}>其他可能：{t}</p>
          ))}
          {a(d.missing_evidence).map((t, i) => (
            <Alert key={i} type="warning" message={t} />
          ))}
          {a(d.diagnostic_dialogue).map((t, i) => (
            <blockquote key={i}>{t}</blockquote>
          ))}
          <Button
            type="primary"
            icon={<AuditOutlined />}
            onClick={() => setTab("review")}
          >
            复核错因
          </Button>
        </>
      )}
      {tab === "review" && (
        <>
          <Alert
            type="info"
            showIcon
            message="教师确认的是当前任务错因，不是学生人格或稳定能力。"
          />
          <Form form={form} layout="vertical">
            <Form.Item
              name="status"
              label="复核结论"
              rules={[{ required: true }]}
            >
              <Select
                aria-label="错因复核结论"
                options={[
                  { value: "confirmed", label: "确认候选错因" },
                  { value: "rejected", label: "否决原候选" },
                  { value: "insufficient", label: "证据不足，暂不归因" },
                ]}
              />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(p, n) => p.status !== n.status}>
              {({ getFieldValue }) =>
                getFieldValue("status") === "confirmed" && (
                  <Form.Item
                    name="confirmed_cause_ids"
                    label="确认错因（可多选）"
                    rules={[
                      {
                        required: true,
                        type: "array",
                        min: 1,
                        message: "至少选择一项候选错因",
                      },
                    ]}
                  >
                    <Checkbox.Group
                      style={{ display: "grid", gap: 12 }}
                      options={a(d.candidate_causes).map((c) => ({
                        value: c.cause_id,
                        label: c.claim,
                      }))}
                    />
                  </Form.Item>
                )
              }
            </Form.Item>
            <Form.Item
              name="reason"
              label="支持依据 / 修正意见"
              rules={[
                { required: true, whitespace: true, message: "请填写判断依据" },
              ]}
            >
              <Input.TextArea
                aria-label="错因复核依据"
                rows={3}
                maxLength={2000}
              />
            </Form.Item>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() => mutate("review")}
            >
              保存复核
            </Button>
          </Form>
          <h3>复核记录</h3>
          {(a(d.review_history).length
            ? d.review_history
            : d.review
              ? [d.review]
              : []
          ).map((r: any, i: number) => (
            <blockquote key={i}>
              <Tag>{STATES[r.status] || "初始复核"}</Tag>
              {r.review_reason}
              <p className="ts-muted">
                {r.reviewed_at} · {r.reviewer_id} · 版本 {r.revision}
              </p>
            </blockquote>
          ))}
        </>
      )}
      {tab === "support" && (
        <>
          <Alert
            type={d.status === "confirmed" ? "info" : "warning"}
            showIcon
            message={
              d.status === "confirmed"
                ? "每次只提供针对当前错因的微活动、辨识与迁移；查看不会下发作业。"
                : "当前错因尚未确认，先采集证据或修正候选，不自动推荐加题。"
            }
          />
          {d.next_action === "stop" && (
            <Alert
              type="success"
              icon={<CheckCircleOutlined />}
              showIcon
              message="复测已达标，停止追加练习"
            />
          )}
          {a(d.interventions).map((p) => (
            <section key={p.intervention_id} className="ts-section">
              <h3>{p.micro_activity?.title}</h3>
              <p>{p.rationale}</p>
              <LearningContent>{p.micro_activity?.content}</LearningContent>
              <p className="ts-muted">
                {p.micro_activity?.duration_minutes} 分钟 ·{" "}
                {p.micro_activity?.format}
              </p>
              {[
                ["辨识任务", p.discrimination_question_id],
                ["迁移任务", p.transfer_question_id],
              ].map(([label, id]) => {
                const q = a(d.questions).find((q) => q.question_id === id);
                return (
                  <article className="ts-evidence" key={label}>
                    <h4>{label}</h4>
                    {q ? (
                      <>
                        <LearningContent>{q.stem}</LearningContent>
                        <details>
                          <summary>参考答案与依据</summary>
                          <LearningContent>{`${q.answer}\n\n${q.analysis}`}</LearningContent>
                        </details>
                      </>
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="尚无匹配题目，不使用全库题目补齐"
                      />
                    )}
                  </article>
                );
              })}
              <p>
                <b>停止条件：</b>
                {p.stop_rule}
              </p>
            </section>
          ))}
          {!a(d.interventions).length && (
            <Empty
              description={
                d.status === "confirmed"
                  ? "当前确认错因暂无匹配干预，不做泛化推题"
                  : "等待教师复核"
              }
            />
          )}
          {!!a(d.historical_interventions).length && (
            <details>
              <summary>原候选对应的历史干预（不再作为当前推荐）</summary>
              {d.historical_interventions.map((p: any) => (
                <p key={p.intervention_id}>
                  {p.micro_activity?.title} · {p.rationale}
                </p>
              ))}
            </details>
          )}
          <Button
            icon={<FileSearchOutlined />}
            onClick={() => setTab("followup")}
          >
            查看复测证据
          </Button>
        </>
      )}
      {tab === "followup" && (
        <>
          <Alert
            showIcon
            type={d.next_action === "stop" ? "success" : "info"}
            message={ACTIONS[d.next_action] || "等待复测"}
          />
          {[...a(d.followups), ...a(d.teacher_followups)].map((f, idx) => (
            <article className="ts-evidence" key={f.followup_id || idx}>
              <Tag>{ACTIONS[f.next_action]}</Tag>
              <LearningContent>{f.observed_change}</LearningContent>
              <p>{f.stop_reason}</p>
              {[...a(f.followup_attempt_ids), ...a(f.evidence_ids)].map((id) =>
                renderAttempt(id, "复测证据"),
              )}
            </article>
          ))}
          {!a(d.followups).length && !a(d.teacher_followups).length && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="尚无本次复测结论，不判断已改善"
            />
          )}
          {!!a(d.historical_followups).length && (
            <details>
              <summary>原错因的历史复测（当前结论不适用）</summary>
              {d.historical_followups.map((f: any) => (
                <p key={f.followup_id}>{f.observed_change}</p>
              ))}
            </details>
          )}
          {!!a(d.historical_teacher_followups).length && (
            <details>
              <summary>前一复核版本的教师跟进</summary>
              {d.historical_teacher_followups.map((f: any, i: number) => (
                <p key={i}>
                  {f.observed_change} · {ACTIONS[f.next_action]}
                </p>
              ))}
            </details>
          )}
          <h3>补充教师复测记录</h3>
          <Form
            form={followForm}
            layout="vertical"
            onValuesChange={() => {
              requestId.current = "";
            }}
            disabled={d.status !== "confirmed"}
          >
            <Form.Item name="evidence_ids" label="引用当前学生作答">
              <Select
                aria-label="复测证据"
                mode="multiple"
                options={a(d.attempts).map((t) => ({
                  value: t.attempt_id,
                  label: `${t.attempt_id} · ${t.attempt_role || "作答"} · ${t.question_id}`,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="observed_change"
              label="理解变化 / 未改善的依据"
              rules={[{ required: true, whitespace: true }]}
            >
              <Input.TextArea rows={3} maxLength={2000} aria-label="复测观察" />
            </Form.Item>
            <Form.Item
              name="next_action"
              label="后续行动"
              rules={[{ required: true }]}
            >
              <Select
                aria-label="复测后续行动"
                options={Object.entries(ACTIONS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </Form.Item>
            {outcome === "stop" && (
              <Form.Item
                name="stop_reason"
                label="达标依据"
                rules={[{ required: true, whitespace: true }]}
              >
                <Input.TextArea rows={2} maxLength={1000} />
              </Form.Item>
            )}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() => mutate("followup")}
            >
              保存复测
            </Button>
          </Form>
        </>
      )}
    </div>
  );
}

export default function Diagnostics() {
  const { search } = useLocation(),
    q = new URLSearchParams(search);
  const classId = q.get("class_id") || "",
    studentId = q.get("student_id") || "",
    caseId = q.get("case_id") || "",
    homeworkId = q.get("homework_id") || "";
  const read = useSupport("diagnostics", {
    class_id: classId,
    student_id: studentId,
    homework_id: homeworkId,
    status: q.get("diagnostic_status") || "",
  });
  const d = read.data;
  return (
    <section className="teaching-support ts-diagnostics">
      <div className="ts-toolbar">
        <div>
          <h3>答题错因分析</h3>
          <span className="ts-muted">
            作答证据 · 教师复核 · 定向支持 · 复测停止
          </span>
        </div>
        <Space>
          <Tag color="cyan">诊断案例 · 待教师复核</Tag>
          <Button
            icon={<ReloadOutlined />}
            aria-label="刷新错因案例"
            onClick={read.retry}
          />
        </Space>
      </div>
      <div className="ts-filterbar">
        <label>
          班级
          <Select
            aria-label="错因班级"
            placeholder="全部班级"
            allowClear
            value={classId || undefined}
            options={a(d?.classes).map((c) => ({
              value: c.class_id,
              label: c.class_name,
            }))}
            onChange={(v) =>
              replacePageQuery({
                class_id: v || null,
                student_id: null,
                case_id: null,
              })
            }
          />
        </label>
        <label>
          学生
          <Select
            aria-label="错因学生"
            placeholder="全部学生"
            allowClear
            showSearch
            optionFilterProp="label"
            value={studentId || undefined}
            options={a(d?.students).map((s) => ({
              value: s.student_id,
              label: s.name,
            }))}
            onChange={(v) =>
              replacePageQuery({ student_id: v || null, case_id: null })
            }
          />
        </label>
        <label>
          复核状态
          <Select
            aria-label="错因状态"
            placeholder="全部状态"
            allowClear
            value={q.get("diagnostic_status") || undefined}
            options={["suggested", "confirmed", "rejected", "insufficient"].map(
              (value) => ({ value, label: STATES[value] }),
            )}
            onChange={(v) =>
              replacePageQuery({ diagnostic_status: v || null, case_id: null })
            }
          />
        </label>
      </div>
      {homeworkId && (
        <div className="ts-toolbar">
          <Tag>作业范围：{homeworkId}</Tag>
          <Button
            type="link"
            onClick={() =>
              replacePageQuery({ homework_id: null, case_id: null })
            }
          >
            查看全部作业案例
          </Button>
        </div>
      )}
      <LoadState read={read} />
      {d && (
        <Table
          rowKey="case_id"
          dataSource={d.items}
          scroll={{ x: 660 }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{
            emptyText: <Empty description="当前作业 / 学生暂无错因案例" />,
          }}
          columns={[
            { title: "学生", dataIndex: "student_name", width: 90 },
            {
              title: "题目",
              dataIndex: "stem",
              render: (v) => <LearningContent>{v}</LearningContent>,
            },
            { title: "候选", dataIndex: "cause_count", width: 65 },
            {
              title: "复核状态",
              dataIndex: "status",
              width: 120,
              render: (v) => <Tag>{STATES[v] || v}</Tag>,
            },
            {
              title: "",
              width: 110,
              render: (_, r: any) => (
                <Button
                  type="link"
                  icon={<FileSearchOutlined />}
                  onClick={() => replacePageQuery({ case_id: r.case_id })}
                >
                  查看证据
                </Button>
              ),
            },
          ]}
        />
      )}
      <Drawer
        title="错因诊断与跟进"
        width={760}
        open={!!caseId}
        onClose={() => replacePageQuery({ case_id: null })}
        destroyOnHidden
      >
        {caseId && (
          <DiagnosticDetail
            key={caseId}
            caseId={caseId}
            classId={classId}
            onChanged={read.retry}
          />
        )}
      </Drawer>
    </section>
  );
}
