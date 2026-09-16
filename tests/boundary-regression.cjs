const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const { transformSync } = require('esbuild');
require.extensions['.ts'] = (mod, file) => mod._compile(transformSync(fs.readFileSync(file, 'utf8'), { loader: 'ts', format: 'cjs' }).code, file);
const load = p => require(path.resolve(__dirname, '..', p));
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const pending = [];
let token = 'session-a';
let redirects = 0;
const history = { location: { pathname: '/source', search: '', hash: '', state: { from: 'test' } }, replace(target, state) { redirects++; this.location = typeof target === 'string' ? { pathname: target } : { ...target, state }; } };
global.window = { location: { pathname: '/source' } };
global.localStorage = { clear() { token = ''; }, removeItem() {} };
global.sessionStorage = { setItem() {} };
global.fetch = (url, opts) => { const d = deferred(); pending.push({ ...d, url, opts }); return d.promise; };
const original = Module._load;
Module._load = function(id, parent, main) {
  if (id === 'antd') return { message: { error() {}, warning() {} } };
  if (id === '@@/core/history' || id === '@umijs/max') return { history };
  if (id === '@/utils/index') return { getStorageToken: () => token, getRequestParams: (url, options) => ({ newUrl: url, payload: options.payload }) };
  if (id === 'query-string') return { stringify: data => new URLSearchParams(data).toString() };
  if (id === '../services') return { postDataService: () => {} };
  if (id === '@/utils') return { getDataRequest() {}, postDataRequest() {} };
  if (id === '@/utils/host') return { cogUrl: '/api' };
  if (id === '@/utils/request') return load('src/utils/request.ts');
  return original.call(this, id, parent, main);
};
const json = (value, status = 200) => new Response(JSON.stringify(value), { status });

(async () => {
  const { requestJson } = load('src/utils/request.ts');
  for (const method of ['PUT', 'PATCH']) {
    const p = requestJson('/edit', { method, payload: { title: '100% 中文 & ?' } });
    const req = pending.at(-1);
    assert.deepEqual(JSON.parse(req.opts.body), { title: '100% 中文 & ?' });
    req.resolve(json({ code: 200 })); await p;
  }
  const p = requestJson('/search?scope=all', { method: 'GET', payload: { keyword: '50% & ? 中文' } });
  const params = new URL(pending.at(-1).url, 'http://local').searchParams;
  assert.equal(params.get('scope'), 'all');
  assert.equal(params.get('keyword'), '50% & ? 中文');
  pending.at(-1).resolve(json({ code: 200 })); await p;

  const old = requestJson('/old-session', { method: 'GET' });
  token = 'session-b'; pending.at(-1).resolve(json({ code: 401 }, 401)); await old;
  assert.equal(token, 'session-b'); assert.equal(redirects, 0, 'late 401 must preserve the newer session');
  for (const businessCode of [false, true]) {
    token = `fresh-${businessCode}`; history.location.pathname = '/source';
    const logout = requestJson('/expired', { method: 'GET' });
    pending.at(-1).resolve(json({ code: 401 }, businessCode ? 200 : 401)); await logout;
    assert.equal(token, ''); assert.equal(history.location.pathname, '/login');
  }
  assert.equal(redirects, 2, 'logging in again must not permanently disable later expiry handling');
  history.location = { pathname: '/learning-analysis', search: '?keep=yes', hash: '#anchor', state: { from: 'test' } };
  const { replacePageQuery } = load('src/utils/pageQuery.ts');
  replacePageQuery({ tab: 'personal', student_id: '学生 & 1' });
  assert.equal(new URLSearchParams(history.location.search).get('student_id'), '学生 & 1');
  assert.equal(history.location.hash, '#anchor'); assert.deepEqual(history.location.state, { from: 'test' });
  const before = redirects; replacePageQuery({ tab: 'personal', student_id: '学生 & 1' });
  assert.equal(redirects, before, 'unchanged query should not trigger another navigation');

  // Execute concurrent model effects with deferred service results and real reducer updates.
  const model = load('src/pages/ResourceSearch/models/index.ts').default;
  let state = { ...model.state };
  const jobs = [];
  const effects = {
    select: fn => fn({ resourceSearchModel: state }),
    put: action => { state = model.reducers[action.type](state, action); },
    call: () => { const d = deferred(); jobs.push(d); return d.promise; },
  };
  async function run(args) {
    const gen = model.effects.getLatestQuestions(args, effects);
    let result = gen.next();
    while (!result.done) result = gen.next(result.value instanceof Promise ? await result.value : result.value);
    return result.value;
  }
  const args = { payload: { current: 1, size: 10 }, pagination: state.pagination };
  const stale = run(args), latest = run(args);
  jobs[1].resolve({ code: 200, data: { records: [{ id: 'latest' }], total: 1 } }); await latest;
  jobs[0].resolve({ code: 200, data: { records: [{ id: 'stale' }], total: 99 } }); await stale;
  assert.equal(state.questionList[0].id, 'latest'); assert.equal(state.pagination.total, 1);
  const leaving = run(args); state = model.reducers.invalidateQuestions(state);
  jobs[2].resolve({ code: 200, data: { records: [{ id: 'after-unmount' }] } }); await leaving;
  assert.equal(state.questionList[0].id, 'latest');
  const failed = run(args); jobs[3].resolve({ code: 500 }); await failed;
  assert.equal(state.questionLoading, false); assert.ok(state.questionError);
  const service = load('src/pages/ResourceSearch/services/index.ts');
  const aRead = service.postDataService({}, 'postGlobalQuestions'), aReq = pending.at(-1);
  const bRead = service.postDataService({}, 'postGlobalQuestions'), bReq = pending.at(-1);
  assert.equal(aReq.opts.signal.aborted, true);
  aReq.resolve(json({ code: 200 })); await aRead;
  const cRead = service.postDataService({}, 'postGlobalQuestions'), cReq = pending.at(-1);
  assert.equal(bReq.opts.signal.aborted, true, 'old completion must not discard the current cancel controller');
  bReq.resolve(json({ code: 200 })); cReq.resolve(json({ code: 200 })); await Promise.all([bRead, cRead]);
  console.log('PASS: PUT/PATCH bodies, query encoding, expired/new sessions, router query preservation, list races/unmount/failure');
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => { Module._load = original; });
