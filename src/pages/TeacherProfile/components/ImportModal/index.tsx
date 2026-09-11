import { useEffect, useState } from "react";
import {
  Alert, Button, Col, Form, Input, message, Modal,
  Row, Select, Spin, Table, Tag,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import MarkdownRender from "@/components/MarkdownRender";

const { Option } = Select;

interface PracticeRow {
  qid: string;
  correct: boolean;
  date: string;
}

interface Receipt {
  accepted: number;
  rejected: number;
  errors: { row: number; code: string; msg: string }[];
  queued_for_tagging: { qid: string }[];
  new_students: { student_id: string; name: string; display_id: string }[];
  mastery_updated: { n_clusters: number; clusters: string[] };
  meta: { subject?: string; comment?: string };
}

const RANDOM_COMMENTS = [
  "计算错误较多，几何板块薄弱",
  "基础尚可，审题习惯待加强",
  "概念混淆集中在方程章节",
  "学业水平中上，可尝试进阶练习",
  "表达不完整问题突出，需加强过程书写",
];

const ERROR_TAG: Record<string, { color: string; label: string }> = {
  ACCOUNT_MISSING: { color: "error", label: "缺少账号" },
  ACCOUNT_NOT_FOUND: { color: "error", label: "账号不存在" },
  DATE_INVALID: { color: "warning", label: "日期格式错误" },
  DATE_IN_FUTURE: { color: "warning", label: "未来日期" },
  QUESTION_UNMAPPED: { color: "warning", label: "题目未映射" },
  DUPLICATED: { color: "default", label: "重复事件" },
};

/** F2 学情导入弹窗：表单 → 提交回执 → 批次记录 三tab */
export default function ImportModal({ open, onClose, onDone, students, classId }: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  students: { student_id: string; name: string; display_id: string }[];
}) {
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState<any[]>([]);
  const [rows, setRows] = useState<PracticeRow[]>([]);
  const [comment, setComment] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [examName, setExamName] = useState("2026 秋季期中考试");
  const [examDate, setExamDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [isNewStudent, setIsNewStudent] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [tab, setTab] = useState<"form" | "receipt" | "batches">("form");

  useEffect(() => {
    if (open && !questions.length) {
      // 传 subject=数学 只取数学题
      fetch("/api/teacher/import/questions?subject=%E6%95%B0%E5%AD%A6")
        .then((r) => r.json())
        .then((d) => {
          if (d.code === 200) {
            setQuestions(d.data);
            randomRows(d.data);
          }
        })
        .catch(() => {});
      loadBatches();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setReceipt(null);
      setTab("form");
      form.resetFields();
      setIsNewStudent(false);
    }
  }, [open]);

  const loadBatches = () => {
    fetch("/api/teacher/import/batches")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 200) setBatches(d.data || []);
      })
      .catch(() => {});
  };

  const randomRows = (qs?: any[]) => {
    const pool = qs || questions;
    if (!pool.length) return;
    const n = 3 + Math.floor(Math.random() * 3);
    const used = new Set<string>();
    const rr: PracticeRow[] = [];
    while (rr.length < n && used.size < pool.length) {
      const q = pool[Math.floor(Math.random() * pool.length)];
      if (used.has(q.qid)) continue;
      used.add(q.qid);
      const d = new Date(2026, 2, 1 + Math.floor(Math.random() * 120));
      rr.push({
        qid: q.qid,
        correct: Math.random() < 0.6,
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      });
    }
    setRows(rr);
    setComment(RANDOM_COMMENTS[Math.floor(Math.random() * RANDOM_COMMENTS.length)]);
  };

  const addRow = () => {
    const q = questions[Math.floor(Math.random() * questions.length)];
    if (!q) return;
    const d = new Date(2026, 2, 1 + Math.floor(Math.random() * 120));
    setRows((prev) => [...prev, {
      qid: q.qid, correct: Math.random() < 0.6,
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    }]);
  };

  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, j) => j !== idx));

  const handleSubmit = async () => {
    if (!rows.length) { message.warning("请先添加练习记录"); return; }
    if (isNewStudent) {
      const name = form.getFieldValue("newName");
      if (!name || !name.trim()) { message.warning("请填写新学生姓名"); return; }
    }
    setSubmitting(true);
    try {
      const sid = form.getFieldValue("studentId");
      const body: any = {
        rows: rows.map((r) => ({
          student_id: isNewStudent
            ? (form.getFieldValue("newAccount") || `auto-${Date.now().toString(36)}`)
            : sid,
          qid: r.qid,
          correct: r.correct,
          date: r.date,
          ...(isNewStudent ? { name: form.getFieldValue("newName")?.trim() } : {}),
        })),
        source: "导入",
        class_id: classId,
        exam_name: examName.trim() || "未命名考试",
        exam_date: examDate.trim(),
        subject: "数学",
        comment: comment.trim() || undefined,
        ...(isNewStudent ? { allow_new_students: true } : {}),
      };
      const res = await fetch("/api/teacher/import/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.code === 200) {
        setReceipt(d.data);
        setTab("receipt");
        onDone();
        loadBatches();
      } else {
        message.error(d.msg || "导入失败");
      }
    } catch (e: any) {
      message.error(`导入失败：${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 列定义：固定列宽 + tableLayout fixed 防溢出
  const rowCols = [
    {
      title: "题目", dataIndex: "qid",
      render: (_: any, _r: PracticeRow, idx: number) => {
        const picked = questions.find((x) => x.qid === rows[idx]?.qid);
        return (
          <div>
            {/* 选择器仅作挑选入口（截断文本+搜索），选中后下方完整渲染题干 */}
            <Select
              style={{ width: "100%" }}
              value={rows[idx]?.qid}
              onChange={(v) => setRows((pp) => pp.map((x, j) => (j === idx ? { ...x, qid: v } : x)))}
              showSearch
              optionFilterProp="label"
              placeholder="选择数学题目"
              size="small"
              options={questions.map((q) => ({
                value: q.qid,
                label: `${q.stem.slice(0, 30)}…（${q.cluster}）`,
              }))}
              optionRender={(option: any) => {
                // antd 不会透传自定义字段，按 qid 反查完整题干
                const q = questions.find((x) => x.qid === option.value);
                return (
                  <div className="teacher_profile_stem">
                    <MarkdownRender>{q?.stem || option.label}</MarkdownRender>
                    {q ? <span style={{ fontSize: 11, color: "#8a94a8" }}>（{q.cluster}）</span> : null}
                  </div>
                );
              }}
            />
            {picked ? (
              <div className="teacher_profile_stem import_row_stem">
                <MarkdownRender>{picked.stem}</MarkdownRender>
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      title: "对/错", width: 80,
      render: (_: any, _r: PracticeRow, idx: number) => (
        <Select
          value={rows[idx]?.correct ? "1" : "0"}
          onChange={(v) => setRows((pp) => pp.map((x, j) => (j === idx ? { ...x, correct: v === "1" } : x)))}
          style={{ width: 64 }}
          size="small"
        >
          <Option value="1">对</Option>
          <Option value="0">错</Option>
        </Select>
      ),
    },
    {
      title: "练习时间", width: 145,
      render: (_: any, _r: PracticeRow, idx: number) => (
        <Input
          type="date"
          value={rows[idx]?.date}
          onChange={(e) => setRows((pp) => pp.map((x, j) => (j === idx ? { ...x, date: e.target.value } : x)))}
          size="small"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "", width: 36,
      render: (_: any, _r: PracticeRow, idx: number) => (
        <Button type="text" size="small" danger onClick={() => removeRow(idx)}>✕</Button>
      ),
    },
  ];

  const batchCols = [
    { title: "时间", dataIndex: "time", width: 150, ellipsis: true },
    { title: "接受", dataIndex: "accepted", width: 55, render: (t: number) => <Tag color="green">{t}</Tag> },
    { title: "拒绝", dataIndex: "rejected", width: 55, render: (t: number) => t ? <Tag color="red">{t}</Tag> : <span>0</span> },
    { title: "新增", dataIndex: "new_students", width: 50, render: (ns: any[]) => ns?.length || 0 },
    { title: "备注", dataIndex: "meta", ellipsis: true, render: (m: any) => m?.comment || "—" },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={720}
      title="导入考试记录"
      styles={{ body: { maxHeight: "65vh", overflowY: "auto" } }}
      footer={
        tab === "form" ? (
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>提交导入</Button>
          </div>
        ) : tab === "receipt" ? (
          <Button type="primary" onClick={onClose}>完成</Button>
        ) : null
      }
    >
      {/* Tab 切换 */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {(["form", "receipt", "batches"] as const).map((k) => (
          <Button
            key={k}
            type={tab === k ? "primary" : "default"}
            size="small"
            onClick={() => setTab(k)}
            disabled={k === "receipt" && !receipt}
          >
            {k === "form" ? "填写表单" : k === "receipt" ? "导入回执" : `批次(${batches.length})`}
          </Button>
        ))}
      </div>

      {tab === "form" ? (
        <Spin spinning={submitting}>
          <Form form={form} layout="vertical" size="small">
            <Row gutter={10}>
              <Col span={8}>
                <Form.Item label="学生（账号ID）" name="studentId" style={{ marginBottom: 8 }}
                  rules={[{ required: !isNewStudent, message: "请选择学生" }]}>
                  <Select
                    placeholder="选择学生"
                    showSearch
                    optionFilterProp="label"
                    onChange={(v) => setIsNewStudent(v === "__NEW__")}
                    allowClear
                    size="small"
                    options={[
                      { value: "__NEW__", label: "➕ 新学生（不在名单）" },
                      ...students.map((s) => ({ value: s.student_id, label: `${s.name}（${s.display_id}）` })),
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="学科" style={{ marginBottom: 8 }}>
                  <Select defaultValue="数学" size="small" style={{ width: "100%" }}>
                    <Option value="数学">数学</Option>
                    <Option value="语文" disabled>语文（未开放）</Option>
                    <Option value="英语" disabled>英语（未开放）</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label="考试名称" required>
            <Input size="small" placeholder="如：2026 秋季期中考试" value={examName}
              onChange={(e) => setExamName(e.target.value)} />
          </Form.Item>
          <Form.Item label="考试日期" required>
            <Input size="small" placeholder="YYYY-MM-DD" value={examDate}
              onChange={(e) => setExamDate(e.target.value)} />
          </Form.Item>
          <Form.Item label="教师备注（选填）" style={{ marginBottom: 8 }}>
                  <Input
                    placeholder="如：基础薄弱，需补几何"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    size="small"
                  />
                </Form.Item>
              </Col>
            </Row>

            {isNewStudent ? (
              <Alert type="info" showIcon style={{ marginBottom: 10 }} message="新学生信息"
                description={
                  <Row gutter={10}>
                    <Col span={10}>
                      <Form.Item label="姓名 *" name="newName" style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: "请填写姓名" }]}>
                        <Input placeholder="请输入姓名" size="small" />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item label="账号ID（留空自动生成）" name="newAccount" style={{ marginBottom: 0 }}>
                        <Input placeholder="留空自动生成" size="small" />
                      </Form.Item>
                    </Col>
                    <Col span={4} style={{ lineHeight: "28px", color: "#8a94a8", fontSize: 11 }}>
                      学号自动分配
                    </Col>
                  </Row>
                }
              />
            ) : null}

            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
              <b style={{ fontSize: 12 }}>练习题目列表（数学）</b>
              <Button size="small" onClick={addRow}>＋ 添加</Button>
              <Button size="small" onClick={() => randomRows()}>🎲 随机生成</Button>
            </div>
            <Table
              columns={rowCols}
              dataSource={rows}
              rowKey={(_, i) => String(i)}
              pagination={false}
              size="small"
              bordered
              tableLayout="fixed"
            />
          </Form>
        </Spin>
      ) : null}

      {tab === "receipt" && receipt ? (
        <div>
          <Row gutter={10} style={{ marginBottom: 10 }}>
            <Col span={6}><Alert type="success" showIcon message={`接受 ${receipt.accepted} 条`} /></Col>
            <Col span={6}><Alert type="info" showIcon message={`掌握度更新 ${receipt.mastery_updated?.n_clusters || 0} 知识点`} /></Col>
            <Col span={6}>
              {receipt.rejected > 0
                ? <Alert type="error" showIcon message={`拒绝 ${receipt.rejected} 行`} />
                : <Alert type="success" showIcon message="全部通过" />}
            </Col>
            <Col span={6}>
              {receipt.queued_for_tagging?.length
                ? <Alert type="warning" showIcon message={`转打标 ${receipt.queued_for_tagging.length} 题`} />
                : null}
            </Col>
          </Row>

          {receipt.new_students?.length ? (
            <Alert type="success" showIcon style={{ marginBottom: 8 }}
              message={`✚ 新增：${receipt.new_students.map((s) => `${s.name}（${s.display_id}）`).join("、")}`} />
          ) : null}

          {receipt.mastery_updated?.clusters?.length ? (
            <p style={{ fontSize: 11, color: "#5f6b81", marginBottom: 6 }}>
              拆解入库：{receipt.mastery_updated.clusters.join("、")}
            </p>
          ) : null}

          {receipt.meta?.exam_name ? (
            <Alert type="info" showIcon style={{ marginBottom: 8 }}
              message={`考试：${receipt.meta.exam_name}（${receipt.meta.exam_date || "未填日期"}）`} />
          ) : null}

          {receipt.meta?.comment ? (
            <p style={{ fontSize: 11, color: "#8a94a8", marginBottom: 6 }}>
              备注：{receipt.meta.comment}
            </p>
          ) : null}

          {receipt.errors?.length ? (
            <Table
              columns={[
                { title: "行", dataIndex: "row", width: 40 },
                { title: "错误码", dataIndex: "code", width: 130,
                  render: (code: string) => {
                    const info = ERROR_TAG[code];
                    return <Tag color={info?.color || "default"}>{info?.label || code}</Tag>;
                  } },
                { title: "说明", dataIndex: "msg", ellipsis: true },
              ]}
              dataSource={receipt.errors}
              rowKey="row"
              pagination={false}
              size="small"
              tableLayout="fixed"
            />
          ) : null}
        </div>
      ) : null}

      {tab === "batches" ? (
        <Table
          columns={batchCols}
          dataSource={batches}
          rowKey="batch_id"
          pagination={{ pageSize: 5 }}
          size="small"
          tableLayout="fixed"
        />
      ) : null}
    </Modal>
  );
}
