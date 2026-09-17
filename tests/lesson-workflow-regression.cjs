const assert = require('node:assert/strict'), fs = require('node:fs');
require.extensions['.ts'] = (m, f) => m._compile(require('esbuild').transformSync(fs.readFileSync(f, 'utf8'), { loader: 'ts', format: 'cjs' }).code, f);
const plans = require('../mock/teachPlan.ts').default;
const homework = require('../mock/teacher/recommend.ts').default;
const profile = require('../mock/teacher/profile.ts').default;
const call = (routes, route, req = {}) => { let result; routes[route](req, { json: r => { result = r; } }); return result; };
const classes = call(profile, 'GET /api/teacher/classes').data;
for (const type of [1, 2]) {
  let stream = '';
  const classId = classes[type - 1].class_id;
  plans['POST /api/teach_plan/teach_maker']({ body: { title: type === 1 ? '16.1 二次根式' : '第16章 二次根式', type, class_id: classId } }, {
    writeHead() {}, write(s) { stream += s; }, end() {},
  });
  const id = stream.split('\n\n').filter(Boolean).map(line => JSON.parse(line.slice(6))).find(item => item.__action === 'end').id;
  const detail = call(plans, 'GET /api/teach_plan/teach_plan_history/:id', { params: { id } }).data;
  const history = call(plans, 'GET /api/teach_plan/teach_plan_history/list').data.list.find(item => item.id === id);
  assert.equal(detail.class_id, classId); assert.equal(history.class_id, classId);
  assert.equal(detail.type, type); assert.equal(history.type, type);
}
assert.equal(call(plans, 'GET /api/teach_plan/teach_plan_history/:id', { params: { id: 'tp-001' } }).data.class_id, '');
console.log('PASS 课时和单元教案保存类型及关联班级，旧教案不猜测班级');
for (const class_id of ['', 'missing']) assert.equal(call(homework, 'POST /api/teacher/teaching/assign-homework', { body: { from: 'plan', class_id } }).code, 400);
const class_id = classes[1].class_id;
const published = call(homework, 'POST /api/teacher/teaching/assign-homework', { body: { from: 'plan', class_id, chapter: '16.1 二次根式' } });
assert.equal(published.code, 200);
const records = call(homework, 'GET /api/teacher/recommend/homework', { query: { class_id } }).data;
assert.equal(records.find(item => item.homework_id === published.data.homework_id).class_id, class_id);
console.log('PASS 拒绝空或失效班级，作业实际写入教师选择的班级');
