const { compress } = require('./app.js');
const rules = require('./rules.json');

const cases = [
  { name: '① 基本压缩 + 保护词',
    input: '你好，请帮我写一个 API 接口，返回 JSON 格式。不要使用分页参数，token 数量必须控制在 100 以内。非常感谢！',
    checks: [
      ['不含"你好"', r => !r.compressed.includes('你好')],
      ['不含"请帮我"', r => !r.compressed.includes('请帮我')],
      ['不含"非常感谢"', r => !r.compressed.includes('非常感谢')],
      ['保留 API', r => r.compressed.includes('API')],
      ['保留 JSON', r => r.compressed.includes('JSON')],
      ['保留"不要"', r => r.compressed.includes('不要')],
      ['保留"必须"', r => r.compressed.includes('必须')],
      ['保留 100', r => r.compressed.includes('100')],
      ['token 数减少', r => r.compressedTokens < r.originalTokens]
    ] },
  { name: '② 变量占位符不被改动',
    input: '请帮我写一个 {{name}} 的 API，返回 ${result} 格式。',
    checks: [
      ['保留 {{name}}', r => r.compressed.includes('{{name}}')],
      ['保留 ${result}', r => r.compressed.includes('${result}')],
      ['删掉"请帮我"', r => !r.compressed.includes('请帮我')]
    ] },
  { name: '③ 代码块整体保留',
    input: '请帮我检查以下代码：```python\nprint("hello")\n```',
    checks: [
      ['代码块完整', r => r.compressed.includes('```python\nprint("hello")\n```')],
      ['删掉"请帮我"', r => !r.compressed.includes('请帮我')]
    ] },
  { name: '④ 否定词不被误删',
    input: '不要使用分页参数。',
    checks: [
      ['保留"不要"', r => r.compressed.includes('不要')],
      ['保留"分页"', r => r.compressed.includes('分页')]
    ] },
  { name: '⑤ URL 不被截断',
    input: '请帮我总结 https://example.com/docs 的内容。',
    checks: [
      ['URL 完整', r => r.compressed.includes('https://example.com/docs')],
      ['删掉"请帮我"', r => !r.compressed.includes('请帮我')]
    ] }
];

let pass = 0, fail = 0;
cases.forEach(c => {
  console.log(`\n=== ${c.name} ===`);
  console.log('输入:', c.input);
  const r = compress(c.input, rules);
  console.log('输出:', r.compressed);
  console.log(`token: ${r.originalTokens} → ${r.compressedTokens}`);
  c.checks.forEach(([label, fn]) => {
    const ok = fn(r);
    console.log(`  ${ok ? '✅' : '❌'} ${label}`);
    ok ? pass++ : fail++;
  });
});
console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail > 0 ? 1 : 0);
