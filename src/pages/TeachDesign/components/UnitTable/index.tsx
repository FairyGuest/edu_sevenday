import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "@umijs/max";
import { Button, Table, Tooltip } from "antd";
import MarkdownRender from "@/components/MarkdownRender";
import { ZYIcon } from "@/components";
import { addNewTracking, getOrgId } from "@/utils";

import "./index.less";

const UnitTable = (props: any) => {
  const { unitContent = {}, handlePlan } = props;
  const { leftChatLoading } = useSelector((state: any) => state.teachDesginModel);

  const tableRef = useRef<any>(null);
  const [columns, setColumns] = useState<any[]>([]); // 表格列配置
  const [rowData, setRowData] = useState<any[]>([]); // 表格数据
  const [isFullScreen, setIsFullScreen] = useState(false); // 是否全屏
  const [fullColumn, setFullColumn] = useState<any[]>([]); // 全屏列配置
  const [fullRowData, setFullRowData] = useState<any[]>([]); // 全屏数据

  useEffect(() => {
    const handleEsc = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };
    // 添加事件监听器
    document.addEventListener("fullscreenchange", handleEsc);
    return () => document.removeEventListener("fullscreenchange", handleEsc);
  }, []);

  // 表格列配置
  const allColumns = [
    {
      title: "课时",
      width: 60,
      dataIndex: "course_num",
      key: "course_num",
      fixed: "left",
      render: (text: string) => <div className="text-ellipsis">{text}</div>,
    },
    {
      title: "课时名称",
      dataIndex: "lesson_name",
      key: "lesson_name",
      fixed: "left",
      width: 120,
      render: (text: string) => <div className="text-ellipsis">{text}</div>,
    },
    {
      title: "课型",
      dataIndex: "class_type",
      key: "class_type",
      width: 120,
      fixed: "left",
      render: (text: string) => (
        <div
          style={{
            color: "#1c6cff",
            padding: "2px 8px",
            borderRadius: 8,
            background: "#edf4ff",
            width: "fit-content",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "单元功能",
      dataIndex: "unit_function",
      key: "unit_function",
      width: 140,
      render: (text: string) => <div className="text-ellipsis">{text}</div>,
    },
    {
      title: "核心任务",
      dataIndex: "core_task",
      key: "core_task",
      width: 200,
      render: (text: string) => <div className="text-ellipsis">
        <MarkdownRender>{text}</MarkdownRender>
      </div>,
    },
    {
      title: "课时目标",
      dataIndex: "lesson_target",
      key: "lesson_target",
      width: 200,
      render: (text: string) => <div className="text-ellipsis">{text}</div>,
    },
    {
      title: "核心议题",
      dataIndex: "core_topic",
      key: "core_topic",
      width: 200,
      render: (text: string) => <div className="text-ellipsis">{text}</div>,
    },
    {
      title: "目标承接关系",
      dataIndex: "objective_link",
      key: "objective_link",
      width: 200,
      render: (text: string) => <div className="text-ellipsis">{text}</div>,
    },
    {
      title: "教的活动",
      dataIndex: "teachers_main_activities",
      key: "teachers_main_activities",
      width: 320,
      render: (text: string, record: any) => (
        <Tooltip
          title={record?.expand ? "点击收起" : "点击展开"}
          placement="top"
        >
          <div className="text-ellipsis">
            <MarkdownRender>{text}</MarkdownRender>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "学的活动",
      dataIndex: "students_main_activities",
      key: "students_main_activities",
      width: 320,
      render: (text: string, record: any) => (
        <Tooltip
          title={record?.expand ? "点击收起" : "点击展开"}
          placement="top"
        >
          <div className="text-ellipsis">
            <MarkdownRender>{text}</MarkdownRender>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "评价重点",
      dataIndex: "evaluation_focus",
      key: "evaluation_focus",
      width: 200,
      render: (text: string) => <div className="text-ellipsis">
        <MarkdownRender>{text}</MarkdownRender>
      </div>,
    },
    {
      title: "评价与成果",
      dataIndex: "evaluation_result",
      key: "evaluation_result",
      width: 200,
      render: (text: string) => <div className="text-ellipsis">{text}</div>,
    },
    {
      title: "评价方式",
      dataIndex: "evaluation_method",
      key: "evaluation_method",
      width: 200,
      render: (text: string, record: any) => (
        <Tooltip
          title={record?.expand ? "点击收起" : "点击展开"}
          placement="top"
        >
          <div className="text-ellipsis">
            <MarkdownRender>{text}</MarkdownRender>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "设计意图",
      dataIndex: "design_purpose",
      key: "design_purpose",
      width: 200,
      render: (text: string, record: any) => (
        <Tooltip
          title={record?.expand ? "点击收起" : "点击展开"}
          placement="top"
        >
          <div className="text-ellipsis">
            <MarkdownRender>{text}</MarkdownRender>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "子主题",
      dataIndex: "class_content",
      key: "class_content",
      width: 200,
      render: (text: string) => <div className="text-ellipsis">{text}</div>,
    },
    {
      title: "操作",
      width: 84,
      dataIndex: "action",
      key: "action",
      fixed: "right",
      className: "action-column",
      onHeaderCell: () => ({ className: "action-column" }),
      onCell: () => ({ className: "action-column" }),
      render: (_: any, record: any) => (
        <Button
          className="action-cell-btn"
          color="blue"
          variant="link"
          disabled={leftChatLoading}
          onClick={(e) => {
            e.stopPropagation();
            handlePlan(record);
            // if (!record?.has_plan) {
            //   addNewTracking({
            //     bt: "cl",
            //     ct: "lesson_plan_unit_table_click_generate",
            //     extra: {
            //       unit_id: unitContent?.id,
            //       school_id: getOrgId("id"),
            //       school_name: getOrgId("title"),
            //       subject_name: unitContent?.stage + unitContent?.subject,
            //     },
            //   });
            // }
          }}
        >
          {record?.has_plan ? "查看课时教案" : "生成课时教案"}
        </Button>
      ),
    },
  ];

  useMemo(() => {
    const { table_columns = [], row_contents = [] } = unitContent;
    const newColumns = allColumns.filter((column: any) =>
      table_columns.includes(column.key),
    );
    const withRightFixed = (cols: any[]) => {
      const rightFixedCount = 1;
      const startIndex = Math.max(cols.length - rightFixedCount, 0);
      return cols.map((col, idx) => {
        if (idx < startIndex || col?.fixed === "left") return col;
        return { ...col, fixed: "right", width: col?.width ?? 200 };
      });
    };
    const normalColumns = withRightFixed([...newColumns, allColumns.at(-1)]);
    //setColumns(normalColumns);
    //setFullColumn(withRightFixed([...newColumns]));
    setColumns([...newColumns, allColumns.at(-1)]);
    setFullColumn([...newColumns]);
    // 处理表格数据
    const newData = row_contents.map((item: any) => {
      return {
        ...item,
        ...(item?.columns || {}),
      };
    });
    const newFullData = row_contents.map((item: any) => ({
      ...item,
      ...(item?.columns || {}),
      expand: true,
    }));
    setRowData(newData);
    setFullRowData(newFullData);
  }, [unitContent, leftChatLoading]);

  // 点击展开/收起行
  const onExpandClick = (record: any) => {
    const newData = [...rowData];
    newData.forEach((item: any) => {
      if (item.key === record.key) {
        item.expand = !record.expand;
      }
    });
    setRowData(newData);
  };

  // 全部展开/收起
  const onExpandAllClick = () => {
    const newData = [...rowData];
    const expandStatus = isAllExpanded(); // 判断是否全部展开
    newData.forEach((item: any) => {
      item.expand = !expandStatus;
    });
    setRowData(newData);
  };

  // 检测是否全部展开
  const isAllExpanded = () => {
    return rowData.every((item: any) => item.expand);
  };

  const scrollX = useMemo(() => {
    const activeColumns = isFullScreen ? fullColumn : columns;
    return activeColumns.reduce((sum, col) => sum + (col.width ?? 200), 0);
  }, [columns, fullColumn, isFullScreen]);
  // 点击全屏
  const fullScreenClick = () => {
    setIsFullScreen(true);
    tableRef?.current?.requestFullscreen();
  };
  // 退出全屏
  const exitFullscreen = () => {
    setIsFullScreen(false);
    document.exitFullscreen();
  };

  return (
    <>
      {rowData?.length > 0 && (
        <div className="unit-table" ref={tableRef}>
          <div className="table-header">
            {!isFullScreen && (
              <>
                <Tooltip title={isAllExpanded() ? "全部收起" : "全部展开"}>
                  <Button
                    type="text"
                    icon={
                      <ZYIcon
                        type={isAllExpanded() ? "quanshouqi" : "quanzhankai"}
                      />
                    }
                    onClick={() => onExpandAllClick()}
                  />
                </Tooltip>
                <Tooltip title="全屏">
                  <Button
                    type="text"
                    icon={<ZYIcon type="quanping" />}
                    onClick={() => fullScreenClick()}
                  />
                </Tooltip>
              </>
            )}
            {isFullScreen && (
              <Tooltip title="退出全屏">
                <Button
                  type="text"
                  icon={<ZYIcon type="close" />}
                  onClick={() => exitFullscreen()}
                />
              </Tooltip>
            )}
          </div>
          <Table
            columns={isFullScreen ? fullColumn : columns}
            dataSource={isFullScreen ? fullRowData : rowData}
            pagination={false}
            rowClassName={(record: any) => (record.expand ? "expand" : "")}
            onRow={(record: any) => {
              return {
                onClick: () => onExpandClick(record),
              };
            }}
            scroll={{ x: scrollX }}
            tableLayout="fixed"
            sticky={{ offsetHeader: 0 }}
          />
        </div>
      )}
    </>
  );
};

export default UnitTable;
