import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Select, Radio, Space, Drawer, Button, InputNumber, Empty,message,  } from 'antd';
import { BookOutlined, PictureOutlined } from '@ant-design/icons';
import { connect, useDispatch, useLocation } from '@umijs/max';
import QuestionsPdf from "@/pages/SetQuestions/components/QuestionsPdf";
import PDFViewer from "@/components/PDFViewer";
import { handleName } from "@/utils";
import ZYIcon from "@/components/ZYIcon";
import './index.less'; // 我们将在这个文件里写自定义样式

const options = [{ label: "全部", value: "全部" },
{ label: "教材", value: "教材" },
{ label: "讲义", value: "讲义" },
{ label: "文献", value: "文献" },
{ label: "参考书", value: "参考书" },
]

const CustomSelect = (props: any) => {

    const { onClosedata, onRef } = props;


    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const space_id = searchParams.get("courseId");
    const dispatch = useDispatch();
    const [dataList, setDataList] = useState([]);
    const [tagList, setTagList] = useState([]); // 所有tag
    const [activeLabel, setActiveLabel] = useState("全部"); //当前 tag
    const [open, setOpen] = useState(false);
    // const [loading, setLoading] = useState(false);
    const [relevantlist, setRelevantlist] = useState({})
    const [page_idx, setPage_idx] = useState<any>();
    const [relevantdata, setRelevantdata] = useState<any>([]);
    const [Customopen, setCustomopen] = useState(false); // 自定义标签弹窗
    const [totalpages, setTotalpages] = useState(99999);
    useImperativeHandle(onRef, () => ({
        showFication: () => {
            setCustomopen(!Customopen)
            if (!Customopen) {
                getTagList();
                getDataList()
            }
        }
    }))

    // 处理全部
    const getAllTag = () => {
        if (activeLabel == "全部") {
            return options?.map?.((item: any) => item.value);
        }
        return [activeLabel];
    };
    // 过滤当前tag
    const filterTag = () => {
        const userTagArr = options?.filter((item: any) =>
            tagList.includes(item["value"]),
        );
        return userTagArr;
    };

    const getDataList = async (param?: any) => {
        const payload = {
            space_id: space_id,
            labels: getAllTag(),
            page: 1,
            page_size: 130,
            ...param,
        };

        const { code, data }: any = await dispatch({
            type: "setQuestionsModel/postData",
            apiUrl: "docLabelListUrl",
            payload,
        });
        if (code == 200) {
            setDataList(data.list);
            // console.log(dataList);
        }
    };
    const getTagList = async () => {
        const { code, data = [] }: any = await dispatch({
            type: "teachSourceModel/postData",
            apiUrl: "docUnEmptyLabelUrl",
            payload: {
                space_id: space_id,
            },
        });
        let tmpTag = ["全部"];
        if (code == 200 && data.length > 0) {
            tmpTag.push(...data);
        }
        setTagList(tmpTag);
    };
    const relevant = (value: any) => {
        setRelevantlist(value);
        setOpen(true)
    }
    const tagRender = (dataList: any) => {
        return (
            <div >
                {
                    dataList.map((item: any) => {
                        return <div className='custom-tag' onClick={() => relevant(item)}>
                            <div className='custom-tag-icon'>
                                <ZYIcon type={handleName(item.doc_name, item.file_type).icon} />
                            </div>
                            <div className='custom-tag-content'>
                                <span className='custom-tag-content-label'>{handleName(item.doc_name).name}</span>
                            </div>
                        </div>
                    })
                }
            </div>
        );
    };
    const onClickTab = async (param: any) => {
        let { label } = param;
        setActiveLabel(label);
        let payload = { labels: [label] };
        if (label == "全部") {
            //  全部特殊处理
            payload["labels"] = options?.map?.((item: any) => item.value);
        }
        await getDataList(payload);
    };
    const onClosexq = () => {

        setRelevantlist({})
        setOpen(false)
        setPage_idx(undefined)
        setCustomopen(false)
    }
    const onTotalpages = (data: any) => {
       setTotalpages(data)
         
    }
    const onClose = () => {

        if (page_idx > totalpages) {
            // 提示用户输入的页码超出范围了
            message.error("输入的页码超出范围了");
        } else {
                 if (page_idx && relevantlist) {
                setRelevantdata([...relevantdata, { ...relevantlist, page_idx }])
                onClosedata({ ...relevantlist, page_idx });

            }
            setRelevantlist({})
            setPage_idx(undefined)
            setOpen(false)
            setCustomopen(false)
        }

    }
    const titleBox = () => {
        return (
            <div className="drawer_title_box">
                <p>{relevantlist?.doc_name}</p>
            </div>
        );
    };
    const contentScope = () => {
        return (
            <div className="drawer_content_scope">
                <div className="drawer_content_scope_box_css">
                    <div>
                        <span className="drawer_title_box_text">关联内容页面</span>
                        <InputNumber
                            className="drawer_title_box_input_number"
                            precision={0}
                            min={1}
                            max={99999}
                            placeholder="请输入页码"
                            value={page_idx}
                            step={1}
                            onChange={(value) => {
                                setPage_idx(value as number);
                            }}
                        />
                    </div>
                    <div>
                        <div className="drawer_title_btn">
                            <Button
                                style={{ marginRight: "6px" }}
                                className="back_btn_css_less"
                                onClick={() => {
                                    onClosexq();
                                }}
                            >
                                取消
                            </Button>
                            <Button
                                type="primary"
                                className="submit_btn_css_less"
                                onClick={() => {
                                    onClose();
                                }}
                            >
                                确认
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div>
            {
                Customopen && (
                    <div>
                        {
                            dataList?.length > 0 && (
                                <div className='container'>
                                    <div className='container-top'>
                                        {
                                            tagList?.length > 1 && (
                                                <div className='container-top-tab'>
                                                    {
                                                        filterTag()?.map((item) => {
                                                            return <div className={`container-top-tab-item${item.label === activeLabel ? "active" : ""}`} onClick={() => onClickTab(item)}
                                                                key={item.label}
                                                            >
                                                                {item.value === "全部"}
                                                                {item.value}
                                                            </div>
                                                        })
                                                    }
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className='container-bottom'>
                                        {tagRender(dataList)}
                                    </div>
                                    <Drawer
                                        closable={true}
                                        maskClosable={false}
                                        destroyOnHidden={true}
                                        onClose={onClosexq} // 关闭抽屉时销毁Drawer子元素
                                        title={titleBox()}
                                        placement="right"
                                        open={open}
                                        width={"720"}
                                        className='kGDrawervarder'
                                    >
                                        <div className="drawer_questions_pdf_box">
                                            {contentScope()}
                                            <div className="drawer_questions_pdf_box_csslist">
                                                {
                                                    relevantlist?.file_type == "pdf" ?
                                                        <PDFViewer fileInfo={relevantlist} onTotalpages={onTotalpages} /> : <QuestionsPdf docId={relevantlist?.id} />
                                                }
                                            </div>
                                        </div>
                                    </Drawer>
                                </div>
                            ) || (
                                <div className='container-kong'>
                                    <Empty
                                        description={<p>请先从左侧上传相关资料</p>}
                                        image={require("@/assets/courseEmpty.png")}
                                        imageStyle={{ width: 80, height: 48, margin: "0 auto 10px" }}
                                    />
                                </div>
                            )
                        }

                    </div>

                ) || (
                    <div>

                    </div>
                )
            }
        </div>

    );
};

export default CustomSelect;
