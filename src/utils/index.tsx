import { requestJson } from "@/utils/request";
import { message } from "antd";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cogUrl } from "./host";
import dayjs from "dayjs";
import { history } from "@@/core/history";

let controller = null;
export const stopSSE = () => {
  controller?.abort?.();
};

export async function getDataRequest(params: any, url: string) {
  const result = requestJson(url, {
    method: "get",
    payload: params,
  });
  return result;
}

export async function postDataRequest(params: any, url: string, extra?: { headers?: Record<string, string> }) {
  const result = requestJson(url, {
    method: "post",
    payload: params,
    extraHeaders: extra?.headers,
  });
  return result;
}

export async function putDataRequest(params: any, url: string) {
  const result = requestJson(url, {
    method: "put",
    payload: params,
  });
  return result;
}

export async function delDataRequest(params: any, url: string) {
  const result = requestJson(url, {
    method: "delete",
    payload: params,
  });
  return result;
}

export function formatCurrency(amount: any) {
  // 去除小数点后多余的0
  amount = parseFloat(amount).toFixed(2);
  // 添加千分位符号并返回结果
  return amount.replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
}

export function formatNum(number: any) {
  var reg = /\d{1,3}(?=(\d{3})+$)/g;
  return (number + "").replace(reg, "$&,");
}

// todo 处理 window.open
export const windowOpen = (url: any) => {
  const formatBase = BASE.replace(/\/$/g, "");
  // const formatBase = "";
  let tempUrl = url;
  if (formatBase && !url.includes("http")) {
    tempUrl = [formatBase, url].join("");
  }
  window.open(tempUrl);
};

export function getDot(param: any, index: any) {
  return param.length > 1 && param.length - 1 !== index ? (
    <span>、</span>
  ) : null;
}

// 深度拷贝
export function deepCopy(param: any) {
  return JSON.parse(JSON.stringify(param));
}

export const getStorageToken = () => {
  return localStorage.getItem("accessToken");
};

/** 登录后写入 token，自动补全 Bearer 前缀 */
export const setStorageToken = (token?: string | null) => {
  if (token == null || token === "") {
    localStorage.removeItem("accessToken");
    return;
  }
  const value = String(token).startsWith("Bearer ")
    ? String(token)
    : `${token}`;
  localStorage.setItem("accessToken", value);
};

/** 不含 Bearer 前缀的纯 token（用于 query 等场景） */
export const getRawStorageToken = () => {
  const token = localStorage.getItem("accessToken") || "";
  return token.startsWith("Bearer ") ? token.slice(7) : token;
};

//  sse 请求
export function sseRequset(
  payload: any,
  successCallback: any,
  errCallback?: any,
) {
  controller?.abort?.();
  controller = new AbortController();
  let signal = controller.signal;
  const Authorization = getStorageToken();
  const { sseUrl, ...rest } = payload;
  const headers = {
    Authorization: `${Authorization}`,
    "Content-Type": "application/json",
    Accept: "*/*",
  };

  return fetchEventSource(sseUrl, {
    method: "POST",
    signal: signal,
    headers,
    openWhenHidden: true,
    body: JSON.stringify(rest),
    onmessage(msg) {
      successCallback(msg);
    },
    // onerror(err) {
    //
    //   // 必须抛出错误才会停止
    //   throw err;
    // },
    onerror(err) {
      // 必须抛出错误才会停止
      errCallback?.(err);
      stopSSE(); // 必须抛出错误才会停止
      throw err;

      //
      // if (err) {
      //   stopSSE(); // 必须抛出错误才会停止
      //   throw err; // rethrow to stop the operation
      // } else {
      //
      //   stopSSE(); // 必须抛出错误才会停止
      //   throw err; // rethrow to stop the operation

      //   // 设置一个默认的重试间隔 10min
      //   // const retryInterval = 1000 * 60 * 10;
      //   // return retryInterval; // 返回重试间隔
      // }
    },
  });
}

// 对话进行中
export const chatMessageInfo = () => {
  message.info({ content: "当前对话正在进行中", key: "chatKey" });
};

// 复制文本去掉样式
export const selecthandler = (event: any) => {
  event.preventDefault(); // 阻止默认粘贴行为
  const clipboardData = event.clipboardData || window.clipboardData; // 获取剪贴板数据
  const text = clipboardData.getData("text/plain"); // 获取纯文本
  document?.execCommand("insertText", false, text); // 将纯文本插入到 div 中
};

//  获取最后光标
export const getEndFoucs = (ref: any) => {
  setTimeout(() => {
    const contentEditableElement = ref.current;
    if (contentEditableElement) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentEditableElement);
      range.setStart(
        contentEditableElement,
        contentEditableElement.childNodes.length,
      );
      range.setEnd(
        contentEditableElement,
        contentEditableElement.childNodes.length,
      );
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, 100);
};

// 全局警告提示
export const messageWaring = (content: any, key?: string) => {
  message.warning({ content: content, key: key || "warningKey" });
};

export const bytesToSize = (bytes: any) => {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) {
    return "0B";
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) {
    return `${bytes}${sizes[i]}`;
  }
  return `${(bytes / 1024 ** i).toFixed(1)}${sizes[i]}`;
};

//  通过文件名字 获取 icon
export const getFileIcon = (url: any) => {
  const isPdf = url.toLowerCase().endsWith(".pdf");
  const isDoc = url.toLowerCase().endsWith(".docx");
  const isXlsx =
    url.toLowerCase().endsWith(".xlsx") ||
    url.toLowerCase().endsWith(".csv") ||
    url.toLowerCase().endsWith(".xls");
  const isTxt = url.toLowerCase().endsWith(".txt");
  if (isPdf) {
    return <FilePdfOutlined className="itemIconSp" />;
  }
  if (isDoc) {
    return <FileWordOutlined className="itemIconSp" />;
  }
  if (isXlsx) {
    return <FileExcelOutlined className="itemIconSp" />;
  }
  if (isTxt) {
    return <FileTextOutlined className="itemIconSp" />;
  }
  return <FileTextOutlined className="itemIconSp" />;
};

export const uuid = () => {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
};

// 更新对话内容
export const updChatList = (list: any, param: any, index?: any) => {
  const tempList = deepCopy(list);
  let tempIndex = index == undefined ? list.length - 1 : index;
  tempList[tempIndex] = { ...tempList[tempIndex], ...param };
  return tempList;
};

// 去掉html 标签
export const removeHtmlTags = (str: any) => {
  return str.replace(/<[^>]+>/g, "");
};

// 获取最后一个字符
export const getLastChar = (row: any) => {
  let temp = row?.trim?.().slice(-1); // 获取最后一个字符
  let endChar = "";
  // 只有最后一个字符为其中之一
  if (["，", "。", "？", "！", "、", "；", "：", ".", "。"].includes(temp)) {
    endChar = temp;
    row = row?.trim?.()?.slice(0, -1); // 删除最后一个字符
  }
  return { newEndChar: endChar, newRow: row };
};

