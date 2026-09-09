import { Form, Radio } from "antd";
import { DIFFICULTY_OPTIONS } from "../../constants";

interface TopicDifficultyFieldProps {
  onChange?: () => void;
}

const TopicDifficultyField = ({ onChange }: TopicDifficultyFieldProps) => (
  <Form.Item
    name="difficulty"
    label="难度分层"
    rules={[{ required: true, message: "请选择难度分层" }]}
  >
    <Radio.Group onChange={() => onChange?.()}>
      {DIFFICULTY_OPTIONS.map(({ value, label }) => (
        <Radio key={value} value={value}>
          {label}
        </Radio>
      ))}
    </Radio.Group>
  </Form.Item>
);

export default TopicDifficultyField;
