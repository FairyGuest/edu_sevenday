const BASE64_IMAGE_REGEX = /data:image\/[^;]+;base64,([a-zA-Z0-9+/=]+)/g;

/** 非选择题答案：表单为 string，快照里可能是 string 或 [string] */
export const resolveTextCorrectAnswer = (raw: any): string => {
  if (Array.isArray(raw)) {
    return raw[0] ?? "";
  }
  return raw ?? "";
};


export const checkBase64WithDispatch = async (dispatch: any, param: any) => {
  if (param == null) return "";
  const str =
    typeof param === "string" ? param : Array.isArray(param) ? (param[0] ?? "") : String(param);
  const matches: string[] = [];
  let match;
  while ((match = BASE64_IMAGE_REGEX.exec(str)) !== null) {
    matches.push(match[0]);
  }
  if (matches.length === 0) return str;

  const { data }: any = await dispatch({
    type: "commonModel/postData",
    apiUrl: "updbase64Url",
    payload: { images: matches },
  });

  let result = str;
  for (const [index, value] of matches.entries()) {
    result = result.replace(value, data?.[index] ?? "");
  }
  return result;
};