//  获取替换后到文本、来源数据、最后一个字段
export const handlerHtmlText = (children: any, citations: any) => {
  let tempChildren = children;
  let sourceArr = []; // 来源
  let endChar = ""; // 最后一个字符

  // 子元素转换成数组
  const tempChildrenArr = Array.isArray(tempChildren)
    ? tempChildren
    : [tempChildren];
  const newChildrenArr = []; // 构建新的来源
  const childrenCount = tempChildrenArr.length; // 子元素个数

  for (let [index, row] of tempChildrenArr.entries()) {
    // 字符串替换来源
    if (typeof row == "string") {
      let matchArr = row?.match(/【source†\w+】/g) || []; // 提取来源
      const tempSourceArr = matchArr?.map((item: any) => {
        row = row.replace(new RegExp(item, "g"), ""); // 替换字符串 【source†0】
        return item;
      });

      sourceArr.push(...tempSourceArr); // 引用数组
      // 获取最后一个数组字符串
      if (childrenCount == index + 1) {
        const { newEndChar, newRow } = getLastChar(row);
        endChar = newEndChar;
        row = newRow;
      }
    }
    newChildrenArr.push(row);
  }

  return { newChild: newChildrenArr, sourceArr, endChar };
};

//  构造对象基于数组对象
export const getDict = (arr: any, key: any) => {
  let tmpObj = {};
  for (const item of arr) {
    tmpObj[item[key]] = item;
  }
  return tmpObj;
};

// 历史对话数据处理
export const handleLogicChatList = (arr: any) => {
  const tempRes = [];
  for (const item of arr) {
    const { input, output } = item;

    const { content } = input;
    const { parts } = output;

    const tempParts = resetLogic(parts); // 去掉重复logic，同时合并logic 元素

    // todo 去掉没有引用文件
    let newParts = []; // 数据转换后的parts
    // 将后端数据结构转换成前端组建需要的格式
    for (const part of tempParts) {
      const { role, citations } = part;
      let toolArr = [];
      // assistant tool tool assistant  // 解决这种问题，
      // 合并工具
      if (role == "tool") {
        const { tool_name, tool_desc, tool_args } = part;
        toolArr.push({
          ...part,
          title: tool_name,
          desc: tool_desc,
          status: "finish",
        });

        if (toolArr.length == 1) {
          // 默认一个工具
          newParts.push({ ...part, toolArr });
        }

        if (toolArr.length > 1) {
          //工具追加,多工具合并，方便 UI显示。同一个工具，不同状态
          newParts = replaceArrEndNode(newParts, { ...part, toolArr });
        }

        // 执行的 python 代码
        const codes = tool_args?.code;
        if (
          role == "tool" &&
          part?.status == "finish" &&
          tool_name == "python" &&
          codes
        ) {
          newParts.push({ ...part, role: "codes", codes });
        }
      }

      if (role == "assistant") {
        toolArr = []; // 清空工具
        const { newCitations, citationDoc } = formatCitationData(
          part,
          tempParts,
        ); // 引用文件文本转换
        newParts.push({ ...part, citations: newCitations, citationDoc });
      }
    }

    // 清空没有使用到的引用

    const title = content[0].text;
    tempRes.push(
      ...[
        { id: uuid(), category: "query", title },
        {
          id: uuid(),
          category: "answer",
          title,
          parts: newParts,
          assistant_id: item.assistant_id,
        },
      ],
    );
  }
  return tempRes;
};

// 替换替换数组最后一个节点
export const mergeArrEndNode = (arr: any, param: any) => {
  const endNode = arr[arr.length - 1];
  arr[arr.length - 1] = { ...endNode, ...param };
  return arr;
};

// 监听对话数据的变化，改变聊天容器元素的 scrollTop 值让页面滚到最底部
export const scrollTop = (ref: any) => {
  const current = ref.current;
  if (current) {
    current.scrollTop = current?.scrollHeight;
  }
};

// 工具调用数据格式处理
export const formatToolsData = (part: any, tempParts: any, tempObj: any) => {
  // try {
  const { tool_name, tool_desc, logic_id, role, tool_type } = part;
  let tempRow = {
    ...part,
    title: tool_name,
    desc: tool_desc,
    status: part.status,
  };
  // A 调用完相在调用 A
  if (!tempObj[logic_id]) {
    // 用到工具
    tempParts.push({ ...part, toolArr: [tempRow] });
  } else {
    // logic_id 里多个工具问题
    const lastPart = getLastNode(tempParts);
    const lastPartToolArr = lastPart.toolArr || [];
    const newToolArr = arrResetByKey([...lastPartToolArr, tempRow], "title");
    tempParts = mergeArrEndNode(tempParts, {
      ...part,
      toolArr: deepCopy(newToolArr),
    }); // 数组最后一个合并
  }

  // 执行的 python 代码 直接累加
  if (role == "tool" && part?.status == "finish" && tool_type == "python") {
    const codes = part.tool_args.code;
    tempParts.push({ ...part, role: "codes", codes });
  }

  return tempParts;
};

// 对象数组去掉重复
export const arrResetByKey = (arr: any, key: any) => {
  let temp = {};
  let result = [];
  for (const item of arr) {
    let tempKey = item[key];
    if (!temp[tempKey]) {
      result.push(item);
      temp[tempKey] = true;
    }
  }
  return result;
};

// 获取数组最后一个节点
export function getLastNodes(arr: any, num: any) {
  return arr.slice(-num);
}

//  引用文献 docNameMap
export const formatCitationData = (part: any, parts: any) => {
  const { citations } = part;

  if (!citations) return { newCitations: null, citationDoc: {} };

  const text = parts.map((item: any) => item.text).join("");
  let matchArr = text?.match(/【source†\w+】/g) || []; // 提取来源

  // let newCitations:any = [] // 构建sourceId 字典，判断回答的 source 是否有对应的refid
  let newCitations: any = {}; // 构建sourceId 字典，判断回答的 source 是否有对应的refid
  // 构建来源对象
  const tempCitations = deepCopy(citations);
  for (const [index, row] of tempCitations.entries()) {
    const key = `【source†${row.ref_id}】`;
    if (matchArr.includes(key)) {
      newCitations[key] = { ...row, index: index + 1 };
    }
  }

  let citationDoc: any = {}; // 基于文件名去重复
  for (const key in newCitations) {
    const { metadata, page_content } = newCitations[key];
    const { doc_name } = metadata;
    const pageArr = citationDoc[doc_name] || [];
    pageArr.push(page_content);
    citationDoc[doc_name] = pageArr;
  }

  if (Object.keys(citationDoc).length == 0) {
    // 没有任何引用
    newCitations = null;
  }

  if (newCitations) {
    let count = 1;
    for (let key in newCitations) {
      newCitations[key] = { ...newCitations[key], index: count };
      count = count + 1;
    }
  }
  return { newCitations, citationDoc };
};

// 助手数据格式处理
export const formatAssistantData = (
  part: any,
  tempParts: any,
  tempObj: any,
) => {
  const { logic_id } = part;
  const { newCitations, citationDoc } = formatCitationData(part, tempParts); // 引用文件文本转换
  const tempRow = { ...part, citations: newCitations, citationDoc };
  if (!tempObj[logic_id]) {
    // 新的会话
    tempParts.push(tempRow);
  }
  if (tempObj[logic_id]) {
    // 如果存在，追加
    tempParts = mergeArrEndNode(tempParts, tempRow); // 数组最后一个合并
  }
  return tempParts;
};

//  格式化请求
export const formatPayload = (param: any) => {
  let res = {};
  for (let key in param) {
    const value = param[key];
    if (value || value == false) {
      res[key] = value;
    }
  }
  return res;
};

//  清除打开网页记录
export const clearOpenPageRecord = (param: any) => {
  let res = [];
  for (let row of param) {
    const { action = "" } = row?.tool_args || {};
    if (!action.includes("mclick([")) {
      // 排除点击操作
      res.push(row);
    }
  }
  return res;
};

//  sortMap map 放到最后
export const sortMapPart = (param: any) => {};

