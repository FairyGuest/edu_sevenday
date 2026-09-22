import { useCallback, useEffect, useState } from "react";
import { requestJson } from "@/utils/request";
import { cogUrl } from "@/utils/host";

export interface CurriculumScope {
  class_id: string;
  student_id?: string;
  subject_id: string;
  textbook_id: string;
  curriculum_scope_type: "all" | "chapter" | "section" | "unit";
  curriculum_scope_id: string;
  start_date: string;
  end_date: string;
  sources: string;
  dataset_version?: string;
  framework_version?: string;
}
export async function supportRead(
  path: string,
  payload: any = {},
  signal?: AbortSignal,
) {
  const result = await requestJson(`${cogUrl}/teacher/support/${path}`, {
    method: "GET",
    payload,
    signal,
  });
  if (result?.code !== 200) throw new Error(result?.msg || "数据加载失败");
  return result.data;
}
export async function supportWrite(path: string, payload: any) {
  const result = await requestJson(`${cogUrl}/teacher/support/${path}`, {
    method: "POST",
    payload,
  });
  if (result?.code !== 200) throw new Error(result?.msg || "保存失败");
  return result.data;
}
export function useSupport(path: string, params: any = {}, enabled = true) {
  const key = JSON.stringify([
    path,
    Object.keys(params)
      .sort()
      .map((k) => [k, params[k]]),
  ]);
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data: any;
    error: string;
    loading: boolean;
  }>({ key: "", data: null, error: "", loading: true });
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let live = true;
    setResult({ key, data: null, error: "", loading: true });
    supportRead(path, params, controller.signal)
      .then((data) => {
        if (live) setResult({ key, data, error: "", loading: false });
      })
      .catch((error) => {
        if (live)
          setResult({ key, data: null, error: error.message, loading: false });
      });
    return () => {
      live = false;
      controller.abort();
    };
  }, [key, enabled, version]);
  const retry = useCallback(() => setVersion((v) => v + 1), []);
  // Hide stale scope data synchronously, before the next effect starts.
  return {
    ...(enabled && result.key === key
      ? result
      : { data: null, error: "", loading: enabled }),
    retry,
  };
}
