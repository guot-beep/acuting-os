const fs=require('fs'),p='C:/Projects/acupuncture-point-app/scripts/translate-safety-terms.js';
let s=fs.readFileSync(p,'utf8');
// 1. terms: add pregnancy phrasings
s=s.replace('["Pregnancy", "孕婦"], ["pregnancy", "孕婦"],',
  '["during pregnancy", "孕婦"], ["Pregnancy", "孕婦"], ["pregnancy", "孕婦"],');
// 2. a helper so 體虛者 + 者慎用 does not become 體虛者者慎用
s=s.replace('const sorted = [...TERMS].sort((a, b) => b[0].length - a[0].length);',
`const sorted = [...TERMS].sort((a, b) => b[0].length - a[0].length);

/* 「體虛者」 already carries 者; appending the frame's own 者 gave 體虛者者慎用.
   Only add the particle when the term does not already end in one. */
const who = (x) => (/[者婦兒]$/.test(x) ? x : x + "者");`);
// 3. frames use the helper
s=s.replace('[/^Contraindicated for those with (.+)$/i, (x) => `${x}者禁用`],','[/^Contraindicated for those with (.+)$/i, (x) => `${who(x)}禁用`],');
s=s.replace('[/^Use (?:with )?caution for those with (.+)$/i, (x) => `${x}者慎用`],','[/^Use (?:with )?caution for those with (.+)$/i, (x) => `${who(x)}慎用`],');
s=s.replace('[/^Use (?:with )?extreme caution for those with (.+)$/i, (x) => `${x}者極慎用`],','[/^Use (?:with )?extreme caution for those with (.+)$/i, (x) => `${who(x)}極慎用`],');
s=s.replace('[/^Use (?:with )?caution with (.+)$/i, (x) => `${x}者慎用`],','[/^Use (?:with )?caution with (.+)$/i, (x) => `${who(x)}慎用`],');
s=s.replace('zh = /contraindication/.test(f) ? `${bare}者禁用` : `${bare}者慎用`;','zh = /contraindication/.test(f) ? `${who(bare)}禁用` : `${who(bare)}慎用`;');
fs.writeFileSync(p,s); console.log('patched');
