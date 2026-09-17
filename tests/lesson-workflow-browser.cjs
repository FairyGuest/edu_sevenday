const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';
fs.mkdirSync('.temp/lesson-workflow', { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.setDefaultTimeout(15000);
  const errors = [], passed = [];
  page.on('pageerror', e => errors.push(e.message));
  const pass = name => { passed.push(name); console.log('PASS ' + name); };
  await page.addInitScript(() => {
    window.__lessonFault = {};
    window.__lessonPosts = [];
    function wrap(fetcher) {
      return async (input, init) => {
        const url = String(input), fault = window.__lessonFault;
        const json = data => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
        if (url === '/api/teacher/classes') {
          if (fault.classes === 'fail') return json({ code: 500, msg: '班级加载失败测试' });
          if (fault.classes === 'empty') return json({ code: 200, data: [] });
        }
        if (fault.suggestions && url.includes('/suggestions')) return json({ code: 500, msg: '画像建议不可用' });
        if (url.includes('assign-homework')) {
          window.__lessonPosts.push(JSON.parse(init.body));
          await new Promise(resolve => setTimeout(resolve, 350));
          if (fault.publish) return json({ code: 500, msg: '发布失败测试，可重试' });
        }
        return fetcher(input, init);
      };
    }
    let current = wrap(window.fetch.bind(window));
    Object.defineProperty(window, 'fetch', { configurable: true, get: () => current, set: fn => { current = wrap(fn); } });
  });
  const fault = value => page.evaluate(v => { window.__lessonFault = v; }, value);
  const postCount = () => page.evaluate(() => window.__lessonPosts.length);
  const dialog = () => page.getByRole('dialog', { name: '选择班级发布作业' });
  const openPublish = async () => { await page.locator('.plan_viewer').getByRole('button', { name: '布置作业' }).click(); await dialog().waitFor(); };
  const selectClass = async label => {
    await dialog().locator('.ant-select-selector').click();
    await page.locator('.ant-select-dropdown:visible .ant-select-item-option').filter({ hasText: label }).click();
  };
  const selectHistory = async title => {
    await page.getByText('教学设计', { exact: true }).first().click();
    await page.locator('.teach-design').waitFor();
    const historyToggle = page.getByRole('button', { name: '历史记录', exact: true });
    if (await historyToggle.isVisible()) await historyToggle.click();
    await page.locator('.teach-design-left .list-item').filter({ hasText: title }).first().click();
    await page.locator('.create-content .markdown_container').first().waitFor();
  };
  const filled = async kind => {
    await page.waitForTimeout(300);
    const sizes = await page.evaluate(kind => {
      const root = document.querySelector(`.${kind}-design .ant-splitter`);
      const panels = [...root.children].filter(el => el.classList.contains('ant-splitter-panel'));
      const vertical = root.classList.contains('ant-splitter-vertical');
      const axis = vertical ? 'height' : 'width';
      return { extent: root.getBoundingClientRect()[axis], total: panels.reduce((n, el) => n + el.getBoundingClientRect()[axis], 0), vertical };
    }, kind);
    assert.ok(Math.abs(sizes.extent - sizes.total) < 3, `${kind} splitter unused space: ${JSON.stringify(sizes)}`);
    return sizes;
  };
  try {
    await page.goto(base);
    await page.getByPlaceholder('请输入EID账号').fill('teacher');
    await page.getByPlaceholder('请输入密码', { exact: true }).fill('demo123456');
    await page.getByPlaceholder('请输入验证码').fill('1234');
    await page.getByRole('button', { name: '立即登录' }).click();
    await page.waitForURL('**/source');
    await selectHistory('16.1 二次根式');
    const classes = await page.evaluate(async () => (await (await fetch('/api/teacher/classes')).json()).data);
    assert.ok(classes.length >= 2);
    const [first, second] = classes;
    for (const kind of ['hour', 'unit']) {
      if (kind === 'unit') {
        // Generate through the real demo API, then reopen its saved class association via history.
        await page.evaluate(async classId => { await (await fetch('/api/teach_plan/teach_maker', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '第16章 二次根式', type: 2, class_id: classId }),
        })).text(); }, first.class_id);
        await selectHistory('第16章 二次根式');
        await page.waitForURL('**/design/unit');
      }
      await filled(kind);
      await page.getByRole('button', { name: '切换到右侧栏' }).click(); await filled(kind);
      await page.getByRole('button', { name: '切换到右下角' }).click(); await filled(kind);
      await page.setViewportSize({ width: 1024, height: 1080 });
      assert.equal((await filled(kind)).vertical, true);
      await page.setViewportSize({ width: 1920, height: 1080 });
      assert.equal((await filled(kind)).vertical, false);
      const dragger = page.locator(`.${kind}-design .ant-splitter-bar-dragger`).first();
      const box = await dragger.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + 50);
      await page.mouse.down(); await page.mouse.move(box.x + 120, box.y + 50, { steps: 5 }); await page.mouse.up();
      await filled(kind);
      // The page's own preview/full-width buttons trigger the same collapse controls.
      const collapseEnd = page.locator(`.${kind}-design .ant-splitter-bar-collapse-bar-end`);
      await collapseEnd.evaluate(el => el.click());
      await filled(kind);
      assert.ok((await page.locator(`.${kind}-design-right`).boundingBox()).width < 1);
      await page.locator(`.${kind}-design .ant-splitter-bar-collapse-bar-start`).evaluate(el => el.click());
      await filled(kind);
      await page.screenshot({ path: `.temp/lesson-workflow/${kind}-layout.png` });
      pass(`${kind}: 侧栏、窄屏往返和拖拽后分栏铺满`);
      await page.getByRole('button', { name: '生成课件', exact: true }).click();
      await page.locator('.plan_viewer').waitFor();
      const viewerBox = await page.locator('.plan_viewer').boundingBox();
      assert.ok(viewerBox.width >= 1850);
      await page.getByRole('button', { name: '全屏预览', exact: true }).click();
      assert.equal((await page.locator('.plan_viewer').boundingBox()).width, 1920);
      await page.getByRole('button', { name: '退出全屏预览', exact: true }).click();
      await openPublish();
      await page.getByLabel('发布班级', { exact: true }).waitFor();
      if (kind === 'hour') {
        assert.ok(await dialog().getByRole('button', { name: '确认发布', exact: true }).isDisabled());
        await selectClass(second.class_name);
        await page.keyboard.press('Escape');
        await dialog().waitFor({ state: 'hidden' });
        assert.equal(await postCount(), 0);
        assert.equal(await page.locator('.plan_viewer').count(), 1);
        await openPublish();
        assert.ok(await dialog().getByRole('button', { name: '确认发布', exact: true }).isDisabled());
        await selectClass(second.class_name);
      } else {
        assert.equal(await dialog().locator('.ant-select-selection-item').innerText(), first.class_name);
        await selectClass(second.class_name);
      }
      const before = await postCount();
      await fault({ publish: true });
      await dialog().getByRole('button', { name: '确认发布', exact: true }).evaluate(el => { el.click(); el.click(); });
      await dialog().getByText('发布失败测试，可重试').waitFor();
      assert.equal(await postCount(), before + 1);
      assert.equal(await dialog().locator('.ant-select-selection-item').innerText(), second.class_name);
      await fault({});
      await dialog().getByRole('button', { name: '确认发布', exact: true }).evaluate(el => { el.click(); el.click(); });
      await dialog().waitFor({ state: 'hidden' });
      assert.equal(await postCount(), before + 2);
      assert.equal(await page.evaluate(() => window.__lessonPosts.at(-1).class_id), second.class_id);
      const records = await page.evaluate(async () => (await (await fetch('/api/teacher/recommend/homework')).json()).data);
      const published = records.filter(item => item.homework_id.startsWith('hw-plan-'));
      assert.ok(published.length > 0);
      assert.ok(published.every(item => item.class_id === second.class_id));
      pass(`${kind}: 默认班级、改选、取消、发布失败重试和双击保护`);

      await fault({ classes: 'fail' }); await openPublish();
      await dialog().getByText('班级加载失败测试').waitFor();
      await fault({ classes: 'empty' }); await dialog().getByRole('button', { name: /重\s*试/ }).click();
      await dialog().getByText('暂无可发布的班级，请先添加任教班级').waitFor();
      assert.ok(await dialog().getByRole('button', { name: '确认发布', exact: true }).isDisabled());
      await fault({}); await dialog().getByRole('button', { name: /刷\s*新/ }).click();
      await page.getByLabel('发布班级', { exact: true }).waitFor();
      await dialog().getByRole('button', { name: /取\s*消/ }).click();
      await page.setViewportSize({ width: 480, height: 900 });
      await page.waitForTimeout(300);
      assert.ok(await page.locator('.plan_viewer_toolbar').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
      assert.ok(await page.locator('.plan_viewer_doc_body').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
      await page.screenshot({ path: `.temp/lesson-workflow/${kind}-preview-mobile.png` });
      await page.getByRole('button', { name: '关闭教案预览' }).click();
      await page.setViewportSize({ width: 1920, height: 1080 });
      pass(`${kind}: 空班级、失败重载和窄屏预览无横向溢出`);
    }
    // Switching back to an unrelated plan must not reuse the previous publication target.
    await selectHistory('16.2 二次根式的乘除');
    await page.getByRole('button', { name: '生成课件', exact: true }).click();
    await openPublish(); await page.getByLabel('发布班级', { exact: true }).waitFor();
    assert.ok(await dialog().getByRole('button', { name: '确认发布', exact: true }).isDisabled());
    await dialog().getByRole('button', { name: /取\s*消/ }).click();
    await page.getByRole('button', { name: '关闭教案预览' }).click();
    const invalid = await page.evaluate(async () => (await (await fetch('/api/teacher/teaching/assign-homework', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'plan', class_id: 'missing' }),
    })).json()));
    assert.equal(invalid.code, 400);
    pass('切换教案不串班，服务端拒绝无效班级');
    await page.getByText('学情分析', { exact: true }).first().click();
    await fault({ suggestions: true });
    for (const cls of classes) {
      await page.locator('.analysis-class-select').click();
      await page.locator('.ant-select-dropdown:visible .ant-select-item-option').filter({ hasText: cls.class_name }).click();
      await page.waitForTimeout(1800);
      const firstQuick = page.locator('.ga_greeting').last().locator('.ga_quick_btn').first();
      assert.equal(await firstQuick.innerText(), '注入班级学情到教学设计');
      await firstQuick.click();
      await page.waitForURL(url => url.pathname === '/design' && url.searchParams.get('class_id') === cls.class_id);
      await page.getByText('学情分析', { exact: true }).first().click();
    }
    pass('所有班级问候首入口可注入对应班级，画像建议失败不影响入口');
    assert.deepEqual(errors, []);
    fs.writeFileSync('.temp/lesson-workflow/results.json', JSON.stringify({ passed, errors }, null, 2));
    console.log(`Lesson workflow: ${passed.length} passed`);
  } catch (e) {
    await page.screenshot({ path: '.temp/lesson-workflow/failure.png', fullPage: true });
    throw e;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
