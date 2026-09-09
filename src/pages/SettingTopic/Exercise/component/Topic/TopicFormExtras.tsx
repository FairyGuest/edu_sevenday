import TransferModal from "../TransferModal";
import TopicDrawer from "../TopicDrawer";

interface TopicFormExtrasProps {
  transferModalRef: any;
  knowledgePointChapter: any[];
  setKnowledgePointChapter: (data: any[]) => void;
  onChangeCascader: (row: any) => void;
  chapterKnowledgePoints: any;
  chooseTextbookVersion: any;
  previewSubQuestionData: () => any;
  drawerVisible: boolean;
  setDrawerVisible: (visible: boolean) => void;
}

const TopicFormExtras = ({
  transferModalRef,
  knowledgePointChapter,
  setKnowledgePointChapter,
  onChangeCascader,
  chapterKnowledgePoints,
  chooseTextbookVersion,
  previewSubQuestionData,
  drawerVisible,
  setDrawerVisible,
}: TopicFormExtrasProps) => (
  <>
    <TransferModal
      onRef={transferModalRef}
      knowledgePointChapter={knowledgePointChapter}
      onChangeCascader={onChangeCascader}
      chapterKnowledgePoints={chapterKnowledgePoints}
      chooseTextbookVersion={chooseTextbookVersion}
      okFn={setKnowledgePointChapter}
    />
    <TopicDrawer
      subQuestionData={previewSubQuestionData()}
      visible={drawerVisible}
      setVisible={setDrawerVisible}
    />
  </>
);

export default TopicFormExtras;
