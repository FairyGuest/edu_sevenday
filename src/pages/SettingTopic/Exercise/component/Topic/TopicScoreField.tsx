import { Form, InputNumber } from "antd";

interface TopicScoreFieldProps {
  onChange?: () => void;
  disabled?: boolean;
}

const TopicScoreField = ({ onChange, disabled }: TopicScoreFieldProps) => (
  <Form.Item
    name="score"
    label="分数"
    rules={[
      {
        validator: async (_, value) => {
          if (value == null || value === "") return;
          if (!Number.isInteger(value) || value <= 0) {
            throw new Error("请输入大于0的正整数");
          }
        },
      },
    ]}
  >
    <InputNumber
      min={1}
      precision={0}
      step={1}
      placeholder="请输入分数"
      disabled={disabled}
      style={{ width: "100%" }}
      onChange={() => onChange?.()}
    />
  </Form.Item>
);

export default TopicScoreField;
