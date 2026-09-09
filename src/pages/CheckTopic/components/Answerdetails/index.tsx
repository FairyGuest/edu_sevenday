import React, { useState, useImperativeHandle } from 'react'
import { Button, Modal } from 'antd';
import { connect, useDispatch } from "@umijs/max";
import MarkdownRender from "@/components/MarkdownRender";
import useMarkdownRender from '../../components/QuestionType/Problem/useMarkdownRender';
import './index.less'

function index(prpos: any) {
    const {
        onRef,
        homeworkData
    } = prpos;
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classQuestionId, setClassQuestionId] = useState(false)
    const [modalText, setModalText] = useState<any>();
    const [modalImage, setModalImage] = useState([]);
    const row = {
        question_type: 'cloze_test'
    }
    const { markdownRenderFn, renderSource, clampImgWidth } = useMarkdownRender(
        row
    );
    useImperativeHandle(onRef, () => ({
        showModal: (vader: any, classQuestionId = false) => {

            setIsModalOpen(true);
            setModalText(vader);
        },
    }));
    const handleOk = () => {
        setIsModalOpen(false);
        setModalImage([]);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setModalImage([]);
    };
    return (
        <>
            <Modal
                title="答案详情"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={800}
                footer={null}
                className='Answerdetails'
                styles={{
                    mask: {
                        overflow: 'visible'
                    }
                }}
                centered={true}
            >
                <div className='Answerdetails-modal'>
                    {
                        modalText?.length > 0 && modalText?.map((item: any, index: number) => {
                            return <div className='Answerdetails-modal-bottom' key={index}>
                                <img src={item?.url} alt="" />
                            </div>
                        })
                    }
                </div>
            </Modal>
        </>
    )
}

export default connect((state: any) => ({
    authModel: state.authModel,
    commonModel: state.commonModel,
}))(index);