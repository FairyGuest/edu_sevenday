export const SELECT_TYPES = [
  "single_choice",
  "multiple_choice",
  "listening_test",
  "language_and_writing_skills",
  "单选题",
  "多选题",
  "听力题",
  "语言文字运用",
];

// export const TEXT_TYPES = [
//   "fill_in_the_blank",
//   "short_answer",
//   "cloze_test",
//   "reading_comprehension",
//   "modern_text_reading",
//   "classic_text_reading",
//   "poem_appreciation",
// ];

export const DIFFICULTY_OPTIONS = [
  { value: "容易", label: "容易" },
  { value: "较易", label: "较易" },
  { value: "适中", label: "适中" },
  { value: "较难", label: "较难" },
  { value: "困难", label: "困难" },
];

export const TRANSFER_MODAL_TABS = [
  { key: "1", label: "教材单元" },
  { key: "2", label: "知识点" },
];

export const EXERCISE_INITIAL_STATE = {
  courseId: null,
  taskId: null,
  rootTaskId: null,
  questions: [],
  progress: 0,
  progressMessage: "",
  taskStatus: "",
  activeIndex: 0,
  topicKey: "1",
  textbookVersion: [],
  chooseTextbookVersion: {},
  chapterKnowledgePoints: {},
  questionTypeList: [],
  subject: "",
  knowledgePointChapter: [],
  questionType: "",
  saveLoading: false,
  paperId: null,
  paperName: "",
};
