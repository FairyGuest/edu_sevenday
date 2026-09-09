import React, { useState, useEffect, useRef } from "react";
import { connect, useDispatch, useLocation } from "@umijs/max";
import { Layout } from "antd";

import RelationGraph from "./components/RelationGraph";
import GraphCard from "@/components/GraphCard";
// import GraphFooter from './components/GraphFooter'
import GraphHeader from "./components/Header";
import RefModal from "./components/RefModal";

import "./index.less";
import { addTracking } from "@/utils";

const { Sider, Content } = Layout;

const App = (props: any) => {

    const { curSubject } = props.kgDescModel
    const dispatch = useDispatch();
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const action = searchParams.get("action"); // 课程id
    const space_id = searchParams.get("courseId"); // 课程id
    // const [curSubject, setCurSubject] = useState<any>({});
    const [selectBookList, setSelectBookList] = useState([]);
    const [curNode, setCurNode] = useState<any>(true);
    const [docids, setDocIds] = useState<any>([]);
    const sfRef = useRef<any>(null); // 文件上传
    const ndRef = useRef<any>(null); // 节点编辑
    const ghRef = useRef<any>(null); // 节点编辑
    const relationRef = useRef<any>(null); // 图谱

  useEffect(() => {
    // todo 获取学科详情
    getSubjectData({ graph_id: space_id });
    addTracking({ page_name: "图谱建设" })   // 数据埋点
  }, []);

  // 获取学科详情
  const getSubjectData = async (values?: any) => {
    await dispatch({
      type: 'kgDescModel/postData',
      apiUrl: "getSubjectInfoUrl",
      mTitle: "curSubject",
      payload: { ...values, }
    });
  }
  // 更新学科详情
  const updataSubject = async () => {
    await getSubjectData({ "graph_id": space_id })
  }

// 编辑节点
const editNode = (param: any) => {
  ndRef.current.showModal("edit", param);
};

    // 文件上传成功
    const onUploadSuccess = (param: any, label: any) => {
        const { data } = param?.file?.response || {}
        const row = data?.[0] || {}
        const { doc_name, } = row
        const { categories } = curSubject
        const category = categories?.[0] || ""
        const name = doc_name?.split(".")?.[0] || ""
        sfRef?.current?.showModal?.("edit", { ...curSubject, ...row, name, category, file_label: label })
    }



    // 文件加载成功
    const getDocGraph = (param: any, label: any) => {
        setSelectBookList(param)
        const doc_ids = param?.map?.((item: any) => item.id)
        relationRef?.current?.getGraph?.({ doc_ids })
        setDocIds(doc_ids)
    }
    // 选择节点
    const onChangeCheck = (row: any, selectData: any, allData: any) => {

        const doc_ids = selectData?.map?.((item: any) => item.id)
        relationRef?.current?.getGraph?.({ doc_ids })
        if (selectData?.length > 0) {
            setCurNode(true)
        } else {
            setCurNode(false)
        }
        setDocIds(doc_ids)

    }

    //  tag 加载成功
    const getTag=()=>{

    }




    return (
        <>

            <Layout className=''>
                <GraphHeader subjectData={curSubject} updataSubject={updataSubject} />
                <Layout>
                    <Sider width={"248px"} className='subject_graph_sider' >
                        <GraphCard
                            onRef={ghRef}
                            curSubject={curSubject}
                            textbookList={selectBookList}
                            showType="checkbox"
                            multiple={false}
                            options={[
                                { label: "全部", value: "全部" },
                                { label: "教材", value: "教材" },
                                { label: "教学计划", value: "教学计划" },
                                { label: "教案讲义", value: "讲义" },
                                { label: "文献", value: "文献" },
                                { label: "参考书", value: "参考书" },
                                // { label: "其他", value: "其他" },
                            ]}
                            onLoadDoc={getDocGraph} // 文件加载成功回调
                            onLoadTag={getTag} // tag 加载成功回调
                            onChangeCheck={onChangeCheck} // tag 加载成功回调
                            onUploadSuccess={onUploadSuccess}  // 文件上传成功回掉
                            // checkFn={onCheckDocs}
                            fetchListUrlKey="docLabelListGraphUrl"  // SetQuestions/serivice
                            fetchFileUrl="/kb_docs/knowledge_graph_upload_docs"  // 文件上传
                            showUploadFile={action == "edit"}  // 显示
                            defaultCheck={true}
                            showEdit={false}
                        // showDropdown={action=="edit"}  // SetQuestions/serivice
                        />
                    </Sider>

                    <RelationGraph
                        subjectData={() => curSubject}
                        action={action}
                        onRef={relationRef}
                        onEdit={editNode}
                        curNode={curNode}
                        doc_ids={docids}
                        selectBookList={selectBookList}
                    />
                </Layout>


            </Layout>

            <RefModal
                onRef={sfRef}
                onLoadTable={() => ghRef?.current?.getDoc?.()}
            />

        </>
    )
}


export default connect((state: any) => ({
  kgDescModel: state.kgDescModel,
}))(App);
