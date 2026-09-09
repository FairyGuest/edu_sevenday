import { useEffect, useRef, useImperativeHandle } from "react";
import { Form, Button, Select } from "antd";
import SelectTopic from "./SelectTopic";
import TextTopic from "./TextTopic";
import { useTopicHeader } from "../../hooks";
import "./index.less";

const Topic = (props: { onRef?: any }) => {
  const { onRef } = props;

  const {
    form,
    selectTopicRef,
    shortAnswerTopicRef,
    isSubQuestionRecorded,
    formDisabled,
    saveButtonDisabled,
    questionTypeDisabled,
    questionTypeList,
    saveLoading,
    isSelectType,
    questionTypeChange,
    onClickSave,
    onPreview,
    onCancelSelect,
  } = useTopicHeader(onRef);

  return (
    <div>
      <div className="exercise-topic-header">
        <div>
          <Form form={form} disabled={questionTypeDisabled} layout="horizontal">
            <Form.Item
              name="question_type"
              label="题型"
              rules={[{ required: true, message: "请选择题型" }]}
            >
              <Select
                style={{ width: "260px" }}
                placeholder="请选择题型"
                onChange={questionTypeChange}
                options={[...questionTypeList]}
              />
            </Form.Item>
          </Form>
        </div>
        <div className="right-btn">
          {isSubQuestionRecorded ? (
            <Button
              type="primary"
              loading={saveLoading}
              onClick={onCancelSelect}
            >
              取消录入
            </Button>
          ) : (
            <Button
              type="primary"
              disabled={saveButtonDisabled}
              loading={saveLoading}
              onClick={onClickSave}
            >
              录入本题
            </Button>
          )}
          <Button onClick={onPreview}>题目预览</Button>
        </div>
      </div>
      <div className="exercise-topic-content">
        {isSelectType ? (
          <SelectTopic onRef={selectTopicRef} />
        ) : (
          <TextTopic onRef={shortAnswerTopicRef} />
        )}
      </div>
    </div>
  );
};

export default Topic;
