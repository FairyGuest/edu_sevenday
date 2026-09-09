import { Modal, Input, Tree, Cascader, Tabs, Tooltip, Tag, Button } from "antd";
import { ZYIcon } from "@/components";
import { InfoCircleOutlined } from "@ant-design/icons";
import { TRANSFER_MODAL_TABS } from "../../constants";
import { useTransferModal } from "../../hooks";
import { useXkwTextbookCascader } from "../../../hooks/useXkwTextbookCascader";
import "./index.less";

interface TransferModalProps {
  onRef: any;
  chapterKnowledgePoints?: any;
  chooseTextbookVersion?: any;
  onChangeCascader?: (row: any) => void;
  okFn?: (data: any[]) => void;
  knowledgePointChapter?: any[];
}

const TransferModal = (props: TransferModalProps) => {
  const {
    visible,
    setVisible,
    tabActive,
    setTabActive,
    searchText,
    expandedKeys,
    setExpandedKeys,
    checkedKeys,
    expandedKeyskpoint,
    setExpandedKeyskpoint,
    checkedKeyskpoint,
    filteredTreeData,
    filteredTreeKpointData,
    chapterFilterData,
    knowledgePointFilterData,
    hasChapterData,
    hasKnowledgePointData,
    onOkClick,
    onChangeCascaderFn,
    emptybtn,
    handleSearch,
    onCloseTagFn,
    onTreeCheck,
    onTreeCheckkpoint,
  } = useTransferModal(props);
  const {
    cascaderOptions,
    cascaderValue,
    loadCascaderData,
    onCascaderChange,
  } = useXkwTextbookCascader({ isolated: true });

  const handleCascaderChange = (value: any[], selectedOptions: any[]) => {
    onChangeCascaderFn(value, selectedOptions);
    onCascaderChange(value, selectedOptions);
  };

  const searchPlaceholder = tabActive === 1 ? "输入章节搜索" : "输入知识点搜索";

  const emptyComponent = () => (
    <div className="transfer-modal-empty">
      <ZYIcon type="kongshuju7" />
      <p className="text">请从左侧添加章节或知识点</p>
    </div>
  );

  const renderSelectedTags = (items: any[], field: "chapter" | "knowledgePoint") =>
    items.map((item, index) =>
      item?.[field]?.length > 0 ? (
        <div
          key={`${item?.textbook_id}-${index}`}
          className={
            items.length - 1 === index ? "" : "transfer-modal-right-box"
          }
        >
          <span className="transfer-modal-right-chapter-title">
            {item?.version_name}/{item?.textbook_name}
          </span>
          <div>
            {item[field].map((val: any, tagIndex: number) => (
              <Tag
                className="transfer-modal-right-chapter-tag"
                closable
                key={`${field}-${item?.textbook_id}-${val?.key}-${tagIndex}`}
                onClose={() => onCloseTagFn(val, item)}
              >
                {val?.title}
              </Tag>
            ))}
          </div>
        </div>
      ) : null,
    );

  return (
    <Modal
      width={948}
      className="transfer-modal"
      title="添加教材单元及知识点"
      open={visible}
      destroyOnHidden
      onOk={onOkClick}
      centered
      onCancel={() => setVisible(false)}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ color: "#666", fontSize: "13px" }}>
            <InfoCircleOutlined style={{ marginRight: 4 }} />
            温馨提示：最多可选择10项教材单元或知识点
          </div>
          <div>
            <Button onClick={() => setVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" onClick={onOkClick}>
              确定
            </Button>
          </div>
        </div>
      }
    >
      <div className="transfer-modal-box">
        <div className="transfer-modal-top">
          <div className="transfer-modal-book">教材版本册别</div>
          <div>
            <Cascader
              className="transfer-modal-cascader"
              style={{ width: "320px" }}
              placeholder="请选择课程 / 版本 / 教材"
              options={cascaderOptions}
              value={cascaderValue}
              loadData={loadCascaderData}
              onChange={handleCascaderChange}
              changeOnSelect={false}
              allowClear={false}
              displayRender={(labels) => labels.join(" / ")}
            />
          </div>
        </div>
        <div className="transfer-modal-bottom">
          <Tabs
            defaultActiveKey="1"
            items={TRANSFER_MODAL_TABS}
            onChange={(value) => setTabActive(Number(value) as 1 | 2)}
          />
          <div className="transfer-modal-bottom-box">
            <div className="transfer-modal-left border">
              <div className="transfer-modal-left-title">
                {tabActive === 1 ? "可添加章节" : "可选知识点"}
              </div>
              <div className="transfer-modal-left-tree">
                <div style={{ marginBottom: "12px" }}>
                  <Input
                    value={searchText}
                    placeholder={searchPlaceholder}
                    onChange={(e) => handleSearch(e.target.value)}
                    allowClear
                    prefix={<ZYIcon type="sousuo" style={{ color: "#94A0B8", fontSize: 14 }} />}
                  />
                </div>
                {tabActive === 1 ? (
                  <Tree
                    autoExpandParent
                    checkable
                    blockNode
                    defaultExpandAll
                    expandedKeys={expandedKeys}
                    onExpand={(keys) => setExpandedKeys(keys as string[])}
                    fieldNames={{ key: "key" }}
                    treeData={filteredTreeData}
                    switcherIcon={
                      <span>
                        <ZYIcon type="xia" style={{ fontSize: 12 }} />
                      </span>
                    }
                    checkedKeys={checkedKeys}
                    checkStrictly={false}
                    onCheck={onTreeCheck}
                    titleRender={(nodeData: any) => (
                      <Tooltip title={nodeData?.title} placement="topLeft">
                        <div className="tree-node-title">{nodeData?.title}</div>
                      </Tooltip>
                    )}
                  />
                ) : (
                  <Tree
                    className="transfer-modal-kpoint-tree"
                    autoExpandParent
                    checkable
                    blockNode
                    defaultExpandAll
                    expandedKeys={expandedKeyskpoint}
                    onExpand={(keys) => setExpandedKeyskpoint(keys as string[])}
                    fieldNames={{ key: "key" }}
                    treeData={filteredTreeKpointData}
                    switcherIcon={
                      <span>
                        <ZYIcon type="xia" style={{ fontSize: 12 }} />
                      </span>
                    }
                    checkedKeys={checkedKeyskpoint}
                    checkStrictly={false}
                    onCheck={onTreeCheckkpoint}
                    titleRender={(nodeData: any) => (
                      <Tooltip title={nodeData?.title} placement="topLeft">
                        <div className="tree-node-title">{nodeData?.title}</div>
                      </Tooltip>
                    )}
                  />
                )}
              </div>
            </div>
            <div className="transfer-modal-right border">
              <div className="transfer-modal-right-title">
                <span>{tabActive === 1 ? "已选章节" : "已选知识点"}</span>
                <span className="transfer-modal-right-delete">
                  <Button
                    type="link"
                    icon={<ZYIcon type="shanchu" style={{ fontSize: 14 }} />}
                    onClick={emptybtn}
                    className="transfer-modal-right-delete-button"
                  >
                    清空
                  </Button>
                </span>
              </div>
              <div className="transfer-modal-right-chapter">
                {tabActive === 1 && (
                  <>
                    {chapterFilterData.length > 0 && renderSelectedTags(chapterFilterData, "chapter")}
                    {!hasChapterData && emptyComponent()}
                  </>
                )}
                {tabActive === 2 && (
                  <>
                    {knowledgePointFilterData.length > 0 &&
                      renderSelectedTags(knowledgePointFilterData, "knowledgePoint")}
                    {!hasKnowledgePointData && emptyComponent()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TransferModal;
