import { getDataRequest, postDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

export async function researchRead(path: string, params: any = {}) {
  const result = await getDataRequest(params, `${cogUrl}/teacher/research/${path}`);
  if (result?.code !== 200) throw new Error(result?.msg || "教研数据加载失败");
  return result.data;
}
export async function researchWrite(path: string, data: any) {
  const result = await postDataRequest(data, `${cogUrl}/teacher/research/${path}`);
  if (result?.code !== 200) throw new Error(result?.msg || "保存失败，请重试");
  return result.data;
}