// markdown 的图片特殊处理
export const hanlderMarkdownImgText = (param: any) => {
  let result = latexReplace(param); // 公式处理
  let imgArr = param?.match(/【image:.+?】/g) || []; // 最小匹配
  for (const item of imgArr) {
    const url = item.replace("【image:", "").replace("】", "");
    result = result?.replace(new RegExp(item, "g"), `![图片](${url})`);
  }
  return result;
};

//  LateX 公式文本处理
export const latexReplace = (param: any) => {
  if (Object.prototype.toString.call(param) === "[object String]") {
    const str = "\n$$$$\n";
    let result = param
      .replace(/align\*/g, "aligned")
      .replace(/\\\[/g, str)
      .replace(/\\\]/g, str)
      .replace(/\\\(/g, "$$")
      .replace(/\\\)/g, "$$");
    return result;
  }
  return "";
};

//  获取用户信息
export const getUserInfo = (key = "id") => {
  const local = localStorage.getItem("userInfo") || "{}";
  const shopInfo = JSON.parse(local);
  if (key) {
    return shopInfo[key];
  }
  return shopInfo;
};

export const copyText = (str: string) => {
  const input = document.createElement("textarea");
  input.style.cssText = "opacity: 0;";
  input.value = str; // 修改文本框的内容
  document.body.appendChild(input);
  input.select(); // 选中文本
  document.execCommand("copy"); // 执行浏览器复制命令
  document.body.removeChild(input);
  message.success("复制成功");
};

// 获取数组最后一个节点
export function getLastNode(arr: any) {
  return arr[arr.length - 1];
}

// 递归展平嵌套数组
export function flattenDeep<T>(arr: any[]): T[] {
  return arr.reduce((flat: T[], item: any) => {
    return flat.concat(Array.isArray(item) ? flattenDeep(item) : item);
  }, []);
}
//  获取获取文件类型
export const getDocType = (doc_name: any) => {
  let type = "docs";
  const docNameType = getFileType(doc_name);
  if (docNameType === "xlsx" || docNameType === "csv") type = "excel"; // 表格
  if (docNameType === "pdf") type = "pdf"; // pdf
  return type;
};
//  获取获取文件类型
export const getFileType = (doc_name: any) => {
  return doc_name?.split(".")?.pop?.();
};

export function convertBytes(
  bytes: number,
  unit: "B" | "KB" | "MB" | "GB" = "GB",
) {
  let units = ["B", "KB", "MB", "GB"];

  units = units.slice(0, units.indexOf(unit) + 1);
  let unitIndex = 0;
  while (bytes >= 1024 && unitIndex < units.length - 1) {
    bytes /= 1024;
    unitIndex++;
  }
  return `${(+bytes)?.toFixed?.(2) || 0} ${units[unitIndex]}`;
}

export const checkIsSplace = (rule: any, value: any, content?: any) => {
  if (value?.length > 0 && value.trim() === "") {
    return Promise.reject(content || "输入不能全部为空格");
  }
  return Promise.resolve();
};

//  查看多个文件中是否有pdf
export const checkMoreFileIsExistPDF = (param: any) => {
  let status = false;
  for (let value of param) {
    const fileType = getFileType(value);
    if (fileType.toLowerCase() == "pdf") {
      status = true;
      break;
    }
  }
  return status;
};

//  流执行转换成数据
export const flow2arr = (node_arr: any, edge_arr: any) => {
  const nodes = JSON.parse(JSON.stringify(node_arr));
  const edges = JSON.parse(JSON.stringify(edge_arr));

  const nodeObj = {};
  const nodeIdArr = []; // 节点id
  const lineNodeIdArr: any = []; // 线链接节点id
  for (const node of nodes) {
    const { id } = node;
    nodeObj[id] = node;
    nodeIdArr.push(id);
  }

  // 节点里的项
  //
  for (const edge of edges) {
    const { source, sourceHandle, target, targetHandle } = edge;

    if (!nodeObj[source] || !nodeObj[target]) {
      // 无效的边
      continue;
    }
    const { target_handle_list = [], target_list = [] } = nodeObj[source];
    target_handle_list.push(targetHandle); // 添加输入节点
    target_list.push(target); // 添加输入节点
    nodeObj[source]["target_handle_list"] = target_handle_list;
    nodeObj[source]["target_list"] = target_list;

    // source_list
    const targetNode = nodeObj[target];
    const sourceNode = nodeObj[source];
    let { fetch_param_list = [] } = targetNode.data;
    const new_input_arr = fetch_param_list.map((item: any) => {
      const tempRow = JSON.parse(JSON.stringify(item));
      if (
        `${target}|||${tempRow.title}` == targetHandle &&
        (sourceNode.data?.source_list?.length > 0 || source == "start_node")
      ) {
        tempRow["isLink"] = true; // 是否有输入
      }
      return tempRow;
    });

    if (fetch_param_list.length > 0) {
      targetNode.data.fetch_param_list = new_input_arr;
      nodeObj[target] = targetNode;
    }
    lineNodeIdArr.push(...[source, target]);
  }

  let newNodeArr = [];
  for (const key in nodeObj) {
    newNodeArr.push(nodeObj[key]);
  }

  // 节点id 与连线的id
  const diffArr = nodeIdArr.filter((item) => !lineNodeIdArr.includes(item));
  if (diffArr.length > 0) {
    message.error("有从未使用到的节点");
    return { status: false, categoy: "node", data: diffArr };
  }

  // todo 判断无效参数
  newNodeArr = moveToFirst(newNodeArr, "start_node"); // 第一个节点是开始节点
  const cycle = findCycle(newNodeArr); // 判断是否有环

  if (cycle?.length > 0) {
    message.error("工作流中不能出现环");
    return { status: false, categoy: "cycle", data: cycle };
  }
  const sortNode = nodeArrSort(newNodeArr);

  if (sortNode?.length !== nodes.length) {
    message.error("不能形成有效的工作流");
    return { status: false, categoy: "line", data: sortNode };
  }
  return { status: true, data: nodeArrSort(newNodeArr) };
};

export const nodeArrSort = (arr: any) => {
  let res: any = [];
  let nodeObj = {};
  let visitedObj = {}; // 访问过的node
  for (const index in arr) {
    const tempNode = arr[index];
    const { id } = tempNode;
    nodeObj[id] = tempNode;
    if (
      id !== "start_node" &&
      (!tempNode.data.source_list || tempNode.data.source_list.length == 0)
    ) {
      res.push(tempNode);
      dfs(tempNode); //
    }
  }

  function updNode(nid: any, target_handle_list: any) {
    const node = nodeObj[nid];
    let { fetch_param_list } = node.data;
    let isVisited = true;
    if (fetch_param_list?.length > 0) {
      for (const [index, row] of fetch_param_list.entries()) {
        const rId = `${nid}|||${row.title}`;
        if (target_handle_list.includes(rId)) {
          // 是否包含目标点
          fetch_param_list[index]["isVisited"] = true;
        }
      }

      // 是否都有值
      for (const row of fetch_param_list) {
        // todo 优化
        if (!row["isVisited"] && row["isLink"] && row["is_required"] == "yes") {
          isVisited = false;
          break;
        }
      }
      node.data.fetch_param_list = fetch_param_list;
    }
    node.isVisited = isVisited;
    nodeObj[nid] = node;
  }

  function dfs(node: any) {
    const { target_handle_list = [], target_list = [], isVisited } = node;
    const currentId = node.id;
    //  没有被访问过的节点
    if ((currentId == "start_node" || isVisited) && !visitedObj[currentId]) {
      res.push(node);
      visitedObj[currentId] = currentId;
    }

    //  更新目标节点状态
    for (const target of target_list) {
      updNode(target, target_handle_list);
    }

    // 获取下一个节点
    for (const target of target_list) {
      const tempNode = nodeObj[target];
      if (tempNode.isVisited) {
        dfs(tempNode);
      }
    }
  }

  const startNode = arr[0];
  dfs(startNode);

  //  将 结束节点放最后
  const newList = res.filter((item: any) => item.id !== "end_node");
  newList.push(nodeObj["end_node"]);

  return newList;
};

