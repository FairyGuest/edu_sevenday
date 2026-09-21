const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '../.temp/browser-tools/node_modules/playwright-core');
const base = process.env.TEST_URL || 'http://127.0.0.1:4175';
const out = '.temp/portrait-research';
const portraitCaptureStyle = '.ga_panel { opacity: 0 !important; transition: none !important; }';
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(() => {
    window.__portraitRequests = [];
    const wrap = fn => async (input, init) => {
      const url = String(input);
      if (url.includes('/teach_plan/teach_maker') && init?.body) window.__portraitRequests.push(JSON.parse(init.body));
      const mode = sessionStorage.getItem('portrait-test-mode');
      if (url.includes('/teacher/portraits') && mode === 'error') {
        return new Response(JSON.stringify({ code: 500, msg: '画像接口暂不可用测试' }), { headers: { 'Content-Type': 'application/json' } });
      }
      const response = await fn(input, init);
      if (url.includes('/teacher/portraits') && mode === 'legacy') {
        const result = await response.clone().json();
        if (result.data?.snapshot) {
          result.data.snapshot.dimensions = result.data.snapshot.dimensions.filter(d => d.dimension_key === 'knowledge');
          result.data.snapshot.dimensions[0].radar_items[0].value = null;
          result.data.explanations = undefined;
          result.data.graph = undefined;
        }
        return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
      }
      return response;
    };
    let current = wrap(window.fetch.bind(window));
    Object.defineProperty(window, 'fetch', { configurable: true, get: () => current, set: fn => { current = wrap(fn); } });
  });
  page.setDefaultTimeout(20000);
  const errors = [], passed = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', event => {
    if (event.type() === 'error' && /Maximum update depth|Cannot read properties|Minified React error|Unhandled/i.test(event.text())) errors.push(event.text());
  });
  const pass = msg => { passed.push(msg); console.log('PASS ' + msg); };
  const screenshot = async name => {
    const yieldButton = page.getByRole('button', { name: '让出页面', exact: true });
    if (await yieldButton.isVisible()) await yieldButton.click();
    await page.screenshot({ path: out + '/' + name + '.png', fullPage: true });
  };
  const go = async path => {
    await page.goto(base + path); await page.waitForLoadState('domcontentloaded');
    if (await page.locator('.main-sider').count()) {
      const yieldButton = page.getByRole('button', { name: '让出页面', exact: true });
      if (await yieldButton.isVisible()) await yieldButton.click();
    }
  };
  const select = async (label, text) => {
    await page.getByRole('combobox', { name: label, exact: true }).click();
    await page.locator('.ant-select-dropdown:visible .ant-select-item-option-content').filter({ hasText: text }).first().click();
  };
  try {
    await go('/');
    await page.getByPlaceholder('请输入EID账号').fill('teacher');
    await page.getByPlaceholder('请输入密码', { exact: true }).fill('demo123456');
    await page.getByPlaceholder('请输入验证码').fill('1234');
    await page.getByRole('button', { name: '立即登录' }).click();
    await page.waitForURL('**/source');
    await page.getByRole('menuitem', { name: '首页', exact: true }).click();
    await page.locator('.homework-card').waitFor();
    assert.equal(await page.locator('.interaction-card, .agent-card, .notice-card').count(), 3);
    pass('原首页四个模块正常，校本教研为左侧一级入口');
    await go('/learning-analysis?class_id=cls-g8-03');
    await page.locator('.portrait-dimension canvas').first().waitFor();
    assert.equal(await page.locator('.portrait-dimension').count(), 4);
    assert.equal(await page.getByText('学生列表', { exact: true }).count(), 0);
    const tabs = await page.getByRole('tab').allTextContents();
    assert.ok(tabs.some(t => t.includes('班级学情')) && tabs.some(t => t.includes('个人学情')));
    assert.ok(!tabs.some(t => t.includes('校本教研')));
    const pixelCount = await page.locator('.portrait-radar canvas').evaluateAll(canvases =>
      canvases.map(c => {
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let colored = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i + 3] && Math.max(d[i], d[i+1], d[i+2]) - Math.min(d[i], d[i+1], d[i+2]) > 20) colored++;
        return colored;
      }));
    assert.equal(pixelCount.length, 4);
    assert.ok(pixelCount.every(n => n > 40), 'all radar canvases must have colored pixels');
    await screenshot('class-1440');
    pass('班级四维雷达实际绘制，移除学生清单，保留四个Tab');
    for (const label of ['八年级(1)班', '八年级(2)班', '八年级(3)班']) {
      await page.locator('.analysis-class-select').click();
      await page.locator('.ant-select-dropdown:visible .ant-select-item-option-content').filter({ hasText: label }).click();
    }
    await page.waitForFunction(() => document.querySelector('[data-dimension="knowledge"] .portrait-score b')?.textContent === '64');
    pass('连续切换三个班级后展示最终班级画像，无旧响应覆盖');
    await page.getByRole('button', { name: /查看依据/ }).first().click();
    await page.getByRole('dialog').getByText('完整快照口径').waitFor();
    await page.getByRole('dialog').locator('.ant-drawer-close').click();
    await page.getByRole('button', { name: '近7天', exact: true }).click();
    await page.getByText('当前范围缺少完整统计数据').first().waitFor();
    assert.equal(await page.locator('.portrait-radar canvas').count(), 0);
    assert.equal(await page.locator('.portrait-chart-empty').count(), 4);
    await page.getByRole('button', { name: '查看已有快照', exact: true }).click();
    await page.locator('.portrait-radar canvas').first().waitFor();
    assert.equal(new URL(page.url()).searchParams.get('start_date'), '2026-08-18');
    assert.equal(new URL(page.url()).searchParams.get('end_date'), '2026-09-18');
    assert.equal(await page.locator('.portrait-radar canvas').count(), 4);
    await page.getByRole('checkbox', { name: '课堂互动', exact: true }).uncheck();
    await page.locator('.portrait-coverage').waitFor();
    assert.equal(await page.locator('.portrait-radar canvas').count(), 0);
    await page.getByRole('button', { name: '查看已有快照', exact: true }).click();
    await page.locator('.portrait-radar canvas').first().waitFor();
    pass('时间与来源缺统计时显示统一说明，已有快照入口恢复真实日期、来源和四张雷达');
    await page.getByRole('button', { name: '近7天', exact: true }).click();
    await page.getByRole('tab', { name: /个人学情/ }).click();
    await page.locator('.pa_panel_name').filter({ hasText: '的个人学情' }).waitFor();
    assert.ok(new URL(page.url()).searchParams.get('start_date'));
    await page.getByRole('button', { name: '重置时间与来源' }).click();
    await page.locator('.pa_list_item').filter({ hasText: 'edu03001' }).click();
    await page.locator('.portrait-radar canvas').first().waitFor();
    assert.equal(await page.locator('.portrait-dimension').count(), 4);
    await page.locator('.portrait-comparison').filter({ hasText: /班均/ }).first().waitFor();
    const firstStudent = await page.locator('.pa_panel_name').textContent();
    await page.locator('.pa_list_item').filter({ hasText: 'edu03002' }).click();
    await page.waitForFunction(name => document.querySelector('.pa_panel_name')?.textContent !== name, firstStudent);
    await page.locator('.portrait-radar canvas').first().waitFor();
    await screenshot('personal-1440');
    pass('个人四维与班均对照、学生切换、跨Tab时间来源保持一致');
    await page.getByRole('tab', { name: /知识图谱/ }).click();
    await page.getByRole('region', { name: '画像证据图谱' }).waitFor();
    const allNodes = await page.locator('.evidence-node-list button').count();
    assert.equal(allNodes, 20);
    await select('证据强度', '久未更新');
    assert.ok(await page.locator('.evidence-node-list button').count() < allNodes);
    await page.getByRole('button', { name: '重置图谱筛选' }).click();
    await select('掌握状态', '待巩固');
    const weakNodes = await page.locator('.evidence-node-list button').count();
    assert.ok(weakNodes > 0 && weakNodes < allNodes);
    await page.getByRole('button', { name: '重置图谱筛选' }).click();
    await page.getByRole('button', { name: '近7天', exact: true }).click();
    assert.ok(await page.locator('.evidence-node-list button').count() < allNodes);
    await screenshot('graph-filtered');
    await page.getByRole('button', { name: '重置时间与来源' }).click();
    pass('图谱按证据强度、掌握状态、时间实际筛选，重置有效');
    await page.getByRole('menuitem', { name: /校本教研/ }).click();
    await page.locator('.research-topic').first().waitFor();
    await select('教研状态', '已形成策略');
    assert.equal(await page.locator('.research-topic').count(), 3);
    await page.getByRole('button', { name: '重置教研筛选' }).click();
    await page.getByRole('button', { name: /发起议题/ }).click();
    const modal = page.getByRole('dialog', { name: '发起教研议题' });
    await modal.getByRole('button', { name: /保\s*存/ }).click();
    await modal.getByText('请填写完整名称').waitFor();
    await modal.getByLabel('议题标题').fill('验收：如何提升函数图像表达质量');
    await modal.getByLabel('问题描述').fill('学生可以进行计算，但在描述函数变化趋势时难以表达完整的实际意义。');
    await modal.getByLabel('证据摘要').fill('最近单元测图像解释题正确率52%，需要补充表达训练。');
    await modal.getByLabel('涉及班级').click();
    await page.locator('.ant-select-dropdown:visible .ant-select-item-option-content').filter({ hasText: '八年级(3)班' }).click();
    await modal.getByLabel('议题标题').click();
    await modal.getByRole('button', { name: /保\s*存/ }).click();
    await modal.waitFor({ state: 'hidden' });
    await page.getByRole('heading', { name: '验收：如何提升函数图像表达质量' }).waitFor();
    await page.getByRole('textbox', { name: '交流回复' }).fill('建议先进行口头表达，再使用半开放句式完成书面解释。');
    await page.getByRole('button', { name: /发布回复/ }).evaluate(el => { el.click(); el.click(); });
    await page.locator('.research-reply').waitFor();
    assert.equal(await page.locator('.research-reply').count(), 1);
    await page.reload();
    await page.locator('.research-reply').waitFor();
    await page.getByRole('button', { name: '新增共识策略' }).click();
    const strategy = page.getByRole('dialog', { name: '沉淀共识策略' });
    await strategy.getByLabel('策略名称').fill('先说后写的表达训练');
    await strategy.getByLabel('策略内容').fill('先找图像关键点，再说明变化方向，最后解释实际意义，同伴互评后落笔。');
    await strategy.getByLabel('证据摘要').fill('课堂抽查10名学生，8名能独立解释变化方向。');
    await strategy.getByRole('button', { name: /保\s*存/ }).click();
    await strategy.waitFor({ state: 'hidden' });
    await page.locator('.research-strategy').waitFor();
    await screenshot('research-detail');
    await page.getByRole('button', { name: /引用到教案/ }).click();
    await page.getByText('已引用教研策略：先说后写的表达训练', { exact: true }).waitFor();
    await page.reload();
    await page.getByText('已引用教研策略：先说后写的表达训练', { exact: true }).waitFor();
    pass('发帖校验、回复双击防重、刷新持久化、沉淀策略并引用到教学设计');
    await page.locator('.selection .chapter-select').click();
    await page.locator('.ant-select-dropdown:visible .ant-select-tree-node-content-wrapper').filter({ hasText: '16.1 二次根式' }).click();
    await page.locator('.selection .custom-cascader').click();
    await page.locator('.ant-cascader-dropdown:visible').getByText('新授课', { exact: true }).click();
    const yieldButton = page.getByRole('button', { name: '让出页面', exact: true });
    if (await yieldButton.isVisible()) await yieldButton.click();
    await page.getByRole('button', { name: '生成教案', exact: true }).click();
    await page.getByRole('button', { name: '跳过引导，直接生成' }).click();
    await page.waitForFunction(() => window.__portraitRequests.length > 0);
    const generated = await page.evaluate(() => window.__portraitRequests.at(-1));
    assert.ok(generated.user_require.includes('先说后写的表达训练'));
    assert.ok(generated.research_reference?.strategy_id);
    await page.locator('.plan_assign_floating:not([disabled])').waitFor();
    assert.ok((await page.locator('body').innerText()).includes('先说后写的表达训练'));
    pass('实际生成请求带入教研内容及结构化引用，生成结果包含策略');
    for (const path of ['/', '/learning-analysis', '/learning-analysis?tab=personal', '/learning-analysis?tab=kgraph',
      '/learning-analysis?tab=homework', '/design', '/paperCompose', '/setTopic', '/teach/correction', '/school-research']) {
      await go(path);
      await page.locator('.main-sider').waitFor();
      await page.waitForTimeout(600);
      assert.ok((await page.locator('body').innerText()).length > 100, 'nonblank ' + path);
    }
    pass('十条既有和新增主路由可刷新打开');
    await go('/learning-analysis?class_id=cls-g8-03');
    await page.locator('.portrait-radar canvas').first().waitFor();
    for (const width of [1366, 1920, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForTimeout(700);
      const layout = await page.locator('.portrait-dimension').evaluateAll(elements => elements.map(e => {
        const r = e.getBoundingClientRect();
        return { left: r.left, right: r.right, width: r.width, overflow: e.scrollWidth - e.clientWidth };
      }));
      assert.equal(layout.length, 4);
      assert.ok(layout.every(r => r.width > 200 && r.overflow <= 2), JSON.stringify(layout));
      assert.ok(layout.every(r => r.left >= 0 && r.right <= width + 2), 'cards must fit viewport: ' + JSON.stringify(layout));
      const presets = await page.locator('.portrait-scope-dates .date_preset_group > button').evaluateAll(buttons => buttons.map(button => {
        const range = document.createRange();
        range.selectNodeContents(button);
        const label = range.getBoundingClientRect();
        const box = button.getBoundingClientRect();
        return { fits: label.left >= box.left && label.right <= box.right && label.top >= box.top && label.bottom <= box.bottom,
          inViewport: box.left >= 0 && box.right <= innerWidth, text: button.textContent };
      }));
      assert.equal(presets.length, 3);
      assert.ok(presets.every(p => p.fits && p.inViewport), 'preset labels must fit their buttons: ' + JSON.stringify(presets));
      const metricLabels = await page.locator('.portrait-metrics button').evaluateAll(buttons => buttons.map(button => {
        const label = button.querySelector('.portrait-metric-label').getBoundingClientRect();
        const value = button.querySelector('b').getBoundingClientRect();
        return label.right <= value.left + 1 && button.scrollWidth <= button.clientWidth + 1;
      }));
      assert.ok(metricLabels.length === 24 && metricLabels.every(Boolean), 'metric labels and values must not overlap');
      await screenshot('class-' + width);
      if (width === 1920) {
        for (const dimension of ['knowledge', 'ability', 'literacy', 'process']) {
          await page.locator(`[data-dimension="${dimension}"]`).screenshot({ path: out + '/portrait-' + dimension + '.png',
            style: portraitCaptureStyle });
        }
      }
      if (width === 390) await page.locator('.portrait-dimension').first().screenshot({ path: out + '/radar-mobile.png',
        style: portraitCaptureStyle });
    }
    await go('/learning-analysis?class_id=cls-g8-03&tab=personal');
    await page.locator('.portrait-radar canvas').first().waitFor();
    const personalCards = await page.locator('.portrait-dimension').evaluateAll(cards => cards.map(card => ({
      left: card.getBoundingClientRect().left, right: card.getBoundingClientRect().right, overflow: card.scrollWidth - card.clientWidth,
    })));
    assert.equal(personalCards.length, 4);
    assert.ok(personalCards.every(c => c.left >= 0 && c.right <= 392 && c.overflow <= 2), JSON.stringify(personalCards));
    await page.locator('.portrait-dimension').first().screenshot({ path: out + '/personal-mobile-refined.png',
      style: portraitCaptureStyle });
    await go('/school-research?topic=research-001');
    await page.locator('.research-detail').waitFor();
    await screenshot('research-mobile');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false);
    pass('1366/1440/1920桌面与390窄屏布局、雷达画布和文字无溢出');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => sessionStorage.setItem('portrait-test-mode', 'legacy'));
    await go('/learning-analysis?class_id=cls-g8-03');
    await page.getByText('暂无该维度数据').first().waitFor();
    assert.equal(await page.locator('.portrait-dimension').count(), 4);
    assert.equal(await page.locator('.portrait-radar canvas').count(), 1);
    assert.ok(!(await page.locator('.portrait-overview').innerText()).includes('NaN'));
    await page.evaluate(() => sessionStorage.setItem('portrait-test-mode', 'error'));
    await go('/learning-analysis?class_id=cls-g8-03');
    await page.locator('.portrait-overview').getByText('画像接口暂不可用测试').waitFor();
    await page.evaluate(() => sessionStorage.removeItem('portrait-test-mode'));
    await page.locator('.portrait-overview').getByRole('button', { name: /重试/ }).click();
    await page.locator('.portrait-radar canvas').first().waitFor();
    assert.equal(await page.locator('.portrait-radar canvas').count(), 4);
    pass('旧数据缺维度、空指标和解释缺失不白屏，接口失败可重试恢复');
    assert.deepEqual(errors, []);
    fs.writeFileSync(out + '/result.json', JSON.stringify({ passed, errors }, null, 2));
    console.log('PASS no unhandled browser runtime errors');
  } catch (e) {
    console.error(e);
    console.error('Browser errors:', errors);
    console.error((await page.locator('body').innerText()).slice(-6500));
    await screenshot('failure').catch(() => {});
    process.exitCode = 1;
  } finally { await browser.close(); }
})();
