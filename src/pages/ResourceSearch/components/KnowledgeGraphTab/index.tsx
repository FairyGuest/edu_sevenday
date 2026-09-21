import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "@umijs/max";
import {
  Alert,
  Button,
  Drawer,
  Empty,
  Modal,
  Segmented,
  Spin,
  Tag,
  Tooltip,
} from "antd";
import {
  ArrowRightOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DesktopOutlined,
  FileTextOutlined,
  PartitionOutlined,
} from "@ant-design/icons";
import KnowledgeGraph from "@/pages/TeacherProfile/components/KnowledgeGraph";
import LearningContent from "@/components/LearningContent";
import { useHeader } from "../../hooks/useHeader";
import {
  gradeLabels,
  MaterialItems,
  MaterialPreview,
  resourceJSON,
  useMaterials,
  type Material,
} from "../MaterialLibrary";
import "./index.less";

const graphCache = new Map<string, any>();
const LIT_COLOR: Record<string, string> = {
  数学抽象: "#397ce0",
  逻辑推理: "#8370b9",
  数学建模: "#ba7598",
  直观想象: "#c89945",
  数学运算: "#229b8e",
  数据分析: "#7e8ba3",
};
const resourceTypes = [
  { label: "全部", value: "all" },
  { label: "题库", value: "questions" },
  { label: "教案", value: "plans" },
  { label: "课件", value: "courseware" },
];

