import { useTopicMeta } from "./useTopicMeta";
import { useTopicSave } from "./useTopicSave";

export const useTopic = () => {
  const meta = useTopicMeta();
  const save = useTopicSave();

  return {
    ...meta,
    ...save,
  };
};
