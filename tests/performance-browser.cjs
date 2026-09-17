/* Install playwright-core separately, then set PLAYWRIGHT_MODULE if not in node_modules. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const output = path.resolve(__dirname, '../.temp/performance');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.text().includes('[demoMock] 未匹配')) errors.push(m.text()); });
  try {
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder('请输入EID账号').fill('teacher');
    await page.getByPlaceholder('请输入密码', { exact: true }).fill('demo123456');
    await page.getByPlaceholder('请输入验证码').fill('1234');
    await page.getByRole('button', { name: '立即登录' }).click();
    await page.waitForURL('**/source');
    await page.locator('.resource-search-container').waitFor();
    await page.evaluate(() => {
      window.__perf = { results: [], requests: [], longTasks: [], delay: false };
      new PerformanceObserver(list => window.__perf.longTasks.push(...list.getEntries().map(e => ({ start: e.startTime, duration: e.duration })))).observe({ type: 'longtask' });
      const fetch = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const url = String(input); const start = performance.now();
        if (window.__perf.delay && url.includes('class_id=cls-g8-02') && url.includes('/profile/class')) await new Promise(r => setTimeout(r, 600));
        if (window.__perf.studentDelay && url.includes(window.__perf.studentDelay) && url.includes('/profile/')) await new Promise(r => setTimeout(r, 600));
        const response = await fetch(input, init);
        if (url.includes('/api/')) {
          const data = await response.clone().json().catch(() => ({}));
          window.__perf.requests.push({ url, ms: performance.now() - start, code: data.code });
        }
        return response;
      };
      window.__measure = (label, selector, text = '') => {
        const start = performance.now();
        const tick = () => {
          const el = document.querySelector(selector);
          if (el && el.textContent.includes(text)) requestAnimationFrame(() => {
            window.__perf.results.push({ label, ms: performance.now() - start });
          });
          else if (performance.now() - start < 10000) requestAnimationFrame(tick);
          else window.__perf.results.push({ label, error: 'Content readiness timed out' });
        };
        requestAnimationFrame(tick);
      };
    });
    async function measureClick(locator, label, selector, text = '') {
      const count = await page.evaluate(() => window.__perf.results.length);
      await locator.evaluate((el, args) => { window.__measure(...args); el.click(); }, [label, selector, text]);
      await page.waitForFunction(n => window.__perf.results.length > n, count);
      const result = await page.evaluate(() => window.__perf.results.at(-1));
      assert.ok(!result.error, JSON.stringify(result));
      console.log(JSON.stringify(result));
    }
    const menu = text => page.getByText(text, { exact: true }).first();
    await measureClick(menu('学情分析'), '资源→学情（首次）', '.teacher_profile_container', 'edu030');
    async function switchClass(n, label = `切换到${n}班`) {
      await page.locator('.analysis-class-select').click();
      await measureClick(page.getByRole('option', { name: `八年级(${n})班`, exact: true }).or(page.locator('.ant-select-item-option').filter({ hasText: `八年级(${n})班` })).last(), label, '.teacher_profile_container', `edu0${n}0`);
    }
    await switchClass(1);
    await switchClass(2);
    await switchClass(3);
    await switchClass(1, '切班返回（缓存）');
    // Delay an uncached class read by changing the source filter first.
    await page.locator('.source-chip').filter({ hasText: '考试记录' }).click();
    await page.evaluate(() => { window.__perf.delay = true; });
    await page.locator('.analysis-class-select').click();
    await page.locator('.ant-select-item-option').filter({ hasText: '八年级(2)班' }).last().click();
    await page.locator('.analysis-class-select').click();
    await page.locator('.ant-select-item-option').filter({ hasText: '八年级(3)班' }).last().click();
    await page.waitForFunction(() => document.querySelector('.teacher_profile_container')?.textContent.includes('edu030'));
    await page.waitForTimeout(750);
    assert.ok((await page.locator('.teacher_profile_container').innerText()).includes('edu030'), 'late class response overwrote current selection');
    await page.evaluate(() => { window.__perf.delay = false; });
    await measureClick(page.getByRole('tab', { name: '👤 个人学情' }), '班级→个人学情', '.pa_panel_sid', 'edu030');
    const firstSid = await page.locator('.pa_panel_sid').innerText();
    const target = page.locator('.pa_list_item').nth(1);
    const targetSid = await target.locator('.pa_sid').innerText();
    await measureClick(target, '切换学生', '.pa_panel_sid', targetSid);
    const delayedDisplayId = await page.locator('.pa_list_item').nth(2).locator('.pa_sid').innerText();
    const roster = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../mock/teacher/data/class-students-cls-g8-03.json'), 'utf8'));
    const delayedId = roster.find(s => s.display_id === delayedDisplayId).student_id;
    await page.evaluate(id => { window.__perf.studentDelay = id; }, delayedId);
    await page.locator('.pa_list_item').nth(2).click();
    const finalSid = await page.locator('.pa_list_item').nth(3).locator('.pa_sid').innerText();
    await page.locator('.pa_list_item').nth(3).click();
    await page.waitForFunction(sid => document.querySelector('.pa_panel_sid')?.textContent === sid, finalSid);
    await page.waitForTimeout(750);
    assert.equal(await page.locator('.pa_panel_sid').innerText(), finalSid, 'late student response overwrote current selection');
    await page.evaluate(() => { window.__perf.studentDelay = null; });
    assert.notEqual(finalSid, firstSid);
    await measureClick(page.getByRole('tab', { name: '🕸 知识图谱' }), '个人→班级知识图谱', '.teacher_profile_container svg');
    await measureClick(menu('资源平台'), '学情→资源平台', '.resource-search-container', '共计');
    await measureClick(page.getByText('知识图谱', { exact: true }).last(), '资源→知识图谱', '.resource-search-container', '学科知识图谱');
    await measureClick(menu('教学设计'), '资源→教学设计', '.teach-design');
    await measureClick(menu('作业组卷'), '教学设计→作业组卷', '.setting_topic_box');
    await measureClick(menu('作业下发'), '组卷→作业下发', '.setting_topic_box');
    await measureClick(menu('学情分析'), '作业→学情（返回）', '.teacher_profile_container', 'edu030');
    await page.locator('.ga_panel').waitFor();
    await page.waitForFunction(() => document.querySelector('.ga_panel')?.textContent.includes('条建议'));
    await page.screenshot({ path: path.join(output, 'analysis-assistant.png') });
    const result = await page.evaluate(() => window.__perf);
    result.errors = errors;
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify(result, null, 2));
    assert.deepEqual(errors, []);
    assert.ok(result.requests.every(r => !r.code || r.code === 200), JSON.stringify(result.requests.filter(r => r.code && r.code !== 200)));
    assert.ok(result.requests.some(r => r.url.includes('/profile/class') && r.ms >= 500), 'class race test must actually delay a request');
    assert.ok(result.requests.some(r => r.url.includes(delayedId) && r.ms >= 500), 'student race test must actually delay a request');
    console.log(`PASS: ${result.results.length} transitions; ${result.requests.length} API calls; no page errors/unmatched demo routes`);
  } catch (error) {
    await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {});
    fs.writeFileSync(path.join(output, 'failure.txt'), `${error.stack}\n${await page.locator('body').innerText().catch(() => '')}`);
    throw error;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
