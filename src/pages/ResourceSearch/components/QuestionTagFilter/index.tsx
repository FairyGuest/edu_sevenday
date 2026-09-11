import { useEffect, useMemo, useState } from "react";
import { Button, Tooltip } from "antd";
import { ClearOutlined, CompassOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "umi";
import "./index.less";

/**
 * 差异化智能筛选：
 * - 独有维（内部图谱独有）：能力等级 = L1→L4 课标进阶阶梯（支持"≥该级"范围选择）、
 *   核心素养 = 六色徽章矩阵（同维度跨页同色，悬停见二级维度）
 * - 常规维（题型/难度/区域/场景）收进次级区
 * 选中写入 resourceSearchModel.filters 驱动主列表。
 */

type FacetKey = "abilities" | "literacies" | "difficulties" | "questionTypes" | "regions" | "scenes";

const LIT_META: Record<string, { subs: string[]; hex: string }> = {
  数学抽象: { subs: ["符号意识", "概念抽象", "关系抽象"], hex: "#2563eb" },
  逻辑推理: { subs: ["归纳推理", "类比推理", "演绎论证"], hex: "#7c3aed" },
  数学建模: { subs: ["模型感知", "模型构建", "模型检验"], hex: "#db2777" },
  直观想象: { subs: ["空间观念", "几何直观", "数形表征"], hex: "#ea580c" },
  数学运算: { subs: ["算理理解", "算法选择", "运算验证"], hex: "#0e9265" },
  数据分析: { subs: ["数据收集", "数据描述", "数据推断"], hex: "#52607a" },
};
const LIT_ORDER = ["数学抽象", "逻辑推理", "数学建模", "直观想象", "数学运算", "数据分析"];

const NORMAL_DIMS: { key: FacetKey; label: string }[] = [
  { key: "questionTypes", label: "题型" },
  { key: "difficulties", label: "难度" },
  { key: "regions", label: "区域" },
  { key: "scenes", label: "场景" },
];

const LV_ORDER = ["L1 了解", "L2 理解", "L3 掌握", "L4 综合"];

export default function QuestionTagFilter() {
  const dispatch = useDispatch();
  const { filters, filterOptions, pagination } = useSelector((state: any) => state.resourceSearchModel);
  const [facets, setFacets] = useState<any>({});
  const [ladder, setLadder] = useState(true); // 能力阶梯模式：true=≥该级

  useEffect(() => {
    let dead = false;
    fetch("/api/teacher/questions/facets")
      .then(r => r.json())
      .then(d => {
        if (dead || d.code !== 200 || !d.data) return;
        const v = d.data;
        const norm: Record<string, any[]> = {
          abilities: v.abilities || [], literacies: v.literacies || [],
          difficulties: v.difficulties || [], questionTypes: v.forms || [],
          regions: v.regions || [], scenes: v.scenes || [],
        };
        setFacets(norm);
        dispatch({
          type: "resourceSearchModel/setData",
          payload: {
            filterOptions: {
              ...filterOptions,
              ...Object.fromEntries(
                Object.entries(norm).map(([k, items]) => [
                  k, (items as any[]).map(it => ({ label: it.value, value: it.value })),
                ]),
              ),
            },
          },
        });
      });
    return () => { dead = true; };
  }, []);

  const toPage1 = () => {
    dispatch({ type: "resourceSearchModel/setData", payload: { pagination: { ...pagination, current: 1 } } });
  };
  const setFilter = (key: FacetKey, vals: string[]) => {
    dispatch({ type: "resourceSearchModel/setData", payload: { filters: { ...(filters || {}), [key]: vals } } });
    toPage1();
  };
  const selOf = (key: FacetKey): string[] => (filters?.[key] || []).filter((v: string) => v !== "all");
  const toggle = (key: FacetKey, value: string) => {
    const cur = selOf(key);
    setFilter(key, cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value]);
  };

  const abilityItems = (facets.abilities || []) as { value: string; n: number }[];
  const selAbility = selOf("abilities");
  const abilityCount = (v: string) => abilityItems.find(a => a.value === v)?.n ?? 0;
  const onStep = (lv: string) => {
    if (!ladder) return toggle("abilities", lv);
    if (selAbility.includes(lv)) { setFilter("abilities", []); return; }
    const idx = LV_ORDER.indexOf(lv);
    setFilter("abilities", LV_ORDER.slice(idx).filter(v => abilityCount(v) > 0));
  };

  const clearAll = () => {
    const cleared: Record<string, string[]> = {};
    [...NORMAL_DIMS.map(d => d.key), "abilities", "literacies"].forEach(k => { cleared[k] = []; });
    dispatch({ type: "resourceSearchModel/setData", payload: { filters: { ...(filters || {}), ...cleared } } });
    toPage1();
  };

  const activeCount = useMemo(
    () => NORMAL_DIMS.reduce((a, d) => a + selOf(d.key).length, 0) + selAbility.length + selOf("literacies").length,
    [filters],
  );

  return (
    <div className="ds_filter">
      <div className="ds_head">
        <CompassOutlined className="ds_icon" />
        <span className="ds_title">智能筛选</span>
        <span className="ds_badge">图谱独有双维</span>
        {activeCount > 0 ? (
          <>
            <span className="ds_count">已选 {activeCount} 项</span>
            <Button type="link" size="small" icon={<ClearOutlined />} onClick={clearAll}>清空</Button>
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
              const inRange = ladder && selAbility.length > 0 && !on && LV_ORDER.indexOf(selAbility[0]) < i;
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
          <Button size="small" type={ladder ? "primary" : "default"} ghost={ladder}
            className="ds_mode" onClick={() => setLadder(l => !l)}>
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
            {LIT_ORDER.map(name => {
              const meta = LIT_META[name];
              const items = (facets.literacies || []) as { value: string; n: number }[];
              const n = items.find(x => x.value === name)?.n ?? 0;
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
        {NORMAL_DIMS.map(dim => {
          const items = (facets[dim.key] || []) as { value: string; n: number }[];
          if (!items.length) return null;
          const sel = selOf(dim.key);
          return (
            <div key={dim.key} className="ds_nrow">
              <span className="ds_nlabel">{dim.label}</span>
              <div className="ds_nopts">
                {items.map(it => {
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
      </div>
    </div>
  );
}
