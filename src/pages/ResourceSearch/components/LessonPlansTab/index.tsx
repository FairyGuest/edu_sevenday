import { useEffect, useState } from "react";
import { Card, Drawer, Empty, Table, Tabs, Tag } from "antd";
import { BookOutlined, SendOutlined } from "@ant-design/icons";
import MarkdownRender from "@/components/MarkdownRender";
import "./index.less";

/** sections 结构（Obj/Array 混合）转 markdown */
function sectionsToMd(sections: any): string {
  const out: string[] = [];
  for (const [key, val] of Object.entries(sections || {})) {
    out.push(`## ${key}`);
    if (Array.isArray(val)) {
      val.forEach((item: any) => {
        if (typeof item === "string") out.push(`- ${item}`);
        else Object.entries(item).forEach(([k, v]) => out.push(`- **${k}**：${v}`));
      });
    } else if (val && typeof val === "object") {
      for (const [k, v] of Object.entries(val as any)) {
        if (Array.isArray(v)) {
          out.push(`**${k}**`);
          v.forEach((x) => out.push(`- ${x}`));
        } else {
          out.push(`- **${k}**：${v}`);
        }
      }
    } else {
      out.push(String(val));
    }
    out.push("");
  }
  return out.join("\n");
}

/** F6 教案/学案 tab：列表 + 点开查看（教案全文/学案/下发记录） */
export default function LessonPlansTab() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/teacher/resource/plans")
      .then(r => r.json())
      .then(d => { if (d.code === 200) setPlans(d.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const openDetail = (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    fetch(`/api/teacher/resource/plans/${id}`)
      .then(r => r.json())
      .then(d => { if (d.code === 200) setDetail(d.data); })
      .finally(() => setDetailLoading(false));
  };

  const cols = [
    { title: "教案", dataIndex: "chapter", ellipsis: true },
    { title: "版本", dataIndex: "version", width: 70, render: (t: string) => <Tag>{t}</Tag> },
    { title: "创建时间", dataIndex: "created_at", width: 150 },
    { title: "学案下发", dataIndex: "n_issues", width: 80,
      render: (t: number) => t > 0 ? <Tag color="green">{t}次</Tag> : <span style={{ color: "#ccc" }}>—</span> },
    { title: "对应作业", dataIndex: "homework_ids", width: 100,
      render: (ids: string[]) => ids?.length ? ids.map((h, i) => <Tag key={i} color="blue">{h}</Tag>) : "—" },
    { title: "", width: 70, render: (_: any, r: any) => (
      <a onClick={(e) => { e.stopPropagation(); openDetail(r.plan_id); }}>查看 ›</a>
    )},
  ];

  return (
    <Card loading={loading} title={<><BookOutlined /> 历史生成的全部教案</>}
      style={{ margin: "16px 20px" }}>
      <Table columns={cols} dataSource={plans} rowKey="plan_id"
        onRow={(r) => ({ onClick: () => openDetail(r.plan_id), style: { cursor: "pointer" } })}
        pagination={false} size="small" tableLayout="fixed" />
      <Drawer
        open={!!detailLoading || !!detail}
        onClose={() => { setDetail(null); setDetailLoading(false); }}
        width={720}
        title={detail ? `${detail.chapter} · ${detail.version}` : "教案详情"}
      >
        {detail ? (
          <Tabs size="small" items={[
            { key: "plan", label: "📖 教案", children: (
              <div className="lp_md_view"><MarkdownRender>{sectionsToMd(detail.sections)}</MarkdownRender></div>
            )},
            { key: "study", label: "📝 学案", children: (
              <div className="lp_md_view"><MarkdownRender>{detail.study_plan_md}</MarkdownRender></div>
            )},
            { key: "issues", label: <><SendOutlined /> 下发记录{detail.issues?.length ? `(${detail.issues.length})` : ""}</>, children: (
              detail.issues?.length ? (
                <div className="lp_issue_list">
                  {detail.issues.map((r: any, i: number) => (
                    <div key={i} className="lp_issue_item">
                      <Tag color="green">{r.version || "V?"}</Tag>
                      <span>{r.targets || "全班学生"}</span>
                      <span style={{ color: "#8a94a8" }}>{r.channel || "消息中心（定时推送）"}</span>
                      <span style={{ color: "#8a94a8" }}>{r.issued_at}</span>
                    </div>
                  ))}
                </div>
              ) : <Empty description="暂无下发记录" />
            )},
          ]} />
        ) : <Empty description="加载中…" />}
      </Drawer>
    </Card>
  );
}
