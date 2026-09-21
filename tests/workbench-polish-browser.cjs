const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  chromium,
} = require("../.temp/browser-tools/node_modules/playwright-core");
const base = process.env.TEST_URL || "http://localhost:8000";
const output = path.resolve(__dirname, "../.temp/workbench-polish");
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.setDefaultTimeout(20000);
  await page.addInitScript(() => {
    window.__rich =
      '## 课堂任务\n\n**重点内容**\n\n- 推理过程\n- 书写结论\n\n| 条件 | 结论 |\n| --- | --- |\n| 直角三角形 | 勾股定理 |\n\n比较 $a<b$，验证 $a^2+b^2=c^2$。\n\n<p>兼容原有 HTML 段落</p><script>window.__unsafe=true</script><img onerror="window.__unsafe=true">';
    window.__unhandled = [];
    window.addEventListener("unhandledrejection", (e) =>
      window.__unhandled.push(String(e.reason)),
    );
    function wrap(fetcher) {
      return async (input, init) => {
        const url = String(input);
        if (url.includes("/web/exam/getExamDetail"))
          return new Response(
            JSON.stringify({
              code: 200,
              data: {
                id: "rich-text",
                name: "测试作业",
                paperName: "课堂练习",
                requirement: window.__rich,
                className: "八年级(3)班",
                questions: [
                  { qid: "rich-q", stem: window.__rich, cluster: "勾股定理" },
                ],
              },
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        const response = await fetcher(input, init);
        if (
          url.includes("/resource/materials") ||
          url.includes("/publicQuestion/findPublicQuestionPage")
        ) {
          const body = await response.clone().json();
          if (body.data?.items?.[0])
            body.data.items[0].preview = [
              { title: "教学内容", content: window.__rich },
            ];
          if (body.data?.records?.[0])
            body.data.records[0].stem = window.__rich;
          return new Response(JSON.stringify(body), {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          });
        }
        return response;
      };
    }
    let current = wrap(window.fetch.bind(window));
    Object.defineProperty(window, "fetch", {
      configurable: true,
      get: () => current,
      set: (fn) => {
        current = wrap(fn);
      },
    });
  });
  const shot = (name) =>
    page.screenshot({
      path: path.join(output, name + ".png"),
      animations: "disabled",
      style: ".ant-message { visibility: hidden !important; }",
    });
  const menu = (name) => page.getByRole("menuitem", { name, exact: true });
  const closeResources = async () => {
    await page.locator(".kg-resource-drawer .ant-drawer-close").click();
    await page.locator(".kg-resource-drawer").waitFor({ state: "hidden" });
  };
  const rich = async (locator) => {
    await locator.locator(".katex").first().waitFor();
    assert.ok(await locator.locator("h2").count());
    assert.ok(await locator.locator("strong").count());
    assert.ok(await locator.locator("table").count());
    assert.ok(await locator.locator("li").count());
    assert.match(await locator.textContent(), /兼容原有 HTML 段落/);
    assert.equal(await locator.locator("script, [onerror]").count(), 0);
    assert.equal(await page.evaluate(() => window.__unsafe), undefined);
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
    await page.getByRole("button", { name: "切换到右侧栏" }).click();
    await menu("首页").click();
    for (const width of [1440, 1920, 1100]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator(".wb_nav_card").last().waitFor();
      const outside = await page.locator(".wb_nav_card").evaluateAll((cards) =>
        cards.flatMap((card) => {
          const parent = card.getBoundingClientRect();
          return [...card.querySelectorAll(".wb_nav_sub, .wb_todo_item")]
            .filter((item) => {
              const r = item.getBoundingClientRect();
              return (
                r.bottom > parent.bottom ||
                r.right > parent.right ||
                r.left < parent.left
              );
            })
            .map((item) => item.textContent);
        }),
      );
      assert.deepEqual(outside, [], `Home actions fit at ${width}`);
    }
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.locator(".wb_nav_card").first().scrollIntoViewIfNeeded();
    await shot("home-actions");
    console.log("PASS home card buttons fit desktop and laptop widths");

    await menu("教学设计").click();
    await page.locator(".dialog-box").waitFor();
    const headingTop = (await page.locator(".right-wrapper-title").boundingBox()).y;
    assert.ok(headingTop >= 120 && headingTop < 200);
    assert.equal(await page.locator(".type-item-img").count(), 2);
    assert.equal(await page.locator(".type-item--reflect .reflection-icon").count(), 1);
    await page.locator(".dab_btn").filter({ hasText: "教学目标" }).click();
    await page.locator(".obj_item_main").first().click();
    await page.locator(".ant-drawer:visible .ant-drawer-close").click();
    await page.locator(".dab_inject").click();
    const request = page.getByRole("textbox", { name: "个性化诉求" });
    assert.match(await request.inputValue(), /已注入.*教学目标/);
    const firstInjection = await request.inputValue();
    await page.locator(".dab_inject").click();
    assert.equal(
      await request.inputValue(),
      firstInjection,
      "Repeated injection must update, not duplicate",
    );
    await shot("design-desktop");
    await page.getByRole("button", { name: "历史记录", exact: true }).click();
    await page.locator(".teach-design-left .list-item").first().waitFor();
    await page.locator(".teach-design-left .header button").click();
    await page.setViewportSize({ width: 1440, height: 960 });
    assert.equal(
      await page
        .locator(".teach-design-right")
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 2),
      true,
    );
    await shot("design-laptop");
    await page.setViewportSize({ width: 1100, height: 760 });
    const overlapping = await page.locator(".right-wrapper-type .type-item").evaluateAll((buttons) =>
      buttons.some((button) => {
        const icon = button.querySelector(".type-item-img, .reflection-icon").getBoundingClientRect();
        const label = button.querySelector(".type-item-label").getBoundingClientRect();
        const bounds = button.getBoundingClientRect();
        return icon.right > label.left + 1 || label.right > bounds.right + 1;
      }),
    );
    assert.equal(overlapping, false, "Each illustration stays paired with its own label");
    await shot("design-narrow");
    await page.getByRole("button", { name: "单元教学设计", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: "单元教学设计", exact: true }).getAttribute("aria-pressed"), "true");
    await page.getByRole("button", { name: "课时教学设计", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: "课时教学设计", exact: true }).getAttribute("aria-pressed"), "true");
    await page.getByRole("button", { name: "教学反思", exact: true }).click();
    await page.waitForURL("**/design/reflection");
    await page.setViewportSize({ width: 1440, height: 960 });
    console.log(
      "PASS design spacing, aligned illustrations, mode selection, reflection navigation and idempotent injection",
    );

    await page.goto(
      base + "/setTopic/homework?homeworkType=look&examId=rich-text",
    );
    await rich(page.locator(".exam_detail_view"));
    await shot("homework-rich-content");
    await page
      .getByRole("button", { name: "返回作业工作台", exact: true })
      .click();
    await page.getByRole("tab", { name: "作业下发", exact: true }).waitFor();
    assert.equal(
      await page
        .getByRole("tab", { name: "作业下发", exact: true })
        .getAttribute("aria-selected"),
      "true",
    );
    await page.getByRole("tab", { name: "作业组卷", exact: true }).click();
    await page.getByRole("tab", { name: "下发与回收", exact: true }).click();
    await page.goto(base + "/setTopic");
    await page
      .getByRole("button", { name: "返回作业工作台", exact: true })
      .click();
    await page.getByRole("tab", { name: "作业批改", exact: true }).waitFor();
    console.log("PASS homework return paths and Markdown/HTML/tables/formulas");

    await menu("资源平台").click();
    await page
      .getByRole("button", { name: "查看二次根式资源", exact: true })
      .click();
    await page
      .locator(".kg-resource-drawer .kg-question-item")
      .first()
      .waitFor();
    await rich(page.locator(".kg-question-item").first());
    await shot("graph-resource-drawer");
    await page
      .locator(".kg-question-item")
      .first()
      .getByRole("button", { name: "查看题目" })
      .click();
    await rich(page.locator(".kg_question_preview"));
    await page.locator(".ant-modal:visible .ant-modal-close").click();
    await page.locator(".kg_resource_panel .material-title").first().click();
    await rich(page.locator(".resource-preview"));
    await shot("material-markdown");
    await page.locator(".resource-preview .ant-modal-close").click();
    await closeResources();
    await page.getByRole("button", { name: "查看关联资源" }).click();
    await page
      .locator(".kg_resource_head h3")
      .getByText("二次根式", { exact: true })
      .waitFor();
    await closeResources();
    await page.locator(".kg_search input").fill("勾股定理");
    await page.locator(".kg_search input").press("Enter");
    await page.waitForFunction(() =>
      document
        .querySelector(".kg_resource_head h3")
        ?.textContent.includes("勾股定理"),
    );
    await closeResources();
    await shot("graph-full-width");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "让出页面", exact: true }).click();
    await page.getByRole("button", { name: "查看关联资源" }).click();
    const drawer = page.locator(".kg-resource-drawer");
    assert.equal(
      await drawer.evaluate((el) => el.scrollWidth <= el.clientWidth + 2),
      true,
    );
    await shot("graph-drawer-mobile");
    const noMatch = await page.evaluate(
      async () =>
        (
          await (
            await fetch("/api/web/publicQuestion/findPublicQuestionPage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                kg_list: ["__no_matching_node__"],
                knowledge_match: "exact",
              }),
            })
          ).json()
        ).data,
    );
    assert.equal(
      noMatch.total,
      0,
      "Unmatched graph nodes must not fall back to the entire question bank",
    );
    await closeResources();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base + "/design?from=analysis&class_id=cls-g8-03");
    await page
      .locator(".selection .chapter-select .ant-select-selector")
      .click();
    await page
      .locator(".ant-select-tree-title")
      .filter({ hasText: "16.1 二次根式" })
      .click();
    await page
      .locator(".selection .custom-cascader .ant-select-selector")
      .click();
    await page
      .locator(".ant-cascader-menu-item")
      .filter({ hasText: "新授课" })
      .click();
    await page.locator(".dab_btn").filter({ hasText: "教学目标" }).click();
    await page.locator(".obj_item_main").first().click();
    await page.locator(".ant-drawer:visible .ant-drawer-close").click();
    await page.locator(".dab_inject").click();
    await page.getByRole("button", { name: "生成教案", exact: true }).click();
    await page.getByRole("button", { name: "跳过引导，直接生成" }).click();
    await page.waitForURL("**/design/hour");
    console.log("PASS injected design continues into lesson generation");
    assert.deepEqual(errors, []);
    assert.deepEqual(await page.evaluate(() => window.__unhandled), []);
    console.log(
      "PASS resource drawer reopen/search, rich previews, mobile width and sanitized content",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
