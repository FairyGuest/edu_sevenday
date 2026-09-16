/**
 * v2.0-I 全局 AI 小助手 · mock 服务（开发辅助，非系统功能）。
 * 接口：POST /api/assistant/chat
 * 设计（可行性方案 L0"简单小智能体"）：
 *  - 执行类意图（注入教学设计/生成个性化作业/筛选题目/查看个人学情）→ 规则确定性识别，
 *    返回 {type:'action'} 由前端渲染确认卡，确认后走前端 ActionRegistry 白名单执行；
 *  - 问答/解释类 → dev-server 侧直连 GLM-4.6（Anthropic 兼容端点，key 不进前端 bundle，
 *    沿用 aiGuide 模式），system 注入当前页面上下文；AI 不可用时回退页面摘要兜底。
 */
const API_URL = "https://open.bigmodel.cn/api/anthropic/v1/messages";
const API_KEY = process.env.ZHIPU_API_KEY || "4139bc2c59ec42a5ad3cd13f14cca4bf.iWELzeqxnJX9MMjg";
const MODEL = process.env.ZHIPU_MODEL || "glm-4.6";

const LITERACIES = ["数学抽象", "逻辑推理", "数学建模", "直观想象", "数学运算", "数据分析"];

// v2.0-I 图谱解释能力（复用 kgraph 目录与解释逻辑，规则确定性输出，不依赖 AI 配额）
const { explainNode, allNodeNames } = require("./teacher/kgraph");

/** 图谱阅读指南（按页面图谱类型区分口径） */
function graphGuide(graphKind?: string): string {
  if (graphKind === "mastery") {
    return [
      "**知识点掌握图谱这样读：**",
      "- **节点** = 知识点（全量目录，含未学）；**大小** = 覆盖人数，越大越多人练过",
      "- **填充色** = 班级掌握度（红 → 绿，红即薄弱）；**红虚线圈** = 待巩固占比较高、建议优先干预",
      "- **外环色** = 课标能力等级 L1 了解 → L4 综合（四列分层，列内即同等级）",
      "- **连线**：实线 = 章内脉络（前后衔接），虚线 = 素养同源",
      "- **灰点** = 暂无学情数据（未测/未学）",
      "顶部工具栏支持搜索定位、滚轮缩放、拖拽平移；点节点可聚焦其邻接关系。",
    ].join("\n");
  }
  if (graphKind === "catalog") {
    return [
      "**学科知识图谱（目录版）这样读：**",
      "- **节点** = 知识点；**填充色** = 主要考查的核心素养（六大素养同色系）",
      "- **外环色** = 课标能力等级 L1 了解 → L4 综合（四列分层）",
      "- **连线**：实线 = 章内脉络（先修 → 后继），虚线 = 素养同源",
      "- 顶部可切年级（全部/七/八/九）；点击任意节点，右侧会给出**定位、先修后继、同素养关联与教学提示**",
      "也可以直接问我，例如：“解释一下二次根式”。",
    ].join("\n");
  }
  return [
    "知识图谱把知识点按 **L1 了解 → L4 综合** 四列分层，连线表示章内脉络与素养关联。",
    "你可以在「学情分析 → 知识图谱」看班级掌握度着色版，或在「资源平台 → 知识图谱」看目录版并点击节点看解释。",
  ].join("\n");
}

async function askAI(system: string, user: string, maxTokens = 800): Promise<string | null> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        authorization: `Bearer ${API_KEY}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        thinking: { type: "disabled" },
        system,
        messages: [{ role: "user", content: user }],
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const d: any = await res.json();
    const text = (d?.content || []).map((c: any) => c?.text).filter(Boolean).join("\n");
    return text || null;
  } catch {
    return null;
  }
}

/** 执行类意图识别（确定性规则；命中即返回动作，前端出确认卡） */
function detectIntent(m: string, data: any): { key: string; label: string; params: Record<string, any>; reply: string } | null {
  const classId = data?.class_id;
  const sid = data?.student_id;

  if (/注入|带入.{0,6}教学设计|学情注入/.test(m)) {
    return {
      key: "inject_teaching_design", label: "注入教学设计",
      params: { class_id: classId },
      reply: `好的，我将把当前班级的学情画像注入教学设计${classId ? "" : "（未取到班级上下文，将使用默认班级）"}。请确认执行：`,
    };
  }
  if (/(布置|下发|留|生成|创建).{0,8}(作业|练习|试卷)|组卷|个性化作业/.test(m)) {
    const strategy = /复习|遗忘/.test(m) ? "review" : /变式|错题/.test(m) ? "variant" : /挑战|拔高/.test(m) ? "challenge" : "weak";
    return {
      key: "personalized_paper", label: "生成个性化作业",
      params: { strategy, class_id: classId },
      reply: `好的，我将按「${{ weak: "薄弱知识点练", variant: "错题变式", review: "遗忘复习", challenge: "选做挑战" }[strategy]}」方针为全班生成每人一单（约 6 题）。请确认执行：`,
    };
  }
  if (/(找|搜|筛|推荐|来|出|练).{0,10}(题|题目|练习)|筛选题目/.test(m)) {
    const lit = LITERACIES.find((l) => m.includes(l));
    return {
      key: "filter_question_bank", label: "筛选题目",
      params: lit ? { literacy: lit } : {},
      reply: lit
        ? `好的，我将为你筛选「${lit}」素养相关的题目，确认后跳转题库：`
        : "好的，我将为你打开题库筛选，确认后跳转：",
    };
  }
  if (/看.{0,6}(个人学情|画像|学情)|查看学生|某.{0,3}学生/.test(m)) {
    return {
      key: "view_student_profile", label: "查看个人学情",
      params: sid ? { student_id: sid } : {},
      reply: sid
        ? "好的，我将为你打开当前学生的个人学情："
        : "好的，我将切换到「个人学情」标签页，你在左侧列表点选学生即可查看：",
    };
  }
  return null;
}

function buildSystem(page: any, actions: any[]): string {
  const actDesc = (actions || [])
    .map((a) => `- ${a.key}：${a.label}（${a.desc || ""}）`)
    .join("\n");
  return `你是「智谱七天」教师端 AI 助教"小七"，面向初中数学老师，帮助其使用本系统。
