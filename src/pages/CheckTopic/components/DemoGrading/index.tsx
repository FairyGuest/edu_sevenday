import { useEffect, useMemo, useState } from "react";
import { useLocation, history } from "@umijs/max";
import {
  Alert,
  Button,
  Empty,
  Input,
  Progress,
  Radio,
  Segmented,
  Space,
  Spin,
  Tag,
  message,
} from "antd";
import { CommentOutlined } from "@ant-design/icons";
import MarkdownRender from "@/components/MarkdownRender";
import "./index.less";

const STATUS_COLOR: Record<string, string> = {
  待提交: "default",
  按时提交: "success",
  未按时提交: "warning",
  按时重新提交: "processing",
  未按时重新提交: "error",
};
const VERDICT_COLOR: Record<string, string> = {
  对: "success",
  半对: "warning",
  错: "error",
};

const j = (r: any) => r.json();
const get = (url: string) => fetch(url).then(j);

/**
 * 演示环境批改工作台：下发记录 → 学生提交列表 → AI 初批 + 教师复核（改判留痕）+ 结构化反馈。
 * 真实环境仍走原有 findExamPage / dailyTask / checkExamStudent 链路，不受影响。
 */
const DemoGrading = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [curDispatch, setCurDispatch] = useState<string>(
    params.get("dispatch_id") || "",
  );
  const [detail, setDetail] = useState<any>(null);
  const [curSid, setCurSid] = useState<string>(params.get("sid") || "");
  const [submission, setSubmission] = useState<any>(null);
  const [verdicts, setVerdicts] = useState<Record<number, string>>({});
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<string>("todo");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    get("/api/teacher/homework-flow/list?kind=homework").then((d: any) => {
      if (d.code === 200) {
        setDispatches(d.data || []);
        if (!curDispatch && d.data?.[0]) setCurDispatch(d.data[0].dispatch_id);
      }
    });
  }, []);

  useEffect(() => {
    if (!curDispatch) return;
    setDetail(null);
    setSubmission(null);
    get(
      `/api/teacher/homework-flow/detail?id=${encodeURIComponent(curDispatch)}`,
    ).then((d: any) => {
      if (d.code === 200) {
        setDetail(d.data);
        if (
          !curSid ||
          !d.data.submissions?.some((s: any) => s.student_id === curSid)
        ) {
          const first = pickStudent(d.data.submissions || [], filter);
          setCurSid(first?.student_id || "");
        }
      }
    });
  }, [curDispatch]);

  useEffect(() => {
    if (!curDispatch || !curSid) {
      setSubmission(null);
      return;
    }
    setLoading(true);
    get(
      `/api/teacher/homework-flow/submission?id=${encodeURIComponent(curDispatch)}&sid=${encodeURIComponent(curSid)}`,
    )
      .then((d: any) => {
        if (d.code === 200) {
          setSubmission(d.data);
          setNote(d.data.teacher_note || "");
          setVerdicts(
            Object.fromEntries(
              (d.data.items || []).map((it: any, i: number) => [
                i,
                it.ai_verdict,
              ]),
            ),
          );
        } else setSubmission(null);
      })
      .finally(() => setLoading(false));
  }, [curDispatch, curSid]);

  const pickStudent = (subs: any[], f: string) => {
    const graded = subs.filter((s: any) => s.status !== "待提交");
    if (f === "todo")
      return graded.find((s: any) => !s.teacher_reviewed) || graded[0];
    if (f === "done")
      return graded.find((s: any) => s.teacher_reviewed) || graded[0];
    if (f === "pending")
      return subs.find((s: any) => s.status === "待提交") || subs[0];
    return subs[0];
  };

  const students = useMemo(() => {
    const subs = detail?.submissions || [];
    if (filter === "todo")
      return subs.filter(
        (s: any) => s.status !== "待提交" && !s.teacher_reviewed,
      );
    if (filter === "done") return subs.filter((s: any) => s.teacher_reviewed);
    if (filter === "pending")
      return subs.filter((s: any) => s.status === "待提交");
    return subs;
  }, [detail, filter]);

  const saveReview = async () => {
    if (!submission || submission.status === "待提交") return;
    setSaving(true);
    try {
      const corrections = (submission.items || [])
        .map((it: any, i: number) => ({
          index: i,
          verdict: verdicts[i] || it.ai_verdict,
        }))
        .filter(
          (c: any, i: number) =>
            submission.items[c.index] &&
            submission.items[c.index].ai_verdict !== c.verdict,
        );
      const d = await fetch("/api/teacher/homework-flow/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: curDispatch,
          sid: curSid,
          corrections,
          note,
        }),
      }).then(j);
      if (d.code === 200 && d.data?.ok) {
        message.success(d.data.msg);
        // 刷新详情与当前提交
        get(
          `/api/teacher/homework-flow/detail?id=${encodeURIComponent(curDispatch)}`,
        ).then((r: any) => r.code === 200 && setDetail(r.data));
        get(
          `/api/teacher/homework-flow/submission?id=${encodeURIComponent(curDispatch)}&sid=${encodeURIComponent(curSid)}`,
        ).then((r: any) => {
          if (r.code === 200) setSubmission(r.data);
        });
      } else message.warning(d.data?.msg || "复核失败");
    } finally {
      setSaving(false);
    }
  };

  const fb = submission?.feedback;

  return (
    <div className="dg_container">
      <div className="dg_header">
        <span className="dg_title">作业批改</span>
        <span className="dg_sub">
          AI 初批 → 教师复核（可改判，留痕）→ 入档回流学情
        </span>
      </div>

      <div className="dg_body">
        {/* 左：下发记录 */}
        <div className="dg_list">
          <div className="dg_list_title">下发记录（作业）</div>
          <div className="dg_list_scroll">
            {dispatches.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无作业记录"
              />
            )}
            {dispatches.map((r: any) => (
              <div
                key={r.dispatch_id}
                className={
                  "dg_item" +
                  (curDispatch === r.dispatch_id ? " dg_item--active" : "")
                }
                onClick={() => {
                  setCurDispatch(r.dispatch_id);
                  setCurSid("");
                }}
              >
                <div className="dg_item_title" title={r.title}>
                  {r.title}
                </div>
                <div className="dg_item_meta">
                  <span>{r.class_name}</span>
                  <span>
                    提交 {r.progress?.submitted}/{r.n_students}
                  </span>
                  <span>
                    待复核{" "}
                    {Math.max(
                      0,
                      (r.progress?.ai_graded || 0) -
                        (r.progress?.teacher_reviewed || 0),
                    )}
                  </span>
                </div>
                <Progress
                  percent={r.progress?.submit_pct || 0}
                  size="small"
                  showInfo={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 中：学生提交列表 */}
        <div className="dg_students">
          <div className="dg_students_head">
            <Segmented
              size="small"
              value={filter}
              onChange={(v) => {
                setFilter(v as string);
                const first = pickStudent(
                  detail?.submissions || [],
                  v as string,
                );
                if (first) setCurSid(first.student_id);
              }}
              options={[
                { label: "待复核", value: "todo" },
                { label: "已复核", value: "done" },
                { label: "未提交", value: "pending" },
                { label: "全部", value: "all" },
              ]}
            />
          </div>
          <div className="dg_students_scroll">
            {(students || []).map((s: any) => (
              <div
                key={s.student_id}
                className={
                  "dg_student" +
                  (curSid === s.student_id ? " dg_student--active" : "")
                }
                onClick={() => setCurSid(s.student_id)}
              >
                <span className="dg_student_name">{s.name}</span>
                <span className="dg_student_id">{s.display_id}</span>
                <Tag color={STATUS_COLOR[s.status]} style={{ zoom: 0.85 }}>
                  {s.status}
                </Tag>
                {s.teacher_reviewed && (
                  <Tag color="success" style={{ zoom: 0.85 }}>
                    已复核
                  </Tag>
                )}
              </div>
            ))}
            {detail && students.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="该状态下暂无学生"
              />
            )}
          </div>
        </div>

        {/* 右：批改详情 */}
        <div className="dg_detail">
          {loading && (
            <div className="dg_loading">
              <Spin />
            </div>
          )}
          {!loading && !submission && (
            <div className="dg_loading">
              <Empty description="选择左侧学生查看批改详情" />
            </div>
          )}
          {!loading && submission && (
            <div className="dg_detail_scroll">
              <div className="dg_detail_head">
                <div className="dg_detail_stu">
                  <span className="dg_detail_name">{submission.name}</span>
                  <Tag color={STATUS_COLOR[submission.status]}>
                    {submission.status}
                  </Tag>
                  {submission.score != null && (
                    <Tag color="blue">AI 得分 {submission.score}</Tag>
                  )}
                  {submission.teacher_reviewed ? (
                    <Tag color="success">已复核</Tag>
                  ) : (
                    <Tag color="warning">待复核</Tag>
                  )}
                </div>
                <Space>
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    icon={<CommentOutlined />}
                    onClick={() =>
                      history.push(
                        `/design/reflection?dispatch_id=${encodeURIComponent(curDispatch)}`,
                      )
                    }
                  >
                    生成教学反思
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    loading={saving}
                    disabled={submission.status === "待提交"}
                    onClick={saveReview}
                  >
                    {submission.teacher_reviewed ? "更新复核" : "确认复核入档"}
                  </Button>
                </Space>
              </div>

              {submission.status === "待提交" && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 12 }}
                  message="该学生尚未提交，无作答可批改；可在「下发与回收」工作台催交。"
                />
              )}

              {(submission.corrections || []).length > 0 && (
                <Alert
                  type="info"
                  style={{ marginBottom: 12 }}
                  message={`改判留痕：${submission.corrections.map((c: any) => `第${c.index + 1}题 ${c.from}→${c.to}`).join("；")}`}
                />
              )}

              {/* 逐题批改 */}
              {(submission.items || []).map((it: any, i: number) => (
                <div key={i} className="dg_q">
                  <div className="dg_q_head">
                    <span className="dg_q_no">第{i + 1}题</span>
                    <Tag>{it.cluster}</Tag>
                    {it.form && <Tag>{it.form}</Tag>}
                    {it.optional && <Tag color="gold">选做</Tag>}
                    <span className="dg_q_verdict">
                      AI 判定：
                      <Tag color={VERDICT_COLOR[it.ai_verdict]}>
                        {it.ai_verdict}
                      </Tag>
                      {it.cause && <Tag color="volcano">错因：{it.cause}</Tag>}
                    </span>
                  </div>
                  <div className="dg_q_stem">
                    <MarkdownRender>{it.stem}</MarkdownRender>
                  </div>
                  <div className="dg_q_answer">
                    <span className="dg_q_answer_label">学生作答</span>
                    <span>{it.student_answer}</span>
                  </div>
                  {it.tier && (
                    <div className="dg_q_answer">
                      <span className="dg_q_answer_label">任务档位</span>
                      <Tag color="blue">{it.tier}</Tag>
                    </div>
                  )}
                  {submission.status !== "待提交" && (
                    <div className="dg_q_review">
                      <span className="dg_q_answer_label">教师复核</span>
                      <Radio.Group
                        size="small"
                        value={verdicts[i]}
                        onChange={(e) =>
                          setVerdicts({ ...verdicts, [i]: e.target.value })
                        }
                      >
                        <Radio.Button value="对">对</Radio.Button>
                        <Radio.Button value="半对">半对</Radio.Button>
                        <Radio.Button value="错">错</Radio.Button>
                      </Radio.Group>
                      {verdicts[i] !== it.ai_verdict && (
                        <Tag color="orange">
                          已改判（{it.ai_verdict}→{verdicts[i]}）
                        </Tag>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* 结构化反馈 */}
              {fb && submission.status !== "待提交" && (
                <div className="dg_feedback">
                  <div className="dg_feedback_title">
                    结构化反馈（AI 起草 · 教师复核后生效）
                  </div>
                  <p className="dg_feedback_summary">{fb.summary}</p>
                  <div className="dg_feedback_row">
                    <span className="dg_q_answer_label">错因分布</span>
                    <Space wrap size={4}>
                      {(fb.cause_mix || []).map((c: any) => (
                        <Tag key={c.label} color="volcano">
                          {c.label} ×{c.n}
                        </Tag>
                      ))}
                      {!(fb.cause_mix || []).length && (
                        <span className="dg_muted">无错误</span>
                      )}
                    </Space>
                  </div>
                  <div className="dg_feedback_row">
                    <span className="dg_q_answer_label">知识点达成</span>
                    <div className="dg_clusters">
                      {(fb.clusters || []).map((c: any) => (
                        <div key={c.cluster} className="dg_cluster">
                          <span className="dg_cluster_name" title={c.cluster}>
                            {c.cluster}
                          </span>
                          <Progress
                            percent={c.accuracy}
                            size="small"
                            strokeColor={
                              c.accuracy >= 85
                                ? "#52c41a"
                                : c.accuracy >= 60
                                  ? "#faad14"
                                  : "#ff4d4f"
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="dg_feedback_row">
                    <span className="dg_q_answer_label">下一步建议</span>
                    <ul className="dg_next">
                      {(fb.next_steps || []).map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="dg_feedback_row">
                    <span className="dg_q_answer_label">复核备注</span>
                    <Input.TextArea
                      size="small"
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="写给本人/家长可见的备注（留痕，不覆盖 AI 初批记录）"
                    />
                  </div>
                  <div className="dg_feedback_basis">
                    {fb.basis.graded_by} · 样本 {fb.basis.n_items} 题 · 来源{" "}
                    {fb.basis.source}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoGrading;
