import { useEffect, useRef, useState } from "react";
import { connect, useDispatch, useLocation } from "@umijs/max";
import { Alert, message } from "antd";
import { replacePageQuery } from "@/utils/pageQuery";
import dayjs, { Dayjs } from "dayjs";

import StudentSearchList from "../StudentSearchList";
import StudentProfilePanel from "../StudentProfilePanel";
import "./index.less";

const ALL_SOURCES = ["作业记录", "人机交互", "自主练习", "考试记录"];

/**
 * G2 个人学情 Tab：左侧学生列表（G3 搜索/排序）+ 右侧个人学情整页（G5）。
 * 联动（G4）：班级学情页点击学生 → analysisModel.currentAnalysisTab='personal' +
 * personalStudentId → 本 Tab 自动选中该生；选中学生同步到 URL ?student_id=（供深链）。
 * 数据复用 teacherProfileModel（个人画像/证据），建议走 /teacher/profile/suggestions。
 */
const PersonalAnalysis = (props: any) => {
  const { analysisModel, teacherProfileModel, resourceSearchModel } = props;
  const dispatch = useDispatch();
  const location = useLocation();
  const profile = teacherProfileModel?.profile;
  const students: any[] = Array.isArray(profile?.students) ? profile.students : [];
  const requestedClass = new URLSearchParams(location.search).get("class_id");
  const classId: string = analysisModel?.selectedClass?.value || "";
  const classReady = !!classId && (!requestedClass || requestedClass === classId) && !analysisModel?.classSelectionLoading;
  const [selectedId, setSelectedId] = useState<string>("");
  const selectedRef = useRef<string>("");
  const [sources, setSources] = useState<string[]>(ALL_SOURCES);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  // URL 深链初始学生（仅首次消费）
  const urlSid = new URLSearchParams(location.search).get("student_id") || "";

  // 直链本 Tab 时班级画像兜底（学生列表来自 profile.students）
  useEffect(() => {
    if (!profile) {
      if (!teacherProfileModel?.classes?.length) dispatch({ type: "teacherProfileModel/getLatest", apiUrl: "classesUrl", mTitle: "classes", mLoading: "classesLoading" });
    }
  }, []);

  // 班级切换后画像跟随（页头选择器写入 selectedClass）；已是当前班级时不重复拉取
  useEffect(() => {
    if (!classReady) return;
    if (profile?.class_id === classId) return;
    dispatch({
      type: "teacherProfileModel/getLatest",
      apiUrl: "classProfileUrl",
      payload: { class_id: classId },
      mTitle: "profile",
      mLoading: "profileLoading",
    });
  }, [classId, classReady]);

  const fetchStudent = (sid: string) => {
    const payload = {
      class_id: classId,
      student_id: sid,
      sources: sources.join(","),
      start_date: dateRange?.[0]?.format("YYYY-MM-DD") || "",
      end_date: dateRange?.[1]?.format("YYYY-MM-DD") || "",
    };
    // getLatest：last-wins 竞态守卫（快速切换学生时慢响应不覆盖新学生）
    dispatch({
      type: "teacherProfileModel/getLatest",
      apiUrl: "studentProfileUrl",
      payload,
      mTitle: "studentDetail",
      mLoading: "detailLoading",
    });
    dispatch({
      type: "teacherProfileModel/getLatest",
      apiUrl: "studentEvidenceUrl",
      payload,
      mTitle: "evidence",
      mLoading: "evidenceLoading",
    });
    dispatch({
      type: "teacherProfileModel/getLatest",
      apiUrl: "profileSuggestionsUrl",
      payload: { class_id: classId, student_id: sid },
      mTitle: "studentSuggestions",
      mLoading: "suggestionsLoading",
    });
  };

  // URL 深链同步：tab + student_id（供刷新恢复、助手/建议卡跳转）
  const syncUrl = (sid: string) => {
    replacePageQuery({ tab: "personal", class_id: classId, student_id: sid });
  };

  // 选中学生：优先 联动指定（G4）→ URL 深链 → 列表首个
  // selectedRef 同步镜像已选中 id：dispatch(清空 personalStudentId) 会经 connect 同步触发
  // effect 重跑，此时 setState 尚未提交（闭包里 selectedId 还是旧值），必须用 ref 防止默认分支覆盖联动选择
  const select = (sid: string) => {
    selectedRef.current = sid;
    setSelectedId(sid);
    syncUrl(sid);
  };
  useEffect(() => {
    if (!classReady || profile?.class_id !== classId) return;
    if (!students.length) {
      selectedRef.current = "";
      setSelectedId("");
      replacePageQuery({ student_id: null });
      return;
    }
    const wanted = analysisModel?.personalStudentId || urlSid;
    if (wanted && students.some((s: any) => s.student_id === wanted)) {
      if (wanted !== selectedRef.current) select(wanted);
      // 消费完即清（避免切换班级后被旧值拉回）
      if (analysisModel?.personalStudentId) {
        dispatch({ type: "analysisModel/updateState", res: { personalStudentId: null } });
      }
    } else if (wanted || !selectedRef.current || !students.some((s: any) => s.student_id === selectedRef.current)) {
      select(students[0].student_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, classId, classReady, urlSid, analysisModel?.personalStudentId]);

  useEffect(() => {
    if (classReady && profile?.class_id === classId && students.some((s: any) => s.student_id === selectedId)) fetchStudent(selectedId);
  }, [selectedId, classId, classReady, profile?.class_id, sources, dateRange]);

  const selectStudent = (sid: string) => {
    if (sid === selectedRef.current) return;
    select(sid);
  };

  const toggleSource = (src: string) => {
    const next = sources.includes(src)
      ? (sources.length === 1 ? null : sources.filter((x) => x !== src))
      : [...sources, src];
    if (!next) {
      message.warning("请至少选择一个数据来源");
      return;
    }
    setSources(next);
  };

  /** v2.0-I：打开 AI 助教（建议已融入助手面板展示与执行） */
  const openAssistant = () => {
    dispatch({ type: "assistantModel/open" });
  };

  // v2.0-I5：注册 AI 小助手页面上下文（个人学情摘要）
  useEffect(() => {
    const d = teacherProfileModel?.studentDetail;
    if (!d || d.student_id !== selectedId || profile?.class_id !== classId) return;
    const lits = (d.dimensions?.literacy || [])
      .filter((l: any) => l.value != null)
      .sort((a: any, b: any) => a.value - b.value);
    const weakCells = (d.cells || [])
      .filter((c: any) => c.n >= 3 && c.p < 60)
      .sort((a: any, b: any) => a.p - b.p)
      .slice(0, 2);
    const summary = [
      `${d.name}（学号 ${d.display_id}）：学情事件 ${d.n_events} 条`,
      `待巩固知识点 ${d.weak_cnt} 个、遗忘到期 ${d.due_cnt} 个`,
      weakCells.length ? `最薄弱：${weakCells.map((c: any) => `「${c.cluster}」${c.p}%`).join("、")}` : "",
      lits.length ? `素养最薄弱：${lits[0].name} ${lits[0].value} 分` : "",
      "本页展示该生个人学情：AI 建议、知识图谱、素养、能力等级、掌握明细与作答证据",
    ].filter(Boolean).join("；") + "。";
    dispatch({
      type: "assistantModel/setPageContext",
      payload: {
        route: "/learning-analysis",
        title: `学情分析 · ${d.name} 的个人学情`,
        summary,
        data: {
          class_id: classId,
          student_id: d.student_id,
          // 图谱解释 + 注入入口快捷指令（v2.0-I）
          quick: [
            { label: "注入教学设计", action: { key: "inject_teaching_design", params: { class_id: classId } } },
            { label: "解释「二次根式」", query: "解释一下二次根式" },
          ],
        },
      },
    });
  }, [teacherProfileModel?.studentDetail, selectedId, classId]);

  // 卸载时注销上下文
  useEffect(() => () => dispatch({ type: "assistantModel/setPageContext", payload: null }), []);

  const backToClass = () => {
    dispatch({ type: "analysisModel/updateState", res: { currentAnalysisTab: "profile" } });
  };

  return (
    <div className="personal_analysis">
      <div className="pa_left">
        <div className="pa_left_title">学生列表</div>
        <StudentSearchList students={classReady && profile?.class_id === classId ? students : []} selectedId={selectedId} onSelect={selectStudent} />
      </div>
      <div className="pa_right">
        {teacherProfileModel?.profileError ? <Alert type="error" showIcon message={teacherProfileModel.profileError}
          action={<a onClick={() => dispatch({ type: "teacherProfileModel/getLatest", apiUrl: "classProfileUrl", payload: { class_id: classId }, mTitle: "profile", mLoading: "profileLoading" })}>重试</a>} /> : null}
        {teacherProfileModel?.studentDetailError || teacherProfileModel?.evidenceError ? (
          <Alert type="error" showIcon message={teacherProfileModel.studentDetailError || teacherProfileModel.evidenceError}
            action={<a onClick={() => fetchStudent(selectedId)}>重试</a>} />
        ) : null}
        <StudentProfilePanel
          detail={classReady && profile?.class_id === classId && teacherProfileModel?.studentDetail?.student_id === selectedId ? teacherProfileModel.studentDetail : null}
          evidence={teacherProfileModel?.evidenceLoading || teacherProfileModel?.evidenceError ? [] : teacherProfileModel?.evidence || []}
          suggestions={teacherProfileModel?.studentSuggestions?.student_id === selectedId ? teacherProfileModel.studentSuggestions.suggestions : []}
          loading={analysisModel?.classSelectionLoading || teacherProfileModel?.detailLoading || teacherProfileModel?.profileLoading}
          sources={sources}
          allSources={ALL_SOURCES}
          onToggleSource={toggleSource}
          dateRange={dateRange}
          onDateRange={setDateRange}
          onOpenAssistant={openAssistant}
          onBack={backToClass}
        />
      </div>
    </div>
  );
};

export default connect((state: any) => ({
  analysisModel: state.analysisModel,
  teacherProfileModel: state.teacherProfileModel,
}))(PersonalAnalysis);