export const moveToFirst = (arr: any, targetId: any) => {
  // 方法一：使用 splice 和 unshift
  const targetIndex = arr.findIndex((item: any) => item.id === targetId);
  if (targetIndex !== -1) {
    const targetItem = arr.splice(targetIndex, 1)[0]; // 从原位置移除
    arr.unshift(targetItem); // 放到数组首位
  }
  return arr;
};

// 判断是否有环
export const findCycle = (tree: any) => {
  const visited: any = {}; // 记录访问状态
  const path_list: any = []; // 记录当前递归路径
  let cycle_list: any = []; // 用于存储环的节点ID

  function dfs(nodeId: any) {
    if (visited[nodeId] === 2) {
      return false; // 已访问完成，无需继续
    }
    if (visited[nodeId] === 1) {
      // 检测到环，提取环的节点ID
      const startIndex = path_list.indexOf(nodeId);
      cycle_list = path_list.slice(startIndex); // 提取从环的起点到当前节点的路径
      cycle_list.push(nodeId); // 将当前节点加入环的路径
      return true;
    }

    // 标记当前节点为正在访问，并加入路径
    visited[nodeId] = 1;
    path_list.push(nodeId);

    const node = tree.find((item: any) => item.id === nodeId);
    if (node && node.target_list) {
      for (const childId of node.target_list) {
        if (dfs(childId)) {
          return true;
        }
      }
    }

    // 标记当前节点为访问完成，并从路径中移除
    visited[nodeId] = 2;
    path_list.pop();
    return false;
  }

  // 遍历所有节点
  for (const node of tree) {
    if (!visited[node.id]) {
      if (dfs(node.id)) {
        break; // 找到环后退出
      }
    }
  }

  return cycle_list;
};

// 对象类型转字符串
export const obj2Str = (value: any) => {
  if (!value && value !== 0) {
    return "";
  }
  // 如果是对象（非null且非数组），直接转为JSON字符串
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return JSON.stringify(value);
  }
  // 其他情况直接转为字符串
  return String(value);
};

export const validateText = (value: string, tip: string): Promise<void> => {
  if (!value) return Promise.resolve();

  // 只允许中文、英文、数字的组合，且不能以数字开头
  const pattern = /^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5]*$/;

  if (/^\d+$/.test(value)) {
    return Promise.reject(`${tip}不能为纯数字`);
  }

  if (/^\d/.test(value)) {
    return Promise.reject(`${tip}不能以数字开头`);
  }

  if (!pattern.test(value)) {
    return Promise.reject(`${tip}只能包含中文、英文和数字`);
  }

  return Promise.resolve();
};

// 获取 API
export const getRequestParams = (url: string = "", options: any) => {
  let newUrl = url;
  // 数组 / 非对象 payload 不能用对象展开，否则 [a,b] 会变成 {0:a,1:b}
  if (
    Array.isArray(options?.payload) ||
    options?.payload == null ||
    typeof options.payload !== "object"
  ) {
    return { newUrl, payload: options?.payload };
  }
  const newPayload = { ...options.payload };
  // 替换 url 中的 :key
  const arr = newUrl.split("/:");
  arr.forEach((key) => {
    const value = options.payload[key];
    if (value) {
      newUrl = newUrl.replace(`:${key}`, value);
      delete newPayload[key];
    }
  });

  return { newUrl, payload: newPayload };
};

// 一个字符 15px
export const computeTextLen = (text: string) => {
  if (!text) {
    return 0;
  }

  return text.length * 15;
};

export const getCurrentTime = (precision: "hour" | "minute"): number => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");

  if (precision === "hour") {
    return parseInt(`${year}${month}${day}${hour}`);
  } else {
    const minute = String(now.getMinutes()).padStart(2, "0");
    return parseInt(`${year}${month}${day}${hour}${minute}`);
  }
};

//  将字符串转json，如果不是json 不处理
export const str2json = (text: any, isRepalce?: boolean) => {
  try {
    // 尝试解析字符串为 JSON
    let jsonStrings = text;
    if (isRepalce) {
      jsonStrings = text.match(/(?<=```json\n)[\s\S]+?(?=\n```)/g) || [];
    }

    const result = JSON.parse(jsonStrings);
    return result; // 如果解析成功，返回 JSON 对象
  } catch (error) {
    // 如果解析失败，返回原始字符串
    return text;
  }
};

export const formatJsonCode = (text: string) => {
  try {
    const jsonObject = JSON.parse(text);
    const formattedJson = JSON.stringify(jsonObject, null, 2);
    return formattedJson;
  } catch (error) {
    // 如果解析失败，返回原始字符串
    return text;
  }
};

// 删除数据通过Id
export const delArrById = (arr: any, value: any, key = "id") => {
  return arr.filter((item: any) => item[key] !== value);
};

//  工具数据结构转换
export const checkToolData = (tool_arr: any) => {
  let toolMap: any = {};
  if (tool_arr?.length) {
    tool_arr.forEach((d: any) => {
      const systemId = d.systemId;
      if (!toolMap[systemId]) {
        toolMap[systemId] = {
          id: systemId,
          systemName: d.toolSystemName,
          children: [],
        };
      }

      toolMap[systemId].children.push({
        id: d.id,
        toolName: d.toolName,
      });
    });
  }
  return toolMap;
};

// 生成默认头像
export const getDefaultLogo = () => {};

// 挖空元素变成不可以编辑
export const clearEdit = (param: any) => {
  return param?.replace(/contenteditable="true"/g, "");
};

