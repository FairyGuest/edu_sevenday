const assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright-core");
const output = path.resolve(__dirname, "../.temp/assistant-presentation");
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(18000);
  const errors = [], passed = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(() => {
    window.__presentation = { requests: [], delaySuggestions: false, delayChat: false };
    function wrap(fn) {
      return async (input, init) => {
        const url = String(input), s = window.__presentation;
        if (url.includes("/api/assistant/chat")) {
          s.requests.push(JSON.parse(init.body));
          if (s.delayChat) await new Promise(r => setTimeout(r, 1200));
        }
        if (url.includes("/api/assistant/model")) return new Response(JSON.stringify({ code: 200, data: { available: false } }));
        if (s.delaySuggestions && url.includes("/profile/suggestions")) await new Promise(r => setTimeout(r, 1800));
        return fn(input, init);
      };
    }
    let current = wrap(window.fetch.bind(window));
    Object.defineProperty(window, "fetch", { configurable: true, get: () => current, set: fn => { current = wrap(fn); } });
  });
  const panel = page.locator(".ga_panel"), greeting = () => page.locator(".ga_greeting").last();
  const response = () => page.locator(".ga_bubble--assistant:not(.ga_greeting)").last();
  const menu = name => page.getByText(name, { exact: true }).first();
  const check = async name => { assert.deepEqual(errors, []); assert.equal(await page.evaluate(() => window.__assistantError || null), null); passed.push(name); console.log("PASS " + name); };
  const greet = async text => {
    await page.waitForFunction(t => [...document.querySelectorAll(".ga_greeting")].at(-1)?.textContent.includes(t), text);
  };
  async function ask(text) {
    const n = await page.locator(".ga_bubble--user").count();
    await page.locator(".ga_input textarea").fill(text); await page.getByRole("button", { name: "发送消息", exact: true }).click();
    await page.waitForFunction(n => document.querySelectorAll(".ga_bubble--user").length > n, n);
    await page.waitForFunction(() => !document.querySelector(".ga_thinking"));
    return response().innerText();
  }
  try {
    await page.goto(process.env.TEST_URL || "http://127.0.0.1:4173");
    assert.equal(await panel.count(), 0);
    await page.getByPlaceholder("请输入EID账号").fill("teacher");
    await page.getByPlaceholder("请输入密码", { exact: true }).fill("demo123456");
    await page.getByPlaceholder("请输入验证码").fill("1234");
    await page.getByRole("button", { name: "立即登录" }).click();
    await page.waitForURL("**/source"); await greet("解释标签体系");
    assert.match(await panel.getAttribute("class"), /ga_panel--floating/);
    assert.equal(await page.locator(".ant-float-btn").count(), 0);
    await check("登录后聊天常驻右下角并自动提供资源页常用功能");

    await page.locator(".ga_input textarea").fill("尚未发送的备课思路");
    const n = await page.locator(".ga_greeting").count();
    await page.getByRole("button", { name: "切换到右侧栏" }).click();
    assert.match(await panel.getAttribute("class"), /ga_panel--sidebar/);
    const layout = await page.locator('.layout_content').boundingBox(), dock = await panel.boundingBox();
    assert.ok(layout.x + layout.width <= dock.x + 1, 'desktop sidebar must reserve page space');
    assert.equal(await page.locator(".ga_input textarea").inputValue(), "尚未发送的备课思路");
    await page.getByRole("button", { name: "切换到右下角" }).click();
    assert.equal(await page.locator(".ga_greeting").count(), n);
    await check("浮窗和侧栏切换保留草稿且不重复问候");

    await menu("学情分析").click(); await page.locator(".teacher_profile_container").waitFor(); await greet("班级学情");
    await greeting().locator(".ga_suggestions").waitFor();
    assert.equal(await page.locator(".ga_input textarea").inputValue(), "尚未发送的备课思路");
    await page.screenshot({ path: path.join(output, "class-floating.png") });
    await check("班级页自动问候与画像建议，切页保留未发送文字");

    await page.getByRole("tab", { name: "👤 个人学情" }).click();
    await page.locator(".pa_panel_sid").waitFor(); await greet("的个人学情");
    const firstName = await page.locator(".ga_header_page").innerText();
    await page.locator(".pa_list_item").nth(1).click();
    await page.waitForFunction(t => document.querySelector(".ga_header_page")?.textContent.includes("的个人学情") && document.querySelector(".ga_header_page")?.textContent !== t, firstName);
    const secondName = await page.locator(".ga_header_page").innerText(); await greet(secondName);
    assert.notEqual(firstName, secondName);
    const personalCount = await page.locator(".ga_greeting").count();
    await page.locator(".pa_chips .source-chip").filter({ hasText: "考试记录" }).click();
    await page.waitForTimeout(450);
    assert.equal(await page.locator(".ga_greeting").count(), personalCount);
    await check("个人页按所选学生问候，来源筛选不会反复打招呼");

    await ask("查看彭媛2026年8月学情");
    await greeting().getByRole("button", { name: "查看该生学情", exact: true }).click();
    await page.waitForFunction(() => !document.querySelector(".ga_thinking"));
    const request = await page.evaluate(() => window.__presentation.requests.at(-1));
    assert.equal(request.page_command, true);
    assert.equal(request.page.data.student_id, new URL(page.url()).searchParams.get("student_id"));
    assert.ok(!request.page.data.sources.includes("考试记录"));
    assert.ok(request.history.every(m => !m.text.includes("来到资源平台了") && !m.text.includes("可以从画像建议入手")));
    assert.ok((await response().innerText()).includes(secondName.split(" ")[0]));
    await check("常用操作读取当前学生和最新筛选，问候不污染模型历史");

    await page.getByRole("tab", { name: "📊 班级学情" }).click(); await greet("班级学情");
    await menu("资源平台").click(); await greet("解释标签体系");
    assert.ok(await panel.locator(".ga_bubble--user").count() > 0);
    await page.getByRole("tab", { name: "知识图谱", exact: true }).click(); await greet("学科知识图谱");
    await page.getByRole("tab", { name: "公共题库", exact: true }).click(); await greet("解释标签体系");
    await greeting().getByRole("button", { name: "找「数学抽象」题", exact: true }).click();
    await page.waitForTimeout(400);
    assert.ok(await page.locator(".resource-search-container").innerText().then(t => t.includes("数学抽象")));
    await check("资源图谱与题库独立问候，找题快捷功能可执行");

    // Delay a new class suggestion read, leave the page, then release it.
    await page.evaluate(() => { window.__presentation.delaySuggestions = true; });
    await menu("学情分析").click();
    await page.locator(".analysis-class-select").click();
    await page.locator(".ant-select-item-option").last().click();
    await greet("班级学情");
    await menu("教学设计").click(); await greet("开始备课吧");
    await page.waitForTimeout(2100);
    assert.match(await greeting().innerText(), /开始备课吧/);
    assert.equal(await greeting().locator(".ga_suggestions").count(), 0);
    await page.evaluate(() => { window.__presentation.delaySuggestions = false; });
    await check("迟到的上一页建议不会覆盖新页面问候");

    await page.evaluate(() => { window.__presentation.delayChat = true; });
    await page.locator(".ga_input textarea").fill("查看彭媛2026年8月学情");
    await page.getByRole("button", { name: "发送消息", exact: true }).click();
    await menu("资源平台").click(); await greet("解释标签体系");
    await page.waitForFunction(() => !document.querySelector(".ga_thinking"));
    assert.match(await response().innerText(), /36 条/); assert.match(await response().innerText(), /回复于 教学设计/);
    await page.evaluate(() => { window.__presentation.delayChat = false; });
    await check("切页期间正在生成的回答保留原上下文");

    await ask("给彭媛生成3道二次根式练习");
    await ask("发布这份草稿，截止2099-09-20 20:00");
    const confirmation = panel.getByRole("button", { name: "确认发布", exact: true }).last();
    assert.equal(await confirmation.isDisabled(), false);
    await menu("教学设计").click(); await greet("开始备课吧");
    assert.equal(await confirmation.isDisabled(), false);
    await confirmation.click(); await page.waitForFunction(() => !document.querySelector(".ga_thinking"));
    assert.match(await response().innerText(), /发布回执/);
    await check("自动问候不使待确认作业失效，确认后仍返回回执");

    await page.evaluate(() => {
      document.activeElement?.blur();
      const host = document.createElement("div"); host.id = "scroll-fixture"; host.style.cssText = "position:fixed;left:220px;top:180px;width:300px;height:120px;overflow:auto";
      const child = document.createElement("div"); child.style.height = "1200px"; host.append(child); document.body.append(host); host.scrollTop = 100;
    });
    await page.waitForFunction(() => document.querySelector(".ga_panel--faded"));
    assert.equal(await panel.evaluate(el => getComputedStyle(el).pointerEvents), "none");
    await page.waitForFunction(() => !document.querySelector(".ga_panel--faded"));
    await page.evaluate(() => document.getElementById("scroll-fixture").remove());
    await page.locator(".ga_list").evaluate(el => { el.scrollTop = 0; }); await page.waitForTimeout(120);
    assert.equal(await page.locator(".ga_panel--faded").count(), 0);
    await page.locator(".ga_input textarea").focus();
    await page.evaluate(() => window.dispatchEvent(new Event("scroll"))); await page.waitForTimeout(120);
    assert.equal(await page.locator(".ga_panel--faded").count(), 0);
    await check("外部容器滚动虚化并恢复，内部滚动和输入不会虚化");

    const boxBeforePeek = await panel.boundingBox();
    await page.evaluate(box => {
      const b = document.createElement('button'); b.id = 'behind-chat'; b.textContent = '被浮窗覆盖的页面操作';
      b.style.cssText = `position:fixed;left:${box.x + 80}px;top:${box.y + 130}px;z-index:900`;
      b.onclick = () => { window.__clickedBehindChat = true; }; document.body.append(b);
    }, boxBeforePeek);
    await page.getByRole('button', { name: '让出页面', exact: true }).click();
    await page.locator('#behind-chat').click();
    assert.equal(await page.evaluate(() => window.__clickedBehindChat), true);
    assert.equal(await panel.count(), 1);
    await page.getByRole('button', { name: '恢复聊天显示', exact: true }).click();
    await page.evaluate(() => document.getElementById('behind-chat').remove());
    await check("让出页面模式保留聊天显示并允许操作下方按钮");

    const beforeBack = await page.locator(".ga_greeting").count();
    await page.goBack(); await greet("解释标签体系");
    assert.equal(await page.locator(".ga_greeting").count(), beforeBack + 1);
    await check("浏览器后退回到页面也追加对应问候");

    await page.getByRole("button", { name: "切换到右侧栏" }).click();
    await page.reload(); await panel.waitFor();
    assert.match(await panel.getAttribute("class"), /ga_panel--sidebar/);
    await page.screenshot({ path: path.join(output, "resource-sidebar.png") });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "切换到右下角" }).click();
    let box = await panel.boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= 390 && box.height < 600);
    await page.getByRole("button", { name: "切换到右侧栏" }).click();
    await page.getByRole("button", { name: "切换到右下角" }).focus(); await page.keyboard.press("Escape");
    assert.match(await panel.getAttribute("class"), /ga_panel--floating/);
    assert.ok(await page.locator(".ga_input textarea").isVisible());
    await page.screenshot({ path: path.join(output, "mobile-floating.png") });
    await check("记住位置偏好，移动端和键盘切换始终保留聊天入口");

    await page.getByRole("button", { name: "开始新对话" }).click(); await greet("解释标签体系");
    assert.equal(await page.locator(".ga_greeting").count(), 1);
    assert.equal(await page.locator(".ga_bubble--user").count(), 0);
    await check("新对话只重建当前页的一条问候");
    fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({ passed, errors }, null, 2));
  } catch (e) {
    await page.screenshot({ path: path.join(output, "failure.png") });
    fs.writeFileSync(path.join(output, "failure.txt"), e.stack + "\n" + await page.locator("body").innerText()); throw e;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
