import { useState, useEffect } from 'react';
import {
    single_choice_list,
    multiple_choice_list,
    fill_in_the_blank_list,
    short_answer_list,
    true_false_list,
    question_type_nume,
} from "@/global";
interface ProcessedOption {
    label: string;
    content: string;
}
interface QuestionTypeConfig {
    code: string;
    type: string;
}
interface RawQuestion {
    options?: string[];
    question_type: string;
    correct_answers?: string[];
    student_answer?: string[];
    [key: string]: any;
}
interface RawTestPaper {
    questions?: RawQuestion[];
    [key: string]: any;
}
interface ProcessedQuestion extends Omit<RawQuestion, 'options'> {
    optionsList?: ProcessedOption[];
    answer?: string;
    type?: string;
    studentAnswer?: string;
}
export const useCheckExam = (
    testPaper: RawTestPaper | undefined,
    selectOptions: string[],
    questionTypesList: QuestionTypeConfig[]
) => {
    const [homeworkData, setHomeworkData] = useState<ProcessedQuestion[] | undefined>(undefined);

    // 处理学生答案
    const getStudentAnswer = (item: RawQuestion): string => {
        const { question_type, options, student_answer = [] } = item;        
        if (single_choice_list.includes(question_type)) {
            if (!options || student_answer.length === 0) return '';
            const singleIndex = options.findIndex(val => val === student_answer[0]);
            return singleIndex !== -1 ? selectOptions[singleIndex] : '';
        } else if (multiple_choice_list.includes(question_type)) {
            if (!options || student_answer.length === 0) return '';
            return student_answer.reduce((str, val) => {
                const multiIndex = options.findIndex(k => k === val);
                return multiIndex !== -1 ? str + selectOptions[multiIndex] : str;
            }, '');
        } else if (fill_in_the_blank_list.includes(question_type)) {
            return student_answer[0] || '';
        } else if (short_answer_list.includes(question_type)) {
            return student_answer.join('、') || '';
        } else if (true_false_list.includes(question_type)) {
            return student_answer[0] || '';
        } else {
            return '';
        }

        // switch (question_type) {
        //     // 单选题
        //     case 'single_choice':
        //         if (!options || student_answer.length === 0) return '';
        //         const singleIndex = options.findIndex(val => val === student_answer[0]);
        //         return singleIndex !== -1 ? selectOptions[singleIndex] : '';

        //     // 多选题
        //     case 'multiple_choice':
        //         if (!options || student_answer.length === 0) return '';
        //         return student_answer.reduce((str, val) => {
        //             const multiIndex = options.findIndex(k => k === val);
        //             return multiIndex !== -1 ? str + selectOptions[multiIndex] : str;
        //         }, '');

        //     // 简答题/判断题/填空题
        //     case 'short_answer':
        //     case 'true_false':
        //     case 'fill_in_the_blank':
        //         return student_answer[0] || '';

        //     // 未知题型
        //     default:
        //         return '';
        // }
    };

    // 处理正确答案
    const getCorrectAnswer = (item: RawQuestion): any => {
        const { question_type, options, correct_answers = [] } = item;
        if (single_choice_list.includes(question_type)) {
            if (!options || correct_answers.length === 0) return '';
            const singleIndex = options.findIndex(val => val === correct_answers[0]);
            return singleIndex !== -1 ? selectOptions[singleIndex] : '';
        } else if (multiple_choice_list.includes(question_type)) {
            if (!options || correct_answers.length === 0) return [];
            return correct_answers.reduce((arr, val) => {
                const multiIndex = options.findIndex(k => k === val);
                if (multiIndex !== -1) {
                    arr.push(selectOptions[multiIndex]);
                }
                return arr;
            }, [] as string[]);
        } else if (fill_in_the_blank_list.includes(question_type)) {
            return correct_answers[0] || '';
        } else if (short_answer_list.includes(question_type)) {
            return correct_answers?.map((arr,index)=>{
                return `（${index + 1}）${arr}`;
            }).join(';') || '';
        } else if (true_false_list.includes(question_type)) {
            return correct_answers[0] || '';
        } else {
            return '';
        }
        // switch (question_type) {
        //     // 单选题
        //     case 'single_choice':
        //         if (!options || correct_answers.length === 0) return '';
        //         const singleIndex = options.findIndex(val => val === correct_answers[0]);
        //         return singleIndex !== -1 ? selectOptions[singleIndex] : '';
        //     // 多选题
        //     case 'multiple_choice':
        //         if (!options || correct_answers.length === 0) return '';
        //         return correct_answers.reduce((str, val) => {
        //             const multiIndex = options.findIndex(k => k === val);
        //             return multiIndex !== -1 ? str + selectOptions[multiIndex] : str;
        //         }, '');
        //     // 简答题/判断题/填空题
        //     case 'short_answer':
        //     case 'true_false':
        //     case 'fill_in_the_blank':
        //         return correct_answers[0] || '';

        //     default:
        //         return '';
        // }
    };
    const processExamData = () => {
        if (!testPaper?.questions || testPaper.questions.length === 0) {
            setHomeworkData(undefined);
            return;
        }

        const processedQuestions = testPaper.questions.map(item => {
            // 处理选项列表
            const optionsList = item.options?.length
                ? item.options.map((val, key) => ({
                    label: selectOptions[key] || '',
                    content: val || '',
                }))
                : undefined;

            const questionType = question_type_nume.find(k => k.code === item.question_type)?.type;

            return {
                ...item,
                optionsList,
                answer: getCorrectAnswer(item),
                type: questionType,
                studentAnswer: getStudentAnswer(item),
            };
        });

        setHomeworkData(processedQuestions);
    };

    useEffect(() => {
        processExamData();
    }, [testPaper, selectOptions, questionTypesList]);

    return homeworkData;
};