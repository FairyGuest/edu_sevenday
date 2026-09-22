const assert = require("node:assert/strict");
const fs = require("node:fs");
const {
  chromium,
} = require("../.temp/browser-tools/node_modules/playwright-core");
const out = ".temp/design-polish";
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(30000);
  const errors = [];
  let requests = 0;
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/assistant/model", async (route) => {
    requests++;
    await route.fulfill({
      json: {
        code: 200,
        data: {
          available: true,
          answer: JSON.stringify({
            situation: "比较两种花坛布局，结合面积数据判断边长。",
            task: "计算与解释两种方案，提交包含依据的解答。",
            assessment: "核对化简步骤和解释，保留待核对项。",
          }),
        },
      },
    });
  });
  const shot = (name) =>
    page.screenshot({ path: `${out}/${name}.png`, animations: "disabled" });
  const closeDrawer = async () => {
    await page.locator(".ant-drawer-open .ant-drawer-close").click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
  };
  try {
    await page.goto("http://localhost:8000/login", { timeout: 120000 });
    await page
      .getByPlaceholder("请输入EID账号")
      .fill("teacher", { timeout: 120000 });
    await page
      .getByPlaceholder("请输入密码", { exact: true })
      .fill("demo123456");
    await page.getByPlaceholder("请输入验证码").fill("1234");
    await page.getByRole("button", { name: "立即登录" }).click();
    await page.getByRole("menuitem", { name: "首页", exact: true }).waitFor();
    await page.locator(".ga_input textarea").fill("保留这条未发送的备课问题");
    await page.getByRole("button", { name: "缩小小助手", exact: true }).click();
    assert.equal(await page.locator(".ga_panel").isVisible(), false);
    await page.getByRole("menuitem", { name: "教学设计", exact: true }).click();
    await page.getByRole("button", { name: "展开小助手", exact: true }).click();
    assert.equal(
      await page.locator(".ga_input textarea").inputValue(),
      "保留这条未发送的备课问题",
    );
    await page
      .getByRole("button", { name: "切换到右侧栏", exact: true })
      .click();
    await page.getByRole("button", { name: "缩小小助手", exact: true }).click();
    assert.equal(
      await page
        .locator(".ga_workspace")
        .evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
        ),
      1,
    );
    await page.goto(
      "http://localhost:8000/design?mode=unit&from=analysis&class_id=cls-g8-03&unit_id=demo-unit-radical",
    );
    await page
      .getByRole("button", { name: "展开小助手", exact: true })
      .waitFor();
    await page.getByRole("button", { name: /已带入学情依据/ }).waitFor();
    assert.equal(await page.locator(".td-workspace, .td-summary").count(), 0);
    const main = await page.locator(".dialog-box").boundingBox();
    const toolbar = await page.locator(".dab_bar").boundingBox();
    assert.ok(
      toolbar.y > main.y && toolbar.y + toolbar.height < main.y + main.height,
    );
    await shot("design-desktop");
    await page.getByRole("button", { name: "查看与调整", exact: true }).click();
    await page.getByRole("tab", { name: "情境、任务与评价" }).click();
    const field = page.getByRole("textbox", {
      name: "真实问题情境",
      exact: true,
    });
    await page.waitForFunction(() =>
      document
        .querySelector('[aria-label="真实问题情境"]')
        ?.value.startsWith("比较两种"),
    );
    assert.ok(requests > 0);
    await field.fill("教师确定：比较校园花坛面积并估算边长。");
    const selectUnit = async (label) => {
      await page.locator(".ts-form-grid .ant-select-selector").first().click();
      await page
        .locator(".ant-select-dropdown:visible .ant-select-item-option")
        .filter({ hasText: label })
        .click();
      await page.waitForFunction(
        (name) =>
          document
            .querySelector('[aria-label="知识与前置基础"]')
            ?.value.includes(name),
        label,
      );
    };
    await selectUnit("一次函数方案选择单元");
    assert.ok(!(await field.inputValue()).includes("教师确定"));
    await selectUnit("二次根式单元");
    assert.match(await field.inputValue(), /教师确定/);
    await page.getByRole("button", { name: "完成调整", exact: true }).click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page.locator(".dab_btn").filter({ hasText: "教学目标" }).click();
    await page.locator(".obj_item_main").first().click();
    await closeDrawer();
    await page.locator(".dab_inject").click();
    const injected = await page
      .getByRole("textbox", { name: "个性化诉求" })
      .inputValue();
    assert.match(injected, /已注入.*教学目标/);
    await page.locator(".dab_inject").click();
    assert.equal(
      await page.getByRole("textbox", { name: "个性化诉求" }).inputValue(),
      injected,
    );
    await page.getByRole("button", { name: "移除注入", exact: true }).click();
    assert.equal(
      await page.getByRole("textbox", { name: "个性化诉求" }).inputValue(),
      "",
    );
    await page.locator(".dab_inject").click();
    for (const width of [1100, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator(".ts-design-context").scrollIntoViewIfNeeded();
      if (width === 390) {
        const context = await page.locator(".ts-design-context").boundingBox();
        const editor = await page.locator(".design-editor").boundingBox();
        assert.ok(
          editor.y >= context.y + context.height - 1,
          "mobile editor stacks below context",
        );
        assert.ok(
          editor.width >= 250,
          "mobile editor cannot collapse to a narrow text strip",
        );
        await page.locator(".design-editor").scrollIntoViewIfNeeded();
      }
      assert.equal(
        await page
          .locator(".teach-design-right")
          .evaluate((el) => el.scrollWidth > el.clientWidth + 1),
        false,
        `no overflow at ${width}`,
      );
      await shot(`design-${width}`);
    }
    await page.getByRole("button", { name: "展开小助手", exact: true }).click();
    await shot("assistant-mobile");
    assert.equal(
      await page
        .locator(".ga_header")
        .evaluate((el) => el.scrollWidth > el.clientWidth + 1),
      false,
    );
    const assistantBounds = await page.locator(".ga_panel").boundingBox();
    assert.ok(
      assistantBounds.x >= 0 &&
        assistantBounds.x + assistantBounds.width <= 390,
      "restored assistant stays inside the mobile viewport",
    );
    await page.getByRole("button", { name: "缩小小助手", exact: true }).click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(
      "http://localhost:8000/learning-analysis?class_id=cls-g8-03",
    );
    await page.locator(".portrait-grid").waitFor();
    await page.getByRole("button", { name: "近7天", exact: true }).click();
    const date = new URL(page.url()).searchParams.get("start_date");
    await page
      .getByRole("combobox", { name: "章节筛选", exact: true })
      .fill("二次根式");
    await page
      .locator(".ant-select-dropdown:visible .ant-select-tree-title")
      .filter({ hasText: /^第16章 二次根式$/ })
      .click();
    await page.locator(".portrait-grid").waitFor();
    assert.equal(new URL(page.url()).searchParams.get("start_date"), date);
    await shot("analysis-filters");
    await page.setViewportSize({ width: 390, height: 844 });
    await shot("analysis-mobile");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS restored compact design, scoped teacher edits, idempotent injection, assistant minimize/restore/persistence, filters and responsive layout",
    );
  } catch (e) {
    await shot("failure");
    throw e;
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
