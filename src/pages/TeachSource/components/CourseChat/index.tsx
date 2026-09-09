import {
  deepCopy,
  getUserInfo,
  scrollTop,
  sseRequset,
  stopSSE,
  str2json,
  uuid,
} from "@/utils";
import { connect, useDispatch, useLocation } from "@umijs/max";
import { useEffect, useRef, useState } from "react";
import { cogUrl } from "@/utils/host";
import QueryCard from "@/components/QueryCard";
import AnswerCard from "@/components/AnswerCard";
import ChatTextArea from "@/components/ChatTextArea";
import ChatEmpty from "@/components/ChatEmpty";
import ChatSummary from "@/components/ChatSummary";
import ChatLoading from "@/components/ChatLoading";
import { CloseOutlined } from "@ant-design/icons";
import { message } from "antd";

import "./index.less";

let gMarkdownStart = ""; // 缓存 stream 输出
let gChatList: any = []; // 当前问答历史
let gMockStop = false; // mock数据停止标识

const App = (props: any) => {
  const { commonModel, teachSourceModel, openAI } = props;
  const { chatLoading } = commonModel || {};
  const { activeTab } = teachSourceModel;

  const chatListRef = useRef(null);
  const dispatch = useDispatch();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const courseId = searchParams.get("courseId");
  const segValue = searchParams.get("type");

  const assistant_id = (segValue === "course" ? "classPreparationAssistant" : "classAssistant"); // 对话智能体ID
  const [chatList, setChatList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [summary, setSummary] = useState<{ doc_id?: string }>({}); // 文档摘要

  useEffect(() => {
    clearData();
    if (openAI) {
      getChatHistory();
      getSummary();
    }
  }, [openAI, courseId, activeTab, segValue])
  // 清空数据
  const clearData = () => {
    gMockStop = false;
    gChatList = [];
    gMarkdownStart = "";
    setSummary({});
    setChatList([]);
  }
  // 开始对话
  const onSendQuery = async (param: any) => {
    if (chatLoading) {
      message.info({ content: "当前对话正在进行中", key: "chatKey" });
      return;
    }
    gMockStop = false;

    await dispatch({
      type: "commonModel/setData",
      payload: { chatLoading: true },
    });

    const { query } = param;
    const userPrompt = `${query}`;
    const payload = {
      sseUrl: `${cogUrl}/assistant/run`,
      space_id: courseId,
      assistant_id,
      doc_id: activeTab?.id === "source" ? "-1" : activeTab?.id,
      // session_id: "22344431-053b-435d-ba24-043be14a5143",
      is_hisory: false,
      question: userPrompt,
      ref_question_list: [],
    };
    gChatList = [
      { id: uuid(), category: "query", title: query, ref_question_list: [] },
      {
        id: uuid(),
        category: "answer",
        loading: true,
        assistant_id,
      },
    ];

    setChatList(deepCopy([...chatList, ...gChatList]));
    sseRequset(payload, (res: any) => updChatInfo?.(res));
  };
  // 更新对话内容
  const updChatInfo = async (param: any) => {
    const content = str2json(param.data);
    const { node_id, __session_id, __type, __action, question, data } = content;
    scrollTopChat(); // 滚动
    if (__action == "start") {
      gMarkdownStart = "";
      return;
    }
    if (__action == "end" || __action == "error") {
      gMarkdownStart = "";
      await dispatch({
        type: "commonModel/setData",
        payload: { chatLoading: false },
      });
      gChatList[gChatList.length - 1]["loading"] = false;
      const tempChatList = deepCopy([...chatList, ...gChatList]);
      setChatList(tempChatList);
      return;
    }

    if (__action == "stream") {
      // // 大模型或流式回答
      const mergeMarkdown = [gMarkdownStart, data].join("");
      gChatList[gChatList.length - 1]["text"] = mergeMarkdown;
      const tempChatList = deepCopy([...chatList, ...gChatList]);
      setChatList(tempChatList);
      gMarkdownStart = mergeMarkdown;
      return;
    }
  };
  // 滚动到顶部
  const scrollTopChat = () => {
    setTimeout(() => {
      scrollTop(chatListRef);
    }, 100);
  };
  // 新建对话
  const createNewTalk = () => {
    gChatList = [];
    gMockStop = true;
    setChatList([]);
    props?.onHiddenPPT?.();
  };
  // 停止对话
  const onClickStop = async () => {
    stopSSE();
    gMockStop = true;
    await updChatLoading();
  };
  // 停止对话内容
  const updChatLoading = async () => {
    await dispatch({
      // 开始生成对话内容
      type: "commonModel/setData",
      payload: { chatLoading: false },
    });

    let tempList = deepCopy(chatList);
    tempList[tempList.length - 1]["loading"] = false;
    const tempChatList = deepCopy([...tempList]);
    setChatList(tempChatList);
  };
  // 获取文档摘要
  const getSummary = async () => {
    const { id, exam_id, file_type } = activeTab;
    // 获取文档摘要(习题、图谱、助手除外)
    if (
      exam_id ||
      id == "source" ||
      ["graph", "teachingMaterials", "md"].includes(file_type)
    ) {
      return;
    }
    const { code, data }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "postDocContentSummary",
      payload: { doc_id: id },
    });

    if (code == 200) {
      setSummary(data);
    }
  };
  // 获取对话历史
  const getChatHistory = async () => {
    setHistoryLoading(true);
    const { code, data }: any = await dispatch({
      type: "teachSourceModel/postData",
      apiUrl: "postChatHistory",
      payload: {
        assistant_id,
        space_id: courseId,
        doc_id: activeTab.id === "source" ? "-1" : activeTab.id,
      },
    });
    if (code == 200) {
      data.forEach((item: any) => {
        const queryArr = item.filter((item: any) => item.role == "user");
        const answerArr = item.filter((item: any) => item.role == "assistant");

        gChatList.push({
          ...queryArr[0],
          id: uuid(),
          category: "query",
          title: queryArr[0].content,
          ref_question_list: [],
        })
        gChatList.push({
          id: uuid(),
          category: "answer",
          loading: false,
          assistant_id,
          text: answerArr.at(-1)?.content,
        });
      })
      setChatList(gChatList);
    }
    scrollTopChat();
    setHistoryLoading(false);
  };

  return (
    <div className="design_chat_container">
      <div className="design_chat_header">
        <div className="title">
          {segValue === "course" ? "教学资源助手" : "AI课堂助手"}
        </div>
        <div className="right_btn">
          <CloseOutlined onClick={() => props?.setOpenAI?.(false)} />
        </div>
      </div>
      <div className="design_chat_list" ref={chatListRef}>
        {historyLoading && <ChatLoading /> }
        {!summary?.doc_id && chatList?.length == 0 && !historyLoading && (
          <ChatEmpty
            descriptionSty={{ fontSize: "18px" }}
            title={`您好，我是${segValue === "course" ? "教学资源助手" : "AI课堂助手"}`}
          />
        )}

        {summary?.doc_id && (
          <ChatSummary summary={summary} onSendQuery={onSendQuery} />
        )}

        {chatList?.length > 0 && !historyLoading && (
          <div className="design_chat_list_container">
            {chatList.map((item: any, index: any) => {
              const { category, id } = item;
              let isEndNode = chatList.length - 1 == index;
              if (category == "query") {
                return <QueryCard key={id} row={item} isEndNode={isEndNode} />;
              }
              return (
                <AnswerCard
                  {...props}
                  key={id}
                  row={item}
                  defaultName={ segValue === "course" ? "教学资源助手" : "AI课堂助手" }
                  isEndNode={isEndNode}
                />
              );
            })}
          </div>
        )}
      </div>
      <ChatTextArea
        createNewTalk={createNewTalk}
        onSendQuery={onSendQuery}
        onClickStop={onClickStop}
        hiddenFileUpload={true}
        hiddenNewChat={true}
      />
    </div>
  );
};
export default connect((state: any) => ({
  commonModel: state.commonModel,
  teachSourceModel: state.teachSourceModel,
}))(App);
