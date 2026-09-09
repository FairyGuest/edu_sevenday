import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "@umijs/max";
import { usePolling } from "@/pages/Home/hooks/usePolling";
import { normalizeExamRecords } from "../../utils/examListHelpers";
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  ENABLE_EXAM_LIST_POLLING,
  POLL_INTERVAL_MS,
  isApiSuccess,
} from "../constants";

export const useExamList = () => {
  const dispatch = useDispatch();

  const [examsList, setExamsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [payloadData, setPayloadData] = useState<Record<string, any>>({});
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const getList = useCallback(
    async (payload: Record<string, any> = {}, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setLoading(true);
      }
      const { code, data }: any = await dispatch({
        type: "settingTopicModel/postData",
        apiUrl: "postExamFindExamPage",
        payload: {
          current: payload.current ?? pageIndex,
          size: payload.size ?? pageSize,
          ...payload,
        },
      });
      if (isApiSuccess(code)) {
        setExamsList(normalizeExamRecords(data?.records));
        setTotal(data?.total);
      }
      if (!silent) {
        setLoading(false);
      }
    },
    [dispatch, pageIndex, pageSize],
  );

  const getPayloadFn = useCallback(
    (payload: Record<string, any>) => {
      setPayloadData(payload);
      setPageIndex(DEFAULT_PAGE_INDEX);
      getList({ ...payload, current: DEFAULT_PAGE_INDEX, size: pageSize });
    },
    [getList, pageSize],
  );

  const refreshList = useCallback(() => {
    setPageIndex(DEFAULT_PAGE_INDEX);
    getList({ ...payloadData, current: DEFAULT_PAGE_INDEX, size: pageSize });
  }, [getList, payloadData, pageSize]);

  const onPageChange = useCallback(
    (nextPage: number, nextSize: number) => {
      setPageSize(nextSize);
      setPageIndex(nextPage);
      getList({
        ...payloadData,
        current: nextPage,
        size: nextSize,
      });
    },
    [getList, payloadData],
  );

  useEffect(() => {
    getList({ current: DEFAULT_PAGE_INDEX, size: pageSize });
  }, []);

  usePolling(
    () => getList({ ...payloadData, current: pageIndex, size: pageSize }, { silent: true }),
    {
      interval: POLL_INTERVAL_MS,
      immediate: false,
      enabled: ENABLE_EXAM_LIST_POLLING,
    },
  );

  return {
    examsList,
    loading,
    pageIndex,
    pageSize,
    total,
    getPayloadFn,
    refreshList,
    onPageChange,
  };
};
