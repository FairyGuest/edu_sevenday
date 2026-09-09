import React, { useEffect, useRef, useState, useMemo } from "react";
import { Modal } from "antd";
import { EditableProTable } from "@ant-design/pro-components";
import { DeleteOutlined } from "@ant-design/icons";
import { connect, useDispatch, useLocation } from "@umijs/max";
import NodeRefDrawer from "../../components/NodeRefDrawer";
import "./index.less";
import { deepCopy } from "@/utils";

const App = (props: any) => {
  const { doc_ids } = props;
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const space_id = searchParams.get("courseId"); // 课程id

  const nodeReRef = useRef(null);
  const reRef = useRef(null);
  const [editableKeys, setEditableRowKeys] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const dispatch = useDispatch();

  useEffect(() => {
    getData();
  }, [doc_ids]);

  const chineseToEnglishMap: any = useMemo(
    () => ({
      相关于: "isRelatedTo",
      具有子知识点: "hasChild",
      先修于: "isPrerequisiteFor",
      包含: "includes",
      等价于: "isEquivalentTo",
    }),
    [],
  );
  const translateToEnglish = (chineseTerm: any) => {
    return chineseToEnglishMap[chineseTerm] || chineseTerm; // 如果没有对应翻译则返回原词
  };

  const getData = async (payload = {}) => {
    setLoading(true);
    const { code, data } = await dispatch({
      type: "kgDescModel/postData",
      apiUrl: "getGraphUrl",

      payload: {
        doc_ids: doc_ids || [],
        space_id: space_id,
        is_table: 1,
        ...payload,
      },
    });
    setLoading(false);
    await formatTableData(data);
  };

  // 将后端数据转换成表格数据
  const formatTableData = async (param: any) => {
    const { nodes = [], relations = [] } = param || {};
    let gNodeObj = {};
    for (const node of nodes) {
      // 构造 dict
      const { id } = node;
      gNodeObj[id] = node;
    }

    let tempRelation = [];
    for (const relation of relations) {
      // 构造 dict
      const { source_id, target_id } = relation;
      const source_label = gNodeObj[source_id]?.["title"]; // 找到开始节点
      const target_label = gNodeObj[target_id]?.["title"]; // 找到结束节点
      if (source_label && target_label) {
        tempRelation.push({
          ...relation,
          source_label,
          target_label,
          s_node: gNodeObj[source_id],
          t_node: gNodeObj[target_id],
        });
      }
    }
    setDataSource(tempRelation);
  };

  const onClickNode = (param: any) => {
    nodeReRef?.current?.showModal?.("add", param);
  };

  // 删除节点
  const delNode = async (payload = {}) => {
    const { code, data = [] }: any = await dispatch({
      type: "kgDescModel/postData",
      apiUrl: "delNodeUrl",
      payload,
    });
  };

  // 删除节点 加 关系线
  const deleteNode = (record: any, index: any) => {
    modal.confirm({
      title: (
        <div>
          <span>
            <span>你确定删除节点</span>
            <span style={{ marginLeft: "4px" }}>
              起始节点 {record?.source_label} 和结束节点 {record?.target_label}{" "}
              的关系吗?
            </span>
          </span>
        </div>
      ),
      icon: <DeleteOutlined style={{ color: "red" }} />,
      content: "",
      okButtonProps: {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      },
      async onOk() {
        const { source_id, target_id, doc_id } = record;
        // todo 一次请求
        await delNode({ node_id: source_id, doc_id });
        await delNode({ node_id: target_id, doc_id });
        const newSource = dataSource;
        newSource.splice(index, 1);
        setDataSource(deepCopy(newSource));
      },
    });
  };

  const columns: any = [
    {
      title: "起始节点",
      dataIndex: "source_label",
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: "此项是必填项",
          },
        ],
      },
      render: (text, record, index) => {
        return <a onClick={() => onClickNode(record.s_node)}>{text}</a>;
      },
    },
    {
      title: "关系类型",
      key: "label",
      dataIndex: "label",
      valueType: "select",
      valueEnum: {
        isRelatedTo: { text: "相关于", status: "isRelatedTo" },
        hasChild: { text: "具有子知识点", status: "hasChild" },
        isPrerequisiteFor: { text: "先修于", status: "isPrerequisiteFor" },
        includes: { text: "包含", status: "includes" },
        isEquivalentTo: { text: "等价于", status: "isEquivalentTo" },
      },
    },
    {
      title: "结束节点",
      dataIndex: "target_label",
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: "此项是必填项",
          },
        ],
      },
      render: (text, record, index) => {
        return <a onClick={() => onClickNode(record.t_node)}>{text}</a>;
      },
    },
    {
      title: "操作",
      valueType: "option",
      width: 200,
      render: (text, record, index, action) => [
        <a
          key="editable"
          disabled={record.is_master_doc}
          onClick={() => {
            if (record.is_master_doc) return;
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          disabled={record.is_master_doc}
          onClick={() => {
            if (record.is_master_doc) return;
            deleteNode(record, index);
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  // 更新节点 加 关系线
  const updatagraph = (rowKey: any, data: any, row: any) => {
    const { source_id, target_id, source_label, target_label } = data;
    updDataNode({ label: source_label, node_id: source_id });
    updDataNode({ label: target_label, node_id: target_id });
    onClickUpdLink(data);
  };

  // 更新关系
  const updDataNode = async (values?: any) => {
    let { code, data } = await dispatch({
      type: "kgDescModel/postData",
      apiUrl: "renameUrl",
      payload: {
        ...values,
      },
    });
  };

  // 更新节点
  const onClickUpdLink = async (param: any) => {
    let { code, data } = await dispatch({
      type: "kgDescModel/postData",
      apiUrl: "uprellabelUrl",
      isInfo: true, // api 请求成功提示
      payload: {
        id: param?.id,
        space_id: param?.space_id,
        source_id: param?.source_id,
        target_id: param?.target_id,
        source_label: param?.source_label,
        target_label: param?.target_label,
        doc_id: param?.doc_id || "",
        label: translateToEnglish(param?.label) || param?.label,
      },
    });
  };

  return (
    <div className="table-container">
      <EditableProTable
        className="table-container-table"
        rowKey="id"
        maxLength={5}
        scroll={{
          x: 960,
        }}
        recordCreatorProps={false}
        loading={loading}
        columns={columns}
        value={dataSource}
        onChange={setDataSource}
        editable={{
          type: "multiple",
          editableKeys,
          onSave: async (rowKey, data, row) => {
            await updatagraph(rowKey, data, row);
          },
          onChange: setEditableRowKeys,
        }}
      />
      {contextHolder}
      <NodeRefDrawer {...props} onRef={nodeReRef} />
    </div>
  );
};

export default connect((state: any) => ({
  kgDescModel: state.kgDescModel,
}))(App);