export default function KnowledgeGraphTab() {
  const dispatch = useDispatch();
  const { setActiveTab } = useHeader();
  const saved = useSelector((state: any) => state.resourceSearchModel);
  const [grade, setGrade] = useState(saved.graphGrade || "all");
  const [node, setNodeState] = useState<string | null>(saved.graphNode || null);
  const [drawerOpen, setDrawerOpen] = useState(!!saved.graphNode);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [type, setType] = useState(saved.graphResourceType || "all");
  const [explain, setExplain] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionTotal, setQuestionTotal] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailRevision, setDetailRevision] = useState(0);
  const [preview, setPreview] = useState<Material | null>(null);
  const [questionPreview, setQuestionPreview] = useState<any>(null);
  const materials = useMaterials(node, grade, "all", !!node);
  const selectNode = useCallback(
    (id: string | null) => {
      setNodeState(id);
      setDrawerOpen(!!id);
      dispatch({
        type: "resourceSearchModel/setData",
        payload: { graphNode: id },
      });
    },
    [dispatch],
  );
  const changeGrade = (value: string) => {
    selectNode(null);
    setGrade(value);
    dispatch({
      type: "resourceSearchModel/setData",
      payload: { graphGrade: value },
    });
  };
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    setLoading(true);
    setError("");
    setData(null);
    const request = graphCache.has(grade)
      ? Promise.resolve(graphCache.get(grade))
      : resourceJSON("/api/teacher/resource/kgraph?grade=" + grade, {
          signal: controller.signal,
        });
    request
      .then((result) => {
        if (!active) return;
        graphCache.set(grade, result);
        setData(result);
      })
      .catch((e) => {
        if (active)
          setError(
            controller.signal.aborted ? "图谱加载超时，请重试" : e.message,
          );
      })
      .finally(() => {
        clearTimeout(timer);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [grade, revision]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setQuestions([]);
    setQuestionTotal(0);
    setExplain(null);
    setDetailError("");
    setDetailLoading(!!node);
    if (!node) return;
    const timer = setTimeout(() => controller.abort(), 8000);
    Promise.allSettled([
      resourceJSON(
        "/api/teacher/resource/kgraph/explain?node=" + encodeURIComponent(node),
        { signal: controller.signal },
      ),
      resourceJSON("/api/web/publicQuestion/findPublicQuestionPage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          current: 1,
          size: 6,
          stage_name: "初中",
          subject_name: "数学",
          kg_list: [node],
          knowledge_match: "exact",
          bank_source: 1,
        }),
      }),
    ])
      .then(([explanation, questionData]) => {
        if (!active) return;
        const failures: string[] = [];
        if (explanation.status === "fulfilled") setExplain(explanation.value);
        else failures.push("知识点说明加载失败");
        if (questionData.status === "fulfilled") {
          setQuestions(questionData.value.records || []);
          setQuestionTotal(questionData.value.total || 0);
        } else failures.push("题库加载失败");
        setDetailError(
          controller.signal.aborted ? "请求超时，请重试" : failures.join("；"),
        );
      })
      .finally(() => {
        clearTimeout(timer);
        if (active) setDetailLoading(false);
      });
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [node, detailRevision]);

  useEffect(() => {
    if (!data) return;
    dispatch({
      type: "assistantModel/setPageContext",
      payload: {
        route: "/source",
        title: "资源平台 · 知识图谱",
        summary:
          "初中数学知识目录，共 " +
          (data.nodes?.length || 0) +
          " 个节点；当前知识点：" +
          (node || "未选择"),
        data: { graphKind: "catalog", node },
      },
    });
    return () => {
      dispatch({ type: "assistantModel/setPageContext", payload: null });
    };
  }, [data, node, dispatch]);
  const graph = useMemo(
    () =>
      data && {
        nodes: (data.nodes || []).map((n: any) => ({
          ...n,
          gradeName: n.grade_name,
          n: 14 + (n.layer ?? 0) * 3,
          p: 0,
          weak: false,
          nodata: false,
          fill: LIT_COLOR[n.literacy] || "#8fa3b5",
        })),
        edges: data.edges || [],
      },
    [data],
  );
  const plans = materials.items.filter((item) => item.type === "plans");
  const courseware = materials.items.filter(
    (item) => item.type === "courseware",
  );
  const pending = detailLoading || materials.loading;
  const total =
    type === "questions"
      ? questionTotal
      : type === "plans"
        ? plans.length
        : type === "courseware"
          ? courseware.length
          : questionTotal + materials.items.length;
  const incomplete = !!detailError || !!materials.error;
  const openQuestions = () => {
    dispatch({
      type: "resourceSearchModel/setData",
      payload: { checkedKnowledge: node ? [node] : [], checkedChapter: [] },
    });
    setActiveTab("public");
  };
  const retryDetails = () => {
    setDetailRevision((value) => value + 1);
    materials.reload();
  };

  return (
    <div className="kg_tab">
      <ol className="kg_filter_path" aria-label="图谱筛选过程">
        {[
          { title: "选择年级", value: gradeLabels[grade], done: true },
          { title: "定位知识点", value: node || "待选择知识点", done: !!node },
          {
            title: "筛选资源",
            value: resourceTypes.find((item) => item.value === type)?.label,
            done: !!node,
          },
          {
            title: "匹配结果",
            value: !node
              ? "等待筛选"
              : pending
                ? "匹配中…"
                : incomplete
                  ? "部分资源待重试"
                  : total + " 条相关资源",
            done: !!node && !pending && !incomplete,
          },
        ].map((step, index) => (
          <li key={step.title} className={step.done ? "is-complete" : ""}>
            <span className="kg_step_number">
              {step.done ? <CheckCircleOutlined /> : "0" + (index + 1)}
            </span>
            <div>
              <small>{step.title}</small>
              <strong>{step.value}</strong>
            </div>
            {index < 3 && <ArrowRightOutlined />}
          </li>
        ))}
      </ol>
      <section className="kg_tab_main">
        <header className="kg_graph_heading">
          <h2>
            <PartitionOutlined /> 学科知识图谱
          </h2>
          <Segmented
            aria-label="图谱年级"
            size="small"
            value={grade}
            onChange={(value) => changeGrade(String(value))}
            options={Object.entries(gradeLabels).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </header>
        <p className="kg_guide">
          {node ? (
            <>
              当前知识点：<strong>{node}</strong>
              <Button
                type="link"
                aria-label="查看关联资源"
                onClick={() => setDrawerOpen(true)}
              >
                查看关联资源 <ArrowRightOutlined />
              </Button>
            </>
          ) : (
            <>
              选择知识点，查看关联的题目、教案与课件。
              <Button
                type="link"
                aria-label="查看二次根式资源"
                onClick={() => {
                  changeGrade("g8");
                  selectNode("二次根式");
                }}
              >
                查看二次根式资源 <ArrowRightOutlined />
              </Button>
            </>
          )}
        </p>
        <Spin spinning={loading}>
          {error ? (
            <Alert
              type="error"
              showIcon
              message={error}
              action={
                <Button
                  onClick={() => {
                    graphCache.delete(grade);
                    setRevision((v) => v + 1);
                  }}
                >
                  重试
                </Button>
              }
            />
          ) : graph?.nodes?.length ? (
            <KnowledgeGraph
              graph={graph}
              variant="catalog"
              height={560}
              onNodeClick={selectNode}
              selectedNode={node}
            />
          ) : (
            <div className="kg_graph_loading">
              {!loading && <Empty description="暂无图谱数据" />}
            </div>
          )}
        </Spin>
        <div className="kg_graph_legend">
          <span>{data?.nodes?.length || 0} 个知识点</span>
          {Object.entries(LIT_COLOR).map(([name, color]) => (
            <span key={name}>
              <i style={{ background: color }} />
              {name}
            </span>
          ))}
        </div>
      </section>
      <Drawer
        title="知识点关联资源"
        className="kg-resource-drawer"
        width={860}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnHidden={false}
      >
        <aside className="kg_resource_panel">
          <header className="kg_resource_head">
            <div>
              <h3>{node || "关联资源"}</h3>
              <p>
                {node
                  ? (explain?.node?.grade_name || gradeLabels[grade]) +
                    " · 按知识点精确关联"
                  : "尚未选择知识点"}
              </p>
            </div>
            {node && (
              <Tooltip title="清空知识点">
                <Button
                  type="text"
                  aria-label="清空图谱知识点"
                  icon={<CloseOutlined />}
                  onClick={() => selectNode(null)}
                />
              </Tooltip>
            )}
          </header>
          {!node ? (
            <div className="kg_empty_guide">
              <PartitionOutlined />
              <strong>从本周教学的知识点开始</strong>
              <span>可搜索“二次根式”，或选择图中的节点。</span>
              <Button
                onClick={() => {
                  changeGrade("g8");
                  selectNode("二次根式");
                }}
              >
                查看二次根式资源
              </Button>
            </div>
          ) : (
            <>
              <Segmented
                block
                size="small"
                value={type}
                options={resourceTypes}
                onChange={(value) => {
                  setType(String(value));
                  dispatch({
                    type: "resourceSearchModel/setData",
                    payload: { graphResourceType: value },
                  });
                }}
              />
              {(detailError || materials.error) && (
                <Alert
                  className="kg_resource_error"
                  type="warning"
                  showIcon
                  message={[detailError, materials.error]
                    .filter(Boolean)
                    .join("；")}
                  action={
                    <Button size="small" onClick={retryDetails}>
                      重试
                    </Button>
                  }
                />
              )}
              <Spin spinning={pending}>
                {explain && (
                  <details className="kg_node_details">
                    <summary>知识点定位与教学提示</summary>
                    <LearningContent>{explain.summary}</LearningContent>
                    <LearningContent>{explain.teaching_tip}</LearningContent>
                    <div>
                      {(explain.prerequisites || []).map((id: string) => (
                        <Button
                          type="link"
                          size="small"
                          key={id}
                          onClick={() => selectNode(id)}
                        >
                          先修：{id}
                        </Button>
                      ))}
                    </div>
                  </details>
                )}
                <div className="kg_match_summary">
                  {pending
                    ? "正在匹配资源…"
                    : incomplete
                      ? "以下为已加载结果"
                      : "匹配完成 · " + total + " 条资源"}
                  <span>教案与课件按知识点编号关联</span>
                </div>
                {(type === "all" || type === "questions") && (
                  <section className="kg_res_section">
                    <div className="kg_res_section_title">
                      <FileTextOutlined />
                      题库<Tag>{questionTotal} 题</Tag>
                    </div>
                    {questions.length ? (
                      <>
                        <div className="kg_question_list">
                          {questions
                            .slice(0, type === "all" ? 3 : 6)
                            .map((question, index) => (
                              <article
                                key={question.id || question.qid || index}
                                className="kg-question-item"
                              >
                                <header>
                                  <Tag color="blue">
                                    {question.quesType ||
                                      question.form ||
                                      "试题"}
                                  </Tag>
                                  <Button
                                    type="link"
                                    size="small"
                                    onClick={() => setQuestionPreview(question)}
                                  >
                                    查看题目 <ArrowRightOutlined />
                                  </Button>
                                </header>
                                <LearningContent>
                                  {question.stem}
                                </LearningContent>
                              </article>
                            ))}
                        </div>
                        <Button
                          type="link"
                          size="small"
                          onClick={openQuestions}
                        >
                          查看全部 {questionTotal} 道题目 <ArrowRightOutlined />
                        </Button>
                      </>
                    ) : (
                      !pending && (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            detailError ? "题目暂未加载" : "暂无相关题目"
                          }
                        />
                      )
                    )}
                  </section>
                )}
                {[
                  {
                    key: "plans",
                    label: "教案",
                    items: plans,
                    icon: <BookOutlined />,
                  },
                  {
                    key: "courseware",
                    label: "课件",
                    items: courseware,
                    icon: <DesktopOutlined />,
                  },
                ]
                  .filter((group) => type === "all" || type === group.key)
                  .map((group) => (
                    <section className="kg_res_section" key={group.key}>
                      <div className="kg_res_section_title">
                        {group.icon}
                        {group.label}
                        <Tag>{group.items.length} 份</Tag>
                      </div>
                      <MaterialItems
                        items={group.items}
                        onPreview={setPreview}
                      />
                      {!pending && !group.items.length && (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            materials.error
                              ? "资源暂未加载"
                              : "该知识点暂无" + group.label
                          }
                        />
                      )}
                    </section>
                  ))}
              </Spin>
            </>
          )}
        </aside>
      </Drawer>
      <MaterialPreview item={preview} onClose={() => setPreview(null)} />
      <Modal
        title="题目预览"
        width={760}
        open={!!questionPreview}
        onCancel={() => setQuestionPreview(null)}
        footer={
          <Button
            onClick={() => {
              setQuestionPreview(null);
              openQuestions();
            }}
          >
            到题库查看完整题目
          </Button>
        }
      >
        <LearningContent className="kg_question_preview">
          {questionPreview?.stem}
        </LearningContent>
      </Modal>
    </div>
  );
}
