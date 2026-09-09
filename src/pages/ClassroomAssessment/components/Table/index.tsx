import { useEffect, useState } from "react";
import { useDispatch } from "umi";
import { Button, Input, Table, Space } from "antd";
import { ZYIcon } from "@/components";
import dayjs from "dayjs";

import "./index.less";

const columns = [
  {
    title: '项目名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '项目成员',
    dataIndex: 'members',
    key: 'members',
    render: (text: any, record: any) => (
      <Space size={"middle"}>
        <a style={{ color: "#1890FF" }}>成员管理</a>
        <a style={{ color: "#1890FF" }}>邀请成员</a>
      </Space>
    ),
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    render: (text: any) => dayjs(text).format('YYYY-MM-DD'),
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 200,
    render: (text: any, record: any) => (
      <>
        <Button color="primary" variant="link">查看</Button>
        <Button color="danger" variant="link">删除</Button>
      </>
    ),
  },
];

const data = [
  {
    key: "1",
    name: "二元二次函数，第2课时",
    create_time: "2025-09-09 11:26:32",
  },
  {
    key: "2",
    name: "二元二次函数，第1课时",
    create_time: "2025-09-08 11:26:32",
  },
];

const ClassTable = (props: any) => {
  const dispatch = useDispatch();

  const [dataList, setDataList] = useState<{
    key: string;
    name: string;
    create_time: string;
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [encStr, setEncStr] = useState("");


  useEffect(() => {
    // getDataList();
    getEncStr();
  }, []);

  const getEncStr = async () => {
    let { code, data }: any = await dispatch({
      type: "kaoshixing/getData",
      apiUrl: "getEncStr",
      payload: {
        org_code: "jsx",
      },
    });
    if (code === 200) {
      setEncStr(data);
    }
  };

  // 获取数据列表
  const getDataList = async () => {
    setLoading(true);
    // const { code, data }: any = await dispatch({
    //   type: "teachSourceModel/postData",
    //   apiUrl: "docLabelListUrl",
    //   payload: {},
    // });
    // if (code == 200) {
    //   setDataList(data?.list || []);
    // }

    setTimeout(() => {
      // setDataList([]);
      setDataList(data);
      setLoading(false);
    }, 200);
  };

  return (
    <div className="assessment-table">
      {/* <div className="table-header">
        <div className="table-header-title">项目列表</div>
        <div className="table-header-item">
          <Input
            maxLength={240}
            style={{ width: 240 }}
            placeholder="搜索“项目名称”"
            suffix={<ZYIcon type="sousuo" />}
          />
          <div className="table-header-item-right">
            <Button>加入项目</Button>
            <Button type="primary">创建项目</Button>
          </div>
        </div>
      </div>
      <Table
        size="small"
        loading={loading}
        columns={columns}
        dataSource={dataList}
        pagination={{
          size: "default",
          showSizeChanger: true,
        }}
      /> */}

      {encStr && <iframe
        title="互动课列表"
        style={{ width: "100%", height: "100vh" }}
        src={`https://report.thucps.com/third?token=${encStr}`}
      />}
    </div>
  );
}

export default ClassTable;
