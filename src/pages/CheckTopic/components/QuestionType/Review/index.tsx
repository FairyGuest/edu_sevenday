import React, { useRef } from 'react'
import "./index.less"
import ZYIcon from '@/components/ZYIcon'
import AccuracyReviewModal from '../../AccuracyReviewModal';
import { connect, useDispatch } from "@umijs/max";
import {
    Typography,
    Modal,
    message,
    Image as ImageCode,
} from "antd";
function index(props: any) {
    const {
        row,
        testPaper,
        selectedValue,
        postCheckExamStudentFn,
    } = props
    const [modal, contextHolder] = Modal.useModal();
    const ReciewModal = useRef<any>(); // 评论弹窗
    const dispatch = useDispatch();
    const onReview = () => {
        ReciewModal.current.hideModal(row, testPaper, selectedValue);
    }
    const delReviewQuestion = () => {
        modal.confirm({
            title: (
                <div>
                    <span>
                        你确定删除这条评价吗?
                    </span>
                </div>
            ),
            icon: (
                <span className="anticon">
                    <ZYIcon type="shanchu1" style={{ color: "#EF4444" }} />
                </span>
            ),
            content: "",
            okButtonProps: {
                style: {
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                },
            },
            onOk() {
                delKbDocs();
            },
        });
    }
    const delKbDocs = async () => {
        let { code, data } = await dispatch({
            type: "setQuestionsModel/postData",
            apiUrl: "delQuestionReview",
            payload: {
                comment_id: row?.question_comment?.id,
            },
        });
        if (code == 200) {
            message.success("删除成功");
            postCheckExamStudentFn();
        }
    }
    return (
        <div className="review">
            {
                row?.question_comment == null && (
                    <span className="review-but" onClick={onReview}>
                        <ZYIcon className="review-but-icon" type={"edit"} style={{ fontSize: 12 }} /> 
                        题目点评
                    </span>
                ) || (
                    <div className="review-comment">
                        <div className="review-comment-item">
                            <span>{row?.question_comment?.content}</span>
                        </div>
                        <div className="review-comment-vard">
                            <span onClick={delReviewQuestion}>
                                <ZYIcon className="review-comment-vard-icon" type={"shanchu"} style={{ fontSize: 13 }} />
                                <span>删除</span>
                            </span>
                        </div>
                    </div>
                )
            }
            {contextHolder}
            <AccuracyReviewModal onRef={ReciewModal} questionopen={false}  postCheckExamStudentFn={postCheckExamStudentFn} />
        </div>
    )
}

export default connect((state: any) => ({
    authModel: state.authModel,
    commonModel: state.commonModel,
}))(index);
