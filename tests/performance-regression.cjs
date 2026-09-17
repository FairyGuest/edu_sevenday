const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { transformSync } = require('esbuild');
require.extensions['.ts'] = (mod, filename) => mod._compile(transformSync(fs.readFileSync(filename, 'utf8'), { loader: 'ts', format: 'cjs' }).code, filename);
const root = path.resolve(__dirname, '..');
const load = (file) => require(path.join(root, file));
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

async function main() {
  let reads = 0;
  const originalRead = fs.readFileSync;
  fs.readFileSync = function(file, ...args) {
    if (String(file).endsWith('.json') && String(file).includes('teacher')) reads++;
    return originalRead.call(this, file, ...args);
  };
  const profile = load('mock/teacher/profile.ts').default;
  const suggestions = load('mock/teacher/suggestions.ts').default;
  const graph = load('mock/teacher/kgraph.ts').default;
  const call = (routes, route, query = {}) => { let result; routes['GET /api/teacher/' + route]({ query }, { json: r => { result = r; } }); assert.equal(result.code, 200); return result.data; };
  const classes = call(profile, 'classes');
  const cases = [];
  for (const c of classes) {
    const query = { class_id: c.class_id };
    const p = call(profile, 'profile/class', query);
    assert.equal(p.class_id, c.class_id);
    assert.equal(p.students.length, 45);
    assert.strictEqual(call(profile, 'profile/class', query), p);
    const original = JSON.stringify(p);
    const week = call(profile, 'profile/class', { ...query, time_range: 'week' });
    assert.notDeepEqual(week.trend, p.trend);
    const filtered = call(profile, 'profile/class', { ...query, sources: '作业记录,人机交互' });
    assert.strictEqual(call(profile, 'profile/class', { ...query, sources: '人机交互,作业记录' }), filtered);
    call(profile, 'profile/class', { ...query, start_date: '2026-09-01', end_date: '2026-09-16' });
    call(profile, 'profile/class', { ...query, start_date: 'bad', end_date: 'date' });
    assert.equal(JSON.stringify(p), original, 'filtered/date queries must not mutate cached profiles');
    const q = { ...query, student_id: p.students[0].student_id };
    const student = call(profile, 'profile/student', q);
    const evidence = call(profile, 'profile/student/evidence', { ...q, sources: '作业记录' });
    assert.deepEqual(evidence, student.evidence.filter(e => e.source === '作业记录').slice(0, 40));
    cases.push([profile, 'profile/class', query], [profile, 'profile/student', q], [profile, 'profile/student/evidence', q], [suggestions, 'profile/suggestions', query], [suggestions, 'profile/suggestions', q]);
  }
  cases.push([graph, 'resource/kgraph', {}]);
  cases.forEach(c => call(...c));
  const warmReads = reads;
  const times = [];
  for (let i = 0; i < 30; i++) for (const c of cases) {
    const start = performance.now();
    JSON.stringify(call(...c)); // Include response serialization, not just cache lookup.
    times.push(performance.now() - start);
  }
  assert.equal(reads, warmReads, 'warm reads across profile/suggestions/graph must not read fixture files again');
  fs.readFileSync = originalRead;
  times.sort((a, b) => a - b);
  console.log(`Mock: ${times.length} warm responses, JSON reads=${warmReads}, p95=${times[Math.floor(times.length * .95)].toFixed(2)}ms`);
  const { memoizeMock } = load('mock/teacher/fixtures.ts');
  const memo = memoizeMock(2); let computes = 0;
  const compute = () => ++computes;
  memo('a', compute); memo('b', compute); memo('a', compute); memo('c', compute); memo('b', compute);
  assert.equal(computes, 4, 'bounded LRU evicts the least recently used entry');

  const { createReadCache } = load('src/utils/readCache.ts');
  const cache = createReadCache(2, 15);
  const pending = deferred(); let requests = 0;
  const first = cache.get('a', () => { requests++; return pending.promise; });
  assert.strictEqual(cache.get('a', () => assert.fail('duplicate read')), first);
  pending.resolve({ code: 200, data: 1 }); await first;
  assert.equal(requests, 1);
  assert.strictEqual(cache.get('a', () => assert.fail('hot read')), first);
  const now = Date.now; Date.now = () => now() + 1000;
  assert.equal((await cache.get('a', async () => ({ code: 200, data: 2 }))).data, 2);
  Date.now = now;
  await cache.get('error', async () => ({ code: 500 }));
  assert.equal((await cache.get('error', async () => ({ code: 200 }))).code, 200);
  const old = deferred(); const oldRead = cache.get('late', () => old.promise);
  cache.clear();
  const fresh = cache.get('late', async () => ({ code: 200, data: 'fresh' }));
  old.resolve({ code: 200, data: 'old' }); await oldRead;
  assert.strictEqual(cache.get('late', () => assert.fail('invalidated request replaced new cache')), fresh);
  await fresh;

  let token = 'teacher-a'; const fetches = [];
  global.window = { location: { pathname: '/learning-analysis' } };
  global.localStorage = { getItem: () => token };
  global.fetch = (url, opts) => { const d = deferred(); fetches.push({ ...d, url, opts }); return d.promise; };
  const originalLoad = Module._load;
  Module._load = function(id, parent, main) {
    if (id === 'antd') return { message: { error() {}, warning() {} } };
    if (id === '@@/core/history') return { history: { location: { pathname: '/' } } };
    if (id === '@/utils/index') return { getStorageToken: () => token, getRequestParams: (url, opts) => ({ newUrl: url, payload: opts.payload }) };
    if (id === 'query-string') return { stringify: (value) => new URLSearchParams(value).toString() };
    if (id === '@/utils/host') return { cogUrl: '/api' };
    return originalLoad.call(this, id, parent, main);
  };
  const { requestJson } = load('src/utils/request.ts');
  const get = () => requestJson('/data', { method: 'GET', payload: { a: 1 } });
  const a = get(); assert.strictEqual(get(), a);
  token = 'teacher-b'; const b = get(); assert.notStrictEqual(a, b);
  requestJson('/write', { method: 'POST', payload: { a: 1 } });
  requestJson('/write', { method: 'POST', payload: { a: 1 } });
  const controller = new AbortController();
  requestJson('/data', { method: 'GET', payload: { a: 1 }, signal: controller.signal });
  assert.equal(fetches.length, 5, 'GET sharing must not combine users, writes or independently cancellable requests');
  assert.strictEqual(fetches[4].opts.signal, controller.signal);
  assert.notStrictEqual(fetches[0].opts.signal, controller.signal);
  fetches.forEach(f => f.resolve(new Response('{"code":200,"data":1}')));
  await Promise.all([a, b]);
  Module._load = originalLoad;
  console.log('PASS: fixture reuse, class/date/source isolation, evidence, LRU, read TTL/invalidation, GET sharing and write/abort isolation');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
