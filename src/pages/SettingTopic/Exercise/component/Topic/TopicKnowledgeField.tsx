import { Button, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import KnowledgePointChapterComponent from "./KnowledgePointChapterComponent";

interface TopicKnowledgeFieldProps {
  knowledgePointChapter: any[];
  setKnowledgePointChapter: (data: any[]) => void;
  recognitionKpoints: any[];
  tagsDelete: (type: string, dele?: any) => void;
  formDisabled?: boolean;
  onAddClick: () => void;
  onAfterChange?: (snapshot?: { knowledgePointChapter?: any[]; oriKpoints?: any[] }) => void;
}

const TopicKnowledgeField = ({
  knowledgePointChapter,
  setKnowledgePointChapter,
  recognitionKpoints,
  tagsDelete,
  formDisabled,
  onAddClick,
  onAfterChange,
}: TopicKnowledgeFieldProps) => (
  <Form.Item
    name="kpoints"
    label={
      <div className="knowledge-point-chapter-add">
        <span>
          <span style={{ color: "#ff4d4f", marginRight: "4px", fontSize: "14px" }}>*</span>
          关联教材单元及知识点
        </span>
        <span>
          <Button
            type="link"
            icon={<PlusOutlined />}
            style={{ paddingRight: "1px" }}
            onClick={onAddClick}
          >
            添加
          </Button>
        </span>
      </div>
    }
  >
    <KnowledgePointChapterComponent
      knowledgePointChapter={knowledgePointChapter}
      setKnowledgePointChapter={setKnowledgePointChapter}
      recognitionKpoints={recognitionKpoints}
      showChapter
      showKnowledgePoint
      tagsDelete={tagsDelete}
      statusType={!formDisabled}
      onAfterChange={onAfterChange}
    />
  </Form.Item>
);

export default TopicKnowledgeField;
