import { Button, Form } from "antd";
import { ZYIcon } from "@/components";
import { numToLetter } from "@/utils";
import FormOptionMultiple from "../FormOptionMultiple";
import TopicEditor from "./TopicEditor";
import TopicDifficultyField from "./TopicDifficultyField";
import TopicScoreField from "./TopicScoreField";
import TopicKnowledgeField from "./TopicKnowledgeField";
import TopicFormExtras from "./TopicFormExtras";
import { useSelectTopic } from "../../hooks";

const SelectTopic = (props: { onRef: any }) => {
  const { onRef } = props;

  const {
    subQuestion,
    formDisabled,
    chooseTextbookVersion,
    chapterKnowledgePoints,
    knowledgePointChapter,
    setKnowledgePointChapter,
    onChangeCascader,
    formLeft,
    formRight,
    transferModalRef,
    drawerVisible,
    setDrawerVisible,
    options,
    oriKpoints,
    tagsDelete,
    isMultipleChoice,
    onFieldsChangeLeft,
    previewSubQuestionData,
    handleEditorBlur,
    triggerAutoSave,
    handleKnowledgePointChapterChange,
    handleKnowledgeAfterChange,
    onFieldsChangeRight,
  } = useSelectTopic(onRef);

  return (
    <div className="topic">
      <div className="topic-content topic-content-left">
        <Form
          form={formLeft}
          onFieldsChange={onFieldsChangeLeft}
          layout="vertical"
          disabled={formDisabled}
        >
          <Form.Item
            name="question_text"
            label="题干"
            rules={[{ required: true, message: "请输入题干" }]}
          >
            <TopicEditor
              sourceFrom={subQuestion?.source_from}
              height="120px"
              readOnly={formDisabled}
              placeholder="请输入题干"
              onBlur={handleEditorBlur}
            />
          </Form.Item>

          <Form.List
            name="options"
            rules={[
              {
                validator: async (_, optionList) => {
                  if (!optionList || optionList.length < 2) {
                    return Promise.reject(new Error("至少有两个选项"));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => {
                  const { key, ...restField } = field;
                  return (
                    <Form.Item label={index === 0 ? "选项" : ""} required key={key}>
                      <div className="option-container">
                        <div className="letter">{numToLetter(index + 1)}</div>
                        <div className="editor">
                          <Form.Item
                            {...restField}
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[
                              {
                                required: true,
                                whitespace: true,
                                message: "选项内容不能为空",
                              },
                            ]}
                            noStyle
                          >
                            <TopicEditor
                              sourceFrom={subQuestion?.source_from}
                              height="60px"
                              readOnly={formDisabled}
                              placeholder="请输入选项内容"
                              onBlur={handleEditorBlur}
                            />
                          </Form.Item>
                        </div>
                        <div className="close">
                          {fields.length > 2 && !formDisabled && (
                            <ZYIcon
                              type="shanchu5"
                              className="dynamic-delete-icon"
                              onClick={() => {
                                remove(field.name);
                                formRight.setFieldValue("correct_answers", []);
                                triggerAutoSave();
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </Form.Item>
                  );
                })}

                {!formDisabled && (
                  <div className="option-add">
                    <Form.Item>
                      <Button
                        block
                        color="blue"
                        variant="dashed"
                        onClick={() => {
                          add();
                          triggerAutoSave();
                        }}
                        icon={<ZYIcon type="jia" />}
                        disabled={fields.length >= 5}
                      >
                        添加选项
                      </Button>
                      <Form.ErrorList errors={errors} />
                    </Form.Item>
                  </div>
                )}
              </>
            )}
          </Form.List>
        </Form>
      </div>

      <div className="topic-content topic-content-right">
        <Form
          form={formRight}
          disabled={formDisabled}
          layout="vertical"
          onFieldsChange={onFieldsChangeRight}
        >
          <Form.Item
            name="correct_answers"
            label={isMultipleChoice ? "多选答案" : "单选答案"}
            rules={[
              {
                validator: async (_, correct_answers) => {
                  if (isMultipleChoice && (correct_answers?.length ?? 0) < 2) {
                    return Promise.reject(new Error("多选题至少选择两个答案"));
                  }
                  if (!isMultipleChoice && correct_answers?.length !== 1) {
                    return Promise.reject(new Error("单选题请选择一个答案"));
                  }
                },
              },
            ]}
          >
            <FormOptionMultiple
              readOnly={formDisabled}
              multiple={isMultipleChoice}
              options={options}
            />
          </Form.Item>

          <Form.Item name="explanation" label="解析">
            <TopicEditor
              sourceFrom={subQuestion?.source_from}
              height="120px"
              readOnly={formDisabled}
              placeholder="请输入解析"
              onBlur={handleEditorBlur}
            />
          </Form.Item>

          <TopicDifficultyField onChange={triggerAutoSave} />
          <TopicScoreField
            onChange={triggerAutoSave}
            disabled={formDisabled}
          />

          <TopicKnowledgeField
            knowledgePointChapter={knowledgePointChapter}
            setKnowledgePointChapter={setKnowledgePointChapter}
            recognitionKpoints={oriKpoints}
            tagsDelete={tagsDelete}
            formDisabled={formDisabled}
            onAddClick={() => transferModalRef.current?.openModal()}
            onAfterChange={handleKnowledgeAfterChange}
          />
        </Form>
      </div>

      <TopicFormExtras
        transferModalRef={transferModalRef}
        knowledgePointChapter={knowledgePointChapter}
        setKnowledgePointChapter={handleKnowledgePointChapterChange}
        onChangeCascader={onChangeCascader}
        chapterKnowledgePoints={chapterKnowledgePoints}
        chooseTextbookVersion={chooseTextbookVersion}
        previewSubQuestionData={previewSubQuestionData}
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
      />
    </div>
  );
};

export default SelectTopic;
