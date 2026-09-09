import React from 'react'
import "./index.less";
function index(props: any) {
    const { row, selectOptions } = props;

    const answerList: string[] = (() => {
        if (!row?.answer) return []; // 空值返回空数组
        if (Array.isArray(row.answer)) return row.answer; // 数组直接返回
        return [row.answer]; // 字符串转为数组
    })();

    return (
        <div className='peoplesel'>
            <div className="peoplenumber">
                {
                    row?.option_counts?.map((item: any, index: number) => {
                        const currentOption = selectOptions[index] || ''; // 如果没有选项，则使用空字符串
                        const isCorrect = answerList.includes(currentOption);
                        return (
                            <div
                                className={`peoplenumber-box${isCorrect ? ` correct` : ``}`}
                                key={index}
                            >
                                {selectOptions[index]}.{item}人选择
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default index
