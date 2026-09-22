import { Alert, Button, Space, Tag } from "antd";
import { AuditOutlined, CommentOutlined } from "@ant-design/icons";
import { history } from "@umijs/max";
import LearningContent from "@/components/LearningContent";
import { useSupport } from "./services";
import { LoadState } from "./ui";
import "./style.less";
export default function ClassroomEvidence({ lesson }: { lesson: any }) {
  const read = useSupport("catalog");
  const subject = read.data?.subject_references?.find(
    (s: any) => s.name === lesson.subject,
  );
  return (
    <section className="teaching-support ts-section">
      <LoadState read={read} />
      <h3>{lesson.subject} · 任务证据与专业解读</h3>
      <div className="ts-tags">
        {subject?.junior?.map((c: string) => (
          <Tag key={c}>{c}</Tag>
        ))}
      </div>
      <p className="ts-muted">
        上列为学科关注维度，尚未完成本课任务与量规的专家映射，不据此评价学生个人等级。
      </p>
      <article className="ts-evidence">
        <h4>任务情境与问题</h4>
        <LearningContent>{lesson.question}</LearningContent>
        <h4>课堂作答片段</h4>
        <blockquote>
          <LearningContent>{lesson.answer}</LearningContent>
        </blockquote>
        <h4>追问与补充证据</h4>
        <LearningContent>{lesson.followup}</LearningContent>
        <p>
          待核对：独立作答是否与口头表达一致；追问后的修改是否有理由；小组产出能否归属个人。
        </p>
      </article>
      <Alert
        type="info"
        showIcon
        message="量规与任务条件待审核，本课不输出综合分"
        description="提问次数、参与比例和时长只保留为过程描述，不代表思维深度、合作质量或学习成效。"
      />
      <Space wrap style={{ marginTop: 12 }}>
        <Button
          icon={<AuditOutlined />}
          onClick={() => history.push("/school-research?tool=rubrics")}
        >
          查看评价量规
        </Button>
        <Button
          icon={<CommentOutlined />}
          onClick={() => history.push("/school-research?tool=lesson-study")}
        >
          课例研讨
        </Button>
      </Space>
    </section>
  );
}
