import { connect } from "umi";

import { Key, memo, useRef, useState, } from "react";
import MarkdownRender from "@/components/MarkdownRender";
import { formatStaticUrl, latexReplace } from "@/utils";
import ZYIcon from "@/components/ZYIcon";
import { Col, message, Radio, Button } from "antd";
import { useDispatch } from "@umijs/max";
import Collapse from "../RightCard/Collapse";
import PublishToResourseLibary from "../RightCard/PublishToResourseLibary";
import "./index.less";

const AnswerCard = (props: any) => {
  const dispatch = useDispatch();
  const markdownRef = useRef(null);

  const { row, isEndNode, designModel, modelData } = props;
  const { loading, noAction = false } = row || {};


  const avatarCls = `${loading ? "assistant_avatar_activate" : "assistant_avatar"}`; // 头像样式
  const curAssistant = {};

  const onChangeAciton = async (param: any) => {
    if (param == "markdown") {
      navigator?.clipboard.writeText(row.text);
      message.success("复制成功");
      return;
    }

    if (param == "text") {
      navigator?.clipboard?.writeText(markdownRef.current.innerText);
      message.success("复制成功");
      return;
    }
    props?.setMockPPT?.(row.text);
  };

  return (
    <>
      <div className="answer_card_container question-answer-mt-32">
        <div className="assistant_basic">
          <div className="assistant_basic_logo">
            <ZYIcon type={"logo"} style={{ fontSize: 18 }} />
          </div>
          <div className="assistant_name">智谱AI</div>
        </div>

        {(row?.text || row) && (
          <>
            <div className=" answer-card-border question-answer-mt-32">
              <div className="design_answer_content" ref={markdownRef}>
                <MarkdownRender>{latexReplace(row.text || row)}</MarkdownRender>
              </div>
              {/* 生成PPT时的思考过程 */}
              <div className="response-content-container">
                <div ref={props.pptThinkingRef}>
                  {modelData.length > 0 && modelData.map((record: { details: string; thinkStatus: boolean; content: string }, index: Key | null | undefined) => {
                    return <div key={index}>
                      {record.details && (
                        <>
                          <Collapse
                            data={record.details}
                            thinkStatus={record.thinkStatus}
                            className="rounded-xl"
                          />
                        </>
                      )}
                      <MarkdownRender
                        className="markdown-prose my-3 blue_black"
                        components={{
                          blockquote: ({ node, ...props }) => {
                            return (
                              <blockquote className="" {...props} />
                            );
                          },
                          ol: ({ node, ...props }) => {
                            return (
                              <ol className="ml-3" style={{ marginLeft: '2em' }} start={1} {...props} />
                            );
                          }
                        }
                        }
                      >{record.content}</MarkdownRender>
                    </div>
                  })}
                </div>
              </div>

              {/* 教案生成完毕需要一个靠片展示 */}
              {!loading && <div className="answer-block-width finish_container_block">
                <div className="finish_container flex items-start answer-file cursor-pointer"
                  onClick={() => props.getDataByID(row.session_id, row.type, row)}>
                  {row?.type == 'ppt' ? <ZYIcon className="mr-3 " type="ppt-color" style={{ width: "20px", height: "20px" }} /> :
                    <ZYIcon className="mr-3 " type="file-color" style={{ width: "20px", height: "20px" }} />
                  }
                  <div className="flex flex-col">
                    <div className="blue_black font-medium">{row.fileName || row.text}</div>
                    <div className="answer-file-createTime">创建时间：{row?.time?.split('T')[0]}</div>
                  </div>
                </div>
                {(!noAction || row?.messages?.length == 0) && <div className="flex w-full actions">
                  <PublishToResourseLibary
                    className="left_publis_btn"
                    selectedItem={row}
                    course_id={props?.course_id}
                  />

                  {(!!!row?.messages || row?.messages?.length == 0) &&
                    <div className="action create-ppt-btn cursor-pointer flex items-center" onClick={() => { props.getCreatePPTNew() }}>
                      <ZYIcon type="shengchengppt" />
                      <div className="flex items-center">生成PPT</div>
                    </div>
                  }

                </div>}
              </div>}
            </div>
          </>
        )}

      </div >
    </>
  );
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
  designModel: state.designModel,
}))(memo(AnswerCard));
