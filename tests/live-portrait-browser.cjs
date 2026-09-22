const assert = require("node:assert/strict");
const fs = require("node:fs");
const {
  chromium,
} = require("../.temp/browser-tools/node_modules/playwright-core");
const out = ".temp/live-portrait";
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const ready = () => page.locator(".portrait-grid").waitFor();
  const choose = async (search, label) => {
    await page
      .getByRole("combobox", { name: "章节筛选", exact: true })
      .fill(search);
    await page
      .locator(".ant-select-dropdown:visible .ant-select-tree-title")
      .filter({ hasText: label })
      .click();
    await ready();
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
    await page.waitForURL((u) => !u.pathname.includes("login"));
    await page.goto(
      "http://localhost:8000/learning-analysis?class_id=cls-g8-03",
    );
    await ready();
    if (
      await page.getByRole("button", { name: "让出页面", exact: true }).count()
    )
      await page.getByRole("button", { name: "让出页面", exact: true }).click();
    assert.equal(
      await page.locator(".ts-learning").count(),
      0,
      "preserve TeacherProfile, not the replacement workspace",
    );
    assert.equal(await page.locator(".portrait-dimension").count(), 4);
    assert.equal(
      await page
        .locator('[data-dimension="literacy"] .portrait-metrics button')
        .count(),
      5,
    );
    await page.locator(".portrait-radar canvas").first().waitFor();
    await page.screenshot({ path: out + "/original-layout.png" });
    await page
      .locator(".portrait-grid")
      .screenshot({ path: out + "/desktop-radars.png" });
    await page.locator(".pf_calculation > summary").click();
    assert.equal(await page.locator(".pf_dim_snap").count(), 0);
    await page.locator(".pf_calculation > summary").click();
    await page.getByRole("button", { name: "课标依据", exact: true }).click();
    await page.getByRole("dialog").getByText(/L929/).filter({ hasText: "义务教育数学课程标准" }).waitFor();
    await page
      .getByRole("dialog")
      .getByText(/L1426-1432/)
      .waitFor();
    await page
      .getByRole("dialog")
      .getByText(/awaiting_source/)
      .waitFor();
    await page.getByRole("dialog").locator(".ant-drawer-close").click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page.getByRole("button", { name: "近7天", exact: true }).click();
    await page.waitForURL(
      (u) => u.searchParams.get("start_date") === "2026-09-16",
    );
    await ready();
    const scores = await page.locator(".portrait-score > b").allTextContents();
    assert.ok(
      scores.every((s) => Number.isFinite(Number(s))),
      "all four views have recent observations",
    );
    await page.getByRole("button", { name: "近1个月", exact: true }).click();
    await page.waitForURL(
      (u) => u.searchParams.get("start_date") === "2026-08-22",
    );
    await ready();
    const date = new URL(page.url()).searchParams.get("start_date");
    await choose("二次根式", /^第16章 二次根式$/);
    await page.waitForURL(
      (u) => u.searchParams.get("curriculum_scope_type") === "chapter",
    );
    await ready();
    assert.equal(new URL(page.url()).searchParams.get("start_date"), date);
    const clusters = await page
      .locator(".analysis_distribution .ct_row_name")
      .allTextContents();
    assert.ok(
      clusters.length > 0 && clusters.every((c) => c.includes("二次根式")),
    );
    await page
      .getByRole("button", { name: "查看当前范围证据", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .locator(".portrait-evidence li")
      .first()
      .waitFor();
    await page.getByRole("dialog").locator(".ant-drawer-close").click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await choose("二次根式的加减", /^16.3 /);
    await page.waitForURL(
      (u) => u.searchParams.get("curriculum_scope_type") === "section",
    );
    await ready();
    await page.reload();
    await ready();
    assert.equal(
      new URL(page.url()).searchParams.get("curriculum_scope_type"),
      "section",
    );
    await page.locator(".portrait-scope-dates .ant-picker").hover();
    await page.locator(".portrait-scope-dates .ant-picker-clear").click();
    await page.waitForURL((u) => u.searchParams.get("date_all") === "1");
    await ready();
    assert.equal(
      new URL(page.url()).searchParams.get("curriculum_scope_type"),
      "section",
    );
    await page.locator(".portrait-chapter-select").hover();
    await page.locator(".portrait-chapter-select .ant-select-clear").click();
    await page.waitForURL((u) => !u.searchParams.has("curriculum_scope_type"));
    await ready();
    assert.equal(new URL(page.url()).searchParams.get("date_all"), "1");
    await page.getByRole("tab", { name: /个人学情/ }).click();
    await page
      .locator(".pa_panel_name")
      .filter({ hasText: "的个人学情" })
      .waitFor();
    await ready();
    await choose("一次函数", /^第19章 /);
    await page.waitForURL(
      (u) => u.searchParams.get("curriculum_scope_id") === "demo-ch-function",
    );
    await ready();
    await page
      .getByRole("button", { name: "返回班级学情", exact: true })
      .click();
    await page.locator(".teacher-profile-portraits").waitFor();
    await ready();
    await page
      .locator(".analysis_distribution")
      .getByText("知识图谱", { exact: true })
      .click();
    await page.locator(".analysis_distribution .kg_svg").waitFor();
    await page.getByRole("tab", { name: /知识图谱/ }).click();
    await page.locator(".evidence-node-list button").first().waitFor();
    assert.ok((await page.locator(".evidence-node-list button").count()) > 0);
    await page.getByRole("tab", { name: /班级学情/ }).click();
    await ready();
    await choose("数据的分析", /^第20章 /);
    await page.waitForURL(
      (u) => u.searchParams.get("curriculum_scope_id") === "demo-ch-data",
    );
    await ready();
    assert.deepEqual(
      (
        await page
          .locator(".analysis_distribution .ct_row_name")
          .evaluateAll((nodes) =>
            nodes.map((node) => node.firstChild.textContent),
          )
      ).sort(),
      ["数据的集中趋势", "数据的离散程度"].sort(),
      "new statistics evidence is shown without leaking other chapters",
    );
    await page.getByRole("button", { name: "课标依据", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByText(/L1337-1339/)
      .waitFor();
    await page.getByRole("dialog").locator(".ant-drawer-close").click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page.goto(
      "http://localhost:8000/learning-analysis?class_id=cls-g8-03&curriculum_scope_type=chapter&curriculum_scope_id=demo-ch-data&start_date=2099-01-01&end_date=2099-01-07",
    );
    await ready();
    assert.equal(
      await page.locator(".analysis_distribution .ct_row").count(),
      0,
      "an empty date/chapter intersection must not reuse previous evidence",
    );
    await page.goto(
      "http://localhost:8000/learning-analysis?class_id=cls-g8-03",
    );
    await ready();
    await page.setViewportSize({ width: 390, height: 844 });
    if (
      await page.getByRole("button", { name: "让出页面", exact: true }).count()
    )
      await page.getByRole("button", { name: "让出页面", exact: true }).click();
    await page.locator('[data-dimension="literacy"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: out + "/mobile-radar.png" });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS original layout retained; chapter/date independent and intersecting, live radars, v2 references, evidence, personal/class/graphs, refresh and mobile",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
