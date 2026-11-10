const L = '\uE000', R = '\uE001';
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isLatin = s => /^[\x00-\x7F]+$/.test(s);

function termRegex(words, opts, tail = '') {
  const list = [...new Set(words)].sort((a, b) => b.length - a.length); // 最长优先
  if (!list.length) return null;
  const alts = list.map(w => isLatin(w) && opts.wholeWordEn
    ? `(?<![A-Za-z0-9_])${esc(w)}(?![A-Za-z0-9_])` : esc(w));
  return new RegExp(`(?:${alts.join('|')})${tail}`, 'g' + (opts.caseSensitive ? '' : 'i'));
}

// 粗略估算：中文每字 1，英文/数字按词 1，标点 1
function countTokens(s) {
  const cjk = (s.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = (s.match(/[A-Za-z0-9]+/g) || []).length;
  const punct = (s.match(/[^\sA-Za-z0-9\u4e00-\u9fff]/g) || []).length;
  return cjk + words + punct;
}

function compress(input, rules) {
  const opts = { caseSensitive: false, wholeWordEn: true, ...rules.options };
  const store = [];
  const protect = (t, re) => re
    ? t.replace(re, m => { store.push(m); return L + (store.length - 1) + R; }) : t;

  let text = input;
  for (const p of rules.placeholderPatterns || []) text = protect(text, new RegExp(p, 'g'));
  text = protect(text, termRegex(Object.values(rules.protectedTerms || {}).flat(), opts));

  const merges = [...(rules.merge?.zh || []), ...(rules.merge?.en || [])];
  for (const { from, to } of merges) text = text.replace(termRegex([from], opts), () => to);

  const del = [...(rules.safeDelete?.zh || []), ...(rules.safeDelete?.en || [])];
  const nat = !!opts.keepNatural; // true：保留换行，并清理英文句末残留标点
  const delRe = termRegex(del, opts, nat ? '[，,、]?[ \\t]*' : '[，,、]?\\s*');
  if (delRe) text = text.replace(delRe, '');

  text = text
    .replace(nat ? /^[ \t，,、。！？]+/ : /^[\s，,、。！？]+/, '')
    .replace(/([，、])\1+/g, '$1')
    .replace(/([。！？])[。！？!?]+/g, '$1')
    .replace(/[ \t]{2,}/g, ' ');
  if (nat) {
    text = text
      .replace(/([.!?。！？])[ \t]+[.!?。！？]+(?=\s|$)/g, '$1')
      .replace(/\n{3,}/g, '\n\n');
  }
  text = text.trim();

  text = text.replace(new RegExp(`${L}(\\d+)${R}`, 'g'), (_, i) => store[i]);
  return { compressed: text, originalTokens: countTokens(input), compressedTokens: countTokens(text) };
}
// Node 与浏览器双兼容
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { compress };
} else if (typeof window !== 'undefined') {
  window.compress = compress;
}
