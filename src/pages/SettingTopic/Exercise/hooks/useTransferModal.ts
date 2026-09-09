import { useState, useImperativeHandle, useEffect, useMemo, useCallback, useRef } from "react";
import { message } from "antd";
import { deepCopy } from "@/utils";
import {
  calculateCheckedDisplayNodes,
  countSelectedItems,
  displayNodesToCheckedKeys,
  filterTreeNodes,
  getAllChildIds,
  getAllNodeKeys,
  getFilterDataByType,
  hasDataByType,
  hasKnowledgeChapterSelection,
  mergeCheckedKeysWithFilteredTree,
  normalizeCheckedKeys,
} from "./transferModalTreeUtils";

interface UseTransferModalProps {
  onRef: any;
  chapterKnowledgePoints?: any;
  chooseTextbookVersion?: any;
  onChangeCascader?: (row: any) => void;
  okFn?: (data: any[]) => void;
  knowledgePointChapter?: any[];
}

type TextbookSelectionPatch = {
  chapter?: any[];
  knowledgePoint?: any[];
  chapterCheckedKeys?: string[];
  knowledgePointCheckedKeys?: string[];
};

const stripInternalSelectionFields = (data: any[] = []) =>
  data.map(({ chapterCheckedKeys, knowledgePointCheckedKeys, ...rest }) => rest);

