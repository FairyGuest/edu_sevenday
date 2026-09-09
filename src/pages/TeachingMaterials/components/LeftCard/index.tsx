import {
  deepCopy,
  scrollTop,
  sseRequset,
  stopSSE,
  str2json,
  uuid,
} from "@/utils";
import { message } from "antd";

import { connect, useDispatch, history, useLocation } from "@umijs/max";
import { useEffect, useRef, useState } from "react";
import { cogUrl } from "@/utils/host";
import ChatTextArea from "../ChatTextArea";
import ChatEmpty from "@/components/ChatEmpty";
import QueryCard from "../QueryCard";
import AnswerCard from "../AnswerCard";

import "./index.less";

let gMarkdownStart = ""; // 缓存 stream 输出
let gChatList: any = []; // 当前问答历史

const cur_assistant = "default_agent";

let gMockStop = false; // mock数据停止标识

const App = (props: any) => {
  const { commonModel, modelData } = props;
  const { chatLoading } = commonModel || {};

  const chatListRef = useRef(null);
  const dispatch = useDispatch();
  const [chatList, setChatList] = useState([]);

  const { search, state: queryState } = useLocation();
  const searchParams = new URLSearchParams(search);

  const assistant_id = searchParams.get("id") || "default_agent"; // 助手 ID
  const session_id = searchParams.get("session_id"); // 助手 ID
  const courseId = searchParams.get("courseId"); // 助手 ID

  useEffect(() => {
    gMockStop = false;
    gChatList = [];
    gMarkdownStart = "";
  }, []);

  const onSendQuery = async (param: any) => {
    if (chatLoading) {
      message.info({ content: "当前对话正在进行中", key: "chatKey" });
      return;
    }
    gMockStop = false;
    const { query, fileList } = param;
    await dispatch({
      type: "commonModel/setData",
      payload: { chatLoading: true },
    });
    props?.clear?.();
    const userPrompt = `'${query}'`;
    const payload = {
      sseUrl: `${cogUrl}/assistant/run`,
      space_id: "6122abd1-26ea-42ca-9fbe-9242b891353f",
      assistant_id: "default_agent",
      session_id: "22344431-053b-435d-ba24-043be14a5143",
      is_hisory: true,
      question: userPrompt,
      ref_question_list: [],
      doc_id: fileList?.[0]?.id,
    };
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
  };

  const updChatInfo = async (param: any) => {
    const content = str2json(param.data);
    const { node_id, __session_id, __type, __action, question, data } = content;
    scrollTopChat(); // 滚动

    if (__action == "start") {
      let tempUrl = `/teach/space/teachingMaterials?courseId=${courseId}&session_id=${__session_id}`;
      history.replace(tempUrl); // 修改 URL 但不刷新页面
      gMarkdownStart = "";
      console.log("开始时设置为空-----", gMarkdownStart);
      return;
    }

    if (__action == "end") {
      await dispatch({
        type: "commonModel/setData",
        payload: { chatLoading: false },
      });

      gChatList[gChatList.length - 1]["loading"] = false;

      if (gChatList?.length == 2) {
        // props?.onShowPPT();
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

      gMarkdownStart = "";
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
      setChatList(tempChatList);
      gMarkdownStart = mergeMarkdown;
      console.log("模型流式输出", gMarkdownStart);
      // TODO: 返回到上层

      return;
    }
  };

  const scrollTopChat = () => {
    setTimeout(() => {
      scrollTop(chatListRef);
    }, 100);
  };

  const createNewTalk = async () => {
    gChatList = [];
    gMockStop = true;
    setChatList([]);
    props?.onHiddenPPT?.();
    console.log("创建新的对话时清空");
    await dispatch({
      // 大纲数据
      type: "designModel/setData",
      payload: { outlineText: "" },
    });
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

  return (
    <div className="teaching_materials_left">
      <div className="design_left_card_container">
        <div className="design_chat_container">
          <div className="design_chat_list" ref={chatListRef}>
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
                return <QueryCard key={id} row={item} isEndNode={isEndNode} />;
              }
              return (
                <AnswerCard
                  {...props}
                  key={id}
                  row={item}
                  isEndNode={isEndNode}
                  modelData={modelData}
                  isStartCreatePPT={props?.isStartCreatePPT}
                />
              );
            })}
          </div>

          <ChatTextArea
            {...props}
            createNewTalk={createNewTalk}
            onSendQuery={props.onSendQuery}
            onClickStop={onClickStop}
            defaultValue=""
          />
        </div>
      </div>
    </div>
  );
};
export default connect((state: any) => ({
  designModel: state.designModel,
  commonModel: state.commonModel,
}))(App);
