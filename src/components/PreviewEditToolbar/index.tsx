import { useState, useEffect, memo } from "react";
import { Button } from "antd";
import { ZYIcon } from "@/components";
import "./index.less";

interface Props {
    editing: boolean;
    className?: string;
    leftBlock?: React.ReactNode;
    onEdit: (type: "open" | "submit" | "close") => void;
}

const PreviewEditToolbar = (props: Props) => {

    const { editing, onEdit, className, leftBlock } = props;

    return (
        <div className={`previewEditToolbar absolute z-10 h-0 top-3 left-3 right-3 mt-4 flex justify-between items-center ${className}`}>
            <div>
                {leftBlock}
            </div>
            <div className={`${!editing ? 'bg-white' : ''} rounded-full display `}>
                {!editing ? <div className="flex gap-1 ">
                    <Button
                        icon={<ZYIcon type="edit" />}
                        className={`ppt-hover ppt-btn`}
                        onClick={() => onEdit('open')}>
                        编辑
                    </Button>
                </div>
                    :
                    <div className="flex cancelAndSaveBtn">
                        <div className="flex gap-1">
                            <Button
                                className={`ppt-btn pd-8-24 ppt-hover`}
                                onClick={() => onEdit('close')}>
                                取消
                            </Button>
                        </div>
                        <div className="flex gap-1 ">
                            <Button
                                className={`ppt-btn pd-8-24 ppt-active-hover ppt-active`}
                                onClick={() => onEdit('submit')}>
                                保存
                            </Button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

export default PreviewEditToolbar;
