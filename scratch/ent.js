process.chdir('C:/Projects/acupuncture-point-app');
const r=require('C:/Projects/acupuncture-point-app/data/herbs/formulas.json').records;
const hits=new Map();
(function w(o){if(Array.isArray(o))o.forEach(w);else if(o&&typeof o==='object')Object.values(o).forEach(w);
 else if(typeof o==='string'){const m=o.match(/&(quot|amp|lt|gt|nbsp|#\d+);/g);if(m)m.forEach(e=>hits.set(e,(hits.get(e)||0)+1));}})(r);
console.log('HTML 實體出現次數:');[...hits.entries()].sort((a,b)=>b[1]-a[1]).forEach(([e,c])=>console.log('   '+e+' x'+c));