export const useTransferModal = ({
  onRef,
  chapterKnowledgePoints = {},
  chooseTextbookVersion = {},
  onChangeCascader,
  okFn,
  knowledgePointChapter = [],
}: UseTransferModalProps) => {
  const [visible, setVisible] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [tabActive, setTabActive] = useState<1 | 2>(1);
  const [knowledgePointChapterData, setKnowledgePointChapterData] = useState<any[]>([]);
  const [expandedKeyskpoint, setExpandedKeyskpoint] = useState<string[]>([]);
  const [checkedKeyskpoint, setCheckedKeyskpoint] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");

  const knowledgePointChapterDataRef = useRef<any[]>([]);
  knowledgePointChapterDataRef.current = knowledgePointChapterData;

  const resetModalState = useCallback(() => {
    setKnowledgePointChapterData([]);
    setCheckedKeys([]);
    setCheckedKeyskpoint([]);
    setExpandedKeys([]);
    setExpandedKeyskpoint([]);
    setSearchText("");
  }, []);

  const buildNextTextbookData = useCallback(
    (prev: any[], textbookId: any, patch: TextbookSelectionPatch, meta?: any) => {
      if (!textbookId) return prev;

      const index = prev.findIndex((item) => item?.textbook_id === textbookId);
      const baseItem = {
        version_id: meta?.version_id ?? chooseTextbookVersion?.version_id,
        version_name: meta?.version_name ?? chooseTextbookVersion?.version_name,
        textbook_id: meta?.textbook_id ?? chooseTextbookVersion?.textbook_id,
        textbook_name: meta?.textbook_name ?? chooseTextbookVersion?.textbook_name,
      };

      if (index === -1) {
        const hasChapter = (patch.chapter || []).length > 0;
        const hasKnowledgePoint = (patch.knowledgePoint || []).length > 0;
        if (!hasChapter && !hasKnowledgePoint) return prev;
        return [...prev, { ...baseItem, ...patch }];
      }

      const existingItem = prev[index];
      const nextItem = { ...existingItem, ...patch };
      const chapterSame =
        JSON.stringify(existingItem?.chapter || []) === JSON.stringify(nextItem?.chapter || []);
      const knowledgePointSame =
        JSON.stringify(existingItem?.knowledgePoint || []) ===
        JSON.stringify(nextItem?.knowledgePoint || []);
      const chapterKeysSame =
        JSON.stringify(existingItem?.chapterCheckedKeys || []) ===
        JSON.stringify(nextItem?.chapterCheckedKeys || []);
      const knowledgePointKeysSame =
        JSON.stringify(existingItem?.knowledgePointCheckedKeys || []) ===
        JSON.stringify(nextItem?.knowledgePointCheckedKeys || []);

      if (chapterSame && knowledgePointSame && chapterKeysSame && knowledgePointKeysSame) {
        return prev;
      }

      const nextData = [...prev];
      nextData[index] = nextItem;
      return nextData;
    },
    [chooseTextbookVersion],
  );

  const upsertTextbookSelection = useCallback(
    (textbookId: any, patch: TextbookSelectionPatch) => {
      if (!textbookId) return;

      setKnowledgePointChapterData((prev) => {
        const nextData = buildNextTextbookData(prev, textbookId, patch);
        knowledgePointChapterDataRef.current = nextData;
        return nextData;
      });
    },
    [buildNextTextbookData],
  );

  const getCheckedKeysForTextbook = useCallback(
    (item: any, type: 1 | 2) => {
      const isChapter = type === 1;
      const storedKeys = isChapter ? item?.chapterCheckedKeys : item?.knowledgePointCheckedKeys;
      if (storedKeys !== undefined) return storedKeys;

      const displayNodes = isChapter ? item?.chapter : item?.knowledgePoint;
      const tree = isChapter
        ? chapterKnowledgePoints?.catalog_tree
        : chapterKnowledgePoints?.kpoints;
      return displayNodesToCheckedKeys(tree, displayNodes);
    },
    [chapterKnowledgePoints?.catalog_tree, chapterKnowledgePoints?.kpoints],
  );

  const syncCheckedKeysFromData = useCallback(
    (data: any[]) => {
      const textbookId = chooseTextbookVersion?.textbook_id;
      if (!textbookId) {
        setCheckedKeys([]);
        setCheckedKeyskpoint([]);
        return;
      }

      const current = data?.find((item) => item?.textbook_id === textbookId);
      if (!current) {
        setCheckedKeys([]);
        setCheckedKeyskpoint([]);
        return;
      }

      setCheckedKeys(getCheckedKeysForTextbook(current, 1));
      setCheckedKeyskpoint(getCheckedKeysForTextbook(current, 2));
    },
    [chooseTextbookVersion?.textbook_id, getCheckedKeysForTextbook],
  );

  const initModalFromKnowledgePointChapter = useCallback(
    (data: any[] = []) => {
      if (!hasKnowledgeChapterSelection(data)) {
        resetModalState();
        knowledgePointChapterDataRef.current = [];
        return;
      }
      knowledgePointChapterDataRef.current = data;
      setKnowledgePointChapterData(data);
      syncCheckedKeysFromData(data);
    },
    [resetModalState, syncCheckedKeysFromData],
  );

  const knowledgeChapterSignature = useMemo(
    () => JSON.stringify(knowledgePointChapter || []),
    [knowledgePointChapter],
  );
  const lastKnowledgeChapterSignatureRef = useRef("");

  useImperativeHandle(
    onRef,
    () => ({
      openModal: (overrideKnowledge?: any[]) => {
        setVisible(true);
        setTabActive(1);
        setSearchText("");
        initModalFromKnowledgePointChapter(
          overrideKnowledge ?? knowledgePointChapter ?? [],
        );
      },
    }),
    [initModalFromKnowledgePointChapter, knowledgePointChapter],
  );

  const persistCurrentTextbookSelection = useCallback(() => {
    const textbookId = chooseTextbookVersion?.textbook_id;
    if (!textbookId) return knowledgePointChapterDataRef.current;

    const chapterNodes = calculateCheckedDisplayNodes(
      chapterKnowledgePoints?.catalog_tree,
      normalizeCheckedKeys(checkedKeys),
    );
    const knowledgePointNodes = calculateCheckedDisplayNodes(
      chapterKnowledgePoints?.kpoints,
      normalizeCheckedKeys(checkedKeyskpoint),
    );

    const nextData = buildNextTextbookData(knowledgePointChapterDataRef.current, textbookId, {
      chapter: chapterNodes,
      knowledgePoint: knowledgePointNodes,
      chapterCheckedKeys: normalizeCheckedKeys(checkedKeys),
      knowledgePointCheckedKeys: normalizeCheckedKeys(checkedKeyskpoint),
    });
    knowledgePointChapterDataRef.current = nextData;
    setKnowledgePointChapterData(nextData);
    return nextData;
  }, [
    buildNextTextbookData,
    chapterKnowledgePoints?.catalog_tree,
    chapterKnowledgePoints?.kpoints,
    checkedKeys,
    checkedKeyskpoint,
    chooseTextbookVersion?.textbook_id,
  ]);

  const onOkClick = () => {
    const finalData = deepCopy(persistCurrentTextbookSelection());
    const { chapterCount, knowledgePointCount } = countSelectedItems(finalData);
    if (chapterCount > 10) {
      message.warning("最多选择10个教材单元目录");
      return;
    }
    if (knowledgePointCount > 10) {
      message.warning("最多选择10个知识点");
      return;
    }
    okFn?.(stripInternalSelectionFields(finalData));
    setVisible(false);
  };

  const onChangeCascaderFn = (_value: any, selectedOptions: any) => {
    persistCurrentTextbookSelection();
    onChangeCascader?.(selectedOptions);
  };

  const initTabSelection = () => {
    if (tabActive === 1) {
      setCheckedKeys([]);
      setExpandedKeys([]);
    } else {
      setExpandedKeyskpoint([]);
      setCheckedKeyskpoint([]);
    }
  };

  const emptybtn = () => {
    setKnowledgePointChapterData((prev) => {
      const next = prev.map((item) => ({
        ...item,
        ...(tabActive === 1
          ? { chapter: [], chapterCheckedKeys: [] }
          : { knowledgePoint: [], knowledgePointCheckedKeys: [] }),
      }));
      knowledgePointChapterDataRef.current = next;
      return next;
    });
    initTabSelection();
  };

  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();
    setSearchText(trimmedValue);

    if (tabActive === 1) {
      if (trimmedValue) {
        setExpandedKeys(getAllNodeKeys(chapterKnowledgePoints?.catalog_tree));
      } else {
        setExpandedKeys(chapterKnowledgePoints?.catalog_tree?.map((node: any) => node?.key) || []);
      }
      return;
    }

    if (trimmedValue) {
      setExpandedKeyskpoint(getAllNodeKeys(chapterKnowledgePoints?.kpoints));
    } else {
      setExpandedKeyskpoint(chapterKnowledgePoints?.kpoints?.map((node: any) => node?.key) || []);
    }
  };

  const onCloseTagFn = (val: any, item: any) => {
    const isChapter = tabActive === 1;
    const type = isChapter ? 1 : 2;
    const field = isChapter ? "chapter" : "knowledgePoint";
    const checkedField = isChapter ? "chapterCheckedKeys" : "knowledgePointCheckedKeys";
    const setCheckedField = isChapter ? setCheckedKeys : setCheckedKeyskpoint;

    setKnowledgePointChapterData((prev) => {
      const next = prev.map((v) => {
        if (v?.textbook_id !== item?.textbook_id) return v;
        const list = v?.[field]?.filter((i: any) => i?.key !== val?.key);
        const keysToRemove = new Set<string>([val?.key]);
        getAllChildIds(val).forEach((id) => keysToRemove.add(id));

        const baseCheckedKeys =
          (v?.[checkedField]?.length ?? 0) > 0
            ? v[checkedField]
            : item?.textbook_id === chooseTextbookVersion?.textbook_id
              ? normalizeCheckedKeys(isChapter ? checkedKeys : checkedKeyskpoint)
              : getCheckedKeysForTextbook(v, type);

        const nextCheckedKeys = baseCheckedKeys.filter(
          (key: string) => !keysToRemove.has(key),
        );
        if (item?.textbook_id === chooseTextbookVersion?.textbook_id) {
          setCheckedField(nextCheckedKeys);
        }
        return { ...v, [field]: list, [checkedField]: nextCheckedKeys };
      });
      knowledgePointChapterDataRef.current = next;
      return next;
    });
  };

  const onTreeCheck = (keys: any) => {
    setCheckedKeys((prev) => {
      const normalized = mergeCheckedKeysWithFilteredTree(
        prev,
        keys,
        filteredTreeData,
        searchText,
      );
      upsertTextbookSelection(chooseTextbookVersion?.textbook_id, {
        chapter: calculateCheckedDisplayNodes(chapterKnowledgePoints?.catalog_tree, normalized),
        chapterCheckedKeys: normalized,
      });
      return normalized;
    });
  };

  const onTreeCheckkpoint = (keys: any) => {
    setCheckedKeyskpoint((prev) => {
      const normalized = mergeCheckedKeysWithFilteredTree(
        prev,
        keys,
        filteredTreeKpointData,
        searchText,
      );
      upsertTextbookSelection(chooseTextbookVersion?.textbook_id, {
        knowledgePoint: calculateCheckedDisplayNodes(chapterKnowledgePoints?.kpoints, normalized),
        knowledgePointCheckedKeys: normalized,
      });
      return normalized;
    });
  };

  useEffect(() => {
    if (visible) return;
    if (knowledgeChapterSignature === lastKnowledgeChapterSignatureRef.current) return;
    lastKnowledgeChapterSignatureRef.current = knowledgeChapterSignature;
    initModalFromKnowledgePointChapter(knowledgePointChapter || []);
  }, [visible, knowledgeChapterSignature, knowledgePointChapter, initModalFromKnowledgePointChapter]);

  useEffect(() => {
    syncCheckedKeysFromData(knowledgePointChapterDataRef.current);
  }, [chapterKnowledgePoints, chooseTextbookVersion?.textbook_id, syncCheckedKeysFromData]);

  const filteredTreeData = useMemo(
    () => filterTreeNodes(chapterKnowledgePoints?.catalog_tree, searchText),
    [chapterKnowledgePoints?.catalog_tree, searchText],
  );

  const filteredTreeKpointData = useMemo(
    () => filterTreeNodes(chapterKnowledgePoints?.kpoints, searchText),
    [chapterKnowledgePoints?.kpoints, searchText],
  );

  const chapterFilterData = getFilterDataByType(knowledgePointChapterData, 1);
  const knowledgePointFilterData = getFilterDataByType(knowledgePointChapterData, 2);

  return {
    visible,
    setVisible,
    tabActive,
    setTabActive,
    searchText,
    chooseTextbookVersion,
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
    hasChapterData: hasDataByType(knowledgePointChapterData, 1),
    hasKnowledgePointData: hasDataByType(knowledgePointChapterData, 2),
    onOkClick,
    onChangeCascaderFn,
    emptybtn,
    handleSearch,
    onCloseTagFn,
    onTreeCheck,
    onTreeCheckkpoint,
  };
};