当前老师所在页面：《${page?.title || "未知页面"}》（路由 ${page?.route || "/"}）
页面数据摘要：${page?.summary || "（暂无）"}

你可以协助老师执行的系统操作（由系统确认卡触发，不由你直接执行）：
${actDesc || "（暂无）"}

回答要求：
1. 简洁口语化，200 字以内，必要时用短列表；
2. 解释页面内容时基于上面的页面摘要，不要编造具体数字；
3. 老师想执行操作时，引导其直接说"帮我注入教学设计/帮我生成个性化作业/帮我找题"等；
4. 不回答与教学系统无关的问题，礼貌拉回。`;
}

function fallbackReply(page: any): string {
  return [
    `当前页面：《${page?.title || "未知"}》。`,
    page?.summary || "",
    "",
    "（AI 服务暂不可用，以上为页面数据摘要兜底。你可以对我说：**帮我注入教学设计** / **帮我生成个性化作业** / **帮我找几道数学抽象的题** / **解释一下二次根式**）",
  ].filter(Boolean).join("\n");
}

/** 从消息中匹配知识目录里的知识点名（最长匹配，如"解释二次根式的乘除"优先于"二次根式"） */
function matchNodeName(message: string): string | null {
  const names = allNodeNames();
  let best: string | null = null;
  for (const n of names) {
    if (message.includes(n) && (!best || n.length > best.length)) best = n;
  }
  return best;
}

export default {
  "POST /api/assistant/chat": async (req: any, res: any) => {
    const b = req.body || {};
    const message = String(b.message || "").trim();
    const page = b.page || {};
    const actions = Array.isArray(b.actions) ? b.actions : [];
    const history = (Array.isArray(b.history) ? b.history : []).slice(-8);

    if (!message) {
      return res.json({ code: 200, msg: "ok", data: { type: "text", reply: "请输入你的问题～" } });
    }

    // ① 执行类意图：规则确定性识别（小智能体的"工具调用"）
    const intent = detectIntent(message, page?.data);
    if (intent) {
      return res.json({
        code: 200, msg: "ok",
        data: { type: "action", reply: intent.reply, action: { key: intent.key, label: intent.label, params: intent.params } },
      });
    }

    // ①' 图谱辅助解释（v2.0-I）：图谱阅读指南 / 知识点解释（规则 + 目录数据，确定性输出）
    if (/图谱|怎么看图|怎么读图|图怎么/.test(message) && /(怎么|什么|看|读|解释|讲|帮助|指导)/.test(message)) {
      return res.json({
        code: 200, msg: "ok",
        data: { type: "text", reply: graphGuide(page?.data?.graphKind), source: "graph-guide" },
      });
    }
    const nodeName = matchNodeName(message);
    if (nodeName && /(解释|讲讲|说说|什么是|介绍一下|怎么学|什么意思|咋)/.test(message)) {
      const ex: any = explainNode(nodeName);
      if (ex) {
        return res.json({
          code: 200, msg: "ok",
          data: {
            type: "action",
            reply: `${ex.summary}\n\n💡 ${ex.teaching_tip}\n\n也可以帮你找该知识点的题目：`,
            action: { key: "filter_question_bank", label: `筛选「${nodeName}」题目`, params: { cluster: nodeName } },
          },
        });
      }
    }

    // ② 问答/解释类：GLM（页面上下文注入），失败回退页面摘要
    const qa = history.map((h: any) => `${h.role === "user" ? "老师" : "小七"}：${String(h.text || "").slice(0, 300)}`).join("\n");
    const text = await askAI(
      buildSystem(page, actions),
      qa ? `以下是之前的对话：\n${qa}\n\n老师：${message}` : `老师：${message}`,
    );
    res.json({
      code: 200, msg: "ok",
      data: text
        ? { type: "text", reply: text, source: "ai" }
        : { type: "text", reply: fallbackReply(page), source: "fallback" },
    });
  },
};
