import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Collapse,
  Empty,
  Select,
  Spin,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  AimOutlined,
  CheckSquareOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import "./index.less";

/**
 * 教学目标模块（学情联动）：
 * - 建议目标：按所选班级画像推导（薄弱知识点 / 最低素养），每条附学情依据 + 评价量规草案（可展开）
 * - 固定目标：课标通用目标库，可搜索勾选
 * - 选中的目标（建议+固定）通过 onChange 上抛，随生成请求带入 user_require
 * 学段学科在面板头常驻显示。
 */
export interface ObjectiveItem {
  id: string;
  text: string;
  level?: string;
  kind?: string;
  cluster?: string;
  literacy?: string;
  basis?: string;
  rubric?: { level: string; desc: string }[];
  from: "suggest" | "fixed";
}

const KIND_ZH: Record<string, string> = {
  knowledge: "知识点",
  literacy: "素养",
  process: "过程",
};

const ObjectivePanel = ({
  stage,
  classId,
  selected,
  onChange,
  embedded,
}: {
  stage?: string[];
  classId?: string;
  selected: ObjectiveItem[];
  onChange: (items: ObjectiveItem[]) => void;
  /** 抽屉内嵌模式：去外层卡片边框，头部紧凑 */
  embedded?: boolean;
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cid, setCid] = useState(classId || "cls-g8-03");
  const [classList, setClassList] = useState<any[]>([]);
  const [fixedOpen, setFixedOpen] = useState<string[]>([]);
  const [fallbackStage, setFallbackStage] = useState("");

  useEffect(() => {
    fetch("/api/teacher/classes")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 200) setClassList(d.data || []);
      })
      .catch(() => {});
    // 学段学科兜底：表单未选择时显示教师默认学段（初中 · 数学）
    fetch("/api/web/mindQuestion/getTeacherStageId")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 200)
          setFallbackStage(
            `${d.data?.stageName || d.data?.stage_name || ""} · 数学`,
          );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/teacher/teaching/objectives?class_id=${encodeURIComponent(cid)}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 200) setData(d.data);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [cid]);

  const stageText =
    Array.isArray(stage) && stage.length ? stage.join(" · ") : fallbackStage;

  const toggle = (item: ObjectiveItem) => {
    const exists = selected.some((s) => s.id === item.id);
    onChange(
      exists ? selected.filter((s) => s.id !== item.id) : [...selected, item],
    );
  };
  const isSelected = (id: string) => selected.some((s) => s.id === id);

  const suggestions: ObjectiveItem[] = useMemo(
    () =>
      (data?.suggestions || []).map((s: any) => ({
        ...s,
        from: "suggest" as const,
      })),
    [data],
  );
  const fixedPool: ObjectiveItem[] = useMemo(
    () =>
      (data?.fixed || []).map((s: any) => ({ ...s, from: "fixed" as const })),
    [data],
  );

  return (
    <div className={"obj_panel" + (embedded ? " obj_panel--embedded" : "")}>
      {!embedded && (
        <div className="obj_head">
          <AimOutlined className="obj_icon" />
          <span className="obj_title">教学目标</span>
          {stageText && (
            <Tag color="blue" className="obj_stage">
              {stageText}
            </Tag>
          )}
          <Select
            size="small"
            style={{ width: 150, marginLeft: "auto" }}
            value={cid}
            onChange={setCid}
            options={classList.map((c) => ({
              value: c.class_id,
              label: c.class_name,
            }))}
          />
        </div>
      )}

      {embedded && (
        <div className="obj_head obj_head--embedded">
          <span className="obj_title">教学目标</span>
          {stageText && (
            <Tag color="blue" className="obj_stage">
              {stageText}
            </Tag>
          )}
          <Select
            size="small"
            style={{ width: 150, marginLeft: "auto" }}
            value={cid}
            onChange={setCid}
            options={classList.map((c) => ({
              value: c.class_id,
              label: c.class_name,
            }))}
          />
        </div>
      )}

      <div className="obj_tip">
        <Alert
          type="info"
          showIcon
          message="建议目标由班级画像推导（AI 建议、教师决定）；固定目标为课标通用库。勾选后随「开始生成」带入教学设计。"
        />
      </div>

      {loading && (
        <div className="obj_loading">
          <Spin />
        </div>
      )}
      {!loading && (
        <>
          <div className="obj_section">
            <div className="obj_section_title">
              <BulbOutlined /> 学情建议目标（{data?.class_name || cid}）
            </div>
            {suggestions.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="当前班级暂无可参考学情"
              />
            )}
            <div className="obj_list">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className={
                    "obj_item" + (isSelected(s.id) ? " obj_item--on" : "")
                  }
                >
                  <div className="obj_item_main" onClick={() => toggle(s)}>
                    <Checkbox checked={isSelected(s.id)} />
                    <div className="obj_item_body">
                      <div className="obj_item_text">
                        <Tag
                          color={s.kind === "literacy" ? "purple" : "blue"}
                          className="obj_tag"
                        >
                          {KIND_ZH[s.kind] || s.kind}
                        </Tag>
                        {s.level && <Tag className="obj_tag">{s.level}</Tag>}
                        <span>{s.text}</span>
                      </div>
                      {s.basis && (
                        <div className="obj_basis">依据：{s.basis}</div>
                      )}
                    </div>
                  </div>
                  {s.rubric?.length ? (
                    <Collapse
                      ghost
                      size="small"
                      className="obj_rubric"
                      items={[
                        {
                          key: "r",
                          label: (
                            <span className="obj_rubric_label">
                              评价量规草案（{s.rubric.length} 档）
                            </span>
                          ),
                          children: (
                            <table className="obj_rubric_table">
                              <tbody>
                                {s.rubric.map((r) => (
                                  <tr key={r.level}>
                                    <td className="obj_rubric_lv">{r.level}</td>
                                    <td>{r.desc}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ),
                        },
                      ]}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="obj_section">
            <Collapse
              ghost
              size="small"
              activeKey={fixedOpen}
              onChange={setFixedOpen}
              items={[
                {
                  key: "f",
                  label: (
                    <span className="obj_fixed_label">
                      <CheckSquareOutlined /> 课标固定目标库（可多选）
                    </span>
                  ),
                  children: (
                    <div className="obj_list">
                      {fixedPool.map((f) => (
                        <div
                          key={f.id}
                          className={
                            "obj_item obj_item--fixed" +
                            (isSelected(f.id) ? " obj_item--on" : "")
                          }
                          onClick={() => toggle(f)}
                        >
                          <Checkbox checked={isSelected(f.id)} />
                          <div className="obj_item_body">
                            <div className="obj_item_text">
                              {f.literacy && (
                                <Tag color="cyan" className="obj_tag">
                                  {f.literacy}
                                </Tag>
                              )}
                              {f.level && f.level !== "—" && (
                                <Tag className="obj_tag">{f.level}</Tag>
                              )}
                              <span>{f.text}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </div>

          <div className="obj_footer">
            <span className="obj_selected_n">
              已选 {selected.length} 条目标
            </span>
            {selected.length > 0 && (
              <div className="obj_selected_list">
                {selected.map((s) => (
                  <Tag
                    key={s.id}
                    closable
                    onClose={() => toggle(s)}
                    color={s.from === "suggest" ? "blue" : "cyan"}
                  >
                    {(s.cluster || s.literacy || "目标").slice(0, 10)}
                  </Tag>
                ))}
              </div>
            )}
            {selected.length > 0 && (
              <Button
                size="small"
                type="link"
                onClick={() => {
                  onChange([]);
                  message.success("已清空目标选择");
                }}
              >
                清空
              </Button>
            )}
            <Tooltip title="生成时会以「本课教学目标（已确认）」追加到生成请求，与班级学情注入互不覆盖">
              <span className="obj_note">已选目标将随生成请求带入</span>
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
};

export default ObjectivePanel;
