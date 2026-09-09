import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "umi";
import {
  loadXkwCascaderPersist,
  pickPersistableXkwState,
  saveXkwCascaderPersist,
} from "../utils/xkwCascaderPersist";

const STAGE_ID_NAME_MAP: Record<string, string> = {
  "2": "小学",
  "3": "初中",
  "4": "高中",
};
const STAGE_NAMES = Object.values(STAGE_ID_NAME_MAP);

const mapStageIdToName = (stageId: any) =>
  STAGE_ID_NAME_MAP[String(stageId ?? "")] || "";

/** 从 Cascader 第一级课程选项解析学段、学科 */
export const resolveCourseStageSubject = (
  course: any,
  fallbackStageName = "",
) => {
  const mappedStage = mapStageIdToName(course?.stageId ?? course?.stage_id);
  let stageName = String(
    course?.stageName ??
      course?.stage_name ??
      course?.stage ??
      mappedStage ??
      fallbackStageName ??
      "",
  );
  if (STAGE_ID_NAME_MAP[stageName]) {
    stageName = STAGE_ID_NAME_MAP[stageName];
  }

  let subjectName = String(
    course?.subjectName ?? course?.subject_name ?? course?.subject ?? "",
  );
  const label = String(course?.label ?? course?.name ?? "");

  if ((!subjectName || !stageName) && label) {
    const matchedStage = STAGE_NAMES.find(
      (name) => label.startsWith(name) || label.includes(name),
    );
    if (matchedStage) {
      if (!stageName) stageName = matchedStage;
      if (!subjectName) {
        subjectName = label
          .replace(matchedStage, "")
          .replace(/^[-_/／\s]+/, "");
      }
    }
  }
  if (!subjectName) subjectName = label;

  return { stageName, subjectName };
};

const getCourseSelectionState = (course: any) => ({
  xkwCourseId: course?.value ?? null,
  xkwSubjectId: course?.subjectId ?? "",
  xkwStageName: course?.stageName ?? "",
  xkwSubjectName: course?.subjectName ?? "",
});

export const mapXkwCascaderToTextbookVersion = (selectedOptions: any[] = []) => {
  if (selectedOptions.length < 3) return null;

  return {
    version_id: selectedOptions[1]?.value,
    version_name: selectedOptions[1]?.label,
    textbook_id: selectedOptions[2]?.value,
    textbook_name: selectedOptions[2]?.label,
  };
};

type UseXkwTextbookCascaderOptions = {
  /**
   * 独立模式：级联值仅存本地，不写 Redux / sessionStorage。
   * 用于「关联教材单元及知识点」弹框，避免影响试卷列表级联。
   */
  isolated?: boolean;
};

