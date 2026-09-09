import { connect } from "umi";

import { memo, useRef, useState } from "react";
import MarkdownRender from "@/components/MarkdownRender";
import "./index.less";

const defaultType = "搜索"
const defaultIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"></path></svg>


interface ToolCardProps {
    icon?: JSX.Element;
    type?: string;
    content: string;
}
const ToolCard: React.FC<ToolCardProps> = (props: any) => {
    const { icon = defaultIcon, type = defaultType, content } = props;

    return (
        <>
            <div className="toolCard flex justify-between items-center max-w-full overflow-hidden px-4 py-2 text-xs border-1 border-black/10  rounded-t-xl mt-3">
                <div className="flex items-center flex-1 gap-2 min-w-0">
                    {/* icon */}
                    <div className="font-medium shrink-0 text-black/80 flex items-center gap-2">
                        {icon}
                    </div>
                    <div className="shrink-0">{type}</div>
                    {/* sprint */}
                    <div className="bg-black/10 h-full min-h-4 w-1 shrink-0" role="separator" aria-orientation="vertical"></div>
                    <div aria-label={content} className="text-black/50  truncate">
                        {content}
                    </div>
                </div>
                {/* 查看btn 的位置 */}
                {/* <div className="size-6"></div> */}
            </div>
        </>
    );
};

export default memo(ToolCard);
