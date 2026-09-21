import { useEffect, useMemo, useState } from "react";
import { useLocation } from "@umijs/max";
import dayjs, { Dayjs } from "dayjs";
import { getDataService } from "@/pages/TeacherProfile/services";
import { defaultDateRange } from "@/pages/TeacherProfile/components/DatePresetGroup";
import { replacePageQuery } from "@/utils/pageQuery";
import { SOURCES, Scope } from "./domain";

export function useProfileScope() {
  const location = useLocation();
  const q = new URLSearchParams(location.search);
  const defaults = defaultDateRange();
  const parse = (key: string, fallback: Dayjs) => {
    const raw = q.get(key);
    return raw && dayjs(raw).isValid() ? dayjs(raw) : fallback;
  };
  const start = parse("start_date", defaults[0]).format("YYYY-MM-DD");
  const end = parse("end_date", defaults[1]).format("YYYY-MM-DD");
  const selected = (q.get("sources") || "")
    .split(",")
    .filter((s) => SOURCES.includes(s));
  const sourceKey = (selected.length ? selected : SOURCES).join(",");
  const sources = useMemo(() => sourceKey.split(","), [sourceKey]);
  const dateRange = useMemo<[Dayjs, Dayjs]>(
    () => (start <= end ? [dayjs(start), dayjs(end)] : defaults),
    [start, end],
  );
  const scope: Scope = useMemo(
    () => ({
      start_date: dateRange[0].format("YYYY-MM-DD"),
      end_date: dateRange[1].format("YYYY-MM-DD"),
      sources,
    }),
    [dateRange, sources],
  );
  const setSources = (next: string[]) => {
    if (next.length) replacePageQuery({ sources: next.join(",") });
  };
  const setDateRange = (dates: [Dayjs | null, Dayjs | null]) =>
    replacePageQuery({
      start_date: dates?.[0]?.format("YYYY-MM-DD") || null,
      end_date: dates?.[1]?.format("YYYY-MM-DD") || null,
    });
  return { sources, dateRange, scope, setSources, setDateRange };
}

export function usePortrait(classId: string, studentId = "") {
  const key = classId + ":" + studentId;
  const [state, setState] = useState<{
    key: string;
    data?: any;
    error?: string;
    loading?: boolean;
  }>({ key: "" });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    if (!classId) return;
    setState({ key, loading: true });
    getDataService(
      { class_id: classId, ...(studentId ? { student_id: studentId } : {}) },
      "portraitsUrl",
    )
      .then((result) => {
        if (!alive) return;
        setState(
          result?.code === 200
            ? { key, data: result.data }
            : { key, error: result?.msg || "画像数据暂不可用" },
        );
      })
      .catch(() => {
        if (alive) setState({ key, error: "画像数据加载失败，请重试" });
      });
    return () => {
      alive = false;
    };
  }, [key, retry]);
  return {
    ...(state.key === key ? state : { loading: !!classId }),
    retry: () => setRetry((n) => n + 1),
  };
}
