import { useEffect, useState } from "react";
import { connect } from "@umijs/max";
import { Alert, Button, Card, Drawer, Pagination, message, Segmented, Skeleton, Tooltip } from "antd";
import {
  ReloadOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { history } from "@umijs/max";

import ClusterTable from "./components/ClusterTable";
import ImportModal from "./components/ImportModal";
import KnowledgeGraph from "./components/KnowledgeGraph";
import ProfileCharts from "./components/ProfileCharts";
import PortraitOverview, { EvidenceList } from "@/features/portraits/PortraitOverview";
import EvidenceGraph from "@/features/portraits/EvidenceGraph";
import ScopeFilters from "@/features/portraits/ScopeFilters";
import { usePortrait, useProfileScope } from "@/features/portraits/hooks";
import OverviewGrid from "./components/OverviewGrid";
import { getDataService, invalidateProfileReads } from "./services";
import "./index.less";

// 能力等级图例：知识图谱子页（kgraph）页头使用
const LEVEL_LEGEND = [
  { short: "L1", label: "了解", color: "#52607a", verb: "了解 / 知道 / 识别", desc: "能再认再现，识别基本概念与符号" },
  { short: "L2", label: "理解", color: "#2563eb", verb: "理解 / 描述 / 说明", desc: "能解释含义、举例说明，明白为什么" },
  { short: "L3", label: "掌握", color: "#7c3aed", verb: "掌握 / 运用 / 计算", desc: "能在熟悉情境中独立使用与计算" },
  { short: "L4", label: "综合", color: "#db2777", verb: "综合 / 迁移 / 建模", desc: "能在新情境中组合应用、建模探究" },
];
const BAND_LEGEND: [string, string, string][] = [
  ["待巩固", "<50%", "#F76964"],
  ["练习中", "51%-70%", "#8EB6FE"],
  ["较熟练", "71%-85%", "#1C6CFF"],
  ["已掌握", ">86%", "#1FD479"],
];

/**
 * 学情画像（F1+F2）：班级/个人画像查看 + 历史学情导入。
 * PRD 要求：
 * - 支持筛选学情来源（作业/会话/自主练习）
 * - 展示：知识点掌握度、班级知识点掌握变化、薄弱知识点、学情数据构成、重点学生列表（个人不展示）
 * - 学业诊断（错因分析）
 */
const TeacherProfile = (props: any) => {
  const { variant } = props; // variant: "full"(默认=版本一) | "kgraph"(版本二子页面)
  const { classes, dispatch, analysisModel } = props;
  const classId = analysisModel?.selectedClass?.value || "";
  const { sources, setSources, dateRange, setDateRange, scope } = useProfileScope();
  const portrait = usePortrait(classId, "", scope);
  const profile = portrait.data?.overview;
  const loading = portrait.loading;
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [recordPage, setRecordPage] = useState(1);
  useEffect(() => { setRecordsOpen(false); setRecordPage(1); }, [scope, classId]);
  // A5 时间维度：默认近3个月（Figma 筛选栏为预设按钮组）
  const [importOpen, setImportOpen] = useState(false);  // 知识点掌握分布（版本一默认表格；版本二为"知识图谱"tab 独立子页面，这里保留快速切换）
  const [distView, setDistView] = useState<"graph" | "table">("table");
  const classList = classes || [];

  useEffect(() => {
    if (!classes?.length) dispatch({ type: "teacherProfileModel/getLatest", payload: {}, apiUrl: "classesUrl", mTitle: "classes", mLoading: "classesLoading" });
  }, []);

  useEffect(() => {
    const cid = classId;
    if (!cid) return;
    dispatch({
      type: "teacherProfileModel/getLatest",
      apiUrl: "classProfileUrl",
      payload: {
        ...scope, statistics: "observations",
        class_id: cid,
        sources: sources.join(","),
        start_date: dateRange?.[0]?.format("YYYY-MM-DD") || "",
        end_date: dateRange?.[1]?.format("YYYY-MM-DD") || "",
      },
      mTitle: "profile",
      mLoading: "profileLoading",
    });
  }, [classId, scope]);

  // v2.0-I5：注册 AI 小助手页面上下文（班级学情摘要，供助手问答/初始建议注入）
  useEffect(() => {
    if (!profile) return;
    const cid = classId;
    const lits = (profile.dimensions?.literacy || [])
      .filter((l: any) => l.value != null)
      .sort((a: any, b: any) => a.value - b.value);
    const weak = (profile.weak_ranking || []).filter((r: any) => r.n_students >= 3).slice(0, 2);
    const weakStudents = (profile.students || []).filter((s: any) => s.status_level === "weak").length;
    const summary = [
      `${profile.class_name}（${profile.n_students} 名学生）`,
      `当前范围任务得分率 ${profile.cards?.recent5_avg ?? "—"}`,
      lits.length ? `素养最薄弱：${lits[0].name} ${lits[0].value} 分` : "",
      weak.length ? `薄弱知识点：${weak.map((r: any) => `「${r.cluster}」待巩固 ${r.weak_pct}%`).join("、")}` : "",
      `待巩固状态学生 ${weakStudents} 名`,
      variant === "kgraph"
        ? "本页为知识点掌握网络（L1~L4 分层力导向图）"
        : "本页为班级学情画像：概览指标、能力/素养维度、知识点分布、趋势与来源构成",
    ].filter(Boolean).join("；") + "。";
    dispatch({
      type: "assistantModel/setPageContext",
      payload: {
        route: "/learning-analysis",
        title: variant === "kgraph" ? "学情分析 · 知识图谱" : "学情分析 · 班级学情",
        summary,
        data: {
          ...scope, evaluation_status: "demo_observation_pending_review",
          class_id: cid,
          start_date: dateRange?.[0]?.format("YYYY-MM-DD") || "",
          end_date: dateRange?.[1]?.format("YYYY-MM-DD") || "",
          sources,
          // v2.0-I：图谱页标记 mastery 口径 + 图谱专属快捷指令
          ...(variant === "kgraph"
            ? {
                graphKind: "mastery",
                quick: [
                  { label: "图谱怎么看？", query: "这个图谱怎么看" },
                  { label: "解释「二次根式」", query: "解释一下二次根式" },
                  { label: "找数学抽象的题", action: { key: "filter_question_bank", params: { literacy: "数学抽象" } } },
                ],
              }
            : {}),
        },
      },
    });
  }, [profile, classId, variant, scope]);

  // 卸载时注销上下文（切 Tab/页面后助手回退到路由兜底标题）
  useEffect(() => () => { dispatch({ type: "assistantModel/setPageContext", payload: null }); }, []);

  // v2.0-H1：班级建议入口条（建议在 AI 助手中展示，这里露出条数入口）
  const [sugCount, setSugCount] = useState<number>(0);
  useEffect(() => {
    const cid = classId;
    if (!cid) return;
    let dead = false;
    setSugCount(0);
    getDataService({ class_id: cid }, "profileSuggestionsUrl")
      .then((d) => { if (!dead && d?.code === 200) setSugCount(d.data?.suggestions?.length || 0); })
      .catch(() => {})
      .finally(() => {});
    return () => { dead = true; };
  }, [classId]);

  const recalc = () => {
    if (!sources.length) {
      message.warning("请至少选择一个数据来源（全不选将无法计算画像）");
      return;
    }
    invalidateProfileReads();
    portrait.retry();
    dispatch({
      type: "teacherProfileModel/getLatest",
      apiUrl: "classProfileUrl",
      payload: {
        ...scope, statistics: "observations",
        class_id: classId,
        sources: sources.join(","),
        start_date: dateRange?.[0]?.format("YYYY-MM-DD") || "",
        end_date: dateRange?.[1]?.format("YYYY-MM-DD") || "",
      },
      mTitle: "profile",
      mLoading: "profileLoading",
    });
  };

  const cards = profile?.cards || {};
  const placeholder = !classId && !analysisModel?.classSelectionLoading
    ? <Alert type="info" message="暂无可查看的班级，请检查班级选择" />
    : portrait.error
    ? <Alert type="error" message={portrait.error} action={<Button onClick={recalc}>重试</Button>} />
    : <Card><Skeleton active paragraph={{ rows: 8 }} /></Card>;

  // ===== 版本二：知识图谱子页面（独立 tab 入口，只渲染图谱大图）=====
  if (variant === "kgraph") {
    return (
      <div className="teacher_profile_container">
        <ScopeFilters classId={classId} sources={sources} dateRange={dateRange} onSources={setSources} onDateRange={setDateRange} />
        {portrait.error ? <Alert type="warning" message={portrait.error} action={<Button onClick={portrait.retry}>重试</Button>} /> : null}
        <div aria-busy={loading}>
          {profile ? (
            <div className="teacher_profile_card">
              <div className="ct_header">
                <p className="teacher_profile_chart_title" style={{ marginBottom: 0 }}>
                  知识点掌握图谱 · L1~L4 分层
                </p>
                <div className="ct_legend">
                  <span className="ct_legend_group">
                    {LEVEL_LEGEND.map((l) => (
                      <Tooltip key={l.short} title={`${l.short}＝${l.label}（${l.verb}）：${l.desc}`} color="#fff" overlayClassName="ct_lv_tip">
                        <span className="ct_th_lv" style={{ ["--c" as any]: l.color }}>
                          <b>{l.short}</b>{l.label}
                        </span>
                      </Tooltip>
                    ))}
                  </span>
                </div>
              </div>
              {portrait.loading ? <Skeleton active /> : <EvidenceGraph data={portrait.data} scope={scope} classId={classId} />}
            </div>
          ) : placeholder}
        </div>
      </div>
    );
  }

  return (
    <div className="teacher_profile_container teacher-profile-portraits">
      <div className="portrait-toolbar">
          <ScopeFilters classId={classId} sources={sources} dateRange={dateRange} onSources={setSources} onDateRange={setDateRange} />
          <div className="portrait-toolbar-actions">
            <Button size="small" icon={<ExperimentOutlined />}
              onClick={() => history.push({ pathname: '/design', search: '?' + new URLSearchParams({ ...scope, sources: sources.join(','), class_id: classId, from: 'analysis' } as Record<string, string>).toString() })}>
              注入教学设计
            </Button>
            <Button size="small" icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
              导入考试记录
            </Button>
            <Tooltip title="重新计算"><Button size="small" aria-label="重新计算" icon={<ReloadOutlined />} onClick={recalc} loading={loading} /></Tooltip>
          </div>
      </div>

      <div aria-busy={loading}>
        {profile ? (
          <>
            <div className="portrait-legacy-heading"><span>作答概览</span>{profile.updated_at && <small><ClockCircleOutlined /> 更新于 {profile.updated_at}</small>}</div>
            <OverviewGrid cards={cards} trend={profile.trend || []} />
            <PortraitOverview data={portrait.data} scope={scope} loading={portrait.loading} error={portrait.error} onRetry={portrait.retry} />

            {sugCount > 0 ? (
              <div
                className="pa_sg_strip"
                style={{ margin: "0 0 12px" }}
                role="button"
                tabIndex={0}
                onClick={() => dispatch({ type: "assistantModel/open" })}
              >
                <BulbOutlined className="icon" />
                <span className="txt">
                  本班有 <b>{sugCount}</b> 条教学建议
                </span>
                <a className="link">在小助手中查看 ›</a>
              </div>
            ) : null}

            {profile.window_note ? <p className="window_note">⏱ {profile.window_note}</p> : null}

            {/* ===== 分析区：左分布表 + 右图表 ===== */}
            <div className="analysis_row">
              <div className="analysis_distribution">
                <div className="teacher_profile_card">
                  <div className="ct_header">
                    <p className="teacher_profile_chart_title" style={{ marginBottom: 0 }}>知识点掌握分布</p>
                    <Segmented
                      size="small"
                      value={distView}
                      onChange={(v) => setDistView(v as "graph" | "table")}
                      options={[
                        { label: "知识图谱", value: "graph" },
                        { label: "分布表格", value: "table" },
                      ]}
                      style={{ margin: "0 10px" }}
                    />
                  </div>
                  <div className="ct_legend">
                    {BAND_LEGEND.map(([band, range, color]) => (
                      <span key={band} className="ct_legend_item">
                        <i style={{ background: color }} />
                        {band}
                        <em>{range}</em>
                      </span>
                    ))}
                  </div>
                  {distView === "graph" ? (
                    <KnowledgeGraph graph={profile.kgraph} />
                  ) : (
                    <ClusterTable rows={profile.cluster_rows || []} minStudents={1} />
                  )}
                </div>
              </div>
              <div className="analysis_right">
                <ProfileCharts scoped trend={profile.trend || []} sourceMix={profile.source_mix || []} weakRanking={profile.weak_ranking || []} classId={classId || classList[0]?.class_id} onDetail={() => setRecordsOpen(true)} />
              </div>
            </div>

            <div className="portrait-scope">
              本班 {profile.n_students ?? 0} 名学生，{(profile.students || []).filter((s: any) => s.status_level === "weak").length} 名待关注。
              <Button type="link" onClick={() => dispatch({ type: "analysisModel/updateState", res: { currentAnalysisTab: "personal" } })}>查看个人学情</Button>
            </div>
          </>
        ) : placeholder}
      </div>

      <ImportModal
        open={importOpen}
        classId={classId || classList[0]?.class_id}
        onClose={() => setImportOpen(false)}
        onDone={recalc}
        students={profile?.students?.map((s: any) => ({
          student_id: s.student_id,
          name: s.name,
          display_id: s.display_id,
        })) || []}
      />
      <Drawer title="当前范围作答与观察记录" open={recordsOpen} onClose={() => setRecordsOpen(false)} width={560}>
        <EvidenceList evidence={(portrait.data?.evidence || []).slice((recordPage - 1) * 20, recordPage * 20)} />
        <Pagination current={recordPage} pageSize={20} showSizeChanger={false} total={portrait.data?.evidence?.length || 0} onChange={setRecordPage} size="small" />
      </Drawer>
    </div>
  );
};

export default connect((state: any) => ({
  classes: state.teacherProfileModel?.classes,
  profile: state.teacherProfileModel?.profile,
  loading: state.teacherProfileModel?.profileLoading,
  profileError: state.teacherProfileModel?.profileError,
  studentDetail: state.teacherProfileModel?.studentDetail,
  evidence: state.teacherProfileModel?.evidence,
  detailLoading: state.teacherProfileModel?.detailLoading,
  analysisModel: state.analysisModel,
}))(TeacherProfile);
