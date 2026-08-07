const r=require('C:/Projects/acupuncture-point-app/data/herbs/formulas.json').records;
const f=(k)=>r.filter(x=>{const v=x[k];return v&&(Array.isArray(v)?v.length:String(v).trim())}).length;
console.log('禁忌中文 contraindications_zh: '+f('contraindications_zh')+'/'+r.length);
console.log('慎用中文 cautions_zh:         '+f('cautions_zh')+'/'+r.length);
const both=r.filter(x=>{const a=(x.contraindications_zh||[]).length||(x.cautions_zh||[]).length;return a}).length;
console.log('有任一中文安全欄位:            '+both+'/'+r.length);
