const assert = require("node:assert/strict");
const fs = require("node:fs");
const {
  chromium,
} = require("../.temp/browser-tools/node_modules/playwright-core");
const base = "http://localhost:8000";
const out = ".temp/customer-ui";
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/assistant/model", (r) =>
    r.fulfill({ json: { code: 200, data: { available: false } } }),
  );
  const shot = (name) =>
    page.screenshot({
      path: out + "/" + name + ".png",
      animations: "disabled",
    });
  const clean = async () => {
    const lines = (await page.locator("body").innerText())
      .split("\n")
      .filter((line) =>
        /演示|合成数据|合成案例|示例数据|示例报告|示例课堂/.test(line),
      );
    assert.deepEqual(lines, [], page.url());
  };
  const ready = () => page.locator(".portrait-grid").waitFor();
  const analysis = (type, id, dates = "") =>
    base +
    "/learning-analysis?class_id=cls-g8-03&curriculum_scope_type=" +
    type +
    "&curriculum_scope_id=" +
    id +
    dates;
  try {
    await page.goto(base + "/login", { timeout: 120000 });
    await page.getByPlaceholder("请输入EID账号").fill("teacher");
    await page
      .getByPlaceholder("请输入密码", { exact: true })
      .fill("demo123456");
    await page.getByPlaceholder("请输入验证码").fill("1234");
    await page.getByRole("button", { name: "立即登录" }).click();
    await page.getByRole("menuitem", { name: "首页", exact: true }).waitFor();
    await page.getByRole("button", { name: "缩小小助手", exact: true }).click();
    await clean();
    await page.goto(analysis("all", ""));
    await ready();
    const allKnowledge = page.locator('[data-dimension="knowledge"]');
    const initialScore = await allKnowledge
      .locator(".portrait-score > b")
      .innerText();
    const names = new Set();
    for (;;) {
      const visible = await allKnowledge
        .locator(".portrait-metric-label")
        .allTextContents();
      assert.ok(visible.length <= 6 && visible.length > 0);
      visible.forEach((name) => names.add(name));
      assert.equal(
        await allKnowledge.locator(".portrait-score > b").innerText(),
        initialScore,
      );
      const next = allKnowledge.getByRole("button", { name: "下一组指标" });
      if (await next.isDisabled()) break;
      await next.click();
    }
    assert.ok(names.size >= 15, "all knowledge items remain accessible");
    await page.goto(analysis("all", ""));
    await ready();
    for (const width of [1920, 1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator(".portrait-grid").scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      await shot("all-chapters-" + width);
      const bounds = await allKnowledge.boundingBox();
      assert.ok(bounds.height < 740, `bounded all-chapter card at ${width}`);
      assert.equal(
        await allKnowledge.evaluate(
          (el) => el.scrollWidth > el.clientWidth + 1,
        ),
        false,
      );
      const ink = await allKnowledge
        .locator("canvas")
        .first()
        .evaluate((canvas) => {
          const pixels = canvas
            .getContext("2d")
            .getImageData(0, 0, canvas.width, canvas.height).data;
          let count = 0;
          for (let i = 0; i < pixels.length; i += 4)
            if (
              pixels[i + 3] > 0 &&
              (pixels[i] < 220 || pixels[i + 1] < 220 || pixels[i + 2] < 220)
            )
              count++;
          return count;
        });
      assert.ok(ink > 300, "radar has rendered visible pixels");
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByRole("button", { name: "课标依据", exact: true }).click();
    assert.equal(
      await page.locator(".portrait-competencies .ant-tag").count(),
      9,
    );
    assert.match(await page.getByRole("dialog").innerText(), /L139/);
    assert.match(
      await page.getByRole("dialog").innerText(),
      /不覆盖九项核心素养的完整测量/,
    );
    await page.locator(".ant-drawer-open .ant-drawer-close").click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page.goto(analysis("chapter", "demo-ch-pythagoras"));
    await ready();
    const knowledge = page.locator('[data-dimension="knowledge"]');
    assert.equal(
      await knowledge
        .locator(".is-metric-chart .portrait-metrics button")
        .count(),
      2,
    );
    assert.equal(await knowledge.locator(".portrait-chart-empty").count(), 0);
    assert.match(
      await knowledge.locator(".portrait-score > b").innerText(),
      /^\d+$/,
    );
    await clean();
    for (const width of [1920, 1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('[data-dimension="ability"] canvas').waitFor();
      await page.locator(".portrait-grid").scrollIntoViewIfNeeded();
      await shot("portraits-" + width);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
      );
      for (const dim of ["knowledge", "ability"]) {
        const card = page.locator('[data-dimension="' + dim + '"]');
        assert.equal(
          await card.evaluate((el) => el.scrollWidth > el.clientWidth + 1),
          false,
        );
        await card.screenshot({
          path: out + "/" + dim + "-" + width + ".png",
          animations: "disabled",
        });
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(analysis("section", "demo-sec-pythagoras-01"));
    await ready();
    assert.equal(
      await knowledge
        .locator(".is-metric-chart .portrait-metrics button")
        .count(),
      1,
    );
    await page.goto(
      analysis(
        "chapter",
        "demo-ch-pythagoras",
        "&start_date=2099-01-01&end_date=2099-01-07",
      ),
    );
    await ready();
    assert.equal(await knowledge.locator(".is-metric-chart").count(), 0);
    assert.equal(
      await knowledge.locator(".portrait-score > b").innerText(),
      "--",
    );
    await page.goto(
      base +
        "/design?mode=unit&from=analysis&class_id=cls-g8-03&unit_id=demo-unit-radical",
    );
    await page.getByRole("button", { name: /已带入学情依据/ }).waitFor();
    assert.equal(await page.locator(".td-workspace, .td-summary").count(), 0);
    const toolbar = await page.locator(".dab_bar").boundingBox();
    const editor = await page.locator(".dialog-box").boundingBox();
    assert.ok(
      toolbar.y > editor.y &&
        toolbar.y + toolbar.height < editor.y + editor.height,
      "compact assets toolbar belongs to the editor footer",
    );
    assert.equal(
      await page.getByRole("textbox", { name: "真实问题情境" }).isVisible(),
      false,
    );
    await shot("design-restored");
    await page.getByRole("button", { name: "查看与调整", exact: true }).click();
    await page.getByRole("tab", { name: "情境、任务与评价" }).click();
    await page
      .getByRole("textbox", { name: "真实问题情境" })
      .fill("比较校园花坛面积并估计边长。");
    await page.getByRole("button", { name: "完成调整", exact: true }).click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page.locator(".dab_btn").filter({ hasText: "教学目标" }).click();
    await page.locator(".obj_item_main").first().click();
    await page.locator(".ant-drawer-open .ant-drawer-close").click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page.locator(".dab_inject").click();
    assert.match(
      await page.getByRole("textbox", { name: "个性化诉求" }).inputValue(),
      /已注入.*教学目标/,
    );
    await clean();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(".design-editor").scrollIntoViewIfNeeded();
    await shot("design-mobile");
    assert.equal(
      await page
        .locator(".teach-design-right")
        .evaluate((el) => el.scrollWidth > el.clientWidth + 1),
      false,
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const [path, selector] of [
      ["/school-research", ".school-research"],
      ["/classroom-evaluation", ".ce-page-heading"],
      ["/source", ".resource-search"],
      ["/homework", ".homework"],
    ]) {
      await page.goto(base + path);
      await page.waitForLoadState("networkidle");
      await clean();
      await shot(path.slice(1));
    }
    assert.deepEqual(errors, []);
    console.log(
      "PASS 1/2/many/no-data portraits, responsive labels, original design layout, injection, six-module presentation and preserved review states",
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
