const assert = require("node:assert/strict");
const {
  chromium,
} = require("../.temp/browser-tools/node_modules/playwright-core");
const base = process.env.TEST_URL || "http://localhost:8000";
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/assistant/model", (route) =>
    route.fulfill({ json: { code: 200, data: { available: false } } }),
  );
  try {
    await page.goto(base + "/login");
    await page.getByPlaceholder("请输入EID账号").fill("teacher");
    await page
      .getByPlaceholder("请输入密码", { exact: true })
      .fill("demo123456");
    await page.getByPlaceholder("请输入验证码").fill("1234");
    await page.getByRole("button", { name: "立即登录" }).click();
    await page.waitForURL((url) => !url.pathname.includes("login"));
    await page.goto(
      base +
        "/design?mode=lesson&from=analysis&class_id=cls-g8-03&curriculum_scope_type=section&curriculum_scope_id=demo-sec-radical-01",
    );
    await page.getByRole("button", { name: /已带入学情依据/ }).waitFor();
    await page.getByRole("button", { name: "缩小小助手", exact: true }).click();
    await page.evaluate(() => {
      window.__designRequests = [];
      const original = window.fetch.bind(window);
      window.fetch = (input, init) => {
        if (String(input).includes("/teach_plan/teach_maker") && init?.body)
          window.__designRequests.push(JSON.parse(init.body));
        return original(input, init);
      };
    });
    await page.locator(".selection .chapter-select").click();
    await page
      .locator(".ant-select-dropdown:visible .ant-select-tree-title")
      .filter({ hasText: "16.1 二次根式" })
      .first()
      .click();
    await page.locator(".selection .custom-cascader").click();
    await page
      .locator(".ant-cascader-dropdown:visible")
      .getByText("新授课", { exact: true })
      .click();
    const situation = "校园花坛面积18平方米，估算边长并说明依据。";
    await page.getByRole("button", { name: "查看与调整", exact: true }).click();
    await page.getByRole("tab", { name: "情境、任务与评价" }).click();
    for (const [group, label, value] of [
      ["情境设计", "真实问题情境", situation],
      ["学习任务", "任务与预期产出", "比较估算与化简两种方法，提交完整步骤。"],
      [
        "评价设计",
        "评价证据与达成条件",
        "检查估算范围与化简依据，不以答案代替推理证据。",
      ],
    ]) {
      await page.getByRole("textbox", { name: label, exact: true }).fill(value);
    }
    await page.getByRole("button", { name: "完成调整", exact: true }).click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page.getByRole("button", { name: "生成教案", exact: true }).click();
    await page.getByRole("button", { name: "跳过引导，直接生成" }).click();
    await page.waitForURL("**/design/hour");
    await page.waitForFunction(() => window.__designRequests.length > 0);
    const request = await page.evaluate(() => window.__designRequests[0]);
    assert.equal(request.type, 1);
    assert.equal(request.design_context.situation, situation);
    assert.equal(
      request.design_context.learning.effective_scope.curriculum_scope_id,
      "demo-sec-radical-01",
    );
    assert.ok(request.user_require.includes(situation));
    assert.ok(request.motivation_habit.includes("不由成绩推断"));
    await page
      .locator(".create-content")
      .filter({ hasText: situation })
      .first()
      .waitFor({ timeout: 60000 });
    await page.screenshot({
      path: ".temp/teaching-support-browser/generated-context.png",
      animations: "disabled",
    });
    assert.deepEqual(errors, []);
    console.log(
      "PASS real design generation: original lesson flow, scoped learning, situation-task-assessment payload and generated Markdown",
    );
  } catch (e) {
    await page.screenshot({
      path: ".temp/teaching-support-browser/generation-failure.png",
    });
    console.error("URL", page.url(), errors);
    throw e;
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
