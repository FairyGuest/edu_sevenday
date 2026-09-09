import { ZYIcon } from "@/components";
import { Tag, Button } from "antd";
import { useKnowledgePointChapter } from "../../hooks";

interface KnowledgePointChapterComponentProps {
  knowledgePointChapter?: any[];
  setKnowledgePointChapter: (data: any[]) => void;
  showChapter?: boolean;
  showKnowledgePoint?: boolean;
  recognitionKpoints?: any[];
  tagsDelete?: (type: string, dele?: any) => void;
  statusType?: boolean;
  onAfterChange?: (snapshot?: { knowledgePointChapter?: any[]; oriKpoints?: any[] }) => void;
}

const EmptyPlaceholder = ({ type }: { type: 1 | 2 }) => (
  <div className="transfer-knowledge-point-empty">
    <p className="text">{type === 1 ? "请添加教材单元" : "请添加知识点"}</p>
  </div>
);

const KnowledgePointChapterComponent = ({
  knowledgePointChapter = [],
  setKnowledgePointChapter,
  showChapter = false,
  showKnowledgePoint = false,
  recognitionKpoints = [],
  tagsDelete,
  statusType = true,
  onAfterChange,
}: KnowledgePointChapterComponentProps) => {
  const {
    chapterList,
    knowledgePointList,
    hasChapter,
    hasKnowledgePoint,
    hasRecognitionKpoints,
    clearAll,
    removeTag,
    removeRecognitionTag,
  } = useKnowledgePointChapter({
    knowledgePointChapter,
    setKnowledgePointChapter,
    recognitionKpoints,
    tagsDelete,
    onAfterChange,
  });

  return (
    <div className="transfer-knowledge-point-chapter">
      {showChapter && (
        <div
          className="transfer-knowledge-point-chapter-right border"
          style={{ marginBottom: "16px" }}
        >
          <div className="transfer-knowledge-point-chapter-right-title">
            <span>
              <ZYIcon type="jiaocaidanyuan" style={{ fontSize: 14, marginRight: "4px" }} />
              教材单元
            </span>
            {hasChapter && (
              <span className="transfer-knowledge-point-chapter-right-delete">
                <Button
                  type="link"
                  icon={<ZYIcon type="shanchu" style={{ fontSize: 14 }} />}
                  onClick={() => clearAll(1)}
                  className="transfer-knowledge-point-chapter-right-delete-button"
                >
                  清空
                </Button>
              </span>
            )}
          </div>
          <div className="transfer-knowledge-point-chapter-right-chapter">
            {chapterList.map((item: any, index: number) => (
              <div
                className={
                  chapterList.length - 1 === index
                    ? ""
                    : "transfer-knowledge-point-chapter-right-box"
                }
                key={`${item?.textbook_id}-${index}`}
              >
                <div>
                  <span className="transfer-knowledge-point-chapter-right-chapter-title">
                    {item?.version_name}/{item?.textbook_name}
                  </span>
                  <div>
                    {item?.chapter?.map((val: any, chapterIndex: number) => (
                      <Tag
                        className="transfer-knowledge-point-chapter-right-chapter-tag"
                        closable={statusType}
                        key={`chapter-${item?.textbook_id}-${val?.key}-${chapterIndex}`}
                        onClose={() => removeTag(val, item, 1)}
                      >
                        {val?.title}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {!hasChapter && <EmptyPlaceholder type={1} />}
          </div>
        </div>
      )}

      {showKnowledgePoint && (
        <div className="transfer-knowledge-point-chapter-right border">
          <div className="transfer-knowledge-point-chapter-right-title">
            <span>
              <ZYIcon type="zhishidian" style={{ fontSize: 14, marginRight: "4px" }} />
              知识点
            </span>
            {(hasKnowledgePoint || hasRecognitionKpoints) && (
              <span className="transfer-knowledge-point-chapter-right-delete">
                <Button
                  type="link"
                  icon={<ZYIcon type="shanchu" style={{ fontSize: 14 }} />}
                  onClick={() => clearAll(2)}
                  className="transfer-knowledge-point-chapter-right-delete-button"
                >
                  清空
                </Button>
              </span>
            )}
          </div>
          <div className="transfer-knowledge-point-chapter-right-chapter">
            {(hasRecognitionKpoints || hasKnowledgePoint) && (
              <>
                {hasRecognitionKpoints && (
                  <div
                    className={
                      hasKnowledgePoint ? "transfer-knowledge-point-chapter-right-box" : ""
                    }
                  >
                    <div>
                      <span className="transfer-knowledge-point-chapter-right-chapter-title">
                        题目原有知识点
                      </span>
                      <div>
                        {recognitionKpoints.map((val: any, index: number) => (
                          <Tag
                            className="transfer-knowledge-point-chapter-right-chapter-tag"
                            closable={statusType}
                            key={`recognition-${val?.key}-${index}`}
                            onClose={() => removeRecognitionTag(val)}
                          >
                            {val?.title}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {knowledgePointList.map((item: any, index: number) => (
                  <div
                    className={
                      knowledgePointList.length - 1 === index
                        ? ""
                        : "transfer-knowledge-point-chapter-right-box"
                    }
                    key={`${item?.textbook_id}-${index}`}
                  >
                    <div>
                      <span className="transfer-knowledge-point-chapter-right-chapter-title">
                        {item?.version_name}/{item?.textbook_name}
                      </span>
                      <div>
                        {item?.knowledgePoint?.map((val: any, kpointIndex: number) => (
                          <Tag
                            className="transfer-knowledge-point-chapter-right-chapter-tag"
                            closable={statusType}
                            key={`kpoint-${item?.textbook_id}-${val?.key}-${kpointIndex}`}
                            onClose={() => removeTag(val, item, 2)}
                          >
                            {val?.title}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {!(hasKnowledgePoint || hasRecognitionKpoints) && <EmptyPlaceholder type={2} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgePointChapterComponent;