// 文件上传通用属性
export const uploadFileProps = {
  listType: "picture-card",
  showUploadList: false,
  // action: `${adminTestBase}/agent/uploadAgentLogo`,
  action: ``,
  headers: {
    Authorization: getStorageToken() || "",
  },
  onChange(info: any) {
    if (info.file.status !== "uploading") {
    }
    if (info.file.status === "done") {
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} 文件上传成功`);
    }
  },
};

// 创建一个新数组，包含原数组中所有的唯一值
export function uniq<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

// 获取组织 id
export const getSpaceId = () => {
  return getSpaceInfo("id");
};

// 获取默认空间
export const getSpaceInfo = (key = "id") => {
  try {
    const spaceStr = localStorage.getItem("curSpace") || "{}";
    const spaceInfo = JSON.parse(spaceStr);
    if (key) {
      return spaceInfo[key];
    }
    return spaceInfo;
  } catch (e) {
    return "";
  }
};

// 设置默认空间
export const setLocalSpaceInfo = (param: any) => {
  localStorage.setItem("curSpace", JSON.stringify(param));
};

// 设置图片请求地址
export const formatStaticUrl = (url: any) => {
  if (!url) return url;
  const isUrl = url.includes("http://") || url.includes("https://");
  const newCog = cogUrl?.replace("/api-test", "").replace("/api", "");
  return isUrl ? url : `${newCog}${url}`;
};

//  字符串格式千分位
export const formatNumber = (num: any) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

//  文本复制
export const copyParagraphText = async (content: string) => {
  try {
    // 优先使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
      message.success("复制成功");
      return;
    }

    // 降级方案：使用 document.execCommand
    const textarea = document.createElement("textarea");
    textarea.value = content;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      message.success("复制成功");
    } catch (err) {
      message.error("复制失败，请手动复制");
    } finally {
      document.body.removeChild(textarea);
    }
  } catch (err) {
    message.error("复制失败，请手动复制");
  }
};

// 获取组织 id
export const getOrgId = (key = "id") => {
  let localVal = localStorage.getItem("curOrg");
  if (!localVal) {
    history.push("/login");
  }
  let curOrg = JSON.parse(localStorage.getItem("curOrg") || "{}");

  return curOrg[key];
};

// 获取组织值
export const getCurOrgValue = (key = "id") => {
  let localVal = localStorage.getItem("curOrg");
  if (!localVal) {
    history.push("/login");
  }
  let curOrg = JSON.parse(localStorage.getItem("curOrg") || "{}");
  return curOrg[key];
};

// 获取组织 id
export const checkboxTableRow = (rows: any, id_arr: any) => {
  let temp = [];
  for (const row of rows) {
    const id = row["id"];
    delete row["_check"];
    if (id_arr.includes(id)) {
      row["_check"] = true;
    }
    temp.push(row);
  }
  return temp;
};

//  判断当前是否有sse网络请求
export const checkIsChat = (chatList: any) => {
  let status = false;
  if (chatList?.length > 0) {
    status = chatList[chatList.length - 1]["loading"];
  }
  return status;
};

//  将图谱id转成字符串
export const formatGraphId2String = (param: any) => {
  const { nodes = [], relations = [] } = param;
  const newNodes = nodes?.map((item: any) => {
    const { id } = item;
    return { ...item, id: id.toString() };
  });
  const newRelations = relations?.map((item: any) => {
    const { id, source_id, target_id } = item;
    return {
      ...item,
      id: id.toString(),
      start: source_id.toString(),
      end: target_id.toString(),
    };
  });
  return { nodes: newNodes, relations: newRelations };
};

// 自定义代码块组件
export const CodeBlock = (param: any) => {
  const { node, inline, className, children, ...props } = param || {};
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  // 如果是 HTML 代码块，使用 react-syntax-highlighter 进行高亮
  if (language === "html") {
    return (
      <SyntaxHighlighter
        language={language}
        PreTag="div"
        {...props}
        style={{ ...coy, margin: "0px !important" }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    );
  }

  // 如果不是 HTML 代码块，直接渲染原始代码
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
};
// 处理文件名称
export const handleName = (fileName: string, type?: string) => {
  let name = "";
  let ext = type || "";
  const parts = fileName?.split(".");
  if (parts.length < 2) {
    name = fileName;
  } else {
    name = parts.slice(0, -1).join(".");
    ext = parts[parts.length - 1];
  }
  switch (ext) {
    case "pdf":
      return { name, type: ext, icon: "pdf-color" };
    case "doc":
    case "docx":
      return { name, type: ext, icon: "doc-color" };
    case "ppt":
    case "pptx":
      return { name, type: ext, icon: "ppt-color" };
    case "csv":
    case "xls":
    case "xlsx":
      return { name, type: ext, icon: "excel-color" };
    case "png":
    case "jpg":
    case "jpeg":
      return { name, type: ext, icon: "jpg-color" };
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
    case "mkv":
    case "mp3":
    case "wav":
    case "wma":
    case "aac":
      return { name, type: ext, icon: "yinpin" };
    case "graph":
      return { name, type: ext, icon: "graph-file" };
    default:
      return { name, type: ext, icon: "file-color" };
  }
};

// 处理文件名称支持大写后缀(新)
export const handleNameNew = (fileName: string, type?: string) => {
  let name = "";
  let ext = type || "";
  const parts = fileName?.split(".");
  if (parts.length < 2) {
    name = fileName;
  } else {
    name = parts.slice(0, -1).join(".");
    ext = parts[parts.length - 1];
  }
  ext = ext?.toLowerCase();
  switch (ext) {
    case "pdf":
      return { name, type: ext, icon: "pdf-color" };
    case "doc":
    case "docx":
      return { name, type: ext, icon: "doc-color" };
    case "ppt":
    case "pptx":
      return { name, type: ext, icon: "ppt-color" };
    case "csv":
    case "xls":
    case "xlsx":
      return { name, type: ext, icon: "excel-color" };
    case "png":
    case "jpg":
    case "jpeg":
      return { name, type: ext, icon: "jpg-color" };
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
    case "mkv":
    case "mp3":
    case "wav":
    case "wma":
    case "aac":
      return { name, type: ext, icon: "yinpin" };
    case "graph":
      return { name, type: ext, icon: "graph-file" };
    default:
      return { name, type: ext, icon: "file-color" };
  }
};

export const handleTime = (time: string) => {
  if (dayjs().diff(time, "day") === 0) {
    return dayjs(time).format("HH:mm");
  } else if (dayjs(time).year() !== dayjs().year()) {
    return dayjs(time).format("YYYY/MM/DD");
  } else {
    return dayjs(time).format("MM/DD");
  }
};

// 数据埋点
export const addTracking = async (param: any, other?: any) => {
  let url =
    "https://analysis.chatglm.cn/chatglm-ads/pushdata/callback?type=zhiqi_teacher_log";
  let payload = {
    log_id: uuid(),
    content: "page_view",
    user_id: getUserInfo("edu_id") || "385415b1-13a4-4699-a54b-285265ae70a5",
    ...other,
    extra: {
      ...param,
    },
  };
  await postDataRequest(payload, url);
};

// 新数据埋点  文档 https://zhipu-ai.feishu.cn/wiki/VCYUwjh1MiliR2ksv5wcUHalnPb
export const addNewTracking = async (param: any) => {
  let url = "https://analysis.chatglm.cn/bdms/p.json";
  let payload = {
    usid: getUserInfo("edu_id") || "385415b1-13a4-4699-a54b-285265ae70a5",
    tm: "pc",
    pd: "teach",
    data_list: [
      {
        ...param,
        // ctid:param?.homeworkId,
        // ctvl:param?.homeworkName,
      },
    ],
  };

  await postDataRequest(payload, url);
};

//  数字转字母
export const numToLetter = (num: any) => {
  // 检查边界，防止输入 0 或负数
  if (num < 1) return null;
  return String.fromCharCode(num + 64);
};

// 解决wangedit 插入前确保内容被 <p> 包裹
export const insertWangContent = (htmlStr: any) => {
  // 如果内容不是以块级标签开头，包裹在 <p> 中
  const blockTags = [
    "p",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "table",
    "blockquote",
  ];
  const isBlock = blockTags.some((tag) =>
    htmlStr?.trim?.().startsWith?.(`<${tag}`),
  );

  const safeHtml = isBlock ? htmlStr : `<p>${htmlStr || ""}</p>`;
  return safeHtml;
};

//  解决img 标签在富文本中 height 和width 属性丢失问题
export const checkWangImgsToDom = (htmlString: any) => {
  // 1. 创建解析器并解析 HTML 字符串
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // 2. 获取所有的 img 标签
  const imgs = doc.querySelectorAll("img");

  // 3. 遍历处理每一个 img
  imgs.forEach((img) => {
    let w = img.getAttribute("width");
    let h = img.getAttribute("height");

    // 获取现有的 style，如果没有则为空字符串
    let style = img.getAttribute("style") || "";

    // 如果存在宽度，拼接到 style 中
    if (w) {
      // 确保数值带有 px 单位（如果原本没有单位的话）
      if (
        !String(w).includes("%") &&
        !String(w).includes("px") &&
        !String(w).includes("auto")
      ) {
        w = `${w}px`;
      }
      style += `width:${w};`;
      img.removeAttribute("width"); // 可选：移除原 width 属性
    }

    // 如果存在高度，拼接到 style 中
    if (h) {
      if (
        !String(h).includes("%") &&
        !String(h).includes("px") &&
        !String(h).includes("auto")
      ) {
        h = `${h}px`;
      }
      style += `height:${h};`;
      img.removeAttribute("height"); // 可选：移除原 height 属性
    }

    // 将处理好的 style 写回标签
    if (style) {
      img.setAttribute("style", style.trim());
    }
  });
  // 返回处理后的 doc
  return doc.body.innerHTML;
};

/**
 * 提取 \displaylines{ ... } 结构中的内容（适用于 MathLatex 插入的多行公式换行逻辑）。
 * 用法：
 *   - 若 latex 不是以 \displaylines 开头，返回 null。
 *   - 若仅为 \displaylines，无内容，返回 ""。
 *   - 若紧跟大括号包裹，则提取所有最外层 {...} 中的内容（忽略嵌套和转义大括号）。
 *   - 若无大括号，直接返回剩余内容。
 * 
 * @param latex {string} 原始 latex 字符串
 * @returns {string|null} 提取的内容 or null（不是 \displaylines 结构）
 */
const unwrapDisplaylinesContent = (latex: string) => {
  if (!/^\\displaylines\b/.test(latex)) return null; // 不是 \displaylines 起始，直接返回 null
  let rest = latex.replace(/^\\displaylines\s*/, "").trim(); // 去除前缀
  if (!rest) return ""; // 没有内容
  if (!rest.startsWith("{")) return rest; // 没有大括号，直接返回剩余内容

  // 解析 {...} 内容，支持多层大括号嵌套，确保转义符被跳过
  let depth = 0;
  for (let i = 0; i < rest.length; i += 1) {
    const ch = rest[i];
    if (ch === "\\") {
      i += 1; // 跳过转义的下一个字符
      continue;
    }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        // 若大括号刚好匹配结束，则提取 {...} 内部内容，否则返回原始剩余内容
        return i === rest.length - 1 ? rest.slice(1, i).trim() : rest;
      }
    }
  }
  // 若未成功解析出完整 {...}，返回原内容
  return rest;
};

/**
 * 将 \displaylines{ ... } 结构转换为 KaTeX 多行公式 array 语法 
 * 1. 如果不是 \displaylines 前缀，或内容为空，则按原样返回或返回空字符串
 * 2. 如果内容仅有一行，不做多行转换
 * 3. 多行内容转换为 \begin{array}{l} ... \end{array} 结构，每行对齐
 * 
 * @param latex {string}
 * @returns {string}
 */
const convertDisplaylinesToMultilineLatex = (latex: string) => {
  const content = unwrapDisplaylinesContent(latex); // 提取 \displaylines 内容
  if (content === null) return latex; // 不是 \displaylines 结构
  if (!content) return ""; // 内容为空

  // 统一换行符为 \n
  const normalized = content.replace(/\r\n/g, "\n");
  // 按 \n 或 \\ 分割多行公式
  const lines = normalized
    .split(/\\\\|\n/)
    .map((line) => line.trim()) // 去除每行两侧空格
    .filter(Boolean); // 去除空行

  if (lines.length <= 1) {
    return lines[0] || ""; // 单行则直接返回
  }

  // 多行内容转为 array 格式（左对齐）
  return `\\begin{array}{l}\n${lines.join(" \\\\\n")}\n\\end{array}`;
};

/**
 * 王公式 latex 归一化：
 *   - 去掉最外层美元符号（如 $ ... $）
 *   - 替换 Word 格式 { *{n}{...} } 为 {...}
 *   - 将 \displaylines 结构转换为多行 array
 *   - 经过 textarea DOM 编码解码一次，转义特殊字符
 * @param raw {string}
 * @returns {string}
 */
const normalizeWangFormulaLatex = (raw: string) => {
  let latex = raw.trim(); // 去首尾空格
  latex = latex.replace(/^\$+|\$+$/g, ""); // 去除两端 $
  // 替换 Word 格式的分组
  latex = latex.replace(/\{\*\{\d+\}\{([^}]*)\}\}/g, "{$1}");
  // 多行 displaylines 处理
  latex = convertDisplaylinesToMultilineLatex(latex);
  // 使用 DOM 处理 & 特殊字符等解码
  const textarea = document.createElement("textarea");
  textarea.innerHTML = latex;
  return textarea.value;
};

// normalizeFormulaLatex: 对王公式 latex 进行归一化处理，包括 displaylines 转换、多余美元符号去除等
export const normalizeFormulaLatex = normalizeWangFormulaLatex;

/**
 * 创建 <math> 节点，并设置 latex 属性为归一化后的公式字符串
 * @param doc Document 实例
 * @param rawLatex 原始公式字符串
 * @returns Math 节点
 */
const createMathLatexNode = (doc: Document, rawLatex: string) => {
  const mathNode = doc.createElement("math");
  mathNode.setAttribute("latex", normalizeWangFormulaLatex(rawLatex));
  return mathNode;
};

/**
 * 创建 WangEditor 公式节点 <span data-w-e-type="formula">
 * 
 * 插件在 HTML -> Slate 时需要可读文本内容，避免空节点被清理
 * @param doc Document 实例
 * @param rawLatex 原始公式字符串
 * @returns span 节点
 */
const createWangFormulaNode = (doc: Document, rawLatex: string) => {
  const span = doc.createElement("span");
  const normalizedLatex = normalizeWangFormulaLatex(rawLatex);
  span.setAttribute("data-w-e-type", "formula");
  span.setAttribute("data-w-e-is-void", "true");
  span.setAttribute("data-w-e-is-inline", "true");
  span.setAttribute("data-value", normalizedLatex);
  // HTML -> Slate 解析需带可读文本；否则可能被清理为 <p><br></p>
  span.textContent = `$${normalizedLatex}$`;
  return span;
};

/**
 * 从元素节点中获取公式 latex 字符串
 * @param node 元素节点
 * @returns 公式 latex 字符串
 */
const getFormulaLatexFromElement = (node: Element) =>
  node.getAttribute("data-value") || node.textContent || "";

/**
 * 判断节点是否为 wangEditor 公式元素节点（span[data-w-e-type="formula"]）
 * @param node 任意 DOM 节点
 * @returns 是否为公式元素节点
 */
const isFormulaElementNode = (node: Node): node is Element =>
  node.nodeType === Node.ELEMENT_NODE &&
  (node as Element).matches('span[data-w-e-type="formula"]');

/**
 * 判断公式 latex 是否为数组公式的起始部分（如 \left\{\begin{array}）
 * @param latex latex 字符串
 * @returns 是否为 array 公式起始
 */
const isArrayStartLatex = (latex: string) =>
  /\\begin\{array\}/.test(latex) && /\\left\\\{/.test(latex);

/**
 * 判断公式 latex 是否为数组公式的结束部分（如 \end{array}\right.）
 * @param latex latex 字符串
 * @returns 是否为 array 公式结束
 */
const isArrayEndLatex = (latex: string) => /\\end\{array\}\\right\./.test(latex);

/**
 * 判断公式 latex 是否为“类纯文本”内容（如纯中文标点等，非真正 latex 公式）
 * @param latex latex 字符串
 * @returns 是否为普通文本类型
 */
const isPlainTextLikeFormulaLatex = (latex: string) => {
  const text = latex.trim();
  if (!text) return true;
  // 匹配纯中文标点及常见英文标点
  if (/^[，。；：、“”‘’！？,.:;()\s]+$/.test(text)) return true;
  const hasCjk = /[\u4e00-\u9fa5]/.test(text);
  const hasLatexCommand = /\\[a-zA-Z]+/.test(text);
  const hasMathSignals = /[=+\-*/^_]/.test(text);
  // 有中文但无 latex 命令、无数学运算符，视为普通文本
  return hasCjk && !hasLatexCommand && !hasMathSignals;
};

/**
 * 清洗并归一化已存在的公式 span 节点
 * 1. 合并被拆开的 array 公式（如 \left\{\begin{array} ... \end{array}\right.）
 * 2. 已有公式 span 节点：合法公式重建为标准节点，纯文本/标点降级为普通文本
 * @param doc 文档实例
 */
const normalizeExistingFormulaSpans = (doc: Document) => {
  const paragraphs = Array.from(doc.querySelectorAll("p,li,div,blockquote"));

  // 1) 兼容被拆开的 array 公式：\left\{\begin{array} ... \end{array}\right.
  paragraphs.forEach((parent) => {
    let cursor = 0;
    while (cursor < parent.childNodes.length) {
      const currentNode = parent.childNodes[cursor];
      if (!isFormulaElementNode(currentNode)) {
        cursor += 1;
        continue;
      }
      // 获取起始 array latex
      const startLatex = normalizeWangFormulaLatex(
        getFormulaLatexFromElement(currentNode),
      );
      if (!isArrayStartLatex(startLatex)) {
        cursor += 1;
        continue;
      }

      // 合并之间的内容直到 array 公式结束
      const middleParts: string[] = [];
      let endIndex = -1;
      for (let i = cursor + 1; i < parent.childNodes.length; i += 1) {
        const node = parent.childNodes[i];
        if (isFormulaElementNode(node)) {
          const latex = normalizeWangFormulaLatex(getFormulaLatexFromElement(node));
          if (isArrayEndLatex(latex)) {
            endIndex = i;
            middleParts.push(latex);
            break;
          }
          middleParts.push(latex);
          continue;
        }

        // 文本节点直接追加内容
        if (node.nodeType === Node.TEXT_NODE) {
          middleParts.push(node.textContent || "");
          continue;
        }

        // 元素节点，<br> 替换为 \\，否则直接追加内容
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          if (el.tagName.toLowerCase() === "br") {
            middleParts.push("\\\\");
          } else {
            middleParts.push(el.textContent || "");
          }
        }
      }

      // 没有找到结束公式时跳过
      if (endIndex === -1) {
        cursor += 1;
        continue;
      }

      // 合并重组公式，并替换为标准公式节点
      const mergedLatex = normalizeWangFormulaLatex(
        `${startLatex}${middleParts.join("")}`,
      );
      currentNode.replaceWith(createWangFormulaNode(doc, mergedLatex));
      // 删除中间已合并的节点
      for (let i = endIndex; i > cursor; i -= 1) {
        parent.childNodes[i]?.remove();
      }
      cursor += 1;
    }
  });

  // 2) 清洗历史公式 span：合法公式重建，纯文本/标点降级为普通文本
  const formulaNodes = Array.from(doc.querySelectorAll('span[data-w-e-type="formula"]'));
  formulaNodes.forEach((node) => {
    const normalizedLatex = normalizeWangFormulaLatex(getFormulaLatexFromElement(node));
    if (!normalizedLatex) {
      // 空内容直接移除
      node.remove();
      return;
    }
    if (isPlainTextLikeFormulaLatex(normalizedLatex)) {
      // 类文本内容降级为纯文本
      node.replaceWith(doc.createTextNode(normalizedLatex));
      return;
    }
    // 其余情况重建为标准公式节点
    node.replaceWith(createWangFormulaNode(doc, normalizedLatex));
  });
};

/**
 * 查找文本中未被转义、且不是 $$ 的下一个 $ 闭合位置
 * @param text 文本
 * @param start 查找起始索引
 * @returns $ 闭合索引，未找到则返回 -1
 */
const findClosingDollarIndex = (text: string, start: number) => {
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === "$" && text[i - 1] !== "\\" && text[i + 1] !== "$") {
      return i;
    }
  }
  return -1;
};

// 正则：常见 latex 命令
const LATEX_COMMAND_PATTERN =
  /\\(frac|times|cdot|div|sqrt|pm|leq|geq|neq|approx|sum|prod|int|sin|cos|tan|log|ln|alpha|beta|gamma|theta|pi|left|right)\b/;
// 正则：简易 latex 片段，至少包含一个反斜线命令
const INLINE_LATEX_SEGMENT_PATTERN =
  /[A-Za-z0-9+\-*/=().\[\]{}^_]*\\[A-Za-z]+[A-Za-z0-9+\-*/=().,;:\[\]{}^_\\]*/g;

/**
 * 替换文档正文出现的 latex 命令（如 \frac、\sqrt 等）为公式节点
 * 跳过公式/代码/脚本/样式等节点
 * @param doc Document 实例
 */
const replaceInlineLatexText = (doc: Document) => {
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();

  // 收集所有文本节点
  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const text = textNode.nodeValue || "";
    // 不含 \ 可跳过
    if (!text.includes("\\")) return;

    const parent = textNode.parentElement;
    // 跳过公式/代码/脚本/样式/textarea
    if (
      !parent ||
      parent.closest(
        'span[data-w-e-type="formula"], code, pre, script, style, textarea',
      )
    ) {
      return;
    }

    const fragment = doc.createDocumentFragment();
    let cursor = 0;
    let changed = false;
    let match = INLINE_LATEX_SEGMENT_PATTERN.exec(text);

    while (match) {
      const matchedText = match[0];
      const start = match.index;
      const end = start + matchedText.length;
      const latex = matchedText.trim();

      // 命中 latex 命令，插入公式节点
      if (LATEX_COMMAND_PATTERN.test(latex)) {
        if (start > cursor) {
          fragment.appendChild(doc.createTextNode(text.slice(cursor, start)));
        }
        fragment.appendChild(createWangFormulaNode(doc, latex));
        cursor = end;
        changed = true;
      }

      match = INLINE_LATEX_SEGMENT_PATTERN.exec(text);
    }

    INLINE_LATEX_SEGMENT_PATTERN.lastIndex = 0;

    if (!changed) return;

    if (cursor < text.length) {
      fragment.appendChild(doc.createTextNode(text.slice(cursor)));
    }
    textNode.replaceWith(fragment);
  });
};

/**
 * 替换文档内容中用 $...$ 包裹的行内公式为公式节点
 * 跳过公式/代码/脚本/样式/textarea
 * @param doc Document 实例
 */
const replaceInlineDollarMath = (doc: Document) => {
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();

  // 收集所有文本节点
  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const text = textNode.nodeValue || "";
    // 不含 $ 可跳过
    if (!text.includes("$")) return;

    const parent = textNode.parentElement;
    // 跳过公式/代码/脚本/样式/textarea
    if (
      !parent ||
      parent.closest(
        'span[data-w-e-type="formula"], code, pre, script, style, textarea',
      )
    ) {
      return;
    }

    const fragment = doc.createDocumentFragment();
    let cursor = 0;
    let changed = false;

    while (cursor < text.length) {
      // 查找下一个 $ 符号
      const openIndex = text.indexOf("$", cursor);
      if (openIndex === -1) break;

      // 跳过 \$、$$
      const isEscaped = text[openIndex - 1] === "\\";
      const isPartOfDoubleDollar =
        text[openIndex - 1] === "$" || text[openIndex + 1] === "$";

      if (isEscaped || isPartOfDoubleDollar) {
        cursor = openIndex + 1;
        continue;
      }

      // 查找闭合 $
      const closeIndex = findClosingDollarIndex(text, openIndex + 1);
      if (closeIndex === -1) break;

      const latex = text.slice(openIndex + 1, closeIndex).trim();
      // 空公式直接跳过
      if (!latex) {
        cursor = closeIndex + 1;
        continue;
      }

      // 插入公式前的文本
      if (openIndex > cursor) {
        fragment.appendChild(doc.createTextNode(text.slice(cursor, openIndex)));
      }

      // 插入公式节点
      fragment.appendChild(createWangFormulaNode(doc, latex));
      changed = true;
      cursor = closeIndex + 1;
    }

    if (!changed) return;

    // 剩余文本插入 fragment
    if (cursor < text.length) {
      fragment.appendChild(doc.createTextNode(text.slice(cursor)));
    }
    textNode.replaceWith(fragment);
  });
};

// 将 WangEditor 的公式节点（<span data-w-e-type="formula">）转换为 <math latex=""> 结构
const replaceWangFormulaToMathNodes = (doc: Document) => {
  // 查找所有公式类型的 span 节点
  const formulaNodes = doc.querySelectorAll('span[data-w-e-type="formula"]');
  formulaNodes.forEach((formulaNode) => {
    // 获取公式的 LaTeX 内容，优先取 data-value，没有就取文本内容
    const latex =
      formulaNode.getAttribute("data-value") ||
      formulaNode.textContent ||
      "";
    if (!latex.trim()) {
      // 如果 latex 为空，直接移除节点
      formulaNode.remove();
      return;
    }
    // 替换为自定义 <math latex=""> 节点
    formulaNode.replaceWith(createMathLatexNode(doc, latex));
  });
};

/**
 * 将行内 $...$ 公式转为 <math latex=""> 节点
 *
 * 注意事项：
 * - 跳过 <math>、<code>、<pre>、<script>、<style>、<textarea> 等节点，避免误处理。
 * - 不转换 $$...$$（块级公式）或 \$（转义美元符号）。
 * - 仅转换未转义的单个 $ 包裹的内容（常用于数学公式）。
 * - 保留 $ 前后的普通文本，原样插入到 fragment。
 */
const replaceInlineDollarMathWithMathNodes = (doc: Document) => {
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT); // 遍历所有文本节点
  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();

  // 收集所有文本节点
  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const text = textNode.nodeValue || "";
    if (!text.includes("$")) return; // 无 $ 可跳过

    const parent = textNode.parentElement;
    // 跳过公式/代码块/脚本/样式/textarea 等特殊节点
    if (
      !parent ||
      parent.closest("math, code, pre, script, style, textarea")
    ) {
      return;
    }

    const fragment = doc.createDocumentFragment();
    let cursor = 0;
    let changed = false;

    // 逐步查找 $，仅转未转义/非 $$ 包裹的公式内容
    while (cursor < text.length) {
      const openIndex = text.indexOf("$", cursor);
      if (openIndex === -1) break;

      // 检查 $ 是否转义或为 $$
      const isEscaped = text[openIndex - 1] === "\\";
      const isPartOfDoubleDollar =
        text[openIndex - 1] === "$" || text[openIndex + 1] === "$";

      if (isEscaped || isPartOfDoubleDollar) {
        cursor = openIndex + 1;
        continue;
      }

      // 查找对应闭合 $
      const closeIndex = findClosingDollarIndex(text, openIndex + 1);
      if (closeIndex === -1) break;

      // 提取公式内容，并去首尾空格
      const latex = text.slice(openIndex + 1, closeIndex).trim();
      if (!latex) {
        cursor = closeIndex + 1;
        continue;
      }

      // 插入 $ 前的普通文本
      if (openIndex > cursor) {
        fragment.appendChild(doc.createTextNode(text.slice(cursor, openIndex)));
      }
      // 插入 <math latex=""> 节点
      fragment.appendChild(createMathLatexNode(doc, latex));
      changed = true;
      cursor = closeIndex + 1;
    }

    if (!changed) return; // 未变化可跳出

    // 剩余文本最后补充到 fragment
    if (cursor < text.length) {
      fragment.appendChild(doc.createTextNode(text.slice(cursor)));
    }
    textNode.replaceWith(fragment);
  });
};

/**
 * MathHtmlRenderer 预览前预处理
 * 用途：将原始 HTML 中的 wangEditor 公式节点、自定义 $...$ 行内公式和 <math latex=""> 节点都统一转为标准的 <math> 节点，便于后续统一渲染处理。
 * - 支持的 HTML 来源包括：
 *   - wangEditor 编辑器生成的自定义公式 <span data-w-e-type="formula" ...>
 *   - 直接包含的 $...$ inline/行内数学公式
 *   - 自身已有的 <math latex=""> 节点
 * - 处理完毕后返回新的 innerHTML （仅包含 body 下内容，不包含 head/script 等无关部分）
 *
 * @param html {any} 原始 HTML 字符串
 * @returns {string} 处理后的 HTML 字符串（已统一公式格式）
 */
export const prepareMathHtmlForRender = (html: any) => {
  if (!html || typeof html !== "string") return html;

  // 1. 新建 DOM 文档用于解析 HTML 字符串
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 2. 将 wangEditor 专有公式节点转为 <math> 节点
  replaceWangFormulaToMathNodes(doc);

  // 3. 将 $...$ 包裹的数学公式转为 <math> 节点
  replaceInlineDollarMathWithMathNodes(doc);

  // 4. 返回处理后的 HTML 字符串（body 下内容）
  return doc.body.innerHTML;
};

// wangEditor 公式渲染处理
// 作用：将统一格式的 <math latex=""> 节点和其他数学表达形式转换回 wangEditor 公式节点（<span data-w-e-type="formula" ...>）
// 并处理其他符号与特殊文本
export const parseMathHtmlToWangeditor = (html: any) => {
  if (!html) return html; // 空输入直接返回
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 0. 兼容历史数据里的非标准公式 span（分段 array / 文本误包公式）
  normalizeExistingFormulaSpans(doc);

  // 1. 将 <math latex=""> 节点转换成 wangEditor 的公式节点
  const mathNodes = doc.querySelectorAll("math");
  mathNodes.forEach((node) => {
    const latex = node.getAttribute("latex");
    if (latex) {
      // 使用 createWangFormulaNode 转换为 <span data-w-e-type="formula" ...>
      node.replaceWith(createWangFormulaNode(doc, latex));
    }
  });

  // 2. 还原 $...$ 形式的行内公式为公式节点
  replaceInlineDollarMath(doc);

  // 3. 还原形如 \frac、\sqrt 等 latex 片段为公式节点
  replaceInlineLatexText(doc);

  // 4. 处理自定义 class="qml-bk" 的节点为 <u> 标签（常用于计算题步骤空格）
  const bkNodes = doc.querySelectorAll(".qml-bk");
  bkNodes.forEach((node) => {
    const u = doc.createElement("u");
    // 将原有中文全角空格转为 HTML 空格
    u.innerHTML = node.textContent.replace(/\u3000/g, "&nbsp;&nbsp;");
    node.replaceWith(u);
  });

  // 5. 返回处理后的 HTML（只提取 body 下内容）
  return doc.body.innerHTML;
};
