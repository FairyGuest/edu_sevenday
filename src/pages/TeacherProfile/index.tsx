import { useEffect, useState } from "react";
import { connect } from "@umijs/max";
import { Button, Card, Col, DatePicker, message, Row, Select, Spin, Tag, Upload } from "antd";
import {
  ReloadOutlined,
  UploadOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  BulbOutlined,
  SafetyCertificateOutlined,
  RiseOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { history } from "@umijs/max";
import dayjs, { Dayjs } from "dayjs";

import ClusterTable from "./components/ClusterTable";
import ImportModal from "./components/ImportModal";
import ProfileCharts from "./components/ProfileCharts";
import StudentList from "./components/StudentList";
import StudentDrawer from "./components/StudentDrawer";
import DimensionCards from "./components/DimensionCards";
import "./index.less";

const ALL_SOURCES = ["作业记录", "历史会话", "自主练习", "考试记录"];

/**
 * 学情画像（F1+F2）：班级/个人画像查看 + 历史学情导入。
 * PRD 要求：
 * - 支持筛选学情来源（作业/会话/自主练习）
 * - 展示：知识点掌握度、班级知识点掌握变化、薄弱知识点、学情数据构成、重点学生列表（个人不展示）
 * - 学业诊断（错因分析）
 */
const TeacherProfile = (props: any) => {
  const { classes, profile, loading, studentDetail, evidence, detailLoading, dispatch, analysisModel } = props;
  const [classId, setClassId] = useState<string>("");
  const [sources, setSources] = useState<string[]>(ALL_SOURCES);
  // A5 时间维度：自定义起止日期（默认本月）
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const classList = classes || [];

  useEffect(() => {
    dispatch({ type: "teacherProfileModel/getData", payload: {}, apiUrl: "classesUrl", mTitle: "classes" });
  }, []);

  // 左侧面板切换班级（写入 analysisModel.selectedClass）后，画像区跟随切换
  const pageClassId = analysisModel?.selectedClass?.value;
  useEffect(() => {
    if (pageClassId) setClassId(pageClassId);
  }, [pageClassId]);

  useEffect(() => {
    const cid = classId || classList[0]?.class_id;
    if (!cid) return;
    dispatch({
      type: "teacherProfileModel/getData",
      apiUrl: "classProfileUrl",
      payload: {
        class_id: cid,
        sources: sources.join(","),
        start_date: dateRange?.[0]?.format("YYYY-MM-DD") || "",
        end_date: dateRange?.[1]?.format("YYYY-MM-DD") || "",
      },
      mTitle: "profile",
    });
  }, [classes, classId, dateRange]);

  const toggleSource = (src: string) => {
    setSources((prev) => {
      if (prev.includes(src)) {
        if (prev.length === 1) {
          message.warning("请至少选择一个数据来源");
          return prev;
        }
        return prev.filter((x) => x !== src);
      }
      return [...prev, src];
    });
  };

  const recalc = () => {
    if (!sources.length) {
      message.warning("请至少选择一个数据来源（全不选将无法计算画像）");
      return;
    }
    dispatch({
      type: "teacherProfileModel/getData",
      apiUrl: "classProfileUrl",
      payload: { class_id: classId || classList[0]?.class_id, sources: sources.join(",") },
      mTitle: "profile",
    });
  };

  const openStudent = (sid: string) => {
    setDrawerOpen(true);
    const cid = classId || classList[0]?.class_id;
    dispatch({ type: "teacherProfileModel/getData", apiUrl: "studentProfileUrl",
      payload: { class_id: cid, student_id: sid }, mTitle: "studentDetail", mLoading: "detailLoading" });
    dispatch({ type: "teacherProfileModel/getData", apiUrl: "studentEvidenceUrl",
      payload: { class_id: cid, student_id: sid, sources: sources.join(",") }, mTitle: "evidence" });
  };

  const cards = profile?.cards || {};

  return (
    <div className="teacher_profile_container">
      {/* ===== 筛选栏：来源（班级切换统一由页头选择器负责）===== */}
      <Card size="small" className="teacher_profile_filter">
        <div className="filter-row">
          <span className="filter-class-name">
            {classList.find((c: any) => c.class_id === (classId || classList[0]?.class_id))?.class_name || ""}
          </span>
          <DatePicker.RangePicker
            size="small"
            allowEmpty={[false, false]}
            value={dateRange as any}
            onChange={(vals) => setDateRange(vals as [Dayjs | null, Dayjs | null])}
            presets={[
              { label: "本周", value: [dayjs().startOf("week"), dayjs()] },
              { label: "本月", value: [dayjs().startOf("month"), dayjs()] },
              { label: "近三个月", value: [dayjs().subtract(3, "month"), dayjs()] },
              { label: "本学期", value: [dayjs().subtract(6, "month"), dayjs()] },
            ]}
          />
          <div className="filter-spacer" />
          {profile?.updated_at ? (
            <span className="filter-updated">
              <ClockCircleOutlined />
              画像更新于 {profile.updated_at}
            </span>
          ) : null}
        </div>
        <div className="filter-split" />
        <div className="filter-row">
          <div className="filter-source-head">
            <FilterOutlined className="icon" />
            <span className="title">学情来源</span>
            <span className="hint">勾选后图表按所选来源重新计算</span>
          </div>
          <div className="filter-chips">
            {ALL_SOURCES.map((s) => (
              <button
                key={s}
                type="button"
                className={`source-chip ${sources.includes(s) ? "on" : ""}`}
                onClick={() => toggleSource(s)}
              >
                <i className="g-dot" style={{ background: sources.includes(s) ? "#fff" : "var(--dim-context)" }} />
                {s}
              </button>
            ))}
          </div>
          <div className="filter-spacer" />
          <div className="filter-actions">
            <Button size="small" icon={<ExperimentOutlined />}
              onClick={() => history.push({ pathname: '/design', search: `?class_id=${classId || classList[0]?.class_id || ''}&from=analysis` })}>
              注入教学设计
            </Button>
            <Button size="small" icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
              导入考试记录
            </Button>
            <Button size="small" type="primary" icon={<ReloadOutlined />} onClick={recalc} loading={loading}>
              重新计算
            </Button>
          </div>
        </div>
      </Card>

      <Spin spinning={loading && !profile}>
        {profile ? (
          <>
            {/* ===== 四指标卡（数字为主·标签为辅·留白充足）===== */}
            <Row gutter={16} className="teacher_profile_cards">
              <Col span={6}>
                <div className="teacher_profile_card stat_card">
                  <div className="stat_head">
                    <span className="stat_badge danger"><AlertOutlined /></span>
                    <span className="g-chip g-chip--bad">需干预</span>
                  </div>
                  <div className="teacher_profile_card_num" style={{ color: "var(--g-bad)" }}>{cards.weak_top_pct}%</div>
                  <div className="teacher_profile_card_label">待巩固占比</div>
                  <div className="teacher_profile_card_sub">{cards.weak_top?.replace("待巩固占比", "") || "—"}</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="teacher_profile_card stat_card">
                  <div className="stat_head">
                    <span className="stat_badge blue"><BulbOutlined /></span>
                    <span className="g-chip g-chip--warn">补弱方向</span>
                  </div>
                  <div className="teacher_profile_card_num">{cards.support_suggestions}</div>
                  <div className="teacher_profile_card_label">支援建议</div>
                  <div className="teacher_profile_card_sub">优先补弱方向</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="teacher_profile_card stat_card">
                  <div className="stat_head">
                    <span className="stat_badge cyan"><SafetyCertificateOutlined /></span>
                    <span className="g-chip g-chip--ok">达标</span>
                  </div>
                  <div className="teacher_profile_card_num">{cards.mastered_all_count}</div>
                  <div className="teacher_profile_card_label">全员已掌握</div>
                  <div className="teacher_profile_card_sub">全班 ≥85% 的知识点</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="teacher_profile_card stat_card">
                  <div className="stat_head">
                    <span className="stat_badge green"><RiseOutlined /></span>
                    <span className="g-chip g-chip--ok">向好</span>
                  </div>
                  <div className="teacher_profile_card_num">
                    {cards.recent5_avg ?? "—"}<span className="stat_trend">↑</span>
                  </div>
                  <div className="teacher_profile_card_label">掌握度均值</div>
                  <div className="teacher_profile_card_sub">近5次评估</div>
                </div>
              </Col>
            </Row>

            {/* ===== A1/A2 多维标签：能力等级 + 素养 ===== */}
            <DimensionCards dimensions={profile.dimensions} />
            {profile.window_note ? <p className="window_note">⏱ {profile.window_note}</p> : null}

            {/* ===== 分析区：左分布表 + 右图表 ===== */}
            <Row gutter={16}>
              <Col span={14}>
                <div className="teacher_profile_card">
                  <p className="teacher_profile_chart_title">知识点掌握分布 · 四级状态人数占比</p>
                  <ClusterTable rows={profile.cluster_rows || []} />
                </div>
              </Col>
              <Col span={10}>
                <ProfileCharts trend={profile.trend || []} sourceMix={profile.source_mix || []} weakRanking={profile.weak_ranking || []} classId={classId || classList[0]?.class_id} />
              </Col>
            </Row>

            {/* ===== 学生列表（全宽，消除右侧空白）===== */}
            <div className="teacher_profile_card">
              <p className="teacher_profile_chart_title">学生列表 · 仅显示待巩固知识点数，不打等级；冷启动置底</p>
              <StudentList students={profile.students || []} onOpen={openStudent} />
            </div>
          </>
        ) : null}
      </Spin>

      <StudentDrawer
        open={drawerOpen}
        detail={studentDetail}
        evidence={evidence || []}
        loading={detailLoading}
        onClose={() => setDrawerOpen(false)}
      />

      <ImportModal
        open={importOpen}
        classId={classId || classList[0]?.class_id}
        onClose={() => setImportOpen(false)}
        onDone={() => {
          const cid = classId || classList[0]?.class_id;
          if (cid) {
            dispatch({
              type: "teacherProfileModel/getData",
              apiUrl: "classProfileUrl",
              payload: { class_id: cid, sources: sources.join(",") },
              mTitle: "profile",
            });
          }
        }}
        students={profile?.students?.map((s: any) => ({
          student_id: s.student_id,
          name: s.name,
          display_id: s.display_id,
        })) || []}
      />
    </div>
  );
};

export default connect((state: any) => ({
  classes: state.teacherProfileModel?.classes,
  profile: state.teacherProfileModel?.profile,
  loading: state.teacherProfileModel?.loading,
  studentDetail: state.teacherProfileModel?.studentDetail,
  evidence: state.teacherProfileModel?.evidence,
  detailLoading: state.teacherProfileModel?.detailLoading,
  analysisModel: state.analysisModel,
}))(TeacherProfile);
