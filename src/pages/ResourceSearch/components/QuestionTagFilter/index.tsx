import { useEffect, useMemo, useState } from "react";
import { Button, Tooltip } from "antd";
import {
  ClearOutlined,
  CompassOutlined,
  PartitionOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "umi";
import GraphFilterSelect from "../GraphFilterSelect";
import "./index.less";

/**
 * 差异化智能筛选（v2.0-L 升级）：
 * - 独有维（内部图谱独有）：能力等级 = L1→L4 课标进阶阶梯（支持"≥该级"范围选择）、
 *   核心素养 = 六色徽章矩阵（同维度跨页同色，悬停见二级维度）
 * - 常规维（题型/来源类别/年份/教材版本/省市地域二级）；难度已按 v2.0-L1 下线不外显
 * 选中写入 resourceSearchModel.filters 驱动主列表。
 */

type FacetKey =
  | "abilities"
  | "literacies"
  | "questionTypes"
  | "scenes"
  | "years"
  | "textbook_versions"
  | "regions"
  | "cities";

const LIT_META: Record<string, { subs: string[]; hex: string }> = {
  数学抽象: { subs: ["符号意识", "概念抽象", "关系抽象"], hex: "#2563eb" },
  逻辑推理: { subs: ["归纳推理", "类比推理", "演绎论证"], hex: "#7c3aed" },
  数学建模: { subs: ["模型感知", "模型构建", "模型检验"], hex: "#db2777" },
  直观想象: { subs: ["空间观念", "几何直观", "数形表征"], hex: "#ea580c" },
  数学运算: { subs: ["算理理解", "算法选择", "运算验证"], hex: "#0e9265" },
  数据分析: { subs: ["数据收集", "数据描述", "数据推断"], hex: "#52607a" },
};
const LIT_ORDER = [
  "数学抽象",
  "逻辑推理",
  "数学建模",
  "直观想象",
  "数学运算",
  "数据分析",
];

const NORMAL_DIMS: { key: FacetKey; label: string }[] = [
  { key: "questionTypes", label: "题型" },
  { key: "scenes", label: "来源类别" },
  { key: "years", label: "年份" },
  { key: "textbook_versions", label: "教材版本" },
];

const LV_ORDER = ["L1 了解", "L2 理解", "L3 掌握", "L4 综合"];

export default function QuestionTagFilter() {
  const dispatch = useDispatch();
  const { filters, filterOptions, pagination, checkedKnowledge } = useSelector(
    (state: any) => state.resourceSearchModel,
  );
  const [facets, setFacets] = useState<any>({});
  const [ladder, setLadder] = useState(true); // 能力阶梯模式：true=≥该级

  useEffect(() => {
    let dead = false;
    fetch("/api/teacher/questions/facets", {
      signal: AbortSignal.timeout(8000),
    })
      .then((r) => r.json())
      .then((d) => {
        if (dead || d.code !== 200 || !d.data) return;
        const v = d.data;
        const norm: Record<string, any[]> = {
          abilities: v.abilities || [],
          literacies: v.literacies || [],
          questionTypes: v.forms || [],
          scenes: v.scenes || v.source_types || [],
          years: v.years || [],
          textbook_versions: v.textbook_versions || [],
          regions: v.regions || [],
        };
        setFacets({ ...norm, regionTree: v.region_tree || [] });
        dispatch({
          type: "resourceSearchModel/setData",
          payload: {
            filterOptions: {
              ...filterOptions,
              ...Object.fromEntries(
                Object.entries(norm).map(([k, items]) => [
                  k,
                  (items as any[]).map((it) => ({
                    label: it.value,
                    value: it.value,
                  })),
                ]),
              ),
            },
          },
        });
      })
      .catch(() => {
        /* 面板保持空维度，不打断列表 */
      });
    return () => {
      dead = true;
    };
  }, []);

  const toPage1 = () => {
    dispatch({
      type: "resourceSearchModel/setData",
      payload: { pagination: { ...pagination, current: 1 } },
    });
  };
  const setFilter = (key: FacetKey, vals: string[]) => {
    dispatch({
      type: "resourceSearchModel/setData",
      payload: { filters: { ...(filters || {}), [key]: vals } },
    });
    toPage1();
  };
  const selOf = (key: FacetKey): string[] =>
    (filters?.[key] || []).filter((v: string) => v !== "all");
  const toggle = (key: FacetKey, value: string) => {
    const cur = selOf(key);
    setFilter(
      key,
      cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
    );
  };

  const abilityItems = (facets.abilities || []) as {
    value: string;
    n: number;
  }[];
  const selAbility = selOf("abilities");
  const abilityCount = (v: string) =>
    abilityItems.find((a) => a.value === v)?.n ?? 0;
  const onStep = (lv: string) => {
    if (!ladder) return toggle("abilities", lv);
    if (selAbility.includes(lv)) {
      setFilter("abilities", []);
      return;
    }
    const idx = LV_ORDER.indexOf(lv);
    setFilter(
      "abilities",
      LV_ORDER.slice(idx).filter((v) => abilityCount(v) > 0),
    );
  };

  const clearAll = () => {
    const cleared: Record<string, string[]> = {};
    [
      ...NORMAL_DIMS.map((d) => d.key),
      "regions",
      "cities",
      "abilities",
      "literacies",
    ].forEach((k) => {
      cleared[k] = [];
    });
    dispatch({
      type: "resourceSearchModel/setData",
      payload: { filters: { ...(filters || {}), ...cleared } },
    });
    toPage1();
  };

  const activeCount = useMemo(
    () =>
      NORMAL_DIMS.reduce((a, d) => a + selOf(d.key).length, 0) +
      selAbility.length +
      selOf("literacies").length +
      selOf("regions").length +
      selOf("cities").length,
    [filters],
  );

  /** 省市二级：选中省份后展示其市级选项（来自 facets.region_tree） */
  const provinceSel = selOf("regions");
  const cityOptions = useMemo(() => {
    const tree: any[] = facets.regionTree || [];
    const picked = tree.filter((t: any) => provinceSel.includes(t.province));
    const merged = new Map<string, number>();
    for (const t of picked)
      for (const c of t.cities || [])
        merged.set(c.value, (merged.get(c.value) || 0) + c.n);
    return [...merged.entries()]
      .map(([value, n]) => ({ value, n }))
      .sort((a, b) => b.n - a.n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facets.regionTree, filters?.regions]);

  return (
    <div className="ds_filter">
      <div className="ds_head">
        <CompassOutlined className="ds_icon" />
        <span className="ds_title">智能筛选</span>
        <span className="ds_badge">图谱独有双维</span>
        {(checkedKnowledge || []).length ? (
          <span className="ds_badge ds_badge--graph">
            <PartitionOutlined /> 图谱 {(checkedKnowledge || []).length} 点
          </span>
        ) : null}
        {activeCount > 0 ? (
          <>
            <span className="ds_count">已选 {activeCount} 项</span>
            <Button
              type="link"
              size="small"
              icon={<ClearOutlined />}
              onClick={clearAll}
            >
              清空
            </Button>
          </>
        ) : null}
      </div>

      <div className="ds_hero">
        <div className="ds_hero_row">
          <div className="ds_hero_label">
            <ThunderboltOutlined /> 能力进阶
            <Tooltip title="依据课标行为动词标定：了解→理解→掌握→综合。阶梯模式选择“该级及以上”。">
              <span className="ds_q">?</span>
            </Tooltip>
          </div>
          <div className="ds_steps">
            {LV_ORDER.map((lv, i) => {
              const on = selAbility.includes(lv);
              const n = abilityCount(lv);
              const inRange =
                ladder &&
                selAbility.length > 0 &&
                !on &&
                LV_ORDER.indexOf(selAbility[0]) < i;
              return (
                <Tooltip key={lv} title={`${lv}（${n} 题）`}>
                  <button
                    type="button"
                    className={`ds_step${on ? " on" : ""}${inRange ? " inrange" : ""}`}
                    style={{ ["--h" as any]: `${8 + i * 5}px` }}
                    disabled={!n}
                    onClick={() => onStep(lv)}
                  >
                    <i className="ds_step_bar" />
                    <span className="ds_step_lv">{lv.split(" ")[0]}</span>
                    <span className="ds_step_name">{lv.split(" ")[1]}</span>
                  </button>
                </Tooltip>
              );
            })}
          </div>
          <Button
            size="small"
            type={ladder ? "primary" : "default"}
            ghost={ladder}
            className="ds_mode"
            onClick={() => setLadder((l) => !l)}
          >
            {ladder ? "≥ 阶梯" : "单级"}
          </Button>
        </div>

        <div className="ds_hero_row">
          <div className="ds_hero_label">
            <CompassOutlined /> 核心素养
            <Tooltip title="数学学科六大素养（内部图谱独有标签）；悬停徽章查看二级维度。">
              <span className="ds_q">?</span>
            </Tooltip>
          </div>
          <div className="ds_lits">
            {LIT_ORDER.map((name) => {
              const meta = LIT_META[name];
              const items = (facets.literacies || []) as {
                value: string;
                n: number;
              }[];
              const n = items.find((x) => x.value === name)?.n ?? 0;
              if (!n) return null;
              const on = selOf("literacies").includes(name);
              return (
                <Tooltip key={name} title={`${meta.subs.join(" · ")}｜${n} 题`}>
                  <button
                    type="button"
                    className={`ds_lit${on ? " on" : ""}`}
                    style={{ ["--c" as any]: meta.hex }}
                    onClick={() => toggle("literacies", name)}
                  >
                    {name}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>

      <div className="ds_normal">
        {NORMAL_DIMS.map((dim) => {
          const items = (facets[dim.key] || []) as {
            value: string;
            n: number;
          }[];
          if (!items.length) return null;
          const sel = selOf(dim.key);
          return (
            <div key={dim.key} className="ds_nrow">
              <span className="ds_nlabel">{dim.label}</span>
              <div className="ds_nopts">
                {items.map((it) => {
                  const on = sel.includes(it.value);
                  return (
                    <button
                      key={it.value}
                      type="button"
                      className={`ds_nopt${on ? " on" : ""}`}
                      title={`${it.value}（${it.n} 题）`}
                      onClick={() => toggle(dim.key, it.value)}
                    >
                      {it.value}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* 省市二级地域（v2.0-L3）：省 → 市级联动，全国通用不细分 */}
        <div className="ds_nrow">
          <span className="ds_nlabel">地域（省/市）</span>
          <div className="ds_nopts">
            {((facets.regionTree || []) as any[]).map((t) => {
              const on = provinceSel.includes(t.province);
              return (
                <button
                  key={t.province}
                  type="button"
                  className={`ds_nopt${on ? " on" : ""}`}
                  title={`${t.province}（${t.n} 题）${t.cities?.length ? ` · ${t.cities.length} 市` : ""}`}
                  onClick={() => {
                    // 切省时清掉已选市级（避免悬空城市筛选）
                    const nextProv = on
                      ? provinceSel.filter((v) => v !== t.province)
                      : [...provinceSel, t.province];
                    const keepCities = new Set(
                      nextProv.flatMap((p) =>
                        (
                          (facets.regionTree || []).find(
                            (x: any) => x.province === p,
                          )?.cities || []
                        ).map((c: any) => c.value),
                      ),
                    );
                    dispatch({
                      type: "resourceSearchModel/setData",
                      payload: {
                        filters: {
                          ...(filters || {}),
                          regions: nextProv,
                          cities: selOf("cities").filter((c) =>
                            keepCities.has(c),
                          ),
                        },
                      },
                    });
                    toPage1();
                  }}
                >
                  {t.province}
                </button>
              );
            })}
          </div>
        </div>
        {provinceSel.length && cityOptions.length ? (
          <div className="ds_nrow ds_nrow--sub">
            <span className="ds_nlabel">市级</span>
            <div className="ds_nopts">
              {cityOptions.map((it) => {
                const on = selOf("cities").includes(it.value);
                return (
                  <button
                    key={it.value}
                    type="button"
                    className={`ds_nopt ds_nopt--city${on ? " on" : ""}`}
                    title={`${it.value}（${it.n} 题）`}
                    onClick={() => toggle("cities", it.value)}
                  >
                    {it.value}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* 知识图谱筛选项：以图谱知识点收窄题库（与左侧知识点树同源，写入 checkedKnowledge → kg_list） */}
        <div className="ds_nrow">
          <span className="ds_nlabel">
            知识图谱
            <Tooltip title="按知识图谱知识点筛选题目，可多选、可搜索；与「知识图谱」Tab 的图同源。">
              <span className="ds_q">?</span>
            </Tooltip>
          </span>
          <div className="ds_nopts ds_nopts--graph">
            <GraphFilterSelect
              width={320}
              value={checkedKnowledge || []}
              onChange={(vals: string[]) => {
                dispatch({
                  type: "resourceSearchModel/setData",
                  payload: { checkedKnowledge: vals, checkedChapter: [] },
                });
                toPage1();
              }}
            />
            {(checkedKnowledge || []).length ? (
              <Button
                size="small"
                type="link"
                icon={<ClearOutlined />}
                onClick={() => {
                  dispatch({
                    type: "resourceSearchModel/setData",
                    payload: { checkedKnowledge: [] },
                  });
                  toPage1();
                }}
              >
                清除图谱筛选
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
