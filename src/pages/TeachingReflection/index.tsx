import { useEffect, useState } from "react";
import { useLocation, history, useDispatch } from "@umijs/max";
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Empty,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Tag,
  message,
} from "antd";
import {
  BookOutlined,
  CommentOutlined,
  ExperimentOutlined,
  PlusOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { runAction } from "@/components/GlobalAssistant/actions";
import "./index.less";

const j = (r: any) => r.json();
const get = (url: string) => fetch(url).then(j);

/**
 * 教学反思：批改证据 → 规则引擎反思建议（可执行动作）→ 教师反思记录 → 校本教研/教案反哺。
 * 链路口径：证据（作业/学案批改）→ 反思 → 共研 → 新策略 → 反哺教案。
 */
const TeachingReflection = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const dispatch = useDispatch();
  const [classList, setClassList] = useState<any[]>([]);
  const [classId, setClassId] = useState<string>(params.get("class_id") || "");
  const [sug, setSug] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    content: string;
    tags: string[];
  }>({ title: "", content: "", tags: [] });
  const [saving, setSaving] = useState(false);

  const loadSuggestions = async (cid?: string) => {
    setLoading(true);
    try {
      const d = await get(
        `/api/teacher/reflection/suggestions${cid ? `?class_id=${encodeURIComponent(cid)}` : ""}`,
      );
      if (d.code === 200) setSug(d.data);
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async (cid?: string) => {
    const d = await get(
      `/api/teacher/reflection/records${cid ? `?class_id=${encodeURIComponent(cid)}` : ""}`,
    );
    if (d.code === 200) setRecords(d.data || []);
  };

  useEffect(() => {
    get("/api/teacher/classes")
      .then(j)
      .then((d: any) => {
        if (d.code === 200 && d.data?.length) setClassList(d.data);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    loadSuggestions(classId || undefined);
    loadRecords(classId || undefined);
  }, [classId]);

  const saveRecord = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      message.warning("标题和内容不能为空");
      return;
    }
    setSaving(true);
    try {
      const d = await fetch("/api/teacher/reflection/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          class_id: classId || "cls-g8-03",
          dispatch_id: params.get("dispatch_id") || "",
        }),
      }).then(j);
      if (d.code === 200 && d.data?.ok) {
        message.success(d.data.msg);
        setModalOpen(false);
        setForm({ title: "", content: "", tags: [] });
        loadRecords(classId || undefined);
      } else message.warning(d.data?.msg || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const execute = (a: any) =>
    runAction(a, { dispatch } as any).then((r: any) => {
      if (r.ok && r.detail) message.success(r.detail.replace(/\*\*/g, ""));
      else if (!r.ok) message.error(r.detail);
    });

  return (
    <div className="tr_container">
      <div className="tr_domain_bar">
        <span className="tr_domain_title">教学设计</span>
        <span className="tr_domain_sep">/</span>
        <span className="tr_domain_cur">教学反思</span>
        <span className="tr_domain_hint">
          反思链：批改证据 → 教学反思 → 校本教研 → 反哺教案
        </span>
        <Button
          size="small"
          type="primary"
          ghost
          onClick={() => history.push("/design")}
        >
          去生成 / 调整教案
        </Button>
      </div>
      <Card
        size="small"
        title={
          <span>
            <ExperimentOutlined /> 教学反思 · 从批改证据到教学改进
          </span>
        }
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
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => {
                loadSuggestions(classId || undefined);
                loadRecords(classId || undefined);
              }}
              loading={loading}
            />
          </Space>
        }
      >
        <Steps
          size="small"
          current={1}
          className="tr_chain"
          items={[
            {
              title: "批改证据",
              description: "作业/学案回收 · AI初批 · 教师复核",
            },
            { title: "教学反思", description: "证据驱动的改进点（本页）" },
            { title: "校本教研", description: "共性问题沉淀为议题" },
            { title: "反哺教案", description: "新策略进入下轮设计" },
          ]}
        />

        <Row gutter={12} className="tr_body">
          <Col span={15}>
            <div className="tr_section_title">
              <ThunderboltOutlined /> AI 反思建议（规则引擎 · 每条附证据）
              {sug?.n_items_sampled && (
                <span className="tr_basis">
                  依据最近 {sug.basis?.length} 次下发批改证据，抽样{" "}
                  {sug.n_items_sampled} 题
                </span>
              )}
            </div>
            {loading && (
              <div className="tr_loading">
                <Spin />
              </div>
            )}
            {!loading &&
              sug &&
              (sug.suggestions || []).map((s: any) => (
                <Card
                  key={s.id}
                  size="small"
                  className="tr_sug"
                  title={
                    <Space>
                      <Tag color="blue">{s.type}</Tag>
                      <span className="tr_sug_title">{s.title}</span>
                    </Space>
                  }
                >
                  <div className="tr_sug_advice">{s.advice}</div>
                  {(s.evidence || []).length > 0 && (
                    <Collapse
                      size="small"
                      ghost
                      items={[
                        {
                          key: "ev",
                          label: (
                            <span className="tr_ev_label">
                              证据摘要（{s.evidence.length} 条）
                            </span>
                          ),
                          children: s.evidence.map((e: any, i: number) => (
                            <div key={i} className="tr_ev_item">
                              <div className="tr_ev_title">{e.title}</div>
                              <div className="tr_ev_text">{e.text}</div>
                            </div>
                          )),
                        },
                      ]}
                    />
                  )}
                  {(s.actions || []).length > 0 && (
                    <div className="tr_actions">
                      {s.actions.map((a: any, i: number) => (
                        <Button
                          key={i}
                          size="small"
                          type="primary"
                          ghost
                          onClick={() => execute(a)}
                        >
                          {a.label}
                        </Button>
                      ))}
                      <Button
                        size="small"
                        type="text"
                        onClick={() => {
                          setForm({
                            ...form,
                            title: s.title.slice(0, 28),
                            content: s.advice,
                            tags: [s.type],
                          });
                          setModalOpen(true);
                        }}
                      >
                        记为我的反思
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            {!loading && sug && !(sug.suggestions || []).length && (
              <Alert
                type="info"
                showIcon
                message="暂无可反思的批改证据"
                description="请先在「作业批改」完成复核，或下发作业/学案并等待回收。"
                action={
                  <Button
                    size="small"
                    onClick={() => history.push("/homework?sub=flow")}
                  >
                    去下发与回收
                  </Button>
                }
              />
            )}

            <div className="tr_assistant">
              <Alert
                type="success"
                showIcon
                icon={<CommentOutlined />}
                message="小助手也能生成反思建议"
                description={
                  <>
                    在任意页面右下角小助手输入「<b>给我一些教学反思建议</b>
                    」，即可基于同批证据生成建议卡并跳转本页。
                  </>
                }
              />
            </div>
          </Col>

          <Col span={9}>
            <div className="tr_section_title">
              <BookOutlined /> 我的反思记录
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
              >
                新增
              </Button>
            </div>
            {records.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无反思记录"
              />
            )}
            {records.map((r: any) => (
              <Card key={r.id} size="small" className="tr_record">
                <div className="tr_record_title">{r.title}</div>
                <div className="tr_record_meta">
                  <span>{r.created_at}</span>
                  {(r.tags || []).map((t: string) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
                <div className="tr_record_content">{r.content}</div>
                <div className="tr_record_actions">
                  <Button
                    size="small"
                    type="link"
                    onClick={() => history.push("/school-research")}
                  >
                    沉淀为教研议题
                  </Button>
                  <Button
                    size="small"
                    type="link"
                    onClick={() =>
                      history.push(`/design?class_id=${r.class_id || ""}`)
                    }
                  >
                    反哺教案
                  </Button>
                </div>
              </Card>
            ))}
          </Col>
        </Row>
      </Card>

      <Modal
        title="新增反思记录"
        open={modalOpen}
        confirmLoading={saving}
        onOk={saveRecord}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        destroyOnHidden
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <Input
            placeholder="标题（如：一次函数单元复盘）"
            value={form.title}
            maxLength={40}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input.TextArea
            rows={6}
            placeholder="反思内容：发生了什么（证据）→ 为什么（归因）→ 下一步怎么做（策略）"
            value={form.content}
            showCount
            maxLength={600}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder="标签（如：目标达成、课堂支架、作业设计）"
            value={form.tags}
            onChange={(v) => setForm({ ...form, tags: v })}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default TeachingReflection;
