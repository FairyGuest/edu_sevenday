const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright-core");
const base = process.env.TEST_URL || "http://127.0.0.1:4173";
const output = path.resolve(__dirname, "../.temp/assistant");
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(15000);
  const errors = [], passed = [], times = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(() => {
    window.__assistantTest = { mode: "offline", chats: [], models: [] };
    function wrap(fetcher) {
      return async (input, init) => {
        const url = String(input), state = window.__assistantTest;
        if (url.includes("/api/assistant/chat")) state.chats.push(JSON.parse(init.body));
        if (url.includes("/api/assistant/model")) {
          state.models.push(JSON.parse(init.body));
          if (state.mode === "delay") {
            await new Promise(resolve => setTimeout(resolve, 1800));
            return new Response(JSON.stringify({ code: 200, data: { available: true, answer: "过期回答不应插入新会话" } }));
          }
          if (state.mode === "offline") return new Response(JSON.stringify({ code: 200, data: { available: false } }));
        }
        return fetcher(input, init);
      };
    }
    let current = wrap(window.fetch.bind(window));
    Object.defineProperty(window, "fetch", { configurable: true, get: () => current, set: fn => { current = wrap(fn); } });
  });
  const panel = page.locator(".ga_panel"), bubble = () => page.locator(".ga_bubble--assistant:not(.ga_greeting)").last();
  async function check(name) {
    assert.deepEqual(errors, [], name);
    assert.equal(await page.evaluate(() => window.__assistantError || null), null, name);
    passed.push(name); console.log("PASS " + name);
  }
  async function ask(text) {
    const before = await page.locator(".ga_bubble--user").count(), start = Date.now();
    await page.locator(".ga_input textarea").fill(text);
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    await page.waitForFunction(n => document.querySelectorAll(".ga_bubble--user").length > n, before);
    await page.waitForFunction(() => !document.querySelector(".ga_thinking"), null, { timeout: 60000 });
    times.push({ text, ms: Date.now() - start });
    return bubble().innerText();
  }
  async function reset() { await page.getByRole("button", { name: "开始新对话" }).click(); }
  try {
    await page.goto(base);
    await page.getByPlaceholder("请输入EID账号").fill("teacher");
    await page.getByPlaceholder("请输入密码", { exact: true }).fill("demo123456");
    await page.getByPlaceholder("请输入验证码").fill("1234");
    await page.getByRole("button", { name: "立即登录" }).click();
    await page.waitForURL("**/source");
    await panel.waitFor();
    assert.match(await ask("查看彭媛2026年8月学情"), /36 条/);
    await check("姓名查询直接在助手内展示真实统计");
    await bubble().getByRole("button", { name: "打开彭媛的个人学情" }).click();
    await page.locator(".pa_panel_sid").filter({ hasText: "edu01001" }).waitFor();
    assert.equal(new URL(page.url()).searchParams.get("start_date"), "2026-08-01");
    assert.equal(await panel.count(), 1);
    await check("精确跳到指定学生且保留日期与对话");
    await page.getByText("教学设计", { exact: true }).first().click();
    await page.locator(".teach-design").waitFor();
    assert.ok((await panel.innerText()).includes("彭媛"));
    assert.match(await ask("换侯秀"), /侯秀/);
    await check("面板不遮挡菜单，跨页任务和指代连续");
    assert.match(await ask("查看张不存在的学情"), /未找到/);
    assert.ok(!(await ask("给他生成5道练习")).includes("已生成草稿"));
    await check("未知姓名及后续代词不误选学生");
    await reset();
    assert.match(await ask("查看彭圆上月学情"), /学生候选/);
    await bubble().getByRole("button", { name: /彭媛.*edu01001/ }).click();
    await page.waitForFunction(() => !document.querySelector(".ga_thinking"));
    assert.match(await bubble().innerText(), /36 条/);
    await check("错别字候选选择后继续原来的日期查询");
    assert.match(await ask("只看近两周"), /当前范围无/);
    await check("日期无数据不伪造历史统计");
    await reset();
    assert.match(await ask("比较彭媛和侯秀2026年8月学情"), /同口径学生对比/);
    await check("同口径学生比较");
    assert.match(await ask("给这两个人生成5道二次根式练习，先别发"), /已生成草稿/);
    assert.equal(await bubble().locator("[data-kind=draft] summary").count(), 2);
    await bubble().locator("[data-kind=draft] summary").first().click();
    await page.waitForFunction(() => [...document.querySelectorAll(".ga_bubble--assistant:not(.ga_greeting)")].at(-1)?.textContent.includes("二次根式"));
    assert.match(await bubble().innerText(), /二次根式/);
    await check("指定两人组卷且保留题数和知识点");
    assert.match(await ask("第2题换掉"), /替换完成/);
    await check("换题保持草稿条件");
    await bubble().getByRole("button", { name: "到作业页预览" }).click();
    await page.waitForURL("**/paperCompose?**");
    await page.getByText("作业记录", { exact: false }).first().waitFor();
    assert.equal(new URL(page.url()).searchParams.get("tab"), "personalized");
    await check("草稿打开实际组卷页");
    assert.match(await ask("发布这份草稿，截止2099-09-20 20:00"), /确认发布/);
    await ask("先别发");
    assert.equal(await panel.getByRole("button", { name: "确认发布", exact: true }).last().isDisabled(), true);
    await check("否定指令使旧确认卡不可执行");
    await ask("发布这份草稿，截止2099-09-20 20:00");
    await bubble().getByRole("button", { name: "确认发布", exact: true }).click();
    await page.waitForFunction(() => !document.querySelector(".ga_thinking"));
    assert.match(await bubble().innerText(), /发布回执/);
    assert.match(await ask("查看作业提交情况"), /未提供真实提交记录/);
    await check("发布回执真实，缺少提交数据时明确说明");
    await reset();
    assert.match(await ask("为彭媛写2026年8月二次根式教学片段"), /教学片段/);
    await bubble().getByRole("button", { name: "编辑草稿" }).click();
    await bubble().getByLabel("编辑内容草稿").fill("验收教学草稿：先用a=-3解释平方根与绝对值。");
    await bubble().getByRole("button", { name: "完成编辑" }).click();
    await bubble().getByRole("button", { name: "带入教学设计" }).click();
    await page.locator(".teach-design").waitFor();
    assert.ok((await page.locator(".teach-design textarea").evaluateAll(nodes => nodes.map(n => n.value))).some(v => v.includes("验收教学草稿")));
    await check("教学草稿可编辑并带入实际生成表单");
    await page.evaluate(() => { window.__assistantTest.mode = "delay"; });
    await page.locator(".ga_input textarea").fill("给出一道完整例题及讲解");
    await page.getByRole("button", { name: "发送消息" }).click();
    await page.waitForFunction(() => document.querySelector(".ga_thinking")?.textContent.includes("证据"));
    await reset();
    await page.waitForTimeout(2200);
    assert.ok(!(await panel.innerText()).includes("过期回答不应插入"));
    await check("新对话丢弃迟到模型回答");
    await page.evaluate(() => { window.__assistantTest.mode = "live"; });
    const live = await ask("解方程2x+3=7，给出步骤并解释移项为什么变号");
    assert.match(live, /模型回答/); assert.match(live, /2|两/);
    const request = await page.evaluate(() => window.__assistantTest.models.at(-1));
    assert.ok(request.context);
    await check("真实模型完成具体教学问答");
    await page.screenshot({ path: path.join(output, "assistant-live-qa.png") });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok((await panel.boundingBox()).width <= 390);
    await page.getByRole("button", { name: "切换到右侧栏" }).click(); await page.locator(".ga_panel--sidebar").waitFor();
    await check("移动端面板常驻并可切换位置");
    fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({ passed, errors, times }, null, 2));
  } catch (e) { await page.screenshot({ path: path.join(output, "failure.png") }); throw e; }
  finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
