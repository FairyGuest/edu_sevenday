import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "@umijs/max";
import { useTeacherContext } from "@/components/LayoutSider";
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAPER_ORDERS,
  isApiSuccess,
} from "../constants";

export const usePaperList = () => {
  const dispatch = useDispatch();
  const [context] = useTeacherContext();
  const courseId = context?.course_id;
  const { xkwSubjectId = "", xkwCascaderValue = [] } = useSelector(
    (state: any) => state.settingTopicModel,
  );
  // 仅三级都选中时作为刷新依据，避免展开一级时 subjectId 变化误触发
  const cascaderKey =
    (xkwCascaderValue?.length ?? 0) === 3
      ? JSON.stringify(xkwCascaderValue)
      : "";

  const [paperList, setPaperList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [searchPayload, setSearchPayload] = useState<Record<string, any>>({});
  const searchPayloadRef = useRef<Record<string, any>>({});

  const getList = useCallback(
    async (
      page = DEFAULT_PAGE_INDEX,
      size = DEFAULT_PAGE_SIZE,
      search?: Record<string, any>,
    ) => {
      const resolvedSearch = search ?? searchPayloadRef.current;
      setLoading(true);
      const { code, data }: any = await dispatch({
        type: "settingTopicModel/postData",
        apiUrl: "postPaperFindTeacherPaperPage",
        payload: {
          current: page,
          size,
          orders: DEFAULT_PAPER_ORDERS,
          ...(xkwSubjectId ? { subjectId: xkwSubjectId } : {}),
          ...resolvedSearch,
        },
      });
      if (isApiSuccess(code)) {
        setPaperList(Array.isArray(data?.records) ? data.records : []);
        setTotal(data?.total ?? 0);
      }
      setLoading(false);
    },
    [dispatch, xkwSubjectId],
  );

  const getListRef = useRef(getList);
  getListRef.current = getList;

  const getPayloadFn = useCallback(
    (payload: Record<string, any>) => {
      if (!cascaderKey) return;
      searchPayloadRef.current = payload;
      setSearchPayload(payload);
      setPageIndex(DEFAULT_PAGE_INDEX);
      getList(DEFAULT_PAGE_INDEX, pageSize, payload);
    },
    [cascaderKey, getList, pageSize],
  );

  const refreshList = useCallback(() => {
    getList(pageIndex, pageSize);
  }, [getList, pageIndex, pageSize]);

  const onPageChange = useCallback(
    (nextPage: number, nextSize: number) => {
      setPageSize(nextSize);
      setPageIndex(nextPage);
      getList(nextPage, nextSize);
    },
    [getList],
  );

  // 级联选满三级（课程/版本/教材）后再刷新列表
  useEffect(() => {
    if (!cascaderKey) {
      setPaperList([]);
      setTotal(0);
      setPageIndex(DEFAULT_PAGE_INDEX);
      return;
    }
    setPageIndex(DEFAULT_PAGE_INDEX);
    getListRef.current(DEFAULT_PAGE_INDEX, pageSize);
  }, [cascaderKey, pageSize]);

  return {
    paperList,
    loading,
    courseId,
    pageIndex,
    pageSize,
    total,
    getPayloadFn,
    refreshList,
    onPageChange,
  };
};
