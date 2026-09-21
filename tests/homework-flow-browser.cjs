/**
 * 下发与回收 / 作业批改（演示批改工作台）/ 教学反思 / 小助手反思建议 —— 浏览器回归。
 * 运行：node tests/homework-flow-browser.cjs（默认 4174，需先 npm run preview:demo）
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '../.temp/browser-tools/node_modules/playwright-core');
const base = process.env.TEST_URL || 'http://127.0.0.1:4174';
const out = '.temp/homework-flow';
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1520, height: 1000 } });
  page.setDefaultTimeout(20000);
  const errors = [], passed = [];
  page.on('pageerror', e => errors.push(e.message));
  const pass = t => { passed.push(t); console.log('PASS ' + t); };
  const screenshot = name => page.screenshot({ path: `${out}/${name}.png`, fullPage: false });

  try {
    await page.goto(base);
    await page.getByPlaceholder('请输入EID账号').fill('teacher');
    await page.getByPlaceholder('请输入密码', { exact: true }).fill('demo123456');
    await page.getByPlaceholder('请输入验证码').fill('1234');
    await page.getByRole('button', { name: '立即登录' }).click();
    await page.waitForURL('**/source');

    // ===== 0. 首页工作台导航 =====
    await page.getByText('首页', { exact: true }).first().click();
    await page.locator('.wb_hero_card').first().waitFor();
    const navCards = [
      ...await page.locator('.wb_hero_title').allInnerTexts(),
      ...await page.locator('.wb_nav_card_title').allInnerTexts(),
    ];
    assert.ok(['学情分析', '教学设计', '作业', '校本教研', '资源平台'].every(t => navCards.includes(t)),
      `首页应有五大功能导航卡，实际 ${navCards.join('/')}`);
    // 双大卡占满一行 + 统计填充 + 分模块卡内待办
    const heroBoxes = await page.locator('.wb_hero_card').evaluateAll(els =>
      els.map(el => ({ t: Math.round(el.getBoundingClientRect().top), w: Math.round(el.getBoundingClientRect().width) })));
    assert.equal(heroBoxes.length, 2, '学情分析/教学设计应为两张大卡');
    assert.equal(heroBoxes[0].t, heroBoxes[1].t, '两张大卡应在同一行');
    const statNums = await page.locator('.wb_hero_card .wb_stat_num').allInnerTexts();
    assert.ok(statNums.length >= 6 && statNums.every(v => v !== '—'), `大卡统计应填充（${statNums.join('/')}）`);
    const cardTodos = await page.locator('.wb_todo_item').count();
    assert.ok(cardTodos >= 4, `分模块卡内待办应≥4条，实际 ${cardTodos}`);
    const heroTodos = await page.locator('.wb_hero_card .wb_todo_item').count();
    assert.ok(heroTodos >= 2, `大卡内应有本模块待办，实际 ${heroTodos}`);
    // 卡内待办可点击直达（作业卡第一条待复核）
    const hwCard = page.locator('.wb_nav_card', { hasText: '作业' });
    if (await hwCard.locator('.wb_todo_item').count()) {
      await hwCard.locator('.wb_todo_item').first().click();
      await page.waitForURL(u => u.pathname === '/homework');
      await page.goBack();
      await page.waitForTimeout(600);
    }
    pass('首页总工作台：双大卡（统计+卡内待办）+三标准卡，待办分模块');

    // ===== 1. 作业四合一：组卷/下发/回收/批改 子 Tab =====
    await page.getByText('作业', { exact: true }).first().click();
    await page.waitForURL('**/homework');
    await page.locator('.hw_tabs_page .ant-tabs-tab').first().waitFor();
    const hwTabs = await page.locator('.hw_tabs_page .ant-tabs-tab').allInnerTexts();
    assert.ok(['作业组卷', '作业下发', '下发与回收', '作业批改'].every(t => hwTabs.join(',').includes(t)),
      `作业页应含四个子 Tab，实际 ${hwTabs.join(',')}`);
    await page.getByRole('tab', { name: '下发与回收' }).click();
    await page.locator('.hf_container .ant-table-row').first().waitFor();
    const rows = await page.locator('.hf_container .ant-table-row').count();
    assert.ok(rows >= 3, `应有至少3条下发记录，实际 ${rows}`);
    assert.ok(await page.getByText('总提交率').count() >= 1);
    pass('作业页四合一子 Tab，工作台展示下发记录与提交率统计');

    // 打开回收详情抽屉
    await page.locator('.hf_container .ant-table-row').first().getByText('查看回收').click();
    await page.locator('.ant-drawer .ant-table-row').first().waitFor();
    const statusTexts = await page.locator('.ant-drawer .ant-table-row .ant-tag').allInnerTexts();
    assert.ok(statusTexts.some(t => /按时提交|未按时|待提交|重新提交/.test(t)), '提交状态应含 PRD 口径');
    await screenshot('flow-drawer');
    await page.keyboard.press('Escape');
    pass('回收抽屉展示逐生提交状态（按时/超时/待提交/重新提交）');

    // ===== 1b. 学案下发 → 回收工作台端到端（教学设计增强页真实按钮） =====
    await page.goto(base + '/teaching-enhance');
    await page.getByRole('button', { name: '学案下发' }).first().waitFor();
    await page.getByRole('button', { name: '学案下发' }).first().click();
    await page.getByText('已推送给全班').waitFor();
    await page.getByRole('button', { name: '去查看回收进度' }).click();
    await page.waitForURL(u => u.pathname === '/homework');
    await page.getByText('分层选做统计').waitFor({ timeout: 15000 });
    assert.ok((await page.locator('.ant-drawer .ant-table-row').count()) > 0, '学案回收应有学生列表');
    await screenshot('study-plan-issue-e2e');
    await page.keyboard.press('Escape');
    pass('学案下发 → 弹窗引导 → 回收工作台（三档分层统计）端到端');

    // 学案 tab：分层统计（上一步已端到端下发一条学案）
    await page.locator('.hf_container .ant-segmented-item', { hasText: '学案' }).click();
    await page.waitForTimeout(600);
    const spRows = await page.locator('.hf_container .ant-table-row').count();
    assert.ok(spRows >= 1, `学案 tab 应有刚下发的记录，实际 ${spRows}`);
    await page.locator('.hf_container .ant-table-row').first().getByText('查看回收').click();
    await page.getByText('分层选做统计').waitFor();
    await screenshot('flow-study-plan-layers');
    await page.keyboard.press('Escape');
    pass('学案回收展示基础必做/提高选做/挑战选做三档统计');
    await page.locator('.hf_container .ant-segmented-item', { hasText: '全部' }).click();

    // ===== 2. 作业批改（演示批改工作台，同页切子 Tab） =====
    await page.locator('.hf_container .ant-table-row').first().getByText('去批改').click();
    await page.waitForURL(u => u.pathname === '/homework' && u.searchParams.get('sub') === 'grade');
    await page.locator('.dg_item').first().waitFor();
    await page.locator('.dg_student').first().waitFor();
    assert.ok((await page.locator('.dg_item').count()) >= 1, '左侧应有下发记录');
    await page.locator('.dg_student').first().click();
    await page.locator('.dg_q').first().waitFor();
    const qCount = await page.locator('.dg_q').count();
    assert.ok(qCount >= 3, `批改详情应有逐题卡片，实际 ${qCount}`);
    await page.locator('.dg_feedback').waitFor();
    assert.ok(await page.getByText('结构化反馈').count() >= 1);
    // 改判 + 复核
    await page.locator('.dg_q .ant-radio-button-wrapper').first().waitFor();
    const firstGroup = page.locator('.dg_q').first().locator('.ant-radio-button-wrapper');
    await firstGroup.nth(1).click();
    await page.getByRole('button', { name: /确认复核入档|更新复核/ }).click();
    await page.getByText(/复核完成/).waitFor();
    await screenshot('grading-review');
    pass('批改页逐题 AI 判定、错因、教师改判复核留痕');

    // ===== 3. 教学反思（教学设计域子入口） =====
    await page.goto(base + '/design/reflection');
    await page.locator('.tr_domain_bar').waitFor();
    assert.ok((await page.locator('.tr_domain_bar').innerText()).includes('教学设计'), '反思页应归属教学设计域');
    await page.locator('.tr_sug').first().waitFor({ timeout: 20000 });
    const sugCount = await page.locator('.tr_sug').count();
    assert.ok(sugCount >= 3, `反思建议应≥3条，实际 ${sugCount}`);
    await page.locator('.tr_record').first().waitFor();
    await screenshot('reflection');
    pass('教学设计 · 教学反思展示证据驱动的建议卡与反思记录');

    // ===== 4. 小助手反思建议 =====
    const panel = page.locator('.ga_panel');
    await panel.waitFor();
    await page.locator('.ga_input textarea').fill('给我一些教学反思建议');
    await page.getByRole('button', { name: '发送消息', exact: true }).click();
    await page.locator('.ga_result_card').first().waitFor({ timeout: 30000 });
    const cardTexts = await page.locator('.ga_result_card').allInnerTexts();
    assert.ok(cardTexts.some(t => /教学反思建议/.test(t)), '助手应返回反思建议卡');
    await screenshot('assistant-reflection');
    pass('小助手「教学反思建议」意图输出建议卡');

    assert.deepEqual(errors, [], '页面无 JS 错误');
    console.log(`\n全部通过：${passed.length} 项`);
  } catch (e) {
    await page.screenshot({ path: `${out}/FAIL.png`, fullPage: true }).catch(() => {});
    console.error('FAIL', e.message);
    console.error('JS errors:', errors);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
