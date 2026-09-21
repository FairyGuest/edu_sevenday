const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE ||
    "../.temp/browser-tools/node_modules/playwright-core",
);
const base = process.env.TEST_URL || "http://127.0.0.1:4173";
const output = path.resolve(__dirname, "../.temp/classroom-evaluation");
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const screenshot = (name) =>
    page.screenshot({ path: path.join(output, name + ".png"), fullPage: true });
  const fits = async () => {
    const overflow = await page
      .locator(".classroom-evaluation")
      .evaluate((root) => {
        const bounds = root.getBoundingClientRect();
        return [
          ...root.querySelectorAll(
            ".ce-lesson, .ce-assistant, .ce-radar, .ce-report-main, .ce-filters, h1",
          ),
        ]
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return (
              rect.width &&
              (rect.right > bounds.right + 1 || rect.left < bounds.left - 1)
            );
          })
          .map((element) => element.className || element.tagName);
      });
    assert.deepEqual(overflow, [], "page elements fit available width");
  };
  const select = async (label, text) => {
    await page
      .locator(".ce-filters .ant-select")
      .filter({ has: page.getByRole("combobox", { name: label, exact: true }) })
      .click();
    await page
      .locator(".ant-select-dropdown:visible .ant-select-item-option-content")
      .getByText(text, { exact: true })
      .click();
  };
  const menu = (name) => page.getByRole("menuitem", { name, exact: true });
  try {
    await page.goto(base);
    await page.getByPlaceholder("请输入EID账号").fill("teacher");
    await page
      .getByPlaceholder("请输入密码", { exact: true })
      .fill("demo123456");
    await page.getByPlaceholder("请输入验证码").fill("1234");
    await page.getByRole("button", { name: "立即登录" }).click();
    await menu("首页").waitFor();
    const yieldButton = page.getByRole("button", {
      name: "让出页面",
      exact: true,
    });
    if (await yieldButton.isVisible()) await yieldButton.click();
    await menu("首页").click();
    await page.locator(".wb_nav_card").first().waitFor();
    assert.equal(await page.locator(".wb_hero_card, .wb_nav_card").count(), 6);
    const labels = await page
      .locator(".main-sider-menu .ant-menu-item")
      .allTextContents();
    assert.equal(labels.indexOf("课堂评价"), labels.indexOf("资源平台") - 1);
    await screenshot("home-desktop");
    await page
      .locator(".wb_nav_card")
      .filter({
        has: page.locator(".wb_nav_card_title", { hasText: "课堂评价" }),
      })
      .click();
    await page.locator(".ce-lesson").first().waitFor();
    assert.equal(await page.locator(".ce-lesson").count(), 6);
    assert.equal(await page.locator(".ga_panel").isVisible(), false);
    await fits();
    await screenshot("list-desktop");
    console.log(
      "PASS six home modules and evaluation navigation before resources",
    );

    await page
      .getByRole("button", { name: "收藏课堂", exact: true })
      .first()
      .click();
    await page.getByRole("tab", { name: "我的收藏（1）" }).click();
    assert.equal(await page.locator(".ce-lesson").count(), 1);
    await page.reload();
    await page.locator(".ce-lesson").first().waitFor();
    assert.equal(await page.locator(".ce-lesson").count(), 1);
    await page.getByRole("tab", { name: "全部课堂（6）" }).click();
    await page.getByRole("textbox", { name: "搜索课堂" }).fill("不存在的课堂");
    await page.getByText("没有匹配的课堂", { exact: true }).waitFor();
    await page.getByRole("button", { name: "重置课堂筛选" }).click();
    await select("评价学科", "物理");
    assert.equal(await page.locator(".ce-lesson").count(), 1);
    await page.getByRole("button", { name: "重置课堂筛选" }).click();
    await select("评价年级", "七年级");
    assert.equal(await page.locator(".ce-lesson").count(), 2);
    await page.getByRole("button", { name: "重置课堂筛选" }).click();
    await select("课堂排序", "评分优先");
    assert.equal(
      await page.locator(".ce-lesson-title").first().textContent(),
      "力的作用效果",
    );
    await page.getByRole("button", { name: "重置课堂筛选" }).click();
    console.log(
      "PASS favorites persist, empty state, subject/grade filters and sorting",
    );

    await page
      .getByRole("button", { name: "勾股定理：从面积到证明", exact: true })
      .click();
    await page.locator(".ce-radar canvas").waitFor();
    assert.equal(
      await page.locator(".ce-report-metrics strong").first().textContent(),
      "88 / 100",
    );
    const colored = await page
      .locator(".ce-radar canvas")
      .evaluate((canvas) => {
        const data = canvas
          .getContext("2d")
          .getImageData(0, 0, canvas.width, canvas.height).data;
        let count = 0;
        for (let i = 0; i < data.length; i += 4)
          if (data[i + 3] && data[i + 2] - data[i] > 25) count++;
        return count;
      });
    assert.ok(colored > 100, "radar contains plotted data");
    await fits();
    await screenshot("report-desktop");
    await page.getByRole("tab", { name: "课堂对话", exact: true }).click();
    assert.equal(await page.locator(".ce-dialogue").count(), 4);
    await page.getByRole("button", { name: "15:40", exact: true }).click();
    assert.match(
      await page.locator(".ce-stage-detail").textContent(),
      /拼图探究/,
    );
    await page.getByRole("button", { name: /36:00.*总结反馈/ }).click();
    assert.match(
      await page.locator(".ce-assistant-context").textContent(),
      /36:00.*总结反馈/,
    );
    await page
      .getByRole("button", { name: "这节课可以怎样改进？", exact: true })
      .click();
    await page
      .locator(".ce-chat-message--assistant")
      .last()
      .getByText(/离堂反馈单/)
      .waitFor();
    await page
      .getByRole("textbox", { name: "评课问题", exact: true })
      .fill("学生参与情况如何？");
    await page.getByRole("button", { name: "发送评课问题" }).click();
    await page
      .locator(".ce-chat-message--assistant")
      .last()
      .getByText(/85%/)
      .waitFor();
    await page.getByRole("tab", { name: "课堂提问", exact: true }).click();
    assert.match(
      await page.locator(".ce-question-summary").textContent(),
      /38%/,
    );
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "导出报告", exact: true }).click();
    const download = await downloadPromise;
    const downloadedText = fs.readFileSync(await download.path(), "utf8");
    assert.match(downloadedText, /本报告为演示数据/);
    assert.match(downloadedText, /综合评分：88/);
    assert.match(downloadedText, /如果不是直角三角形/);
    console.log(
      "PASS report chart, evidence tabs, contextual demo assistant and export",
    );

    await page.getByRole("tab", { name: "评价报告", exact: true }).click();
    await page.setViewportSize({ width: 1024, height: 900 });
    await fits();
    await screenshot("report-tablet");
    await page.setViewportSize({ width: 390, height: 844 });
    await fits();
    await screenshot("report-mobile");
    await page.locator(".ce-assistant").scrollIntoViewIfNeeded();
    await screenshot("assistant-mobile");
    await page
      .getByRole("button", { name: "返回课堂列表", exact: true })
      .click();
    await fits();
    await screenshot("list-mobile");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base + "/classroom-evaluation?lesson=missing");
    await page.getByText("未找到这节课堂", { exact: true }).waitFor();
    await page
      .getByRole("button", { name: "返回课堂列表", exact: true })
      .click();
    assert.equal(await page.locator(".ce-lesson").count(), 6);
    await page
      .getByRole("button", { name: "勾股定理：从面积到证明", exact: true })
      .click();
    await page.goBack();
    await page.locator(".ce-lesson").first().waitFor();
    assert.deepEqual(errors, []);
    console.log(
      "PASS desktop/tablet/mobile layout, invalid report recovery and browser history",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
