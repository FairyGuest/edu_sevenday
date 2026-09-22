const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  chromium,
} = require("../.temp/browser-tools/node_modules/playwright-core");
const base = process.env.TEST_URL || "http://localhost:8000";
const out = path.resolve(__dirname, "../.temp/teaching-support-browser");
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const shot = (name) =>
    page.screenshot({
      path: path.join(out, name + ".png"),
      animations: "disabled",
    });
  const go = async (route) => {
    await page.goto(base + route, { timeout: 120000 });
    await page.getByRole("menuitem").first().waitFor();
  };
  const openSelect = async (label) =>
    page
      .getByRole("combobox", { name: label, exact: true })
      .locator('xpath=ancestor::div[contains(@class,"ant-select-selector")]')
      .click();
  const option = async (label, text) => {
    await openSelect(label);
    await page
      .locator(".ant-select-dropdown:visible .ant-select-item-option")
      .filter({ hasText: text })
      .first()
      .click();
  };
  try {
    await page.goto(base + "/login", { timeout: 120000 });
    await page
      .getByPlaceholder("请输入EID账号")
      .fill("teacher", { timeout: 180000 });
    await page
      .getByPlaceholder("请输入密码", { exact: true })
      .fill("demo123456");
    await page.getByPlaceholder("请输入验证码").fill("1234");
    await page.getByRole("button", { name: "立即登录" }).click();
    await page.waitForURL((url) => !url.pathname.includes("login"));
    await go("/learning-analysis?class_id=cls-g8-03");
    if (await page.getByRole("button", { name: "切换到右侧栏" }).count())
      await page.getByRole("button", { name: "切换到右侧栏" }).click();
    await page.locator('[data-dimension="literacy"] .portrait-metrics button').first().waitFor();
    assert.equal(await page.locator('[data-dimension="literacy"] .portrait-metrics button').count(), 9);
    await page.locator(".ts-pipeline b").first().waitFor();
    const all = Number(
      await page.locator(".ts-pipeline b").first().innerText(),
    );
    await openSelect("课程范围");
    await page
      .locator(".ant-select-dropdown:visible .ant-select-tree-title")
      .filter({ hasText: /^第16章 二次根式$/ })
      .click();
    await page.waitForFunction(
      (n) => Number(document.querySelector(".ts-pipeline b")?.textContent) < n,
      all,
    );
    const chapter = Number(
      await page.locator(".ts-pipeline b").first().innerText(),
    );
    await openSelect("课程范围");
    await page
      .locator(".ant-select-dropdown:visible .ant-select-tree-title")
      .filter({ hasText: /^16.1 / })
      .click();
    await page.waitForFunction(
      (n) => Number(document.querySelector(".ts-pipeline b")?.textContent) < n,
      chapter,
    );
    assert.match(page.url(), /curriculum_scope_type=section/);
    await shot("learning-section");
    for (let i = 0; i < 5; i++)
      await page.locator(".ts-sourcebar button").nth(i).click();
    await page
      .getByText("未选择数据来源，当前不纳入任何记录", { exact: true })
      .waitFor();
    assert.match(page.url(), /sources=none/);
    await page.reload();
    await page
      .getByText("未选择数据来源，当前不纳入任何记录", { exact: true })
      .waitFor();
    for (let i = 0; i < 5; i++)
      await page.locator(".ts-sourcebar button").nth(i).click();
    await page.locator(".ts-pipeline b").first().waitFor();
    await page.getByRole("button", { name: "查看筛选证据" }).click();
    await page.locator(".ant-drawer:visible .ts-evidence").first().waitFor();
    await page.locator(".ant-drawer:visible .ant-drawer-close").click();
    await page.getByRole("tab", { name: /个人学情/ }).click();
    await page
      .getByRole("combobox", { name: "学情学生", exact: true })
      .waitFor();
    await page.locator(".ts-pipeline b").first().waitFor();
    await option("学情学生", "黄明静");
    await page
      .locator(".ts-scope-note")
      .getByText(/覆盖 .*\/1 名学生/)
      .waitFor();
    await page.reload();
    await page.locator(".portrait-grid").waitFor();
    assert.match(page.url(), /student_id=/);
    console.log(
      "PASS learning chapter/section, student switching, URL refresh and evidence",
    );
    await go(
      "/learning-analysis?class_id=cls-g8-03&curriculum_scope_type=section&curriculum_scope_id=demo-sec-pythagoras-02",
    );
    await page
      .getByText("当前课程、时间与来源范围内暂无数据", { exact: true })
      .waitFor();
    await page.getByRole("tab", { name: "学科能力与量规" }).click();
    await page.locator(".ts-indicators").waitFor();
    assert.ok(await page.getByText("量规待审核", { exact: true }).count());
    await go("/design");
    const buttons = page.locator(".right-wrapper-type > button");
    assert.match(await buttons.nth(0).innerText(), /单元/);
    assert.equal(await buttons.nth(0).getAttribute("aria-pressed"), "true");
    await page.getByRole("button", { name: "单元与课时" }).click();
    await page
      .getByRole("button", { name: "基于此单元准备课时" })
      .first()
      .click();
    assert.equal(await buttons.nth(1).getAttribute("aria-pressed"), "true");
    await page.getByText("学情补充与情境、任务、评价", { exact: true }).click();
    await page
      .getByRole("textbox", { name: "真实问题情境", exact: true })
      .fill("校园正方形花坛面积为18平方米，估计边长并说明依据。");
    await page
      .getByRole("textbox", { name: "任务与预期产出", exact: true })
      .fill("用估算和根式化简两种方法，提交计算步骤与比较说明。");
    await page
      .getByRole("textbox", { name: "评价证据与达成条件", exact: true })
      .fill("解释近似值范围与化简依据；没有过程证据不判定推理水平。");
    await shot("design-context");
    console.log(
      "PASS unit-first design, referenced lesson and editable context",
    );
    await go("/homework?sub=diagnostics&class_id=cls-g8-03");
    await page.getByRole("button", { name: "查看证据" }).first().click();
    await page.locator(".ts-diagnostic-detail").waitFor();
    await page.getByRole("tab", { name: "定向干预" }).click();
    await page.getByText("复测已达标，停止追加练习", { exact: true }).waitFor();
    await page.getByRole("tab", { name: "教师复核" }).click();
    await option("错因复核结论", "否决原候选");
    await page
      .getByRole("textbox", { name: "错因复核依据", exact: true })
      .fill("浏览器验收：保留反向证据，待补充独立作答。");
    await page.getByRole("button", { name: "保存复核" }).click();
    await page.getByText("复核已保存，干预建议已同步").waitFor();
    await page.getByRole("tab", { name: "定向干预" }).click();
    await page.getByText("等待教师复核", { exact: true }).waitFor();
    await page.reload();
    await page
      .locator(".ts-diagnostic-detail")
      .getByText("已否决", { exact: true })
      .waitFor();
    await shot("diagnostic-review");
    console.log(
      "PASS diagnosis evidence, stop rule, rejection invalidation and persistence",
    );
    await go("/school-research");
    assert.equal(
      await page
        .locator(".ts-tool-layout > .ant-tabs")
        .getByRole("tab")
        .count(),
      4,
    );
    await page.getByRole("button", { name: "查看记录" }).first().waitFor();
    await page.getByRole("tab", { name: /评价量规/ }).click();
    await page.getByRole("button", { name: "查看记录" }).first().click();
    await page.getByText("试评记录", { exact: true }).waitFor();
    await page.locator(".ant-drawer:visible .ant-drawer-close").click();
    await go("/school-research?topic=research-001");
    await page.getByRole("button", { name: "返回议题列表" }).waitFor();
    assert.equal(
      await page
        .getByRole("tab", { name: /教研交流/ })
        .getAttribute("aria-selected"),
      "true",
    );
    await page.getByRole("button", { name: "返回议题列表" }).click();
    await page.locator(".research-topic").first().waitFor();
    console.log("PASS research tools and legacy forum deep links");
    await go("/classroom-evaluation");
    assert.equal(await page.getByText("综合评分", { exact: true }).count(), 0);
    await page.locator(".ce-lesson-title").first().click();
    await page
      .getByText("量规与任务条件待审核，本课不输出综合分", { exact: true })
      .waitFor();
    await shot("classroom-evidence");
    await page.setViewportSize({ width: 390, height: 844 });
    await go("/learning-analysis?class_id=cls-g8-03");
    await page.locator(".portrait-grid").waitFor();
    if (await page.getByRole("button", { name: "让出页面" }).count())
      await page.getByRole("button", { name: "让出页面" }).click();
    await shot("learning-mobile");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    assert.ok(overflow <= 2, `mobile document overflow ${overflow}px`);
    const assistant = await page.locator(".ga_panel").boundingBox();
    assert.ok(
      assistant.height <= 65 && assistant.y > 650,
      "collapsed mobile assistant must not cover the page header",
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS classroom evidence, mobile overflow, no browser exceptions",
    );
  } catch (error) {
    await shot("failure");
    console.error("URL", page.url());
    console.error("BROWSER ERRORS", errors);
    throw error;
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
