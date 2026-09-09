export const TOPIC_EDITOR_FLUSH_EVENT = "topic-editor-flush";

export const flushTopicRichEditors = () => {
  if (typeof document === "undefined") return;
  document.dispatchEvent(new Event(TOPIC_EDITOR_FLUSH_EVENT));
};
