import { useEffect, useMemo, useState } from "react";
import { useLocation, history } from "@umijs/max";
import {
  Alert,
  Button,
  Card,
  Drawer,
  Empty,
  Progress,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  ReloadOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import "./index.less";

const STATUS_COLOR: Record<string, string> = {
  待提交: "default",
  按时提交: "success",
  未按时提交: "warning",
  按时重新提交: "processing",
  未按时重新提交: "error",
};

/** 下发与回收工作台：作业 + 学案统一下发记录、提交状态（PRD 口径）、批改进度。 */
const HomeworkFlow = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const [classList, setClassList] = useState<any[]>([]);
  const [classId, setClassId] = useState<string>(params.get("class_id") || "");
  const [kind, setKind] = useState<string>("all");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadList = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (classId) q.set("class_id", classId);
      if (kind !== "all") q.set("kind", kind);
      const d = await (
        await fetch(`/api/teacher/homework-flow/list?${q}`)
      ).json();
      if (d.code === 200) setRows(d.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 班级列表走画像域已有接口
    fetch("/api/teacher/classes")
      .then((r) => r.json())
      .then((d: any) => {
        if (d.code === 200 && d.data?.length) setClassList(d.data);
        else setClassList([]);
      })
      .catch(() => setClassList([]));
  }, []);

  useEffect(() => {
    loadList();
  }, [classId, kind]);

  // 打开指定下发记录（来自发布跳转/助手动作）
  useEffect(() => {
    const id = params.get("dispatch_id");
    if (id && rows.length) {
      const row = rows.find((r) => r.dispatch_id === id);
      if (row) openDetail(id);
    }
  }, [rows]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail({ dispatch_id: id, loading: true });
    try {
      const d = await (
        await fetch(
          `/api/teacher/homework-flow/detail?id=${encodeURIComponent(id)}`,
        )
      ).json();
      if (d.code === 200) setDetail(d.data);
      else {
        setDetail(null);
        message.error(d.msg || "记录不存在");
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const advance = async (id: string) => {
    const d = await (
      await fetch("/api/teacher/homework-flow/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
    ).json();
    if (d.code === 200 && d.data?.ok) {
      message.success(d.data.hint);
      openDetail(id);
      loadList();
    } else message.info(d.data?.msg || "推进失败");
  };

  const stats = useMemo(() => {
    const total = rows.length;
    const submitted = rows.reduce((a, r) => a + r.progress?.submitted || 0, 0);
    const targets = rows.reduce((a, r) => a + r.n_students || 0, 0);
    const pendingReview = rows.reduce(
      (a, r) =>
        a + (r.progress?.ai_graded || 0) - (r.progress?.teacher_reviewed || 0),
      0,
    );
    return {
      total,
      submitPct: targets ? Math.round((submitted / targets) * 100) : 0,
      pendingReview,
    };
  }, [rows]);

  const kindTag = (r: any) =>
    r.kind === "study_plan" ? (
      <Tag color="purple">学案 · 分层</Tag>
    ) : r.mode === "personalized" ? (
      <Tag color="geekblue">作业 · 个性化</Tag>
    ) : r.mode === "plan" ? (
      <Tag color="blue">作业 · 教案</Tag>
    ) : (
      <Tag>作业 · 统一</Tag>
    );

  const columns = [
    {
      title: "类型 / 标题",
      dataIndex: "title",
      width: 300,
      render: (t: string, r: any) => (
        <div className="hf_title_cell">
          <div className="hf_title_tags">
            {kindTag(r)}
            {r.finished ? (
              <Tag>已结束</Tag>
            ) : (
              <Tag color="processing">回收中</Tag>
            )}
          </div>
          <div className="hf_title_text" title={t}>
            {t}
          </div>
        </div>
      ),
    },
    { title: "班级", dataIndex: "class_name", width: 110 },
    {
      title: "发布 → 截止",
      width: 180,
      render: (_: any, r: any) => (
        <div className="hf_time_cell">
          <div>{(r.published_at || "").slice(5, 16)} 发布</div>
          <div className="hf_deadline">
            <ClockCircleOutlined /> 截止 {(r.deadline || "").slice(5, 16)}
          </div>
        </div>
      ),
    },
    {
      title: "提交进度",
      width: 200,
      render: (_: any, r: any) => {
        const p = r.progress || {};
        return (
          <Tooltip
            title={`按时 ${p.ontime} · 超时 ${p.late} · 待提交 ${p.pending}`}
          >
            <div className="hf_progress_cell">
              <Progress
                percent={p.submit_pct}
                size="small"
                status={p.pending ? "active" : "success"}
              />
              <span className="hf_progress_text">
                {p.submitted}/{r.n_students} 人
              </span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "批改进度",
      width: 150,
      render: (_: any, r: any) => {
        const p = r.progress || {};
        return (
          <Tooltip
            title={`AI 已初批 ${p.ai_graded} 人，教师已复核 ${p.teacher_reviewed} 人`}
          >
            <span>
              <CheckCircleOutlined /> 复核 {p.teacher_reviewed}/
              {p.submitted || 0}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "操作",
      width: 260,
      fixed: "right" as const,
      render: (_: any, r: any) => (
        <Space size={4} wrap>
          <Button
            size="small"
            type="primary"
            ghost
            onClick={() => openDetail(r.dispatch_id)}
          >
            查看回收
          </Button>
          <Button
            size="small"
            onClick={() =>
              history.push(
                `/homework?sub=grade&dispatch_id=${encodeURIComponent(r.dispatch_id)}`,
              )
            }
          >
            去批改
          </Button>
          <Button
            size="small"
            type="text"
            onClick={() =>
              history.push(
                `/design/reflection?dispatch_id=${encodeURIComponent(r.dispatch_id)}&class_id=${r.class_id}`,
              )
            }
          >
            <CommentOutlined /> 反思
          </Button>
        </Space>
      ),
    },
  ];

  const subCols = [
    { title: "学号", dataIndex: "display_id", width: 90 },
    { title: "姓名", dataIndex: "name", width: 90 },
    {
      title: "提交状态",
      dataIndex: "status",
      width: 130,
      render: (s: string) => (
        <Tag color={STATUS_COLOR[s] || "default"}>{s}</Tag>
      ),
      filters: Object.keys(STATUS_COLOR).map((v) => ({ text: v, value: v })),
      onFilter: (v: any, row: any) => row.status === v,
    },
    {
      title: "提交时间",
      dataIndex: "submitted_at",
      width: 150,
      render: (t: string) => (t ? t.slice(5, 16) : "—"),
    },
    {
      title: "复核",
      dataIndex: "teacher_reviewed",
      width: 80,
      render: (v: boolean, row: any) =>
        row.status === "待提交" ? (
          "—"
        ) : v ? (
          <Tag color="success">已复核</Tag>
        ) : (
          <Tag color="warning">待复核</Tag>
        ),
    },
    {
      title: "",
      width: 90,
      render: (_: any, row: any) =>
        row.status === "待提交" ? null : (
          <Button
            size="small"
            type="link"
            onClick={() =>
              history.push(
                `/homework?sub=grade&dispatch_id=${encodeURIComponent(detail?.dispatch_id)}&sid=${row.student_id}`,
              )
            }
          >
            查看作答
          </Button>
        ),
    },
  ];

  return (
    <div className="hf_container">
      <Card
        size="small"
        title="下发与回收工作台"
        extra={
          <Space>
            <Select
              size="small"
              style={{ minWidth: 150 }}
              placeholder="全部班级"
              allowClear
              value={classId || undefined}
              onChange={(v) => setClassId(v || "")}
              options={classList.map((c: any) => ({
                value: c.class_id,
                label: c.class_name,
              }))}
            />
            <Segmented
              size="small"
              value={kind}
              onChange={(v) => setKind(v as string)}
              options={[
                { label: "全部", value: "all" },
                { label: "作业", value: "homework" },
                { label: "学案", value: "study_plan" },
              ]}
            />
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={loadList}
              loading={loading}
            />
          </Space>
        }
      >
        <div className="hf_stats">
          <div className="hf_stat">
            <div className="hf_stat_num">{stats.total}</div>
            <div className="hf_stat_label">下发记录</div>
          </div>
          <div className="hf_stat">
            <div className="hf_stat_num">{stats.submitPct}%</div>
            <div className="hf_stat_label">总提交率</div>
          </div>
          <div className="hf_stat">
            <div className="hf_stat_num">{stats.pendingReview}</div>
            <div className="hf_stat_label">待复核（人次）</div>
          </div>
          <div className="hf_stat_hint">
            提交状态口径：未布置 / 待提交 / 按时提交 / 未按时提交 /
            重新提交（按时/未按时）
          </div>
        </div>
        <Table
          rowKey="dispatch_id"
          size="small"
          loading={loading}
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: (
              <Empty description="暂无下发记录：可从「教学设计」下发学案，或在「作业组卷」发布作业" />
            ),
          }}
        />
      </Card>

      <Drawer
        title={
          detail ? (
            <Space>
              {kindTag(detail)}
              <span>{detail.title}</span>
            </Space>
          ) : (
            "回收详情"
          )
        }
        open={!!detail}
        width={720}
        destroyOnHidden
        onClose={() => {
          setDetail(null);
          if (params.get("dispatch_id")) history.replace("/homework?sub=flow");
        }}
      >
        {detailLoading && !detail?.submissions ? (
          <Empty description="加载中…" />
        ) : (
          detail && (
            <>
              <div className="hf_drawer_summary">
                <span>
                  {detail.class_name} · {detail.n_students} 人
                </span>
                <span>发布 {detail.published_at?.slice(0, 16)}</span>
                <span>截止 {detail.deadline?.slice(0, 16)}</span>
              </div>

              {detail.kind === "study_plan" && detail.layers && (
                <Card
                  size="small"
                  className="hf_layer_card"
                  title="分层选做统计（统一发放 · 学生自主选做）"
                >
                  {detail.layers.tasks?.map((t: any, i: number) => (
                    <div key={i} className="hf_layer_task">
                      <Tag
                        color={
                          t.tier.includes("基础")
                            ? "blue"
                            : t.tier.includes("提高")
                              ? "gold"
                              : "purple"
                        }
                      >
                        {t.tier}
                      </Tag>
                      <span className="hf_layer_title">{t.title}</span>
                      <span className="hf_layer_eta">{t.eta}</span>
                    </div>
                  ))}
                  <div className="hf_layer_progress">
                    <span>基础必做 {detail.layers.basic.pct}%</span>
                    <span>提高选做 {detail.layers.advanced.pct}%</span>
                    <span>挑战选做 {detail.layers.challenge.pct}%</span>
                  </div>
                </Card>
              )}

              <div className="hf_drawer_tip">
                <Alert
                  type="info"
                  showIcon
                  message={
                    detail.kind === "study_plan"
                      ? "学案统一推送给全班，学生按自身情况选做提高/挑战档；基础档完成情况计入回收统计。"
                      : "提交后 AI 自动初批；教师复核（可改判）后成绩入档并回流学情画像。"
                  }
                />
              </div>

              <Table
                rowKey="student_id"
                size="small"
                columns={subCols}
                dataSource={detail.submissions || []}
                pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 人` }}
              />

              {!detail.finished && (
                <div className="hf_advance">
                  {new URLSearchParams(search).get("internal_tools") === "1" && <Tooltip title="内部测试：推进学生补交记录">
                    <Button
                      size="small"
                      icon={<ThunderboltOutlined />}
                      onClick={() => advance(detail.dispatch_id)}
                    >
                      推进测试记录
                    </Button>
                  </Tooltip>}
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    icon={<SendOutlined />}
                    onClick={() =>
                      history.push(
                        `/homework?sub=grade&dispatch_id=${encodeURIComponent(detail.dispatch_id)}`,
                      )
                    }
                  >
                    批改已回收作业
                  </Button>
                </div>
              )}
            </>
          )
        )}
      </Drawer>
    </div>
  );
};

export default HomeworkFlow;
