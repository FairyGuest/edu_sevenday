const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE ||
    "../.temp/browser-tools/node_modules/playwright-core",
);
const root = path.resolve(__dirname, "..");
const materials = require("../mock/teacher/data/resources.json").items;
const materialCount = (node, type) =>
  materials.filter(
    (item) =>
      (!node || item.knowledge_ids.includes(node)) &&
      (!type || item.type === type),
  ).length;
const base = process.env.TEST_URL || "http://localhost:8000";
const output = path.join(root, ".temp/resource-workbench");
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    window.__unhandled = [];
    window.addEventListener("unhandledrejection", (e) =>
      window.__unhandled.push(String(e.reason)),
    );
  });
  page.setDefaultTimeout(25000);
  const screenshot = (name) =>
    page.screenshot({
      path: path.join(output, name + ".png"),
      animations: "disabled",
    });
  const menu = (name) => page.getByRole("menuitem", { name, exact: true });
  const closeResources = async () => {
    if (await page.locator(".kg-resource-drawer").isVisible()) {
      await page.locator(".kg-resource-drawer .ant-drawer-close").click();
      await page.locator(".kg-resource-drawer").waitFor({ state: "hidden" });
    }
  };
  const mode = async (name) => {
    await closeResources();
    await page
      .locator(".resource-mode-header .ant-segmented-item")
      .filter({ hasText: name })
      .click();
  };
  const resourceType = (name) =>
    page
      .locator(".kg_resource_panel .ant-segmented-item")
      .getByText(name, { exact: true })
      .click();
  const assertFits = async (selector) => {
    assert.equal(
      await page
        .locator(selector)
        .evaluate((element) => element.scrollWidth <= element.clientWidth + 2),
      true,
      selector + " must not overflow horizontally",
    );
  };
  try {
    await page.goto(base);
    await page.getByPlaceholder("请输入EID账号").fill("teacher");
    await page
      .getByPlaceholder("请输入密码", { exact: true })
      .fill("demo123456");
    await page.getByPlaceholder("请输入验证码").fill("1234");
    await page.getByRole("button", { name: "立即登录" }).click();
    await menu("首页").waitFor();
    await page
      .getByRole("button", { name: "切换到右侧栏", exact: true })
      .click();
    await menu("首页").click();
    await page.locator(".wb_todos--expanded").first().waitFor();
    assert.equal(await page.locator(".wb_nav_card, .wb_hero_card").count(), 6);
    for (const card of await page.locator(".wb_nav_card").all())
      assert.ok((await card.locator(".wb_todo_item").count()) >= 2);
    await screenshot("home-actions");
    console.log(
      "PASS six home modules and four populated todo/suggestion lists",
    );

    await menu("资源平台").click();
    await page.locator(".kg-node").first().waitFor();
    await page
      .getByRole("button", { name: "查看二次根式资源", exact: true })
      .click();
    await page.waitForFunction(() =>
      document
        .querySelector(".kg_match_summary")
        ?.textContent.includes("匹配完成"),
    );
    assert.equal(
      await page.locator(".kg_resource_panel .material-item").count(),
      materialCount("二次根式"),
    );
    await resourceType("课件");
    assert.equal(
      await page.locator(".kg_resource_panel .material-item").count(),
      materialCount("二次根式", "courseware"),
    );
    assert.match(
      await page.locator(".kg_filter_path").textContent(),
      new RegExp(materialCount("二次根式", "courseware") + " 条相关资源"),
    );
    await page.locator(".kg_resource_panel .material-title").first().click();
    await page
      .locator(".resource-preview")
      .getByText("当前仅提供内容预览，尚未附加资源文件。")
      .waitFor();
    assert.equal(
      await page.locator(".resource-preview").getByRole("link").count(),
      0,
    );
    await page.locator(".resource-preview .ant-modal-close").click();
    await page.locator(".resource-preview").waitFor({ state: "hidden" });
    await screenshot("graph-resource-filter");

    await mode("传统标签筛选");
    await page.getByRole("tab", { name: "课件", exact: true }).click();
    await page.locator(".material-library .material-item").first().waitFor();
    assert.equal(
      await page.locator(".material-library .material-item").count(),
      materialCount("二次根式", "courseware"),
    );
    assert.match(
      await page.locator(".resource-selection").textContent(),
      /二次根式/,
    );
    await page
      .getByRole("textbox", { name: "搜索教学资源" })
      .fill("不存在的课件");
    await page.getByText("没有匹配的资源", { exact: true }).waitFor();
    await page
      .getByRole("button", { name: "重置资源标签", exact: true })
      .click();
    assert.equal(
      await page.locator(".material-library .material-item").count(),
      materialCount(null, "courseware"),
    );
    await screenshot("traditional-resource-filter");
    await mode("知识图谱筛选");
    await page.waitForFunction(() =>
      document
        .querySelector(".kg_match_summary")
        ?.textContent.includes("匹配完成"),
    );
    assert.equal(
      await page.locator(".kg_resource_panel .material-item").count(),
      materialCount("二次根式", "courseware"),
    );
    await closeResources();
    await page.locator(".kg_search input").fill("勾股定理");
    await page.locator(".kg_search input").press("Enter");
    await page.waitForFunction(() =>
      document
        .querySelector(".kg_resource_head h3")
        ?.textContent.includes("勾股定理"),
    );
    await page.waitForFunction(() =>
      document
        .querySelector(".kg_match_summary")
        ?.textContent.includes("匹配完成"),
    );
    assert.equal(
      await page.locator(".kg_resource_panel .material-item").count(),
      materialCount("勾股定理", "courseware"),
    );
    assert.doesNotMatch(
      await page.locator(".kg_resource_panel .material-items").textContent(),
      /二次根式/,
    );
    console.log(
      "PASS graph search, exact node associations, counts, resource previews and mode switching",
    );

    const aggregate = await page.evaluate(async () => {
      const response = await fetch("/api/teacher/portraits?class_id=cls-g8-03");
      const body = await response.json();
      return body.data.pipeline;
    });
    assert.ok(aggregate?.source_breakdown);
    for (const [source, data] of Object.entries(aggregate.source_breakdown)) {
      assert.ok(
        data.l1_evidence.sample.every((item) => item.source_name === source),
      );
      for (const metric of data.l2_observation.metrics)
        assert.equal(
          metric.value,
          metric.possible
            ? Math.round((100 * metric.earned) / metric.possible)
            : null,
        );
    }
    await closeResources();
    await menu("学情分析").click();
    await page.locator(".pf_source_tab").first().waitFor();
    const names = ["作业记录", "考试记录", "课堂互动", "人机交互", "自主练习"];
    for (const name of names) {
      await page.locator(".pf_source_tab").filter({ hasText: name }).click();
      assert.match(
        await page.locator(".pf_source_evidence h4").first().textContent(),
        new RegExp(name),
      );
      assert.equal(
        await page.locator(".pf_source_tab[aria-pressed=true]").count(),
        1,
      );
    }
    await page
      .locator(".pf_source_tab")
      .filter({ hasText: "作业记录" })
      .click();
    await page.locator(".pf_wrap").scrollIntoViewIfNeeded();
    await assertFits(".pf_wrap");
    await screenshot("source-process-desktop");
    console.log(
      "PASS source-specific evidence and reproducible metric aggregation",
    );

    execFileSync(process.execPath, ["scripts/prepare-demo-mock.js"], {
      cwd: root,
    });
    await page.reload();
    await page.locator(".pf_source_tab").first().waitFor();
    assert.deepEqual(await page.evaluate(() => window.__unhandled), []);
    assert.deepEqual(errors, []);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "让出页面", exact: true }).click();
    await page.locator(".pf_wrap").scrollIntoViewIfNeeded();
    await assertFits(".pf_wrap");
    await screenshot("source-process-mobile");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page
      .getByRole("button", { name: "恢复聊天显示", exact: true })
      .click();
    await menu("资源平台").click();
    await page.locator(".kg_filter_path").waitFor();
    await assertFits(".kg_filter_path");
    await page.locator(".kg-node").first().waitFor();
    const labelLayout = await page.locator(".kg_svg").evaluate((svg) => {
      const labels = [...svg.querySelectorAll(".kg_label")]
        .filter((label) => getComputedStyle(label).display !== "none")
        .map((label) => label.getBoundingClientRect());
      const overlaps = labels.some((a, i) =>
        labels
          .slice(i + 1)
          .some(
            (b) =>
              a.left < b.right &&
              a.right > b.left &&
              a.top < b.bottom &&
              a.bottom > b.top,
          ),
      );
      return { count: labels.length, overlaps };
    });
    assert.ok(labelLayout.count > 0);
    assert.equal(
      labelLayout.overlaps,
      false,
      "catalog labels must not overlap",
    );
    await page.mouse.move(260, 90);
    await screenshot("graph-filter-laptop");
    assert.deepEqual(errors, []);
    console.log(
      "PASS safe mock regeneration with active browser, refresh and responsive layouts",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
