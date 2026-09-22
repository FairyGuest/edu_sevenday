import { useState } from "react";
import { history } from "@umijs/max";
import { Button, Drawer, Empty, Space, Tag } from "antd";
import {
  BookOutlined,
  CommentOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import LearningContent from "@/components/LearningContent";
import { useSupport } from "./services";
import { LoadState, STATES } from "./ui";
import "./style.less";
const a = (v: any): any[] => (Array.isArray(v) ? v : []);
const IDS: Record<string, string> = {
  "co-plan": "tool-co-prep",
  "lesson-study": "tool-lesson-study",
  rubrics: "tool-rubric-review",
};
export default function ResearchTools({ tool }: { tool: string }) {
  const read = useSupport("research-tools"),
    data = read.data;
  const [selected, setSelected] = useState<any>(null);
  const record = a(data?.tools).find((t) => t.tool_id === IDS[tool]);
  const rubric = a(data?.rubrics).find(
    (r) => r.rubric_id === selected?.rubric_id,
  );
  return (
    <div className="teaching-support">
      <LoadState read={read} />
      <div className="ts-toolbar">
        <h3>
          {
            (
              {
                "co-plan": "集体备课记录",
                "lesson-study": "课例研讨记录",
                rubrics: "评价量规评议",
              } as any
            )[tool]
          }
        </h3>
        <Tag color="cyan">待教研复核</Tag>
      </div>
      <div className="ts-tool-list">
        {a(record?.examples).map((e) => (
          <article key={e.example_id}>
            <h3>{e.title}</h3>
            <p className="ts-muted">{e.created_at}</p>
            <LearningContent>
              {[...a(e.agenda), ...a(e.records)]
                .map((t) => `- ${t}`)
                .join("\n")}
            </LearningContent>
            {!!a(e.decisions).length && <p>共识：{e.decisions.join("；")}</p>}
            {!!a(e.follow_ups).length && <p>后续：{e.follow_ups.join("；")}</p>}
            <Button
              icon={<FileSearchOutlined />}
              onClick={() => setSelected(e)}
            >
              查看记录
            </Button>
          </article>
        ))}
      </div>
      {data && !a(record?.examples).length && (
        <Empty description="当前工具暂无场景记录" />
      )}
      <Drawer
        title={selected?.title || "教研记录"}
        width={600}
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="teaching-support">
            <p className="ts-muted">
              {selected.created_at} ·{" "}
              {a(selected.participants).join("、") || "参与教师待补充"}
            </p>
            <LearningContent>
              {[
                ...a(selected.preview?.lines),
                ...a(selected.agenda),
                ...a(selected.records),
              ]
                .map((t) => `- ${t}`)
                .join("\n")}
            </LearningContent>
            {a(selected.decisions).map((d, i) => (
              <p key={i}>共识：{d}</p>
            ))}
            {a(selected.follow_ups).map((d, i) => (
              <p key={i}>跟进：{d}</p>
            ))}
            {rubric && (
              <section className="ts-section">
                <Space wrap>
                  <h3>量规 {rubric.version}</h3>
                  <Tag>{STATES[rubric.review_status] || "待审核"}</Tag>
                </Space>
                <p>{rubric.task_conditions}</p>
                {a(rubric.levels).map((l) => (
                  <p key={l.level}>
                    <b>
                      {l.level}级 · {l.description}
                    </b>
                    <br />
                    {l.observable}
                  </p>
                ))}
                <h4>试评记录</h4>
                <p>{rubric.trial_scoring?.agreement_note || "尚未完成试评"}</p>
                {a(rubric.review_records).map((r, i) => (
                  <blockquote key={i}>
                    {r.result}
                    <p className="ts-muted">
                      {r.reviewer_id} · {r.reviewed_at}
                    </p>
                  </blockquote>
                ))}
                <p className="ts-muted">
                  {rubric.forbidden_extrapolation}
                  ；待审核量规不作为正式评分标准。
                </p>
              </section>
            )}
            <Space wrap>
              {selected.unit_id && (
                <Button
                  icon={<BookOutlined />}
                  onClick={() =>
                    history.push(
                      `/design?${new URLSearchParams({ unit_id: selected.unit_id, from: "research" })}`,
                    )
                  }
                >
                  引用单元框架
                </Button>
              )}
              {selected.topic_id && (
                <Button
                  icon={<CommentOutlined />}
                  onClick={() =>
                    history.push(
                      `/school-research?${new URLSearchParams({ tool: "forum", topic: selected.topic_id })}`,
                    )
                  }
                >
                  进入议题交流
                </Button>
              )}
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
}
