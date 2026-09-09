export const TI_DIFFICULTY_SET = [{ value: "2", label: "整卷综合难度" }];

export const TI_DIFFICULTY_MODERATION = [
  { value: "17", label: "容易" },
  { value: "18", label: "较易" },
  { value: "19", label: "适中" },
  { value: "20", label: "较难" },
  { value: "21", label: "困难" },
];

export const LIMITED_QUESTION_TYPES = [
  "poem_appreciation",
  "modern_text_reading",
  "classic_text_reading",
  "short_answer",
  "cloze_test",
  "reading_comprehension",
  "experiment",
  "ancient_poetry_reading",
];

export const DEFAULT_YEARS = [
  { type: "all", value: 2017 },
  { type: "near_5_years", value: 2022 },
  { type: "near_3_years", value: 2024 },
];

export const XIAOXUE_PAPER_TYPES_LIST = [
  { id: 0, name: "全部", stage_id: 0, description: "" },
  {
    id: 1,
    name: "课后作业",
    stage_id: 0,
    description:
      "同步课时练习，题量不定，一般含有教材版本及章节信息，每课时结束后，用于复习、巩固、提升、检测本课学习效果的试卷",
  },
  {
    id: 2,
    name: "单元测试",
    stage_id: 0,
    description: "章、单元同步测试，以及期（中）末复习时关于章（单元）的套卷练习",
  },
  { id: 3, name: "月考", stage_id: 0, description: "阶段性月考试卷。" },
  { id: 4, name: "期中", stage_id: 0, description: "指期中试卷，以及期中成套模拟试卷。" },
  { id: 5, name: "期末", stage_id: 0, description: "指期末试卷，以及期末成套模拟试卷。" },
];

export const DEFAULT_TI_DIFFICULTY_VALUE = "2";
export const DEFAULT_TI_DIFFICULTY_MODERATION_VALUE = "17";
export const DEFAULT_YEARS_ROW = "2017";

export const isApiSuccess = (code: unknown) => code === 200 || code === 0;