export const useXkwTextbookCascader = (
  options: UseXkwTextbookCascaderOptions = {},
) => {
  const { isolated = false } = options;
  const dispatch = useDispatch();
  const { xkwCascaderValue = [] } = useSelector(
    (state: any) => state.settingTopicModel,
  );
  const [localCascaderValue, setLocalCascaderValue] = useState<any[]>(() =>
    isolated &&
    Array.isArray(xkwCascaderValue) &&
    xkwCascaderValue.length === 3
      ? [...xkwCascaderValue]
      : [],
  );
  const cascaderValue = isolated ? localCascaderValue : xkwCascaderValue;
  const cascaderValueRef = useRef(cascaderValue);
  cascaderValueRef.current = cascaderValue;

  const [cascaderOptions, setCascaderOptions] = useState<any[]>([]);

  const setGlobalCascaderState = useCallback(
    (payload: Record<string, any>) => {
      const persistPatch = pickPersistableXkwState(payload);
      if (Object.keys(persistPatch).length) {
        saveXkwCascaderPersist(persistPatch);
      }
      dispatch({
        type: "settingTopicModel/setData",
        payload,
      });
    },
    [dispatch],
  );

  /** 全局模式写 Redux；独立模式只更新本地 cascaderValue */
  const setCascaderState = useCallback(
    (payload: Record<string, any>) => {
      if (isolated) {
        if (Object.prototype.hasOwnProperty.call(payload, "xkwCascaderValue")) {
          setLocalCascaderValue(payload.xkwCascaderValue || []);
        }
        return;
      }
      setGlobalCascaderState(payload);
    },
    [isolated, setGlobalCascaderState],
  );

  const getFindXkwTbVersListFn = async (courseId: any) => {
    const { code, data = [] }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getFindXkwTbVersList",
      payload: { courseId },
    });
    if (code === 200) {
      return data || [];
    }
    return [];
  };

  const getFindXkwTextbookListFn = async (versionId: any) => {
    const { code, data = [] }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getFindXkwTextbookList",
      payload: { versionId },
    });
    if (code === 200) {
      return data || [];
    }
    return [];
  };

  /** 拉齐某一课程下的版本/教材 children，便于 Cascader 回显 */
  const buildCourseWithPath = async (
    course: any,
    versionId?: any,
    textbookId?: any,
  ) => {
    const nextCourse = { ...course };
    const versionList = await getFindXkwTbVersListFn(nextCourse.value);
    const versionChildren = versionList.map((item: any) => ({
      label: item.name,
      value: item.id,
      isLeaf: false,
    }));

    if (!versionChildren.length) {
      nextCourse.children = [];
      return { course: nextCourse, version: null, textbook: null };
    }

    const versionIndex = versionId
      ? versionChildren.findIndex((v: any) => String(v.value) === String(versionId))
      : 0;
    const resolvedVersionIndex = versionIndex >= 0 ? versionIndex : 0;
    const version = { ...versionChildren[resolvedVersionIndex] };

    const textbookList = await getFindXkwTextbookListFn(version.value);
    const textbookChildren = textbookList.map((item: any) => ({
      label: item.name,
      value: item.id,
      isLeaf: true,
    }));
    version.children = textbookChildren;

    nextCourse.children = versionChildren.map((v: any, i: number) =>
      i === resolvedVersionIndex ? version : v,
    );

    const textbookIndex = textbookId
      ? textbookChildren.findIndex((t: any) => String(t.value) === String(textbookId))
      : 0;
    const textbook =
      textbookChildren[
        textbookIndex >= 0 ? textbookIndex : 0
      ] || null;

    return { course: nextCourse, version, textbook };
  };

  /** 默认选中：一级第一个 / 二级第一个 / 三级第一个 */
  const applyDefaultFirstPath = async (courseOptions: any[]) => {
    if (!courseOptions.length) {
      setCascaderOptions([]);
      return;
    }

    const { course, version, textbook } = await buildCourseWithPath(
      courseOptions[0],
    );
    const nextOptions = courseOptions.map((item, index) =>
      index === 0 ? course : item,
    );
    setCascaderOptions(nextOptions);

    if (!version || !textbook) return;

    const selectedOptions = [course, version, textbook];
    setCascaderState({
      xkwCascaderValue: [course.value, version.value, textbook.value],
      ...(isolated
        ? {}
        : {
            ...getCourseSelectionState(course),
            xkwTextbookId: textbook.value,
            xkwTextbookName: textbook.label,
            chooseTextbookVersion: mapXkwCascaderToTextbookVersion(selectedOptions),
          }),
    });
  };

  /** 已有完整选中值时，补齐 options 树以便回显 */
  const hydrateExistingPath = async (
    courseOptions: any[],
    value: any[],
  ) => {
    const courseIndex = courseOptions.findIndex(
      (item) => String(item.value) === String(value[0]),
    );
    if (courseIndex < 0) {
      await applyDefaultFirstPath(courseOptions);
      return;
    }

    const { course, version, textbook } = await buildCourseWithPath(
      courseOptions[courseIndex],
      value[1],
      value[2],
    );
    const nextOptions = courseOptions.map((item, index) =>
      index === courseIndex ? course : item,
    );
    setCascaderOptions(nextOptions);

    if (version && textbook) {
      const selectedOptions = [course, version, textbook];
      setCascaderState({
        xkwCascaderValue: value,
        ...(isolated
          ? {}
          : {
              ...getCourseSelectionState(course),
              xkwTextbookId: textbook.value,
              xkwTextbookName: textbook.label,
              chooseTextbookVersion: mapXkwCascaderToTextbookVersion(selectedOptions),
            }),
      });
      return;
    }

    setCascaderState({
      xkwCascaderValue: value,
      ...(isolated ? {} : getCourseSelectionState(course)),
    });
  };

  const getFindXkwCourseListFn = async (stageId: any, stageName = "") => {
    const { code, data = [] }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getFindXkwCourseList",
      payload: { stageId },
    });
    if (code === 200) {
      const list = Array.isArray(data)
        ? data
        : data?.list || data?.records || [];
      const fallbackStageName = stageName || mapStageIdToName(stageId);
      const courseOptions = list.map((item: any) => {
        const resolved = resolveCourseStageSubject(
          {
            ...item,
            label: item.name,
            stageId: item.stageId ?? item.stage_id ?? stageId,
          },
          fallbackStageName,
        );
        return {
          label: item.name,
          value: item.id,
          subjectId: item.subjectId ?? item.subject_id,
          stageId: item.stageId ?? item.stage_id ?? stageId,
          stageName: resolved.stageName,
          subjectName: resolved.subjectName,
          isLeaf: false,
        };
      });

      // 独立模式：不读/写试卷列表持久化；仅用当前本地值回显，否则默认第一项
      if (isolated) {
        const currentValue =
          Array.isArray(cascaderValueRef.current) &&
          cascaderValueRef.current.length === 3
            ? cascaderValueRef.current
            : [];
        if (currentValue.length === 3) {
          await hydrateExistingPath(courseOptions, currentValue);
        } else {
          await applyDefaultFirstPath(courseOptions);
        }
        return;
      }

      const persisted = loadXkwCascaderPersist();
      const currentValue =
        Array.isArray(cascaderValueRef.current) &&
        cascaderValueRef.current.length === 3
          ? cascaderValueRef.current
          : Array.isArray(persisted?.xkwCascaderValue) &&
              persisted.xkwCascaderValue.length === 3
            ? persisted.xkwCascaderValue
            : [];

      if (currentValue.length === 3) {
        if (
          (!Array.isArray(cascaderValueRef.current) ||
            cascaderValueRef.current.length !== 3) &&
          persisted
        ) {
          setCascaderState(persisted);
        }
        await hydrateExistingPath(courseOptions, currentValue);
      } else {
        await applyDefaultFirstPath(courseOptions);
      }
    }
  };

  const initCascader = async () => {
    const { code, data }: any = await dispatch({
      type: "settingTopicModel/getData",
      apiUrl: "getMindQuestionGetTeacherStageId",
      payload: {},
    });
    if (code === 200) {
      const stageId =
        data && typeof data === "object"
          ? data.stageId ?? data.stage_id ?? data.id
          : data;
      const stageName =
        (data && typeof data === "object"
          ? data.stageName ?? data.stage_name ?? data.name
          : "") || mapStageIdToName(stageId);
      if (stageId != null && stageId !== "") {
        if (!isolated) {
          setCascaderState({
            xkwStageId: stageId,
            xkwStageName: stageName,
          });
        }
        await getFindXkwCourseListFn(stageId, stageName);
      }
    }
  };

  const loadCascaderData = async (selectedOptions: any[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    setCascaderOptions((opts) => [...opts]);

    if (selectedOptions.length === 1) {
      const data = await getFindXkwTbVersListFn(targetOption.value);
      targetOption.loading = false;
      targetOption.children = data.map((item: any) => ({
        label: item.name,
        value: item.id,
        isLeaf: false,
      }));
      if (!isolated) {
        setCascaderState({
          xkwCourseId: targetOption.value,
          xkwSubjectId: targetOption.subjectId ?? "",
        });
      }
      setCascaderOptions((opts) => [...opts]);
      return;
    }

    if (selectedOptions.length === 2) {
      const data = await getFindXkwTextbookListFn(targetOption.value);
      targetOption.loading = false;
      targetOption.children = data.map((item: any) => ({
        label: item.name,
        value: item.id,
        isLeaf: true,
      }));
      setCascaderOptions((opts) => [...opts]);
    }
  };

  const onCascaderChange = (value: any[], selectedOptions: any[]) => {
    const courseOption = selectedOptions?.[0];

    if (isolated) {
      setLocalCascaderValue(value || []);
      return;
    }

    setCascaderState({
      xkwCascaderValue: value || [],
      ...getCourseSelectionState(courseOption),
    });

    if (value?.length === 3) {
      const textbook = selectedOptions[2];
      const chooseTextbookVersion =
        mapXkwCascaderToTextbookVersion(selectedOptions);
      setCascaderState({
        xkwTextbookId: textbook.value,
        xkwTextbookName: textbook.label,
        chooseTextbookVersion,
      });
      return;
    }

    setCascaderState({
      xkwTextbookId: "",
      xkwTextbookName: "",
      chooseTextbookVersion: {},
    });
  };

  useEffect(() => {
    initCascader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    cascaderOptions,
    cascaderValue,
    loadCascaderData,
    onCascaderChange,
  };
};
