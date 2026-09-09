import { Button } from "antd";
import ZYIcon from "@/components/ZYIcon";
import { useState } from "react";
import "./index.less";

interface PublishToLibraryBtnProps {
    loading?: boolean;
    onClickFunc: () => void;
    className?: string;
}
const PublishToLibraryBtn = (props: PublishToLibraryBtnProps) => {
    const { loading, onClickFunc } = props;
    // const [loading, setLoading] = useState(false);
    return (
        <Button
            type="primary"
            icon={<ZYIcon type="daochu" />}
            className={`publish_library_btn ${props?.className}`}
            loading={loading}
            onClick={onClickFunc}

        >
            发布到教学资源库
        </Button >
    );
};

export default PublishToLibraryBtn;