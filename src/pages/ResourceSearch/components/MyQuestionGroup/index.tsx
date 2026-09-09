import { Flex, Typography, Select, Input, Button, Table, message, Tag, Modal } from "antd";
import type { TableProps } from 'antd';
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector, history } from "umi";
import PushToClassModal from "../PushToClassModal";
import AnalysisModal from "../../components/AnalysisModal";
import { useHeader } from "../../hooks/useHeader";
import { addNewTracking } from "@/utils";
import ZYIcon from "@/components/ZYIcon";

const { Text } = Typography;

import './index.less'
import dayjs from "dayjs";

const difficultyMap: any = {
  easy: {
    text: '容易',
    color: 'green'
  },
  easy_moderate: {
    text: '较易',
    color: 'blue'
  },
  medium: {
    text: '适中',
    color: 'processing'
  },
  moderate_hard: {
    text: '较难',
    color: 'orange'
  },
  hard: {
    text: '困难',
    color: 'red'
  },
}

const MyQuestionGroup = () => {
  const dispatch = useDispatch();
  const { setActiveTab } = useHeader();
  const {
    gradeName,
    subjectName,
    activeTab
  } = useSelector((state: any) => state.resourceSearchModel)
  const [modal, contextHolder] = Modal.useModal();
  const analysisModalRef = useRef<any>(null);
  const pushToClassModalRef = useRef<any>(null);
  const [searchName, setSearchName] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [currentData, setCurrentData] = useState<any>({});
  const [pagination, setPagination] = useState<any>({
    pageSize: 10,
    current: 1,
    total: 0,
  });
  const columns: TableProps<any>['columns'] = [
    {
      title: '练习名称',
      dataIndex: 'main_head',
      key: 'main_head',
      width: '40%'
    },
    {
      title: '学科',
      dataIndex: 'subject',
      key: 'subject',
      width: '8%'
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: '8%',
      render: (_, record) => <Tag bordered={false} color={difficultyMap[record.difficulty].color}>{difficultyMap[record.difficulty].text}</Tag>,
    },
    {
      title: '更新时间',
      key: 'updated_at',
      render: (_, record) => <span>{dayjs(record.updated_at).format('YYYY-MM-DD HH:mm:ss')}</span>,
      width: '15%'
    },
    {
      title: '操作',
      key: 'action',
      width: '28%',
      render: (_, record) => <span>
        <Button type="link" onClick={() => handlePushToClass(record)}>发布</Button>
        <Button type="link" onClick={() => handleAnalysis(record)}>分析</Button>
        <Button type="link" onClick={() => onview(record)}>查看</Button>
        <Button type="link" onClick={() => onedit(record)}>编辑</Button>
        <Button type="link" danger onClick={() => openDeleteModal(record)}>删除</Button>
      </span>,
    },
  ];

  useEffect(() => {
    if (activeTab === 'group') {
      getQuestionGroupList();
    }
  }, [gradeName, subjectName, pagination.current, pagination.pageSize, activeTab]);

  const onview = (record: any) => {
    const paperid = record?.paper_id;
    // 埋点
    // if (activeTab == 'personal') {
    //   addNewTracking({
    //     bt: 'pv',
    //     ct: 'ind_qbank_assign_exercise_preview_show',
    //     ctid: record?.paper_id,
    //     ctvl: record?.main_head
    //   })
    // }
    // if (activeTab == 'public') {
    //   addNewTracking({
    //     bt: 'pv',
    //     ct: 'ind_qbank_assign_exercise_preview_show',
    //     ctid: record?.paper_id,
    //     ctvl: record?.main_head
    //   })
    // }
    history.push(`/source/resourceSearch/paperDetail?paper_id=${paperid}`);
  }
  const onedit = (record: any) => {
    const paperid = record?.paper_id;
    history.push(`/source/resourceSearch/paperDetail?paper_id=${paperid}&editPaper=${true}`);
  }
  const getQuestionGroupList = async () => {
    setTableLoading(true);
    const { code, data }: any = await dispatch({
      type: "resourceSearchModel/getData",
      apiUrl: "getQuestionGroup",
      payload: {
        stage: gradeName,
        subject: subjectName,
        main_head: searchName,
        page: pagination.current,
        page_size: pagination.pageSize,
      },
    });
    if (code === 200) {
      setDataSource(data.list);
      setPagination({
        ...pagination,
        total: data.total,
      });
    }
    setTableLoading(false);
  };

  const deleteGroup = async(record: any) => {
    const { code, data }: any = await dispatch({
      type: "resourceSearchModel/postData",
      apiUrl: "deleteQuestionGroup",
      payload: {
        paper_id: record.paper_id,
      },
    });
    if (code === 200) {
      message.success('删除成功');
      setDataSource(dataSource.filter((item: any) => item.paper_id !== record.paper_id));
      setPagination({
        ...pagination,
        total: pagination.total - 1,
      });
    }
  }

  const handleAnalysis = (record: any) => {
    setCurrentData(record);
    analysisModalRef?.current?.openModal();
  }

  const handlePushToClass = (record: any) => {
    setCurrentData(record);
    pushToClassModalRef?.current?.openModal();
  }

  const openDeleteModal = (record: any) => {
    modal.confirm({
      title: '确认删除该练习？',
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
        },
      },
      onOk() {
        deleteGroup(record);
      },
    });
  }

  return (
    <Flex vertical gap={16} className="group-wrap">
      <Flex justify="space-between" gap={12} align="center" className="group-header">
        <Input.Search
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onSearch={() => getQuestionGroupList()}
          allowClear
          placeholder="请输入练习名称"
          style={{ width: 270 }}
        />
        {/* <Button type="primary" onClick={() => setActiveTab('personal')}>新增练习</Button> */}
      </Flex>
      <Table
        loading={tableLoading}
        dataSource={dataSource}
        columns={columns}
        pagination={{
          ...pagination,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination({
              ...pagination,
              pageSize,
              current: page
            });
          }
        }}
      />
      <PushToClassModal
        onRef={pushToClassModalRef}
        paperId={currentData?.paper_id}
        title={currentData?.main_head}
      />
       <AnalysisModal
        onRef={analysisModalRef}
        currentDataId={currentData?.paper_id}
        title={currentData?.main_head}
      />
      {contextHolder}
    </Flex>
  )
}

export default MyQuestionGroup;
