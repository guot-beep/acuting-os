const {execSync}=require('child_process');const fs=require('fs');
process.chdir('C:/Projects/acupuncture-point-app');
const g=t=>{const s=new Set();(function w(o){if(Array.isArray(o))o.forEach(w);else if(o&&typeof o==='object')Object.values(o).forEach(w);else if(typeof o==='string'){const x=o.replace(/[^\u4e00-\u9fff]/g,'');if(x)s.add(x);}})(t);return s;};
const b=g(JSON.parse(execSync('git show HEAD:data/herbs/formulas.json',{maxBuffer:5e8}).toString()));
const a=g(JSON.parse(fs.readFileSync('data/herbs/formulas.json','utf8')));
const lost=[...b].filter(x=>!a.has(x));
console.log('消失的中文序列: '+lost.length);
lost.slice(0,12).forEach(l=>console.log('   '+l.slice(0,50)));
