import { useCallback, useEffect, useRef } from "react";
import { message } from "antd";
import {
  buildPaperFullDataPayload,
  buildPaperMetaForFullData,
} from "../../Exercise/hooks/topicSavePayload";

type SaveOptions = {
  draftFlag?: boolean;
  silent?: boolean;
  title?: string;
};

type UsePaperComposeDraftSaveParams = {
  enabled: boolean;
  dispatch: any;
  examsRow: any;
  paperId?: string | null;
  questionsTitle: string;
};

export const usePaperComposeDraftSave = ({
  enabled,
  dispatch,
  examsRow,
  paperId,
  questionsTitle,
}: UsePaperComposeDraftSaveParams) => {
  const skipRef = useRef(true);
  const timerRef = useRef<number | null>(null);
  const titleRef = useRef(questionsTitle);

  useEffect(() => {
    titleRef.current = questionsTitle;
  }, [questionsTitle]);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const markSkipDraftSave = useCallback(() => {
    skipRef.current = true;
    clearTimer();
  }, [clearTimer]);

  const markReadyDraftSave = useCallback(() => {
    skipRef.current = false;
  }, []);

  const savePaperFullData = useCallback(
    async (arr: any[], options: SaveOptions = {}) => {
      const draftFlag = options.draftFlag ?? false;
      const silent = options.silent ?? draftFlag;
      // paper.id 优先取链接上的 id / paperId
      const id = paperId || examsRow?.id;
      const subjectId = examsRow?.subjectId ?? examsRow?.subject_id;
      const name = (
        options.title ??
        titleRef.current ??
        examsRow?.name ??
        examsRow?.title ??
        ""
      ).trim();

      if (!id) {
        if (!silent) message.warning("缺少试卷信息");
        return false;
      }
      if (subjectId == null || subjectId === "") {
        if (!silent) message.warning("缺少学科信息");
        return false;
      }
      if (!name) {
        if (!silent) message.warning("请填写试卷名称");
        return false;
      }

      const questionItems = arr || [];
      const { code }: any = await dispatch({
        type: "settingTopicModel/postData",
        apiUrl: "postSavePaperUrl",
        payload: buildPaperFullDataPayload({
          paper: buildPaperMetaForFullData(
            { ...examsRow, id, subjectId, name },
            questionItems,
          ),
          questionItems,
          draftFlag,
          includePersonalQuestionList: false,
        }),
      });

      if ((code === 200 || code === 0) && !silent) {
        message.success("保存成功");
      }
      return code === 200 || code === 0;
    },
    [dispatch, examsRow, paperId],
  );

  const schedulePaperDraftSave = useCallback(
    (list: any[], title?: string, delay = 500) => {
      if (!enabled || skipRef.current) return;
      if (title != null) titleRef.current = title;
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        if (skipRef.current) return;
        void savePaperFullData(list, {
          draftFlag: true,
          silent: true,
          title: titleRef.current,
        });
      }, delay);
    },
    [clearTimer, enabled, savePaperFullData],
  );

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    savePaperFullData,
    schedulePaperDraftSave,
    markSkipDraftSave,
    markReadyDraftSave,
  };
};
