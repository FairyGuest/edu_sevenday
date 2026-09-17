const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const output = path.resolve(__dirname, '../.temp/analysis-charts');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(15000);
  const errors = [], passed = [], measurements = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.__analysisTest = { requests: [], empty: false, edges: false };
    const wrap = fetcher => async (input, init) => {
      const url = String(input);
      if (url.includes('/api/')) window.__analysisTest.requests.push(url);
      const response = await fetcher(input, init);
      if (url.includes('/profile/class') && (window.__analysisTest.empty || window.__analysisTest.edges)) {
        const result = await response.clone().json();
        if (result.data) {
          if (window.__analysisTest.empty) {
            result.data.trend = []; result.data.source_mix = [];
            result.data.weak_ranking = []; result.data.cluster_rows = [];
          } else {
            result.data.cluster_rows = result.data.cluster_rows.slice(0, 2).map((row, i) => ({
              ...row, cluster: `${i ? '完全掌握' : '零掌握'}：很长的知识点名称用于检查边界`,
              p: i * 100, ci: i ? [98, 100] : [0, 2], trust: 'credible', n_students: 100,
              band_counts: { 待巩固: i ? 0 : 100, 已掌握: i ? 100 : 0 },
              weak_n: i ? 0 : 100, weak_pct: i ? 0 : 100, trend: '连续下降',
            }));
          }
        }
        return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
      }
      return response;
    };
    let current = wrap(window.fetch.bind(window));
    Object.defineProperty(window, 'fetch', { configurable: true, get: () => current, set: fn => { current = wrap(fn); } });
  });

  const dock = async () => {
    const button = page.getByRole('button', { name: '切换到右侧栏', exact: true });
    if (await button.count()) await button.click();
  };
  const float = async () => {
    const button = page.getByRole('button', { name: '切换到右下角', exact: true });
    if (await button.count()) await button.click();
  };
  const ready = async () => {
    await page.waitForFunction(() => {
      const hosts = [...document.querySelectorAll('.analysis_charts .echarts-for-react')];
      return hosts.length === 3 && hosts.every(host => {
        const canvas = host.querySelector('canvas');
        return canvas && Math.abs(canvas.getBoundingClientRect().width - host.clientWidth) <= 1
          && Math.abs(canvas.getBoundingClientRect().height - host.clientHeight) <= 1;
      });
    });
    await page.mouse.move(5, 5);
    await page.waitForTimeout(1500); // Let the normal initial/data-change animation finish.
  };
  const check = name => { assert.deepEqual(errors, [], name); passed.push(name); console.log('PASS ' + name); };

  async function cellsFit() {
    const failures = await page.locator('.cluster_table').evaluate(table => {
      const failures = [];
      for (const element of table.querySelectorAll('.teacher_profile_stackbar, .ct_ci_cell, .ci_bar, .ct_ci_p')) {
        const cell = element.closest('td'), a = element.getBoundingClientRect(), b = cell.getBoundingClientRect();
        const css = getComputedStyle(cell);
        if (a.left < b.left + parseFloat(css.paddingLeft) - 1 || a.right > b.right - parseFloat(css.paddingRight) + 1) {
          failures.push({ selector: element.className, left: a.left, right: a.right, cellLeft: b.left, cellRight: b.right });
        }
      }
      return failures;
    });
    assert.deepEqual(failures, [], '分布条、区间条和百分比必须留在各自单元格内');
    assert.ok(await page.locator('.cluster_table .teacher_profile_stackbar').count(), 'assertions must cover real rows');
  }

  async function stable(name, duration = 2200) {
    await ready();
    const result = await page.evaluate(async duration => {
      const hosts = [...document.querySelectorAll('.analysis_charts .echarts-for-react')];
      const cards = hosts.map(host => host.closest('.teacher_profile_chart_card'));
      const canvases = hosts.map(host => host.querySelector('canvas'));
      const resizeCounts = [0, 0, 0], canvasMutations = [0, 0, 0], clears = [0, 0, 0];
      const sizes = hosts.map(() => new Set());
      const rect = e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
      const observers = hosts.flatMap((host, i) => {
        const resize = new ResizeObserver(() => resizeCounts[i]++); resize.observe(host);
        const mutation = new MutationObserver(records => { canvasMutations[i] += records.filter(r => r.target.tagName === 'CANVAS' || r.type === 'childList').length; });
        mutation.observe(host, { subtree: true, childList: true, attributes: true, attributeFilter: ['width', 'height'] });
        return [resize, mutation];
      });
      const originalClear = CanvasRenderingContext2D.prototype.clearRect;
      CanvasRenderingContext2D.prototype.clearRect = function(...args) {
        const index = canvases.indexOf(this.canvas); if (index >= 0) clears[index]++;
        return originalClear.apply(this, args);
      };
      const start = performance.now(); let frames = 0;
      try {
        do {
          await new Promise(requestAnimationFrame); frames++;
          hosts.forEach((host, i) => sizes[i].add(JSON.stringify([rect(host), rect(cards[i])])));
        } while (performance.now() - start < duration);
      } finally {
        observers.forEach(observer => observer.disconnect());
        CanvasRenderingContext2D.prototype.clearRect = originalClear;
      }
      return { frames, resizeCounts, canvasMutations, clears, distinctSizes: sizes.map(s => s.size),
        hosts: hosts.map(rect), cards: cards.map(rect), business: rect(document.querySelector('.content_wrap')),
        instances: hosts.map(host => host.getAttribute('_echarts_instance_')) };
    }, duration);
    measurements.push({ name, ...result });
    assert.ok(result.frames > 10, 'sample multiple frames, not just one screenshot');
    assert.deepEqual(result.distinctSizes, [1, 1, 1], name + ': 图表和卡片不能持续跳动');
    assert.deepEqual(result.canvasMutations, [0, 0, 0], name + ': 闲置期间不能反复修改画布尺寸/重挂画布');
    assert.deepEqual(result.clears, [0, 0, 0], name + ': 闲置期间不能反复清空重绘');
    assert.ok(result.resizeCounts.every(n => n <= 1), name + ': 除首次回调外不能继续触发 resize');
    result.hosts.forEach((host, i) => {
      assert.ok(host.height >= 180 && host.width >= 200, name + ': 保留可读绘图区 ' + JSON.stringify(host));
      const card = result.cards[i], business = result.business;
      assert.ok(host.y + host.height <= card.y + card.height + 1 && host.x + host.width <= card.x + card.width + 1);
      assert.ok(card.x >= business.x && card.x + card.width <= business.x + business.width + 1);
      result.cards.slice(i + 1).forEach(other => {
        const overlapX = Math.min(card.x + card.width, other.x + other.width) - Math.max(card.x, other.x);
        const overlapY = Math.min(card.y + card.height, other.y + other.height) - Math.max(card.y, other.y);
        assert.ok(overlapX <= 0 || overlapY <= 0, name + ': 三张卡片互不重叠');
      });
    });
    return result;
  }

  try {
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
    await page.getByPlaceholder('请输入EID账号').fill('teacher');
    await page.getByPlaceholder('请输入密码', { exact: true }).fill('demo123456');
    await page.getByPlaceholder('请输入验证码').fill('1234');
    await page.getByRole('button', { name: '立即登录' }).click(); await page.waitForURL('**/source');
    await dock(); await page.getByText('学情分析', { exact: true }).first().click();
    for (const width of [1440, 1920, 1600, 1280, 1024]) {
      await page.setViewportSize({ width, height: 960 });
      await stable(`侧栏 ${width}px`, width === 1440 ? 5000 : 2200); await cellsFit();
      const scroll = page.locator('.cluster_table .ant-table-body');
      await scroll.evaluate(e => { e.scrollLeft = e.scrollWidth; }); await cellsFit();
      await scroll.evaluate(e => { e.scrollLeft = 0; });
      check(`侧栏 ${width}px：单元格无越界，三图持续采样稳定，横向滚动正常`);
      if (width === 1440 || width === 1024) {
        await page.locator('.analysis_distribution').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(output, `table-sidebar-${width}.png`) });
        await page.locator('.analysis_charts').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(output, `charts-sidebar-${width}.png`) });
      }
    }

    await page.setViewportSize({ width: 1440, height: 960 }); await ready();
    const handles = await page.locator('.analysis_charts canvas').elementHandles();
    const requestCount = await page.evaluate(() => window.__analysisTest.requests.length);
    for (let i = 0; i < 3; i++) {
      await float(); await stable(`浮窗切换 ${i}`); await cellsFit();
      await dock(); await stable(`侧栏切换 ${i}`); await cellsFit();
    }
    assert.equal(await page.evaluate(() => window.__analysisTest.requests.length), requestCount);
    for (let i = 0; i < handles.length; i++) assert.ok(await handles[i].evaluate((canvas, i) => canvas === document.querySelectorAll('.analysis_charts canvas')[i], i));
    check('反复浮窗/侧栏切换保留画布，不重请求，不重复播放图表动画');

    await page.locator('.analysis_distribution').getByText('知识图谱', { exact: true }).click();
    await page.locator('.analysis_distribution .kg_svg').waitFor(); await stable('图谱视图');
    await page.getByText('分布表格', { exact: true }).click(); await stable('返回表格'); await cellsFit();
    check('表格/图谱切换不压缩三图高度');

    await page.locator('.analysis-class-select').click();
    await page.locator('.ant-select-dropdown:visible .ant-select-item-option').nth(1).click();
    await stable('切换班级'); await cellsFit();
    await page.locator('.teacher_profile_filter .source-chip').filter({ hasText: '考试记录' }).click();
    await stable('切换数据来源'); await cellsFit();
    await page.locator('.teacher_profile_filter .ant-picker-input input').first().click();
    await page.locator('.ant-picker-presets').getByText('近三个月', { exact: true }).click();
    await stable('切换日期'); await cellsFit();
    check('班级、来源、日期重新取数后三图与分布表保持稳定');

    await page.locator('.analysis_charts .ia_link').click();
    await page.getByRole('dialog').waitFor(); await stable('明细弹窗打开');
    await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
    await stable('明细弹窗关闭');
    check('人机交互明细弹窗正常，打开关闭不会重新初始化三图');

    await page.evaluate(() => { window.__analysisTest.edges = true; });
    await page.locator('.teacher_profile_filter .source-chip').filter({ hasText: '人机交互' }).click();
    await page.locator('.ct_ci_p').filter({ hasText: /^100%$/ }).waitFor();
    await stable('零值满值长名称'); await cellsFit();
    check('0%/100%、百人人数、长知识点名称不造成分布和掌握度重叠');

    await page.evaluate(() => { window.__analysisTest.empty = true; });
    await page.locator('.teacher_profile_filter .source-chip').filter({ hasText: '自主练习' }).click();
    await page.locator('.cluster_table .ant-empty').waitFor(); await stable('空数据');
    check('空数据保留稳定图表尺寸，无页面异常');
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ passed, errors, measurements }, null, 2));
  } catch (error) {
    await page.screenshot({ path: path.join(output, 'failure.png') });
    fs.writeFileSync(path.join(output, 'failure.json'), JSON.stringify({ error: error.stack, errors, measurements, text: await page.locator('body').innerText() }, null, 2));
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
