import { useEffect, useState } from "react";
import { Button, Input, Modal, Spin, Tag, message } from "antd";
import { ArrowRightOutlined, RobotOutlined, ThunderboltOutlined } from "@ant-design/icons";
import "./index.less";

/**
 * D1 启发式生成引导弹窗：
 * ① AI 就班级学情向教师提问（可选方向/自由作答）
 * ② 教师回答后，AI 规划教案四模块（学习目标/学案任务/习题配置/课件大纲）的内容方向
 * ③ 教师确认（可勾选要点）→ 携带规划进入教案生成
 * 提供"跳过引导直接生成"出口。
 */

interface QItem { id: string; question: string; hint?: string; options: string[] }
interface MItem { key: string; title: string; direction: string; points: string[] }

interface Props {
  open: boolean;
  params: Record<string, any>; // chapter/class_type/学情 等
  onComplete: (guidance: any) => void; // 确认并生成
  onSkip: () => void; // 跳过引导直接生成
  onClose: () => void;
}

export default function GuidedFlow({ open, params, onComplete, onSkip, onClose }: Props) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0载入问题 1作答 2规划中 3确认规划
  const [questions, setQuestions] = useState<QItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customs, setCustoms] = useState<Record<string, string>>({});
  const [modules, setModules] = useState<MItem[]>([]);
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [source, setSource] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setStep(0); setQuestions([]); setAnswers({}); setCustoms({}); setModules([]); setPicked({});
    fetch("/api/ai/guide/questions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
      .then(r => r.json())
      .then(d => {
        if (d.code === 200 && d.data?.questions?.length) {
          setQuestions(d.data.questions);
          setSource(d.data.source);
          setStep(1);
        } else { message.error("引导问题生成失败，可直接生成"); onSkip(); }
      })
      .catch(() => { message.error("AI 服务不可用，已切换直接生成"); onSkip(); });
  }, [open]);

  const choose = (qid: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qid]: prev[qid] === val ? "" : val }));
    setCustoms(prev => ({ ...prev, [qid]: "" }));
  };

  const submitAnswers = async () => {
    const unanswered = questions.filter(q => !answers[q.id] && !customs[q.id]);
    if (unanswered.length) {
      message.warning(`还有 ${unanswered.length} 个问题未作答（可选方向或自由输入）`);
      return;
    }
    const merged: Record<string, string> = {};
    questions.forEach(q => { merged[q.id] = customs[q.id] || answers[q.id] || ""; });
    setStep(2);
    try {
      const d = await fetch("/api/ai/guide/plan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter: params.chapter, study_ctx: params.study_ctx, answers: merged }),
      }).then(r => r.json());
      if (d.code === 200 && d.data?.modules?.length) {
        setModules(d.data.modules);
        const init: Record<string, string[]> = {};
        d.data.modules.forEach((m: MItem) => { init[m.key] = [...(m.points || [])]; });
        setPicked(init);
        setStep(3);
      } else { message.error("规划生成失败，已切换直接生成"); onSkip(); }
    } catch { message.error("AI 服务不可用，已切换直接生成"); onSkip(); }
  };

  const confirm = () => {
    const finalModules = modules.map(m => ({ ...m, points: picked[m.key] || [] }));
    onComplete({
      answers: Object.fromEntries(questions.map(q => [q.id, customs[q.id] || answers[q.id] || ""])),
      modules: finalModules,
      source,
    });
  };

  const stepTitle = ["AI 正在了解你的班级", "AI 提问 · 请选择或作答", "AI 正在规划模块内容", "确认模块规划"];
  // D7 进度：1 AI 提问 → 2 模块规划 → 3 生成教案（step0/1=节点1，step2=节点2 进行中，step3=节点2 完成待确认）
  const curNode = step === 0 || step === 1 ? 1 : step === 2 ? 2 : 3;

  return (
    <Modal
      open={open}
      onCancel={step === 0 || step === 2 ? undefined : onClose}
      closable={step !== 0 && step !== 2}
      maskClosable={false}
      width={640}
      footer={null}
      title={
        <div>
          <div className="gf_title">
            <RobotOutlined className="gf_icon" />
            启发式教案设计
            <Tag color={source === "ai" ? "processing" : "default"} className="gf_src">
              {source === "ai" ? "AI 实时生成" : "智能模板"}
            </Tag>
            <span className="gf_step">{stepTitle[step]}</span>
          </div>
          <div className="gf_progress">
            {["AI 提问", "模块规划", "生成教案"].map((label, i) => {
              const n = i + 1;
              const active = n === curNode;
              const done = n < curNode;
              return (
                <div key={label} className={`gf_pnode ${active ? "active" : ""} ${done ? "done" : ""}`}>
                  <span className="gf_pno">{done ? "✓" : n}</span>
                  <span className="gf_plabel">{label}</span>
                  {n < 3 ? <span className="gf_pline" /> : null}
                </div>
              );
            })}
          </div>
        </div>
      }
    >
      {step === 0 || step === 2 ? (
        <div className="gf_loading">
          <Spin />
          <span>{step === 0 ? "AI 正在结合班级学情设计引导问题…" : "AI 正在根据你的回答规划四个模块…"}</span>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="gf_body">
          {questions.map((q, i) => (
            <div key={q.id} className="gf_q">
              <div className="gf_q_head">
                <span className="gf_q_no">{i + 1}</span>
                <div>
                  <div className="gf_q_text">{q.question}</div>
                  {q.hint ? <div className="gf_q_hint">{q.hint}</div> : null}
                </div>
              </div>
              <div className="gf_q_opts">
                {q.options.map(opt => (
                  <button key={opt} type="button"
                    className={`gf_opt ${answers[q.id] === opt ? "on" : ""}`}
                    onClick={() => choose(q.id, opt)}>
                    {opt}
                  </button>
                ))}
              </div>
              <Input
                size="small" className="gf_custom" allowClear
                placeholder="或自由作答（优先于所选方向）"
                value={customs[q.id]}
                onChange={e => setCustoms(prev => ({ ...prev, [q.id]: e.target.value }))}
              />
            </div>
          ))}
          <div className="gf_actions">
            <Button onClick={onSkip}>跳过引导，直接生成</Button>
            <Button type="primary" icon={<ArrowRightOutlined />} onClick={submitAnswers}>
              提交回答，规划模块
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="gf_body">
          <p className="gf_plan_note">AI 已根据你的回答规划以下方向，确认要点后生成教案：</p>
          {modules.map((m, mi) => (
            <div key={m.key} className="gf_module">
              <div className="gf_module_title">
                <span className="gf_mno">{mi + 1}/{modules.length}</span>
                {m.title}
                <span className="gf_dir">{m.direction}</span>
              </div>
              <div className="gf_points">
                {(m.points || []).map(p => {
                  const on = (picked[m.key] || []).includes(p);
                  return (
                    <label key={p} className={`gf_point ${on ? "on" : ""}`}
                      onClick={() => setPicked(prev => ({
                        ...prev,
                        [m.key]: on ? prev[m.key].filter(x => x !== p) : [...(prev[m.key] || []), p],
                      }))}>
                      {p}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="gf_actions">
            <Button onClick={() => setStep(1)}>返回修改回答</Button>
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={confirm}>
              确认并生成教案
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
