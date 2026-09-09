export const selectOptionsData = () => {
  return [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
};

export const questionTypesListData = () => {
  return [
    { type: "单选题", code: "single_choice" },
    { type: "多选题", code: "multiple_choice" },
    { type: "填空题", code: "fill_in_the_blank" },
    { type: "简答题", code: "short_answer" },
    { type: "判断题", code: "true_false" },
  ];
};

export const questionNumber = [
  {
    small: "1",
    large: "一",
  },
  {
    small: "2",
    large: "二",
  },
  {
    small: "3",
    large: "三",
  },
  {
    small: "4",
    large: "四",
  },
  {
    small: "5",
    large: "五",
  },
  {
    small: "6",
    large: "六",
  },
  {
    small: "7",
    large: "七",
  },
  {
    small: "8",
    large: "八",
  },
  {
    small: "9",
    large: "九",
  },
  {
    small: "10",
    large: "十",
  },
  {
    small: "11",
    large: "十一",
  },
  {
    small: "12",
    large: "十二",
  },
  {
    small: "13",
    large: "十三",
  },
  {
    small: "14",
    large: "十四",
  },
  {
    small: "15",
    large: "十五",
  }
];

export let all_question_number = 35

export let single_choice_list = [
  "single_choice",
  "listening_test",
  "language_and_writing_skills",
]; // 选择题类型
export let multiple_choice_list = ["multiple_choice"]; // 多选题型
export let fill_in_the_blank_list = ["fill_in_the_blank"]; // 填空题型
export let short_answer_list = [
  "short_answer",
  "basic_knowledge_comprehensive",
  "poem_appreciation",
  "reading_comprehension",
  "complete_the_sentence",
  "cloze_test",
  "translation",
  "experiment",
  "modern_text_reading",
  "classic_text_reading",
  "ancient_poetry_reading",
  "name_of_poems_and_sentences_memorization",
  "analysis_explanation",
  "material",
  'calculation',
  'blank_completion',
  'experimental_inquiry',
  'calculation',
  'comprehensive_exercises',
  'seven_choose_five',
  "writing_skill",
  "grammar_fill_in_the_blank",
  "seven_choose_five",
  "mechanical_experiment",
  "electrical_experiment",
  "true_or_false",
  "sentence_transformation",
  "matching_questions",
  "sentence_forming",
  "language_and_writing_application",
  "classic_reading",
  "short_passage_fill_in_the_blank",
  "comprehensive_fill_in_the_blank",
  "task_based_reading",
  "reading_expression",
  "inference_question",
  "process_flow",
  "judgment_explanation",
  "discrimination_and_correction",
  "argumentation_question",
  "language_and_writing_basics"
]; // 简答题型
export let true_false_list = ["true_false"]; // 判断题型


// 出题助手无知识点的学科
export let filtering_list = ['语文', '英语', '小学道德与法治']


export let question_type_nume = [
  { type: "单选题", code: "single_choice" },
  { type: "多选题", code: "multiple_choice" },
  { type: "填空题", code: "fill_in_the_blank" },
  { type: "简答题", code: "short_answer" },
  { type: "判断题", code: "true_false" },
  { type: "听力题", code: "listening_test" },
  { type: "判断对错", code: "true_or_false" },
  { type: "诗歌阅读", code: "poem_appreciation" },
  { type: "文言文阅读", code: "classic_text_reading" },
  { type: "现代文阅读", code: "modern_text_reading" },
  { type: "名篇名句默写", code: "name_of_poems_and_sentences_memorization" },
  { type: "完形填空", code: "cloze_test" },
  { type: "阅读理解", code: "reading_comprehension" },
  { type: "语言文字运用", code: "language_and_writing_skills" },
  { type: "补全对话/短文", code: "blank_completion" },
  { type: "实验探究题", code: "experimental_inquiry" },
  { type: "计算题", code: "calculation" },
  { type: "实验题", code: "experiment" },
  { type: "综合题", code: "comprehensive_exercises" },
  { type: "材料题", code: "material" },
  { type: "古代诗歌阅读", code: "ancient_poetry_reading" },
  { type: "分析说明题", code: "analysis_explanation" },
  { type: "书写题", code: "writing_skill" },
  { type: "语法填空", code: "grammar_fill_in_the_blank" },
  { type: "七选五阅读", code: "seven_choose_five" },
  { type: "力学实验题", code: "mechanical_experiment" },
  { type: "电学实验题", code: "electrical_experiment" },
  { type: "句型转换", code: "sentence_transformation" },
  { type: "匹配题", code: "matching_questions" },
  { type: "连词成句", code: "sentence_forming" },
  { type: "语言文字应用", code: "language_and_writing_application" },
  { type: "名著阅读", code: "classic_reading" },
  { type: "短文填空", code: "short_passage_fill_in_the_blank" },
  { type: "综合填空", code: "comprehensive_fill_in_the_blank" },
  { type: "任务型阅读", code: "task_based_reading" },
  { type: "阅读表达", code: "reading_expression" },
  { type: "推断题", code: "inference_question" },
  { type: "流程题", code: "process_flow" },
  { type: "判断说明题", code: "judgment_explanation" },
  { type: "辨析改错题", code: "discrimination_and_correction" },
  { type: "论述题", code: "argumentation_question" },
  { type: "语言文字基础", code: "language_and_writing_basics" },
]

export let single_choice_list_name = ['单选题','听力题','语言文字运用','听力选择题']
export let multiple_choice_list_name = ['多选题']
export let fill_in_the_blank_list_name = ['填空题']
export let short_answer_list_name = ['简答题']
export let true_false_list_name = ['判断题','判断对错']

export let Educational_stage_list = [
  { type: "小学一年级", code: "1" },
  { type: "小学二年级", code: "2" },
  { type: "小学三年级", code: "3" },
  { type: "小学四年级", code: "4" },
  { type: "小学五年级", code: "5" },
  { type: "小学六年级", code: "6" },
  { type: "初中一年级", code: "7" },
  { type: "初中二年级", code: "8" },
  { type: "初中三年级", code: "9" },
  { type: "高中一年级", code: "10" },
  { type: "高中二年级", code: "11" },
  { type: "高中三年级", code: "12" },
]

export let role_list = [
  { type: "系统管理员", code: "32" },
  { type: "机构管理员", code: "16" },
  { type: "校长", code: "8" },
  { type: "老师", code: "4" },
  { type: "家长", code: "2" },
]