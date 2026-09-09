import { useMemo, useCallback, createElement } from "react";
import { Modal } from "antd";
import { ZYIcon } from "@/components";

type TabType = 1 | 2;

export type KnowledgeAfterChangeSnapshot = {
  knowledgePointChapter?: any[];
  oriKpoints?: any[];
};

interface UseKnowledgePointChapterOptions {
  knowledgePointChapter?: any[];
  setKnowledgePointChapter: (data: any[]) => void;
  recognitionKpoints?: any[];
  tagsDelete?: (type: string, dele?: any) => void;
  onAfterChange?: (snapshot?: KnowledgeAfterChangeSnapshot) => void;
}

export const useKnowledgePointChapter = ({
  knowledgePointChapter = [],
  setKnowledgePointChapter,
  recognitionKpoints = [],
  tagsDelete,
  onAfterChange,
}: UseKnowledgePointChapterOptions) => {
  const chapterList = useMemo(
    () => knowledgePointChapter.filter((item) => item?.chapter?.length > 0),
    [knowledgePointChapter],
  );

  const knowledgePointList = useMemo(
    () => knowledgePointChapter.filter((item) => item?.knowledgePoint?.length > 0),
    [knowledgePointChapter],
  );

  const hasChapter = chapterList.length > 0;
  const hasKnowledgePoint = knowledgePointList.length > 0;
  const hasRecognitionKpoints = recognitionKpoints.length > 0;

  const clearAll = useCallback(
    (tabType: TabType) => {
      const label = tabType === 1 ? "教材单元" : "知识点";

      Modal.confirm({
        title: `是否删除所有${label}?`,
        icon: createElement(ZYIcon, {
          type: "shanchu",
          style: { fontSize: 18, marginRight: "8px", transform: "translateY(3px)" },
        }),
        okText: "删除",
        cancelText: "取消",
        okButtonProps: { style: { backgroundColor: "#EF4444" } },
        onOk() {
          if (tabType === 1) {
            const nextKnowledgePointChapter = knowledgePointChapter.map((item) => ({
              ...item,
              chapter: [],
            }));
            setKnowledgePointChapter(nextKnowledgePointChapter);
            onAfterChange?.({ knowledgePointChapter: nextKnowledgePointChapter });
            return;
          }
          const nextKnowledgePointChapter = knowledgePointChapter.map((item) => ({
            ...item,
            knowledgePoint: [],
          }));
          setKnowledgePointChapter(nextKnowledgePointChapter);
          onAfterChange?.({
            knowledgePointChapter: nextKnowledgePointChapter,
            oriKpoints: [],
          });
        },
      });
    },
    [knowledgePointChapter, onAfterChange, setKnowledgePointChapter, tagsDelete],
  );

  const removeTag = useCallback(
    (val: any, item: any, tabType: TabType) => {
      const field = tabType === 1 ? "chapter" : "knowledgePoint";
      const nextKnowledgePointChapter = knowledgePointChapter.map((v) => {
        if (v?.textbook_id !== item?.textbook_id) return v;
        return {
          ...v,
          [field]: v?.[field]?.filter((i: any) => i?.key !== val?.key),
        };
      });

      setKnowledgePointChapter(nextKnowledgePointChapter);
      onAfterChange?.({ knowledgePointChapter: nextKnowledgePointChapter });
    },
    [knowledgePointChapter, onAfterChange, setKnowledgePointChapter],
  );

  const removeRecognitionTag = useCallback(
    (val: any) => {
      tagsDelete?.("1", val);
    },
    [tagsDelete],
  );

  return {
    chapterList,
    knowledgePointList,
    hasChapter,
    hasKnowledgePoint,
    hasRecognitionKpoints,
    clearAll,
    removeTag,
    removeRecognitionTag,
  };
};
