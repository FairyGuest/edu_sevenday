import React, { useState, useEffect } from 'react'
import './index.less'
function index(props: any) {
    const { nodeList = {}, relationList = {}, relationNodeList = [], callback = () => { } } = props
    const [nodeListData, setNodeListData] = useState(relationNodeList || [])
    const [competency, setCompetency] = useState("")

    useEffect(() => {
        setNodeListData(relationNodeList)
        const type = nodeList?.competency?.slice(0, 2) || '应用'
        setCompetency(type)
    }, [relationNodeList])

    return (
        <div className='graphnode'>
            <div className='graphnode-title'>
                <span className='graphnode-title-icon'>基础信息</span>
            </div>
            <div className='graphnode-content'>
                <div className='graphnode-content-top'>
                    <div className='graphnode-content-top-left'>
                        <div className='graphnode-content-top-left-top'>
                            <div className='graphnode-content-top-left-top-left'>
                                <span className='titles'>知识点ID : </span>
                            </div>
                            <div className='graphnode-content-top-left-top-right'>
                                <span className='titles'>学科 : </span>
                            </div>
                        </div>
                        <div className='graphnode-content-top-left-bottom'>
                            <div className='graphnode-content-top-left-bottom-left'>
                                <span>{nodeList?.id}</span>
                            </div>
                            <div className='graphnode-content-top-left-bottom-right'>
                                <span >{nodeList?.subject}</span>
                            </div>
                        </div>
                    </div>
                    <div className='graphnode-content-top-right'>
                        <div className='graphnode-content-top-right-top'>
                            <div className='graphnode-content-top-right-top-left'>
                                <span className='titles'>能力要求 : </span>
                            </div>
                            <div className='graphnode-content-top-right-top-right'>
                                <span className='titles'>适应水平 : </span>
                            </div>
                        </div>
                        <div className='graphnode-content-top-right-bottom'>
                            <div className='graphnode-content-top-right-bottom-left'>
                                <span className='title-type'>{competency}</span>
                            </div>
                            <div className='graphnode-content-top-right-bottom-right'>
                                <span>{nodeList?.applicableLevel}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='graphnode-content-button'>
                    <div className='graphnode-content-button-top'>
                        <span className='titles'>关联页面 : </span>
                    </div>
                    <div className='graphnode-content-button-bottom'>
                        <span onClick={callback} className='jump'>{relationList?.doc_name} </span>
                    </div>
                </div>
            </div>
            <div className='graphnode-description'>
                <div className='graphnode-description-title'>
                    <div className='graphnode-description-title-left'>
                        <span className='titles'>节点描述 :</span>
                    </div>
                </div>
                <div className='graphnode-description-content'>
                    <div>
                        <span>{nodeList?.description}</span>
                    </div>
                </div>
            </div>
            {
                nodeListData?.length > 0 && <div className='graphnode-relationship'>
                    <span className='titles'>关系关联 : </span>
                    <div className='graphnode-relationship-content'>
                        <div>
                            {
                                nodeListData?.map((item: any, index: number) => {
                                    return <div key={index} className='graphnode-relationship-content-data'>
                                        <div className='graphnode-relationship-content-data-title'>
                                            <span>{item?.label}:&nbsp;&nbsp; {item?.node_description}</span></div>
                                        <span className='graphnode-relationship-content-data-item'>{item?.label_description}</span>
                                    </div>
                                })
                            }
                        </div>

                    </div>

                </div>

            }
        </div>
    )
}

export default index
