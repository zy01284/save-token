const { compress } = require('./app.js');
const rules = require('./rules.json');
const nat = { ...rules, options: { ...rules.options, keepNatural: true } };
const has = (s) => r => r.compressed.includes(s);
const no = (s) => r => !r.compressed.includes(s);
const eq = (s) => r => r.compressed === s;

const cases = [
  { name: '⑥ 嵌套/相邻占位符', input: '请帮我渲染 `{{name}}` 和 {{a}}{{b}}',
    checks: [['行内代码内变量保留', has('`{{name}}`')], ['相邻变量保留', has('{{a}}{{b}}')], ['删掉"请帮我"', no('请帮我')]] },
  { name: '⑦ 英文大小写', input: 'HELLO, Please Help Me write a Function. Thank You!',
    checks: [['不含 HELLO', r => !/hello/i.test(r.compressed)], ['不含 Please Help Me', r => !/please help me/i.test(r.compressed)],
             ['不含 Thank You', r => !/thank you/i.test(r.compressed)], ['保留 Function 原大小写', has('Function')]] },
  { name: '⑧ 整词边界', input: 'Shellow and chello and hello world',
    checks: [['保留 Shellow', has('Shellow')], ['保留 chello', has('chello')], ['删掉独立 hello', r => !/\bhello\b/.test(r.compressed)], ['保留 world', has('world')]] },
  { name: '⑨ 英文否定词', input: 'Do not use pagination. You must never delete it.',
    checks: [['保留 Do not', has('Do not')], ['保留 must', has('must')], ['保留 never', has('never')]] },
  { name: '⑩ HTML 标签 / 比较符', input: '请帮我看 <div class="a">x</div> 以及 a < b > c',
    checks: [['标签保留', has('<div class="a">')], ['闭合标签保留', has('</div>')], ['比较符原样', has('a < b > c')]] },
  { name: '⑪ merge', input: '这非常非常重要，请仔细认真检查。',
    checks: [['非常重要', has('非常重要')], ['不含"非常非常"', no('非常非常')], ['不含"仔细认真"', no('仔细认真')], ['保留"仔细"', has('仔细')]] },
  { name: '⑫ 空/全删输入不崩溃', input: '',
    checks: [['空串', eq('')], ['全删', () => compress('你好', rules).compressed === '']] },
  { name: '⑬ 规则含正则特殊字符', input: 'use c++ now', custom: { safeDelete: { en: ['c++'] } },
    checks: [['c++ 被删且不报错', eq('use now')]] },
  { name: '⑭ 多行文本', input: '你好\n请帮我写 API\n谢谢',
    checks: [['保留 API', has('API')], ['保留谢谢（已列入保护词）', has('谢谢')], ['不含你好', no('你好')]] },
  { name: '⑮ keepNatural：保留换行与段落', input: '你好\n请帮我写 API\n\n第二段\n谢谢', custom: nat,
    checks: [['保留换行', has('\n')], ['保留空行分段', has('\n\n')], ['保留 API', has('API')], ['不含你好', no('你好')]] },
  { name: '⑯ keepNatural：英文句末无残留标点', input: 'HELLO, Please Help Me write a Function. Thank You!', custom: nat,
    checks: [['输出为 write a Function.', eq('write a Function.')]] }
];

let pass = 0, fail = 0;
cases.forEach(c => {
  console.log(`\n=== ${c.name} ===`);
  console.log('输入:', JSON.stringify(c.input));
  let r;
  try { r = compress(c.input, c.custom || rules); } catch (e) { console.log('  ❌ 抛错:', e.message); fail++; return; }
  console.log('输出:', JSON.stringify(r.compressed));
  c.checks.forEach(([label, fn]) => { const ok = fn(r); console.log(`  ${ok ? '✅' : '❌'} ${label}`); ok ? pass++ : fail++; });
});
console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
