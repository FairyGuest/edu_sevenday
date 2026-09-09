import { Form } from "antd";
import TopicEditor from "./TopicEditor";
import TopicDifficultyField from "./TopicDifficultyField";
import TopicScoreField from "./TopicScoreField";
import TopicKnowledgeField from "./TopicKnowledgeField";
import TopicFormExtras from "./TopicFormExtras";
import { useTextTopic } from "../../hooks";

const TextTopic = (props: { onRef: any }) => {
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
    oriKpoints,
    tagsDelete,
    previewSubQuestionData,
    handleEditorBlur,
    triggerAutoSave,
    handleKnowledgePointChapterChange,
    handleKnowledgeAfterChange,
  } = useTextTopic(onRef);

  return (
    <div className="topic">
      <div className="topic-content topic-content-left">
        <Form form={formLeft} layout="vertical" disabled={formDisabled}>
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
        </Form>
      </div>

      <div className="topic-content topic-content-right">
        <Form form={formRight} layout="vertical" disabled={formDisabled}>
          <Form.Item
            name="correct_answers"
            label="答案"
            rules={[{ required: true, message: "请输入答案" }]}
          >
            <TopicEditor
              sourceFrom={subQuestion?.source_from}
              height="120px"
              readOnly={formDisabled}
              placeholder="请输入答案"
              onBlur={handleEditorBlur}
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

export default TextTopic;
