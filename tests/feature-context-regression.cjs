const assert = require('node:assert/strict');
const fs = require('node:fs');
require.extensions['.ts'] = (m, f) => m._compile(require('esbuild').transformSync(fs.readFileSync(f, 'utf8'), { loader: 'ts', format: 'cjs' }).code, f);
const { classLearningContext } = require('../src/pages/TeachDesign/components/ClassStudyInfo/importContext.ts');
const classes = [
  { class_id: 'a', class_name: '一班', chapter: '全等三角形', preview: { rows: [{ '前置知识点': '全等判定', '班级掌握分布': '20% 待巩固', '典型错例（匿名）': '对应边混淆' }] } },
  { class_id: 'b', class_name: '二班', chapter: '因式分解', preview: { rows: [] }, profile: { cluster_rows: [{ cluster: '提公因式', weak_pct: 42 }] } },
  { class_id: 'c', class_name: '三班', preview: { rows: [] } },
];
const original = JSON.stringify(classes);
const text = classLearningContext(classes);
for (const value of ['一班', '二班', '三班', '全等判定', '20% 待巩固', '对应边混淆', '提公因式：42%', '暂无可参考学情']) assert.ok(text.includes(value), value);
assert.equal(classLearningContext([]), '');
assert.ok(!classLearningContext(classes.slice(1)).includes('一班'));
assert.equal(JSON.stringify(classes), original);
console.log('PASS 多班级生成上下文、无数据说明、移除隔离与快照不变');
