const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  chromium,
} = require("../.temp/browser-tools/node_modules/playwright-core");
const out = path.resolve(__dirname, "../.temp/portrait-restoration");
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.setDefaultTimeout(30000);
  const params = () => new URL(page.url()).searchParams;
  const ready = () => page.locator(".portrait-grid").waitFor();
  const choose = async (title) => {
    await page
      .getByRole("combobox", { name: "课程范围", exact: true })
      .locator('xpath=ancestor::div[contains(@class,"ant-select-selector")]')
      .click();
    await page
      .locator(".ant-select-dropdown:visible .ant-select-tree-title")
      .filter({ hasText: title })
      .click();
    await ready();
  };
  try {
    await page.goto("http://localhost:8000/login", { timeout: 120000 });
    await page
      .getByPlaceholder("请输入EID账号")
      .fill("teacher", { timeout: 180000 });
    await page
      .getByPlaceholder("请输入密码", { exact: true })
      .fill("demo123456");
    await page.getByPlaceholder("请输入验证码").fill("1234");
    await page.getByRole("button", { name: "立即登录" }).click();
    await page.waitForURL((u) => !u.pathname.includes("login"));
    await page.goto(
      "http://localhost:8000/learning-analysis?class_id=cls-g8-03",
      { timeout: 120000 },
    );
    await ready();
    if (
      await page.getByRole("button", { name: "让出页面", exact: true }).count()
    )
      await page.getByRole("button", { name: "让出页面", exact: true }).click();
    assert.equal(await page.locator(".portrait-dimension").count(), 4);
    assert.equal(
      await page
        .locator('[data-testid="radar-literacy"] [data-axis-count]')
        .getAttribute("data-axis-count"),
      "9",
    );
    assert.notEqual(
      await page
        .locator('[data-testid="radar-ability"] [data-axis-count]')
        .getAttribute("data-axis-count"),
      "6",
    );
    await page.locator('[data-testid="radar-literacy"] canvas').waitFor();
    const painted = await page
      .locator('[data-testid="radar-literacy"] canvas')
      .evaluate((canvas) => {
        const pixels = canvas
          .getContext("2d")
          .getImageData(0, 0, canvas.width, canvas.height).data;
        let ink = 0;
        for (let i = 0; i < pixels.length; i += 4)
          if (
            pixels[i + 3] > 0 &&
            pixels[i] + pixels[i + 1] + pixels[i + 2] < 650
          )
            ink++;
        return ink;
      });
    assert.ok(painted > 100, "radar canvas contains plotted pixels");
    await page.screenshot({
      path: path.join(out, "desktop.png"),
      fullPage: true,
    });
    await page.locator('[data-dimension="literacy"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, "radars.png") });
    await page.getByRole("button", { name: "近1个月", exact: true }).click();
    await page.waitForURL((u) => u.searchParams.has("start_date"));
    await ready();
    const start = params().get("start_date");
    assert.equal(params().has("curriculum_scope_type"), false);
    await choose(/^第16章 二次根式$/);
    await page.waitForURL(
      (u) => u.searchParams.get("curriculum_scope_type") === "chapter",
    );
    await ready();
    assert.equal(params().get("start_date"), start);
    await page
      .getByTestId("portrait-curriculum-scope")
      .locator(".ant-tag-close-icon")
      .click();
    await page.waitForURL((u) => !u.searchParams.has("curriculum_scope_type"));
    await ready();
    assert.equal(params().get("start_date"), start);
    await choose(/^16.1 /);
    await page.waitForURL(
      (u) => u.searchParams.get("curriculum_scope_type") === "section",
    );
    await ready();
    await page
      .getByTestId("portrait-date-scope")
      .locator(".ant-tag-close-icon")
      .click();
    await page.waitForURL((u) => !u.searchParams.has("start_date"));
    await ready();
    assert.equal(params().get("curriculum_scope_type"), "section");
    await page.reload();
    await ready();
    assert.equal(params().has("start_date"), false);
    assert.equal(params().get("curriculum_scope_type"), "section");
    await page
      .getByRole("button", { name: "重置学情筛选", exact: true })
      .click();
    await page.waitForURL((u) => !u.searchParams.has("curriculum_scope_type"));
    await ready();
    await page
      .locator(".scoped-portrait-distribution")
      .getByText("知识图谱", { exact: true })
      .click();
    await page.locator(".evidence-canvas .kg_svg").waitFor();
    const nodes = await page.locator(".kg-node").count();
    assert.ok(nodes > 0);
    await page.getByText("关联子图", { exact: true }).click();
    await page.waitForTimeout(500);
    assert.ok((await page.locator(".kg-node").count()) <= nodes);
    await page.screenshot({
      path: path.join(out, "subgraph.png"),
      fullPage: true,
    });
    await page
      .getByRole("tab", { name: /知识图谱/ })
      .first()
      .click();
    await page.locator(".evidence-canvas .kg_svg").waitFor();
    await page.getByRole("tab", { name: /个人学情/ }).click();
    await ready();
    await page
      .getByRole("combobox", { name: "学情学生", exact: true })
      .waitFor();
    await page.getByRole("tab", { name: /班级学情/ }).click();
    await ready();
    await page.setViewportSize({ width: 390, height: 844 });
    if (
      await page.getByRole("button", { name: "让出页面", exact: true }).count()
    )
      await page.getByRole("button", { name: "让出页面", exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    assert.equal(overflow, false, "mobile has no horizontal overflow");
    await page.screenshot({
      path: path.join(out, "mobile.png"),
      fullPage: true,
    });
    await page.locator('[data-dimension="literacy"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(out, "mobile-radar.png") });
    assert.deepEqual(errors, []);
    console.log(
      "PASS browser: original portrait layout, dynamic radar canvases, date-only/chapter-only/intersection/independent clearing/refresh, distribution and subgraph, personal, mobile",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
