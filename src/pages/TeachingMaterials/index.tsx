import { useEffect, useState, useRef } from "react";
import { Layout, message } from "antd";
import { connect, useDispatch } from "@umijs/max";
import { cogUrl } from "@/utils/host";
import { history, useLocation } from "umi";
import ChatEmpty from "@/components/ChatEmpty";
import AnswerCard from "./components/AnswerCard";
import ChatTextArea from "./components/ChatTextArea";
import QueryCard from "./components/QueryCard";
import {
  addTracking,
  deepCopy,
  scrollTop,
  sseRequset,
  stopSSE,
  str2json,
  uuid,
} from "@/utils";
import RightCard from "./components/RightCard";
import EduSource from "@/components/EduSource";
import "./components/LeftCard/index.less";
import "./index.less";

const cur_assistant = "default_agent";
let gMarkdownStart = ""; // 缓存 stream 输出
let gChatList: any = []; // 当前问答历史
let firstTime = true; // 是否第一次
let gStartStatus = false; // 是否开始生成PPT
let gMockStop = false; // mock数据停止标识
let modelData = []; // ppt 模型回答
let artifactsEditor; // 编辑器对象

const queryMessage = (page) => {
  return `请帮我根据这份资料${page == -1 ? "" : `第${page}页`}生成教案`;
};

