

import React, { useState, useEffect, useRef, useImperativeHandle } from 'react'
import { connect, useDispatch } from '@umijs/max';



import "./index.less"
import { Form, Input, Modal } from 'antd';

const App = (props: any) => {

    const { onRef } = props
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actType, setActType] = useState('add');
    const [curRow, setCurRow] = useState({}); // 缓存编辑带过来的数据

    useEffect(() => {

    }, [])

    // 父掉子函数
    useImperativeHandle(onRef, () => ({
        showModal: (category = "add", param?: any) => {
            setOpen(true);
            setActType(category);
            //   if (category == "add") clearForm() // 添加初始化，清空之前表单信息
            if (category == "edit") initForm(param) // 修改初始化，
        },
    }));


    // 初始化表单
    const initForm = (param: any) => {
        const { ...rest } = param;
        form.setFieldsValue(rest);
        setCurRow(param)
    }


    // 取消弹框
    const handleCancel = () => {
        setOpen(false);

    };


    //  表单提交
    const handleOk = () => {
        form.submit()
    };


    // 修改数据
    const updData = async (values?: any) => {
        let { code, data } = await dispatch({
            type: 'kgDescModel/postData',
            apiUrl: "renameUrl",
            isInfo: true, // api 请求成功提示
            payload: { ...values, node_id: curRow["id"] }
        });
        if (code == 200) {
            props?.onLoadData?.(values || "" ) // 加载表格
            handleCancel()
        }
    }


    const onFinish = (param: any) => {
        const payload = {
            ...param,
            //   space_id,
            //   doc_id
        }
        // if (actType == "add") {
        //   return addData(payload)
        // }
        updData(payload)
    };



    return (

        <>
            <Modal

                title={"节点重命名"}
                open={open}
                destroyOnHidden={true}
                confirmLoading={loading}
                onOk={handleOk}
                onCancel={() => handleCancel()}
                destroyOnHidden={true}
            >
                <Form form={form} layout="vertical" initialValues={{}}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="label"
                        label="名称"
                        rules={[{ required: true, message: '请输入名称' }]}
                    >
                        <Input placeholder="请输入名称" showCount maxLength={20} />
                    </Form.Item>
                </Form>
            </Modal>



        </>
    )
}



export default connect((state: any) => ({
    commonModel: state.commonModel,
}))(App);
