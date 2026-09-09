import "./index.less";

const ChatSummary = (props: any) => {
  const { summary } = props;

  return (
    <div className="chat_summary">
      <div className="title">内容概要</div>
      <div className="content">{summary?.summary}</div>

      <div className="title">推荐提问</div>
      <div className="content">
        {summary?.recommend_question?.map((item: any, index: number) => {
          return <div key={index} className="content_list" onClick={() => { props?.onSendQuery({ query: item }) }}>{item}</div>
        })}
      </div>
    </div>
  );
};

export default ChatSummary;