const pptQuery = "请帮我基于教案文档生成讲义PPT";
const App = (props) => {
  const { commonModel, designModel } = props;
  const { outlineText } = designModel;
  const { chatLoading } = commonModel || {};
  const { search, pathname } = useLocation();
  const searchParams = new URLSearchParams(search);
  const courseId = searchParams.get("courseId");
  const [pageNumStr, setPageNumStr] = useState("");
  const chatListRef = useRef(null);
  const pptThinkingRef = useRef(null);
  const leftCardRef = useRef(null);

  const dispatch = useDispatch();
  // const actionRef = useRef(null);
  const [showPPT, setShowPPT] = useState(false);
  const [textbookList, setTextbookList] = useState([]);
  const [isStartCreatePPT, setIsStartCreatePPT] = useState({
    loadding: false,
    status: "",
  });
  const [chatList, setChatList] = useState([]);
  const [rightTabStatus, setRightTabStatus] = useState("outline");
  const [selectedItem, setSelectedItem] = useState({});

  let teaching_content_agent_request_id;

  useEffect(() => {
    initValue();
    getHistory();
  }, [courseId]);

  useEffect(() => {
    gMockStop = false;
    gChatList = [];
    modelData = [];
    gMarkdownStart = "";
    // 拦截判断是否离开当前页面
    // window.addEventListener("beforeunload", () => {
    //   message.warning("离开页面后停止输出");
    //   stopSSE();
    // });
    // return () => {
    //   message.warning("离开页面后停止输出");
    //   stopSSE();
    // }
    addTracking({ page_name: "教案讲义" })   // 数据埋点


  }, []);

  const initValue = () => {
    setShowPPT(false);
    setTextbookList([]);
    setChatList([]);
    setRightTabStatus("outline");
    stopSSE();
    dispatch({
      // 大纲数据
      type: "designModel/setData",
      payload: { outlineText: "", htmlData: [] },
    });
  };

  const scrollLeftTopChat = () => {
    setTimeout(() => {
      scrollTop(leftCardRef);
    }, 100);
  };

  // 获得历史记录
  const getHistory = async () => {
    setIsStartCreatePPT({ type: "history" });
    const historyListTemp = await dispatch({
      type: "teachingModel/getData",
      apiUrl: "historyList",
      payload: { courseId },
    });

    const history = [];
    historyListTemp?.data?.map((item, index) => {
      const {
        doc_start,
        doc_end,
        doc_name,
        doc_id,
        outline_time,
        ppt_time,
        topic,
        messages,
        session_id,
        request_id,
      } = item;
      history.push(
        ...[
          {
            id: uuid(),
            category: "query",
            title: queryMessage(
              `${doc_start ? `${doc_start}-${doc_end}` : -1}`,
            ),
            question_pdf: [{ doc_name, id: doc_id }],
          },
          {
            id: uuid(),
            category: "answer",
            assistant_id: cur_assistant,
            text: "教案生成完毕",
            fileName: topic,
            time: outline_time,
            noAction: false,
            session_id,
            request_id,
            messages,
          },
        ],
      );

      // 开始PPT
      if (messages.length > 0) {
        const modelDataTemp = [];
        history.push(
          ...[
            {
              id: uuid(),
              category: "query",
              title: pptQuery,
            },
            {
              id: uuid(),
              category: "answer",
              text: "讲义PPT生成完毕",
              time: ppt_time,
              fileName: topic,
              type: "ppt",
              modelData: [],
              noAction: true,
              session_id,
              request_id,
            },
          ],
        );
        messages.map((item2: any, iindex) => {
          const { name, role, reasoning, content, tool_calls } = item2;
          if (role == "assistant") {
            if (reasoning && reasoning !== "") {
              modelDataTemp.push({
                details: reasoning,
                category: "answer",
                id: `ppt_${item.doc_id}${index}${iindex}`,
              });
            }
            if (content && content !== "") {
              modelDataTemp.push({
                content: content,
                category: "answer",
                id: `ppt_${item.doc_id}${index}${iindex}`,
              });
            }
          }
          if (role == "tool" && name != "initialize_desgin") {
            modelDataTemp.push({
              category: "answer",
              content: content,
              id: `ppt_${item.doc_id}${index}${iindex}`,
            });
          }
        });
        history[history.length - 1].modelData = modelDataTemp;
      }
      setChatList(deepCopy([...chatList, ...history]));
    });
    scrollLeftTopChat();
  };

  const getDataByID = async (id, type, row, index) => {
    console.log({ id, type, row, index });
    if (!id) {
      return;
    }
    setSelectedItem(row);
    if (type == "ppt") {
      const historyListTemp = await dispatch({
        type: "teachingModel/getData",
        apiUrl: "getPPTPageById",
        payload: { session_id: id },
      });
      await dispatch({
        // 大纲数据
        type: "designModel/setData",
        payload: { htmlData: historyListTemp.data },
      });
      setRightTabStatus("ppt");
    } else {
      const historyListTemp = await dispatch({
        type: "teachingModel/getData",
        apiUrl: "getOutlineById",
        payload: { session_id: id },
      });

      await dispatch({
        // 大纲数据
        type: "designModel/setData",
        payload: { outlineText: historyListTemp.data },
      });

      setRightTabStatus("outline");
    }
  };

  const onShowPPT = () => {
    setShowPPT(true);
  };

  const clear = () => {
    setPageNumStr("");
    setTextbookList([]);
  };

  const checkFn = (arr: any) => {
    setTextbookList(arr);
  };

  // 取消关闭勾选
  const cancel = (item: any) => {
    let arr = textbookList?.filter((val: any) => {
      return val?.id != item?.id;
    });
    setTextbookList(arr);
    setPageNumStr("");
  };

  // 生成大纲的接口
  const onSendQuery = async (param: any) => {
    if (chatLoading) {
      message.info({ content: "当前对话正在进行中", key: "chatKey" });
      return;
    }
    firstTime = true;
    gStartStatus = false;
    gMockStop = false;

    const { query, fileList } = param;
    if (!query) {
      message.warning("请输入你的问题");
      return false;
    }
    // setModelData([])
    await dispatch({
      // 大纲数据
      type: "designModel/setData",
      payload: { outlineText: gMarkdownStart },
    });

    setRightTabStatus("outline");

    await dispatch({
      type: "commonModel/setData",
      payload: { chatLoading: true },
    });
    clear();
    // const lastSessionID = chatList[chatList.length - 1]?.session_id;
    // // 多轮对话
    // if (fileList.length == 0 && lastSessionID !== '') {
    //   console.log("没有文件", fileList)
    //   await dispatch({
    //     // 大纲数据
    //     type: "designModel/setData",
    //     payload: { htmlData: [] },
    //   });
    //   // 生成PPT 多轮
    //   return getCreatePPTNew(lastSessionID)
    // }
    const userPrompt = `'${query}'`;
    const payload = {
      sseUrl: `${cogUrl}/assistant/run/ppt/chat_v1`,
      assistant_id: "teaching_content_agent",
      space_id: courseId,
      session_id: "", //searchParams.get("session_id") ||
      question: userPrompt,
      doc_id: fileList?.[0]?.id,
      // doc_start: parseInt(doc_start), // 非主教材是这两个参数
      // doc_end: parseInt(doc_end),
      // chapter_page_ranges: [], // 目录的起始页码和终止页码 主教材是chapter_page_ranges,
      doc_name: fileList?.[0]?.doc_name,
    };
    if (pageNumStr.type == 1) {
      payload["chapter_page_ranges"] = pageNumStr?.checkItems?.reduce(
        (result, item: any) => {
          result.push([item.start_page, item.end_page]);
          return result;
        },
        [],
      );
    } else if (pageNumStr.type == 0) {
      const [doc_start, doc_end] = pageNumStr?.str_page.split("-");
      payload["doc_start"] = parseInt(doc_start);
      payload["doc_end"] = parseInt(doc_end);
    }
    gChatList = [
      {
        id: uuid(),
        category: "query",
        title: query,
        ref_question_list: [],
        question_pdf: fileList,
      },
      {
        id: uuid(),
        category: "answer",
        loading: true,
        assistant_id: cur_assistant,
        text: "教案生成中...",
      },
    ];

    setChatList(deepCopy([...chatList, ...gChatList]));
    sseRequset(payload, (res: any) => updChatInfo?.(res));
    setTextbookList([]);
    scrollLeftTopChat();
  };

  const scrollTopChat = () => {
    setTimeout(() => {
      scrollTop(chatListRef);
      // scrollTop(pptThinkingRef);
    }, 100);
  };

  const updChatInfo = async (param: any) => {
    setSelectedItem(null);
    const content = str2json(param.data);
    const { node_id, __session_id, __type, __action, data, time, request_id } =
      content;
    scrollTopChat(); // 滚动

    if (__action == "start") {
      let tempUrl = `${pathname}${search}&session_id=${__session_id}`;
      history.replace(tempUrl); // 修改 URL 但不刷新页面
      gMarkdownStart = "";
      localStorage.setItem("teaching_content_agent_request_id", request_id);
      if (gChatList.length > 0) {
        gChatList[gChatList.length - 1]["request_id"] = request_id;
        gChatList[gChatList.length - 1]["session_id"] = __session_id;
      } else {
        gChatList.push({ request_id, session_id: __session_id });
      }
      return;
    }

    if (__action == "title_name") {
      gChatList[gChatList.length - 1]["fileName"] = data;
      gChatList[gChatList.length - 1]["time"] = new Date().toISOString();
    }

    if (__action == "end") {
      await dispatch({
        type: "commonModel/setData",
        payload: { chatLoading: false },
      });

      gChatList[gChatList.length - 1]["loading"] = false;

      if (gChatList?.length == 2) {
        onShowPPT();
        // 第一次大纲
        gChatList[gChatList.length - 1]["text"] = "教案生成完毕";
        await dispatch({
          // 大纲数据
          type: "designModel/setData",
          payload: { outlineText: gMarkdownStart },
        });
      }
      const tempChatList = deepCopy([...chatList, ...gChatList]);
      props?.getChatAnswer?.(tempChatList);
      setChatList(tempChatList);
      setSelectedItem(gChatList[gChatList.length - 1]);
      // gMarkdownStart = "";
      return;
    }

    if (__action == "error") {
      console.log("error------", data);
      gMarkdownStart = "";
      await dispatch({
        type: "commonModel/setData",
        payload: { chatLoading: false },
      });
      gChatList[gChatList.length - 1]["loading"] = false;
      const tempChatList = deepCopy([...chatList, ...gChatList]);
      props?.getChatAnswer?.(tempChatList);
      setChatList(tempChatList);
      return;
    }

    if (__action == "stream") {
      // // 大模型或流式回答
      const mergeMarkdown = [gMarkdownStart, data].join("");
      gChatList[gChatList.length - 1]["text"] = mergeMarkdown;
      const tempChatList = deepCopy([...chatList, ...gChatList]);
      // setChatList(tempChatList);
      gMarkdownStart = mergeMarkdown;
      // console.log("模型流式输出", gMarkdownStart)
      await dispatch({
        // 大纲数据
        type: "designModel/setData",
        payload: { outlineText: gMarkdownStart },
      });

      return;
    }
  };

  const onClickStop = async () => {
    stopSSE();
    gMockStop = true;
    await updChatLoading();
  };
  const updChatLoading = async () => {
    await dispatch({
      type: "commonModel/setData",
      payload: { chatLoading: false },
    }); // 开始生成对话内容
    let tempList = deepCopy(chatList);
    tempList[tempList.length - 1]["loading"] = false;
    const tempChatList = deepCopy([...tempList]);
    setChatList(tempChatList);
  };

  const createNewTalk = async () => {
    gChatList = [];
    gMockStop = true;
    setChatList([]);
    console.log("创建新的对话时清空");
    await dispatch({
      // 大纲数据
      type: "designModel/setData",
      payload: { outlineText: "" },
    });
  };

  const getCreatePPTNew = () => {
    setIsStartCreatePPT({ loadding: true, status: "start", type: "create" });
    setSelectedItem(null);
    scrollLeftTopChat();
    scrollTopChat();
    console.log("firstTime-----", firstTime)
    if (!firstTime) return; // 切换不重新请求
    firstTime = false;
    if (gStartStatus) return;
    // setModelData([])

    modelData = [
      {
        id: uuid(),
        category: "query",
        title: pptQuery,
      },
      {
        id: uuid(),
        category: "answer",
        loading: true,
        assistant_id: cur_assistant,
        text: "讲义PPT生成中...",
        type: "ppt",
        modelData: [],
      },
    ];
    const [doc_start, doc_end] = pageNumStr.split("-");
    const payload = {
      sseUrl: `${cogUrl}/assistant/run/ppt/chat_v1`,
      assistant_id: "ppt_agent",
      space_id: courseId,
      session_id: searchParams.get("session_id") || "",
      request_id: localStorage.getItem("teaching_content_agent_request_id"),
      question: `根据教案大纲生成PPT` || "大模型",
      doc_start: parseInt(doc_start),
      doc_end: parseInt(doc_end),
    };

    setChatList(deepCopy([...chatList, ...modelData]));
    sseRequset(payload, (res: any) => createPPTProcess?.(res));
  };

  let item: {
    details: any;
    thinkStatus: any;
    content: any;
    glmBlock: {
      html: string;
      type: "html" | "preview";
      action_description: string;
      index: number;
    };
  };
  let html = "";
  let fileName = "";
  const createPPTProcess = async (param: any) => {
    const content = str2json(param.data);
    const htmlData = [];
    scrollTopChat(); // 滚动
    scrollLeftTopChat();

    // console.log("content------", content)
    const { __session_id, __type, __action, data, tools, index, request_id } =
      content;
    if (__action == "title_name") {
      console.log("title_name-------", data);
      fileName = data;
    }

    // scrollTopChat(); // 滚动
    if (__action == "start") {
      gStartStatus = true;
      let tempUrl = `${pathname}${search}&session_id=${__session_id}`;
      history.replace(tempUrl); // 修改 URL 但不刷新页面
      modelData[modelData.length - 1]["request_id"] = request_id;
      modelData[modelData.length - 1]["session_id"] = __session_id;

      setSelectedItem(modelData[modelData.length - 1]);
    }
    if (__action == "start_think" || __action == "start") {
      // 这是一条数据的开始
      item = {
        glmBlock: { html: "", type: "html", action_description: "", index: 0 },
        details: "",
        content: "",
        thinkStatus: true,
      };
      modelData[modelData.length - 1].text = "";
      modelData[modelData.length - 1].type = "ppt";
      modelData[modelData.length - 1]["modelData"].push(item);
      html = "";
    }
    if (__action == "think") {
      item.details += data;
      setChatList(deepCopy([...chatList, ...modelData]));
    }
    if (__action == "end_think") {
      item.thinkStatus = false;
      setChatList(deepCopy([...chatList, ...modelData]));
      // setSelectedItem(gChatList[gChatList.length - 1]);
    }

    if (__action == "llm") {
      item.content += data;
      setChatList(deepCopy([...chatList, ...modelData]));
      return;
    }

    // PPT 数据
    if (__action == "initialize_desgin") {
      setRightTabStatus("ppt");
      setIsStartCreatePPT({
        loadding: true,
        status: "ppt",
        pptLoading: true,
        type: "create",
      });
    }
    if (__action == "insert_page") {
      setIsStartCreatePPT({
        loadding: true,
        status: "ppt",
        pptLoading: false,
        type: "create",
      });
      // console.log("data-------insert_pageinsert_pageinsert_pageinsert_page-----------", data)
      html += JSON.parse(`"${data}"`);
      item.glmBlock = { html, index, type: "html", action_description: "" };
      // console.log("insert_page---------html---------", html)
      setChatList(deepCopy([...chatList, ...modelData]));
    }
    // 这里有完整的HTML
    if (__action == "tool_call") {
      const toolsObj = str2json(tools);
      const { index, html, action_description } = str2json(toolsObj.args);
      item.glmBlock.action_description = action_description;
      item.glmBlock.html = html;
      item.glmBlock.index = index;
      item.glmBlock.type = "preview";
      setChatList(deepCopy([...chatList, ...modelData]));
      setIsStartCreatePPT({
        loadding: true,
        status: "ppt",
        pptLoading: false,
        type: "create",
      });
      htmlData.push(item.glmBlock);
      await dispatch({
        // 大纲数据
        type: "designModel/setData",
        payload: { htmlData: [...designModel.htmlData, ...htmlData] },
      });
    }
    if (__action == "end") {
      // PPT 生成完成
      // setIsStartCreatePPT({ loadding: false, status: 'finish' })
      modelData[modelData.length - 1].fileName = fileName;
      modelData[modelData.length - 1]["loading"] = false;
      modelData[modelData.length - 1]["noAction"] = true;
      modelData[modelData.length - 1]["time"] = new Date().toISOString();
      setChatList(deepCopy([...chatList, ...modelData]));
      setSelectedItem(modelData[modelData.length - 1]);
      // await dispatch({
      //   // 大纲数据
      //   type: "designModel/setData",
      //   payload: { htmlData: [...designModel.htmlData, ...htmlData] },
      // });
    }
    if (__action == "error") {
      message.error(data);
      message.error("错误");
      modelData[modelData.length - 1]["loadding"] = false;
      setIsStartCreatePPT({ pptLoading: false });
      console.log("error----", data);
    }
  };
  const cancelDrawer = () => {
    let arr = textbookList?.map((val: any) => {
      return val;
    });
    setTextbookList(arr);
  };

  return (
    <>
      <div className="teaching_materials_page_container">
        <div className="teaching_materials_page_container_css">
          <div className="teaching_materials_page_container_left">
            <div className="teaching_materials_page_container_left_left">
              <EduSource
                checkFn={checkFn}
                clickDrawer={true}
                textbookList={textbookList}
                showType={"radio"}
                selectDirectly={true}
                editPage={true}
                pageNumStrFn={(str: any) => {
                  setPageNumStr(str);
                }}
                options={[
                  { label: "全部", value: "全部" },
                  { label: "教材", value: "教材" },
                  { label: "其他", value: "其他" },
                ]}
                cancelDrawer={cancelDrawer}
                showDropdown={false}
              />
            </div>
          </div>
          <div className="flex justify-start w-right-full">
            <div className="teaching_materials_page_container_left_right">
              {/* <LeftCard
                // onShowPPT={onShowPPT}
                onHiddenPPT={onHiddenPPT}
                getChatAnswer={getChatAnswer}
                textbookList={textbookList}
                cancel={cancel}
                clear={clear}
                isStartCreatePPT={isStartCreatePPT}
                onSendQuery={onSendQuery}
                chatList={chatList}
              /> */}

              <div className="teaching_materials_left">
                <div className="design_left_card_container">
                  <div className="design_chat_container">
                    <div className="design_chat_list_teach" ref={leftCardRef}>
                      {chatList?.length == 0 && (
                        <ChatEmpty
                          ZYIconStyle={{
                            width: 80,
                            height: "auto",
                            marginRight: "12px",
                          }}
                          emptySty={{ display: "flex" }}
                          descriptionSty={{
                            width: "154px",
                          }}
                          title={`输入需求指令或上传教学资料`}
                        />
                      )}

                      {chatList?.map?.((item: any, index: any) => {
                        const { category, id } = item;
                        let isEndNode = chatList.length - 1 == index;
                        if (category == "query") {
                          return (
                            <QueryCard
                              key={id}
                              row={item}
                              isEndNode={isEndNode}
                            />
                          );
                        }
                        return (
                          <AnswerCard
                            {...props}
                            textbookList={textbookList}
                            key={id}
                            row={item}
                            course_id={courseId}
                            pptThinkingRef={pptThinkingRef}
                            isEndNode={isEndNode}
                            getCreatePPTNew={getCreatePPTNew}
                            isStartCreatePPT={isStartCreatePPT}
                            modelData={item?.modelData || []}
                            getDataByID={(id, type, row) =>
                              getDataByID(id, type, row, index)
                            }
                          />
                        );
                      })}
                    </div>

                    <ChatTextArea
                      {...props}
                      cancel={cancel}
                      pageNumStr={pageNumStr}
                      textbookList={textbookList}
                      createNewTalk={createNewTalk}
                      onSendQuery={onSendQuery}
                      onClickStop={onClickStop}
                      defaultValue=""
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="teaching_materials_page_container_right">
              <RightCard
                isStartCreatePPT={isStartCreatePPT}
                showPPT={showPPT}
                chatList={chatList}
                modelData={[]}
                tabStatus={rightTabStatus}
                setTabStatus={setRightTabStatus}
                chatListRef={chatListRef}
                selectedItem={selectedItem}
                course_id={courseId}
                getCreatePPTNew={getCreatePPTNew}
                setSelectedItem={setSelectedItem}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default connect((state: any) => ({
  aiClassroomModel: state.aiClassroomModel,
  commonModel: state.commonModel,
  designModel: state.designModel,
}))(App);
