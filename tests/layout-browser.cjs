const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const output = path.resolve(__dirname, '../.temp/layout'); fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } }); page.setDefaultTimeout(15000);
  const errors = [], passed = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    window.__layoutTest = { resizes: 0, requests: [], failGraph: false };
    window.addEventListener('resize', () => window.__layoutTest.resizes++);
    const wrap = fn => async (input, init) => {
      const url = String(input); if (url.includes('/api/')) window.__layoutTest.requests.push(url);
      if (window.__layoutTest.failGraph && url.includes('/resource/kgraph')) return new Response(JSON.stringify({ code: 500, msg: '首次图谱请求失败' }));
      return fn(input, init);
    };
    let current = wrap(window.fetch.bind(window));
    Object.defineProperty(window, 'fetch', { configurable: true, get: () => current, set: fn => { current = wrap(fn); } });
  });
  const menu = text => page.getByText(text, { exact: true }).first();
  const check = async name => { assert.deepEqual(errors, [], name); passed.push(name); console.log('PASS ' + name); };
  const dock = async () => { if (await page.getByRole('button', { name: '切换到右侧栏', exact: true }).count()) await page.getByRole('button', { name: '切换到右侧栏', exact: true }).click(); };
  const float = async () => { if (await page.getByRole('button', { name: '切换到右下角', exact: true }).count()) await page.getByRole('button', { name: '切换到右下角', exact: true }).click(); };
  async function fits(selector, parent = '.content_wrap') {
    const child = await page.locator(selector).first().boundingBox(), host = await page.locator(parent).first().boundingBox();
    assert.ok(child && host && child.x >= host.x - 2 && child.x + child.width <= host.x + host.width + 2, JSON.stringify({ selector, child, host }));
  }
  async function graphReady() {
    await page.waitForFunction(() => {
      const g = document.querySelector('.kg_svg'), n = document.querySelector('.kg-node')?.parentElement;
      return g && getComputedStyle(g).visibility === 'visible' && n?.getAttribute('transform')?.includes('translate');
    });
    assert.equal(await page.locator('.kg_toolbar').evaluate(e => getComputedStyle(e).display), 'flex');
    assert.equal(await page.locator('.kg_wrap').evaluate(e => getComputedStyle(e).position), 'relative');
    assert.notEqual(await page.locator('.kg_svg').evaluate(e => getComputedStyle(e).backgroundImage), 'none');
    await fits('.kg_tab'); await fits('.kg_svg', '.kg_tab_main');
    const stable = await page.evaluate(async () => {
      const widths = [];
      for (let i = 0; i < 30; i++) { await new Promise(requestAnimationFrame); widths.push(document.querySelector('.kg_wrap').clientWidth); }
      return new Set(widths).size;
    });
    assert.equal(stable, 1, 'graph container must not grow/shrink in a resize feedback loop');
  }
  try {
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173');
    await page.getByPlaceholder('请输入EID账号').fill('teacher'); await page.getByPlaceholder('请输入密码', { exact: true }).fill('demo123456');
    await page.getByPlaceholder('请输入验证码').fill('1234'); await page.getByRole('button', { name: '立即登录' }).click(); await page.waitForURL('**/source');
    await page.getByRole('tab', { name: '知识图谱', exact: true }).click(); await graphReady();
    assert.equal(await page.locator('.kg_svg').evaluate(svg => {
      const bounds = svg.getBoundingClientRect();
      return [...svg.querySelectorAll('.kg-node')].every(n => { const r = n.getBoundingClientRect(); return r.x >= bounds.x && r.y >= bounds.y && r.right <= bounds.right && r.bottom <= bounds.bottom; });
    }), true, 'initial nodes must stay within the visible graph');
    await page.screenshot({ path: path.join(output, 'graph-first-entry.png') });
    await check('全新登录直接进入资源图谱，样式和尺寸完整，不依赖先访问学情');

    await page.locator('.kg_search input').fill('二次根式'); await page.locator('.kg_search input').press('Enter');
    await page.waitForFunction(() => document.querySelector('.kg_zoom')?.textContent === '×1.9'); await page.waitForTimeout(750);
    const svg = await page.locator('.kg_svg').elementHandle();
    const before = await page.evaluate(() => ({ requests: window.__layoutTest.requests.length, resizes: window.__layoutTest.resizes }));
    await page.evaluate(() => {
      window.__dockFrameFailures = []; window.__sampleDockFrames = true;
      const sample = () => {
        const workspace = document.querySelector('.ga_workspace--sidebar'), chat = document.querySelector('.ga_panel--sidebar'), main = document.querySelector('.layout_content');
        if (workspace && chat && main && innerWidth >= 1000) {
          const a = chat.getBoundingClientRect(), b = main.getBoundingClientRect();
          if (Math.abs(b.right - a.left) > 1) window.__dockFrameFailures.push({ pageRight: b.right, chatLeft: a.left });
        }
        if (window.__sampleDockFrames) requestAnimationFrame(sample);
      }; requestAnimationFrame(sample);
    });
    for (let i = 0; i < 3; i++) {
      await dock(); await graphReady();
      await fits('.layout_content', '.ga_workspace');
      const business = await page.locator('.layout_content').boundingBox(), assistant = await page.locator('.ga_panel').boundingBox();
      assert.ok(business.x + business.width <= assistant.x + 1);
      assert.equal(await page.locator('.kg_zoom').innerText(), '×1.9');
      assert.equal(await svg.evaluate(el => el === document.querySelector('.kg_svg')), true);
      await float(); await graphReady();
    }
    assert.equal(await page.evaluate(() => window.__layoutTest.requests.length), before.requests);
    assert.equal(await page.evaluate(() => window.__layoutTest.resizes), before.resizes);
    assert.deepEqual(await page.evaluate(() => { window.__sampleDockFrames = false; return window.__dockFrameFailures; }), []);
    await check('反复浮窗/侧栏切换不重挂页面、不重请求、不广播全局resize，图谱缩放保持');

    await dock(); await graphReady();
    await page.locator('.kg_reset').click();
    assert.equal(await page.locator('.kg_svg').evaluate(e => e.__zoom.k), 1);
    assert.equal(await page.locator('.kg_zoom').innerText(), '×1.0');
    await page.locator('.kg_tab .kg-node').nth(2).evaluate(e => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await page.locator('.kg_ex_name').waitFor(); await graphReady();
    const graph = await page.locator('.kg_tab_main').boundingBox(), detail = await page.locator('.kg_tab_side').boundingBox();
    assert.ok(detail.y >= graph.y + graph.height - 1, 'narrow business column stacks the explanation below the graph');
    await page.screenshot({ path: path.join(output, 'graph-docked-detail.png') });
    await page.evaluate(() => document.querySelector('.main-content').dispatchEvent(new Event('scroll')));
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.ga_panel--faded').count(), 0);
    await check('侧栏下图谱与节点解释不重叠，复位同步缩放状态，页面滚动不闪烁侧栏');

    await page.getByRole('tab', { name: '公共题库', exact: true }).click(); await page.locator('.list-panel .question-card').first().waitFor();
    await fits('.main-content-right'); await fits('.list-panel');
    await check('题库列表在侧栏占位后按可用宽度显示');
    await page.reload(); await page.getByRole('tab', { name: '知识图谱', exact: true }).click(); await graphReady();
    assert.equal(await page.locator('.ga_workspace--sidebar').count(), 1);
    await check('保存侧栏偏好后刷新仍直接按正确尺寸初始化图谱');

    await menu('学情分析').click(); await page.locator('.teacher_profile_container').waitFor();
    await fits('.dim_card_full');
    const chart = page.locator('.dim_radar_main .echarts-for-react'); await chart.waitFor();
    await page.waitForFunction(() => { const h = document.querySelector('.dim_radar_main .echarts-for-react'), canvas = h?.querySelector('canvas'); return h && canvas && Math.abs(canvas.getBoundingClientRect().width - h.clientWidth) < 2; });
    await check('班级学情雷达图跟随容器尺寸，未挤出页面区域');

    await menu('教学设计').click(); await page.getByRole('button', { name: '历史记录', exact: true }).click();
    await page.locator('.teach-design-left .list-item').filter({ hasText: '16.1 二次根式' }).first().click();
    await page.waitForURL('**/design/hour'); await page.locator('.hour-design .ant-splitter-vertical').waitFor();
    const left = await page.locator('.hour-design-left').boundingBox(), right = await page.locator('.hour-design-right').boundingBox();
    assert.ok(right.y >= left.y + left.height - 2);
    await fits('.hour-design-right');
    await page.screenshot({ path: path.join(output, 'lesson-docked.png') });
    await float(); await page.locator('.hour-design .ant-splitter-horizontal').waitFor();
    await dock(); await page.locator('.hour-design .ant-splitter-vertical').waitFor();
    await check('教案根据页面实际宽度切换上下/左右布局，不受浏览器宽度误判');

    await menu('资源平台').click(); await page.getByRole('tab', { name: '知识图谱', exact: true }).click(); await graphReady();
    for (const width of [1024, 1199, 1200, 1600]) {
      await page.setViewportSize({ width, height: 960 }); await graphReady();
      const b = await page.locator('.layout_content').boundingBox(), a = await page.locator('.ga_panel').boundingBox(); assert.ok(b.x + b.width <= a.x + 1);
    }
    await check('跨越原侧栏断点和窗口缩放时，图谱宽度稳定且无重叠');

    await page.setViewportSize({ width: 390, height: 844 }); await float(); await graphReady();
    assert.ok((await page.locator('.ga_panel').boundingBox()).width <= 390);
    await check('窄屏保留浮窗入口，图谱按容器绘制');

    await page.setViewportSize({ width: 1440, height: 960 }); await page.reload();
    await page.evaluate(() => { window.__layoutTest.failGraph = true; });
    await page.getByRole('tab', { name: '知识图谱', exact: true }).click();
    await page.locator('.kg_tab .ant-alert').waitFor();
    await page.evaluate(() => { window.__layoutTest.failGraph = false; });
    await page.locator('.kg_tab').getByRole('button', { name: /重\s*试/ }).click(); await graphReady();
    await check('首次请求失败可直接重试恢复，无需整页刷新');
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ passed, errors }, null, 2));
  } catch (e) { await page.screenshot({ path: path.join(output, 'failure.png') }); fs.writeFileSync(path.join(output, 'failure.txt'), e.stack + '\n' + await page.locator('body').innerText()); throw e; }
  finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
