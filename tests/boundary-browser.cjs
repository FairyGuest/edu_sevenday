const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const output = path.resolve(__dirname, '../.temp/boundary');
fs.mkdirSync(output, { recursive: true });
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(15000);
  const errors = [], passed = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    window.__requests = [];
    window.__fault = JSON.parse(sessionStorage.getItem('boundary-fault') || '{}');
    // Demo APIs execute in the browser; wrap each fetch implementation with a stable closure.
    function wrap(fetcher) {
      return async function(input, init) {
        const url = String(input), fault = window.__fault;
        const record = { url, body: init?.body, start: performance.now() };
        if (url.includes('/api/')) window.__requests.push(record);
        const json = d => new Response(JSON.stringify(d), { headers: { 'Content-Type': 'application/json' } });
        if (fault.delayMatch && url.includes(fault.delayMatch)) await new Promise(r => setTimeout(r, fault.delay || 700));
        if (fault.failMatch && url.includes(fault.failMatch)) return json({ code: 500, msg: '边界测试：请求失败' });
        if (fault.emptyClasses && url.includes('classes_by_user')) return json({ code: 200, data: [] });
        if (fault.truncateStream && url.includes('/teach_maker')) return new Response(`data: ${JSON.stringify({ __action: 'start' })}\n\n`, { headers: { 'Content-Type': 'text/event-stream' } });
        const response = await fetcher(input, init);
        if (fault.grade7 && url === '/api/teacher/classes') {
          const data = await response.clone().json();
          data.data[0].grade = 'g7';
          return json(data);
        }
        if (fault.customBook && url.includes('/banben_ceci')) {
          const data = await response.clone().json();
          data.data[0].children[0].doc_id = 'catalog-returned-id';
          return json(data);
        }
        if (fault.injectMarker && url.includes('/teaching/inject-file')) {
          const data = await response.clone().json();
          data.data.rows = [{ '前置知识点': '边界测试知识点', '班级掌握分布': new URL(url, location.origin).searchParams.get('class_id') }];
          return json(data);
        }
        if (fault.numericScore && /teach_plan_history\/[^/?]+/.test(url) && !url.includes('/list')) {
          const data = await response.clone().json();
          if (data.data) { data.data.evaluate_score = 85; data.data.is_new_evaluate = 0; }
          return json(data);
        }
        if (fault.emptyStudents && url.includes('/profile/class')) {
          const data = await response.clone().json();
          if (data.data) data.data.students = [];
          return json(data);
        }
        record.done = performance.now();
        return response;
      };
    }
    let current = wrap(window.fetch.bind(window));
    Object.defineProperty(window, 'fetch', { configurable: true, get: () => current, set: fn => { current = wrap(fn); } });
  });
  const menu = text => page.getByText(text, { exact: true }).first();
  const fault = async value => page.evaluate(v => { window.__fault = v; sessionStorage.setItem('boundary-fault', JSON.stringify(v)); }, value);
  async function healthy(name) {
    assert.equal(await page.getByText('页面渲染异常', { exact: true }).count(), 0, name);
    assert.deepEqual(errors, [], name);
    passed.push(name); console.log(`PASS: ${name}`);
  }
  try {
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder('请输入EID账号').fill('teacher');
    await page.getByPlaceholder('请输入密码', { exact: true }).fill('demo123456');
    await page.getByPlaceholder('请输入验证码').fill('1234');
    await page.getByRole('button', { name: '立即登录' }).click();
    await page.waitForURL('**/source');
    await page.locator('.resource-search-container').waitFor();
    // Error + retry must recover instead of leaving an empty list or infinite spinner.
    await fault({ failMatch: 'findPublicQuestionPage' });
    await menu('教学设计').click(); await page.locator('.teach-design').waitFor();
    await menu('资源平台').click();
    await page.locator('.question-list-section .ant-alert').waitFor();
    await fault({});
    await page.getByRole('button', { name: '让出页面', exact: true }).click();
    await page.locator('.question-list-section').getByRole('button', { name: /重\s*试/ }).click();
    await page.locator('.question-list-section .pagination-wrapper').waitFor();
    await page.getByRole('button', { name: '恢复聊天显示', exact: true }).click();
    await healthy('题库失败显示重试并恢复');

    const roster = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../mock/teacher/data/class-students-cls-g8-02.json'), 'utf8'));
    const student = roster[4];
    const deepUrl = `${base}/learning-analysis?tab=personal&class_id=cls-g8-02&student_id=${student.student_id}`;
    await fault({ delayMatch: 'classes_by_user', delay: 700 });
    await page.goto(deepUrl);
    await page.locator('.pa_panel_sid').filter({ hasText: student.display_id }).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('student_id'), student.student_id);
    assert.equal(new URL(page.url()).searchParams.get('class_id'), 'cls-g8-02');
    await page.reload();
    await page.locator('.pa_panel_sid').filter({ hasText: student.display_id }).waitFor();
    await menu('教学设计').click();
    await page.locator('.teach-design').waitFor();
    await page.goBack();
    await page.locator('.pa_panel_sid').filter({ hasText: student.display_id }).waitFor();
    await healthy('延迟班级列表时深链接和刷新恢复指定班级/学生');

    await fault({});
    const before = await page.evaluate(() => window.__requests.filter(r => r.url.includes('/profile/student')).length);
    await page.locator('.pa_filter .ant-picker').hover();
    await page.locator('.pa_filter .ant-picker-clear').click();
    await page.waitForFunction(n => window.__requests.filter(r => r.url.includes('/profile/student')).length > n, before);
    const dateRequest = await page.evaluate(() => window.__requests.filter(r => r.url.includes('/profile/student')).at(-1));
    assert.equal(new URL(dateRequest.url, base).searchParams.get('start_date'), '');
    const sourceBefore = await page.evaluate(() => window.__requests.length);
    await page.locator('.pa_chips .source-chip').filter({ hasText: '考试记录' }).click();
    await page.waitForFunction(n => window.__requests.slice(n).some(r => r.url.includes('/profile/student') && !decodeURIComponent(r.url).includes('考试记录')), sourceBefore);
    await healthy('个人学情日期/来源变化重新取数');

    await fault({ emptyStudents: true });
    await page.reload();
    await page.locator('.analysis-class-select').waitFor();
    await page.waitForTimeout(900);
    assert.equal(await page.locator('.pa_list_item').count(), 0);
    assert.equal(await page.locator('.pa_panel_sid').count(), 0);
    await healthy('空学生列表不保留旧学生画像');
    await fault({ emptyClasses: true });
    await page.goto(`${base}/learning-analysis`);
    await page.getByText('暂无可查看的班级，请检查班级选择').waitFor();
    assert.equal(await page.locator('.ant-skeleton').count(), 0);
    await healthy('无班级时显示空态且结束加载');

    await fault({});
    await menu('资源平台').click();
    await page.locator('.ga_panel').waitFor();
    await page.locator('.ga_input textarea').fill('解释标签体系');
    await fault({ delayMatch: '/assistant/chat', delay: 700 });
    await page.getByRole('button', { name: '发送消息' }).evaluate(el => { el.click(); el.click(); });
    await page.waitForFunction(() => window.__requests.some(r => r.url.includes('/assistant/chat')));
    assert.equal(await page.evaluate(() => window.__requests.filter(r => r.url.includes('/assistant/chat')).length), 1);
    await page.waitForTimeout(1000);
    assert.ok((await page.locator('.ga_panel').innerText()).includes('解释标签体系'));
    await healthy('助手发送按钮和同帧重复点击');
    await page.locator('.ga_input textarea').fill('这条消息随后离页');
    await page.locator('.ga_input textarea').press('Enter');
    await page.keyboard.press('Escape');
    await menu('教学设计').click();
    await page.waitForTimeout(1000);
    await page.locator('.ga_panel').waitFor();
    assert.ok((await page.locator('.ga_panel').innerText()).includes('这条消息随后离页'));
    await page.getByRole('button', { name: '开始新对话' }).click();
    assert.ok(!(await page.locator('.ga_panel').innerText()).includes('这条消息随后离页'));
    await healthy('助手跨页保留会话，新对话取消旧请求');
    await page.keyboard.press('Escape');

    await fault({});
    await menu('资源平台').click();
    await page.getByText('知识图谱', { exact: true }).last().click();
    await page.locator('.kg_tab svg').first().waitFor();
    await fault({ delayMatch: 'kgraph?grade=g7', delay: 800 });
    await page.locator('.kg_tab').getByText('七年级', { exact: true }).click();
    await page.locator('.kg_tab').getByText('八年级', { exact: true }).click();
    await page.waitForTimeout(1100);
    assert.ok((await page.locator('.kg_tab_note').innerText()).includes('八年级'));
    assert.ok(!(await page.locator('.kg_tab_note').innerText()).includes('七年级'));
    await page.locator('.kg_tab').getByText('九年级', { exact: true }).click();
    await page.waitForTimeout(500);
    await healthy('知识图谱快速切年级及稀疏层级数据');

    await fault({ delayMatch: '/kgraph/explain', delay: 700 });
    await page.locator('.kg_tab').getByText('八年级', { exact: true }).click();
    await page.locator('.kg-node').nth(0).evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await fault({});
    await page.locator('.kg-node').nth(1).evaluate(el => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    const latestNode = await page.evaluate(() => new URL(window.__requests.filter(r => r.url.includes('/kgraph/explain')).at(-1).url, location.origin).searchParams.get('node'));
    await page.waitForTimeout(900);
    assert.equal(await page.locator('.kg_ex_name').innerText(), latestNode);
    await healthy('连续点击图谱节点时旧解释不覆盖新节点');

    await fault({ injectMarker: true });
    await menu('教学设计').click();
    await page.locator('.inject_preview_card .ant-table-row').first().waitFor();
    await fault({ injectMarker: true, delayMatch: 'class-chapters?class_id=cls-g8-02', delay: 800 });
    await page.locator('.inject_preview_selects .ant-select').first().click();
    await page.locator('.ant-select-item-option').filter({ hasText: '八年级(2)班' }).last().click();
    await page.locator('.inject_preview_selects .ant-select').first().click();
    await page.locator('.ant-select-item-option').filter({ hasText: '八年级(3)班' }).last().click();
    await page.locator('.inject_preview_card .ant-table-row').filter({ hasText: 'cls-g8-03' }).waitFor();
    await page.waitForTimeout(1000);
    assert.ok((await page.locator('.inject_preview_card .ant-table-tbody').innerText()).includes('cls-g8-03'));
    await healthy('学情预览快速切班时章节与预览保持当前班级');

    await fault({ numericScore: true });
    await page.locator('.inject_preview_card .ant-table-row').first().waitFor();
    await page.getByRole('button', { name: '历史记录', exact: true }).click();
    await page.locator('.teach-design-left .list-item').filter({ hasText: '16.1 二次根式' }).first().click();
    await page.waitForURL('**/design/hour');
    await page.getByRole('button', { name: '生成课件', exact: true }).click();
    await page.locator('.plan_viewer_score').filter({ hasText: '85' }).waitFor();
    await fault({ delayMatch: 'assign-homework', delay: 700 });
    await page.locator('.plan_viewer').getByRole('button', { name: '布置作业' }).evaluate(el => { el.click(); el.click(); });
    await page.getByLabel('发布班级', { exact: true }).click();
    await page.locator('.ant-select-dropdown:visible .ant-select-item-option').first().click();
    await page.getByRole('button', { name: '确认发布', exact: true }).evaluate(el => { el.click(); el.click(); });
    await page.waitForTimeout(1000);
    assert.equal(await page.evaluate(() => window.__requests.filter(r => r.url.includes('assign-homework')).length), 1);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.plan_viewer_mask').count(), 0);
    await healthy('教案数值评分、预览关闭和重复布置保护');

    await fault({ grade7: true });
    await page.goto(`${base}/design?from=analysis&class_id=cls-g8-01`);
    await page.getByText('未找到该班级对应的教材册别，请手动选择教材', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.__requests.filter(r => r.url.includes('docs_node_tree')).length), 0);
    assert.equal(await page.locator('.selection .cascader-select .ant-select-selection-item').count(), 0);
    await fault({ customBook: true });
    await page.reload();
    await page.waitForFunction(() => window.__requests.some(r => r.url.includes('docs_node_tree') && r.url.includes('catalog-returned-id')));
    await healthy('教材按返回目录匹配，缺失年级教材时不套用八年级ID');
    await page.locator('.selection .chapter-select .ant-select-selector').click();
    await page.locator('.ant-select-tree-title').filter({ hasText: '16.1 二次根式' }).click();
    await page.locator('.selection .custom-cascader .ant-select-selector').click();
    await page.locator('.ant-cascader-menu-item').filter({ hasText: '新授课' }).click();
    await fault({ delayMatch: '/ai/guide/questions', failMatch: '/ai/guide/questions', delay: 800 });
    await page.getByRole('button', { name: '生成教案', exact: true }).click();
    await page.locator('.gf_loading').waitFor();
    await page.locator('.ant-modal:visible .ant-modal-close').evaluate(el => el.click());
    await page.waitForTimeout(1000);
    assert.equal(new URL(page.url()).pathname, '/design', 'closing the guide must not navigate after its delayed failure');
    await fault({ truncateStream: true });
    await page.getByRole('button', { name: '生成教案', exact: true }).click();
    await page.getByRole('button', { name: '跳过引导，直接生成' }).waitFor();
    await page.getByRole('button', { name: '跳过引导，直接生成' }).click();
    await page.waitForURL('**/design/hour');
    await page.getByText('生成中断，请重试', { exact: true }).waitFor();
    assert.equal(await page.locator('.create-right .ant-spin-spinning').count(), 0);
    await menu('教学设计').click();
    await page.locator('.teach-design').waitFor();
    await healthy('SSE提前断流结束加载且可以正常离页');
    await fault({});
    await page.locator('.selection .chapter-select .ant-select-selector').click();
    await page.locator('.ant-select-tree-title').filter({ hasText: '16.1 二次根式' }).click();
    await page.getByRole('button', { name: '生成教案', exact: true }).click();
    await page.getByRole('button', { name: '跳过引导，直接生成' }).click();
    await page.waitForURL('**/design/hour');
    await page.waitForFunction(() => window.__requests.some(r => r.url.includes('/replace_content')));
    const completion = await page.evaluate(() => window.__requests.filter(r => r.url.includes('/replace_content')).at(-1));
    assert.ok(new URL(completion.url, base).searchParams.get('plan_id'), 'generated content must use the end-frame ID');
    await page.getByRole('button', { name: '生成课件', exact: true }).click();
    await page.locator('.plan_viewer').waitFor();
    assert.ok((await page.locator('.plan_viewer_doc_body').innerText()).includes('二次根式'));
    await healthy('关闭引导时取消旧请求，重新生成后保存有效ID并预览');

    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ passed, errors }, null, 2));
    console.log(`PASS: ${passed.length} boundary scenarios; no page errors`);
  } catch (e) {
    await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {});
    fs.writeFileSync(path.join(output, 'failure.txt'), `${e.stack}\n${JSON.stringify(errors)}\n${await page.locator('body').innerText().catch(() => '')}`);
    fs.writeFileSync(path.join(output, 'failure-requests.json'), JSON.stringify(await page.evaluate(() => window.__requests).catch(() => []), null, 2));
    throw e;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
