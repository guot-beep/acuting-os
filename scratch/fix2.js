const fs=require('fs'),p='C:/Projects/acupuncture-point-app/scripts/translate-safety-terms.js';
let s=fs.readFileSync(p,'utf8');
s=s.replace(`      const zhCount = (s.match(/[一-鿿]/g) || []).length;
      const enCount = (s.match(/[A-Za-z]/g) || []).length;
      if (!enCount || (zhCount && enCount < 4)) { keep.push(s); continue; }`,
`      /* HTML entities inflate the Latin count: 生化湯's contraindication is a
         long Chinese passage containing &quot;, and counting those four letters
         as English moved the whole paragraph into the English field. Strip
         entities first, and never touch a string that is mostly Chinese. */
      const bare = s.replace(/&[a-z]+;/gi, "");
      const zhCount = (bare.match(/[一-鿿]/g) || []).length;
      const enCount = (bare.match(/[A-Za-z]/g) || []).length;
      if (!enCount || zhCount >= enCount || (zhCount && enCount < 4)) { keep.push(s); continue; }`);
fs.writeFileSync(p,s);console.log('patched');
